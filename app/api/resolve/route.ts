import { NextResponse } from "next/server";

import { detectPlatform } from "@/features/search/services/platformDetector";
import { getYouTubeMetadata } from "@/features/search/services/youtubeService";

import {
  getSpotifyTrackMetadata,
  searchSpotifyTrack,
} from "@/features/search/services/spotifyService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { url } = body;

    // VALIDAR URL
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "É necessário indicar um URL.",
        },
        {
          status: 400,
        }
      );
    }

    // VALIDAR FORMATO
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "O URL introduzido não é válido.",
        },
        {
          status: 400,
        }
      );
    }

    // DETETAR PLATAFORMA
    const platform = detectPlatform(url);

    if (platform === "Unknown") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Este link não pertence a uma plataforma suportada.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      ==================================================
      YOUTUBE / YOUTUBE MUSIC
      ==================================================
    */

    if (
      platform === "YouTube" ||
      platform === "YouTube Music"
    ) {
      const metadata =
        await getYouTubeMetadata(url);

      let spotifyMatch = null;

      try {
        spotifyMatch =
          await searchSpotifyTrack(
            metadata.title,
            metadata.authorName
          );
      } catch (error) {
        console.error(
          "Erro ao pesquisar no Spotify:",
          error
        );
      }

      const matches = [
        spotifyMatch,
      ].filter(
        (match) => match !== null
      );

      return NextResponse.json({
        success: true,

        platform,

        url,

        metadata,

        matches,
      });
    }

    /*
      ==================================================
      SPOTIFY
      ==================================================
    */

    if (platform === "Spotify") {
      const metadata =
        await getSpotifyTrackMetadata(url);

      /*
        Neste momento ainda não temos
        pesquisa TIDAL/Amazon implementada.

        Quando esses serviços estiverem prontos,
        serão adicionados a este array.
      */

      return NextResponse.json({
        success: true,

        platform,

        url,

        metadata,

        matches: [],
      });
    }

    /*
      ==================================================
      TIDAL
      ==================================================

      Plataforma reconhecida.

      A obtenção de metadata e pesquisa será
      implementada no próximo módulo.
    */

    if (platform === "TIDAL") {
      return NextResponse.json({
        success: true,

        platform,

        url,

        metadata: null,

        matches: [],
      });
    }

    /*
      ==================================================
      AMAZON MUSIC
      ==================================================

      Plataforma reconhecida.

      A integração será implementada posteriormente.
    */

    if (platform === "Amazon Music") {
      return NextResponse.json({
        success: true,

        platform,

        url,

        metadata: null,

        matches: [],
      });
    }

    return NextResponse.json({
      success: true,

      platform,

      url,

      metadata: null,

      matches: [],
    });
  } catch (error) {
    console.error(
      "Resolve API error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível processar este conteúdo.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
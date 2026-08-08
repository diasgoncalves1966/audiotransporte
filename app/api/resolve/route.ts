import { NextResponse } from "next/server";

import { detectPlatform } from "@/features/search/services/platformDetector";
import { getYouTubeMetadata } from "@/features/search/services/youtubeService";

import {
  getSpotifyTrackMetadata,
  searchSpotifyTrack,
} from "@/features/search/services/spotifyService";

import {
  getTidalUniversalLink,
} from "@/features/search/services/tidalService";

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

    const platform =
      detectPlatform(url);

    console.log(
      "Plataforma detetada:",
      platform
    );

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

    // ==================================================
    // YOUTUBE / YOUTUBE MUSIC
    // ==================================================

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

      return NextResponse.json({
        success: true,
        platform,
        url,
        metadata,

        matches: spotifyMatch
          ? [spotifyMatch]
          : [],
      });
    }

    // ==================================================
    // SPOTIFY
    // ==================================================

    if (platform === "Spotify") {
      const metadata =
        await getSpotifyTrackMetadata(
          url
        );

      console.log(
        "Spotify metadata:",
        metadata
      );

      return NextResponse.json({
        success: true,
        platform,
        url,
        metadata,
        matches: [],
      });
    }

    // ==================================================
    // TIDAL
    // ==================================================

    if (platform === "TIDAL") {
      const tidal =
        getTidalUniversalLink(url);

      console.log(
        "TIDAL universal link:",
        tidal.universalUrl
      );

      return NextResponse.json({
        success: true,

        platform,

        url:
          tidal.originalUrl,

        metadata: null,

        matches: [],

        universalUrl:
          tidal.universalUrl,
      });
    }

    // ==================================================
    // AMAZON MUSIC
    // ==================================================

    if (
      platform ===
      "Amazon Music"
    ) {
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
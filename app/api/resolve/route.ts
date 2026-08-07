import { NextResponse } from "next/server";

import { detectPlatform } from "@/features/search/services/platformDetector";
import { getYouTubeMetadata } from "@/features/search/services/youtubeService";
import { searchDeezerTrack } from "@/features/search/services/deezerService";
import { searchSpotifyTrack } from "@/features/search/services/spotifyService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "É necessário indicar um URL.",
        },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "O URL introduzido não é válido.",
        },
        { status: 400 }
      );
    }

    // Detetar plataforma de origem
    const platform = detectPlatform(url);

    if (platform === "Unknown") {
      return NextResponse.json(
        {
          success: false,
          error: "Esta plataforma ainda não é suportada.",
        },
        { status: 400 }
      );
    }

    // YOUTUBE / YOUTUBE MUSIC
    if (
      platform === "YouTube" ||
      platform === "YouTube Music"
    ) {
      const metadata = await getYouTubeMetadata(url);

      let deezerMatch = null;
      let spotifyMatch = null;

      // PESQUISA DEEZER
      try {
        deezerMatch = await searchDeezerTrack(
          metadata.title,
          metadata.authorName
        );
      } catch (error) {
        console.error(
          "Erro ao pesquisar no Deezer:",
          error
        );
      }

      // PESQUISA SPOTIFY
      try {
        spotifyMatch = await searchSpotifyTrack(
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
        deezerMatch,
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

    // OUTRAS PLATAFORMAS
    // Para já apenas identificamos a plataforma.
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

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível processar este conteúdo.",
      },
      { status: 500 }
    );
  }
}
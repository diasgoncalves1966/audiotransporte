import { NextResponse } from "next/server";

import { detectPlatform } from "@/features/search/services/platformDetector";
import { getYouTubeMetadata } from "@/features/search/services/youtubeService";
import { searchDeezerTrack } from "@/features/search/services/deezerService";

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
      // Obter dados do vídeo
      const metadata = await getYouTubeMetadata(url);

      let deezerMatch = null;

      try {
        // Primeira pesquisa de equivalente.
        //
        // Nesta fase usamos:
        // authorName + title
        //
        // Mais tarde vamos melhorar a normalização
        // e a comparação dos resultados.
        deezerMatch = await searchDeezerTrack(
          metadata.title,
          metadata.authorName
        );
      } catch (error) {
        // Uma falha no Deezer não deve impedir
        // a resolução do conteúdo original.
        console.error(
          "Erro ao pesquisar no Deezer:",
          error
        );
      }

      return NextResponse.json({
        success: true,
        platform,
        url,
        metadata,

        matches: deezerMatch
          ? [deezerMatch]
          : [],
      });
    }

    // OUTRAS PLATAFORMAS
    // Por enquanto apenas identificamos a origem.
    return NextResponse.json({
      success: true,
      platform,
      url,
      metadata: null,
      matches: [],
    });
  } catch (error) {
    console.error("Resolve API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível processar este conteúdo.",
      },
      { status: 500 }
    );
  }
}
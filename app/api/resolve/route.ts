import { NextResponse } from "next/server";

import { detectPlatform } from "@/features/search/services/platformDetector";
import { getYouTubeMetadata } from "@/features/search/services/youtubeService";

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

    // Detetar plataforma
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

    // YouTube / YouTube Music
    if (
      platform === "YouTube" ||
      platform === "YouTube Music"
    ) {
      const metadata = await getYouTubeMetadata(url);

      return NextResponse.json({
        success: true,
        platform,
        url,
        metadata,
      });
    }

    // Outras plataformas:
    // por enquanto apenas identificamos a plataforma.
    return NextResponse.json({
      success: true,
      platform,
      url,
      metadata: null,
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
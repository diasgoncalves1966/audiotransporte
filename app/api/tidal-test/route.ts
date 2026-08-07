import { NextResponse } from "next/server";

import { getTidalAccessToken } from "@/features/search/services/tidalService";

export async function GET() {
  try {
    const token = await getTidalAccessToken();

    return NextResponse.json({
      success: true,
      message: "Autenticação TIDAL operacional.",
      tokenReceived: Boolean(token),
    });
  } catch (error) {
    console.error(
      "TIDAL test error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido.",
      },
      {
        status: 500,
      }
    );
  }
}
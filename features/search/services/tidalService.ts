export type TidalUniversalResult = {
  platform: "TIDAL";
  trackId: string;
  originalUrl: string;
  universalUrl: string;
};

function getTidalTrackId(url: string): string {
  const parsedUrl = new URL(url);

  const parts = parsedUrl.pathname
    .split("/")
    .filter(Boolean);

  const trackIndex = parts.indexOf("track");

  if (
    trackIndex === -1 ||
    !parts[trackIndex + 1]
  ) {
    throw new Error(
      "Não foi possível identificar a faixa TIDAL."
    );
  }

  return parts[trackIndex + 1];
}

export function getTidalUniversalLink(
  url: string
): TidalUniversalResult {
  const trackId =
    getTidalTrackId(url);

  return {
    platform: "TIDAL",

    trackId,

    originalUrl:
      `https://tidal.com/track/${trackId}`,

    universalUrl:
      `https://tidal.com/track/${trackId}/u`,
  };
}
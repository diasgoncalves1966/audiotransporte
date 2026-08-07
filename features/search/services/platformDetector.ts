export type Platform =
  | "YouTube"
  | "YouTube Music"
  | "Spotify"
  | "TIDAL"
  | "Amazon Music"
  | "Unknown";

export function detectPlatform(url: string): Platform {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // YOUTUBE MUSIC
    if (hostname === "music.youtube.com") {
      return "YouTube Music";
    }

    // YOUTUBE
    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtu.be"
    ) {
      return "YouTube";
    }

    // SPOTIFY
    if (
      hostname === "open.spotify.com" ||
      hostname === "spotify.com" ||
      hostname.endsWith(".spotify.com")
    ) {
      return "Spotify";
    }

    // TIDAL
    if (
      hostname === "tidal.com" ||
      hostname === "www.tidal.com" ||
      hostname === "listen.tidal.com" ||
      hostname.endsWith(".tidal.com")
    ) {
      return "TIDAL";
    }

    // AMAZON MUSIC
    if (
      hostname === "music.amazon.com" ||
      hostname === "music.amazon.co.uk" ||
      hostname === "music.amazon.de" ||
      hostname === "music.amazon.es" ||
      hostname === "music.amazon.fr" ||
      hostname === "music.amazon.it" ||
      hostname === "music.amazon.ca" ||
      hostname === "music.amazon.com.au" ||
      hostname.endsWith(".music.amazon.com")
    ) {
      return "Amazon Music";
    }

    return "Unknown";
  } catch {
    return "Unknown";
  }
}
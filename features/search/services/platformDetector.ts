export type MusicPlatform =
  | "YouTube"
  | "YouTube Music"
  | "Spotify"
  | "TIDAL"
  | "Apple Music"
  | "Amazon Music"
  | "Deezer"
  | "SoundCloud"
  | "Unknown";

export function detectPlatform(url: string): MusicPlatform {
  try {
    const parsedUrl = new URL(url);

    const hostname = parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    // YouTube Music
    if (hostname === "music.youtube.com") {
      return "YouTube Music";
    }

    // YouTube
    if (
      hostname === "youtube.com" ||
      hostname === "youtu.be" ||
      hostname.endsWith(".youtube.com")
    ) {
      return "YouTube";
    }

    // Spotify
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
      hostname === "listen.tidal.com" ||
      hostname.endsWith(".tidal.com")
    ) {
      return "TIDAL";
    }

    // Apple Music
    if (hostname === "music.apple.com") {
      return "Apple Music";
    }

    // Amazon Music
    if (
      hostname === "music.amazon.com" ||
      hostname === "music.amazon.co.uk" ||
      hostname === "music.amazon.de" ||
      hostname === "music.amazon.es" ||
      hostname === "music.amazon.fr" ||
      hostname === "music.amazon.it"
    ) {
      return "Amazon Music";
    }

    // Deezer
    if (
      hostname === "deezer.com" ||
      hostname.endsWith(".deezer.com")
    ) {
      return "Deezer";
    }

    // SoundCloud
    if (
      hostname === "soundcloud.com" ||
      hostname === "on.soundcloud.com"
    ) {
      return "SoundCloud";
    }

    return "Unknown";
  } catch {
    return "Unknown";
  }
}
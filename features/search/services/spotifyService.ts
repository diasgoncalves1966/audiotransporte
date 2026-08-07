import {
  calculateSimilarity,
  normalizeTrackText,
} from "@/features/search/utils/normalizeTrack";

export type SpotifyMatch = {
  platform: "Spotify";
  title: string;
  artist: string;
  album: string;
  url: string;
  thumbnailUrl: string;
  score: number;
};

export type SpotifyMetadata = {
  title: string;
  authorName: string;
  album: string;
  thumbnailUrl: string;
  providerName: "Spotify";
};

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type SpotifyTrack = {
  name: string;

  external_urls: {
    spotify: string;
  };

  artists: Array<{
    name: string;
  }>;

  album: {
    name: string;

    images: Array<{
      url: string;
      width: number | null;
      height: number | null;
    }>;
  };
};

type SpotifySearchResponse = {
  tracks?: {
    items: SpotifyTrack[];
  };
};

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/*
  Obter Access Token Spotify.

  O token é guardado temporariamente em memória
  para evitarmos pedir um token novo em cada pesquisa.
*/
async function getSpotifyAccessToken(): Promise<string> {
  const now = Date.now();

  if (
    cachedToken &&
    now < tokenExpiresAt
  ) {
    return cachedToken;
  }

  const clientId =
    process.env.SPOTIFY_CLIENT_ID;

  const clientSecret =
    process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Credenciais do Spotify não configuradas."
    );
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",

      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Não foi possível autenticar no Spotify: ${response.status}`
    );
  }

  const data: SpotifyTokenResponse =
    await response.json();

  cachedToken = data.access_token;

  /*
    Margem de segurança de 60 segundos
    antes da expiração real.
  */
  tokenExpiresAt =
    Date.now() +
    Math.max(
      data.expires_in - 60,
      60
    ) *
      1000;

  return data.access_token;
}

/*
  Extrair o ID de uma faixa Spotify.

  Exemplo:

  https://open.spotify.com/track/ABC123?si=...

  resultado:

  ABC123
*/
function getSpotifyTrackId(
  url: string
): string | null {
  try {
    const parsedUrl = new URL(url);

    const parts = parsedUrl.pathname
      .split("/")
      .filter(Boolean);

    const trackIndex =
      parts.indexOf("track");

    if (
      trackIndex === -1 ||
      !parts[trackIndex + 1]
    ) {
      return null;
    }

    return parts[trackIndex + 1];
  } catch {
    return null;
  }
}

/*
  Obter metadata diretamente de uma faixa Spotify.

  Esta função será utilizada quando o Spotify
  for a plataforma de origem.
*/
export async function getSpotifyTrackMetadata(
  url: string
): Promise<SpotifyMetadata> {
  const trackId =
    getSpotifyTrackId(url);

  if (!trackId) {
    throw new Error(
      "Não foi possível identificar a faixa Spotify."
    );
  }

  const token =
    await getSpotifyAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}?market=PT`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Não foi possível obter a faixa Spotify: ${response.status}`
    );
  }

  const track: SpotifyTrack =
    await response.json();

  return {
    title: track.name,

    authorName: track.artists
      .map((artist) => artist.name)
      .join(", "),

    album: track.album.name,

    thumbnailUrl:
      track.album.images[0]?.url ?? "",

    providerName: "Spotify",
  };
}

/*
  Pesquisar uma música no Spotify.

  Esta função é utilizada quando outra
  plataforma é a origem, por exemplo YouTube.
*/
export async function searchSpotifyTrack(
  title: string,
  artist: string
): Promise<SpotifyMatch | null> {
  const token =
    await getSpotifyAccessToken();

  const query =
    `${title} ${artist}`.trim();

  const endpoint = new URL(
    "https://api.spotify.com/v1/search"
  );

  endpoint.searchParams.set(
    "q",
    query
  );

  endpoint.searchParams.set(
    "type",
    "track"
  );

  endpoint.searchParams.set(
    "limit",
    "10"
  );

  endpoint.searchParams.set(
    "market",
    "PT"
  );

  const response = await fetch(
    endpoint.toString(),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro na pesquisa Spotify: ${response.status}`
    );
  }

  const data: SpotifySearchResponse =
    await response.json();

  const tracks =
    data.tracks?.items ?? [];

  if (tracks.length === 0) {
    return null;
  }

  const sourceTitle =
    normalizeTrackText(title);

  const sourceArtist =
    normalizeTrackText(artist);

  const sourceCombined =
    normalizeTrackText(
      `${artist} ${title}`
    );

  let bestMatch: SpotifyMatch | null =
    null;

  let bestScore = 0;

  for (const track of tracks) {
    const spotifyArtist =
      track.artists
        .map((item) => item.name)
        .join(" ");

    const candidateTitle =
      normalizeTrackText(
        track.name
      );

    const candidateArtist =
      normalizeTrackText(
        spotifyArtist
      );

    const candidateCombined =
      normalizeTrackText(
        `${spotifyArtist} ${track.name}`
      );

    const titleScore =
      calculateSimilarity(
        sourceTitle,
        candidateTitle
      );

    const artistScore =
      calculateSimilarity(
        sourceArtist,
        candidateArtist
      );

    const combinedScore =
      calculateSimilarity(
        sourceCombined,
        candidateCombined
      );

    /*
      Escolhemos a melhor evidência.

      O título tem maior importância,
      porque nomes de canais do YouTube
      podem não coincidir exatamente
      com o nome do artista.
    */
    const score = Math.max(
      combinedScore,

      Math.round(
        titleScore * 0.85 +
        artistScore * 0.15
      ),

      titleScore
    );

    if (score > bestScore) {
      bestScore = score;

      bestMatch = {
        platform: "Spotify",

        title: track.name,

        artist: track.artists
          .map((item) => item.name)
          .join(", "),

        album:
          track.album.name,

        url:
          track.external_urls.spotify,

        thumbnailUrl:
          track.album.images[0]?.url ??
          "",

        score,
      };
    }
  }

  const MINIMUM_SCORE = 40;

  if (
    !bestMatch ||
    bestScore < MINIMUM_SCORE
  ) {
    return null;
  }

  return bestMatch;
}
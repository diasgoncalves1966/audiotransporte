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
  
  async function getSpotifyAccessToken(): Promise<string> {
    const now = Date.now();
  
    /*
      Reutilizar o token enquanto ainda for válido.
    */
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
        "Não foi possível autenticar no Spotify."
      );
    }
  
    const data: SpotifyTokenResponse =
      await response.json();
  
    cachedToken = data.access_token;
  
    /*
      O Spotify indica normalmente 3600 segundos.
      Retiramos 60 segundos como margem de segurança.
    */
    tokenExpiresAt =
      Date.now() +
      Math.max(data.expires_in - 60, 60) * 1000;
  
    return data.access_token;
  }
  
  export async function searchSpotifyTrack(
    title: string,
    artist: string
  ): Promise<SpotifyMatch | null> {
    const token =
      await getSpotifyAccessToken();
  
    /*
      Título vindo do YouTube pode já conter
      artista + nome da música.
    */
    const query = `${title} ${artist}`.trim();
  
    const endpoint = new URL(
      "https://api.spotify.com/v1/search"
    );
  
    endpoint.searchParams.set("q", query);
    endpoint.searchParams.set("type", "track");
    endpoint.searchParams.set("limit", "10");
  
    /*
      Portugal.
      Assim procuramos conteúdo disponível
      no mercado principal da aplicação.
    */
    endpoint.searchParams.set("market", "PT");
  
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
        normalizeTrackText(track.name);
  
      const candidateArtist =
        normalizeTrackText(spotifyArtist);
  
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
        Mesma filosofia do Deezer:
        damos muita importância ao título
        e usamos o artista como confirmação.
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
  
          album: track.album.name,
  
          url:
            track.external_urls.spotify,
  
          thumbnailUrl:
            track.album.images[0]?.url ?? "",
  
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
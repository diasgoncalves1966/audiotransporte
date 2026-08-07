import {
    calculateSimilarity,
    normalizeTrackText,
  } from "@/features/search/utils/normalizeTrack";
  
  export type DeezerMatch = {
    platform: "Deezer";
    title: string;
    artist: string;
    album: string;
    url: string;
    thumbnailUrl: string;
    score: number;
  };
  
  type DeezerTrack = {
    title: string;
    link: string;
    artist?: {
      name?: string;
    };
    album?: {
      title?: string;
      cover_medium?: string;
    };
  };
  
  type DeezerSearchResponse = {
    data?: DeezerTrack[];
  };
  
  function cleanYouTubeArtist(value: string): string {
    return value
      .replace(/vevo$/i, "")
      .replace(/\s*-\s*topic$/i, "")
      .replace(/\bofficial\b/gi, "")
      .trim();
  }
  
  export async function searchDeezerTrack(
    title: string,
    artist: string
  ): Promise<DeezerMatch | null> {
    const cleanArtist = cleanYouTubeArtist(artist);
  
    /*
      O título do YouTube muitas vezes já contém
      artista + nome da música.
  
      Exemplo:
      "Dire Straits - Sultans Of Swing (Official Video)"
  
      Por isso damos prioridade ao título.
    */
    const query = `${title} ${cleanArtist}`.trim();
  
    const endpoint = new URL(
      "https://api.deezer.com/search/track"
    );
  
    endpoint.searchParams.set("q", query);
  
    const response = await fetch(endpoint.toString(), {
      cache: "no-store",
    });
  
    if (!response.ok) {
      throw new Error(
        "Não foi possível pesquisar no Deezer."
      );
    }
  
    const data: DeezerSearchResponse =
      await response.json();
  
    const tracks = data.data ?? [];
  
    if (tracks.length === 0) {
      return null;
    }
  
    const normalizedSourceTitle =
      normalizeTrackText(title);
  
    const normalizedSourceArtist =
      normalizeTrackText(cleanArtist);
  
    const normalizedSourceCombined =
      normalizeTrackText(
        `${cleanArtist} ${title}`
      );
  
    let bestMatch: DeezerMatch | null = null;
    let bestScore = 0;
  
    for (const track of tracks.slice(0, 15)) {
      const candidateTitle =
        normalizeTrackText(track.title);
  
      const candidateArtist =
        normalizeTrackText(
          track.artist?.name ?? ""
        );
  
      const candidateCombined =
        normalizeTrackText(
          `${track.artist?.name ?? ""} ${track.title}`
        );
  
      /*
        Três comparações:
  
        1. Título
        2. Artista
        3. Artista + título
  
        A comparação combinada é particularmente
        útil para títulos vindos do YouTube.
      */
  
      const titleScore = calculateSimilarity(
        normalizedSourceTitle,
        candidateTitle
      );
  
      const artistScore = normalizedSourceArtist
        ? calculateSimilarity(
            normalizedSourceArtist,
            candidateArtist
          )
        : 0;
  
      const combinedScore = calculateSimilarity(
        normalizedSourceCombined,
        candidateCombined
      );
  
      /*
        Escolhemos a melhor evidência disponível.
  
        Não queremos que um nome de canal estranho
        do YouTube destrua uma correspondência
        claramente correta pelo título.
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
          platform: "Deezer",
          title: track.title,
          artist: track.artist?.name ?? "",
          album: track.album?.title ?? "",
          url: track.link,
          thumbnailUrl:
            track.album?.cover_medium ?? "",
          score,
        };
      }
    }
  
    /*
      Limite ainda conservador, mas menos agressivo
      do que os 55 anteriores.
  
      Vamos afinar isto depois com músicas reais.
    */
    const MINIMUM_SCORE = 40;
  
    if (!bestMatch || bestScore < MINIMUM_SCORE) {
      return null;
    }
  
    return bestMatch;
  }
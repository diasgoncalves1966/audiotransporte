export function normalizeTrackText(value: string): string {
    return value
      .toLowerCase()
  
      // Remover acentos
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  
      // Remover conteúdos entre parênteses e parênteses retos
      .replace(/\([^)]*\)/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
  
      // Remover termos frequentes em vídeos
      .replace(/\bofficial\b/g, " ")
      .replace(/\bvideo\b/g, " ")
      .replace(/\baudio\b/g, " ")
      .replace(/\blyrics?\b/g, " ")
      .replace(/\bhd\b/g, " ")
      .replace(/\b4k\b/g, " ")
  
      // Remover pontuação
      .replace(/[^a-z0-9\s]/g, " ")
  
      // Remover espaços duplicados
      .replace(/\s+/g, " ")
  
      .trim();
  }
  
  export function calculateSimilarity(
    source: string,
    candidate: string
  ): number {
    const normalizedSource = normalizeTrackText(source);
    const normalizedCandidate = normalizeTrackText(candidate);
  
    if (!normalizedSource || !normalizedCandidate) {
      return 0;
    }
  
    if (normalizedSource === normalizedCandidate) {
      return 100;
    }
  
    const sourceWords = new Set(
      normalizedSource.split(" ")
    );
  
    const candidateWords = new Set(
      normalizedCandidate.split(" ")
    );
  
    let matches = 0;
  
    for (const word of sourceWords) {
      if (candidateWords.has(word)) {
        matches++;
      }
    }
  
    const totalWords = Math.max(
      sourceWords.size,
      candidateWords.size
    );
  
    return Math.round(
      (matches / totalWords) * 100
    );
  }
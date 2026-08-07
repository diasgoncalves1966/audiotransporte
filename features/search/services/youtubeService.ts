export type YouTubeMetadata = {
  title: string;
  authorName: string;
  thumbnailUrl: string;
  providerName: string;
};

export async function getYouTubeMetadata(
  url: string
): Promise<YouTubeMetadata> {
  const endpoint = new URL("https://www.youtube.com/oembed");

  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("format", "json");

  const response = await fetch(endpoint.toString());

  if (!response.ok) {
    throw new Error("Não foi possível obter os dados do YouTube.");
  }

  const data = await response.json();

  return {
    title: data.title,
    authorName: data.author_name,
    thumbnailUrl: data.thumbnail_url,
    providerName: data.provider_name,
  };
}
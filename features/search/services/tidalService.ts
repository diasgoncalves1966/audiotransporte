type TidalTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  
  let cachedToken: string | null = null;
  let tokenExpiresAt = 0;
  
  export async function getTidalAccessToken(): Promise<string> {
    const now = Date.now();
  
    if (cachedToken && now < tokenExpiresAt) {
      return cachedToken;
    }
  
    const clientId = process.env.TIDAL_CLIENT_ID;
    const clientSecret = process.env.TIDAL_CLIENT_SECRET;
  
    if (!clientId || !clientSecret) {
      throw new Error(
        "Credenciais do TIDAL não configuradas."
      );
    }
  
    const credentials = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");
  
    const response = await fetch(
      "https://auth.tidal.com/v1/oauth2/token",
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
      const errorText = await response.text();
  
      console.error(
        "TIDAL authentication error:",
        response.status,
        errorText
      );
  
      throw new Error(
        `Não foi possível autenticar no TIDAL: ${response.status}`
      );
    }
  
    const data: TidalTokenResponse =
      await response.json();
  
    cachedToken = data.access_token;
  
    tokenExpiresAt =
      Date.now() +
      Math.max(data.expires_in - 60, 60) * 1000;
  
    return data.access_token;
  }
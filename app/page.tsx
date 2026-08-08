"use client";

import { FormEvent, useState } from "react";

type Mode =
  | "link"
  | "message";

type Metadata = {
  title: string;
  authorName: string;
  album?: string;
  thumbnailUrl: string;
  providerName: string;
};

type PlatformMatch = {
  platform: string;
  title: string;
  artist: string;
  album: string;
  url: string;
  thumbnailUrl: string;
  score: number;
};

type LinkResult = {
  platform: string;
  url: string;
  metadata?: Metadata | null;
  matches: PlatformMatch[];
  universalUrl?: string;
};

type ResolveResponse = {
  success: boolean;
  platform?: string;
  url?: string;
  metadata?: Metadata | null;
  matches?: PlatformMatch[];
  universalUrl?: string;
  error?: string;
};

export default function Home() {
  const [mode, setMode] =
    useState<Mode>("link");

  const [input, setInput] =
    useState("");

  const [result, setResult] =
    useState<LinkResult | null>(null);

  const [
    messageResult,
    setMessageResult,
  ] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  function changeMode(
    newMode: Mode
  ) {
    setMode(newMode);
    setInput("");
    setResult(null);
    setMessageResult(null);
    setError(null);
    setLoading(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setResult(null);
    setMessageResult(null);

    const cleanInput =
      input.trim();

    if (!cleanInput) {
      setError(
        mode === "message"
          ? "Escreve uma mensagem."
          : "Introduz um link."
      );

      return;
    }

    // ==============================
    // MODO MENSAGEM
    // ==============================

    if (mode === "message") {
      setMessageResult(
        cleanInput
      );

      return;
    }

    // ==============================
    // VALIDAR URL
    // ==============================

    try {
      new URL(cleanInput);
    } catch {
      setError(
        "O link introduzido não é válido."
      );

      return;
    }

    // ==============================
    // API
    // ==============================

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/resolve",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              url: cleanInput,
            }),
          }
        );

      const data: ResolveResponse =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.error ??
            "Não foi possível processar este conteúdo."
        );

        return;
      }

      if (
        !data.platform ||
        !data.url
      ) {
        setError(
          "A resposta do servidor é inválida."
        );

        return;
      }

      setResult({
        platform:
          data.platform,

        url:
          data.url,

        metadata:
          data.metadata,

        matches:
          data.matches ?? [],

        universalUrl:
          data.universalUrl,
      });
    } catch (error) {
      console.error(error);

      setError(
        "Não foi possível comunicar com o servidor."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#121212] px-5 pb-28 text-white">
      <div className="mx-auto max-w-md">

        {/* ==============================
            HEADER
        ============================== */}

        <header className="flex items-center gap-3 py-7">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF7A00] text-2xl font-bold text-black">
            A
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              AudioTransporte
            </h1>

            <p className="text-sm text-neutral-400">
              Uma ligação. Todas as plataformas.
            </p>
          </div>

        </header>

        {/* ==============================
            CARTÃO PRINCIPAL
        ============================== */}

        <section className="rounded-3xl border border-neutral-800 bg-[#1E1E1E] p-5 shadow-2xl shadow-black/30">

          <span className="inline-flex rounded-full bg-[#FF7A00]/15 px-3 py-1 text-xs font-semibold text-[#FF9B3D]">
            Partilha sem limites
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight">
            Partilha música.
            <br />
            Ou simplesmente uma mensagem.
          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            YouTube, Spotify, TIDAL e Amazon Music.
          </p>

          {/* ==============================
              SELETOR DE MODO
          ============================== */}

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#121212] p-1">

            <button
              type="button"
              onClick={() =>
                changeMode("link")
              }
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                mode === "link"
                  ? "bg-[#FF7A00] text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Link musical
            </button>

            <button
              type="button"
              onClick={() =>
                changeMode(
                  "message"
                )
              }
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                mode ===
                "message"
                  ? "bg-[#FF7A00] text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Mensagem
            </button>

          </div>

          {/* ==============================
              FORMULÁRIO
          ============================== */}

          <form
            className="mt-5 space-y-3"
            onSubmit={
              handleSubmit
            }
          >

            {mode === "link" ? (
              <input
                type="url"
                value={input}
                onChange={(
                  event
                ) =>
                  setInput(
                    event.target
                      .value
                  )
                }
                placeholder="Cola um link musical..."
                disabled={
                  loading
                }
                className="h-14 w-full rounded-2xl border border-neutral-700 bg-[#121212] px-4 text-base text-white outline-none transition placeholder:text-neutral-600 focus:border-[#FF7A00] focus:ring-4 focus:ring-[#FF7A00]/10 disabled:opacity-50"
              />
            ) : (
              <textarea
                value={input}
                onChange={(
                  event
                ) =>
                  setInput(
                    event.target
                      .value
                  )
                }
                placeholder="Escreve a tua mensagem..."
                rows={5}
                maxLength={500}
                className="w-full resize-none rounded-2xl border border-neutral-700 bg-[#121212] p-4 text-base text-white outline-none transition placeholder:text-neutral-600 focus:border-[#FF7A00] focus:ring-4 focus:ring-[#FF7A00]/10"
              />
            )}

            {mode ===
              "message" && (
              <div className="text-right text-xs text-neutral-600">
                {
                  input.length
                }
                /500
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading
              }
              className="h-14 w-full rounded-2xl bg-[#FF7A00] font-bold text-black transition hover:bg-[#FF8A1F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "A procurar..."
                : mode ===
                  "link"
                ? "Encontrar plataformas"
                : "Enviar mensagem"}
            </button>

          </form>

          {/* ==============================
              ERRO
          ============================== */}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm font-medium text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* ==============================
              RESULTADO
          ============================== */}

          {result && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#FF7A00]/20 bg-[#121212]">

              {/* CAPA */}

              {result.metadata
                ?.thumbnailUrl && (
                <img
                  src={
                    result
                      .metadata
                      .thumbnailUrl
                  }
                  alt={
                    result
                      .metadata
                      .title
                  }
                  className={`w-full object-cover ${
                    result.platform ===
                    "Spotify"
                      ? "aspect-square"
                      : "aspect-video"
                  }`}
                />
              )}

              {/* DADOS DA ORIGEM */}

              <div className="p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#FF9B3D]">
                  {
                    result.platform
                  }
                </p>

                {result.metadata ? (
                  <>
                    <h3 className="mt-2 text-lg font-bold leading-snug">
                      {
                        result
                          .metadata
                          .title
                      }
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      {
                        result
                          .metadata
                          .authorName
                      }
                    </p>

                    {result
                      .metadata
                      .album && (
                      <p className="mt-1 text-xs text-neutral-600">
                        {
                          result
                            .metadata
                            .album
                        }
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-neutral-300">
                      Plataforma identificada.
                    </p>

                    {result.platform ===
                    "TIDAL" ? (
                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        Usa a página universal do TIDAL para ver esta música noutras plataformas.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        A integração desta plataforma será adicionada posteriormente.
                      </p>
                    )}
                  </>
                )}

                {/* URL ORIGINAL */}

                <p className="mt-4 break-all text-xs leading-5 text-neutral-600">
                  {result.url}
                </p>

                {/* TIDAL UNIVERSAL LINK */}

                {result.platform ===
                  "TIDAL" &&
                  result.universalUrl && (
                    <a
                      href={
                        result.universalUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-[#FF7A00] px-4 text-center text-sm font-bold text-black transition hover:bg-[#FF8A1F] active:scale-[0.98]"
                    >
                      Ver noutras plataformas
                    </a>
                  )}

              </div>

              {/* ==============================
                  MATCHES
              ============================== */}

              {result.matches
                .length >
                0 && (
                <div className="border-t border-neutral-800 p-4">

                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Também disponível em
                  </p>

                  <div className="space-y-3">

                    {result.matches.map(
                      (
                        match
                      ) => (
                        <a
                          key={`${match.platform}-${match.url}`}
                          href={
                            match.url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-[#1E1E1E] p-3 transition hover:border-[#FF7A00]/50"
                        >

                          {match.thumbnailUrl && (
                            <img
                              src={
                                match.thumbnailUrl
                              }
                              alt={
                                match.title
                              }
                              className="h-16 w-16 shrink-0 rounded-lg object-cover"
                            />
                          )}

                          <div className="min-w-0 flex-1">

                            <p className="text-xs font-semibold uppercase text-[#FF9B3D]">
                              {
                                match.platform
                              }
                            </p>

                            {match.title && (
                              <p className="truncate text-sm font-semibold text-white">
                                {
                                  match.title
                                }
                              </p>
                            )}

                            {match.artist && (
                              <p className="truncate text-xs text-neutral-400">
                                {
                                  match.artist
                                }
                              </p>
                            )}

                            {match.album && (
                              <p className="truncate text-xs text-neutral-600">
                                {
                                  match.album
                                }
                              </p>
                            )}

                            {match.score > 0 && (
                              <p className="mt-1 text-xs text-neutral-600">
                                Correspondência:{" "}
                                {
                                  match.score
                                }
                                %
                              </p>
                            )}

                          </div>

                          <span className="text-xl text-[#FF7A00]">
                            →
                          </span>

                        </a>
                      )
                    )}

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==============================
              MENSAGEM
          ============================== */}

          {messageResult && (
            <div className="mt-5 rounded-2xl border border-[#FF7A00]/20 bg-[#121212] p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Mensagem
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-200">
                {
                  messageResult
                }
              </p>

              <p className="mt-3 text-xs font-medium text-[#FF9B3D]">
                Mensagem preparada para envio.
              </p>

            </div>
          )}

        </section>

        {/* ==============================
            PLATAFORMAS
        ============================== */}

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-lg font-bold">
              Plataformas
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Plataformas atualmente consideradas pelo AudioTransporte.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">

            {[
              "YouTube",
              "Spotify",
              "TIDAL",
              "Amazon Music",
            ].map(
              (platform) => (
                <div
                  key={
                    platform
                  }
                  className="rounded-2xl border border-neutral-800 bg-[#1E1E1E] p-4 text-center text-sm font-semibold"
                >
                  {
                    platform
                  }
                </div>
              )
            )}

          </div>

        </section>

      </div>
    </main>
  );
}
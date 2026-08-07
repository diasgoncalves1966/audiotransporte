"use client";

import { FormEvent, useState } from "react";

type Mode = "link" | "message";

type Metadata = {
  title: string;
  authorName: string;
  thumbnailUrl: string;
  providerName: string;
};

type LinkResult = {
  platform: string;
  url: string;
  metadata?: Metadata | null;
};

type ResolveResponse = {
  success: boolean;
  platform?: string;
  url?: string;
  metadata?: Metadata | null;
  error?: string;
};

export default function Home() {
  const [mode, setMode] = useState<Mode>("link");
  const [input, setInput] = useState("");

  const [result, setResult] = useState<LinkResult | null>(null);
  const [messageResult, setMessageResult] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function changeMode(newMode: Mode) {
    setMode(newMode);
    setInput("");
    setResult(null);
    setMessageResult(null);
    setError(null);
    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setResult(null);
    setMessageResult(null);

    const cleanInput = input.trim();

    if (!cleanInput) {
      if (mode === "message") {
        setError("Escreve uma mensagem.");
      } else {
        setError("Introduz um link.");
      }

      return;
    }

    // MODO MENSAGEM
    // Não faz qualquer pesquisa.
    if (mode === "message") {
      setMessageResult(cleanInput);
      return;
    }

    // VALIDAR URL NO FRONTEND
    try {
      new URL(cleanInput);
    } catch {
      setError("O link introduzido não é válido.");
      return;
    }

    // ENVIAR O LINK PARA A NOSSA API
    setLoading(true);

    try {
      const response = await fetch("/api/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanInput,
        }),
      });

      const data: ResolveResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.error ?? "Não foi possível processar este conteúdo."
        );
        return;
      }

      if (!data.platform || !data.url) {
        setError("A resposta do servidor é inválida.");
        return;
      }

      setResult({
        platform: data.platform,
        url: data.url,
        metadata: data.metadata,
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

        {/* CABEÇALHO */}
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

        {/* CARTÃO PRINCIPAL */}
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
            Partilha música entre diferentes plataformas ou envia apenas uma
            mensagem.
          </p>

          {/* SELETOR DE MODO */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#121212] p-1">

            <button
              type="button"
              onClick={() => changeMode("link")}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                mode === "link"
                  ? "bg-[#FF7A00] text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              🔗 Link musical
            </button>

            <button
              type="button"
              onClick={() => changeMode("message")}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                mode === "message"
                  ? "bg-[#FF7A00] text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              💬 Mensagem
            </button>

          </div>

          {/* FORMULÁRIO */}
          <form
            className="mt-5 space-y-3"
            onSubmit={handleSubmit}
          >

            <label
              htmlFor="main-input"
              className="sr-only"
            >
              {mode === "link"
                ? "Link musical"
                : "Mensagem"}
            </label>

            {mode === "link" ? (

              <input
                id="main-input"
                type="url"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={loading}
                className="h-14 w-full rounded-2xl border border-neutral-700 bg-[#121212] px-4 text-base text-white outline-none transition placeholder:text-neutral-600 focus:border-[#FF7A00] focus:ring-4 focus:ring-[#FF7A00]/10 disabled:opacity-50"
              />

            ) : (

              <textarea
                id="main-input"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Escreve a tua mensagem..."
                rows={5}
                maxLength={500}
                className="w-full resize-none rounded-2xl border border-neutral-700 bg-[#121212] p-4 text-base text-white outline-none transition placeholder:text-neutral-600 focus:border-[#FF7A00] focus:ring-4 focus:ring-[#FF7A00]/10"
              />

            )}

            {mode === "message" && (
              <div className="text-right text-xs text-neutral-600">
                {input.length}/500
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-[#FF7A00] text-base font-bold text-black transition hover:bg-[#FF8A1F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "A procurar..."
                : mode === "link"
                ? "Encontrar plataformas"
                : "Enviar mensagem"}
            </button>

          </form>

          {/* ERRO */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm font-medium text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* RESULTADO DO LINK */}
          {result && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#FF7A00]/20 bg-[#121212]">

              {/* CAPA / THUMBNAIL */}
              {result.metadata?.thumbnailUrl && (
                <img
                  src={result.metadata.thumbnailUrl}
                  alt={result.metadata.title}
                  className="aspect-video w-full object-cover"
                />
              )}

              <div className="p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-[#FF9B3D]">
                  {result.platform}
                </p>

                {result.metadata ? (
                  <>
                    <h3 className="mt-2 text-lg font-bold leading-snug text-white">
                      {result.metadata.title}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      {result.metadata.authorName}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-neutral-300">
                      Plataforma identificada.
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      A obtenção dos dados desta plataforma será adicionada
                      posteriormente.
                    </p>
                  </>
                )}

                <p className="mt-4 break-all text-xs leading-5 text-neutral-600">
                  {result.url}
                </p>

              </div>
            </div>
          )}

          {/* RESULTADO DA MENSAGEM */}
          {messageResult && (
            <div className="mt-5 rounded-2xl border border-[#FF7A00]/20 bg-[#121212] p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Mensagem
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-200">
                {messageResult}
              </p>

              <p className="mt-3 text-xs font-medium text-[#FF9B3D]">
                Mensagem preparada para envio.
              </p>

            </div>
          )}

        </section>

        {/* COMO FUNCIONA */}
        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Como funciona
            </h2>

            <span className="text-xs text-neutral-500">
              3 passos
            </span>
          </div>

          <div className="space-y-3">

            {/* PASSO 1 */}
            <article className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/15 font-bold text-[#FF9B3D]">
                1
              </div>

              <div>
                <h3 className="font-semibold">
                  Escolhe o conteúdo
                </h3>

                <p className="text-sm text-neutral-400">
                  Um link musical ou uma mensagem.
                </p>
              </div>

            </article>

            {/* PASSO 2 */}
            <article className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/15 font-bold text-[#FF9B3D]">
                2
              </div>

              <div>
                <h3 className="font-semibold">
                  Identificamos
                </h3>

                <p className="text-sm text-neutral-400">
                  O AudioTransporte trata automaticamente do conteúdo.
                </p>
              </div>

            </article>

            {/* PASSO 3 */}
            <article className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/15 font-bold text-[#FF9B3D]">
                3
              </div>

              <div>
                <h3 className="font-semibold">
                  Partilha
                </h3>

                <p className="text-sm text-neutral-400">
                  Cada pessoa escolhe onde quer ouvir.
                </p>
              </div>

            </article>

          </div>
        </section>

      </div>

      {/* MENU INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-[#181818]/95 px-5 py-3 backdrop-blur">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <button className="flex flex-col items-center gap-1 text-[#FF7A00]">
            <span className="text-xl">⌂</span>
            <span className="text-xs font-medium">
              Início
            </span>
          </button>

          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <span className="text-xl">⌕</span>
            <span className="text-xs font-medium">
              Explorar
            </span>
          </button>

          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <span className="text-xl">＋</span>
            <span className="text-xs font-medium">
              Adicionar
            </span>
          </button>

          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <span className="text-xl">♡</span>
            <span className="text-xs font-medium">
              Favoritos
            </span>
          </button>

          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <span className="text-xl">○</span>
            <span className="text-xs font-medium">
              Perfil
            </span>
          </button>

        </div>

      </nav>
    </main>
  );
}
"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!url.trim()) {
      return;
    }

    console.log("Link introduzido:", url);
  }

  return (
    <main className="min-h-screen bg-[#121212] px-5 pb-28 text-white">
      <div className="mx-auto max-w-md">
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

        <section className="rounded-3xl border border-neutral-800 bg-[#1E1E1E] p-5 shadow-2xl shadow-black/30">
          <span className="inline-flex rounded-full bg-[#FF7A00]/15 px-3 py-1 text-xs font-semibold text-[#FF9B3D]">
            Partilha sem limites
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight">
            Cola um link.
            <br />
            Nós encontramos o resto.
          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Spotify, TIDAL, YouTube Music, Apple Music, Amazon Music e outros
            serviços.
          </p>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            <label htmlFor="music-url" className="sr-only">
              Link da música ou álbum
            </label>

            <input
              id="music-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://tidal.com/..."
              className="h-14 w-full rounded-2xl border border-neutral-700 bg-[#121212] px-4 text-base text-white outline-none transition placeholder:text-neutral-600 focus:border-[#FF7A00] focus:ring-4 focus:ring-[#FF7A00]/10"
            />

            <button
              type="submit"
              className="h-14 w-full rounded-2xl bg-[#FF7A00] text-base font-bold text-black transition active:scale-[0.98]"
            >
              Encontrar plataformas
            </button>
          </form>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Como funciona</h2>

            <span className="text-xs text-neutral-500">3 passos</span>
          </div>

          <div className="space-y-3">
            <article className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/15 font-bold text-[#FF9B3D]">
                1
              </div>

              <div>
                <h3 className="font-semibold">Cola um link</h3>
                <p className="text-sm text-neutral-400">
                  De qualquer plataforma suportada.
                </p>
              </div>
            </article>

            <article className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/15 font-bold text-[#FF9B3D]">
                2
              </div>

              <div>
                <h3 className="font-semibold">Encontramos equivalentes</h3>
                <p className="text-sm text-neutral-400">
                  Procuramos a mesma música noutros serviços.
                </p>
              </div>
            </article>

            <article className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/15 font-bold text-[#FF9B3D]">
                3
              </div>

              <div>
                <h3 className="font-semibold">Partilha com todos</h3>
                <p className="text-sm text-neutral-400">
                  Cada pessoa escolhe a sua plataforma.
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-[#181818]/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-[#FF7A00]">
            <span className="text-xl">⌂</span>
            <span className="text-xs font-medium">Início</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <span className="text-xl">⌕</span>
            <span className="text-xs font-medium">Explorar</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <span className="text-xl">＋</span>
            <span className="text-xs font-medium">Adicionar</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <span className="text-xl">♡</span>
            <span className="text-xs font-medium">Favoritos</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <span className="text-xl">○</span>
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
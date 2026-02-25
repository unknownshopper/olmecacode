"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type VideoItem = {
  title: string;
  url: string;
};

type NewsItem = {
  date: string;
  title: string;
  source: string;
  summary: string;
  tags: string[];
};

type EventItem = {
  date: string;
  title: string;
  location: string;
  scope: "regional" | "nacional" | "internacional";
};

function mixcloudEmbed(
  url: string,
  opts?: { autoplay?: boolean; cacheBust?: string; hideCover?: boolean },
) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("mixcloud.com")) return url;

    const feed = encodeURIComponent(u.pathname.endsWith("/") ? u.pathname : `${u.pathname}/`);
    const params = new URLSearchParams();
    params.set("feed", feed);
    params.set("light", "1");
    if (opts?.hideCover) params.set("hide_cover", "1");
    if (opts?.autoplay) params.set("autoplay", "1");
    if (opts?.cacheBust) params.set("t", opts.cacheBust);
    return `https://player-widget.mixcloud.com/widget/iframe/?${params.toString()}`;
  } catch {
    return url;
  }
}

type MixcloudOembed = {
  image?: string;
  thumbnail_url?: string;
  title?: string;
  author_name?: string;
};

function youtubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    return url;
  } catch {
    return url;
  }
}

export default function OlmecaTimePage() {
  const router = useRouter();
  const videoAutoplayPausedRef = useRef(false);
  const [videoSlide, setVideoSlide] = useState(0);
  const [mixSlide, setMixSlide] = useState(0);
  const [activeMixUrl, setActiveMixUrl] = useState<string | null>(null);
  const mixcloudUrls = useMemo(
    () => [
      "https://www.mixcloud.com/pirichingon/jan2026/",
      "https://www.mixcloud.com/pirichingon/see-u-later/",
      "https://www.mixcloud.com/pirichingon/portableset/",
      "https://www.mixcloud.com/pirichingon/setwtf2k14/",
      "https://www.mixcloud.com/pirichingon/electriq/",
    ],
    [],
  );

  const [mixcloudMeta, setMixcloudMeta] = useState<Record<string, MixcloudOembed>>({});

  useEffect(() => {
    let cancelled = false;

    const jsonp = (url: string) =>
      new Promise<MixcloudOembed>((resolve) => {
        const cb = `__olmecaMixcloudOembed_${Math.random().toString(16).slice(2)}`;
        const script = document.createElement("script");
        const timeoutId = window.setTimeout(() => {
          try {
            // @ts-ignore dynamic callback
            delete (window as any)[cb];
          } catch {
            // ignore
          }
          script.remove();
          resolve({});
        }, 5000);

        // @ts-ignore dynamic callback
        (window as any)[cb] = (data: MixcloudOembed) => {
          window.clearTimeout(timeoutId);
          try {
            // @ts-ignore dynamic callback
            delete (window as any)[cb];
          } catch {
            // ignore
          }
          script.remove();
          resolve(data ?? {});
        };

        script.src = `https://app.mixcloud.com/oembed/?format=json&url=${encodeURIComponent(url)}&callback=${cb}`;
        script.async = true;
        script.onerror = () => {
          window.clearTimeout(timeoutId);
          try {
            // @ts-ignore dynamic callback
            delete (window as any)[cb];
          } catch {
            // ignore
          }
          script.remove();
          resolve({});
        };
        document.head.appendChild(script);
      });

    const fetchAll = async () => {
      const entries = await Promise.all(
        mixcloudUrls.map(async (u) => {
          try {
            const json = await jsonp(u);
            return [u, json ?? {}] as const;
          } catch {
            return [u, {}] as const;
          }
        }),
      );

      if (cancelled) return;
      setMixcloudMeta((prev) => {
        const next = { ...prev };
        for (const [u, meta] of entries) next[u] = meta;
        return next;
      });
    };

    void fetchAll();
    return () => {
      cancelled = true;
    };
  }, [mixcloudUrls]);

  const mixSlides = useMemo(() => {
    const size = 3;
    const out: string[][] = [];
    for (let i = 0; i < mixcloudUrls.length; i += size) out.push(mixcloudUrls.slice(i, i + size));
    return out.length > 0 ? out : [mixcloudUrls];
  }, [mixcloudUrls]);

  useEffect(() => {
    if (mixSlide > mixSlides.length - 1) setMixSlide(0);
  }, [mixSlide, mixSlides.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMixUrl(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const videos = useMemo<VideoItem[]>(
    () => [
      {
        title: "Sistemas confiables: de 0 a observabilidad",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Incident response: playbooks que sí funcionan",
        url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
      },
      {
        title: "Seguridad práctica para equipos pequeños",
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      },
      {
        title: "Arquitectura limpia: contratos y límites",
        url: "https://www.youtube.com/watch?v=9T8A89jgeTI",
      },
      {
        title: "Observabilidad: SLIs, SLOs y señal",
        url: "https://www.youtube.com/watch?v=E2Z7o7ZQX7c",
      },
      {
        title: "Seguridad ética: controles sin fricción",
        url: "https://www.youtube.com/watch?v=8ZcmTl_1ER8",
      },
    ],
    [],
  );

  const videoSlides = useMemo(() => {
    const size = 3;
    const out: VideoItem[][] = [];
    for (let i = 0; i < videos.length; i += size) out.push(videos.slice(i, i + size));
    return out.length > 0 ? out : [videos];
  }, [videos]);

  useEffect(() => {
    if (videoSlide > videoSlides.length - 1) setVideoSlide(0);
  }, [videoSlide, videoSlides.length]);

  const news = useMemo<NewsItem[]>(
    () => [
      {
        date: "2026-02-24",
        title: "Reglas simples para sistemas que no pueden fallar",
        source: "OlmecaTime",
        summary:
          "Checklist operativo: trazabilidad, auditoría, degradación controlada, backups verificables y SLIs claros.",
        tags: ["operación", "confiabilidad"],
      },
      {
        date: "2026-02-17",
        title: "Seguridad ética: controles que elevan sin fricción",
        source: "OlmecaTime",
        summary:
          "2FA, allowlists, rate limits y logs firmados: la base que evita incidentes caros sin romper UX.",
        tags: ["seguridad", "ética"],
      },
      {
        date: "2026-02-08",
        title: "Integraciones: menos magia, más contratos",
        source: "OlmecaTime",
        summary:
          "Versionado, webhooks firmados, idempotencia y observabilidad por request: integraciones predecibles.",
        tags: ["integraciones", "api"],
      },
      {
        date: "2026-01-29",
        title: "KPIs que sí importan en una operación real",
        source: "OlmecaTime",
        summary:
          "Latencia, disponibilidad, cola de tareas, tasa de retrabajo y tiempo de resolución: mide para decidir.",
        tags: ["kpis", "ops"],
      },
      {
        date: "2026-01-12",
        title: "Auditoría: la historia completa sin drama",
        source: "OlmecaTime",
        summary:
          "Eventos inmutables, firma, correlación y consultas rápidas: cuando necesitas explicar qué pasó.",
        tags: ["auditoría", "compliance"],
      },
      {
        date: "2025-12-18",
        title: "Inventarios vivos: la diferencia entre suponer y saber",
        source: "OlmecaTime",
        summary:
          "Trazabilidad y control de cambios: menos pérdidas, menos fricción, más confianza entre áreas.",
        tags: ["inventarios", "campo"],
      },
    ],
    [],
  );

  const events = useMemo<EventItem[]>(
    () => [
      {
        date: "2026-03-05",
        title: "Encuentro de tecnología operativa",
        location: "Tabasco",
        scope: "regional",
      },
      {
        date: "2026-03-18",
        title: "Cumbre de seguridad y resiliencia",
        location: "CDMX",
        scope: "nacional",
      },
      {
        date: "2026-04-02",
        title: "Foro de infraestructura crítica",
        location: "LatAm",
        scope: "internacional",
      },
    ],
    [],
  );
  const [newsPage, setNewsPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(news.length / pageSize));
  const clampedPage = Math.min(Math.max(1, newsPage), totalPages);
  const pageItems = news.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (videoAutoplayPausedRef.current) return;
      setVideoSlide((prev) => (prev + 1) % videoSlides.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [videoSlides.length]);

  return (
    <div className="min-h-screen bg-[#5ee9b5] text-zinc-950">
      <header className="sticky top-0 z-10 border-b border-emerald-900/10 bg-[#5ee9b5]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-emerald-900/15 bg-white/30 px-2 py-1 font-mono text-xs tracking-[0.22em]">
              OLMECATIME
            </span>
            <p className="text-sm text-emerald-950/80">canal privado</p>
          </div>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem("olmecatime:return", "1");
              router.push("/");
            }}
            className="rounded-full border border-emerald-900/15 bg-white/25 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/40"
          >
            Volver
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <section>
          <p className="text-xs font-semibold tracking-[0.26em] text-emerald-950/70">FEED</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">OlmecaTime</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-emerald-950/80">
            Una vista interna: confiabilidad, seguridad ética, operación real y señales útiles.
          </p>

          <div className="mt-8 rounded-3xl border border-emerald-900/10 bg-white/30 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-emerald-950/70">Groove channel</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMixSlide((prev) => (prev - 1 + mixSlides.length) % mixSlides.length)}
                  className="rounded-full border border-emerald-900/15 bg-white/25 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setMixSlide((prev) => (prev + 1) % mixSlides.length)}
                  className="rounded-full border border-emerald-900/15 bg-white/25 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/40"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/20">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${mixSlide * 100}%)` }}
              >
                {mixSlides.map((slide, slideIdx) => (
                  <div key={slideIdx} className="w-full shrink-0 p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {slide.map((u, idx) => (
                        <div
                          key={`${u}-${idx}`}
                          className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/20"
                        >
                          <button
                            type="button"
                            onClick={() => setActiveMixUrl(u)}
                            className="relative block w-full"
                          >
                            {mixcloudMeta[u]?.image || mixcloudMeta[u]?.thumbnail_url ? (
                              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
                                <img
                                  src={mixcloudMeta[u]?.image ?? mixcloudMeta[u]?.thumbnail_url}
                                  alt={mixcloudMeta[u]?.title ?? `Mixcloud artwork ${slideIdx * 3 + idx + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className="aspect-[4/3] w-full bg-black/10" />
                            )}
                            <div className="pointer-events-none absolute inset-0 grid place-items-center">
                              <div className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur">
                                <div className="h-0 w-0 translate-x-[2px] border-y-[9px] border-y-transparent border-l-[14px] border-l-white/80" />
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeMixUrl ? (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setActiveMixUrl(null)}
                className="absolute inset-0 cursor-default"
              />
              <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-emerald-900/20 bg-[#5ee9b5] shadow-[0_24px_90px_-30px_rgba(0,0,0,0.65)]">
                <div className="flex items-center justify-between gap-3 border-b border-emerald-900/10 bg-white/25 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-emerald-950">
                      {mixcloudMeta[activeMixUrl]?.title ?? "Mixcloud"}
                    </p>
                    {mixcloudMeta[activeMixUrl]?.author_name ? (
                      <p className="truncate text-xs text-emerald-950/70">
                        {mixcloudMeta[activeMixUrl]?.author_name}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMixUrl(null)}
                    className="rounded-full border border-emerald-900/15 bg-white/25 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/40"
                  >
                    Cerrar
                  </button>
                </div>
                <div className="p-4">
                  <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/20">
                    <iframe
                      title="Mixcloud Player"
                      width="100%"
                      height="400"
                      src={mixcloudEmbed(activeMixUrl, { autoplay: true })}
                      allow="encrypted-media; fullscreen; autoplay;"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-emerald-950/70">Últimos clips</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setVideoSlide((prev) => (prev - 1 + videoSlides.length) % videoSlides.length);
                }}
                className="rounded-full border border-emerald-900/15 bg-white/25 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/40"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoSlide((prev) => (prev + 1) % videoSlides.length);
                }}
                className="rounded-full border border-emerald-900/15 bg-white/25 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/40"
              >
                Next
              </button>
            </div>
          </div>

          <div
            className="mt-4 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/20"
            onPointerDown={() => {
              videoAutoplayPausedRef.current = true;
            }}
            onPointerUp={() => {
              videoAutoplayPausedRef.current = false;
            }}
            onMouseEnter={() => {
              videoAutoplayPausedRef.current = true;
            }}
            onMouseLeave={() => {
              videoAutoplayPausedRef.current = false;
            }}
            onFocusCapture={() => {
              videoAutoplayPausedRef.current = true;
            }}
            onBlurCapture={() => {
              videoAutoplayPausedRef.current = false;
            }}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${videoSlide * 100}%)` }}
            >
              {videoSlides.map((slide, idx) => (
                <div key={idx} className="w-full shrink-0 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {slide.map((v) => (
                      <div
                        key={v.url}
                        className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/35"
                      >
                        <div className="aspect-video w-full bg-black/10">
                          <iframe
                            className="h-full w-full"
                            src={youtubeEmbed(v.url)}
                            title={v.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                        <div className="border-t border-emerald-900/10 px-4 py-3">
                          <p className="text-sm font-semibold leading-6">{v.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <p className="text-xs font-semibold tracking-[0.26em] text-emerald-950/70">NOTICIAS</p>

            <div className="mt-4 space-y-3">
              {pageItems.map((item) => (
                <div
                  key={`${item.date}-${item.title}`}
                  className="rounded-3xl border border-emerald-900/10 bg-white/35 p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-emerald-950/70">{item.source}</p>
                    <p className="text-xs text-emerald-950/70">{item.date}</p>
                  </div>
                  <p className="mt-3 text-base font-semibold leading-6">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950/80">{item.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-emerald-900/15 bg-white/25 px-3 py-1 text-xs font-semibold text-emerald-950/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-emerald-900/15 bg-white/25 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/40"
              >
                Anterior
              </button>
              <p className="text-sm font-semibold text-emerald-950/70">
                {clampedPage} / {totalPages}
              </p>
              <button
                type="button"
                onClick={() => setNewsPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-full border border-emerald-900/15 bg-white/25 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/40"
              >
                Siguiente
              </button>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold tracking-[0.26em] text-emerald-950/70">EVENTOS</p>
            <div className="mt-4 space-y-3">
              {events.map((ev) => (
                <div
                  key={`${ev.date}-${ev.title}`}
                  className="rounded-3xl border border-emerald-900/10 bg-white/35 p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950/70">
                      {ev.scope}
                    </p>
                    <p className="text-xs text-emerald-950/70">{ev.date}</p>
                  </div>
                  <p className="mt-3 text-base font-semibold leading-6">{ev.title}</p>
                  <p className="mt-1 text-sm text-emerald-950/80">{ev.location}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 rounded-3xl border border-emerald-900/10 bg-white/25 p-6">
          <p className="font-mono text-xs tracking-[0.22em] text-emerald-950/70">NOTA</p>
          <p className="mt-2 text-sm leading-7 text-emerald-950/80">
            Esta vista existe para que la interacción se sienta como un acceso real. No es un “hack”; es un
            easter egg controlado.
          </p>
        </div>
      </main>
    </div>
  );
}

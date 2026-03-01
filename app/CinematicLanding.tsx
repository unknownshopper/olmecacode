"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function TerminalDemo() {
  const baseLines = useMemo(
    () => [
      "> node olmeca-signal.js",
      "[olmeca] boot: runtime ok",
      "[olmeca] connect: events-bus · tls=on",
      "[deploy] sistema: implementado · modulo=integraciones-api · v=2.4.1",
      "[sec] control: agregado · signed_webhooks · policy=strict",
      "[sec] alerta: seguridad · ip=18.102.44.203 · accion=blocked",
      "[crm] lead:new · fuente=web · score=82",
      "[agenda] cita: creada · 2026-02-24 19:00",
      "[contacto] nuevo · empresa=Proveedor MRO · rol=operaciones",
      "[erp] pedido: #10482 · status=aprobado",
      "[erp] factura: #F-8841 · total=$98,200",
      "[ventas] closed-won · etapa=final · monto=$98,200",
      "[ops] alerta: stock_bajo · sku=MRO-1183 · umbral=4",
      "[olmeca] sync: ok · latency=34ms",
      "[olmeca] audit: enabled · signed events",
      "[olmeca] normalize: ok",
      "[olmeca] status: stable",
    ],
    [],
  );

  const windowSize = 10;
  const bufferLimit = 60;
  const [lines, setLines] = useState<string[]>(baseLines);
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const followTailRef = useRef(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const stagedTimeoutsRef = useRef<number[]>([]);
  const pausedRef = useRef(false);
  const generatorTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    const int = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const money = () => `$${int(12_000, 180_000).toLocaleString("es-MX")}`;
    const id = (prefix: string) => `${prefix}-${int(1000, 9999)}`;
    const pad2 = (n: number) => `${n}`.padStart(2, "0");

    const companies = [
      "Proveedor MRO",
      "Operadora Campo Sur",
      "Servicios Delta",
      "Logística Istmo",
      "Terminales del Golfo",
      "Mantenimiento Jaguar",
    ];
    const sources = ["web", "whatsapp", "referido", "evento", "inbound"];
    const modules = [
      "inventarios-vivos",
      "auditoria-signed-events",
      "integraciones-api",
      "reporting-kpis",
      "alertas-operativas",
      "seguridad-cero-trust",
    ];
    const securityControls = [
      "2fa_enforced",
      "ip_allowlist",
      "signed_webhooks",
      "audit_trail",
      "rate_limit",
      "siem_forwarding",
    ];

    const now = new Date();
    const hh = now.getHours();
    const mm = now.getMinutes();
    const ts = () => `${pad2((hh + int(0, 2)) % 24)}:${pad2((mm + int(0, 50)) % 60)}`;

    const makeLine = () => {
      const kind = pick([
        "deploy",
        "sec",
        "crm",
        "agenda",
        "contacto",
        "erp",
        "ventas",
        "ops",
        "olmeca",
      ]);

      if (kind === "deploy") {
        return `[deploy] sistema: implementado · modulo=${pick(modules)} · v=${int(1, 3)}.${int(0, 9)}.${int(0, 9)}`;
      }
      if (kind === "sec") {
        if (Math.random() < 0.5) {
          return `[sec] control: agregado · ${pick(securityControls)} · policy=strict`;
        }
        return `[sec] alerta: seguridad · ip=${int(10, 99)}.${int(0, 255)}.${int(0, 255)}.${int(0, 255)} · accion=blocked`;
      }
      if (kind === "crm") return `[crm] lead:new · fuente=${pick(sources)} · score=${int(55, 99)}`;
      if (kind === "agenda") return `[agenda] cita: creada · 2026-02-${pad2(int(10, 28))} ${ts()}`;
      if (kind === "contacto") return `[contacto] nuevo · empresa=${pick(companies)} · rol=operaciones`;
      if (kind === "erp") {
        if (Math.random() < 0.55) return `[erp] pedido: #${int(10000, 19999)} · status=aprobado`;
        return `[erp] factura: #${id("F")} · total=${money()}`;
      }
      if (kind === "ventas") return `[ventas] closed-won · etapa=final · monto=${money()}`;
      if (kind === "ops") return `[ops] alerta: stock_bajo · sku=${id("MRO")} · umbral=${int(2, 10)}`;
      return `[olmeca] sync: ok · latency=${int(18, 54)}ms`;
    };

    const burstSizes = [4, 2, 1, 3, 1, 1, 2];
    const burstDelays = [900, 650, 420, 780, 380, 520, 700];
    let burstIndex = 0;
    let timeoutId: number | null = null;
    let active = true;

    const tick = () => {
      if (!active) return;
      if (pausedRef.current) return;

      const step = burstSizes[burstIndex % burstSizes.length];
      const delay = burstDelays[burstIndex % burstDelays.length];
      burstIndex += 1;

      const nextLines = Array.from({ length: step }, makeLine);
      setLines((prev) => {
        const merged = prev.concat(nextLines);
        if (merged.length <= bufferLimit) return merged;
        return merged.slice(merged.length - bufferLimit);
      });

      timeoutId = window.setTimeout(tick, delay);
      generatorTimeoutRef.current = timeoutId;
    };

    timeoutId = window.setTimeout(tick, 650);
    generatorTimeoutRef.current = timeoutId;

    return () => {
      active = false;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [bufferLimit]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!followTailRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 28;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
      followTailRef.current = atBottom;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const visibleLines = useMemo(() => {
    const size = Math.min(windowSize, lines.length);
    const start = Math.max(0, lines.length - size);
    return lines.slice(start).map((text, i) => ({ idx: start + i, text }));
  }, [lines, windowSize]);

  const toneForLine = (text: string) => {
    const lower = text.toLowerCase();
    if (text.startsWith("$ ")) return "text-zinc-100";
    if (text.startsWith(">")) return "text-emerald-200";
    if (lower.startsWith("[crm]")) return "text-cyan-200";
    if (lower.startsWith("[erp]")) return "text-violet-200";
    if (lower.startsWith("[agenda]")) return "text-amber-200";
    if (lower.startsWith("[contacto]")) return "text-sky-200";
    if (lower.startsWith("[ventas]")) return "text-emerald-200";
    if (lower.startsWith("[deploy]")) return "text-emerald-100";
    if (lower.startsWith("[sec]")) return "text-rose-200";
    if (lower.startsWith("[ops]")) return "text-orange-200";
    if (lower.includes("status=aprobado") || lower.includes("closed-won")) return "text-emerald-200";
    if (lower.includes("error") || lower.includes("fail")) return "text-red-200";
    if (lower.startsWith("[help]")) return "text-emerald-200";
    return "text-zinc-200";
  };

  const pushLines = (next: string[]) => {
    if (next.length === 0) return;
    setLines((prev) => {
      const merged = prev.concat(next);
      if (merged.length <= bufferLimit) return merged;
      return merged.slice(merged.length - bufferLimit);
    });
  };

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    const normalized = cmd.toUpperCase();
    const out: string[] = [`$ ${cmd}`];

    if (normalized !== "OLMECATIME") {
      out.push(`ERROR !! "${cmd}" es un comando no autorizado`);
      pushLines(out);
      return;
    }

    stagedTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    stagedTimeoutsRef.current = [];
    followTailRef.current = true;

    pausedRef.current = true;
    if (generatorTimeoutRef.current !== null) {
      window.clearTimeout(generatorTimeoutRef.current);
      generatorTimeoutRef.current = null;
    }

    window.dispatchEvent(new Event("olmecatime"));

    pushLines(out);

    const staged = [
      "[olmeca] handshake: ok · tls=on",
      "[olmeca] acceso concedido · sesión verificada",
      "[olmeca] scope: lectura · terminal demo",
      "[olmeca] hint: usa el menú superior o escribe en sitio: contacto",
    ];

    staged.forEach((line, i) => {
      const id = window.setTimeout(() => {
        pushLines([line]);
      }, 420 + i * 420);
      stagedTimeoutsRef.current.push(id);
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
        </div>
        <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400">
          OLMECA TERMINAL
        </p>
        <div className="w-10" />
      </div>

      <div className="px-4 py-4">
        <div className="relative">
          <div
            ref={scrollRef}
            className="h-64 overflow-y-auto pb-12 font-mono text-xs leading-6 text-zinc-200 md:h-80"
            onMouseDown={() => inputRef.current?.focus()}
          >
            {visibleLines.map(({ idx, text }) => (
              <div key={`${idx}-${text}`} className="whitespace-pre-wrap">
                <span className={toneForLine(text)}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/60 px-0 py-2 backdrop-blur">
            <div className="pointer-events-auto flex items-center gap-2 whitespace-pre-wrap px-0">
              <span className="text-zinc-300">$</span>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = inputValue;
                    setInputValue("");
                    runCommand(value);
                  }
                }}
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-zinc-100 outline-none placeholder:text-zinc-500"
                placeholder="Escribe un comando…"
              />
              <span
                aria-hidden="true"
                className={
                  inputFocused
                    ? "h-4 w-2 translate-y-[1px] bg-zinc-200/30"
                    : "olmeca-blink h-4 w-2 translate-y-[1px] bg-zinc-200/70"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalWordmark({ size = "lg" }: { size?: "lg" | "sm" }) {
  const isSmall = size === "sm";

  return (
    <div className={isSmall ? "flex items-center gap-2" : "flex items-center gap-3"}>
      <div
        className={
          isSmall
            ? "rounded-xl border border-white/10 bg-white/10 px-2 py-1 backdrop-blur"
            : "rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur"
        }
      >
        <svg
          width={isSmall ? 130 : 240}
          height={isSmall ? 24 : 40}
          viewBox={isSmall ? "0 0 130 24" : "0 0 240 40"}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="OLMECA CODE"
        >
          <defs>
            <linearGradient id="olmeca_term" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#34d399" stopOpacity="0.95" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <text
            x={isSmall ? 6 : 10}
            y={isSmall ? 16 : 26}
            fontSize={isSmall ? 12 : 18}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
            letterSpacing={isSmall ? 1.6 : 2.2}
            fill="#e4e4e7"
          >
            {">_"}
          </text>
          <rect
            x={isSmall ? 26 : 44}
            y={isSmall ? 7 : 12}
            width={isSmall ? 7 : 10}
            height={isSmall ? 10 : 14}
            rx={2}
            fill="url(#olmeca_term)"
            opacity="0.85"
          />
          <text
            x={isSmall ? 42 : 66}
            y={isSmall ? 16 : 26}
            fontSize={isSmall ? 12 : 18}
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji"
            fontWeight={800}
            letterSpacing={isSmall ? 1.2 : 1.6}
            fill="#fafafa"
          >
            OLMECA
          </text>
          <text
            x={isSmall ? 98 : 160}
            y={isSmall ? 16 : 26}
            fontSize={isSmall ? 12 : 18}
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji"
            fontWeight={700}
            letterSpacing={isSmall ? 1.2 : 1.6}
            fill="url(#olmeca_term)"
          >
            CODE
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function CinematicLanding() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sceneOverlayRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const capabilitiesRef = useRef<HTMLElement | null>(null);
  const workflowRef = useRef<HTMLElement | null>(null);
  const processRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const [activeNav, setActiveNav] = useState(0);
  const [heroTab, setHeroTab] = useState<"software" | "it" | "criticos">("software");

  const scrollToSection = (id: string, el: HTMLElement | null) => {
    if (!el) return;
    const pin = ScrollTrigger.getById(`pin-${id}`);
    const target = typeof pin?.start === "number" ? pin.start + 1 : window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top: Math.max(0, target - 24), behavior: "smooth" });
  };

  const [olmecaTimeActive, setOlmecaTimeActive] = useState(false);
  const [olmecaOverlayOn, setOlmecaOverlayOn] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("olmecatime:return") === "1";
  });

  const sectionRefs = useMemo(
    () => [servicesRef, capabilitiesRef, processRef, contactRef],
    [],
  );

  const navSections = useMemo(
    () => [
      { id: "inicio", label: "Inicio", ref: heroRef },
      { id: "servicios", label: "Servicios", ref: servicesRef },
      { id: "capacidades", label: "Capacidades", ref: capabilitiesRef },
      { id: "workflow", label: "OLMECA Ops", ref: workflowRef },
      { id: "proceso", label: "Proceso", ref: processRef },
      { id: "contacto", label: "Contacto", ref: contactRef },
    ],
    [],
  );

  const heroCopy = useMemo(() => {
    if (heroTab === "it") {
      return {
        kicker: "SISTEMAS IT",
        title: {
          line1: "Sistemas IT",
          line2: "Integración real.",
          line3: "Operación sin fricción.",
        },
        body: "Integramos tu stack y construimos sistemas IT a medida: APIs, ETLs, seguridad, monitoreo y control operativo con trazabilidad.",
      };
    }
    if (heroTab === "criticos") {
      return {
        kicker: "ENTORNOS CRÍTICOS",
        title: {
          line1: "Entornos críticos.",
          line2: "Seguridad & observabilidad.",
          line3: "Continuidad sin drama.",
        },
        body: "Diseñamos para alta disponibilidad: auditoría, controles, alertas, resiliencia y monitoreo. Lo importante se mantiene estable.",
      };
    }

    return {
      kicker: "SOFTWARE OPERATIVO",
      title: {
        line1: "Tecnología útil.",
        line2: "Diseño brutal.",
        line3: "Ejecución sin drama.",
      },
      body: "Construimos software para operaciones reales: trazabilidad, control, integraciones e infraestructura. Desde inventarios vivos hasta sistemas IT a la medida.",
    };
  }, [heroTab]);

  useEffect(() => {
    if (!rootRef.current) return;

    if (typeof window !== "undefined") {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const overlay = sceneOverlayRef.current;
      if (overlay) {
        gsap.set(overlay, {
          opacity: 1,
        });
      }

      if (capabilitiesRef.current) {
        const cap = capabilitiesRef.current;
        const kpis = Array.from(
          cap.querySelectorAll("[data-kpi-value]"),
        ) as HTMLElement[];

        if (kpis.length > 0) {
          let kpiIntervalFast: number | null = null;
          let kpiTimeoutEvents: number | null = null;
          let kpiTimeoutAlerts: number | null = null;
          const kpiStates = new Map<HTMLElement, { value: number }>();

          const formatKpi = (toRaw: string, v: number) => {
            const isFloat = toRaw.includes(".");
            return isFloat ? v.toFixed(1) : Math.round(v).toString();
          };

          const kpiLabelFor = (el: HTMLElement) => {
            const card = el.closest(".rounded-2xl") as HTMLElement | null;
            const labelEl = card?.querySelector("p.text-xs") as HTMLElement | null;
            return (labelEl?.textContent ?? "").trim().toLowerCase();
          };

          const baseFor = (el: HTMLElement) => {
            const toRaw = el.getAttribute("data-kpi-to") ?? "0";
            const to = Number(toRaw);
            return { toRaw, to, label: kpiLabelFor(el) };
          };

          const jitteredValue = (toRaw: string, base: number, label: string) => {
            const isFloat = toRaw.includes(".");
            const abs = Math.abs(base);

            if (label.includes("uptime")) {
              const min = 92;
              const max = 98;
              const wiggle = 0.35;
              const v = base + (Math.random() * 2 - 1) * wiggle;
              return Math.min(max, Math.max(min, v));
            }

            if (isFloat) {
              const wiggle = Math.max(0.1, Math.min(0.6, abs * 0.008));
              const v = base + (Math.random() * 2 - 1) * wiggle;
              return Math.max(0, v);
            }

            const wiggle = Math.max(2, Math.min(24, abs * 0.04));
            const v = base + (Math.random() * 2 - 1) * wiggle;
            return Math.max(0, isFloat ? v : Math.round(v));
          };

          const startLive = () => {
            if (
              kpiIntervalFast != null ||
              kpiTimeoutEvents != null ||
              kpiTimeoutAlerts != null
            ) {
              return;
            }

            kpiIntervalFast = window.setInterval(() => {
              kpis.forEach((el) => {
                const { toRaw, to, label } = baseFor(el);
                if (!Number.isFinite(to)) return;
                if (label.includes("eventos auditados")) return;
                if (label.includes("alertas resueltas")) return;

                const state = kpiStates.get(el) ?? { value: to };
                kpiStates.set(el, state);

                const base = label.includes("uptime") ? state.value : to;
                const next = jitteredValue(toRaw, base, label);
                gsap.to(state, {
                  value: next,
                  duration: 0.85,
                  ease: "power2.out",
                  overwrite: true,
                  onUpdate: () => {
                    el.textContent = formatKpi(toRaw, state.value);
                  },
                });
              });
            }, 1100);

            const tickEvents = () => {
              const el = kpis.find((node) => kpiLabelFor(node).includes("eventos auditados"));
              if (el) {
                const { toRaw, to } = baseFor(el);
                if (Number.isFinite(to)) {
                  const state = kpiStates.get(el) ?? { value: to };
                  kpiStates.set(el, state);
                  const next = Math.max(state.value, to) + 1;
                  gsap.to(state, {
                    value: next,
                    duration: 0.75,
                    ease: "power2.out",
                    overwrite: true,
                    onUpdate: () => {
                      el.textContent = formatKpi(toRaw, state.value);
                    },
                  });
                }
              }

              kpiTimeoutEvents = window.setTimeout(tickEvents, 4000);
            };

            const tickAlerts = () => {
              const el = kpis.find((node) => kpiLabelFor(node).includes("alertas resueltas"));
              if (el) {
                const { toRaw, to } = baseFor(el);
                if (Number.isFinite(to)) {
                  const state = kpiStates.get(el) ?? { value: to };
                  kpiStates.set(el, state);
                  const next = Math.max(state.value, to) + 1;
                  gsap.to(state, {
                    value: next,
                    duration: 0.75,
                    ease: "power2.out",
                    overwrite: true,
                    onUpdate: () => {
                      el.textContent = formatKpi(toRaw, state.value);
                    },
                  });
                }
              }

              const delay = 1000 + Math.round(Math.random() * 3000);
              kpiTimeoutAlerts = window.setTimeout(tickAlerts, delay);
            };

            tickEvents();
            tickAlerts();
          };

          const stopLive = () => {
            if (kpiIntervalFast != null) {
              window.clearInterval(kpiIntervalFast);
              kpiIntervalFast = null;
            }
            if (kpiTimeoutEvents != null) {
              window.clearTimeout(kpiTimeoutEvents);
              kpiTimeoutEvents = null;
            }
            if (kpiTimeoutAlerts != null) {
              window.clearTimeout(kpiTimeoutAlerts);
              kpiTimeoutAlerts = null;
            }
          };

          ScrollTrigger.create({
            trigger: cap,
            start: "top 35%",
            end: "bottom 40%",
            onEnter: () => {
              kpis.forEach((el, idx) => {
                const { toRaw, to, label } = baseFor(el);
                const state = kpiStates.get(el) ?? { value: 0 };
                kpiStates.set(el, state);

                if (!Number.isFinite(to)) {
                  el.textContent = toRaw;
                  return;
                }

                if (label.includes("uptime")) {
                  el.textContent = formatKpi(toRaw, 92);
                  state.value = 92;
                } else {
                  el.textContent = formatKpi(toRaw, 0);
                }
                gsap.to(state, {
                  value: to,
                  duration: 2.6,
                  delay: 0.15 + idx * 0.2,
                  ease: "power2.out",
                  overwrite: true,
                  onUpdate: () => {
                    el.textContent = formatKpi(toRaw, state.value);
                  },
                  onComplete: () => {
                    if (idx === kpis.length - 1) startLive();
                  },
                });
              });
            },
            onEnterBack: () => startLive(),
            onLeave: () => stopLive(),
            onLeaveBack: () => stopLive(),
          });
        }
      }

      navSections.forEach((s, idx) => {
        if (!s.ref.current) return;
        const isHero = s.ref.current === heroRef.current;
        const isContact = s.ref.current === contactRef.current;
        const pinned = !isHero && !isContact;

        ScrollTrigger.create({
          id: `nav-${s.id}`,
          trigger: s.ref.current,
          start: pinned ? "top top" : isHero ? "top top" : "top 55%",
          end: pinned ? "+=55%" : isHero ? "+=120%" : "bottom bottom",
          onToggle: (self) => {
            if (self.isActive) setActiveNav(idx);
          },
        });
      });

      const parallaxEls = Array.from(
        rootRef.current?.querySelectorAll("[data-parallax]") ?? [],
      ) as HTMLElement[];

      parallaxEls.forEach((el) => {
        const direction = el.dataset.parallax === "down" ? 1 : -1;
        gsap.to(el, {
          y: 28 * direction,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      if (heroRef.current) {
        gsap.to(heroRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        const heroTitle = heroRef.current.querySelector("[data-hero-title]");
        const heroKicker = heroRef.current.querySelector("[data-hero-kicker]");
        const heroBody = heroRef.current.querySelector("[data-hero-body]");
        const heroCard = heroRef.current.querySelector("[data-hero-card]");
        const heroGlow = heroRef.current.querySelector("[data-hero-glow]");

        if (heroGlow) {
          gsap.fromTo(
            heroGlow,
            { opacity: 0.65, filter: "blur(60px)" },
            {
              opacity: 1,
              filter: "blur(90px)",
              ease: "none",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "+=120%",
                scrub: 1,
              },
            },
          );
        }

        if (heroKicker) {
          gsap.fromTo(
            heroKicker,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top 80%",
                end: "top 30%",
                scrub: true,
              },
            },
          );
        }

        if (heroTitle) {
          gsap.fromTo(
            heroTitle,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top 80%",
                end: "top 25%",
                scrub: true,
              },
            },
          );
        }

        if (heroBody) {
          gsap.fromTo(
            heroBody,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top 70%",
                end: "top 20%",
                scrub: true,
              },
            },
          );
        }

        if (heroCard) {
          gsap.fromTo(
            heroCard,
            { opacity: 0, y: 28, rotateX: 10 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transformPerspective: 900,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top 65%",
                end: "top 15%",
                scrub: true,
              },
            },
          );

          gsap.to(heroCard, {
            y: -16,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=120%",
              scrub: 1.1,
            },
          });
        }
      }

      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => {
          navSections.forEach((s) => {
            if (!s.ref.current) return;
            if (s.ref.current === contactRef.current) return;
            if (s.ref.current === heroRef.current) return;

            ScrollTrigger.create({
              id: `pin-${s.id}`,
              trigger: s.ref.current,
              start: "top top",
              end: "+=55%",
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
            });
          });
        },
      });

      sectionRefs.forEach((ref) => {
        if (!ref.current) return;
        const section = ref.current;

        gsap.set(section, { opacity: 1 });

        const children = section.querySelectorAll("[data-reveal]");
        if (children.length > 0) {
          gsap.fromTo(
            children,
            { opacity: 0, y: 28, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              ease: "power3.out",
              duration: 0.9,
              stagger: 0.08,
              scrollTrigger: {
                trigger: section,
                start: "top 78%",
                end: "top 30%",
                scrub: true,
              },
            },
          );
        }

        if (overlay) {
          let color = "rgba(16,185,129,0.22)";
          let color2 = "rgba(34,211,238,0.18)";

          if (section === servicesRef.current) {
            color = "rgba(16,185,129,0.26)";
            color2 = "rgba(34,211,238,0.12)";
          } else if (section === capabilitiesRef.current) {
            color = "rgba(34,211,238,0.22)";
            color2 = "rgba(99,102,241,0.14)";
          } else if (section === processRef.current) {
            color = "rgba(99,102,241,0.18)";
            color2 = "rgba(244,63,94,0.12)";
          } else if (section === contactRef.current) {
            color = "rgba(244,63,94,0.14)";
            color2 = "rgba(16,185,129,0.10)";
          }

          ScrollTrigger.create({
            trigger: section,
            start: "top 65%",
            end: "bottom 35%",
            onEnter: () => {
              gsap.to(overlay, {
                duration: 0.8,
                ease: "power2.out",
                background: `radial-gradient(800px circle at 15% 20%, ${color}, rgba(0,0,0,0) 55%), radial-gradient(900px circle at 85% 75%, ${color2}, rgba(0,0,0,0) 60%)`,
              });
            },
            onEnterBack: () => {
              gsap.to(overlay, {
                duration: 0.8,
                ease: "power2.out",
                background: `radial-gradient(800px circle at 15% 20%, ${color}, rgba(0,0,0,0) 55%), radial-gradient(900px circle at 85% 75%, ${color2}, rgba(0,0,0,0) 60%)`,
              });
            },
          });
        }

        gsap.fromTo(
          section,
          { backgroundColor: "rgba(255,255,255,0)" },
          {
            backgroundColor: "rgba(255,255,255,0.02)",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "top 20%",
              scrub: true,
            },
          },
        );
      });

      if (servicesRef.current) {
        const services = servicesRef.current;
        const moduleItems = Array.from(
          services.querySelectorAll("[data-module-item]"),
        ) as HTMLElement[];
        const moduleDetail = services.querySelector(
          "[data-module-detail]",
        ) as HTMLElement | null;
        const moduleDetailTitle = services.querySelector(
          "[data-module-detail-title]",
        ) as HTMLElement | null;
        const moduleDetailBody = services.querySelector(
          "[data-module-detail-body]",
        ) as HTMLElement | null;
        const moduleDetailMeta = services.querySelector(
          "[data-module-detail-meta]",
        ) as HTMLElement | null;
        const modulePulse = services.querySelector(
          "[data-module-pulse]",
        ) as HTMLElement | null;
        const moduleStreamBarThroughput = services.querySelector(
          '[data-module-stream-bar="throughput"]',
        ) as HTMLElement | null;
        const moduleStreamBarCoverage = services.querySelector(
          '[data-module-stream-bar="coverage"]',
        ) as HTMLElement | null;
        const moduleStreamBarLatency = services.querySelector(
          '[data-module-stream-bar="latency"]',
        ) as HTMLElement | null;
        const moduleStreamValueThroughput = services.querySelector(
          '[data-module-stream-value="throughput"]',
        ) as HTMLElement | null;
        const moduleStreamValueCoverage = services.querySelector(
          '[data-module-stream-value="coverage"]',
        ) as HTMLElement | null;
        const moduleStreamValueLatency = services.querySelector(
          '[data-module-stream-value="latency"]',
        ) as HTMLElement | null;

        if (moduleItems.length > 0) {
          const modules = [
            {
              title: "Captura en campo",
              body: "Registro offline/online con evidencia. Fotos/firmas/códigos. Sincroniza por lotes y conserva historial por turno.",
              meta: "Input: móvil · Output: evento auditado · Latencia: baja",
            },
            {
              title: "Inventario vivo",
              body: "Deltas continuos, historial de cambios y snapshots por turno/ubicación. Conteos, traspasos y discrepancias con responsables.",
              meta: "Modo: incremental · Conciliación: asistida · Señal: estable",
            },
            {
              title: "Auditoría",
              body: "Quién hizo qué, cuándo y por qué. Evidencias trazables y reportables. Búsqueda por folio/ubicación/usuario.",
              meta: "Trail: firmado · Retención: configurable · Export: on-demand",
            },
            {
              title: "Integraciones",
              body: "ERP/CMMS/BI: sincronización por API/ETL con reglas y validaciones. Observabilidad del flujo y reintentos controlados.",
              meta: "Sync: programado · Retries: seguros · Alertas: activas",
            },
            {
              title: "Reportes",
              body: "Cierres de turno, discrepancias y KPIs operativos en minutos, no días. Plantillas por sitio y comparativos por periodo.",
              meta: "Export: PDF/CSV · BI: listo · Drilldown: por evento",
            },
            {
              title: "Roles & permisos",
              body: "Aprobaciones por rol, control de acceso y segregación de funciones. Flujos por política y registro de decisiones.",
              meta: "SSO: opcional · Policy: por sitio · SoD: aplicada",
            },
          ];

          const streamProfiles = [
            {
              throughput: 74,
              coverage: 68,
              latency: 32,
              throughputLabel: "Eventos/min",
              throughputValue: "2.4k",
              coverageLabel: "Cobertura",
              coverageValue: "68%",
              latencyLabel: "Latencia",
              latencyValue: "32ms",
            },
            {
              throughput: 66,
              coverage: 82,
              latency: 38,
              throughputLabel: "Deltas/min",
              throughputValue: "1.1k",
              coverageLabel: "Conciliación",
              coverageValue: "82%",
              latencyLabel: "Sinc.",
              latencyValue: "38ms",
            },
            {
              throughput: 58,
              coverage: 90,
              latency: 44,
              throughputLabel: "Eventos/h",
              throughputValue: "9.6k",
              coverageLabel: "Integridad",
              coverageValue: "90%",
              latencyLabel: "Consulta",
              latencyValue: "44ms",
            },
            {
              throughput: 72,
              coverage: 76,
              latency: 51,
              throughputLabel: "Requests/s",
              throughputValue: "180",
              coverageLabel: "Conectores",
              coverageValue: "76%",
              latencyLabel: "ETL",
              latencyValue: "51ms",
            },
            {
              throughput: 62,
              coverage: 88,
              latency: 36,
              throughputLabel: "KPIs/min",
              throughputValue: "420",
              coverageLabel: "Disponibilidad",
              coverageValue: "88%",
              latencyLabel: "Render",
              latencyValue: "36ms",
            },
            {
              throughput: 70,
              coverage: 84,
              latency: 41,
              throughputLabel: "Accesos/día",
              throughputValue: "12k",
              coverageLabel: "Cumplimiento",
              coverageValue: "84%",
              latencyLabel: "Autorización",
              latencyValue: "41ms",
            },
          ];

          const setActive = (activeIndex: number) => {
            moduleItems.forEach((el, i) => {
              const isActive = i === activeIndex;
              const label = el.querySelector("[data-module-label]");
              const dot = el.querySelector("[data-module-dot]");

              gsap.to(el, {
                duration: 0.25,
                ease: "power2.out",
                opacity: isActive ? 1 : 0.55,
                x: isActive ? 0 : -2,
                backgroundColor: isActive ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.05)",
                borderColor: isActive ? "rgba(52,211,153,0.30)" : "rgba(255,255,255,0.10)",
                boxShadow: isActive
                  ? "0 0 0 1px rgba(52,211,153,0.18), 0 20px 70px rgba(0,0,0,0.35)"
                  : "none",
              });

              if (label) {
                gsap.to(label, {
                  duration: 0.25,
                  ease: "power2.out",
                  color: isActive ? "rgb(167 243 208)" : "rgb(161 161 170)",
                });
              }

              if (dot) {
                gsap.to(dot, {
                  duration: 0.25,
                  ease: "power2.out",
                  opacity: isActive ? 1 : 0.35,
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isActive ? "rgba(52,211,153,0.95)" : "rgba(52,211,153,0.35)",
                });
              }
            });

            const profile =
              streamProfiles[Math.max(0, Math.min(streamProfiles.length - 1, activeIndex))];

            if (moduleStreamBarThroughput) {
              gsap.to(moduleStreamBarThroughput, {
                duration: 0.55,
                ease: "power2.out",
                width: `${profile.throughput}%`,
              });
            }
            if (moduleStreamBarCoverage) {
              gsap.to(moduleStreamBarCoverage, {
                duration: 0.55,
                ease: "power2.out",
                width: `${profile.coverage}%`,
              });
            }
            if (moduleStreamBarLatency) {
              gsap.to(moduleStreamBarLatency, {
                duration: 0.55,
                ease: "power2.out",
                width: `${profile.latency}%`,
              });
            }

            if (moduleStreamValueThroughput) {
              moduleStreamValueThroughput.textContent = `${profile.throughputLabel}: ${profile.throughputValue}`;
              gsap.fromTo(
                moduleStreamValueThroughput,
                { opacity: 0.55 },
                { opacity: 1, duration: 0.35, ease: "power2.out" },
              );
            }
            if (moduleStreamValueCoverage) {
              moduleStreamValueCoverage.textContent = `${profile.coverageLabel}: ${profile.coverageValue}`;
              gsap.fromTo(
                moduleStreamValueCoverage,
                { opacity: 0.55 },
                { opacity: 1, duration: 0.35, ease: "power2.out" },
              );
            }
            if (moduleStreamValueLatency) {
              moduleStreamValueLatency.textContent = `${profile.latencyLabel}: ${profile.latencyValue}`;
              gsap.fromTo(
                moduleStreamValueLatency,
                { opacity: 0.55 },
                { opacity: 1, duration: 0.35, ease: "power2.out" },
              );
            }

            if (
              moduleDetail &&
              moduleDetailTitle &&
              moduleDetailBody &&
              moduleDetailMeta
            ) {
              const m = modules[Math.max(0, Math.min(modules.length - 1, activeIndex))];
              gsap.to(moduleDetail, {
                duration: 0.22,
                ease: "power2.out",
                opacity: 0,
                y: 8,
                onComplete: () => {
                  moduleDetailTitle.textContent = m.title;
                  moduleDetailBody.textContent = m.body;
                  moduleDetailMeta.textContent = m.meta;
                  gsap.to(moduleDetail, {
                    duration: 0.3,
                    ease: "power2.out",
                    opacity: 1,
                    y: 0,
                  });
                },
              });
            }

            if (modulePulse) {
              gsap.fromTo(
                modulePulse,
                { opacity: 0.0, scale: 0.92 },
                {
                  opacity: 0.8,
                  scale: 1,
                  duration: 0.5,
                  ease: "power2.out",
                },
              );
            }

          };

          const moduleTl = gsap.timeline({ paused: true, repeat: -1 });
          const stepDuration = 2.4;

          moduleItems.forEach((_, i) => {
            moduleTl.add(() => setActive(i)).to({}, { duration: stepDuration });
          });

          setActive(0);

          ScrollTrigger.create({
            trigger: services,
            start: "top 70%",
            end: "bottom 30%",
            onEnter: () => moduleTl.play(),
            onEnterBack: () => moduleTl.play(),
            onLeave: () => moduleTl.pause(),
            onLeaveBack: () => moduleTl.pause(),
          });
        }
      }

      if (processRef.current) {
        const process = processRef.current;
        const steps = Array.from(
          process.querySelectorAll("[data-process-step]"),
        ) as HTMLElement[];
        const progress = process.querySelector(
          "[data-process-progress]",
        ) as HTMLElement | null;
        const detail = process.querySelector(
          "[data-process-detail]",
        ) as HTMLElement | null;
        const detailTitle = process.querySelector(
          "[data-process-detail-title]",
        ) as HTMLElement | null;
        const detailBody = process.querySelector(
          "[data-process-detail-body]",
        ) as HTMLElement | null;
        const detailMeta = process.querySelector(
          "[data-process-detail-meta]",
        ) as HTMLElement | null;

        if (progress) {
          gsap.set(progress, { scaleY: 0, transformOrigin: "top" });
        }

        const deliverables = [
          {
            title: "Entregable: Diagnóstico operativo",
            body: "Mapa de proceso, riesgos, datos disponibles y primer alcance. Identificamos puntos críticos y quick wins.",
            meta: "Salida: documento + backlog priorizado",
          },
          {
            title: "Entregable: Diseño & arquitectura",
            body: "Prototipo UX, modelo de datos, seguridad base y plan de integraciones. Definimos métricas de éxito.",
            meta: "Salida: blueprint técnico",
          },
          {
            title: "Entregable: Incrementos de software",
            body: "Sprints cortos con entregables visibles. Trazabilidad, pruebas y revisión con stakeholders.",
            meta: "Salida: releases iterativas",
          },
          {
            title: "Entregable: Lanzamiento + monitoreo",
            body: "Deploy controlado, observabilidad y ajustes finos con métricas reales. Dejamos el sistema operable.",
            meta: "Salida: runbook + monitoreo",
          },
        ];

        const setActive = (activeIndex: number) => {
          steps.forEach((el, i) => {
            const isActive = i === activeIndex;
            gsap.to(el, {
              duration: 0.35,
              ease: "power2.out",
              backgroundColor: isActive ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.05)",
              borderColor: isActive
                ? "rgba(34, 211, 238, 0.35)"
                : "rgba(255,255,255,0.10)",
              y: isActive ? -2 : 0,
              boxShadow: isActive
                ? "0 0 0 1px rgba(34, 211, 238, 0.18), 0 24px 90px rgba(0,0,0,0.45)"
                : "none",
            });
          });

          if (detail && detailTitle && detailBody && detailMeta) {
            const d = deliverables[Math.max(0, Math.min(deliverables.length - 1, activeIndex))];
            gsap.to(detail, {
              duration: 0.22,
              ease: "power2.out",
              opacity: 0,
              y: 8,
              onComplete: () => {
                detailTitle.textContent = d.title;
                detailBody.textContent = d.body;
                detailMeta.textContent = d.meta;
                gsap.to(detail, {
                  duration: 0.3,
                  ease: "power2.out",
                  opacity: 1,
                  y: 0,
                });
              },
            });
          }
        };

        if (steps.length > 0) setActive(0);

        if (detail) {
          gsap.set(detail, { opacity: 1, y: 0 });
        }

        const processTl = gsap.timeline({ paused: true, repeat: -1 });
        const stepDuration = 2.6;
        const total = Math.max(steps.length, 1);

        steps.forEach((_, i) => {
          processTl
            .add(() => {
              setActive(i);
              if (progress) {
                gsap.to(progress, {
                  duration: 0.35,
                  ease: "power2.out",
                  scaleY: (i + 1) / total,
                });
              }
            })
            .to({}, { duration: stepDuration });
        });

        ScrollTrigger.create({
          trigger: process,
          start: "top 70%",
          end: "bottom 30%",
          onEnter: () => processTl.play(),
          onEnterBack: () => processTl.play(),
          onLeave: () => processTl.pause(),
          onLeaveBack: () => processTl.pause(),
        });
      }

      if (workflowRef.current) {
        const wf = workflowRef.current;
        const steps = Array.from(wf.querySelectorAll("[data-workflow-step]"));
        const progressEl = wf.querySelector("[data-workflow-progress]") as HTMLElement | null;
        const dots = Array.from(wf.querySelectorAll("[data-workflow-dot]"));
        const detail = wf.querySelector("[data-workflow-detail]") as HTMLElement | null;
        const detailTitle = wf.querySelector(
          "[data-workflow-detail-title]",
        ) as HTMLElement | null;
        const detailBody = wf.querySelector(
          "[data-workflow-detail-body]",
        ) as HTMLElement | null;
        const detailMeta = wf.querySelector(
          "[data-workflow-detail-meta]",
        ) as HTMLElement | null;

        if (steps.length > 0) {
          const details = [
            {
              title: "Supervisor de turno",
              body: "Checklist de arranque + sincronización completa. Se valida acceso, ubicaciones y catálogo MRO.",
              meta: "Responsable: Operaciones · Evidencia: Bitácora",
            },
            {
              title: "Almacén / Campo",
              body: "Entrada/salida registrada como evento. Si no hay red, se guarda offline y se firma al sincronizar.",
              meta: "Responsable: Almacén · Evidencia: Evento auditado",
            },
            {
              title: "Control & cumplimiento",
              body: "Conciliación por reglas: duplicados, discrepancias, aprobaciones y alertas por rol.",
              meta: "Responsable: Control interno · Evidencia: Aprobación",
            },
            {
              title: "Integración",
              body: "Se publican deltas a ERP/CMMS y se genera reporte operativo para supervisión.",
              meta: "Responsable: IT / Integraciones · Evidencia: Sync",
            },
            {
              title: "Cierre de turno",
              body: "Snapshot firmado, evidencias y reporte final listo para auditoría. Todo queda trazable.",
              meta: "Responsable: Operaciones · Evidencia: Snapshot",
            },
          ];

          const setActive = (activeIndex: number) => {
            steps.forEach((el, i) => {
              const isActive = i === activeIndex;
              gsap.to(el, {
                duration: 0.35,
                ease: "power2.out",
                backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.20)",
                borderColor: isActive
                  ? "rgba(52, 211, 153, 0.35)"
                  : "rgba(255,255,255,0.10)",
                boxShadow: isActive
                  ? "0 0 0 1px rgba(52, 211, 153, 0.20), 0 24px 80px rgba(0,0,0,0.45)"
                  : "none",
                y: isActive ? -3 : 0,
              });
            });

            if (dots.length > 0) {
              dots.forEach((el, i) => {
                const isActive = i === activeIndex;
                gsap.to(el, {
                  duration: 0.25,
                  ease: "power2.out",
                  opacity: isActive ? 1 : 0.5,
                  backgroundColor: isActive
                    ? "rgba(52, 211, 153, 0.95)"
                    : "rgba(52, 211, 153, 0.35)",
                  scale: isActive ? 1.15 : 1,
                });
              });
            }

            if (detail && detailTitle && detailBody && detailMeta) {
              const d = details[Math.max(0, Math.min(details.length - 1, activeIndex))];
              gsap.to(detail, {
                duration: 0.25,
                ease: "power2.out",
                opacity: 0,
                y: 8,
                onComplete: () => {
                  detailTitle.textContent = d.title;
                  detailBody.textContent = d.body;
                  detailMeta.textContent = d.meta;
                  gsap.to(detail, {
                    duration: 0.35,
                    ease: "power2.out",
                    opacity: 1,
                    y: 0,
                  });
                },
              });
            }
          };

          gsap.set(steps, {
            backgroundColor: "rgba(0,0,0,0.20)",
            borderColor: "rgba(255,255,255,0.10)",
          });

          if (dots.length > 0) {
            gsap.set(dots, {
              opacity: 0.5,
              backgroundColor: "rgba(52, 211, 153, 0.35)",
              scale: 1,
            });
          }

          if (progressEl) {
            gsap.set(progressEl, { scaleY: 0, transformOrigin: "top" });
          }

          if (detail) {
            gsap.set(detail, { opacity: 1, y: 0 });
          }

          setActive(0);

          const stepDuration = 1.4;
          const flowTl = gsap.timeline({
            paused: true,
            repeat: -1,
            defaults: { ease: "power2.out" },
          });

          steps.forEach((_, i) => {
            flowTl
              .add(() => setActive(i))
              .to(
                progressEl,
                {
                  scaleY: (i + 1) / steps.length,
                  duration: stepDuration * 0.85,
                  ease: "none",
                },
                ">",
              )
              .to(
                {},
                {
                  duration: stepDuration,
                },
              );
          });

          flowTl.add(() => {
            if (progressEl) gsap.set(progressEl, { scaleY: 0 });
          });

          ScrollTrigger.create({
            trigger: wf,
            start: "top 70%",
            end: "bottom 30%",
            onEnter: () => flowTl.play(),
            onEnterBack: () => flowTl.play(),
            onLeave: () => flowTl.pause(),
            onLeaveBack: () => flowTl.pause(),
          });
        }
      }

      ScrollTrigger.refresh();
    }, rootRef);

    return () => ctx.revert();
  }, [sectionRefs]);

  useEffect(() => {
    const onOlmecaTime = () => {
      setOlmecaTimeActive(true);
      setOlmecaOverlayOn(true);
      gsap.globalTimeline.pause();
      ScrollTrigger.getAll().forEach((st) => st.disable(false));

      window.setTimeout(() => {
        router.push("/olmecatime");
      }, 1200);
    };

    window.addEventListener("olmecatime", onOlmecaTime);
    return () => window.removeEventListener("olmecatime", onOlmecaTime);
  }, [router]);

  useEffect(() => {
    const flag = sessionStorage.getItem("olmecatime:return");
    if (flag !== "1") return;

    sessionStorage.removeItem("olmecatime:return");
    setOlmecaOverlayOn(true);
    window.setTimeout(() => {
      setOlmecaOverlayOn(false);
    }, 240);

    const resumeId = window.setTimeout(() => {
      gsap.globalTimeline.resume();
      ScrollTrigger.getAll().forEach((st) => st.enable(false));
    }, 2400);

    return () => window.clearTimeout(resumeId);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`min-h-screen bg-black text-zinc-100${olmecaTimeActive ? " olmeca-paused" : ""}`}
    >
      <div
        className={`pointer-events-none fixed inset-0 z-50 bg-[#5ee9b5] transition-opacity duration-[2400ms] ease-out${
          olmecaOverlayOn ? " opacity-100" : " opacity-0"
        }`}
      />
      <div
        ref={sceneOverlayRef}
        className="pointer-events-none fixed inset-0 -z-0 opacity-0"
        style={{
          background:
            "radial-gradient(800px circle at 15% 20%, rgba(16,185,129,0.22), rgba(0,0,0,0) 55%), radial-gradient(900px circle at 85% 75%, rgba(34,211,238,0.16), rgba(0,0,0,0) 60%)",
          mixBlendMode: "screen",
        }}
      />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-3xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500/25 via-emerald-400/15 to-cyan-300/10 px-6 py-6 shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_24px_80px_-24px_rgba(16,185,129,0.35)] backdrop-blur">
        <div className="flex items-center gap-3">
          <TerminalWordmark size="lg" />
        </div>

        <a
          href="#contacto"
          className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-zinc-100 backdrop-blur transition-colors hover:bg-white/10"
        >
          Agenda una llamada
        </a>
      </header>

      <div className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <div className="pointer-events-auto rounded-full border border-white/10 bg-black/35 px-2 py-3 backdrop-blur">
          <div className="relative flex flex-col items-center gap-2 px-1.5">
            <div className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-white/10" />
            {navSections.map((s, idx) => {
              const isActive = idx === activeNav;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={s.label}
                  title={s.label}
                  onClick={() => {
                    scrollToSection(s.id, s.ref.current);
                  }}
                  className="grid h-6 w-6 place-items-center"
                >
                  <span className="relative block">
                    {isActive ? (
                      <span className="absolute inset-0 rounded-full bg-emerald-300/20 animate-ping" />
                    ) : null}
                    <span
                      className={
                        isActive
                          ? "relative block h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]"
                          : "relative block h-2.5 w-2.5 rounded-full bg-white/20 transition-colors hover:bg-emerald-300/70"
                      }
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main>
        <section ref={heroRef} className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div
              data-hero-glow
              className="absolute left-1/2 top-[-240px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl"
            />
            <div className="absolute bottom-[-260px] right-[-120px] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 pb-20 pt-14 md:grid-cols-2 md:pb-28 md:pt-20">
            <div className="flex flex-col justify-center">
              <p
                data-hero-kicker
                className="text-xs font-medium tracking-[0.26em] text-zinc-400"
              >
                <span className="sr-only">{heroCopy.kicker}</span>
                <span className="inline-flex max-w-full items-center gap-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setHeroTab("software")}
                    className={
                      heroTab === "software"
                        ? "text-emerald-200 transition-colors"
                        : "text-zinc-400 transition-colors hover:text-zinc-200"
                    }
                  >
                    <span className="sm:hidden">SW OPERATIVO</span>
                    <span className="hidden sm:inline">SOFTWARE OPERATIVO</span>
                  </button>
                  <span aria-hidden="true" className="text-zinc-600">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => setHeroTab("it")}
                    className={
                      heroTab === "it"
                        ? "text-emerald-200 transition-colors"
                        : "text-zinc-400 transition-colors hover:text-zinc-200"
                    }
                  >
                    <span className="sm:hidden">SIST. IT</span>
                    <span className="hidden sm:inline">SISTEMAS IT</span>
                  </button>
                  <span aria-hidden="true" className="text-zinc-600">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => setHeroTab("criticos")}
                    className={
                      heroTab === "criticos"
                        ? "text-emerald-200 transition-colors"
                        : "text-zinc-400 transition-colors hover:text-zinc-200"
                    }
                  >
                    <span className="sm:hidden">ENT. CRÍT.</span>
                    <span className="hidden sm:inline">ENTORNOS CRÍTICOS</span>
                  </button>
                </span>
              </p>
              <h1
                data-hero-title
                className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-6xl"
              >
                {heroCopy.title.line1}
                <span className="block bg-gradient-to-r from-emerald-300 via-cyan-200 to-zinc-50 bg-clip-text text-transparent">
                  {heroCopy.title.line2}
                </span>
                {heroCopy.title.line3}
              </h1>
              <p
                data-hero-body
                className="mt-6 max-w-xl text-pretty text-lg leading-8 text-zinc-300"
              >
                {heroCopy.body}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contacto"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-300 px-6 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-200"
                >
                  Agenda diagnóstico
                </a>
                <a
                  href="#servicios"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-zinc-100 backdrop-blur transition-colors hover:bg-white/10"
                >
                  Ver servicios
                </a>
              </div>

              <div className="mt-12 flex items-center gap-6 text-xs text-zinc-400">
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-100/90">
                  Implementación rápida
                </span>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-100/90">
                  Integración con tu stack
                </span>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-100/90">
                  Calidad enterprise
                </span>
              </div>
            </div>

            <div className="relative w-full min-h-[520px] md:min-h-0 md:self-stretch">
              <div
                data-hero-card
                className="relative mt-10 flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:absolute md:inset-x-0 md:bottom-0 md:top-14 md:mt-0"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium tracking-[0.22em] text-zinc-300">
                    OLMECA · SIGNAL
                  </p>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                    LIVE
                  </span>
                </div>
                <div className="mt-6">
                  <TerminalDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="servicios"
          ref={servicesRef}
          className="relative mx-auto w-full max-w-6xl px-6 py-20 md:min-h-screen md:py-28"
        >
          <div data-reveal className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.26em] text-zinc-400">SERVICIOS</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
              Software a la medida para operaciones que no pueden fallar
            </h2>
            <p className="mt-4 text-lg leading-8 text-zinc-300">
              Desde inventarios vivos hasta plataformas internas, automatización y modernización de
              infraestructura.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="hidden md:block" />
          </div>

          <div data-reveal className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="text-xs font-medium tracking-[0.26em] text-zinc-400">MÓDULOS</p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                Un ejemplo de cómo piezas pequeñas forman un sistema operativo completo.
              </p>

              <div className="mt-5 space-y-2">
                {[
                  "Captura en campo",
                  "Inventario vivo",
                  "Auditoría",
                  "Integraciones",
                  "Reportes",
                  "Roles & permisos",
                ].map((label) => (
                  <div
                    key={label}
                    data-module-item
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span
                      data-module-dot
                      className="h-2.5 w-2.5 rounded-full bg-emerald-300/40"
                    />
                    <span data-module-label className="text-sm text-zinc-300">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative md:col-span-7">
              <div
                data-module-pulse
                className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-r from-emerald-300/10 via-cyan-200/10 to-transparent opacity-0 blur-2xl"
              />
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-6">
                <div data-module-detail className="min-h-[172px]">
                  <p data-module-detail-title className="text-lg font-semibold text-zinc-50">
                    Captura en campo
                  </p>
                  <p data-module-detail-body className="mt-2 text-sm leading-7 text-zinc-300">
                    Registro offline/online con evidencia. Menos fricción, más trazabilidad.
                  </p>
                  <p
                    data-module-detail-meta
                    className="mt-4 text-xs font-medium tracking-[0.14em] text-zinc-400"
                  >
                    Input: móvil · Output: evento auditado
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-medium tracking-[0.22em] text-zinc-400">
                    SEÑALES DEL MÓDULO
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="w-24 text-[11px] font-medium tracking-[0.14em] text-zinc-400">
                        RITMO
                      </p>
                      <div className="h-2 flex-1 rounded-full bg-white/5">
                        <div
                          data-module-stream-bar="throughput"
                          className="h-2 w-[72%] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-200"
                        />
                      </div>
                      <span
                        data-module-stream-value="throughput"
                        className="w-32 whitespace-nowrap text-right text-xs text-zinc-300"
                      >
                        Eventos/min: 2.4k
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="w-24 text-[11px] font-medium tracking-[0.14em] text-zinc-400">
                        COBERTURA
                      </p>
                      <div className="h-2 flex-1 rounded-full bg-white/5">
                        <div
                          data-module-stream-bar="coverage"
                          className="h-2 w-[68%] rounded-full bg-gradient-to-r from-emerald-300/80 to-emerald-200"
                        />
                      </div>
                      <span
                        data-module-stream-value="coverage"
                        className="w-32 whitespace-nowrap text-right text-xs text-zinc-300"
                      >
                        Cobertura: 68%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="w-24 text-[11px] font-medium tracking-[0.14em] text-zinc-400">
                        LATENCIA
                      </p>
                      <div className="h-2 flex-1 rounded-full bg-white/5">
                        <div
                          data-module-stream-bar="latency"
                          className="h-2 w-[32%] rounded-full bg-gradient-to-r from-cyan-200/90 to-violet-200/70"
                        />
                      </div>
                      <span
                        data-module-stream-value="latency"
                        className="w-32 whitespace-nowrap text-right text-xs text-zinc-300"
                      >
                        Latencia: 32ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="relative mx-auto w-full max-w-6xl px-6 pb-6">
          <div data-reveal className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-xs font-medium tracking-[0.26em] text-zinc-400">
                STACK · LENGUAJES · FRAMEWORKS
              </p>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-emerald-950/40 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-emerald-950/40 to-transparent" />
              {(() => {
                const stackItems = [
                  {
                    label: "PostgreSQL",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M6 7.5C6 5.6 8.7 4 12 4s6 1.6 6 3.5V16.5c0 1.9-2.7 3.5-6 3.5s-6-1.6-6-3.5V7.5Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M6 7.8C6 9.7 8.7 11.3 12 11.3s6-1.6 6-3.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Docker",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M4 13.2h15.3c-.4 2.9-2.5 6.8-8 6.8-3.6 0-6.6-2.3-7.3-5.4Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.3 11.2h2.2V9H6.3v2.2Zm2.8 0h2.2V9H9.1v2.2Zm2.8 0h2.2V9h-2.2v2.2Zm-5.6 2.4h2.2v-2.2H6.3v2.2Zm2.8 0h2.2v-2.2H9.1v2.2Zm2.8 0h2.2v-2.2h-2.2v2.2Z"
                          fill="currentColor"
                          opacity="0.85"
                        />
                        <path
                          d="M19.6 10.5c.9-.4 2-.3 2.4.4-.2 1.6-1.5 2.5-2.9 2.6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Kubernetes",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M12 3.8l6.5 3.8v8.8L12 20.2 5.5 16.4V7.6L12 3.8Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 7.2l3.2 1.9v3.8L12 14.8 8.8 12.9V9.1L12 7.2Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Redis",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M6 8.2 12 5l6 3.2-6 3.2-6-3.2Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 12.1l6 3.2 6-3.2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 15.8l6 3.2 6-3.2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "S3",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M8.2 15.8H7.3c-1.8 0-3.3-1.4-3.3-3.2 0-1.7 1.3-3.1 3-3.2.5-2.1 2.4-3.6 4.7-3.6 2.4 0 4.4 1.7 4.8 4 2 .2 3.5 1.8 3.5 3.8 0 2.1-1.7 3.6-3.8 3.6h-.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10 18.2h4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Cloudflare",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M8.3 16.8h8.6c1.8 0 3.1-1.2 3.1-2.9 0-1.4-1-2.6-2.4-2.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M7.9 16.8c-1.9 0-3.4-1.3-3.4-3.1 0-1.6 1.1-2.8 2.6-3.1.6-2.1 2.6-3.7 5-3.7 2.5 0 4.6 1.7 5.1 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Terraform",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M6 6.3 10 8.6v4.6L6 10.9V6.3Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.8 9 14.8 11.3v4.6l-4-2.3V9Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.6 8.6 19 10.5v7.2l-3.4-1.9V8.6Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Grafana",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M12 20a8 8 0 1 0-8-8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 6.8c2.9 0 5.2 2.3 5.2 5.2 0 1.9-1 3.6-2.5 4.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 12l3.3-1"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "OpenTelemetry",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M8.5 6.2 12 4l3.5 2.2v11.6L12 20l-3.5-2.2V6.2Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.8 9.2h4.4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.8 12h4.4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                ];
                const languageItems = [
                  { label: "TypeScript", mark: "TS" },
                  { label: "JavaScript", mark: "JS" },
                  { label: "Python", mark: "PY" },
                  { label: "Go", mark: "GO" },
                  { label: "SQL", mark: "SQL" },
                  { label: "Bash", mark: "SH" },
                  { label: "Rust", mark: "RS" },
                  { label: "Java", mark: "JV" },
                ];
                const frameworkItems = [
                  {
                    label: "Node.js",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M12 3.8 19 7.8v8.4l-7 4-7-4V7.8l7-4Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.2 14.8V9.7l5.6 5.1V9.7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "React",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                        <path
                          d="M12 5c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          opacity="0.35"
                        />
                        <path
                          d="M5.2 10.2c1.2-2.1 4-3.6 6.8-3.6s5.6 1.5 6.8 3.6c-1.2 2.1-4 3.6-6.8 3.6s-5.6-1.5-6.8-3.6Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.2 5.2c2.1 1.2 3.6 4 3.6 6.8s-1.5 5.6-3.6 6.8c-2.1-1.2-3.6-4-3.6-6.8s1.5-5.6 3.6-6.8Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Next.js",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M7.2 18V6.2h1.7l7.9 11.8V6.2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Tailwind",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M6 10.2c1.1-2.2 2.9-3.3 5.4-3.3 3.8 0 4.7 2.7 6.6 2.7 1.2 0 2-.6 2.6-1.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M2.8 15.2c1.1-2.2 2.9-3.3 5.4-3.3 3.8 0 4.7 2.7 6.6 2.7 1.2 0 2-.6 2.6-1.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Express",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M7.2 8.2 16.8 15.8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16.8 8.2 7.2 15.8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Prisma",
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path
                          d="M8.2 20 4.6 7.2 11.9 4l7.5 9.9L8.2 20Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.2 20 19.4 13.9"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                ];

                return (
                  <>
                    <div className="overflow-hidden px-6 py-5">
                      <div className="olmeca-track olmeca-track-fast">
                        {Array.from({ length: 4 }).map((_, gi) => (
                          <div
                            key={`stack-group-${gi}`}
                            className="olmeca-group flex w-max gap-3 pr-3"
                            aria-hidden={gi === 0 ? undefined : true}
                          >
                            {stackItems.map((item) => (
                              <span
                                key={`stack-${gi}-${item.label}`}
                                className={
                                  gi === 0
                                    ? "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-black/20 text-emerald-100/90 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] transition-colors hover:bg-emerald-300/10"
                                    : "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-black/20 text-emerald-100/90 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]"
                                }
                                title={item.label}
                                aria-label={item.label}
                              >
                                {item.icon}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-hidden px-6 pb-3">
                      <div className="olmeca-track olmeca-track-slow">
                        <div className="olmeca-group flex w-max gap-3 pr-3">
                          {languageItems.map((item) => (
                            <span
                              key={`logo-${item.label}`}
                              className="group grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-black/20 text-[11px] font-semibold tracking-[0.22em] text-emerald-100/90 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] transition-colors hover:bg-emerald-300/10"
                              title={item.label}
                              aria-label={item.label}
                            >
                              <span className="translate-x-[0.04em]">{item.mark}</span>
                            </span>
                          ))}
                        </div>
                        <div className="olmeca-group flex w-max gap-3 pr-3" aria-hidden="true">
                          {languageItems.map((item) => (
                            <span
                              key={`logo-dup-${item.label}`}
                              className="group grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-black/20 text-[11px] font-semibold tracking-[0.22em] text-emerald-100/90 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] transition-colors hover:bg-emerald-300/10"
                              title={item.label}
                              aria-label={item.label}
                            >
                              <span className="translate-x-[0.04em]">{item.mark}</span>
                            </span>
                          ))}
                        </div>
                        <div className="olmeca-group flex w-max gap-3 pr-3" aria-hidden="true">
                          {languageItems.map((item) => (
                            <span
                              key={`logo-dup2-${item.label}`}
                              className="group grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-black/20 text-[11px] font-semibold tracking-[0.22em] text-emerald-100/90 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] transition-colors hover:bg-emerald-300/10"
                              title={item.label}
                              aria-label={item.label}
                            >
                              <span className="translate-x-[0.04em]">{item.mark}</span>
                            </span>
                          ))}
                        </div>
                        <div className="olmeca-group flex w-max gap-3 pr-3" aria-hidden="true">
                          {languageItems.map((item) => (
                            <span
                              key={`logo-dup3-${item.label}`}
                              className="group grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-black/20 text-[11px] font-semibold tracking-[0.22em] text-emerald-100/90 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] transition-colors hover:bg-emerald-300/10"
                              title={item.label}
                              aria-label={item.label}
                            >
                              <span className="translate-x-[0.04em]">{item.mark}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden px-6 pb-6">
                      <div className="olmeca-track olmeca-track-mid">
                        {Array.from({ length: 6 }).map((_, gi) => (
                          <div
                            key={`fw-group-${gi}`}
                            className="olmeca-group flex w-max gap-3 pr-3"
                            aria-hidden={gi === 0 ? undefined : true}
                          >
                            {frameworkItems.map((item) => (
                              <span
                                key={`fw-${gi}-${item.label}`}
                                className={
                                  gi === 0
                                    ? "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-zinc-100/90 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-colors hover:bg-white/10"
                                    : "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-zinc-100/90 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                                }
                                title={item.label}
                                aria-label={item.label}
                              >
                                {item.icon}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </section>

        <style jsx global>{`
          @keyframes olmeca_marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333333%);
            }
          }

          @keyframes olmeca_marquee_4 {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-25%);
            }
          }

          @keyframes olmeca_marquee_6 {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-16.666667%);
            }
          }

          @keyframes olmeca_marquee_25 {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-25%);
            }
          }

          @keyframes olmeca_blink {
            0%,
            49% {
              opacity: 1;
            }
            50%,
            100% {
              opacity: 0;
            }
          }

          .olmeca-marquee {
            animation: olmeca_marquee 18s linear infinite;
            will-change: transform;
          }

          .olmeca-marquee-slow {
            animation: olmeca_marquee 28s linear infinite;
            will-change: transform;
          }

          .olmeca-marquee-mid {
            animation: olmeca_marquee 22s linear infinite;
            will-change: transform;
          }

          .olmeca-track {
            display: flex;
            width: max-content;
            will-change: transform;
            animation-name: olmeca_marquee;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }

          .olmeca-track-fast {
            animation-duration: 18s;
            animation-name: olmeca_marquee_4;
          }

          .olmeca-track-mid {
            animation-duration: 22s;
            animation-name: olmeca_marquee_6;
          }

          .olmeca-track-slow {
            animation-duration: 28s;
            animation-name: olmeca_marquee_25;
          }

          .olmeca-paused .olmeca-marquee {
            animation-play-state: paused;
          }

          .olmeca-paused .olmeca-marquee-slow {
            animation-play-state: paused;
          }

          .olmeca-paused .olmeca-marquee-mid {
            animation-play-state: paused;
          }

          .olmeca-paused .olmeca-track {
            animation-play-state: paused;
          }

          .olmeca-blink {
            animation: olmeca_blink 1.05s steps(1, end) infinite;
          }
        `}</style>

        <section
          id="capacidades"
          ref={capabilitiesRef}
          className="relative mx-auto w-full max-w-6xl px-6 py-20 md:min-h-screen md:py-28"
        >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div data-reveal>
              <p className="text-xs font-medium tracking-[0.26em] text-zinc-400">CAPACIDADES</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
                Stack <span className="text-emerald-200">sin límites</span>, enfoque en confiabilidad
              </h2>
              <p className="mt-4 text-lg leading-8 text-zinc-300">
                Elegimos la tecnología que mejor se adapta a tu operación y mantenemos el código limpio,
                trazable y mantenible.
              </p>

              <div data-reveal className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-medium tracking-[0.26em] text-zinc-400">KPIs (EJEMPLO)</p>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-400">Latencia sync</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-50">
                      <span className="text-emerald-200" data-kpi-value data-kpi-to="34">
                        34
                      </span>
                      <span className="text-base font-medium text-zinc-400">ms</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-400">Uptime</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-50">
                      <span className="text-emerald-200" data-kpi-value data-kpi-to="99.9">
                        99.9
                      </span>
                      <span className="text-base font-medium text-zinc-400">%</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-400">Eventos auditados</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-50">
                      <span className="text-emerald-200" data-kpi-value data-kpi-to="2180">
                        2180
                      </span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-400">Alertas resueltas</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-50">
                      <span className="text-emerald-200" data-kpi-value data-kpi-to="7420">
                        7420
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div
                data-reveal
                className="flex min-h-[132px] flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 9v2.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.5 12.5h9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.5 12.5V15M12 12.5V15M16.5 12.5V15"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 5.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M7 15a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 7 15ZM12 15a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM17 15a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-zinc-50">Arquitectura</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  Multi-tenant, roles y permisos, auditoría, eventos, integraciones.
                </p>
              </div>
              <div
                data-reveal
                className="min-h-[132px] rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M6.2 7.2h7v7h-7v-7Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.8 9.8h7v7h-7v-7Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.2 10.2h1.1c0.9 0 1.7-0.8 1.7-1.7V7.4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.8 13.8h-1.1c-0.9 0-1.7 0.8-1.7 1.7v1.1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-zinc-50">Integraciones</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  APIs, ETLs, sincronización, conectores a sistemas existentes.
                </p>
              </div>
              <div
                data-reveal
                className="flex min-h-[132px] flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 12a8 8 0 0 1 16 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 12a5 5 0 0 1 10 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 12l3.5-2.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-zinc-50">Observabilidad</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  Monitoreo, logs, alertas y métricas para que el sistema no sea una caja negra.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={workflowRef}
          className="relative mx-auto w-full max-w-6xl px-6 py-20 md:min-h-screen md:py-28"
        >
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
              Un día, una operación
            </h2>
            <p className="mt-4 text-lg leading-8 text-zinc-300">
              Mira cómo módulos coordinados mantienen trazabilidad, auditoría y continuidad operativa —
              desde el movimiento en campo hasta el cierre del turno.
            </p>
          </div>

          <div data-reveal className="mt-12">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
                </div>
                <p className="text-xs font-medium tracking-[0.22em] text-zinc-300">
                  Un día en OLMECA Ops
                </p>
                <div className="flex items-center gap-1.5">
                  <span data-workflow-dot className="h-2 w-2 rounded-full" />
                  <span data-workflow-dot className="h-2 w-2 rounded-full" />
                  <span data-workflow-dot className="h-2 w-2 rounded-full" />
                  <span data-workflow-dot className="h-2 w-2 rounded-full" />
                  <span data-workflow-dot className="h-2 w-2 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-12 md:p-8">
                <div className="md:col-span-4">
                  <p className="text-sm font-semibold text-zinc-50">
                    Workflow operativo (ejemplo)
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">
                    Un flujo típico donde el inventario se vuelve “vivo” con eventos auditables,
                    sincronización y reportes.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-300">
                      Inventario
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-300">
                      Auditoría
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-300">
                      Integraciones
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-300">
                      Reportes
                    </span>
                  </div>

                  <div
                    data-workflow-detail
                    className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0">
                        <p
                          data-workflow-detail-title
                          className="text-sm font-semibold text-zinc-50"
                        >
                          Supervisor de turno
                        </p>
                        <p
                          data-workflow-detail-body
                          className="mt-1 text-sm leading-7 text-zinc-300"
                        >
                          Checklist de arranque + sincronización completa. Se valida acceso, ubicaciones y
                          catálogo MRO.
                        </p>
                        <p
                          data-workflow-detail-meta
                          className="mt-3 text-xs font-medium tracking-[0.14em] text-zinc-400"
                        >
                          Responsable: Operaciones · Evidencia: Bitácora
                        </p>
                      </div>
                      <div className="hidden shrink-0 md:block">
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-zinc-300">
                          Señal
                          <div className="mt-2 h-2 w-24 rounded-full bg-white/5">
                            <div className="h-2 w-[78%] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-200" />
                          </div>
                          <p className="mt-2 text-[11px] text-zinc-400">stream: estable</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative md:col-span-8">
                  <div className="absolute left-[26px] top-2 h-[calc(100%-8px)] w-px bg-gradient-to-b from-emerald-300/30 via-white/10 to-transparent" />
                  <div
                    data-workflow-progress
                    className="absolute left-[26px] top-2 h-[calc(100%-8px)] w-px bg-gradient-to-b from-emerald-300/80 via-cyan-200/40 to-transparent"
                  />

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="relative mt-1 flex w-[52px] flex-col items-center">
                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-zinc-200">
                          7:00
                        </span>
                        <span className="mt-3 h-3.5 w-3.5 rounded-full border border-emerald-300/30 bg-emerald-300/20" />
                      </div>
                      <div
                        data-workflow-step
                        className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <p className="text-sm font-semibold text-zinc-50">Inicio de turno</p>
                        <p className="mt-1 text-sm text-zinc-300">
                          Sincronización de catálogos, ubicaciones y listas de verificación.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            Ops Console
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            Sync
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="relative mt-1 flex w-[52px] flex-col items-center">
                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-zinc-200">
                          9:30
                        </span>
                        <span className="mt-3 h-3.5 w-3.5 rounded-full border border-emerald-300/30 bg-emerald-300/20" />
                      </div>
                      <div
                        data-workflow-step
                        className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <p className="text-sm font-semibold text-zinc-50">Movimiento en campo</p>
                        <p className="mt-1 text-sm text-zinc-300">
                          Entradas/salidas registradas como eventos auditables (offline/online).
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            Mobile
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            Audit Trail
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="relative mt-1 flex w-[52px] flex-col items-center">
                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-zinc-200">
                          12:00
                        </span>
                        <span className="mt-3 h-3.5 w-3.5 rounded-full border border-emerald-300/30 bg-emerald-300/20" />
                      </div>
                      <div
                        data-workflow-step
                        className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <p className="text-sm font-semibold text-zinc-50">Validación & conciliación</p>
                        <p className="mt-1 text-sm text-zinc-300">
                          Reglas de negocio, inconsistencias y aprobaciones por rol.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            Roles
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            Alerts
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="relative mt-1 flex w-[52px] flex-col items-center">
                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-zinc-200">
                          16:30
                        </span>
                        <span className="mt-3 h-3.5 w-3.5 rounded-full border border-emerald-300/30 bg-emerald-300/20" />
                      </div>
                      <div
                        data-workflow-step
                        className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <p className="text-sm font-semibold text-zinc-50">Integración con sistemas</p>
                        <p className="mt-1 text-sm text-zinc-300">
                          Sincronización con ERP/CMMS y reporte operativo para supervisión.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            API
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            ETL
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="relative mt-1 flex w-[52px] flex-col items-center">
                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-zinc-200">
                          19:00
                        </span>
                        <span className="mt-3 h-3.5 w-3.5 rounded-full border border-emerald-300/30 bg-emerald-300/20" />
                      </div>
                      <div
                        data-workflow-step
                        className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <p className="text-sm font-semibold text-zinc-50">Cierre de turno</p>
                        <p className="mt-1 text-sm text-zinc-300">
                          Snapshot firmado, evidencias y bitácora lista para auditoría.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            Reports
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            Compliance
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="proceso"
          ref={processRef}
          className="relative mx-auto w-full max-w-6xl px-6 py-20 md:min-h-screen md:py-28"
        >
          <div data-reveal className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.26em] text-zinc-400">PROCESO</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
              De diagnóstico a entrega: claro, rápido y medible
            </h2>
          </div>
          <div className="relative mt-10">
            <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-16 md:block">
              <div className="absolute left-4 top-2 h-[calc(100%-8px)] w-px bg-white/10" />
              <div
                data-process-progress
                className="absolute left-4 top-2 h-[calc(100%-8px)] w-px bg-gradient-to-b from-cyan-200/70 via-emerald-300/40 to-transparent"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div
                data-reveal
                data-process-step
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-zinc-400">01</p>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M21 21l-4.2-4.2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M11 7v4l3 2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <p className="mt-3 font-semibold text-zinc-50">Diagnóstico</p>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  Objetivos, contexto operativo y restricciones reales.
                </p>
              </div>
              <div
                data-reveal
                data-process-step
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-zinc-400">02</p>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 3h10a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 8h8M9 12h8M9 16h5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5 7H4a2 2 0 0 0-2 2v10"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
                <p className="mt-3 font-semibold text-zinc-50">Diseño & arquitectura</p>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  Propuesta técnica, UX y plan de implementación.
                </p>
              </div>
              <div
                data-reveal
                data-process-step
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-zinc-400">03</p>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 20h18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 20V10l5-4 5 4v10"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 20v-5h4v5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <p className="mt-3 font-semibold text-zinc-50">Construcción</p>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  Iteraciones cortas, entregables visibles, calidad.
                </p>
              </div>
              <div
                data-reveal
                data-process-step
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-zinc-400">04</p>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9v6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
                <p className="mt-3 font-semibold text-zinc-50">Lanzamiento</p>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  Deploy controlado, monitoreo y ajustes finos.
                </p>
              </div>
            </div>

            <div
              data-reveal
              data-process-detail
              className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6"
            >
              <p data-process-detail-title className="text-sm font-semibold text-zinc-50">
                Entregable: Diagnóstico operativo
              </p>
              <p data-process-detail-body className="mt-2 text-sm leading-7 text-zinc-300">
                Mapa de proceso, riesgos, datos disponibles y primer alcance. Identificamos puntos críticos
                y quick wins.
              </p>
              <p
                data-process-detail-meta
                className="mt-4 text-xs font-medium tracking-[0.14em] text-zinc-400"
              >
                Salida: documento + backlog priorizado
              </p>
            </div>
          </div>
        </section>

        <section
          id="contacto"
          ref={contactRef}
          className="relative mx-auto w-full max-w-6xl px-6 pb-28 pt-20 md:min-h-screen md:pb-32 md:pt-28"
        >
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-8 md:p-12">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div data-reveal className="max-w-2xl">
                <p className="text-xs font-medium tracking-[0.26em] text-zinc-400">CONTACTO</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
                  Hablemos de tu operación
                </h2>
                <p className="mt-4 text-lg leading-8 text-zinc-300">
                  Cuéntame qué necesitas y te propongo una ruta clara: alcance, tiempos y siguiente paso.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  data-reveal
                  className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-50 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white"
                  href="mailto:the@unknownshoppers.com"
                >
                  Escribir correo
                </a>
                <a
                  data-reveal
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-zinc-100 backdrop-blur transition-colors hover:bg-white/10"
                  href="https://wa.me/5219932171855?text=Hola%20OLMECA%20CODE"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <div data-reveal className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <TerminalWordmark size="sm" />
              </div>
              <p className="text-xs text-zinc-500">© {new Date().getFullYear()} OLMECA CODE</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

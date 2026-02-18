"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function TerminalDemo() {
  const lines = useMemo(
    () => [
      "> node inventory-live.js",
      "[olmeca] booting runtime...",
      "[olmeca] connecting: assets-stream",
      "[olmeca] sync: ok · latency=34ms",
      "[olmeca] audit: enabled · signed events",
      "[olmeca] ingest: +24 events",
      "[olmeca] normalize: ok",
      "[olmeca] snapshot: warehouse-MRO",
      "[olmeca] delta: +3 items · -1 item",
      "[olmeca] status: stable",
    ],
    [],
  );

  const windowSize = 7;
  const [count, setCount] = useState(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let i = 1;
    const id = window.setInterval(() => {
      i += 1;
      if (i > lines.length) i = 1;
      setCount(i);
    }, 650);

    return () => window.clearInterval(id);
  }, [lines.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [count]);

  const visibleLines = useMemo(() => {
    const lastIndex = count - 1;
    const size = Math.min(windowSize, lines.length);
    const start = lastIndex - (size - 1);

    return Array.from({ length: size }, (_, i) => {
      let idx = start + i;
      while (idx < 0) idx += lines.length;
      idx = idx % lines.length;
      return { idx, text: lines[idx] };
    });
  }, [count, lines, windowSize]);

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
        <div
          ref={scrollRef}
          className="h-36 overflow-y-auto font-mono text-xs leading-6 text-zinc-200"
        >
          {visibleLines.map(({ idx, text }) => (
            <div key={`${idx}-${text}`} className="whitespace-pre-wrap">
              <span className={text.startsWith(">") ? "text-emerald-200" : ""}>
                {text}
              </span>
            </div>
          ))}
          <div className="whitespace-pre-wrap">
            <span className="text-zinc-300">$</span>
            <span className="ml-2 inline-block h-4 w-2 translate-y-[2px] bg-zinc-200/70" />
          </div>
        </div>
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

  const sectionRefs = useMemo(
    () => [servicesRef, capabilitiesRef, processRef, contactRef],
    [],
  );

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
          ScrollTrigger.create({
            trigger: cap,
            start: "top 70%",
            once: true,
            onEnter: () => {
              kpis.forEach((el) => {
                const toRaw = el.getAttribute("data-kpi-to") ?? "0";
                const to = Number(toRaw);
                const isFloat = toRaw.includes(".");
                const state = { value: 0 };

                gsap.to(state, {
                  value: to,
                  duration: 1.1,
                  ease: "power2.out",
                  onUpdate: () => {
                    el.textContent = isFloat
                      ? state.value.toFixed(1)
                      : Math.round(state.value).toString();
                  },
                });
              });
            },
          });
        }
      }

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
          sectionRefs.forEach((ref) => {
            if (!ref.current) return;
            const section = ref.current;

            if (section === contactRef.current) return;

            ScrollTrigger.create({
              trigger: section,
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

        if (moduleItems.length > 0) {
          const modules = [
            {
              title: "Captura en campo",
              body: "Registro offline/online con evidencia. Menos fricción, más trazabilidad.",
              meta: "Input: móvil · Output: evento auditado",
            },
            {
              title: "Inventario vivo",
              body: "Deltas continuos, historial de cambios y snapshots por turno/ubicación.",
              meta: "Modo: incremental · Señal: estable",
            },
            {
              title: "Auditoría",
              body: "Quién hizo qué, cuándo y por qué. Evidencias listas para cumplimiento.",
              meta: "Trail: firmado · Retención: configurable",
            },
            {
              title: "Integraciones",
              body: "ERP/CMMS/BI: sincronización por API/ETL, con reglas y monitoreo.",
              meta: "Sync: programado · Alertas: activas",
            },
            {
              title: "Reportes",
              body: "Cierres de turno, discrepancias y KPIs operativos en minutos, no días.",
              meta: "Export: PDF/CSV · BI: listo",
            },
            {
              title: "Roles & permisos",
              body: "Aprobaciones por rol, control de acceso y segregación de funciones.",
              meta: "SSO: opcional · Policy: por sitio",
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
              });

              if (label) {
                gsap.to(label, {
                  duration: 0.25,
                  ease: "power2.out",
                  color: isActive ? "rgb(244 244 245)" : "rgb(161 161 170)",
                });
              }

              if (dot) {
                gsap.to(dot, {
                  duration: 0.25,
                  ease: "power2.out",
                  opacity: isActive ? 1 : 0.35,
                  scale: isActive ? 1.15 : 1,
                });
              }
            });

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
          const stepDuration = 1.1;

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

        ScrollTrigger.create({
          trigger: process,
          start: "top 70%",
          end: "bottom 30%",
          scrub: true,
          onUpdate: (self) => {
            const maxIndex = Math.max(steps.length - 1, 0);
            const idx = Math.max(
              0,
              Math.min(maxIndex, Math.floor(self.progress * (steps.length - 0.0001))),
            );
            setActive(idx);
            if (progress) {
              gsap.to(progress, {
                duration: 0.15,
                ease: "none",
                scaleY: self.progress,
              });
            }
          },
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

  return (
    <div ref={rootRef} className="min-h-screen bg-black text-zinc-100">
      <div
        ref={sceneOverlayRef}
        className="pointer-events-none fixed inset-0 -z-0 opacity-0"
        style={{
          background:
            "radial-gradient(800px circle at 15% 20%, rgba(16,185,129,0.22), rgba(0,0,0,0) 55%), radial-gradient(900px circle at 85% 75%, rgba(34,211,238,0.16), rgba(0,0,0,0) 60%)",
          mixBlendMode: "screen",
        }}
      />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo-mono.png"
            alt="OLMECA CODE"
            width={36}
            height={36}
            priority
          />
          <span className="text-sm font-semibold tracking-[0.22em] text-zinc-200">
            OLMECA CODE
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
          <a className="transition-colors hover:text-zinc-50" href="#servicios">
            Servicios
          </a>
          <a className="transition-colors hover:text-zinc-50" href="#capacidades">
            Capacidades
          </a>
          <a className="transition-colors hover:text-zinc-50" href="#proceso">
            Proceso
          </a>
          <a className="transition-colors hover:text-zinc-50" href="#contacto">
            Contacto
          </a>
        </nav>

        <a
          href="#contacto"
          className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-zinc-100 backdrop-blur transition-colors hover:bg-white/10"
        >
          Agenda una llamada
        </a>
      </header>

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
                SOFTWARE OPERATIVO · SISTEMAS IT · ENTORNOS CRÍTICOS
              </p>
              <h1
                data-hero-title
                className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-6xl"
              >
                Tecnología útil.
                <span className="block bg-gradient-to-r from-emerald-300 via-cyan-200 to-zinc-50 bg-clip-text text-transparent">
                  Diseño brutal.
                </span>
                Ejecución sin drama.
              </h1>
              <p
                data-hero-body
                className="mt-6 max-w-xl text-pretty text-lg leading-8 text-zinc-300"
              >
                Construimos software para operaciones reales: trazabilidad, control, integraciones e
                infraestructura. Desde inventarios vivos hasta sistemas IT a la medida.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contacto"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-50 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white"
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
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Implementación rápida
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Integración con tu stack
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Calidad enterprise
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 to-transparent" />
              <div
                data-hero-card
                className="relative w-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
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
            <div
              data-reveal
              data-parallax="up"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-zinc-50">Inventarios vivos</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                Trazabilidad, control de cambios, auditoría y visibilidad operativa en tiempo real.
              </p>
            </div>
            <div
              data-reveal
              data-parallax="down"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-zinc-50">Sistemas IT</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                Desarrollo web, APIs, integraciones, automatización de flujos y herramientas internas.
              </p>
            </div>
            <div
              data-reveal
              data-parallax="up"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-zinc-50">Infraestructura y calidad</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                Observabilidad, seguridad básica, CI/CD y performance para nivel enterprise.
              </p>
            </div>
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
              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <div data-module-detail>
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
                    EVENT STREAM
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-white/5">
                      <div className="h-2 w-[64%] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-200" />
                    </div>
                    <span className="text-xs text-zinc-300">stable</span>
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
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent" />
              <div className="flex gap-3 py-5">
                <div className="flex min-w-full shrink-0 animate-[olmeca_marquee_18s_linear_infinite] gap-3 px-6">
                  {[
                    "TypeScript",
                    "JavaScript",
                    "Python",
                    "Go",
                    "Node.js",
                    "React",
                    "Next.js",
                    "PostgreSQL",
                    "Docker",
                    "Kubernetes",
                  ].map((label) => (
                    <span
                      key={label}
                      className="whitespace-nowrap rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-medium tracking-[0.18em] text-zinc-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex min-w-full shrink-0 animate-[olmeca_marquee_18s_linear_infinite] gap-3 px-6">
                  {[
                    "TypeScript",
                    "JavaScript",
                    "Python",
                    "Go",
                    "Node.js",
                    "React",
                    "Next.js",
                    "PostgreSQL",
                    "Docker",
                    "Kubernetes",
                  ].map((label) => (
                    <span
                      key={`dup-${label}`}
                      className="whitespace-nowrap rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-medium tracking-[0.18em] text-zinc-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <style jsx global>{`
          @keyframes olmeca_marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
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
                Stack sin límites, enfoque en confiabilidad
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
                      <span data-kpi-value data-kpi-to="34">
                        34
                      </span>
                      <span className="text-base font-medium text-zinc-400">ms</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-400">Uptime</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-50">
                      <span data-kpi-value data-kpi-to="99.9">
                        99.9
                      </span>
                      <span className="text-base font-medium text-zinc-400">%</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-400">Eventos auditados</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-50">
                      <span data-kpi-value data-kpi-to="9670">
                        9670
                      </span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-400">Alertas resueltas</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-50">
                      <span data-kpi-value data-kpi-to="128">
                        128
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div
                data-reveal
                data-parallax="down"
                className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="text-sm font-semibold text-zinc-50">Arquitectura</p>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  Multi-tenant, roles y permisos, auditoría, eventos, integraciones.
                </p>
              </div>
              <div
                data-reveal
                data-parallax="up"
                className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="text-sm font-semibold text-zinc-50">Integraciones</p>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  APIs, ETLs, sincronización, conectores a sistemas existentes.
                </p>
              </div>
              <div
                data-reveal
                data-parallax="down"
                className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="text-sm font-semibold text-zinc-50">Observabilidad</p>
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
                <p className="text-xs font-medium text-zinc-400">01</p>
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
                <p className="text-xs font-medium text-zinc-400">02</p>
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
                <p className="text-xs font-medium text-zinc-400">03</p>
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
                <p className="text-xs font-medium text-zinc-400">04</p>
                <p className="mt-3 font-semibold text-zinc-50">Lanzamiento</p>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  Deploy, monitoreo y mejora continua.
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
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <Image
                    src="/brand/logo-mono.png"
                    alt="OLMECA CODE"
                    width={28}
                    height={28}
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500">© {new Date().getFullYear()} OLMECA CODE</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

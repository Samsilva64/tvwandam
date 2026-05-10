"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/", label: "Início", icon: "bi-house-door" },
  { href: "/programas", label: "Programas", icon: "bi-tv" },
  { href: "/ao-vivo", label: "Ao vivo", icon: "bi-broadcast" },
  { href: "/noticias", label: "Notícias", icon: "bi-newspaper" },
  { href: "/artistas", label: "Artistas", icon: "bi-mic" },
  { href: "/parceiros", label: "Parceiros", icon: "bi-people" },
];

const LG_NAV = "(min-width: 1024px)";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(LG_NAV);
    const onChange = () => {
      if (mq.matches) closeMenu();
    };
    mq.addEventListener("change", onChange);
    if (mq.matches) closeMenu();
    return () => mq.removeEventListener("change", onChange);
  }, [closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,211,42,0.16)] bg-[rgba(0,0,0,0.9)] shadow-[0_1px_0_rgba(242,7,7,0.16)] backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center px-4 py-2 sm:px-6 lg:justify-between">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[var(--foreground)] hover:bg-white/10 sm:left-6 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-nav-drawer"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <i className={menuOpen ? "bi-x-lg text-xl" : "bi-list text-xl"} aria-hidden />
        </button>

        <nav className="hidden flex-wrap items-center gap-1 lg:flex" aria-label="Navegação principal">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="group relative px-3 py-2 text-sm text-[var(--foreground)]/80 hover:text-[var(--foreground)]"
                title={l.label}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-md bg-[var(--brand-yellow)]/16 ring-1 ring-[var(--brand-yellow)]/35"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <i className={`${l.icon} text-lg`} aria-hidden />
                  <span>{l.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex w-full justify-center lg:w-auto lg:justify-end">
          <Logo />
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="nav-overlay-shell"
            className="fixed inset-0 z-[60] flex min-h-[100dvh] lg:hidden"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="min-h-[100dvh] min-w-0 flex-1 cursor-default bg-black/65 backdrop-blur-[2px]"
              aria-label="Fechar menu"
              role="button"
              tabIndex={-1}
              onClick={closeMenu}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  closeMenu();
                }
              }}
            />
            <motion.aside
              id="site-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navegação do site"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className="h-[100dvh] w-[min(20rem,calc(100vw-2.5rem))] shrink-0 border-l border-white/10 bg-[rgba(8,8,8,0.98)] shadow-[-12px_0_40px_rgba(0,0,0,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Navegação</span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Fechar"
                >
                  <i className="bi-x-lg text-lg" aria-hidden />
                </button>
              </div>
              <ul className="max-h-[calc(100dvh-3.25rem)] overflow-y-auto overscroll-contain py-2">
                {links.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                          active
                            ? "bg-[var(--brand-yellow)]/14 text-[var(--foreground)] ring-1 ring-inset ring-[var(--brand-yellow)]/30"
                            : "text-[var(--foreground)]/80 hover:bg-white/[0.06] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <i className={`${l.icon} text-lg opacity-90`} aria-hidden />
                        <span className="font-medium">{l.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

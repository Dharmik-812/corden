"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, PencilRuler, LayoutDashboard, CreditCard, LogOut, ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useAuthStore } from "@/stores/auth-store";

export type SiteHeaderVariant = "marketing" | "dashboard" | "app" | "minimal";

interface SiteHeaderProps {
  variant?: SiteHeaderVariant;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} className={`site-nav-link${active ? " site-nav-link--active" : ""}`}>
      {children}
    </Link>
  );
}

export function SiteHeader({ variant: variantProp }: SiteHeaderProps) {
  const pathname = usePathname();
  const { user, hydrate, signOut } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const variant: SiteHeaderVariant =
    variantProp ??
    (pathname === "/dashboard" ? "dashboard" : pathname.startsWith("/editor") ? "minimal" : "app");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isMarketing = variant === "marketing";
  const isDashboard = variant === "dashboard";
  const showNav = (isMarketing || variant === "app");

  return (
    <>
      <motion.header
        initial={isMarketing ? { y: -16, opacity: 0 } : false}
        animate={isMarketing ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`site-header${scrolled ? " site-header--scrolled" : ""}`}
      >
        <div className="site-header-inner">
          <div className="site-header-brand">
            <Link href="/" className="site-header-logo">
              <Logo size={isDashboard ? 24 : 28} />
            </Link>
            {isDashboard && (
              <>
                <span className="site-header-divider" />
                <span className="site-header-badge">Studio</span>
              </>
            )}
          </div>

          {showNav && (
            <nav className="site-header-nav" aria-label="Main">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <NavLink key={href} href={href} active={pathname === href}>
                  <Icon size={14} />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="site-header-actions">
            {isDashboard && (
              <div className="site-header-editor-pills">
                <Link href="/editor/2d/new" className="site-pill site-pill--2d">
                  <PencilRuler size={14} />
                  <span className="site-pill-label">New 2D</span>
                </Link>
                <Link href="/editor/3d/new" className="site-pill site-pill--3d">
                  <Box size={14} />
                  <span className="site-pill-label">New 3D</span>
                </Link>
              </div>
            )}

            {user ? (
              <div className="site-header-user">
                <Link href="/profile" className="site-user-chip">
                  <span className="site-user-avatar">{user.display_name.charAt(0).toUpperCase()}</span>
                  <span className="site-user-name">{user.display_name}</span>
                  {user.membership_tier === "pro" && (
                    <span className="site-pro-badge">Pro</span>
                  )}
                </Link>
                <button type="button" className="site-logout-btn" onClick={signOut} title="Log out">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="site-login-link">Log in</Link>
                <Link href={isMarketing ? "/dashboard" : "/signup"} className="site-cta-btn">
                  {isMarketing ? "Get Started" : "Sign up"}
                  <ArrowRight size={15} />
                </Link>
              </>
            )}

            {showNav && (
              <button
                type="button"
                className="site-mobile-toggle"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {showNav && (
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="site-mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="site-mobile-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`site-mobile-link${pathname === href ? " site-mobile-link--active" : ""}`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
                {!user && (
                  <Link href="/login" className="site-mobile-link">
                    Log in
                  </Link>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
}

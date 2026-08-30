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

export function SiteHeader({ variant: variantProp }: SiteHeaderProps) {
  const pathname = usePathname();
  const { user, hydrate, signOut } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const variant: SiteHeaderVariant =
    variantProp ??
    (pathname === "/dashboard" ? "dashboard" : pathname.startsWith("/editor") ? "minimal" : "app");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isMarketing = variant === "marketing";
  const isDashboard = variant === "dashboard";
  const showNav = isMarketing || variant === "app";

  return (
    <>
      <div className={`site-header-wrapper ${isMarketing ? 'site-header-wrapper--floating' : 'site-header-wrapper--full'}`}>
        <motion.header
          initial={isMarketing ? { y: -40, opacity: 0 } : false}
          animate={isMarketing ? { y: 0, opacity: 1 } : undefined}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`site-header-new ${scrolled ? "site-header-new--scrolled" : ""}`}
        >
          <div className="site-header-left">
            <Link href="/" className="site-logo-link">
              <Logo size={24} />
            </Link>
            {isDashboard && (
              <div className="site-header-badge-wrap">
                <span className="site-header-divider" />
                <span className="site-header-badge">Studio</span>
              </div>
            )}
          </div>

          {showNav ? (
            <nav className="site-header-center" onMouseLeave={() => setHoveredPath(null)}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`site-nav-item ${isActive ? "site-nav-item--active" : ""}`}
                    onMouseEnter={() => setHoveredPath(item.href)}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>{item.label}</span>
                    {item.href === hoveredPath && (
                      <motion.div
                        className="site-nav-hover-pill"
                        layoutId="navHoverPill"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div />
          )}

          <div className="site-header-right">


            {user ? (
              <div className="site-user-menu">
                <Link href="/profile" className="site-user-avatar-btn">
                  {user.display_name.charAt(0).toUpperCase()}
                </Link>
                <button type="button" className="site-logout-icon-btn" onClick={signOut} title="Log out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="site-auth-group">
                <Link href="/login" className="site-link-btn">Log in</Link>
                <Link href={isMarketing ? "/dashboard" : "/signup"} className="site-primary-btn">
                  {isMarketing ? "Get Started" : "Sign up"}
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {showNav && (
              <button
                type="button"
                className="site-mobile-toggle site-mobile-toggle-new"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </motion.header>
      </div>

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
                    className={`site-mobile-link ${pathname === href ? "site-mobile-link--active" : ""}`}
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

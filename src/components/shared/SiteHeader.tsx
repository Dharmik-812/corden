"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { Logo } from "./Logo";
import { useAuthStore } from "@/stores/auth-store";

export type SiteHeaderVariant = "marketing" | "dashboard" | "app" | "minimal";

interface SiteHeaderProps {
  variant?: SiteHeaderVariant;
}

export function SiteHeader({ variant: variantProp }: SiteHeaderProps) {
  const pathname = usePathname();
  const { user, hydrate } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  const variant: SiteHeaderVariant =
    variantProp ??
    (pathname === "/dashboard"
      ? "dashboard"
      : pathname.startsWith("/editor")
        ? "minimal"
        : "app");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isMarketing = variant === "marketing";
  const isDashboard = variant === "dashboard";

  return (
    <div
      className={`site-header-wrapper ${isMarketing ? "site-header-wrapper--floating" : "site-header-wrapper--full"}`}
    >
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

        <div className="site-header-right">
          <div className="site-auth-group">
            {user ? (
              <>
                {pathname !== "/dashboard" ? (
                  <Link
                    href="/dashboard"
                    className="site-primary-btn"
                  >
                    Launch Studio
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    href="/editor/3d/new"
                    className="site-primary-btn"
                  >
                    <Plus size={14} />
                    Open Studio
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="site-user-avatar-btn"
                  title={`Profile (${user.display_name})`}
                >
                  {user.display_name.charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="site-primary-btn"
              >
                Get Started
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </motion.header>
    </div>
  );
}

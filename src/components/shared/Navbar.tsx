"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";

export function Navbar() {
  const pathname = usePathname();
  const variant = pathname === "/dashboard"
    ? "dashboard"
    : pathname.startsWith("/editor")
    ? "minimal"
    : "app";
  return <SiteHeader variant={variant} />;
}

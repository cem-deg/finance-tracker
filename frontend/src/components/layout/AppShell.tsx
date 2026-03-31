"use client";

/**
 * AppShell wraps authenticated pages with sidebar + mobile nav.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="text-center">
          <div className="skeleton" style={{ width: 60, height: 60, borderRadius: "50%", margin: "0 auto 16px" }} />
          <div className="skeleton skeleton-text" style={{ width: 120, margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
      <MobileNav />
    </div>
  );
}

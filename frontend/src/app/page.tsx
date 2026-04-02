"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Wallet, BarChart3, Lightbulb, Tags, Shield, Zap,
  ArrowRight, TrendingUp, ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading) return null;
  if (user) return null;

  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content animate-in">
          <div className="hero-badge">
            <Zap size={14} /> Smart Finance Tracking
          </div>
          <h1 className="hero-title">
            Take Control of Your{" "}
            <span className="gradient-text">Financial Future</span>
          </h1>
          <p className="hero-subtitle">
            Track expenses, analyze spending patterns, and get AI-powered insights
            to make smarter financial decisions. All in one beautiful dashboard.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sign In <ChevronRight size={18} />
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-number">50+</div>
              <div className="stat-text">Category Icons</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">AI</div>
              <div className="stat-text">Powered Insights</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">18+</div>
              <div className="stat-text">Currencies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header animate-in">
          <h2>Everything You Need</h2>
          <p>Powerful features to manage your finances effortlessly</p>
        </div>
        <div className="features-grid">
          <div className="feature-card animate-in animate-in-delay-1">
            <div className="feature-icon" style={{ background: "rgba(124,106,239,0.15)", color: "var(--accent-primary-light)" }}>
              <Wallet size={24} />
            </div>
            <h3>Expense Tracking</h3>
            <p>Log every transaction with categories, dates, and descriptions. Filter and search through your history instantly.</p>
          </div>
          <div className="feature-card animate-in animate-in-delay-2">
            <div className="feature-icon" style={{ background: "rgba(0,210,211,0.15)", color: "var(--accent-secondary)" }}>
              <BarChart3 size={24} />
            </div>
            <h3>Visual Analytics</h3>
            <p>Beautiful charts and graphs show your spending patterns. Monthly trends, category breakdowns, and daily insights.</p>
          </div>
          <div className="feature-card animate-in animate-in-delay-3">
            <div className="feature-icon" style={{ background: "rgba(253,203,110,0.15)", color: "var(--accent-warning)" }}>
              <Lightbulb size={24} />
            </div>
            <h3>AI-Powered Insights</h3>
            <p>Get personalized financial advice powered by Google Gemini AI. Smart alerts when spending spikes or savings opportunities appear.</p>
          </div>
          <div className="feature-card animate-in animate-in-delay-4">
            <div className="feature-icon" style={{ background: "rgba(0,184,148,0.15)", color: "var(--accent-success)" }}>
              <Tags size={24} />
            </div>
            <h3>Custom Categories</h3>
            <p>Organize with 50+ icons across 12 groups. Create unlimited custom categories with colors that match your style.</p>
          </div>
          <div className="feature-card animate-in animate-in-delay-1">
            <div className="feature-icon" style={{ background: "rgba(255,107,107,0.15)", color: "var(--accent-danger)" }}>
              <TrendingUp size={24} />
            </div>
            <h3>ML Predictions</h3>
            <p>Machine learning models predict your next month's spending based on historical patterns and trends.</p>
          </div>
          <div className="feature-card animate-in animate-in-delay-2">
            <div className="feature-icon" style={{ background: "rgba(162,155,254,0.15)", color: "var(--accent-primary-light)" }}>
              <Shield size={24} />
            </div>
            <h3>Multi-Currency</h3>
            <p>Support for 18+ currencies worldwide. Switch between USD, EUR, TRY, GBP, JPY and more with a single click.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header animate-in">
          <h2>How It Works</h2>
          <p>Get started in three simple steps</p>
        </div>
        <div className="steps-grid">
          <div className="step-item animate-in animate-in-delay-1">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up for free in seconds. No credit card required.</p>
          </div>
          <div className="step-item animate-in animate-in-delay-2">
            <div className="step-number">2</div>
            <h3>Track Spending</h3>
            <p>Add expenses with categories and watch your dashboard come alive.</p>
          </div>
          <div className="step-item animate-in animate-in-delay-3">
            <div className="step-number">3</div>
            <h3>Get Insights</h3>
            <p>Receive AI-powered analysis and actionable tips to save money.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Datafle.</p>
      </footer>
    </div>
  );
}

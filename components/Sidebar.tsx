"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/", icon: "home", primary: true },
  { label: "My Team", href: "/team", icon: "team", primary: true },
  { label: "Matchup", href: "/matchup", icon: "vs", primary: true },
  { label: "Free Agents", href: "/free-agents", icon: "waiver", primary: true },
  { label: "Message Board", href: "/message-board", icon: "chat", primary: true },
  { label: "Draft", href: "/draft", icon: "draft", primary: false },
  { label: "Strategy", href: "/strategy", icon: "strategy", primary: false },
  { label: "Agent Setup", href: "/setup", icon: "connect", primary: false },
  { label: "Agent Log", href: "/agent", icon: "agent", primary: false },
];

function NavIcon({ name, size = 20 }: { name: string; size?: number }) {
  const icons: Record<string, React.ReactElement> = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    team: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    vs: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 3.5l6 6-6 6M3 21l5-5M21 21L3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    waiver: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    chat: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    draft: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    strategy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="21" x2="4" y2="14" strokeLinecap="round" />
        <line x1="4" y1="10" x2="4" y2="3" strokeLinecap="round" />
        <line x1="12" y1="21" x2="12" y2="12" strokeLinecap="round" />
        <line x1="12" y1="8" x2="12" y2="3" strokeLinecap="round" />
        <line x1="20" y1="21" x2="20" y2="16" strokeLinecap="round" />
        <line x1="20" y1="12" x2="20" y2="3" strokeLinecap="round" />
        <line x1="1" y1="14" x2="7" y2="14" strokeLinecap="round" />
        <line x1="9" y1="8" x2="15" y2="8" strokeLinecap="round" />
        <line x1="17" y1="16" x2="23" y2="16" strokeLinecap="round" />
      </svg>
    ),
    agent: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4M8 16h.01M16 16h.01" strokeLinecap="round" />
      </svg>
    ),
    connect: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12c0 5-3.5 7.5-8.5 9.5C7.5 19.5 4 17 4 12V6l8-3 8 3v6z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    more: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = navItems.filter((i) => i.primary);
  const secondaryItems = navItems.filter((i) => !i.primary);
  const onSecondary = secondaryItems.some((i) => i.href === pathname);

  return (
    <>
      {/* === DESKTOP SIDEBAR === */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r border-ink-400 bg-ink-800 z-30">
        <div className="px-5 py-5 border-b border-ink-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white text-sm">
              AI
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">AIFFL</div>
              <div className="text-[10px] text-gray-500">AI Fantasy Football</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-accent/15 text-accent-glow font-medium"
                    : "text-gray-400 hover:text-white hover:bg-ink-600/50"
                }`}
              >
                <span className={active ? "text-accent" : "text-gray-500"}>
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-ink-400">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-ink-700/50">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-field-bright" />
              <div className="absolute inset-0 rounded-full bg-field-bright animate-ping opacity-40" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">COACH-Z</div>
              <div className="text-[10px] text-gray-500">Active · Monitoring</div>
            </div>
          </div>
        </div>
      </aside>

      {/* === MOBILE TOP BAR === */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-ink-800/95 backdrop-blur-sm border-b border-ink-400">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center font-bold text-white text-xs">
              AI
            </div>
            <span className="text-sm font-bold text-white tracking-wide">AIFFL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-field-bright" />
            <span className="text-[10px] text-field-bright font-medium">COACH-Z</span>
          </div>
        </div>
      </header>

      {/* === MOBILE BOTTOM NAV === */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-800/95 backdrop-blur-sm border-t border-ink-400 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around">
          {primaryItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 min-w-[56px] transition-colors ${
                  active ? "text-accent" : "text-gray-500"
                }`}
              >
                <NavIcon name={item.icon} size={22} />
                <span className="text-[9px] font-medium leading-none">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 min-w-[56px] transition-colors ${
              moreOpen || onSecondary ? "text-accent" : "text-gray-500"
            }`}
          >
            <NavIcon name="more" size={22} />
            <span className="text-[9px] font-medium leading-none">More</span>
          </button>
        </div>

        {/* Expanded secondary menu */}
        {moreOpen && (
          <div className="border-t border-ink-400 px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {secondaryItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-accent/15 text-accent-glow"
                        : "text-gray-400 bg-ink-700/50"
                    }`}
                  >
                    <NavIcon name={item.icon} size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop when more menu is open */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMoreOpen(false)}
        />
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/", icon: "home" },
  { label: "My Team", href: "/team", icon: "team" },
  { label: "Matchup", href: "/matchup", icon: "vs" },
  { label: "Free Agents", href: "/free-agents", icon: "waiver" },
  { label: "Message Board", href: "/message-board", icon: "chat" },
  { label: "Draft", href: "/draft", icon: "draft" },
  { label: "Strategy", href: "/strategy", icon: "strategy" },
  { label: "Agent Setup", href: "/setup", icon: "connect" },
  { label: "Agent Log", href: "/agent", icon: "agent" },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactElement> = {
    home: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    team: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    vs: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 3.5l6 6-6 6M3 21l5-5M21 21L3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    waiver: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    chat: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    draft: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    strategy: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4M8 16h.01M16 16h.01" strokeLinecap="round" />
      </svg>
    ),
    connect: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12c0 5-3.5 7.5-8.5 9.5C7.5 19.5 4 17 4 12V6l8-3 8 3v6z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">AIFFL</span>
        <span className="logo-sub">AI Fantasy Football</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "nav-item active" : "nav-item"}
            >
              <span className="nav-icon">
                <NavIcon name={item.icon} />
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="agent-badge">
          <div className="agent-dot" />
          <div>
            <div className="agent-name">COACH-Z</div>
            <div className="agent-status">Active · Monitoring</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

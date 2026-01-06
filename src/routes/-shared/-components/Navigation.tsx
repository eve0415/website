import type { FC } from "react";

import { Link, useLocation } from "@tanstack/react-router";

interface NavItem {
  path: string;
  label: string;
  shortcut: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Index", shortcut: "1" },
  { path: "/projects", label: "Projects", shortcut: "2" },
  { path: "/skills", label: "Skills", shortcut: "3" },
  { path: "/link", label: "Link", shortcut: "4" },
];

const Navigation: FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 right-0 left-0 z-sticky flex items-center justify-between px-6 py-4 backdrop-blur-sm md:px-12">
      {/* Logo/Home link */}
      <Link
        to="/"
        className="text-text-secondary transition-colors duration-fast hover:text-accent-primary"
        aria-label="ホーム"
      >
        <span className="font-medium text-lg">eve0415</span>
      </Link>

      {/* Navigation links */}
      <ul className="flex gap-6 md:gap-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`group relative flex items-center gap-2 text-sm transition-colors duration-fast ${
                  isActive ? "text-accent-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <span
                  className={`hidden text-xs opacity-50 md:inline ${isActive ? "text-accent-primary" : "text-text-muted"}`}
                >
                  [{item.shortcut}]
                </span>
                <span>{item.label}</span>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute right-0 -bottom-1 left-0 h-px bg-accent-primary opacity-60" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;

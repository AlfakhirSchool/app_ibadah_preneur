"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  const navItems = isAdmin
    ? [
        { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
        { name: "Input Form", href: "/form-ibadah", icon: "📝" },
      ]
    : [{ name: "Form Ibadah", href: "/form-ibadah", icon: "📝" }];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-emerald-100 px-6 py-3 safe-area-bottom sm:relative sm:border-t-0 sm:border-b sm:bg-white/50 sm:py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-around sm:justify-center sm:gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-all ${
                isActive
                  ? "text-emerald-600 scale-110 sm:scale-105"
                  : "text-gray-400 hover:text-emerald-500"
              }`}
            >
              <span className="text-xl sm:text-lg">{item.icon}</span>
              <span className="text-[10px] sm:text-sm font-semibold uppercase tracking-wider">
                {item.name}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-600 sm:hidden"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

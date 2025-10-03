"use client";

import { useState, useEffect, useRef } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "@/actions/auth";

interface NavbarProps {
  className?: string;
  username?: string;
}

export const Navbar = ({ className = "", username }: NavbarProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathName = usePathname();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        isProfileOpen
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  if (pathName === "/login") {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 ${className}`}
    >
      <div className="flex items-center">
        <h2
          className={`text-base md:text-lg font-medium text-gray-900 ${
            isMobile ? "pl-12" : ""
          }`}
        >
          Selamat datang{isMobile ? null : `, ${username}`}
        </h2>
      </div>

      <div className="relative profile-menu" ref={profileMenuRef}>
        <button
          onClick={toggleProfile}
          className="flex items-center gap-2 py-2 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200"
          aria-expanded={isProfileOpen}
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
            {username ? (
              username.charAt(0).toUpperCase()
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <span className="text-gray-900 hidden sm:block font-medium">
            {username || "User"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isProfileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-200 rounded-lg py-1 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {username || "Admin"}
              </p>
            </div>
            <Link
              href="/settings"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <User className="w-4 h-4" />
              <span>Profil</span>
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, User } from "lucide-react";

import isAuth, { userType } from "../lib/isAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (location) => {
    navigate(location);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  const authed = isAuth();
  const type = authed ? userType() : null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          type="button"
          onClick={() => handleClick("/")}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <span className="text-lg font-bold">F</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            FCM Platform
          </span>
        </button>

        {/* Center navigation (desktop) */}
        {authed && (
          <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 md:flex">
            {type === "recruiter" ? (
              <>
                <NavButton
                  label="Home"
                  active={isActive("/home")}
                  onClick={() => handleClick("/home")}
                />
                <NavButton
                  label="Add Jobs"
                  active={isActive("/addjob")}
                  onClick={() => handleClick("/addjob")}
                />
                <NavButton
                  label="My Jobs"
                  active={isActive("/myjobs")}
                  onClick={() => handleClick("/myjobs")}
                />
                <NavButton
                  label="Employees"
                  active={isActive("/employees")}
                  onClick={() => handleClick("/employees")}
                />
              </>
            ) : (
              <>
                <NavButton
                  label="Home"
                  active={isActive("/home")}
                  onClick={() => handleClick("/home")}
                />
                <NavButton
                  label="Applications"
                  active={isActive("/applications")}
                  onClick={() => handleClick("/applications")}
                />
              </>
            )}
          </nav>
        )}

        {/* Right section */}
        <div className="flex items-center gap-3">
          {authed ? (
            <>
              <button
                type="button"
                className="relative inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleClick("/profile")}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <button
                type="button"
                onClick={() => handleClick("/logout")}
                className="hidden rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleClick("/login")}
                className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleClick("/signup")}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const NavButton = ({ label, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex items-center rounded-full px-3 py-1 text-sm transition-colors",
        active
          ? "bg-primary-soft text-primary"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      {label}
    </button>
  );
};

export default Navbar;

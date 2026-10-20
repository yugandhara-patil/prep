import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  UserRound,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  PlayCircle,
  Brain,
  BarChart2,
} from "lucide-react";
import PrepLogo from "../components/PrepLogo";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  

useEffect(() => {
  function loadUser() {
    try {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  }

  loadUser();

  window.addEventListener("profile-updated", loadUser);
  window.addEventListener("focus", loadUser);
  window.addEventListener("storage", loadUser);

  return () => {
    window.removeEventListener("profile-updated", loadUser);
    window.removeEventListener("focus", loadUser);
    window.removeEventListener("storage", loadUser);
  };
}, [location.pathname]);



  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  }

  const navLinks = [
    { label: "Dashboard", path: "/home", icon: LayoutDashboard },
    { label: "Start Interview", path: "/start-interview", icon: PlayCircle },
    { label: "Practice MCQs", path: "/practice-questions", icon: Brain },
    { label: "Performance", path: "/overall-performance", icon: BarChart2 },
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const photoUrl = user?.profilePhotoUrl
  ? user.profilePhotoUrl.startsWith("http")
    ? user.profilePhotoUrl
    : `${import.meta.env.VITE_API_URL}${user.profilePhotoUrl.startsWith("/") ? "" : "/"}${user.profilePhotoUrl}`
  : null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8 lg:px-10">
        {/* Brand / Logo */}
        <PrepLogo to="/home" size="md" />

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User profile & actions */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1 pr-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="User menu"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={user?.fullName || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="max-w-[120px] truncate text-xs font-semibold text-slate-800">
                {user?.fullName?.split(" ")[0] || "Profile"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-2">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {user?.fullName || "User"}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {user?.email || ""}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserRound size={15} />
                    <span>My Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <UserRound size={18} />
              <span>My Profile</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
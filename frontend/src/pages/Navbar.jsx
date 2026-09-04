import { UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">

        {/* Website Name */}
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D4DE8] to-[#9A79FF] text-lg font-extrabold text-white shadow-md shadow-purple-200">
            P
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-slate-950 transition group-hover:text-[#6D4DE8]">
            Prep
          </span>
        </button>

        {/* Profile Icon */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-purple-100 bg-[#F5F0FF] text-[#6D4DE8] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#6D4DE8] hover:text-white hover:shadow-lg hover:shadow-purple-200"
          aria-label="Profile"
          title="Profile"
        >
          <UserRound size={22} />
        </button>

      </div>
    </nav>
  );
}

export default Navbar;
import { Link } from "react-router-dom";
import PrepLogo from "../components/PrepLogo";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Brand info */}
          <div className="sm:col-span-2">
            <PrepLogo to="/home" size="md" />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              AI-powered interview preparation platform. Practice realistic resume-based technical and HR interviews with real-time feedback to land your dream job.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/home" className="transition hover:text-indigo-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/start-interview" className="transition hover:text-indigo-600">
                  Start Interview
                </Link>
              </li>
              <li>
                <Link to="/practice-questions" className="transition hover:text-indigo-600">
                  Aptitude Practice
                </Link>
              </li>
              <li>
                <Link to="/overall-performance" className="transition hover:text-indigo-600">
                  Performance Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Account
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/profile" className="transition hover:text-indigo-600">
                  My Profile
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                  className="transition hover:text-indigo-600"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {currentYear} Prep. All rights reserved.</p>
          <p className="text-slate-400">
            Designed for serious interview preparation.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

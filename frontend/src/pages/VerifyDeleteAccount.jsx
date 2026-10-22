import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { AlertTriangle, Trash2, CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import PrepLogo from "../components/PrepLogo";

export default function VerifyDeleteAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    !token ? "No deletion verification token provided. If you requested account deletion, please check the link in your email." : ""
  );
  const [success, setSuccess] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleConfirmDelete = async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/delete-account/confirm`,
        { token }
      );
      // Clean up any local storage sessions
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("profile-updated"));
      window.dispatchEvent(new Event("storage"));
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid or expired account deletion link. Your account has NOT been deleted."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCancelled(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/home" className="inline-flex items-center gap-2">
            <PrepLogo />
          </Link>
        </div>

        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 rounded-2xl sm:px-10">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Account Deleted</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your Prep account and all associated mock interview records, feedback, and profile information have been permanently removed.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login", { replace: true })}
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : cancelled ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-600">
                <ArrowLeft className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Deletion Cancelled</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You have cancelled account deletion. Your Prep account, data, and interview progress remain completely safe and untouched.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 inline-flex justify-center items-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition"
                >
                  Return to Profile
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="flex-1 inline-flex justify-center items-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
                >
                  Go to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-rose-600">
                    Confirm Account Deletion
                  </h2>
                  <p className="text-[11px] text-slate-400">Irreversible Action</p>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You requested to permanently delete your Prep account via email verification.
              </p>

              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 text-[11px] sm:text-xs text-rose-900 space-y-1">
                <p className="font-semibold">Deleting your account will permanently remove:</p>
                <ul className="list-disc list-inside space-y-0.5 text-rose-800 pl-1">
                  <li>Your user profile and registered credentials</li>
                  <li>All mock interview transcripts, recordings, and history</li>
                  <li>All AI performance analytics, scores, and feedback</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 inline-flex justify-center items-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition disabled:opacity-60"
                >
                  Cancel & Keep Account
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={loading || !token}
                  className="flex-1 inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Permanently Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

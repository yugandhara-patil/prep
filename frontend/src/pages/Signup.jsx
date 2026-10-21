import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, Mic, Award, ArrowRight, Loader2, Check } from "lucide-react";
import axios from "axios";
import authHeroImage from "../assets/auth-hero.jpg";
import PrepLogo from "../components/PrepLogo";
import { getGoogleClientId } from "../utils/googleAuth";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSuccessfulAuth = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        profilePhotoUrl: data.profilePhotoUrl || "",
      })
    );
    window.dispatchEvent(new Event("profile-updated"));
    navigate("/home");
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }
      );

      // Automatically sign in upon registration
      const loginRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      handleSuccessfulAuth(loginRes.data);
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const googleButtonRef = useRef(null);
  const gisInitializedRef = useRef(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);

  // Initialize Google Identity Services on mount using resolved Client ID
  useEffect(() => {
    let isCancelled = false;
    let timer;

    async function initGis() {
      const googleClientId = await getGoogleClientId();
      if (isCancelled || !googleClientId) {
        if (!googleClientId) {
          console.warn("Google Client ID not configured.");
        }
        return;
      }

      const initGoogle = () => {
        if (!window.google?.accounts?.id || !googleButtonRef.current) {
          return false;
        }

        try {
          if (!gisInitializedRef.current) {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: async (res) => {
                if (!res?.credential) return;
                try {
                  setGoogleLoading(true);
                  setErrorMessage("");
                  setInfoMessage("");
                  const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || ""}/api/auth/google`,
                    { idToken: res.credential }
                  );
                  handleSuccessfulAuth(response.data);
                } catch (err) {
                  console.error("Google authentication error:", err);
                  setErrorMessage(
                    err.response?.data?.message || "Failed to authenticate with Google. Please try again or register with email."
                  );
                } finally {
                  setGoogleLoading(false);
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true,
              itp_support: true,
            });
            gisInitializedRef.current = true;
          }

          const container = googleButtonRef.current;
          container.innerHTML = "";
          const containerWidth = Math.min(Math.max(container.offsetWidth || 340, 240), 400);

          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: containerWidth,
          });

          setGoogleAvailable(true);
          return true;
        } catch (err) {
          console.warn("Failed to initialize Google Sign-In:", err);
          return false;
        }
      };

      if (!initGoogle()) {
        let attempts = 0;
        timer = setInterval(() => {
          attempts++;
          if (initGoogle() || attempts > 25) {
            clearInterval(timer);
          }
        }, 200);
      }
    }

    initGis();

    return () => {
      isCancelled = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  function handleFallbackGoogleClick() {
    setInfoMessage(
      "Google Sign-In is initializing or unavailable in this browser window. You can register directly with your details below."
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      
      {/* ================= LEFT VISUAL PANEL (Desktop) ================= */}
      <div className="hidden lg:flex lg:col-span-6 bg-slate-900 text-white relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-slate-800">
        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <PrepLogo to="/" size="lg" theme="light-text" />
          <span className="text-xs font-medium text-slate-400">
            AI Interview Intelligence
          </span>
        </div>

        {/* Center Editorial Photograph & Balanced Text */}
        <div className="relative z-10 space-y-5 my-auto max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-slate-700/60 shadow-xl bg-slate-950">
            <img
              src={authHeroImage}
              alt="Maya AI interview companion and coach"
              className="w-full h-[300px] xl:h-[340px] object-cover object-center"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl xl:text-2xl font-bold text-white tracking-tight leading-snug">
              Begin your interview preparation.
            </h1>
            <p className="text-xs xl:text-sm text-slate-300 leading-relaxed">
              Create your account to start taking full-length mock interviews tailored to your resume, tracking score analytics, and refining your skills.
            </p>
          </div>
        </div>

        {/* Bottom Clean Footer */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>Objective rubric scoring</span>
          <span>Voice & resume-tailored</span>
        </div>
      </div>

      {/* ================= RIGHT FORM PANEL ================= */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50/50">
        <div className="w-full max-w-md mx-auto space-y-5">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center pb-2">
            <PrepLogo to="/" size="md" theme="dark-text" />
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 shadow-xs max-h-36">
              <img
                src={authHeroImage}
                alt="Maya AI interview companion and coach"
                className="w-full h-36 object-cover object-center"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Your Free Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Start practicing realistic mock interviews in under a minute
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-700">{errorMessage}</p>
            </div>
          )}

          {infoMessage && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3.5 text-xs text-indigo-700">
              {infoMessage}
            </div>
          )}

          {/* Google Sign In Container */}
          <div className="w-full flex flex-col items-center justify-center">
            <div
              ref={googleButtonRef}
              className={`w-full flex justify-center ${googleAvailable ? "min-h-[44px]" : "hidden"} ${
                googleLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            />

            {!googleAvailable && (
              <button
                type="button"
                onClick={handleFallbackGoogleClick}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
            )}

            {googleLoading && (
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 mt-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Signing in with Google...
              </div>
            )}
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-slate-50/50 px-3 text-slate-400 font-medium tracking-wider">
                Or register with email
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs hover:shadow-indigo-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed pt-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-1">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
              Sign in here
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserRound,
  Pencil,
  Briefcase,
  Code2,
  Globe,
  Camera,
  Check,
  X,
  Mail,
  Award,
  Sparkles,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Building,
  GraduationCap,
  Trash2,
  AlertTriangle
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Profile() {
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    targetRole: "",
    currentStatus: "",
    experienceLevel: "",
    skills: [],
    about: "",
    linkedin: "",
    github: "",
    portfolio: "",
    profilePhotoUrl: "",
  });

  const [formData, setFormData] = useState(profile);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Delete Account Verification states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteRequesting, setDeleteRequesting] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteModalError, setDeleteModalError] = useState("");
  const [deleteModalSuccess, setDeleteModalSuccess] = useState("");

  const getFullPhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setMessage({ type: "", text: "" });

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        const loadedProfile = {
          fullName: data.fullName || "",
          email: data.email || "",
          targetRole: data.targetRole || "",
          currentStatus: data.currentStatus || "",
          experienceLevel: data.experienceLevel || "",
          skills: data.skills
            ? data.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          about: data.about || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          portfolio: data.portfolio || "",
          profilePhotoUrl: data.profilePhotoUrl || "",
        };

        setProfile(loadedProfile);
        setFormData(loadedProfile);

        if (loadedProfile.profilePhotoUrl) {
          setProfilePhoto(getFullPhotoUrl(loadedProfile.profilePhotoUrl));
        }
      } catch (error) {
        console.error("Profile load error:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          setMessage({
            type: "error",
            text: "Your session has expired. Please sign in again.",
          });
        } else {
          setMessage({
            type: "error",
            text: "Unable to load profile data.",
          });
        }
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadProfile();
    } else {
      setLoading(false);
      setMessage({ type: "error", text: "Please sign in to view your profile." });
    }
  }, [token]);

  // =========================
  // EDIT HANDLERS
  // =========================
  function startEditing() {
    setFormData(profile);
    setMessage({ type: "", text: "" });
    setIsEditing(true);
  }

  function cancelEditing() {
    setFormData(profile);
    setMessage({ type: "", text: "" });
    setIsEditing(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSkillsChange(event) {
    const skills = event.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    setFormData((prev) => ({
      ...prev,
      skills,
    }));
  }

  // =========================
  // PHOTO UPLOAD & PERSISTENCE
  // =========================
  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file (PNG, JPG, or WEBP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image file size must be less than 5 MB." });
      return;
    }

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setProfilePhoto(previewUrl);

    try {
      setPhotoUploading(true);
      setMessage({ type: "", text: "" });

      const photoFormData = new FormData();
      photoFormData.append("file", file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/profile/photo`,
        photoFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newPhotoUrl =
        response.data.profilePhotoUrl || response.data.photoUrl;

      if (!newPhotoUrl) {
        throw new Error("The server did not return a profile photo URL.");
      }

      const fullUrl = getFullPhotoUrl(newPhotoUrl);

      setProfilePhoto(fullUrl);
      setProfile((prev) => ({ ...prev, profilePhotoUrl: newPhotoUrl }));
      setFormData((prev) => ({ ...prev, profilePhotoUrl: newPhotoUrl }));

      // Update stored user in localStorage for global navbar consistency
      const storedUser = localStorage.getItem("user");
      const parsed = storedUser ? JSON.parse(storedUser) : {};

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...parsed,
          profilePhotoUrl: newPhotoUrl,
        })
      );

      window.dispatchEvent(new Event("profile-updated"));
      setMessage({ type: "success", text: "Profile photo updated successfully." });
    } catch (err) {
      console.error("Photo upload error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload photo. Please try again.",
      });
      // Revert preview on error
      if (profile.profilePhotoUrl) {
        setProfilePhoto(getFullPhotoUrl(profile.profilePhotoUrl));
      } else {
        setProfilePhoto(null);
      }
    } finally {
      setPhotoUploading(false);
    }
  }

  // =========================
  // SAVE PROFILE
  // =========================
  async function saveProfile() {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const requestBody = {
        fullName: formData.fullName,
        targetRole: formData.targetRole,
        currentStatus: formData.currentStatus,
        experienceLevel: formData.experienceLevel,
        skills: formData.skills.join(","),
        about: formData.about,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,
        profilePhotoUrl: formData.profilePhotoUrl || profile.profilePhotoUrl || "",
      };

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/profile`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      const updatedProfile = {
        fullName: data.fullName || "",
        email: data.email || "",
        targetRole: data.targetRole || "",
        currentStatus: data.currentStatus || "",
        experienceLevel: data.experienceLevel || "",
        skills: data.skills
          ? data.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        about: data.about || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
        portfolio: data.portfolio || "",
        profilePhotoUrl: data.profilePhotoUrl || "",
      };

      setProfile(updatedProfile);
      setFormData(updatedProfile);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            fullName: updatedProfile.fullName,
            profilePhotoUrl: updatedProfile.profilePhotoUrl,
          })
        );
      }

      window.dispatchEvent(new Event("profile-updated"));
      setMessage({ type: "success", text: "Profile details updated successfully." });
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // DELETE ACCOUNT (Danger Zone)
  // =========================
  const handleDeleteAccountClick = async () => {
    setDeleteRequesting(true);
    setDeleteModalError("");
    setDeleteCode("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/profile/delete-request`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDeleteModalSuccess(
        response.data?.message ||
        `Verification email sent to ${profile.email}. Please enter the 6-digit code to confirm.`
      );
      setDeleteModalOpen(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Unable to send account deletion verification email. Please try again later.";
      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setDeleteRequesting(false);
    }
  };

  const handleResendDeleteEmail = async () => {
    setDeleteRequesting(true);
    setDeleteModalError("");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/profile/delete-request`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDeleteModalSuccess(
        response.data?.message ||
        `A fresh verification code was sent to ${profile.email}.`
      );
    } catch (err) {
      setDeleteModalError(
        err.response?.data?.message ||
        "Failed to resend verification email. Please try again."
      );
    } finally {
      setDeleteRequesting(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/profile/delete-cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch {
      // ignore
    }
    setDeleteModalOpen(false);
    setDeleteCode("");
    setDeleteModalError("");
    setDeleteModalSuccess("");
  };

  const handleConfirmDeletion = async (e) => {
    if (e) e.preventDefault();
    if (!deleteCode || deleteCode.trim().length === 0) {
      setDeleteModalError("Please enter the 6-digit verification code from your email.");
      return;
    }

    setDeleteConfirming(true);
    setDeleteModalError("");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/profile/delete-confirm`,
        { code: deleteCode.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("profile-updated"));
      window.dispatchEvent(new Event("storage"));

      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteModalError(
        err.response?.data?.message ||
        "Invalid or expired verification code. Your account was not deleted."
      );
    } finally {
      setDeleteConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Loading profile information...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <UserRound className="w-3.5 h-3.5" />
              Candidate Profile & Persona
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Professional Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your profile background helps Maya personalize both technical architecture questions and HR behavioral scenarios.
            </p>
          </div>

          <div>
            {!isEditing ? (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving || photoUploading}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving || photoUploading}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout using Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (4 cols): Identity Card & Links */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
              <div className="relative inline-block mx-auto">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden shadow-xs mx-auto">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={profile.fullName || "Candidate"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold text-indigo-600">
                      {profile.fullName?.charAt(0) || "U"}
                    </span>
                  )}
                </div>

                {photoUploading && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}

                {/* Camera upload button ONLY visible when in Edit mode */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    title="Upload profile photo"
                    className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md border-2 border-white transition disabled:opacity-60"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {profile.fullName || "Candidate"}
                </h2>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-1 border-t border-slate-100">
                {profile.targetRole && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Briefcase className="w-3 h-3" />
                    {profile.targetRole}
                  </span>
                )}
                {profile.experienceLevel && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    <Award className="w-3 h-3" />
                    {profile.experienceLevel}
                  </span>
                )}
                {profile.currentStatus && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {profile.currentStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Professional Links Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                External Profiles & Portfolio
              </h3>

              <div className="space-y-2 pt-1">
                <LinkItem label="LinkedIn" url={profile.linkedin} icon={Globe} />
                <LinkItem label="GitHub" url={profile.github} icon={Code2} />
                <LinkItem label="Personal Portfolio" url={profile.portfolio} icon={Globe} />
              </div>
            </div>

            {/* Preparation Guarantee Note */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>Your profile details are stored securely and utilized exclusively to formulate relevant interview questions.</span>
            </div>

          </div>

          {/* RIGHT COLUMN (8 cols): Information Form / Display */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Core Profile Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Career Identity & Experience
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Primary Info</span>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Account bound)</span>
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Role
                    </label>
                    <select
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    >
                      <option value="">Select target role</option>
                      <option>Software Engineer</option>
                      <option>Full Stack Developer</option>
                      <option>Frontend Developer</option>
                      <option>Backend Developer</option>
                      <option>Java Developer</option>
                      <option>Data Analyst</option>
                      <option>Data Scientist</option>
                      <option>Machine Learning Engineer</option>
                      <option>DevOps Engineer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Experience Level
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    >
                      <option value="">Select level</option>
                      <option>Fresher / Student</option>
                      <option>0 - 1 Years</option>
                      <option>1 - 3 Years</option>
                      <option>3 - 5 Years</option>
                      <option>5+ Years</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Professional Status
                    </label>
                    <select
                      name="currentStatus"
                      value={formData.currentStatus}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    >
                      <option value="">Select status</option>
                      <option>Student</option>
                      <option>Fresher / Actively Looking</option>
                      <option>Working Professional</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Target Job Role</span>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {profile.targetRole || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Experience Level</span>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {profile.experienceLevel || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Current Status</span>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {profile.currentStatus || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Account Email</span>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {profile.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Technical Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Technical Skills & Domain Expertise
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Resume Topics</span>
              </div>

              {isEditing ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Skills (Comma separated list)
                  </label>
                  <input
                    type="text"
                    value={formData.skills.join(", ")}
                    onChange={handleSkillsChange}
                    placeholder="Java, Spring Boot, React, SQL, AWS, Microservices"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Maya extracts and aligns conceptual questions with these skills.
                  </p>
                </div>
              ) : (
                <div>
                  {profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No technical skills added yet. Click Edit Profile to add skills.</p>
                  )}
                </div>
              )}
            </div>

            {/* 3. About & Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Professional Summary & Background
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Self-Introduction</span>
              </div>

              {isEditing ? (
                <div>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                    placeholder="Share a concise summary of your technical background, core projects, and career aspirations..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none resize-none"
                  />
                  <p className="text-[11px] text-slate-400 text-right mt-1">
                    {formData.about.length}/500 characters
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {profile.about || "No summary provided. Add a brief career overview to help Maya conduct more relevant introductory dialog."}
                </p>
              )}
            </div>

            {/* 4. Social & Portfolio Edit Fields (visible in edit mode) */}
            {isEditing && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Professional URLs
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Links</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      placeholder="https://myportfolio.dev"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Danger Zone
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Permanently delete your Prep account and all associated interview sessions, answers, scores, and personal data. To prevent accidental deletion, a verification email with a confirmation code will be sent to your registered address.
              </p>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleDeleteAccountClick}
                disabled={deleteRequesting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleteRequesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Delete Account Verification Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-rose-600">
                    Verify Account Deletion
                  </h3>
                  <p className="text-[11px] text-slate-400">Confirmation required</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelDeletion}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteModalSuccess && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{deleteModalSuccess}</span>
              </div>
            )}

            {deleteModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{deleteModalError}</span>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                We sent a 6-digit confirmation code and verification link to <strong className="text-slate-800">{profile.email}</strong>. Enter the 6-digit code below to permanently delete your account, or click the link in your email. The code expires in 15 minutes.
              </p>
              <p className="text-[11px] text-rose-600 font-medium">
                If you cancel or close this dialog, your account will NOT be deleted.
              </p>

              <form onSubmit={handleConfirmDeletion} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={deleteCode}
                    onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 123456"
                    autoFocus
                    className="w-full tracking-widest text-center font-mono text-base font-bold rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={handleResendDeleteEmail}
                    disabled={deleteRequesting}
                    className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCancelDeletion}
                    disabled={deleteConfirming}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deleteConfirming || deleteCode.length !== 6}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {deleteConfirming ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Confirm & Delete Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function LinkItem({ label, url, icon: Icon }) {
  if (!url) {
    return (
      <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-slate-400" />
          <span>{label}</span>
        </div>
        <span className="text-[10px] text-slate-400">Not added</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/30 flex items-center justify-between text-xs text-slate-700 hover:text-indigo-600 transition group"
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition" />
        <span className="font-semibold">{label}</span>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
    </a>
  );
}
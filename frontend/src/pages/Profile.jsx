import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  UserRound,
  Pencil,
  BriefcaseBusiness,
  Code2,
  CodeXml,
  Globe2,
  Link2,
  Camera,
  Check,
  X,
} from "lucide-react";

import Navbar from "./Navbar";

function Profile() {
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setMessage("");

        const response = await axios.get(
          "http://localhost:8081/api/profile",
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

          currentStatus: data.currentStatus || "",
         

          skills: data.skills
            ? data.skills
                .split(",")
                .map((skill) => skill.trim())
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
          setProfilePhoto(loadedProfile.profilePhotoUrl);
        }
      } catch (error) {
        console.error("Profile load error:", error);

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          setMessage(
            "Your login session is invalid or expired. Please login again."
          );
        } else {
          setMessage("Unable to load profile.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadProfile();
    } else {
      setLoading(false);
      setMessage("Please login again.");
    }
  }, [token]);

  // =========================
  // START EDIT
  // =========================
  function startEditing() {
    setFormData(profile);
    setMessage("");
    setIsEditing(true);
  }

  // =========================
  // CANCEL EDIT
  // =========================
  function cancelEditing() {
    setFormData(profile);
    setMessage("");
    setIsEditing(false);
  }

  // =========================
  // INPUT CHANGE
  // =========================
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================
  // SKILLS CHANGE
  // =========================
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
  // PROFILE PHOTO PREVIEW
  // =========================
  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProfilePhoto(imageUrl);

    // Preview only for now.
    // Actual backend/storage upload will be added later.
  }

  // =========================
  // SAVE PROFILE
  // =========================
  async function saveProfile() {
    try {
      setSaving(true);
      setMessage("");

      const requestBody = {
        fullName: formData.fullName,
        targetRole: formData.targetRole,
        currentStatus: formData.currentStatus,
        experienceLevel: formData.experienceLevel,

        // React array -> backend String
        skills: formData.skills.join(","),

        about: formData.about,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,

        // Existing URL only for now
        profilePhotoUrl: formData.profilePhotoUrl || "",
      };

      const response = await axios.put(
        "http://localhost:8081/api/profile",
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
              .map((skill) => skill.trim())
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
          })
        );
      }

      setMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setMessage(
          "Your login session is invalid or expired. Please login again."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to update profile."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FB]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="font-semibold text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 md:px-8 lg:px-10">

        {/* PAGE TITLE */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8A78C8]">
              Your Profile
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 md:text-4xl">
              Profile
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your personal and professional information.
            </p>
          </div>

          {/* EDIT / SAVE */}
          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#6D4DE8] px-5 py-3 font-semibold text-white shadow-md shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-[#5E3FD1]"
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">

              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#6D4DE8] px-5 py-3 font-semibold text-white shadow-md shadow-purple-200 hover:bg-[#5E3FD1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={17} />

                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>
          )}

        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-semibold ${
              message === "Profile updated successfully."
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* PROFILE CARD */}
        <section className="relative overflow-hidden rounded-[28px] border border-purple-100 bg-white p-7 shadow-[0_18px_55px_rgba(109,77,232,0.08)] md:p-8">

          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-purple-100/70 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-center">

            {/* PROFILE PHOTO */}
            <div className="relative shrink-0">

              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#6D4DE8] to-[#9A79FF] text-white shadow-lg shadow-purple-200">

                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={48} />
                )}

              </div>

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#6D4DE8] text-white shadow-md hover:bg-[#5E3FD1]"
                    title="Upload profile photo"
                  >
                    <Camera size={17} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </>
              )}

            </div>

            {/* MAIN INFO */}
            <div className="flex-1">

              {isEditing ? (
                <div className="grid gap-4 md:grid-cols-2">

                  {/* FULL NAME */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#6D4DE8] focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  {/* TARGET ROLE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Target Role
                    </label>

                    <select
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#6D4DE8] focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="">Select role</option>
                      <option>Full Stack Developer</option>
                      <option>Frontend Developer</option>
                      <option>Backend Developer</option>
                      <option>Software Developer</option>
                      <option>Java Developer</option>
                      <option>Data Analyst</option>
                      <option>Data Scientist</option>
                      <option>Machine Learning Engineer</option>
                    </select>
                  </div>

                  {/* EMAIL */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
                    />
                  </div>

                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-extrabold text-slate-950">
                    {profile.fullName || "Complete your profile"}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    {profile.email}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">

                    {profile.targetRole && (
                      <span className="rounded-full bg-[#F0EBFF] px-3 py-1.5 text-sm font-semibold text-[#6D4DE8]">
                        {profile.targetRole}
                      </span>
                    )}

                    {profile.currentStatus && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                        {profile.currentStatus}
                      </span>
                    )}

                    {profile.experienceLevel && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                        {profile.experienceLevel}
                      </span>
                    )}

                  </div>
                </>
              )}

            </div>

          </div>

        </section>

        {/* PROFESSIONAL + ABOUT */}
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

          {/* PROFESSIONAL INFO */}
          <section className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EBFF] text-[#6D4DE8]">
                <BriefcaseBusiness size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Professional Information
                </h2>

                <p className="text-sm text-slate-500">
                  Your current career profile.
                </p>
              </div>

            </div>

            {isEditing ? (
              <div className="space-y-5">

                <SelectField
                  label="Current Status"
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleChange}
                  options={[
                    "",
                    "Student",
                    "Fresher",
                    "Working Professional",
                  ]}
                />

                <SelectField
                  label="Experience Level"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  options={[
                    "",
                    "Fresher",
                    "0 - 1 Years",
                    "1 - 3 Years",
                    "3 - 5 Years",
                    "5+ Years",
                  ]}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Skills
                  </label>

                  <input
                    type="text"
                    value={formData.skills.join(", ")}
                    onChange={handleSkillsChange}
                    placeholder="Java, React, Spring Boot, SQL"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#6D4DE8] focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Separate skills using commas.
                  </p>
                </div>

              </div>
            ) : (
              <div className="space-y-6">

                <InfoRow
                  label="Current Status"
                  value={profile.currentStatus}
                />

                <InfoRow
                  label="Experience Level"
                  value={profile.experienceLevel}
                />

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Skills
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-[#F6F3FF] px-3 py-1.5 text-sm font-semibold text-[#6D4DE8]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">
                        Not added
                      </p>
                    )}

                  </div>
                </div>

              </div>
            )}

          </section>

          {/* ABOUT */}
          <section className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#3182CE]">
                <Code2 size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  About
                </h2>

                <p className="text-sm text-slate-500">
                  A short professional introduction.
                </p>
              </div>

            </div>

            {isEditing ? (
              <>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows={7}
                  maxLength={300}
                  placeholder="Write a short professional introduction..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 leading-7 outline-none transition focus:border-[#6D4DE8] focus:ring-2 focus:ring-purple-100"
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {formData.about.length}/300
                </p>
              </>
            ) : (
              <p className="leading-7 text-slate-600">
                {profile.about || "No introduction added yet."}
              </p>
            )}

          </section>

        </div>

        {/* PROFESSIONAL LINKS */}
        <section className="mt-7 rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950">
              Professional Links
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add your professional profiles and portfolio.
            </p>
          </div>

          {isEditing ? (
            <div className="grid gap-5 md:grid-cols-3">

              <InputField
                label="LinkedIn"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />

              <InputField
                label="GitHub"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />

              <InputField
                label="Portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
              />

            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">

              <LinkCard
                icon={Link2}
                title="LinkedIn"
                value={profile.linkedin}
              />

              <LinkCard
                icon={CodeXml}
                title="GitHub"
                value={profile.github}
              />

              <LinkCard
                icon={Globe2}
                title="Portfolio"
                value={profile.portfolio}
              />

            </div>
          )}

        </section>

      </main>
    </div>
  );
}


// =========================
// SMALL COMPONENTS
// =========================

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 pb-5 last:border-none last:pb-0">

      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value || "Not added"}
      </p>

    </div>
  );
}


function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#6D4DE8] focus:ring-2 focus:ring-purple-100"
      >
        {options.map((option, index) => (
          <option
            key={`${option}-${index}`}
            value={option}
          >
            {option || "Select"}
          </option>
        ))}
      </select>

    </div>
  );
}


function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#6D4DE8] focus:ring-2 focus:ring-purple-100"
      />

    </div>
  );
}


function LinkCard({
  icon: Icon,
  title,
  value,
}) {
  const hasValue =
    value && value.trim() !== "";

  return (
    <div className="rounded-[18px] border border-slate-100 bg-[#FAFAFC] p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EBFF] text-[#6D4DE8]">
        <Icon size={20} />
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      {hasValue ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block truncate text-sm font-semibold text-[#6D4DE8] hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1 text-sm text-slate-400">
          Not added
        </p>
      )}

    </div>
  );
}

export default Profile;
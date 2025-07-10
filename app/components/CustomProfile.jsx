"use client";
import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaIdCard,
  FaCamera,
  FaUpload,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

// Loading skeleton for profile
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-0 w-full h-full">
    <div className="w-full h-full">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full h-full p-0 m-0">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 animate-pulse"></div>
              <div>
                <div className="w-32 h-8 bg-white bg-opacity-20 rounded animate-pulse mb-2"></div>
                <div className="w-48 h-4 bg-white bg-opacity-20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full p-0 m-0">
            <div className="space-y-6">
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Not signed in component
const NotSignedIn = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Signed In</h2>
      <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
      <a
        href="/sign-in"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
      >
        Sign In
      </a>
    </div>
  </div>
);

const CustomProfile = ({ user: ssrUser }) => {
  const { user: clientUser, isLoaded } = useUser();
  const user = clientUser || ssrUser;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  // Initialize edit data when user loads
  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
      });
    }
  }, [user]);

  // Generate initials from first and last name
  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors({ avatar: "Please select a valid image file." });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: "Image size must be less than 5MB." });
      return;
    }

    setIsUploadingAvatar(true);
    setErrors({});

    try {
      await user.setProfileImage({ file });
      console.log("Avatar updated successfully");
    } catch (error) {
      console.error("Error updating avatar:", error);
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        setErrors({ avatar: errorMessage });
      } else {
        setErrors({ avatar: "Failed to update avatar. Please try again." });
      }
    }
    setIsUploadingAvatar(false);
  };

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    setErrors({});

    try {
      await user.setProfileImage({ file: null });
      console.log("Avatar removed successfully");
    } catch (error) {
      console.error("Error removing avatar:", error);
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        setErrors({ avatar: errorMessage });
      } else {
        setErrors({ avatar: "Failed to remove avatar. Please try again." });
      }
    }
    setIsUploadingAvatar(false);
  };

  // Copy User ID to clipboard
  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!editData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!editData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!editData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (editData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(editData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    return newErrors;
  };

  // Handle save
  const handleSave = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      await user.update({
        firstName: editData.firstName,
        lastName: editData.lastName,
        username: editData.username,
      });

      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        setErrors({ submit: errorMessage });
      } else {
        setErrors({ submit: "Failed to update profile. Please try again." });
      }
    }
    setIsSaving(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      {!isLoaded ? (
        <ProfileSkeleton />
      ) : !user ? (
        <NotSignedIn />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-0 w-full h-full">
          <div className="w-full h-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full h-full p-0 m-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    {/* Avatar Section */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center border-4 border-white border-opacity-30">
                        {user.hasImage ? (
                          <img
                            src={user.imageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                        )}
                      </div>
                      {/* Show camera icon only in edit mode */}
                      {isEditing && (
                        <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                          <FaCamera className="text-white text-sm" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={isUploadingAvatar}
                          />
                        </label>
                      )}
                      {/* Show delete icon only in edit mode AND if user has uploaded an image */}
                      {isEditing && user.hasImage && (
                        <button
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                          title="Remove avatar"
                        >
                          <FaTimes className="text-white text-xs" />
                        </button>
                      )}
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold text-white">Profile</h1>
                      <p className="text-blue-100">
                        Manage your account information
                      </p>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {errors.submit && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600 flex items-center">
                      <FaTimes className="mr-2" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                {errors.avatar && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600 flex items-center">
                      <FaTimes className="mr-2" />
                      {errors.avatar}
                    </p>
                  </div>
                )}

                {/* Avatar Upload Status */}
                {isUploadingAvatar && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-600 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Updating avatar...
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full p-0 m-0">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FaIdCard className="mr-2 text-blue-600" />
                      Personal Information
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="firstName"
                            value={editData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.firstName
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            placeholder="Enter your first name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {user.firstName || "Not set"}
                          </div>
                        )}
                        {errors.firstName && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <FaTimes className="mr-1" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="lastName"
                            value={editData.lastName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.lastName
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            placeholder="Enter your last name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {user.lastName || "Not set"}
                          </div>
                        )}
                        {errors.lastName && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <FaTimes className="mr-1" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Username
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="username"
                            value={editData.username}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.username
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            placeholder="Enter your username"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {user.username || "Not set"}
                          </div>
                        )}
                        {errors.username && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <FaTimes className="mr-1" />
                            {errors.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FaEnvelope className="mr-2 text-blue-600" />
                      Account Information
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                          {user.primaryEmailAddress?.emailAddress || "Not set"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          User ID
                        </label>
                        <div className="relative flex items-center w-full rounded-xl bg-white/10 border border-white/40 shadow-xl backdrop-blur-xl">
                          <input
                            type="text"
                            value={user.id}
                            disabled
                            readOnly
                            style={{
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              borderRadius: "1rem",
                              color: "#111",
                              padding: "0.75rem 1rem",
                              width: "100%",
                              fontFamily: "monospace",
                              paddingRight: "46px",
                              fontSize: "0.875rem",
                              cursor: "not-allowed",
                            }}
                            className="select-all pr-12 focus:outline-none bg-gray-50/30 blur-[1px]"
                          />

                          <button
                            type="button"
                            onClick={handleCopyUserId}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 bg-white/40 rounded-full backdrop-blur-md border border-white/30 shadow"
                            tabIndex={0}
                            title={copied ? "Copied!" : "Copy User ID"}
                          >
                            {copied ? (
                              <FaCheck className="text-green-600" />
                            ) : (
                              <FaCopy />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Member Since
                        </label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center">
                          <FaCalendar className="mr-2 text-blue-600" />
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                }
                              )
                            : "Unknown"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Verified
                        </label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.primaryEmailAddress?.verification?.status ===
                              "verified"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.primaryEmailAddress?.verification?.status ===
                            "verified"
                              ? "Verified"
                              : "Not Verified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="mt-8 flex space-x-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
};

export default CustomProfile;

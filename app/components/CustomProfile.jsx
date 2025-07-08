"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaIdCard,
} from "react-icons/fa";

const CustomProfile = () => {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [errors, setErrors] = useState({});

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Not Signed In
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your profile.
          </p>
          <a
            href="/sign-in"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-2xl" />
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

            <div className="grid md:grid-cols-2 gap-8">
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
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-mono text-sm">
                      {user.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center">
                      <FaCalendar className="mr-2 text-blue-600" />
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
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
  );
};

export default CustomProfile;

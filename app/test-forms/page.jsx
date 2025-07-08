"use client";
import { useState } from "react";
import CustomForm from "../components/CustomForm";
import CustomSignInForm from "../components/CustomSignInForm";
import CustomPasswordResetForm from "../components/CustomPasswordResetForm";

const TestFormsPage = () => {
  const [activeForm, setActiveForm] = useState("signup");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                ClerkIntegration Forms Demo
              </h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveForm("signup")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeForm === "signup"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setActiveForm("signin")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeForm === "signin"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveForm("reset")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeForm === "reset"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Display */}
      <div className="py-8">
        {activeForm === "signup" && <CustomForm />}
        {activeForm === "signin" && <CustomSignInForm />}
        {activeForm === "reset" && <CustomPasswordResetForm />}
      </div>
    </div>
  );
};

export default TestFormsPage;

"use client";
import { useState } from "react";
import CustomForm from "../components/CustomForm";
import CustomSignInForm from "../components/CustomSignInForm";

const TestSignupPage = () => {
  const [activeForm, setActiveForm] = useState("signup");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                ClerkIntegration Demo
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
            </div>
          </div>
        </div>
      </div>

      {/* Form Display */}
      <div className="py-8">
        {activeForm === "signup" ? <CustomForm /> : <CustomSignInForm />}
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Custom Clerk Forms Demo
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Features Implemented:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Custom styled sign-up and sign-in forms
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Password strength indicator
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Email verification flow
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Form validation with error handling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Modern UI with Tailwind CSS
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Responsive design
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                How to Test:
              </h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    1
                  </span>
                  Click "Sign Up" to test the registration form
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    2
                  </span>
                  Fill in the form and test password strength
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    3
                  </span>
                  Complete email verification
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    4
                  </span>
                  Click "Sign In" to test the login form
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    5
                  </span>
                  Sign in with your created account
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSignupPage;

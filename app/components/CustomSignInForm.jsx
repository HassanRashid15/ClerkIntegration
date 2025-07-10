"use client";
import { useState } from "react";
import { useSignIn, useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

const CustomSignInForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    if (!isLoaded) return;
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      try {
        const result = await signIn.create({
          identifier: formData.email,
          password: formData.password,
        });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/dashboard");
        } else {
          setErrors({
            submit: "Sign in failed. Please check your credentials.",
          });
        }
      } catch (error) {
        setErrors({ submit: "Invalid email or password" });
      }
    }
    setIsSubmitting(false);
  };

  if (user) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600 text-sm">Sign in to your ClerkIntegration account</p>
        </div>
        {/* Clerk Social Sign In Buttons */}
        <div className="space-y-3 mb-6">
          <SignInButton provider="google" redirectUrl="/dashboard" afterSignInUrl="/dashboard">
            <button className="flex items-center justify-center w-full border-2 border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700">
              Continue with Google
            </button>
          </SignInButton>
          <SignInButton provider="github" redirectUrl="/dashboard" afterSignInUrl="/dashboard">
            <button className="flex items-center justify-center w-full border-2 border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700">
              Continue with GitHub
            </button>
          </SignInButton>
        </div>
        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-4 text-gray-400 text-sm font-medium">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
              autoComplete="email"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaTimes className="mr-1" />
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${errors.password ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaTimes className="mr-1" />
                {errors.password}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">Forgot password?</a>
          </div>
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600 flex items-center">
                <FaTimes className="mr-2" />
                {errors.submit}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <a href="/sign-up" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default CustomSignInForm;

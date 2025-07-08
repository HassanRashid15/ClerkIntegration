"use client";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaCheck,
  FaArrowLeft,
} from "react-icons/fa";

const CustomPasswordResetForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState("email"); // email, code, password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
      feedback.push("At least 8 characters");
    }
    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push("Contains lowercase letter");
    }
    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push("Contains uppercase letter");
    }
    if (/[0-9]/.test(password)) {
      score += 1;
      feedback.push("Contains number");
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
      feedback.push("Contains special character");
    }

    return { score, feedback };
  };

  // Validate email
  const validateEmail = () => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email is invalid";
    }
    return null;
  };

  // Validate code
  const validateCode = () => {
    if (!code.trim()) {
      return "Verification code is required";
    }
    if (code.length !== 6) {
      return "Verification code must be 6 digits";
    }
    return null;
  };

  // Validate password
  const validatePassword = () => {
    if (!newPassword) {
      return "Password is required";
    }
    if (newPassword.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (passwordStrength.score < 3) {
      return "Password is too weak";
    }
    if (newPassword !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const emailError = validateEmail();
    if (emailError) {
      setErrors({ email: emailError });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Creating password reset...");
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      console.log("Password reset email sent");
      setStep("code");
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        setErrors({ email: errorMessage });
      } else {
        setErrors({ email: "Failed to send reset email. Please try again." });
      }
    }
    setIsSubmitting(false);
  };

  // Handle code verification
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const codeError = validateCode();
    if (codeError) {
      setErrors({ code: codeError });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Attempting code verification...");
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      console.log("Code verification result:", result);
      if (result.status === "needs_new_password") {
        setStep("password");
      } else {
        setErrors({ code: "Invalid verification code" });
      }
    } catch (error) {
      console.error("Code verification error:", error);
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        setErrors({ code: errorMessage });
      } else {
        setErrors({ code: "Invalid verification code" });
      }
    }
    setIsSubmitting(false);
  };

  // Handle password reset
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const passwordError = validatePassword();
    if (passwordError) {
      setErrors({ password: passwordError });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Attempting password reset...");
      // Use the correct method for password reset
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      console.log("Password reset result:", result);
      if (result.status === "complete") {
        console.log("Password reset complete, setting active session...");
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setErrors({ password: "Failed to reset password. Please try again." });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      console.error("Error details:", {
        status: error.status,
        errors: error.errors,
        message: error.message,
        code: error.code,
      });

      // Handle specific error cases
      if (error.errors && error.errors.length > 0) {
        const errorObj = error.errors[0];
        console.error("First error object:", errorObj);

        if (errorObj.code === "form_identifier_not_found") {
          setErrors({ password: "Invalid reset session. Please start over." });
        } else if (errorObj.code === "form_password_pwned") {
          setErrors({
            password:
              "This password has been compromised. Please choose a different password.",
          });
        } else if (errorObj.code === "form_password_too_short") {
          setErrors({
            password:
              "Password is too short. Please use at least 8 characters.",
          });
        } else if (errorObj.code === "form_password_too_weak") {
          setErrors({
            password:
              "Password is too weak. Please choose a stronger password.",
          });
        } else {
          setErrors({
            password:
              errorObj.message || "Failed to reset password. Please try again.",
          });
        }
      } else if (error.message) {
        setErrors({ password: error.message });
      } else {
        setErrors({ password: "Failed to reset password. Please try again." });
      }
    }
    setIsSubmitting(false);
  };

  // Resend verification code
  const resendCode = async () => {
    setIsResending(true);
    try {
      console.log("Resending verification code...");
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      console.log("New verification code sent");
      setErrors({});
      setCode("");
      startCountdown(60); // 1 minute countdown
    } catch (error) {
      console.error("Resend error:", error);
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        setErrors({ code: `Failed to resend: ${errorMessage}` });
      } else {
        setErrors({ code: "Failed to resend verification code" });
      }
    }
    setIsResending(false);
  };

  // Start countdown timer
  const startCountdown = (seconds = 60) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format countdown time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordStrength(checkPasswordStrength(value));

    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (step === "code") {
      setStep("email");
      setCode("");
      setErrors({});
    } else if (step === "password") {
      setStep("code");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600 text-sm">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "code" &&
              "Enter the verification code sent to your email"}
            {step === "password" && "Create your new password"}
          </p>
        </div>

        {/* Back button */}
        {step !== "email" && (
          <button
            onClick={goBack}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        )}

        {/* Email Step */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FaTimes className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending reset code...
                </div>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        )}

        {/* Code Step */}
        {step === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.code
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              {errors.code && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FaTimes className="mr-1" />
                  {errors.code}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying code...
                </div>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={resendCode}
                disabled={isResending || countdown > 0}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${formatTime(countdown)}`
                  : "Didn't receive the code? Resend"}
              </button>
            </div>
          </form>
        )}

        {/* Password Step */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="Create a new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 w-8 rounded-full ${
                            level <= passwordStrength.score
                              ? passwordStrength.score >= 4
                                ? "bg-green-500"
                                : passwordStrength.score >= 3
                                ? "bg-yellow-500"
                                : "bg-red-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {passwordStrength.score >= 4
                        ? "Strong"
                        : passwordStrength.score >= 3
                        ? "Good"
                        : "Weak"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <FaCheck className="mr-2 text-green-500" size={12} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaTimes className="mr-1" />
                {errors.password}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{" "}
          <a
            href="/sign-in"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default CustomPasswordResetForm;

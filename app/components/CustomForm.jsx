"use client";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { useClerk } from "@clerk/nextjs";

const CustomForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { signOut } = useClerk();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [loadingStep, setLoadingStep] = useState(""); // Track current loading step
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

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Username validation (optional)
    if (formData.username.trim() && formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (passwordStrength.score < 3) {
      newErrors.password = "Password is too weak";
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

    // Update password strength when password changes
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Clear errors when user starts typing
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
      let startTime; // <-- define here
      try {
        startTime = performance.now(); // <-- set here
        console.log("=== Sign Up Performance Debug ===");
        console.log("Email:", formData.email);
        console.log("First Name:", formData.firstName);
        console.log("Last Name:", formData.lastName);
        console.log("Username:", formData.username);

        console.log("🔄 Creating sign up...");
        setLoadingStep("Creating your account...");
        const signUpStart = performance.now();
        await signUp.create({
          email_address: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
        });
        const signUpEnd = performance.now();
        console.log(
          `✅ Sign up created successfully (${(signUpEnd - signUpStart).toFixed(
            2
          )}ms)`
        );
        console.log("SignUp status:", signUp.status);
        console.log("SignUp email:", signUp.emailAddress);

        // Send the email verification
        console.log("📨 Preparing email verification...");
        setLoadingStep("Sending verification email...");
        const verificationStart = performance.now();
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        const verificationEnd = performance.now();
        console.log(
          `✅ Email verification prepared successfully (${(
            verificationEnd - verificationStart
          ).toFixed(2)}ms)`
        );

        const totalTime = performance.now() - startTime;
        console.log(`🎉 Total signup time: ${totalTime.toFixed(2)}ms`);

        // Change the UI to our pending section
        setPendingVerification(true);
        setLoadingStep("");
      } catch (error) {
        const totalTime = startTime ? performance.now() - startTime : 0;
        console.error("=== Sign Up Error Details ===");
        console.error(`❌ Sign up failed after ${totalTime.toFixed(2)}ms`);
        console.error("Error type:", typeof error);
        console.error("Error message:", error.message);
        console.error("Error status:", error.status);
        console.error("Full error object:", JSON.stringify(error, null, 2));

        // Handle rate limiting specifically
        if (error.status === 429) {
          setErrors({
            submit:
              "Too many requests. Please wait for the timer to complete before trying again.",
          });
          setIsRateLimited(true);
          startCountdown(300); // Start 5-minute countdown
        } else if (error.errors && error.errors.length > 0) {
          const errorMessage = error.errors[0].message;
          console.error("First error:", error.errors[0]);
          setErrors({ submit: errorMessage });
        } else {
          setErrors({
            submit:
              "An error occurred during sign up. Please check your Clerk configuration.",
          });
        }
      }
    }
    setIsSubmitting(false);
  };

  // Verify User Email Code
  const onPressVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      console.log("=== Email Verification Debug ===");
      console.log("Code length:", code.length);
      console.log("Code:", code);
      console.log("SignUp status:", signUp.status);
      console.log("SignUp email:", signUp.emailAddress);

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("Verification result:", completeSignUp);

      if (completeSignUp.status !== "complete") {
        // Investigate the response, to see if there was an error
        // or if the user needs to complete more steps.
        console.log(
          "Verification incomplete. Full response:",
          JSON.stringify(completeSignUp, null, 2)
        );
        setErrors({ verification: "Invalid verification code" });
        return; // Add return to prevent further execution
      }

      if (completeSignUp.status === "complete") {
        console.log("Verification complete - redirecting to sign-in...");
        setVerificationSuccess(true);

        // Clear any session that might have been created during verification
        try {
          console.log("Clearing any session created during verification...");
          await signUp.destroy();
          await signOut(); // <-- Ensure session is fully cleared
          console.log("Session cleared successfully");
        } catch (clearError) {
          console.log("No session to clear or error clearing:", clearError);
        }

        // Wait a bit to ensure session is cleared before redirecting and reloading
        setTimeout(() => {
          router.push("/sign-in");
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }, 500);
      }
    } catch (err) {
      console.error("=== Verification Error Details ===");
      console.error("Error type:", typeof err);
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      console.error("Error status:", err.status);
      console.error("Full error object:", JSON.stringify(err, null, 2));

      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0];
        console.error("First error:", error);
        if (error.code === "verification_expired") {
          setErrors({
            verification:
              "Verification code has expired. Please request a new one.",
          });
        } else if (error.code === "verification_failed") {
          setErrors({
            verification:
              "Invalid verification code. Please check and try again.",
          });
        } else {
          setErrors({ verification: error.message });
        }
      } else if (err.message && err.message.includes("already verified")) {
        // If already verified, clear any session and redirect to sign-in
        console.log(
          "User already verified, clearing session and redirecting to sign-in..."
        );
        try {
          console.log("Clearing any session created during verification...");
          await signUp.destroy();
          console.log("Session cleared successfully");
        } catch (clearError) {
          console.log("No session to clear or error clearing:", clearError);
        }
        router.push("/sign-in");
      } else {
        setErrors({
          verification: "Verification failed. Please try again.",
        });
      }
    }
  };

  // Resend verification code
  const resendCode = async () => {
    try {
      console.log("Resending verification code...");
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      console.log("New verification code sent");
      setErrors({});
      setCode(""); // Clear the old code
      startCountdown(60); // Start 1-minute countdown
    } catch (error) {
      console.error("Resend error:", error);
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        setErrors({ verification: `Failed to resend: ${errorMessage}` });
      } else {
        setErrors({ verification: "Failed to resend verification code" });
      }
    }
  };

  // Start countdown timer
  const startCountdown = (seconds = 300) => {
    // 5 minutes default
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRateLimited(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600 text-sm">
            Join ClerkIntegration to get started
          </p>
        </div>

        {!pendingVerification ? (
          <>
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    autoComplete="given-name"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    autoComplete="family-name"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  autoComplete="email"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
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
                {formData.password && (
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

                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.username
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  autoComplete="username"
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600 flex items-center">
                    <FaTimes className="mr-2" />
                    {errors.submit}
                  </p>
                  {isRateLimited && (
                    <div className="mt-3">
                      {countdown > 0 ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-600">
                              Time remaining:{" "}
                              <span className="font-mono font-semibold text-blue-600">
                                {formatTime(countdown)}
                              </span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setErrors({});
                            setIsRateLimited(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  )}
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
                    {loadingStep || "Creating account..."}
                  </div>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <a
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
              >
                Sign in
              </a>
            </p>
          </>
        ) : (
          <form onSubmit={onPressVerify} className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verify your email
              </h3>
              <p className="text-gray-600 text-sm">
                We've sent a verification code to{" "}
                <span className="font-semibold">{formData.email}</span>
              </p>
              {verificationSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center justify-center">
                    <span className="mr-2">✅</span>
                    Email verified! Redirecting to sign-in...
                  </p>
                </div>
              )}
            </div>

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
                  errors.verification
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              {errors.verification && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FaTimes className="mr-1" />
                  {errors.verification}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition-colors duration-200"
            >
              Verify Email
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={resendCode}
                disabled={countdown > 0}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0
                  ? `Resend in ${formatTime(countdown)}`
                  : "Didn't receive the code? Resend"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomForm;

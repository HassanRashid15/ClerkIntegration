"use client";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const TestFormsPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState({});

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startTime = performance.now();
    addLog("=== Starting Sign Up Process ===", "header");
    setErrors({});

    if (!isLoaded) {
      addLog("❌ Clerk not loaded", "error");
      return;
    }

    try {
      addLog(`📧 Email: ${formData.email}`);
      addLog(`👤 Name: ${formData.firstName} ${formData.lastName}`);

      addLog("🔄 Creating sign up...");
      const signUpStart = performance.now();
      await signUp.create({
        email_address: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      const signUpEnd = performance.now();
      addLog(
        `✅ Sign up created successfully (${(signUpEnd - signUpStart).toFixed(
          2
        )}ms)`,
        "success"
      );

      addLog(`📊 SignUp status: ${signUp.status}`);
      addLog(`📧 SignUp email: ${signUp.emailAddress}`);

      addLog("📨 Preparing email verification...");
      const verificationStart = performance.now();
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      const verificationEnd = performance.now();
      addLog(
        `✅ Email verification prepared successfully (${(
          verificationEnd - verificationStart
        ).toFixed(2)}ms)`,
        "success"
      );

      const totalTime = performance.now() - startTime;
      addLog(`🎉 Total signup time: ${totalTime.toFixed(2)}ms`, "success");

      setPendingVerification(true);
      addLog("🎉 Ready for verification code input", "success");
    } catch (error) {
      const totalTime = performance.now() - startTime;
      addLog(`❌ Sign up failed after ${totalTime.toFixed(2)}ms`, "error");
      addLog(`Error type: ${typeof error}`, "error");
      addLog(`Error message: ${error.message}`, "error");
      addLog(`Error status: ${error.status}`, "error");

      if (error.errors && error.errors.length > 0) {
        error.errors.forEach((err, index) => {
          addLog(`Error ${index + 1}: ${err.message} (${err.code})`, "error");
        });
      }

      setErrors({ submit: error.message || "Sign up failed" });
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    addLog("=== Starting Verification Process ===", "header");
    setErrors({});

    if (!isLoaded) {
      addLog("❌ Clerk not loaded", "error");
      return;
    }

    try {
      addLog(`🔢 Code length: ${code.length}`);
      addLog(`🔢 Code: ${code}`);
      addLog(`📊 SignUp status: ${signUp.status}`);
      addLog(`📧 SignUp email: ${signUp.emailAddress}`);

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      addLog("✅ Verification attempt completed");
      addLog(`📊 Verification status: ${completeSignUp.status}`);

      if (completeSignUp.status !== "complete") {
        addLog("⚠️ Verification incomplete", "warning");
        addLog(
          `Full response: ${JSON.stringify(completeSignUp, null, 2)}`,
          "warning"
        );
        setErrors({ verification: "Invalid verification code" });
        return;
      }

      if (completeSignUp.status === "complete") {
        addLog("✅ Verification complete", "success");

        // Clear any session that might have been created during verification
        try {
          addLog(
            "🧹 Clearing any session created during verification...",
            "info"
          );
          await signUp.destroy();
          addLog("✅ Session cleared successfully", "success");
        } catch (clearError) {
          addLog("ℹ️ No session to clear or error clearing", "info");
        }

        addLog("🔄 Redirecting to sign-in...", "info");
        addLog("🚀 Redirecting to sign-in page...", "success");
        router.push("/sign-in");
      }
    } catch (err) {
      addLog("❌ Verification failed", "error");
      addLog(`Error type: ${typeof err}`, "error");
      addLog(`Error message: ${err.message}`, "error");
      addLog(`Error code: ${err.code}`, "error");
      addLog(`Error status: ${err.status}`, "error");

      if (err.errors && err.errors.length > 0) {
        err.errors.forEach((error, index) => {
          addLog(
            `Error ${index + 1}: ${error.message} (${error.code})`,
            "error"
          );
        });
      }

      if (err.message && err.message.includes("already verified")) {
        addLog("ℹ️ User already verified, redirecting to sign-in...", "info");
        router.push("/sign-in");
      } else {
        setErrors({
          verification: "Verification failed. Please try again.",
        });
      }
    }
  };

  const resendCode = async () => {
    addLog("📨 Resending verification code...");
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      addLog("✅ New verification code sent", "success");
      setErrors({});
      setCode("");
    } catch (error) {
      addLog(`❌ Resend failed: ${error.message}`, "error");
      setErrors({ verification: `Failed to resend: ${error.message}` });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Email Verification Test
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Test Form
              </h2>

              {!pendingVerification ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Create Account
                  </button>
                  {errors.submit && (
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  )}
                </form>
              ) : (
                <form onSubmit={handleVerification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Verify Email
                  </button>
                  <button
                    type="button"
                    onClick={resendCode}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                  >
                    Resend Code
                  </button>
                  {errors.verification && (
                    <p className="text-red-600 text-sm">
                      {errors.verification}
                    </p>
                  )}
                </form>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Debug Logs
                </h2>
                <button
                  onClick={clearLogs}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                >
                  Clear Logs
                </button>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500">
                    No logs yet. Start the signup process to see debug
                    information.
                  </p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`mb-1 ${
                        log.type === "error"
                          ? "text-red-400"
                          : log.type === "success"
                          ? "text-green-400"
                          : log.type === "warning"
                          ? "text-yellow-400"
                          : log.type === "header"
                          ? "text-blue-400 font-bold"
                          : "text-gray-300"
                      }`}
                    >
                      [{log.timestamp}] {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFormsPage;

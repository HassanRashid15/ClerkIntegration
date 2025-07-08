"use client";
import { useState } from "react";

const DebugPage = () => {
  const [apiTestResult, setApiTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const testClerkAPI = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/test-clerk");
      const data = await response.json();
      setApiTestResult(data);
    } catch (error) {
      setApiTestResult({
        status: "error",
        message: "Failed to test API",
        error: error.message,
      });
    }
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Clerk Integration Debug
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Environment Variables
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">
                    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
                  </span>
                  <span className="text-gray-600">
                    {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
                      ? "✅ Set"
                      : "❌ Missing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CLERK_SECRET_KEY:</span>
                  <span className="text-gray-600">
                    {process.env.CLERK_SECRET_KEY ? "✅ Set" : "❌ Missing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">
                    NEXT_PUBLIC_CLERK_SIGN_UP_URL:
                  </span>
                  <span className="text-gray-600">
                    {process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">
                    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
                  </span>
                  <span className="text-gray-600">
                    {process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ||
                      "Not set"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Test Links
              </h2>
              <div className="space-y-3">
                <a
                  href="/test-signup"
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Test Custom Sign Up Form
                </a>
                <a
                  href="/register"
                  className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Test Working Register Page
                </a>
                <a
                  href="/sign-up"
                  className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Test Sign Up Route
                </a>
                <button
                  onClick={testClerkAPI}
                  disabled={isTesting}
                  className="block w-full bg-orange-600 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isTesting ? "Testing..." : "Test Clerk API"}
                </button>
              </div>
            </div>
          </div>

          {apiTestResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                API Test Result:
              </h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(apiTestResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Troubleshooting
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                If verification is failing:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  Check that your Clerk environment variables are properly set
                </li>
                <li>
                  Ensure your Clerk application is configured for email
                  verification
                </li>
                <li>Check the browser console for detailed error messages</li>
                <li>
                  Verify that your Clerk application is in the correct
                  environment (development/production)
                </li>
                <li>
                  Make sure your Clerk application has email verification
                  enabled in the dashboard
                </li>
                <li>
                  Check that the email templates are properly configured in
                  Clerk
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Common Issues:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <strong>Invalid verification code:</strong> The code might be
                  expired or incorrect
                </li>
                <li>
                  <strong>Already verified:</strong> The user might have already
                  completed verification
                </li>
                <li>
                  <strong>Rate limiting:</strong> Too many verification attempts
                </li>
                <li>
                  <strong>Session issues:</strong> Problems with setting the
                  active session
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Required Environment Variables:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li>
                <li>CLERK_SECRET_KEY</li>
                <li>NEXT_PUBLIC_CLERK_SIGN_IN_URL (optional)</li>
                <li>NEXT_PUBLIC_CLERK_SIGN_UP_URL (optional)</li>
                <li>NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL (optional)</li>
                <li>NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL (optional)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;

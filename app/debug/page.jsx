"use client";
import { useState } from "react";

const DebugPage = () => {
  const [apiTestResult, setApiTestResult] = useState(null);
  const [oauthStatus, setOauthStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isCheckingOAuth, setIsCheckingOAuth] = useState(false);

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

  const checkOAuthStatus = async () => {
    setIsCheckingOAuth(true);
    try {
      const response = await fetch("/api/oauth-status");
      const data = await response.json();
      setOauthStatus(data);
    } catch (error) {
      setOauthStatus({
        status: "error",
        message: "Failed to check OAuth status",
        error: error.message,
      });
    }
    setIsCheckingOAuth(false);
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
                <button
                  onClick={checkOAuthStatus}
                  disabled={isCheckingOAuth}
                  className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 mt-3"
                >
                  {isCheckingOAuth ? "Checking..." : "Check OAuth Status"}
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

          {oauthStatus && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                OAuth Status:
              </h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(oauthStatus, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            OAuth Setup Guide
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Google OAuth Setup:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>
                  Go to your Clerk Dashboard → User & Authentication → Social
                  Connections
                </li>
                <li>Enable Google provider</li>
                <li>
                  Create a Google OAuth 2.0 Client ID in Google Cloud Console
                </li>
                <li>Add your domain to authorized origins</li>
                <li>Copy Client ID and Client Secret to Clerk</li>
                <li>
                  Set redirect URL:{" "}
                  <code>
                    https://your-domain.clerk.accounts.dev/oauth/callback
                  </code>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                GitHub OAuth Setup:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>
                  Go to your Clerk Dashboard → User & Authentication → Social
                  Connections
                </li>
                <li>Enable GitHub provider</li>
                <li>Create a GitHub OAuth App in GitHub Settings</li>
                <li>
                  Set Authorization callback URL:{" "}
                  <code>
                    https://your-domain.clerk.accounts.dev/oauth/callback
                  </code>
                </li>
                <li>Copy Client ID and Client Secret to Clerk</li>
                <li>Configure required scopes (email, profile)</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Environment Variables for OAuth:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Google OAuth credentials are managed in Clerk Dashboard</li>
                <li>GitHub OAuth credentials are managed in Clerk Dashboard</li>
                <li>No additional environment variables needed</li>
                <li>Ensure your domain is properly configured in Clerk</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Google OAuth Troubleshooting
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Step-by-Step Google OAuth Setup:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>
                  <strong>1. Clerk Dashboard Setup:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Go to your Clerk Dashboard</li>
                    <li>
                      Navigate to User & Authentication → Social Connections
                    </li>
                    <li>Find Google in the list and click "Enable"</li>
                    <li>
                      Note your Clerk domain (e.g.,
                      skilled-shark-60.clerk.accounts.dev)
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>2. Google Cloud Console Setup:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>
                      Go to{" "}
                      <a
                        href="https://console.cloud.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google Cloud Console
                      </a>
                    </li>
                    <li>Create a new project or select existing one</li>
                    <li>Go to APIs & Services → Credentials</li>
                    <li>Click "Create Credentials" → "OAuth 2.0 Client IDs"</li>
                    <li>Choose "Web application" as application type</li>
                    <li>
                      Add authorized origins:{" "}
                      <code>https://your-clerk-domain.clerk.accounts.dev</code>
                    </li>
                    <li>
                      Add authorized redirect URIs:{" "}
                      <code>
                        https://your-clerk-domain.clerk.accounts.dev/oauth/callback
                      </code>
                    </li>
                    <li>Copy the Client ID and Client Secret</li>
                  </ul>
                </li>
                <li>
                  <strong>3. Configure Clerk with Google Credentials:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>
                      Go back to Clerk Dashboard → Social Connections → Google
                    </li>
                    <li>Paste your Google Client ID and Client Secret</li>
                    <li>Save the configuration</li>
                  </ul>
                </li>
                <li>
                  <strong>4. Test the Integration:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Go to your sign-in page</li>
                    <li>Click "Continue with Google"</li>
                    <li>Check browser console for any errors</li>
                    <li>Use the "Check OAuth Status" button above</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Common Google OAuth Issues:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <strong>"Invalid redirect URI":</strong> Make sure the
                  redirect URI in Google Cloud Console matches exactly:{" "}
                  <code>
                    https://your-clerk-domain.clerk.accounts.dev/oauth/callback
                  </code>
                </li>
                <li>
                  <strong>"Unauthorized domain":</strong> Add your Clerk domain
                  to authorized origins in Google Cloud Console
                </li>
                <li>
                  <strong>"Client ID not found":</strong> Verify the Client ID
                  is correctly copied to Clerk Dashboard
                </li>
                <li>
                  <strong>"Strategy not available":</strong> Google OAuth is not
                  enabled in Clerk Dashboard
                </li>
                <li>
                  <strong>"Invalid credentials":</strong> Check that both Client
                  ID and Client Secret are correct
                </li>
                <li>
                  <strong>"OAuth consent screen not configured":</strong> Set up
                  OAuth consent screen in Google Cloud Console
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Debugging Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>
                  Click "Check OAuth Status" button above to see current
                  configuration
                </li>
                <li>
                  Open browser developer tools (F12) and go to Console tab
                </li>
                <li>
                  Click "Continue with Google" button and watch for error
                  messages
                </li>
                <li>
                  Check the Network tab for failed requests to Google OAuth
                  endpoints
                </li>
                <li>Verify your Clerk domain in the environment variables</li>
                <li>Test with a different browser or incognito mode</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Required Environment Variables:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> - Your Clerk
                  publishable key
                </li>
                <li>
                  <code>CLERK_SECRET_KEY</code> - Your Clerk secret key
                </li>
                <li>
                  Google OAuth credentials are managed in Clerk Dashboard, not
                  environment variables
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Troubleshooting
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Email Verification Issues:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <strong>Environment Variables:</strong> Check that your Clerk
                  environment variables are properly set
                </li>
                <li>
                  <strong>Clerk Dashboard Configuration:</strong> Ensure your
                  Clerk application is configured for email verification
                </li>
                <li>
                  <strong>Email Templates:</strong> Check that the email
                  templates are properly configured in Clerk dashboard
                </li>
                <li>
                  <strong>Environment:</strong> Verify that your Clerk
                  application is in the correct environment
                  (development/production)
                </li>
                <li>
                  <strong>Email Verification Settings:</strong> Make sure email
                  verification is enabled in your Clerk application settings
                </li>
                <li>
                  <strong>Domain Configuration:</strong> Ensure your domain is
                  properly configured in Clerk for sending emails
                </li>
                <li>
                  <strong>Rate Limiting:</strong> Check if you've hit rate
                  limits for verification attempts
                </li>
                <li>
                  <strong>Browser Console:</strong> Check the browser console
                  for detailed error messages
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Common Verification Errors:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <strong>"Invalid verification code":</strong> The code might
                  be expired, incorrect, or already used
                </li>
                <li>
                  <strong>"Verification expired":</strong> The verification code
                  has expired (usually after 10 minutes)
                </li>
                <li>
                  <strong>"Already verified":</strong> The user might have
                  already completed verification
                </li>
                <li>
                  <strong>"Rate limiting":</strong> Too many verification
                  attempts in a short time
                </li>
                <li>
                  <strong>"Session issues":</strong> Problems with setting the
                  active session after verification
                </li>
                <li>
                  <strong>"Email not found":</strong> The email address doesn't
                  match the one used during signup
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Debugging Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Open browser developer tools (F12)</li>
                <li>Go to the Console tab</li>
                <li>Try the verification process</li>
                <li>Look for error messages in the console</li>
                <li>Check the Network tab for failed API calls</li>
                <li>Verify environment variables are loaded correctly</li>
                <li>Test with a different email address</li>
                <li>Check if emails are being received in spam folder</li>
              </ol>
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

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Clerk Dashboard Checklist:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  Email verification is enabled in User & Authentication
                  settings
                </li>
                <li>Email templates are configured and tested</li>
                <li>Domain is verified for sending emails</li>
                <li>Application is in the correct environment (dev/prod)</li>
                <li>API keys are from the correct environment</li>
                <li>Rate limiting settings are appropriate</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Session Debugging
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                "Session already exists" Error:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <strong>Cause:</strong> A session was created during
                  verification but not properly cleared
                </li>
                <li>
                  <strong>Solution:</strong> The sign-in form now automatically
                  clears existing sessions
                </li>
                <li>
                  <strong>Manual Fix:</strong> Clear browser cookies and local
                  storage
                </li>
                <li>
                  <strong>Debug Steps:</strong> Check browser console for
                  session clearing logs
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Session Flow:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>
                  <strong>Signup:</strong> User creates account (no session)
                </li>
                <li>
                  <strong>Verification:</strong> Email verified and user
                  redirected to sign-in
                </li>
                <li>
                  <strong>Sign-in:</strong> User logs in manually with
                  credentials
                </li>
                <li>
                  <strong>Dashboard:</strong> User logged in and redirected to
                  dashboard
                </li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Troubleshooting Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Open browser developer tools (F12)</li>
                <li>Go to Application tab → Storage</li>
                <li>Clear all site data (cookies, local storage)</li>
                <li>Refresh the page</li>
                <li>Try the signup/verification/login flow again</li>
                <li>Check console for session clearing logs</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Expected Console Logs:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <code>Verification complete - redirecting to sign-in...</code>
                </li>
                <li>
                  <code>Redirecting to sign-in page...</code>
                </li>
                <li>
                  <code>User already verified, redirecting to sign-in...</code>
                </li>
                <li>
                  <code>Sign-in successful, redirecting to dashboard...</code>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Performance Issues
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Why User Creation Takes Too Long:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <strong>Network Latency:</strong> Slow internet connection or
                  high latency to Clerk servers
                </li>
                <li>
                  <strong>Clerk Server Response:</strong> Clerk's servers might
                  be experiencing high load
                </li>
                <li>
                  <strong>Email Verification:</strong> Sending verification
                  emails can take 2-5 seconds
                </li>
                <li>
                  <strong>DNS Resolution:</strong> Slow DNS resolution for Clerk
                  API endpoints
                </li>
                <li>
                  <strong>Browser Performance:</strong> Heavy browser extensions
                  or slow device
                </li>
                <li>
                  <strong>Development Environment:</strong> Hot reloading and
                  development tools can slow down requests
                </li>
                <li>
                  <strong>Rate Limiting:</strong> Too many requests causing
                  delays
                </li>
                <li>
                  <strong>Environment Variables:</strong> Missing or incorrect
                  Clerk configuration
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Performance Optimization Tips:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <strong>Use Production Environment:</strong> Development mode
                  can be slower
                </li>
                <li>
                  <strong>Check Network:</strong> Test with different internet
                  connections
                </li>
                <li>
                  <strong>Monitor Console:</strong> Check browser console for
                  timing information
                </li>
                <li>
                  <strong>Disable Extensions:</strong> Try in incognito mode to
                  rule out extensions
                </li>
                <li>
                  <strong>Update Dependencies:</strong> Ensure you're using the
                  latest Clerk SDK
                </li>
                <li>
                  <strong>Check Clerk Status:</strong> Verify Clerk services are
                  running normally
                </li>
                <li>
                  <strong>Optimize Form Validation:</strong> Reduce client-side
                  validation overhead
                </li>
                <li>
                  <strong>Use CDN:</strong> Ensure you're using the closest
                  Clerk CDN endpoint
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Expected Performance:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  <strong>User Creation:</strong> 1-3 seconds (normal), 5+
                  seconds (slow)
                </li>
                <li>
                  <strong>Email Verification:</strong> 2-5 seconds (normal), 10+
                  seconds (slow)
                </li>
                <li>
                  <strong>Session Creation:</strong> 500ms-1s (normal), 3+
                  seconds (slow)
                </li>
                <li>
                  <strong>Form Validation:</strong> &lt;100ms (normal), 500ms+
                  (slow)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Debugging Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Open browser developer tools (F12)</li>
                <li>Go to the Network tab</li>
                <li>Try creating a user</li>
                <li>Look for slow requests to Clerk API</li>
                <li>Check the Console tab for timing logs</li>
                <li>Test with different browsers</li>
                <li>Try in incognito/private mode</li>
                <li>Check your internet connection speed</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;

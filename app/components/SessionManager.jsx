"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Loading component for session manager
const SessionManagerSkeleton = () => null; // Session manager doesn't need a visible skeleton

// Client component for session management
const SessionManagerClient = ({ timeoutMinutes = 6 }) => {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(
    timeoutMinutes * 60 * 1000
  );
  const [showTimer, setShowTimer] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [warningType, setWarningType] = useState(""); // 'five-minute' or 'one-minute'

  // Reset the timer on any user activity
  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    setTimeRemaining(timeoutMinutes * 60 * 1000);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log(
        "User inactive for",
        timeoutMinutes,
        "minutes. Logging out..."
      );
      handleInactivityLogout();
    }, timeoutMinutes * 60 * 1000);
  };

  // Update countdown every second
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const now = Date.now();
      const timeElapsed = now - lastActivityRef.current;
      const remaining = Math.max(0, timeoutMinutes * 60 * 1000 - timeElapsed);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [timeoutMinutes]);

  // Handle inactivity logout
  const handleInactivityLogout = async () => {
    try {
      await signOut({ redirectUrl: "/sign-in" });
      console.log("Logged out due to inactivity");
      // Show logout modal instead of immediate redirect
      setShowLogoutModal(true);
    } catch (error) {
      console.error("Error during inactivity logout:", error);
      // Show logout modal even if signOut fails
      setShowLogoutModal(true);
    }
  };

  // Set up activity listeners - only when modal is NOT open
  useEffect(() => {
    // Don't set up activity listeners if modal is open
    if (showWarningModal || showLogoutModal) {
      return;
    }

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutMinutes, signOut, router, showWarningModal, showLogoutModal]);

  // Show warning before logout - only when user is logged in
  useEffect(() => {
    if (!user || !isLoaded) return; // Don't show warning if user is not logged in or not loaded

    // 5-minute warning
    const fiveMinuteWarning = timeoutMinutes * 60 * 1000 - 300000; // 5 minutes before logout
    const fiveMinuteTimer = setTimeout(() => {
      setWarningType("five-minute");
      setShowWarningModal(true);
    }, fiveMinuteWarning);

    // 1-minute warning
    const oneMinuteWarning = timeoutMinutes * 60 * 1000 - 60000; // 1 minute before logout
    const oneMinuteTimer = setTimeout(() => {
      setWarningType("one-minute");
      setShowWarningModal(true);
    }, oneMinuteWarning);

    return () => {
      clearTimeout(fiveMinuteTimer);
      clearTimeout(oneMinuteTimer);
    };
  }, [timeoutMinutes, user, isLoaded]);

  // Calculate timer display values
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isWarningTime = timeRemaining < 300000; // 5 minutes
  const isCriticalTime = timeRemaining < 60000; // 1 minute

  // Show timer only when user is logged in and timer is active
  useEffect(() => {
    setShowTimer(user && isLoaded && timeRemaining > 0);
  }, [user, isLoaded, timeRemaining]);

  // Update the header timer display
  useEffect(() => {
    const timerPlaceholder = document.getElementById(
      "header-timer-placeholder"
    );

    if (showTimer && timerPlaceholder) {
      // Create timer element
      const timerElement = document.createElement("div");
      timerElement.className = `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
        isCriticalTime
          ? "bg-red-500 bg-opacity-30 text-red-100 animate-pulse"
          : isWarningTime
          ? "bg-yellow-500 bg-opacity-30 text-yellow-100"
          : "bg-white bg-opacity-20 text-white"
      }`;

      timerElement.innerHTML = `
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
        </svg>
        <span class="text-sm font-mono font-medium">
          ${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}
        </span>
      `;

      // Clear placeholder and add timer
      timerPlaceholder.innerHTML = "";
      timerPlaceholder.appendChild(timerElement);
    } else if (timerPlaceholder) {
      // Clear timer
      timerPlaceholder.innerHTML = "";
    }
  }, [showTimer, minutes, seconds, isWarningTime, isCriticalTime]);

  // Handle warning modal actions
  const handleStayLoggedIn = () => {
    setShowWarningModal(false);
    // Reset timer after modal closes
    setTimeout(() => {
      resetTimer();
    }, 100);
  };

  const handleLogoutNow = () => {
    setShowWarningModal(false);
    // Small delay to ensure modal closes before logout
    setTimeout(() => {
      handleInactivityLogout();
    }, 100);
  };

  // Handle logout modal actions
  const handleGoToLogin = () => {
    setShowLogoutModal(false);
    router.push("/sign-in");
  };

  // Handle modal backdrop click
  const handleWarningModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowWarningModal(false);
      // Reset timer after modal closes
      setTimeout(() => {
        resetTimer();
      }, 100);
    }
  };

  const handleLogoutModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowLogoutModal(false);
      router.push("/sign-in");
    }
  };

  // Get modal content based on warning type
  const getModalContent = () => {
    if (warningType === "five-minute") {
      return {
        title: "Session Timeout Warning",
        message:
          "You've been inactive for a while. Your session will expire in 5 minutes.",
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    } else if (warningType === "one-minute") {
      return {
        title: "Final Warning - Session Expiring",
        message:
          "Your session will expire in 1 minute. Please take action now.",
        iconColor: "text-red-600",
        bgColor: "bg-red-100",
      };
    }
    return {
      title: "Session Timeout Warning",
      message:
        "You've been inactive for a while. Your session will expire soon.",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
    };
  };

  const modalContent = getModalContent();

  return (
    <>
      {/* Inactivity Warning Modal */}
      {showWarningModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleWarningModalBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div
                className={`w-16 h-16 ${modalContent.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <svg
                  className={`w-8 h-8 ${modalContent.iconColor}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modalContent.title}
              </h3>

              <p className="text-gray-600 mb-6">{modalContent.message}</p>

              <div className="flex space-x-4">
                <button
                  onClick={handleStayLoggedIn}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Stay Logged In
                </button>
                <button
                  onClick={handleLogoutNow}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Logout Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleLogoutModalBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Session Expired
              </h3>

              <p className="text-gray-600 mb-6">
                You have been logged out due to inactivity. Please sign in again
                to continue.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={handleGoToLogin}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign In Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Client component wrapper
const SessionManagerClientWrapper = ({ timeoutMinutes = 6 }) => {
  return <SessionManagerClient timeoutMinutes={timeoutMinutes} />;
};

// Main SessionManager component with proper SSR
const SessionManager = ({ timeoutMinutes = 6 }) => {
  return (
    <Suspense fallback={<SessionManagerSkeleton />}>
      <SessionManagerClientWrapper timeoutMinutes={timeoutMinutes} />
    </Suspense>
  );
};

export default SessionManager;

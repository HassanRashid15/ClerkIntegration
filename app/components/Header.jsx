"use client";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, Suspense } from "react";
import { FaSignOutAlt, FaUser, FaCog } from "react-icons/fa";

const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return first + last;
};

// Loading component for user menu
const UserMenuSkeleton = () => (
  <div className="flex items-center space-x-2 text-gray-300">
    <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
    <div className="hidden md:block">
      <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
    </div>
  </div>
);

// User menu component
const UserMenu = ({ user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center border-2 border-white cursor-pointer">
          {user.hasImage ? (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-lg font-bold">
              {getInitials(user.firstName, user.lastName)}
            </span>
          )}
        </div>
        <span className="hidden md:block">
          {user.firstName || user.username || "User"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <Link
            href="/custom-profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowUserMenu(false)}
          >
            <FaUser className="mr-2" />
            Profile
          </Link>

          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>
      )}

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

// Main header component
const Header = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/sign-in" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 mb-5 bg-blue-700">
      <div className="flex items-center">
        <Link href="/">
          <div className="text-lg font-bold text-white uppercase">
            Clerk App
          </div>
        </Link>
      </div>

      <div className="flex items-center text-white">
        <Suspense fallback={<UserMenuSkeleton />}>
          {!isLoaded ? (
            <UserMenuSkeleton />
          ) : !isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="text-gray-300 hover:text-white mr-4"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-gray-300 hover:text-white mr-4"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="text-gray-300 hover:text-white mr-4"
              >
                Profile
              </Link>
              <Link
                href="/custom-profile"
                className="text-gray-300 hover:text-white mr-4"
              >
                Custom Profile
              </Link>
              <div id="header-timer-placeholder" className="mr-4"></div>
              <UserMenu user={user} onLogout={handleLogout} />
            </>
          )}
        </Suspense>
      </div>
    </nav>
  );
};

export default Header;

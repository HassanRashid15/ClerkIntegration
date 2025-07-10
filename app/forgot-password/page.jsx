"use client";
import CustomPasswordResetForm from "../components/CustomPasswordResetForm";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ForgotPasswordPage = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return (
      <div>
        You are already signed in. If you want to change your password, go to
        your profile settings.
      </div>
    );
  }

  return (
    <>
      <CustomPasswordResetForm />
    </>
  );
};

export default ForgotPasswordPage;

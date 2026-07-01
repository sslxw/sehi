"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useAuth } from "@/components/providers/AuthProvider";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?from=${encodeURIComponent("/onboarding")}`);
    } else if (user.onboardingComplete) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.onboardingComplete) {
    return (
      <AuthLayout>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <OnboardingFlow />
    </AuthLayout>
  );
}

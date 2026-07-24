import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? "/dashboard" : "/login");
  }, [session, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
    </div>
  );
}

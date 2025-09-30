"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthMessage } from "./components/AuthMessage";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const apiKey = searchParams.get("api_key");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setVerifying(true);
      signIn("credentials", {
        api_key: apiKey,
        redirect: true,
        callbackUrl: "/dashboard/Comparador",
      }).finally(() => setVerifying(false));
    }
  }, [apiKey]);

  return <AuthMessage isVerifying={verifying || !!apiKey} />;
}

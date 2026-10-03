"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Ошибка входа");
      setLoading(false);
      return;
    }

    router.push("/notes");
    router.refresh();
  };

  return (
    <div className="mx-auto flex flex-col justify-center px-6 max-w-sm h-[calc(100vh-3.5rem)] ">
      <h1 className="mb-6 text-2xl font-bold">Sign In</h1>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-destructive"> {error} </p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Entering..." : "Log In"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Dont have an account?{" "}
        <Link href="/sign-up" className="text-foreground underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ProtectoraLoginResponse } from "@/app/api/protectora/login/route";

const GENERIC_ERROR_MESSAGE = "Correo o contraseña incorrectos.";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR_MESSAGE);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    try {
      const response = await fetch("/api/protectora/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next: nextPath }),
      });
      const data = (await response.json()) as ProtectoraLoginResponse;

      if (!data.ok) {
        setErrorMessage(data.message || GENERIC_ERROR_MESSAGE);
        setStatus("error");
        return;
      }

      router.push(data.next);
      router.refresh();
    } catch {
      setErrorMessage("No hemos podido conectar. Inténtalo de nuevo.");
      setStatus("error");
    }
  }

  const submitting = status === "submitting";

  return (
    <form className="protectora-login-form" onSubmit={handleSubmit} noValidate>
      <div className="protectora-login-field">
        <label htmlFor="protectora-login-email">Correo electrónico</label>
        <input
          id="protectora-login-email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          disabled={submitting}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="protectora-login-field">
        <label htmlFor="protectora-login-password">Contraseña</label>
        <input
          id="protectora-login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          disabled={submitting}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {status === "error" && (
        <p className="file-error protectora-login-error" role="alert">{errorMessage}</p>
      )}

      <button type="submit" className="results-button protectora-login-submit" disabled={submitting}>
        {submitting ? "Accediendo…" : "Iniciar sesión"}
      </button>
    </form>
  );
}

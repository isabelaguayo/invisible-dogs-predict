"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function LogoutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M8 3.5H4.75A1.25 1.25 0 0 0 3.5 4.75v10.5A1.25 1.25 0 0 0 4.75 16.5H8M13 13.5l3.5-3.5-3.5-3.5M16.5 10H7.75" />
    </svg>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/protectora/logout", { method: "POST" });
    } finally {
      router.push("/protectora/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      className="protector-logout-button"
      onClick={handleLogout}
      disabled={signingOut}
    >
      <LogoutIcon />
      {signingOut ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}

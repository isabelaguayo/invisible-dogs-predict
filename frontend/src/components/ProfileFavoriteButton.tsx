"use client";

import { useAdopterFavorite } from "@/hooks/useAdopterFavorites";

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}>
      <path d="M12 20.4S4 16 4 9.7A4.1 4.1 0 0 1 8.1 5.6c1.7 0 3.1.9 3.9 2.2.8-1.3 2.2-2.2 3.9-2.2A4.1 4.1 0 0 1 20 9.7c0 6.3-8 10.7-8 10.7Z" />
    </svg>
  );
}

export function ProfileFavoriteButton({ petId, dogName }: { petId: string; dogName: string }) {
  const { isFavorite, toggle } = useAdopterFavorite(petId);

  return (
    <button
      className="profile-favorite-button"
      type="button"
      aria-label={isFavorite ? `Quitar a ${dogName} de favoritos` : `Añadir a ${dogName} a favoritos`}
      aria-pressed={isFavorite}
      onClick={toggle}
    >
      <HeartIcon active={isFavorite} />
      <span>{isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
    </button>
  );
}

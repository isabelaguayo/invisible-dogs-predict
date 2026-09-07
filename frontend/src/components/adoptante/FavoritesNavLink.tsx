"use client";

import Link from "next/link";
import { useAdopterFavoritePetIds } from "@/hooks/useAdopterFavorites";

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M12 20.4S4 16 4 9.7A4.1 4.1 0 0 1 8.1 5.6c1.7 0 3.1.9 3.9 2.2.8-1.3 2.2-2.2 3.9-2.2A4.1 4.1 0 0 1 20 9.7c0 6.3-8 10.7-8 10.7Z" />
    </svg>
  );
}

export function FavoritesNavLink() {
  const petIds = useAdopterFavoritePetIds();
  const count = petIds.length;

  return (
    <Link className="favorites-nav-link" href="/adoptante/favoritos">
      <HeartIcon />
      Favoritos{count > 0 && <span className="favorites-nav-count">({count})</span>}
    </Link>
  );
}

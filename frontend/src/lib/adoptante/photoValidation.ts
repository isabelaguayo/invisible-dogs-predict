// Shared between the client upload UI and the server route handler so the
// accepted formats and size limit can never drift between them.
export const ADOPTER_PHOTO_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ADOPTER_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const ADOPTER_PHOTO_MAX_LABEL = "10 MB";

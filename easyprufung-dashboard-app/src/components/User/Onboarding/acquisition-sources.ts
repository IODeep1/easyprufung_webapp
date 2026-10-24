export const acquisitionSources = [
    "google", "youtube", "facebook", "instagram", "tiktok", "reddit",
    "x", "linkedin", "whatsapp", "telegram", "discord", "other"
] as const;
export type AcquisitionSource = (typeof acquisitionSources)[number];

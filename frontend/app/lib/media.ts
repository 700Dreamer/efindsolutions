const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  engraving: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  embroidery: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  tracking: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80",
  branding: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  calligraphy: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80",
  printing: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
};

/**
 * Normalizes backend uploaded image paths and provides reliable fallback images
 */
export function getServiceImageUrl(imagePath?: string | null, category?: string | null): string {
  if (imagePath && typeof imagePath === "string" && imagePath.trim()) {
    const trimmed = imagePath.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
      return trimmed;
    }
    
    // Relative upload path e.g. /uploads/services/abc.jpg
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    // Extract base origin (e.g., http://localhost:8000)
    const baseOrigin = apiUrl.replace(/\/api\/v1\/?$/, "");
    const formattedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${baseOrigin}${formattedPath}`;
  }

  const catKey = category?.toLowerCase().trim() || "engraving";
  return DEFAULT_CATEGORY_IMAGES[catKey] || DEFAULT_CATEGORY_IMAGES.engraving;
}

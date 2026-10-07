export function cleanExtractedText(text) {
  return String(text || "").replaceAll(String.fromCharCode(0), "").replace(/�/g, "")
    .replace(/\?{2,}/g, " ").replace(/([A-Za-z])\?([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ").trim();
}

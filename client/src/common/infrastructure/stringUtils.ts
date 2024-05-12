export function capitalizeFirstLetter(str: string): string {
  if (str === undefined) throw Error("Cannot capitalize undefined");

  if (!str) return str; // Return the original string if it's empty

  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Extracts the last segment from a URL path.
 * @param {string} path - The full URL path.
 * @return {string} - The last segment of the path.
 */
export function getLastPathSegment(path: string) {
  if (!path) return "/notfound"; // Return empty string if path is not defined or is empty

  // Find the last occurrence of '/' and extract the substring after it, keep the leading "/" character
  const lastSlashIndex = path.lastIndexOf("/");
  return lastSlashIndex !== -1 ? path.substring(lastSlashIndex) : path;
}

export function normalizePath(path: string): string {
  if (!path) return "/"; // Return root if path is empty

  // Ensure the path starts with a single slash and remove any double slashes
  return `/${path.replace(/^\/*/, "").replace(/\/\/+/g, "/")}`;
}

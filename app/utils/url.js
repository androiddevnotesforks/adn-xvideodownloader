/**
 * Extracts the tweet ID from a Twitter/X URL
 * @param {string} url - The Twitter/X URL
 * @returns {string|null} The tweet ID or null if invalid
 */
export function extractTweetId(url) {
  if (!url) return null;
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Validates if a URL is a valid Twitter/X post URL
 * @param {string} url - The URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export function isValidTwitterUrl(url) {
  if (!url) return false;
  return (url.includes('x.com') || url.includes('twitter.com')) && url.includes('/status/');
}

/**
 * Creates a URL with query parameters
 * @param {string} baseUrl - The base URL
 * @param {Object} params - The query parameters
 * @returns {string} The complete URL with query parameters
 */
export function createUrlWithParams(baseUrl, params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value);
  });
  return `${baseUrl}?${searchParams.toString()}`;
} 
import { TWITTER_API_CONFIG } from '../config/twitter';
import { createUrlWithParams } from '../utils/url';

/**
 * Fetches tweet data from Twitter API
 * @param {string} tweetId - The tweet ID
 * @returns {Promise<Object>} The tweet data
 */
export async function fetchTweetData(tweetId) {
  const url = createUrlWithParams(
    `${TWITTER_API_CONFIG.baseUrl}/notifications/all.json`,
    TWITTER_API_CONFIG.defaultParams
  );

  const response = await fetch(url, {
    headers: {
      ...TWITTER_API_CONFIG.headers,
      'Referer': `https://x.com/i/status/${tweetId}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tweet data');
  }

  return response.json();
}

/**
 * Extracts video information from tweet data
 * @param {Object} tweetData - The tweet data
 * @param {string} tweetId - The tweet ID
 * @returns {Object|null} The video information or null if not found
 */
export function extractVideoInfo(tweetData, tweetId) {
  const tweet = tweetData.globalObjects.tweets[tweetId];
  if (!tweet?.extended_entities?.media?.[0]?.video_info?.variants) {
    return null;
  }

  const variants = tweet.extended_entities.media[0].video_info.variants
    .filter(v => v.content_type === 'video/mp4')
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  return variants.length ? variants[0] : null;
}

/**
 * Downloads video from URL
 * @param {string} videoUrl - The video URL
 * @returns {Promise<ArrayBuffer>} The video data
 */
export async function downloadVideo(videoUrl) {
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error('Failed to download video');
  }
  return response.arrayBuffer();
} 
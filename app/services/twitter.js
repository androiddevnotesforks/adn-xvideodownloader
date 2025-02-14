import { TWITTER_API_CONFIG } from '../config/twitter';
import { createUrlWithParams } from '../utils/url';

/**
 * Fetches tweet data from Twitter API
 * @param {string} tweetId - The tweet ID
 * @returns {Promise<Object>} The tweet data
 */
export async function fetchTweetData(tweetId) {
  const url = createUrlWithParams(
    `${TWITTER_API_CONFIG.baseUrl}/timeline/conversation/${tweetId}.json`,
    {
      ...TWITTER_API_CONFIG.defaultParams,
      tweet_mode: 'extended'
    }
  );

  const response = await fetch(url, {
    headers: {
      ...TWITTER_API_CONFIG.headers,
      'Referer': `https://x.com/i/status/${tweetId}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('API Error Response:', text);
    throw new Error('Failed to fetch tweet data');
  }

  const data = await response.json();
  
  // If we don't have the tweet in globalObjects, try to find it in the timeline entries
  if (!data.globalObjects?.tweets?.[tweetId] && data.timeline?.instructions) {
    const entries = data.timeline.instructions
      .find(i => i.addEntries)?.addEntries?.entries || [];
      
    const tweetEntry = entries.find(e => 
      e.content?.item?.content?.tweet?.id === tweetId ||
      e.content?.itemContent?.tweet?.id === tweetId
    );

    if (tweetEntry) {
      const tweet = tweetEntry.content?.item?.content?.tweet || 
                   tweetEntry.content?.itemContent?.tweet;
      
      // Add the tweet to globalObjects if it doesn't exist
      if (tweet) {
        data.globalObjects = data.globalObjects || { tweets: {} };
        data.globalObjects.tweets = data.globalObjects.tweets || {};
        data.globalObjects.tweets[tweetId] = tweet;
      }
    }
  }

  return data;
}

/**
 * Extracts video information from tweet data
 * @param {Object} tweetData - The tweet data
 * @param {string} tweetId - The tweet ID
 * @returns {Object|null} The video information or null if not found
 */
export function extractVideoInfo(tweetData, tweetId) {
  const tweet = tweetData.globalObjects?.tweets?.[tweetId];
  if (!tweet) {
    console.error('Tweet not found in response');
    return null;
  }

  // Check both extended_entities and legacy fields for video info
  const mediaContainer = tweet.extended_entities || tweet.legacy?.extended_entities;
  if (!mediaContainer?.media?.[0]?.video_info?.variants) {
    console.error('No video info found in tweet');
    return null;
  }

  const variants = mediaContainer.media[0].video_info.variants
    .filter(v => v.content_type === 'video/mp4')
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  if (!variants.length) {
    console.error('No MP4 variants found');
    return null;
  }

  return variants[0];
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
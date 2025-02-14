import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes('x.com') && !url.includes('twitter.com')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Extract tweet ID from URL
    const tweetId = url.split('/status/')[1]?.split('?')[0];
    if (!tweetId) {
      return NextResponse.json({ error: 'Invalid tweet URL' }, { status: 400 });
    }

    // Make request to X/Twitter API
    const apiUrl = 'https://x.com/i/api/2/notifications/all.json';
    const params = new URLSearchParams({
      'include_profile_interstitial_type': '1',
      'include_blocking': '1',
      'include_blocked_by': '1',
      'include_followed_by': '1',
      'include_want_retweets': '1',
      'include_mute_edge': '1',
      'include_can_dm': '1',
      'include_can_media_tag': '1',
      'include_ext_is_blue_verified': '1',
      'include_ext_verified_type': '1',
      'include_ext_profile_image_shape': '1',
      'skip_status': '1',
      'cards_platform': 'Web-12',
      'include_cards': '1',
      'include_ext_alt_text': 'true',
      'include_ext_limited_action_results': 'true',
      'include_quote_count': 'true',
      'include_reply_count': '1',
      'tweet_mode': 'extended',
      'include_ext_views': 'true',
      'include_entities': 'true',
      'include_user_entities': 'true',
      'include_ext_media_color': 'true',
      'include_ext_media_availability': 'true',
      'include_ext_sensitive_media_warning': 'true',
      'include_ext_trusted_friends_metadata': 'true',
      'send_error_codes': 'true',
      'simple_quoted_tweet': 'true',
      'count': '20',
      'requestContext': 'launch',
      'ext': 'mediaStats,highlightedLabel,parodyCommentaryFanLabel,voiceInfo,birdwatchPivot,superFollowMetadata,unmentionInfo,editControl,article'
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      headers: {
        'Host': 'x.com',
        'Connection': 'keep-alive',
        'sec-ch-ua-platform': '"macOS"',
        'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-csrf-token': '8f7a7cf6c6b3f33b07d6865d84d8fcc0e76d1d91fc5ac3da2fbb634680ec016ccc39c3786592572c729f52eaa90d804fc4fea75a888c2065643bfd1f02c9f9f8d0c8d0ef785a5e919ee534e69c00edd0',
        'x-twitter-client-language': 'en',
        'x-twitter-active-user': 'yes',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Referer': url,
        'Cookie': 'guest_id=v1%3A173824357898274729; night_mode=2; kdt=yTeLRSXKrMyKSUTyVpdjl4coqeFnbIPXbZByDrkG; auth_token=0c6d1485e726fe4c207c4aa0308597ca0535cd14; ct0=8f7a7cf6c6b3f33b07d6865d84d8fcc0e76d1d91fc5ac3da2fbb634680ec016ccc39c3786592572c729f52eaa90d804fc4fea75a888c2065643bfd1f02c9f9f8d0c8d0ef785a5e919ee534e69c00edd0; lang=en; twid=u%3D1604863807574212611; d_prefs=MToxLGNvbnNlbnRfdmVyc2lvbjoyLHRleHRfdmVyc2lvbjoxMDAw; guest_id_ads=v1%3A173824357898274729; guest_id_marketing=v1%3A173824357898274729; personalization_id="v1_KMxUHLPGeWe59r2chLTiyw=="'
      }
    });

    if (!response.ok) {
      console.error('API Response:', await response.text());
      throw new Error('Failed to fetch tweet data');
    }

    const data = await response.json();
    
    // Find the video URL from the response
    const tweet = data.globalObjects.tweets[tweetId];
    if (!tweet?.extended_entities?.media?.[0]?.video_info?.variants) {
      return NextResponse.json({ error: 'No video found in tweet' }, { status: 404 });
    }

    // Get the highest quality MP4 video URL
    const variants = tweet.extended_entities.media[0].video_info.variants
      .filter(v => v.content_type === 'video/mp4')
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    if (!variants.length) {
      return NextResponse.json({ error: 'No MP4 video found' }, { status: 404 });
    }

    const videoUrl = variants[0].url;

    // Fetch the video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video');
    }

    const videoBuffer = await videoResponse.arrayBuffer();

    // Return video as blob
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video.mp4"',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to download video' },
      { status: 500 }
    );
  }
}
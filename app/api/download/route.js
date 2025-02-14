import { NextResponse } from 'next/server';
import { isValidTwitterUrl, extractTweetId } from '../../utils/url';
import { fetchTweetData, extractVideoInfo, downloadVideo } from '../../services/twitter';

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!isValidTwitterUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const tweetId = extractTweetId(url);
    if (!tweetId) {
      return NextResponse.json({ error: 'Invalid tweet URL' }, { status: 400 });
    }

    const tweetData = await fetchTweetData(tweetId);
    const videoInfo = extractVideoInfo(tweetData, tweetId);

    if (!videoInfo) {
      return NextResponse.json({ error: 'No video found in tweet' }, { status: 404 });
    }

    const videoBuffer = await downloadVideo(videoInfo.url);

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
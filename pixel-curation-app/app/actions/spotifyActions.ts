// app/actions/spotifyActions.ts
'use server';

// 1. Generate a temporary Access Token
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Spotify requires the ID and Secret to be Base64 encoded together
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    // Spotify tokens last exactly 1 hour (3600 seconds). We cache this request for 3500 seconds 
    // so Next.js reuses the same token for everyone, saving API limits!
    next: { revalidate: 3500 } 
  });

  if (!res.ok) throw new Error('Failed to get Spotify token');
  
  const data = await res.json();
  return data.access_token;
}

// 2. Fetch the specific Track Metadata
export async function fetchSpotifyTrack(trackId: string) {
  try {
    const token = await getSpotifyToken();
    
    const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch track from Spotify');
    
    const track = await res.json();

    // Format it perfectly for our media_cache table!
    return {
      api_id: trackId,
      title: `${track.name} - ${track.artists[0].name}`,
      thumbnail_url: track.album.images[0]?.url || '',
      description: `Album: ${track.album.name}`,
    };
  } catch (error) {
    console.error("Spotify API Error:", error);
    return null;
  }
}
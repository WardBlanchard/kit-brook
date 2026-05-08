exports.handler = async (event) => {
  // Path arrives as /z/x/y — strip the leading slash
  const path = event.path.replace('/.netlify/functions/os-tiles/', '');
  const [z, x, y] = path.split('/');

  if (!z || !x || !y) {
    return { statusCode: 400, body: 'Bad tile request' };
  }

  const key = process.env.OS_API_KEY;
  if (!key) {
    return { statusCode: 500, body: 'OS_API_KEY not configured' };
  }

  const osUrl =
    `https://api.os.uk/maps/raster/v1/zxy/Outdoor_3857/${z}/${x}/${y}.png?key=${key}`;

  try {
    const response = await fetch(osUrl);
    if (!response.ok) {
      return { statusCode: response.status, body: 'Upstream error' };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 502, body: `Fetch failed: ${err.message}` };
  }
};

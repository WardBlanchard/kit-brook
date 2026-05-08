exports.handler = async (event) => {
  // event.path will be something like /.netlify/functions/os-tiles/14/8023/5467
  const parts = event.path.split('/').filter(Boolean);
  // parts: [ '.netlify', 'functions', 'os-tiles', z, x, y ]
  const z = parts[3];
  const x = parts[4];
  const y = parts[5];

  if (!z || !x || !y) {
    return {
      statusCode: 400,
      body: `Bad tile request. Path received: ${event.path}`
    };
  }

  const key = process.env.OS_API_KEY;
  if (!key) {
    return { statusCode: 500, body: 'OS_API_KEY environment variable not set' };
  }

  const osUrl =
    `https://api.os.uk/maps/raster/v1/zxy/Outdoor_3857/${z}/${x}/${y}.png?key=${key}`;

  try {
    const response = await fetch(osUrl);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `OS API error: ${response.status} ${response.statusText}`
      };
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

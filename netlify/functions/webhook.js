const fetch = require('node-fetch'); // only if using local testing with Netlify CLI

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { name, phone, email } = body;

    const HOOMAN_API_URL = process.env.HOOMAN_API_URL;
    const HOOMAN_API_KEY = process.env.HOOMAN_API_KEY;
    const HOOMAN_CAMPAIGN_ID = process.env.HOOMAN_CAMPAIGN_ID || 'test-campaign';

    console.log("Sending to:", HOOMAN_API_URL);

    const response = await fetch(HOOMAN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': HOOMAN_API_KEY
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        campaignId: HOOMAN_CAMPAIGN_ID
      }),
      timeout: 10000 // optional if supported
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Network error",
        message: error.message
      })
    };
  }
};

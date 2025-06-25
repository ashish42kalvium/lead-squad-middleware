exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { name, phone, email } = body;

    const HOOMAN_API_URL = process.env.HOOMAN_API_URL;
    const HOOMAN_API_KEY = process.env.HOOMAN_API_KEY;
    const HOOMAN_CAMPAIGN_ID = process.env.HOOMAN_CAMPAIGN_ID || "test-campaign";

    const response = await fetch(HOOMAN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": HOOMAN_API_KEY
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        campaignId: HOOMAN_CAMPAIGN_ID
      })
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "AI call triggered successfully",
        result
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Failed to process webhook",
        details: error.message
      })
    };
  }
};

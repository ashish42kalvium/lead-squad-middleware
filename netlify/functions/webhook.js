// netlify/functions/webhook.js
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Received webhook from Lead Squad:', event.body);
    
    // Parse the incoming webhook data
    const leadData = JSON.parse(event.body);
    
    // Validate required fields
    if (!leadData.phone || !leadData.name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: phone and name' 
        })
      };
    }

    // Transform data for Hooman Labs
    const callPayload = {
      phone_number: leadData.phone,
      lead_name: leadData.name,
      campaign_id: process.env.HOOMAN_CAMPAIGN_ID,
      custom_data: {
        lead_source: leadData.source || 'Lead Squad',
        lead_id: leadData.id,
        email: leadData.email,
        created_at: new Date().toISOString()
      }
    };

    console.log('Sending to Hooman Labs:', callPayload);

    // Trigger AI call via Hooman Labs API
    const response = await fetch(process.env.HOOMAN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HOOMAN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hooman Labs API error:', errorText);
      throw new Error(`Hooman Labs API failed: ${response.status}`);
    }

    const hoomantResult = await response.json();
    console.log('Hooman Labs response:', hoomantResult);

    // Return success response to Lead Squad
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'AI call triggered successfully',
        hooman_response: hoomantResult
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return error response to Lead Squad
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to process webhook',
        details: error.message
      })
    };
  }
};

const { createSubmission } = require('../lib/kv');

async function getPayPalAccessToken() {
  var clientId = process.env.PAYPAL_CLIENT_ID;
  var secret = process.env.PAYPAL_CLIENT_SECRET;
  var base = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

  var res = await fetch(base + '/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  var data = await res.json();
  return data.access_token;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Payment processing is not configured yet. Please call (386) 350-1047 to place your order.' });
  }

  try {
    var body = req.body;
    var amount = body.amount;
    var total = body.total;
    var config = body.config;
    var description = body.description;
    var name = body.name;
    var email = body.email;
    var phone = body.phone;
    var zip = body.zip;

    if (!amount || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    var base = process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com';
    var token = await getPayPalAccessToken();

    var orderDesc = description || ('Steel Building Deposit - ' + config);
    var orderRes = await fetch(base + '/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          description: orderDesc.substring(0, 127),
          custom_id: (name + ' | ' + email + ' | ' + phone).substring(0, 127),
          amount: {
            currency_code: 'USD',
            value: String(Number(amount).toFixed(2)),
          },
        }],
      }),
    });

    var order = await orderRes.json();

    if (!order.id) {
      console.error('PayPal order error:', JSON.stringify(order));
      return res.status(500).json({ error: 'Could not create PayPal order.' });
    }

    // Save submission to Redis (non-blocking — don't let this fail the payment)
    try {
      await createSubmission({
        type: body.type || 'deposit',
        name: name,
        email: email,
        phone: phone || '',
        zip: zip || '',
        building_type: config || body.shed_name || '',
        notes: 'Deposit: $' + amount + (total ? ' | Est Total: $' + total : '') + (config ? ' | Config: ' + config : '') + (description ? ' | ' + description : '')
      });
    } catch (kvErr) {
      console.error('Failed to save submission to KV:', kvErr.message);
    }

    res.json({ id: order.id });
  } catch (err) {
    console.error('PayPal order error:', err.message, err.stack);
    res.status(500).json({ error: 'Could not create PayPal order.' });
  }
};

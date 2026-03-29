// controllers/paymentController.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, appointmentId, patientId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency: 'usd',
      metadata: {
        appointmentId,
        patientId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET);

const Payment = require('../models/Payment'); 

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, appointmentId, patientId } = req.body;

    if (!amount || !appointmentId || !patientId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convert to cents
      currency: 'usd',
      metadata: {
        appointmentId,
        patientId
      }
    });

    // Save payment as pending
    const payment = new Payment({
      paymentIntentId: paymentIntent.id,
      appointmentId,
      patientId,
      amount,
      status: 'PENDING'
    });

    await payment.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'paymentIntentId is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const payment = await Payment.findOne({ paymentIntentId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (paymentIntent.status === 'succeeded') {
      payment.status = 'SUCCESS';
      await payment.save();

      return res.json({
        success: true,
        status: paymentIntent.status
      });

      //Optional: Call Appointment Service here

    } else {
      payment.status = 'FAILED';
      await payment.save();

      return res.json({
        success: false,
        status: paymentIntent.status
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 });

    res.json(payments);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentsByPatient = async (req, res) => {
  try {
    const payments = await Payment.find({
      patientId: req.params.patientId
    }).sort({ createdAt: -1 });

    res.json(payments);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentByAppointment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      appointmentId: req.params.appointmentId
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
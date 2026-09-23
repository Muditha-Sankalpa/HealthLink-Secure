const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET);

const Payment = require("../models/Payment");
const CONSULTATION_FEE_USD = 50; //v04

//V04 - fix
exports.createPaymentIntent = async (req, res) => {
  try {
    const appointmentId = String(req.body.appointmentId || "").trim();

    if (!appointmentId) {
      return res.status(400).json({
        message: "appointmentId is required",
      });
    }

    // Security: never trust payment amount or payer identity from the client.
    const amount = CONSULTATION_FEE_USD;
    const patientId = String(req.user.id);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      metadata: {
        appointmentId,
        patientId,
      },
    });

    const payment = new Payment({
      paymentIntentId: paymentIntent.id,
      appointmentId,
      patientId,
      amount,
      status: "PENDING",
    });

    await payment.save();

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      patientId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//v04 - fix
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        message: "paymentIntentId is required",
      });
    }

    const query = { paymentIntentId };

    // Patients may only confirm their own payments.
    // Admins retain access to all payment records.
    if (req.user.role === "Patient") {
      query.patientId = String(req.user.id);
    }

    const payment = await Payment.findOne(query);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify that Stripe's data matches the trusted database record.
    const detailsMatch =
      paymentIntent.amount === payment.amount * 100 &&
      paymentIntent.currency === "usd" &&
      String(paymentIntent.metadata.patientId) === String(payment.patientId) &&
      String(paymentIntent.metadata.appointmentId) ===
        String(payment.appointmentId);

    if (!detailsMatch) {
      return res.status(409).json({
        message: "Payment integrity validation failed",
      });
    }

    if (paymentIntent.status === "succeeded") {
      payment.status = "SUCCESS";
      await payment.save();

      return res.json({
        success: true,
        status: paymentIntent.status,
      });
    }

    payment.status = "FAILED";
    await payment.save();

    return res.json({
      success: false,
      status: paymentIntent.status,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentsByPatient = async (req, res) => {
  try {
    //V03 - fix

    const requestedPatientId = String(req.params.patientId);
    const loggedInUserId = String(req.user.id);

    if (req.user.role === "Patient" && requestedPatientId !== loggedInUserId) {
      return res.status(403).json({
        message: "Forbidden: You can only access your own payments",
      });
    }

    const payments = await Payment.find({
      patientId: req.params.patientId,
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentByAppointment = async (req, res) => {
  try {
    //V03 - fix

    const query = {
      appointmentId: req.params.appointmentId,
    };

    // Patients can only search within their own payment records.
    // Admins can search all records.
    if (req.user.role === "Patient") {
      query.patientId = String(req.user.id);
    }

    const payment = await Payment.findOne(query);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

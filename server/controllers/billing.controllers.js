import crypto from "crypto";
import User from "../models/user.model.js";

const PLAN_CONFIG = {
  free: {
    amount: 0,
    credits: 500,
    plan: "free",
    name: "Free",
  },
  pro: {
    amount: 49900,
    credits: 500,
    plan: "pro",
    name: "Pro",
  },
  enterprise: {
    amount: 149900,
    credits: 1000,
    plan: "enterprise",
    name: "Enterprise",
  },
};

const getPlanConfig = (planType) => PLAN_CONFIG[planType];

const getRazorpayAuthHeader = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
};

const fetchRazorpayOrder = async (orderId) => {
  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: {
      Authorization: getRazorpayAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Razorpay order: ${errorText}`);
  }

  return response.json();
};

export const createOrder = async (req, res) => {
  try {
    const { planType } = req.body;
    const planConfig = getPlanConfig(planType);

    if (!planConfig) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    if (planType === "free") {
      return res.status(200).json({
        isFree: true,
        credits: planConfig.credits,
        plan: planConfig.plan,
      });
    }

    const orderPayload = {
      amount: planConfig.amount,
      currency: "INR",
      receipt: `forgix_${req.user._id}_${Date.now()}`.slice(0, 40),
      notes: {
        planType,
        userId: req.user._id.toString(),
      },
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: getRazorpayAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ message: `Razorpay order failed: ${errorText}` });
    }

    const order = await response.json();

    return res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planType,
      planName: planConfig.name,
      credits: planConfig.credits,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create billing order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing Razorpay payment details" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await fetchRazorpayOrder(razorpay_order_id);
    const planType = order?.notes?.planType;
    const userId = order?.notes?.userId;
    const planConfig = getPlanConfig(planType);

    if (!planConfig || !userId || userId !== req.user._id.toString()) {
      return res.status(400).json({ message: "Invalid order metadata" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.processedPayments.includes(razorpay_payment_id)) {
      return res.status(200).json({
        message: "Payment already verified",
        user,
      });
    }

    user.credits += planConfig.credits;
    user.plan = planConfig.plan;
    user.processedPayments.push(razorpay_payment_id);
    await user.save();

    return res.status(200).json({
      message: "Payment verified successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to verify payment",
    });
  }
};

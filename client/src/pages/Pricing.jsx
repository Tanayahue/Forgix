import { ArrowLeft, Check, Coins, ShieldCheck, Sparkles, Zap } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config/api";
import { setUserData } from "../redux/userSlice";
import ThemeToggle from "../components/ThemeToggle";

const plans = [
  {
    key: "free",
    name: "Free",
    price: "INR 0",
    credits: 500,
    description: "Perfect to explore Forgix and test the workflow.",
    features: [
      "AI website generation",
      "Responsive HTML output",
      "Basic animations",
    ],
    popular: false,
    button: "Get Started",
  },
  {
    key: "pro",
    name: "Pro",
    price: "INR 499",
    credits: 500,
    description: "For serious creators and freelancers building for clients.",
    features: [
      "Everything in Free",
      "Faster generation",
      "Edit and regenerate",
    ],
    popular: true,
    button: "Upgrade to Pro",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "INR 1499",
    credits: 1000,
    description: "For teams and power users working on larger batches of sites.",
    features: [
      "Unlimited iterations",
      "Highest priority",
      "Team collaboration",
      "Dedicated support",
    ],
    popular: false,
    button: "Contact Sales",
  },
];

function Pricing() {
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleBuy = async (planKey) => {
    if (!userData) {
      navigate("/");
      return;
    }

    if (planKey === "free") {
      navigate("/dashboard");
      return;
    }

    setError("");
    setLoading(planKey);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay Checkout");
      }

      const result = await axios.post(
        `${serverUrl}/api/billing`,
        { planType: planKey },
        { withCredentials: true }
      );

      if (result.data.isFree) {
        const refreshedUser = await axios.get(`${serverUrl}/api/user/me`, {
          withCredentials: true,
        });
        dispatch(setUserData(refreshedUser.data.user));
        navigate("/dashboard");
        return;
      }

      const options = {
        key: result.data.key,
        amount: result.data.amount,
        currency: result.data.currency,
        name: "Forgix",
        description: `${result.data.planName} Plan`,
        order_id: result.data.orderId,
        handler: async (response) => {
          const verification = await axios.post(
            `${serverUrl}/api/billing/verify`,
            response,
            { withCredentials: true }
          );

          dispatch(setUserData(verification.data.user));
          navigate("/dashboard");
        },
        prefill: {
          name: result.data.user?.name || userData?.name || "",
          email: result.data.user?.email || userData?.email || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        setLoading(null);
      });
      razorpay.open();
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to start Razorpay payment"
      );
      setLoading(null);
    }
  };

  return (
    <div className="theme-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[rgba(99,102,241,0.16)] blur-[140px]" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[rgba(56,189,248,0.08)] blur-[120px]" />
        <div className="absolute left-[-6rem] top-[18rem] h-[18rem] w-[18rem] rounded-full bg-[rgba(99,102,241,0.08)] blur-[120px]" />
      </div>

      <div className="theme-nav fixed left-0 right-0 top-0 z-50 border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              className="theme-muted-button rounded-lg p-2 transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]">
                Forgix
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                Pricing
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <main className="relative mx-auto max-w-7xl px-6 pb-16 pt-28">
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-14 max-w-5xl text-center"
        >
          <div className="theme-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.24em]">
            <Sparkles size={14} className="text-[var(--accent)]" />
            Credit Packs
          </div>
          <h1 className="mt-6 text-4xl font-bold text-[var(--text-primary)] md:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            Buy credits once and use Forgix when you need it. Every plan keeps
            the same polished workflow, just with more room to create.
          </p>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </MotionDiv>

        <div className="mb-10 grid gap-5 md:grid-cols-3">
          <div className="theme-panel-soft rounded-[24px] p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Zap size={18} />
            </div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              One-time credit packs
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              No subscriptions, just straightforward credits when you need to generate more.
            </p>
          </div>
          <div className="theme-panel-soft rounded-[24px] p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)]">
              <ShieldCheck size={18} />
            </div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              Same premium workflow
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Every plan uses the same polished product experience with different room to create.
            </p>
          </div>
          <div className="theme-panel-soft rounded-[24px] p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Coins size={18} />
            </div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              Built for different stages
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Start free, upgrade for faster iteration, or scale with a larger batch-friendly plan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <MotionDiv
              key={plan.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className={`relative flex flex-col overflow-hidden rounded-[28px] p-7 transition ${
                plan.popular
                  ? "theme-panel scale-[1.01] border-[rgba(99,102,241,0.45)]"
                  : "theme-panel-soft hover:border-[rgba(99,102,241,0.36)] hover:bg-[color:var(--surface-elevated)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[var(--accent)] via-[#7c83ff] to-[var(--accent-secondary)]" />
              )}

              {plan.popular && (
                <div className="theme-pill absolute right-5 top-5 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">
                  Most Popular
                </div>
              )}

              <div className="theme-pill inline-flex w-fit rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em]">
                {plan.credits} credits
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                    {plan.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {plan.description}
                  </p>
                </div>
                <div className={`rounded-2xl px-3 py-2 text-right ${
                  plan.popular
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "bg-[color:var(--muted-bg)] text-[var(--text-secondary)]"
                }`}>
                  <p className="text-[10px] uppercase tracking-[0.18em]">Best for</p>
                  <p className="mt-1 text-xs font-medium">
                    {plan.key === "free"
                      ? "Exploring"
                      : plan.key === "pro"
                        ? "Creators"
                        : "Teams"}
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-[24px] border border-[var(--border)] bg-[color:var(--muted-bg)] p-5">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-[var(--text-primary)]">
                    {plan.price}
                  </span>
                  <span className="mb-1 text-sm text-[var(--text-secondary)]">
                    one-time
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <Coins size={16} className="text-[var(--accent-secondary)]" />
                  <span className="font-medium">{plan.credits} credits included</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-3 text-sm text-[var(--text-primary)]"
                  >
                    <Check size={16} className="text-[var(--accent-secondary)]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <MotionButton
                whileTap={{ scale: 0.97 }}
                disabled={Boolean(loading)}
                onClick={() => handleBuy(plan.key)}
                className={`mt-8 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.popular
                    ? "border border-[rgba(99,102,241,0.45)] bg-[var(--accent)] text-white shadow-[0_18px_40px_rgba(99,102,241,0.28)] hover:scale-105 hover:shadow-[0_22px_48px_rgba(99,102,241,0.4)]"
                    : "border border-[var(--border)] bg-[rgba(17,24,43,0.72)] text-[var(--text-primary)] hover:border-[rgba(99,102,241,0.4)] hover:bg-[var(--accent-soft)]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {loading === plan.key ? "Redirecting..." : plan.button}
              </MotionButton>
            </MotionDiv>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Pricing;

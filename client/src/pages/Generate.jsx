import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Layers3,
  Link2,
  Sparkles,
  Type,
  WandSparkles,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { serverUrl } from "../config/api";
import ThemeToggle from "../components/ThemeToggle";

const PHASES = [
  "Analyzing your idea...",
  "Designing layout and structure...",
  "Writing HTML and CSS...",
  "Adding animations and interactions...",
  "Final quality checks...",
];

function Generate() {
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const navigate = useNavigate();
  const generationModes = [
    {
      key: "prompt",
      label: "Text Prompt",
      icon: Type,
      copy: "Describe the page you want from scratch.",
    },
    {
      key: "image",
      label: "Screenshot",
      icon: ImagePlus,
      copy: "Upload a screenshot and recreate it faithfully.",
    },
    {
      key: "url",
      label: "URL Rebuild",
      icon: Link2,
      copy: "Paste a URL and rebuild the current experience.",
    },
  ];
  const promptIdeas = [
    "Create a SaaS landing page for an AI note-taking tool with premium pricing cards and testimonials.",
    "Build a modern portfolio for a frontend developer with motion, case studies, and contact CTA.",
    "Generate a product page for a fintech app with trust signals, metrics, and app download sections.",
  ];
  const visualIdeas = [
    "Match the layout closely but improve responsiveness.",
    "Preserve the palette and spacing, then modernize hover states.",
    "Recreate the structure faithfully and clean up the code quality.",
  ];
  const [mode, setMode] = useState("prompt");
  const [prompt, setPrompt] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [referenceImage, setReferenceImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [error, setError] = useState("");

  const handleGenerateWebsite = async () => {
    if (loading) return;

    if (mode === "prompt" && !prompt.trim()) return;
    if (mode === "image" && !referenceImage) return;
    if (mode === "url" && !sourceUrl.trim()) return;

    setError("");
    setProgress(0);
    setPhaseIndex(0);
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/website/generate`,
        {
          mode,
          prompt,
          sourceUrl,
          referenceImage,
        },
        { withCredentials: true }
      );

      setProgress(100);
      setLoading(false);
      navigate(`/editor/${result.data.websiteId}`);
    } catch (requestError) {
      setLoading(false);
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "something went wrong"
      );
      console.log(requestError);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result?.toString() || "");
      setImageName(file.name);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const canGenerate =
    !loading &&
    ((mode === "prompt" && prompt.trim()) ||
      (mode === "image" && referenceImage) ||
      (mode === "url" && sourceUrl.trim()));

  useEffect(() => {
    if (!loading) return;

    let value = 0;

    const interval = setInterval(() => {
      const increment =
        value < 20
          ? Math.random() * 1.5
          : value < 60
            ? Math.random() * 1.2
            : Math.random() * 0.6;

      value += increment;

      if (value >= 93) value = 93;

      const phase = Math.min(
        Math.floor((value / 100) * PHASES.length),
        PHASES.length - 1
      );

      setProgress(Math.floor(value));
      setPhaseIndex(phase);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading]);

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
                Generate
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-28">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="theme-pill mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.24em]">
            <Sparkles size={14} className="text-[var(--accent)]" />
            Generation workspace
          </div>
          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-bold leading-tight md:text-7xl">
            Build websites with
            <span className="mt-2 block bg-linear-to-r from-[var(--text-primary)] via-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              real AI power
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            Start from a written brief, a screenshot, or a live URL and turn it
            into a polished first draft with stronger hierarchy, responsive
            sections, and cleaner code.
          </p>
        </MotionDiv>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="theme-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8"
          >
            <div className="absolute -right-16 -top-14 h-40 w-40 rounded-full bg-[var(--accent-soft)] blur-3xl" />
            <div className="absolute bottom-2 left-8 h-32 w-32 rounded-full bg-[var(--accent-secondary-soft)] blur-3xl" />

            <div className="relative">
              <div className="grid gap-3 md:grid-cols-3">
                {generationModes.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setMode(option.key)}
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${
                        mode === option.key
                          ? "border-[rgba(99,102,241,0.45)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] bg-[color:var(--muted-bg)] hover:border-[var(--accent-strong)]"
                      }`}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--surface-elevated)] text-[var(--accent)]">
                        <Icon size={18} />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                        {option.label}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                        {option.copy}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    {mode === "prompt"
                      ? "Describe your website"
                      : mode === "image"
                        ? "Upload your screenshot"
                        : "Paste your source URL"}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                    {mode === "prompt"
                      ? "Prompt the first draft"
                      : mode === "image"
                        ? "Rebuild from a screenshot"
                        : "Recreate from a URL"}
                  </h2>
                </div>
                <div className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  {mode === "image"
                    ? "Vision-driven recreation"
                    : mode === "url"
                      ? "Structure-aware rebuild"
                      : "Quality over shortcuts"}
                </div>
              </div>

              <div className="mt-6">
                {mode === "prompt" ? (
                  <textarea
                    onChange={(e) => setPrompt(e.target.value)}
                    value={prompt}
                    placeholder="Describe your website in detail..."
                    className="min-h-[270px] w-full resize-none rounded-[28px] border border-[var(--border)] bg-[color:var(--muted-bg)] p-6 text-sm leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-strong)]"
                  />
                ) : mode === "image" ? (
                  <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[color:var(--muted-bg)] p-5">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-[var(--border)] bg-[color:var(--surface-elevated)] px-6 py-10 text-center transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                        <ImagePlus size={22} />
                      </div>
                      <p className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                        Upload a screenshot
                      </p>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                        Use a clean screenshot of a landing page or product page. The model will recreate the visual structure as closely as possible.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>

                    {referenceImage && (
                      <div className="mt-5 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[color:var(--surface-elevated)] p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {imageName || "Reference screenshot"}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setReferenceImage("");
                              setImageName("");
                            }}
                            className="text-xs font-medium text-[var(--accent)] transition hover:opacity-80"
                          >
                            Remove
                          </button>
                        </div>
                        <img
                          src={referenceImage}
                          alt="Reference screenshot preview"
                          className="max-h-[320px] w-full rounded-[18px] object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-[22px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-5 py-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-strong)]"
                    />
                    <div className="rounded-[24px] border border-[var(--border)] bg-[color:var(--muted-bg)] p-5">
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                        Forgix will fetch the page, extract its visible structure and content hints, and then rebuild it as a clean responsive single-file experience.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <textarea
                  onChange={(e) => setPrompt(e.target.value)}
                  value={prompt}
                  placeholder={
                    mode === "prompt"
                      ? "Optional: add more detail about sections, tone, and style..."
                      : "Optional: add guidance like 'keep the layout but improve responsiveness' or 'match colors more closely'..."
                  }
                  className="min-h-[120px] w-full resize-none rounded-[24px] border border-[var(--border)] bg-[color:var(--muted-bg)] p-5 text-sm leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-strong)]"
                />
              </div>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                  {mode === "prompt"
                    ? "Be specific about layout, tone, audience, sections, and style direction for a stronger first draft."
                    : mode === "image"
                      ? "Add notes only when you want to intentionally change something beyond the screenshot."
                      : "Use notes to tell Forgix what to preserve, what to modernize, or what to simplify from the source URL."}
                </p>

                <MotionButton
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleGenerateWebsite}
                  disabled={!canGenerate}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold transition ${
                    canGenerate
                      ? "border border-[rgba(99,102,241,0.45)] bg-[var(--accent)] text-white shadow-[0_18px_40px_rgba(99,102,241,0.28)] hover:shadow-[0_22px_48px_rgba(99,102,241,0.4)]"
                      : "cursor-not-allowed border border-[var(--border)] bg-[color:var(--muted-bg)] text-[var(--text-secondary)]"
                  }`}
                >
                  {loading
                    ? "Generating..."
                    : mode === "image"
                      ? "Recreate Website"
                      : mode === "url"
                        ? "Rebuild from URL"
                        : "Generate Website"}
                  <ArrowRight size={18} />
                </MotionButton>
              </div>
            </div>
          </MotionDiv>

          <div className="grid gap-6">
            <MotionDiv
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="theme-panel-soft rounded-[28px] p-6"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <WandSparkles size={20} />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                {mode === "prompt"
                  ? "What makes a better prompt"
                  : "How to get a faithful rebuild"}
              </h3>
              <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="rounded-[20px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-4">
                  {mode === "prompt"
                    ? "Mention the product type, audience, and the mood you want."
                    : "Use a clean full-page reference when possible for stronger structural fidelity."}
                </div>
                <div className="rounded-[20px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-4">
                  {mode === "prompt"
                    ? "Call out sections like pricing, testimonials, features, and CTAs."
                    : "Add notes only for intentional changes like responsiveness, polish, or simplified content."}
                </div>
                <div className="rounded-[20px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-4">
                  {mode === "prompt"
                    ? "Include visual direction such as minimal, premium, bold, or startup-style."
                    : "Expect the best results on marketing pages, portfolios, landing pages, and structured product pages."}
                </div>
              </div>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-panel-soft rounded-[28px] p-6"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)]">
                <Layers3 size={20} />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                {mode === "prompt" ? "Prompt ideas" : "Helpful instructions"}
              </h3>
              <div className="mt-5 space-y-3">
                {(mode === "prompt" ? promptIdeas : visualIdeas).map((idea, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="block w-full rounded-[20px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-4 text-left text-sm leading-relaxed text-[var(--text-secondary)] transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </MotionDiv>
          </div>
        </div>

        {loading && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="theme-panel mx-auto mt-10 max-w-4xl rounded-[28px] p-6 sm:p-7"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Current stage
                </p>
                <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                  {PHASES[phaseIndex]}
                </p>
              </div>
              <div className="rounded-full border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]">
                {progress}% complete
              </div>
            </div>

            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[color:var(--muted-bg)]">
              <MotionDiv
                className="h-full rounded-full bg-linear-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.8 }}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
              <span>Forgix is composing layout, code, and polish in sequence.</span>
              <span className="font-medium text-[var(--text-primary)]">Estimated time: ~8-12 minutes</span>
            </div>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}

export default Generate;

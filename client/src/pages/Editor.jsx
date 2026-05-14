import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../config/api";
import {
  ArrowLeft,
  Code2,
  Globe,
  History,
  Layers3,
  MessageSquare,
  Monitor,
  Rocket,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Editor from "@monaco-editor/react";
import ThemeToggle from "../components/ThemeToggle";
import useTheme from "../hooks/useTheme";

const THINKING_STEPS = [
  "Understanding your request...",
  "Planning layout changes...",
  "Improving responsiveness...",
  "Applying animations...",
  "Finalizing update...",
];

function WebsiteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [pendingPrompts, setPendingPrompts] = useState([]);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const activeRequestRef = useRef(null);
  const lastUpdated = website ? new Date(website.updatedAt).toLocaleDateString() : "";

  const MotionDiv = motion.div;

  const queuePrompt = () => {
    const text = prompt.trim();
    if (!text) return;

    setPrompt("");
    setPendingPrompts((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
      },
    ]);
  };

  const processPrompt = async (job) => {
    activeRequestRef.current = job.id;
    setUpdateLoading(true);
    setMessages((current) => [...current, { role: "user", content: job.text }]);

    try {
      const result = await axios.post(
        `${serverUrl}/api/website/update/${id}`,
        { prompt: job.text },
        { withCredentials: true }
      );

      setMessages((current) => [
        ...current,
        { role: "ai", content: result.data.message },
      ]);
      setCode(result.data.code);
      setWebsite((current) =>
        current
          ? {
              ...current,
              latestCode: result.data.code,
              updatedAt: new Date().toISOString(),
            }
          : current
      );
    } catch (requestError) {
      console.log(requestError);
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          content:
            requestError?.response?.data?.message ||
            "I couldn't apply that update. Please try again.",
        },
      ]);
    } finally {
      activeRequestRef.current = null;
      setUpdateLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/website/deploy/${website._id}`,
        { withCredentials: true }
      );
      window.open(result.data.url, "_blank");
    } catch (requestError) {
      console.log(requestError);
    }
  };

  useEffect(() => {
    if (!updateLoading) {
      setThinkingIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      setThinkingIndex((current) => (current + 1) % THINKING_STEPS.length);
    }, 1200);

    return () => clearInterval(intervalId);
  }, [updateLoading]);

  useEffect(() => {
    if (!pendingPrompts.length || activeRequestRef.current) {
      return;
    }

    const [nextPrompt, ...rest] = pendingPrompts;
    setPendingPrompts(rest);
    processPrompt(nextPrompt);
  }, [pendingPrompts, id]);

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/get-by-id/${id}`,
          { withCredentials: true }
        );

        setWebsite(result.data);
        setCode(result.data.latestCode);
        setMessages(result.data.conversation || []);
      } catch (requestError) {
        console.log(requestError);
        setError(requestError?.response?.data?.message || "Error loading website");
      }
    };

    handleGetWebsite();
  }, [id]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-red-400">
        {error}
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const ChatPanel = () => (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] ${
              message.role === "user" ? "ml-auto" : "mr-auto"
            }`}
          >
            <div
              className={`rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-[0_18px_40px_rgba(2,8,23,0.2)] ${
                message.role === "user"
                  ? "bg-linear-to-r from-[var(--accent)] to-[#7c83ff] text-white"
                  : "theme-panel-soft text-[var(--text-primary)]"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {updateLoading && (
          <div className="mr-auto max-w-[85%]">
            <div className="theme-panel-soft rounded-2xl px-4 py-2.5 text-xs italic text-[var(--text-secondary)]">
              {THINKING_STEPS[thinkingIndex]}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] px-5 py-5">
        <div className="flex gap-2">
          <input
            placeholder="Describe Changes..."
            className="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-[color:var(--muted-bg)] px-5 py-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[rgba(99,102,241,0.4)]"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                queuePrompt();
              }
            }}
            value={prompt}
          />
          <button
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(99,102,241,0.45)] bg-[var(--accent)] text-white shadow-[0_18px_40px_rgba(99,102,241,0.28)] transition hover:scale-105 hover:shadow-[0_22px_48px_rgba(99,102,241,0.4)]"
            disabled={!prompt.trim()}
            onClick={queuePrompt}
          >
            <Send size={14} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <span>
            {updateLoading
              ? "Applying current update..."
              : "Ready for your next change."}
          </span>
          <span>
            {pendingPrompts.length > 0
              ? `${pendingPrompts.length} queued`
              : "No queued prompts"}
          </span>
        </div>
      </div>
    </>
  );

  function Header({ onClose }) {
    return (
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div>
          <div className="theme-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em]">
            <History size={12} className="text-[var(--accent)]" />
            Update History
          </div>
          <p className="mt-3 truncate text-lg font-semibold text-[var(--text-primary)]">
            {website.title}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Last updated {lastUpdated}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[rgba(99,102,241,0.1)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }

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
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]">
                Forgix
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                Editor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!website.deployed && (
              <button
                className="flex items-center gap-2 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105"
                onClick={handleDeploy}
              >
                <Rocket size={14} /> Deploy
              </button>
            )}

            <button
              className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[rgba(99,102,241,0.1)] hover:text-[var(--text-primary)] lg:hidden"
              onClick={() => setShowChat(true)}
            >
              <MessageSquare size={18} />
            </button>

            <button
              className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[rgba(99,102,241,0.1)] hover:text-[var(--text-primary)]"
              onClick={() => setShowCode(true)}
            >
              <Code2 size={18} />
            </button>

            <button
              className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[rgba(34,211,238,0.08)] hover:text-[var(--text-primary)]"
              onClick={() => setShowFullPreview(true)}
            >
              <Monitor size={18} />
            </button>
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-[1720px] px-6 pb-8 pt-24">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]"
        >
          <div className="theme-panel relative overflow-hidden rounded-[28px] px-6 py-5">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--accent-soft)] blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="theme-pill inline-flex rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.24em]">
                  Editing workspace
                </div>
                <h1 className="mt-4 text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
                  {website.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
                  Refine structure, adjust visual direction, and preview updates in real time without leaving the workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                    {website.deployed ? "Live project" : "Draft mode"}
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Messages
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                    {messages.length} updates
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-4 col-span-2 sm:col-span-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Updated
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                    {lastUpdated}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="theme-panel-soft rounded-[24px] p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Layers3 size={18} />
              </div>
              <p className="text-base font-semibold text-[var(--text-primary)]">Iterate faster</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Ask for layout, color, or content changes and keep improving the same draft.
              </p>
            </div>
          </div>
        </MotionDiv>

        <div className="grid h-[calc(100vh-8.5rem)] min-h-0 grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="theme-panel hidden min-h-0 flex-col overflow-hidden rounded-[28px] lg:flex">
            <Header />
            <ChatPanel />
          </aside>

          <section className="theme-panel min-h-0 overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)]">
                  <Monitor size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Live Preview
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Changes appear here as soon as they are applied.
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <div className="theme-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em]">
                  <Globe size={12} className="text-[var(--accent-secondary)]" />
                  Browser view
                </div>
              </div>
            </div>

            <div className="h-[calc(100%-4.5rem)] p-4 xl:p-5">
              <div className="theme-preview-frame h-full overflow-hidden rounded-[26px] border border-[var(--border)]">
                <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[color:var(--muted-bg)] px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  <div className="ml-3 rounded-full border border-[var(--border)] bg-[color:var(--surface-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                    {website.deployed ? "Live preview ready" : "Draft preview"}
                  </div>
                </div>
                <iframe
                  className="h-[calc(100%-3.25rem)] w-full bg-white"
                  srcDoc={code}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {showChat && (
          <MotionDiv
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="theme-shell fixed inset-0 z-[9999] flex flex-col"
          >
            <Header onClose={() => setShowChat(false)} />
            <ChatPanel />
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCode && (
          <MotionDiv
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="theme-panel fixed inset-y-0 right-0 z-[9999] flex w-full flex-col overflow-hidden rounded-none border-l lg:w-[45%]"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <span className="text-sm font-medium">index.html</span>
              <button
                onClick={() => setShowCode(false)}
                className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[rgba(99,102,241,0.1)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>
            <Editor
              theme={theme === "light" ? "vs-light" : "vs-dark"}
              value={code}
              language="html"
              onChange={(value) => setCode(value || "")}
            />
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFullPreview && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="theme-shell fixed inset-0 z-[9999] p-4 md:p-6"
          >
            <div className="theme-panel relative h-full overflow-hidden rounded-[28px]">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Full Preview
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Expanded preview in the same workspace theme.
                  </p>
                </div>
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[rgba(99,102,241,0.1)] hover:text-[var(--text-primary)]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="h-[calc(100%-4.5rem)] p-4 xl:p-5">
                <div className="theme-preview-frame h-full overflow-hidden rounded-[24px] border border-[var(--border)]">
                  <iframe
                    className="h-full w-full bg-white"
                    srcDoc={code}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WebsiteEditor;

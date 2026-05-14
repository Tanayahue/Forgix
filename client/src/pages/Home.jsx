import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  ChartNoAxesCombined,
  CheckCircle2,
  Coins,
  CodeXml,
  Layers3,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../config/api";
import LoginModal from "../components/LoginModal";
import ThemeToggle from "../components/ThemeToggle";
import { setUserData } from "../redux/userSlice";

function Home() {
  const MotionDiv = motion.div;
  const MotionH1 = motion.h1;
  const MotionP = motion.p;
  const highlights = [
    {
      title: "AI-generated frontends",
      copy:
        "Structured sections, meaningful hierarchy, and production-minded HTML shipped from one prompt.",
      icon: WandSparkles,
    },
    {
      title: "Responsive by default",
      copy:
        "Layouts are composed for desktop and mobile at the same time, not patched later as an afterthought.",
      icon: Layers3,
    },
    {
      title: "Built to convert",
      copy:
        "Sharper CTAs, stronger trust blocks, and cleaner flows that feel like real product teams touched them.",
      icon: ChartNoAxesCombined,
    },
  ];
  const metrics = [
    { value: "3 min", label: "Average first draft" },
    { value: "50", label: "Credits per generation" },
    { value: "HTML", label: "Export-ready output" },
  ];
  const showcaseCards = [
    {
      title: "Conversion-first structure",
      copy:
        "Hero, proof, offer framing, and CTA rhythm tuned to feel like a polished startup launch.",
      icon: Sparkles,
    },
    {
      title: "Trust baked in",
      copy:
        "Testimonials, feature framing, stat blocks, and clarity patterns that reduce friction fast.",
      icon: ShieldCheck,
    },
    {
      title: "Code you can keep",
      copy:
        "Clean HTML and CSS output that is easier to reuse, refine, and ship outside the generator.",
      icon: CodeXml,
    },
  ];
  const workflow = [
    {
      step: "01",
      title: "Describe the product clearly",
      copy:
        "Share your product, audience, and desired tone. Forgix uses that context to shape layout and messaging.",
    },
    {
      step: "02",
      title: "Generate a polished first draft",
      copy:
        "The platform builds a full responsive page with stronger hierarchy, sections, and visual depth.",
    },
    {
      step: "03",
      title: "Refine and deploy faster",
      copy:
        "Iterate on the generated site, tighten details, and move toward production without starting from zero.",
    },
  ];

  const [openLogin, setOpenLogin] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const avatarUrl =
    userData?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData?.name || "User"
    )}&background=4f46e5&color=ffffff`;
  const initials = (userData?.name || "U").trim().charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      dispatch(setUserData(null));
      setOpenProfile(false);
    }
  };

  const handleDashboardClick = () => {
    setOpenProfile(false);
    navigate("/dashboard");
  };

  return (
    <div className="theme-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[rgba(99,102,241,0.16)] blur-[140px]" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[rgba(56,189,248,0.08)] blur-[120px]" />
        <div className="absolute left-[-6rem] top-[18rem] h-[18rem] w-[18rem] rounded-full bg-[rgba(99,102,241,0.08)] blur-[120px]" />
      </div>

      <MotionDiv className="theme-nav fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            Forgix
          </div>

          <div className="flex items-center gap-6">
            <button className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" onClick={() => navigate("/pricing")}>
              Pricing
            </button>

            {userData ? (
              <div className="relative flex items-center" ref={profileRef}>
                <div className="theme-pill hidden items-center gap-2 rounded-full px-3 py-1.5 text-sm shadow-[0_12px_36px_rgba(2,6,23,0.3)] sm:flex" onClick={() => navigate("/pricing")}>
                  <Coins size={15} className="text-[var(--accent)]" />
                  <span>Credits</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {userData?.credits ?? 500}
                  </span>
                </div>

                <ThemeToggle className="ml-3" />

                <button
                  type="button"
                  onClick={() => setOpenProfile((current) => !current)}
                  className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(99,102,241,0.5)] bg-[var(--accent)] text-sm font-semibold text-white shadow-[0_12px_36px_rgba(99,102,241,0.35)] transition hover:scale-105"
                >
                  {userData?.avatar ? (
                    <img
                      src={avatarUrl}
                      alt={userData?.name || "User"}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </button>

                <AnimatePresence>
                  {openProfile && (
                    <MotionDiv
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="theme-panel absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl"
                    >
                      <div className="border-b border-[var(--border)] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {userData?.name || "User"}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {userData?.email || "No email available"}
                        </p>
                      </div>

                      <div className="border-b border-[var(--border)] px-4 py-3 md:hidden">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <Coins size={14} className="text-[var(--accent)]" />
                          <span>Credits</span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {userData?.credits ?? 500}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDashboardClick}
                        className="block w-full px-4 py-3 text-left text-sm text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
                      >
                        Dashboard
                      </button>

                      <button
                        type="button"
                        onClick={handleLogOut}
                        className="block w-full px-4 py-3 text-left text-sm text-[var(--accent)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
                      >
                        Logout
                      </button>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                className="theme-muted-button rounded-lg px-4 py-2 transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                onClick={() => setOpenLogin(true)}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </MotionDiv>

      <section className="flex min-h-[calc(100vh-7rem)] items-center px-6 pt-32 pb-24">
        <div className="mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="theme-pill flex w-fit items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.24em]"
            >
              <Sparkles size={14} className="text-[var(--accent)]" />
              AI website builder
            </MotionDiv>

            <MotionH1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-7 max-w-5xl text-5xl font-bold tracking-tight md:text-7xl"
            >
              Ship websites that
              <br />
              <span className="bg-linear-to-r from-[var(--accent)] via-[#7c83ff] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                actually convert.
              </span>
            </MotionH1>

            <MotionP
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-7 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]"
            >
              Describe your vision and Forgix turns it into a sharper landing
              page system with premium spacing, stronger messaging, and a
              cleaner product feel from the first draft.
            </MotionP>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(99,102,241,0.45)] bg-[var(--accent)] px-10 py-4 font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.28)] transition hover:scale-105 hover:shadow-[0_22px_48px_rgba(99,102,241,0.4)]"
                onClick={() =>
                  userData ? navigate("/dashboard") : setOpenLogin(true)
                }
              >
                {userData ? "Go to dashboard" : "Get Started"}
                <ArrowRight size={18} />
              </button>

              <button
                className="theme-muted-button inline-flex items-center justify-center rounded-xl px-7 py-4 font-medium transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                onClick={() => navigate("/pricing")}
              >
                See pricing
              </button>
            </MotionDiv>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {metrics.map((metric, index) => (
                <MotionDiv
                  key={metric.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="theme-panel-soft rounded-[22px] px-5 py-5"
                >
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {metric.label}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="theme-panel relative overflow-hidden rounded-[32px] p-6 sm:p-7"
          >
            <div className="absolute -right-16 -top-14 h-44 w-44 rounded-full bg-[var(--accent-soft)] blur-3xl" />
            <div className="absolute -left-16 bottom-2 h-40 w-40 rounded-full bg-[var(--accent-secondary-soft)] blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                    Launch Snapshot
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                    Product-grade first impression
                  </h2>
                </div>
                <div className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
                  Live system
                </div>
              </div>

              <div className="mt-7 rounded-[28px] border border-[var(--border)] bg-[color:var(--muted-bg)] p-5 shadow-[0_24px_70px_rgba(2,8,23,0.12)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Generated page quality
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">
                      Premium UX
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[0_18px_40px_rgba(99,102,241,0.25)]">
                    <WandSparkles size={20} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {showcaseCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.title}
                        className="flex items-start gap-4 rounded-[22px] border border-[var(--border)] bg-[color:var(--surface-elevated)] px-4 py-4"
                      >
                        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {card.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                            {card.copy}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-18">
        <div className="theme-panel rounded-[30px] px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="theme-pill inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.24em]">
                Why teams choose Forgix
              </div>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                Stronger structure, better polish, less time wasted on blank
                canvases.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
              Designed to feel closer to a serious product workflow than a
              toy generator, with sharper cards, cleaner information design,
              and a more confident landing-page rhythm.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {highlights.map((highlight, index) => (
            <MotionDiv
              key={highlight.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.25 }}
              className="theme-panel-soft min-h-[220px] rounded-[26px] px-6 py-7 transition hover:border-[rgba(99,102,241,0.36)] hover:bg-[color:var(--surface-elevated)]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <highlight.icon size={20} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
                {highlight.title}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {highlight.copy}
              </p>

              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                <CheckCircle2 size={16} />
                Ready for serious iteration
              </div>
            </MotionDiv>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="theme-panel-soft rounded-[30px] p-8">
            <div className="theme-pill inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.24em]">
              Workflow
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-[var(--text-primary)]">
              A tighter path from idea to shipped page.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
              The experience is designed so the first draft feels useful,
              presentable, and worth refining instead of something you have to
              throw away.
            </p>
          </div>

          <div className="grid gap-5">
            {workflow.map((item, index) => (
              <MotionDiv
                key={item.step}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.3 }}
                className="theme-panel flex flex-col gap-5 rounded-[28px] p-6 sm:flex-row sm:items-start"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.24)]">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.copy}
                  </p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-10 text-center text-sm text-[var(--text-secondary)]">
        &copy; {new Date().getFullYear()} Forgix
      </footer>

      {openLogin && (
        <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </div>
  );
}

export default Home;

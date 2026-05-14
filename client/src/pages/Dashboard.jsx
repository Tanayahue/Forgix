import { ArrowLeft, Check, Globe, LayoutGrid, Plus, Rocket, Share2, Sparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../config/api'
import ThemeToggle from '../components/ThemeToggle'
function Dashboard() {
    const MotionDiv = motion.div
    const MotionButton = motion.button
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const [websites, setWebsites] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [copiedId, setCopiedId] = useState(null)
    const websiteCount = websites?.length || 0
    const deployedCount = websites?.filter((site) => site.deployed).length || 0
    const handleDeploy = async (id) => {
        try {
            const result = await axios.get(`${serverUrl}/api/website/deploy/${id}`, { withCredentials: true })
            window.open(`${result.data.url}`, "_blank")
            setWebsites((prev) =>
        prev.map((w) =>
          w._id === id
            ? { ...w, deployed: true, deployUrl: result.data.url }
            : w
        )
      );
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Failed to deploy website")
        }
    }

    useEffect(() => {
        const handleGetAllWebsites = async () => {
            setLoading(true)
            try {

                const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
                setWebsites(result.data || [])
                setLoading(false)
            } catch (error) {
                setError(error.response?.data?.message || error.message || "Failed to load websites")
                setLoading(false)
            }
        }
        handleGetAllWebsites()
    }, [])

    const handleCopy = async (site) => {
        await navigator.clipboard.writeText(site.deployUrl)
        setCopiedId(site._id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className='theme-shell relative min-h-screen overflow-hidden'>
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[rgba(99,102,241,0.16)] blur-[140px]' />
                <div className='absolute bottom-[-8rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[rgba(56,189,248,0.08)] blur-[120px]' />
                <div className='absolute left-[-6rem] top-[18rem] h-[18rem] w-[18rem] rounded-full bg-[rgba(99,102,241,0.08)] blur-[120px]' />
            </div>

            <div className='theme-nav fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)]'>
                <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
                    <div className='flex items-center gap-4'>
                        <button
                            className='theme-muted-button rounded-lg p-2 transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]'
                            onClick={() => navigate("/")}
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <p className='text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]'>Forgix</p>
                            <p className='text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]'>Dashboard</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <ThemeToggle />
                        <button
                            className='inline-flex items-center gap-2 rounded-xl border border-[rgba(99,102,241,0.45)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.28)] transition hover:scale-105 hover:shadow-[0_22px_48px_rgba(99,102,241,0.4)]'
                            onClick={() => navigate("/generate")}
                        >
                            <Plus size={16} />
                            New Website
                        </button>
                    </div>
                </div>
            </div>
            <div className='relative mx-auto max-w-7xl px-6 pt-28 pb-10'>
                <MotionDiv
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className='theme-panel relative overflow-hidden rounded-[32px] px-6 py-7 sm:px-8 sm:py-8'>
                        <div className='absolute -right-14 -top-12 h-40 w-40 rounded-full bg-[var(--accent-soft)] blur-3xl' />
                        <div className='absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[var(--accent-secondary-soft)] blur-3xl' />

                        <div className='relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end'>
                            <div>
                                <div className='theme-pill mb-4 inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.24em]'>
                                    Your websites
                                </div>
                                <p className='mb-2 text-sm text-[var(--text-secondary)]'>Welcome Back</p>
                                <h1 className='max-w-2xl text-3xl font-bold text-[var(--text-primary)] md:text-5xl'>{userData?.name}</h1>
                                <p className='mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] md:text-base'>
                                    Manage your generated sites, deploy polished versions faster, and keep every experiment in one cleaner workspace.
                                </p>
                            </div>

                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3'>
                                <div className='rounded-[24px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-5 py-5 shadow-[0_20px_60px_rgba(2,8,23,0.08)]'>
                                    <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]'>
                                        <LayoutGrid size={18} />
                                    </div>
                                    <p className='text-2xl font-semibold text-[var(--text-primary)]'>{websiteCount}</p>
                                    <p className='mt-1 text-sm text-[var(--text-secondary)]'>Projects created</p>
                                </div>
                                <div className='rounded-[24px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-5 py-5 shadow-[0_20px_60px_rgba(2,8,23,0.08)]'>
                                    <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)]'>
                                        <Globe size={18} />
                                    </div>
                                    <p className='text-2xl font-semibold text-[var(--text-primary)]'>{deployedCount}</p>
                                    <p className='mt-1 text-sm text-[var(--text-secondary)]'>Sites deployed</p>
                                </div>
                                <div className='rounded-[24px] border border-[var(--border)] bg-[color:var(--muted-bg)] px-5 py-5 shadow-[0_20px_60px_rgba(2,8,23,0.08)]'>
                                    <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]'>
                                        <Sparkles size={18} />
                                    </div>
                                    <p className='text-2xl font-semibold text-[var(--text-primary)]'>Ready</p>
                                    <p className='mt-1 text-sm text-[var(--text-secondary)]'>For your next launch</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </MotionDiv>

                {loading && (
                    <div className="mt-24 text-center text-[var(--text-secondary)]">Loading your websites...</div>
                )}

                {error && !loading && (
                    <div className="mt-24 text-center text-red-400">{error}</div>
                )}

                {websites?.length == 0 && (
                    <div className="theme-panel mx-auto mt-24 max-w-xl rounded-[24px] px-8 py-12 text-center">
                        <p className="text-lg font-semibold text-[var(--text-primary)]">You have no websites yet</p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">Start a new project and Forgix will generate your first site.</p>
                        <button
                            className='mt-6 rounded-xl border border-[rgba(99,102,241,0.45)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.28)] transition hover:scale-105 hover:shadow-[0_22px_48px_rgba(99,102,241,0.4)]'
                            onClick={() => navigate("/generate")}
                        >
                            Create a website
                        </button>
                    </div>
                )}

                {!loading && !error && websites?.length > 0 && (
                    <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3'>
                        {websites.map((w, i) => {

                            const copied = copiedId === w._id

                            return <MotionDiv
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -6 }}

                                className="theme-panel-soft flex flex-col overflow-hidden rounded-[28px] transition hover:border-[rgba(99,102,241,0.36)] hover:bg-[color:var(--surface-elevated)]"
                            >
                                <div className='relative h-44 cursor-pointer overflow-hidden bg-[var(--preview-bg)]' onClick={() => navigate(`/editor/${w._id}`)}>
                                    <iframe srcDoc={w.latestCode} className='absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white' />
                                    <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0.03),rgba(11,16,32,0.42))]' />
                                    <div className='absolute left-4 top-4 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/85 backdrop-blur-md'>
                                        {w.deployed ? "Live Project" : "Draft"}
                                    </div>
                                </div>

                                <div className='flex flex-1 flex-col gap-4 p-5'>
                                    <div className='flex items-start justify-between gap-3'>
                                        <div>
                                            <h3 className='text-lg font-semibold text-[var(--text-primary)] line-clamp-2'>{w.title}</h3>
                                            <p className='mt-2 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]'>Website Project</p>
                                        </div>
                                        <div className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
                                            w.deployed
                                                ? "bg-emerald-500/12 text-emerald-400"
                                                : "bg-[var(--accent-soft)] text-[var(--accent)]"
                                        }`}>
                                            {w.deployed ? "Deployed" : "Not Live"}
                                        </div>
                                    </div>

                                    <p className='text-sm text-[var(--text-secondary)]'>Last Updated {""}
                                        {new Date(w.updatedAt).toLocaleDateString()}
                                    </p>

                                    {!w.deployed ? (
                                        <button className=" mt-auto flex items-center justify-center gap-2
                          px-4 py-2 rounded-xl text-sm font-semibold
                          border border-[rgba(99,102,241,0.45)] bg-[var(--accent)] text-white
                          shadow-[0_18px_40px_rgba(99,102,241,0.28)] hover:scale-105 hover:shadow-[0_22px_48px_rgba(99,102,241,0.4)] transition
                        "
                                            onClick={() => handleDeploy(w._id)}

                                        ><Rocket size={18} /> Deploy</button>
                                    ) : (<MotionButton
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCopy(w)}
                                        className={`
                          mt-auto flex items-center justify-center gap-2
                          px-4 py-2 rounded-xl text-sm font-medium
                          transition-all
                          ${copied
                                                ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                                                : "border border-[var(--border)] bg-[rgba(17,24,43,0.72)] text-[var(--text-primary)] hover:border-[rgba(99,102,241,0.4)] hover:bg-[var(--accent-soft)]"
                                            }
                        `}
                                    >
                                        { copied?(
                                            <>
                                            <Check size={14}/>
                                            Link Copied
                                            </>
                                        ):
                                        <>
                                        <Share2 size={14}/>
                                        Share Link
                                        </>
                                        }
                                    </MotionButton>)}

                                </div>

                            </MotionDiv>
                        })}

                    </div>
                )}


            </div>
        </div>
    )
}

export default Dashboard

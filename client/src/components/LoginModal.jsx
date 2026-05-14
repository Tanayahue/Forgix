import React from 'react'
import { AnimatePresence, motion } from "motion/react"
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase'
import axios from "axios"
import { serverUrl } from '../config/api'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
function LoginModal({ open, onClose }) {
const dispatch=useDispatch()
    const MotionDiv = motion.div
    const MotionButton = motion.button
    const handleGoogleAuth=async ()=>{
        try {
            const result=await signInWithPopup(auth,provider)
            await axios.post(`${serverUrl}/api/auth/google`,{
                name:result.user.displayName,
                email:result.user.email,
                avatar:result.user.photoURL
            },{withCredentials:true})

            const sessionResponse = await axios.get(`${serverUrl}/api/user/me`, {
                withCredentials: true
            })

            dispatch(setUserData(sessionResponse.data.user))
            onClose()
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <AnimatePresence>
            {open &&
                <MotionDiv
                    className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(6,9,17,0.82)] backdrop-blur-xl px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >

                    <MotionDiv
                        initial={{ scale: 0.88, opacity: 0, y: 60 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="relative w-full max-w-md rounded-3xl border border-[rgba(99,102,241,0.2)] bg-[linear-gradient(180deg,rgba(99,102,241,0.14),rgba(17,24,43,0.04))] p-[1px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[rgba(17,24,43,0.96)] shadow-[0_40px_140px_rgba(2,8,23,0.78)]' >
                            <MotionDiv
                                animate={{ opacity: [0.16, 0.25, 0.16] }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="absolute -top-32 -left-32 h-80 w-80 bg-[rgba(99,102,241,0.18)] blur-[140px]"
                            />
                            <MotionDiv
                                animate={{ opacity: [0.08, 0.16, 0.08] }}
                                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                                className="absolute -bottom-32 -right-32 h-80 w-80 bg-[rgba(56,189,248,0.12)] blur-[140px]"
                            />

                            <button
                                className='absolute top-5 right-5 z-20 text-lg text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]'
                                onClick={onClose}
                            >
                                X
                            </button>


                            <div className='relative px-8 pt-14 pb-10 text-center'>
                                <h1 className='theme-pill mb-6 inline-block rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.22em]'>AI-powered website builder</h1>
                                <h2 className='text-3xl font-semibold leading-tight mb-3 space-x-2'>
                                    <span className='text-[var(--text-primary)]'>Welcome to</span>
                                    <span className='bg-linear-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent'>Forgix</span>
                                </h2>
                                <p className='mb-8 text-sm leading-relaxed text-[var(--text-secondary)]'>
                                    Secure access to your workspace with a cleaner dark interface and one focused accent.
                                </p>

                                <MotionButton
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleGoogleAuth}
                                    className="group relative h-13 w-full overflow-hidden rounded-xl border border-[rgba(99,102,241,0.45)] bg-[var(--accent)] font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.32)]"
                                >

                                    <div className='relative flex items-center justify-center gap-3'>
                                        <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" alt="" className='h-5 w-5' />
                                        Continue with Google
                                    </div>

                                </MotionButton>

                                <div className='flex items-center gap-4 my-10'>
                                    <div className='h-px flex-1 bg-[var(--border)]' />
                                    <span className='text-xs tracking-wide text-[var(--text-secondary)]'>Secure Login</span>
                                    <div className='h-px flex-1 bg-[var(--border)]' />
                                </div>

                                <p className='text-xs leading-relaxed text-[var(--text-secondary)]'>
                                    By continuing, you agree to our{" "}
                                    <span className="cursor-pointer underline hover:text-[var(--text-primary)]">
                                        Terms of Service
                                    </span>{" "}
                                    and{" "}
                                    <span className="cursor-pointer underline hover:text-[var(--text-primary)]">
                                        Privacy Policy
                                    </span>.
                                </p>

                            </div>


                        </div>
                    </MotionDiv>

                </MotionDiv>}
        </AnimatePresence>
    )
}

export default LoginModal

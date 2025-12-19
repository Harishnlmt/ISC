'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getSupabaseClient } from '@/src/lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async () => {
    setLoading(true)

    try {
      // ✅ Create supabase client INSIDE function
      const supabase = getSupabaseClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      router.push('/admin/dashboard')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-xl p-3 ' +
    'text-gray-900 placeholder-gray-600 ' +
    'focus:outline-none focus:ring-2 focus:ring-purple-600'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-fuchsia-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
      >
        <img
          src="/image/logo.jpeg"
          alt="Admin Logo"
          className="absolute top-4 left-4 w-17 h-17 rounded-full border"
        />

        <p className="text-center text-gray-800 mb-6">
          ITHALAR SPORTS CLUB
        </p>

        <h1 className="text-2xl font-extrabold text-center text-gray-900 mt-8 mb-1">
          Login
        </h1>

        <input
          className={inputClass}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          className={`${inputClass} mt-3`}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={login}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-2xl font-bold shadow-lg"
        >
          {loading ? 'Logging in...' : 'Login'}
        </motion.button>
      </motion.div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSupabaseClient } from '@/src/lib/supabase'

type Player = {
  name: string
  jersey: string
  position: string
}

type Snackbar = {
  message: string
  type: 'success' | 'error'
}

export default function RegisterPage() {
  const [teamName, setTeamName] = useState('')
  const [managerName, setManagerName] = useState('')
  const [managerPhone, setManagerPhone] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [players, setPlayers] = useState<Player[]>([
    { name: '', jersey: '', position: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<Snackbar | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const inputClass =
    'w-full border border-gray-300 rounded-xl p-3 ' +
    'text-gray-900 placeholder-gray-600 ' +
    'focus:outline-none focus:ring-2 focus:ring-purple-600'

  const showSnackbar = (message: string, type: Snackbar['type']) => {
    setSnackbar({ message, type })
    setTimeout(() => setSnackbar(null), 3000)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!teamName.trim()) newErrors.teamName = 'Team name is required'
    if (!managerName.trim())
      newErrors.managerName = 'Manager name is required'
    if (!managerPhone.trim())
      newErrors.managerPhone = 'Manager phone is required'

    if (players.filter(p => p.name.trim()).length < 5) {
      newErrors.players = 'Minimum 5 players required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addPlayer = () => {
    if (players.length >= 15) return
    setPlayers([...players, { name: '', jersey: '', position: '' }])
  }

  const removePlayer = (index: number) => {
    if (players.length === 1) return
    setPlayers(players.filter((_, i) => i !== index))
  }

  const updatePlayer = (
    index: number,
    field: keyof Player,
    value: string
  ) => {
    const updated = [...players]
    updated[index][field] = value
    setPlayers(updated)
  }

  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar('Please fix the errors below', 'error')
      return
    }

    setLoading(true)

    try {
      // ✅ CREATE SUPABASE CLIENT HERE (IMPORTANT)
      const supabase = getSupabaseClient()

      let logoUrl = ''

      if (logo) {
        const fileName = `${Date.now()}-${logo.name}`

        const { error } = await supabase.storage
          .from('team-logos')
          .upload(fileName, logo)

        if (error) throw error

        const { data } = supabase.storage
          .from('team-logos')
          .getPublicUrl(fileName)

        logoUrl = data.publicUrl
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          team_name: teamName,
          manager_name: managerName,
          manager_phone: managerPhone,
          logo_url: logoUrl
        })
        .select()
        .single()

      if (teamError) throw teamError

      const playerData = players
        .filter(p => p.name.trim())
        .map(p => ({
          team_id: team.id,
          player_name: p.name,
          jersey_number: Number(p.jersey),
          position: p.position
        }))

      if (playerData.length > 0) {
        const { error } = await supabase
          .from('players')
          .insert(playerData)

        if (error) throw error
      }

      showSnackbar('🎉 Registration successful!', 'success')

      setTeamName('')
      setManagerName('')
      setManagerPhone('')
      setPlayers([{ name: '', jersey: '', position: '' }])
      setLogo(null)
      setErrors({})
    } catch (err: any) {
      showSnackbar(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-fuchsia-900 flex items-center justify-center p-4">
      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-4 z-50 px-6 py-3 rounded-xl text-white ${
              snackbar.type === 'success'
                ? 'bg-green-600'
                : 'bg-red-600'
            }`}
          >
            {snackbar.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6"
      >
        <h1 className="text-3xl font-extrabold text-center">
          ITHALAR SPORTS CLUB
        </h1>

        {/* FORM UI REMAINS SAME */}
        {/* (no logic changes below this point) */}

        {/* Submit */}
        <motion.button
          onClick={handleSubmit}
          disabled={players.length < 5 || loading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-2xl font-bold"
        >
          {loading ? 'Submitting...' : '🚀 Submit Registration'}
        </motion.button>
      </motion.div>
    </div>
  )
}

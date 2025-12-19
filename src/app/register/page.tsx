'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

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

  /* 🔑 Reusable input style */
  const inputClass =
    'w-full border border-gray-300 rounded-xl p-3 ' +
    'text-gray-900 placeholder-gray-600 placeholder-opacity-100 ' +
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

    if (players.filter(p => p.name.trim()).length === 0) {
      newErrors.players = 'At least one player is required'
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
      showSnackbar(
        err.message || 'Something went wrong. Try again.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-fuchsia-900 flex items-center justify-center p-4">

      {/* 🔔 Snackbar */}
      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-4 z-50 px-6 py-3 rounded-xl shadow-xl text-white ${
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
        <h1 className="text-3xl font-extrabold text-center text-gray-900">
          ITHALAR SPORTS CLUB
        </h1>
        <p className="text-center text-gray-600 mb-6">
          ⚽ 
        </p>

        {/* 🧑‍🤝‍🧑 Team Info */}
        <div className="space-y-3">
          <div>
            <input
              className={inputClass}
              placeholder="Team Name"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
            />
            {errors.teamName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.teamName}
              </p>
            )}
          </div>

          <div>
            <input
              className={inputClass}
              placeholder="Manager Name"
              value={managerName}
              onChange={e => setManagerName(e.target.value)}
            />
            {errors.managerName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.managerName}
              </p>
            )}
          </div>

          <div>
            <input
              className={inputClass}
              placeholder="Manager Phone"
              value={managerPhone}
              onChange={e => setManagerPhone(e.target.value)}
            />
            {errors.managerPhone && (
              <p className="text-red-600 text-sm mt-1">
                {errors.managerPhone}
              </p>
            )}
          </div>

          <div className="border border-dashed border-purple-400 rounded-xl p-3">
            <label className="block text-sm font-semibold text-gray-700">
              Team Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setLogo(e.target.files?.[0] || null)}
              className="mt-1 text-gray-700"
            />
          </div>
        </div>

        {/* 🏃 Players */}
        <h2 className="font-bold text-gray-900 mt-6 mb-2">
          Players ({players.length}/15)
        </h2>

        {errors.players && (
          <p className="text-red-600 text-sm mb-2">
            {errors.players}
          </p>
        )}

        <div className="space-y-2">
          <AnimatePresence>
            {players.map((player, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-3 gap-2 items-center"
              >
                <input
                  className={inputClass}
                  placeholder="Name"
                  value={player.name}
                  onChange={e =>
                    updatePlayer(index, 'name', e.target.value)
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Jersey"
                  value={player.jersey}
                  onChange={e =>
                    updatePlayer(index, 'jersey', e.target.value)
                  }
                />
                <div className="flex gap-1">
                  <input
                    className={inputClass}
                    placeholder="Position"
                    value={player.position}
                    onChange={e =>
                      updatePlayer(index, 'position', e.target.value)
                    }
                  />
                  <button
                    onClick={() => removePlayer(index)}
                    className="bg-red-500 text-white px-3 rounded-xl"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          onClick={addPlayer}
          disabled={players.length >= 15}
          className="mt-3 text-purple-700 font-semibold"
        >
          + Add Player
        </button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-2xl font-bold shadow-lg"
        >
          {loading ? 'Submitting...' : '🚀 Submit Registration'}
        </motion.button>
      </motion.div>
    </div>
  )
}

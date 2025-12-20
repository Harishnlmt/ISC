'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

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
    'w-full border rounded-xl p-3 text-gray-900 placeholder-gray-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-purple-600'

  const showSnackbar = (message: string, type: Snackbar['type']) => {
    setSnackbar({ message, type })
    setTimeout(() => setSnackbar(null), 3000)
  }

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!teamName.trim())
      newErrors.teamName = 'Team name is required'

    if (!managerName.trim())
      newErrors.managerName = 'Manager name is required'

    if (!managerPhone.trim())
      newErrors.managerPhone = 'Manager phone is required'
    else if (!/^[6-9]\d{9}$/.test(managerPhone))
      newErrors.managerPhone = 'Enter valid 10-digit Indian mobile number'

    const filledPlayers = players.filter(p => p.name.trim())

    if (filledPlayers.length !== 11)
      newErrors.playersCount = 'Exactly 11 players are required'

    const jerseySet = new Set<string>()

    for (const p of filledPlayers) {
      if (!p.position.trim()) {
        newErrors.playersPosition = 'Each player must have a position'
        break
      }

      if (!/^\d+$/.test(p.jersey)) {
        newErrors.playersJersey = 'Jersey numbers must be numeric'
        break
      }

      if (jerseySet.has(p.jersey)) {
        newErrors.playersDuplicate = 'Duplicate jersey numbers found'
        break
      }

      jerseySet.add(p.jersey)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ---------------- PLAYER HANDLERS ---------------- */
  const addPlayer = () => {
    if (players.length >= 11) return
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

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar('Please fix the errors', 'error')
      return
    }

    setLoading(true)

    try {
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

      const playerRows = players.map(p => ({
        team_id: team.id,
        player_name: p.name,
        jersey_number: Number(p.jersey),
        position: p.position
      }))

      const { error: playerError } = await supabase
        .from('players')
        .insert(playerRows)

      if (playerError) throw playerError

      showSnackbar('🎉 Registration Successful!', 'success')

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      showSnackbar(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-fuchsia-900 flex items-center justify-center p-4">
      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
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
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-600">
          ITHALAR SPORTS CLUB
        </h1>

        {/* TEAM INFO */}
        <div className="space-y-3">
          <input className={inputClass} placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} />
          {errors.teamName && <p className="text-red-600 text-sm">{errors.teamName}</p>}

          <input className={inputClass} placeholder="Manager Name" value={managerName} onChange={e => setManagerName(e.target.value)} />
          {errors.managerName && <p className="text-red-600 text-sm">{errors.managerName}</p>}

          <input className={inputClass} placeholder="Manager Phone" value={managerPhone} onChange={e => setManagerPhone(e.target.value)} />
          {errors.managerPhone && <p className="text-red-600 text-sm">{errors.managerPhone}</p>}

<div className="border-2 border-dashed border-purple-400 rounded-xl p-4">
<label className="block text-sm font-semibold text-gray-700 mb-2">
  Team Logo (optional)
</label>

<input
  type="file"
  accept="image/*"
  onChange={e => setLogo(e.target.files?.[0] || null)}
  className="block w-full text-sm text-gray-700
             file:mr-4 file:py-2 file:px-4
             file:rounded-full file:border-0
             file:text-sm file:font-semibold
             file:bg-purple-100 file:text-purple-700
             hover:file:bg-purple-200"
/>

{logo && (
  <p className="text-xs text-gray-500 mt-2">
    Selected: {logo.name}
  </p>
)}
</div>
      </div>

        {/* PLAYER ERRORS */}
        <div className="mt-4 space-y-1">
          {errors.playersCount && <p className="text-red-600 text-sm">{errors.playersCount}</p>}
          {errors.playersPosition && <p className="text-red-600 text-sm">{errors.playersPosition}</p>}
          {errors.playersJersey && <p className="text-red-600 text-sm">{errors.playersJersey}</p>}
          {errors.playersDuplicate && <p className="text-red-600 text-sm">{errors.playersDuplicate}</p>}
        </div>

        {/* PLAYERS */}
        <h2 className="font-bold mt-4 mb-2 text-gray-600">Players ({players.length}/11)</h2>

        <div className="space-y-2">
          {players.map((p, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input className={inputClass} placeholder="Name" value={p.name} onChange={e => updatePlayer(i, 'name', e.target.value)} />
              <input className={inputClass} placeholder="Jersey" value={p.jersey} onChange={e => updatePlayer(i, 'jersey', e.target.value)} />
              <div className="flex gap-1">
                <input className={inputClass} placeholder="Position" value={p.position} onChange={e => updatePlayer(i, 'position', e.target.value)} />
                <button onClick={() => removePlayer(i)} className="bg-red-500 text-white px-3 rounded-xl">✕</button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addPlayer} disabled={players.length >= 11} className="mt-3 text-purple-700 font-semibold">
          + Add Player
        </button>

        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-2xl font-bold"
        >
          {loading ? 'Submitting...' : '🚀 Submit Registration'}
        </motion.button>
      </motion.div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AdminGuard from '@/src/components/AdminGuard'
import { getSupabaseClient } from '@/src/lib/supabase'

export default function TeamDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [team, setTeam] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // ✅ Create supabase client INSIDE function
    const supabase = getSupabaseClient()

    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (teamError) {
      console.error(teamError)
      return
    }

    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', id)
      .order('jersey_number', { ascending: true })

    if (playersError) {
      console.error(playersError)
      return
    }

    setTeam(teamData)
    setPlayers(playersData || [])
  }

  if (!team) return null

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-fuchsia-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white rounded-3xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={team.logo_url}
              alt={team.team_name}
              className="w-24 h-24 rounded-2xl object-cover border"
            />

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight line-clamp-2">
                {team.team_name}
              </h1>

              <p className="text-gray-600 text-sm">
                👤 Manager:{' '}
                <span className="font-semibold">{team.manager_name}</span>
              </p>

              <p className="text-gray-600 text-sm">
                📞 Phone:{' '}
                <span className="font-semibold">{team.manager_phone}</span>
              </p>

              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                  team.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : team.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {team.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Players */}
          <h2 className="font-bold text-lg text-gray-900 mb-3">
            Players ({players.length})
          </h2>

          <div className="grid gap-3">
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-gray-50 border rounded-2xl p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {i + 1}. {p.player_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Position: {p.position}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-500">Jersey</span>
                  <p className="text-lg font-extrabold text-purple-600">
                    #{p.jersey_number}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => router.back()}
              className="text-purple-600 font-semibold"
            >
              ← Back
            </button>
          </div>
        </motion.div>
      </div>
    </AdminGuard>
  )
}

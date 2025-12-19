"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AdminGuard from '@/src/components/AdminGuard'
import { getSupabaseClient } from '@/src/lib/supabase'

type Team = {
  id: string
  team_name: string
  manager_name: string
  status: string
  logo_url: string
}

export default function AdminDashboard() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setTeams(data || [])
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = getSupabaseClient()

    await supabase
      .from('teams')
      .update({ status })
      .eq('id', id)

    loadTeams()
  }

  const logout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-fuchsia-900 p-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-extrabold text-white">
              Ithalar Sports Club
            </h1>

            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-xl"
            >
              Logout
            </button>
          </div>

          <h2 className="text-white font-semibold mb-3">
            Teams Registered
          </h2>

          {/* Team Cards */}
          <div className="grid gap-4">
            {teams.map(team => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-xl"
              >
                <img
                  src={team.logo_url}
                  alt={team.team_name}
                  className="w-16 h-16 rounded-xl object-cover border"
                />

                <div className="flex-1 min-w-0">
                  <h2 className="font-extrabold text-lg text-gray-900 line-clamp-2">
                    {team.team_name}
                  </h2>

                  <p className="text-gray-600 text-sm truncate">
                    Manager: {team.manager_name}
                  </p>

                  <span
                    className={`inline-block mt-1 text-xs px-3 py-1 rounded-full font-semibold ${
                      team.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : team.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                <div className="flex flex-col gap-2 min-w-[90px]">
                  <button
                    onClick={() => updateStatus(team.id, 'approved')}
                    className="px-3 py-1.5 rounded-full text-xs font-bold
                               bg-gradient-to-r from-green-500 to-emerald-500
                               text-white shadow-md hover:scale-105 transition"
                  >
                    ✔ Approve
                  </button>

                  <button
                    onClick={() => updateStatus(team.id, 'rejected')}
                    className="px-3 py-1.5 rounded-full text-xs font-bold
                               bg-gradient-to-r from-yellow-400 to-orange-500
                               text-white shadow-md hover:scale-105 transition"
                  >
                    ✖ Reject
                  </button>

                  <Link
                    href={`/admin/team/${team.id}`}
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-center
                               bg-gradient-to-r from-blue-500 to-indigo-500
                               text-white shadow-md hover:scale-105 transition"
                  >
                    👁 View
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}

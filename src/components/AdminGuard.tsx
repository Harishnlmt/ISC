'use client'

import { useEffect, useState } from 'react'
// import { supabase } from '@/src/lib/supabase'
import { getSupabaseClient } from "@/src/lib/supabase";
import { useRouter } from 'next/navigation'

export default function AdminGuard({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
        const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/admin/login')
      } else {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )

  return <>{children}</>
}

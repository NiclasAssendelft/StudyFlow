import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServer()

  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

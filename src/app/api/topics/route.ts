import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()

  const { searchParams } = new URL(request.url)
  const area = searchParams.get('area')

  let query = supabase
    .from('topics')
    .select('*')
    .order('sort_order', { ascending: true })

  if (area) {
    query = query.eq('area', area)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

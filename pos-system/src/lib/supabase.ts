import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.error('[supabase] ❌ Missing env vars!', { url: !!url, key: !!key })
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

console.log('[supabase] Connecting to', url)
export const supabase = createClient(url, key)

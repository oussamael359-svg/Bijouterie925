import { createClient } from '@supabase/supabase-js'

// حط هنا الـ URL اللي نسختي من Supabase
const supabaseUrl = 'https://tviqqepzodiikcrjsdgd.supabase.co'

// حط هنا المفتاح anon public key الطويل اللي نسختي
const supabaseAnonKey = 'حط_المفتاح_الطويل_هنا'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 
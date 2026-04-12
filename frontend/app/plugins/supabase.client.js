import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  console.log('SUPABASE URL:', config.public.supabaseUrl)
  console.log('SUPABASE KEY:', config.public.supabaseAnonKey)

  const supabase = createClient(
    //'https://exxxlorfdjbmhibfmran.supabase.co',
    //'sb_publishable_3daVxdt_TYWrzITCVfzlnA_i4Tml1JC'
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  return {
    provide: {
      supabase
    }
  }
})
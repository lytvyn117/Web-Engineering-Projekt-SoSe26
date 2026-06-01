/* This middleware was created with the help of Chat GPT to ensure only admin users can access the admin panel.
There was a problem with connection to Supabase so I asked Chat GPT for help. */

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { $supabase } = useNuxtApp()

  const {
    data: { session }
  } = await $supabase.auth.getSession()

  if (!session?.user) {
    return navigateTo('/admin-login')
  }

  const { data: adminProfile, error } = await $supabase
    .from('admin_profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (error || !adminProfile?.is_admin) {
    return navigateTo('/admin-login')
  }

  //console.log('MIDDLEWARE SESSION:', session)
})
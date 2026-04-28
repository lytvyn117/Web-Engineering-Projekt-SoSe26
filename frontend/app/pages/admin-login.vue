<script setup>
const { $supabase } = useNuxtApp()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function login() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Bitte E-Mail und Passwort eingeben.'
    return
  }

  const { data, error } = await $supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    errorMessage.value = 'Login fehlgeschlagen.'
    return
  }

  const userId = data.user.id

  const { data: adminProfile, error: profileError } = await $supabase
    .from('admin_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (profileError || !adminProfile?.is_admin) {
    errorMessage.value = 'Kein Admin-Zugriff.'
    await $supabase.auth.signOut()
    return
  }

  router.push('/admin')
}
</script>

<template>
  <div class="page">
    <h1>Admin-Login</h1>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div class="login-form">
      <input v-model="email" type="email" placeholder="E-Mail" />
      <input v-model="password" type="password" placeholder="Passwort" />
      <button @click="login">Einloggen</button>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 24px;
  font-family: Arial, sans-serif;
}

.login-form {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input,
button {
  padding: 10px;
  font-size: 16px;
}

.error-message {
  color: #b00020;
  font-weight: bold;
}
</style>
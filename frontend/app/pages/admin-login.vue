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
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
  text-align: center;
}

h1 {
  font-size: 42px;
  margin-bottom: 24px;
}

h2 {
  font-size: 24px;
  margin-top: 32px;
  margin-bottom: 16px;
}

.login-form {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

button {
  padding: 10px 16px;
  font-size: 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

button:hover {
  background: #f3f4f6;
}

input,
select,
textarea {
  padding: 10px 12px;
  font-size: 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.error-message {
  color: #b00020;
  font-weight: bold;
}
</style>
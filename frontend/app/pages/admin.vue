<script setup>
definePageMeta({
  middleware: 'admin'
})

const { $supabase } = useNuxtApp()

const slots = ref([])
const errorMessage = ref('')

const slotDate = ref('')
const slotTime = ref('')
const successMessage = ref('')

const allBookings = ref([])

const router = useRouter()
const isCheckingAccess = ref(true)
const isAuthorized = ref(false)

async function loadSlots() {
  errorMessage.value = ''

  const { data, error } = await $supabase
    .from('slots')
    .select('*')
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true })

  if (error) {
    errorMessage.value = 'Slots konnten nicht geladen werden.'
    return
  }

  slots.value = data
}

async function toggleBlock(slot) {
  errorMessage.value = ''

  const { error } = await $supabase
    .from('slots')
    .update({ is_blocked: !slot.is_blocked })
    .eq('id', slot.id)

  if (error) {
    errorMessage.value = 'Slot konnte nicht aktualisiert werden.'
    return
  }

  await loadSlots()
}

async function createSlot() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!slotDate.value || !slotTime.value) {
    errorMessage.value = 'Bitte Datum und Uhrzeit eingeben.'
    return
  }

  const { error } = await $supabase
    .from('slots')
    .insert([
      {
        slot_date: slotDate.value,
        slot_time: slotTime.value,
        is_blocked: false
      }
    ])

  if (error) {
    errorMessage.value = 'Slot konnte nicht angelegt werden.'
    return
  }

  successMessage.value = 'Slot wurde erfolgreich angelegt.'
  slotDate.value = ''
  slotTime.value = ''
  await loadSlots()
}

async function loadAllBookings() {
  const { data, error } = await $supabase
    .from('bookings')
    .select(`
      id,
      student_name,
      matrikelnummer,
      anliegen,
      slots (
        slot_date,
        slot_time
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    errorMessage.value = 'Buchungen konnten nicht geladen werden.'
    return
  }

  allBookings.value = data
}

async function checkAdminAccess() {
  const { data: sessionData } = await $supabase.auth.getUser()
  const user = sessionData?.user

  if (!user) {
    router.push('/admin-login')
    return
  }

  const { data: adminProfile, error } = await $supabase
    .from('admin_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error || !adminProfile?.is_admin) {
    await $supabase.auth.signOut()
    router.push('/admin-login')
    return
  }

  isAuthorized.value = true
}

onMounted(async () => {
  await checkAdminAccess()

  if (isAuthorized.value) {
    await loadSlots()
    await loadAllBookings()
  }

  isCheckingAccess.value = false
})
</script>

<template>
  <div v-if="isCheckingAccess" class="page">
    <p>Zugriff wird geprüft...</p>
  </div>

  <div v-else-if="isAuthorized" class="page">
    <div class="page">
      <h1>Admin-Bereich</h1>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <div class="create-slot-form">
        <input v-model="slotDate" type="date" />
        <input v-model="slotTime" type="time" />
        <button @click="createSlot">Slot anlegen</button>
      </div>

      <ul class="slot-list">
        <li v-for="slot in slots" :key="slot.id" class="slot-item">
          <span>
            {{ slot.slot_date }} - {{ slot.slot_time }}
          </span>

          <div class="slot-actions">
            <strong v-if="slot.is_blocked">Gesperrt</strong>
            <strong v-else>Aktiv</strong>

            <button @click="toggleBlock(slot)">
              {{ slot.is_blocked ? 'Entsperren' : 'Sperren' }}
            </button>
          </div>
        </li>
      </ul>

      <div class="all-bookings">
        <h2>Alle Buchungen</h2>

        <ul v-if="allBookings.length > 0" class="booking-list">
          <li v-for="booking in allBookings" :key="booking.id" class="booking-item">
            <div>
              <strong>
                {{ booking.slots?.slot_date }} - {{ booking.slots?.slot_time }}
              </strong>
              <div>Name: {{ booking.student_name }}</div>
              <div>Matrikelnummer: {{ booking.matrikelnummer }}</div>
              <div>Anliegen: {{ booking.anliegen }}</div>
            </div>
          </li>
        </ul>

        <p v-else>Keine Buchungen vorhanden.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 24px;
  font-family: Arial, sans-serif;
}

.slot-list {
  list-style: none;
  padding: 0;
}

.slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 500px;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.slot-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create-slot-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  max-width: 500px;
}

.all-bookings {
  margin-top: 40px;
  max-width: 700px;
}

.booking-list {
  list-style: none;
  padding: 0;
}

.booking-item {
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.success-message {
  color: #1b5e20;
  font-weight: bold;
}

.error-message {
  color: #b00020;
  font-weight: bold;
}
</style>
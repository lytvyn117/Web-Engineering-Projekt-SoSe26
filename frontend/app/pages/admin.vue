
<script setup>
import { formatDate, formatTime, formatDateTime } from '../utils/formatters'

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

const bookedSlotIds = ref([])

// Variablen für wiederkehrende Verfügbarkeiten 
const recurringStartDate = ref('')
const recurringEndDate = ref('')
const recurringStartTime = ref('')
const recurringEndTime = ref('')
const recurringInterval = ref('30')

const selectedWeekdays = ref([])

const weekdayOptions = [
  { label: 'Montag', value: '1' },
  { label: 'Dienstag', value: '2' },
  { label: 'Mittwoch', value: '3' },
  { label: 'Donnerstag', value: '4' },
  { label: 'Freitag', value: '5' },
  { label: 'Samstag', value: '6' },
  { label: 'Sonntag', value: '0' }
]

async function loadSlots() {
  errorMessage.value = ''

  const { data: slotData, error: slotError } = await $supabase
    .from('slots')
    .select('*')
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true })

  if (slotError) {
    errorMessage.value = 'Slots konnten nicht geladen werden.'
    return
  }

  const { data: bookingData, error: bookingError } = await $supabase
    .from('bookings')
    .select('slot_id')

  if (bookingError) {
    errorMessage.value = 'Buchungen konnten nicht geladen werden.'
    return
  }

  slots.value = slotData
  bookedSlotIds.value = bookingData.map((booking) => booking.slot_id)
}

function isBooked(slotId) {
  return bookedSlotIds.value.includes(slotId)
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

async function deleteSlot(slot) {
  errorMessage.value = ''
  successMessage.value = ''

  if (isBooked(slot.id)) {
    errorMessage.value = 'Gebuchte Slots können nicht gelöscht werden.'
    return
  }

  const { error } = await $supabase
    .from('slots')
    .delete()
    .eq('id', slot.id)

  if (error) {
    errorMessage.value = 'Slot konnte nicht gelöscht werden.'
    return
  }

  successMessage.value = 'Slot wurde erfolgreich gelöscht.'
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
    if (error.code === '23505') {
      errorMessage.value = 'Dieser Slot existiert bereits.'
    } else {
      errorMessage.value = 'Slot konnte nicht angelegt werden.'
    }
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

async function logout() {
  await $supabase.auth.signOut()
  router.push('/admin-login')
}

function formatDateForInsert(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
}

/* The next function for creating recurring slots was created with the help of Chat GPT 
in conceptualizing the approach + the implementation in several steps like checking for 
already existing slots in a certain date range. The struktural logic for generating the
slots is based on iterating through the date range and checking for the selected weekdays, 
then creating slots based on the specified time range and interval. Additionally, it checks
for existing slots to avoid duplicates before inserting new ones into the database.
*/
async function createRecurringSlots() {
  errorMessage.value = ''
  successMessage.value = ''

  if (
    !recurringStartDate.value ||
    !recurringEndDate.value ||
    !recurringStartTime.value ||
    !recurringEndTime.value ||
    !recurringInterval.value ||
    selectedWeekdays.value.length === 0
  ) {
    errorMessage.value = 'Bitte alle Felder für die wiederkehrenden Verfügbarkeiten ausfüllen.'
    return
  }

  const startDate = new Date(recurringStartDate.value)
  const endDate = new Date(recurringEndDate.value)

  if (startDate > endDate) {
    errorMessage.value = 'Das Startdatum darf nicht nach dem Enddatum liegen.'
    return
  }

  const startMinutes = timeToMinutes(recurringStartTime.value)
  const endMinutes = timeToMinutes(recurringEndTime.value)
  const interval = Number(recurringInterval.value)

  if (startMinutes >= endMinutes) {
    errorMessage.value = 'Die Startzeit muss vor der Endzeit liegen.'
    return
  }

  const slotsToInsert = []
  const selectedDays = selectedWeekdays.value.map(Number)
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const weekday = currentDate.getDay()

    if (selectedDays.includes(weekday)) {
      for (
        let currentMinutes = startMinutes;
        currentMinutes + interval <= endMinutes;
        currentMinutes += interval
      ) {
        slotsToInsert.push({
          slot_date: formatDateForInsert(currentDate),
          slot_time: minutesToTime(currentMinutes),
          is_blocked: false
        })
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (slotsToInsert.length === 0) {
    errorMessage.value = 'Für die gewählten Einstellungen konnten keine Slots erzeugt werden.'
    return
  }

  const { data: existingSlots, error: existingError } = await $supabase
    .from('slots')
    .select('slot_date, slot_time')
    .gte('slot_date', recurringStartDate.value)
    .lte('slot_date', recurringEndDate.value)

  if (existingError) {
    errorMessage.value = 'Vorhandene Slots konnten nicht geprüft werden.'
    return
  }

  const existingSlotKeys = new Set(
    existingSlots.map(slot => `${slot.slot_date}_${slot.slot_time}`)
  )

  const filteredSlotsToInsert = slotsToInsert.filter(slot => {
    const key = `${slot.slot_date}_${slot.slot_time}`
    return !existingSlotKeys.has(key)
  })

  if (filteredSlotsToInsert.length === 0) {
    errorMessage.value = 'Alle erzeugten Slots existieren bereits.'
    return
  }

  const { error } = await $supabase
    .from('slots')
    .insert(filteredSlotsToInsert)

  if (error) {
    errorMessage.value = 'Wiederkehrende Slots konnten nicht angelegt werden.'
    return
  }

  const skippedCount = slotsToInsert.length - filteredSlotsToInsert.length

  if (skippedCount > 0) {
    successMessage.value = `${filteredSlotsToInsert.length} Slots wurden angelegt. ${skippedCount} bereits vorhandene Slots wurden übersprungen.`
  } else {
    successMessage.value = `${filteredSlotsToInsert.length} Slots wurden erfolgreich angelegt.`
  }

  recurringStartDate.value = ''
  recurringEndDate.value = ''
  recurringStartTime.value = ''
  recurringEndTime.value = ''
  recurringInterval.value = '30'
  selectedWeekdays.value = []

  await loadSlots()
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
      <div class="admin-topbar">
        <button @click="logout" class="logout-button">Logout</button>
      </div>
      <h1>Admin-Bereich</h1>

      <h2>Einzelslot anlegen</h2>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      
      <div class="create-slot-form">
        <input v-model="slotDate" type="date" />
        <input v-model="slotTime" type="time" />
        <button @click="createSlot">Slot anlegen</button>
      </div>

      <div class="recurring-slot-form">
        <h2>Wiederkehrende Verfügbarkeiten</h2>

        <div class="form-grid">
          <input v-model="recurringStartDate" type="date" />
          <input v-model="recurringEndDate" type="date" />

          <input v-model="recurringStartTime" type="time" />
          <input v-model="recurringEndTime" type="time" />

          <select v-model="recurringInterval">
            <option value="30">30 Minuten</option>
            <option value="60">60 Minuten</option>
            <option value="90">90 Minuten</option>
          </select>
        </div>

        <div class="weekday-checkboxes">
          <label v-for="day in weekdayOptions" :key="day.value" class="weekday-option">
            <input
              v-model="selectedWeekdays"
              type="checkbox"
              :value="day.value"
            />
            {{ day.label }}
          </label>
        </div>

        <button @click="createRecurringSlots">Wiederkehrende Slots anlegen</button>
      </div>

      <ul class="slot-list">
        <li v-for="slot in slots" :key="slot.id" class="slot-item">
          <span>
            {{ formatDateTime(slot.slot_date, slot.slot_time) }}
          </span>

          <div class="slot-actions">
            <strong v-if="slot.is_blocked">Gesperrt</strong>
            <strong v-else>Aktiv</strong>

            <button @click="toggleBlock(slot)">
              {{ slot.is_blocked ? 'Entsperren' : 'Sperren' }}
            </button>

            <button @click="deleteSlot(slot)" :disabled="isBooked(slot.id)">
              Löschen
            </button>
          </div>
        </li>
      </ul>

      <div class="all-bookings">
        <h2>Alle Buchungen</h2>

        <table v-if="allBookings.length > 0" class="bookings-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Uhrzeit</th>
              <th>Name</th>
              <th>Matrikelnummer</th>
              <th>Anliegen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in allBookings" :key="booking.id">
              <td>{{ formatDate(booking.slots?.slot_date) }}</td>
              <td>{{ formatTime(booking.slots?.slot_time) }}</td>
              <td>{{ booking.student_name }}</td>
              <td>{{ booking.matrikelnummer }}</td>
              <td>{{ booking.anliegen }}</td>
            </tr>
          </tbody>
        </table>

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
  max-width: 1000px;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.bookings-table th,
.bookings-table td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: left;
  vertical-align: top;
}

.bookings-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.success-message {
  color: #1b5e20;
  font-weight: bold;
}

.error-message {
  color: #b00020;
  font-weight: bold;
}

.admin-topbar {
  position: absolute;
  top: 16px;
  right: 16px;
}

.logout-button {
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
}

.recurring-slot-form {
  margin-top: 32px;
  max-width: 700px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.weekday-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.weekday-option {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
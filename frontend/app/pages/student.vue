<!-- In this file the first steps with the connection of Supabase and first functions were made 
 with the help of Chat GPT to help me get started and display the slots on the homepage. 
 Everything afterwards was added manually with assistance from Chat GPT 
 where I asked for conceptual guidance. -->

<script setup>
import { formatDate, formatTime, formatDateTime } from '../utils/formatters'

const { $supabase } = useNuxtApp()

const slots = ref([])
const bookedSlotIds = ref([])

const errorMessage = ref('')
const successMessage = ref('')
const cancelSuccessMessage = ref('')

const selectedSlot = ref(null)

const studentName = ref('')
const matrikelnummer = ref('')
const anliegen = ref('')

const searchMatrikelnummer = ref('')
const myBookings = ref([])

const hasSearchedBookings = ref(false)

const bookingFormRef = ref(null)

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

async function selectSlot(slot) {
  if (slot.is_blocked) return
  if (isBooked(slot.id)) return

  selectedSlot.value = slot
  successMessage.value = ''
  errorMessage.value = ''

  await nextTick()

  bookingFormRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

async function createBooking() {
    await loadSlots()

    if (isBooked(selectedSlot.value.id)) {
        errorMessage.value = 'Dieser Slot wurde gerade schon gebucht. Bitte wähle einen anderen Termin.'
        selectedSlot.value = null
        return
    }
    errorMessage.value = ''
    successMessage.value = ''

    if (!selectedSlot.value) {
        errorMessage.value = 'Bitte zuerst einen Slot auswählen.'
        return
    }

    if (!studentName.value || !matrikelnummer.value || !anliegen.value) {
        errorMessage.value = 'Bitte alle Felder ausfüllen.'
        return
    }

    const { error } = await $supabase.from('bookings').insert([
        {
        slot_id: selectedSlot.value.id,
        student_name: studentName.value,
        matrikelnummer: matrikelnummer.value,
        anliegen: anliegen.value
        }
    ])

    if (error) {
        if (error.code === '23505') {
        errorMessage.value =
            'Dieser Slot wurde gerade schon gebucht. Bitte wähle einen anderen Termin.'
        selectedSlot.value = null
        await loadSlots()
        } else {
        errorMessage.value = 'Die Buchung konnte nicht gespeichert werden.'
        }
        return
    }

    successMessage.value = 'Buchung erfolgreich gespeichert.'
    studentName.value = ''
    matrikelnummer.value = ''
    anliegen.value = ''
    selectedSlot.value = null

    await loadSlots()
}

async function loadMyBookings() {
  errorMessage.value = ''
  successMessage.value = ''
  hasSearchedBookings.value = true

  if (!searchMatrikelnummer.value) {
    errorMessage.value = 'Bitte eine Matrikelnummer eingeben.'
    return
  }

  const { data, error } = await $supabase
    .from('bookings')
    .select(`
      id,
      slot_id,
      student_name,
      matrikelnummer,
      anliegen,
      slots (
        slot_date,
        slot_time
      )
    `)
    .eq('matrikelnummer', searchMatrikelnummer.value)
    .order('created_at', { ascending: false })

  if (error) {
    errorMessage.value = 'Buchungen konnten nicht geladen werden.'
    return
  }

  myBookings.value = data
}

async function cancelBooking(bookingId) {
  errorMessage.value = ''
  cancelSuccessMessage.value = ''

  const { error } = await $supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)

  if (error) {
    errorMessage.value = 'Buchung konnte nicht storniert werden.'
    return
  }

  cancelSuccessMessage.value = 'Buchung wurde storniert.'
  await loadMyBookings()
  await loadSlots()
}

onMounted(() => {
  loadSlots()
})
</script>

<template>
  <div class="page">
    <h1>Verfügbare Slots</h1>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

    <div class="slots-grid">
      <div v-for="slot in slots" :key="slot.id" class="slot-card">
        <div class="slot-info">
          {{ formatDateTime(slot.slot_date, slot.slot_time) }}
        </div>

        <template v-if="slot.is_blocked">
          <span class="status-badge status-blocked">Gesperrt</span>
        </template>

        <template v-else-if="isBooked(slot.id)">
          <span class="status-badge status-booked">Bereits gebucht</span>
        </template>

        <template v-else>
          <button @click="selectSlot(slot)">Buchen</button>
        </template>
      </div>
    </div>

    <div v-if="selectedSlot" class="booking-form">
      <div v-if="selectedSlot" ref="bookingFormRef" class="booking-form"></div>
      <h2>Slot buchen</h2>
      <p>
        Ausgewählt: {{ formatDateTime(selectedSlot.slot_date, selectedSlot.slot_time) }}
      </p>

      <input v-model="studentName" type="text" placeholder="Name" />
      <input v-model="matrikelnummer" type="text" placeholder="Matrikelnummer" />
      <textarea v-model="anliegen" placeholder="Anliegen"></textarea>

      <button @click="createBooking">Buchung speichern</button>
    </div>

    <div class="my-bookings">
      <h2>Meine Buchungen</h2>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="cancelSuccessMessage" class="success-message">{{ cancelSuccessMessage }}</p>

      <div class="search-row">
        <input
          v-model="searchMatrikelnummer"
          type="text"
          placeholder="Matrikelnummer eingeben"
        />
        <button @click="loadMyBookings">Buchungen laden</button>
      </div>

      <ul v-if="myBookings.length > 0" class="booking-list">
        <li v-for="booking in myBookings" :key="booking.id" class="booking-item">
          <div>
            <strong>{{ formatDateTime(booking.slots?.slot_date, booking.slots?.slot_time) }}</strong>
            <div>{{ booking.student_name }}</div>
            <div>{{ booking.anliegen }}</div>
          </div>

          <button @click="cancelBooking(booking.id)">Stornieren</button>
        </li>
      </ul>

      <p v-else-if="hasSearchedBookings">Keine Buchungen gefunden.</p>
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

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.slot-card {
  background: white;
  border: 1px solid #dbe2ea;
  border-radius: 14px;
  padding: 18px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.slot-info {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.4;
}

.booking-form {
  margin-top: 24px;
  max-width: 500px;
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

.success-message {
  color: #1b5e20;
  font-weight: bold;
}

.status-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}

.status-blocked {
  background: #fee2e2;
  color: #991b1b;
}

.status-booked {
  background: #e0e7ff;
  color: #3730a3;
}

.my-bookings {
  margin-top: 40px;
  max-width: 700px;
}

.search-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.booking-list {
  list-style: none;
  padding: 0;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
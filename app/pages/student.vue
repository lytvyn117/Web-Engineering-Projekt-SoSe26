<!-- In this file the first steps with the connection of Supabase and first functions were made 
 with the help of Chat GPT to help me get started and display the slots on the homepage. 
 Everything afterwards was added manually with assistance from Chat GPT 
 where I asked for conceptual guidance. -->

<script setup>
import { formatDateTime } from '../utils/formatters'

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

  const today = new Date().toISOString().split('T')[0]

  const { data: slotData, error: slotError } = await $supabase
    .from('slots')
    .select('*')
    .gte('slot_date', today)
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

  if (error) {
    errorMessage.value = 'Buchungen konnten nicht geladen werden.'
    return
  }

  const today = new Date().toISOString().split('T')[0]

  myBookings.value = data
    .filter(booking => booking.slots?.slot_date >= today)
    .sort((a, b) => {
    const dateTimeA = new Date(`${a.slots?.slot_date}T${a.slots?.slot_time}`)
    const dateTimeB = new Date(`${b.slots?.slot_date}T${b.slots?.slot_time}`)

    return dateTimeA - dateTimeB
  })
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
    <PageHeader title="Verfügbare Slots" subtitle="Buchen und verwalten Sie Ihre Termine"/>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-else-if="slots.length === 0" class="empty-message">
      Zurzeit sind keine verfügbaren Slots vorhanden
    </p>

    <div v-else class="slots-grid">
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

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

    <div v-if="selectedSlot" class="booking-form">
      <div v-if="selectedSlot" ref="bookingFormRef" class="booking-form"></div>
      <h2>Slot buchen</h2>
      <p>
        Ausgewählt: {{ formatDateTime(selectedSlot.slot_date, selectedSlot.slot_time) }}
      </p>

      <input v-model="studentName" type="text" placeholder="Name" />
      <input
        v-model="matrikelnummer"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="Matrikelnummer"
        @input="matrikelnummer = matrikelnummer.replace(/\D/g, '')"
      />
      <textarea
        v-model="anliegen"
        maxlength="100"
        placeholder="Anliegen"
      ></textarea>
      <p class="char-counter">{{ anliegen.length }}/100 Zeichen</p>
      

      <button @click="createBooking">Buchung speichern</button>
    </div>

    <h2>Meine Buchungen</h2>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="cancelSuccessMessage" class="success-message">{{ cancelSuccessMessage }}</p>
    <div class="my-bookings section-box">

      <div class="search-row">
        <input
          v-model="searchMatrikelnummer"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Matrikelnummer eingeben"
          @input="searchMatrikelnummer = searchMatrikelnummer.replace(/\D/g, '')"
        />
        <button @click="loadMyBookings">Buchungen laden</button>
      </div>

      <ul v-if="myBookings.length > 0" class="booking-list">
        <li v-for="booking in myBookings" :key="booking.id" class="booking-item">
          <div class="booking-content">
            <div class="booking-datetime">
              {{ formatDateTime(booking.slots?.slot_date, booking.slots?.slot_time) }}
            </div>

            <div class="booking-name">
              {{ booking.student_name }}
            </div>

            <div class="booking-purpose">
              {{ booking.anliegen }}
            </div>
          </div>

          <button class="cancel-button" @click="cancelBooking(booking.id)">
            Stornieren
          </button>
        </li>
      </ul>

      <p v-else-if="hasSearchedBookings" class="empty-message">
        Keine Buchungen gefunden
      </p>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
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
  background: rgb(153, 188, 229);
  cursor: pointer;
}

button:hover {
  background: #bccbea;
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

.empty-message {
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  color: #475569;
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
  margin: 20px 0 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 18px 20px;
  background: white;
  border: 1px solid #dbe2ea;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.booking-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.booking-datetime {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.booking-name {
  font-size: 18px;
  color: #334155;
}

.booking-purpose {
  font-size: 17px;
  color: #475569;
  word-break: break-word;
  max-width: 700px;
}

.cancel-button {
  flex-shrink: 0;
}

.section-box {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  margin-top: 28px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.char-counter {
  margin-top: 8px;
  font-size: 14px;
  color: #64748b;
  text-align: right;
}

@media (max-width: 1100px) {
  .slots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 800px) {
  .slots-grid {
    grid-template-columns: 1fr;
  }

  .search-row {
    flex-direction: column;
  }

  .booking-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .cancel-button {
    width: 100%;
  }

  .booking-purpose {
    max-width: 100%;
  }
}
</style>
<!-- In this file the first steps with the connection of Supabase and first functions were made 
 with the help of Chat GPT to help me get started and display the slots on the homepage. 
 Everything afterwards was added manually with assistance from Chat GPT 
 where I asked for conceptual guidance. -->

<script setup>
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

function selectSlot(slot) {
    if (slot.is_blocked) return
    if (isBooked(slot.id)) return

    selectedSlot.value = slot
    successMessage.value = ''
    errorMessage.value = ''
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

    <ul class="slot-list">
      <li v-for="slot in slots" :key="slot.id" class="slot-item">
        <span>
          {{ slot.slot_date }} - {{ slot.slot_time }}
        </span>

        <template v-if="slot.is_blocked">
          <strong>Gesperrt</strong>
        </template>

        <template v-else-if="isBooked(slot.id)">
          <strong>Bereits gebucht</strong>
        </template>

        <template v-else>
          <button @click="selectSlot(slot)">Buchen</button>
        </template>
      </li>
    </ul>

    <div v-if="selectedSlot" class="booking-form">
      <h2>Slot buchen</h2>
      <p>
        Ausgewählt: {{ selectedSlot.slot_date }} - {{ selectedSlot.slot_time }}
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
            <strong>{{ booking.slots?.slot_date }} - {{ booking.slots?.slot_time }}</strong>
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

.booking-form {
  margin-top: 24px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input,
textarea,
button {
  padding: 10px;
  font-size: 16px;
}

.error-message {
  color: #b00020;
  font-weight: bold;
}

.success-message {
  color: #1b5e20;
  font-weight: bold;
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
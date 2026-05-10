<script setup>
const router = useRouter()

function goToStudent() {
  router.push('/student')
}

function goToAdmin() {
  router.push('/admin-login')
}
</script>

<template>
  <div class="page">
    <h1>Terminbuchung</h1>
    <p>Bitte wählen Sie Ihre Rolle:</p>

    <div class="button-group">
      <button @click="goToStudent">Student</button>
      <button @click="goToAdmin">Admin</button>
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

.button-group {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
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
</style>
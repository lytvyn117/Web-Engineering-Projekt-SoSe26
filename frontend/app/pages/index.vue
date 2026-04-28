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
  padding: 40px;
  font-family: Arial, sans-serif;
  text-align: center;
}

.button-group {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

button {
  padding: 12px 20px;
  font-size: 16px;
}
</style>
<script setup>
const router = useRouter()

function goToStudent() {
  router.push('/student')
}

function goToAdmin() {
  router.push('/admin')
}
</script>

<!--The Start Page view was conseptually designed and mostly made with ChatGPT, to show 
the different roles of the website and their functionalities. It was updated as the first version 
didn't make much sense with the role choice only. -->
<template>
  <div class="page">
    <PageHeader
      title="Terminbuchung"
      subtitle="Buchen und verwalten Sie Sprechstundentermine einfach online"
    />

    <section class="hero-actions">
      <button @click="goToStudent">Zur Studentenseite</button>
      <button @click="goToAdmin">Zum Admin</button>
    </section>

    <section class="roles-grid">
      <div class="role-card">
        <h2>Für Studierende</h2>
        <p>
          Sehen Sie verfügbare Termine ein, buchen Sie einen Slot und verwalten
          Sie Ihre Buchungen über Ihre Matrikelnummer.
        </p>
        <button @click="goToStudent">Student</button>
      </div>

      <div class="role-card">
        <h2>Für Admins</h2>
        <p>
          Verwalten Sie verfügbare Slots, erstellen Sie wiederkehrende
          Verfügbarkeiten und behalten Sie alle Buchungen im Blick.
        </p>
        <button @click="goToAdmin">Admin</button>
      </div>
    </section>

    <section class="info-box">
      <p><strong><em>
        Hinweis: Studierende benötigen keinen eigenen Login. Für den
        Admin-Bereich ist eine Anmeldung erforderlich.
      </em></strong></p>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
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

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0 40px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 20px;
  text-align: left;
}

.role-card {
  background: white;
  border: 1px solid #dbe2ea;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.role-card h2 {
  margin-top: 0;
  margin-bottom: 12px;
}

.role-card p {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #475569;
}

.info-box {
  margin-top: 32px;
  padding: 18px 20px;
  background: #f8fafc;
  border: 1px solid #dbe2ea;
  border-radius: 14px;
  color: #475569;
  text-align: left;
}

@media (max-width: 800px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
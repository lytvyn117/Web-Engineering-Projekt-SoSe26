<!--
  Standard-Layout
  ---------------------------------------------------------------------------
  Dieses Layout wird automatisch um jede Seite gelegt, die kein eigenes
  Layout über `definePageMeta` festlegt.

  Die Menübar oben wird so auf jeder Seite angezeigt. Der Inhalt der
  jeweiligen Page erscheint dort, wo <slot /> steht.

  → Vorlesung S. 407–408 (Layouts mit Slot)
-->
<template>
  <div class="app-shell">
    <header class="topbar">
      <nav>
        <NuxtLink to="/" class="brand">Terminbuchung</NuxtLink>
        <ul>
          <li><NuxtLink to="/">Startseite</NuxtLink></li>
          <li><NuxtLink to="/student">Student</NuxtLink></li>
          <li><NuxtLink to="/admin">Admin</NuxtLink></li>
          <li><NuxtLink to="/impressum">Impressum</NuxtLink></li>
        </ul>
      </nav>
    </header>

    <main class="content">
      <slot />
    </main>

    <footer class="footer">
      <p>&copy; HAW Kiel · Web Engineering</p>
    </footer>
  </div>
</template>

<script setup>
// Dieses Layout braucht keine Logik — es ist reines Markup.
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, sans-serif;
  color: #222;
}

.topbar {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.topbar nav {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: #003366;
  text-decoration: none;
}

.topbar ul {
  list-style: none;
  display: flex;
  gap: 1.25rem;
  margin: 0;
  padding: 0;
}

.topbar a {
  color: #444;
  text-decoration: none;
}

.topbar a:hover {
  color: #003366;
}

/* NuxtLink markiert die aktuell aktive Route automatisch mit dieser Klasse */
.topbar a.router-link-active {
  color: #003366;
  font-weight: 600;
}

.content {
  flex: 1;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.footer {
  border-top: 1px solid #e5e5e5;
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}
</style>

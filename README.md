[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/F42rzUSk)
# Sprechstunden-Buchungssystem

Web Engineering · Prof. Dr. Christian Krauss · HAW Kiel

Dies ist die Vorlage für Ihr Semesterprojekt. Sie ist auf **Nuxt 4** aufgesetzt und bringt einige Beispieldateien mit, an denen Sie sich orientieren können.

---

## 1. Voraussetzungen

Vor dem ersten Start brauchen Sie:

- **Node.js 20 LTS** oder neuer ([nodejs.org](https://nodejs.org/))
  Prüfen mit `node -v` — es sollte `v20.x.x` oder höher angezeigt werden.
- **VS Code** ([code.visualstudio.com](https://code.visualstudio.com/))
  Empfohlene Extensions:
  - **Vue - Official** (Vue-Sprachsupport, Hervorhebung, Auto-Vervollständigung)
  - **Vue VSCode Snippets** (z. B. `vbase-3-setup` erzeugt ein Page-Grundgerüst)
- **Git** für die Versionsverwaltung.

---

## 2. Schnellstart

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen einrichten
cp .env.example .env
# → .env bearbeiten: SUPABASE_URL und SUPABASE_ANON_KEY eintragen
#   (erst nötig, wenn Sie Supabase einbinden — am Anfang können die Werte leer bleiben)

# 3. Entwicklungsserver starten
npm run dev
```

Öffnen Sie dann [http://localhost:3000](http://localhost:3000). Sie sehen die Startseite mit Menübar, einer API-Demo und einem Impressum.

> **Tipp:** Tritt beim Start ein Fehler auf, hilft fast immer ein erneutes `npm install`.

---

## 3. Wie ist das Projekt aufgebaut?

```
nuxt-starter-template/
├── app/                          ← Ihr Anwendungscode
│   ├── app.vue                   Root-Komponente (lädt die jeweilige Page)
│   ├── error.vue                 Fehlerseite (z. B. 404)
│   ├── components/
│   │   └── PageHeader.vue        Wiederverwendbare Komponente (Beispiel)
│   ├── layouts/
│   │   └── default.vue           Menübar + Footer für alle Seiten
│   ├── pages/                    Jede Datei = eine URL (File-based Routing)
│   │   ├── index.vue             →  /
│   │   ├── impressum.vue         →  /impressum
│   │   └── demo.vue              →  /demo  (Fake-API-Demo)
│   └── utils/
│       └── booking.js            Hilfsfunktionen (automatisch global verfügbar)
├── server/api/                   Eigene Server-Routen (optional)
├── tests/
│   └── booking.test.js           Ein einfaches Test-Beispiel
├── .env.example                  Vorlage für Umgebungsvariablen
├── nuxt.config.js                Nuxt-Konfiguration
└── package.json                  Abhängigkeiten und Skripte
```

### Wichtig: Nuxt 3 → Nuxt 4

Die Vorlesung ist noch in Nuxt 3. Da arbeite ich gerade dran... **Der einzige spürbare Unterschied:**
In Nuxt 4 liegen `pages/`, `components/`, `layouts/`, `utils/` und `app.vue` im Ordner `app/` — in der Vorlesung lagen sie im Root.

Alles andere (NuxtLink, useFetch, defineProps, definePageMeta, createError …) funktioniert genau wie in der Vorlesung. Wir bleiben außerdem bei **JavaScript** — kein TypeScript, kein `lang="ts"`.

---

## 4. Nuxt-Grundlagen — wo finde ich was?

| Aufgabe | Wo? | Vorlesung |
|---|---|---|
| Neue Seite anlegen | Datei in `app/pages/` anlegen, z. B. `kontakt.vue` → `/kontakt` | S. 397 |
| Dynamische Route (mit Parameter) | `app/pages/produkte/[id].vue` → `/produkte/abc` | S. 402 |
| Navigation zwischen Seiten | `<NuxtLink to="/impressum">Impressum</NuxtLink>` | S. 405 |
| Gemeinsames Layout | `app/layouts/default.vue` mit `<slot />` | S. 407 |
| Wiederverwendbare Komponente | Datei in `app/components/`, z. B. `Card.vue` → `<Card />` | S. 425 |
| Daten von API holen | `const { data } = await useFetch('https://…')` | S. 421 |
| Fehlerseite (404) | `app/error.vue` | S. 434 |

> Schauen Sie sich die Beispieldateien im Projekt an — jede hat oben einen Kommentar, der das Pattern und die Vorlesungsseite nennt.

---

## 5. Was ist schon da?

- **Startseite** (`/`) — zeigt die `PageHeader`-Komponente und Links zu den anderen Seiten
- **Impressum** (`/impressum`) — Beispiel für eine zweite Seite
- **API-Demo** (`/demo`) — lädt Produkte von [fakestoreapi.com](https://fakestoreapi.com/) mit `useFetch` und zeigt sie als Karten an. Das ist das Pattern, das Sie später für Ihre eigene API brauchen.
- **404-Seite** — beim Aufruf einer nicht existierenden URL erscheint die `error.vue` mit Link zurück zur Startseite

Sie können die `demo.vue` einfach löschen oder als Vorlage für eigene Seiten nehmen.

---

## 6. Die Beispiel-Test-Datei

In `tests/booking.test.js` finden Sie einen kleinen Test für die Funktion `isValidMatrikel`. Damit sehen Sie, wie ein Test aussieht. Mehr brauchen Sie nicht — Sie können später eigene Tests ergänzen, wenn Sie eigene Funktionen schreiben.

```bash
npm test            # Tests einmalig ausführen
npm run test:watch  # Tests bei jeder Änderung neu ausführen
```

---

## 7. Befehle im Überblick

| Befehl | Was passiert |
|---|---|
| `npm run dev` | Entwicklungsserver starten ([http://localhost:3000](http://localhost:3000)) |
| `npm test` | Tests einmal ausführen |
| `npm run lint` | Code-Qualität prüfen (ESLint) |
| `npm run lint:fix` | Auto-fixbare Lint-Fehler beheben |
| `npm run generate` | Statische Seiten erzeugen (für die Abgabe) |

---

## 8. Optional: Tailwind CSS hinzufügen

Die Vorlesung nutzt Tailwind ab S. 411. Wenn Sie Tailwind verwenden möchten:

```bash
npm install --save-dev @nuxtjs/tailwindcss
```

Dann in `nuxt.config.js` das Modul ergänzen:

```js
modules: [
  '@nuxt/eslint',
  '@nuxtjs/tailwindcss'
]
```

Danach können Sie Tailwind-Klassen wie `class="flex gap-4 p-4"` direkt in Ihren Templates verwenden.

---

## 9. Empfohlene Schritte

1. **Server starten** und durch die Beispielseiten klicken — verstehen Sie, wie die Dateien zur URL passen.
2. **Eine eigene Seite anlegen**, z. B. `app/pages/kontakt.vue`. Im Browser prüfen: `/kontakt`.
3. **Supabase einrichten** ([supabase.com](https://supabase.com)), Tabellen anlegen, RLS-Policies setzen, Werte in `.env` eintragen.
4. **Eigene Logik** in `app/utils/` oder eigene Components in `app/components/` schreiben.
5. **Regelmäßig committen** — Ihre Git-History gehört zur Bewertung.

---

## 10. CI-Pipeline (GitHub Actions)

Bei jedem Push auf `main` läuft automatisch:

- **ESLint** — prüft die Code-Qualität
- **Vitest** — führt Tests aus
- **Lighthouse** — misst Performance und Accessibility

Sie sehen das Ergebnis als ✅ oder ❌ neben Ihrem Commit auf GitHub.

Damit Lighthouse auf GitHub Actions funktioniert, hinterlegen Sie Ihre Supabase-Werte als **Repository Secrets**:
Settings → Secrets and variables → Actions → `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

---

Bei Fragen: Foliensatz **Web Engineering_07_NUXT.pdf** ab Folie 377.

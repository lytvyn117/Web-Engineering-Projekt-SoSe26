// =============================================================================
// Hilfsfunktionen für das Buchungssystem
//
// Hinweis (Nuxt 4): Dateien in `app/utils/` werden von Nuxt automatisch
// importiert. In Pages und Components können Sie die Funktionen direkt
// aufrufen — kein `import` nötig.
//
// Diese Datei enthält bewusst nur EINE Beispiel-Funktion.
// Ergänzen Sie weitere Funktionen, sobald Sie sie brauchen.
// =============================================================================

/**
 * Prüft, ob eine Matrikelnummer gültig ist.
 * Regel: 5 bis 8 Ziffern, keine Buchstaben.
 *
 * @param {string} matrikel - Die zu prüfende Matrikelnummer
 * @returns {boolean} true, wenn die Matrikelnummer gültig ist
 *
 * Beispiele:
 *   isValidMatrikel('12345')    → true
 *   isValidMatrikel('12345678') → true
 *   isValidMatrikel('1234')     → false  (zu kurz)
 *   isValidMatrikel('abc12')    → false  (Buchstaben)
 */
export function isValidMatrikel(matrikel) {
  return /^\d{5,8}$/.test(matrikel)
}

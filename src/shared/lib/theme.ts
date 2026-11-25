/**
 * Light and dark mode.
 *
 * The choice is saved in this browser (localStorage). If nothing is saved, the computer's own
 * setting (prefers-color-scheme) is used. The page <html> element carries data-theme="light" or "dark",
 * and styles/tokens.css changes colours based on it.
 */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "efficht_theme";

/** Small script text that runs before the page is drawn, so there is no white flash in dark mode. */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("${THEME_STORAGE_KEY}");
    var dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

/** Reads the theme the page is currently showing. */
export function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** Shows a theme and remembers it. */
export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode: the theme still changes, it just will not be remembered.
  }
}

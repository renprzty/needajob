export const THEME_KEY = "needajob:theme";

export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
  } catch (err) {
    console.error("Error reading theme from localStorage", err);
  }
  return "light";
}

export function applyTheme(theme) {
  try {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error("Error saving theme to localStorage", err);
  }
}

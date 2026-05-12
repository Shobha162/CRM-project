export const applyTheme = (theme) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'solarized')
    if (theme) root.classList.add(theme)
    localStorage.setItem('theme', theme)
}

export const getSavedTheme = () => {
    return localStorage.getItem('theme')
}

'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = {
  dark: boolean
  fontSize: 'sm' | 'md' | 'lg'
  highContrast: boolean
  reduceMotion: boolean
}

type ThemeContextType = {
  theme: Theme
  toggleDark: () => void
  setFontSize: (size: 'sm' | 'md' | 'lg') => void
  toggleHighContrast: () => void
  toggleReduceMotion: () => void
}

const defaultTheme: Theme = {
  dark: false,
  fontSize: 'md',
  highContrast: false,
  reduceMotion: false,
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  toggleDark: () => {},
  setFontSize: () => {},
  toggleHighContrast: () => {},
  toggleReduceMotion: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('app-theme')
    if (saved) {
      try { setTheme(JSON.parse(saved)) } catch {}
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('app-theme', JSON.stringify(theme))

    const html = document.documentElement
    theme.dark           ? html.classList.add('dark')            : html.classList.remove('dark')
    theme.highContrast   ? html.classList.add('high-contrast')   : html.classList.remove('high-contrast')
    theme.reduceMotion   ? html.classList.add('reduce-motion')   : html.classList.remove('reduce-motion')

    html.classList.remove('font-sm', 'font-md', 'font-lg')
    html.classList.add(`font-${theme.fontSize}`)
  }, [theme, mounted])

  const toggleDark          = () => setTheme(t => ({ ...t, dark: !t.dark }))
  const toggleHighContrast  = () => setTheme(t => ({ ...t, highContrast: !t.highContrast }))
  const toggleReduceMotion  = () => setTheme(t => ({ ...t, reduceMotion: !t.reduceMotion }))
  const setFontSize         = (fontSize: 'sm' | 'md' | 'lg') => setTheme(t => ({ ...t, fontSize }))

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, toggleDark, setFontSize, toggleHighContrast, toggleReduceMotion }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
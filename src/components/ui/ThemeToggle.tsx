'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-12 h-6 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label="Toggle theme"
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 transition-transform duration-300 flex items-center justify-center text-xs ${
        theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
      }`}>
        {theme === 'dark' ? <Moon className='h-6 w-6 p-1'/> : <Sun className='text-white h-6 w-6 p-1'/>}
      </div>
    </button>
  )
}
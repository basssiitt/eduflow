'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'ur'
type PendingAction = { id: string; label: string; createdAt: number }
type EduFlowContextValue = { lang: Lang; toggleLanguage: () => void; isOnline: boolean; pendingActions: PendingAction[]; queueAction: (label: string) => void; syncNow: () => void; installPrompt: Event | null; dismissInstall: () => void }

const EduFlowContext = createContext<EduFlowContextValue | null>(null)
const QUEUE_KEY = 'eduflow-offline-actions'

export function EduFlowProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [isOnline, setOnline] = useState(true)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  useEffect(() => {
    const storedLang = window.localStorage.getItem('eduflow-language') as Lang | null
    const storedQueue = window.localStorage.getItem(QUEUE_KEY)
    if (storedLang === 'en' || storedLang === 'ur') setLang(storedLang)
    if (storedQueue) {
      try {
        const parsed = JSON.parse(storedQueue)
        if (Array.isArray(parsed)) setPendingActions(parsed)
      } catch {
        window.localStorage.removeItem(QUEUE_KEY)
      }
    }
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    const onInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event) }
    setOnline(navigator.onLine)
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline); window.addEventListener('beforeinstallprompt', onInstall)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); window.removeEventListener('beforeinstallprompt', onInstall) }
  }, [])
  useEffect(() => { window.localStorage.setItem('eduflow-language', lang); document.documentElement.lang = lang === 'ur' ? 'ur' : 'en'; document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr' }, [lang])
  useEffect(() => { window.localStorage.setItem(QUEUE_KEY, JSON.stringify(pendingActions)) }, [pendingActions])
  useEffect(() => { if (isOnline && pendingActions.length) { const timer = window.setTimeout(() => setPendingActions([]), 900); return () => window.clearTimeout(timer) } }, [isOnline, pendingActions.length])
  const value = useMemo(() => ({ lang, toggleLanguage: () => setLang((current) => current === 'en' ? 'ur' : 'en'), isOnline, pendingActions, queueAction: (label: string) => setPendingActions((current) => [...current, { id: `${Date.now()}-${current.length}`, label, createdAt: Date.now() }]), syncNow: () => { if (navigator.onLine) setPendingActions([]) }, installPrompt, dismissInstall: () => setInstallPrompt(null) }), [lang, isOnline, pendingActions, installPrompt])
  return <EduFlowContext.Provider value={value}>{children}<InstallBanner /></EduFlowContext.Provider>
}

export function useEduFlow() { const value = useContext(EduFlowContext); if (!value) throw new Error('useEduFlow must be used inside EduFlowProvider'); return value }

function InstallBanner() {
  const { installPrompt, dismissInstall } = useEduFlow()
  if (!installPrompt) return null
  const handleInstall = () => {
    void (async () => {
      const prompt = installPrompt as Event & { prompt?: () => Promise<void> }
      await prompt.prompt?.()
      dismissInstall()
    })()
  }
  return (
    <div className="install-banner" role="status">
      <div>
        <strong>Install EduFlow OS</strong>
        <span>Keep your school tools ready, even on slower connections.</span>
      </div>
      <button onClick={handleInstall}>Install</button>
      <button className="install-dismiss" onClick={dismissInstall} aria-label="Dismiss install prompt">×</button>
    </div>
  )
}

export function OfflineStatusBar({ compact = false }: { compact?: boolean }) {
  const { isOnline, lang, toggleLanguage, pendingActions, syncNow } = useEduFlow()
  return <div className={`offline-status ${compact ? 'compact' : ''}`}><button className="language-toggle" onClick={toggleLanguage} aria-label="Switch language">{lang === 'en' ? 'اردو' : 'English'}</button><span className={isOnline ? 'sync-online' : 'sync-offline'}><i />{isOnline ? 'Cloud Synced' : 'Offline Mode'}{!isOnline && pendingActions.length > 0 ? ` · ${pendingActions.length} queued` : ''}</span>{isOnline && pendingActions.length > 0 && <button className="sync-now" onClick={syncNow}>Sync Now</button>}</div>
}

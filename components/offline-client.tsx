'use client'
import { useEffect } from 'react'
export function OfflineClient() { useEffect(() => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined) }, []); return null }

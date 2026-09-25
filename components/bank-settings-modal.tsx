'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface BankSettings {
  bankName: string
  accountTitle: string
  iban: string
  psidPrefix: string
  easypaisa: string
  jazzcash?: string
}

interface BankSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: BankSettings
  onSave: (settings: BankSettings) => void
}

export function BankSettingsModal({ isOpen, onClose, settings, onSave }: BankSettingsModalProps) {
  const [localSettings, setLocalSettings] = React.useState<BankSettings>(settings)
  const [errorMsg, setErrorMsg] = React.useState('')

  React.useEffect(() => {
    setLocalSettings(settings)
    setErrorMsg('')
  }, [settings])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      if (!localSettings.bankName.trim() || !localSettings.accountTitle.trim() || !localSettings.iban.trim()) {
        setErrorMsg('Bank name, account title, and IBAN are required fields.')
        return
      }
      onSave(localSettings)
    } catch (err: any) {
      console.error('Failed to save bank settings:', err)
      setErrorMsg('Failed to update bank settings. Please check your network and input.')
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-settings-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Payment Gateway &amp; Banking</span>
            <h3 id="bank-settings-modal-title" className="text-lg font-black text-slate-900">School Bank Account Setup</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Close bank settings">
            <X className="size-5" />
          </button>
        </div>
        {errorMsg && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label htmlFor="bank-name-input" className="font-semibold text-slate-700 block mb-1">Bank Name</label>
            <Input
              id="bank-name-input"
              value={localSettings.bankName}
              onChange={(e) => setLocalSettings({ ...localSettings, bankName: e.target.value })}
              placeholder="e.g. Meezan Bank Ltd."
              required
              className="rounded-xl border-slate-200 bg-white text-slate-900 focus:border-blue-500 text-xs"
            />
          </div>
          <div>
            <label htmlFor="account-title-input" className="font-semibold text-slate-700 block mb-1">Account Title</label>
            <Input
              id="account-title-input"
              value={localSettings.accountTitle}
              onChange={(e) => setLocalSettings({ ...localSettings, accountTitle: e.target.value })}
              placeholder="e.g. EduFlow School Accounts"
              required
              className="rounded-xl border-slate-200 bg-white text-slate-900 focus:border-blue-500 text-xs"
            />
          </div>
          <div>
            <label htmlFor="iban-input" className="font-semibold text-slate-700 block mb-1">IBAN (24 Characters)</label>
            <Input
              id="iban-input"
              value={localSettings.iban}
              onChange={(e) => setLocalSettings({ ...localSettings, iban: e.target.value })}
              placeholder="PK92 MEZN 0001 2345 6789 0101"
              required
              className="font-mono rounded-xl border-slate-200 bg-white text-slate-900 focus:border-blue-500 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="psid-prefix-input" className="font-semibold text-slate-700 block mb-1">1Link PSID Prefix</label>
              <Input
                id="psid-prefix-input"
                value={localSettings.psidPrefix}
                onChange={(e) => setLocalSettings({ ...localSettings, psidPrefix: e.target.value })}
                placeholder="1004"
                className="font-mono rounded-xl border-slate-200 bg-white text-slate-900 focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label htmlFor="easypaisa-input" className="font-semibold text-slate-700 block mb-1">EasyPaisa / JazzCash</label>
              <Input
                id="easypaisa-input"
                value={localSettings.easypaisa}
                onChange={(e) => setLocalSettings({ ...localSettings, easypaisa: e.target.value })}
                placeholder="03XXXXXXXXX"
                className="rounded-xl border-slate-200 bg-white text-slate-900 focus:border-blue-500 text-xs"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            These credentials will appear on all 3-Face Challans and power online Parent Portal fee payments.
          </p>
          <div className="pt-3 flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">
              Save Bank Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

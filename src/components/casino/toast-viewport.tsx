'use client'

import { useToastStore } from '@/lib/store'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore()
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-20 right-4 z-[60] space-y-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-2 p-3 rounded-md shadow-lg border animate-in slide-in-from-top-2 ${
            t.type === 'success' ? 'bg-green-950 border-green-700 text-green-100' :
            t.type === 'error' ? 'bg-red-950 border-red-700 text-red-100' :
            'bg-card border-border text-foreground'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          {t.type === 'error' && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          {t.type === 'info' && <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          <div className="text-sm flex-1">{t.message}</div>
          <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModalFocus } from '../../../shared/hooks/useModalFocus'

export default function OrderSheet({ open, busy, onClose, titleId, wide, resource, children }) {
  const [present, setPresent] = useState(open)
  const lastContent = useRef(null)
  const dialogRef = useModalFocus(open)

  useLayoutEffect(() => {
    if (!open) return
    lastContent.current = children
    setPresent(true)
  }, [open, children])

  useEffect(() => {
    if (!open && present) {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        setPresent(false)
        return
      }
      const timer = setTimeout(() => setPresent(false), 320)
      return () => clearTimeout(timer)
    }
  }, [open, present])

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previousGutter = root.style.scrollbarGutter
    const previousOverflow = document.body.style.overflow
    if (window.innerWidth > root.clientWidth && root.clientWidth > 0) {
      root.style.scrollbarGutter = 'stable'
    }
    document.body.style.overflow = 'hidden'
    return () => {
      root.style.scrollbarGutter = previousGutter
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open || busy) return
    function handleEscape(event) {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, busy, onClose])

  if (!open && !present) return null

  return createPortal(
    <div
      dir="rtl"
      data-resource={resource}
      data-state={open ? 'open' : 'closing'}
      className="mw-sheet fixed inset-0 z-[1200] flex items-end justify-center"
      ref={dialogRef}
      tabIndex={-1}
      role={open ? 'dialog' : undefined}
      aria-modal={open || undefined}
      aria-busy={busy || undefined}
      aria-labelledby={titleId}
      aria-hidden={!open || undefined}
      inert={open ? undefined : ''}
    >
      <div className="mw-sheet-backdrop absolute inset-0 bg-scrim/55" onClick={busy ? undefined : onClose} aria-hidden="true" />
      <div
        onAnimationEnd={(event) => {
          if (!open && event.target === event.currentTarget) setPresent(false)
        }}
        className={`mw-sheet-panel relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[92dvh] rounded-t-3xl border-t border-x border-slate-200 bg-canvas shadow-2xl flex flex-col overflow-hidden text-right`}
      >
        {open ? children : lastContent.current}
      </div>
    </div>,
    document.body,
  )
}

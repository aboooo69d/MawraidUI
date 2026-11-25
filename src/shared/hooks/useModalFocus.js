import { useEffect, useRef } from 'react'

const TABBABLE = 'a[href], button, input, select, textarea, [tabindex], summary'

export function useModalFocus(open) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return

    const previous = document.activeElement
    dialog.focus({ preventScroll: true })

    function containTab(event) {
      if (event.key !== 'Tab') return

      const controls = [...dialog.querySelectorAll(TABBABLE)].filter((element) =>
        element.tabIndex >= 0 &&
        !element.matches(':disabled') &&
        !element.closest('[inert], [aria-hidden="true"]') &&
        element.getClientRects().length > 0
      )

      const index = controls.indexOf(document.activeElement)
      const boundary = event.shiftKey ? 0 : controls.length - 1
      if (index !== -1 && index !== boundary) return

      event.preventDefault()
      const next = (event.shiftKey ? controls.at(-1) : controls[0]) || dialog
      next.focus({ preventScroll: true })
    }

    window.addEventListener('keydown', containTab)
    return () => {
      window.removeEventListener('keydown', containTab)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [open])

  return dialogRef
}

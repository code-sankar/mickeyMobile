import { MessageCircle } from 'lucide-react'
import { Button } from './Button'
import { waLink } from '../../lib/whatsapp'

/**
 * A WhatsApp CTA that always carries context.
 *
 * `message` is required rather than optional so a new call site cannot quietly
 * fall back to a bare "hi" — if there is nothing useful to prefill, pass
 * `waMessage.general()` and make that choice explicit.
 */
export function WhatsAppButton({ message, children = 'WhatsApp', variant = 'accent', ...props }) {
  return (
    <Button href={waLink(message)} target="_blank" rel="noreferrer" variant={variant} {...props}>
      <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
      {children}
    </Button>
  )
}

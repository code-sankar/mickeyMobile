import { Camera, MessageCircle, RotateCcw } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'

/**
 * The state after a valid form submit.
 *
 * It deliberately does not say "registered" — nothing has been recorded yet.
 * The registration is only real once the student sends the WhatsApp message
 * and attaches their ID, so this screen's whole job is to make that last step
 * unmissable and repeatable if the chat did not open.
 */
export function RegistrationSent({ submitted, onReset, id }) {
  const { values, link } = submitted

  return (
    <Card id={id} shadow="lg" className="scroll-mt-28 overflow-hidden">
      <div className="border-b-3 border-ink bg-lime px-5 py-4 sm:px-6">
        <h2 className="font-display text-base uppercase sm:text-lg">One step left</h2>
        <p className="mt-1.5 text-xs font-medium text-ink-800">
          Your details are ready to send, {values.name.split(' ')[0]}.
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center border-3 border-ink bg-acid font-mono text-xs font-bold">
              1
            </span>
            <p className="text-sm font-medium leading-relaxed">
              Tap the button below — WhatsApp opens with your registration already written out.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center border-3 border-ink bg-acid font-mono text-xs font-bold">
              2
            </span>
            <p className="text-sm font-medium leading-relaxed">
              Attach a photo of your student ID card in that chat, then send.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center border-3 border-ink bg-acid font-mono text-xs font-bold">
              3
            </span>
            <p className="text-sm font-medium leading-relaxed">
              We check it and confirm — usually within shop hours the same day.
            </p>
          </li>
        </ol>

        <div className="flex items-start gap-3 border-3 border-ink bg-paper-200 p-4">
          <Camera className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />
          <p className="text-xs font-medium leading-relaxed text-ink-800">
            Make sure your name, the institution and the valid-until year are readable in the photo.
            We check it against your registration and do not keep the image afterwards.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={link} target="_blank" rel="noreferrer" variant="accent" size="lg" className="flex-1">
            <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
            Open WhatsApp and send
          </Button>
          <Button onClick={onReset} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
            Start over
          </Button>
        </div>

        <p className="text-center text-2xs font-medium leading-relaxed text-ink-700">
          Nothing has been stored on this website — your registration exists only in the message you
          are about to send.
        </p>
      </div>
    </Card>
  )
}

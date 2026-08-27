import { Camera, MessageCircle, RotateCcw } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'

/**
 * The state after a valid form submit.
 *
 * Either way there is a step left, because the ID card is never uploaded to
 * this website — it is checked at the counter or attached in the chat. What
 * changes with `stored` is the promise this screen makes about what is held:
 * when the registration reached the API it is on record and must not be
 * described as unstored, and when it did not, the WhatsApp message is the
 * entire submission and has to be sent.
 */
export function RegistrationSent({ submitted, onReset, id }) {
  const { values, link, stored } = submitted

  return (
    <Card id={id} shadow="lg" className="scroll-mt-28 overflow-hidden">
      <div className="border-b-3 border-ink bg-lime px-5 py-4 sm:px-6">
        <h2 className="font-display text-base uppercase sm:text-lg">
          {stored ? 'Registered' : 'One step left'}
        </h2>
        <p className="mt-1.5 text-xs font-medium text-ink-800">
          {stored
            ? `We have your details, ${values.name.split(' ')[0]} — just your ID card to check.`
            : `Your details are ready to send, ${values.name.split(' ')[0]}.`}
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <ol className="space-y-4">
          {(stored
            ? [
                'Bring your student ID to the counter, or tap below to send a photo of it on WhatsApp.',
                'We check the name, institution and valid-until year against your registration.',
                'Once it checks out the discount is live on your next repair.',
              ]
            : [
                'Tap the button below — WhatsApp opens with your registration already written out.',
                'Attach a photo of your student ID card in that chat, then send.',
                'We check it and confirm — usually within shop hours the same day.',
              ]
          ).map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center border-3 border-ink bg-acid font-mono text-xs font-bold">
                {index + 1}
              </span>
              <p className="text-sm font-medium leading-relaxed">{step}</p>
            </li>
          ))}
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
            {stored ? 'Send my ID on WhatsApp' : 'Open WhatsApp and send'}
          </Button>
          <Button onClick={onReset} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
            Start over
          </Button>
        </div>

        <p className="text-center text-2xs font-medium leading-relaxed text-ink-700">
          {stored
            ? 'Your registration is on our system; the ID photo is not — it is checked and then discarded. Ask us any time to see, correct or delete what we hold.'
            : 'Nothing has been stored on this website — your registration exists only in the message you are about to send.'}
        </p>
      </div>
    </Card>
  )
}

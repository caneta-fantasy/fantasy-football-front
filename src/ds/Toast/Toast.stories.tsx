import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'
import {
  ToastProvider,
  useToast,
  type ToastPosition,
} from './ToastProvider'
import { Btn } from '../Btn/Btn'

/**
 * The presentational `Toast` is documented on its own; the realistic usage is
 * the `ToastProvider` + `useToast()` imperative API, shown in the Provider
 * stories below.
 */
const meta: Meta<typeof Toast> = {
  title: 'Overlays/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  args: {
    tone: 'success',
    title: 'Pick confirmado',
    body: 'Pedro Henrique é seu, craque.',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['success', 'error', 'info', 'warning'],
    },
    onDismiss: { action: 'dismiss' },
  },
}
export default meta

type S = StoryObj<typeof Toast>

/** Interactive controls for the bare surface (tone / title / body / action). */
export const Playground: S = {}

export const Success: S = {
  args: {
    tone: 'success',
    title: 'Pick confirmado',
    body: 'Pedro Henrique é seu, craque.',
    action: { label: 'Desfazer', onClick: () => {} },
  },
}

export const Error: S = {
  args: {
    tone: 'error',
    title: 'Deu ruim',
    body: 'Não rolou liberar o jogador.',
    action: { label: 'Tentar', onClick: () => {} },
  },
}

export const Warning: S = {
  args: {
    tone: 'warning',
    title: 'Deadline chegando',
    body: 'Faltam 10 min pra fechar a rodada.',
  },
}

export const Info: S = {
  args: {
    tone: 'info',
    title: 'Garro entrou em campo',
    body: 'Seu meia tá jogando agora.',
  },
}

/** All four tones stacked, as they read in the DS reference sheet. */
export const AllTones: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Toast
        tone="success"
        title="Pick confirmado"
        body="Pedro Henrique é seu, craque."
        action={{ label: 'Desfazer', onClick: () => {} }}
      />
      <Toast
        tone="error"
        title="Deu ruim"
        body="Não rolou liberar o jogador."
        action={{ label: 'Tentar', onClick: () => {} }}
      />
      <Toast
        tone="warning"
        title="Deadline chegando"
        body="Faltam 10 min pra fechar a rodada."
      />
      <Toast
        tone="info"
        title="Garro entrou em campo"
        body="Seu meia tá jogando agora."
      />
    </div>
  ),
}

/** Title only — no body, no action. */
export const TitleOnly: S = {
  args: { tone: 'info', title: 'Salvo', body: undefined },
}

// ─── Provider stories (imperative API) ───

function Demo({ position }: { position?: ToastPosition }) {
  const toast = useToast()
  return (
    <div className="flex flex-wrap gap-3 p-8">
      <Btn
        onClick={() =>
          toast({
            tone: 'success',
            title: 'Pick confirmado',
            body: 'Pedro Henrique é seu, craque.',
            action: { label: 'Desfazer', onClick: () => {} },
          })
        }
      >
        Sucesso
      </Btn>
      <Btn
        variant="danger"
        onClick={() =>
          toast({
            tone: 'error',
            title: 'Deu ruim',
            body: 'Não rolou liberar o jogador.',
          })
        }
      >
        Erro
      </Btn>
      <Btn
        variant="ghost"
        onClick={() =>
          toast({
            tone: 'warning',
            title: 'Deadline chegando',
            body: 'Faltam 10 min. Passe o mouse pra pausar.',
            duration: 8000,
          })
        }
      >
        Aviso (8s, pausa no hover)
      </Btn>
      <Btn
        variant="secondary"
        onClick={() =>
          toast({
            tone: 'info',
            title: 'Sticky',
            body: 'Some só no X.',
            duration: 0,
          })
        }
      >
        Persistente
      </Btn>
      <span className="self-center font-mono text-[11px] text-text-muted">
        posição: {position ?? 'top-right'}
      </span>
    </div>
  )
}

/** Fire toasts imperatively. Hover a toast to pause its auto-dismiss timer. */
export const WithProvider: StoryObj = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
}

/** Same API, anchored bottom-center (newest stacks on top). */
export const BottomCenter: StoryObj = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <ToastProvider position="bottom-center">
      <Demo position="bottom-center" />
    </ToastProvider>
  ),
}

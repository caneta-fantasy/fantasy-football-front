import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AuthButton } from './AuthButton'

describe('AuthButton', () => {
  it('renders its children as a button', () => {
    render(<AuthButton>Enviar link</AuthButton>)
    expect(
      screen.getByRole('button', { name: /enviar link/i }),
    ).toBeInTheDocument()
  })

  it('is disabled and shows a loading indicator when loading', () => {
    render(<AuthButton loading>Enviar</AuthButton>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByLabelText(/carregando/i)).toBeInTheDocument()
  })

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn()
    render(
      <AuthButton type="button" onClick={onClick}>
        Ir
      </AuthButton>,
    )
    await userEvent.click(screen.getByRole('button', { name: /ir/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

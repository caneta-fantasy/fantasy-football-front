import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Label } from './Label'

describe('Label', () => {
  it('renders a real <label> associated with the control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">E-mail</Label>
        <input id="email" />
      </>,
    )
    const input = screen.getByLabelText('E-mail')
    expect(input.tagName).toBe('INPUT')
  })

  it('marks required fields with a gold asterisk that is hidden from AT', () => {
    render(<Label htmlFor="x" required>E-mail</Label>)
    // The accessible name should not include a bare "*" announcement.
    const label = screen.getByText('E-mail').closest('label')!
    const star = label.querySelector('[aria-hidden="true"]')
    expect(star).not.toBeNull()
    expect(star).toHaveTextContent('*')
  })

  it('does not render an asterisk when not required', () => {
    render(<Label htmlFor="x">Nome</Label>)
    const label = screen.getByText('Nome').closest('label')!
    expect(label.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('forwards extra props and className to the label element', () => {
    render(
      <Label htmlFor="x" className="extra" data-testid="lbl">
        Time
      </Label>,
    )
    const label = screen.getByTestId('lbl')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveClass('extra')
  })
})

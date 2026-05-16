import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the first milestone shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'RelativityStream' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Earth view')).toBeInTheDocument()
    expect(screen.getByText('Astronaut view')).toBeInTheDocument()
    expect(screen.getByText('Scenario controls')).toBeInTheDocument()
    expect(screen.getByText('Signal propagation')).toBeInTheDocument()
    expect(screen.getByText('Clock comparison')).toBeInTheDocument()
  })

  it('supports the placeholder scenario controls', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('slider', { name: 'Velocity' }), {
      target: { value: '0.5' },
    })
    expect(screen.getByText('0.50 c')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Faster' }))
    expect(screen.getByText('0.55 c')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByText('0.80 c')).toBeInTheDocument()
  })
})

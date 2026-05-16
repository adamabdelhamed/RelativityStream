import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the visual-first simulation shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'RelativityStream' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Earth view')).toBeInTheDocument()
    expect(screen.getByLabelText('Traveler view')).toBeInTheDocument()
    expect(screen.getByLabelText('Signal propagation view')).toBeInTheDocument()
    expect(screen.getByLabelText('How to read signal propagation')).toBeInTheDocument()
    expect(screen.getByText('later')).toBeInTheDocument()
    expect(screen.getByText('farther from Earth')).toBeInTheDocument()
    expect(screen.getByText('0.0 y / 12.0 y')).toBeInTheDocument()
    expect(screen.getByText('Earth reunion')).toBeInTheDocument()
    expect(screen.getByText('Traveler reunion')).toBeInTheDocument()
    expect(screen.getByText('7.2 y')).toBeInTheDocument()
  })

  it('supports compact playback and velocity controls', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('slider', { name: 'Velocity' }), {
      target: { value: '0.5' },
    })
    expect(screen.getByText('0.50 c')).toBeInTheDocument()
    expect(screen.getByText('10.4 y')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Faster' }))
    expect(screen.getByText('0.55 c')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByText('0.80 c')).toBeInTheDocument()
  })

  it('scrubs the timeline through model-backed tree age values', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '6' },
    })

    expect(screen.getByText('6.0 y / 12.0 y')).toBeInTheDocument()
    expect(screen.getByText('Ship clock 3.6 y')).toBeInTheDocument()
    expect(screen.getByText('4.80 ly from Earth')).toBeInTheDocument()
    expect(screen.getByText('Turnaround not visible yet')).toBeInTheDocument()
  })

  it('shows the traveler tree as younger at reunion', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '12' },
    })

    expect(screen.getByRole('img', { name: 'Earth tree aged to 12.0 y' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Traveler tree aged to 7.2 y' })).toBeInTheDocument()
    expect(screen.getByText('local growth rings 12')).toBeInTheDocument()
    expect(screen.getByText('local growth rings 7')).toBeInTheDocument()
  })
})

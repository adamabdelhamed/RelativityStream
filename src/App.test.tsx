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
    expect(screen.getByRole('slider', { name: 'Turnaround distance' })).toBeInTheDocument()
    expect(screen.getByText('4.8 ly')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1x' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Earth POV' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('supports compact playback and scenario sliders', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '2x' }))
    expect(screen.getByRole('button', { name: '2x' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByRole('slider', { name: 'Velocity' }), {
      target: { value: '0.5' },
    })
    expect(screen.getByText('0.50 c')).toBeInTheDocument()
    expect(screen.getByText('9.6 y / 19.2 y')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('slider', { name: 'Turnaround distance' }), {
      target: { value: '10' },
    })
    expect(screen.getByText('10.0 ly')).toBeInTheDocument()
    expect(screen.getByText('20.0 y / 40.0 y')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByText('0.50 c')).toBeInTheDocument()
    expect(screen.getByText('10.0 ly')).toBeInTheDocument()
    expect(screen.getByText('0.0 y / 40.0 y')).toBeInTheDocument()
  })

  it('restarts playback from zero when play is pressed at the end', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '12' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.getByText('0.0 y / 12.0 y')).toBeInTheDocument()
  })

  it('scrubs the timeline through model-backed tree age values', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '6' },
    })

    expect(screen.getByText('6.0 y / 12.0 y')).toBeInTheDocument()
    expect(screen.getByText('Received ship clock 2.0 y')).toBeInTheDocument()
    expect(screen.getByText('2.67 ly from Earth')).toBeInTheDocument()
    expect(screen.getByText('Signal delay 2.67 years')).toBeInTheDocument()
  })

  it('switches to traveler POV and delays the Earth stream', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '6' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Traveler POV' }))

    expect(screen.getByRole('button', { name: 'Traveler POV' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('Received Earth stream from 1.2 y')).toBeInTheDocument()
    expect(screen.getByText('Received clock 1.2 y')).toBeInTheDocument()
    expect(screen.getByText('Ship clock 3.6 y')).toBeInTheDocument()
  })

  it('shows the traveler tree as younger at reunion', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '12' },
    })

    expect(screen.getByRole('img', { name: 'Earth tree aged to 12.0 y' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Traveler tree aged to 7.2 y' })).toBeInTheDocument()
    expect(screen.queryByText(/local growth rings/i)).not.toBeInTheDocument()
  })

  it('highlights the turnaround signal in the propagation overlay', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '6' },
    })

    expect(screen.getByText('turnaround signal')).toBeInTheDocument()
  })
})

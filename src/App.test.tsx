import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the full-screen POV simulation shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'RelativityStream' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Earth POV')).toBeInTheDocument()
    expect(screen.getByLabelText('Traveler POV picture in picture')).toBeInTheDocument()
    expect(screen.getByLabelText('Signal propagation view')).toBeInTheDocument()
    expect(screen.getByText('later')).toBeInTheDocument()
    expect(screen.getByText('farther from Earth')).toBeInTheDocument()
    expect(screen.getByText('0.0 y / 222.2 y')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1x' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: '0.90 c' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: '100.0 ly' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('opens compact popovers for speed, velocity, and distance', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '1x' }))
    fireEvent.click(screen.getByRole('button', { name: '2x' }))
    expect(screen.getByRole('button', { name: '2x' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '6' },
    })
    fireEvent.click(screen.getByRole('button', { name: '0.90 c' }))
    fireEvent.change(screen.getByRole('slider', { name: 'Velocity' }), {
      target: { value: '0.5' },
    })
    expect(screen.getByRole('button', { name: '0.50 c' })).toBeInTheDocument()
    expect(screen.getByText('10.8 y / 400.0 y')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '100.0 ly' }))
    fireEvent.change(screen.getByRole('slider', { name: 'Turnaround distance' }), {
      target: { value: '10' },
    })
    expect(screen.getByRole('button', { name: '10.0 ly' })).toBeInTheDocument()
    expect(screen.getByText('1.1 y / 40.0 y')).toBeInTheDocument()
  })

  it('keeps numeric text edits as drafts until blur, enter, or escape', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '100.0 ly' }))
    const distanceInput = screen.getByRole('spinbutton', {
      name: 'Turnaround distance value',
    })

    fireEvent.change(distanceInput, { target: { value: '' } })
    expect(screen.getByRole('button', { name: '100.0 ly' })).toBeInTheDocument()

    fireEvent.blur(distanceInput)
    expect(screen.getByRole('button', { name: '100.0 ly' })).toBeInTheDocument()

    fireEvent.change(distanceInput, { target: { value: '80' } })
    expect(screen.getByRole('button', { name: '100.0 ly' })).toBeInTheDocument()
    fireEvent.keyDown(distanceInput, { key: 'Enter' })
    expect(screen.getByRole('button', { name: '80.0 ly' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '80.0 ly' }))
    const reopenedDistanceInput = screen.getByRole('spinbutton', {
      name: 'Turnaround distance value',
    })
    fireEvent.change(reopenedDistanceInput, { target: { value: '70' } })
    fireEvent.keyDown(reopenedDistanceInput, { key: 'Escape' })
    expect(screen.getByRole('button', { name: '80.0 ly' })).toBeInTheDocument()
  })

  it('commits numeric text edits when clicking outside the popover', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '100.0 ly' }))
    const distanceInput = screen.getByRole('spinbutton', {
      name: 'Turnaround distance value',
    })

    distanceInput.focus()
    fireEvent.change(distanceInput, { target: { value: '60' } })
    fireEvent.pointerDown(document.body)

    expect(screen.getByRole('button', { name: '60.0 ly' })).toBeInTheDocument()
  })

  it('supports playback, reset, and end restart from the video-style rail', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '222.2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.getByText('0.0 y / 222.2 y')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByText('0.0 y / 222.2 y')).toBeInTheDocument()
  })

  it('scrubs the timeline through model-backed visual ages', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '6' },
    })

    expect(screen.getByText('6.0 y / 222.2 y')).toBeInTheDocument()
    expect(screen.getByText(/Received ship 1.4 y at 2.84 ly/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Earth 3D tree aged to 6.0 y' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Traveler 3D tree aged to 1.4 y' })).toBeInTheDocument()
  })

  it('switches POV from an in-place picture-in-picture click', () => {
    render(<App />)

    const pip = screen.getByLabelText('Traveler POV picture in picture')
    fireEvent.pointerDown(pip, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(pip, { clientX: 100, clientY: 100, pointerId: 1 })

    expect(screen.getByLabelText('Traveler POV')).toBeInTheDocument()
    expect(screen.getByLabelText('Earth POV picture in picture')).toBeInTheDocument()
    expect(screen.getByText('Received Earth stream from 0.0 y')).toBeInTheDocument()
  })

  it('does not switch POV when picture-in-picture is dragged', () => {
    render(<App />)

    const pip = screen.getByLabelText('Traveler POV picture in picture')
    fireEvent.pointerDown(pip, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(document, { clientX: 136, clientY: 118, pointerId: 1 })
    fireEvent.pointerUp(document, { clientX: 136, clientY: 118, pointerId: 1 })

    expect(screen.getByLabelText('Earth POV')).toBeInTheDocument()
    expect(screen.getByLabelText('Traveler POV picture in picture')).toBeInTheDocument()
    expect(fireEvent.contextMenu(pip)).toBe(false)
  })

  it('highlights the turnaround signal in the propagation overlay', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '111.2' },
    })

    expect(screen.getByText('turnaround signal')).toBeInTheDocument()
  })

  it('draws the ship at the diagram turn point for low-speed short-distance scenarios', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '0.90 c' }))
    fireEvent.change(screen.getByRole('slider', { name: 'Velocity' }), {
      target: { value: '0.01' },
    })
    fireEvent.click(screen.getByRole('button', { name: '100.0 ly' }))
    fireEvent.change(screen.getByRole('slider', { name: 'Turnaround distance' }), {
      target: { value: '0.5' },
    })
    fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
      target: { value: '50' },
    })

    const shipMarker = container.querySelector('.overlay-ship')
    const turnLabel = screen.getByText('turn')

    expect(shipMarker).not.toBeNull()
    expect(Number(shipMarker?.getAttribute('cx'))).toBeCloseTo(
      Number(turnLabel.getAttribute('x')) + 70,
    )
  })
})

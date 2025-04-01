import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { AudioTest } from './components/AudioTest'

describe('Audio', () => {
    let mockAudio: HTMLAudioElement

    beforeEach(() => {
        // Mock the Audio constructor
        mockAudio = {
            play: vi.fn().mockResolvedValue(undefined),
            pause: vi.fn(),
            volume: 0,
            loop: false,
        } as unknown as HTMLAudioElement

        vi.spyOn(window, 'Audio').mockImplementation(() => mockAudio)
    })

    it('should not play audio before user interaction', () => {
        render(<AudioTest volume={0.5} paused={false} />)
        expect(mockAudio.play).not.toHaveBeenCalled()
    })

    it('should play audio after user interaction', () => {
        const { container } = render(<AudioTest volume={0.5} paused={false} />)
        // Simulate user interaction
        fireEvent.click(container)
        expect(mockAudio.play).toHaveBeenCalled()
    })

    it('should pause audio when paused flag is true', () => {
        const { container, rerender } = render(<AudioTest volume={0.5} paused={false} />)
        // Simulate user interaction
        fireEvent.click(container)
        rerender(<AudioTest volume={0.5} paused={true} />)
        expect(mockAudio.pause).toHaveBeenCalled()
    })

    it('should update volume when volume changes', () => {
        render(<AudioTest volume={0.5} paused={false} />)
        expect(mockAudio.volume).toBe(0.5)
    })

    it('should set audio to loop', () => {
        render(<AudioTest volume={0.5} paused={false} />)
        expect(mockAudio.loop).toBe(true)
    })

    it('should clamp volume to valid range (0-1)', () => {
        // Test with volume below 0
        render(<AudioTest volume={-0.5} paused={false} />)
        expect(mockAudio.volume).toBe(0)

        // Test with volume above 1
        mockAudio.volume = 0 // Reset volume
        render(<AudioTest volume={1.5} paused={false} />)
        expect(mockAudio.volume).toBe(1)
    })
}) 
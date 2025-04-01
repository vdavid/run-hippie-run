import React from 'react'
import { useBackgroundMusic } from '../../modules/Game'

interface AudioTestProps {
    volume: number
    paused: boolean
}

export const AudioTest: React.FC<AudioTestProps> = ({ volume, paused }) => {
    useBackgroundMusic(volume, paused)
    return null
} 
import { describe, it, expect } from 'vitest'
import { isGameOver, moveChasers, type Player, type Chaser } from '../modules/game-logic'

describe('Game Logic', () => {
    describe('isGameOver', () => {
        it('should return true when player collides with a chaser', () => {
            const player: Player = {
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                image: null,
            }

            const chasers: Chaser[] = [
                {
                    x: 120,
                    y: 120,
                    width: 50,
                    height: 50,
                    image: null,
                },
            ]

            expect(isGameOver(player, chasers)).toBe(true)
        })

        it('should return false when player is not colliding with any chaser', () => {
            const player: Player = {
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                image: null,
            }

            const chasers: Chaser[] = [
                {
                    x: 200,
                    y: 200,
                    width: 50,
                    height: 50,
                    image: null,
                },
            ]

            expect(isGameOver(player, chasers)).toBe(false)
        })

        it('should return true when player collides with any of multiple chasers', () => {
            const player: Player = {
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                image: null,
            }

            const chasers: Chaser[] = [
                {
                    x: 200,
                    y: 200,
                    width: 50,
                    height: 50,
                    image: null,
                },
                {
                    x: 120,
                    y: 120,
                    width: 50,
                    height: 50,
                    image: null,
                },
            ]

            expect(isGameOver(player, chasers)).toBe(true)
        })
    })

    describe('moveChasers', () => {
        it('should move chasers towards the player', () => {
            const player: Player = {
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                image: null,
            }

            const chasers: Chaser[] = [
                {
                    x: 0,
                    y: 0,
                    width: 50,
                    height: 50,
                    image: null,
                },
            ]

            const playerSpeed = 10
            const newChasers = moveChasers(player, chasers, playerSpeed)

            // Chaser should move towards player
            expect(newChasers[0].x).toBeGreaterThan(0)
            expect(newChasers[0].y).toBeGreaterThan(0)
        })

        it('should maintain minimum distance between chasers', () => {
            const player: Player = {
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                image: null,
            }

            const chasers: Chaser[] = [
                {
                    x: 0,
                    y: 0,
                    width: 50,
                    height: 50,
                    image: null,
                },
                {
                    x: 10,
                    y: 10,
                    width: 50,
                    height: 50,
                    image: null,
                },
            ]

            const playerSpeed = 10
            let newChasers = moveChasers(player, chasers, playerSpeed)

            // Apply multiple iterations to allow chasers to separate
            for (let i = 0; i < 5; i++) {
                newChasers = moveChasers(player, newChasers, playerSpeed)
            }

            // Calculate distance between chasers
            const dx = newChasers[0].x - newChasers[1].x
            const dy = newChasers[0].y - newChasers[1].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Chasers should be at least 50 pixels apart
            expect(distance).toBeGreaterThanOrEqual(50)
        })

        it('should not modify original chasers array', () => {
            const player: Player = {
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                image: null,
            }

            const chasers: Chaser[] = [
                {
                    x: 0,
                    y: 0,
                    width: 50,
                    height: 50,
                    image: null,
                },
            ]

            const playerSpeed = 10
            const originalChasers = [...chasers]
            moveChasers(player, chasers, playerSpeed)

            // Original chasers should remain unchanged
            expect(chasers[0].x).toBe(originalChasers[0].x)
            expect(chasers[0].y).toBe(originalChasers[0].y)
        })
    })
}) 
import styles from './Game.module.scss'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Character, Chaser, isGameOver, moveChasers, Player } from './game-logic'
import { BladeOfGrass, drawGrass, generateRandomGrass } from './grass'

const CHARACTER_WIDTH = 30
const CHARACTER_HEIGHT = 50

const DEFAULT_PLAYER_SPEED = 2

function createCharacter(x: number, y: number, image: HTMLImageElement): Character {
    return { x, y, width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT, image }
}

function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve) => {
        const playerImg = new Image()
        playerImg.src = url
        playerImg.onload = () => resolve(playerImg)
    })
}

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [windowSize, setWindowSize] = useState<{ width: number; height: number } | null>(null)

    const [grass, setGrass] = useState<BladeOfGrass[]>([])

    const [player, setPlayer] = useState<Player>({ x: 0, y: 0, width: 0, height: 0, image: null })

    const [targetX, setTargetX] = useState<number>(-1)
    const [targetY, setTargetY] = useState<number>(-1)

    const [playerSpeed, setPlayerSpeed] = useState(DEFAULT_PLAYER_SPEED)

    const [score, setScore] = useState<number>(0)
    const [highScore, setHighScore] = useState<number>(0)

    const [chasers, setChasers] = useState<Chaser[]>([])

    const [gameLoopStarted, setGameLoopStarted] = useState(false)
    const [interacted, setInteracted] = useState(false)

    const [keys, setKeys] = useState({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
    })

    const [musicVolume, setMusicVolume] = useState(0.2)

    useBackgroundMusic(musicVolume, !gameLoopStarted || !interacted)

    // Initialize
    useEffect(() => {
        if (gameLoopStarted) {
            return
        }

        // Set initial window size
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        })

        // Set initial player position
        setTargetX(window.innerWidth / 2 - CHARACTER_WIDTH / 2)
        setTargetY(window.innerHeight / 2 - CHARACTER_HEIGHT / 2)

        if (!player.image) {
            const loadImages = async () => {
                // Start loading images
                const [playerImg, chaserImg] = await Promise.all([
                    loadImage('/player.svg'),
                    loadImage('/romanian.svg'),
                ])
                setPlayer(
                    createCharacter(
                        window.innerWidth / 2 - CHARACTER_WIDTH / 2,
                        window.innerHeight / 2 - CHARACTER_HEIGHT / 2,
                        playerImg,
                    ),
                )
                const createRandomChaser: () => Chaser = () =>
                    createCharacter(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight,
                        chaserImg,
                    )
                setChasers([createRandomChaser(), createRandomChaser(), createRandomChaser()])
            }
            loadImages().then()
        }

        // Update window size on resize
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }
        window.addEventListener('resize', handleResize)

        // Generate grass
        setGrass(generateRandomGrass(1920, 1080))

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [gameLoopStarted, player])

    const render = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')

        if (player.image && ctx && windowSize && canvas) {
            // Clear screen
            ctx.clearRect(0, 0, canvas?.width, canvas?.height)

            // Draw grass on the field
            if (canvasRef.current) {
                drawGrass(grass, windowSize, canvasRef.current)
            }

            // Draw player and chasers
            ctx.drawImage(player.image, player.x, player.y, player.width, player.height)
            for (const chaser of chasers) {
                ctx.drawImage(chaser.image!, chaser.x, chaser.y, chaser.width, chaser.height)
            }

            // Draw score
            ctx.fillStyle = '#000000' // Black
            ctx.font = '20px Arial'
            ctx.fillText('Score: ' + Math.round(score), 10, 30)
            ctx.fillText('High score: ' + Math.round(highScore), 10, 60)
        }
    }, [player, chasers, grass, windowSize, score, highScore])

    const update = useCallback(() => {
        // Player keyboard logic
        if (keys.ArrowUp && player.y - playerSpeed > 0) {
            setPlayer((player) => ({ ...player, y: player.y - playerSpeed }))
            setTargetY((targetY) => targetY - playerSpeed)
        }
        if (
            keys.ArrowDown &&
            player.y + playerSpeed + CHARACTER_HEIGHT < (windowSize?.height ?? 0)
        ) {
            setPlayer((player) => ({ ...player, y: player.y + playerSpeed }))
            setTargetY((targetY) => targetY + playerSpeed)
        }
        if (keys.ArrowLeft && player.x - playerSpeed > 0) {
            setPlayer((player) => ({ ...player, x: player.x - playerSpeed }))
            setTargetX((targetX) => targetX - playerSpeed)
        }
        if (
            keys.ArrowRight &&
            player.x + playerSpeed + CHARACTER_WIDTH < (windowSize?.width ?? 0)
        ) {
            setPlayer((player) => ({ ...player, x: player.x + playerSpeed }))
            setTargetX((targetX) => targetX + playerSpeed)
        }

        // Player mouse logic
        const dx = targetX - player.x
        const dy = targetY - player.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > playerSpeed) {
            const newPlayerX = player.x + (dx / distance) * playerSpeed
            const newPlayerY = player.y + (dy / distance) * playerSpeed
            if (newPlayerX > 0 && newPlayerX + CHARACTER_WIDTH < (windowSize?.width ?? 0)) {
                setPlayer((player) => ({ ...player, x: newPlayerX }))
            }
            if (newPlayerY > 0 && newPlayerY + CHARACTER_HEIGHT < (windowSize?.height ?? 0)) {
                setPlayer((player) => ({ ...player, y: newPlayerY }))
            }
        }

        // Detect end of game
        if (isGameOver(player, chasers)) {
            setScore(0)
        }

        // Chaser chasing player logic
        setChasers(moveChasers(player, chasers, playerSpeed))

        // Calculate minimum distance between chasers and player, and set audio volume accordingly
        if (chasers.length) {
            let minDistance = Infinity
            for (let i = 0; i < chasers.length; i++) {
                const dx = player.x - chasers[i].x
                const dy = player.y - chasers[i].y
                const distance = Math.sqrt(dx * dx + dy * dy)
                minDistance = Math.min(minDistance, distance)
            }
            const maxSize = windowSize ? Math.max(windowSize.width, windowSize.height) : 0
            const calculatedVolume = maxSize ? Math.max(0, Math.pow(1 - minDistance / (maxSize / 4), 2)) : 0
            // Ensure volume is within valid range before setting
            setMusicVolume(Math.max(0, Math.min(1, calculatedVolume)))
        }

        // Increase speed
        setPlayerSpeed(DEFAULT_PLAYER_SPEED * Math.max(score / 10, 1))

        setScore((score) => score + playerSpeed / 20)
        setHighScore((highScore) => Math.max(score, highScore))
    }, [
        chasers,
        keys.ArrowDown,
        keys.ArrowLeft,
        keys.ArrowRight,
        keys.ArrowUp,
        playerSpeed,
        player,
        score,
        targetX,
        targetY,
        windowSize,
    ])

    const mouseMoveHandler = useMemo(
        () => (event: MouseEvent) => {
            if (event.buttons === 1) {
                // Check if left mouse button is pressed
                setTargetX(event.clientX - CHARACTER_WIDTH / 2)
                setTargetY(event.clientY - CHARACTER_HEIGHT / 2)
                setInteracted(true)
            }
        },
        [],
    )

    const touchMoveHandler = useMemo(
        () => (event: TouchEvent) => {
            setTargetX(event.touches[0].clientX - CHARACTER_WIDTH / 2)
            setTargetY(event.touches[0].clientY - CHARACTER_HEIGHT / 2)
            setInteracted(true)
        },
        [],
    )

    const mouseUpHandler = useMemo(
        () => () => {
            setTargetX(player.x)
            setTargetY(player.y)
        },
        [player],
    )

    const touchEndHandler = useMemo(
        () => () => {
            setTargetX(player.x)
            setTargetY(player.y)
        },
        [player],
    )

    const keydownHandler = useCallback((event: KeyboardEvent) => {
        setInteracted(true)

        if (event.key.includes('Arrow')) {
            event.preventDefault()
        }

        setKeys((keys) => ({ ...keys, [event.key]: true }))
    }, [])

    const keyupHandler = useCallback((event: KeyboardEvent) => {
        setKeys((keys) => ({ ...keys, [event.key]: false }))
    }, [])

    const updateRef = useRef(update)
    const renderRef = useRef(render)
    const keydownHandlerRef = useRef(keydownHandler)
    const keyupHandlerRef = useRef(keyupHandler)
    const mouseMoveHandlerRef = useRef(mouseMoveHandler)
    const touchMoveHandlerRef = useRef(touchMoveHandler)
    const mouseUpHandlerRef = useRef(mouseUpHandler)
    const touchEndHandlerRef = useRef(touchEndHandler)

    updateRef.current = update
    renderRef.current = render
    keydownHandlerRef.current = keydownHandler
    keyupHandlerRef.current = keyupHandler
    mouseMoveHandlerRef.current = mouseMoveHandler
    touchMoveHandlerRef.current = touchMoveHandler
    mouseUpHandlerRef.current = mouseUpHandler
    touchEndHandlerRef.current = touchEndHandler

    // Game loop
    useEffect(() => {
        if (!windowSize || gameLoopStarted) {
            return
        }

        const gameLoop = () => {
            updateRef.current()
            renderRef.current()
            requestAnimationFrame(gameLoop)
        }

        window.addEventListener('keydown', (e) => keydownHandlerRef.current(e))
        window.addEventListener('keyup', (e) => keyupHandlerRef.current(e))

        window.addEventListener('mousemove', (e) => mouseMoveHandlerRef.current(e))
        window.addEventListener('touchmove', (e) => touchMoveHandlerRef.current(e))
        window.addEventListener('mouseup', () => mouseUpHandlerRef.current())
        window.addEventListener('touchend', () => touchEndHandlerRef.current())

        gameLoop()
        setGameLoopStarted(true)

        return () => {
            window.removeEventListener('keydown', (e) => keydownHandlerRef.current(e))
            window.removeEventListener('keyup', (e) => keyupHandlerRef.current(e))
            window.removeEventListener('mousemove', (e) => mouseMoveHandlerRef.current(e))
            window.removeEventListener('touchmove', (e) => touchMoveHandlerRef.current(e))
            window.removeEventListener('mouseup', () => mouseUpHandlerRef.current())
            window.removeEventListener('touchend', () => touchEndHandlerRef.current())
        }
    }, [gameLoopStarted, windowSize])

    return (
        <canvas
            className={styles.canvas}
            ref={canvasRef}
            width={windowSize?.width}
            height={windowSize?.height}
        ></canvas>
    )
}

export const useBackgroundMusic = (volume: number, paused: boolean): void => {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [hasInteracted, setHasInteracted] = useState(false)

    useEffect(() => {
        const handleInteraction = () => {
            setHasInteracted(true)
            // Remove the listeners once we've detected interaction
            window.removeEventListener('click', handleInteraction)
            window.removeEventListener('keydown', handleInteraction)
            window.removeEventListener('touchstart', handleInteraction)
        }

        window.addEventListener('click', handleInteraction)
        window.addEventListener('keydown', handleInteraction)
        window.addEventListener('touchstart', handleInteraction)

        return () => {
            window.removeEventListener('click', handleInteraction)
            window.removeEventListener('keydown', handleInteraction)
            window.removeEventListener('touchstart', handleInteraction)
        }
    }, [])

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/romania-anthem.mp3')
            audioRef.current.loop = true
        }

        const audio = audioRef.current
        // Ensure volume is within valid range (0-1)
        audio.volume = Math.max(0, Math.min(1, volume))

        if (paused || !hasInteracted) {
            audio.pause()
        } else {
            const playPromise = audio.play()
            if (playPromise) {
                playPromise.catch((error) => {
                    // Ignore errors about user interaction - they're expected
                    if (error.name !== 'NotAllowedError') {
                        console.error('Error playing audio:', error)
                    }
                })
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
            }
        }
    }, [volume, paused, hasInteracted])
}

export default Game

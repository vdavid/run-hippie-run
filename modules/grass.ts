export type BladeOfGrass = { x: number; y: number; length: number; width: number }

export function generateRandomGrass(screenWidth: number, screenHeight: number): BladeOfGrass[] {
    const grass = []
    for (let i = 0; i < 4000; i++) {
        grass.push({
            x: Math.random() * screenWidth,
            y: Math.random() * screenHeight,
            length: Math.random() * 10,
            width: Math.random() * 2,
        })
    }
    return grass
}

export function drawGrass(
    grassData: BladeOfGrass[],
    windowSize: {
        width: number
        height: number
    },
    canvas: HTMLCanvasElement,
) {
    const grassColor = '#228b22'
    const backgroundColor = '#98fb98'

    const ctx = canvas.getContext('2d')
    if (ctx) {
        // Scale the context
        ctx.save() // Save the current state
        ctx.scale(windowSize?.width! / 1920, windowSize?.height! / 1080)

        // Draw the background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, 1920, 1080)

        // Draw the grass
        ctx.fillStyle = grassColor
        for (const blade of grassData) {
            ctx.fillRect(blade.x, blade.y, blade.width, blade.length)
        }

        // Reset the transformation
        ctx.restore() // Restore to the state before scaling
    }
}

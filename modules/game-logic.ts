export type Character = {
    x: number
    y: number
    width: number
    height: number
    image: HTMLImageElement | null
}
export type Player = Character
export type Chaser = Character

export function isGameOver(player: Player, chasers: Chaser[]): boolean {
    for (const chaser of chasers) {
        if (
            Math.abs(player.x - chaser.x) < player.width &&
            Math.abs(player.y - chaser.y) < player.height
        ) {
            return true
        }
    }
    return false
}

export function moveChasers(player: Player, chasers: Chaser[], playerSpeed: number) {
    const newChasers = chasers.map((chaser) => ({ ...chaser }))

    for (const chaser of newChasers) {
        let dx = player.x - chaser.x
        let dy = player.y - chaser.y
        let distance = Math.sqrt(dx * dx + dy * dy)

        chaser.x += (dx / distance) * (playerSpeed / 2)
        chaser.y += (dy / distance) * (playerSpeed / 2)
    }

    // Keep chasers away from each other
    const minDistance = 50 // Chasers should stay at least 50 pixels apart
    for (let i = 0; i < newChasers.length; i++) {
        for (let j = i + 1; j < newChasers.length; j++) {
            let dx = newChasers[i].x - newChasers[j].x
            let dy = newChasers[i].y - newChasers[j].y
            let distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < minDistance) {
                // If chasers are too close, nudge them apart
                let angle = Math.atan2(dy, dx)

                // Push chaser[i] away from chaser[j]
                newChasers[i].x += Math.cos(angle) * (playerSpeed / 2)
                newChasers[i].y += Math.sin(angle) * (playerSpeed / 2)

                // Push chaser[j] away from chaser[i]
                newChasers[j].x -= Math.cos(angle) * (playerSpeed / 2)
                newChasers[j].y -= Math.sin(angle) * (playerSpeed / 2)
            }
        }
    }

    return newChasers
}

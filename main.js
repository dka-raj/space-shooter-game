var game
𝛑 = Math.PI

addEventListener("DOMContentLoaded", () => {
    game = new Game(document.getElementById("main").getContext("2d"), {
        enemyLap: 1.75,
        projectileSpeed: 5.75,
        enemySpeed: 2.5,
        epl: 2
    })
    game.run()
})

class Shooter {
    constructor(ctx, ppt) {
        this.ctx = ctx
        this.ppt = ppt
    }

    spawn() {
        this.x = this.ctx.canvas.width / 2
        this.y = this.ctx.canvas.height / 2
        this.ctx.beginPath()
        this.ctx.fillStyle = this.ppt.color
        this.ctx.arc(this.x, this.y, this.ppt.radius, 0, 2 * 𝛑)
        this.ctx.fill()
        this.ctx.closePath()
    }
}

class Projectile {
    constructor(ctx, ppt, coordinates, origin) {
        this.ctx = ctx
        this.ppt = ppt
        this.origin = origin
        this.coordinates = coordinates
        this.x = origin.x
        this.y = origin.y

        let perp = (this.coordinates.y - this.origin.y)
        let base = (this.coordinates.x - this.origin.x)
        let hyp = Math.sqrt(perp ** 2 + base ** 2)

        this.vx = (base / hyp) * this.ppt.speed
        this.vy = (perp / hyp) * this.ppt.speed
    }
    spawn() {
        this.ctx.beginPath()
        this.ctx.fillStyle = this.ppt.color
        this.ctx.arc(this.x, this.y, this.ppt.radius, 0, 2 * 𝛑)
        this.ctx.fill()
        // this.ctx.closePath()
        this.x += this.vx
        this.y += this.vy
    }
}

class Particles {
    constructor(ctx, ppt, coordinates, origin) {
        this.ctx = ctx
        this.ppt = ppt
        this.origin = origin
        this.coordinates = coordinates
        this.x = origin.x
        this.y = origin.y

        let perp = (this.coordinates.y - this.origin.y)
        let base = (this.coordinates.x - this.origin.x)
        let hyp = Math.sqrt(perp ** 2 + base ** 2)

        this.vx = (base / hyp) * this.ppt.speed
        this.vy = (perp / hyp) * this.ppt.speed
    }
    spawn() {
        this.ctx.beginPath()
        this.ctx.fillStyle = this.ppt.color
        this.ctx.arc(this.x, this.y, this.ppt.radius, 0, 2 * 𝛑)
        this.ctx.fill()
        // this.ctx.closePath()
        this.x += this.vx
        this.y += this.vy
    }
}

class Enemy {
    constructor(ctx, ppt, coordinates, origin) {
        this.ctx = ctx
        this.ppt = ppt
        this.origin = origin
        this.coordinates = coordinates
        this.x = coordinates.x
        this.y = coordinates.y

        let perp = (this.origin.x - this.coordinates.x)
        let base = (this.origin.y - this.coordinates.y)
        let hyp = Math.sqrt(perp ** 2 + base ** 2)

        this.vx = (perp / hyp) * this.ppt.speed
        this.vy = (base / hyp) * this.ppt.speed
    }
    spawn() {
        this.ctx.beginPath()
        this.ctx.fillStyle = this.ppt.color
        this.ctx.arc(this.x, this.y, this.ppt.radius, 0, 2 * 𝛑)
        this.ctx.fill()
        this.ctx.closePath()
        this.x += this.vx
        this.y += this.vy
    }
}

class Game {
    constructor(context, values) {
        this.context = context
        this.values = values
        this.projectiles = []
        this.enemies = []
        this.isGameRunning = false
        this.i = 0
        this.aura = 0
        this.icons = {
            pause: new Image()
        }
        this.icons.pause.src = './play.png'
    }
    run() {
        this.context.canvas.addEventListener("mousedown", ({ sourceCapabilities, offsetX, offsetY }) => {
            if (sourceCapabilities.firesTouchEvents) return
            if (Math.hypot(this.shooter.x - offsetX, this.shooter.y - offsetY) < this.shooter.ppt.radius) this.pause()
            else {
                let projectile = this.regProjectile(offsetX, offsetY)
                this.projectiles.push(projectile)
            }
        })
        this.context.canvas.addEventListener("touchstart", ({ touches }) => {
            Object.values(touches).forEach(({ clientX, clientY }) => {
                if (Math.hypot(this.shooter.x - clientX, this.shooter.y - clientY) < this.shooter.ppt.radius) this.pause()
                else {
                    let projectile = this.regProjectile(clientX, clientY)
                    this.projectiles.push(projectile)
                }
            })
        })
        window.addEventListener("keydown", ({ key }) => {
            if (key === " ") this.pause()
            else if (key === "8") this.boom()
        })
        this.context.canvas.width = window.innerWidth
        this.context.canvas.height = window.innerHeight
        this.shooter = new Shooter(this.context, {
            color: "#fff",
            radius: 22
        })
        this.boomData = [
            {
                x: this.shooter.x,
                y: this.shooter.y - this.shooter.ppt.radius
            },
            {
                x: this.shooter.x - this.shooter.ppt.radius,
                y: this.shooter.y
            },
            {
                x: this.shooter.x,
                y: this.shooter.y + this.shooter.ppt.radius
            },
            {
                x: this.shooter.x + this.shooter.ppt.radius,
                y: this.shooter.y
            },
            {
                x: this.shooter.x - this.shooter.ppt.radius,
                y: this.shooter.y - this.shooter.ppt.radius
            },
            {
                x: this.shooter.x + this.shooter.ppt.radius,
                y: this.shooter.y + this.shooter.ppt.radius
            },
            {
                x: this.shooter.x + this.shooter.ppt.radius,
                y: this.shooter.y - this.shooter.ppt.radius
            },
            {
                x: this.shooter.x - this.shooter.ppt.radius,
                y: this.shooter.y + this.shooter.ppt.radius
            }
        ]


        this.animationId = requestAnimationFrame(this.animate.bind(this))
        this.isGameRunning = true
        setTimeout(() => {
            this.pause()
        }, 1000);
    }
    animate() {
        this.context.fillStyle = `rgba(0,0,0,.2)`
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height)

        this.enemies.forEach((enemy, ie) => {
            enemy.spawn()
            let dist = Math.hypot(this.shooter.x - enemy.x, this.shooter.y - enemy.y)
            // over
            if (dist <= (enemy.ppt.radius + this.shooter.ppt.radius)) {
                alert("😭😭😭😭\nGame over!\nPress Ok to Play again!")
                this.enemies=[]
            }
            this.projectiles.forEach((projectile, ip) => {
                if (projectile.x <= 0 || projectile.y <= 0 || projectile.x >= this.context.canvas.width || projectile.y >= this.context.canvas.height) {
                    this.projectiles.splice(ip, 1)
                }
                let dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

                // when projectile hits the enemy
                if (dist <= (enemy.ppt.radius + projectile.ppt.radius + projectile.ppt.aura)) {
                    if (enemy.ppt.radius - 10 > 10) {
                        gsap.to(enemy.ppt,{
                            radius: enemy.ppt.radius-10
                        })
                        setTimeout(() => {
                            this.projectiles.splice(ip, 1)
                        })
                    } else {
                        setTimeout(() => {
                            this.projectiles.splice(ip, 1)
                            this.enemies.splice(ie, 1)
                        }, 0);
                    }
                }
            })
        })
        this.projectiles.forEach((projectile) => { projectile.spawn() })
        this.shooter.spawn()

        if (this.i !== 60 * this.values.enemyLap) {
            this.i++
        } else {
            for (let i = 0; i < this.values.epl; i++) {
                let enemy = this.regEnemy(this.eOrigin())
                this.enemies.push(enemy)
            }
            this.i = 0
        }
        this.animationId = requestAnimationFrame(this.animate.bind(this))
    }
    boom() {
        this.boomData.forEach((coordinate) => {
            let projectile = new Projectile(this.context, {
                color: "green",
                radius: this.shooter.ppt.radius,
                speed: this.values.projectileSpeed * 10,
                aura: 50
            }, coordinate, {
                x: this.shooter.x,
                y: this.shooter.y
            })
            this.projectiles.push(projectile)
        })
    }

    regProjectile(x, y) {
        return new Projectile(this.context, {
            color: this.shooter.ppt.color,
            radius: 10,
            speed: this.values.projectileSpeed,
            aura: 0
        }, { x, y }, {
            x: this.shooter.x,
            y: this.shooter.y
        })
    }
    regEnemy(coordinates) {
        return new Enemy(this.context, {
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            radius: Math.random() * 33 + 7,
            speed: this.values.enemySpeed
        }, coordinates, {
            x: this.shooter.x,
            y: this.shooter.y
        })
    }
    eOrigin() {
        let wall = Math.round(Math.random() * 3) + 1
        let randNo = Math.random()
        let height = this.context.canvas.height, width = this.context.canvas.width
        let x = 0, y = 0
        switch (wall) {
            case 1:
                x = 0
                y = randNo * height
                break;
            case 2:
                x = width
                y = randNo * height
                break;
            case 3:
                x = randNo * width
                y = 0
                break;
            case 1:
                x = randNo * width
                x = height
                break;

            default:
                x = y = 0
                break;
        }
        return { x, y }
    }
    pause() {
        if (this.isGameRunning) {
            cancelAnimationFrame(this.animationId)
            this.isGameRunning = false

            let diameter = this.shooter.ppt.radius * 2 - 2
            let x = this.shooter.x - this.shooter.ppt.radius + 1
            let y = this.shooter.y - this.shooter.ppt.radius + 1
            this.context.drawImage(this.icons.pause, x, y, diameter, diameter)
        } else {
            this.animationId = requestAnimationFrame(this.animate.bind(this))
            this.isGameRunning = true
        }
    }
}
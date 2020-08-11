import {
  BALL_RADIUS,
  COLORS,
  MORTALITY_PERCENTAGE,
  TICKS_TO_RECOVER,
  RUN,
  SPEED,
  STATES,
  SOCIAL_DISTANCING_INFECTION_RATE
} from './options.js'
import { checkCollision, calculateChangeDirection } from './collisions.js'

const diameter = BALL_RADIUS * 2

export class Ball {
  constructor ({ x, y, id, state, sketch, hasMovement }) {
    this.x = x
    this.y = y
    this.vx = sketch.random(-1, 1) * SPEED
    this.vy = sketch.random(-1, 1) * SPEED
    this.sketch = sketch
    this.id = id
    this.state = state
    this.timeInfected = 0
    this.hasMovement = hasMovement
    this.hasCollision = true
    this.survivor = false
  }

  checkState () {
    if (this.state === STATES.infected || this.state === STATES.sd_infected) {
      if (RUN.filters.death && !this.survivor && this.timeInfected >= TICKS_TO_RECOVER / 2) {
        this.survivor = this.sketch.random(100) >= MORTALITY_PERCENTAGE
        if (!this.survivor) {
          this.hasMovement = false
          this.state = STATES.death
          RUN.results[STATES.infected]--
          RUN.results[STATES.death]++
          return
        }
      }

      if (this.timeInfected >= TICKS_TO_RECOVER) {
        if (this.state === STATES.sd_infected) {
          this.state = STATES.sd_recovered
        } else {
          this.state = STATES.recovered
        }

        RUN.results[STATES.infected]--
        RUN.results[STATES.recovered]++
      } else {
        this.timeInfected++
      }
    }
  }

  checkCollisions ({ others, sketch }) {
    if (this.state === STATES.death) return

    for (let i = this.id + 1; i < others.length; i++) {
      const otherBall = others[i]
      const { state, x, y } = otherBall
      if (state === STATES.death) continue

      let radiusMultiplier = 2
      if (this.state === STATES.social_distancing ||
        otherBall.state === STATES.social_distancing ||
        this.state === STATES.sd_infected ||
        otherBall.state === STATES.sd_infected ||
        this.state === STATES.sd_recovered ||
        otherBall.state === STATES.sd_recovered
      ) radiusMultiplier = 6

      const dx = x - this.x
      const dy = y - this.y

      if (checkCollision({ dx, dy, diameter: BALL_RADIUS * radiusMultiplier })) {
        const { ax, ay } = calculateChangeDirection({ dx, dy })

        // There is still a chance that social distancing can be infected
        const socialDistancingInfected = sketch.random(0, 100) < SOCIAL_DISTANCING_INFECTION_RATE

        this.vx -= ax
        this.vy -= ay
        otherBall.vx = ax
        otherBall.vy = ay

        // both has same state, so nothing to do
        if (this.state === state) return

        // If any are social distancing then don't infect
        if ((state === STATES.social_distancing || this.state === STATES.social_distancing) &&
          !socialDistancingInfected) return

        // if any is recovered, then nothing happens
        if (this.state === STATES.recovered || state === STATES.recovered ||
          this.state === STATES.sd_recovered || state === STATES.sd_recovered) return

        // then, if some is infected, then we make both infected
        if ((this.state === STATES.infected ||
          state === STATES.infected) &&
          this.state !== STATES.sd_infected &&
            state !== STATES.sd_infected) {
          if (socialDistancingInfected && (this.state === STATES.social_distancing ||
            state === STATES.social_distancing)) {
            RUN.results.sd_infected++

            if (this.state === STATES.social_distancing) this.state = STATES.sd_infected
            if (state === STATES.social_distancing) otherBall.state = STATES.sd_infected
          } else {
            this.state = otherBall.state = STATES.infected
          }

          RUN.results[STATES.infected]++
          RUN.results[STATES.well]--
        }
      }
    }
  }

  move () {
    if (!this.hasMovement) return

    this.x += this.vx
    this.y += this.vy

    // check horizontal walls
    if (
      (this.x + BALL_RADIUS > this.sketch.width && this.vx > 0) ||
      (this.x - BALL_RADIUS < 0 && this.vx < 0)) {
      this.vx *= -1
    }

    // check vertical walls
    if (
      (this.y + BALL_RADIUS > this.sketch.height && this.vy > 0) ||
      (this.y - BALL_RADIUS < 0 && this.vy < 0)) {
      this.vy *= -1
    }
  }

  render () {
    const color = COLORS[this.state]
    this.sketch.noStroke()
    if (this.state === STATES.sd_infected || this.state === STATES.social_distancing ||
      this.state === STATES.sd_recovered) this.sketch.stroke(COLORS.sd_stroke)
    this.sketch.fill(color)
    this.sketch.ellipse(this.x, this.y, diameter, diameter)
  }
}

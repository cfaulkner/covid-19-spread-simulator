import {
  BALL_RADIUS,
  CANVAS_SIZE,
  DESKTOP_CANVAS_SIZE,
  STARTING_BALLS,
  RUN,
  STATIC_PEOPLE_PERCENTAGE,
  STATES,
  TOTAL_PEOPLE,
  TOTAL_INFECTED, TOTAL_TICKS
} from './options.js'

import {
  replayButton,
  deathFilter,
  stayHomeFilter,
  socialDistancePlus,
  socialDistanceMinus,
  socialDistancingTotal
} from './dom.js'

import { Ball } from './Ball.js'

import {
  resetValues,
  updateCount
} from './results.js'

let balls = []
const matchMedia = window.matchMedia('(min-width: 800px)')

let isDesktop = matchMedia.matches

export const canvas = new window.p5(sketch => { // eslint-disable-line
  const startBalls = () => {
    let id = 0
    balls = []
    Object.keys(STARTING_BALLS).forEach(state => {
      Array.from({ length: STARTING_BALLS[state] }, () => {
        const hasMovement = RUN.filters.stayHome
          ? sketch.random(0, 100) < STATIC_PEOPLE_PERCENTAGE || state === STATES.infected
          : true

        balls[id] = new Ball({
          id,
          sketch,
          state,
          hasMovement,
          x: sketch.random(BALL_RADIUS, sketch.width - BALL_RADIUS),
          y: sketch.random(BALL_RADIUS, sketch.height - BALL_RADIUS)
        })
        id++
      })
    })
  }

  const createCanvas = () => {
    const { height, width } = isDesktop
      ? DESKTOP_CANVAS_SIZE
      : CANVAS_SIZE

    sketch.createCanvas(width, height)
  }

  const changeSDValue = () => {
    STARTING_BALLS[STATES.social_distancing] = parseInt(socialDistancingTotal.value)

    if (STARTING_BALLS[STATES.social_distancing] > TOTAL_PEOPLE - TOTAL_INFECTED) {
      STARTING_BALLS[STATES.social_distancing] = TOTAL_PEOPLE - TOTAL_INFECTED
      socialDistancingTotal.value = STARTING_BALLS[STATES.social_distancing]
    }

    if (STARTING_BALLS[STATES.social_distancing] <= 0) {
      socialDistancingTotal.value = 0
      STARTING_BALLS[STATES.social_distancing] = 0
    }

    STARTING_BALLS[STATES.well] = TOTAL_PEOPLE - TOTAL_INFECTED -
      STARTING_BALLS[STATES.social_distancing]
    RUN.tick = TOTAL_TICKS
    document.getElementById(STATES.social_distancing).innerText =
      STARTING_BALLS[STATES.social_distancing]
  }

  sketch.setup = () => {
    createCanvas()
    startBalls()

    matchMedia.addListener(e => {
      isDesktop = e.matches
      createCanvas()
      startBalls()
      resetValues()
    })

    replayButton.onclick = () => {
      startBalls()
      resetValues()
    }

    deathFilter.onclick = () => {
      RUN.filters.death = !RUN.filters.death
      document.getElementById('death-count').classList.toggle('show', RUN.filters.death)
      startBalls()
      resetValues()
    }

    stayHomeFilter.onchange = () => {
      RUN.filters.stayHome = !RUN.filters.stayHome
      startBalls()
      resetValues()
    }

    socialDistancePlus.onclick = () => {
      socialDistancingTotal.value = parseInt(socialDistancingTotal.value) + 5
      console.log(socialDistancingTotal.value)
      changeSDValue()
    }

    socialDistanceMinus.onclick = () => {
      socialDistancingTotal.value = parseInt(socialDistancingTotal.value) - 5
      changeSDValue()
    }
  }

  RUN.results[STATES.well] += parseInt(RUN.results[STATES.social_distancing])

  sketch.draw = () => {
    sketch.background('white')
    balls.forEach(ball => {
      ball.checkState()
      ball.checkCollisions({ others: balls, sketch: sketch })
      ball.move()
      ball.render()
    })
    updateCount()
  }
}, document.getElementById('canvas'))

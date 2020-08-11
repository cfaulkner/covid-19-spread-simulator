import {
  BALL_RADIUS,
  CANVAS_SIZE,
  DESKTOP_CANVAS_SIZE,
  STARTING_BALLS,
  RUN,
  STATES,
  TOTAL_PEOPLE,
  TOTAL_INFECTED,
  TOTAL_TICKS
} from './options.js'

import {
  replayButton,
  socialDistancePlus,
  socialDistanceMinus,
  socialDistancingTotal,
  isolationPlus,
  isolationTotal,
  isolationMinus
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
    document.getElementById('isolating').innerText =
    parseInt(isolationTotal.value)
    let id = 0
    let isolated = 0
    balls = []

    Object.keys(STARTING_BALLS).forEach(state => {
      Array.from({ length: STARTING_BALLS[state] }, () => {
        const hasMovement = (isolated >= parseInt(isolationTotal.value) + 1 ||
          state === STATES.infected || state === STATES.social_distancing) &&
          parseInt(isolationTotal.value) < TOTAL_PEOPLE

        if (!hasMovement) isolated++

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

    if (STARTING_BALLS[STATES.social_distancing] + parseInt(isolationTotal.value) >
      TOTAL_PEOPLE - TOTAL_INFECTED) {
      isolationTotal.value = parseInt(isolationTotal.value) - 1
      changeIsoValue()
    }
  }

  const changeIsoValue = () => {
    if (isolationTotal.value > TOTAL_PEOPLE) {
      isolationTotal.value = TOTAL_PEOPLE
    }

    if (isolationTotal.value <= 0) {
      isolationTotal.value = 0
    }

    RUN.tick = TOTAL_TICKS

    if (STARTING_BALLS[STATES.social_distancing] + parseInt(isolationTotal.value) >
      TOTAL_PEOPLE - TOTAL_INFECTED) {
      socialDistancingTotal.value = parseInt(socialDistancingTotal.value) - 1
      changeSDValue()
    }

    document.getElementById('isolating').innerText =
      parseInt(isolationTotal.value)
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

    socialDistancePlus.onclick = () => {
      socialDistancingTotal.value = parseInt(socialDistancingTotal.value) + 1
      changeSDValue()
    }

    socialDistanceMinus.onclick = () => {
      socialDistancingTotal.value = parseInt(socialDistancingTotal.value) - 1
      changeSDValue()
    }

    isolationPlus.onclick = () => {
      isolationTotal.value = parseInt(isolationTotal.value) + 1
      changeIsoValue()
    }

    isolationMinus.onclick = () => {
      isolationTotal.value = parseInt(isolationTotal.value) - 1
      changeIsoValue()
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

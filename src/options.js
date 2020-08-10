const DEFAULT_FILTERS = {
  death: true,
  stayHome: true
}

export const CANVAS_SIZE = {
  height: 880,
  width: 360
}

export const DESKTOP_CANVAS_SIZE = {
  height: 400,
  width: 800
}

export const BALL_RADIUS = 5
export const COLORS = {
  death: '#c50000',
  recovered: '#D88DBC',
  infected: '#5ABA4A',
  well: '#63C8F2',
  social_distancing: '#63C8F2',
  sd_infected: '#5ABA4A',
  sd_recovered: '#D88DBC',
  sd_stroke: '#000000'
}

export const STATES = {
  infected: 'infected',
  well: 'well',
  recovered: 'recovered',
  death: 'death',
  social_distancing: 'social_distancing',
  sd_infected: 'sd_infected',
  sd_recovered: 'sd_recovered'
}

export const COUNTERS = {
  ...STATES,
  'max-concurrent-infected': 'max-concurrent-infected'
}

export const TOTAL_PEOPLE = 100
export const TOTAL_INFECTED = 1
export const TOTAL_SOCIAL_DISTANCING = document.getElementById('socialDistancingTotal').value
export const TOTAL_ISOLATING = document.getElementById('isolatingTotal').value

export const STARTING_BALLS = {
  [STATES.infected]: TOTAL_INFECTED,
  [STATES.well]: TOTAL_PEOPLE - TOTAL_INFECTED - TOTAL_SOCIAL_DISTANCING,
  [STATES.recovered]: 0,
  [STATES.death]: 0,
  [STATES.social_distancing]: TOTAL_SOCIAL_DISTANCING,
  [STATES.sd_infected]: 0
}

export const RUN = {
  filters: { ...DEFAULT_FILTERS },
  results: { ...STARTING_BALLS },
  tick: 0
}

export const MORTALITY_PERCENTAGE = 5
export const SPEED = 1
export const TOTAL_TICKS = 1600
export const TICKS_TO_RECOVER = 500
export const STATIC_PEOPLE_PERCENTAGE = 25
export const SOCIAL_DISTANCING_INFECTION_RATE = 5

export const resetRun = () => {
  RUN.results = { ...STARTING_BALLS }
  RUN.results[STATES.well] += parseInt(RUN.results[STATES.social_distancing])
  RUN.tick = 0
}

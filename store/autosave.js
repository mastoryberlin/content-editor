const AUTOSAVE_INTERVAL = 1000

export const state = () => ({
  statusChecker: null,
  changes: [],
  autosaver: null,
  lastSuccessfulSave: null,
  secondsElapsed: null
})

export const getters = {
  statusText: (state) => {
    if (state.changes.length > 0) {
      const seconds = state.secondsElapsed
      if (seconds) {
        if (seconds > 3) {
          return `Saved changes ${seconds}s ago`
        } else {
          return 'All changes saved'
        }
      } else {
        return 'Unsaved changes'
      }
    } else {
      return 'All changes saved'
    }
  }
}

export const mutations = {
  startStatusChecker: (state, commit) => {
    state.statusChecker = setInterval(() => {
      commit('autosave/refreshSecondsElapsed', null, { root: true })
    }, 1000)
  },
  stopStatusChecker: (state) => {
    const checker = state.statusChecker
    if (checker) {
      clearInterval(checker)
      state.statusChecker = null
    }
  },
  refreshSecondsElapsed: (state) => {
    // Calculate the seconds elapsed since last successful autosave
    const last = state.lastSuccessfulSave
    if (last) {
      const ms = performance.now() - last
      state.secondsElapsed = Math.round(ms / 1000)
    }
  },
  pushChange: (state, { change, dispatch }) => {
    const changesCount = state.changes.length
    if (changesCount > 0) {
      const previous = state.changes[changesCount - 1]
      if (previous.action === change.action && previous.where === change.where) {
        previous.payload = change.payload
        return
      }
    }
    state.changes.push(change)

    if (!state.autosaver) {
      state.autosaver = setInterval(() => {
        dispatch('websocket/sendChanges', null, { root: true })
      }, AUTOSAVE_INTERVAL)
    }
  },
  shiftChanges: (state) => {
    const lastChange = state.changes.shift()
    if (!lastChange) {
      console.log('No changes left - stopping autosaver')
      if (state.autosaver) {
        clearInterval(state.autosaver)
        state.autosaver = null
      }
    }
    return lastChange
  },
  completedSendingChanges: (state) => {
    state.lastSuccessfulSave = performance.now()
  }
}

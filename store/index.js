export default {
  strict: false,
  state: () => ({
    phases: null,
    currentPhases: null,
    dragInfo: {
      dragSource: null,
      removedIndex: null,
      messageId: null,
      fromNumber: null,
      fromPhase: null,
      fromParentIsNull: false,
    },
    selected: [],
    // isCommittingChanges: false,
  }),
  mutations: {
    setDraggedMessageInfo: (state, { id, number, index }) => {
      console.log('setDraggedMessageInfo called with id: ' + id + ', index: ' + index)
      state.dragInfo.messageId = id
      state.dragInfo.fromNumber = number
      state.dragInfo.removedIndex = index
    },
    setDragSource: (state, { isSource, dragSource, fromPhase, fromParentIsNull }) => {
      if (isSource) {
        console.log('setDragSource called, this isSource - setting dragSource=' + dragSource.id)
        state.dragInfo.dragSource = dragSource
        state.dragInfo.fromPhase = fromPhase
        state.dragInfo.fromParentIsNull = fromParentIsNull
      }
    },
    updateCurrentPhases: (state, val) => {
      state.currentPhases = val
    },
    updatePhases: (state, val) => {
      state.phases = val
    },
    select: (state, id) => {
      const sel = state.selected
      if (!sel.includes(id)) {
        sel.push(id)
      }
    },
    unselect: (state, id) => {
      const sel = state.selected
      const index = sel.indexOf(id)
      if (index !== null) {
        sel.splice(index, 1)
      }
    },
    clearSelection: (state) => {
      state.selected = []
    },
    // setEditedBy: (state, { who, element }) => {
    //   const parts = element.split('/')
    //   const storiesRoot = state.stories
    //   const st = storiesRoot.find(s => s.id === parts[0])
    //   if (parts.length === 1) {
    //     // Story is being edited
    //     st.editedBy = who
    //     return
    //   }
    //   const ep = st.episodes.find(e => e.id === `${parts[0]}/${parts[1]}`)
    //   if (parts.length === 2) {
    //     // Episode is being edited
    //     ep.editedBy = who
    //     return
    //   }
    //   const ph = ep.phases.find(p => p.id === `${parts[0]}/${parts[1]}/${parts[2]}`)
    //   if (parts.length === 3) {
    //     // Phase is being edited
    //     ph.editedBy = who
    //     return
    //   }
    //   // parts.length >= 4 -> Message is being edited
    //   const msg = findMessage(element, state, ph)
    //   msg.editedBy = who
    // },
    // initializeStories: (state, retrievedStories) => {
    //   state.stories = retrievedStories
    // },
    // changeStory: (state, { id, element, to }) => {
    //   const st = state.stories.find(s => s.id === id)
    //   st[element] = to
    // },
    // moveEpisode: (state, { story, removedIndex, addedIndex }) => {
    //   if (removedIndex !== addedIndex) {
    //     const st = state.stories.find(s => s.id === story)
    //     const movedEpisode = JSON.stringify(st.episodes[removedIndex])
    //     const newItems = [...st.episodes]
    //     newItems.splice(removedIndex, 1)
    //     newItems.splice(addedIndex, 0, JSON.parse(movedEpisode))
    //     st.episodes = newItems
    //   }
    // },
    // changeEpisode: (state, { id, element, to }) => {
    //   const [story] = id.split('/')
    //   const st = state.stories.find(s => s.id === story)
    //   const ep = st.episodes.find(e => e.id === id)
    //   ep[element] = to
    // },
    // addEpisode: (state, { after, duplicate }) => {
    //   const [story] = after.id.split('/')
    //   const st = state.stories.find(s => s.id === story)
    //   const eps = st.episodes
    //   const i = eps.indexOf(after)
    //   let newIndex = eps.length + 1
    //   let newID = story + '/e' + newIndex
    //   while (eps.find(e => e.id === newID)) {
    //     newIndex += 1
    //     newID = story + '/e' + newIndex
    //   }
    //   const newEp = duplicate
    //     ? { ...after, id: newID }
    //     : {
    //         id: newID,
    //         title: '',
    //         specs: '',
    //         phases: [
    //           {
    //             id: newID + '/p1',
    //             title: '',
    //             specs: '',
    //             moods: { ...after.phases[after.phases.length - 1].moods },
    //             features: [...after.phases[after.phases.length - 1].features]
    //           }
    //         ]
    //       }
    //   st.episodes.splice(i + 1, 0, newEp)
    // },
    // deleteEpisode: (state, episode) => {
    //   const [story] = episode.id.split('/')
    //   const st = state.stories.find(s => s.id === story)
    //   const eps = st.episodes
    //   const i = eps.indexOf(episode)
    //   // if (confirm(`Are you sure you want to delete episode ${i + 1}, '${episode.title}'?`)) {
    //     st.episodes.splice(i, 1)
    //   // }
    // },
    // changeMood: (state, { phaseId, npc, to }) => {
    //   const [story, episode] = phaseId.split('/')
    //   const st = state.stories.find(s => s.id === story)
    //   const ep = st.episodes.find(e => e.id === story + '/' + episode)
    //   const ph = ep.phases.find(p => p.id === phaseId)
    //   if (undefined === ph.moods) {
    //     ph.moods = {
    //       Professor: 'happy',
    //       Alicia: 'happy',
    //       Nick: 'happy',
    //       VZ: 'happy'
    //     }
    //   }
    //   ph.moods[npc] = to
    // },
    // changeFeatures: (state, { phaseId, feature, to }) => {
    //   const [story, episode] = phaseId.split('/')
    //   const st = state.stories.find(s => s.id === story)
    //   const ep = st.episodes.find(e => e.id === story + '/' + episode)
    //   const ph = ep.phases.find(p => p.id === phaseId)
    //   if (undefined === ph.features) {
    //     ph.features = []
    //   } else {
    //     const newFeatures = [...ph.features]
    //     if (to) {
    //       newFeatures.push(feature)
    //     } else {
    //       const i = newFeatures.indexOf(feature)
    //       newFeatures.splice(i, 1)
    //     }
    //     ph.features = newFeatures
    //   }
    // },
    // movePhase: (state, { episode, removedIndex, addedIndex }) => {
    //   if (removedIndex !== addedIndex) {
    //     const [story] = episode.split('/')
    //     const st = state.stories.find(s => s.id === story)
    //     const ep = st.episodes.find(e => e.id === episode)
    //     const movedPhase = JSON.stringify(ep.phases[removedIndex])
    //     const newItems = [...ep.phases]
    //     newItems.splice(removedIndex, 1)
    //     newItems.splice(addedIndex, 0, JSON.parse(movedPhase))
    //     ep.phases = newItems
    //   }
    // },
    // changePhase: (state, { id, element, to }) => {
    //   const [story, episode] = id.split('/')
    //   const st = state.stories.find(s => s.id === story)
    //   const ep = st.episodes.find(e => e.id === story + '/' + episode)
    //   const ph = ep.phases.find(p => p.id === id)
    //   ph[element] = to
    // },
    // addPhase: (state, { after, duplicate }) => {
    //   const [story, episode] = after.id.split('/')
    //   const st = state.stories.find(s => s.id === story)
    //   const ep = st.episodes.find(e => e.id === story + '/' + episode)
    //   const phs = ep.phases
    //   const i = phs.indexOf(after)
    //   let newIndex = phs.length + 1
    //   let newID = `${story}/${episode}/p${newIndex}`
    //   while (phs.find(p => p.id === newID)) {
    //     newIndex += 1
    //     newID = `${story}/${episode}/p${newIndex}`
    //   }
    //   const newPh = duplicate
    //     ? { ...after, id: newID }
    //     : {
    //         id: newID,
    //         title: '',
    //         specs: '',
    //         moods: { ...after.moods },
    //         features: [...after.features],
    //         messages: [
    //           {
    //             id: newID + '/m1',
    //             logic: '',
    //             type: 'text',
    //             from: 'Professor',
    //             text: ''
    //           }
    //         ]
    //       }
    //   ep.phases.splice(i + 1, 0, newPh)
    // },
    // deletePhase: (state, phase) => {
    //   const [story, episode] = phase.id.split('/')
    //   const st = state.stories.find(s => s.id === story)
    //   const ep = st.episodes.find(e => e.id === story + '/' + episode)
    //   const phs = ep.phases
    //   const i = phs.indexOf(phase)
    //   if (confirm(`Are you sure you want to delete phase ${i + 1}, '${phase.title}'?`)) {
    //     ep.phases.splice(i, 1)
    //   }
    // },
    // changeMessage: (state, { id, element, to }) => {
    //   const { message } = findMessage(id, state)
    //   if (element === 'type' && undefined === message.messages) {
    //     message.messages = [
    //       {
    //         id: id + '/m1',
    //         logic: '',
    //         type: message.type,
    //         text: message.text,
    //         attachment: message.attachment
    //       }
    //     ]
    //   }
    //   message[element] = to
    // },
    // beginCommittingChanges: (state) => {
    //   state.isCommittingChanges = true
    // },
    // endCommittingChanges: (state) => {
    //   state.isCommittingChanges = false
    // },
  },
  actions: {
    // async nuxtServerInit ({ commit }) {
    //   const response = await this.app.apolloProvider.defaultClient.query({query: require("~/graphql/GetStories")})
    //   commit("apolloTest", response.data.story)
    // },
    moveMessage({ state, commit }, { dragTarget, addedIndex, toPhase, toParentIsNull }) {
      const phases = state.phases
      const { messageId, dragSource, removedIndex, fromNumber, fromPhase, fromParentIsNull } = state.dragInfo
      // console.log('moveMessage called with dragSource.id: ' + dragSource.id + ', dragTarget.id: ' + dragTarget.id + ', ri: ' + removedIndex + ', ai: ' + addedIndex)
      if (removedIndex !== undefined && addedIndex !== null &&
      (dragSource !== dragTarget || removedIndex !== addedIndex)) {
        const fromParent = fromParentIsNull ? null : dragSource.id
        const toParent = toParentIsNull ? null : dragTarget.id
        const toNumber = addedIndex + 1

        // Optimistic
        console.log(fromNumber, toNumber)
        let addedData = null
        let toParentIndex = null
        let toPhasesIndex = null
        let fromPhasesIndex = null
        const childs = []
        phases.forEach((phase, idx) => {
          let promptsIndex = null
          if (phase.id === toPhase) {
            toPhasesIndex = idx
          }
          if (phase.id === fromPhase) {
            fromPhasesIndex = idx
          }
          phases[idx].prompts.forEach((prompt, i) => {
            if (prompt.id === messageId) {
              promptsIndex = i
            }
            if (prompt.id === toParent) {
              toParentIndex = prompt.number - 1
            }
            if (prompt.parent === messageId) {
              childs.push(prompt)
            }
          })
          if (promptsIndex !== null) {
            addedData = {
              ...phases[idx].prompts[promptsIndex],
              parent: toParent,
              number: addedIndex + 1,
            }
            // remove
            phases[idx].prompts.splice(promptsIndex, 1)
          }
        })
        // sync numbers
        phases.forEach((phase, idx) => {
          if (idx === fromPhasesIndex) {
            phase.prompts.forEach((prompt) => {
              if (prompt.parent === fromParent) {
                if (prompt.number - 1 > removedIndex) {
                  prompt.number -= 1
                }
              }
            })
          }
          if (idx === toPhasesIndex) {
            phase.prompts.forEach((prompt) => {
              if (toParentIndex === null && prompt.parent === null) {
                // no parent
                if (prompt.number - 1 >= addedIndex) {
                  prompt.number += 1
                }
              } else if (prompt.parent === toParent) {
                // has parent
                if (prompt.number - 1 >= addedIndex) {
                  prompt.number += 1
                }
              }
            })
          }
        })
        // add
        phases[toPhasesIndex].prompts.splice(addedIndex, 0, addedData)
        if (childs.length > 0) {
          // remove previous childs
          childs.forEach((childs) => {
            phases[fromPhasesIndex].prompts = phases[fromPhasesIndex].prompts.filter((prompt) => {
              return prompt.id !== childs.id
            })
          })
          // add childs
          phases[toPhasesIndex].prompts = phases[toPhasesIndex].prompts.concat(childs)
        }
        // End Optimistic

        phases.forEach((_, idx) => {
          phases[idx].prompts.sort((a, b) => parseFloat(a.number) - parseFloat(b.number))
        })

        commit('updateCurrentPhases', phases)

        // console.log('MoveMessage: id: ' + messageId + ', fromNumber: ' + fromNumber + ', toNumber: ' + toNumber + ', fromPhase: ' + fromPhase + ', toPhase: ' + toPhase + ', fromParent: ' + fromParent + ', toParent: ' + toParent + ', fromParentIsNull: ' + fromParentIsNull + ', toParentIsNull: ' + toParentIsNull)
        this.app.apolloProvider.defaultClient.mutate({
          mutation: require('~/graphql/MoveMessage'),
          variables: {
            id: messageId,
            fromNumber,
            toNumber,
            fromParent,
            toParent,
            fromPhase,
            toPhase,
            fromParentIsNull,
            toParentIsNull,
          },
        })
      } else {
        console.log('Aborting')
      }
    },
    lock(ctx, element) {
      // const ws = state.websocket.ws
      // if (ws) {
      const id = element.id
      console.log('Locking ' + id)
      //   ws.send(JSON.stringify({
      //     action: 'lock',
      //     where: id,
      //     payload: state.auth.user.id,
      //     token: state.auth.token
      //   }))
      // }
    },
    unlock(ctx, element) {
      // const ws = state.websocket.ws
      // if (ws) {
      const id = element.id
      console.log('Unlocking ' + id)
      //   ws.send(JSON.stringify({
      //     action: 'unlock',
      //     where: id,
      //     payload: state.auth.user.id,
      //     token: state.auth.token
      //   }))
      // }
    },
    // edit ({ commit, dispatch }, [{ id }, element, to]) {
    //   console.log(`edit action: ${id}[${element}] := ${to}`)
    //   const parts = id.split('/')
    //   let changer
    //   switch (parts.length) {
    //     case 1:
    //       changer = 'changeStory'
    //       break
    //     case 2:
    //       changer = 'changeEpisode'
    //       break
    //     case 3:
    //       changer = 'changePhase'
    //       break
    //     default:
    //       changer = 'changeMessage'
    //       break
    //   }
    //   commit(changer, { id, element, to })
    //   commit('autosave/pushChange', {
    //     change: {
    //       action: changer,
    //       where: id + ':' + element,
    //       payload: to
    //     },
    //     dispatch
    //   })
    // },
    // add ({ commit, dispatch }, [what, after, duplicate]) {
    //   const afterId = after.id
    //   console.log(`add action: adding ${what} after ${afterId}`)
    //   const adder = `add${what.substr(0, 1).toUpperCase()}${what.substr(1)}`
    //   commit(adder, { after, duplicate })
    //   commit('autosave/pushChange', {
    //     change: {
    //       action: adder,
    //       where: afterId,
    //       payload: duplicate ? 'dup' : ''
    //     },
    //     dispatch
    //   })
    // },
    // commitChanges ({ commit, state }) {
    //   commit('beginCommittingChanges')
    //   // alert('Save the following JSON to a file:\n' + JSON.stringify(state.stories))
    //   sleep(500)
    //   commit('endCommittingChanges')
    // }
  },
}

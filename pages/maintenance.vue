<template>
  <div>
    <v-card>
      <v-card-title>
        Database stats
      </v-card-title>
      <v-card-text>
        <v-simple-table>
          <thead>
            <tr>
              <th>Element Type</th>
              <th>Total</th>
              <th>Empty</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Stories</td>
              <v-tooltip>
                <template #activator="{on, attrs}">
                  <td v-bind="attrs" v-on="on">
                    {{ stories.length }}
                  </td>
                </template>
                <span>{{ stories.map(s=>s.title).join(', ') }}</span>
              </v-tooltip>
              <v-tooltip>
                <template #activator="{on, attrs}">
                  <td v-bind="attrs" v-on="on">
                    {{ emptyStories.length }}
                  </td>
                </template>
                <span>{{ emptyStories.map(s=>s.title).join(', ') }}</span>
              </v-tooltip>
            </tr>

            <tr>
              <td>Episodes</td>
              <v-tooltip>
                <template #activator="{on, attrs}">
                  <td v-bind="attrs" v-on="on">
                    {{ episodes.length }}
                  </td>
                </template>
                <span>{{ episodes.map(e=>'E' + e.number + ' (' + e.title+ ')').join(', ') }}</span>
              </v-tooltip>
              <v-tooltip>
                <template #activator="{on, attrs}">
                  <td v-bind="attrs" v-on="on">
                    {{ emptyEpisodes.length }}
                  </td>
                </template>
                <span>{{ emptyEpisodes.map(e=>'E' + e.number + ' (' + e.title+ ')').join(', ') }}</span>
              </v-tooltip>
            </tr>

            <tr>
              <td>Phases</td>
              <v-tooltip>
                <template #activator="{on, attrs}">
                  <td v-bind="attrs" v-on="on">
                    {{ phases.length }}
                  </td>
                </template>
                <span>{{ phases.map(p=>'#' + p.number + ' (' + p.title+ ')').join(', ') }}</span>
              </v-tooltip>
              <v-tooltip>
                <template #activator="{on, attrs}">
                  <td v-bind="attrs" v-on="on">
                    {{ emptyPhases.length }}
                  </td>
                </template>
                <span>{{ emptyPhases.map(p=>'#' + p.number + ' (' + p.title+ ')').join(', ') }}</span>
              </v-tooltip>
            </tr>

            <tr>
              <td>Messages</td>
              <td v-bind="attrs" v-on="on">
                {{ messages.length }}
              </td>
              <td v-bind="attrs" v-on="on">
                {{ emptyMessages.length }}
              </td>
            </tr>

            <tr>
              <td>Nestable Logic Blocks</td>
              <td v-bind="attrs" v-on="on">
                {{ nestableMessages.length }}
              </td>
              <td v-bind="attrs" v-on="on">
                {{ emptyNestableMessages.length }}
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="cleanUpEmpty">
          Clean up empty elements
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  apollo: {
    stories: {
      query: require('~/graphql/GetStories'),
      update: data => data.story,
    },
    episodes: {
      query: require('~/graphql/GetEpisodes'),
      update: data => data.story_chapter,
    },
    phases: {
      query: require('~/graphql/GetPhases'),
      update: data => data.story_section,
    },
    messages: {
      query: require('~/graphql/GetMessages'),
      update: data => data.prompt,
    },
  },
  computed: {
    nestableMessages() {
      return this.messages.filter(m => m.type === 'nestable')
    },
    emptyStories() {
      return this.stories.filter(s => s.chapters.length === 0)
    },
    emptyEpisodes() {
      return this.episodes.filter(e => e.sections.length === 0)
    },
    emptyPhases() {
      return this.phases.filter(e => e.prompts.length === 0)
    },
    emptyMessages() {
      return this.messages.filter((e) => {
        switch (e.type) {
          case 'text':
            return e.text.trim() === ''
          case 'image':
          case 'audio':
          case 'video':
            return e.attachment === null
          case 'nestable':
            return this.messages.filter(m => m.parent === e.id).length === 0
          default:
            return false
        }
      })
    },
    emptyNestableMessages() {
      return this.nestableMessages.filter(e => this.messages.filter(m => m.parent === e.id).length === 0)
    },
  },
  methods: {
    cleanUpEmpty() {
      this.emptyNestableMessages.forEach((message) => {
        this.$apollo.mutate({
          mutation: require('~/graphql/DeleteMessage'),
          variables: {
            id: message.id,
            number: message.number,
            phaseId: message.section_id,
            parent: message.parent,
            parentIsNull: message.parent === null,
          },
        })
      })
      this.emptyPhases.forEach((phase) => {
        this.$apollo.mutate({
          mutation: require('~/graphql/DeletePhase'),
          variables: {
            id: phase.id,
            number: phase.number,
            episodeId: phase.chapter_id,
          },
        })
      })
      this.emptyEpisodes.forEach((episode) => {
        this.$apollo.mutate({
          mutation: require('~/graphql/DeleteEpisode'),
          variables: {
            id: episode.id,
            number: episode.number,
            storyId: episode.story_id,
          },
        })
      })
      this.emptyStories.forEach((story) => {
        this.$apollo.mutate({
          mutation: require('~/graphql/DeleteStory'),
          variables: { id: story.id },
        })
      })
    },
  },
}
</script>

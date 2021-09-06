<template lang="html">
  <div class="content-editor-episode-tab">
    <v-overlay
      absolute
      :value="story.edit.state === 'specs'"
    >
      <p>
        We are currently editing the <strong>story specs</strong> of "{{ story.title }}"
      </p>

      <p>
        You need to mark the work on the specs as finished on the <nuxt-link :to="'/element/' + story.id">
          story page
        </nuxt-link>
        before you can start editing individual episodes.
      </p>
    </v-overlay>

    <v-overlay
      v-if="detail && story.edit.state !== 'specs'"
      absolute
      :value="episode.edit.state !== 'details'"
    >
      <p>
        We are currently editing the <strong>specs</strong> of this episode.
      </p>

      <p>
        Work on the specs has to be marked as finished in the <a @click.stop.prevent="$emit('goto-episode-specs')">
          specs tab
        </a>
        before you can start editing the {{ detail }} details.
      </p>
    </v-overlay>

    <v-sheet elevation="5" color="amber lighten-4" class="my-7 pa-4 content-editor-specs-fixed">
      <h2>
        Episode {{ episode.number }}: {{ episode.title }}
        <v-tooltip bottom>
          <template #activator="{on, attrs}">
            <v-hover v-slot="{ hover }">
              <v-icon
                v-bind="attrs"
                :color="hover ? 'purple' : 'grey darken-2'"
                v-on="on"
                @click="$router.push(`/element/${story.id}#${episode.id}`)"
              >
                mdi-open-in-new
              </v-icon>
            </v-hover>
          </template>
          <span>
            Edit story specs for this episode
          </span>
        </v-tooltip>
      </h2>
      <p v-text="episode.specs" />
    </v-sheet>

    <slot />

    <specs-have-changed-warning
      v-if="episode.edit.state === 'detail'
        && episode.edit[detail + 'State'] !== null
        && episode.edit.warnEpisodeSpecsHaveChanged"
      title="The episode specs have changed!"
      btn-text="Yes, details match the updated specs"
      @confirm="closeEpisodeSpecsHaveChangedWarning"
    />
  </div>
</template>

<script>
export default {
  props: {
    episode: {
      type: Object,
      required: true
    },
    detail: {
      type: String,
      default: null
    }
  },
  emits: ['goto-episode-specs'],
  computed: {
    story () {
      return this.episode.story
    }
  }
}
</script>

<style lang="css" scoped>
</style>

<template>
  <v-card
    class="pa-3 mb-3 mx-1 mr-1"
    dark
    color="grey darken-3"
  >
    <v-row class="ma-0 mr-5">
      <v-card-subtitle
        class="text-caption pa-0 text-truncate"
        style="max-width: 240px"
      >
        &#x1f39e; {{ prefix }}{{ video.name }}
      </v-card-subtitle>
      <v-spacer></v-spacer>
      <v-chip
        x-small
        class="mx-1 px-2"
        v-for="speed of [1, 2, 4, 8, 16, 32]"
        :key="speed"
        :color="chipColor(speed)"
        @click="select(speed)"
        :disabled="isEncoding"
      >
        {{speed}}x
      </v-chip>
    </v-row>
    <v-row class="ma-0 mr-5 pt-2">
      <v-progress-linear
        :value="progress"
        :buffer-value="100"
        color="amber lighten-2"
      ></v-progress-linear>
    </v-row>
    <v-btn
      icon
      dark
      x-small
      absolute
      color="grey lighten-1"
      style="right: 7px; top: 18px;"
      @click="clear"
      :disabled="isEncoding"
    >
      <v-icon small>cancel</v-icon>
    </v-btn>
  </v-card>
</template>

<script>
export default {
  name: 'VideoCard',
  data: () => ({
    individualTargets: {
      x1: null,
      x2: null,
      x4: null,
      x8: null,
      x16: null,
      x32: null,
    },
    edited: false,
    progress: 0,
  }),
  props: {
    video: Object,
    allTargets: Object,
    isEncoding: Boolean,
  },
  methods: {
    select(speed) {
      const current = this.individualTargets[`x${speed}`];
      if (current !== null) {
        this.individualTargets[`x${speed}`] = !current;
      } else {
        this.individualTargets[`x${speed}`] = !this.allTargets[`x${speed}`];
      }
      this.edited = true;
    },
    clear() {
      this.$emit('clear-video', this.video);
    },
    chipColor(speed) {
      function getColor(selected) {
        if (selected) {
          return "blue";
        } else {
          return "grey darken-2";
        }
      }
      if (this.individualTargets[`x${speed}`] !== null) {
        return getColor(this.individualTargets[`x${speed}`]);
      } else {
        return getColor(this.allTargets[`x${speed}`]);
      }
    },
  },
  computed: {
    prefix() {
      if (this.edited) {
        return "*";
      } else {
        return "";
      }
    }
  }
}
</script>

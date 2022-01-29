<template>
  <v-card
    class="pa-3 mb-3 mx-1 mr-1"
    dark
    :color="bgColor"
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
        :disabled="isEncodingThisVideo"
      >
        {{speed}}x
      </v-chip>
    </v-row>
    <v-btn
      icon
      dark
      x-small
      absolute
      color="grey lighten-1"
      style="right: 9px; top: 10px;"
      @click="clear"
      :disabled="isEncodingThisVideo"
    >
      <v-icon small>cancel</v-icon>
    </v-btn>

    <div
      v-for="speed of [1, 2, 4, 8, 16, 32]"
      :key="speed"
    >
      <v-row
        class="ma-0 mr-5 pt-2"
        style="align-items: center;"
        v-if="encodeProgress[`x${speed}`] !== 0"
      >
        <v-chip
          x-small
          class="mr-3 px-2"
          color="blue"
        >
          {{speed}}x
        </v-chip>
        <v-spacer></v-spacer>
        <v-progress-linear
          :value="encodeProgress[`x${speed}`]"
          :buffer-value="100"
          color="amber lighten-2"
          style="width: 90%"
          rounded
        ></v-progress-linear>
      </v-row>
    </div>
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
    isEncodeFinished: {
      x1: false,
      x2: false,
      x4: false,
      x8: false,
      x16: false,
      x32: false,
    },
    encodeProgress: {
      x1: 0,
      x2: 0,
      x4: 0,
      x8: 0,
      x16: 0,
      x32: 0,
    },
    edited: false,
    duration: null,
    progress: 0,
    hoge: [1, 4, 32],
  }),
  props: {
    video: Object,
    allTargets: Object,
    isEncoding: Boolean,
    currentVideo: Object,
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
    async encode() {
      if (this.duration === null) {
        const result = await window.myAPI.getVideoInfo(this.video);
        if (result.status === 0) {
          this.duration = result.duration;
        }
      }

      let broken = false;
      for (const speed of [1, 2, 4, 8, 16, 32]) {
        if (this.haveToEncode(speed)) {
          await window.myAPI.encode(this.video, speed);
          await this.waitForEncode(speed);
          if (!this.isEncoding) {
            broken = true;
            break;
          }
        }
      }

      if (!broken) {
        this.$emit('finish-encode');
      }
    },
    async waitForEncode(speed) {
      const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
      const estimatedLength = this.duration / speed;
      for (;;) {
        const state = await window.myAPI.getEncodeState();
        if (state.status === 0) {
          this.encodeProgress[`x${speed}`] = 100;
          this.isEncodeFinished[`x${speed}`] = true;
          break;
        } else if (state.time !== null) {
          const progress = 100 * state.time / estimatedLength
          this.encodeProgress[`x${speed}`] = Math.min(100, progress);
        }
        if (!this.isEncoding) {
          this.encodeProgress[`x${speed}`] = 0;
          break;
        }
        await sleep(100);
      }
    },
    haveToEncode(speed) {
      return this.wantToEncode(speed) && !this.isEncodeFinished[`x${speed}`];
    },
    wantToEncode(speed) {
      if (this.individualTargets[`x${speed}`] !== null) {
        return this.individualTargets[`x${speed}`];
      } else {
        return this.allTargets[`x${speed}`];
      }
    }
  },
  computed: {
    prefix() {
      if (this.edited) {
        return "*";
      } else {
        return "";
      }
    },
    chipColor: function () {
      const self = this;
      return function (speed) {
        function getColor(selected) {
          if (selected) {
            return "blue";
          } else {
            return "grey darken-2";
          }
        }
        if (self.individualTargets[`x${speed}`] !== null) {
          return getColor(self.individualTargets[`x${speed}`]);
        } else {
          return getColor(self.allTargets[`x${speed}`]);
        }
      };
    },
    isEncodingThisVideo() {
      return this.isEncoding && this.video === this.currentVideo;
    },
    bgColor() {
      if (this.isEncodingThisVideo) {
        return "grey darken-2";
      } else {
        return "grey darken-3";
      }
    }
  }
}
</script>

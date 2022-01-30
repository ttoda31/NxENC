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
    </v-row>
    <v-row class="ma-0 mt-2 mr-5 pl-2">
      <vue-slider
        v-model="range"
        :min="min"
        :max="max"
        dotSize="12"
        width="100%"
        height="3px"
        @change="change"
      >
      </vue-slider>
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

    <v-row
      class="ma-0 mr-5 pt-2 pl-2"
      style="align-items: center;"
      v-if="encodeProgress !== 0"
    >
      <v-progress-linear
        :value="encodeProgress"
        :buffer-value="100"
        color="amber lighten-2"
        style="width: 100%"
        rounded
      ></v-progress-linear>
    </v-row>
  </v-card>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
export default {
  name: 'VideoClipCard',
  components: {
    VueSlider,
  },
  data: () => ({
    min: 0,
    max: 100,
    range: [0, 100],
    lastRange: [0, 100],
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
    encodeProgress: 0,
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
  mounted() {
    this.getDuration();
  },
  methods: {
    change(value) {
      console.log(value);
    },
    async getDuration() {
      const result = await window.myAPI.getVideoInfo(this.video);
      if (result.status === 0) {
        this.duration = result.duration;
        if (this.duration > this.max) {
          this.max = Math.floor(this.duration);
          this.$nextTick(() => {
            this.range = [0, Math.floor(this.duration)];
            this.lastRange = [0, Math.floor(this.duration)];
          });
        } else {
          this.range = [0, Math.floor(this.duration)];
          this.lastRange = [0, Math.floor(this.duration)];
          this.$nextTick(() => {
            this.max = Math.floor(this.duration);
          });
        }
      }
    },
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
        } else {
          this.$emit('finish-encode');
          return;
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

<style scoped>
.v-slider__thumb::after {
  width: 5px;
  height: 5px;
}
.v-slider__thumb-container--active {
  width: 5px;
  height: 5px;
}
.v-slider__thumb-container--focused {
  width: 5px;
  height: 5px;
}
</style>
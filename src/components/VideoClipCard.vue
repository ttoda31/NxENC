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
        &#x1f39e; {{ video.name }}
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
        @dragging="dragging"
        @drag-start="dragStart"
        @drag-end="dragEnd"
        :disabled="duration === null"
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
      v-if="processProgress !== 0"
    >
      <v-progress-linear
        :value="processProgress"
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
    isProcessFinished: false,
    processProgress: 0,
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
    dragStart(index) {
      console.log("drag-start");
      this.$emit('preview-thumbnail', this.video, this.range[index]);
    },
    dragging(value, index) {
      this.$emit('preview-thumbnail', this.video, value[index]);
    },
    dragEnd() {
      console.log("drag-end");
      this.$emit('preview-thumbnail', null, null);
    },
    async getDuration() {
      const result = await window.myAPI.getVideoInfo(this.video);
      if (result.status === 0) {
        this.duration = result.duration;
        if (this.duration > this.max) {
          this.max = Math.floor(this.duration);
          this.$nextTick(() => {
            this.range = [0, Math.floor(this.duration)];
          });
        } else {
          this.range = [0, Math.floor(this.duration)];
          this.$nextTick(() => {
            this.max = Math.floor(this.duration);
          });
        }
      }
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

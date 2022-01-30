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
    <v-row class="ma-0 mt-2 mr-5 pl-3">
      <vue-slider
        v-model="range"
        :min="min"
        :max="max"
        dotSize="12"
        width="100%"
        height="3px"
        @change="change"
        @dragging="dragging"
        @drag-start="dragStart"
        @drag-end="dragEnd"
        :disabled="duration === null || isClippingThisVideo"
        :tooltip="'active'"
        :tooltip-formatter="formatter"
        :clickable="false"
        :useKeyboard="false"
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
      :disabled="isClippingThisVideo"
    >
      <v-icon small>cancel</v-icon>
    </v-btn>

    <v-row
      class="ma-0 mr-5 pt-2 pl-3"
      style="align-items: center;"
      v-if="clipProgress !== 0"
    >
      <v-progress-linear
        :value="clipProgress"
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
    isClipFinished: false,
    clipProgress: 0,
    duration: null,
  }),
  props: {
    video: Object,
    isClipping: Boolean,
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
    change() {
      this.clipProgress = 0;
      this.isClipFinished = false;
    },
    formatter(value) {
      const hour = Math.floor(value / 3600).toString().padStart(2, '0');
      const minute = Math.floor((value % 3600) / 60).toString().padStart(2, '0');
      const second = (value % 60).toString().padStart(2, '0');
      return `${hour}:${minute}:${second}`
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
    async clip() {
      if (this.duration === null) {
        this.$emit('finish-clip');
        return;
      }

      if (this.haveToClip()) {
        await window.myAPI.clip(this.video, this.range[0], this.range[1]);
        await this.waitForClip();
        if (!this.isClipping) return;
      }
      this.$emit('finish-clip');
    },
    async waitForClip() {
      const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
      const estimatedLength = this.range[1] - this.range[0];
      for (;;) {
        const state = await window.myAPI.getClipState();
        if (state.status === 0) {
          this.clipProgress = 100;
          this.isClipFinished = true;
          break;
        } else if (state.time !== null) {
          const progress = 100 * state.time / estimatedLength
          this.clipProgress = Math.min(100, progress);
        }
        if (!this.isClipping) {
          this.clipProgress = 0;
          break;
        }
        await sleep(100);
      }
    },
    haveToClip() {
      return !this.isClipFinished;
    },
  },
  computed: {
    isClippingThisVideo() {
      return this.isClipping && this.video === this.currentVideo;
    },
    bgColor() {
      if (this.isClippingThisVideo) {
        return "grey darken-2";
      } else {
        return "grey darken-3";
      }
    }
  }
}
</script>

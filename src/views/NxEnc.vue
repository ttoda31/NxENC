<template>
  <v-container
    style="height: 100%; max-height: 600px"
    class="px-7 py-3 d-flex flex-column"
  >
    <drag-and-drop
      @video-found="videoFound"
      :isFullSize="!existVideo"
      :isEncoding="isEncoding"
      class="mx-1 mr-8 mt-1 mb-4 pr-2"
    >
    </drag-and-drop>

    <v-container
      v-if="existVideo"
      class="pa-0"
      style="height: 63%"
    >
      <perfect-scrollbar>
        <video-card
          v-for="video of videos"
          :key="video.path"
          @clear-video="clearVideo"
          @finish-encode="finishEncode"
          :video="video"
          :allTargets="allTargets"
          :isEncoding="isEncoding"
          :currentVideo="currentVideo"
          :ref="video.path"
        ></video-card>
        <v-spacer></v-spacer>
      </perfect-scrollbar>
    </v-container>

    <v-card
      v-if="existVideo"
      class="pa-3 mt-3 mx-1 mr-1"
      dark
    >
      <v-row class="ma-0 mr-5">
        <v-card-subtitle
          class="text-body-2 pa-0 text-truncate"
          style="max-width: 240px"
        >
          <div v-if="videos.length == 1">
            {{ videos.length }} video
          </div>
          <div v-else>
            {{ videos.length }} videos
          </div>
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
        <v-spacer></v-spacer>
        <v-btn
          small
          @click="clearAll"
          class="mr-2"
          color="grey darken-3"
          style="height: 24px;"
          :disabled="isEncoding"
        >
          Clear
        </v-btn>
        <v-btn
          small
          @click="encode"
          color="red lighten-1"
          style="height: 24px; width: 80px"
        >
          <div v-if="isEncoding">Stop</div>
          <div v-else>Encode</div>
        </v-btn>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import DragAndDrop from '../components/DragAndDrop.vue'
import VideoCard from '../components/VideoCard.vue'

export default {
  name: 'NxEnc',
  data: () => ({
    videos: [],
    allTargets: {
      x1: false,
      x2: false,
      x4: false,
      x8: false,
      x16: false,
      x32: false,
    },
    isEncoding: false,
    currentVideoIndex: null,
    currentVideo: null,
  }),
  components: {
    DragAndDrop,
    VideoCard,
  },
  beforeDestroy() {
    if (this.isEncoding) {
      this.isEncoding = false;
      window.myAPI.cancel();
    }
  },
  methods: {
    videoFound(videos) {
      for (const video of videos) {
        if (this.videos.filter((v) => v.path === video.path).length === 0) {
          this.videos.push(video);
        }
      }
    },
    select(speed) {
      this.allTargets[`x${speed}`] = !this.allTargets[`x${speed}`];
    },
    clearAll() {
      this.videos = [];
      for (const speed of [1, 2, 4, 8, 16 ,32]) {
        this.allTargets[`x${speed}`] = false;
      }
    },
    clearVideo(deleted) {
      this.videos = this.videos.filter(video => video !== deleted);
    },
    encode() {
      if (this.isEncoding) {
        window.myAPI.cancel();
        this.currentVideoIndex = null;
        this.currentVideo = null;
        this.isEncoding = false;
      } else {
        this.currentVideoIndex = 0;
        this.currentVideo = this.videos[this.currentVideoIndex];
        this.isEncoding = true;
        this.$refs[this.currentVideo.path][0].encode();
      }
    },
    finishEncode() {
      this.currentVideoIndex += 1;
      if (this.videos.length === this.currentVideoIndex) {
        console.log("Finish!");
        this.isEncoding = false;
        return;
      }

      this.currentVideo = this.videos[this.currentVideoIndex];
      this.$refs[this.currentVideo.path][0].encode();
    },
  },
  computed: {
    existVideo() {
      return this.videos.length !== 0;
    },
    chipColor: function () {
      const self = this;
      return function (speed) {
        if (self.allTargets[`x${speed}`]) {
          return "blue";
        } else {
          return "grey darken-2";
        }
      }
    }
  }
}
</script>

<style scoped>
.ps {
  height: 100%;
}
</style>

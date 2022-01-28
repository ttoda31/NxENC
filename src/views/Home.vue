<template>
  <v-container
    style="height: 100%; max-height: 450px"
    class="px-7 py-3 d-flex flex-column"
  >
    <drag-and-drop
      @video-found="videoFound"
      :isFullSize="!existVideo"
      :isEncoding="isEncoding"
      class="mx-1 mr-8 mb-2 pr-2"
    >
    </drag-and-drop>

    <v-card
      v-if="existVideo"
      class="pa-3 mb-3 mx-1 mr-1"
      dark
    >
      <v-row class="ma-0 mr-5">
        <v-card-subtitle
          class="text-body-2 pa-0 text-truncate"
          style="max-width: 240px"
        >
          Settings ( {{ videos.length }} videos )
        </v-card-subtitle>
        <v-spacer></v-spacer>
        <v-chip
          x-small
          class="mx-1 px-2 mt-1"
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

    <v-container
      v-if="existVideo"
      class="pa-0"
      style="height: 68%"
    >
      <perfect-scrollbar>
        <video-card
          v-for="video of videos"
          :key="video.path"
          @clear-video="clearVideo"
          :video="video"
          :allTargets="allTargets"
          :isEncoding="isEncoding"
        ></video-card>
        <v-spacer></v-spacer>
      </perfect-scrollbar>
    </v-container>
  </v-container>
</template>

<script>
import DragAndDrop from '../components/DragAndDrop.vue'
import VideoCard from '../components/VideoCard.vue'

export default {
  name: 'Home',
  data: () => ({
    videos: [],
    ddareaHeight: "100%",
    allTargets: {
      x1: false,
      x2: false,
      x4: false,
      x8: false,
      x16: false,
      x32: false,
    },
    isEncoding: false,
  }),
  components: {
    DragAndDrop,
    VideoCard,
  },
  methods: {
    videoFound(videos) {
      for (const video of videos) {
        if (this.videos.filter((v) => v.path === video.path).length === 0) {
          this.videos.push(video);
        }
      }
      this.ddareaHeight = "25%";
    },
    chipColor(speed) {
      if (this.allTargets[`x${speed}`]) {
        return "blue";
      } else {
        return "grey darken-2";
      }
    },
    select(speed) {
      this.allTargets[`x${speed}`] = !this.allTargets[`x${speed}`];
    },
    clearAll() {
      this.videos = [];
    },
    clearVideo(deleted) {
      this.videos = this.videos.filter(video => video !== deleted);
    },
    encode() {
      if (this.isEncoding) {
        this.isEncoding = false;
      } else {
        this.isEncoding = true;
      }
    },
  },
  computed: {
    existVideo() {
      return this.videos.length !== 0;
    }
  }
}
</script>

<style scoped>
.ps {
  height: 100%;
}
</style>

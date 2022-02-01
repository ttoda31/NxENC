<template>
  <v-container
    style="height: 100%; max-height: 600px"
    class="px-7 py-3 d-flex flex-column"
  >
    <drag-and-drop
      @video-found="videoFound"
      :isFullSize="!existVideo"
      :isClipping="isClipping"
      :disabled="thumbnailImage !== null"
      class="mx-1 mr-8 mt-1 mb-4 pr-2"
    >
    </drag-and-drop>

    <v-card
      v-if="thumbnailImage !== null"
      class="pa-2 thumbnail-card"
      dark
      elevation="2"
    >
      <v-img
        contain
        :src="thumbnailImage"
        height="100px"
      >
      </v-img>
    </v-card>

    <v-container
      v-if="existVideo"
      class="pa-0"
      style="height: 68%"
    >
      <perfect-scrollbar>
        <video-clip-card
          v-for="video of videos"
          :key="video.path"
          @clear-video="clearVideo"
          @finish-clip="finishClip"
          :video="video"
          :isClipping="isClipping"
          :currentVideo="currentVideo"
          :ref="video.path"
          @preview-thumbnail="previewThumbnail"
        ></video-clip-card>
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
        <v-btn
          small
          @click="clearAll"
          class="mr-2"
          color="grey darken-3"
          style="height: 24px;"
          :disabled="isClipping"
        >
          Clear
        </v-btn>
        <v-btn
          small
          @click="clip"
          color="red lighten-1"
          style="height: 24px; width: 80px"
        >
          <div v-if="isClipping">Stop</div>
          <div v-else>Clip</div>
        </v-btn>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import DragAndDrop from '../components/DragAndDrop.vue'
import VideoClipCard from '../components/VideoClipCard.vue'

export default {
  name: 'NoEnc',
  data: () => ({
    videos: [],
    isClipping: false,
    currentVideoIndex: null,
    currentVideo: null,
    thumbnailImage: null,
    thumbnailVideo: null,
    thumbnailPosition: null,
    lastThumbnailVideo: null,
    lastThumbnailPosition: null,
    isGettingThumbnail: false,
  }),
  components: {
    DragAndDrop,
    VideoClipCard,
  },
  mounted() {
    window.myAPI.on("renderThumbnail", (event, thumbnail)=>{
      if (thumbnail.status === 0 && this.thumbnailPosition !== null) {
        this.thumbnailImage = "data:image/jpeg;base64," + thumbnail.jpg;
      } else {
        this.thumbnailImage = null;
      }
      this.isGettingThumbnail = false;
    });
  },
  beforeDestroy() {
    if (this.isClipping) {
      this.isClipping = false;
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
    async previewThumbnail(video, position) {
      if (position === null) {
        this.thumbnailVideo = null;
        this.thumbnailPosition = null;
        this.thumbnailImage = null;
      } else {
        this.thumbnailVideo = video;
        this.thumbnailPosition = position;
        if (!this.isGettingThumbnail) {
          this.isGettingThumbnail = true;
          window.myAPI.getThumbnail(this.thumbnailVideo, this.thumbnailPosition);
        }
      }
    },
    clearAll() {
      this.videos = [];
    },
    clearVideo(deleted) {
      this.videos = this.videos.filter(video => video !== deleted);
    },
    clip() {
      if (this.isClipping) {
        window.myAPI.cancel();
        this.currentVideoIndex = null;
        this.currentVideo = null;
        this.isClipping = false;
      } else {
        this.currentVideoIndex = 0;
        this.currentVideo = this.videos[this.currentVideoIndex];
        this.isClipping = true;
        this.$refs[this.currentVideo.path][0].clip();
      }
    },
    finishClip() {
      this.currentVideoIndex += 1;
      if (this.videos.length === this.currentVideoIndex) {
        console.log("Finish!");
        this.isClipping = false;
        return;
      }
      this.currentVideo = this.videos[this.currentVideoIndex];
      this.$refs[this.currentVideo.path][0].clip();
    },
  },
  computed: {
    existVideo() {
      return this.videos.length !== 0;
    },
  }
}
</script>

<style scoped>
.ps {
  height: 100%;
}
.thumbnail-card {
  width: min-content;
  position: absolute;
  margin: auto;
  top: 8px;
  right: 0;
  left: 0;
}
</style>

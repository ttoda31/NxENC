<template>
  <div :class="wrapClass">
    <div id="ddarea" style=""
      @dragover.prevent="drag = true"
      @dragleave.prevent="drag = false"
      @drop.prevent="onDrop"
      :class="ddareaClass"
      :style="ddareaBgColor"
    >
      <div>
        <h3>
          Drag & Drop Your Video Files or Folders Here!&#x2728;
        </h3>
        <span class="text-body-2" v-if="isFullSize">
          Only ".mp4" and ".mov" files are currently supported.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DragAndDrop',
  data: () => ({
    drag: false,
  }),
  props: {
    isFullSize: Boolean,
    isEncoding: Boolean,
  },
  methods: {
    onDrop(event) {
      this.drag = false;
      if (this.isEncoding) return;
      if (!event) return;
      if (!event.dataTransfer) return;
      if (event.dataTransfer.files.length === 0) return;
      const files = [];
      for (const file of event.dataTransfer.files) {
        files.push(file.path);
      }
      this.findVideos(files);
    },
    async findVideos(files) {
      const videos = await window.myAPI.findVideos(files);
      this.$emit('video-found', videos);
    }
  },
  computed: {
    wrapClass() {
      if (this.isFullSize) {
        return "wrapFullSize"
      } else {
        return "wrap"
      }
    },
    ddareaClass() {
      if (this.isFullSize) {
        return "ddareaFullSize"
      } else if (!this.isEncoding) {
        return "ddarea text-body-2"
      } else {
        return "ddareaEncoding text-body-2"
      }
    },
    ddareaBgColor() {
      let background;
      if (this.drag && !this.isEncoding) {
        background = "#666666";
      } else {
        background = "none";
      }
      return `background: ${background};`;
    },
  }
}
</script>

<style scoped>
.wrapFullSize {
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}
.wrap {
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}
.ddareaFullSize {
  justify-content: center;
  align-items: center;
  border: 5px dashed #aaaaaa;
  border-radius: 30px;
  display: flex;
  width: 100%;
  height: 80%;
  text-align: center;
  color: #aaaaaa
}
.ddarea {
  justify-content: center;
  align-items: center;
  border: 3px dashed #aaaaaa;
  border-radius: 15px;
  display: flex;
  width: 100%;
  height: 40px;
  text-align: center;
  color: #aaaaaa
}
.ddareaEncoding {
  justify-content: center;
  align-items: center;
  border: 3px dashed #777777;
  border-radius: 15px;
  display: flex;
  width: 100%;
  height: 40px;
  text-align: center;
  color: #777777
}
</style>

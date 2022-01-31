<template>
  <v-app
    :style="{ background: $vuetify.theme.themes.dark.background }"
  >
    <v-app-bar
      app
      dark
      color="grey darken-4"
      dense
      :height="titlebarHeight"
      class="draggable"
    >
      <div class="titlebar-home">
        <v-btn
          tile
          text
          x-small
          class="no-draggable"
          :height="titlebarHeight"
          @click="toHome"
        >
          <v-icon small>home</v-icon>
        </v-btn>
      </div>

      <v-spacer></v-spacer>
      <v-toolbar-title
        class="font-weight-thin text-subtitle-2 pt-1"
      >
        NxENC - {{ version }}
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <div class="titlebar-btn">
        <v-btn
          tile
          text
          x-small
          class="no-draggable"
          :height="titlebarHeight"
          @click="windowMinimize"
        >
          <v-icon small>minimize</v-icon>
        </v-btn>

        <v-btn
          tile
          text
          x-small
          class="no-draggable"
          :height="titlebarHeight"
          @click="windowClose"
        >
          <v-icon small>close</v-icon>
        </v-btn>
      </div>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    version: require('../package.json').version,
    titlebarHeight: "30px",
  }),
  mounted() {
    window.addEventListener('keyup', this.keyup, true);
    
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.keyup, true);
  },
  methods: {
    windowMinimize() {
      window.myAPI.windowMinimize();
    },
    windowClose() {
      window.myAPI.windowClose();
    },
    toHome() {
      this.$router.push('/', () => {});
    },
    keyup(event) {
      if (event.key === "Escape") {
        window.myAPI.openDevTools();
      }
    },
  },
};
</script>

<style>
html { overflow-y: auto }
.draggable {
  -webkit-app-region: drag;
}
.no-draggable {
  -webkit-app-region: no-drag;
}
.titlebar-home {
  position: fixed;
  left: 0;
  top: 0;
}
.titlebar-btn {
  position: fixed;
  right: 0;
  top: 0;
}
</style>

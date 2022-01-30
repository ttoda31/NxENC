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
      <v-spacer></v-spacer>
      <v-toolbar-title
        class="font-weight-thin text-subtitle-2 pt-1"
      >
        NxENC
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <div class="titlebar-btn">
        <v-btn
          tile
          text
          x-small
          class="no-draggable"
          :height="titlebarHeight"
          to="/"
        >
          <v-icon small>home</v-icon>
        </v-btn>

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
    //
  }),
  mounted() {
  },
  methods: {
    windowMinimize() {
      window.myAPI.windowMinimize();
    },
    windowClose() {
      window.myAPI.windowClose();
    },
  },
  computed: {
    titlebarHeight() {
      return "30px";
    }
  }
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
.titlebar-btn {
  position: fixed;
  right: 0;
  top: 0;
}
</style>

<template>
  <v-container
    style="height: 100%; max-height: 600px"
    class="pa-12 d-flex flex-column justify-center"
  >
    <v-hover v-slot:default="{ hover }">
      <v-card
        class="pa-6 ma-3 grey darken-2"
        height="40%"
        to="/noenc"
        dark
        outlined
        :elevation="hover ? 16 : 2"
      >
        <div class="text-h6">
          &#x2728; NoENC &#x2728;
        </div>
        <div class="text-body-2 pt-2 pl-3">
          A tool to clip videos fast without encoding. &#x2702;&#x2702;&#x2702;
        </div>
        <v-alert
          border="top"
          colored-border
          class="text-caption ma-4 mb-0 pa-3 pt-5 pr-4"
          color="amber lighten-2"
          icon="mdi-alert"
          :style="{ background: $vuetify.theme.themes.dark.background }"
        >
          Because this tool prioritizes speed,<br>
          the edges of the clipped video may be distorted.
        </v-alert>
      </v-card>
    </v-hover>

    <v-hover v-slot:default="{ hover }">
      <v-card
        class="pa-6 ma-3 grey darken-2"
        height="40%"
        to="/nxenc"
        dark
        outlined
        :elevation="hover ? 16 : 2"
      >
        <div class="text-h6">
          &#x2728; NxENC &#x2728;
        </div>
        <div class="text-body-2 pt-2 pl-3">
          A tool to encode videos to Nx speed. &#x23e9;&#x23e9;&#x23e9;
        </div>
        <v-alert
          border="top"
          colored-border
          class="text-caption ma-4 mb-0 pa-3 pt-5 pr-4"
          color="green lighten-2"
          icon="mdi-information"
          :style="{ background: $vuetify.theme.themes.dark.background }"
        >
          Because this tool involves encoding process,<br>
          it will take a long time to process long videos.
        </v-alert>
      </v-card>
    </v-hover>
  </v-container>
</template>

<script>
export default {
  name: 'Home',
}
</script>

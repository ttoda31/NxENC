<template>
  <v-container
    style="height: 100%; max-height: 600px"
    class="pa-12 d-flex flex-column justify-center"
  >
    <v-card
      class="pa-4 ma-3 grey darken-2"
      to="/noenc"
      dark
    >
      <div class="text-h6">
        &#x2728; NoENC &#x2728;
      </div>
      <div class="text-body-2 pt-2 pl-3">
        Clipping tool without encoding. &#x2702;&#x2702;&#x2702;
      </div>
    </v-card>
    <v-card
      class="pa-4 ma-3 grey darken-2"
      to="/nxenc"
      dark
    >
      <div class="text-h6">
        &#x2728; NxENC &#x2728;
      </div>
      <div class="text-body-2 pt-2 pl-3">
        Encoding tool to make Nx speed videos. &#x23e9;&#x23e9;&#x23e9;
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Home',
}
</script>

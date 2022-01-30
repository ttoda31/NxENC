<template>
  <v-container
    style="height: 100%; max-height: 600px"
    class="pa-12 d-flex flex-column"
  >
    <v-card
      class="pa-3 ma-3 grey lighten-1"
      to="/noenc"
    >
      NoENC
    </v-card>
    <v-card
      class="pa-3 ma-3 grey lighten-1"
      to="/nxenc"
    >
      NxENC
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Home',
}
</script>

import 'material-design-icons-iconfont/dist/material-design-icons.css'
import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import { colors } from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        background: "#ffffff",
        primary: "#ff0000",
        secondary: colors.green,
        accent: colors.red.darken3,
        error: colors.red,
        warning: colors.yellow,
        info: colors.grey,
        success: "#795548",
        mycolor: "#e0e0e0",
      },
      dark: {
        background: "#333333",
        primary: "#ff0000",
        secondary: colors.green,
      },
    },
    icons: {
      iconfont: 'md',
    },
  },
});

import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import fr from 'vuetify/src/locale/fr'

Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        iconfont: 'fa',
    },
    lang: {
        locales: { fr },
        current: 'fr'
    },
    theme: {
        themes: {
            light: {
                primary: '#1f2353',
                secondary: '#ffffff',
                red: '#ed1459',
                orange: '#f4a33a',
                yellow: '#ffdd00'
            }
        }
    }
});

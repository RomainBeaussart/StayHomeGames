import Vue from 'vue';
import VueApollo from 'vue-apollo'
import VueClipboard from 'vue-clipboard2'
import Vuesax from 'vuesax'
import 'vuesax/dist/vuesax.css'
import Bars from 'vuebars'

import vuetify from './plugins/vuetify'
import App from './App.vue';
import router from './router';
import store from './store/store';

import { createProvider } from './vue-apollo'

Vue.config.productionTip = false;

Vue.use(VueApollo)
Vue.use(VueClipboard);
Vue.use(Bars)
Vue.use(Vuesax, {
    colors: {
        primary: '#4F5D75',
        secondary: '#EF8354',
        warn: '#EF8354',
        background: '#FFFFFF',
        subtitle: '#BFC0C0',
        border: '#2D3142'
    }
})

new Vue({
    router,
    store,
    vuetify,
    apolloProvider: createProvider(),
    render: h => h(App)
} as any).$mount('#app');

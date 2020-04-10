import Vue from 'vue';
import VueApollo from 'vue-apollo'

import vuetify from './plugins/vuetify'
import vuesax from './plugins/vuesax'
import App from './App.vue';
import router from './router';
import store from './store/store';

import { createProvider } from './vue-apollo'

Vue.config.productionTip = false;

Vue.use(VueApollo)

new Vue({
    router,
    store,
    vuetify,
    vuesax,
    apolloProvider: createProvider(),
    render: h => h(App)
} as any).$mount('#app');

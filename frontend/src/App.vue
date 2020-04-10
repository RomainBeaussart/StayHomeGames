<template>
    <v-app fluid style="background-color: #FFF">
        <router-view></router-view>
    </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class App extends Vue {
    get page() {
        return this.$router.currentRoute.name
    }
}
</script>

<style lang="scss">
.sg-card {
    border-radius: 20px !important;
    .headline {
        font-weight: bold !important;
        font-size: xx-large !important;
    }
}

.sg-card-question {
    @extend .sg-card;
    background-color: #e3e4ed !important;
    border: solid #1f2353 1px !important;

}
</style>

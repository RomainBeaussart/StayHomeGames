<template>
    <v-container fluid class="fill-height">
        HOME
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Apollo } from '../decorators'

@Component
export default class Home extends Vue {

    get background() {
        return carouselHome
    }

}
</script>


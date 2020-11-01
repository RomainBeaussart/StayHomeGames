<template>
    <v-container fluid class="fill-height">
        <v-row no-gutters>
            <v-col cols="12" class='d-flex justify-center'>
                UnderCover
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Apollo } from "../../decorators";
import { maskFace } from '../../assets/exports'

@Component
export default class UnderCoverCreateRoom extends Vue {

}
</script>


<template>
    <v-container fluid class="fill-height">
        <v-row no-gutters class="align-center justify-center">
            <v-col cols="2" class="d-flex justify-center">
                <h1>Undercover</h1>
            </v-col>
        </v-row>
        <v-row class="d-flex pt-12 pb-2 align-center justify-center">
            <v-col cols="5">
                <vs-input
                    type="text"
                    :value="link"
                    block
                    readonly
                    label-placeholder="Lien"
                    icon-after
                    v-clipboard:copy="link"
                    v-clipboard:success="onCopySuccess"
                    v-clipboard:error="onCopyError"
                >
                    <template #icon>
                        <i class='bx bx-copy'></i>
                    </template>
                </vs-input>
            </v-col>
            <v-col ref="url" v-show="false">
                {{ link }}
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Apollo } from "../../decorators";

@Component
export default class UnderCoverLobby extends Vue {
    get roomId() {
        return this.$route.params.roomId
    }

    get link() {
        debugger
        return `https://stayhome.softcode.fr/undercover/${this.roomId}`
    }

    onCopySuccess() {
        this.$vs.notification({
                color: 'success',
                icon: "<i class='bx bx-message-square-check'></i>",
                title: 'Copié !',
                position: "top-center"
            })
    }
}
</script>


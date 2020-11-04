<template>
    <v-container fluid class="fill-height">
        <v-row no-gutters class="align-center justify-center">
            <v-col cols="12" class="d-flex justify-center">
                <h1>{{ room.name }}</h1>
            </v-col>
            <v-col cols="12" class="d-flex justify-center">
                <h5>StayHome! Quizz</h5>
            </v-col>
            <v-col cols="1" class="d-flex justify-center">
                <vs-button
                    size="large"
                    warn
                    gradient
                    block
                    :active="active == 0"
                    @click="active = 0"
                >
                    Play
                </vs-button>
            </v-col>
        </v-row>
        <v-row class="d-flex pt-12 pb-2 align-center justify-center">
            <v-col cols="2"></v-col>
            <v-col cols="4" class="py-5">
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
            <v-col cols="2">
                <vs-alert success :progress="progress" v-model="copyActive" :hidden-content="true">
                    <template #icon>
                        <i class='bx bx-copy'></i>
                    </template>
                    <template #title>
                        Copié
                    </template>
                </vs-alert>
            </v-col>
        </v-row>
        <v-row class="align-center justify-center" v-if="isHost">
            <v-col cols="4">
                <vs-input
                    type="text"
                    v-model="room.name"
                    block
                    label-placeholder="Nom de la room"
                    icon-after
                >
                    <template #icon>
                        <i class='bx bx-message-square-edit' ></i>
                    </template>
                </vs-input>
            </v-col>
            <v-col cols="1">
                <vs-switch v-model="room.public">
                    <template #on>
                        Public
                    </template>
                    <template #off>
                        Private
                    </template>
                </vs-switch>
            </v-col>
        </v-row>
        <v-row class="align-center justify-center" v-if="isHost">
            <v-col cols="3" class="d-flex justify-center" v-for="player of room.players" :key="player.id">
                <vs-card>
                    <template #title>
                        <h3>{{ player.user.nickname }}</h3>
                    </template>
                    <template #img>
                        <img :src="maskFace" alt="">
                    </template>
                    <template #text>
                        <p>
                            {{ player.description }}
                        </p>
                    </template>
                    <!-- <template #interactions>
                        <vs-button danger icon>
                            <i class='bx bx-heart'></i>
                        </vs-button>
                        <vs-button class="btn-chat" shadow primary>
                          <i class='bx bx-chat' ></i>
                            <span class="span">
                                54
                            </span>
                        </vs-button>
                    </template> -->
                </vs-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Apollo } from "../../decorators";
import { quizzPicture } from "../../assets/exports"

import ROOM_SUBSCRIBTION from "../../graphql/quizz/RoomSubscribtion.gql"
import ROOM from "../../graphql/quizz/Room.gql"
import UPDATE_ROOM from "../../graphql/quizz/UpdateRoom.gql"

@Component
export default class quizzLobby extends Vue {

    time = 1500
    copyActive = false
    progress = 0

    get maskFace() {
        return quizzPicture
    }

    get user() {
        return this.$store.state.user
    }

    get roomId() {
        return this.$route.params.roomId
    }

    get link() {
        return `https://stayhome.softcode.fr/quizz/${this.roomId}`
    }

    get isHost() {debugger
        if(!(this.room && this.room.host && this.room.host.id && this.room.host.id.length === 25)) {
            return false
        }
        return this.user.id === this.room.host.id
    }

    room: any = {
        id: '',
        name: ''
    }

    mounted() {
        this.$apollo.addSmartQuery('room', {
            query: ROOM,
            variables() {
                return {
                    id: this.roomId
                }
            },
            skip() {
                return this.isHost
            },
            result: ({ data, loading, networkStatus }: any) => {
                if (!loading) {
                    if (data && data.quizzRoom) {
                        debugger
                        this.room = data.quizzRoom
                    }
                }
            },
            subscribeToMore: {
                document: ROOM_SUBSCRIBTION,
                variables() {
                    return {
                        id: this.roomId
                    }
                },
                updateQuery(previousResult, { subscriptionData }) {
                    return previousResult;
                }
            }
        })
    }

    onCopySuccess() {
        this.copyActive = true
    }

    onCopyError() {
        console.log("error copy")
    }

    @Watch('copyActive')
    active() {
        if(this.copyActive) {
            let interval = setInterval(() => {
                this.progress++
            }, this.time / 100);

            setTimeout(() => {
                this.copyActive = false
                clearInterval(interval)
                this.progress = 0
            }, this.time);
        }
    }

    async join() {

    }

    @Watch('room', { deep: true })
    update(){
        debugger
        this.$apollo.mutate({
            mutation: UPDATE_ROOM,
            variables: {
                id: this.room.id,
                name: this.room.name
            }
        })
    }
}
</script>


<template>
    <v-container fluid class="fill-height">
        <v-row no-gutters class="align-center justify-center">
            <v-col cols="12" class="d-flex justify-center">
                <h1>{{ room.name }} <i v-if="!room.public" class='bx bx-lock-alt'></i></h1>
            </v-col>
            <v-col cols="12" class="d-flex justify-center">
                <h5>Undercover</h5>
            </v-col>
            <v-col cols="1" class="d-flex justify-center" v-if="isHost">
                <vs-button
                    size="large"
                    warn
                    gradient
                    block
                    :active="active == 0"
                    @click="play()"
                >
                    Play
                </vs-button>
            </v-col>
        </v-row>
        <v-row class="d-flex pt-12 pb-2 align-center justify-center">
            <v-col cols="2"></v-col>
            <v-col cols="5" class="py-5">
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
                <vs-switch warn v-model="room.public">
                    <template #on>
                        Public
                    </template>
                    <template #off>
                        Private
                    </template>
                </vs-switch>
            </v-col>
        </v-row>
        <v-row class="align-center justify-center">
            <v-col cols="2" class="d-flex justify-center" v-for="player of room.players" :key="player.id">
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
                    <template #interactions v-if="isHost">
                        <vs-button @click="kick(player.id)" warn icon v-if="player.user.id !== user.id">
                            <i class='bx bx-message-square-x'></i>
                        </vs-button>
                    </template>
                </vs-card>
            </v-col>
        </v-row>
        <vs-dialog blur not-close prevent-close v-model="dialogJoin" width="10%">
            <template #header>
                <h4 class="not-margin">Rejoindre <b>{{ room.name }}</b></h4>
            </template>
            <div class="con-form pt-3">
                Voulez-vous rejoindre la partie d'Undercover ?
            </div>

            <template #footer>
                <div class="footer-dialog">
                    <v-row>
                        <v-col cols="6">
                            <vs-button block warn @click="join()">
                                Rejoindre
                            </vs-button>
                        </v-col>
                        <v-col cols="6">
                            <vs-button block border @click="backToHome()">
                                Retour a l'accueil
                            </vs-button>
                        </v-col>
                    </v-row>
                </div>
            </template>
        </vs-dialog>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Apollo } from "../../decorators";
import { undercoverPicture } from "../../assets/exports"

import ROOM_SUBSCRIBTION from "../../graphql/undercover/RoomSubscribtion.gql"
import ROOM from "../../graphql/undercover/Room.gql"
import UPDATE_ROOM from "../../graphql/undercover/UpdateRoom.gql"
import JOIN_ROOM from "../../graphql/undercover/JoinRoom.gql"
import KICK_PLAYER from "../../graphql/undercover/KickPlayer.gql"
import PLAY from "../../graphql/undercover/Play.gql"

@Component
export default class UnderCoverLobby extends Vue {

    time = 1500
    copyActive = false
    progress = 0

    dialogJoin = false

    get maskFace() {
        return undercoverPicture
    }

    get user() {
        return this.$store.state.user
    }

    get roomId() {
        return this.$route.params.roomId
    }

    get link() {
        return `https://stayhome.softcode.fr/undercover/${this.roomId}`
    }

    get isHost() {
        if(!(this.room && this.room.host && this.room.host.id && this.room.host.id.length === 25)) {
            return false
        }
        return this.user.id === this.room.host.id
    }

    get isPlayer() {
        if(this.room && this.room.players && this.room.players.length){
            let userIds = this.room.players.map( x => x.user.id)
            let result = !!userIds.filter( x => x === this.user.id).length
            return result
        }
        return true
    }

    room: any = {
        id: '',
        name: '',
        public: true
    }

    previousSettings: any = null

    mounted() {
        this.$apollo.addSmartQuery('room', {
            query: ROOM,
            variables() {
                return {
                    id: this.roomId
                }
            },
            result: ({ data, loading, networkStatus }: any) => {
                if (!loading) {
                    if (data && data.undercoverRoom) {
                        if(this.isHost){
                            this.room.players = data.undercoverRoom.players
                        } else {
                            this.room = data.undercoverRoom
                        }
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

    beforeDestroy() {

    }

    backToHome() {
        this.$router.push({ name: 'gamepage' })
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
        this.$apollo.mutate({
            mutation: JOIN_ROOM,
            variables: {
                userId: this.user.id,
                roomId: this.roomId
            }
        })
    }

    async kick(playerId){
        this.$apollo.mutate({
            mutation: KICK_PLAYER,
            variables: {
                playerId: playerId,
                roomId: this.roomId
            }
        })
    }

    async play() {
        this.$apollo.mutate({
            mutation: PLAY,
            variables: {
                roomId: this.roomId
            }
        })
    }

    @Watch('room', { deep: true })
    update(){
        if(this.isHost){
            this.$apollo.mutate({
                mutation: UPDATE_ROOM,
                variables: {
                    id: this.room.id,
                    name: this.room.name,
                    public: this.room.public
                }
            })
        } else if(this.previousSettings) {
            let previousPlayersIds = this.previousSettings.players.map(x => x.user.id)
            let isPreviousPlayer = !!previousPlayersIds.filter(x => x === this.user.id).length
            if(isPreviousPlayer && !this.isPlayer){
                this.$router.replace({ name: 'gamepage' })
            }
            debugger
        }
        this.previousSettings = { ...this.room }
    }

    @Watch('isPlayer')
    displayPlayer(){
        if(this.isPlayer){
            this.dialogJoin = false
        } else {
            this.dialogJoin = true
        }
    }
}
</script>


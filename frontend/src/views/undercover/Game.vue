<template>
    <v-container fluid class="fill-height" :key="key">
        <v-row class="align-center justify-center">
            <v-col cols="3" class="d-flex justify-center">
                <vs-alert relief warn gradient class="d-flex justify-center align-center">
                    <template #title>
                        <div class="d-flex justify-center py-1">
                            <h2 class="justify-center">{{ player && player.word ? player.word : "" }}</h2> {{ isCurrentPlayer}}
                        </div>
                    </template>
                </vs-alert>
            </v-col>
            <v-col cols="12" class="d-flex justify-center">
                <!-- Room: {{ player && player.room ? player.room.name : "Undercover" }} -->
            </v-col>
            <v-col cols="5">
                <vs-alert warn :progress="progress" v-model="isCurrentPlayer">
                    <template #icon>
                        <i class='bx bx-copy'></i>
                    </template>
                    <template #title>
                        À toi de jouer ... DÉPÈCHE TOIII !!!
                    </template>
                    <template #footer>
                        <v-row>
                            <v-col cols="8" class="d-flex justify-center">
                                <vs-input
                                    block
                                    v-model="proposition"
                                    label-placeholder="Proposition"
                                ></vs-input>
                            </v-col>
                            <v-col cols="4" class="d-flex justify-center">
                                <vs-button
                                    gradient
                                    block
                                    @click="send(); isSended = true"
                                >
                                    Valider
                                </vs-button>
                            </v-col>
                        </v-row>
                    </template>
                </vs-alert>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" class="d-flex align-center justify-center">
                <v-row class="d-flex justify-center">
                    <v-col cols="7" class="d-flex align-center justify-center" v-for="plyr in players" :key="plyr.id">
                        <v-row no-gutters>
                            <v-col style="max-width: fit-content" class="pr-5" @click="setSelectedPlayer(plyr)">
                                <template v-if="room.currentPlayer.id === plyr.id">
                                    <vs-avatar
                                        :history="plyr.id === selectedPlayer.id"
                                        warn writing badge
                                        :badge-color="plyr.id === selectedPlayer.id ? 'warn' : 'primary'" size="90">
                                        <img :src="maskFace" class="coverImage" alt="">
                                    </vs-avatar>
                                </template>
                                <template v-else>
                                    <vs-avatar size="90" :history="plyr.id === selectedPlayer.id" warn>
                                        <img :src="maskFace" class="coverImage" alt="">
                                    </vs-avatar>
                                </template>
                                <div class="d-flex justify-center">
                                    {{ plyr.user.nickname }}
                                </div>
                            </v-col>
                            <v-col class="d-flex align-center">
                                <v-row no-gutters>
                                    <v-col cols="12" v-for="proposition in plyr.propositions" :key="proposition">
                                        <i class='bx bx-right-arrow'></i> {{ proposition }}<br/>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Apollo } from "../../decorators";
import { maskFace } from "../../assets/exports";

import PLAYER from "../../graphql/undercover/Player.gql"
import PLAYERS from "../../graphql/undercover/Players.gql"
import PLAYERS_SUBSCRIBTION from "../../graphql/undercover/PlayersSubscribtion.gql"
import SET_ROUND from "../../graphql/undercover/SetRound.gql"

@Component
export default class UnderCoverGame extends Vue {
    players = []

    progress = 0
    time = 30000

    proposition = ""

    selectedPlayer = {
        id: ""
    }

    interval = null

    timeOut = null

    isSended = false

    isCurrentPlayer = false

    key = 0

    get maskFace() {
        return maskFace
    }

    get roomId() {
        return this.$route.params.roomId
    }

    get playersIds() {
        return this.player.room.players.map( x => x.id)
    }

    get room() {
        if(this.players && this.players.length){
            return this.players[0].room
        }
        return null
    }

    get user() {
        return this.$store.state.user
    }

    mounted() {
        this.$apollo.addSmartQuery('players', {
            query: PLAYERS,
            variables() {
                return {
                    roomId: this.roomId
                }
            },
            result: ({ data, loading, networkStatus }: any) => {
                if (!loading) {
                    if (data && data.undercoverPlayers && data.undercoverPlayers.length) {
                        this.players = data.undercoverPlayers
                        if(this.players[0].room.currentPlayer.id === this.player.id){
                            this.isCurrentPlayer = true
                        } else {
                            this.isCurrentPlayer = false
                        }
                        this.key ++
                    }
                }
            },
            subscribeToMore: {
                document: PLAYERS_SUBSCRIBTION,
                variables() {
                    debugger
                    return {
                        roomId: this.roomId
                    }
                },
                updateQuery(previousResult, { subscriptionData }) {
                    return previousResult;
                }
            }
        })
    }

    afterMouted() {

    }

    @Apollo({
        query: PLAYER,
        variables() {
            return {
                userId: this.user.id,
                roomId: this.roomId
            }
        },
        skip() {
            return !this.user.id
        },
        result({ data, loading, networkStatus }: any) {
            if (!loading) {
                if (data && data.undercoverPlayers) {
                    this.player = data.undercoverPlayers[0]
                }
            }
        },
    })
    player: any = null

    setSelectedPlayer(selectedPlayer) {
        if(selectedPlayer.id !== this.player.id){
            this.selectedPlayer = selectedPlayer
        } else {
            this.$vs.notification({
                progress: 'auto',
                color: 'warn',
                duration: 4000,
                title: "Bats toi au lieu de voter pour toi même, c'est pas comme ca que tu vas gagner"
            })
            this.selectedPlayer = { id: '' }
        }
        
    }

    async send() {
        if(!this.isSended){
            clearInterval(this.interval)
            clearTimeout(this.timeOut)
            this.progress = 0
            await this.$apollo.mutate({
                mutation: SET_ROUND,
                variables: {
                    roomId: this.roomId,
                    playerId: this.player.id,
                    proposition: this.proposition
                }
            })
            this.proposition = ""
        }
        this.isSended = true
    }

    @Watch('players', { deep: true })
    active() {
        if(this.player && this.player.id && this.players && this.players.length){
            if(this.players[0].room.currentPlayer.id === this.player.id) {
                this.isSended = false
                this.interval = setInterval(() => {
                    this.progress += 0.5
                }, this.time / 200);

                this.timeOut = setTimeout(async () => {
                    await this.send()
                    this.isSended = false
                    clearInterval(this.interval)
                    this.progress = 0
                }, this.time);
            }
        }
    }

}
</script>
<style lang="scss">
.vs-alert__content__text{
    padding: 0px;
}

.coverImage {
    object-fit: cover;
    min-height: -webkit-fill-available;
    min-block-size: -webkit-fill-available;
}
</style>

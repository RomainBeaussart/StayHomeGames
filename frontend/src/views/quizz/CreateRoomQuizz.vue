<template>
    <v-container fluid class="fill-height">
        <v-row no-gutters class="align-center justify-center">
            <v-col cols="2" class="d-flex justify-center">
                <h1>StayHome! Quizz</h1>
            </v-col>
        </v-row>
        <v-row class="d-flex pt-12 pb-2 align-center justify-center">
            <v-col cols="2">
                <vs-input
                    block
                    warn
                    type="text"
                    icon-after
                    v-model="roomId"
                    placeholder="Room ID"
                >
                    <template #icon>
                        <i class="bx bx-key"></i>
                    </template>
                    <template #message-danger v-if="!isValidRoomId && roomId.length === 25">
                        Room ID invalide
                    </template>
                </vs-input>
            </v-col>
            <v-col cols="1">
                <vs-button
                    block
                    flat
                    warn
                    :loading="loading"
                    @click="join()"
                    :disabled="!isValidRoomId"
                >
                    Rejoindre
                </vs-button>
            </v-col>
        </v-row>
        <v-row class="d-flex pt-2 align-center justify-center">
            <v-col cols="1">
                <vs-button
                    block
                    warn
                    @click="dialogCreateRoom = true"
                >
                    Créer une Room
                </vs-button>
            </v-col>
        </v-row>
        <vs-dialog blur v-model="dialogCreateRoom" width="10%">
            <template #header>
                <h4 class="not-margin">Créer une Room <b>UnderCover</b></h4>
            </template>
            <div class="con-form pt-3">
                <vs-input block icon-after warn v-model="roomName" label-placeholder="Nom de la Room">
                    <template #icon>
                        <i class='bx bx-key'></i>
                    </template>
                </vs-input>
            </div>

            <template #footer>
                <div class="footer-dialog">
                    <vs-button block warn :disabled="roomName.length < 3" @click="createRoom()">
                        Créer
                    </vs-button>
                </div>
            </template>
        </vs-dialog>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Apollo } from "../../decorators";
import { maskFace } from "../../assets/exports";

import IS_VALID_ROOM_ID from "../../graphql/undercover/IsValidRoomId.gql"
import CREATE_ROOM from "../../graphql/undercover/CreateRoom.gql"

@Component
export default class UnderCoverCreateRoom extends Vue {
    roomId = ""

    roomName = ""

    loading = false

    dialogCreateRoom = false

    get user() {
        return this.$store.state.user
    }

    join() {
        this.loading = true
    }

    @Apollo({
        query: IS_VALID_ROOM_ID,
        variables() {
            return {
                id: this.roomId,
            };
        },
        skip() {
            return !(this.roomId && this.roomId.length === 25)
        },
        result({ data, loading, networkStatus }: any) {
            if (!loading) {
                if (
                    data &&
                    data.undercoverRoomsConnection &&
                    data.undercoverRoomsConnection.aggregate &&
                    data.undercoverRoomsConnection.aggregate.count &&
                    data.undercoverRoomsConnection.aggregate.count === 1
                ) {
                    this.isValidRoomId = true
                } else {
                    this.isValidRoomId = false
                }
            }
        },
    })
    isValidRoomId = false;

    mounted() {
        this.roomName = this.user.nickname
    }

    async createRoom(){
        const result = await this.$apollo.mutate({
            mutation: CREATE_ROOM,
            variables: {
                userId: this.user.id,
                settings: {
                    name: this.roomName
                }
            }
        })
        debugger
        this.$router.push({
            name: "undercover-room",
            params: {
                roomId: result.data.newUndercoverRoom.roomId
            }
        });
    }

    @Watch("isValidRoomId")
    initValidityRoomId() {
        this.isValidRoomId = false
    }
}
</script>


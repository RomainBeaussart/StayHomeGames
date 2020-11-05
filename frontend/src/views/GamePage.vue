<template>
    <v-container fluid class="fill-height">
        <v-row no-gutters>
            <v-col cols="12" class='d-flex justify-center'>
                <vs-card-group>
                    <vs-card
                        v-for="game of games"
                        @click="route(game.action)"
                        :key="game.id"
                        type="3"
                    >
                        <template #title>
                            <h3>{{ game.title }}</h3>
                        </template>
                        <template #img>
                            <img :src="game.picture" alt="" />
                        </template>
                        <template #text>
                            <p>{{ game.description }}</p>
                        </template>
                        <template #interactions>
                          <vs-button warn>
                            <i class='bx bx-game'></i>
                            <span class="span">
                                Jouer
                            </span>
                          </vs-button>
                        </template>
                    </vs-card>
                </vs-card-group>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Apollo } from "../decorators";
import { maskFace } from '../assets/exports'

@Component
export default class GamePage extends Vue {

    get games() {
        return [
            {
                id: 1,
                title: "Undercover",
                picture: maskFace,
                description: `
                Trouvez l'imposteur parmit les joueurs, grâce aux mots qu'ils vous donnent`,
                action: {
                    page:'undercover',
                    params: null,
                },
            }
        ]
    }

    route({page, params}){
        this.$router.push({ name: page })
    }
}
</script>


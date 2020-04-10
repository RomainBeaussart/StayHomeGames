<template>
    <v-container fluid class="d-flex justify-center fill-height" primary>
        <v-card
            elevation="0"
            width="40%"
            class="align-self-center"
            color="primary"
        >
            <v-layout xs6  wrap pa-5>
                <v-flex xs12>
                    <v-text-field
                        v-model="email"
                        label="Email"
                        filled
                        rounded
                        dark
                    ></v-text-field>
                    <v-text-field
                        v-model="password"
                        label="Mot de passe"
                        :append-icon="passwordShow ? 'visibility' : 'visibility_off'"
                        :type="passwordShow ? 'text' : 'password'"
                        @click:append="passwordShow = !passwordShow"
                        filled
                        rounded
                        dark
                    ></v-text-field>
                </v-flex>
                <v-flex xs9 class="d-flex justify-start align-center" style="color: #ffdd00">
                    {{ error }}
                </v-flex>
                <v-flex xs3 class="d-flex justify-end">
                    <v-btn
                        elevation="0"
                        @click="login()"
                        color="orange"
                        rounded
                        outlined
                    >
                        S'identifier
                    </v-btn>
                </v-flex>
            </v-layout>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import gql from "graphql-tag";
import { Apollo } from '../decorators'
import { sha256 } from "js-sha256"
import store from "../store/store"

import AUTHENTICATE_USER from '../graphql/auth/AuthenticateUser.gql'

@Component
export default class Login extends Vue {
    passwordShow: boolean = false

    email: string = ""
    password: string = ""

    error = ""

    loading = false

    async login() {
        try {
            this.loading = true
            console.log(sha256(this.password))
            const result = await this.$apollo.mutate({
                mutation: AUTHENTICATE_USER,
                variables: {
                    email: this.email,
                    password: sha256(this.password)
                }
            })
            
            this.loading = false

            if (result.data.login) {
                // this.$store.commit('logoutAdmin')
                localStorage.setItem('apollo-token', result.data.login.token)
                if (this.$route.query.from) {
                    this.$router.replace(this.$route.query.from as string)
                } else {
                    this.$router.replace({ name: 'home' })
                }
            }
        } catch (e) {
            this.error = "Vérifiez votre login et mot de passe"
            this.loading = false
        }
    }

    @Watch('email')
    @Watch('password')
    reset() { this.error = '' }

}
</script>


<template>
    <v-row>
        <v-col cols="12">
            <vs-input block color="primary" icon-after v-model="email" placeholder="Email">
                <template #icon>
                    <i class='bx bx-user'></i>
                </template>
            </vs-input>
        </v-col>
        <v-col cols="12">
            <vs-input block color="primary" type="password" icon-after v-model="password" placeholder="Mot de passe">
                <template #icon>
                  <i class='bx bx-lock-open-alt'></i>
                </template>
            </vs-input>
        </v-col>
        <v-col cols="12" class="d-flex justify-end">
            <vs-button
                block
                gradient
                :loading="loading"
                @click="login()"
            >
                S'identifier
            </vs-button>
        </v-col>
    </v-row>
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

    loading: boolean = false

    error = ""

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
                    this.$emit('isConnected')
                }
            }
        } catch (e) {
            this.$vs.notification({
                progress: 'auto',
                color: 'warn',
                duration: 2000,
                title: 'Erreur de connexion',
                text: `Vérifiez votre login et mot de passe`
            })
            this.loading = false
        }
    }

    @Watch('email')
    @Watch('password')
    reset() { this.error = '' }

}
</script>


<template>
    <v-row>
        <v-col cols="12">
            <vs-input block color="primary" icon-after v-model="nickname" placeholder="Pseudo">
                <template #icon>
                    <i class='bx bx-user'></i>
                </template>
            </vs-input>
        </v-col>
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
        <v-col cols="12">
            <vs-input block color="primary" type="password" icon-after v-model="confirmPassword" placeholder="Confirmez le mot de passe">
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
                @click="createAccount()"
            >
                S'enregistrer
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

import REGISTER_USER from '../graphql/auth/RegisterUser.gql'

@Component
export default class Register extends Vue {
    passwordShow: boolean = false

    nickname: string = ""
    email: string = ""
    password: string = ""
    confirmPassword: string = ""

    loading: boolean = false

    error = ""

    async createAccount() {
        this.loading = true
        if(this.password === this.confirmPassword) {
            try {
                console.log(sha256(this.password))
                const result = await this.$apollo.mutate({
                    mutation: REGISTER_USER,
                    variables: {
                        nickname: this.nickname,
                        email: this.email,
                        password: sha256(this.password),
                    }
                })
                
                this.loading = false
    
                if (result.data.register) {
                    // this.$store.commit('logoutAdmin')
                    localStorage.setItem('apollo-token', result.data.register.token)
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
                    text: `Vérifiez votre mail et mot de passe`
                })
                this.loading = false
            }
        } else {
            this.$vs.notification({
                progress: 'auto',
                color: 'warn',
                duration: 2000,
                title: 'Erreur de connexion',
                text: `Vérifiez que vos mots de passes saisies sont identiques`
            })
            this.loading = false
        }
    }

    @Watch('email')
    @Watch('password')
    reset() { this.error = '' }

}
</script>


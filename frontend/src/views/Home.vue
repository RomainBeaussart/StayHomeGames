<template>
    <div>
        <v-row>
            <v-col cols="6" class="d-flex justify-end">
                <vs-button
                    block
                    gradient
                    @click="login()"
                >
                    S'identifier
                </vs-button>
            </v-col>

            <v-col cols="6" class="d-flex justify-end">
                <vs-button
                    block
                    gradient
                    @click="createAccount()"
                >
                    Créer un compte
                </vs-button>
            </v-col>
        </v-row>
        <vs-dialog blur v-model="activeLoginDialog" width="10%">
            <template #header>
                <h4 class="not-margin">Welcome to <b>Quarantine Games</b></h4>
            </template>
            <Login @isConnected="activeLoginDialog = false"></Login>
        </vs-dialog>
        <vs-dialog blur v-model="activeRegisterDialog" width="10%">
            <template #header>
                <h4 class="not-margin">Welcome to <b>Quarantine Games</b></h4>
            </template>
            <Register @isConnected="activeRegisterDialog = false"></Register>
        </vs-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import Login from "./Login.vue";
import Register from "./Register.vue"
import { logo } from "../assets/exports"

@Component({
    components: {
        Login,
        Register,
    },
})
export default class Home extends Vue {

    activeLoginDialog = false;
    activeRegisterDialog = false;

    login() {
        this.activeLoginDialog = true;
    }
    
    createAccount() {
        this.activeRegisterDialog = true;
    }

}
</script>


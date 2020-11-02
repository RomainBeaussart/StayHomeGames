<template>
    <div class="center examplex">
        <vs-navbar shadow center-collapsed v-model="active">
            <template #left>
          <img @click="home()" :src="logo" alt="" height="40px">
        </template>

            <!-- <vs-navbar-group>
                Jeux
                <template #items>
                    <vs-navbar-item :active="active == 'Github'" id="Github">
                        Github
                    </vs-navbar-item>
                    <vs-navbar-item :active="active == 'Discord'" id="Discord">
                        Discord
                    </vs-navbar-item>
                    <vs-navbar-item :active="active == 'Twitter'" id="Twitter">
                        Twitter
                    </vs-navbar-item>
                    <vs-navbar-item :active="active == 'Medium'" id="Medium">
                        Medium
                    </vs-navbar-item>
                </template>
            </vs-navbar-group> -->
            <!-- <vs-navbar-item @click="home()">
                Quarantine Games
            </vs-navbar-item> -->
            <template #right>
                <template v-if="isLogged">
                    Bonjour {{ user.nickname }}
                    <vs-button gradient @click="logout()">
                        Disconnect
                    </vs-button>
                </template>
                <template v-else>
                    <vs-button gradient warn @click="activeLoginDialog = true">
                        Login
                    </vs-button>
                </template>
            </template>
        </vs-navbar>
        <div class="square" style="margin-top: 44px">
            <router-view></router-view>
        </div>
        <vs-dialog blur v-model="activeLoginDialog" width="10%">
            <template #header>
                <h4 class="not-margin">Welcome to <b>Quarantine Games</b></h4>
            </template>
            <Login @isConnected="activeLoginDialog = false"></Login>
        </vs-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import Login from "./Login.vue";
import { logo } from "../assets/exports"

@Component({
    components: {
        Login,
    },
})
export default class Index extends Vue {
    active = "guide";

    activeLoginDialog = false;

    get user() {
        return this.$store.state.user
    }

    get logo() {
        return logo
    }

    get isLogged() {
        return this.$store.state.user.id !== ''
    }

    logout() {
        localStorage.removeItem("apollo-token");
        this.$store.commit("logoutUser");
        location.reload();
    }

    home() {
        this.$router.push({ name: 'home' })
    }
}
</script>

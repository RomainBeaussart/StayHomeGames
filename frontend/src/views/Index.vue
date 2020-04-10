<template>
    <v-app style="background-color: #FFF">
        <v-content style="overflow: scroll; max-height: 100vh">
            <router-view style="background-color: #FFF;"></router-view>
        </v-content>
    </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component
export default class Index extends Vue {

    logout() {
        localStorage.removeItem("apollo-token");
        this.$store.commit("logoutUser");
        location.reload();
    }
}
</script>

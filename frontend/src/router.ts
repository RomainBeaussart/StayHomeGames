import Vue from 'vue'
import Router, { Route } from 'vue-router'
import gql from 'graphql-tag';
import { createProvider } from './vue-apollo'
import store from './store/store'

import Index from './views/Index.vue'

import UnderCoverCreateRoom from './views/undercover/CreateRoom.vue'
import UnderCoverLobby from './views/undercover/Lobby.vue'
import UnderCoverGame from './views/undercover/Game.vue'

import QuizzCreateRoom from './views/quizz/CreateRoom.vue'
import QuizzLobby from './views/quizz/Lobby.vue'

import GamePage from './views/GamePage.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Home from './views/Home.vue'

import USER_DETAILS from './graphql/auth/UserDetails.gql'

Vue.use(Router);

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/undercover',
            component: Index,
            children: [
                { path: '/undercover/create-room', name: 'undercover', component: UnderCoverCreateRoom },
                { path: '/undercover/:roomId', name: 'undercover-room', component: UnderCoverLobby, props: true },
                { path: '/undercover/play/:roomId', name: 'undercover-play', component: UnderCoverGame, props: true}
            ]
        },
        {
            path: '/quizz',
            component: Index,
            children: [
                { path: '/quizz/create-room', name: 'quizz', component: QuizzCreateRoom },
                { path: '/quizz/:roomId', name: 'quizz-room', component: QuizzLobby, props: true }
            ]
        },
        {
            path: '/',
            component: Index,
            children: [
                { path: '/home', name: 'home', component: Home },
                { path: '/gamepage', name: 'gamepage', component: GamePage },
                { path: '/login', name: 'login', component: Login },
                { path: '/register', name: 'register', component: Register },
            ]
        }
    ]
});

router.beforeEach(async (to: Route, from: Route, next: any) => {
    if (to.fullPath.startsWith('/home')) {
        return next()
    }

    const apolloClient = createProvider().defaultClient

    
    if (to.fullPath.startsWith('/')) {
        try {
            const res = await apolloClient.query({
                query: gql`{
                    loggedInUser {
                        id
                    }
                }`
            })

            if (!res.data.loggedInUser) {
                return next({ name: 'home', query: { from: to.path } })
            }
            const userDetails = await apolloClient.query({
                query: USER_DETAILS,
                variables: {
                    id: res.data.loggedInUser.id
                }
            })
            // user
            store.commit('setUser', userDetails.data.user);

            return next()
        } catch (e) {
            // localStorage.removeItem('apollo-token')
            return next({ name: 'home', query: { from: to.path } })
        }
    }
    return next()
})

export default router

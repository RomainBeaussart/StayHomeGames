import Vue from 'vue'
import Router, { Route } from 'vue-router'
import gql from 'graphql-tag';
import { createProvider } from './vue-apollo'
import store from './store/store'

import Index from './views/Index.vue'

import UnderCoverCreateRoom from './views/undercover/CreateRoom.vue'
import UnderCoverLobby from './views/undercover/Lobby.vue'

import Home from './views/Home.vue'
import Login from './views/Login.vue'
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
                { path: '/undercover/:roomId', name: 'undercover-room', component: UnderCoverLobby, props: true }
            ]
        },
        {
            path: '/',
            component: Index,
            children: [
                { path: '/', name: 'home', component: Home },
                { path: '/login', name: 'login', component: Login },
            ]
        }
    ]
});

router.beforeEach(async (to: Route, from: Route, next: any) => {
    if (to.fullPath.startsWith('/login')) {
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
                return next({ name: 'login', query: { from: to.path } })
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
            return next({ name: 'login', query: { from: to.path } })
        }
    }
    return next()
})

export default router

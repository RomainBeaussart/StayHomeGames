import Vue from 'vue';
import Vuex, { MutationTree, ActionTree } from 'vuex';
// import moment from 'moment';

import { User } from '../../../types';

Vue.use(Vuex);

export interface RootState {
    user: {
        nickname: string,
        id: string
    },
}

export default new Vuex.Store<RootState>({
    state: {
        user: {
            id: '',
            nickname: ''
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        logoutUser(state) {
            state.user = {
                id: '',
                nickname: ''
            }
        }
    } as MutationTree<RootState>,
    actions: {

    } as ActionTree<RootState, RootState>,
});

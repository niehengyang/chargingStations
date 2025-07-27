import { createStore } from 'vuex';
export default createStore({
  state: {
    count: 0
  },
  mutations: {
    SET_COUNT: (state, count) => {
        count += 1;
        state.count = count;
    }
  },
  actions: {},
  getters: {}
});

<template>
  <div>
    <div>
      count:{{ count }}
    </div>
    <ElButton type="primary" @click="addCount">count++</ElButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
// 导入store
const store = useStore()
// 将count赋值
const count = ref(store.state.count)
// count增加方法
const addCount = () => {
  count.value++
  store.commit('SET_COUNT', count.value)
}
</script>

<style scoped>
  .el-button {
    margin-top: 20px;
  }
</style>

<template>
  <div id="app">
    <popup />
  </div>
</template>

<script>
import popup from "/popup/popup.vue";

export default {
  components: {
    popup,
  },
};
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
}
</style>
<template>
  <img alt="Vue logo" src="./assets/logo.png">

  <!-- <HttpClientVue/> -->
  <SocetClient />

</template>

<script>
// import HttpClientVue from './components/HttpClient.vue';
import SocetClient from './components/SocetClient.vue';

export default {
  name: 'App',
  components: {
    // HttpClientVue,
    SocetClient,
 

  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

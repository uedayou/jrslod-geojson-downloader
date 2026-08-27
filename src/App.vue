<template>
  <v-app>
    <AppBar />
    <Layout />
  </v-app>
</template>

<script>
import AppBar from './components/AppBar.vue';
import Layout from './components/Layout.vue';

export default {
  name: 'App',
  components: {
    AppBar,
    Layout,
  },
  data: () => ({
    //
  }),
};
</script>

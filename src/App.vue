<template>
  <v-app>
    <AppBar />
    <Layout />
  </v-app>
</template>

<script>
import AppBar from './components/AppBar';
import Layout from './components/Layout';

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

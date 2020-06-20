<template>
  <v-main>
    <v-container fluid>
      <v-row>
        <v-col cols="12" style="padding-bottom:0px">
          <Selector />
        </v-col>
        <v-col cols="12">
          <Loader />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import Loader from './Loader'
import Selector from './Selector'

export default {
  name: 'Layout',
  components: {
    Loader,
    Selector,
  },
  data: () => ({
    //
  })
};
</script>
<template>
  <v-layout column justify-center>
    <v-flex>
      <h1>Welcome to the Development Analyst's Raiser's Edge Tools</h1>
    </v-flex>
  </v-layout>
</template>

<style scoped>
  img {
    margin-left: auto;
    margin-right: auto;
    display: block;
  }
</style>

<script>
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
    minTime: 250,
    maxConcurrent: 3
});

export default {
    name: 'Home',
    data: () => ({

    }),
    methods: {
      test() {
        console.log(window.location.href);
      }
    },
    mounted() {

    },
    watch: {
      
    }
}
</script>
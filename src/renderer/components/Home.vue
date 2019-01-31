<template>
  <v-layout column justify-center>
    <v-flex>
      <h1>Welcome to the Development Analyst's Raiser's Edge Tools</h1>
      <p>This application is intended to be used by the Development Analyst at Lethbridge College, however, there are utilities that may be useful to anyone who uses Raiser's Edge at Lethbridge College</p>
      <p>This application is a work in progress and you may encounter unexpected errors or broken/missing functionality</p>
      <p>If you have any questions please contact Mike Paulson at mike.paulson@lethbridgecollege.ca or if I am no longer at Lethbridge College I can be reached at mnpaulson@gmail.com</p>
      <h1>Functionality</h1>
      <ul>
        <li>Invoice - Used to generate invoices for outstanding pledges. Generates a PDF that can be automatically uploaded to the gift record on RE</li>
        <li>Funds - Provides a searchable list of all Funds within RE and links to their NXT page</li>
        <li>Contact Info - Allows the user to provide a list of consituent System Record IDs and provides contact information regardless of individual or organizational status</li>
        <li>Config - Currently used to set the directory to save invoice PDFs as well as the path to the optional upload utility</li>
        <li>Login - Use this first, login to your account on Raiser's Edge NXT</li>
      </ul>

      <h1>Known Bugs</h1>
      <ul>
        <li>Contact Info does not attempt to refetch values if initial request fails</li>
        <li>Invoice has problems displaying invoices for pledges with multiple payments</li>
      </ul>
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
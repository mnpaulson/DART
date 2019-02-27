<template>
<v-snackbar
  :timeout=5000
  top
  v-model="status"
  :color=type
>
  {{ msg }}
  <v-btn dark flat  @click.native="status = false">Close</v-btn>
</v-snackbar>
</template>


<script>
export default {
  data: () => ({}),
  methods: {},
  computed: {
    status: {
      get: function() {
        return this.$root.$data.Snackbar.status;
      },
      set: function(val) {
        this.$root.$data.Snackbar.status = val;
      }
    },
    msg() {
      return this.$root.$data.Snackbar.msg;
    },
    type() {
      return this.$root.$data.Snackbar.type;
    }
  }
};
</script>

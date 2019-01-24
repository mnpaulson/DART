<template>
  <v-layout column justify-center>
    <v-flex>
        <v-card>
            <v-card-text>
                <v-text-field label="Invoice Save Location" v-model="invoiceFilePath" xs12></v-text-field>
                <v-text-field label="File Upload Executable" v-model="skyexe" xs12></v-text-field>
            </v-card-text>
            <v-btn small color="primary" @click="saveSettings">Save</v-btn>
        </v-card>
    </v-flex>
  </v-layout>
</template>

<style scoped>

</style>

<script>
const settings = require('electron-settings');

export default {
    name: 'Settings',
    data: () => ({
        invoiceFilePath: null,
        skyexe: null
    }),
    methods: {
        saveSettings() {
            settings.set('invoiceFilePath', this.invoiceFilePath);
            settings.set('skyexe', this.skyexe);
        }
    },
    mounted() {
        if (settings.has('invoiceFilePath')) {
            this.invoiceFilePath = settings.get('invoiceFilePath');
        }
        if (settings.has('skyexe')) {
            this.skyexe = settings.get('skyexe');
        }
    }
}

</script>
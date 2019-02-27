<template>
  <v-layout column justify-center>
    <v-flex>
        <v-card>
            <v-card-text>
                <v-text-field label="Invoice Save Location" v-model="invoiceFilePath" xs12></v-text-field>
                <v-text-field label="File Upload Executable" v-model="skyexe" xs12></v-text-field>
                <v-text-field label="Email" v-model="email" xs12></v-text-field>
                <v-text-field type="password" label="Password" v-model="password" xs12></v-text-field>
            </v-card-text>
            <v-btn small color="primary" @click="saveSettings">Save</v-btn>
        </v-card>
    </v-flex>
  </v-layout>
</template>

<style scoped>

</style>

<script>
import { key } from "../../credentials.js"
const settings = require('electron-settings');
var aes256 = require('aes256');

export default {
    name: 'Settings',
    data: () => ({
        invoiceFilePath: null,
        skyexe: null,
        email: null,
        password: null
    }),
    methods: {
        saveSettings() {
            settings.set('invoiceFilePath', this.invoiceFilePath);
            settings.set('skyexe', this.skyexe);
            settings.set('email', this.email);
            settings.set('password', aes256.encrypt(key, this.password));
        }
    },
    mounted() {
        if (settings.has('invoiceFilePath')) {
            this.invoiceFilePath = settings.get('invoiceFilePath');
        }
        if (settings.has('skyexe')) {
            this.skyexe = settings.get('skyexe');
        }
        if (settings.has('email')) {
            this.email = settings.get('email');
        }
        if (settings.has('password')) {
            this.password = aes256.encrypt(key, settings.get('password'));
        }
    }
}

</script>

<template>
  <v-layout column justify-center>
    <v-flex>
        <h2>Funds</h2>
        <!-- <v-flex xs4>
            <v-card class="mb-3">
                <v-list>
                    <v-list-group
                    no-action
                    >
                    <v-list-tile slot="activator">
                        <v-list-tile-content>
                        <v-list-tile-title>Filters</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile
                    >
                        <v-list-tile-content>
                        <v-list-tile-title>Inactive</v-list-tile-title>
                        </v-list-tile-content>

                        <v-list-tile-action>
                            <v-checkbox v-model="filters.inactive"></v-checkbox>
                        </v-list-tile-action>
                    </v-list-tile>
                    </v-list-group>
                </v-list>
            </v-card>
        </v-flex> -->
        <v-card>
            <v-card-title>
            <v-spacer></v-spacer>
            <v-text-field
                v-model="search"
                append-icon="search"
                label="Search"
                single-line
                hide-details
            ></v-text-field>
            </v-card-title>
            <v-data-table
            :headers="headers"
            :items="fundList"
            :search="search"
            :loading="loading"
            >
            <template slot="items" slot-scope="props">
                <tr @click="openFund(props.item.id)">
                <td>{{ props.item.lookup_id }}</td>
                <td class="">{{ props.item.description }}</td>
                <td class="">{{ props.item.category }}</td>
                <td class="">{{ props.item.type }}</td>
                <td class="">{{ props.item.date_added }}</td>
                <td class="">{{ props.item.inactive }}</td>
                </tr>
            </template>
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
            </v-alert>
            </v-data-table>
        </v-card>
    </v-flex>
  </v-layout>
</template>

<style scoped>

</style>

<script>
const { shell } = require('electron');

export default {
    name: 'Funds',
    data: () => ({
        fundList: [],
        search: '',
        loading: true,
        filters: {
            'inactive': true,
            'category': null,
            'type': null
        },
        headers: [
          {
            text: 'Fund ID',
            align: 'left',
            value: 'lookup_id'
          },
          { text: 'Description', value: 'description' },
          { text: 'Category', value: 'category' },
          { text: 'Type', value: 'type' },
          { text: 'Date added', value: 'date_added' },
          { text: 'Inactive', value: 'inactive' }
        ],
    }),
    methods: {
        getFunds(offset) {
            console.log("Getting Offset: " + offset);
            this.skyGetFundList(offset)
                .then((response) => {
                    // this.fundList = response.data.value;
                    this.fundList = this.fundList.concat(response.data.value);
                    if ((this.fundList.length) < response.data.count) {
                        this.getFunds(offset + response.data.value.length);
                    }
                    this.loading = false;
                })
                .catch((response) => {
                    console.log(response);
                })
        },
        fundFilter(item) {
            console.log(this.filters.inactive);
            if (!this.filters.inactive && item.inactive === "true") return false;
            return true;
        },
        openFund(id) {  
            shell.openExternal('https://renxt.blackbaud.com/funds/' + id);
        }
    },
    mounted() {
        this.getFunds(0);
    },
    watch: {
        fundList: {
            handler(list) {
                list.forEach(function(e){

                }.bind(this));
            },
            deep: true
        },
        filters: function () {
            var temp = this.fundList;
            this.fundList = [];
            // this.fundList = temp;
        }
    }
}
</script>
<template>
  <v-layout column justify-center>
    <v-flex>
        <v-container fluid>
            <v-card>
                    <v-textarea
                        label="IDs"
                        value=""
                        placeholder="Paste System Record IDs here"
                        v-model="IDPaste"
                    ></v-textarea>
                    <v-btn @click="parseIDs()" color=primary>Parse</v-btn>
                    <v-btn @click="getGiftData()" color=primary>Get Gifts</v-btn>
                    <v-btn @click="getWriteOffs()" color=primary>Get Write Offs</v-btn>
                    <v-btn @click="getPledge()" color=primary>Get Plegde Related</v-btn>
                    {{message}}
            </v-card>
            </v-container>
            <!-- <v-container fluid>
                <v-card outlined>
                <v-list>
                <v-list-tile v-for="gift in giftIds" :key="gift.id">
                        <v-list-tile-content>
                            <v-list-tile-title v-text="gift.giftId"></v-list-tile-title>
                        </v-list-tile-content>
                </v-list-tile>
                </v-list>
                </v-card>
            </v-container> -->
    </v-flex>
  </v-layout>
</template>

<style scoped>

</style>

<script>
import Bottleneck from 'bottleneck'
const Json2csvParser = require('json2csv').Parser;
const { remote, BrowserWindow } = require('electron');
var csvWriter = require('csv-write-stream');
var fs = require('fs');
var http = require('https');

// var writer = csvWriter({headers: ['retreived', 'paymentId',  'pledgeId', 'fund_id']});
var writer;
var filestream = fs.createWriteStream('C:\\test\\Giftlog.csv');
// writer.pipe(filestream, {flags: 'a'});
const limiter = new Bottleneck({
    minTime: 250,
    maxConcurrent: 3
});

export default {
    name: 'Home',
    data: () => ({
        IDPaste: null,
        giftIds: [],
        message: "",
        ready: false,
        gifts: [],
        relatedGifts: [],
        giftIndex: 0,
        mode: 0
    }),
    methods: {
        parseIDs() {
            this.giftIds = this.IDPaste.split('\n');
            var length = this.giftIds.length;

            //Clears out blank lines
            for (var i = 0; i < length; i++) {
                if (this.giftIds[i] == "" || this.giftIds[i] === 'undefined') {
                    this.giftIds.splice(i,1);
                    i--;
                    length = length - 1;
                }
            }

            //Trim each line
            this.giftIds.forEach(id =>{
                id = id.trim();
            })
            
            var uniqueIDs = Array.from(new Set(this.giftIds));
            var length = this.giftIds.length
            var newLength = uniqueIDs.length
            if (length != newLength) this.warningText += parseInt(newLength-length) + " Duplicate IDs removed.\n";
            this.giftIds = uniqueIDs;

            this.message = `${length} IDs parsed and ready for scanning`;
            this.ready = true;
        },
        async getGiftData() {
            writer = csvWriter({headers: ['retreived', 'paymentId',  'pledgeId', 'fund_id']});
            writer.pipe(filestream, {flags: 'a'});
            this.mode = 0;
            this.getGift(this.giftIds[this.giftIndex], 0);
            this.getGift(this.giftIds[++this.giftIndex], 0);
            this.getGift(this.giftIds[++this.giftIndex], 0);
        },
        async getWriteOffs() {
            writer = csvWriter({headers: ['retreived', 'writeOffId',  'pledgeId', 'amount', 'date']});
            writer.pipe(filestream, {flags: 'a'});
            this.mode = 1;
            this.getGift(this.giftIds[this.giftIndex], 0);
            this.getGift(this.giftIds[++this.giftIndex], 0);
            this.getGift(this.giftIds[++this.giftIndex], 0);
        },
        async getGift(id, attempt) {
            if (id == undefined) return;
            this.skyGetGift(id)
                .then((response) => {
                    response.data.date = new Date(response.data.date);
                    response.data.date_added = new Date(response.data.date_added);
                    this.gifts.push(response.data);
                    // writer.write([new Date(), response.data.id, response.data.linked_gifts]);
                    response.data.linked_gifts.forEach(lg => {
                        if (this.mode == 0) {
                            response.data.gift_splits.forEach(gs => {
                                writer.write([new Date().toISOString(), response.data.id, lg, gs.fund_id]);
                            })
                        }
                        if (this.mode == 1) {
                            writer.write([new Date().toISOString(), response.data.id, lg, response.data.amount.value, response.data.date.toISOString()]);
                        }
                    })
                    console.log(`Got: ${id}`);
                    this.getGift(this.giftIds[++this.giftIndex], 0);
                })
                .catch((response) => {
                    console.log(response);
                    if (attempt < 3) this.getGift(id, attempt++);
                })
        },
        async getPledge() {
            this.webGetPledgeRelated()
                .then((response) => {
                    console.log(response);
                })
        }
        
    },
    mounted() {

    },
    watch: {
      
    }
}
</script>
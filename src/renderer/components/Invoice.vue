<template>
  <div>
    <v-layout v-show="giftID === null">
        <v-flex xs12 sm3>
          <v-text-field default="38134" v-model="giftLookupId" solo prepend-inner-icon="card_giftcard" label="Job ID"></v-text-field>
        </v-flex>
        <v-flex xs12 sm3>
          <v-btn outline color="indigo" @click="getGift(giftLookupId)">Get Gift</v-btn>
        </v-flex>
    </v-layout>
    <v-layout v-show="giftID === null">      
        <v-flex xs12 sm3>
          <v-menu
            ref="datePicker"
            :close-on-content-click="false"
            v-model="datePicker"
            :nudge-right="40"
            :return-value.sync="date"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <v-text-field
              slot="activator"
              v-model="date"
              label="Gifts After"
              prepend-inner-icon="event"
              readonly
              solo
            ></v-text-field>
            <v-date-picker v-model="date" @input="$refs.datePicker.save(date)"></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs12 sm3>
          <v-btn outline color="indigo" @click="getGifts">Get Gifts</v-btn>
        </v-flex>
      </v-layout>
      <v-layout center v-show="giftID === null">
      <v-slide-y-transition mode="out-in">
        <v-flex xs12 sm10>
        <template>
          <v-data-table
            :headers="headers"
            :items="gifts"
            disable-initial-sort
            hide-actions
            class="elevation-1"
          >
            <template slot="items" slot-scope="props" >
              <tr @click="giftID = props.item.id">
              <td @click.stop="openURL('https://renxt.blackbaud.com/gifts/' + props.item.id)"><a>NXT</a></td>
              <td>{{ props.item.constituent.name }}</td>
              <!-- <td>{{ props.item.type }}</td> -->
              <td class="text-xs-right">${{ props.item.amount.value.toLocaleString() }}</td>
              <td>{{ props.item.date.toLocaleDateString() }}</td>
              <td>{{ props.item.date_added.toLocaleDateString() }}</td>
              <td>{{ props.item.reference }}</td>
              <!-- <td>{{ props.item.receipts[0].status }}</td> -->
              <!-- <td class="justify-center layout px-0">
                <v-icon
                  small
                  class="mr-2"
                  @click="giftID = props.item.id"
                >
                  edit
                </v-icon>
              </td> -->
              </tr>
                  </template>
          </v-data-table>
        </template>
        </v-flex>
      </v-slide-y-transition>
    </v-layout>
    <v-btn class="noprint" outline color="indigo" @click="giftID = null" v-show="giftID != null"><v-icon dark>close</v-icon>Close</v-btn>
    <v-btn class="noprint" outline color="indigo" @click="prevInvoice = null" v-show="giftID != null" :disabled="giftIndex == 0"><v-icon dark>keyboard_arrow_left</v-icon>Prev</v-btn>
    <v-btn class="noprint" outline color="indigo" @click="nextInvoice" v-show="giftID != null" :disabled="giftIndex >= gifts.length - 1">Next<v-icon dark>keyboard_arrow_right</v-icon></v-btn>
    <Invoicedisplay :giftID="giftID" v-show="giftID != null"></Invoicedisplay>
  </div>
</template>
          
<script>
import Invoicedisplay from './Invoicedisplay'
import Bottleneck from 'bottleneck'
const { shell } = require('electron')

const limiter = new Bottleneck({
  minTime: 250,
  maxConcurrent: 3
});

  export default {
    name: "Invoice",
    components: { Invoicedisplay },
    data: () => ({
      giftLookupId: null,
      date: null,
      datePicker: null,
      giftID: null,
      giftIndex: null,
      gifts: [],
      headers: [
        {text: 'NXT', value: 'id', align: 'left', sortable: false},
        {text: 'Name', value: 'constituent.name', align: 'left'},
        {text: 'Amount', value: 'amount.value', align: 'right'},
        {text: 'Gift Date', value: 'date', align: 'left'},
        {text: 'Date Added', value: 'date_added', align: 'left'},
        {text: 'Reference', value: 'reference', align: 'left'},
      ]
    }),
    methods: {
      getGift(id) {
        this.skyGetGift(id)
          .then((response) => {
              this.gifts = []
              response.data.constituent = {name: 'loading...'};
              response.data.date = new Date(response.data.date);
              response.data.date_added = new Date(response.data.date_added);
              this.gifts.push(response.data);
              this.getConstituents();
          })
          .catch((response) => {
              console.log(response);
          })
      },
      getGifts() {
        var date = new Date(this.date).toISOString();
        limiter.schedule(() => this.skyGetGifts(date, "Pledge"))
          .then((response) => {
              response.data.value = response.data.value.reverse();
              response.data.value.forEach(gift => {
                gift.constituent = {name: 'loading...'};
                gift.date = new Date(gift.date);
                gift.date_added = new Date(gift.date_added);
              })
              this.gifts = response.data.value;
              this.getConstituents();
          })
          .catch((response) => {
              console.log(response);
          })
      },
      getConstituents() {
        this.gifts.forEach(gift => {
          // if (gift.type == 'Pledge') {
            limiter.schedule(() => this.skyGetConstituent(gift.constituent_id))
              .then((response) => {
                gift.constituent = response.data;
              })
              .catch((response) => {
                  console.log(response);
              })
          // }
        });
      },
      goToInvoice(id) {
          this.$router.push('/invoice/' + id);
      },
      getYesterday() {
        var d = new Date();
        var day = null;

        //If its first on the month then it just gets today because I'm lazy
        if (d.getDate() == 1) day = String(d.getDate()).padStart(2, "0");
        else day = String(d.getDate()-1).padStart(2, "0")
        return d.getFullYear().toString() + "-" + String(d.getMonth()+1).padStart(2, "0") + "-" + day;
      },
      nextInvoice() {
        this.giftID = this.gifts[this.giftIndex+1].id;
      },
      prevInvoice() {
        this.giftID = this.gifts[this.giftIndex-1].id;
      },
      openURL(url) {
        shell.openExternal(url);
      }
    },
    mounted() {
      this.date = this.getYesterday();
    },
    watch: {
      giftID: function() {
        var currentIndex = null;
        this.gifts.forEach((gift, index) => {
          if (gift.id == this.giftID) {
            currentIndex = index;
          };
        });
        this.giftIndex = currentIndex;
      }
    }
  }
</script>
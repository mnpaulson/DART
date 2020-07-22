<template>
    <div>
        <v-layout row wrap>
            <v-flex xs12 sm1 v-if="loaded">
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex xs12 sm8 v-if="loaded" class="options-card">
                <v-expansion-panel
                    v-model="panel"
                    expand
                >
                    <v-expansion-panel-content>
                        <template slot="header">Edit Text</template>
                        <v-card>
                            <v-card-text>
                                Gift Reference
                                <v-text-field v-model="gift.reference" solo label="Reference"></v-text-field>
                                Warning Text
                                <v-text-field v-model="warningText" solo label="Warning Text"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-card>
                    <v-card-text>
                        <v-flex xs12>
                            <v-combobox
                                v-model="contact"
                                :items="relationships"
                                :return-object=false
                                label="Select Contact"
                                v-if="relationships.length > 0"
                            ></v-combobox>
                        </v-flex>
                        <v-flex>
                            <v-combobox
                                v-model="email"
                                :items="emails"
                                :return-object=false
                                label="Select Email"
                            ></v-combobox> 
                            <v-combobox
                                v-model="paymentUrl"
                                :items="urls"
                                :return-object=false
                                label="Select Payment Url"
                            ></v-combobox> 
                            <!-- <v-text-field v-model="paymentUrl" solo label="Payment Url"></v-text-field> -->

                        </v-flex>
                    </v-card-text>
                    <v-card-actions>
                        <v-layout row>
                            <v-flex xs6>
                                <v-switch
                                    label="Show Images"
                                    v-model="images"
                                ></v-switch>
                            </v-flex>
                            <!-- <v-flex xs6>
                                <v-switch
                                    label="Upload to NXT"
                                    v-model="upload"
                                ></v-switch>
                            </v-flex> -->
                            <!-- <v-flex xs6>
                                <v-switch
                                    label="E-Mail Invoice"
                                    v-model="toggleEmail"
                                    v-if="email != ''"
                                ></v-switch>
                            </v-flex> -->
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex xs12>
                                <v-btn class="noprint" color="success" @click="makePDF">
                                    Save
                                    <span v-if="upload && toggleEmail">, Upload</span>
                                    <span v-else-if="upload"> &nbsp& Upload</span>
                                    <span v-if="toggleEmail"> &nbsp& E-mail</span>
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
        <div class="text-xs-center">
            <v-progress-circular
                :size="100"
                indeterminate
                color="primary"
                v-if="!loaded"
                >
            </v-progress-circular>
        </div>
        <v-card id="invoiceCard">
        <div ref="invoice" id="invoice" v-if="loaded">
            <img v-if="images" v-bind:src="logoURL" alt="" class="lclogo print">
            <h1 class="print">Request for Payment</h1>
            <div class="constAddr">
                <div class="print"><span class="print" v-show="contact.length > 0">Attn: </span>{{ contact }}</div>
                {{ gift.constituent.name }}
                <div class="print" v-html="gift.constituent.address.formatted_address"></div>
            </div>
            <!-- <div class="collegeAddr">
                Development & Alumni Relations Office <br>
                Lethbridge College<br>
                3000 College Drive South<br>
                Lethbridge, AB T1K 1L6<br>
                403-320-3457<br>
                advancement@lethbridgecollege.ca
            </div> -->
            <h3 class="warnText" v-show="warningText">{{ warningText }}</h3>
            <h3 class="date">Sent: {{ date.toLocaleString('en', options) }}</h3>
            <h3 class="controlNum">Control Number: {{ gift.id }} </h3>
            <div class="billedTo print constAddr">
                Billed To: <br>
                {{ gift.constituent.name }}
                <div class="print" v-html="gift.constituent.address.formatted_address"></div>
            </div>
            <div class="reference">Description: {{ gift.reference }}</div>
            <table>
                <tr class="headers"><td>Details</td><td class="amount">Amount</td></tr>
                <tr v-for="item in giftSplits" :key="item.id">
                    <td v-if="giftSplits.length > 1">{{ item.fund_name }}
                        <span class="print" v-if="item.package_id > 0"> - {{ giftPackages[item.package_id] }} </span>
                    </td><td v-else>{{ gift.reference }}</td>
                    <td class="amount">
                        <span v-if="giftSplits.length < 0"> ${{ item.balance.value.toLocaleString() }} </span>
                        <span v-else>${{ gift.balance.value.toLocaleString() }}</span>
                    </td>
                </tr>
                <tr class="total print"><td>Total:</td><td class="amount underline">    ${{ gift.balance.value.toLocaleString() }}</td></tr>
            </table>
            <div class="footer print">
                <div class="print">Please make payment to Lethbridge College within 30 days of receipt via the following:</div><br>
                <br>
                <span v-if="paymentUrl.length > 0"><br><span class="print"> 1. Credit card via the secured site: </span><a class="print" v-bind:href="paymentUrl">{{paymentUrl}}</a></span>
                <br><br>
                <span class="print" v-if="paymentUrl.length > 0">2.</span>
                <span class="print" v-if="paymentUrl.length <= 0">1.</span>
                 Cheque made payable to Lethbridge College and mailed to:<br>
                <br>
                <div class="print indent">Development &amp; Alumni Engagement Office <br>Lethbridge College<br>3000 College Drive South<br>Lethbridge, AB T1K 1L6<br></div>
            </div>
            <img v-if="images" :src="swooshURL" alt="" class="beready print">
        </div>
        </v-card>
    </div>
</template>

<style>

    .options-card {
        max-width: 792px !important;
    }

    @media print {
        #invoice > *, table > *, tr, td, .print {
            visibility: visible !important;
            /* color: white !important; */
        }

        #invoice {
            position: fixed;
            top: 0;
            left: -40px;
            color: black !important;
        }

        * {
            visibility: hidden;
        }

        .beready {
            /* float: right;
            height: 70px;
            left: 80px;
            bottom: -170px;
            position: relative; */

            float: right;
            height: 70px;
            right: 0px;
            /* bottom: -170px; */
            bottom: 15px;
            /* position: relative; */
            position: absolute;
        }

        .lclogo {
            position: absolute;
            height: 100px;
            top: 50px;
        }
    }

    h1 {
        text-align: center;
        top: -50px;
        position: relative;
    }

    #invoiceCard {
        margin-top: 20px;
        width: 792px;
        overflow: hidden;
    }

    #invoice {
        /* width: 200mm; */
        /* height: 285mm; */
        /* height: 1078px; */
        width: 792px;
        height: 1024px;
        /* width: 1584px; */
        /* height: 843px;
        width: 596px; */
        /* background-color: aqua; */
        padding: 15mm;
        padding-top: 35mm;
        font-weight: 500;
        letter-spacing: 0.05ch;
        /* overflow: hidden; */
        /* color: black; */
        /* font-family: ma; */
        /* font-size: .75em; */
    }

    .constAddr {
        margin-top: .25in;
    }

    .constAddr, .collegeAddr {
        line-height: 1.1em;
    }

    .collegeAddr, .date {
        /* text-align: right; */
    }

    .date {
        margin-top: 2em;
        font-size: 1em;
    }

    .supportText {
        text-align: center;
        margin-top: 2em;
    }

    .warnText {
        text-align: center;
        margin-top: 1em;
        color: red;
    }

    .controlNum {
        font-size: 1em;
        margin-bottom: 2em;
        /* margin-top: 2em; */
    }

    table {
        /* background-color: red; */
        /* font-size: 10px; */
        border: none;
        width: 100%;
        border-collapse: collapse;
    }

    td {
        padding: 3px;
    }

    .amount {
        text-align: right;
    }

    .headers {
        font-weight: bold;
    }

    .underline {
        text-decoration: underline;
    }

    .footer {
        margin-top: 3em;
        line-height: 1.1em;

    }

    .beready {
        float: right;
        height: 70px;
        right: 0px;
        /* bottom: -170px; */
        bottom: 15px;
        /* position: relative; */
        position: absolute;
    }

    .lclogo {
        position: absolute;
        height: 100px;
        top: 50px;
    }

    .total {
        font-weight: bold;
        background-color: #D9D9D9 !important;

    }

    .reference {
        font-weight: bold;
        margin-bottom: 2em;
        margin-top: 2em;
    }

    .indent {
        margin-left: 17px;
    }
</style>


<script>
import Bottleneck from 'bottleneck'
// import jsPDF from "jspdf"
// import pdfmake from "pdfmake"
import * as pdfmake from 'pdfmake/build/pdfmake'
import html2canvas from "html2canvas"
import { key } from "../../credentials.js"
const { remote, BrowserWindow } = require('electron')
const settings = require('electron-settings');

//

import * as nodemailer from 'nodemailer';
const aes256 = require('aes256');

//


const limiter = new Bottleneck({
    minTime: 250,
    maxConcurrent: 3
});

export default {
    name: 'Invoicedisplay',
    data: () => ({
        id: null,
        loaded: false,
        gift: {},
        giftSplits: [],
        giftPackages: [],
        relationships: [],
        emails: [],
        contact: "",
        email: "",
        warningText: null,
        images: true,
        upload: false,
        panel: [false],
        toggleEmail: false,
        paymentUrl: null,
        options: {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        },
        date: new Date(),
        swooshURL: 'static/bereadyswoosh.png',
        logoURL: 'static/lclogo.png',
        urls: [
            'https://lethbridgecollege.ca/scholarshippayment',
            'https://lethbridgecollege.ejoinme.org/honouringexcellencesponsorships',
            'https://lethbridgecollege.ejoinme.org/honouringexcellencetickets',
            ''
        ]
    }),
    props: ['giftID'],
    methods: {
        getGift(id) {
            this.skyGetGift(id)
                .then((response) => {
                    response.data.constituent = {
                        name: 'loading...'
                    };
                    response.data.constituent.contact = {
                        name: 'loading...'
                    };
                    response.data.date = new Date(response.data.date);
                    response.data.date_added = new Date(response.data.date_added);
                    this.$set(this, 'gift', response.data);
                    this.$set(this, 'giftSplits', response.data.gift_splits);
                    this.getConstituent(this.gift.constituent_id);
                    if (this.gift.gift_splits.length > 1) {
                        console.log("Get funds");
                        this.getFunds();
                    }
                })
                .catch((response) => {
                    console.log(response);
                })
        },
        getConstituent(id) {
            limiter.schedule(() => this.skyGetConstituent(id))
                .then((response) => {

                    if (response.data.address) response.data.address.formatted_address = response.data.address.formatted_address.replace(/\r\n/gm, "<br>");
                    else {
                        response.data.address = {
                            formatted_address: "No address Found"
                        }
                    }
                    this.$set(this.gift, 'constituent', response.data);
                    this.getConstituentEmails(this.gift.constituent_id);
                    if (this.gift.constituent.type == "Organization") this.getConstituentRels(this.gift.constituent_id);
                    else this.loaded = true;
                })
                .catch((response) => {
                    console.log(response);
                })
        },
        //Gets the relationship IDs for constituent
        //Looks for the primary and gets constituent info if found
        getConstituentRels(id) {
            limiter.schedule(() => this.skyGetConstituentRels(id))
                .then((response) => {
                    var primary_id = null;
                    // this.relationships = response.data;
                    var obj = {};
                    response.data.value.forEach(rel => {
                        obj = {
                            value: rel.name,
                            text: rel.name + " - " + rel.type + " - " + rel.organization_contact_type
                        }
                        // this.relationships.push(rel.name);
                        this.relationships.push(obj);
                        if (typeof rel.organization_contact_type !== 'undefined' && rel.organization_contact_type == "Primary" && this.contact == "") {
                            this.contact = rel.name;
                        }
                    });

                    this.loaded = true;
                })
                .catch((response) => {
                    console.log(response);
                })
        },
        getConstituentEmails(id) {
            limiter.schedule(() => this.skyGetConstituentEmails(id))
                .then((response) => {
                    var primary_id = null;
                    console.log(response.data);
                    // this.relationships = response.data;
                    var obj = {};
                    response.data.value.forEach(e => {
                        obj = {
                            value: e.address,
                            text: e.address + " - " + e.type
                        }
                        this.emails.push(obj);
                        if (typeof e.type !== 'undefined' && e.type == "Invoice") {
                            this.email = e.address;
                        } else if (this.email == "" && e.type == "E-Mail") {
                            this.email = e.address;
                        }
                    });

                    this.loaded = true;
                })
                .catch((response) => {
                    console.log(response);
                })
        },
        //Gets fund information for each gift associated with the gift
        getFunds() {
            this.gift.gift_splits.forEach(gift => {
                limiter.schedule(() => this.skyGetFund(gift.fund_id))
                    .then((response) => {

                        gift.fund_name = response.data.description;
                    })
                    .catch((response) => {
                        console.log(response);
                    })
            });
        },
        //Generates a PDF of the invoice. If the toggle is active it will also uploaded the PDF to NXT
        makePDF() {
            var invoice = document.getElementById("invoice");
            var fs = require('fs');
            var d = new Date();
            var date = d.getFullYear().toString().substr(-2) + String(d.getMonth()+1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
            var filename = date + "-" + this.giftID + '-' + this.gift.constituent.name.replace(/[^\w\s]| /gi, '');
            //Make sure the names not too long
            if (filename.length > 32) {
                filename = filename.substring(0, 31);
            }
            filename += ".pdf";

            var currentWindow = remote.getCurrentWindow()

            currentWindow.webContents.printToPDF(this.pdfSettings(), (err, data) => {
                    //Add file path validation here
                    if (settings.has('invoiceFilePath')) {
                        fs.writeFile(settings.get('invoiceFilePath') + "\\" + filename, data, function(err, data) {
                            console.log(settings.get('invoiceFilePath'));
                            if(err) {
                                return console.log(err);
                            }
                        });
                        if (this.upload) {
                            const uploadFile = new Promise((resolve, reject) => {
                                resolve(this.skyPythonPutGiftFile(settings.get('invoiceFilePath') + "\\" + filename, this.giftID, "Invoice", ["Invoice"]));
                            }).then((success, error) => {console.log(success)})
                        }
                        if(this.toggleEmail) {
                            this.emailInvoice(filename);
                        }

                    } else {
                        //put error here
                    }
            })
        },
        emailInvoice(filename) {
            const smtpConnectionString = {
                host: 'smtp.office365.com',
                port: '587',
                auth: { user: settings.get('email'), pass: aes256.decrypt(key, settings.get('password')) },
                secureConnection: false,
                tls: { ciphers: 'SSLv3' }
            };

            const transporter = nodemailer.createTransport(smtpConnectionString);
            transporter.sendMail({
                from: settings.get('email'),
                to: this.email,
                subject: 'subject',
                html: 'test encrypt',
                attachments: [
                {
                    path: settings.get('invoiceFilePath') + "\\" + filename,
                    filename: filename
                }
                ]
            });
        },
        // Code for broken document upload, use skyPythonPutGiftFile until blackbaud addresses CORs issue
        // postInvoice(blob, filename) {
        //     var request = {
        //         name: "Gift Invoice",
        //         parent_id: this.id,
        //         gift_id: this.giftID,
        //         tags: ["Invoice"],
        //         type: "Physical",
        //         file_id: null,
        //         file_name: filename,
		// 	    upload_thumbnail: true,
        //         thumbnail_id: null
        //     };


        //     this.skyPostGiftDocument(request, blob);
        //         .then((response) => {
        //             console.table(response);
        //         })
        //         .catch((response) => {
        //             console.log(response);
        //         })
        // },
        //Returns option object for PDF print settings
        pdfSettings() {
            var paperSizeArray = ["A4", "A5"];
            var option = {
                landscape: false,
                marginsType: 0,
                printBackground: true,
                printSelectionOnly: false,
            };
            return option;
        },

    },
    mounted() {
        //These values are used to provide a 'name' to various packages in the detail breakdown
        this.giftPackages[326] = "Sponsorship";
        this.giftPackages[327] = "Tickets";
        this.giftPackages[328] = "Sponsorship";
        this.giftPackages[329] = "Tickets";
        this.paymentUrl = this.urls[0];
    },
    watch: {
      //When gift ID changes we null or empty related values an initiate a request for the new gift values
      giftID: function() {
        this.loaded = false;
        this.gift = {};
        this.relationships =  [];
        this.emails = [];
        this.contact = "";
        this.email = "";
        if (this.giftID !== null) this.getGift(this.giftID);
      }
    },
    computed: {
        Snackbar() {
            return this.$root.$data.Snackbar;
        }
    }
}
</script>

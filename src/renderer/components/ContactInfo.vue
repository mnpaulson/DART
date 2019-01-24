<template>
    <div>
        <v-layout row wrap>
            <v-flex xs12>
                <v-card>
                    <v-textarea
                        label="IDs"
                        value=""
                        placeholder="Paste System Record IDs here"
                        v-model="IDPaste"
                    ></v-textarea>
                    <v-combobox
                        v-model="selectedContactTypes"
                        :items="contactTypes"
                        label="Contact Types"
                        chips
                        clearable
                        prepend-icon="filter_list"
                        multiple
                    >
                        <template slot="selection" slot-scope="data">
                        <v-chip
                            :selected="data.selected"
                            close
                            @input="remove(data.item)"
                        >
                            <strong>{{ data.item }}</strong>&nbsp;
                        </v-chip>
                        </template>
                    </v-combobox>
                    <v-card-text>
                        {{warningText}}
                    </v-card-text>
                    <v-btn color="info" @click="lookupIDs()">Get ID Info</v-btn>
                    <v-btn color="success" @click="generateCsv()"><v-icon>save_alt</v-icon>CSV</v-btn>
                    <v-progress-linear v-model="progressPercent"></v-progress-linear>
                </v-card>
            </v-flex>
        </v-layout>
        <ul>
            <li v-for="contact in contactInfo" :key="contact.id">
                <span v-if="contact.type == 'Individual'"> {{contact.name}}</span>
                <!-- <span v-if="contact.type == 'Individual'"> {{contact.formatted_name.primary_addressee.formatted_name}}</span> -->
                <span v-if="contact.type == 'Organization'">{{contact.selected_contact}} {{contact.name}} </span>
                - {{contact.address.formatted_address}}</li>
        </ul>
    </div>
</template>

<style>
</style>


<script>
import Bottleneck from 'bottleneck'
const { remote, BrowserWindow } = require('electron')
const Json2csvParser = require('json2csv').Parser;

const limiter = new Bottleneck({
    minTime: 250,
    maxConcurrent: 2
});

export default {
    name: 'ContactInfo',
    data: () => ({
        IDs: [],
        IDPaste: "",
        contactInfo: [],
        loading: false,
        progress: 0,
        warningText: "",
        contactTypes: [],
        selectedContactTypes: [],
        excludeInvalidAddr: true
    }),
    methods: {
        parseIDs() {
            this.IDs = [],
            this.contactInfo = [],
            this.progress = 0;
            this.IDs = this.IDPaste.split('\n');
            var length = this.IDs.length;

            //Clears out blank lines
            for (var i = 0; i < length; i++) {
                // console.log(i + ": " + this.IDs[i]);
                if (this.IDs[i] == "" || this.IDs[i] === 'undefined') {
                    this.IDs.splice(i,1);
                    i--;
                    length = length - 1;
                }
            }

            //Trim each line
            this.IDs.forEach(id =>{
                id = id.trim();
            })
            
            var uniqueIDs = Array.from(new Set(this.IDs));
            var length = this.IDs.length
            var newLength = uniqueIDs.length
            if (length != newLength) this.warningText += parseInt(newLength-length) + " Duplicate IDs removed.\n";
            this.IDs = uniqueIDs;
        },
        lookupIDs() {
            this.parseIDs();
            this.IDs.forEach(id => {
                this.getConstituent(id);
            });
        },
        getConstituent(id) {
            limiter.schedule(() => this.skyGetConstituent(id))
                .then((response) => {
                    if (response.data.address) {
                        if (response.data.address.do_not_mail === true || response.data.address.inactive === true) {
                            response.data.address = {
                                formatted_address: "No valid address Found"
                            }
                        } 
                    }
                    // if (response.data.address) response.data.address.formatted_address = response.data.address.formatted_address.replace(/\r\n/gm, "<br>");
                    else {
                        response.data.address = {
                            formatted_address: "No address Found"
                        }
                    }
                    
                    if (response.data.type == "Individual") response.data.formatted_name = { primary_addressee: {formatted_name: "Loading"}};
                    if (response.data.type == "Organization") response.data.selected_contact = "";
                    this.contactInfo.push(response.data);
                    if (response.data.type == "Organization") this.getConstituentRels(id);
                    else this.getNameFormats(id);
                    this.progress += 1;
                })
                .catch((response) => {
                    this.warningText += "Error Getting Constituent Info for ID: " + id + "\n";
                    console.log(response);
                })
        },
        getNameFormats(id) {
            limiter.schedule(() => this.skyGetConstituentNameFormats(id))
                .then((response) => {
                    // this.contactInfo.push(response.data);
                    var contactPos = this.contactInfo.map(function(x) {return x.id}).indexOf(id);
                    // this.contactInfo[contactPos].formatted_name = response.data;
                    this.contactInfo[contactPos].formatted_name = response.data.primary_addressee.formatted_name;
                    this.contactInfo[contactPos].formatted_salutation = response.data.primary_salutation.formatted_name;

                    this.progress += 1;
                })
                .catch((response) => {
                    this.warningText += "Error Getting Addresse Info for ID: " + id + "\n";
                    console.log(response);
                })
        },
        //Gets the relationship IDs for constituent
        //Looks for the primary and gets constituent info if found
        getConstituentRels(id) {
            limiter.schedule(() => this.skyGetConstituentRels(id))
                .then((response) => {
                    var primary_id = null;
                    var obj = {};
                    response.data.value.forEach(rel => {
                        var contactPos = this.contactInfo.map(function(x) {return x.id}).indexOf(id);
                        this.contactInfo[contactPos].relationships = response.data;
                        this.contactTypes.push(rel.organization_contact_type);

                    });
                    this.contactTypes = Array.from(new Set(this.contactTypes));
                    this.progress += 1;
                })
                .catch((response) => {
                    console.log(response);
                    this.warningText += "Error Getting Relationships for ID: " + id + "\n";
                })
        },
        setContacts() {
            this.contactInfo.forEach(contact => {
                if (contact.type == "Organization") {
                    this.selectedContactTypes.forEach(type  => {
                        if (contact.hasOwnProperty('relationships')) {
                            contact.relationships.value.forEach(rel => {
                                if (contact.selected_contact === "") {
                                    if (rel.organization_contact_type == type) {
                                        contact.selected_contact = rel.name;
                                    }
                                }

                            })  
                        }  
                    })

                }
            })
        },
        generateCsv(){
            var fs = require('fs');
            var fields = ['id',  'name', 'selected_contact', 'address.formatted_address',];
            var options = {fields};
            var filename = "test.csv";
            try {
                const parser = new Json2csvParser(options);
                const csv = parser.parse(this.contactInfo);
                console.log(csv);
                fs.writeFile('C:\\Users\\s0147873\\Desktop\\' + filename, csv, function(err, data) {
                    if(err) {
                        return console.log(err);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        }

    },
    mounted() {

    },
    watch: {
        contactInfo: {
                    handler: function(newValue) {
                        // console.log(newValue);
                    },
                    deep: true
                },
        selectedContactTypes: function (val) {
            this.contactInfo.forEach(contact => {
                contact.selected_contact = "";
            })
            this.setContacts();
        }
    },
    computed:{
        progressPercent: function() {
            length = this.IDs.length * 2;
            if (!length  >= 1) return "";
            return (this.progress/length) * 100;
        }
    }
}
</script>
<template>
    <div>
        <v-layout row wrap>
            <v-container fluid>
            <v-card>
                    <v-text-field v-model="offset" solo label="Payment Url"></v-text-field>
                    <v-textarea
                        label="IDs"
                        value=""
                        placeholder="Paste System Record IDs here"
                        v-model="IDPaste"
                    ></v-textarea>
                    <v-btn @click="getConstituents()" color=primary>Crawl</v-btn>
                    <v-btn @click="parseIDs()" color=primary>From List</v-btn>
                    <v-btn @click="panic()" color=error>PANIC!</v-btn>
                    Files Downloaded: {{filesDownloaded}}
            </v-card>
            </v-container>
            <v-container fluid>
                <v-textarea solo v-model=log></v-textarea>
                <v-card outlined>
                <v-list>
                <v-list-tile v-for="file in files.slice(-50).reverse()" :key="file.id">
                        <v-list-tile-action>
                            <v-icon v-if="file.saved" color="green">check</v-icon>
                            <v-progress-circular size=16 v-if="file.saving" indeterminate>
                            </v-progress-circular>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title v-text="file.file_name + ' - ' +  file.name"></v-list-tile-title>
                        </v-list-tile-content>
                </v-list-tile>
                </v-list>
                </v-card>
            </v-container>
        </v-layout>
    </div>
</template>

<style>
</style>


<script>
import Bottleneck from 'bottleneck'
const Json2csvParser = require('json2csv').Parser;
const { remote, BrowserWindow } = require('electron');
var csvWriter = require('csv-write-stream');
var fs = require('fs');
var http = require('https');

var writer = csvWriter({headers: ['retreived', 'id',  'file_name', 'name', 'tags', 'date', 'size', 'filename', 'length']});
var filestream = fs.createWriteStream('C:\\test\\log.csv');
writer.pipe(filestream, {flags: 'a'});


const limiter = new Bottleneck({
    minTime: 250,
    maxConcurrent: 2
});

export default {
    name: 'Attachments',
    data: () => ({
        id: null,
        IDs: [],
        IDPaste: "",
        constIds: [],
        waitingOnContacts: false,
        warningText: "",
        cancel: false,
        offset: 0,
        files: [],
        urls: [],
        filesDownloaded: 0,
        log: "awaiting start"
    }),
    methods: {
        getConstituents() {
            if (this.cancel) return;
            this.waitingOnContacts = true;
            this.log = "Getting Constituents\n" + this.log;
            limiter.schedule(() => this.skyGetConstituentIds(this.offset))
                .then((response) => {
                    this.log = "Retreived constituents\n" + this.log;
                    response.data.value.forEach(id => {
                        let Id = id.id;
                        this.constIds.push({id: Id, checked: false});
                    })
                    this.waitingOnContacts = false;
                    this.checkConstituentsForAttachments();
                })
                .catch((response) => {
                    this.warningText += "Error Getting Constituent\n";
                    console.log(response);
                })
        },
        checkConstituentsForAttachments() {
            if (this.cancel) return;
            this.constIds.forEach(con => {
                if (!con.checked) {
                    con.checked = true;
                    this.getAttachments(con);
                }
            })
        },
        getAttachments(con) {
            if (this.cancel) return;
            limiter.schedule(() => this.skyGetAttachments(con.id))
                .then((response) => {
                    this.log = `Checked attachments for ${con.id}\n` + this.log;
                    this.response = response;
                    let values = response.data.value;
                    let count = response.data.count;

                    if (count > values.length) console.log(`NOT ALL ATTACHMETNS RETREIVED FOR: ${id}`);


                    values.forEach(v => {
                        v.saved = false;
                        v.saving = false;
                        this.files.push(v);
                    })
                    this.handleDownloads();
                })
                .catch((response) => {
                    this.warningText += "Error Getting attachment Info for ID: " + con.id + "\n";
                    console.log(response);
                })
        },
        handleDownloads() {
            if (this.cancel) return;

            for (let i = 0; i < this.files.length; i++) {
                if (!this.files[i].saved && !this.files[i].saving) {
                    this.files[i].saving = true;
                    var attempt = 0;
                    
                    this.downloadHandler(this.files[i]);

                    
                }
            }

            this.readyToContinue();

        },
        async downloadHandler(file, attempt) {
                if (attempt == undefined) var attempt = 1;
                await this.downloadFile(file)
                    .then(result => {
                        file.saving = false;
                        file.saved = true;
                        this.$forceUpdate();
                    }, err => {
                        console.log(err);
                        console.log('attempt ' + attempt);
                        if (attempt < 3) this.downloadHandler(file, attempt++);
                    });
        },
        downloadFile(file, attempt) {
            if (this.cancel) return;
            var filename = this.setFileName(file);
            this.log = `Downloading file ${file.file_name}\n` + this.log;
            if (attempt !== undefined) console.log(`Attempt ${attempt} on file: ${file.file_name}`);
            return new Promise((resolve, reject) => {
                var filestream = fs.createWriteStream(`C:\\test\\${filename}`);
                    var request = http.get(file.url, response => {
                        response.pipe(filestream);
                    }).on('error', err => {
                        console.log(err);
                        reject(false);
                    }).end()

                filestream.on('finish', () => {
                    this.filesDownloaded++;
                    filestream.close();
                    resolve(true);
                })
            });
        },
        setFileName(file) {
            try {
                var parent = file.parent_id;
                var split = file.file_name.split('.');
                //get extension
                var extension = split.pop();
                //get current filename
                var filename = split.join();
                //get date
                var date = file.date.split('T')[0];
                //if media
                if (/Media_\d+/gm.test(filename)) {
                    filename = "";
                    if (file.name !== undefined) filename = file.name;
                    else {
                        file.tags.forEach(t => {
                            filename += t;
                        })
                    }
    
                }
    
                //remove spaces
                filename = filename.replace(/\s/g, '');
                filename = filename.replace(/[^a-zA-Z0-9\-]/g, '');
                filename = filename.replace(/-/g, '');
                // filename = filename.replace('.', '');
                var final = `${parent}_${filename}_${date}.${extension}`;
    
                writer.write([new Date(), parent, file.file_name, file.name, file.tags, file.date, file.file_size, final, final.length]);
            } catch (err) {
                console.log(file);
                console.log(err);
            }

            return `${parent}_${filename}_${date}.${extension}`
            //fileparent_bestName_date.extension
        },
        parseIDs() {
            this.IDs = [],
            this.contactInfo = [],
            this.progress = 0;
            this.constIds = this.IDPaste.split('\n');
            var length = this.constIds.length;

            //Clears out blank lines
            for (var i = 0; i < length; i++) {
                // console.log(i + ": " + this.constIds[i]);
                if (this.constIds[i] == "" || this.constIds[i] === 'undefined') {
                    this.constIds.splice(i,1);
                    i--;
                    length = length - 1;
                }
            }

            //Trim each line
            this.constIds.forEach(id =>{
                id = id.trim();
            })
            
            var uniqueIDs = Array.from(new Set(this.constIds));
            var length = this.constIds.length
            var newLength = uniqueIDs.length
            if (length != newLength) this.warningText += parseInt(newLength-length) + " Duplicate IDs removed.\n";
            this.constIds = uniqueIDs;
            for (let i = 0; i < this.constIds.length; i++) {
                this.constIds[i] = {id: this.constIds[i], checked: false};
            }
            
            this.checkConstituentsForAttachments();
        },
        panic() {
            this.cancel = true;
            this.exportCsv();
        },
        readyToContinue() {
            if (this.waitingOnContacts) return false;

            this.constIds.forEach(con => {
                if (!con.checked) {
                    console.log(con);
                    return false;
                }
            })

            // this.files.forEach(file => {
                // if (!file.saved) return false;
            // })

            this.offset = Number(this.offset) + Number(50);
            // this.getConstituents();
        }
    },
    mounted() {

    },
    watch: {
        files: {
                    handler: function(newValue) {
                        // console.log(newValue);
                    },
                    deep: true
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
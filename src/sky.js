// const {BrowserWindow} = require('electron')
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const child = require('child_process').execFile;
const settings = require('electron-settings');

const Sky = {
    install(Vue, {key: key, id: id, url: url}) {
        Vue.mixin({
            data: () => ({
                loginWindow: null
            }),
            //Computed variables for connecting to various SKY API endpoints
            computed: {
                skyGift: {
                    get: function() {
                        var gift = Vue.http.create({
                            baseURL: 'https://api.sky.blackbaud.com/gift/v1/',
                            timeout: 5000,
                            headers: {"bb-api-subscription-key": key, "Authorization": "Bearer " + localStorage.getItem('auth')}
                        })
                        return gift;
                    }
                },
                skyUploadDoc: {
                    get: function() {
                        var gift = Vue.http.create({
                            baseURL: 'https://api.sky.blackbaud.com/gift/v1/',
                            timeout: 5000,
                            headers: {"bb-api-subscription-key": key, "Authorization": "Bearer " + localStorage.getItem('auth')}
                        })
                        return gift;
                    }
                },
                skyConstituent: {
                    get: function() {
                        var consituent = Vue.http.create({
                            baseURL: 'https://api.sky.blackbaud.com/constituent/v1/',
                            timeout: 5000,
                            headers: {"bb-api-subscription-key": key, "Authorization": "Bearer " + localStorage.getItem('auth')}
                        })
                        return consituent;
                    }                    
                },
                skyFund: {
                    get: function() {
                        var fund = Vue.http.create({
                            baseURL: 'https://api.sky.blackbaud.com/fundraising/v1/',
                            timeout: 5000,
                            headers: {"bb-api-subscription-key": key, "Authorization": "Bearer " + localStorage.getItem('auth')}
                        })
                        return fund;
                    }                    
                }
            },
            methods: {
                //Calls the window creating function and shows the login window
                login() {

                    this.newLoginWindow();
                    this.loginWindow.loadURL("https://oauth2.sky.blackbaud.com/authorization?client_id=" + id + "&response_type=token&redirect_uri=" + url);
                    this.loginWindow.show();
                },
                //Creates the electron window in which to display the login screen
                //Also creates listeners to optain credentials once they are provided and close the window
                newLoginWindow() {
                    //create the window object
                    this.loginWindow = new BrowserWindow({
                        width: 800, 
                        height: 600, 
                        show: false, 
                        devTools: false, 
                        autoHideMenuBar: true,
                        nodeIntegration: false
                      });
                      
                      this.loginWindow.on('closed', () => {
                        // this.win = null
                      })
                      
                      //optain the auth token from the URL and hide the window
                      this.loginWindow.webContents.on('will-navigate', (e, url) =>{
                        if (url.includes("access_token")) {
                            localStorage.setItem('auth', url.split("access_token=")[1].split("&")[0]);
                            this.loginWindow.hide();
                        }
                      })
                      
                      this.loginWindow.webContents.on('did-get-redirect-request', (e, url) =>{
                        if (url.includes("access_token")) {
                            localStorage.setItem('auth', url.split("access_token=")[1].split("&")[0]);
                            this.loginWindow.hide();
                        }
                      })
                },
                //Gets gift information for single gift
                // Arguments:
                // giftID: the ID of the gift you wish to retreive
                skyGetGift(giftID) {
                    return this.skyGift.get("gifts/" + giftID);
                },                
                // Gets list of gifts from a given date forward
                // Function currently does not function without date parameter
                // Arguments:
                // date: the date from which to get all gifts after
                // type: gift types to retreive
                skyGetGifts(date, type) {
                    var request = "gifts/";
                    if (date !== null) request += "?date_added=" + date;
                    if (type !== null) request += "&gift_type=" + type;
                    return this.skyGift.get(request);                    
                },
                //This function is a hacky workaround to a bug on Blackbauds end
                // currently browsers can not upload files to their documents endpoint
                // This function call a python script that will handle the document endpoint
                // Arguments:
                // Filepath: a string containing the filepath to the file to be uploaded
                // gift id: the ID of the gift for which you wish to attach the file
                // displayName: the name of the file as it will be displayed on NXT
                // tags: an array of strings containing the tags to be displayed on NXT
                skyPythonPutGiftFile(filepath, gift_id, displayName, tags) {
                    var putParams = [
                        key, 
                        "\"Bearer " + localStorage.getItem('auth') + "\"", 
                        gift_id,
                         '"' + filepath + '"',
                        displayName,
                        tags.join(" ")
                        ]
                    let _this = this;
                    return child(settings.get('skyexe'), putParams, {windowsVerbatimArguments : true}, function(err, data) {
                        // console.log(err);
                        // console.log(data);
                        // console.log(this);
                        if (data.trim() == "File successfully uploaded.") {
                            console.log('yes?');
                            _this.$root.$data.Snackbar.setAlert(true, "success", "Invoice Uploaded Successfully");
                        }

                    });
                },
                //Abadoned code that I'm holding onto in case they fix the CORs bug with file uploads
                skyPostGiftDocument(request, blob) {
                    // var init = {
                    //     file_name: request.file_name,
                    //     upload_thumbnail: request.upload_thumbnail,
                    // };
                    // console.log(request);
                    // var putParams = [key, "\"Bearer " + localStorage.getItem('auth') + "\"", request.gift_id, "test.pdf"]
                    // child("C:\\Users\\s0147873\\Desktop\\lunchtime\\dart\\filePut\\sky.exe", putParams, function(err, data) {
                    //     console.log(err);
                    //     console.log(data.toString());
                    // });



                    // this.skyGift.post("documents", init)
                    //     .then((response) => {

                    //         //Thumb Upload Values
                    //         // var thumb_url = response.data.thumbnail_upload_request.url;
                    //         // var thumb_id = response.data.thumbnail_id;

                    //         // //fileUpload Values
                    //         // var file_id = response.data.file_id;
                    //         // var url = response.data.file_upload_request.url;
                            
                    //         // var h = response.data.file_upload_request.headers;                       
                    //         // var headers = {
                    //         //     "x-ms-blob-type": h[0].value,
                    //         //     "x-ms-version": h[1].value,
                    //         //     "Content-Type": "application/pdf"
                    //         // }

                    //         // var xhr = new XMLHttpRequest();
                    //         // xhr.open("PUT", url, true);
                    //         // xhr.setRequestHeader('Content-type', 'application/pdf');
                    //         // xhr.setRequestHeader('x-ms-version', h[1].value);
                    //         // xhr.setRequestHeader('x-ms-blob-type', h[0].value);
                    //         // xhr.onload = function () {
                    //         //     var test = JSON.parse(xhr.responseText);
                    //         //     if (xhr.readyState == 4 && xhr.status == "200") {
                    //         //         console.table(test);
                    //         //     } else {
                    //         //         console.error(test);
                    //         //     }
                    //         // }
                    //         // xhr.send(blob);

                    //         // var thumbUpload = Vue.http.create({
                    //         //     baseURL: thumb_url,
                    //         //     timeout: 10000,
                    //         //     headers: headers
                    //         // });

                    //         // var fileUpload = Vue.http.create({
                    //         //     baseURL: url,
                    //         //     timeout: 10000,
                    //         //     headers: headers,
                    //         //     data: blob
                    //         // });

                    //         // thumbUpload.put()
                    //         //     .then((response) => {
                    //         //         console.log(response);
                    //         //     })
                    //         //     .catch((response) => {
                    //         //         console.log(response);
                    //         //     })

                    //         // fileUpload.put()
                    //         //     .then((response) => {
                    //         //         console.log(response);
                    //         //     })
                    //         //     .catch((response) => {
                    //         //         console.log(response);
                    //         //     })

                    //     })
                    //     .catch((response) => {
                    //         console.log(response)
                    //     })                  
                },
                // Gets consituent information by ID
                // Arguments:
                // id: the id of the consituent you wish to retreive information for
                skyGetConstituent(id) {
                    return this.skyConstituent.get("constituents/" + id);
                },                
                // Gets consituent relationship information by ID
                // Arguments:
                // id: the id of the consituent you wish to retreive relationships for
                skyGetConstituentRels(id) {
                    return this.skyConstituent.get("constituents/" + id + "/relationships");
                },                
                // Gets consituent name formats
                // Arguments:
                // id: the id of the consituent you wish to retreive information for
                skyGetConstituentNameFormats(id) {
                    return this.skyConstituent.get("constituents/" + id + "/nameformats/summary");
                },
                // Gets consituent Email addresses
                // Arguments:
                // id: the id of the consituent you wish to retreive information for
                skyGetConstituentEmails(id) {
                    return this.skyConstituent.get("constituents/" + id + "/emailAddresses");
                },                 
                // Gets fund information by ID
                // Arguments:
                // id: the id of the fund you wish to retreive information for
                skyGetFund(id) {
                    return this.skyFund.get("funds/" + id);
                },               
                // Gets a list of all funds up to a maximum of 500 per request
                // Arguments:
                // offset: the offset for which to get funds. e.g. if first request returns 500, offset of 500 will retreive the next 500 records
                skyGetFundList(offset) {
                    if (typeof offset !== 'undefined') offset = "&offset=" + offset;
                    else offset = "";
                    return this.skyFund.get("funds/?include_inactive=true" + offset);
                }
            },
            mounted() {
                // this.loginWindow = new BrowserWindow({
                //     width: 800, 
                //     height: 600, 
                //     show: false, 
                //     devTools: false, 
                //     autoHideMenuBar: true,
                //     nodeIntegration: false
                //   });
                  
                //   this.loginWindow.on('closed', () => {
                //     // this.win = null
                //   })
                  
                //   this.loginWindow.webContents.on('will-navigate', (e, url) =>{
                //     if (url.includes("access_token")) {
                //         localStorage.setItem('auth', url.split("access_token=")[1].split("&")[0]);
                //         this.loginWindow.hide();
                //     }
                //   })
                  
                //   this.loginWindow.webContents.on('did-get-redirect-request', (e, url) =>{
                //     if (url.includes("access_token")) {
                //         localStorage.setItem('auth', url.split("access_token=")[1].split("&")[0]);
                //         this.loginWindow.hide();
                //     }
                //   })

            }
        });
    }
};

export default Sky;
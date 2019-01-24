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
                login() {
                    // this.loginWindow = new BrowserWindow({
                    //     width: 800, 
                    //     height: 600, 
                    //     show: false, 
                    //     devTools: false, 
                    //     autoHideMenuBar: true,
                    //     nodeIntegration: false
                    //   });
                    // this.newLoginWindow();
                    this.loginWindow.loadURL("https://oauth2.sky.blackbaud.com/authorization?client_id=" + id + "&response_type=token&redirect_uri=" + url);
                    this.loginWindow.show();
                },
                newLoginWindow() {
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
                skyGetGift(giftID) {
                    return this.skyGift.get("gifts/" + giftID);
                },
                skyGetGifts(date, type) {
                    var request = "gifts/";
                    if (date !== null) request += "?date_added=" + date;
                    if (type !== null) request += "&gift_type=" + type;
                    return this.skyGift.get("gifts/" + "?date_added=" + date);                    
                },
                skyPythonPutGiftFile(filepath, gift_id, displayName, tags) {
                    var putParams = [
                        key, 
                        "\"Bearer " + localStorage.getItem('auth') + "\"", 
                        gift_id,
                         '"' + filepath + '"',
                        displayName,
                        tags.join(" ")
                        ]
                    child(settings.get('skyexe'), putParams, {windowsVerbatimArguments : true}, function(err, data) {
                        console.log(err);
                        console.log(data.toString());
                    });
                },
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
                skyGetConstituent(id) {
                    return this.skyConstituent.get("constituents/" + id);
                },
                skyGetConstituentRels(id) {
                    return this.skyConstituent.get("constituents/" + id + "/relationships");
                },
                skyGetConstituentNameFormats(id) {
                    return this.skyConstituent.get("constituents/" + id + "/nameformats/summary");
                },
                skyGetFund(id) {
                    return this.skyFund.get("funds/" + id);
                },
                skyGetFundList(offset) {
                    if (typeof offset !== 'undefined') offset = "&offset=" + offset;
                    else offset = "";
                    return this.skyFund.get("funds/?include_inactive=true" + offset);
                }
            },
            mounted() {
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

            }
        });
    }
};

export default Sky;
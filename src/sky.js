// const {BrowserWindow} = require('electron')
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

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
                    this.loginWindow.loadURL("https://oauth2.sky.blackbaud.com/authorization?client_id=" + id + "&response_type=token&redirect_uri=" + url);
                    this.loginWindow.show();
                },
                skyGetGift(giftID) {
                    return this.skyGift.get("gifts/" + giftID);
                },
                skyGetGifts(date) {
                    return this.skyGift.get("gifts/" + "?date_added=" + date);                    
                },
                skyPostGiftDocument(request, blob) {
                    var init = {
                        file_name: request.file_name,
                        upload_thumbnail: request.upload_thumbnail
                    };
                    this.skyGift.post("documents", init)
                        .then((response) => {
                            // console.log(response);
                            var file_id = response.data.file_id;
                            var url = response.data.file_upload_request.url;
                            var h = response.data.file_upload_request.headers;
                            // console.log(file_id);
                            // var h1Name = h[0].name;
                            // var h1Value = h[0].value;
                            // var headers = {
                            //     "x-ms-blob-type": h[0].value,
                            //     "x-ms-version": h[1].value,
                            //     "content-type": "application/xml",
                            //     "Access-Control-Allow-Origin": "http://localhost:9080/",
                            //     "Access-Control-Allow-Methods": "PUT,POST,OPTIONS,GET",
                            //     "Access-Control-Allow-Headers": "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Accept",
                            //     "method": "*"
                            // }                            
                            var headers = {
                                "x-ms-blob-type": h[0].value,
                                "x-ms-version": h[1].value,
                                "Access-Control-Allow-Origin" : "localhost:9080/",
                                "Content-Type": "application/pdf"
                            }
                            var upload = Vue.http.create({
                                baseURL: url,
                                timeout: 10000,
                                headers: headers,
                                data: blob
                            });
                            upload.put()
                                .then((response) => {
                                    console.log(response);
                                })
                                .catch((response) => {
                                    console.log(response);
                                })

                        })
                        .catch((response) => {
                            console.log(response)
                        })                  
                },
                skyGetConstituent(id) {
                    return this.skyConstituent.get("constituents/" + id);
                },
                skyGetConstituentRels(id) {
                    return this.skyConstituent.get("constituents/" + id + "/relationships");
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
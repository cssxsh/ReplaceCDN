var back = {
    assetFilter: {},
    getFilter: function () {
        chrome.storage.sync.get("assetFilter", result => {
            if (result == null) return;

            back.assetFilter = result.assetFilter;
        });
    },
    start: function () {
        back.webListener.closeCORS();
        back.webListener.closeCSP();
        chrome.storage.sync.get("assetFilter", result => {
            if (result == null) return;

            back.assetFilter = result.assetFilter;
            back.webListener.add();
        });
    },
    redirect: request => {
        let url = request.url;
        let regs = back.assetFilter.regs;
    
        for (let index in regs) {
            let origin = new RegExp(regs[index].origin);
            
            if (origin.test(url)) {
                url = url.replace(origin, regs[index].result);
                // request.url = url;
                // console.log(request);
                console.log(request.requestId + " redirect " + request.url);
                
                return { redirectUrl: url };
            }
        }
    },
    webListener: {
        add: function () {
            chrome.webRequest.onBeforeRequest.addListener(
                back.redirect, 
                {
                    urls: back.assetFilter.urls,
                    types: [
                        // "main_frame", 
                        // "sub_frame", 
                        // "stylesheet", 
                        "script", 
                        // "image", 
                        // "font", 
                        // "object", 
                        // "xmlhttprequest", 
                        // "ping", 
                        // "csp_report", 
                        // "media",
                        // "other"
                    ]
                },
                [
                    "blocking",
                ]
            );
        },
        move: function () {
            chrome.webRequest.onBeforeRequest.removeListener(
                back.redirect
            );
        },
        closeCORS: function () {
            chrome.webRequest.onHeadersReceived.addListener(
                details => {
                    details.responseHeaders.push({name: "Access-Control-Allow-Origin", value: "*"});
                    details.responseHeaders.push({name: "Access-Control-Allow-Methods", value: "GET"});
                    details.responseHeaders.push({name: "Access-Control-Max-Age", value: "0"});

                    return { responseHeaders: details.responseHeaders };
                }, 
                {
                    urls: [
                        "<all_urls>"
                    ],
                    types: [
                        "script"
                    ]
                }, 
                [
                    "blocking", 
                    "responseHeaders"
                ]
            );
        },
        closeCSP: function () {
            chrome.webRequest.onHeadersReceived.addListener(
                details => {
                    if (details.type == "script") {
                        details.responseHeaders.push({name: "Access-Control-Allow-Origin", value: "*"});
                        details.responseHeaders.push({name: "Access-Control-Allow-Methods", value: "GET"});
                        details.responseHeaders.push({name: "Access-Control-Max-Age", value: "0"});

                        return { responseHeaders: details.responseHeaders };
                    }
                    for (let i in details.responseHeaders) {
                        if ("CONTENT-SECURITY-POLICY" == details.responseHeaders[i].name.toUpperCase()) {
                            // TODO 这里应该是添加
                            details.responseHeaders[i].value = "";
                            
                            return { responseHeaders: details.responseHeaders };
                        }
                    }
                }, 
                {
                    urls: [
                        "<all_urls>"
                    ],
                    types: [
                        "main_frame", 
                        "sub_frame"
                    ]
                }, 
                [
                    "blocking", 
                    "responseHeaders"
                ]
            );
        }
    }
}


back.start();

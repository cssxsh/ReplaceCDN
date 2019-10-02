var back = {
    assetFilter: {},
    loadFilter: function (func) {
        chrome.storage.sync.get("assetFilter", result => {

            back.assetFilter = result.assetFilter;
            if (func != null) func(back.assetFilter);
        });
    },
    start: function () {
        back.loadFilter(assetFilter => {
            chrome.permissions.contains(
            { 
                origins: assetFilter.origins.concat(assetFilter.filter.urls)
            }, 
            result => {
                if (result) {
                    back.webListener.add();
                } else {
                    alert("Permission denied!");
                }
            });
        });
    },
    closeCORS: details => {
        details.responseHeaders.push({name: "Access-Control-Allow-Origin", value: "*"});
        details.responseHeaders.push({name: "Access-Control-Allow-Methods", value: "GET"});
        details.responseHeaders.push({name: "Access-Control-Max-Age", value: "0"});

        return { responseHeaders: details.responseHeaders };
    },
    closeCSP: details => {
        for (let i in details.responseHeaders) {
            if ("CONTENT-SECURITY-POLICY" == details.responseHeaders[i].name.toUpperCase()) {
                // TODO 这里应该是添加
                details.responseHeaders[i].value = "";
                
                return { responseHeaders: details.responseHeaders };
            }
        }
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
            // closeCSP
            if (back.assetFilter.switch.closeCSP) chrome.webRequest.onHeadersReceived.addListener(
                back.closeCSP, 
                {
                    urls: back.assetFilter.origins,
                    types: [
                        "main_frame", 
                        "sub_frame", 
                        // "stylesheet", 
                        // "script", 
                        // "image", 
                        // "font", 
                        // "object", 
                        // "xmlhttprequest", 
                        // "ping", 
                        // "csp_report", 
                        // "media", 
                        // "websocket", 
                        // "other"
                    ]
                }, 
                [
                    "blocking", 
                    "responseHeaders"
                ]
            );
            // closeCORS
            if (back.assetFilter.switch.closeCORS) chrome.webRequest.onHeadersReceived.addListener(
                back.closeCORS, 
                back.assetFilter.filter,
                [
                    "blocking", 
                    "responseHeaders"
                ]
            );
            // redirect
            chrome.webRequest.onBeforeRequest.addListener(
                back.redirect, 
                back.assetFilter.filter,
                [
                    "blocking",
                ]
            );
        },
        move: function () {
            chrome.webRequest.onBeforeRequest.removeListener(
                back.redirect
            );
            
            if (back.assetFilter.closeCORS) chrome.webRequest.onHeadersReceived.removeListener(
                back.closeCORS
            );
            if (back.assetFilter.closeCSP) chrome.webRequest.onHeadersReceived.removeListener(
                back.closeCSP
            );
        }
    }
}


back.start();

var back = {
    assetFilter: {},
    loadFilter: func => {
        chrome.storage.sync.get("assetFilter", result => {
            back.assetFilter = result.assetFilter;
            
            if (typeof func === "function") {
                func(back.assetFilter);
            }
        });
    },
    start: event => {
        // 声明方法
        let setWebListener = parameters => {
            back.loadFilter(assetFilter => {
                let permissions = { 
                    origins: assetFilter.origins.concat(assetFilter.filter.urls)
                };
                
                chrome.permissions.contains(permissions, result => {
                    if (result) {
                        back.webListener.add();
                    } else {
                        alert("Permission denied!");
                        // TODO 权限不足错误处理
                        chrome.runtime.openOptionsPage();
                    }
                });
            });
        }
        // 传递
        init.start(setWebListener);
    },
    closeCORS: details => {
        details.responseHeaders.push({name: "Access-Control-Allow-Origin", value: "*"});
        details.responseHeaders.push({name: "Access-Control-Allow-Methods", value: "GET"});
        details.responseHeaders.push({name: "Access-Control-Max-Age", value: "0"});
        // service worker 工作空间
        details.responseHeaders.push({name: "Service-Worker-Allowed", value: "/"});
        // console.log(details);
        return { responseHeaders: details.responseHeaders };
    },
    closeCSP: details => {
        for (let i in details.responseHeaders) {
            if ("CONTENT-SECURITY-POLICY" === details.responseHeaders[i].name.toUpperCase()) {
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
            let types = regs[index].types;
            
            if (origin.test(url)) {
                if (Array.isArray(types) && !types.includes(request.type)) {
                    return;
                }
                url = url.replace(origin, regs[index].result);
                
                return { redirectUrl: url };
            }
        }
    },
    webListener: {
        add: func => {
            let switchs = back.assetFilter.switchs;
            // closeCSP
            if (switchs.closeCSP) chrome.webRequest.onHeadersReceived.addListener(
                back.closeCSP, 
                {
                    urls: back.assetFilter.origins,
                    types: [
                        "main_frame", 
                        "sub_frame"
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
            if (switchs.closeCORS) chrome.webRequest.onHeadersReceived.addListener(
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
            if (typeof func === "function") {
                func();
            }
        },
        move: func => {
            chrome.webRequest.onBeforeRequest.removeListener(
                back.redirect
            );
            
            if (back.assetFilter.closeCORS) chrome.webRequest.onHeadersReceived.removeListener(
                back.closeCORS
            );
            if (back.assetFilter.closeCSP) chrome.webRequest.onHeadersReceived.removeListener(
                back.closeCSP
            );
            
            if (typeof func === "function") {
                func();
            }
        }
    }
}

window.onload = back.start;

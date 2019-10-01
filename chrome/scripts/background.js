var back = {
    assetFilter: {},
    getFilter: function () {
        chrome.storage.sync.get("assetFilter", result => {
            if (result == null) return;

            back.assetFilter = result.assetFilter;
        });
    },
    start: function () {
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
                console.log(request);
                break;
            }
        }
        return { redirectUrl: url };
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
                        "font", 
                        // "object", 
                        // "xmlhttprequest", 
                        // "ping", 
                        // "csp_report", 
                        // "media",
                        // "other"
                    ]
                },
                ["blocking"]
            );
        },
        move: function () {
            chrome.webRequest.onBeforeRequest.removeListener(
                back.redirect
            );
        }
    }
}


back.start();

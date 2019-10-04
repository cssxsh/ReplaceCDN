var init = {
    defaultFilter: {
        filter: {
            types: [
                "stylesheet",
                "script"
            ],
            urls: [
                "*://ajax.googleapis.com/*",
                "*://themes.googleusercontent.com/*"
            ]
        },
        regs: [
            {
                origin: "^https?://ajax.googleapis.com/",
                result: "https://ajax.proxy.ustclug.org/"
            },
            {
                origin: "^https?://themes.googleusercontent.com/",
                result: "https://google-themes.proxy.ustclug.org/"
            }
        ],
        switchs: {
            closeCORS: true,
            closeCSP: true
        },
        origins: [
            "<all_urls>"
        ]
    },
    defaultSeted: false,
    start: func => {
        // 绑定事件
        chrome.runtime.onInstalled.addListener(details => {
            switch (details.reason) {
                case "install":
                    init.install();
                    break;
                case "update":
                    break;
                case "chrome_update": 
                    break;
                case "shared_module_update":
                    break;
                default:
                    // func(details.reason);
                    break;
            }
        });
        // 设置初始化
        chrome.storage.sync.get("defaultFilter", result => {
            if (result.assetFilter === null) {
                init.defaultSeted = false;
                init.setDefault(func);
            } else {
                func();
            }
        });
    },
    install: func => {
        // 设置默认模式
        if (!init.defaultSeted) init.setDefault();
        if (typeof func === "function") {
            func("install");
        }
    },
    update: func => {
        
        if (typeof func === "function") {
            func("update");
        }
    },
    chrome_update: func => {
        
        if (typeof func === "function") {
            func("chrome_update");
        }
    },
    shared_module_update: func => {
        
        if (typeof func === "function") {
            func("shared_module_update");
        }
    },
    setDefault: func => {
        let data = { 
            assetFilter: init.defaultFilter, 
            defaultFilter: init.defaultFilter
        };
        chrome.storage.sync.set(data, parameter => {
            if (chrome.runtime.lastError) {
                alert(chrome.runtime.lastError);
            } else {
                //
                init.defaultSeted = true;
                if (typeof func === "function") {
                    func(data.assetFilter);
                }
            }
        });
    }
}
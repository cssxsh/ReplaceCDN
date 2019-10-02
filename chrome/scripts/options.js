var options = {
    result: null,
    init: function () {
        // 初始化数据
        chrome.storage.sync.get("assetFilter", result => {
            options.result = result;
            document.getElementById("jsonInput").value = JSON.stringify(options.result, null, 4);
        });
        // 绑定事件
        document.getElementById("btn_submit").addEventListener("click", options.save);
    },
    save: event => {
        let theValue = document.getElementById("jsonInput").value;
    
        if (!theValue) {
            alert("Can't be null!");
            return;
        }
        try {
            theValue = JSON.parse(theValue);
        } catch(error) {
            alert(error);
            return;
        }

        // 更新权限
        let oldResult = options.assetFilter;
        let newResult = theValue.assetFilter;
        let oldOrigins = "";
        try {
            oldOrigins = oldResult.origins.concat(oldResult.filter.urls);
            chrome.permissions.remove({ origins: oldOrigins });
        } catch(error) {
            // 原值不规范
        }
        let newOrigins = newResult.origins.concat(newResult.filter.urls);
        chrome.permissions.request(
            { 
                origins: newOrigins,
                permissions: [
                    "webRequest",
                    "webRequestBlocking"
                ]
            }, 
            granted => {
            if (!granted) {
                alert("Save failed!");
            } else {
                // 更新设置
                chrome.storage.sync.set(theValue, function() {
                    let back = chrome.extension.getBackgroundPage().back;
                    back.loadFilter();
                    back.webListener.move();
                    back.webListener.add();
                });
            }
        });
    }
};

// 初始化
options.init();

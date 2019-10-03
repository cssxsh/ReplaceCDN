var options = {
    result: null,
    init: event => {
        // 初始化数据
        chrome.storage.sync.get(["assetFilter"], result => {
            options.result = result;
            document.getElementById("jsonInput").value = JSON.stringify(options.result, null, 4);
        });
        // 绑定事件
        document.getElementById("btn_submit").addEventListener("click", options.save);
    },
    save: event => {
        let theValue = document.getElementById("jsonInput").value;
        // 输入合法性判断
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
        let oldResult = options.result.assetFilter;
        let newResult = theValue.assetFilter;
        let oldPermissions = { 
            origins: ""
        };
        try {
            oldPermissions.origins = oldResult.origins.concat(oldResult.filter.urls);
            chrome.permissions.remove(oldPermissions);
        } catch(error) {
            // TODO 原值不规范处理
        }
        let newPermissions = { 
            origins: newResult.origins.concat(newResult.filter.urls)
        };
        chrome.permissions.request(newPermissions, granted => {
            if (granted) {
                // 更新设置
                chrome.storage.sync.set(theValue, parameter => {
                    if (chrome.runtime.lastError) {
                        alert(chrome.runtime.lastError);
                    } else {
                        let back = chrome.extension.getBackgroundPage().back;
                        back.loadFilter(assetFilter => {
                            // 更新事件
                            back.webListener.move();
                            back.webListener.add();
                        });
                    }
                });
            } else {
                alert("Save failed!");
            }
        });
    }
};

// 初始化
window.onload = options.init;

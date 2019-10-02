chrome.storage.sync.get("assetFilter", result => {
    document.getElementById("jsonInput").value = JSON.stringify(result, null, 4);
});

document.getElementById('btn_submit').addEventListener('click',
    function saveChanges() {
        textarea = document.getElementById("jsonInput");
        var theValue = textarea.value;

        if (!theValue) {
            return;
        }
        theValue = JSON.parse(theValue);
        chrome.storage.sync.set(theValue, function() {
            let back = chrome.extension.getBackgroundPage().back;
            back.getFilter();
            back.webListener.move();
            back.webListener.add();
        });
    }
);
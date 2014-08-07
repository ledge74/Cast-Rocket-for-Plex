function PrepareToCast(tab) {

	var VideoURL = tab.url;

    chrome.tabs.update({url: chrome.extension.getURL('remote.html'), active: true});
    setTimeout(function(){chrome.tabs.sendMessage(tab.id, {castthis: VideoURL}, function(response) {})},1000);
}

chrome.browserAction.onClicked.addListener(PrepareToCast);
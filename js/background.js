function PrepareToCast(tab) {

	//Get current tab url and convert it to http
	var VideoURL = tab.url;

	chrome.tabs.create({
		'url': chrome.extension.getURL('remote.html')
	}, function(tab) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  chrome.tabs.sendMessage(tabs[0].id, {castthis: VideoURL}, function(response) {
		  });
		});
	});
}

chrome.browserAction.onClicked.addListener(PrepareToCast);
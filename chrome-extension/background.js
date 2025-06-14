chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'copy_to_app',
    title: '画像を高橋に転送する',
    contexts: ['image'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copy_to_app') {
    chrome.tabs.sendMessage(tab.id, 'getClickedImageBuffer');
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request?.type == 'sendBuffer') {
    fetch('http://127.0.0.1:14650/', {
      method: 'POST',
      body: JSON.stringify(request.data),
      headers: { 'Content-Type': 'application/json' },
    }).catch((ex) => {
      console.error(ex);
      chrome.tabs.sendMessage(sender.tab.id, 'sendBufferError');
    });
  }
});

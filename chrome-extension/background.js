chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'copy_to_app',
    title: '画像を高橋に転送する',
    contexts: ['image'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copy_to_app') {
    chrome.tabs.sendMessage(tab.id, 'getClickedImageBuffer', function (response) {
      console.log(response.value);
    });
  }
});

let targetElement;

document.addEventListener(
  'contextmenu',
  function (event) {
    targetElement = event.target;
  },
  true,
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request == 'getClickedImageBuffer') {
    if (!targetElement || targetElement.tagName?.toLowerCase() !== 'img') return;

    const canvas = document.createElement('canvas');
    canvas.width = targetElement.width;
    canvas.height = targetElement.height;
    canvas.getContext('2d').drawImage(targetElement, 0, 0);

    canvas.toBlob(
      (b) => {
        console.log(b);
      },
      'image/png',
      1.0,
    );

    sendResponse({ value: '' });
  }
});

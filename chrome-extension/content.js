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

    fetch(targetElement.src)
      .then((data) =>
        data.blob().then((buffer) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // data:image/jpeg;base64,
            const bufferData = reader.result.split('base64,');
            const mimeType = bufferData[0].slice(5, -1);
            const base64 = bufferData[1];

            const supportTypes = {
              'image/jpeg': 'jpg',
              'image/jpg': 'jpg',
              'image/png': 'png',
              'image/gif': 'gif',
              'image/bmp': 'bmp',
              'image/tiff': 'tiff',
              'image/webp': 'webp',
            };
            const ext = supportTypes[mimeType];
            if (!ext) return;

            chrome.runtime.sendMessage({
              type: 'sendBuffer',
              data: { buffer: base64, ext, title: document.title, url: document.URL },
            });
          };
          reader.onerror = (err) => console.error(err);
          reader.readAsDataURL(buffer);
        }),
      )
      .catch(() => {
        chrome.runtime.sendMessage({
          type: 'sendBuffer',
          data: { src: targetElement.src, ext: '', title: document.title, url: document.URL },
        });
      });
  } else if (request === 'sendBufferError') {
    alert(
      '高橋への送信に失敗しました。\n\n高橋は起動していますか？\n高橋のほうにエラーは出力されていませんか？',
    );
  }
});

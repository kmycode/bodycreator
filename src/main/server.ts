import express from 'express';
import { loadEsm } from 'load-esm';

export type ImageQueueItem = { buffer: ArrayBuffer; title: string; author: string; url: string; ext: string };

export const launchServer = (onSend: (item: ImageQueueItem) => void): void => {
  const app = express();

  app.use(express.urlencoded({ extended: true, limit: '1gb' }));
  app.use(express.json({ limit: '1gb' }));

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;
    return arrayBuffer;
  };

  app.post('/', async (req, res) => {
    if (req.body) {
      const body = req.body as { buffer?: string; src?: string; title?: string; url?: string; ext?: string };
      let arrayBuffer = body.buffer ? base64ToArrayBuffer(body.buffer) : null;
      let ext = body.ext;

      if (!arrayBuffer && body.src) {
        const data = await fetch(body.src);
        if (data) {
          arrayBuffer = await data.arrayBuffer();

          const fileType = await loadEsm<typeof import('file-type')>('file-type');
          const type = await fileType.fileTypeFromBuffer(arrayBuffer);

          ext = type?.ext;

          if (!ext) {
            arrayBuffer = null;
          }
        }
      }

      if (arrayBuffer && body.url && body.title) {
        console.dir({ title: body.title, url: body.url, ext });

        let author = '';
        const url = new URL(body.url);
        if (url.host === 'pixiv.net' || url.host.endsWith('.pixiv.net')) {
          author =
            body.title.match(/- (.*)のイラスト .*- pixiv/)?.[1] ??
            body.title.match(/- (.*)のマンガ .*- pixiv/)?.[1] ??
            '';
        } else if (url.host === 'x.com' || url.host.endsWith('.x.com')) {
          author = body.title.match(/Xユーザーの(.*)さん:/)?.[1] ?? '';
        } else if (url.host === 'kmy.blue') {
          author = body.title.match(/(.[^:]*):/)?.[1] ?? '';
        }

        onSend({
          buffer: arrayBuffer,
          title: body.title,
          author,
          url: body.url,
          ext: ext ?? '',
        });
      }
    }
    res.send('');
  });

  app.get('/', (_, res) => {
    res.send('Takahashi');
  });

  app.listen(14650, () => {
    console.log('Server is running on http://127.0.0.1:14650/');
  });
};

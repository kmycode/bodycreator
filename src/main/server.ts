import express from 'express';
import fs from 'fs';

export type ImageQueueItem = { buffer: ArrayBuffer; title: string; author: string; url: string; ext: string };

export const launchServer = (onSend: (item: ImageQueueItem) => void): void => {
  const app = express();

  app.use(express.urlencoded({ extended: true, limit: '1gb' }));
  app.use(express.json({ limit: '1gb' }));

  app.post('/', (req, res) => {
    if (req.body) {
      const body = req.body as { buffer?: string; title?: string; url?: string; ext?: string };
      if (body.buffer && body.url && body.title) {
        const binaryString = atob(body.buffer);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;

        console.dir({ title: body.title, url: body.url, ext: body.ext });

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

        const filePath = `C:\\users\\tt\\Downloads\\test.jpg`;
        fs.writeFile(filePath, Buffer.from(arrayBuffer), (err) => {
          if (err) console.error(err);
        });

        onSend({
          buffer: arrayBuffer,
          title: body.title,
          author,
          url: body.url,
          ext: body.ext ?? '',
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

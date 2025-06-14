import express from 'express';
import fs from 'fs';

export const launchServer = (): void => {
  const app = express();

  app.use(express.urlencoded({ extended: true, limit: '1gb' }));
  app.use(express.json({ limit: '1gb' }));

  app.post('/', (req, res) => {
    if (req.body) {
      const body = req.body as { buffer?: string; title?: string; url?: string; ext?: string };
      if (body.buffer) {
        const binaryString = atob(body.buffer);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;

        console.dir({ title: body.title, url: body.url, ext: body.ext });

        fs.writeFile(`C:\\users\\tt\\Downloads\\test.jpg`, Buffer.from(arrayBuffer), (err) => {
          if (err) console.error(err);
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

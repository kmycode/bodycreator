# 高橋

高橋は、[あすか](https://kmy.blue/@askyq)専用の画像整理ソフトです。あすかの絵の練習とかおえかき時の資料検索とかのために使います。

一般の人でも使えるようにするための自由度とか全く考慮していないので、他の人は使う前に自分で改造することをおすすめします。

Electron+React+Redux+TypeScript+SCSSで開発しています。Google Chromeで動作する拡張機能が`chrome_extension`ディレクトリ内にあり、これを使用するとpixivなど外部サイトの画像を右クリックしてメニューを選択することで、高橋に取り込むことができます。

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

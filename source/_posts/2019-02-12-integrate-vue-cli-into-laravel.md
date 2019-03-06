title: 在 Laravel 專案中整合 Vue CLI
tags:
  - Laravel
  - Vue
date: 2019-02-12 14:27:08
---


自從 Vue CLI 3 發佈以來，如何將它整合在 Laravel 裡是不少開發者的疑問；因此 Vue 的老爸尤雨溪便針對這個問題寫了一個[教學範例](https://github.com/yyx990803/laravel-vue-cli-3) ，本文即是參考該範例所寫，不過有根據 Laravel 的新特性做一些調整。

<!--more-->

## 準備環境

開始前記得先安裝必要工具：

```bash
$ composer global install laravel/installer
$ composer global install laravel/valet
$ npm i -g @vue/cli
```

## 建立並修改 Laravel 專案

建立一個乾淨的 Laravel 5.7 專案，然後刪掉所有跟前端有關的目錄與檔案。

```bash
$ laravel new project
$ cd project
$ rm -rf package.json \
  webpack.mix.js \
  yarn.lock \
  resources/view/welcome.blade.php \
  resources/{js,sass} \
  public/{js,css}
```

然後修改 `routes/web.php` ，將內容置換成：

```php
<?php

use Illuminate\Support\Facades\Route;

Route::view('/{any}', 'index')
    ->where('any', '.*');
```

為了避免建置後的靜態檔案被加入版本控制中，修改專案根目錄下的 `.gitignore` ，加入以下內容：

```
/public/js
/public/css
/public/img
/public/svg
/resources/views/index.blade.php
```

然後做版本控制。 

```bash
$ git init
$ git add .
$ git ci -m "Init project"
```

接著用 Valet 來設定網站：

```bash
$ valet link
$ valet secure project
```

這樣我們測試用的網址即為 [`https://project.test`](https://project.test) 。

## 建立前端用資料夾

接下來用 Vue CLI 建立前端資料夾，以便管理所有跟前端有關的資源：

```bash
$ vue create frontend
# 這邊視專案規模來決定要用哪些設定
```

建立 `frontend/vue.config.js` ，內容如下：

```js
module.exports = {
  // 在專案開發中如果呼叫 API 時會 pass 給這個 proxy 網址
  // 這邊就用前面以 Valet 建立的網站網址
  devServer: {
    proxy: 'https://project.test'
  },

  // 建置前端靜態檔案時要擺放的目錄
  // 在 package.json 也要調整 "build" 這個 script
  outputDir: '../public',

  // 開發階段修改 index.html 來讓 js/css 可以作用
  // 上線階段則會修改 Laravel 的樣版
  indexPath: process.env.NODE_ENV === 'production'
    ? '../resources/views/index.blade.php'
    : 'index.html'
}
```

然後修改 `frontend/package.json` 的 `scripts.build` ，主要是避免把 `public` 整個刪除：

```diff
"scripts": {
  "serve": "vue-cli-service serve",
- "build": "vue-cli-service build",
+ "build": "rm -rf ../public/{js,css,img} && vue-cli-service build --no-clean",
  "lint": "vue-cli-service lint"
},
```

最後就可以用以下指令來開發或建置專案：

```bash
$ cd frontend
$ yarn # 安裝套件
$ yarn serve # 啟動開發用伺服器
$ yarn build # 建置上線用版本
```

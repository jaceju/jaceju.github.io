---
layout: post
title: "利用 generator-angular 來建立一個 AngularJS 專案"
date: 2014-05-16 17:57:33 +0800
comments: true
tags: ["AngularJS","Grunt","Yeoman"]
---
參考了 [AngularJS @ DevWeek 2014](https://speakerdeck.com/pearlchen/angularjs-at-devweek-2014) 這篇的介紹，認真地試玩了一下 Yomen AngularJS Generator ，以下是簡單的筆記。
<!--more-->
建立一個 AngularJS 專案的方式如下 (`$` 為命令列提示符號，不需輸入) ：

    $ [sudo] npm install --g yo generator-angular
    $ mkdir <app-name>
    $ cd <app-name>
    $ yo angular [app-name]
    $ npm install karma-chrome-launcher karma-jasmine --save-dev
    $ bower install --save angular-cookies

預覽專案：

    $ grunt serve

建立對應的 JavaScript 檔案：

    $ yo angular:controller [controllerName]
    $ yo angular:view [viewName]
    $ yo angular:route [routeName]
    $ yo angular:directive [directiveName]

測試專案：

    $ grunt test

建置專案：

    $ grunt build

另外需要注意幾個重點：

* 跟 bower 的結合非常緊密，如果沒有什麼客製化需求的話，直接用就 bower 來管理 assets 就好。
* 因為有用 bower 和 grunt 直接在 `index.html` 上管理相依性和最小化的問題，所以不需要使用 RequestJS 。
* 要跟後端 framework 結合的話，可以把 app 這個目錄改成 public 。但還需要對應改以下兩個部份：

  * `bower.json` 加入 `"appPath": "public"` 。
  * `.bowerrc` 及 `karma.conf.js` 中的 `app/` 改成 `public/` 。

* 儘量不要改 index.html 裡的註解，因為 Grunt 的 task 會用到它們來做管理 assets 。
* `yo angular:route <route-name> --route=<path>` 會自動幫你新增對應的 Controller / Route / View 。
* `yo angular:directive <directive-name>` 的 `directive-name` 要用 `-` (dash) 。
* `grunt test` 預設是用 Chrome 和 Jasmine 來執行測試，所以要先執行以下指令：

      npm install karma-chrome-launcher karma-jasmine --save-dev

* `grunt build` 後的所有檔案會放在 `dist` 目錄下，所以線上 Web 環境要把網站根目錄指到 `dist` 目錄，而不是 `public` 目錄。

接下來要想想看是不是能改用 Gulp 處理，我對 Grunt 已經不是那麼有愛了。
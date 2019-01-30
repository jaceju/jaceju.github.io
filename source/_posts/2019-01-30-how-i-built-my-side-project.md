title: 我如何從需求出發到完成一個專案
tags:
  - Web 開發
date: 2019-01-30 12:04:37
---

身為一個 Web 開發者，有時候我還是會問自己：「如果今天讓你一個人從頭開發出一個網站，你要怎麼開始呢？」這倒不是說我不知道怎麼做，而是要讓我自己徹底地去理解需求所面對的問題，然後明白自己可以用什麼工具去解決它。

剛好前陣子遇到一個公司內部的需求，讓我有機會重新省視一下自己目前的技能是否足以完成這個需求。

<!-- more -->

## 從需求開始

在我們的產品用戶端要出版前，都會由 SQA 先進行自動化測試，然而這些測試卻無法在伺服器端的 API 佈署完成時自動執行。為了解決這個問題，我們內部在討論過後，決定建立一個佈署監控服務，在 API 專案完成佈署後，自動通知 SQA 的 CI 系統來進行自動化測試。

只是我們公司的網路架構比較特別， SQA 的 CI 環境無法從外界穿透，所以我們也很難拿現成的服務來套用 (例如 SNS) ；加上我們待佈署的機器通常有很多台，無法很容易地在所有機器都佈署完成後得到它們的狀態，需要一些特別的機制來處理。因此這套監控服務就決定由我來實作，也方便針對我們的環境做客製化。由於這牽扯到一些敏感資訊，我只能說這個服務的機制大致上是透過監控上傳到 AWS S3 的佈署狀態，以做到專案佈署與服務通知的解耦。

當然這個方案是因為我個人在有限的知識裡思考出來的，不見得是最佳方案；所以還是要強調一下，**這篇文章並不是探討有什麼好方案，而是要紀錄我在開發這個專案時的歷程。**我相信各位如果有機會跟我身處一樣的狀況時，一定可以想到比我的這個方案更聰明的方式。

## 所以怎麼開始呢？

首先我們當然是實驗看看這個想法可不可行，免得後面做白工。我跟 SRE 的同事先從規格定義開始，也就是他該上傳什麼格式的資訊到 S3 上來讓我存取；這樣一來 SRE 同事可以先行處理上傳狀態的部份，而我這邊也可以做解析狀態的 PoC 。

在確定這個機制可行後，就可以正式讓它繼續往下走了。接著我就開始思考這個專案還需要什麼進一步的資訊，也就是進入到了設計階段。由於這個服務不限於只用在一個專案上，因此我也把它設計成讓開發者可以加入他們自己的專案；也只有登記在案的專案才能享有這個服務的機制，也方便我在介面上的呈現以及未來對權限上的控管。

而在通知服務的部份， SQA 的同事也提供了他們的 webhook 來讓我串接；只不過如果每次都真的觸發他們的自動化測試的話，他們的困擾也不小。因此在這邊一開始我也不是真的去打他們給的網址，而是先試著觸發一些無傷大雅的測試網址。這時候我就想到，也許這個機制也不見得只能觸發 SQA 的自動化測試，而是可以觸發其他服務的 webhook ，因此我就將它設計成可以設定想要通知的服務，而非直接寫死在程式裡。

大致上需要的資訊都定義好後，我就開始設計 Database Schema 以及開票請託其他部門同事協助建立一些網站必要的基礎建設。

## 來個管理介面吧

既然是監控佈署狀態，所以就需要有個地方讓我們看到目前佈署的狀態。這裡我決定用前後端分離的方式來製作這個專案，後端的部份當然毫無疑問地是選用我個人熟悉的 [Laravel](https://laravel.com/) 來做為 API 的基礎，而在前端的部份我則是選用了 [Vue.js](https://vuejs.org/) 做後台介面。

在 API 的部份主要是設計給前端 UI 存取後端資源，以及給 CI 佈署指令做 hook 使用；基本上 API 部份用到的技術大致上是：

* [Laravel Routing](https://laravel.com/docs/5.7/routing) - 用在 RESTful API 上
* [Laravel Validation](https://laravel.com/docs/5.7/validation) - 用在 POST 資料的驗證
* [Laravel Eloquent ORM](https://laravel.com/docs/5.7/eloquent) - 建立 Service 層來隔離 Model 的操作

而前端 UI 則是包含了監控用的 dashboard ，以及專案與服務的設定功能。這裡我用到了以下的套件和技術：

* [Element](https://element.eleme.io/)
* [Vuex](https://vuex.vuejs.org/)
* [Vue Router](https://router.vuejs.org/)
* [Axois](https://github.com/axios/axios)
* [Laravel Mix](https://laravel.com/docs/5.7/mix)

這些應該都是 Vue.js 及 Laravel 在前端開發時很常見的工具了，所以這邊我也不多提。我在前端上花比較多心力的部份是如何讓後端的狀態可以即時反應到前端 UI 來，這部份就用到了以下的技術：

* [Laravel Events](https://laravel.com/docs/5.7/events)
* [Laravel Broadcasting](https://laravel.com/docs/5.7/broadcasting)
    * [Vue-Echo](https://github.com/happyDemon/vue-echo)
    * [Laravel Echo Server](https://github.com/tlaverdure/laravel-echo-server) (以 [PM2](http://pm2.keymetrics.io/) 啟動)

接下來就是把這些基本要素組合起來，它們的運作方式是這樣子的：

![](/resources/how-i-built-my-side-project/laravel-echo-flow.png)

最後的成果就像這樣：

![](/resources/how-i-built-my-side-project/ui-v1.png)

註：請不要吐槽我的命名，命名一直是我的弱點 Orz

## 再稍微聊聊主要的核心功能

這個專案的主要核心功能是這樣子的：當 CI 執行完佈署指令後，會通知監控程式在 S3 上追蹤各台主機的佈署狀態。這邊採用的技術有：

* [Laravel Queues](https://laravel.com/docs/5.7/queues)
* [Laravel Task Scheduling](https://laravel.com/docs/5.7/scheduling)
* [Laravel Filesystem](https://laravel.com/docs/5.7/filesystem)

我一直覺得 Laravel 在抽象化這部份做得實在太好了，像是拜 Laravel Filesystem 所賜，我可以把存取 storage 這部份抽象化後先在本地端測試，到時候想切換成 S3 的話只要改個設定就搞定了。

這部份的功能其實在 PoC 時就做得差不多了，但後來多加的一些判斷式讓我覺得它可以用 [Chain of Responsibility](https://www.sitepoint.com/introduction-to-chain-of-responsibility/) 這個模式來重寫它，大概像這樣子：

```php
AbstractStep::registerSteps([
    resolve(UpdateHostDeployStatuses::class),
    resolve(CheckDeployStatusTimeout::class),
    resolve(CheckHostDeployStatusCompleted::class),
    resolve(NotifyAllServices::class),
])->handle($this->deployStatus);
```

註：概念實作可以參考我的 [gist](https://gist.github.com/jaceju/a7267159ffd3b1c1785e40d28ff4e5b3) 。

這麼一來我的主要程式邏輯的架構就非常清晰，任何時候想要調整流程都非常容易，在後來要新增需求時證明這個設計是非常好的。

這裡要補充一下同事問我的問題：「這個設計看起來跟 Laravel Pipeline 很像，為什麼你不用它呢？」好問題，第一是 CoR 模式實現上也不困難，而且我保有自訂的彈性；第二我其實根本忘了有 Laravel Pipeline 這個機制 (畢竟沒有正式文件) 。但後來複習了一下 Laravel Pipeline 後，還是覺得就這個需求來說，我自己寫的比較好懂。

## 沒測試我不會寫程式

雖然擺到現在才講，但其實我的開發過程大致上都會以 TDD 和 BDD 的方式進行。而在這個專案的測試裡，我做了以下的部份：

* API schema 驗證
* 類別的單元測試
* 以實例來驗證規格

先來聊聊什麼是「 API schema 驗證」呢？換句話說就是你定義好了一個 RESTful API 的 schema 後，你預期 API 程式的輸出應該要符合這份 schema 。由於我是用 [API-Blueprint](https://apiblueprint.org/) 在制訂 API schema ，它可以很方便地將這些 schema 以 [Drafter](https://github.com/apiaryio/drafter) 轉換成 JSON 格式，再配合 Laravel 的 [HTTP Tests](https://laravel.com/docs/5.7/http-tests) 以及我自己開發的 [Unit Test Helper for API-Blueprint](https://github.com/goez-tools/apib-unit) ，就可以在測試裡自動驗證我的 API 程式輸出是否符合這些 schema 了。

至於類別的單元測試，我主要用在一些輔助用類別的測試，因為它們通常不會牽扯到資料庫或外部服務，很單純的就是一些計算邏輯；而這邊採用的就是 Laraval 的 [Testing](https://laravel.com/docs/5.7/testing) 機制，所以就不多提了。

最後我個人最有成就感的就是以實例來驗證規格這部份了，因為它就是真真正正的「活文件」。先來看看例子：

![](/resources/how-i-built-my-side-project/live-document.png)

是不是看起來很像規格文件，重要的是它的每個場景都是可以用程式自動去驗證的；這邊就是用 [Behat](http://behat.org/) 這個 BDD 工具來實作的，細節請參考拙作：

* [在 Laravel 中使用 Behat 來加強測試的可讀性 - 基礎篇](https://jaceju.net/behat-in-laravel/)
* [在 Laravel 中使用 Behat 來加強測試的可讀性 - 進階篇](https://jaceju.net/behat-in-laravel-advance/)

## 上線後才是挑戰

做到這邊，我就讓這個系統上線試用了，不然我也不知道它到底有沒有什麼我沒想到的問題。果然在上線不久，就陸陸續續地收到了一些反饋：

* 可否支援舊有的佈署機制？
* 可否更清楚的知道佈署過程？
* 可否在佈署前就自動建立行事曆活動？

### 如何支援舊有佈署機制？

在我們公司還是有一些舊專案在佈署後也需要觸發 SQA 的自動化測試，只是它們並沒有透過 CI 來做佈署，而是透過手動輸入指令來佈署；因此我的監控機制就必須提供一些方法來讓這些舊專案也支援。雖然我一開始也幫這類型專案做了跳過監控機制而直接通知 SQA CI 服務的設計，然而後來我們還是重新討論一些改善的做法，因此這部份也還在進行中。

### 如何更清楚的知道佈署過程？

在第一版的介面其實也只能看到佈署階段而已，無法瞭解每個階段的細節。所以我重新設計了後端事件，並做了事件的紀錄，然後把這些資訊在前端用時間軸的方式來呈現。而在重新設計介面時，我改用了以下的技術：

* [Vue-CLI 3](https://cli.vuejs.org/guide/)
* [Ant-Design-Vue](https://github.com/vueComponent/ant-design-vue)

Vue-CLI 整合到 Laravel 的方式可以參考 Vue 老爸尤雨溪寫的 [Using Vue CLI 3 with Laravel](https://github.com/yyx990803/laravel-vue-cli-3) 一例。

選用 Ant-Design-Vue 主要是它有很棒的 step 元件與 timeline 元件，剛好滿足我的需求。只是就在我把新介面做完快上線時，剛好遇到了 [Ant-Design 聖誕節彩蛋 (炸彈) 事件](https://github.com/ant-design/ant-design/issues/13848) ，差點沒讓我從椅子上跌下來；當下也只能自嘲還好這只是個 side project ，大家對它沒這麼敏感。

總之改善後的介面像這樣子：

![](/resources/how-i-built-my-side-project/ui-v2-1.png)

而且佈署細節也一目瞭然：

![](/resources/how-i-built-my-side-project/ui-v2-2.png)

### 如何在佈署前就自動建立行事曆活動

因為公司政策關係，我們內部在將主要專案佈署上線或調整線上設定時，通常需要建立一個 Goolge 行事曆活動，讓所有團隊對這些重要事件能一目瞭然。不過因為手動建立太麻煩了，所以我的部門主管一直很想把這段自動化，也就是在建立 Release Merge Request 時會自動建立活動，在專案佈署上線後將活動標示為結束。

在我們討論之後，我發現其實可以透過我的監控服務來完成這個自動化機制。我在監控服務上提供了一個 API ，讓 GitLab 可以在建立或更新 Merge Request 時透過 webhook 觸發；然後再透過 [Google Cloud Platform](https://cloud.google.com/) 提供的 Calendar API 來建立行事曆活動，在 Laravel 這裡有一個很方便的套件 [`spatie/laravel-google-calendar`](https://github.com/spatie/laravel-google-calendar) 可以幫我處理 Calendar API 上的串接。

## 為未來的你著想，寫點文件吧

近年來我一直很著重寫文件這件事，為的就是希望之後接手維護的人可以省點心，不必一開始就只能跳進程式裡去挖規格。雖然在 BDD 幫助下可以理解這個系統能做什麼，但有些非規格的資訊還是需要額外寫文件說明一下。在這個專案我也不想放棄這個堅持，所以我寫的文件包含這些資訊：

* 簡介與使用方式
* 如何整合 Google Calendar
* 正式環境環境設置
* 開發指南

![](/resources/how-i-built-my-side-project/doc.png)

這邊就用到了 [GitBook CLI](https://github.com/GitbookIO/gitbook-cli) 來幫我產生文件，並且放到 GitLab Pages 上。

另外也因為我是用 [API-Blueprint](https://apiblueprint.org/) 來撰寫 API 規格，所以 API 文件就可以透過 [Aglio](https://github.com/danielgtaylor/aglio) 這個工具來產生。成果就像這樣：

![](/resources/how-i-built-my-side-project/api.png)

當然文件的產生也是自動化的，這部份就是透過 GitLab CI 搭配以 Docker 執行的 runner 來產生。

註：更正一下，我們不是用 [Apiary](https://apiary.io/) 這個工具，雖然它也不錯用。

## 結論

感謝大家跟我一起很快地走過這個專案的建立過程，雖然它斷斷續續花了我快半年的時間。老實說我的記憶力也不是很強，像是在開發這個專案時，其實有很多技術我也記不清全貌，大多數細節還是要邊做邊查手冊；所以趁著現在記憶還鮮明時，趕緊把這個過程記錄下來，免得以後可能要寫書時就忘了自己曾經做過什麼了 (想太多) 。

而且各位大概可以發現其實我在這個專案上用的技術都很平常，基本上都是目前網站開發者都懂的東西。事實上就我個人的經驗，大多數專案的需求其實用不到什麼高深的技術，目前主流的開發工具或框架幾乎都可以滿足這些需求。所以不要看輕那些看起來不潮的工具，真正該磨練與精進的是其實是你自己如何去分析並解決問題的能力。

再總結一下整個歷程：

1. 確認需求真正到底要的是什麼。
2. 討論並提出有共識的方案。
3. 實驗並確認方案是可行的。
4. 開發初期版本並上線運行。
5. 收集反饋並持續改善。

最後我想說這個專案對我的意義是很大的，因為它解決了團隊的痛點，讓團隊可以不必分心在一些雜務上；所以我認為所謂的成就感，有時不見得是學會多新穎的技術，而是做出對別人來說是有意義的事情。

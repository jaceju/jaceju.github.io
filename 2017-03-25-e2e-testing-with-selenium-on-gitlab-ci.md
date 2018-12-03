title: 在 GitLab CI 上透過 Selenium 執行 e2e 測試
date: 2017-03-25 23:22:26
tags: ["測試","Selenium"]
---

前端程式的行為驗證以往一直是 Web 開發上的罩門之一，原因不外乎要花很多時間去確定每個瀏覽器都會按照你想的方式執行與呈現。所幸現在有 Selenium 這個工具可以讓我們把瀏覽器操作自動化，省下不少人工測試的時間。

然而 Selenium 環境的搭建一直是很多開發人員心中的痛，在之前寫過的[《在 Mac OS X 上搭建 Selenium 測試環境》](http://jaceju.net/2015-06-03-selenium-on-mac/)一文中就可看到我花了不少力氣在做這件事；但這還沒完，如果專案打算導入 CI (持續整合) 的話，要怎麼讓 Selenium 能在無視窗的 CI 環境下執行也是令人傷腦筋的。

所幸這一切將因為 [Docker](https://www.docker.com/) 這個工具的出現而變得非常簡單，所以接下來我將會介紹如何更輕鬆快速地搭建 Selenium 的測試環境。

<!-- more -->

## Selenium 原理

在搭建環境之前，我們還是要快速瞭解一下 Selenium 的原理。 Selenium 經過數個版本的演化，幾個核心名詞一直在改變，不過基本原理都是撰寫程式讓 Selenium 的伺服器轉譯成能操作瀏覽器的 JavaScript 指令，再發送到瀏覽器上執行。

在 Selenium 第一版時，主要的伺服器角色稱為 [Selenium RC](http://www.seleniumhq.org/docs/05_selenium_rc.jsp) 。這時候 Selenium 

而 [WebDriver](https://www.w3.org/TR/webdriver/) 的出現，讓 Selenium 的工作變得輕鬆。

各家瀏覽器都有實作相容於 WebDriver API 的 driver ，像是 [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/) 、 [FirefoxDriver](https://github.com/SeleniumHQ/selenium/wiki/FirefoxDriver) 、 [InternetExplorerDriver](https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver) 、 GhostDriver (給 PhantomJS 用) 、 [SafariDriver](https://github.com/SeleniumHQ/selenium/wiki/SafariDriver) 等。

### Hub



### Node

### Standalone

如果我們很單純只測試一種瀏覽器，能不能把 Hub 和 Node 同時放在一台機器上執行呢？答案就是在這台機器上執行 Standalone 就可以做到；也就是說，執行 Standalone 的機器同時擔任了 Hub 和 Node 兩個角色。

### 如何在沒有視窗的環境下執行 Selenium

一般來說

## 在 Docker 上執行 Selenium

下載 Docker (https://www.docker.com/get-docker) ，我下載的是 [for Mac 的社群版本](https://store.docker.com/editions/community/docker-ce-desktop-mac)。

我花了很多力氣在搭建環境上。不過現在用 Docker 之後，一切都省事多了。

在官方的 [`gitlab-ci-multi-runner`](https://gitlab.com/gitlab-org/gitlab-ci-multi-runner) 裡，這支 `executors/docker/executor_docker.go` 有定義以下的 container 掛載名稱轉換規則：

```
528:	linkName := strings.Replace(service, "/", "__", -1)
552:	containerName := s.Build.ProjectUniqueName() + "-" + strings.Replace(service, "/", "__", -1)
```

## 建立與設定 Vue.js 的 e2e 測試

## 加入 GitLab CI 設定




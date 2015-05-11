---
layout: post
title: "利用 GitHub 建立自己的 PEAR 頻道"
date: 2012-06-22 16:40
comments: true
tags: PHP
---

註：本文為投稿於 [OpenFoundry](http://www.openfoundry.org/) 之文章。

目前一些主流的語言都有提供所謂的套件管理機制，像是 Perl 的 [CPAN](http://www.cpan.org/) ， Ruby 的 [gem](http://rubygems.org/) ， Node.js 的 [npm](http://npmjs.org/) 等等。而它們都屬於集中式的管理，可以讓開發者上傳自己所開發的套件。

當然 PHP 也是有套件管理機制，那就是 [PEAR](http://pear.php.net) (PHP Extension and Application Repository) 。只是 PEAR 官方為了套件的品質，所以在審查機制上非常嚴格；這也使得開發者很難把自己的成果，藉由官方提供的管道來分享給其他人。

<!--more-->

雖然後來陸續有一些高手實作了某些方案，想要解決這個問題，但可惜都不了了之。

註：相關的資訊可以參考 [c9s](http://c9s.blogspot.tw/) 在 OSDC 的介紹： [OSDC.TW 2012 - The ecosystems of PHP and Perl](https://speakerdeck.com/u/c9s/p/osdctw-2012-the-ecosystems-of-php-and-perl) 。

在 PEAR 中，套件會被放在 PEAR Channel Server 上面，這個 Server 就像是套件的倉庫；例如 PEAR 官方的 PEAR Channel Server 就是 `pear.php.net` 。一個 Server 就是一個頻道 (Channel) ，這個頻道就是 `pear` 指令用來識別及取得套件來源的地方。

那麼除了官方的頻道外，我們能不能建立自己的 PEAR 頻道，以便管理自己開發的套件呢？當然是可以的，接下來本篇文章就要為大家介紹如何達到這個目的。

## 建立頻道

事實上所謂的 PEAR 頻道其實就是個網站，它必須要能存放套件的原始碼，並且提供套件的更新資訊。這些內容一般來說是靜態的，所以我們只需要有個網站空間就可以建立一個 PEAR 頻道。

這裡筆者選用 [GitHub](http://github.com) ，因為它可以用 `git` 讓我們方便管理，而且也不限制流量與空間；就我們的需求來說，是一個不錯的選擇。

### 建立 GitHub Repository

首先我們要到 [GitHub](http://github.com) 申請一個免費帳號，這裡筆者就不再詳述申請流程，請各位自行參考 GitHub 的網站。

接下來要建立一個 [Repository](https://github.com/new) ，名稱格式為 `[a-z0-9\-]+` (千萬不要包含底線，這樣 `pear` 指令會無法判讀) ，這裡筆者用 `pear` 作為範例。

![建立 GitHub Repository](/resources/github_pear/create_github_repository.png)

建立好之後，就可以用以下的 git 位址來存取：

    https://github.com/yourusername/pear

### 建立頻道內容

有了空間後，接下來就該建立頻道的內容了。只是頻道的內容該用什麼樣的格式？有沒有什麼方便的工具能幫我們處理這個問題呢？

答案當然是有的， [Pirum](http://pirum.sensiolabs.org/) 就是這樣的一個解決方案。

Pirum 是一個 PEAR Channel Server 管理工具，它可以幫我們建立與管理 PEAR 頻道內容，同時也能把套件加入頻道中。

它的安裝方式很簡單，直接使用 `pear` 指令安裝即可：

```bash
pear channel-discover pear.pirum-project.org
pear install pirum/Pirum
```

這樣一來我們就有一個 `pirum` 指令可以用了。

接下來在本機端建立一個目錄 (這裡筆者假設是 `/path/to/pear_repository` ) ，裡面放一個 `pirum.xml` 檔案：

```bash
mkdir /path/to/pear_repository
cd /path/to/pear_repository
vi pirum.xml
```

內容如下：

``` xml pirum.xml
<?xml version="1.0" encoding="UTF-8" ?>
<server>
    <name>yourusername.github.com/pear</name>
    <summary>My PEAR Channel</summary>
    <alias>yourusername</alias>
    <url>http://yourusername.github.com/pear</url>
</server>
```

其中 `name` 表示頻道完整名稱，一般就是頻道網站的位址 (但不包含 `http://` ) ； `summary` 則是頻道網站的標題； `alias` 是頻道別名，讓我們在用 `pear` 指令管理頻道時不需要輸入完整名稱；最後 `url` 則是讓使用者可以使用瀏覽器查看的頻道網址。

將 `pirum.xml` 存檔後，就可以用 `pirum` 指令來建立頻道內容。

```bash
pirum build .
```

如果一切正常的話，應該會出現：

```bash
Pirum 1.1.4 by Fabien Potencier
Available commands:
  pirum build target_dir
  pirum add target_dir Pirum-1.0.0.tgz
  pirum remove target_dir Pirum-1.0.0.tgz

Running the build command:
   INFO   Building channel.
   INFO   Building maintainers.
   INFO   Building categories.
   INFO   Building packages.
   INFO   Building composer repository.
   INFO   Building releases.
   INFO   Building index.
   INFO   Building feed.
   INFO   Updating PEAR server files.
   INFO   Command build run successfully.
```

現在我們可以利用 `git` 指令把這些內容送到我們前面建立好的 GitHub Repository 上面了：

```bash
git init
git remote add origin git@github.com:yourusername/pear.git
git add *
git commit -m 'init pear channel'
git branch gh-pages
git checkout gh-pages
git push -u origin master
git push -u origin gh-pages
```

特別要注意的是，遠端分支必須還要加上 `gh-pages` ，這樣 GitHub 才會把這些新增的檔案當做是網站內容。

稍等幾分鐘， GitHub 會幫我們把 `gh-pages` 的內容放到 `http://yourname.github.com/pear` 上。用瀏覽器打開這個網址，應該會出現以下畫面：

![PEAR 頻道內容](/resources/github_pear/pear_channel_site.png)

## 使用新建立的頻道

現在我們已經有了自己專屬的 PEAR 頻道，以下就來看看怎麼使用它。

### 加入新頻道

我們可以將頻道加到本機的 PEAR 中，用以下的指令就可以在 PEAR 上註冊我們剛剛建立的頻道：

```bash
pear channel-discover yourusername.github.com/pear
```

### 查看頻道中的套件

接著我們可以用以下的指令來查看這個頻道中有什麼套件：

```bash
pear remote-list -c yourusername
```

如果出現：

    (no packages available yet)

是正常的，因為我們還沒有加入任何套件。

註：執行 `pear` 指令時，如果有權限問題的話，可以加上 `sudo` 來執行。

### 更新頻道資訊

當遠端的頻道更新資訊時，要如何讓本地端知道呢？我們可以透過以下指令來更新：

```bash
pear channel-update yourusername
```

通常這個動作是在新增套件或更新套件前要先做的。

但如果 PEAR 中已經有很多頻道和套件，那麼一一手動更新太麻煩了，直接用以下指令就可以一次更新：

```bash
pear update-channels
pear upgrade-all
```

## 套件管理

有了頻道後，接下來就可以放套件放上去了。

跟建立頻道一樣，建立一個 PEAR 套件也是需要制式的設定檔；只是 PEAR 官方給的設定檔規格實在是太複雜了，一般開發者可能還沒寫完設定檔就會先放棄 PEAR 了。

有沒有什麼好工具可以協助我們呢？當然有！目前有兩套很強大也很方便的工具，分別是： [Phix](http://phix-project.org/) 及 [c9s](http://c9s.blogspot.tw/) 的 [Onion](https://github.com/c9s/Onion) 。

筆者強力推薦大家使用 Onion ，因為它的設定檔較為簡單便捷，而且還能處理佈署專案時的套件相依性；再加上作者是台灣人，有任何疑問都可以直接到 GitHub 上請教他。

註：原本筆者是使用 Phix 作為範例，不過有 c9s 的加持，筆者就改用 Onion 了；在這裡要特別感謝他。

### 建立套件架構

在 Onion 的說明檔裡已經提到如何製作 PEAR 套件了，這邊筆者僅做簡單的流程說明。

首先我們要先建立一個套件的存放路徑，這個路徑是任意的，這裡筆者用 `/path/to/first_package` 為例。

```bash
mkdir /path/to/first_package
```

接著在這個套件目錄下建立三個資料夾： `src` 、 `doc` 及 `tests` ，這三個資料夾是 Onion 最基本的要求。

```bash
cd /path/to/first_package
mkdir src
mkdir doc
mkdir tests
```

現在我們可以在 `src` 資料夾裡建立我們的套件內容，這裡筆者先假設我們的套件命名空間為 `FirstPackage` ，其中包含了一個 `FirstClass` 類別，它的路徑就是 `src/FirstPackage/FirstClass.php` 。

```bash
mkdir src/FirstPackage
vi src/FirstPackage/FirstClass.php
```

當然這裡示範的套件內容是比較簡單的，實作上我們可能還會有更多類別或命令列程式等。往後有機會的話，筆者會再另文介紹 PEAR 套件製作與測試的相關方法，在這之前大家可以先參考其他 PEAR 套件的原始碼。

### 用 Onion 包裝套件

接下來就是 Onion 最令人激賞的功能之一：利用簡單的 INI 設定檔來產生複雜的套件 XML 描述檔。

繼續在 `/path/to/first_package` 下建立一個 `package.ini` 檔：

```bash
vi package.ini
```

內容如下：

```ini
[package]
name = FirstPackage
desc = My First Package
version = 0.0.1
author = yourusername <yourusername@gmail.com>
channel = yourusername.github.com/pear
```

這是 Onion 所要求最小的設定，詳細的設定方式可以參考[官方說明](https://github.com/c9s/Onion/blob/master/README.md#a-more-detailed-example) 。

有了 `package.ini` 這個設定檔後，我們可以用以下指令來一次建立出套件的包裝檔：

```bash
onion build --pear
```

成功的話，就會在 `/path/to/first_package` 下得到一個 `FirstPackage-0.0.1.tgz` 套件檔，它就是我們要放到頻道供使用者下載的檔案。

### 將套件包裝檔加入頻道

接著我們就要用 Pirum 來將套件包裝檔加到頻道中，一樣在 `/path/to/first_package` 這個路徑下，執行以下指令：

```bash
pirum add /path/to/pear_repository FirstPackage-0.0.1.tgz
```

這樣一來 Pirum 會幫我們分析套件內容，將它加到頻道中，並且更新頻道中的相關資訊。

當然加入套件後，就得把更新的頻道內容上傳到 GitHub 上：

```bash
cd /path/to/pear_repository
git add *
git commit -m 'add first pacakge'
git push -u origin gh-pages
```

最後驗證一下套件是否上傳成功：

```bash
pear channel-update yourusername
pear remote-list -c yourusername
```

正確無誤的話，應該就會看到以下訊息了：

```bash
Channel yourusername Available packages:
==================================
Package      Version
FirstPackage -n/a-
```

現在就可以透過 `pear` 指令來線上安裝我們的套件：

```bash
pear install yourusername/FirstPackage-0.0.1
```

套件更新後也是相同的處理模式，請各位舉一反三自行實驗看看。

當然這裡還有很多細節沒有提到，這點就留待往後介紹如何開發 PEAR 套件時再介紹。

## 給頻道一個專屬網域

如果各位有自行管理的 DNS ，那麼我們可以讓自己的 PEAR 頻道有一個專屬的網域名稱。

假設我們已經有 `yourusername.com` 這個網域名，而我們希望用 `pear.yourusername.com` 這個網域名稱來指向我們的頻道。

第一步我們先在網域管理商的 DNS 管理畫面中新增一筆 `A` 記錄，主機名稱為 `pear` ， IP 則指向 `204.232.175.78` (參考自 [GitHub:Help - Setting up a custom domain with Pages](https://help.github.com/articles/setting-up-a-custom-domain-with-pages) ) 。

接著在 `/path/to/pear_repository` 下建立一個 `CNAME` 檔案，其內容如下：

    pear.yourusername.com

然後參考前面的做法，將新增的 `CNAME` 檔案用 `git` 指令推上 GitHub 。

接下來回頭修改 `/path/to/pear_repository/pirum.xml` ，將原來的 `yourusername.github.com/pear` 改成 `pear.yourusername.com` ：

``` xml pirum.xml
<?xml version="1.0" encoding="UTF-8" ?>
<server>
    <name>pear.yourusername.com</name>
    <summary>My PEAR Channel</summary>
    <alias>yourusername</alias>
    <url>http://pear.yourusername.com</url>
</server>
```

最後再重新執行一次前面的步驟即可。

視 DNS 更新的時間，大約一小時到一天後，頻道就可以用專屬網域名稱了。

## 結論

PEAR 在設計上或許沒有其他語言套件管理機制來得方便，但是利用 Pirum 及 Onion 可以幫我們處理掉大部份麻煩的事情。配合上 GitHub Pages 這個免費的網頁空間，我們就能夠方便建立出自己專屬的 PEAR 頻道。

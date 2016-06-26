---
layout: post
title: '初探 Zend_Search_Lucene'
date: 2011-8-18
wordpress_id: 1860
comments: true
tags: ["Zend Framework"]
---

全文檢索一直是內容型網站很重要的功能之一，它讓使用者可以快速透過一些關鍵字來找到網站中符合條件的文章。

在 Zend Framework 裡， Zend_Search_Lucene 就是提供這個功能的套件，它是以 [Apache Lucene](http://lucene.apache.org/java/docs/index.html) 專案為參考，而以 PHP 實作。

Zend_Search_Lucene 的說明在[官方手冊](http://framework.zend.com/manual/en/zend.search.lucene.html)中已經寫得很詳細，以下我會用較為簡明的方式來介紹重點。

<!--more-->

## 基本觀念

Zend_Search_Lucene 的幾個重點觀念如下：

* 建立及檢索索引時，都需要指定文字的 charset ；但套件核心是以 UTF-8 來處理索引。
* 建立及檢索索引時，可以自訂分析器來處理中文分詞。
* 以檔案方式來存放索引，索引必須先建立才可以使用。
* 索引只存放需要被顯示的內容或可以檢索的關鍵字，而不是存放所有內容。
* 索引是以 document 為單位，搜索的結果也是以文件集來呈現。
* 文件來源可以是文字檔案或資料庫中的內容。
* 每個文件可以包含多個 fields ，用以顯示或被檢索。
* 必要的 field 有 id 、 score 及 content ，其中 id 與 score 會自動產生。
* 可以用特別的 query 語法或是 query API 來找出需要的資訊。
* 找出來的資訊稱為 query hit ，可以用來顯示搜尋結果。

## 基本流程

### 建立索引

* 設定分詞分析器 (如果是英文文件則非必要) 。
* 初始化索引，這裡是建立索引相關檔案。
* 建立索引文件 (document) ，可以從 HTML 內容或檔案來產生索引文件，或是直接建立一個空的索引文件。
* 將可以被檢索的資訊一一加到 document 的 field 中，通常也會把連結或路徑等資訊加到 field 中，這樣在輸出時就可以取得。
* 提交索引以完成建立的動作。

### 檢索索引

* 設定分詞分析器 (如果是英文文件則非必要) 。
* 初始化索引，這裡是打開索引相關檔案。
* 解析使用者給定的查詢字串或關鍵字，以產生必要的 query 物件。
* 從索引中找出 query 物件所對應的 query hit 資訊；每個 hit 的屬性，就會對應到 document 的 field ，可以用來顯示。
* 以迴圈顯示全部的 hit 資訊，就可以讓使用者看到搜尋結果了。

## 範例
接下來我們來看看一個簡單的範例：「 HTML 檔案檢索系統」，完整的程式碼可以在 [GitHub](https://github.com/jaceju/zend_search_lucene_test) 上找到。

### 程式架構
先來看看它的程式架構：

```
search
├── html ; 存放 HTML 檔案
├── include
│   └── Phpbean
│       └── Lucene
│           └── Analyzer.php ; Phpbean_Lucene_Analyzer 類別
├── index ; 存放索引檔案
├── init.php ; 程式初始化引用檔
├── build_index.php ; 建立索引
├── find.php ; 搜尋索引
├── index.php ; 主要介面
├── jquery.js ; jQuery
└── lucene.js ; Ajax 程式
```

請在 html 目錄下放置幾個你想搜尋的 HTML 檔案 (可以從 Yahoo 新聞中轉存幾則下來試用) ，然後將 index 目錄設定為 WWW 權限可寫入。

### 初始化應用程式

接著我們需要初始化應用程式，這邊是由 `init.php` 負責：

```php
<?php
// 設定載入路徑
set_include_path(join(PATH_SEPARATOR, array(
    realpath(__DIR__ . '/include'),
    get_include_path(), // 要包含 Zend Framework 的所在路徑
)));

// 設定自動載入
require_once 'Zend/Loader/Autoloader.php';

Zend_Loader_Autoloader::getInstance()->setFallbackAutoloader(true);

// 設定處理的字元編碼
setlocale(LC_ALL, 'zh_TW.UTF-8');

// 指定路徑
$indexDir = realpath(__DIR__ . '/index');
$htmlDir = realpath(__DIR__ . '/html');

// 設定預設的分詞分析器
Zend_Search_Lucene_Analysis_Analyzer::setDefault(new Phpbean_Lucene_Analyzer());
```

這裡有個很重要的部份，就是設定預設的中文分詞分析器，因為它會影響如何在索引中建立正確的中文分詞關鍵字。

在網路上搜尋 Zend_Search_Lucene 加上中文分詞的話，大概都可以找到一個 Phpbean_Lucene_Analyzer 的 PHP 類別，其完整內容請參考 [Phpbean/Lucene/Analyzer.php](https://github.com/jaceju/zend_search_lucene_test/blob/master/include/Phpbean/Lucene/Analyzer.php) (內容太長就不直接列出了) 。
它的三個方法說明如下：

* setCnStopWords() - 設定中文詞組斷字，基本上很少會去使用這個方法。
* reset() - 重置被檢索的文件內容，也就是把一些常見的斷字換成空格字元。
* nextToken() - 包含關鍵的中文分詞演算法，告訴檢索程式如何去找到下一個 token 。

在建立索引前，我們就用以下程式碼來設定預設的分詞分析器：

```php
Zend_Search_Lucene_Analysis_Analyzer::setDefault(new Phpbean_Lucene_Analyzer());
```

註：詳細的中文分詞原理可以在 Google 上找到很多資料。

### 建立索引

現在我們要撰寫建立索引的程式碼，這裡是由 `build_index.php` 來負責：

```php
<?php
// 初始化
require __DIR__ . '/init.php';

// 在索引目錄中建立索引相關檔案
$index = Zend_Search_Lucene::create($indexDir);

// 取得要建立索引的 HTML 檔案所在路徑
$iterator = new DirectoryIterator($htmlDir);

// 一一為 HTML 檔案建立索引
foreach ($iterator as $entry) {
    /* @var $entry DirectoryIterator */
    if ($entry->isFile()) {
        $file = $entry->getPath() . '/' . $entry->getFilename();
        echo $file, "\n";
        // 載入 HTML 檔案，並產生索引文件
        $doc = Zend_Search_Lucene_Document_Html::loadHTMLFile($file);
        // 加入檔案名稱欄位，但不加入索引 (僅儲存值)
        $doc->addField(Zend_Search_Lucene_Field::unIndexed('filename', $entry->getFilename(), 'utf-8'));
        // 加入建立時間欄位，但不加入索引 (僅儲存值)
        $doc->addField(Zend_Search_Lucene_Field::unIndexed('created', time(), 'utf-8'));
        // 加入更新時間欄位，但不加入索引 (僅儲存值)
        $doc->addField(Zend_Search_Lucene_Field::unIndexed('updated', time(), 'utf-8'));
        // 加入內容欄位，但不儲存 (僅加入索引)
        $doc->addField(Zend_Search_Lucene_Field::unStored('content', $doc->getHtmlBody(), 'utf-8'));
        // 將索引文件加入索引檔案中
        $index->addDocument($doc);
    }
}

// 完成索引的建立
$index->commit();
```

`build_index.php` 執行的方式，是在 command line 模式下，輸入以下指令：

```
php build.php
```

這樣一來就可以將索引建立好了。

建立索引時有幾點要注意：

* 資料來源不見得一定要是 HTML 檔案，也可以直接從資料庫中取得。
* 索引欄位 (field) 有分以下幾種：
  * Keyword - 會加入索引並儲存其內容，但不會被分析，而是直接用來做關鍵字。
  * UnIndexed - 不加入索引，但會儲存其內容，所以會在搜尋結果中出現。
  * Binary - 不加入索引，也不會被分析，但會儲存其內容，所以會在搜尋結果中出現。
  * Text - 會加入索引，也會儲存其內容，而且會被分析器分析；一般是用來顯示搜尋的結果，例如摘要。
  * UnStored - 會加入索引，也會被分析器分析，但不儲存其內容；通常是用來處理文章主體 (內容較長的部份) 。

* 最後一定要做 commit 動作，讓建立索引的動作能正確結束。

### 搜尋索引

索引建立完成後，就可以用來搜尋了，這邊是由 find.php 來處理：

```php
<?php
// 初始化
require __DIR__ . '/init.php';

// 打開索引檔案
$index = Zend_Search_Lucene::open($indexDir);

// 取得關鍵字
$keyword = $_GET['keyword'];

// 從關鍵字中建立 query 物件
$query = Zend_Search_Lucene_Search_QueryParser::parse($keyword, 'utf-8');

// 搜尋索引
$hits = $index->find($query);

// 如果有找到對應的資訊，就加到結果集中
$result = array();
foreach ($hits as $hit) {
    $result[] = array(
        'id' => $hit->id,
        'score' => $hit->score,
        'title' => $hit->title,
        'filename' => $hit->filename,
        'created' => $hit->created,
        'updated' => $hit->updated,
    );
}

// 以 JSON 格式輸出結果
echo json_encode($result);
```

`find.php` 在找到我們所需要的資訊後，會將它以 JSON 格式輸出。

### 介面

這裡我用了很簡單的搜尋介面，也就是 index.php ：

```php
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Zend_Search_Lucene Test</title>
    </head>
    <body>
        <form action="find.php" method="get">
            <label>關鍵字： <input type="text" name="keyword" value="" /></label>
            <input type="submit" value="查詢" />
        </form>
        <div id="result"></div>
        <script src="jquery.js"></script>
        <script src="lucene.js"></script>
    </body>
</html>
```

而 JavaScript 的部份則用上了 jQuery ，處理表單 AJAX 則是由 `lucene.js` 負責：

```js
(function ($) {
    $(function () {
        $('form').submit(function (e) {
            $result = $('#result');
            $result.html('');
            $.getJSON(
                'find.php',
                $(this).serializeArray(),
                function (json) {
                    var html = '<ul>';
                    for (var i = 0; i < json.length; i ++) {
                        html += '<li><a href="html/';
                        html += json[i].filename + '">';
                        html += json[i].id + ' - ';
                        html += json[i].score + ' - ';
                        html += json[i].title + '</a></li>';
                    }
                    html += '</ul>';
                    $result.html(html);
                }
            );
            e.preventDefault();
        });
    });
})(jQuery);
```

測試時，請直接在畫面上的關鍵字欄位中輸入想要查詢的內容，再按下搜尋即可。

希望這樣的介紹能讓大家大致瞭解全文檢索初步的觀念與實作，詳細的資訊就請參考[官方手冊的 Zend_Search_Lucene 的套件介紹](http://framework.zend.com/manual/en/zend.search.lucene.html)。

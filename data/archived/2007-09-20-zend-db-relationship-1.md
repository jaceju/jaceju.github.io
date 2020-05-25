---
layout: post
title: '初探 Zend_Db_Table Relationships (一)'
date: 2007-9-20
wordpress_id: 261
comments: true
tags: ["Zend Framework"]
---

早上四點半就醒了...睡不著，想說研究一下 Zend Framework DB 一對多的關連。先前一直搞不定其中的關係，沒想到簡單玩了一下，竟然就搞定了 (可見手冊我根本就沒看懂...Orz) 。

這裡記一下，以免之後又忘記了。

<!--more-->

## 資料表範例

這裡我用文章 (Article) 及文章分類 (Category) 來做為例子，它們的 DB Schema 如下：

```
CREATE TABLE IF NOT EXISTS `articles` (
 `id` int(10) unsigned NOT NULL auto_increment,
 `category_id` int(10) unsigned NOT NULL,
 `title` varchar(200) NOT NULL,
 PRIMARY KEY  (`id`),
 KEY `category_id` (`category_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;
INSERT INTO `articles` (`id`, `category_id`, `title`) VALUES
(1, 3, 'Zend_Db_Table'),
(2, 3, 'Zend_Controller_Action'),
(3, 2, 'jQuery'),
(4, 2, 'Prototype');
CREATE TABLE IF NOT EXISTS `categories` (
 `id` int(10) unsigned NOT NULL auto_increment,
 `parent_id` int(10) unsigned NULL,
 `name` varchar(200) NOT NULL,
 PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;
INSERT INTO `categories` (`id`, `parent_id`, `name`) VALUES
(1, NULL, 'PHP'),
(2, NULL, 'JavaScript'),
(3, 1, 'Zend Framework');

```

其中 articles.category_id 對應到 categories.id ，而 categories.parent_id 也對應到自己的 categories.id 。

## 程式碼架構

這裡主要我是拿 [Rob](http://akrabat.com/) 的 [Getting Started with the Zend Framework](http://akrabat.com/zend-framework-tutorial/) 裡面範例來修改，詳細架構就先看看後面附的下載檔。

不過也不一定需要用這樣的架構才能跑 ZF ，這是因為我偷懶不想寫太多不相關的程式，所以直接拿別人的來改。事實上我們可以把 Zend_Db 獨立出來使用，只是這樣要寫的東西就會比較複雜一點點，跟我要研究的東西無關。

## 範例下載

[下載位置](/resources/zf_table/example1.zip)

註：裡面沒包 Zend Framework ，請自行到[官方網站](http://framework.zend.com/)下載，然後把 library 目錄解開放到範例資料夾下即可。

## 說明

首先我們需要兩個繼承 Zend_Db_Table_Abstract 的 Class ，它們分別是 Articles 和 Categories ：

```
class Articles extends Zend_Db_Table_Abstract
{
    protected $_name = 'articles';
}
class Categories extends Zend_Db_Table_Abstract
{
    protected $_name = 'categories';
}

```

因為大部份工作已經被 Zend_Db_Table_Abstract 做掉了，所以 Articles 和 Categories 只要很簡單的指定 $_name 屬性即可；這樣一來， Articles 和 Categories 兩個 Classes 就能對應到 articles 和 categories 兩個資料表。

不過這樣還沒有辦法讓這兩個資料表在程式碼裡產生關連，我們必須在  Articles 和 Categories 這兩個 Classes 額外定義一些資訊，讓它們能互相認識。首先我們在 Articles Class 裡加上 $_referenceMap 屬性：

```
class Articles extends Zend_Db_Table_Abstract
{
    protected $_name = 'articles';

    protected $_referenceMap = array(
        'Category' => array( // 給這個關連一個名字
            'columns' => 'category_id', // 對應到 articles.category_id
            'refTableClass' => 'Categories',  // 對應到 Categories Class
            'refColumns' => 'id', // 對應到 categories.id
        ),
    );
}

```

$_referenceMap 屬性是用來宣告要透過哪個欄位來和另一個資料表做關連，就上面的例子來看，我們可以很清楚的看到是 articles.category_id 關連到 categories.id 。然而 $_referenceMap 屬性可以同時定義多組關連，但為了簡化以便於理解，這裡我只用了一組。

在這裡的 $_referenceMap 屬性裡主要有三個項目：

* columns ：表示目前資料表關連到另一個資料表的欄位，一般就是 Foreign Key (FK) 。
* refTableClass ：關連資料表所對應的 Class ，這裡要注意大小寫。
* refColumns ：關連資料表所對應的欄位，一般就是 Primary Key (PK) 。


註： $_referenceMap 其實還有其他可設定的項目，這裡暫不介紹。

接著 Categories 這個 Class 也必須定義一個 $_dependentTables 屬性，宣告與 categories 有關連的資料表名稱；這是為了保證我們在透過 Categories Class 刪除資料時，能一併刪掉關連資料表裡的資料 (這裡我還在研究，尚無實例) 。

```
class Categories extends Zend_Db_Table_Abstract
{
    protected $_name = 'categories';

    protected $_dependentTables = array('Articles');  // 對應到關連的 Table Class
}

```

註：事實上 $_dependentTables 屬性在目前這個例子裡可以不加，因為我們還用不到關連更新或刪除的功能。

現在我們可以在 IndexController::indexAction 裡測試看看：

```
class IndexController extends Zend_Controller_Action
{
    function indexAction()
    {
        $categories = new Categories();

        $zendframework = $categories->find(3)->current();
        $this->view->articles = $zendframework->findDependentRowset('Articles');
    }
}

```

其中 findDependentRowset 是 Zend_Db_Table_Abstract 提供的方法，它可以幫我們找出關連資料表的所有資料。我們在 index.pthml 裡可以將取得的結果表列出來：

```
<?php
var_dump($this->articles->toArray());
?>

```

是不是很簡單呢？

那麼第二個問題來了，如果我們要讓 categories._parent_id 和 categories.id 產生關連呢？

其實仿照上面的做法，我們只需要在 Categories Class 裡動手腳即可：

```
class Categories extends Zend_Db_Table_Abstract
{
    protected $_name = 'categories';

    protected $_referenceMap    = array(
        'ParentCategory' => array(
            'columns' => 'parent_id', // 對應到 categories.parent_id
            'refTableClass' => 'Categories', // 對應到 Categories Class
            'refColumns' => 'id', // 對應到 categories.id
        ),
    );

    protected $_dependentTables = array('Articles', 'Categories'); // 對應到關連的 Table Class
}

```

也就是說，我們在 Categories Class 加入一個 $_referenceMap 屬性關連到自己，然後在  $_dependentTables 加入自己。

接著在 IndexController::indexAction 中測試一下：

```
class IndexController extends Zend_Controller_Action
{
    function indexAction()
    {
        $categories = new Categories();

        $php = $categories->find(1)->current();$this->view->subcategories = $php->findDependentRowset('Categories');

        $zendframework = $categories->find(3)->current();
        $this->view->articles = $zendframework->findDependentRowset('Articles');
    }
}

```

在 index.phtml 裡顯示結果：

```
<?php
var_dump($this->subcategories->toArray());
?>

```

以上就是簡單的 Zend_Db_Table_Actract 一對多關連取得資料集的方式，謝謝收看，下次見。 (補眠去...什麼？已經天亮要上班了喔？)

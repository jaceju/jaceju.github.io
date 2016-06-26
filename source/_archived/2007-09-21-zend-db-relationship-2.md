---
layout: post
title: '初探 Zend_Db_Table Relationships (二)'
date: 2007-9-21
wordpress_id: 263
comments: true
tags: ["Zend Framework"]
---

[前一篇文章](http://www.jaceju.net/blog/archives/261)提到了簡單的 Zend_Db_Table 的一對多關連，這次來談一對一 (多對一) 和多對多。

不過我對一對一的定義比較模糊，詳細的資訊請參考[良葛格的 Hibernate 學習筆記](http://caterpillar.onlyfun.net/Gossip/HibernateGossip/HibernateGossip.html)：

* [一對一（唯一外鍵關聯）](http://caterpillar.onlyfun.net/Gossip/HibernateGossip/OneToOneUniqueFK.html)
* [一對一（主鍵關聯）](http://caterpillar.onlyfun.net/Gossip/HibernateGossip/OneToOnePK.html)
* [多對多](http://caterpillar.onlyfun.net/Gossip/HibernateGossip/ManyToMany.html)


<!--more-->

## 資料表範例

基本上還是前一篇文章的範例，這次加上標籤 (Tag) ；每篇文章 (Article) 可以標上多個標籤，而每個標籤則是可以對應到多篇文章。新增的資料表結構如下： 

```
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;
INSERT INTO `tags` (`id`, `name`) VALUES
(1, 'php'),
(2, 'zend framework');
CREATE TABLE IF NOT EXISTS `articles_tags` (
  `article_id` int(10) unsigned NOT NULL default '0',
  `tag_id` int(10) unsigned NOT NULL default '0',
  PRIMARY KEY  (`article_id`,`tag_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
INSERT INTO `articles_tags` (`article_id`, `tag_id`) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2);

```

其中我們多了一個中間表 articles_tags ，然後在邏輯上 articles.id 會關連到 articles_tags.article_id ，而 tags.id 則對應到  articles_tags.tag_id 。在 articles_tags 中， article_id 和 tag_id 為組合主鍵。

## 範例下載 

[下載位置](/resources/zf_table/example2.zip)

註：一樣沒包 Zend Framework ，請自行下載安裝。 

## 說明

### 一對一 (多對一) 

首先我們先來看看如何如何從文章中抓取對應的分類，從一篇文章上只會找到一個分類，也就是一對一關連。

註：其實嚴格來說文章對分類不是一對一的關係 (應該是多對一) ，只是在 Zend_Db_Table 裡，它們的作法是相似的。

然而一對多和多對一只是兩個相關的對應關係，因此我們並不用修改原來的 Articles 和 Categories 兩個 Classes 。在 Zend_Db_Table_Row 中，提供了一個 findParentRow 方法，讓我們能從 Articles 反推回去找到 Categories ；也就是在 IndexController::index 中，我們只要這樣做：

```
$phpArticle = $articles->find(2)->current();
$this->view->category = $phpArticle->findParentRow('Categories');

```

這裡會抓取 articles.id 等於 2 的文章，然後透過 findParentRow 來向 Categories 取得對應的分類。另外 Zend_Db_Table_Row 也提供了一個魔術方法，只要用 findParent<ParentClass> 就可以達到同樣的效果，例如：

```
$this->view->category = $phpArticle->findParentCategories();

```

然後我們就可以在 index.phtml 顯示相關的分類了：

```
<?php
var_dump($this->category->toArray());
?>

```

### 多對多 

文章和標籤是以多對多的關係存在的，所以我們要先加入兩個 Classes ，一個是 Tags ，另一個是 ArticlesTags ；它們分別對應 tags 和 articles_tags 兩個資料表：

```
class Tags extends Zend_Db_Table_Abstract
{
    protected $_name = 'tags';
}
class ArticlesTags extends Zend_Db_Table_Abstract
{
    protected $_name = 'articles_tags';
    protected $_referenceMap = array(
        'Tag' => array(
            'columns'=> array('tag_id'),
            'refTableClass' => 'Tags',
            'refColumns' => 'id',
        ),
        'Article' => array(
            'columns' => array('article_id'),
            'refTableClass' => 'Articles',
            'refColumns' => 'id',
        ),
    );
}

```

註：這裡暫時不考慮 $_dependentTables 屬性，後面有用到再加。 

在 ArticlesTags 這個 Class 的 $_referenceMap 屬性裡，我定義了兩個 Rule ，一個為 Tag 、另一個為 Article ；它們分別關連到 Tags 和 Articles 這兩個 Classes 。

在 Zend_Db_Table_Row 裡提供了一個 findManyToManyRowset 的方法，可以協助我們處理多對多的關係。我們沿續第一個例子，假設現在我們想知道該篇文章所對應的標籤有哪些，可以這樣寫：

```
$this->view->articleTags = $phpArticle->findManyToManyRowset('Tags', 'ArticlesTags', 'Article');

```

在 findManyToManyRowset 方法裡一般會用到三個參數，第一個參數表示<strong>要關連的資料表 Class</strong> ，第二個參數則是<strong>中間表所對應的 Class</strong> ，而第三個<strong>為 Rule 的名稱</strong>。而要特別注意的是， Rule 所對應的 refTableClass 要和 findManyToManyRowset 方法所在的物件其對應的資料表一樣。可以對照一下上面 $phpArticle 物件所對應的資料表和最後一個參數值 Article 所對應的資料表，這樣就很容易理解了。

最後一樣在 index.phtml 裡顯示結果： 

```
<?php
var_dump($this->articleTags->toArray());
?>

```

當然反過來要從標籤去取得文章也就很簡單了，只要抓出目前的標籤，然後再利用 findManyToManyRowset 方法來取得關連的文章就可以了 (提示： Rule 要用 Tag) 。 

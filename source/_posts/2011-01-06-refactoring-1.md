---
layout: post
title: '重構實例介紹 – 分析篇'
date: 2011-1-6
wordpress_id: 1495
comments: true
tags: ["Refactoring"]
---

重構是什麼？這問題其實真的很難回答。

我個人覺得重構是一種讓程式保持活力的一種方法，讓它能隨著時間而不斷地進化。如果我們一直放任自己不對程式碼做適當的整理，而是靠著不求甚解的修修補補來維繫它的生命，很快地程式碼就會變得殘破不堪、臃腫肥大而難以維護。

而且有的時候，我們也想讓程式碼能隨著我們觀念的增長，以適應未來的變化；今天我們會覺得這樣的寫法很讚，但明天可能又會學到更好的寫法，重構就能給我們改變程式碼的機會。

但是這些都是很籠統的解釋，有沒有什麼方法可以讓我們更瞭解重構呢？我想，只有用實際的例子來說明是最直接的吧。但是太精簡的範例可能表達不了重構的意圖，而過於複雜的範例又會讓重構的焦點模糊，要找到一個適合的例子可能比重構本身還困難。

後來某次的改版機會下，我分析了伙伴之前所製作的功能並做了一次重構，發現這個功能的規模不算太大，而且也很容易展現出重構後的優點；因此，我便將這個功能稍微做了簡化以方便說明，希望能讓大家瞭解重構究竟是在做些什麼。

不過這個範例雖然不大，但也還是需要一番功夫來解說；因此我將會把它分成兩個部份來說明，第一篇是分析，第二篇則是實戰。

接下來就一起來看看這個例子吧。

<!--more-->

## 需求說明

這是一個裝修問卷的需求，基本上是在收集客戶想要幫房子裝修的資訊，要注意的重點如下：

* 裝修類型是指常見的房屋裝修重點，例如廚房、浴室或地板等。
* 裝修類型包含了客戶基本資訊以及裝修內容。
* 一個裝修問卷只會對應一種裝修類型，同時也只記錄一位客戶。
* 裝修內容則包含裝修類型裡會需要裝修的項目，像是廚房會需要換裝瓦斯爐、上下櫃等。
* 隨著裝修類型的不同，裝修內容也會不同。
* 未來會陸續新增裝修類型，因此裝修的內容也會有所變動。

以下是這個需求所提供的樣板，表單頁：

<a href="/resources/refactoring/form-template.png"><img class="image" src="/resources/refactoring/form-template.png" alt="裝修內容表單" /></a>

完成頁：

<a href="/resources/refactoring/ok-template.png"><img class="image" src="/resources/refactoring/ok-template.png" alt="完成填寫畫面" /></a>

在伙伴的努力下，現在這個功能已經達到客戶的需求並上線一段時間了，維護也都是交由伙伴自己來進行；但在某次系統改版時，為了能對系統做出整體改版計劃，所以我得瞭解這個功能細部的狀況。

以下就讓我們一起來從這個完成後的版本開始看起吧。

註：你可以在我的 GitHub 上找到[完整的程式碼](https://github.com/jaceju/refactoring_sample)。

## 程式解說

在重構之前，一定要先瞭解我們即將要重構的程式碼。如果完全不曉得它是做什麼的，那麼重構就會存在著一定的風險。

由於我們是採用 Zend Framework 來建置這個專案，因此程式將分成 Controller 、 View 及 Model 三個部份。以下我們先對它們的作用一一說明，然後再分析它們為何需要重構。

### Controller

Controller 的部份主要只有 IndexController 這個類別：

```php
[/refactoring_sample/application/controllers/IndexController.php]
class IndexController extends Zend_Controller_Action
{
    // ...
}

```

它包含了 index 、 step2 及 step3 三個 action ，也是本功能主要的流程。

indexAction() 方法只是單純地顯示連結用的 template 而已，沒有實作任何程式碼。

```php
    public function indexAction()
    {
    }
```

step2Action() 方法負責表單的顯示與處理表單回傳的資料。這裡我們會先接收 decoration 參數，以決定要後面的程式要處理的裝修類型。

接著再透過 Request 物件的 isPost() 方法，來判斷是否是 PostBack 。如果是 PostBack 的話就先檢查表單資料，正確就寫入資料表，反之則顯示錯誤訊息。

註：這裡為了減少篇幅，故省略掉了找不到裝修類型的錯誤判斷。

```php
    public function step2Action()
    {
        $decorationName = strtolower($this->getRequest()->getParam('decoration'));
        $error = false;
        $messenger = $this->_helper->flashMessenger;
        /* @var $messenger Zend_Controller_Action_Helper_FlashMessenger */
        if ($this->getRequest()->isPost()) {
            $filter = new Zend_Filter_StripTags();
            $callback = array($filter, 'filter');
            $formData = array_map($callback, $this->getRequest()->getPost());
            $formData = array_map('trim', $formData);
            // 檢查表單必填值
            $checkFunctionName = '_check' . ucwords(strtolower($decorationName)) . 'FormData';
            $this->$checkFunctionName($formData, $error, $messenger);
            if (!$error) {
                $decorationTable = $this->_createDecorationTable($decorationName);
                $decorationRow = $decorationTable->createRow($formData);
                $decorationRow->save();
                $this->_helper->redirector->gotoSimple('step3', null, null, array(
                    'decoration' => $decorationName,
                    'id' => $decorationRow->id,
                ));
            } else {
                $params = array(
                    'decoration' => $decorationName,
                );
                $this->_helper->redirector->gotoSimple('step2', null, null, $params);
            }
        }
        $this->view->decorationName = $decorationName;
        $this->view->decorationDisplayName =
                $this->_decorationDisplayNameList[strtolower($decorationName)];
        $this->view->messages = $messenger->getMessages();
    }
```

而且因為我們已經知道裝修類型會隨著時間而增多，因此伙伴在撰寫程式時，已經考慮兩個可能會變化的部份。

第一個是在檢查表單內容的部份；在 step2Action() 方法接收了表單資料後，我們透過參數取得的裝修類型名稱來決定要呼叫哪個檢查方法。但因為目前我們只有 kitchen 這個裝修類型，所以在 IndexController 類別中只有 _checkKitchenFormData() 這個方法。

```php
    public function step2Action()
    {
       // ...
            $checkFunctionName = '_check' . ucwords(strtolower($decorationName)) . 'FormData';
            $this->$checkFunctionName($formData, $error, $messenger);
       // ...
    }
    protected function _checkKitchenFormData($formData, &amp;$error, Zend_Controller_Action_Helper_FlashMessenger &amp;$messenger)
    {
        if (0 === strlen($formData['name'])) {
            $error = true;
            $messenger->addMessage('請輸入姓名');
        }
        if (0 === strlen($formData['phone'])) {
            $error = true;
            $messenger->addMessage('請輸入電話');
        }
        if (0 === strlen($formData['address'])) {
            $error = true;
            $messenger->addMessage('請輸入地址');
        }
        if (!array_key_exists('kitchenQuestion01', $formData)
                &amp;&amp; !array_key_exists('kitchenQuestion02', $formData)) {
            $error = true;
            $messenger->addMessage('請選擇裝修內容');
        }
        if (!array_key_exists('kitchenQuestion03', $formData)
                &amp;&amp; !array_key_exists('kitchenQuestion04', $formData)) {
            $error = true;
            $messenger->addMessage('請選擇設備是否保留');
        }
        if (!array_key_exists('kitchenQuestion05', $formData)) {
            $error = true;
            $messenger->addMessage('請選擇現有廚具');
        }
    }

```

另一個是建立資料表的部份，這裡是透過 _createDecorationTable() 這個方法來動態決定要使用哪個資料表，也就是一般常見的工廠方法。

```php
    protected function _createDecorationTable($decorationName)
    {
        $tableName = 'Application_Model_DbTable_Decoration' . ucfirst($decorationName) . 's';
        return new $tableName();
    }
    public function step2Action()
    {
        // ...
        $decorationTable = $this->_createDecorationTable($decorationName);
        // ...
    }

```

step3Action() 方法則是用來顯示完成後的頁面。這裡首先會取得 step2Action() 方法新增的自動編號，然後才從資料表裡取得對應的問卷資料來顯示。

```php
    public function step3Action()
    {
        $decorationName = strtolower($this->getRequest()->getParam('decoration'));
        $decorationId = (int) $this->getRequest()->getParam('id');
        $decorationTable = $this->_createDecorationTable($decorationName);
        $decorationRow = $decorationTable->find($decorationId)->current();
        if (!$decorationRow) {
            $this->_redirect('/');
        }
        $this->view->decorationName = $decorationName;
        $this->view->decorationDisplayName =
                $this->_decorationDisplayNameList[strtolower($decorationName)];
        $this->view->decorationRow = $decorationRow;
        $this->view->decorationMap = $this->_exportMapData($decorationName);
        $this->view->actionController = $this;
    }

```

與 step2Action() 方法相同，在 step3Action() 方法也呼叫了 _createDecorationTable() 方法來動態取得對應的資料表，接著再透過 id 參數取得在 step2Action() 方法新增的資料列。

因為存在資料表裡的資料並不包含中文訊息，因此我們需要將它做轉換。這個動作原本是可以在樣版裡做的，但為了不在樣版裡有太多的判斷式，因此採用了名稱對照表的方法。

_exportMapData() 方法會從 application/controllers/DecorationMap 資料夾下載入對應的名稱對照表 (即 kitchen.php) ，然後將它 assign 到 view 的 decorationMap 變數。

```php
    protected function _exportMapData($decorationName)
    {
        $includeFile = __DIR__ . '/DecorationMap/' . $decorationName . '.php';
        if (!file_exists($includeFile)) {
            $this->_redirect('/');
        } else {
            $decorationMap = include($includeFile);
            return $decorationMap;
        }
    }

```

名稱對照表內容如下：

```php
[/refactoring_sample/application/controllers/DecorationMap/kitchen.php]
return array(
    'kitchenQuestion01' => array(
        'y' => '吊櫃',
        'n' => '',
    ),
    'kitchenQuestion02' => array(
        'y' => '下櫃',
        'n' => '',
    ),
    'kitchenQuestion03' => array(
        'y' => '瓦斯爐',
        'n' => '',
    ),
    'kitchenQuestion04' => array(
        'y' => '排油煙機',
        'n' => '',
    ),
    'kitchenQuestion05' => array(
        '1' => '無',
        '2' => '泥作',
        '3' => '組合式',
        '4' => '歐化',
        '5' => '不鏽鋼',
    ),
);

```

另外 IndexController 類別裡也定義了一個 $_decorationDisplayNameList 屬性，它的目的是存放 decoration 參數所對應的中文名稱。因此在 step2Action() 方法及 step3Action() 方法中都會先找出裝修類型所對應的中文名稱，再 assign 到 view 的 decorationDisplayName 變數中。

```php
[/refactoring_sample/application/controllers/IndexController.php]
    protected $_decorationDisplayNameList = array(
        'kitchen' => '廚房',
    );
    // ...
    public function step2Action()   {
        // ...
        $this->view->decorationDisplayName =
                $this->_decorationDisplayNameList[strtolower($decorationName)];
        // ...
    }

```

接下來就是 View 的部份。

### View

View 的部份除了三個對應 action 的 template scripts 外，還有裝修類型所對應的裝修內容表單及完成頁。

index.phtml 為對應 indexAction() 方法的樣版，顯示表單的連結。

```php
[/refactoring_sample/application/views/scripts/index/index.phtml]
<h1>房屋裝修</h1>
<ul>
    <li><a href="<?php
echo $this->url(array(
    'controller' => 'index',
    'action' => 'step2',
    'decoration' => 'kitchen',
)); ?>">廚房</a></li>
</ul>

```

step2.phtml 為對應 step2Action() 方法的樣版，用來顯示表單；因為我們已經預知每個裝修內容的選項是不一樣的，因此將會變化的子表單部份獨立成子樣版。

```php
[/refactoring_sample/application/views/scripts/index/step2.phtml]
<h1><?php echo $this->escape($this->decorationDisplayName); ?></h1>
<form action="" method="post">
    <fieldset>
        <legend>連絡資訊</legend>
        <p><label for="name">姓名</label><input type="text" name="name" id="name" /></p>
        <p><label for="phone">電話</label><input type="text" name="phone" id="phone" /></p>
        <p><label for="address">住址</label><input type="text" name="address" id="address" /></p>
    </fieldset>
    <fieldset>
        <legend>裝修選項</legend>
        <?php echo $this->partial('index/' . $this->decorationName . '/form.phtml'); ?>
    </fieldset>
    <p><button type="submit">完成送出</button></p>

```

每個會變化的子表單都放在同名的裝修類型資料表下，例如廚房的部份就是：

```php
[/refactoring_sample/application/views/scripts/index/kitchen/form.phtml]
<dl>
    <dt>裝修內容</dt>
    <dd>
        <p>
            <label><input type="checkbox" name="kitchenQuestion01" value="y" /><span>吊櫃</span></label>
            <label><input type="checkbox" name="kitchenQuestion02" value="y" /><span>下櫃</span></label>
        </p>
    </dd>
    <dt>設備是否保留</dt>
    <dd>
        <p>
            <label><input type="checkbox" name="kitchenQuestion03" value="y" /><span>瓦斯爐</span></label>
            <label><input type="checkbox" name="kitchenQuestion04" value="y" /><span>排油煙機</span></label>
        </p>
    </dd>
    <dt>現有廚具</dt>
    <dd>
        <p>
            <label><input type="radio" name="kitchenQuestion05" value="1" /><span>無（需新製）</span></label>
            <label><input type="radio" name="kitchenQuestion05" value="2" /><span>泥作</span></label>
            <label><input type="radio" name="kitchenQuestion05" value="3" /><span>組合式（分件廚具）</span></label>
            <label><input type="radio" name="kitchenQuestion05" value="4" /><span>歐化（木質桶身）</span></label>
            <label><input type="radio" name="kitchenQuestion05" value="5" /><span>不鏽鋼桶身</span></label>
        </p>
    </dd>
</dl>

```

另外 step2.phtml 也會在表單資料驗證錯誤時，將對應的錯誤訊息顯示出來。

```php
[/refactoring_sample/application/views/scripts/index/kitchen/form.phtml]
    <?php if (!empty($this->messages)) : ?>
    <ul>
    <?php foreach ($this->messages as $message) : ?>
        <li><?php echo $this->escape($message); ?></li>
    <?php endforeach; ?>
    </ul>
    <?php endif; ?>
</form>

```

step3.phtml 為對應 step3Action() 方法的樣版，用來顯示完成頁；這裡也和 step2Action() 方法一樣用子樣版來顯示不同的裝修類型結果。

```php
[/refactoring_sample/application/views/scripts/index/step3.phtml]
<h1><?php echo $this->escape($this->decorationDisplayName); ?></h1>
<h2>連絡資訊</h2>
<ul>
    <li>姓名： <?php echo $this->escape($this->decorationRow->name); ?></li>
    <li>電話： <?php echo $this->escape($this->decorationRow->phone); ?></li>
    <li>住址： <?php echo $this->escape($this->decorationRow->address); ?></li>
</ul>
<h2>裝修選項</h2>
<?php echo $this->partial('index/' . $this->decorationName . '/ok.phtml', null, $this); ?>

```

子樣版如下：

```php
[/refactoring_sample/application/views/scripts/index/kitchen/ok.phtml]
<dl>
    <dt>裝修內容：</dt>
    <dd>
        <p>
            <?php echo $this->actionController->buildOptionString(
                    $this->decorationMap['kitchenQuestion01'],
                    $this->decorationRow['kitchenQuestion01']); ?>
            <?php echo $this->actionController->buildOptionString(
                    $this->decorationMap['kitchenQuestion02'],
                    $this->decorationRow['kitchenQuestion02']); ?>
        </p>
    </dd>
    <dt>設備是否保留：</dt>
    <dd>
        <p>
            <?php echo $this->actionController->buildOptionString(
                    $this->decorationMap['kitchenQuestion03'],
                    $this->decorationRow['kitchenQuestion03']); ?>
            <?php echo $this->actionController->buildOptionString(
                    $this->decorationMap['kitchenQuestion04'],
                    $this->decorationRow['kitchenQuestion04']); ?>
        </p>
    </dd>
    <dt>現有廚具：</dt>
    <dd>
        <p>
            <?php echo $this->actionController->buildOptionString(
                    $this->decorationMap['kitchenQuestion05'],
                    $this->decorationRow['kitchenQuestion05']); ?>
        </p>
    </dd>
</dl>

```

比較特別的是在 ok.html 這個子樣版裡，我們用到了定義在 IndexController 類別裡的 buildOptionString() 方法，以取得資料列欄位值對應到 decorationMap 的中文名稱。

### Model

Model 的部份比較簡單，目前只有一個 Zend_Db_Table 類別。

```php
[/refactoring_sample/application/models/DbTable/DecorationKitchens.php]
class Application_Model_DbTable_DecorationKitchens extends Zend_Db_Table_Abstract
{
    protected $_name = 'decoration_kitchens';
}

```

而對應的 database schema 如下：

```sql
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
CREATE DATABASE `refactoring` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `refactoring`;
DROP TABLE IF EXISTS `decoration_kitchens`;
CREATE TABLE IF NOT EXISTS `decoration_kitchens` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `name` varchar(100) default NULL,
  `phone` varchar(100) default NULL,
  `cellphone` varchar(100) default NULL,
  `address` varchar(200) default NULL,
  `kitchenQuestion01` enum('y','n') default 'n',
  `kitchenQuestion02` enum('y','n') default 'n',
  `kitchenQuestion03` enum('y','n') default 'n',
  `kitchenQuestion04` enum('y','n') default 'n',
  `kitchenQuestion05` enum('1','2','3','4','5') default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='廚房問卷';

```

以上就是第一版程式所需要的所有檔案和它們的運作原理。

### 加入新裝修類型

瞭解了程式碼之後，接著我們來看如何加入一個新的裝修類型；假設新的裝修類型是「浴室」 (Bathroom) ，也已經有了對應的 database schema 及樣版。

我們需要更動以下幾個部份：

註：以下將會以一般 patch 檔的方式來表示更動後的差異，即在程式碼的行頭加上加號 (+) 或減號 (-) 來分別表示新增程式碼或刪減程式碼；而行頭沒有特別標示的話，就表示沒有更動；至於移除檔案、資料夾、類別屬性或整個類別方法的部份，就不會再特別用程式碼標明，以節省篇幅。

第一步：新增 Bathroom 的 DbTable 類別並匯入 schema 到資料庫中。

```diff
[/refactoring_sample/application/models/DbTable/DecorationBathrooms.php]
+class Application_Model_DbTable_DecorationBathrooms extends Zend_Db_Table_Abstract
+{
+    protected $_name = 'decoration_bathrooms';
+}

```

資料表的 schema 如下：

```sql
DROP TABLE IF EXISTS `decoration_bathrooms`;
CREATE TABLE IF NOT EXISTS `decoration_bathrooms` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `name` varchar(100) default NULL,
  `phone` varchar(100) default NULL,
  `address` varchar(200) default NULL,
  `bathroomQuestion01` enum('1','2','3','4') default NULL,
  `bathroomQuestion02` enum('1','2','3','4') default NULL,
  `bathroomQuestion03` enum('1','2','3','4','5') default NULL,
  `bathroomQuestion04` enum('y','n') default 'n',
  `bathroomQuestion05` enum('y','n') default 'n',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='衛浴問卷';

```

第二步：在 IndexController 類別的 $_decorationDisplayNameList 變數中加入新的中文名稱對應。

```diff
     protected $_decorationDisplayNameList = array(
         'kitchen' => '廚房',
+        'bathroom' => '浴室',
     );
```

第三步：在 IndexController 類別中新增 _checkBathroomFormData() 方法。

```diff
+    protected function _checkBathroomFormData($formData, &amp;$error, Zend_Controller_Action_Helper_FlashMessenger &amp;$messenger)
+    {
+        if (0 === strlen($formData['name'])) {
+            $error = true;
+            $messenger->addMessage('請輸入姓名');
+        }
+        if (0 === strlen($formData['phone'])) {
+            $error = true;
+            $messenger->addMessage('請輸入電話');
+        }
+        if (0 === strlen($formData['address'])) {
+            $error = true;
+            $messenger->addMessage('請輸入地址');
+        }
+        if (!array_key_exists('bathroomQuestion01', $formData)) {
+            $error = true;
+            $messenger->addMessage('請選擇坪數');
+        }
+        if (!array_key_exists('bathroomQuestion02', $formData)) {
+            $error = true;
+            $messenger->addMessage('請選擇馬桶');
+        }
+        if (!array_key_exists('bathroomQuestion03', $formData)) {
+            $error = true;
+            $messenger->addMessage('請選擇面盆');
+        }
+    }

```

第四步：在 application/controllers/DecorationMap 目錄下加入名稱對照檔。

```php
[/refactoring_sample/application/controllers/DecorationMap/bathroom.php]
<?php
return array(
    'bathroomQuestion01' => array(
        '1' => '1 坪以下',
        '2' => '1 ~ 1.3 坪',
        '3' => '1.3 ~ 1.5 坪',
        '4' => '1.5 坪以上',
    ),
    'bathroomQuestion02' => array(
        '1' => '新製 - 一般馬桶',
        '2' => '新製 - 免治馬桶',
        '3' => '不需更換',
        '4' => '未決定',
    ),
    'bathroomQuestion03' => array(
        '1' => '新製 - 長柱',
        '2' => '新製  -短柱',
        '3' => '新製 - 單孔',
        '4' => '不需更換',
        '5' => '未決定',
    ),
);

```

第五步：加入 Bathroom 的子表單樣版及完成頁樣版。

```php
[/refactoring_sample/application/views/scripts/index/bathroom/form.phtml]
<dl>
    <dt>坪數</dt>
    <dd>
        <p>
            <label><input type="radio" name="bathroomQuestion01" value="1" /><span>1 坪以下</span></label>
            <label><input type="radio" name="bathroomQuestion01" value="2" /><span>1 ~ 1.3 坪</span></label>
            <label><input type="radio" name="bathroomQuestion01" value="3" /><span>1.3 ~ 1.5 坪</span></label>
            <label><input type="radio" name="bathroomQuestion01" value="4" /><span>1.5 坪以上</span></label>
        </p>
    </dd>
    <dt>馬桶</dt>
    <dd>
        <p>
            <label><input type="radio" name="bathroomQuestion02" value="1" /><span>新製 - 一般馬桶</span></label>
            <label><input type="radio" name="bathroomQuestion02" value="2" /><span>新製 - 免治馬桶</span></label>
            <label><input type="radio" name="bathroomQuestion02" value="3" /><span>不需更換</span></label>
            <label><input type="radio" name="bathroomQuestion02" value="4" /><span>未決定</span></label>
        </p>
    </dd>
    <dt>面盆</dt>
    <dd>
        <p>
            <label><input type="radio" name="bathroomQuestion03" value="1" /><span>新製 - 長柱</span></label>
            <label><input type="radio" name="bathroomQuestion03" value="2" /><span>新製  -短柱</span></label>
            <label><input type="radio" name="bathroomQuestion03" value="3" /><span>新製 - 單孔</span></label>
            <label><input type="radio" name="bathroomQuestion03" value="4" /><span>不需更換</span></label>
            <label><input type="radio" name="bathroomQuestion03" value="5" /><span>未決定</span></label>
        </p>
    </dd>
</dl>
```

```php
[/refactoring_sample/application/views/scripts/index/bathroom/ok.phtml]
<dl>
    <dt>坪數</dt>
    <dd>
        <p>
            <?php echo $this->actionController->buildOptionString(
                    $this->decorationMap['bathroomQuestion01'],
                    $this->decorationRow['bathroomQuestion01']); ?>
        </p>
    </dd>
    <dt>馬桶</dt>
    <dd>
        <p>
            <?php echo $this->actionController->buildOptionString(
                    $this->decorationMap['bathroomQuestion02'],
                    $this->decorationRow['bathroomQuestion02']); ?>
        </p>
    </dd>
    <dt>面盆</dt>
    <dd>
        <p>
            <?php echo $this->actionController->buildOptionString(
                    $this->decorationMap['bathroomQuestion03'],
                    $this->decorationRow['bathroomQuestion03']); ?>
        </p>
    </dd>
</dl>

```

第六步：最後在 index.phtml 加入 Bathroom 的新連結。

```php
[/refactoring_sample/application/views/scripts/index/index.phtml]
 <h1>房屋裝修</h1>
 <ul>
     <li><a href="<?php
 echo $this->url(array(
     'controller' => 'index',
     'action' => 'step2',
     'decoration' => 'kitchen',
 )); ?>">廚房</a></li>
+    <li><a href="<?php
+echo $this->url(array(
+    'controller' => 'index',
+    'action' => 'step2',
+    'decoration' => 'bathroom',
+)); ?>">浴室</a></li>
 </ul>

```

接著我們來分析這樣的程式寫法有什麼缺點。

## 程式分析

從上面新增一個裝修類型的過程來看，除了新增必要的 DbTable 類別和樣版外，大部份的修改都集中在 IndexController 類別上；可以想見未來在不斷增加裝修類型後， IndexContrller 類別會越來越龐大。

物件導向開發中，有個很重要的原則就是 SRP (Single Responsibility Principle) ，但顯然 IndexController 類別已經違反了這個原則。原因就是我們把所有的邏輯都集中在 IndexController 類別的身上，使得它所背負的工作超過它原先擔任的角色。

所以這裡可以改進的地方在於，讓 IndexController 類別除了流程的調整外，儘可能不要因為新增裝修類型而有所更動。

另外 View 應該是直接輸出 Model 的資料，或是透過 View Helper 或樣版語法來處理資料的呈現；但是在 step3Action() 方法中，卻因為 View 需要轉換資料列欄位值的名稱，而呼叫了 IndexController 類別的 buildOptionString() 方法；這使得 View 層不適當地依賴了 Controller 層，造成程式碼維護上的困難。

而且名稱對應表也必須透過 IndexController 類別來載入，這使得我們在其他 Controller 中必須重複貼上載入檔案的程式碼，這也是一個可以改進的地方。

下一篇，我們就來針對這些問題一一重構吧！

繼續閱讀：[重構實例介紹 - 實戰篇](http://jaceju.net/2011/01/06/1501/)

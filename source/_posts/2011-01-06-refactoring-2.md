---
layout: post
title: '重構實例介紹 – 實戰篇'
date: 2011-1-6
wordpress_id: 1501
comments: true
tags: ["Refactoring"]
---

接續前篇：[重構實例介紹 - 分析篇](http://jaceju.net/2011/01/06/1495/)

在上一篇中，我們分析了該功能的每段程式碼，也瞭解有哪些地方需要改進，接著我們就來進入實戰的階段。

在實戰的階段，我們要做兩件事：建立自動化測試，重構程式碼。

<!--more-->

## 選擇自動化測試工具

因為重構是「在不改變程式碼外在行為的前提下，對程式碼做出修正，以改進程式的內部結構」 (重構 - 侯捷／熊節) ，所以在重構之前我們必須先有一個信心依據，確保我們的修改不會影響原來的功能，而這個方法就是自動化測試。

一般舊程式的架構很少能用單元測試的概念做到自動化測試，所以每次測試時都要人工打開瀏覽器用眼睛一個項目一個項目去驗證，這種測試的方式非常仰賴畫面輸出的結果。而在我們這個例子裡，因為 IndexController 類別負擔了太多工作，因此也難以直接使用一般的單元測試，只能依靠畫面輸出來驗證程式的正確性。不過有兩種測試技術的出現，使得透過畫面輸出來驗證的方式也能夠自動化，那就是 Zend_Test 與 Selenium 。

它們的原理都是透過解析輸出的 HTML 來做測試，不同的是 Zend_Test 會直接在伺服端截取 Response 物件的內容，而 Selenium 則是透過瀏覽器來解析。 Zend_Test 的優勢在於它可以直接驗證應用程式的內部流程及伺服端物件狀態 (例如 Session 內容) ，適合系統較為複雜的開發環境；而 Selenium 的優勢則在於它可以測試頁面上的互動功能，例如透過 JavaScript 產生的 UI 等。

另外 Zend_Test 需要手動去撰寫測試案例，而且也只能用在以 Zend Framework 為基礎的應用程式上；而 Selenium 則提供視覺化的 Selenium IDE 來建立測試案例，也能透過 Selenium RC 來建立自動化測試環境，而且可適用在各種不同的 Web 開發環境上。

綜合上面的各種優缺點，因此在這次重構的過程中，我們就選擇  Selenium  做為自動測試的工具。

## 建立自動化測試

因為我們已經有了已經上線的程式，執行的功能也是經過客戶確認的，所以便可直接使用 Selenium 來錄製正常的流程。這邊就不再詳細描述錄製的過程，請大家自行參考以下的圖示。

<a href="/resources/refactoring/selenium-01.png"><img class="image" src="/resources/refactoring/selenium-01.png" alt="第一個 Selenium 測試案例" /></a>

這裡的測試案例主要分成兩個部份：成功寫入及驗證失敗。當然如果為了確保測試的正確性，也是可以再添增更複雜的測試組合。但因為這是個範例，所以就以簡單易懂為優先考量。

完成錄製後，就可以將它存成以下 HTML 檔案：

* /refactoring_sample/tests/selenium/UISuite.html
* /refactoring_sample/tests/selenium/KitchenTest.html
* /refactoring_sample/tests/selenium/BathroomTest.html


註：為省略篇幅，這裡請參考置於 GitHub 的[原始程式碼](http://goo.gl/nIgWG)。

如果搭配 Selenium RC 的話，還可以錄製成 PHPUnit 的 TestCase 檔；不過由於我們並不需要做到全自動化的測試，因此使用 Selenium IDE 載入前面錄製的 HTML 檔做測試即可。

接下來在重構的過程中，請開啟 Selenium IDE 並載入剛剛的 HTML 測試案例檔。稍後重構的步驟中，若有提到測試的話，就代表要按下 Selenium IDE 的執行按鍵 (圖示為綠色三角形) 。

有了測試的依據後，我們就可以進行接下來的重構了。

## 重構實戰

事實上重構並沒有一定要從哪個地方開始做起，一般來說要看分析的結果。而在前面提到 IndexController 類別負擔了太多責任，所以我們第一步可以先讓它從這些責任中解脫。

註：同上一篇，以下將會以一般 patch 檔的方式來表示更動後的差異，以節省篇幅。

### 1. 移動名稱對照表

首先我們要把原來透過 IndexController::_exportMapData() 方法所載入的名稱對照表移動位置，因為我們希望要能夠減少新增裝修類型時，所要建立的檔案數量。因此我把原來的名稱對照表暫時先放到對應的 DbTable 類別中，作法如下：

a. 在 Application_Model_DbTable_DecorationKitchens 類別中加入 $_displayMap 屬性及 getDisplayMap() 方法。 $_displayMap 屬性值即為 application/controllers/DecorationMap/kitchen.php 的陣列值； getDisplayMap() 方法則回傳 $_displayMap 屬性。

```diff
 class Application_Model_DbTable_DecorationKitchens extends Zend_Db_Table_Abstract
 {
     protected $_name = 'decoration_kitchens';

+    protected $_displayMap = array(
+        'kitchenQuestion01' => array(
+            'y' => '吊櫃',
+            'n' => '',
+        ),
+        'kitchenQuestion02' => array(
+            'y' => '下櫃',
+            'n' => '',
+        ),
+        'kitchenQuestion03' => array(
+            'y' => '瓦斯爐',
+            'n' => '',
+        ),
+        'kitchenQuestion04' => array(
+            'y' => '排油煙機',
+            'n' => '',
+        ),
+        'kitchenQuestion05' => array(
+            '1' => '無',
+            '2' => '泥作',
+            '3' => '組合式',
+            '4' => '歐化',
+            '5' => '不鏽鋼',
+        ),
+    );
+
+    public function getDisplayMap()
+    {
+        return $this->_displayMap;
+    }
 }
```

b. 再對 Application_Model_DbTable_DecorationBathrooms 這個類別做一次類似的修改。

```diff
 class Application_Model_DbTable_DecorationBathrooms extends Zend_Db_Table_Abstract
 {
     protected $_name = 'decoration_bathrooms';
+    protected $_displayMap = array(
+        'bathroomQuestion01' => array(
+            '1' => '1 坪以下',
+            '2' => '1 ~ 1.3 坪',
+            '3' => '1.3 ~ 1.5 坪',
+            '4' => '1.5 坪以上',
+        ),
+        'bathroomQuestion02' => array(
+            '1' => '新製 - 一般馬桶',
+            '2' => '新製 - 免治馬桶',
+            '3' => '不需更換',
+            '4' => '未決定',
+        ),
+        'bathroomQuestion03' => array(
+            '1' => '新製 - 長柱',
+            '2' => '新製  -短柱',
+            '3' => '新製 - 單孔',
+            '4' => '不需更換',
+            '5' => '未決定',
+        ),
+    );
+
+    public function getDisplayMap()
+    {
+        return $this->_displayMap;
+    }
 }
```

c. 修改 IndexController 類別的 step3Action() 方法，將原本透過 IndexController 類別的 _exportMapData() 方法取值的部份，改用 DbTable 類別的 getDisplayMap() 方法。

```diff
-        $this->view->decorationMap = $this->_exportMapData($decorationName);
+        $this->view->decorationMap = $decorationTable->getDisplayMap();
```

註：這裡的「 DbTable 類別」就是指 Application_Model_DbTable_DecorationKitchens 及 Application_Model_DbTable_DecorationBathrooms 這兩個類別，後續之說明亦同。

這裡有個很重要的重構，就是方法名稱的修正。原本的 _exportMapData 並無法正確表達程式的意圖，所以在重構時我們最好能將它修改成符合程式意圖的名稱。

d. 切換到 Selenium IDE 的畫面，測試。沒意外的話，應該就能看到 Selenium IDE 出現綠色光棒了。

<a href="/resources/refactoring/selenium-02.png"><img class="image" src="/resources/refactoring/selenium-02.png" alt="測試成功的畫面" /></a>

e. 確定沒問題後，我們就可以移除 IndexContrller 的 _exportMapData() 方法和 application/controllers/DecorationMap 整個目錄，再執行一次測試。

第一步就是這麼簡單，因為重構本身就是維持小步前進；我們不需要一次做太多，避免出錯時難以找到問題所在。

### 2. 改用 Row 類別來解決名稱對應表的問題

前面我們把名稱對應表放在 DbTable 類別裡，其實還是不太好；因為我們還是得透過 IndexController 類別的 buildOptionString() 方法，讓從 DbTable 裡取得的名稱對應表能轉換 Row 物件的欄位值。

所以在這個步驟中，我們就要讓 Row 物件自己能輸出欄位值所對應的中文名稱，作法如下：

a. 在 application/models/DbTable 下加入 Application_Model_DbTable_DecorationKitchen 及 Application_Model_DbTable_DecorationBathroom 的 Row 類別，它們分別繼承自 Zend_Db_Table_Row_Abstract 類別。

註：之後的說明裡，提到「 Row 類別」的話，就代表 Application_Model_DbTable_DecorationKitchen 及 Application_Model_DbTable_DecorationBathroom 兩個類別。

```diff
+class Application_Model_DbTable_DecorationKitchen extends Zend_Db_Table_Row_Abstract
+{
+}
```

```diff
+class Application_Model_DbTable_DecorationBathroom extends Zend_Db_Table_Row_Abstract
+{
+}
```

b. 在原來 DbTable 類別中，加入 $_rowClass 屬性，其值為對應的 Row 類別名稱。

```diff
 class Application_Model_DbTable_DecorationKitchens extends Zend_Db_Table_Abstract
 {
     protected $_name = 'decoration_kitchens';
+    protected $_rowClass = 'Application_Model_DbTable_DecorationKitchen';
```

```diff
 class Application_Model_DbTable_DecorationBathrooms extends Zend_Db_Table_Abstract
 {
     protected $_name = 'decoration_kitchens';
+    protected $_rowClass = 'Application_Model_DbTable_DecorationBathroom';
```

c. 將原來在 DbTable 類別上的 $_displayMap 屬性和 getDisplayMap() 方法複製到對應的 Row 類別上。

```diff
 class Application_Model_DbTable_DecorationKitchen extends Zend_Db_Table_Row_Abstract
 {
+    protected $_displayMap = array(
+        'kitchenQuestion01' => array(
+            'y' => '吊櫃',
+            'n' => '',
+        ),
+        'kitchenQuestion02' => array(
+            'y' => '下櫃',
+            'n' => '',
+        ),
+        'kitchenQuestion03' => array(
+            'y' => '瓦斯爐',
+            'n' => '',
+        ),
+        'kitchenQuestion04' => array(
+            'y' => '排油煙機',
+            'n' => '',
+        ),
+        'kitchenQuestion05' => array(
+            '1' => '無',
+            '2' => '泥作',
+            '3' => '組合式',
+            '4' => '歐化',
+            '5' => '不鏽鋼',
+        ),
+    );
+
+    public function getDisplayMap()
+    {
+        return $this->_displayMap;
+    }
 }
```

```diff
 class Application_Model_DbTable_DecorationBathroom extends Zend_Db_Table_Row_Abstract
 {
+    protected $_displayMap = array(
+        'bathroomQuestion01' => array(
+            '1' => '1 坪以下',
+            '2' => '1 ~ 1.3 坪',
+            '3' => '1.3 ~ 1.5 坪',
+            '4' => '1.5 坪以上',
+        ),
+        'bathroomQuestion02' => array(
+            '1' => '新製 - 一般馬桶',
+            '2' => '新製 - 免治馬桶',
+            '3' => '不需更換',
+            '4' => '未決定',
+        ),
+        'bathroomQuestion03' => array(
+            '1' => '新製 - 長柱',
+            '2' => '新製  -短柱',
+            '3' => '新製 - 單孔',
+            '4' => '不需更換',
+            '5' => '未決定',
+        ),
+    );
+
+    public function getDisplayMap()
+    {
+        return $this->_displayMap;
+    }
 }
```

e. 將原來呼叫 DbTable 類別的 getDisplayMap() 方法的部份，改為呼叫 Row 類別的 getDisplayMap() 方法，測試。

```diff
-        $this->view->decorationMap = $decorationTable->getDisplayMap();
+        $this->view->decorationMap = $decorationRow->getDisplayMap();
```

f. 測試通過後，將原來在 DbTable 類別上的 $_displayMap 屬性和 getDisplayMap() 方法刪除。

到這裡，相信大家會覺得很疑惑，為什麼不一開始就把 $_displayMap 屬性和 getDisplayMap() 方法移到 Row 類別上呢？

因為在一開始尋找需要處理的問題的方向，會影響我們後續重構的過程；而且我並不確定一開始就把 $_displayMap 屬性和 getDisplayMap() 方法放在 Row 類別上是不是一個好作法，所以我選擇了影響較少的方式。保持小步前進是重構最重要的關鍵之一，這樣一來即使發現方向錯誤，也可以讓復原的代價減到最低。

g. 將 IndexController 類別的 buildOptionString() 複製到 Application_Model_DbTable_DecorationKitchen 類別裡，並改名為 display() 方法。接著修改 display() 方法的程式碼，讓它直接使用內部的 $_displayMap 屬性。

```diff
 class Application_Model_DbTable_DecorationKitchen extends Zend_Db_Table_Row_Abstract
 {
+    public function display($name)
+    {
+        return isset($this->_displayMap[$name]($this->$name))
+             ? $this->_displayMap[$name]($this->$name)
+             : null;
+    }
```

h. 接著將樣版中呼叫 IndexController::buildOptionString() 方法的部份改為呼叫 Row 物件的 display() 方法；可以先改一個，測試無誤後再全部改掉。

```diff
-            <?php echo $this->actionController->buildOptionString(
-                    $this->decorationMap['kitchenQuestion01'],
-                    $this->decorationRow['kitchenQuestion01']); ?>
+            <?php echo $this->decorationRow->display('kitchenQuestion01'); ?>
```

i. Application_Model_DbTable_DecorationBathroom 類別做同樣的處理，測試。

j. 最後將 IndexController::step3Action() 方法中，移除 view 對 decorationMap 和 actionController 兩個變數的引用。

```diff
     public function step3Action()
     {
         // ...
-        $this->view->decorationMap = $decorationRow->getDisplayMap();
-        $this->view->actionController = $this;
     }
```

k. 最後刪掉整個 IndexController::buildOptionString() 方法。

當然，我們也可以讓 application/views/scripts/index/kitchen/form.phtml 改用新的 display() 方法來顯示選項，這就看維護上的需求值不值得我們這麼做了。

### 3. 處理裝修類型名稱

現在我們已經讓 IndexController 類別減輕不少責任，但是還有一個地方會影響到每次我們新增裝修類型，那就是 IndexController 類別的 $_decorationDisplayNameList 屬性。我們希望讓它是定義在 DbTable 類別或是 Row 類別裡，這樣就不用每次都要修改 IndexController 類別。

那麼新的屬性位置應該放在 DbTable 類別裡好，還是放在 Row 類別裡好呢？其實兩個都是可行的選擇，但原則上我們希望儘可能讓相同的邏輯放在同一個地方，因此這邊我選擇了 Row 類別。完整的作法如下：

a. 先將 step2Action 呼叫 _createDecorationTable() 的程式碼移到 action 的開頭處，並在下一行加上 $decorationTable->createRow() ；而原本呼叫 DbTable 物件的 createRow() 方法的部份則改為呼叫 Row 物件的 setFromArray() 方法，測試。

```diff
 class IndexController 類別extends Zend_Controller_Action
 {
     public function step2Action()
     {
         $decorationName = strtolower($this->getRequest()->getParam('decoration'));
+        $decorationTable = $this->_createDecorationTable($decorationName);
+        $decorationRow = $decorationTable->createRow();
-                $decorationTable = $this->_createDecorationTable($decorationName);
-                $decorationRow = $decorationTable->createRow($formData);
+                $decorationRow->setFromArray($formData);
```

b. 在 Row 類別中加入 $_displayName 屬性及 getDisplayName() 方法，其中 $_displayName 屬性的值即為裝修類型的中文名稱。

```diff
 class Application_Model_DbTable_DecorationKitchen extends Zend_Db_Table_Row_Abstract
 {
+    protected $_displayName = '廚房';
+
+    public function getDisplayName()
+    {
+        return $this->_displayName;
+    }
```

```diff
 class Application_Model_DbTable_DecorationBathroom extends Zend_Db_Table_Row_Abstract
 {
+    protected $_displayName = '浴室';
+
+    public function getDisplayName()
+    {
+        return $this->_displayName;
+    }
```

c. 在 step2Action() 方法的 view 中加入對 $decorationRow 的引用，測試。

```diff
 class IndexController 類別extends Zend_Controller_Action
 {
     public function step2Action()
     {
         $this->view->decorationName = $decorationName;
         $this->view->decorationDisplayName =
                 $this->_decorationDisplayNameList[strtolower($decorationName)];
+        $this->view->decorationRow = $decorationRow;
```

d. 在 step2.phtml 及 step3.phtml 兩個樣版中，將顯示樣版變數 decorationDisplayName 的部份，改為顯示 Row 物件的 getDisplayName() 方法，測試。

```diff
-<h1><?php echo $this->escape($this->decorationDisplayName); ?></h1>
+<h1><?php echo $this->escape($this->decorationRow->getDisplayName()); ?></h1>
```

e. 拿掉 IndexController 類別的 step2Action() 與 step3Action() 方法中，指定給 view 的 $_decorationDisplayNameList 變數所在相關程式碼，測試。

```diff
     public function step2Action()
     {
-        $this->view->decorationDisplayName =
-                $this->_decorationDisplayNameList[strtolower($decorationName)];
     public function step3Action()
     {
-        $this->view->decorationDisplayName =
-                $this->_decorationDisplayNameList[strtolower($decorationName)];
```

f. 最後移除 IndexController 類別裡的 $_decorationDisplayNameList 屬性。

這樣一來，在 IndexController 類別就不需要額外處理中文名稱顯示的問題了。

### 4. 處理重複的程式碼

重複的程式碼是最糟糕的一種壞味道，但我們卻在上面的重構過程中，讓兩個 Row 類別都重複了同樣的程式碼；所以現在我們要透過繼承來消除掉這些重複的程式碼，作法如下：

a. 建立抽象的 Application_Model_DbTable_DecorationRow 類別，將在另外兩個 Row 類別重複的 getDisplayName() 、 getDisplayMap() 及 display() 等三個方法複製過來，並加入必要的 protected 屬性： $_displayName 及 $_displayMap 。

註：後面的說明中，會以「抽象 Row 類別」來代替 Application_Model_DbTable_DecorationRow 的完整名稱。

```php
[/refactoring_sample/application/models/DbTable/DecorationRow.php]
abstract class Application_Model_DbTable_DecorationRow extends Zend_Db_Table_Row_Abstract
{
    protected $_displayName = null;
    public function getDisplayName()
    {
        return $this->_displayName;
    }
    protected $_displayMap = array();
    public function getDisplayMap()
    {
        return $this->_displayMap;
    }
    public function display($name)
    {
        return isset($this->_displayMap[$name]($this->$name))
             ? $this->_displayMap[$name]($this->$name)
             : null;
    }
}

```

b. 舊的 Row 類別改為繼承抽象 Row 類別，測試。

```diff
-class Application_Model_DbTable_DecorationKitchen extends Zend_Db_Table_Row_Abstract
+class Application_Model_DbTable_DecorationKitchen extends Application_Model_DbTable_DecorationRow
```

```diff
-class Application_Model_DbTable_DecorationKitchen extends Zend_Db_Table_Row_Abstract
+class Application_Model_DbTable_DecorationKitchen extends Application_Model_DbTable_DecorationRow
```

c. 最後移除 Row 類別的 getDisplayName() 、 getDisplayMap() 及 display() 三個方法，測試。

現在我們的 Row 類別就只需要定義好裝修類型中文名稱以及欄位值名稱對應表就可以了。

### 5. 處理表單驗證函式

最後我們來處理會讓 IndexController 類別變成得非常冗長的表單驗證函式。當然時間允許的話，這邊可以用 Zend_Form 改寫；但這樣會偏離本文的主軸，因此我們還是以重構為優先。

這個步驟主要的目標是將各個裝修類型表單驗證函式放在對應的 Row 類別裡，這樣我們就可以直接讓 Row 類別驗證表單資料，而不需要在 IndexController 類別裡定義驗證函式。作法如下：

a. 將 IndexController 類別的 _checkKitchenFormData() 方法複製到 Application_Model_DbTable_DecorationKitchen 類別，並改成名為 checkData() 的公開方法；然後對 IndexController 類別的 _checkBathroomFormData() 也做同樣的處理。現在兩個 Row 類別分別都有 checkData() 函式。

```diff
 class Application_Model_DbTable_DecorationKitchen extends Application_Model_DbTable_DecorationRow
 {
+    public function checkData($formData, $error, $messenger)
+    {
+        $error = false;
+        if (0 === strlen($formData['name'])) {
+            $error = true;
+            $messenger->addMessage('請輸入姓名');
+        }
+        if (0 === strlen($formData['phone'])) {
+            $error = true;
+            $messenger->addMessage('請輸入電話';
+        }
+        if (0 === strlen($formData['address'])) {
+            $error = true;
+            $messenger->addMessage('請輸入地址');
+        }
+        if (!array_key_exists('kitchenQuestion01', $formData)
+                &amp;&amp; !array_key_exists('kitchenQuestion02', $formData)) {
+            $error = true;
+            $messenger->addMessage('請選擇裝修內容');
+        }
+        if (!array_key_exists('kitchenQuestion03', $formData)
+                &amp;&amp; !array_key_exists('kitchenQuestion04', $formData)) {
+            $error = true;
+            $messenger->addMessage('請選擇設備是否保留');
+        }
+        if (!array_key_exists('kitchenQuestion05', $formData)) {
+            $error = true;
+            $messenger->addMessage('請選擇現有廚具');
+        }
+        return $error;
+    }
```

```diff
 class Application_Model_DbTable_DecorationBathroom extends Application_Model_DbTable_DecorationRow
 {
+    public function checkData($formData, $error, $messenger)
+    {
+        $error = false;
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
+        return $error;
+    }
```

b. 將 IndexController 類別的 step2Action() 方法中，以 $checkFunctionName() 呼叫驗證函式的方式，改為呼叫 Row 物件的 checkData() 方法，測試。

```diff
 class IndexController 類別extends Zend_Controller_Action
 {
     public function step2Action()
     {
-            $this->$checkFunctionName($formData, $error, $messenger);
+            $decorationRow->checkData($formData, $error, $messenger);
```

c. 移除 step2Action() 方法裡的 $checkFunctionName 變數，測試。

```diff
     public function step2Action()
     {
-            $checkFunctionName = '_check' . ucwords(strtolower($decorationName)) . 'FormData';
```

d. 最後移除 IndexController 類別裡的 _checkKitchenFormData() 及 _checkBathroomFormData() 兩個方法，

現在我們終於讓 IndexController 類別脫離那些不讓屬於它的繁雜責任了。

註：事實上還有 _createDecorationTable() 方法也不應該放在 IndexController 類別裡，這邊就留給大家思考看看需不需要再做進一步的重構。

### 6. 解決 Row 類別與 IndexController 類別類別的耦合

重構了 IndexController 類別的部份後，最後我們來處理 Row 類別。在 Row 類別的 checkData() 方法中，我們可以看到它除了必須的 $formData 參數外，還得取得 IndexController 類別的 $error 及 $messenger 兩個參數的引用；尤其 $messenger 變數的型態又是 Zend_Controller_Action_Helper_FlashMessenger 類別，使得 Row 類別必須依賴 Controller 層，大大降低了 Row 類別的可重用性。

因此我們要讓 Row 類別自行提處理掉驗證錯誤的部份，反過來讓 IndexController 類別依賴 Row 類別；換句話說，就是要拿掉 checkData() 的 $error 及 $messenger 兩個參數，作法如下：

a. 分別把兩個 Row 類別的 checkData() 方法裡的 $error 變成區域變數，並將其回傳給呼叫者。

```diff
-    public function checkData($formData, $error, $messenger)
+    public function checkData($formData, $messenger)
     {
+        $error = false;
         // ...
+        return $error;
     }
```

b. 然後在 IndexController 類別的 step2Action() 方法中接收 Row 類別的 checkData() 方法所回傳的 $error ，測試。

```diff
     public function step2Action()
     {
-            $decorationRow->checkData($formData, $error, $messenger);
+            $error = $decorationRow->checkData($formData, $messenger);
```

c. 接著在抽象 Row 類別中建立一個 $_messages 陣列屬性及 getMessages() 方法。

```diff
 abstract class Application_Model_DbTable_DecorationRow extends Zend_Db_Table_Row_Abstract
 {
+    protected $_messages = array();
+
+    public function getMessages()
+    {
+        return $this->_messages;
+    }
```

d. 然後把 Row 類別的 checkData() 方法中原本用 $messenger->addMessage() 的部份，改用新的 $_messages 屬性來指定。

```diff
     public function checkData($formData, $messenger)
     {
         if (0 === strlen($formData['name'])) {
             $error = true;
-            $messenger->addMessage('請輸入姓名');
+            $this->_messages[] = '請輸入姓名';
         }
         // 以下依此類推
```

e. 在 IndexController 類別的 step2Action() 方法中處理驗證失敗的區段中，在導回 step2Action() 前，透過抽象 Row 類別的 getMessages() 方法，以取得錯誤訊息並一一加入 $messenger 中，測試。

```diff
     public function step2Action()
     {
         // ...
             if (!$error) {
                 // ...
             } else {
                 // ...
+                $messages = $decorationRow->getMessages();
+                foreach ($messages as $message) {
+                    $messenger->addMessage($message);
+                }
                 $this->_helper->redirector->gotoSimple('step2', null, null, $params);
             }
```

f. 最後移除 checkData() 的 $messenger 參數及 step2Action() 傳入 $messenger 變數的部份，測試。

```diff
-    public function checkData($formData, $messenger)
+    public function checkData($formData)

```

```diff
     public function step2Action()
     {
         // ...
-            $error = $decorationRow->checkData($formData, $messenger);
+            $error = $decorationRow->checkData($formData);
```

現在 Row 類別就跟 IndexController 類別解耦了。

註：這邊請大家思考一下，為什麼我在處理 $error 的部份時，一開始就拿掉 checkData() 方法的 $error 參數；但是處理 $messenger 時，卻沒有一開始就拿掉 $messenger 參數呢？

### 7. 處理 checkData() 方法重複的部份

再回頭看看 Row 類別的 checkData() 方法，我們可以發現裡面還是有重複的程式碼，也就是檢查姓名、電話與地址的部份。這三個欄位的檢查在未來新增裝修類型時也不會變動，因此我們可以將它們抽出來變成共用的程式碼，作法如下：

a. 在抽象 Row 類別中建立一個 _checkCommonData() 方法，並將 Row 類別的 checkData() 方法裡檢查姓名、電話、地址的部份複製出來，放到新的 _checkCommonData() 方法中，一樣要加入 $error 區域變數並回傳。

```diff
 abstract class Application_Model_DbTable_DecorationRow extends Zend_Db_Table_Row_Abstract
 {
     // ...
+
+    protected function _checkCommonData($formData)
+    {
+        $error = false;
+        if (0 === strlen($formData['name'])) {
+            $error = true;
+            $this->_messages[] = '請輸入姓名';
+        }
+        if (0 === strlen($formData['phone'])) {
+            $error = true;
+            $this->_messages[] = '請輸入電話';
+        }
+        if (0 === strlen($formData['address'])) {
+            $error = true;
+            $this->_messages[] = '請輸入地址';
+        }
+        return $error;
+    }
```

b. 改寫各 Row 類別的 checkData() 方法，移除原來的共用驗證程式碼，並改為呼叫 _checkCommonData() 方法，測試。

```diff
     public function checkData($formData)
     {
         $error = false;
-        if (0 === strlen($formData['name'])) {
-            $error = true;
-            $this->_messages[] = '請輸入姓名';
-        }
-        if (0 === strlen($formData['phone'])) {
-            $error = true;
-            $this->_messages[] = '請輸入電話';
-        }
-        if (0 === strlen($formData['address'])) {
-            $error = true;
-            $this->_messages[] = '請輸入地址';
-        }
+        $error = $error || $this->_checkCommonData($formData);

```

測試無誤後，我們就完成了整個重構了，謝天謝地。

## 再次加入新的裝修類型

花了這些功夫做重構後，最重要的是它好不好維護，容不容易因應未來的變化；因此接下來我們就要加入一個新的裝修類型，來看看重構後的程式碼是不是符合我們的期待。

假設新的裝修類型是「地板」 (Flooring) ，客戶也提供了對應的 database schema 及樣版。

第一步：加入 Flooring 的 DbTable 類別並匯入 schema 到資料庫中。

```php
</path_to_project/application/models/DbTable/DecorationFloorings.php>
class Application_Model_DbTable_DecorationFloorings extends Zend_Db_Table_Abstract
{
    protected $_name = 'decoration_floorings';
    protected $_rowClass = 'Application_Model_DbTable_DecorationFlooring';
}

```

資料表的 schema 如下：

```sql
DROP TABLE IF EXISTS `decoration_floorings`;
CREATE TABLE IF NOT EXISTS `decoration_floorings` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `name` varchar(100) default NULL,
  `phone` varchar(100) default NULL,
  `address` varchar(200) default NULL,
  `flooringQuestion01` enum('y','n') default 'n',
  `flooringQuestion02` enum('y','n') default 'n',
  `flooringQuestion03` enum('1','2','3') default NULL,
  `flooringQuestion04` enum('1','2','3','4','5') default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='地板問卷';

```

第二步：加入 Flooring 的 Row 類別。

```php
</path_to_project/application/models/DbTable/DecorationFlooring.php>
class Application_Model_DbTable_DecorationFlooring extends Application_Model_DbTable_DecorationRow
{
    protected $_displayName = '地板';
    protected $_displayMap = array(a
        'flooringQuestion01' => array(
            'y' => '地板施作',
            'n' => '',
        ),
        'flooringQuestion02' => array(
            'y' => '樓梯',
            'n' => '',
        ),
        'flooringQuestion03' => array(
            '1' => '已有鋪設木地板',
            '2' => '磁磚',
            '3' => '塑膠地磚',
        ),
        'flooringQuestion04' => array(
            '1' => '透天住宅',
            '2' => '一般公寓',
            '3' => '電梯大樓',
            '4' => '公司行號',
            '5' => '其他',
        ),
    );
    public function checkData($formData)
    {
        $error = false;
        $error = $error || $this->_checkCommonData($formData);
        if (!array_key_exists('flooringQuestion01', $formData)
                &amp;&amp; !array_key_exists('flooringQuestion02', $formData)) {
            $error = true;
            $this->_messages[] = '請選擇裝修內容';
        }
        if (!array_key_exists('flooringQuestion03', $formData)) {
            $error = true;
            $this->_messages[] = '請選擇施工環境情況';
        }
        if (!array_key_exists('flooringQuestion04', $formData)) {
            $error = true;
            $this->_messages[] = '請選擇住家環境';
        }
        return $error;
    }
}

```

第三步：加入 Flooring 的子表單樣版及完成頁樣版。

表單樣版：

```php
</path_to_project/application/views/scripts/index/bathroom/form.phtml>
<dl>
    <dt>裝修內容</dt>
    <dd>
        <p>
            <label><input type="checkbox" name="flooringQuestion01" value="y" /><span>地板施作</span></label>
            <label><input type="checkbox" name="flooringQuestion02" value="y" /><span>樓梯</span></label>
        </p>
    </dd>
    <dt>施工環境情況</dt>
    <dd>
        <p>
            <label><input type="radio" name="flooringQuestion03" value="1" /><span>已有鋪設木地板</span></label>
            <label><input type="radio" name="flooringQuestion03" value="2" /><span>磁磚</span></label>
            <label><input type="radio" name="flooringQuestion03" value="3" /><span>塑膠地磚</span></label>
        </p>
    </dd>
    <dt>住家環境</dt>
    <dd>
        <p>
            <label><input type="radio" name="flooringQuestion04" value="1" /><span>透天住宅</span></label>
            <label><input type="radio" name="flooringQuestion04" value="2" /><span>一般公寓</span></label>
            <label><input type="radio" name="flooringQuestion04" value="3" /><span>電梯大樓</span></label>
            <label><input type="radio" name="flooringQuestion04" value="4" /><span>公司行號</span></label>
            <label><input type="radio" name="flooringQuestion04" value="5" /><span>其他</span></label>
        </p>
    </dd>
</dl>

```

完成頁樣版：

```php
</path_to_project/application/views/scripts/index/bathroom/ok.phtml>
<dl>
    <dt>裝修內容</dt>
    <dd>
        <p>
            <?php echo $this->decorationRow->display('flooringQuestion01'); ?>
            <?php echo $this->decorationRow->display('flooringQuestion02'); ?>
        </p>
    </dd>
    <dt>施工環境情況</dt>
    <dd>
        <p>
            <?php echo $this->decorationRow->display('flooringQuestion03'); ?>
        </p>
    </dd>
    <dt>住家環境</dt>
    <dd>
        <p>
            <?php echo $this->decorationRow->display('flooringQuestion04'); ?>
        </p>
    </dd>
</dl>

```

第四步：最後在 index.phtml 加入 Flooring 的新連結。

```diff
     <li><a href="<?php
 echo $this->url(array(
     'controller' => 'index',
     'action' => 'step2',
     'decoration' => 'bathroom',
 )); ?>">浴室</a></li>
+    <li><a href="<?php
+echo $this->url(array(
+        'controller' => 'index',
+        'action' => 'step2',
+        'decoration' => 'flooring',
+)); ?>">地板</a></li>
 </ul>

```

除了因為要加入連結而必須修改 index.html 外，我們幾乎都是新增檔案，而沒有修改到原來的程式碼。對於後續維護的人員來說，就可以不心擔心修改到舊程式碼而出現不可預期的錯誤了，是不是比原來的方法好多了呢？

## 結語

當然這樣的重構並不是最完美的，也可能跟大家心中所想的作法有所差異，不過這已經達成我們重構的目的；因為透過這樣的重構，我們瞭解了整個系統，也將原來散亂各地的資料存取邏輯統整在一起，使得程式碼更容易新增功能與維護。

然而重構最大的問題並不是不知道怎麼重構，而是不知道該什麼時候重構，還有什麼時候該停止重構。老實說該什麼時候重構，我沒辦法給大家什麼好答案；個人認為比較好的方式就是寫好一個功能時，留點時間給重構；或是在新增及維護功能時，進行小規模的重構。然後見好就收，覺得已經達到重構目的後，就把時間還給新的專案或需求。

每次的重構應該只針對一個目標去完成，避免過程無目的地發散；如果在重構的過程中，發現任何其他部份也需要重構的話，可以先記下來列入下次的重構裡。而在重構一小步並測試無誤之後，就可以將它放到版本控制系統裡，這樣就不用擔心走得太遠，結果出問題後無法復原。

重構說難不難，說容易也不是那麼簡單；希望從這個範例中，大家可以對重構有進一步的瞭解。

謝謝收看，下次再會。

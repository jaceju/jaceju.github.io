---
title: "用 Imagick 建立 CSS Sprites"
date: 2012-06-11 12:01:00 +08:00
tags: [ PHP]
---
這是工作筆記，介紹如何用 Imagick 製作出 CSS Sprites 。

<!-- more -->

## 工具

這個功能需要在系統上安裝以下工具：

### ImageMagick

ImageMagick 是一個圖形處理套件，請參考作系統版本安裝；以 Ubuntu 為例，安裝方法為：

```bash
sudo apt-install imagemagick libmagickwand-dev libmagickcore-dev
```

### imagick

imagick 讓 PHP 可以透過 ImageMagick 來處理圖片。

如果 Ubuntut 上的 PHP 版本為 5.3 的話，可以用以下指令安裝：

```bash
sudo apt-get install php5-imagick
```

不過如果安裝的是 PHP 5.4 的話，那麼就沒辦法直接用 `apt-get` 指令來安裝，我們要從 PECL 的官方網站下載最新的 imagick 來安裝：

```bash
wget http://pecl.php.net/get/imagick-3.1.0RC2.tgz
tar xzvf imagick-3.1.0RC2.tgz
cd imagick-3.1.0RC2/
phpize
./configure
make
sudo make install
```

然後在 `/etc/php5/mods-available` 中新增一個 `imagick.ini` 檔，內容如下：

```ini
extension=imagick.so
```

再用以下指令讓 PHP 把把上面的設定檔連結進來：

```bash
cd /etc/php5/conf.d
sudo ln -s ../mods-available/imagick.ini 30-imagick.ini
```

註：各家作業系統設定 php.ini 的方式不一定相同。

最後記得重新啟動 Apache 來重新載入 PHP 設定。

現在我們可以在 PHP 程式中使用 imagick 這個套件了，來看看我們怎麼製作 CSS sprites 。

## 開始動工

CSS Sprites 的基本原理如下：

1. 將許多小圖 (通常是同寬或同長) 排列在一起，合併為一大張。
2. 然後透過 CSS 的 `background-image` 屬性將它當成是元素的背景。
3. 最後再用 `background-position` 、 `width` 與 `height` 屬性調整小圖要顯示的位置及大小。

這裡要介紹的是同尺寸的圖片合併成 CSS Sprites 的技巧，首先我們準備以下的圖片：

* ![Clock](/resources/css_sprites_imagick/clock.png): `img/clock.png`
* ![Disc](/resources/css_sprites_imagick/disc.png): `img/disc.png`
* ![Mail](/resources/css_sprites_imagick/mail.png): `img/mail.png`
* ![Gear](/resources/css_sprites_imagick/gear.png): `img/gear.png`
* ![Terminal](/resources/css_sprites_imagick/terminal.png): `img/terminal.png`

它們的寬高都是 32px 。

這裡我用 PNG 檔示範，當然也可以用 JPEG 檔或 GIF 檔；不過如果是動畫 GIF 檔的話，程式上要特別處理，這點稍後再提。

### 產生 CSS Sprites

要用 Imagick 來產生 CSS Sprites 的話，首先利用 `glob` 函式搜集全部的小圖資訊：

```php
$imagePaths = glob(__DIR__ . '/img/*');
```

`glob` 函式會幫我們取得 `img` 資料夾下所有檔案的完整路徑，並以陣列回傳。

然後我們就可以把它丟給 Imagick 處理：

```php
$image = new Imagick();

// 一張一張的把圖疊到空白圖上
foreach ($imagePaths as $imagePath) {
    $sprite = new Imagick($imagePath);
    $image->addImage($sprite);
}

// 用附加在圖片之後的方式，製作出垂直的 sprites 圖片
$image->resetIterator();
$combined = $image->appendImages(true);

// 輸出格式為 PNG
$combined->setImageFormat('png');

// 將最後的圖片內容寫入檔案
$combined->writeImage(__DIR__ . '/img/sprites.png');
```

這樣一來，就會得到 `img/sprites.png` 這個圖檔，內容如下：

![sprites](/resources/css_sprites_imagick/sprites.png)

### 產生 CSS 檔案

現在我們要讓產生 CSS 檔案，第一步把小圖的圖檔路徑，轉換成 CSS 的 class 名稱。

```php
// 用圖檔名稱做為 CSS 的 class 名稱
$classNames = array();
foreach ($imagePaths as $imagePath) {
    $fileInfo = pathinfo($imagePath);
    $classNames[] = '.icon-' . $fileInfo['filename'];
}
```

這裡我加上了 `icon-` 這個前置字串，目的是為了不讓產生出來的 class 跟現存的其他 class 衝突。例如 `mail.png` 產生出來的 class 名稱為 `icon-mail` 。

有了 class 名稱後，就可以設定它們的背景圖了。

```php
// 把全部的 class 設為相同的不重覆背景圖。
$css = implode(', ', $classNames);
$css .= " {\nbackground: url('../img/sprites.png') no-repeat; \n}\n";
```

然後針對每個 class 名稱，加入對應的背景位置：

```php
// 寫入每個 sprite 的背景位置定義
$y = 0;
foreach ($classNames as $className) {
    $css .= $className;
    $css .= " {\nbackground-position: 0 -{$y}px\n}\n";
    $y += 32;
}
```

最後把得到的 CSS 內容，寫入 `css/sprites.css` 裡就可以了。

```php
// 將最後的 CSS 內容寫入檔案
$cssPath = __DIR__ . '/css/sprites.css';
file_put_contents($cssPath, $css);
```

產生出來的 CSS 檔案內容如下：

```css
.icon-clock,.icon-disc,.icon-gear,.icon-mail,.icon-terminal {
background: url('../img/sprites.png') no-repeat;
}
.icon-clock {
background-position: 0 -0px
}
.icon-disc {
background-position: 0 -32px
}
.icon-gear {
background-position: 0 -64px
}
.icon-mail {
background-position: 0 -96px
}
.icon-terminal {
background-position: 0 -128px
}
```

註：換行字元其實是可以不需要的，這裡只是為了方便檢查 CSS 的正確性而已。

### 用法範例

簡單的用法如下，首先是 HTML ：

``` html index.html
<!DOCTYPE>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<title>CSS sprites</title>
<link href="css/screen.css" rel="stylesheet" />
<link href="css/sprites.css" rel="stylesheet" />
</head>
<body>
  <ul>
    <li><a href="#" class="icon-clock">Clock</a></li>
    <li><a href="#" class="icon-disc">Disc</a></li>
    <li><a href="#" class="icon-mail">Mail</a></li>
    <li><a href="#" class="icon-gear">Gear</a></li>
    <li><a href="#" class="icon-terminal">Terminal</a></li>
  </ul>
</body>
</html>
```

其中 `screen.css` 內容如下：

``` css css/screen.css
ul > li {
list-style: none;
float: left;
margin: 3px;
}

ul > li > a {
display: block;
width: 32px;
height: 32px;
/* hide text */
text-indent: 100%;
white-space: nowrap;
overflow: hidden;
}
```

這裡我們希望 `ul` 中的連結可以變成橫向排例的圖示，所以先讓 `li` 元素調整成向左浮動，再把連結設定為可以設定寬高的區塊元素。這樣一來，我們只要再調整背景圖就可以了。

註：這裡有用到以背景圖取代文字的技巧，請參考： [Replacing the -9999px hack](http://www.zeldman.com/2012/03/01/replacing-the-9999px-hack-new-image-replacement/) 一文。

因為 `sprites.css` 是用程式產生的，所以我們把它獨立出來。

最後的結果如下：

![Result](/resources/css_sprites_imagick/result.png)

## 一些經驗

實際應用這個技術時，我有幾個經驗分享給大家：

### 清除舊圖

前面的程式碼裡，我把最後產生出來的 sprites 圖檔跟原來的小圖放在一起；但如果這時要重新產生 sprites 的話，就會把上次產生的 sprites 圖檔也一併合併進來。

為了解決這個錯誤，我們必須先把舊的 sprites 圖檔刪除：

```php
@unlink(__DIR__ . '/img/sprites.png');
$imagePaths = glob(__DIR__ . '/img/*');
```

當然如果不是在同一個目錄下的話，這個動作就可以不用了。

### 利用後台管理 sprites

前面的範例裡，我是用 `glob` 這個函式來取得小圖資訊，但有時候我們希望某些暫時用不到的圖片可以不要出現在 sprites 時該怎麼辦呢？這時候我會利用後台來管理它們。

一般來說，我會在後台上傳新圖後，將相關資訊寫入資料庫中；然後就可以透過程式篩選掉暫時下架的小圖，最後再透過上面的程式來產生 sprites 。

### GIF 動畫

Imagick 也支援 GIF 動畫的處理，不過如果把 GIF 動畫合併到 sprites 時，它會把每張動畫影格 (frame) 都當成是一張小圖。

還好 GIF 動畫被 Imagick 載入時，會被當成是一個圖片集合物件，所以假如我們只需要第一個影格來當做 sprite 的話，可以這麼做：

```php
foreach ($imagePaths as $imagePath) {
    $im = new Imagick($imagePath);
    foreach ($im as $frame) {
        $tm = $frame->getImage();
        $image->addImage($tm);
        break;
    }
}
```

註：會這麼寫是因為 Imagick 沒有實作 ArraryAccess 介面，所以沒辦法像陣列一樣使用。

希望這些經驗可以幫助到大家。

## 心得

Imagick 真的是一個很棒的 PHP 套件，它將 ImageMagick 的功能包裝得非常好用。這次剛好藉著製作 CSS Sprites 的功能，體會到這個套件的強大。

當然這裡我用到的只是 ImageMagick 與 Imagick 的小部份功能而已，往後如果有機會再實作到其他功能時，我也會再分享給大家。
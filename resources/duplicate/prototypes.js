// Original file from http://www.svendtofte.com/code/usefull_prototypes/.
Number.max = function(a, b) {
    return a < b ? b : a;
}
Number.min = function(a, b) {
    return a > b ? b : a;
}
Math.mod = function(val, mod) {
    if (val < 0) {
        while (val < 0) val += mod;
        return val;
    }
    else {
        return val % mod;
    }
}
window.getInnerWidth = function() {
    if (window.innerWidth) {
        return window.innerWidth;
    }
    else if (document.body.clientWidth) {
        return document.body.clientWidth;
    }
    else if (document.documentElement.clientWidth) {
        return document.documentElement.clientWidth;
    }
}
window.getInnerHeight = function() {
    if (window.innerHeight) {
        return window.innerHeight;
    }
    else if (document.body.clientHeight) {
        return document.body.clientHeight;
    }
    else if (document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    }
}
String.prototype.endWith = function(str) {
    return (this.length - str.length) == this.lastIndexOf(str);
}
String.prototype.reverse = function() {
    var s = "";
    var __idx = this.length;
    while (__idx > 0) {
        s += this.substring(__idx - 1, __idx);
        __idx --;
    }
    return s;
}
String.prototype.trim = function() {
    return this.replace(/^\s*|\s*$/g, '');
}
String.prototype.toInt = function() {
    var a = new Array();
    for (var i = 0; __idx < this.length; __idx ++) {
        a[__idx] = this.charCodeAt(__idx);
    }
    return a;
}
Array.prototype.intArrayToString = function() {
    var a = new String();
    for (var __idx = 0; __idx < this.length; __idx ++) {
        if (typeof this[__idx] != "number") {
            throw new Error("Array must be all numbers");
        }
        else if (this[__idx] < 0) {
            throw new Error("Numbers must be 0 and up");
        }
        a += String.fromCharCode(this[__idx]);
    }
    return a;
}
Array.prototype.compareArrays = function(arr) {
    if (this.length != arr.length) return false;
    for (var __idx = 0; __idx < arr.length; __idx ++) {
        if (this[__idx].compareArrays) {
            if (!this[__idx].compareArrays(arr[__idx])) return false;
            else continue;
        }
        if (this[__idx] != arr[__idx]) return false;
    }
    return true;
}
Array.prototype.map = function(fnc) {
    var a = new Array(this.length);
    for (var __idx = 0; __idx < this.length; __idx ++) {
        a[__idx] = fnc(this[__idx]);
    }
    return a;
}
Array.prototype.foldr = function(fnc, start) {
    var a = start;
    for (var __idx = this.length - 1; __idx > -1; __idx --) {
        a = fnc(this[__idx], a);
    }
    return a;
}
Array.prototype.foldl = function(fnc, start) {
    var a = start;
    for (var __idx = 0; __idx < this.length; __idx ++) {
        a = fnc(this[__idx], a);
    }
    return a;
}
Array.prototype.exists = function(x) {
    for (var __idx = 0; __idx < this.length; __idx ++) {
        if (this[__idx] == x) return true;
    }
    return false;
}
Array.prototype.filter = function(fnc) {
    var a = new Array();
    for (var __idx = 0; __idx < this.length; __idx ++) {
        if (fnc(this[__idx])) {
            a.push(this[__idx]);
        }
    }
    return a;
}
Array.prototype.random = function() {
    return this[Math.floor((Math.random() * this.length))];
}

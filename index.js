(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.BMapLib = root.BMapLib || {};
        root.BMapLib.TextIconOverlay = root.BMapLib.TextIconOverlay || factory();
    }
})(this, function () {
    var T,
        baidu = T = baidu || { version: "1.3.8" };
    var context = {}
    baidu.guid = "$BAIDU$";
    context[baidu.guid] = context[baidu.guid] || {};
    baidu.dom = baidu.dom || {};
    baidu.dom.g = function (id) {
        if ('string' == typeof id || id instanceof String) {
            return document.getElementById(id);
        } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
            return id;
        }
        return null;
    };

    baidu.g = baidu.G = baidu.dom.g;
    baidu.dom.getDocument = function (element) {
        element = baidu.dom.g(element);
        return element.nodeType == 9 ? element : element.ownerDocument || element.document;
    };

    baidu.lang = baidu.lang || {};
    baidu.lang.isString = function (source) {
        return '[object String]' == Object.prototype.toString.call(source);
    };

    baidu.isString = baidu.lang.isString;
    baidu.dom._g = function (id) {
        if (baidu.lang.isString(id)) {
            return document.getElementById(id);
        }
        return id;
    };

    baidu._g = baidu.dom._g;
    baidu.browser = baidu.browser || {};

    if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
        baidu.browser.ie = baidu.ie = document.documentMode || + RegExp['\x241'];
    }
    baidu.dom.getComputedStyle = function (element, key) {
        element = baidu.dom._g(element);
        var doc = baidu.dom.getDocument(element),
            styles;
        if (doc.defaultView && doc.defaultView.getComputedStyle) {
            styles = doc.defaultView.getComputedStyle(element, null);
            if (styles) {
                return styles[key] || styles.getPropertyValue(key);
            }
        }
        return '';
    };
    baidu.dom._styleFixer = baidu.dom._styleFixer || {};
    baidu.dom._styleFilter = baidu.dom._styleFilter || [];
    baidu.dom._styleFilter.filter = function (key, value, method) {
        for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
            if (filter = filter[method]) {
                value = filter(key, value);
            }
        }
        return value;
    };

    baidu.string = baidu.string || {};
    baidu.string.toCamelCase = function (source) {
        if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
            return source;
        }
        return source.replace(/[-_][^-_]/g, function (match) {
            return match.charAt(1).toUpperCase();
        });
    };
    baidu.dom.getStyle = function (element, key) {
        var dom = baidu.dom;

        element = dom.g(element);
        key = baidu.string.toCamelCase(key);
        var value = element.style[key] ||
            (element.currentStyle ? element.currentStyle[key] : "") ||
            dom.getComputedStyle(element, key);
        if (!value) {
            var fixer = dom._styleFixer[key];
            if (fixer) {
                value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
            }
        }
        if (fixer = dom._styleFilter) {
            value = fixer.filter(key, value, 'get');
        }

        return value;
    };
    baidu.getStyle = baidu.dom.getStyle;

    if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
        baidu.browser.opera = + RegExp['\x241'];
    }

    baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);
    baidu.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
    baidu.browser.isStrict = document.compatMode == "CSS1Compat";
    baidu.dom.getPosition = function (element) {
        element = baidu.dom.g(element);
        var doc = baidu.dom.getDocument(element),
            browser = baidu.browser,
            getStyle = baidu.dom.getStyle,
            BUGGY_GECKO_BOX_OBJECT = browser.isGecko > 0 &&
                doc.getBoxObjectFor &&
                getStyle(element, 'position') == 'absolute' &&
                (element.style.top === '' || element.style.left === ''),
            pos = { "left": 0, "top": 0 },
            viewport = (browser.ie && !browser.isStrict) ? doc.body : doc.documentElement,
            parent,
            box;

        if (element == viewport) {
            return pos;
        }

        if (element.getBoundingClientRect) {
            box = element.getBoundingClientRect();
            pos.left = Math.floor(box.left) + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
            pos.top = Math.floor(box.top) + Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
            pos.left -= doc.documentElement.clientLeft;
            pos.top -= doc.documentElement.clientTop;

            var htmlDom = doc.body,
                htmlBorderLeftWidth = parseInt(getStyle(htmlDom, 'borderLeftWidth')),
                htmlBorderTopWidth = parseInt(getStyle(htmlDom, 'borderTopWidth'));
            if (browser.ie && !browser.isStrict) {
                pos.left -= isNaN(htmlBorderLeftWidth) ? 2 : htmlBorderLeftWidth;
                pos.top -= isNaN(htmlBorderTopWidth) ? 2 : htmlBorderTopWidth;
            }
        } else {

            parent = element;
            do {
                pos.left += parent.offsetLeft;
                pos.top += parent.offsetTop;
                if (browser.isWebkit > 0 && getStyle(parent, 'position') == 'fixed') {
                    pos.left += doc.body.scrollLeft;
                    pos.top += doc.body.scrollTop;
                    break;
                }

                parent = parent.offsetParent;
            } while (parent && parent != element);
            if (browser.opera > 0 || (browser.isWebkit > 0 && getStyle(element, 'position') == 'absolute')) {
                pos.top -= doc.body.offsetTop;
            }
            parent = element.offsetParent;
            while (parent && parent != doc.body) {
                pos.left -= parent.scrollLeft;
                if (!browser.opera || parent.tagName != 'TR') {
                    pos.top -= parent.scrollTop;
                }
                parent = parent.offsetParent;
            }
        }

        return pos;
    };

    baidu.event = baidu.event || {};
    baidu.event._listeners = baidu.event._listeners || [];
    baidu.event.on = function (element, type, listener) {
        type = type.replace(/^on/i, '');
        element = baidu.dom._g(element);

        var realListener = function (ev) {
            listener.call(element, ev);
        },
            lis = baidu.event._listeners,
            filter = baidu.event._eventFilter,
            afterFilter,
            realType = type;
        type = type.toLowerCase();
        if (filter && filter[type]) {
            afterFilter = filter[type](element, type, realListener);
            realType = afterFilter.type;
            realListener = afterFilter.listener;
        }

        if (element.addEventListener) {
            element.addEventListener(realType, realListener, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + realType, realListener);
        }

        lis[lis.length] = [element, type, listener, realListener, realType];
        return element;
    };

    baidu.on = baidu.event.on;
    (function () {
        var guid = context[baidu.guid];

        baidu.lang.guid = function () {
            return "TANGRAM__" + (guid._counter++).toString(36);
        };

        guid._counter = guid._counter || 1;
    })();

    context[baidu.guid]._instances = context[baidu.guid]._instances || {};
    baidu.lang.isFunction = function (source) {
        return '[object Function]' == Object.prototype.toString.call(source);
    };

    baidu.lang.Class = function (guid) {
        this.guid = guid || baidu.lang.guid();
        context[baidu.guid]._instances[this.guid] = this;
    };
    context[baidu.guid]._instances = context[baidu.guid]._instances || {};

    baidu.lang.Class.prototype.dispose = function () {
        delete context[baidu.guid]._instances[this.guid];

        for (var property in this) {
            if (!baidu.lang.isFunction(this[property])) {
                delete this[property];
            }
        }
        this.disposed = true;
    };

    baidu.lang.Class.prototype.toString = function () {
        return "[object " + (this._className || "Object") + "]";
    };

    baidu.lang.Event = function (type, target) {
        this.type = type;
        this.returnValue = true;
        this.target = target || null;
        this.currentTarget = null;
    };

    baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
        if (!baidu.lang.isFunction(handler)) {
            return;
        }

        !this.__listeners && (this.__listeners = {});

        var t = this.__listeners, id;
        if (typeof key == "string" && key) {
            if (/[^\w\-]/.test(key)) {
                throw ("nonstandard key:" + key);
            } else {
                handler.hashCode = key;
                id = key;
            }
        }
        type.indexOf("on") != 0 && (type = "on" + type);

        typeof t[type] != "object" && (t[type] = {});
        id = id || baidu.lang.guid();
        handler.hashCode = id;
        t[type][id] = handler;
    };

    baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
        if (typeof handler != "undefined") {
            if ((baidu.lang.isFunction(handler) && !(handler = handler.hashCode))
                || (!baidu.lang.isString(handler))
            ) {
                return;
            }
        }

        !this.__listeners && (this.__listeners = {});

        type.indexOf("on") != 0 && (type = "on" + type);

        var t = this.__listeners;
        if (!t[type]) {
            return;
        }
        if (typeof handler != "undefined") {
            t[type][handler] && delete t[type][handler];
        } else {
            for (var guid in t[type]) {
                delete t[type][guid];
            }
        }
    };

    baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
        if (baidu.lang.isString(event)) {
            event = new baidu.lang.Event(event);
        }
        !this.__listeners && (this.__listeners = {});
        options = options || {};
        for (var i in options) {
            event[i] = options[i];
        }

        var i, t = this.__listeners, p = event.type;
        event.target = event.target || this;
        event.currentTarget = this;
        p.indexOf("on") != 0 && (p = "on" + p);
        baidu.lang.isFunction(this[p]) && this[p].apply(this, arguments);
        if (typeof t[p] == "object") {
            for (i in t[p]) {
                t[p][i].apply(this, arguments);
            }
        }
        return event.returnValue;
    };


    baidu.lang.inherits = function (subClass, superClass, className) {
        var key, proto,
            selfProps = subClass.prototype,
            clazz = new Function();

        clazz.prototype = superClass.prototype;
        proto = subClass.prototype = new clazz();
        for (key in selfProps) {
            proto[key] = selfProps[key];
        }
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;
        if ("string" == typeof className) {
            proto._className = className;
        }
    };
    baidu.inherits = baidu.lang.inherits;
    var _IMAGE_PATH = 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/images/m';
    var _IMAGE_EXTENSION = 'png';

    var TextIconOverlay = function (position, text, options) {
        try {
            BMap;
        } catch (e) {
            throw Error('Baidu Map JS API is not ready yet!');
        }
        T.lang.inherits(TextIconOverlay, BMap.Overlay, "TextIconOverlay");
        this._position = position;
        this._text = text;
        this._options = options || {};
        this._styles = this._options['styles'] || [];
        (!this._styles.length) && this._setupDefaultStyles();
    };


    TextIconOverlay.prototype._setupDefaultStyles = function () {
        var sizes = [53, 56, 66, 78, 90];
        for (var i = 0, size; size = sizes[i]; i++) {
            this._styles.push({
                url: _IMAGE_PATH + i + '.' + _IMAGE_EXTENSION,
                size: new BMap.Size(size, size)
            });
        }
    };

    TextIconOverlay.prototype.initialize = function (map) {
        this._map = map;

        this._domElement = document.createElement('div');
        this._updateCss();
        this._updateText();
        this._updatePosition();
        this._bind();

        this._map.getPanes().markerMouseTarget.appendChild(this._domElement);
        return this._domElement;
    };

    TextIconOverlay.prototype.draw = function () {
        this._map && this._updatePosition();
    };

    TextIconOverlay.prototype.getText = function () {
        return this._text;
    };

    TextIconOverlay.prototype.setText = function (text) {
        if (text && (!this._text || (this._text.toString() != text.toString()))) {
            this._text = text;
            this._updateText();
            this._updateCss();
            this._updatePosition();
        }
    };

    TextIconOverlay.prototype.getPosition = function () {
        return this._position;
    };

    TextIconOverlay.prototype.setPosition = function (position) {
        if (position && (!this._position || !this._position.equals(position))) {
            this._position = position;
            this._updatePosition();
        }
    };

    TextIconOverlay.prototype.getStyleByText = function (text, styles) {
        var count = parseInt(text);
        var index = parseInt(count / 10);
        index = Math.max(0, index);
        index = Math.min(index, styles.length - 1);
        return styles[index];
    }

    TextIconOverlay.prototype._updateCss = function () {
        if (!this._domElement) {
            return
        }
        var style = this.getStyleByText(this._text, this._styles);
        this._domElement.style.cssText = this._buildCssText(style);
    };

    TextIconOverlay.prototype._updateText = function () {
        if (this._domElement) {
            this._domElement.innerHTML = this._text;
        }
    };

    TextIconOverlay.prototype._updatePosition = function () {
        if (this._domElement && this._position) {
            var style = this._domElement.style;
            var pixelPosition = this._map.pointToOverlayPixel(this._position);
            pixelPosition.x -= Math.ceil(parseInt(style.width) / 2);
            pixelPosition.y -= Math.ceil(parseInt(style.height) / 2);
            style.left = pixelPosition.x + "px";
            style.top = pixelPosition.y + "px";
        }
    };

    TextIconOverlay.prototype._buildCssText = function (style) {
        var url = style['url'];
        var size = style['size'];
        var anchor = style['anchor'];
        var offset = style['offset'];
        var textColor = style['textColor'] || 'black';
        var textSize = style['textSize'] || 10;

        var csstext = [];
        if (T.browser["ie"] < 7) {
            csstext.push('filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(' +
                'sizingMethod=scale,src="' + url + '");');
        } else {
            csstext.push('background-image:url(' + url + ');');
            var backgroundPosition = '0 0';
            (offset instanceof BMap.Size) && (backgroundPosition = offset.width + 'px' + ' ' + offset.height + 'px');
            csstext.push('background-position:' + backgroundPosition + ';');
        }

        if (size instanceof BMap.Size) {
            if (anchor instanceof BMap.Size) {
                if (anchor.height > 0 && anchor.height < size.height) {
                    csstext.push('height:' + (size.height - anchor.height) + 'px; padding-top:' + anchor.height + 'px;');
                }
                if (anchor.width > 0 && anchor.width < size.width) {
                    csstext.push('width:' + (size.width - anchor.width) + 'px; padding-left:' + anchor.width + 'px;');
                }
            } else {
                csstext.push('height:' + size.height + 'px; line-height:' + size.height + 'px;');
                csstext.push('width:' + size.width + 'px; text-align:center;');
            }
        }

        csstext.push('cursor:pointer; color:' + textColor + '; position:absolute; font-size:' +
            textSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
        return csstext.join('');
    };

    TextIconOverlay.prototype._bind = function () {
        if (!this._domElement) {
            return;
        }
        var me = this;
        var map = this._map;
        var BaseEvent = T.lang.Event;
        function eventExtend(e, be) {
            var elem = e.srcElement || e.target;
            var x = e.clientX || e.pageX;
            var y = e.clientY || e.pageY;
            if (e && be && x && y && elem) {
                var offset = T.dom.getPosition(map.getContainer());
                be.pixel = new BMap.Pixel(x - offset.left, y - offset.top);
                be.point = map.pixelToPoint(be.pixel);
            }
            return be;
        }

        T.event.on(this._domElement, "mouseover", function (e) {
            me.dispatchEvent(eventExtend(e, new BaseEvent("onmouseover")));
        });
        T.event.on(this._domElement, "mouseout", function (e) {
            me.dispatchEvent(eventExtend(e, new BaseEvent("onmouseout")));
        });
        T.event.on(this._domElement, "click", function (e) {
            me.dispatchEvent(eventExtend(e, new BaseEvent("onclick")));
        });
    };

    return TextIconOverlay;
});

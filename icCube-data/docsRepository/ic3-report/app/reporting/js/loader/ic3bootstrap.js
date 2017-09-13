/*
 * Copyright 1999 - 2016 icCube software Llc.
 *
 * The code and all underlying concepts and data models are owned fully
 * and exclusively by icCube software Llc. and are protected by
 * copyright law and international treaties.
 *
 * Warning: Unauthorized reproduction, use or distribution of this
 * program, concepts, documentation and data models, or any portion of
 * it, may result in severe civil and criminal penalties, and will be
 * prosecuted to the maximum extent possible under the law.
 */

/*
 * icCube Web Reporting : 6.0.2 ( 3961 )
 */

/*
 * $script.js JS loader & dependency manager
 * https://github.com/ded/script.js?v=2017026095037
 * (c) Dustin Diaz 2014 | License MIT
 */
(function(e,t){typeof module!="undefined"&&module.exports?module.exports=t():typeof define=="function"&&define.amd?define(t):this[e]=t()})("$script",function(){function p(e,t){for(var n=0,i=e.length;n<i;++n)if(!t(e[n]))return r;return 1}function d(e,t){p(e,function(e){return t(e),1})}function v(e,t,n){function g(e){return e.call?e():u[e]}function y(){if(!--h){u[o]=1,s&&s();for(var e in f)p(e.split("|"),g)&&!d(f[e],g)&&(f[e]=[])}}e=e[i]?e:[e];var r=t&&t.call,s=r?t:n,o=r?e.join(""):t,h=e.length;return setTimeout(function(){d(e,function t(e,n){if(e===null)return y();!n&&!/^https?:\/\//.test(e)&&c&&(e=e.indexOf(".js")===-1?c+e+".js?v=2017026095037":c+e);if(l[e])return o&&(a[o]=1),l[e]==2?y():setTimeout(function(){t(e,!0)},0);l[e]=1,o&&(a[o]=1),m(e,y)})},0),v}function m(n,r){var i=e.createElement("script"),u;i.onload=i.onerror=i[o]=function(){if(i[s]&&!/^c|loade/.test(i[s])||u)return;i.onload=i[o]=null,u=1,l[n]=2,r()},i.async=1,i.src=h?n+(n.indexOf("?")===-1?"?":"&")+h:n,t.insertBefore(i,t.lastChild)}var e=document,t=e.getElementsByTagName("head")[0],n="string",r=!1,i="push",s="readyState",o="onreadystatechange",u={},a={},f={},l={},c,h;return v.get=m,v.order=function(e,t,n){(function r(i){i=e.shift(),e.length?v(i,r):v(i,t,n)})()},v.path=function(e){c=e},v.urlArgs=function(e){h=e},v.ready=function(e,t,n){e=e[i]?e:[e];var r=[];return!d(e,function(e){u[e]||r[i](e)})&&p(e,function(e){return u[e]})?t():!function(e){f[e]=f[e]||[],f[e][i](t),n&&n(r)}(e.join("|")),v},v.done=function(e){v([null],e)},v});

/**
 * bootstrapper helper function to detect dead internet link
 */
function $isOnline(url, cb, timeout) {
    var t, i = new Image(), a = document.createElement('a');
    var _cb = function() {
        clearTimeout(t);
        i.onerror = i.onabort = i.onload = undefined;
        cb.apply(i, arguments);
    };

    if (navigator.onLine) {
        a.href = url;
        i.onload = _cb.bind(i, true);
        i.onerror = i.onabort = _cb.bind(i, false);
        i.src = a.origin + '/favicon.ico?' + (+new Date());
        t = setTimeout(_cb.bind(i, false), timeout || 5000);
    } else {
        cb.call(i, false);
    }
}

/**
 * ic3 helper function to load in sequence a bunch of JS files.
 */
function $scripts(hrefs, callback) {
    function $script_(hrefs, pos) {
        if (pos < hrefs.length) {
            $script(hrefs[pos], function () {
                $script_(hrefs, ++pos);
            });
        }
        else {
            callback();
        }
    }
    $script_(hrefs, hrefs[0] == "" /* 'coz of bad code generation in ANT file */ ? 1 : 0);
}

/**
 * ic3 requested CSS : used for a wait all CSS loaded logic.
 */
var ic3allRequestedCss = {};

/**
 * ic3 asynchronous load of CSS files (busy wait).
 */
function ic3css(href, callback) {

    ic3allRequestedCss[href] = 0 /* unloaded */;

    var link = document.createElement('link');
    {
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = href;

        link.__done = function () {

            ic3allRequestedCss[href] = 1 /* loaded */;

            if (callback) {
                callback();
            }
        };
    }

    function timer() {
        for (var idx = 0; idx < document.styleSheets.length; idx++) {
            if (document.styleSheets[idx].href == link.href) {
                return link.__done();
            }
        }
        setTimeout(timer, 50);
    }

    if (document.all /* IE */) {
        link.attachEvent('onreadystatechange', function () {
            if (link.readyState == 'complete' || link.readyState == 'loaded') {
                link.__done();
            }
        });
    }
    else /* busy wait */{
        setTimeout(timer, 50);
    }

    document.getElementsByTagName("head")[0].appendChild(link);
}

/**
 * ic3 wait for all CSS logic (busy wait).
 */
function ic3cssWaitForAll(callback) {

    function timer() {

        var done = true;

        $.each(ic3allRequestedCss, function (key, item) {

            if (item == 0 /* still unloaded */) {
                done = false;
                return false;
            }

        });

        if (!done) {
            setTimeout(timer, 50);
        }
        else if (callback) {
            callback();
        }
    }

    setTimeout(timer, 0);
}

function ic3LoadCss(customLibs) {
    customLibs["font-awesome-css"] && ic3css(customLibs["font-awesome-css"]);
    customLibs["glyphicons-css"] && ic3css(customLibs["glyphicons-css"]);
    customLibs["glyphicons-bootstrap-css"] && ic3css(customLibs["glyphicons-bootstrap-css"]);
    customLibs["glyphicons-halflings-css"] && ic3css(customLibs["glyphicons-halflings-css"]);
    customLibs["bootstrap-css"] && ic3css(customLibs["bootstrap-css"]);
    customLibs["jquery-ui-aristo"] && ic3css(customLibs["jquery-ui-aristo"]);
    customLibs["jquery-contextmenu-css"] && ic3css(customLibs["jquery-contextmenu-css"]);
    customLibs["slickgrid-css"] && ic3css(customLibs["slickgrid-css"]);
    customLibs["codemirror-css"] && ic3css(customLibs["codemirror-css"]);
    customLibs["open-sans-css"] && ic3css(customLibs["open-sans-css"]);
}

function ic3LoadCustomLibs(customLibs) {
    var deps = ["es5-shim", "es5-sham", "b64", "mutationobserver", "jquery", "lodash", "react-with-addons", "react-dom",
                "mathjs", "momentjs", "classnames", "lz4", "jquery-ui", "jshashtable", "jquery-slimscroll",
                "jquery-contextmenu", "jquery-mousewheel", "jquery-numberformatter", "dotjs", "bootstrap", "react-dnd",
                "react-onclickoutside", "react-slider", "react-datepicker", "react-dnd-touch", "slickgrid", "jshint",
                "codemirror", "codemirror-extras", "dom-to-image", "d3", "d3-cloud", "d3-hierarchy"];
    function loadIfPresent(name) {
        if(customLibs[name] !== false) {
            $script(customLibs[name], name);
        }
        else {
            $script.done(name);
        }
    }
    loadIfPresent("es5-shim");
    $script.ready("es5-shim", function() {
        loadIfPresent("es5-sham");
    });
    loadIfPresent("b64");
    loadIfPresent("mutationobserver");
    loadIfPresent("jquery");
    loadIfPresent("lodash");
    $script.ready("lodash", function() {
        window.LoDashStatic = window._;
        loadIfPresent("momentjs");
    });
    $script.ready(["es5-shim", "es5-sham", "classnames"], function() {
        loadIfPresent("react-with-addons");
    });
    $script.ready("react-with-addons", function() {
        loadIfPresent("react-dom");
    });
    loadIfPresent("mathjs");
    loadIfPresent("classnames");
    loadIfPresent("lz4");
    $script.ready("jquery", function() {
        loadIfPresent("jquery-ui");
        loadIfPresent("bootstrap");
        loadIfPresent("slickgrid");
    });
    loadIfPresent("jshashtable");
    $script.ready("jquery-ui", function() {
        loadIfPresent("jquery-slimscroll");
        loadIfPresent("jquery-contextmenu");
        loadIfPresent("jquery-mousewheel");
    });
    $script.ready(["jquery-ui", "jshashtable"], function() {
        loadIfPresent("jquery-numberformatter");
    });
    loadIfPresent("dotjs");
    $script.ready("react-dom", function() {
        loadIfPresent("react-dnd");
        loadIfPresent("react-onclickoutside");
        loadIfPresent("react-slider");
    });
    $script.ready(["momentjs", "react-dom", "react-onclickoutside"], function() {
        loadIfPresent("react-datepicker");
    });
    $script.ready(["react-dom", "react-dnd"], function() {
        loadIfPresent("react-dnd-touch");
    });

    loadIfPresent("jshint");
    $script.ready("jshint", function() {
        loadIfPresent("codemirror");
    });
    $script.ready("codemirror", function() {
        loadIfPresent("codemirror-extras");
    });
    loadIfPresent("dom-to-image");
    loadIfPresent("d3");
    $script.ready("d3", function() {
        loadIfPresent("d3-cloud");
        loadIfPresent("d3-hierarchy");
        loadIfPresent("d3v4");
    });
    return deps;
}

function ic3LoadMinLibs(customLibs) {
    $script(customLibs["ic3-base-libraries"], "ic3-base-libraries");
    $script.ready("ic3-base-libraries", function() {
        window.LoDashStatic = window._;
    });
    return "ic3-base-libraries";
}

/**
 * ic3 Web Reporting specific files (triggers ic3report).
 */
function ic3loadReporting(root, deps) {
    ic3css(root + 'reporting/css/ic3-reporting.css?v=2017026095037');
    $script(root + 'reporting/js/ic3report-all.js?v=2017026095037', 'ic3report');
}

/**
 * ic3 Widgets Libs : trigger 'ic3widgets' when ready.
 */
function ic3loadWidgetsLibs(root, options) {

    var min = options.librariesMode === "production" ? ".min" : "";

    var libs = options.libs;

    var deps = [];


    // =======================================
    // Tiny MCE

    if (libs.TinyMCE !== false) {

        deps.push('TinyMCE');

        $script(root + 'lib/tinyMCE-4.0.11/tinymce.min.js?v=2017026095037', function () {
            tinymce.dom.Event.domLoaded = true;
            $script(root + 'lib/tinyMCE-4.0.11/jquery.tinymce.min.js?v=2017026095037', function () {
                ic3globals.libs.TinyMCE = true;
                $script(root + 'lib/tinyMCE-4.0.11/react-tinymce.min.js?v=2017026095037', function () {
                    $script.done('TinyMCE');
                })
            })
        });
    }

    // =======================================
    // amcharts

    if (libs.amCharts !== false) {

        deps.push('amCharts');

        $script(root + 'lib/amcharts_3.20.19/amcharts/amcharts-full' + min + '.js?v=2017026095037', function () {
            ic3globals.libs.amCharts = true;
            AmCharts.isReady = !0 /* guess fine even if AmCharts.handleLoad is called */;
            AmCharts_path = root + 'lib/amcharts_3.20.19/amcharts/';
            $script.done('amCharts');
        });
    }

    // =======================================
    // Google Maps
    if (libs.GoogleMaps !== false) {
        deps.push('googleMaps');
        var googleMapsUrl = "https://maps.google.com/maps/api/js?libraries=geometry,visualization";
        if(options.googleMapApiKey) {
            googleMapsUrl += "&key=" + options.googleMapApiKey;
        }

        $isOnline(googleMapsUrl, function(online) {
            ic3globals.libs.GoogleMaps = false;
            if (online) {
                $script(googleMapsUrl, function() {
                    $script(root + 'lib/geoxml3/geoxml3.js?v=2017026095037', 'googleMaps', function() {
                        ic3globals.libs.GoogleMaps = true;
                    });
                });
            } else {
                $script.done('googleMaps');
            }
        });
    }

    // =======================================
    // Let's wait until all loaded ...

    $script.ready(deps, function () {
        $script.done('ic3widgets');
    });
}

/**
 * Google load requires $(document).ready before calling it (reference documentation).
 */
function ic3loadGoogleViz(callback) {
    var d3global = window.d3;

    window.d3 = undefined;
    window.ic3googleVIZ = function () {
        window.d3 = d3global;
        callback();
    };

    window.ic3googleJSAPI = function () {
        google.load("visualization", "1", {
            "callback": ic3googleVIZ,
            packages: ['corechart', 'geochart', 'table', 'sankey', 'calendar']
        });
    };

    (function () {
        var script = document.createElement("script");
        {
            script.src = "https://www.google.com/jsapi?callback=ic3googleJSAPI";
            script.type = "text/javascript";
        }
        document.getElementsByTagName("head")[0].appendChild(script);
    })();

}

function ic3readyBeforePlugins(options) {
    var hasCSS = false;
    $.each(ic3globals.plugins, function (idx, plugin) {
        if (plugin.loadCSS) {
            hasCSS = true;
            plugin.loadCSS(options);
        }
    });

    if (hasCSS) {
        ic3cssWaitForAll(function () /* before actual rendering is taking place */ {
            ic3readyBeforePluginsJS(options);
        });
    }
    else {
        ic3readyBeforePluginsJS(options);
    }
}

function ic3readyBeforePluginsJS(options) {

    var deps = [];

    $.each(ic3globals.plugins, function (idx, plugin) {

        if (plugin.loadJS) {

            deps.push(plugin.name);

            plugin.loadJS(
            {
                root: options.root,
                rootLocal: options.rootLocal,

                callback: function () {
                    $script.done(plugin.name);
                }
            });

        }

    });

    if (deps.length > 0) {
        $script.ready(deps, function () { /* asynchronous callback */
            options.callback && options.callback();
        });
    }
    else {
        options.callback && options.callback();
    }
}

function ic3fix() {

    if (window.AmCharts && AmCharts.toColor) {

        // While adding 'colorField', numbers and null-s were not expected

        AmCharts.toColor = function (a) {
            a || (a = '');

            if ("" !== a && void 0 !== a && typeof a == "string") {
                if (-1 != a.indexOf(",")) {
                    a = a.split(",");
                    var b;
                    for (b = 0; b < a.length; b++) {
                        var c = a[b].substring(a[b].length - 6, a[b].length);
                        a[b] = "#" + c
                    }
                }
                else {
                    a = a.substring(a.length - 6, a.length), a = "#" + a;
                }
            }
            return a
        };
    }
}

/**
 * ic3 wait for all dependencies and invoke the callback function.
 */
function ic3readyEx(options) {

    var root = options.root;
    var rootLocal = options.rootLocal;

    ic3globals.root = options.root;
    ic3globals.rootLocal = options.rootLocal;
    ic3globals.imagesPath = options.imagesPath || ic3globals.imagesPath;

    var ready = function () {
        $script.ready(['ic3report', 'ic3widgets'], function () {

            if (rootLocal) {
                ic3css(rootLocal + 'ic3report-local.css');
            }

            // restore lodash
            window._ = window.LoDashStatic;

            ic3cssWaitForAll(function () /* before actual rendering is taking place */ {

                ic3allRequestedCss = {} /* ic3cssWaitForAll will be used */;

                ic3fix();

                if (rootLocal) {

                    $script(rootLocal + 'ic3report-local.js', function () {

                        if (typeof ic3bootstrapLocal == 'function') {

                            var localOptions = {

                                root: root,
                                rootLocal: rootLocal,

                                callback: function () {
                                    ic3readyBeforePlugins(options);
                                }
                            };

                            ic3bootstrapLocal(localOptions);

                        }
                        else {
                            ic3readyBeforePlugins(options);
                        }

                    });

                }
                else {
                    ic3readyBeforePlugins(options);
                }

            });
        });

    };

    if (options.libs.GoogleViz !== false) {

        // Google Viz. is not required to load ic3report (widget adapters only)
        $isOnline("https://www.google.com/jsapi?callback=ic3googleJSAPI", function(online) {
            if (online) {
                ic3loadGoogleViz(function () {
                    ic3globals.libs.GoogleViz = true;
                    ready();
                });
            } else {
                ready();
            }
        });
    }
    else {
        ready();
    }
    $script.ready("ic3widgets", function() {
        ic3loadReporting(root);
    });
    ic3loadWidgetsLibs(root, options) /* will trigger ic3widgets */;
}

function initLibsList(options) {
    function defaultPath(name, directory, filename, fileExtension) {
        var original = options.customLibraries[name];
        if (original === false || original) {
            return;
        }
        fileExtension = fileExtension || ".js";
        options.customLibraries[name] = options.root + "lib/" + directory + "/" + filename + (options.librariesMode === "production" ? ".min" : "") + fileExtension;
    }

    options.librariesMode = options.librariesMode || "production";
    if (options.customLibraries && Object.keys(options.customLibraries).length < 1 && options.librariesMode === "production") {
        // Load all libraries using single minified file
        options.customLibraries = options.customLibraries || {};
        options.customLibraries["ic3-base-libraries"] = options.root + "lib/ic3/base-libraries.min.js?v=2017026095037";
    }
    else {
        options.customLibraries = options.customLibraries || {};
        // Load libraries using custom loader
        defaultPath("es5-shim", "es5-shim-4.5.9", "es5-shim");
        defaultPath("es5-sham", "es5-shim-4.5.9", "es5-sham");
        defaultPath("b64", "shims", "b64");
        defaultPath("mutationobserver", "shims", "mutationobserver");
        defaultPath("jquery", "jquery-2.2.4", "jquery-2.2.4");
        defaultPath("lodash", "lodash-4.15.0", "lodash");
        defaultPath("react-with-addons", "react-0.14.8", "react-with-addons-0.14.8");
        defaultPath("react-dom", "react-0.14.8", "react-dom-0.14.8");
        defaultPath("mathjs", "mathjs-3.5.0", "math");
        defaultPath("momentjs", "momentjs-2.14.1", "moment-locales");
        defaultPath("classnames", "classnames-2.2.5", "classnames");
        defaultPath("lz4", "lz4-0.3.11", "lz4");
        defaultPath("jquery-ui", "jquery-ui-1.12.0", "jquery-ui");
        defaultPath("jquery-slimscroll", "jquery-slimscroll-1.3.8", "jquery.slimscroll");
        defaultPath("jquery-contextmenu", "jquery-contextmenu-2.2.5", "jquery.contextMenu");
        defaultPath("jquery-mousewheel", "jquery-mousewheel-3.1.13", "jquery.mousewheel");
        defaultPath("jshashtable", "jquery-numberformatter", "jshashtable-3.0");
        defaultPath("jquery-numberformatter", "jquery-numberformatter", "jquery.numberformatter-1.2.4");
        defaultPath("dotjs", "dotjs", "dot");
        defaultPath("bootstrap", "bootstrap-3.3.7/js", "bootstrap");
        defaultPath("react-dnd", "react-dnd-2.0.2", "ReactDnD");
        defaultPath("react-dnd-touch", "react-dnd-touch-0.2.5", "Touch");
        defaultPath("react-onclickoutside", "react-onclickoutside-4.9.0", "onclickoutside");
        defaultPath("react-slider", "react-slider-0.5.1", "react-slider");
        defaultPath("react-datepicker", "react-datepicker-0.25.0", "react-datepicker");
        defaultPath("slickgrid", "slickgrid", "slickgrid");
        defaultPath("jshint", "jshint", "jshint");
        defaultPath("codemirror", "codemirror", "codemirror-all");
        defaultPath("codemirror-extras", "codemirror", "extras");
        defaultPath("dom-to-image", "dom-to-image-07.10.2016", "dom-to-image");
        defaultPath("d3", "d3-3.5.17", "d3");
        defaultPath("d3-cloud", "d3-cloud-1.2.2/build", "d3.layout.cloud");
        defaultPath("d3-hierarchy", "d3-hierarchy-1.0.3", "d3-hierarchy");
        defaultPath("d3v4", "d3-4.4.0", "d3");
    }
    defaultPath("jquery-ui-aristo", "jquery-ui-1.12.0/aristo", "jquery-ui-aristo", ".css?v=2017026095037");
    defaultPath("jquery-contextmenu-css", "jquery-contextmenu-2.2.5", "jquery.contextMenu", ".css");
    defaultPath("font-awesome-css", "font-awesome-4.6.3/css", "font-awesome", ".css?v=2017026095037");
    defaultPath("glyphicons-css", "glyphicons/css", "glyphicons", ".css?v=2017026095037");
    defaultPath("glyphicons-bootstrap-css", "glyphicons/css", "glyphicons-bootstrap", ".css?v=2017026095037");
    defaultPath("glyphicons-halflings-css", "glyphicons-halflings/css", "glyphicons-halflings", ".css?v=2017026095037");
    defaultPath("bootstrap-css", "bootstrap-3.3.7/css", "bootstrap", ".css?v=2017026095037");
    defaultPath("slickgrid-css", "slickgrid", "slickgrid", ".css");
    defaultPath("codemirror-css", "codemirror", "codemirror", ".css");
    defaultPath("open-sans-css", "open-sans", "open-sans", ".css");

    return options;
}

/**
 * ic3 wait for all dependencies and invoke the callback function.
 */
function ic3ready(options) {
    /**
     * Leave the opportunity to the caller to directly specify those values. But the typical flow
     * will be that all paths are undefined and possibly defined via the call to ic3report-config.js.
     *
     * The ic3bootstrap is typically from an application directory file : ic3report.html and therefore
     * is erased each time a new version is installed.
     *
     * ic3report-config.js is an /app-local file.
     */

    var callback = options.callback;

    /**
     * Wraps the original callback into a $(document).ready to ensure the
     * DOM is ready before starting the Web Reporting application ...
     */
    options.callback = function () {
        $(document).ready(function () {
            if (options.print) {
                if (options.print.active) {

                    var $body = $('body');

                    $body.addClass("ic3-print");

                    $body.css('width', options.print.body.width);
                    $body.css('height', options.print.body.height);

                    if (options.print.inBrowser) {

                        $body.css('box-shadow', '1px 1px 1px #ff9900')
                    }
                }
            }
            callback && callback();
        });
    };

    ic3globals.root = options.root;
    ic3globals.rootLocal = options.rootLocal;

    ic3globals.print = options.print;

    options.libs = /* before ic3report-config.js?v=2017026095037 being called and possibly re-configuring that setup */
    {
        /**
         * AmCharts
         */
        amCharts: true,
        /**
         * Google Maps
         */
        GoogleMaps: true,
        /**
         * Google Visualization Charts / Templates
         */
        googleViz: true,
        /**
         * HTML Widget (WYSIWYG editor)
         */
        tinyMCE: true,
        /**
         * icCube's Table
         */
        bigTable: true
    };

    options.server = /* before ic3report-config.js?v=2017026095037 being called and possibly re-configuring that setup */ {

        /**
         * icCube server is using the Cross Origin filter : in that case the Web Reporting
         * does not need to send JSONP requests. Regular AJAX POST requests can be sent.
         */
        crossOriginAllowed: options.server ? options.server.crossOriginAllowed === true : false
    };

    options.request = /* before ic3report-config.js?v=2017026095037 being called and possibly re-configuring that setup */ {

        /**
         * Parameters of GVI requests are possibly compressed ( Javascript client to Java server ).
         */
        compress: true,

        /**
         * The minimum length ( i.e., char count ) of string parameters being actually compressed.
         */
        compressMinLength: 4096,

        cache : {
            /**
             *  Whether cache MDX requests or not
             */
            enabled : true,

            /**
             *   Maximum Cache size (MB)
             */
            maxSize: 10,

            /**
             *  How often query server to check if schema has changed (ms)
             */
            schemaChangeCheckFrequency: 60000

        }
    };

    if (options.rootLocal) {
        $script(options.rootLocal + 'ic3report-config.js', function () {
            if (typeof ic3config == 'function') {
                ic3config(options);
            }

            ic3globals.server = options.server;
            ic3globals.request = options.request;

            options = initLibsList(options);
            ic3LoadLibraries(options);
        });
    }
    else {
        ic3globals.server = options.server;
        ic3globals.request = options.request;

        options = initLibsList(options);
        ic3LoadLibraries(options);
    }
}

function ic3LoadLibraries(options) {
    ic3LoadCss(options.customLibraries);
    var deps = null;
    if(options.customLibraries["ic3-base-libraries"]) {
        deps = ic3LoadMinLibs(options.customLibraries);
    }
    else {
        deps = ic3LoadCustomLibs(options.customLibraries);
    }
    $script.ready(deps, function () {
        ic3readyEx(options);
    });
}

/**
 * Application content (e.g., widgets) setup purpose.
 *
 * The library flags are setup once the libraries have been actually loaded
 * and indicate that the libraries are available within the application.
 *
 * root / rootLocal are setup at the same time.
 *
 * @see #ic3ready
 */
ic3globals = {

    root: null,
    rootLocal: null,

    libs: {
        amCharts: false,
        GoogleMaps: false,
        GoogleViz: false,
        TinyMCE: false
    },

    imagesPath: 'ic3-report/app/reporting/images',

    plugins: []

};

ic3debug = {

    print: {

        message: null,

        fitToPage: null,
        keepAspectRatio: null,

        sizeIndicator: null,

        w: null,
        h: null,

        zoomX: null,
        zoomY: null,

        zoomFont: null

    }

};

function ic3RegisterTheme(themeName, rootPath, jsFile, cssFile) {
    ic3globals.plugins.push(
    {
        name: themeName,
        loadCSS: function (options) {

            var root = options.rootLocal + rootPath;
            ic3css(root + cssFile);
        },
        loadJS: function (options) {
            var root = options.rootLocal + rootPath;
            var deps = [themeName];
            $script(root + jsFile, deps[0]);
            $script.ready(deps, function () {
                options.callback && options.callback();
            });
        }
    });
}

var AmCharts_path;

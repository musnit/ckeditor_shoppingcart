
/*!

 handlebars v1.3.0

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
/* exported Handlebars */
var Handlebars = (function() {
// handlebars/safe-string.js
var __module3__ = (function() {
  "use strict";
  var __exports__;
  // Build out our basic SafeString type
  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = function() {
    return "" + this.string;
  };

  __exports__ = SafeString;
  return __exports__;
})();

// handlebars/utils.js
var __module2__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  /*jshint -W004 */
  var SafeString = __dependency1__;

  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  function escapeChar(chr) {
    return escape[chr] || "&amp;";
  }

  function extend(obj, value) {
    for(var key in value) {
      if(Object.prototype.hasOwnProperty.call(value, key)) {
        obj[key] = value[key];
      }
    }
  }

  __exports__.extend = extend;var toString = Object.prototype.toString;
  __exports__.toString = toString;
  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isFunction = function(value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  var isFunction;
  __exports__.isFunction = isFunction;
  var isArray = Array.isArray || function(value) {
    return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
  };
  __exports__.isArray = isArray;

  function escapeExpression(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof SafeString) {
      return string.toString();
    } else if (!string && string !== 0) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = "" + string;

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  }

  __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  __exports__.isEmpty = isEmpty;
  return __exports__;
})(__module3__);

// handlebars/exception.js
var __module4__ = (function() {
  "use strict";
  var __exports__;

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function Exception(message, node) {
    var line;
    if (node && node.firstLine) {
      line = node.firstLine;

      message += ' - ' + line + ':' + node.firstColumn;
    }

    var tmp = Error.prototype.constructor.call(this, message);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }

    if (line) {
      this.lineNumber = line;
      this.column = node.firstColumn;
    }
  }

  Exception.prototype = new Error();

  __exports__ = Exception;
  return __exports__;
})();

// handlebars/base.js
var __module1__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;

  var VERSION = "1.3.0";
  __exports__.VERSION = VERSION;var COMPILER_REVISION = 4;
  __exports__.COMPILER_REVISION = COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '>= 1.0.0'
  };
  __exports__.REVISION_CHANGES = REVISION_CHANGES;
  var isArray = Utils.isArray,
      isFunction = Utils.isFunction,
      toString = Utils.toString,
      objectType = '[object Object]';

  function HandlebarsEnvironment(helpers, partials) {
    this.helpers = helpers || {};
    this.partials = partials || {};

    registerDefaultHelpers(this);
  }

  __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,

    logger: logger,
    log: log,

    registerHelper: function(name, fn, inverse) {
      if (toString.call(name) === objectType) {
        if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
        Utils.extend(this.helpers, name);
      } else {
        if (inverse) { fn.not = inverse; }
        this.helpers[name] = fn;
      }
    },

    registerPartial: function(name, str) {
      if (toString.call(name) === objectType) {
        Utils.extend(this.partials,  name);
      } else {
        this.partials[name] = str;
      }
    }
  };

  function registerDefaultHelpers(instance) {
    instance.registerHelper('helperMissing', function(arg) {
      if(arguments.length === 2) {
        return undefined;
      } else {
        throw new Exception("Missing helper: '" + arg + "'");
      }
    });

    instance.registerHelper('blockHelperMissing', function(context, options) {
      var inverse = options.inverse || function() {}, fn = options.fn;

      if (isFunction(context)) { context = context.call(this); }

      if(context === true) {
        return fn(this);
      } else if(context === false || context == null) {
        return inverse(this);
      } else if (isArray(context)) {
        if(context.length > 0) {
          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        return fn(context);
      }
    });

    instance.registerHelper('each', function(context, options) {
      var fn = options.fn, inverse = options.inverse;
      var i = 0, ret = "", data;

      if (isFunction(context)) { context = context.call(this); }

      if (options.data) {
        data = createFrame(options.data);
      }

      if(context && typeof context === 'object') {
        if (isArray(context)) {
          for(var j = context.length; i<j; i++) {
            if (data) {
              data.index = i;
              data.first = (i === 0);
              data.last  = (i === (context.length-1));
            }
            ret = ret + fn(context[i], { data: data });
          }
        } else {
          for(var key in context) {
            if(context.hasOwnProperty(key)) {
              if(data) { 
                data.key = key; 
                data.index = i;
                data.first = (i === 0);
              }
              ret = ret + fn(context[key], {data: data});
              i++;
            }
          }
        }
      }

      if(i === 0){
        ret = inverse(this);
      }

      return ret;
    });

    instance.registerHelper('if', function(conditional, options) {
      if (isFunction(conditional)) { conditional = conditional.call(this); }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });

    instance.registerHelper('unless', function(conditional, options) {
      return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
    });

    instance.registerHelper('with', function(context, options) {
      if (isFunction(context)) { context = context.call(this); }

      if (!Utils.isEmpty(context)) return options.fn(context);
    });

    instance.registerHelper('log', function(context, options) {
      var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
      instance.log(level, context);
    });
  }

  var logger = {
    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // State enum
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    level: 3,

    // can be overridden in the host environment
    log: function(level, obj) {
      if (logger.level <= level) {
        var method = logger.methodMap[level];
        if (typeof console !== 'undefined' && console[method]) {
          console[method].call(console, obj);
        }
      }
    }
  };
  __exports__.logger = logger;
  function log(level, obj) { logger.log(level, obj); }

  __exports__.log = log;var createFrame = function(object) {
    var obj = {};
    Utils.extend(obj, object);
    return obj;
  };
  __exports__.createFrame = createFrame;
  return __exports__;
})(__module2__, __module4__);

// handlebars/runtime.js
var __module5__ = (function(__dependency1__, __dependency2__, __dependency3__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;
  var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;

  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
        currentRevision = COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
        throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
              "Please update your runtime to a newer version ("+compilerInfo[1]+").");
      }
    }
  }

  __exports__.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

  function template(templateSpec, env) {
    if (!env) {
      throw new Exception("No environment passed to template");
    }

    // Note: Using env.VM references rather than local var references throughout this section to allow
    // for external users to override these as psuedo-supported APIs.
    var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
      var result = env.VM.invokePartial.apply(this, arguments);
      if (result != null) { return result; }

      if (env.compile) {
        var options = { helpers: helpers, partials: partials, data: data };
        partials[name] = env.compile(partial, { data: data !== undefined }, env);
        return partials[name](context, options);
      } else {
        throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
      }
    };

    // Just add water
    var container = {
      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common && (param !== common)) {
          ret = {};
          Utils.extend(ret, common);
          Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: env.VM.programWithDepth,
      noop: env.VM.noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var namespace = options.partial ? options : env,
          helpers,
          partials;

      if (!options.partial) {
        helpers = options.helpers;
        partials = options.partials;
      }
      var result = templateSpec.call(
            container,
            namespace, context,
            helpers,
            partials,
            options.data);

      if (!options.partial) {
        env.VM.checkRevision(container.compilerInfo);
      }

      return result;
    };
  }

  __exports__.template = template;function programWithDepth(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var prog = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    prog.program = i;
    prog.depth = args.length;
    return prog;
  }

  __exports__.programWithDepth = programWithDepth;function program(i, fn, data) {
    var prog = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    prog.program = i;
    prog.depth = 0;
    return prog;
  }

  __exports__.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
    var options = { partial: true, helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    }
  }

  __exports__.invokePartial = invokePartial;function noop() { return ""; }

  __exports__.noop = noop;
  return __exports__;
})(__module2__, __module4__, __module1__);

// handlebars.runtime.js
var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  /*globals Handlebars: true */
  var base = __dependency1__;

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)
  var SafeString = __dependency2__;
  var Exception = __dependency3__;
  var Utils = __dependency4__;
  var runtime = __dependency5__;

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  var create = function() {
    var hb = new base.HandlebarsEnvironment();

    Utils.extend(hb, base);
    hb.SafeString = SafeString;
    hb.Exception = Exception;
    hb.Utils = Utils;

    hb.VM = runtime;
    hb.template = function(spec) {
      return runtime.template(spec, hb);
    };

    return hb;
  };

  var Handlebars = create();
  Handlebars.create = create;

  __exports__ = Handlebars;
  return __exports__;
})(__module1__, __module3__, __module4__, __module2__, __module5__);

  return __module0__;
})();

Handlebars.registerHelper('first', function(items, options) {
  return items[0];
});

Handlebars.registerHelper('currentPage', function(items, options) {
  currentPage = ShoppingCartPlugin.currentPage;
  productsPerPage = ShoppingCartPlugin.productsPerPage;
  numOnPreviousPages = (currentPage-1)*productsPerPage;
  return items.slice(numOnPreviousPages, numOnPreviousPages+productsPerPage);
});

Handlebars.registerHelper("each_with_index", function(array, options) {
  var buffer = "";
  for (var i = 0, j = array.length; i < j; i++) {
    var item = array[i];
 
    // stick an index property onto the item, starting with 1, may make configurable later
    item.index = i+1;
 
    // show the inside of the block
    buffer += options.fn(item);
  }
 
  // return the finished buffer
  return buffer;
 
});

Handlebars.registerHelper("each_on_current_page", function(array, options) {
  var buffer = "";
  currentPage = ShoppingCartPlugin.currentPage;
  productsPerPage = ShoppingCartPlugin.productsPerPage;
  startIndex = (currentPage-1)*productsPerPage;
  endIndex = startIndex + productsPerPage;
  for (var i = 0, j = array.length; i < j; i++) {
    var item = array[i];
    
    if (startIndex <= i && i < endIndex) {
      buffer += options.fn(item);
    }
  }
 
  // return the finished buffer
  return buffer;
 
});

/*
 ### jQuery XML to JSON Plugin v1.3 - 2013-02-18 ###
 * http://www.fyneworks.com/ - diego@fyneworks.com
	* Licensed under http://en.wikipedia.org/wiki/MIT_License
 ###
 Website: http://www.fyneworks.com/jquery/xml-to-json/
*//*
 # INSPIRED BY: http://www.terracoder.com/
           AND: http://www.thomasfrank.se/xml_to_json.html
											AND: http://www.kawa.net/works/js/xml/objtree-e.html
*//*
 This simple script converts XML (document of code) into a JSON object. It is the combination of 2
 'xml to json' great parsers (see below) which allows for both 'simple' and 'extended' parsing modes.
*/
// Avoid collisions
;if(window.jQuery) (function($){
 
 // Add function to jQuery namespace
 $.extend({
  
  // converts xml documents and xml text to json object
  xml2json: function(xml, extended) {
   if(!xml) return {}; // quick fail
   
   //### PARSER LIBRARY
   // Core function
   function parseXML(node, simple){
    if(!node) return null;
    var txt = '', obj = null, att = null;
    var nt = node.nodeType, nn = jsVar(node.localName || node.nodeName);
    var nv = node.text || node.nodeValue || '';
    /*DBG*/ //if(window.console) console.log(['x2j',nn,nt,nv.length+' bytes']);
    if(node.childNodes){
     if(node.childNodes.length>0){
      /*DBG*/ //if(window.console) console.log(['x2j',nn,'CHILDREN',node.childNodes]);
      $.each(node.childNodes, function(n,cn){
       var cnt = cn.nodeType, cnn = jsVar(cn.localName || cn.nodeName);
       var cnv = cn.text || cn.nodeValue || '';
       /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>a',cnn,cnt,cnv]);
       if(cnt == 8){
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>b',cnn,'COMMENT (ignore)']);
        return; // ignore comment node
       }
       else if(cnt == 3 || cnt == 4 || !cnn){
        // ignore white-space in between tags
        if(cnv.match(/^\s+$/)){
         /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>c',cnn,'WHITE-SPACE (ignore)']);
         return;
        };
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>d',cnn,'TEXT']);
        txt += cnv.replace(/^\s+/,'').replace(/\s+$/,'');
								// make sure we ditch trailing spaces from markup
       }
       else{
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>e',cnn,'OBJECT']);
        obj = obj || {};
        if(obj[cnn]){
         /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>f',cnn,'ARRAY']);
         
									// http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
									if(!obj[cnn].length) obj[cnn] = myArr(obj[cnn]);
									obj[cnn] = myArr(obj[cnn]);
         
									obj[cnn][ obj[cnn].length ] = parseXML(cn, true/* simple */);
         obj[cnn].length = obj[cnn].length;
        }
        else{
         /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>g',cnn,'dig deeper...']);
         obj[cnn] = parseXML(cn);
        };
       };
      });
     };//node.childNodes.length>0
    };//node.childNodes
    if(node.attributes){
     if(node.attributes.length>0){
      /*DBG*/ //if(window.console) console.log(['x2j',nn,'ATTRIBUTES',node.attributes])
      att = {}; obj = obj || {};
      $.each(node.attributes, function(a,at){
       var atn = jsVar(at.name), atv = at.value;
       att[atn] = atv;
       if(obj[atn]){
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'attr>',atn,'ARRAY']);
        
								// http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
								//if(!obj[atn].length) obj[atn] = myArr(obj[atn]);//[ obj[ atn ] ];
        obj[cnn] = myArr(obj[cnn]);
								
								obj[atn][ obj[atn].length ] = atv;
        obj[atn].length = obj[atn].length;
       }
       else{
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'attr>',atn,'TEXT']);
        obj[atn] = atv;
       };
      });
      //obj['attributes'] = att;
     };//node.attributes.length>0
    };//node.attributes
    if(obj){
     obj = $.extend( (txt!='' ? new String(txt) : {}),/* {text:txt},*/ obj || {}/*, att || {}*/);
     //txt = (obj.text) ? (typeof(obj.text)=='object' ? obj.text : [obj.text || '']).concat([txt]) : txt;
     txt = (obj.text) ? ([obj.text || '']).concat([txt]) : txt;
     if(txt) obj.text = txt;
     txt = '';
    };
    var out = obj || txt;
    //console.log([extended, simple, out]);
    if(extended){
     if(txt) out = {};//new String(out);
     txt = out.text || txt || '';
     if(txt) out.text = txt;
     if(!simple) out = myArr(out);
    };
    return out;
   };// parseXML
   // Core Function End
   // Utility functions
   var jsVar = function(s){ return String(s || '').replace(/-/g,"_"); };
   
			// NEW isNum function: 01/09/2010
			// Thanks to Emile Grau, GigaTecnologies S.L., www.gigatransfer.com, www.mygigamail.com
			function isNum(s){
				// based on utility function isNum from xml2json plugin (http://www.fyneworks.com/ - diego@fyneworks.com)
				// few bugs corrected from original function :
				// - syntax error : regexp.test(string) instead of string.test(reg)
				// - regexp modified to accept  comma as decimal mark (latin syntax : 25,24 )
				// - regexp modified to reject if no number before decimal mark  : ".7" is not accepted
				// - string is "trimmed", allowing to accept space at the beginning and end of string
				var regexp=/^((-)?([0-9]+)(([\.\,]{0,1})([0-9]+))?$)/
				return (typeof s == "number") || regexp.test(String((s && typeof s == "string") ? jQuery.trim(s) : ''));
			};
			// OLD isNum function: (for reference only)
			//var isNum = function(s){ return (typeof s == "number") || String((s && typeof s == "string") ? s : '').test(/^((-)?([0-9]*)((\.{0,1})([0-9]+))?$)/); };
																
   var myArr = function(o){
    
				// http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
				//if(!o.length) o = [ o ]; o.length=o.length;
    if(!$.isArray(o)) o = [ o ]; o.length=o.length;
				
				// here is where you can attach additional functionality, such as searching and sorting...
    return o;
   };
   // Utility functions End
   //### PARSER LIBRARY END
   
   // Convert plain text to xml
   if(typeof xml=='string') xml = $.text2xml(xml);
   
   // Quick fail if not xml (or if this is a node)
   if(!xml.nodeType) return;
   if(xml.nodeType == 3 || xml.nodeType == 4) return xml.nodeValue;
   
   // Find xml root node
   var root = (xml.nodeType == 9) ? xml.documentElement : xml;
   
   // Convert xml to json
   var out = parseXML(root, true /* simple */);
   
   // Clean-up memory
   xml = null; root = null;
   
   // Send output
   return out;
  },
  
  // Convert text to XML DOM
  text2xml: function(str) {
   // NOTE: I'd like to use jQuery for this, but jQuery makes all tags uppercase
   //return $(xml)[0];
   
   /* prior to jquery 1.9 */
   /*
   var out;
   try{
    var xml = ((!$.support.opacity && !$.support.style))?new ActiveXObject("Microsoft.XMLDOM"):new DOMParser();
    xml.async = false;
   }catch(e){ throw new Error("XML Parser could not be instantiated") };
   try{
    if((!$.support.opacity && !$.support.style)) out = (xml.loadXML(str))?xml:false;
    else out = xml.parseFromString(str, "text/xml");
   }catch(e){ throw new Error("Error parsing XML string") };
   return out;
   */

   /* jquery 1.9+ */
   return $.parseXML(str);
  }
		
 }); // extend $

})(jQuery);

ShoppingCartPlugin = {
    currentPage: 1,
    productsPerPage: 9,
    initialize: function(AI, divID, successCallback){
      this.getProductsXML(AI, divInserter);
    },
    getProductsXML: function(AI, successCallback){
      $.ajax({
          type: 'POST',
          url: 'http://www.awesomedemosite.com/virtualoffice/menuEngine/getproductsgeneral.asp',
          processData: false,
          contentType: 'application/x-www-form-urlencoded',
          async: false,
          data: 'AI=' + AI,
          success: function(data) {
            successCallback(data);
          },
          error:function (xhr, ajaxOptions, thrownError){
              alert(xhr.status);
              alert(thrownError);
          }
      });
    },
    getCategoriesXML: function(AI, successCallback){
      $.ajax({
          type: 'POST',
          url: 'http://www.awesomedemosite.com/virtualoffice/menuEngine/getproductcatsgeneral.asp',
          processData: false,
          contentType: 'application/x-www-form-urlencoded',
          async: false,
          data: 'AI=' + AI,
          success: function(data) {
            successCallback(data);
          },
          error:function (xhr, ajaxOptions, thrownError){
              alert(xhr.status);
              alert(thrownError);
          }
      });
    }
};

/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/
function xml2json(xml, tab) {
   var X = {
      toObj: function(xml) {
         var o = {};
         if (xml.nodeType==1) {   // element node ..
            if (xml.attributes.length)   // element with attributes  ..
               for (var i=0; i<xml.attributes.length; i++)
                  o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
            if (xml.firstChild) { // element has child nodes ..
               var textChild=0, cdataChild=0, hasElementChild=false;
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType==1) hasElementChild = true;
                  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                  else if (n.nodeType==4) cdataChild++; // cdata section node
               }
               if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                     X.removeWhite(xml);
                     for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType == 3)  // text node
                           o["#text"] = X.escape(n.nodeValue);
                        else if (n.nodeType == 4)  // cdata node
                           o["#cdata"] = X.escape(n.nodeValue);
                        else if (o[n.nodeName]) {  // multiple occurence of element ..
                           if (o[n.nodeName] instanceof Array)
                              o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                           else
                              o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                        }
                        else  // first occurence of element..
                           o[n.nodeName] = X.toObj(n);
                     }
                  }
                  else { // mixed content
                     if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                     else
                        o["#text"] = X.escape(X.innerXml(xml));
                  }
               }
               else if (textChild) { // pure text
                  if (!xml.attributes.length)
                     o = X.escape(X.innerXml(xml));
                  else
                     o["#text"] = X.escape(X.innerXml(xml));
               }
               else if (cdataChild) { // cdata
                  if (cdataChild > 1)
                     o = X.escape(X.innerXml(xml));
                  else
                     for (var n=xml.firstChild; n; n=n.nextSibling)
                        o["#cdata"] = X.escape(n.nodeValue);
               }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
         }
         else if (xml.nodeType==9) { // document.node
            o = X.toObj(xml.documentElement);
         }
         else
            alert("unhandled node type: " + xml.nodeType);
         return o;
      },
      toJson: function(o, name, ind) {
         var json = name ? ("\""+name+"\"") : "";
         if (o instanceof Array) {
            for (var i=0,n=o.length; i<n; i++)
               o[i] = X.toJson(o[i], "", ind+"\t");
            json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
         }
         else if (o == null)
            json += (name&&":") + "null";
         else if (typeof(o) == "object") {
            var arr = [];
            for (var m in o)
               arr[arr.length] = X.toJson(o[m], m, ind+"\t");
            json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
         }
         else if (typeof(o) == "string")
            json += (name&&":") + "\"" + o.toString() + "\"";
         else
            json += (name&&":") + o.toString();
         return json;
      },
      innerXml: function(node) {
         var s = ""
         if ("innerHTML" in node)
            s = node.innerHTML;
         else {
            var asXml = function(n) {
               var s = "";
               if (n.nodeType == 1) {
                  s += "<" + n.nodeName;
                  for (var i=0; i<n.attributes.length;i++)
                     s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                  if (n.firstChild) {
                     s += ">";
                     for (var c=n.firstChild; c; c=c.nextSibling)
                        s += asXml(c);
                     s += "</"+n.nodeName+">";
                  }
                  else
                     s += "/>";
               }
               else if (n.nodeType == 3)
                  s += n.nodeValue;
               else if (n.nodeType == 4)
                  s += "<![CDATA[" + n.nodeValue + "]]>";
               return s;
            };
            for (var c=node.firstChild; c; c=c.nextSibling)
               s += asXml(c);
         }
         return s;
      },
      escape: function(txt) {
         return txt.replace(/[\\]/g, "\\\\")
                   .replace(/[\"]/g, '\\"')
                   .replace(/[\n]/g, '\\n')
                   .replace(/[\r]/g, '\\r');
      },
      removeWhite: function(e) {
         e.normalize();
         for (var n = e.firstChild; n; ) {
            if (n.nodeType == 3) {  // text node
               if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
               }
               else
                  n = n.nextSibling;
            }
            else if (n.nodeType == 1) {  // element node
               X.removeWhite(n);
               n = n.nextSibling;
            }
            else                      // any other node
               n = n.nextSibling;
         }
         return e;
      }
   };
   if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
   var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
   return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}


(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['cart'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    ";
  stack1 = self.invokePartial(partials.product, 'product', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  ";
  return buffer;
  }

  buffer += "<div class=\"products\">\n  ";
  stack1 = (helper = helpers.each_on_current_page || (depth0 && depth0.each_on_current_page),options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.products)),stack1 == null || stack1 === false ? stack1 : stack1.Product), options) : helperMissing.call(depth0, "each_on_current_page", ((stack1 = (depth0 && depth0.products)),stack1 == null || stack1 === false ? stack1 : stack1.Product), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;
  });
templates['productsxml'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<XML><products>\n\n<Product id=\"{6F8592D3-4D7E-4685-9490-6E039DEDAC1B}\">\n\n<SKU><![CDATA[MIDGET-2]]></SKU>\n\n<ProductName><![CDATA[Gustav the Midget]]></ProductName>\n\n<ProductShortDescription><![CDATA[This is another midget.]]></ProductShortDescription>\n\n<ProductDescription><![CDATA[Origo deorum flexi fontes habitabilis coeptis pro caligine parte. Plagae valles tenent tonitrua circumfuso sponte videre. Cuncta undis plagae sic cum et fecit diu alta. Terrenae diverso innabilis utramque. Pronaque levius deducite speciem iunctarum caeleste indigestaque neu. Perveniunt pace effervescere pinus cingebant secrevit.\n]]></ProductDescription>\n\n<ProductPrice><![CDATA[817263.12]]></ProductPrice>\n\n<ProductWeight><![CDATA[65]]></ProductWeight>\n\n\n-<Categories>\n\n<CategoryID><![CDATA[{60AC0D7E-3EB0-430F-B5E6-917639C86067}]]></CategoryID>\n\n</Categories>\n\n\n-<Images>\n\n<Image><![CDATA[http://www.awesomedemosite.com/clientdata/D4874F13-9422-4C3B-B734-E117495A9BAE/files/GustavMidget.jpg]]></Image>\n\n<Image><![CDATA[http://www.awesomedemosite.com/clientdata/D4874F13-9422-4C3B-B734-E117495A9BAE/files/Midget-bodybuilder35JsL.jpg]]></Image>\n\n<Image><![CDATA[]]></Image>\n<Image><![CDATA[]]></Image>\n\n</Images>\n\n</Product>\n\n\n\n\n\n<Product id=\"{A273E228-6872-4422-A557-A87AE1D0E811}\">\n\n<SKU><![CDATA[MIDGET-3]]></SKU>\n\n<ProductName><![CDATA[Harvey]]></ProductName>\n\n<ProductShortDescription><![CDATA[This is Harvey the Midget]]></ProductShortDescription>\n\n<ProductDescription><![CDATA[Origo deorum flexi fontes habitabilis coeptis pro caligine parte. Plagae valles tenent tonitrua circumfuso sponte videre. Cuncta undis plagae sic cum et fecit diu alta. Terrenae diverso innabilis utramque. Pronaque levius deducite speciem iunctarum caeleste indigestaque neu. Perveniunt pace effervescere pinus cingebant secrevit.\n]]></ProductDescription>\n\n<ProductPrice><![CDATA[123]]></ProductPrice>\n\n<ProductWeight><![CDATA[45]]></ProductWeight>\n\n\n-<Categories>\n\n<CategoryID><![CDATA[{60AC0D7E-3EB0-430F-B5E6-917639C86067}]]></CategoryID>\n\n</Categories>\n\n\n-<Images>\n\n<Image><![CDATA[http://www.awesomedemosite.com/clientdata/D4874F13-9422-4C3B-B734-E117495A9BAE/files/harvey.jpeg]]></Image>\n\n<Image><![CDATA[]]></Image>\n\n<Image><![CDATA[]]></Image>\n<Image><![CDATA[]]></Image>\n\n</Images>\n\n</Product>\n\n\n\n\n\n<Product id=\"{6433CFAE-7EFC-433C-B5F4-C568C2EBFED3}\">\n\n<SKU><![CDATA[PLATE-1]]></SKU>\n\n<ProductName><![CDATA[Plate]]></ProductName>\n\n<ProductShortDescription><![CDATA[Just a plate.]]></ProductShortDescription>\n\n<ProductDescription><![CDATA[This is just a plate.]]></ProductDescription>\n\n<ProductPrice><![CDATA[789]]></ProductPrice>\n\n<ProductWeight><![CDATA[10]]></ProductWeight>\n\n\n-<Categories>\n\n<CategoryID><![CDATA[{7FCCF23A-58E2-45DD-9E3A-AA195047663E}]]></CategoryID>\n\n</Categories>\n\n\n-<Images>\n\n<Image><![CDATA[http://www.awesomedemosite.com/clientdata/D4874F13-9422-4C3B-B734-E117495A9BAE/files/plate.JPG]]></Image>\n\n<Image><![CDATA[]]></Image>\n\n<Image><![CDATA[]]></Image>\n<Image><![CDATA[]]></Image>\n\n</Images>\n\n</Product>\n\n\n\n\n\n<Product id=\"{0DE3CB0F-B4EF-4D92-9B4D-569C4070D0A2}\">\n\n<SKU><![CDATA[MIDGET-4]]></SKU>\n\n<ProductName><![CDATA[Sally]]></ProductName>\n\n<ProductShortDescription><![CDATA[This is Sally the Midget]]></ProductShortDescription>\n\n<ProductDescription><![CDATA[Origo deorum flexi fontes habitabilis coeptis pro caligine parte. Plagae valles tenent tonitrua circumfuso sponte videre. Cuncta undis plagae sic cum et fecit diu alta. Terrenae diverso innabilis utramque. Pronaque levius deducite speciem iunctarum caeleste indigestaque neu. Perveniunt pace effervescere pinus cingebant secrevit.]]></ProductDescription>\n\n<ProductPrice><![CDATA[1273]]></ProductPrice>\n\n<ProductWeight><![CDATA[50]]></ProductWeight>\n\n\n-<Categories>\n\n<CategoryID><![CDATA[{60AC0D7E-3EB0-430F-B5E6-917639C86067}]]></CategoryID>\n\n</Categories>\n\n\n-<Images>\n\n<Image><![CDATA[http://www.awesomedemosite.com/clientdata/D4874F13-9422-4C3B-B734-E117495A9BAE/files/sally.jpg]]></Image>\n\n<Image><![CDATA[]]></Image>\n\n<Image><![CDATA[]]></Image>\n<Image><![CDATA[]]></Image>\n\n</Images>\n\n</Product>\n\n\n\n\n\n<Product id=\"{8534E230-0B97-483F-8316-4D1B11FAED0E}\">\n\n<SKU><![CDATA[HAT-2]]></SKU>\n\n<ProductName><![CDATA[Top Hat]]></ProductName>\n\n<ProductShortDescription><![CDATA[This is another hat.]]></ProductShortDescription>\n\n<ProductDescription><![CDATA[This really, really is another hat.]]></ProductDescription>\n\n<ProductPrice><![CDATA[70]]></ProductPrice>\n\n<ProductWeight><![CDATA[30]]></ProductWeight>\n\n\n-<Categories>\n\n<CategoryID><![CDATA[{5146CEAF-1E9E-4833-BEBE-43B7AEA6FBA6}]]></CategoryID>\n\n</Categories>\n\n\n-<Images>\n\n<Image><![CDATA[http://www.awesomedemosite.com/clientdata/D4874F13-9422-4C3B-B734-E117495A9BAE/files/tophat.jpeg]]></Image>\n\n<Image><![CDATA[]]></Image>\n\n<Image><![CDATA[]]></Image>\n<Image><![CDATA[]]></Image>\n\n</Images>\n\n</Product>\n\n\n\n</products></XML>";
  });
})();

(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
Handlebars.partials['product'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  buffer += "<div class=\"product\">\n  <span class=\"item_name\">";
  if (helper = helpers.ProductName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.ProductName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span>\n  <img src="
    + escapeExpression((helper = helpers.first || (depth0 && depth0.first),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.Images)),stack1 == null || stack1 === false ? stack1 : stack1.Image), options) : helperMissing.call(depth0, "first", ((stack1 = (depth0 && depth0.Images)),stack1 == null || stack1 === false ? stack1 : stack1.Image), options)))
    + " alt=";
  if (helper = helpers.ProductName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.ProductName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + ">\n  <input type=\"text\" value=\"1\" class=\"item_Quantity\"><br>\n  <span class=\"item_price\">";
  if (helper = helpers.ProductPrice) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.ProductPrice); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span><br>\n  <a class=\"item_add build-addtocart-button\"> Add to Cart </a>\n  <div class=\"build-cart-animation\" style=\"display:none\">1</div>\n</div>";
  return buffer;
  });
})();

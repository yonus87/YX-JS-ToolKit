/*
 * Functions: Operation html;
 * */
function escapeHTML(text)
{
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function (m) {
		return map[m];
	});
}

function replaceTemplateExpressionWithData(template, dataObject)
{
	var resultTemplate = template,
			dataKeys = Object.keys(dataObject);
	for (var i = 0, length = dataKeys.length; i < length; i++)
	{
		resultTemplate = resultTemplate.replace(regExpG("{{" + dataKeys[i] + "}}"), dataObject[dataKeys[i]] || '');
	}
	return resultTemplate;
}

/*
 * Functions: Dynamic load resource in page;
 * */
function loadResource(url, callback)
{
	if (!checkResourceLoaded(url))
	{
		window[getUrlTypeInfo(url).loadFn](url, callback);
	}
}

function loadResources(urls, callback)
{
	if (urls !== null && urls !== '')
	{
		if (Array.isArray(urls))
		{
			urls = urls.filter(function (url) {
				return (String(url) === url && url !== '');
			});
			if (urls.length === 0)
			{
				callback && callback();
			}
			else if (urls.length === 1)
			{
				loadResource(urls[0], callback);
			}
			else
			{
				if (callback)
				{
					loadUrls(urls, callback);
				}
				else
				{
					urls.map(function (url) {
						loadResource(url);
					})
				}
			}
		}
		else if (String(urls) === urls)
		{
			loadResource(urls, callback);
		}
	}
	else
	{
		callback && callback();
	}
}

function loadUrls(urls, callback)
{
	var unLoadedResourcesInfo = urls.map(function (resource) {
				var resourceInfo = getUrlTypeInfo(resource);
				resourceInfo.url = resource;
				return resourceInfo;
			});
	// If support Promise, use Promise
	if (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1)
	{
		var resourcePromise = unLoadedResourcesInfo.map(function (resourceInfo) {
			return window[resourceInfo.loadFnPromise](resourceInfo.url);
		});
		Promise.all(resourcePromise).then(function () {
			callback && callback();
		}).catch(function (error) {
			console.log("Error: in load resources! " + error);
		});
	}
	else
	{
		unLoadedResourcesInfo.forEach(function (resourceInfo) {
			window[resourceInfo.loadFn](resourceInfo.url);
		});
		callback && callback();
	}
}

function loadCSS(url, callback, context)
{
	if (!url)
		return;

	if (Array.isArray(url))
	{
		// Process the url and callback if they are array;
		parameterArrayToItem(arguments.callee, url, callback);
	}
	else
	{
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = url;
		link.onload = function () {
			callback && (context ? context[callback]() : callback());
		};
		link.onerror = function () {
			console.log("Error load css:" + url);
		};
		document.getElementsByTagName('head')[0].appendChild(link);
	}
}

function loadScript(url, callback, context)
{
	if (!url)
		return;

	if (Array.isArray(url))
	{
		// Process the url and callback if they are array;
		parameterArrayToItem(arguments.callee, url, callback);
	}
	else
	{
		var script = document.createElement("script");
		script.type = "text/javascript";

		if (script.readyState)
		{  //IE
			script.onreadystatechange = function () {
				if (script.readyState === "loaded" || script.readyState === "complete")
				{
					script.onreadystatechange = null;
					callback && (context ? context[callback]() : callback());
				}
			};
		}
		else
		{  //Others
			script.onload = function () {
				callback && (context ? context[callback]() : callback());
			};
		}

		script.src = url;
		document.body.appendChild(script);
	}
}

// loadCSS with Promise
function loadCSSWithPromise(url)
{
	return new Promise(function (resolve, reject) {
		if (!url)
		{
			reject(new Error("url is null!"));
		}

		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = url;
		link.onload = function () {
			resolve();
		};
		link.onerror = function (error) {
			reject(new Error(error));
		};
		document.getElementsByTagName('head')[0].appendChild(link);
	});
}

// loadScript with Promise
function loadScriptWithPromise(url)
{
	return new Promise(function (resolve, reject) {
		if (!url)
		{
			reject(new Error("url is null!"));
		}

		var script = document.createElement("script");
		script.type = "text/javascript";

		if (script.readyState)
		{  //IE
			script.onreadystatechange = function () {
				if (script.readyState === "loaded" || script.readyState === "complete")
				{
					script.onreadystatechange = null;
					resolve();
				}
			};
		}
		else
		{  //Others
			script.onload = function () {
				resolve();
			};
		}

		script.src = url;
		document.body.appendChild(script);
	});
}

// Dependency: jQuery ajax
function getFileContent(url, callback, context)
{
	$.ajax({
		url: url,
		success: function (data) {
			callback && (context ? context[callback](data) : callback(data));
		}
	});
}

function getFileContentJS(url, callback, context)
{
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function () {
		if (request.status >= 200 && request.status < 400)
		{
			// Success
			callback && (context ? context[callback](request.responseText) : callback(request.responseText));
		}
		else
		{
			// We reached our target server, but it returned an error
		}
	};

	request.onerror = function () {
		// There was a connection error of some sort
	};

	request.send();
}

/*
 * Functions: Regular expression
 * */
function regExpG(expStr)
{
	return new RegExp(expStr, "g");
}

function isURL(url)
{
	var expression = /(((http|ftp|https):\/\/)?([\w\-_]+(\.(?!(\d)+)[\w\-_]+))+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?)|(\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)/g;
	return (new RegExp(expression)).test(url);
}

/*
* Functions: URL
* */

function getFileNameFromURL(url)
{
	return url.split('/').pop().split('#')[0].split('?')[0];
}

function checkResourceLoaded(url)
{
	var type = getUrlTypeInfo(url),
			typeSelector = type['tagName'] || '[src]',
			allUrls = Array.prototype.slice.call(document.querySelectorAll(typeSelector))
					.map(function (scriptElement) {
						return scriptElement[type['urlAttrName']];
					});
	return allUrls.indexOf(url) !== -1;
}

function getUrlTypeInfo(url)
{
	// Current only support js and css resources;
	var resourceName = getFileNameFromURL(url),
			resourceNameSplitArray = resourceName.split('.');
	if (resourceNameSplitArray.length > 1)
	{
		var urlType = {
			'js': {
				name: 'js',
				tagName: 'script',
				urlAttrName: 'src',
				loadFn: 'loadScript',
				loadFnPromise: 'loadScriptWithPromise'
			},
			'css': {
				name: 'css',
				tagName: 'link',
				urlAttrName: 'href',
				loadFn: 'loadCSS',
				loadFnPromise: 'loadCSSWithPromise'
			}
		};
		return urlType[resourceNameSplitArray.pop()];
	}
	return null;
}

function getCurrentScriptPath(scriptName)
{
	var scripts = document.getElementsByTagName("script");

	for (var i = 0; i < scripts.length; i++)
	{
		var script = scripts.item(i);

		if (script.src && script.src.match(scriptName))
		{
			return script.src;
		}
	}
	return null;
}

function getQueryParamValue(param)
{
	var query = window.location.search.substring(1);
	var queryParams = query.split("&");
	for (var i = 0; i < queryParams.length; i++)
	{
		var queryParam = queryParams[i].split("=");
		if (queryParam[0] === param)
		{
			return queryParam[1];
		}
	}
	return false;
}

/*
 * Functions: Tools for processing function who has parameter array;
 * */
function parameterArrayToItem(fn, param1, param2)
{
	var param2IsArray = Array.isArray(param2),
			param2ArrayLength = param2IsArray && param2.length || 0;
	for (var i = 0, length = param1.length; i < length; i++)
	{
		var param2Item = (param2IsArray && i < param2ArrayLength) ? param2[i] : null;
		fn && fn(param1[i], param2Item);
	}
}

/*
* Functions: Throttle, specially in onResize event function;
* */
function throttle(method, context)
{
	if (method.tId)
	{
		clearTimeout(method.tId);
	}
	method.tId = setTimeout(function () {
		method.call(context);
	}, 100);
}

/*
* Functions: Debug
* Demo:
* function doSomething(param1, param2)
* {
	consoleLog(arguments, 'anything...');
* }
* */
function consoleLog(fnArguments)
{
	if (window.console && window.debug !== false)
	{
		var localTime = (new Date()).toTimeString(),
				fnName = fnArguments.callee.name,
				fnArgumentsArray = Array.prototype.slice.call(fnArguments, 0),
				fnArgumentsString = getArrayString(fnArgumentsArray),
				argumentsArray = Array.prototype.slice.call(arguments, 0),
				surplusArgumentString = argumentsArray.length > 1 && argumentsArray.shift() && getArrayString(argumentsArray);
		window.console.log(localTime + ' : ' + fnName + '(' + fnArgumentsString + ') ' + surplusArgumentString);
	}
}

function getArrayString(array)
{
	return array.map(function (arrayItem) {
		if (Array.isArray(arrayItem))
		{
			arrayItem = '[' + arguments.callee(arrayItem) + ']';
		}
		else if (typeof arrayItem === 'object')
		{
			arrayItem = JSON.stringify(arrayItem);
		}
		return arrayItem.toString();
	}).join(',');
}

// Functions: Copy - deep copy and shadow copy with out jQuery
function deepExtend(out) // arguments: (source, source1, source2, ...)
{
	out = out || {};

	for (var i = 1; i < arguments.length; i++)
	{
		var obj = arguments[i];

		if (!obj)
			continue;

		for (var key in obj)
		{
			if (obj.hasOwnProperty(key))
			{
				if (typeof obj[key] === 'object' && !Array.isArray(obj[key]))
					out[key] = arguments.callee(out[key], obj[key]);
				else
					out[key] = obj[key];
			}
		}
	}
	return out;
}

// Functions: Dynamic set callback function in window
function setCallback(typeName)
{
	var typeCallback = typeName + "Callback";
	if (!window[typeCallback])
	{
		window[typeCallback] = function (data)
		{
			window[typeName] = data;
		};
		return typeCallback;
	}
	return null;
}
function getCallbackName(typeName)
{
	return typeName + "Callback";
}
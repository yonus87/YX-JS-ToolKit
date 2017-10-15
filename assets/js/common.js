/*
* Function: Process
* */
function uniqueArray(sourceArray)
{
	var resultArray = [], hash = {};
	for (var i = 0, elem, l = sourceArray.length; i < l && (elem = sourceArray[i]) !== null; i++)
	{
		if (!hash[elem])
		{
			resultArray.push(elem);
			hash[elem] = true;
		}
	}
	return resultArray;
}

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

function initTemplate(template, data, functionData)
{
	var result = template;
	for (var key in data)
	{
		if (data.hasOwnProperty(key))
		{
			var dataValue = data[key];
			if (typeof data[key] === 'function')
			{
				dataValue = data[key](functionData);
			}
			result = result.replace(new RegExp('{{' + key + '}}', "g"), dataValue);
		}
	}
	return result;
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
		parameterArrayToItem(function (urlParam, callbackParam) {
			loadCSS(urlParam, callbackParam);
		}, url, callback);
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
		parameterArrayToItem(function (urlParam, callbackParam) {
			loadScript(urlParam, callbackParam);
		}, url, callback);
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
		var localTime = (new Date()).toLocaleTimeString(),
				fnName = fnArguments.callee ? fnArguments.callee.name : '',
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
				if (typeof obj[key] === 'object'
						&& !Array.isArray(obj[key])
						&& !(obj[key] instanceof Date)
						&& !(obj[key] === 'function'))
				{
					out[key] = arguments.callee(out[key], obj[key]);
				}
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

/*
* Functions: Elements operation
*
* */
function getElements(elements)
{
	var resultElement = [];
	if (elements.jquery)
	{
		resultElement = elements.length > 1 ? elements.get() : [elements[0]];
	}
	else if (elements instanceof window.NodeList || elements instanceof NodeList || elements instanceof HTMLCollection)
	{
		resultElement = Array.prototype.slice.call(elements);
	}
	else if (Array.isArray(elements))
	{
		resultElement = elements;
	}
	else if (elements.nodeType)
	{
		resultElement = [elements];
	}
	return resultElement;
}

function getSelectorsElements(selectorString)
{
	if (!selectorString || (selectorString && selectorString.trim() === ''))
	{
		return [document];
	}
	var selectorsElements = [],
			selectorsArray = selectorString.split(',').map(function (selectorStringItem) {
				return selectorStringItem.trim();
			});
	selectorsArray = uniqueArray(selectorsArray);
	for (var i = 0, l = selectorsArray.length; i < l; i++)
	{
		if (selectorsArray[i] === 'document')
		{
			selectorsElements.push(document);
		}
		else
		{
			var scopeNodeList = convertNodeListToArray(document.querySelectorAll(selectorsArray[i]));
			selectorsElements = selectorsElements.concat(scopeNodeList);
		}
	}
	return selectorsElements;
}

function findParent(element, selector)
{
	while ((element = element.parentElement) && !matches(element, selector)) {}
	return element;
}

function matches(el, selector)
{
	return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
}

function closet(element, className)
{
	var closetElement = null;
	if (hasClass(element, className))
	{
		closetElement = element;
	}
	else
	{
		closetElement = findParent(element, '.' + className);
	}
	return closetElement;
}

function hasCloset(el, parentElement)
{
	if (el === parentElement)
	{
		return true;
	}
	if (parentElement === undefined)
	{
		return false;
	}

	var parents = [], p = el.parentNode;
	while (p !== parentElement && p.parentNode)
	{
		var o = p;
		parents.push(o);
		p = o.parentNode;
	}
	return p === parentElement;
}

function convertNodeListToArray(nodeList)
{
	var resultArray = [];
	for (var i = 0, l = nodeList.length; i < l; i++)
	{
		resultArray[i] = nodeList[i];
	}
	return resultArray;
}

/*
* Tools: Page operation
* */
function scrollListToIndex(listFolder, index, toTopIndex, duration)
{
	if (index === 0)
	{
		scrollTo(listFolder, 0, duration);
	}
	else
	{
		var listItems = listFolder.childNodes,
				scrollOffset = 0,
				contentHeight = 0,
				scrollToCenter = 0;
		duration = (duration === undefined ? 500 : duration);
		for (var i = 0, l = listItems.length; i < l; i++)
		{
			var listItemHeight = listItems[i].offsetHeight;
			if (i < index)
			{
				scrollOffset += listItemHeight;
				if (i > toTopIndex - 1)
				{
					scrollToCenter += listItems[i - toTopIndex].offsetHeight;
				}
			}
			contentHeight += listItemHeight;
		}
		scrollOffset = scrollToCenter;
		if (scrollOffset + listFolder.offsetHeight > contentHeight)
		{
			scrollOffset = contentHeight - listFolder.offsetHeight;
		}
		scrollTo(listFolder, scrollOffset, duration);
	}
}

function scrollTo(element, to, duration)
{
	if (duration <= 0) return;
	var difference = to - element.scrollTop;
	var perTick = difference / duration * 10;

	setTimeout(function () {
		element.scrollTop = element.scrollTop + perTick;
		if (element.scrollTop === to) return;
		scrollTo(element, to, duration - 10);
	}, 10);
}

function addChildElement(parentElement, childElement, position)
{
	switch (position && position.toLowerCase())
	{
		case 'prepend':
			parentElement.insertBefore(childElement, parentElement.firstChild);
			break;
		case 'insertbefore':
			parentElement.insertAdjacentHTML('beforebegin', childElement.outerHTML);
			break;
		case 'insertafter':
			parentElement.insertAdjacentHTML('afterend', childElement.outerHTML);
			break;
		default: //'append'
			parentElement.appendChild(childElement);
	}
}

// Functions: Classes without jQuery
function hasClass(element, className)
{
	if (element.classList)
		return element.classList.contains(className);
	else
		return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
}

function addClass(element, className)
{
	if (element.classList)
		element.classList.add(className);
	else
		element.className += ' ' + className;
}

function removeClass(element, className)
{
	if (element.classList)
		element.classList.remove(className);
	else
		element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}
/*
* Function: Event operation
* */
//Extend on/off methods
function extendOnOff(el)
{
	if (el.length === 0)
		return null;
	var events = {
		on: function (event, callback, opts) {
			if (!this.namespaces) // save the namespaces on the DOM element itself
				this.namespaces = {};

			this.namespaces[event] = callback;
			var options = opts || false;

			this.addEventListener(event.split('.')[0], callback, options);
			return this;
		},
		off: function (event) {
			this.removeEventListener(event.split('.')[0], this.namespaces[event]);
			delete this.namespaces[event];
			return this;
		}
	};

	// Extend the DOM with these above custom methods
	if (!el.isExtendOnOff)
	{
		el.on = Element.prototype.on = events.on;
		el.off = Element.prototype.off = events.off;
		el.isExtendOnOff = true;
	}
	return el;
}

function delegate(element, eventName, selector, handler)
{
	var possibleTargets = element.querySelectorAll(selector);
	element.addEventListener(eventName, listenerHandler);

	function listenerHandler(event)
	{
		var target = event.target;

		for (var i = 0, l = possibleTargets.length; i < l; i++)
		{
			var el = target,
					p = possibleTargets[i];

			while (el && el !== element)
			{
				if (el === p)
				{
					return handler.call(p, event);
				}
				el = el.parentNode;
			}
		}
	}
}
/**
 * Javascript plugin: LoadResources V1.0
 * */
(function () {
	this.LoadResources = function (urls, callback) {
		if (urls !== null && urls !== '')
		{
			if (Array.isArray(urls))
			{
				if (callback)
				{
					loadUrls(urls, callback);
				}
				else
				{
					var that = this;
					urls.map(function (url) {
						that.loadResource(url);
					})
				}
			}
			else
			{
				this.loadResource(urls, callback);
			}
		}
	};

	LoadResources.DEFAULTS = {
		'js': {
			name: 'js',
			tagName: 'script',
			urlAttrName: 'src',
			loadFnName: 'loadJS',
			loadFnPromiseName: 'loadJStWithPromise'
		},
		'css': {
			name: 'css',
			tagName: 'link',
			urlAttrName: 'href',
			loadFnName: 'loadCSS',
			loadFnPromiseName: 'loadCSSWithPromise'
		}
	};

	LoadResources.prototype.loadResource = function (url) {
		if (!checkResourceLoaded(url))
		{
			LoadResources[getUrlTypeInfo(url).loadFnName](url);
		}
	};
	// Tools: functions
	function loadUrls(urls, callback)
	{
		var unLoadedResourcesInfo = urls.map(function (resource) {
					var type = getUrlTypeInfo(resource),
							resourceInfo = JSON.parse(JSON.stringify(LoadResources.DEFAULTS[type.name]));
					resourceInfo.url = resource;
					return resourceInfo;
				}),
				resourcePromise = unLoadedResourcesInfo.map(function (resourceInfo) {
					return eval(resourceInfo.loadFnPromiseName)(resourceInfo.url);
				});
		Promise.all(resourcePromise).then(function () {
			callback();
		}).catch(function (error) {
			console.log("Error: in load resources! " + error);
		});
	}

	function loadCSS(url, callback) {
		if (!url)
			return;

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

	function loadJS(url, callback) {
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

	function loadJStWithPromise(url)
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
			return LoadResources.DEFAULTS[resourceNameSplitArray[resourceNameSplitArray.length - 1]];
		}
		return null;
	}

	function loadResource(url)
	{
		if (!checkResourceLoaded(url))
		{
			eval(getUrlTypeInfo(url).loadFnName)(url);
		}
	}
})();
/**
 * JQuery plugin: popupDismiss v4.2
 *
 */
(function ($)
{
	var pluginName = 'popupDismiss';
	var method = {
		isTap: undefined,

		popupEvent: function (event)
		{
			var $popupTrigger = $(event.target);
			if ($popupTrigger.data('toggle') !== pluginName)
			{
				$popupTrigger = $popupTrigger.parents('[data-toggle="' + pluginName + '"]');
			}
			var dataDismissScope = $popupTrigger.data('dismiss-scope'),
				dismissScopes = dataDismissScope ? dataDismissScope.split(',').map(function (t) {
					return $(t.trim() === 'document' ? window.document : t.trim())
				}) : [$(document)],
				eventData = {
					type: event.type,
					namespace: $popupTrigger.data('target'),
					$popupTrigger: $popupTrigger,
					$popupTarget: $($popupTrigger.data('target')),
					toggledClass: $popupTrigger.data('toggle-class') || null, // Recommend: 'open'
					popupHandler: $popupTrigger.data('popup-handler') || null,
					dismissHandler: $popupTrigger.data('dismiss-handler') || null,
					dismissScopes: dismissScopes
				};

			if (eventData.$popupTarget.data('isPopup') !== 'true')
			{
				method.monitorTap();
				eventData.toggledClass && eventData.$popupTrigger.addClass(eventData.toggledClass) && eventData.$popupTarget.addClass(eventData.toggledClass);
				eventData.$popupTarget.data('isPopup', 'true');
				eventData.dismissScopes.forEach(function (scope) {
					scope.on(eventData.type + "." + eventData.namespace, eventData, method.popupDismiss);
				});
				eventData.popupHandler !== null && window[eventData.popupHandler](eventData.$popupTarget);

				method.setBodyCursorInIOS("pointer");
			}
			else if(method.isDismissTrigger($(event.target), eventData.$popupTarget))
			{
				method.popupDismiss(eventData);
			}
		},

		popupDismiss: function (event)
		{
			if (method.isTap === false)
				return ;
			var eventData = event, isListenerEvent = !!event.data;
			if (isListenerEvent)
			{
				eventData = $.extend({}, event, event.data);
				eventData.$dismissTrigger = $(event.target);
			}

			if (!isListenerEvent ||
					(eventData.$dismissTrigger.closest(eventData.$popupTrigger).length === 0
					&& method.isDismissTrigger(eventData.$dismissTrigger, eventData.$popupTarget)
					&& eventData.$popupTarget.data('isPopup') === 'true'))
			{
				eventData.toggledClass && eventData.$popupTrigger.removeClass(eventData.toggledClass) && eventData.$popupTarget.removeClass(eventData.toggledClass);
				eventData.$popupTarget.data('isPopup', 'false');
				eventData.dismissScopes.forEach(function (scope) {
					scope.off(eventData.type + "." + eventData.namespace, method.popupDismiss);
				});
				eventData.dismissHandler !== null && window[eventData.dismissHandler](eventData.$popupTarget);

				method.setBodyCursorInIOS("default");
			}
		},

		monitorTap: function ()
		{
			method.isTap = undefined;
			var start = {}, end = {};
			document.body.addEventListener('mousedown', mouseDown);
			document.body.addEventListener('mouseup', mouseUp);

			function mouseDown(event)
			{
				method.isTap = false;
				start.x = event.pageX;
				start.y = event.pageY;
			}

			function mouseUp(event)
			{
				end.x = event.pageX;
				end.y = event.pageY;

				if (Math.abs(end.x - start.x) < 5 && Math.abs(end.y - start.y) < 5)
				{
					method.isTap = true;
					document.body.removeEventListener('mousedown', mouseDown);
					document.body.removeEventListener('mouseup', mouseUp);
				}
			}
		},

		// Default: all be dismiss trigger(return true);
		// Check click point ($child) has '[data-popup-dismiss="false"]'('[data-popup-dismiss="true"]') or not;
		isDismissTrigger: function ($child, $parent)
		{
			var hasParent = $child.closest($parent);
			if (hasParent && hasParent.length > 0)
			{
				var $parentDismissTrue = $child.closest($('[data-popup-dismiss="true"]'), $parent),
						$parentDismissFalse = $child.closest($('[data-popup-dismiss="false"]'), $parent);
				if ($parentDismissFalse.length > 0)
				{
					return $parentDismissTrue.length > 0 ? $parentDismissFalse[0].contains($parentDismissTrue[0]) : false;
				}
			}
			return true;
		},

		// Fix issue : In iOS device, the dismiss function could not be triggered;
		setBodyCursorInIOS: function (val)
		{
			if (/iPhone|iPad|iPod/i.test(navigator.userAgent))
			{
				var $body = $('body'),
						popupCount = parseInt($body.data('popup-count') || '0', 10);
				if (val === 'pointer')
				{
					++popupCount === 1 && $body.css("cursor", val);
				}
				else if (val === 'default')
				{
					--popupCount === 0 && $body.css("cursor", val);
				}
				$body.data('popup-count', popupCount);
			}
		}
	};
	$.fn.popupDismiss = function ()
	{
		return this.each(function ()
		{
			$(this).on('click', method.popupEvent);
		});
	};
	$.extend({
		popupDismiss: function ()
		{
			popupDismissDelegate('body');
		},
		popupDismissDelegate: function (elSelector)
		{
			$(elSelector).on('click', '[data-toggle="' + pluginName + '"]', method.popupEvent);
		}
	})
})(jQuery);
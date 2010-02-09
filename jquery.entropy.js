/*
 * Entropy v0.1.0 - jQuery plugin for modular Entwine-based widgets
 * 02/09/2010
 * 
 * http://www.jqentropy.com
 *
 * Author: Josh Hundley
 * Twitter: hundleyBOT
 * Website: http://joshhundley.com
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

jQuery.entropy = (function($) {	
	
	var containerClass = 'widget';
	
	var util = {
		EventDetails: function(event, message, origin) {

			var triggerChain = [];
			
			this.addToTriggerChain = function(widget) {
				triggerChain.push(widget);
			};
			
			this.hasTriggered = function(widget) {
				
				for(var index in triggerChain) {			
					if (widget === triggerChain[index]) {
						return true;
					}
				}
				
				return false;
			};
			
			this.getTriggerChain = function() {

				return triggerChain;
			};
			
			this.getEvent = function() {

				return event;
			};
			
			this.getMessage = function() {
				
				return message;
			};
			
			this.getOrigin = function() {

				return jQuery(origin);
			};
			
			this.addToTriggerChain(origin);
		}					
	};
	
	var widget = {
		Base: function(userDefined) {
			var properties = {
				version: '0.1.0'		
			};
			
			jQuery.extend(properties, userDefined);
			
			return {
				getBound: function(){
					var bound = this.data('bound');
					
					if (typeof(bound) == 'undefined') {
						bound = {};
						this.data('bound', bound);
					}
					
					return bound;
				},
				getListeners: function(){
					var listeners = this.data('listeners');
					
					if (typeof(listeners) == 'undefined') {
						listeners = [];
						this.data('listeners', listeners);
					}
					
					return listeners;
				},
				respond: function(event, func, origin){			

					if (typeof(func) == 'undefined') {
						return false;
					}
					
					var bound = this.getBound();
											
					if (typeof(bound[event]) == 'undefined') {				
						bound[event] = [];
					}
					
					if (typeof(origin) == 'undefined') {
						origin = null;
					}				
										
					var eventObject = { func: func, origin: origin };			
					
					bound[event].push(eventObject);

					return this;
				},
				respondOnce: function(event, func, origin) {
								
					var bound = this.getBound();
					
					if (typeof(bound[event]) != 'undefined') {
						return false;
					}
					
					this.respond(event, func, origin);
					
					return this;
				},
				registerListener: function(listener){
				
					var listeners = this.getListeners();
					
					listeners.push(listener);
					
					return this;
				},
				notify: function(event, message, details){																			 	
					
					if (typeof(details) == 'undefined') {
						details = new util.EventDetails(event, message, this[0]);
					} else {
						if (details.hasTriggered(this[0])) { 
							return false;			
						}				
						
						details.addToTriggerChain(this[0]);
					}															
					
					var bound = this.getBound();
					
					var origin = this;
					
					var eventObject = null;
					
					if (typeof(bound[event]) != 'undefined') {
						for (var index in bound[event]) {				
																				
							if (bound[event][index].origin !== null && !$(details.getOrigin()).is(bound[event][index].origin)) {
								continue;
							}
												
							var callMe = function(i) {						
								return function() {														
									bound[event][i].func.call(origin, message, details);
								};
							};
																	
							var delay = callMe(index);
							
							setTimeout(delay, 0);										
						} 
					}
					
					var listeners = this.getListeners();
					
					for (var index in listeners) {
						$(listeners[index]).notify(event, message, details);
					}		
										
					var container = this.getContainer(); 
					
					if (container) {
						container.notify(event, message, details);				
					}							
					
					return this;
				},
				listen: function(listener){
				
					this.each(function(){
						jQuery(listener).registerListener(this);
					});
					
					return this;
				},
				getContainer: function() {
					
					var container = this.parents('.' + containerClass).get(0);
					
					if (typeof(container) == 'undefined') {
						return $([]); 
					}
					
					return $(container);
				},
				updateProperties: function(properties) {
					
					jQuery.extend(this.properties(), properties);				
				},
				properties: properties,
				onmatch: function(childDefined) {				

					for(var i in childDefined) {
						this.data(i, childDefined[i]);
					}
					
					jQuery.extend(this.properties(), childDefined);																			
				}
			};
		},
		Container: function(settings) {	
			
			return {
				onmatch: function() {						
					this.addClass(containerClass);
					this._super(settings);
				}
			};
		}
	};
	
	function registerModule(selector, module) {
			
		$(selector).entwine(module.call(window));
	}
							
	registerModule('*', widget.Base);
	registerModule('body', widget.Container);				

	return {
		widget: widget,
		util: util,
		registerModule: registerModule
	}
})(jQuery);
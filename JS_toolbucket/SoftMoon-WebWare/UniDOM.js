/*  UniDOM 2.1  July 31, 2015
 *  copyright © 2013, 2014, 2015 Joe Golembieski, SoftMoon-WebWare
 *  http://softmoon-webware.com/UniDOM_instructions.htm
 *
		This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.
		The original copyright information must remain intact.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with this program.  If not, see <http://www.gnu.org/licenses/>   */

//  character-encoding: UTF-8 DOS   tab-spacing: 2   word-wrap: no   standard-line-length: 120   max-line-length: 2400

//	¡Aloha! and Mahalo for reading these comments.



if (!SoftMoon)  var SoftMoon=new Object;
if (!SoftMoon.WebWare)  SoftMoon.WebWare=new Object;


if (typeof window.getComputedStyle !== 'function')  window.getComputedStyle=function(elmnt) {return elmnt.currentStyle;};

if (!Node)  { var Node=new Object;
	Node.ELEMENT_NODE=1;
	Node.ATTRIBUTE_NODE=2;
	Node.TEXT_NODE=3;
	Node.CDATA_SECTION_NODE=4;
	Node.PROCESSING_INSTRUCTION_NODE=7;
	Node.COMMENT_NODE=8;
	Node.DOCUMENT_NODE=9;
	Node.DOCUMENT_TYPE_NODE=10;
	Node.DOCUMENT_FRAGMENT_NODE=11;  }


;(function()  { //wrap UniDOM’s private space (to end of file)

														 // ↓ optional ↓
var UniDOM=function(element, applyDirect, passData)  {  /* ALTERNATE ARGUMENTS:
									 (ElementWrapper, applyDirect)           // ← passData is irrelevant for elements and ElementWrappers
									 (CSSQueryString, applyDirect)           // ← passData must be ==false (undefined)
									 (element‖ElementWrapper, CSSQueryString, applyDirect, passData)   // ← currently passData is irrelevant unless the CSS-Engine fails to return an array
									 (Array→[…may contain any number of legal arguments to this UniDOM function including nested Arrays…], applyDirect, passData)
									 (element‖ElementWrapper‖Array‖userData, applyDirect, passData=true)
*/
	if (!element)  return null;
	element=xElement(element);
	if (UniDOM.isElementNode(element))  {
		if (CSSEngine  &&  typeof arguments[1] == 'string')  return UniDOM(UniDOM.$(arguments[1], element), arguments[2], arguments[3]);
		else  return new UniDOM.ElementWrapper(element, applyDirect);  }
	else
	if (typeof arguments[0] == 'object'  &&  "length" in arguments[0])  {  //(arguments[0] instanceof Array)
		for (var i=0, wrapped=UniDOM.ElementWrapperArray(arguments[0], true, applyDirect);  i<arguments[0].length;  i++)  {
			wrapped[i]=UniDOM(arguments[0][i]);  }
		return  wrapped;  }
	else
	if (passData)  return arguments[0];
	else
	if (CSSEngine  &&  typeof arguments[0] == 'string')  return UniDOM(UniDOM.$(arguments[0], document), applyDirect);
	else  throw new Error("“UniDOM” accepts only:\n •a single DOM Element or UniDOM.ElementWrapper,"+(CSSEngine ? "":" or")+"\n •an Array of DOM Elements or UniDOM.ElementWrappers"+(CSSEngine ? ", or\n •a CSS-definer String":"")+".\n  Type of “"+(typeof arguments[0])+"” passed in.");
	};


	var CSSEngine;  //private

	function $query(CSSString, element, objFltr, applyDirect, powerSelect)  {
		var EWA=new UniDOM.ElementWrapperArray(CSSEngine.call(xElement(element), CSSString), false, applyDirect);
		if (EWA.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(EWA, objFltr, applyDirect, powerSelect);
		return EWA;  }


//  ☆☆☆ ¡¡¡DO NOT CONFUSE Sizzle with jQuery!!! ☆☆☆
//  ☆☆☆                                         ☆☆☆
//  ☆☆☆ ¡ if you call  UniDOM.globalize()       ☆☆☆
//  ☆☆☆ UniDOM’s $ will overwrite window.$ !    ☆☆☆
UniDOM.$=function() {
	if (typeof UniDOM.CSSEngine == 'function')  CSSEngine=UniDOM.CSSEngine;
	else
	if (typeof window.Sizzle == 'function')  CSSEngine=function(s) {return Sizzle(s, this)};  // http://sizzlejs.com/
	else
	if (typeof window.Slick == 'function')   CSSEngine=function(s) {return Slick(s, this)};   // http://mootools.net/docs/core/Slick/Slick
	if (CSSEngine)  {
		UniDOM.$=$query;          // auto-plugin Engine
		return $query.apply(UniDOM, arguments);  }
	else
	throw new Error("“UniDOM.$” requires “Sizzle.js” or “Slick.js” or the native “querySelectorAll” method (or similar CSSEngine) but none is installed.\n  See:\n  http://sizzlejs.com/\n  http://mootools.net/docs/core/Slick/Slick");  }
// if you don’t want to use Sizzle, Slick, or a similar package, remove the above function from UniDOM,
// and the UniDOM constructor method will supply a more appropriate Error message for debugging.

if (typeof Element.prototype.querySelectorAll == 'function')
UniDOM.CSSEngine=Element.prototype.querySelectorAll;
// PS I'm already brainstorming while I sleep on an Engine to utilize UniDOM’s more powerful query methods…


	//private: used internally
	var MS_exploder=(navigator) ?  navigator.userAgent.match( /MSIE[ ]?([1-9][0-9]?)/i )  :  false;
	if (MS_exploder)  MS_exploder=parseInt(MS_exploder[1]);

UniDOM.MS_exploder=MS_exploder; //publicly available


 /* ======The first half=========
	*
	*/
	//private
	function arrayify(v)  {return  (v instanceof Array) ? v : [v];}
	function getEventType(eT)  {eT=eT.toLowerCase().match( /^(?:on)?(.+)$/ );  return eT[1];}

	var handlerCounter=0, eventCounter=0,
			legacyEvents={// list of real events recognized by legacy MSIE
		//<body> and <frameset> Events
		load:true,
		unload:true,
		error:true,
		//Form Events
		blur:true,
		change:true,
		focus:true,
		focusin:true,
		focusout:true,
		reset:true,
		select:true,
		submit:true,
		//Image Events
		abort:true,
		//Keyboard Events
		keydown:true,
		keypress:true,
		keyup:true,
		//Mouse Events
		click:true,
		dblclick:true,
		mousedown:true,
		mousemove:true,
		mouseout:true,
		mouseover:true,
		mouseup:true,
		mouseenter:true,
		mouseleave:true,
		mousewheel:true,
		//UI Events
		contextmenu:true,
		copy:true,
		cut:true,
		domactivate:true,
		domfocusin:true,
		domfocusout:true,
		hashchange:true,
		paste:true,
		resize:true,
		scroll:true };

UniDOM.addEventHandler=function(element, eventType, handler, useCapture)  {
	element=xElement(element);
	if (element instanceof Array)  {
		for (var k=0, allAdded=new Array;  k<element.length;  k++)  {
			allAdded.push(UniDOM.addEventHandler(element[k], eventType, handler, useCapture));  }
		return allAdded;  }
	eventType=arrayify(eventType);  handler=arrayify(handler);  useCapture=Boolean(useCapture);
	var i, eType,
			userArgs=Array.prototype.slice.call(arguments, 4),
			wrapper=new Array,
			added=new Object;
	for (i=0; i<eventType.length; i++)  {
		etype=getEventType(eventType[i]);
		if (UniDOM.getEventHandler(element, etype, handler, useCapture) !== false)  {
			if (UniDOM.addEventHandler.errorOnDoubleBind)
				throw new Error('UniDOM will not double-bind event handlers.\n •Element: '+element.nodeName+'\n  id: '+element.id+'\n  className: '+element.className+'\n  name: '+element.name+'\n •event type: '+etype+"\n •"+handler.toString().substr(0, 240));
			else  continue;  }

		if (document.attachEvent  &&  (MS_exploder!==9  ||  UniDOM.addEventHandler.retroMSIE9))  {
				//old MSIE
			wrapper[i]=function(event, captured)  { // “captured” is used internally during the ==simulated== capturing-&-bubbling phases
				if (!event)  event=window.event;
				var j,  is_customEvent=!legacyEvents[event.type],
						pass=userArgs.slice(0);  pass.unshift(event);
				if (!captured)  {
					event.MSIE=true;
					event.target=       event.srcElement;
					event.relatedTarget=event.fromElement || event.toElement;
					event.eventPhase=   (event.srcElement===element) ? 2 : 3;
					event.charCode=     event.keycode;
					event.stopPropagation=function() {this.cancelBubble=true;  this.cancelCapture=true;};
					event.preventDefault =function() {this.returnValue=false;};  }
				if (!captured  &&  (event.type.match( /click|mouse|resize|scroll/ )  ||  is_customEvent))  {
					capturers=getCapturersInWindow((element.ownerDocument  ||  element.document  ||  element).defaultView);  // ← ElementNode || window || document
					if (capturers.length)  {
						var ancestors=new Array,  p=element,  rV,  phase=event.eventPhase,  capturerFired;
						while (p=p.parentNode)  {ancestors.unshift(p);}
						for (p=0; p<ancestors.length; p++)  {
							for (j=0; j<capturers.length; j++)  {
								if (capturers[j].eventType===event.type  &&  capturers[j].element===ancestors[p])  {
									capturerFired=true;
									rV=capturers[j].wrapper(event, true);  }  }
							if (event.cancelCapture)  return (rV===undefined) ? event.returnValue : rV;  }
						event.eventPhase=phase;  }  }
				if (!handler.suspend)  {
					if (useCapture)  event.eventPhase=1;
					event.id=eventCounter++;
					event.currentTarget=element;
					event.doContinue=true;
					if (event.type.match( /click|mouse/ ))  {
						var off=UniDOM.getMouseOffset(element, event);
						event.currentX=off.x;
						event.currentY=off.y;  }
					for (j=0;  event.doContinue && j<handler.length;  j++)  {
						if (typeof handler[j]['on'+event.type] == 'function')  handler[j]['on'+event.type].apply(handler[j], pass);
						else if (typeof handler[j].handleEvent == 'function')  handler[j].handleEvent.apply(handler[j], pass);
						else  handler[j].apply(element, pass);  }  }
				if (capturerFired  ||  (is_customEvent  &&  event.canBubble  &&  !captured))  {
					event.captured=capturerFired;
					event.eventPhase=3;
					getAllEventsInWindow((element.ownerDocument  ||  element.document  ||  element).defaultView, false);
					for (p=ancestors.length; --p>=0;)  {
						for (j=0; j<allEvents.length; j++)  {
							if (allEvents[j].eventType===event.type  &&  allEvents[j].element===ancestors[p]  &&  !allEvents[j].useCapture)
								rV=allEvents[j].wrapper(event, true);  }
						if (event.cancelBubble)  return (rV===undefined) ? event.returnValue : rV;  }
					event.cancelBubble=true;  }  }
			wrapper[i].MSIE=true;
			if (typeof element._UniDOM_attachEvent_ == 'function')
				element._UniDOM_attachEvent_('on'+etype, wrapper[i]);
			else  element.attachEvent('on'+etype, wrapper[i]);
			if (!legacyEvents[etype])  {  //MSIE will allow binding of any type, but may not allow synthetic dispatching (Event Generation) of custom types
				getCustomEventsInWindow((element.ownerDocument  ||  element.document  ||  element).defaultView);
				customEvents.push(wrapper[i]);  }  }

		else
		if (document.addEventListener)  {
			wrapper[i]=function(event)  {
				if (handler.suspend)  return;
				var j, off,  pass=userArgs.slice(0);  pass.unshift(event);
				if (event.type.match( /click|mouse/ )  &&  event.offsetX===undefined)  UniDOM.setMouseEventOffsets(event);
				event.id=eventCounter++;
				event.doContinue=true;
				for (j=0;  event.doContinue && j<handler.length;  j++)  {
					if (typeof handler[j]['on'+event.type] == 'function')  handler[j]['on'+event.type].apply(handler[j], pass);
					else if (typeof handler[j].handleEvent == 'function')  handler[j].handleEvent.apply(handler[j], pass);
					else  handler[j].apply(element, pass);  }  }
			element.addEventListener(etype, wrapper[i], useCapture);  }

		else throw new Error('Implementation can not add UniDOM Event Handler.');

		addingHandler=true;
		added[eventType[i]]=new UniDOM.EventHandler(element, etype, handler, useCapture, wrapper[i], userArgs);  }
	return added;  }
UniDOM.addEventHandler.errorOnDoubleBind=true;  // false quietly ignores double-binds
UniDOM.addEventHandler.retroMSIE9=false;       // true  will use old MSIE “attachEvent” w/simulated-capture, & “fireEvent” for Event-generation
																							 // false will use Standard “addEventListener,” & “dispatchEvent” for Event-generation
																							 // null  will use Standard “addEventListener,” & “dispatchEvent”+“fireEvent” for Event-generation
UniDOM.addEventHandler.apply=applyToElement; // (element, Array→[eventType, handler, useCapture])
UniDOM.addEventHandler._apply_=Function.prototype.apply;

	//private
	var addingHandler=false,  eventedWindows=new Array,  allEvents, capturers, customEvents;

// (PS don't forget addEventHandler returns a plain Object with properties that relate event-types to “EventHandler”s:
//  added=UniDOM.addEventHandler(e, 'onclick', h);  added.onclick.handler.push(another_h);  added.onclick.remove();
//  whereas getEventHandler returns only the EventHandler:
//  EH=UniDOM.getEventHandler(e, 'onclick', h);  EH.handler.push(another_h);  EH.remove();
//  in-other-words:  UniDOM.addEventHandler(e, 'onclick', h).onclick === UniDOM.getEventHandler(e, 'onclick', h) )
/*
	* a UniDOM.EventHandler Object has the following properties and method:
			id         unique id  ←do NOT change this value
			element    ←do NOT change this value, it is not live
			eventType  ←do NOT change this value, it is not live
			handler    {{LIVE}}  an array of the handlers that are executed in order for each event
			handler.suspend   {{LIVE}}  Boolean value to temporarily suspend calling the handlers (but the wrapper is still active)
			wrapper    ←do NOT change this value, it is not generally live.
									the wrapper function that is actually added as an event handler to the element.
									You may invoke this wrapper directly to simulate an event.
									MSIE uses this property to simulate event capturing, so in that case,
									during the simulated capture & bubble phases, this property is {{live}}
			userArgs   {{LIVE}}  an array of user arguments; each passed as an argument to each handler function by the wrapper.
			remove()   this method removes the event handler wrapper from the element and sets the id to false;
*/

// We want to allow → (myObject instanceof UniDOM.EventHandler)
// but disallow false construction.
UniDOM.EventHandler=function(element, eventType, handler, useCapture, wrapper, userArgs)  {
	if (this===UniDOM)  throw new Error('UniDOM.EventHandler is a constructor, not a function');  // redundant because ↓
	if (!addingHandler)  throw new Error('“UniDOM.EventHandler” Objects may only be created using UniDOM’s “addEventHandler”.');
	addingHandler=false;
	var d=element.ownerDocument  ||  element.document  ||  element,  // ← ElementNode || window || document
			w=d.defaultView,
			id='h'+(handlerCounter++);
	getAllEventsInWindow(w, true);
	allEvents[id]=this;
	if (useCapture  &&  (wrapper.MSIE  ||  MS_exploder===9))  {
		getCapturersInWindow(w);
		capturers.push(this);  }
	if (!legacyEvents[eventType]  &&  (wrapper.MSIE  ||  MS_exploder===9))  {
		getCustomEventsInWindow(w);
		customEvents.push(this);  }
	this.id=id;
	this.element=element;
	this.eventType=eventType;
	this.handler=handler;
	this.useCapture=useCapture;
	this.wrapper=wrapper;
	this.userArgs=userArgs;
	this.MSIE=wrapper.MSIE;  }

UniDOM.EventHandler.prototype.remove=function()  {
	if (!UniDOM.isElementNode(this.element)  &&  !UniDOM.isWindow(this.element))
		throw new Error("Can not remove “UniDOM.EventHandler”: its “element reference” has been corrupted.");
	var d=this.element.ownerDocument  ||  this.element.document  ||  this.element,
			w=d.defaultView;
	getAllEventsInWindow(w, false);
	if (allEvents[this.id] !== this)  throw new Error("Can not remove “UniDOM.EventHandler”: its “id” has been corrupted.");
	if (this.element.removeEventListener)  this.element.removeEventListener(this.eventType, this.wrapper, this.useCapture);
	if (this.element.detachEvent)  this.element.detachEvent('on'+this.eventType, this.wrapper);
	delete allEvents[this.id];
	this.id=false;
	if (MS_exploder && MS_exploder<=9)  {
		getCapturersInWindow(w);
		for (var i=0; i<capturers.length; i++)  {if (capturers[i]===this)  {capturers.splice(i, 1);  break;}}
		if (!legacyEvents[this.eventType])  {
			getCustomEventsInWindow(w);
			for (i=0; i<customEvents.length; i++)  {if (customEvents[i]===this)  {customEvents.splice(i, 1);  break;}}  }  }
	cleanWindow(w);  }


// When using third-party software on the same page with UniDOM,
// if your project requires event capturing (for drag and drop, for example) you should make sure
// to load the UniDOM file first, and then call this function before loading any other
// JavaScript™ files.
UniDOM.enable_oldMSIE_capture=function()  {
	if (typeof document.attachEvent !== 'function')  return false;
	Element.prototype._UniDOM_attachEvent_=Element.prototype.attachEvent;
	Element.prototype.attachEvent=function(eType, handler) {UniDOM.addEventHandler(this, eType, handler);};
	return true;  }


UniDOM.getEventHandler=function(element, eventType, handler, useCapture)  {
	element=xElement(element);
	eventType=getEventType(eventType);
	handler=arrayify(handler);
	var EH, id, j,
			d=element.ownerDocument  ||  element.document  ||  element;
	getAllEventsInWindow(d.defaultView, false);
	if (allEvents)  for (id in allEvents)  {
		EH=allEvents[id];
		if (element===EH.element  &&  eventType===EH.eventType  &&  useCapture==EH.useCapture
		&&  handler.length===EH.handler.length)  {
			for (j=0; j<handler.length; j++)  {if (handler[j]!==EH.handler[j])  return false;}
			return EH;  }  }
	return false;  }
UniDOM.getEventHandler.apply=applyToElement; // (element, Array→[eventType, handler, useCapture])
UniDOM.getEventHandler._apply_=Function.prototype.apply;


	//private
	function getAllEventsInWindow(w, makeNew)  {
		for (var i in eventedWindows)  {if (w===eventedWindows[i].window)  return allEvents=eventedWindows[i].allEvents;}
		if (!makeNew)  return allEvents=false;
		var ref={window:w, allEvents:new Object, capturers:new Array, customEvents:new Array};  //capturers & customEvents are only utilized by old MSIE
		eventedWindows.push(ref);
		if (w.addEventListener)  w.addEventListener('unload', UniDOM.removeAllEventHandlers, false);
		else
		if (w.attachEvent)  w.attachEvent('onunload', UniDOM.removeAllEventHandlers);
		return allEvents=ref.allEvents;  }
	function getCapturersInWindow(w)  { //  ♪ ♫ ♪ I’m a capturah; soul adventurah… … … ♫ ♪ ♫
		for (var i in eventedWindows)  {if (w===eventedWindows[i].window)  return capturers=eventedWindows[i].capturers;}  }
	function getCustomEventsInWindow(w)  {
		for (var i in eventedWindows)  {if (w===eventedWindows[i].window)  return customEvents=eventedWindows[i].customEvents;}  }


UniDOM.removeEventHandler=function(element, eventType, handler, useCapture)  {
															//  (my_EventHandler)                             //←preferred:  my_EventHandler.remove();
	var EH;
	if (arguments[0] instanceof UniDOM.EventHandler)
		EH=arguments[0];
	else  {
		EH=UniDOM.getEventHandler(element, eventType, handler, useCapture);
		if (EH===false)
			throw new Error("Can not remove unknown event: \nElement: "+element+" id: "+element.id+"\neventType: "+eventType+" useCapture: "+useCapture+"\n"+handler);  }
	EH.remove();  }
UniDOM.removeEventHandler.apply=applyToElement;  // (element, Array→[eventType, handler, useCapture])
UniDOM.removeEventHandler._apply_=Function.prototype.apply;


	//private
	function cleanWindow(w)  {
		if (eventedWindows.length===0)  return;
		for (var i in eventedWindows)  {if (w===eventedWindows[i].window)  break;}
		for (var id in eventedWindows[i].allEvents)  {return false;}    //if there are any EventHandlers still registered in this window, we can’t yet clean it.
		eventedWindows.splice(i, 1);
		if (w.removeEventListener)  w.removeEventListener('unload', UniDOM.removeAllEventHandlers, false);
		else
		if (w.detachEvent)  w.detachEvent('onunload', UniDOM.removeAllEventHandlers);  }


// registered to a window or element, or is a property of an element, so “this” is the window or element…
UniDOM.removeAllEventHandlers=function(element, goDeep)  {
	if (UniDOM.isWindow(this))  element=this;
	else  element=xElement(element||this);
	if (!UniDOM.isElementNode(element)  &&  !UniDOM.isWindow(element))  {
		throw new Error('UniDOM.removeAllEventHandlers is a method of a DOM Element or window, or must be supplied an element or window as an argument.');  }
	var d=element.ownerDocument  ||  element.document  ||  element,
			w=d.defaultView;
	getAllEventsInWindow(w, false);
	if (UniDOM.isElementNode(element))  { // DOM element passed in
		remover(element);
		if (goDeep)  UniDOM.getElements(element, remover, goDeep);  }
	else   // a window passed in
		for (var id in allEvents)  {allEvents[id].remove();}
	function remover(element)  {for (var id in allEvents)  {if (allEvents[id].element===element)  allEvents[id].remove();}}  }
UniDOM.removeAllEventHandlers.apply=applyToElement;  // (element, Array→[eventType, handler, useCapture])
UniDOM.removeAllEventHandlers._apply_=Function.prototype.apply;



//For MSIE9 both event paradigms may be triggered if UniDOM.addEventHandler.retroMSIE9=null
//  only old-MSIE ‖or‖ Standards may be triggered if UniDOM.addEventHandler.retroMSIE9=Boolean(true‖false)
UniDOM.generateEvent=function(element, eventType, eSpecs)  {  var i, j, p, d, eT, event;
	element=xElement(element);
	if (typeof eSpecs !== 'object')  eSpecs=new Object;
	eventType=arrayify(eventType);
	for (i=0; i<eventType.length; i++)  {
		eT=getEventType(eventType[i]);
		if (document.createEvent  &&  (MS_exploder!==9  ||  UniDOM.addEventHandler.retroMSIE9!==true))  {
			var subT=eT.match( /wheel|mouse|click|key|focus|dom|resize|scroll|./ );
			switch (eSpecs && eSpecs.view && subT[0])  {
				case 'wheel':
					if (typeof WheelEvent === 'function')  {event=new WheelEvent(eT, eSpecs);  break;}
				case 'mouse':
				case 'click':
					if (typeof MouseEvent === 'function')  event=new MouseEvent(eT, eSpecs); //allow newer properties when possible
					else  { event=document.createEvent('MouseEvent');
						event.initMouseEvent(eT, eSpecs.canBubble, eSpecs.cancelable,
							eSpecs.view, eSpecs.detail,
							eSpecs.screenX, eSpecs.screenY, eSpecs.clientX, eSpecs.clientY,
							eSpecs.ctrlKey, eSpecs.altKey, eSpecs.shiftKey, eSpecs.metaKey,
							eSpecs.button, eSpecs.relatedTarget);  }
				break;
				case 'key':
					if (typeof KeyboardEvent === 'function')  {event=new KeyboardEvent(eT, eSpecs);  break;}
				case 'focus':
					if (subT[0]==='focus'  &&  typeof FocusEvent === 'function')  {event=new FocusEvent(eT, eSpecs);  break;}
				case 'touch':
					if (subT[0]==='touch'  &&  typeof TouchEvent === 'function')  {event=new TouchEvent(eT, eSpecs);  break;}
				case 'resize':
				case 'scroll':
					if (typeof UIEvent === 'function')  event=new UIEvent(eT, eSpecs);
					else  { event=document.createEvent('UIEvent');
						event.initUIEvent(eT, eSpecs.canBubble, eSpecs.cancelable,
							eSpecs.view, eSpecs.detail);  } //it is unclear what “detail” has to do with the keyboard, or how to set a key value except maybe through the eSpecs.userArgs
				break;
				default:  //Mouse & UI Events without user-defined eSpecs “should” auto-generate appropriate real-time values
					if (eSpecs  &&  eSpecs.detail  &&  typeof CustomEvent === 'function')  event=new CustomEvent(eT, eSpecs);
					else
					if (typeof Event === 'function')  event=new Event(eT, eSpecs);
					else  { event=document.createEvent('Event');
						event.initEvent(eT, eSpecs.canBubble, eSpecs.cancelable);  }  }
			//for (p in eSpecs)  {if (event[p] === undefined  &&  !event.hasOwnProperty(p))  event[p]=eSpecs[p];}
			if (eSpecs.userArgs)  for (p in eSpecs.userArgs)  {event[p]=eSpecs.userArgs[p];}
			element.dispatchEvent(event);  }
		if (document.createEventObject  &&  (MS_exploder!==9  ||  UniDOM.addEventHandler.retroMSIE9!==false))  {  //old MSIE
			event=document.createEventObject();  event.type=eT;  event.canBubble=eSpecs.canBubble;
			if (eSpecs.userArgs)  for (p in eSpecs.userArgs)  {event[p]=eSpecs.userArgs[p];}
			if (legacyEvents[eT])  element.fireEvent('on'+eT, event);
			else  {  //old I.E. will choke on user-defined or modern event types
				d=element.ownerDocument  ||  element.document  ||  element;
				getCustomEventsInWindow(d.defaultView);
				for (j=customEvents.length; --j>=0;)  {
					if (customEvents[j].eventType===eT  &&  customEvents[j].element===element)
						customEvents[j].wrapper(event);  }  }  }  }  }
UniDOM.generateEvent.apply=applyToElement;  // (element, Array→[eventType, eSpecs])
UniDOM.generateEvent._apply_=Function.prototype.apply;


if (typeof Element.dispatchEvent === 'function'  &&  (MS_exploder!==9  ||  UniDOM.addEventHandler.retroMSIE9!==true))
UniDOM.triggerEvent=function(element, event)  {
	element=xElement(element);
	element.dispatchEvent(event);  };
else
UniDOM.triggerEvent=function(element, event)  {
	element=xElement(element);
	element.fireEvent('on'+getEventType(event.type), event);  };





UniDOM.setMouseEventOffsets=function(event)  {  //returns the event object, modified to reflect the offset-values.
		var offset=UniDOM.getElementOffset(event.target, true);
		event.offsetX=event.clientX-offset.x;
		event.offsetY=event.clientY-offset.y;
		event.fixedOffset=offset.fixed;
		try { var offset=UniDOM.getElementOffset(event.currentTarget, true);
			event.currentX=event.clientX-offset.x;
			event.currentY=event.clientY-offset.y;  }
		catch(e) {}
		return event;  }


UniDOM.getMouseOffset=function(element, event)  {  //returns an offset-values object; event object is not modified.
		element=xElement(element);
		var offset=UniDOM.getElementOffset(element, true);
		offset.x=event.clientX-offset.x;
		offset.y=event.clientY-offset.y;
		return offset;  }


//  Returns the element offset from the window’s top-left corner if scroll=true;
//  or if  scroll=false  from the document’s top-left corner.
//  If the element is − or is nested within − a fixed-position element, it will be noted in the return object…
UniDOM.getElementOffset=function(element, scroll)  {
														//  (element, ancestor)  ← alternate, find the offset from the ancestor
	var x=0, y=0, scrl=false, fixed=false, ancestor=null;
	element=xElement(element);
	if (typeof scroll === 'boolean')  scrl=scroll;
	else if (UniDOM.isElementNode(arguments[1]))  ancestor=arguments[1];
//	console.log('---');
	while (!fixed  &&  (s=(getComputedStyle(element, null)  ||  element.currentStyle))
			&&  element!==ancestor  &&  element.offsetParent)  {
		if (s.position==='fixed')  {scrl=false;  fixed=true;}
//								console.log("<"+element.nodeName+" id="+element.id+">  postion: "+s.position+";  offsetLeft: "+element.offsetLeft+";  offsetTop: "+element.offsetTop);
		x+= element.offsetLeft;
		y+= element.offsetTop;
		element=element.offsetParent;  }
	if (scrl)  {x-=UniDOM.getScrollX();  y-=UniDOM.getScrollY();}  //console.log('pageYOffset: '+window.pageYOffset);
//	console.log('---');
	return {x:x, y:y, fixed:fixed};  }


UniDOM.isElementNode=(MS_exploder  &&  MS_exploder<9) ?
	function(e)  {return  typeof e == 'object'  &&  (e instanceof Element  ||  e.nodeType===Node.ELEMENT_NODE);}  //dumb-down the test for Microsoft to pass
: function(e)  {return  typeof e == 'object'  &&  (e instanceof Element  ||  (e instanceof Node  &&  e.nodeType===Node.ELEMENT_NODE));};

UniDOM.isWindow=(Window  &&  (window instanceof Window)) ?
	function(e)  {return  e instanceof Window;}
: function(e)  {return  typeof e == 'object'  &&  ((e=e.toString()) && e.match( /wIndOw/i ));};


UniDOM.addEventHandler(window, 'onload', function()  {  // crusty old fossil crutches

//position of the browser window on the desktop:
if (window.screenLeft)  {  //  standard
	UniDOM.getScreenX=function(w)  {return  (w  ||  window).screenLeft;};
	UniDOM.getScreenY=function(w)  {return  (w  ||  window).screenTop;};  }
else
if (window.screenX)  {  // legacy FireFox
	UniDOM.getScreenX=function(w)  {return  (w  ||  window).screenX;};
	UniDOM.getScreenY=function(w)  {return  (w  ||  window).screenY;};  }


if (window.innerWidth)  { // console.log('using standard:  window.innerWidth');
	UniDOM.getInnerWidth=function(w)  {return  (w  ||  window).innerWidth;};
	UniDOM.getInnerHeight=function(w)  {return  (w  ||  window).innerHeight;};
	UniDOM.getScrollX=function(w)  {return  (w  ||  window).pageXOffset;};
	UniDOM.getScrollY=function(w)  {return  (w  ||  window).pageYOffset;};  }
else
if (document.documentElement  && document.documentElement.clientWidth)  { //  console.log('using legacy MSIE with a DOCTYPE:  document.documentElement.clientWidth');
	UniDOM.getInnerWidth=function(w)  {return  (w  ||  window).document.documentElement.clientWidth;};
	UniDOM.getInnerHeight=function(w)  {return  (w  ||  window).document.documentElement.clientHeight;};
	UniDOM.getScrollX=function(w)  {return  (w  ||  window).document.documentElement.scrollLeft;};
	UniDOM.getScrollY=function(w)  {return  (w  ||  window).document.documentElement.scrollTop;};  }
else
if (document.body.clientWidth)  { // console.log('using dinosaur MSIE without a DOCTYPE:  document.body.clientWidth');
	UniDOM.getInnerWidth=function(w)  {return  (w  ||  window).document.body.clientWidth;};
	UniDOM.getInnerHeight=function(w)  {return  (w  ||  window).document.body.clientHeight;};
	UniDOM.getScrollX=function(w)  {return  (w  ||  window).document.body.scrollLeft;};
	UniDOM.getScrollY=function(w)  {return  (w  ||  window).document.body.scrollTop;};  }

if (document.documentElement  && document.documentElement.scrollWidth)  { //  console.log('using legacy MSIE with a DOCTYPE:  document.documentElement.scrollWidth');
	UniDOM.getDocumentWidth=function(w)  {return  (w  ||  window).document.documentElement.scrollWidth;};
	UniDOM.getDocumentHeight=function(w)  {return  (w  ||  window).document.documentElement.scrollHeight;};  }
else
if (document.body.scrollWidth)  { // console.log('using dinosaur MSIE without a DOCTYPE:  document.body.scrollWidth');
	UniDOM.getDocumentWidth=function(w)  {return  (w  ||  window).document.body.scrollWidth;};
	UniDOM.getDocumentHeight=function(w)  {return  (w  ||  window).document.body.scrollHeight;};  }
});



/* ========The second half======
 *
 *
 */


// If no match is found, false is returned.
// If goDeep evaluates to false on the first match found, that single element will be returned.
// If goDeep evaluates to true on the first match found, an “ElementWrapperArray” (a simple Array with added “UniDOM power methods”)
//  is returned (the result may only be one member, or multiple members of elements)
	function getAncestor(cb, goDeep, objFltr, applyDirect, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getAncestor” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=function() {return false};
		else if (typeof goDeep !== 'function')  {var deep=Boolean(goDeep);  goDeep=function() {return deep;};}
		var parent=this.parentNode,
				found=false;
		do {
			if (cb(parent, this))  {
				if (!found  &&  !goDeep(parent, this))  return parent;
				if (!found)  found=new UniDOM.ElementWrapperArray(false, applyDirect);
				found.push(parent);  }  }
		while ((!found || goDeep(parent, this))  &&  (parent=parent.parentNode));
		if (found && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(found, objFltr, applyDirect, powerSelect);
		return found;  }


// for getAncestor, getElements, getElders, and getJuniors:
// cb → function should decide whether each element passed to it is the/an ancestor/descendant/elder/junior
//  of choice and return a Boolean value indicating such choice.
// goDeep → may be •Boolean (default is false for Ancestors, true for the rest) or
//  a •function that evaluates each individual element passed to it and returns a Boolean value.
// goDeep.doContinue → Boolean may be changed to false by goDeep or cb to end query immediately (¡not for getAncestor!)
// objFltr → may be a filter-function returning Object-property names.  See the objectify function down below.
// applyDirect → Boolean: ¿apply “power methods” directly to returned arrays?  See the UniDOM.ElementWrapperArray constructor.
// powerSelect → Boolean: ¿apply nonstandard properties (getSelected() & setSelected()) to <select> elements?


// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
//  a.k.a. getDescendents()  …“getElements” reflects the standard DOM method names, but this can gather Nodes of other types also.
	function getElements(cb, goDeep, objFltr, applyDirect, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getElements” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=function() {return true;};
		else if (typeof goDeep !== 'function')  {var deep=Boolean(goDeep);  goDeep=function() {return deep;};}
		goDeep.doContinue=true;
		var found=UniDOM.ElementWrapperArray(_getElements(this.childNodes, cb, goDeep, this), false, applyDirect);
		if (found.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(found, objFltr, applyDirect, powerSelect);
		return found;  }

	//private
	function _getElements(kids, cb, goDeep, contextElement)  {
		var found=new Array,
				grandkids, i, kl;
		for (i=0, kl=kids.length;  goDeep.doContinue && i<kl;  i++)  {
			if (cb(kids[i], contextElement))  found.push(kids[i]);
			if (kids[i].hasChildNodes()  &&  goDeep(kids[i], contextElement)
			&&  (grandkids=arguments.callee(kids[i].childNodes, cb, goDeep, contextElement)).length)
				found=found.concat(grandkids);  }
		return found;  }



// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
	function getElders(cb, goDeep, objFltr, applyDirect, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getElders” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=function() {return true};
		else if (typeof goDeep !== 'function')  {var deep=Boolean(goDeep);  goDeep=function() {return deep;};}
		goDeep.doContinue=true;
		var elder=this,
				found=UniDOM.ElementWrapperArray(false, applyDirect);
		do {  while (goDeep.doContinue  &&  elder.previousSibling)  {
			elder=elder.previousSibling;
			while (elder.hasChildNodes()  &&  goDeep(elder, this))  {elder=elder.lastChild;}
			if (cb(elder, this))  found.push(elder);  }  }
		while (goDeep.doContinue  &&  (elder=elder.parentNode)  &&  (cb(elder, this) ? found.push(elder) : true));
		if (found.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(found, objFltr, applyDirect, powerSelect);
		return found;  }


// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
	function getJuniors(cb, goDeep, objFltr, applyDirect, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getJuniors” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=function() {return true};
		else if (typeof goDeep !== 'function')  {var deep=Boolean(goDeep);  goDeep=function() {return deep;};}
		goDeep.doContinue=true;
		var junior=this, cousins,
				found=UniDOM.ElementWrapperArray(false, applyDirect);
		do {  while (goDeep.doContinue  &&  junior.nextSibling)  {
			junior=junior.nextSibling;
			if (cb(junior, this))  found.push(junior);
			if (junior.hasChildNodes()  &&  goDeep(junior, this)
			&&  (cousins=_getElements(junior.childNodes, cb, goDeep, this)).length)
				found=found.concat(cousins);  }  }
		while (goDeep.doContinue  &&  (junior=junior.parentNode)  &&  goDeep(junior, this));
		if (found.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(found, objFltr, applyDirect, powerSelect);
		return found;  }


// returns (e) if the element (e) is an ancestor/descendant of this-Element.
// else returns false.
	function hasAncestor(e)  {return getAncestor.call(this, function(a) {return (a===e)})}
	function hasElement(e)  {ta=this;  return  (UniDOM.isElementNode(e)  &&  getAncestor.call(e, function(a) {return (a===ta)}))  ?  e : false;}


	function getElementsByName(n, deep, objFltr, applyDirect, powerSelect)  {
		if (n===""  ||  typeof n === 'undefined'  ||  n===null)  n=new RegExp('^.+$');
		else
		if (typeof n !== 'object'  ||  !(n instanceof RegExp))  n=new RegExp('^'+n+'$');
		if (typeof objFltr !== 'function')  objFltr=function(e) {return e.name;};
		var found=getElements.call(this,
			function(e) {return typeof e.name == 'string'  &&  e.name.match(n);},
			deep, objFltr, applyDirect, powerSelect);
		return found.length ? found : false;  };


	function getElementsByClass(c, deep, objFltr, applyDirect, powerSelect)  {
		if (typeof c === 'string')  {c=cleanClass(c);  c=c.split(" ");}
		return getElements.call(this,
			function(e) {return hasClass.call(e, c);},
			deep, objFltr, applyDirect, powerSelect );  }
//  ↓↓
// … for strings passed in as members of an Array of classnames …
// see the SPECIAL NOTES for “hasClass” below
//  ↑↑
	function getAncestorByClass(c, deep, objFltr, applyDirect, powerSelect)  {
		if (typeof c === 'string')  {c=cleanClass(c);  c=c.split(" ");}
		return getAncestor.call(this,
			function(e) {return hasClass.call(e, c);},
			deep, objFltr, applyDirect, powerSelect );  }


	function getElementsByComplex(conditions, deep, objFltr, applyDirect, powerSelect)  {
		return getElements.call(this,
			function(e) {return has.call(e, conditions.data, conditions.filter);},
			deep, objFltr, applyDirect, powerSelect );  }

	function getAncestorByComplex(conditions, deep, objFltr, applyDirect, powerSelect)  {
		return getAncestor.call(this,
			function(e) {return has.call(e, conditions.data, conditions.filter);},
			deep, objFltr, applyDirect, powerSelect );  }


	//data is a random-length array of a user-defined set of “conditions” to be met
	//data members that have a “logic” property should be Arrays that are considered a sub-set of conditions
	// ¡ NOTE how NOT≡NOR but XNOT≠XNOR !
	function has(data, filter)  { // filter-function should return true if each data “condition” is met, false if not
		var logic= data.logic || 'and',   // data.logic should be either:  'and'  'or'  'nor'  'not'  'nand'  'xor'  'xnor'  'xnot'
				xFlag=false, i, c=0;
		if (logic==='nor')  logic='not'
		for (i=0;  i<data.length;  i++)  {  //the Object (Element) or String in question ↓↓
			if (data[i].logic ?  arguments.callee.call(this, data[i], filter)  :  filter(this, data[i]))
				switch (logic)  {
				case 'not':  return false;
				case 'or':  return true;
				case 'xor':  if (xFlag)  return false;  else  xFlag=true;  }
			else switch (logic)  {
				case 'and':  return false;
				case 'xnot':  if (xFlag)  return false;  else  xFlag=true;  continue;
				case 'xnor':
				case 'nand':  c++;  }  }
		return logic==='and' || logic==='not' || xFlag || (logic==='nand' && c<i) || (logic==='xnor' && (c===0 || c===i));  }



	/* ===== SPECIAL NOTE: ======
		if you pass in multiple class names as a string with a space, the className property of a matching element must
		have these class names in the given order, adjacent to each-other.  For example, given four elements:
			<div class='foo bar'>
			<div class='baz foo bar buz'>
			<div class='foo baz bar'>
			<div class='bar foo'>
		only the first two match  hasClass( 'foo bar' )
		but all four match        hasClass( ['foo', 'bar'] )
		You can use this fact to style Elements with CSS in a similar fashion,
		but gather them for use by JavaScript in different groups.
		¡Contrast this with “getElementsByClass()” which converts a single-string with spaces to an array
		 before calling “hasClass()”!  So:
			getElementsByClass( 'foo bar' ) ≡≡≡ hasClass( ['foo', 'bar'] )
			getElementsByClass( ['foo bar'] ) ≡≡≡ hasClass( 'foo bar' )
			getElementsByClass( ['foo', 'bar'] ) ≡≡≡ hasClass( ['foo', 'bar'] )
			getElementsByClass( ['foo bar', 'baz'] ) ≡≡≡ hasClass( ['foo bar', 'baz'] )  ← matches only the second div
	 */
	function hasClass(cna, logic)  {  // cna may be the string name of the class or a RegExp;  or a “logic array” of these ← see above
		if (typeof this.className !== 'string' || this.className=="")  return false;
		if (!(cna instanceof Array))  cna=[cna];
		cna.logic=logic;  // see function “has” (above) for legal values for “logic”
		return has.call(this, cna, function(e, c)  { //is passed one className in the cna at a time
			var not=false;
			if (typeof c === 'function')  return c(e)^c.not;
			if (typeof c !== 'object'  ||  !(c instanceof RegExp))  {
				if (typeof c == 'string'  &&  c.charAt(0)==='!')  {c=c.substr(1);  not=true;}
				c=new RegExp('\\b'+c+'\\b');  }
			return (not  ||  c.not)  ?  (e.className.match(c)===null) : e.className.match(c);  });  }


	// c must be the string name of the class  or an array of these strings
	function addClass(c)  {this.className=aClass(this.className, c);}
	function aClass(cn, ac)  {  //private
		if (!(ac instanceof Array))  ac=[ac];
		for (var i=0; i<ac.length; i++)  {
			if (!(typeof cn == 'string'  &&  cn.match( new RegExp('\\b'+ac[i]+'\\b') )))
				cn+=(cn) ? (" "+ac[i]) : ac[i];  }
		cn=cleanClass(cn);
		return cn;  }

	// c may be the string name of the class or a RegExp  or an array of these
	function removeClass(c) {this.className=xClass(this.className, c);}
	function xClass(cn, xc) {  //private
		if (typeof cn != 'string')  return;
		if (!(xc instanceof Array))  xc=[xc];
		for (var i=0; i<xc.length; i++)  {
			cn=cn.replace((typeof xc[i] == 'object'  &&  (xc[i] instanceof RegExp)) ?  xc[i]  :  new RegExp('\\b'+xc[i]+'\\b', 'g'),  "");
			cn=cleanClass(cn);  }
		return cn;  }

	//private
	function cleanClass(cn)  {
		cn=cn.replace( /^\s*/ , "");
		cn=cn.replace( /\s*$/ , "");
		cn=cn.replace( /\s{2,}/g , " ");
		return cn;  }


	function useClass(c, b)  {  // c should be the string name of the class
		if (b)  this.className=aClass(this.className, c);
			else  this.className=xClass(this.className, c);  }


	function swapOutClass(xc, ac)  {  // xc=remove class   ac=add class
		var cn=xClass(this.className, xc);
		this.className=aClass(cn, ac);  }


	function disable(flag, className)  {
		if (className===undefined)  className='disabled';
		flag=Boolean(flag);
		var eventArgs={userArgs: {disable: flag}};
		this.disabled=flag;
		useClass.call(this, className, flag);
		try {UniDOM.generateEvent(this, 'onDisabledStateChange', eventArgs);}  catch(e) {};
		for (var i=0, fields=getElements.call(this, isInterface, goDeeper);  i<fields.length;  i++)  {
			fields[i].disabled=flag;
			try {UniDOM.generateEvent(fields[i], 'onDisabledStateChange', eventArgs);}  catch(e) {};  }
		//private
		function isInterface(e) {return  e.nodeType===1  &&  (
			e.getAttribute('tabIndex')!==null  ||  e.getAttribute('contentEdible')!==null  ||
			e.nodeName==='INPUT' || e.nodeName==='SELECT' || e.nodeName==='TEXTAREA' || e.nodeName==='BUTTON' );}
		function goDeeper(e) {return !e.disabled  &&  !hasClass.call(e, className);};  }





//  practical versatility vs. performance speed:  should we force this format to accept *only* DOM Elements? ¿ xElement(element)  vs.  element ?
UniDOM.getAncestor=function(element)  {return getAncestor.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.getElements=function(element)  {return getElements.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.getElders=function(element)  {return getElders.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.getJuniors=function(element)  {return getJuniors.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.getElementsByName=function(element)  {return getElementsByName.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.getElementsByClass=function(element)  {return getElementsByClass.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.getAncestorByClass=function(element)  {return getAncestorByClass.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.getElementsByComplex=function(element)  {return getElementsByComplex.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.getAncestorByComplex=function(element)  {return getAncestorByComplex.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.hasAncestor=function(element)  {return hasAncestor.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.hasElement=function(element)  {return hasElement.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.has=function(element)  {return has.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.hasClass=function(element)  {return hasClass.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.addClass=function(element)  {return addClass.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.removeClass=function(element)  {return removeClass.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.useClass=function(element)  {return useClass.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.swapOutClass=function(element)  {return swapOutClass.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};
UniDOM.disable=function(element)  {return disable.apply(xElement(element), Array.prototype.slice.call(arguments, 1));};



//constructor
UniDOM.ElementWrapper=function(element, applyDirect)  {this.element=element;  this.applyDirect=applyDirect;};

UniDOM.ElementWrapper.prototype.$=function(CSSString, objFltr, applyDirect, powerSelect)  {
	return UniDOM(UniDOM.$(CSSString, this.element, objFltr, (applyDirect!==undefined) ? applyDirect : this.applyDirect, powerSelect));  };

UniDOM.ElementWrapper.prototype.addEventHandler=function()  {return UniDOM.addEventHandler.apply(this.element, arguments);};
UniDOM.ElementWrapper.prototype.removeEventHandler=function()  {UniDOM.removeEventHandler.apply(this.element, arguments);  return this;};
UniDOM.ElementWrapper.prototype.removeAllEventHandlers=function(goDeep)  {UniDOM.removeAllEventHandlers(this.element, goDeep);  return this;};
UniDOM.ElementWrapper.prototype.generateEvent=function()  {UniDOM.generateEvent.apply(this.element, arguments);  return this;};
UniDOM.ElementWrapper.prototype.triggerEvent=function(event)  {UniDOM.triggerEvent(this.element, event);  return this;};

UniDOM.ElementWrapper.prototype.getOffset=function(scroll)  {return UniDOM.getElementOffset(this.element, scroll);}
UniDOM.ElementWrapper.prototype.getMouseOffset=function(event)  {return UniDOM.getMouseOffset(this.element, event);}

UniDOM.ElementWrapper.prototype.isElementNode=function()  {return UniDOM.isElementNode(this.element);}

UniDOM.ElementWrapper.prototype.getAncestor=function()  {return UniDOM(getAncestor.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.getElements=function()  {return UniDOM(getElements.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.getElders=function()  {return UniDOM(getElders.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.getJuniors=function()  {return UniDOM(getJuniors.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.getElementsByName=function()  {return UniDOM(getElementsByName.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.getElementsByClass=function()  {return UniDOM(getElementsByClass.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.getAncestorByClass=function()  {return UniDOM(getAncestorByClass.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.getElementsByComplex=function()  {return UniDOM(getElementsByComplex.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.getAncestorByComplex=function()  {return UniDOM(getAncestorByComplex.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.hasAncestor=function()  {return UniDOM(hasAncestor.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.hasElement=function()  {return UniDOM(hasElement.apply(this.element, arguments), this.applyDirect, true);};
UniDOM.ElementWrapper.prototype.has=function()  {return has.apply(this.element, arguments);};
UniDOM.ElementWrapper.prototype.hasClass=function()  {return hasClass.apply(this.element, arguments);};
UniDOM.ElementWrapper.prototype.addClass=function()  {addClass.apply(this.element, arguments);  return this;};
UniDOM.ElementWrapper.prototype.removeClass=function()  {removeClass.apply(this.element, arguments);  return this;};
UniDOM.ElementWrapper.prototype.useClass=function()  {useClass.apply(this.element, arguments);  return this};
UniDOM.ElementWrapper.prototype.swapOutClass=function()  {swapOutClass.apply(this.element, arguments);  return this};
UniDOM.ElementWrapper.prototype.disable=function()  {disable.apply(this.element, arguments);  return this;};

UniDOM.ElementWrapper.prototype.getSelected=function() {if (this.element.nodeName==='SELECT') return getSelectedOptions.call(this.element);};
UniDOM.ElementWrapper.prototype.setSelected=function() {if (this.element.nodeName==='SELECT') return setSelected.apply(this.element, arguments);};


	//private
	var block=false;
	// The “power methods” of an “ElementWrapperArray” repeatedly call the “power methods” for individual elements
	// and conglomerate the results into one new “ElementWrapperArray.”  However the methods for elements themselves
	// create and return “ElementWrapperArrays” (passed back to the initial “ElementWrapperArray power method”);
	// these interim Arrays need NOT have “power methods” as they are immediately concatenated to the final returned Array.
	// Since we can not prototype these methods into an ElementWrapperArray without loosing the inherent functionality
	// of the “length” property of a real JavaScript Array, the overhead of creating and adding them is a burden.
	// We therefore block the creation of the “power methods” whilst executing an “ElementWrapperArray power method.”

// all arguments are optional:      Boolean       Boolean
UniDOM.ElementWrapperArray=function(wrapElements, applyDirect)  {      //  ← a new Array will be created with the relevant “power methods”.
	//  alternate arguments:         (userArray, wrapElements, applyDirect)  ← the userArray will have the relevant “power methods” added to it.

	//pass in any number of additional values, each to become a member of the returned array; but you must pass at least one option to also pass Elements to add.
	//each member in the userArray and those added to the returned Array should be a DOM Element or a UniDOM.ElementWrapper according to “wrapElements”
	var wa, i, p;
	if (arguments[0] instanceof Array)  {
		// ¡remember wrapElements and applyDirect are ☆references☆ to the arguments object, so changing one changes the other!
		wa=arguments[0];  wrapElements=arguments[1];  applyDirect=arguments[2];  }
	else  wa=new Array;

	wa.wrappedElements=Boolean((wrapElements===undefined) ? UniDOM.ElementWrapperArray.wrappedElements : wrapElements);

	if (block) return wa;  //block is controlled exclusively by getConglomerate below

	applyDirect=(typeof arguments[1] == 'boolean') ?  applyDirect : Boolean(UniDOM.ElementWrapperArray.applyDirect);

	wa._ = new UniDOM.ElementWrapperArray.dfltMethods(wa);
	if  (applyDirect  &&  !wa.EWAMAppliedDirect)  for (p in wa._)  {wa[p]=wa._[p];}
	wa.EWAMAppliedDirect=(applyDirect  ||  wa.EWAMAppliedDirect);

	for (i=1; i<arguments.length; i++)  {
		if ((arguments[i] instanceof Element)  ||  (arguments[i] instanceof UniDOM.ElementWrapper))  {
			wa._.add.apply(wa, Array.prototype.slice.call(arguments, i));
			break;  }  }

	return wa;  }
// default values for constructor above (unused internally by UniDOM’s functions and methods)
UniDOM.ElementWrapperArray.wrappedElements=false;
UniDOM.ElementWrapperArray.applyDirect=false;


UniDOM.ElementWrapperArray.dfltMethods=function(EWA) {this.EWA=EWA;}
var cb;  //private

UniDOM.ElementWrapperArray.dfltMethods.prototype.getAncestor=function() {cb=getAncestor;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.getElements=function() {cb=getElements;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.getElders=function() {cb=getElders;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.getJuniors=function() {cb=getJuniors;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.getElementsByName=function() {cb=getElementsByName;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.getElementsByClass=function() {cb=getElementsByClass;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.getAncestorByClass=function() {cb=getAncestorByClass;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.getElementsByComplex=function() {cb=getElementsByComplex;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.getAncestorByComplex=function() {cb=getAncestorByComplex;  return getConglomerate.apply(this, arguments);};

UniDOM.ElementWrapperArray.dfltMethods.prototype.hasAncestor=function() {cb=hasAncestor;  return getConglomerate.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.hasElement=function() {cb=hasElement;  return getConglomerate.apply(this, arguments);};

UniDOM.ElementWrapperArray.dfltMethods.prototype.has=function() {cb=has;  return applyToAll.apply(this, arguments);};

UniDOM.ElementWrapperArray.dfltMethods.prototype.hasClass=function() {cb=hasClass;  return applyToAll.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.addClass=function() {cb=addClass;  return applyToAll.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.removeClass=function() {cb=removeClass;  return applyToAll.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.useClass=function() {cb=useClass;  return applyToAll.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.swapOutClass=function() {cb=swapOutClass;  return applyToAll.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.disable=function() {cb=disable; return applyToAll.apply(this, arguments);};

UniDOM.ElementWrapperArray.dfltMethods.prototype.addEventHandler=function() {cb=UniDOM.addEventHandler;  return applyToAll.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.removeEventHandler=function() {cb=UniDOM.removeEventHandler;  return applyToAll.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.generateEvent=function() {cb=UniDOM.generateEvent;  return applyToAll.apply(this, arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.triggerEvent=function() {cb=UniDOM.triggerEvent;  return applyToAll.apply(this, arguments);};

UniDOM.ElementWrapperArray.dfltMethods.prototype.isElementNode=function() {cb=UniDOM.isElementNode;  return invokeAll.apply(this);};

UniDOM.ElementWrapperArray.dfltMethods.prototype.getSelected=function() {return getSelectedInputs.apply(getEWA(this), arguments);};
UniDOM.ElementWrapperArray.dfltMethods.prototype.setSelected=function() {return setSelected.apply(getEWA(this), arguments);};

UniDOM.ElementWrapperArray.dfltMethods.prototype.objectify=function(filter, applyDirect, powerSelect)  { var EWA=getEWA(this);
	objectify(EWA, filter, (arguments.length>1) ? applyDirect : !(this instanceof UniDOM.ElementWrapperArray.dfltMethods), powerSelect);
	return EWA;  }

UniDOM.ElementWrapperArray.dfltMethods.prototype.map=function(f, o, wrap, applyDirect)  { var EWA=getEWA(this);
 for (var i=0, l=EWA.length, ra=new Array;  i<l;  i++)  {
	ra[i] = (o) ? f.call(o, EWA[i], i, EWA)
							: f(EWA[i], i, EWA);  }
	if (typeof applyDirect === 'undefined')  applyDirect=EWA.EWAMAppliedDirect;
	return wrap ? UniDOM.ElementWrapperArray(ra, true, applyDirect) : ra;  }

UniDOM.ElementWrapperArray.dfltMethods.prototype.wrap=function(flag) {var EWA=getEWA(this);  EWA.wrappedElements=(flag===undefined) ? true : Boolean(flag);  return EWA;};
UniDOM.ElementWrapperArray.dfltMethods.prototype.raw=function(flag) {var EWA=getEWA(this);  EWA.wrappedElements=(flag===undefined) ? false : !Boolean(flag);  return EWA;};
// ¡note wrap() and raw() do not modify the existing Array members, only the results of the next method in the chain!

UniDOM.ElementWrapperArray.dfltMethods.prototype.add=function()  {
	for (var i=0, EWA=getEWA(this);  i<arguments.length;  i++)  {
		EWA.push( EWA.wrappedElements ?
			((arguments[i] instanceof UniDOM.ElementWrapper) ? arguments[i] : UniDOM(arguments[i]))
		: ((arguments[i] instanceof UniDOM.ElementWrapper) ? arguments[i].element : arguments[i]) );  }  };

UniDOM.ElementWrapperArray.dfltMethods.prototype.filter=function(cb, o)  {
	for (var i=0, EWA=getEWA(this), filtered=new UniDOM.ElementWrapperArray(EWA.wrappedElements, EWA.appliedDirect);  i<EWA.length;  i++)  {
		if (o)  {if (cb.call(o, xElement(EWA[i]), i, EWA))  filtered._.add(EWA[i]);}
		else if (cb(xElement(EWA[i]), i, EWA))  filtered._.add(EWA[i]);  }
	return filtered;  };


//↓private----===========*********===========----
	function getConglomerate(xData, deep, objFltr, applyDirect, powerSelect)  {
		var EWA=getEWA(this);
		if (applyDirect === undefined)  applyDirect=EWA.appliedDirect;
		var r=new UniDOM.ElementWrapperArray(EWA.wrappedElements, applyDirect);
		block=true;
		try { for (var i=0, t;  i<EWA.length;  i++)  {
			t=cb.apply(xElement(EWA[i]), arguments);
			r=r.concat(EWA.wrappedElements ? UniDOM(t, false, true) : t);  }  }
		catch(e)  {block=false;  throw e;}
		block=false;
		if (objFltr || powerSelect)  objectify(r, objFltr, applyDirect, powerSelect);
		return r;  }
	function applyToAll() {
		for (var i=0, r=new Array, EWA=getEWA(this);  i<EWA.length;  i++)  {r[i]=cb.apply(xElement(EWA[i]), arguments);}
		return r;  }
	function invokeAll()  {
		for (var args, i=0, r=new Array, EWA=getEWA(this);  i<EWA.length;  i++)  {
			args=Array.prototype.slice.call(arguments, 0);  args.unshift(xElement(EWA[i]));
			r=r.concat(cb.apply(UniDOM, args));  }
		return r;  }
	function asArray(a, asArray) {return asArray ? a : (a.length<1 ? null : ((asArray===false && a.length<2) ? a[0] : a));}

	function xElement(e) {return (!UniDOM.isWindow(e)  &&  (e instanceof UniDOM.ElementWrapper)) ? e.element : e;}
	function getEWA(o)  {
		if (o instanceof UniDOM.ElementWrapperArray.dfltMethods)  o=o.EWA;
		if (o instanceof Array)
			return o;
		throw new Error('UniDOM.ElementWrapperArray default Methods need an Array Object to work with.  Method apply attempted to Unknown '+(typeof o)+': '+o+'.');  }
//↑private----===========*********===========----

	function getSelectedOptions(forceReturnArray)  {
		if (this.type==='select-one')  { var s= (this.selectedIndex>=0) ? this.options[this.selectedIndex] : null;
			return  forceReturnArray ? [s] : s;  }
		for (var i=0, selected=new Array;  i<this.options.length;  i++)  {
			if (this.options[i].selected)  selected.push(this[i]);  }
		return asArray(selected, forceReturnArray);  }
	function setSelected(value)  { var i, j;
		if (!(value instanceof Array))  value=[value];
		for (i=0; i<this.length; i++)  { for (j=0; j<value.length; j++)  {
			if (this.nodeName==='SELECT')  {
				if (options[i].hasAttribute('value'))
					this.options[i].selected= (this.options[i].value==value[j]);
				else this.options[i].selected= (this.options[i].text==value[j]);  }
			else  this[i].checked= (this[i].value==value[j]);  }  }  }
	function getSelectedInputs(forceReturnArray)  {
		for (var i=0, selected=new Array;  i<this.length;  i++)  {
			if (this[i].checked)  {
				if (this[i].type==='radio')  return  forceReturnArray ? [this[i]] : this[i];
				if (this[i].type==='checkbox')  selected.push(this[i]);  }  }
		return asArray(selected, forceReturnArray);  }

	function objectify(a, filter, applyDirect, powerSelect)  {
		if (block)  return;   //block is controlled exclusively by getConglomerate above
		if (typeof filter !== 'function')  filter=function() {};
		for (var n, e, i=0;  i<a.length;  i++)  {
			e=xElement(a[i]);
			if (e.nodeName==='SELECT' && (powerSelect || (UniDOM.powerSelect && powerSelect!==false)))  {e.getSelected=getSelectedOptions;  e.setSelected=setSelected;}
			if (!(n=filter(e)))  continue;  //get a property name corresponding to this array member
			if (a[n]  &&  !(a[n] instanceof Array))  a[n]=new UniDOM.ElementWrapperArray(Boolean(a.wrappedElements), applyDirect, a[n]);
			if (a[n] instanceof Array)  a[n].push(e);  else  a[n]=e;  }  };

	//applyToElement replaces the prototyped “apply” method for certain (non-OO) UniDOM >functions< (see event-related)
	//to allow passing arguments as an array through the ElementWrapper prototype methods (which don’t take an Element argument)
	//The true Function.apply method is scuttled to the _apply_ alias.
	function applyToElement(element, args)  { var aa=Array.prototype.slice.call(args, 0);  aa.unshift(element);
		return this._apply_(UniDOM, aa);  } //the functions never actually reference the UniDOM Object through “this”, but may do so in the future; to pass arguments as an array, we must never-the-less have an Object to apply to…
	function invoke(Obj, method /* , firstArg «, secondArg «, thirdArg, … … … »» , moreArgumentsArray */ )  {    //currently unused by UniDOM
		var aa=Array.prototype.slice.call(arguments[arguments.length-1], 0);
		aa.unshift(Array.prototype.slice.call(arguments, 2, -1));
		return method.apply(Obj, aa);  };


//some nice static convenience functions:
UniDOM.getSelectedOptions=function(select, forceReturnArray) {return getSelectedOptions.call(select, forceReturnArray);};
UniDOM.setSelectedOptions=function(select, value) {setSelected.call(select, value);};
UniDOM.addPowerSelect=function(select) {select.getSelected=getSelectedOptions;  select.setSelected=setSelected;  return select;};

SoftMoon.WebWare.objectifyArray=objectify;
SoftMoon.WebWare.invoker=invoke;
SoftMoon.WebWare.objHas=function(obj, conditions, filter) {return has.call(obj, conditions, filter);};

Object.has=has;   //  myObject={};  myObject.has=Object.has;  flag=myObject.has(conditions, filter);
//Object.prototype.has=has;  // a very poor idea but………


UniDOM.globalize=function(myWindow)  { //hog the space
	if (myWindow===undefined)  myWindow=window;
	console.log('UniDOM Functions and constructors that are now global: ====================');
	for (var p in UniDOM)  {
		switch (p)  {
		case 'CSSEngine':
		case 'globalize':
		case 'prototypify':  continue;
		default:  myWindow[p]=UniDOM[p];
							console.log('UniDOM.'+p+'  ='+(typeof UniDOM[p]));  }  }  }


UniDOM.prototypify=function()  { //invade the DOM

	if (CSSEngine)
	Element.prototype.$=function(CSSString, objFltr, applyDirect, powerSelect)  {
		var EWA=new UniDOM.ElementWrapperArray(CSSEngine.call(this, CSSString), false, applyDirect);
		if (EWA.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(EWA, objFltr, applyDirect, powerSelect);
		return EWA;  }

	Element.prototype.getAncestor=getAncestor;
	Element.prototype.getElements=getElements;
	Element.prototype.getElders=getElders;
	Element.prototype.getJuniors=getJuniors;

	// While UniDOM’s method will accept the same arguments as the DOM standard getElementsByClassName(),
	// the latter returns a live node-list that changes as the DOM is updated,
	// and we need to retain that functionality for cross-library compatibility.
	Element.prototype.getElementsByClass=getElementsByClass;
	Element.prototype.getAncestorByClass=getAncestorByClass;
	Element.prototype.getElementsByName=getElementsByName;
	Element.prototype.getElementsByComplex=getElementsByComplex;
	Element.prototype.getAncestorByComplex=getAncestorByComplex;
	Element.prototype.hasAncestor=hasAncestor;
	Element.prototype.hasElement=hasElement;
	Element.prototype.hasClass=hasClass;
	Element.prototype.has=has;
	Element.prototype.addClass=addClass;
	Element.prototype.swapOutClass=swapOutClass;
	Element.prototype.removeClass=removeClass;
	Element.prototype.useClass=useClass;
	Element.prototype.disable=disable;

	Element.prototype.addEventHandler=function() {UniDOM.addEventHandler.apply(this, arguments);};
	Element.prototype.removeEventHandler=function() {UniDOM.removeEventHandler.apply(this, arguments);};
	Element.prototype.removeAllEventHandlers=function(goDeep) {UniDOM.removeAllEventHandlers(this, goDeep);};
	Element.prototype.getEventHandler=function() {UniDOM.getEventHandler.apply(this, arguments);};
	Element.prototype.generateEvent=function() {UniDOM.generateEvent.apply(this, arguments);};


	Element.prototype.getOffset=function(scroll)  {return UniDOM.getElementOffset(this, scroll);};
	Element.prototype.getMouseOffset=function(event)  {return UniDOM.getMouseOffset(this, event);};  }


window.UniDOM=UniDOM;


})();  // close UniDOM private-space wrapper

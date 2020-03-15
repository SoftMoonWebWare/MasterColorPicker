/*  UniDOM-2020  version 1.2.0  March 15, 2020
 *  copyright © 2013, 2014, 2015, 2018, 2019, 2020 Joe Golembieski, SoftMoon-WebWare
 *   except where otherwise noted
 *
 *  http://softmoon-webware.com/UniDOM_instructions.htm

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

//  character-encoding: UTF-8 DOS   tab-spacing: 2   word-wrap: no   standard-line-length: 160   max-line-length: 2400



;(function()  { //wrap UniDOM’s private space (to end of file)

														 // ↓ optional
var UniDOM=function(element, passData)  {  /* ALTERNATE ARGUMENTS:
									 (ElementWrapper)           // ← passData is irrelevant for elements and ElementWrappers
									 (CSSQueryString)           // ← passData must be ==false (undefined)
									 (element‖ElementWrapper, CSSQueryString, passData)   // ← currently passData is irrelevant unless the CSS-Engine fails to return an array
									 (Array→[…may contain any number of legal arguments to this UniDOM function including nested Arrays…], passData)
									 (element‖ElementWrapper‖Array‖userData, passData=true)
*/
	if (!element)  return null;
	element=xElement(element);
	if (isElementNode(element))  {
		if (CSSEngine  &&  typeof arguments[1] === 'string')  return UniDOM(UniDOM.$(arguments[1], element), arguments[2]);
		else  return new ElementWrapper(element);  }
	else
	if (typeof arguments[0] === 'object'  &&  "length" in arguments[0])  {  //(arguments[0] instanceof Array) would not work with DOM_Node_Lists
		var i,
				wrapped=(arguments[0] instanceof ElementArray) ? (arguments[0].wrappedElements=true, arguments[0]) : new ElementArray(true);
		for (i in arguments[0])  {wrapped[i]=UniDOM(arguments[0][i], passData);}
		return  wrapped;  }
	else
	if (passData)  return arguments[0];
	else
	if (CSSEngine  &&  typeof arguments[0] === 'string')  return UniDOM(UniDOM.$(arguments[0], document));
	else  throw new Error("“UniDOM” accepts only:\n •a single DOM Element or UniDOM.ElementWrapper,"+(CSSEngine ? "":" or")+"\n •an Array of DOM Elements or UniDOM.ElementWrappers"+(CSSEngine ? ", or\n •a CSS-definer String":"")+".\n  Type of “"+(typeof arguments[0])+"” passed in.");
	};


	var CSSEngine;  //private

	function $query(CSSString, element, objFltr, powerSelect)  {
		var EA=(new ElementArray).concat(CSSEngine.call(xElement(element), CSSString));
		if (EA.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(EA, objFltr, powerSelect);
		return EA;  }


//  ☆☆☆ ¡¡¡DO NOT CONFUSE Sizzle with jQuery!!! ☆☆☆
//  ☆☆☆                                         ☆☆☆
//  ☆☆☆ ¡ if you call  UniDOM.globalize()       ☆☆☆
//  ☆☆☆ UniDOM’s $ will overwrite window.$ !    ☆☆☆
UniDOM.$=function() {
	if (typeof UniDOM.CSSEngine == 'function')  CSSEngine=UniDOM.CSSEngine;
	else
	if (typeof window.Sizzle == 'function')  CSSEngine=function(s) {return Sizzle(s, this)};  // http://sizzlejs.com/   https://github.com/jquery/sizzle/wiki
	else
	if (typeof window.Slick == 'function')   CSSEngine=function(s) {return Slick(s, this)};   // http://mootools.net/docs/core/Slick/Slick  now defunct…
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



 /* ======The first half=========
	*
	*/
	//private
	function arrayify(v)  {return  (v instanceof Array) ? v : [v];}
	function getEventType(eT)  {eT=eT.toLowerCase().match( /^(?:on)?(.+)$/ );  return eT[1];}

	var aSlice=Array.prototype.slice,
			handlerCounter=0, eventCounter=0;

UniDOM.addEventHandler=addEventHandler;
function addEventHandler(element, eventType, handler, useCapture)  {
	element=xElement(element);
	if (element instanceof Array)  {
		for (var k=0, allAdded=new Array;  k<element.length;  k++)  {
			allAdded.push(addEventHandler(element[k], eventType, handler, useCapture));  }
		return allAdded;  }
	eventType=arrayify(eventType);  handler=arrayify(handler);  useCapture=Boolean(useCapture);
	var i, eType,
			userArgs=aSlice.call(arguments, 4),
			wrapper=new Array,
			added=new Object;
	for (i=0; i<eventType.length; i++)  {
		etype=getEventType(eventType[i]);
		if (UniDOM.getEventHandler(element, etype, handler, useCapture) !== false)  {
			if (UniDOM.addEventHandler.errorOnDoubleBind)
				throw new Error('UniDOM will not double-bind event handlers.\n •Element: '+element.nodeName+'\n  id: '+element.id+'\n  className: '+element.className+'\n  name: '+element.name+'\n •event type: '+etype+"\n •"+handler.toString().substr(0, 240));
			else  continue;  }

		if (document.addEventListener)  {
			wrapper[i]=function UniDOMEventHandlerWrapper(event)  {
				if (handler.suspend)  return;
				var j, off,  pass=userArgs.slice(0);  pass.unshift(event);
				if (event.type.match( /click|mouse/ )  &&  event.offsetX===undefined)  setMouseEventOffsets(event);
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
addEventHandler.errorOnDoubleBind=true;  // false quietly ignores double-binds
addEventHandler.apply=applyToElement; // (element, Array→[eventType, handler, useCapture])
addEventHandler._apply_=Function.prototype.apply;

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
UniDOM.EventHandler=EventHandler;
function EventHandler(element, eventType, handler, useCapture, wrapper, userArgs)  {
	if (!new.target)  throw new Error('UniDOM.EventHandler is a constructor, not a function');  // redundant because ↓
	if (!addingHandler)  throw new Error('“UniDOM.EventHandler” Objects may only be created using UniDOM’s “addEventHandler”.');
	addingHandler=false;
	var id='h'+(handlerCounter++);
	getAllEventsInWindow((element.ownerDocument  ||  element.document  ||  element).defaultView, true); // ← (ElementNode || window || document)
	allEvents[id]=this;
	this.id=id;
	this.element=element;
	this.eventType=eventType;
	this.handler=handler;  // this is an Array and it may be modified
	this.useCapture=useCapture;  //  ♪ ♫ ♪ I’m a capturah; soul adventurah… … … ♫ ♪ ♫
	this.wrapper=wrapper;
	this.userArgs=userArgs;  // this is an Array and it may be modified
	Object.freeze(this);  }

EventHandler.prototype.remove=function()  {
	if (!UniDOM.isElementNode(this.element)  &&  !UniDOM.isWindow(this.element))
		throw new Error("Can not remove “UniDOM.EventHandler”: its “element reference” has been corrupted.");
	var w=(this.element.ownerDocument  ||  this.element.document  ||  this.element).defaultView;  // ← (ElementNode || window || document)
	getAllEventsInWindow(w, false);
	if (allEvents[this.id] !== this)  throw new Error("Can not remove “UniDOM.EventHandler”: its “id” has been corrupted.");
	this.element.removeEventListener(this.eventType, this.wrapper, this.useCapture);
	delete allEvents[this.id];
	this.id=false;
	cleanWindow(w);  }



UniDOM.getEventHandler=getEventHandler;
function getEventHandler(element, eventType, handler, useCapture)  {
	element=xElement(element);
	eventType=getEventType(eventType);
	handler=arrayify(handler);
	var EH, id, j;
	getAllEventsInWindow((element.ownerDocument  ||  element.document  ||  element).defaultView, false);
	if (allEvents)  for (id in allEvents)  {
		EH=allEvents[id];
		if (element===EH.element  &&  eventType===EH.eventType  &&  useCapture==EH.useCapture
		&&  handler.length===EH.handler.length)  {
			for (j=0; j<handler.length; j++)  {if (handler[j]!==EH.handler[j])  return false;}
			return EH;  }  }
	return false;  }
getEventHandler.apply=applyToElement; // (element, Array→[eventType, handler, useCapture])
getEventHandler._apply_=Function.prototype.apply;


	//private
	function getAllEventsInWindow(w, makeNew)  {
		for (var i in eventedWindows)  {if (w===eventedWindows[i].window)  return allEvents=eventedWindows[i].allEvents;}
		if (!makeNew)  return allEvents=false;
		var ref={window:w, allEvents:new Object};
		eventedWindows.push(ref);
		w.addEventListener('unload', UniDOM.removeAllEventHandlers, false);
		return allEvents=ref.allEvents;  }


UniDOM.removeEventHandler=removeEventHandler;
function removeEventHandler(element, eventType, handler, useCapture)  {
															//  (my_EventHandler)                             //←preferred:  my_EventHandler.remove();
	var EH;
	if (arguments[0] instanceof UniDOM.EventHandler)
		EH=arguments[0];
	else  {
		EH=UniDOM.getEventHandler(element, eventType, handler, useCapture);
		if (EH===false)
			throw new Error("Can not remove unknown event: \nElement: "+element+" id: "+element.id+"\neventType: "+eventType+" useCapture: "+useCapture+"\n"+handler);  }
	EH.remove();  }
removeEventHandler.apply=applyToElement;  // (element, Array→[eventType, handler, useCapture])
removeEventHandler._apply_=Function.prototype.apply;


	//private
	function cleanWindow(w)  {
		if (eventedWindows.length===0)  return;
		for (var i in eventedWindows)  {if (w===eventedWindows[i].window)  break;}
		for (var id in eventedWindows[i].allEvents)  {return false;}    //if there are any EventHandlers still registered in this window, we can’t yet clean it.
		eventedWindows.splice(i, 1);
		w.removeEventListener('unload', UniDOM.removeAllEventHandlers, false);  }


// registered to a window or element, or is a property of an element, so “this” is the window or element…
UniDOM.removeAllEventHandlers=removeAllEventHandlers;
function removeAllEventHandlers(element, goDeep)  {
	function remover(element)  {for (var id in allEvents)  {if (allEvents[id].element===element)  allEvents[id].remove();}}
	if (UniDOM.isWindow(this))  element=this;

	else  element=xElement(element||this);

	if (!UniDOM.isElementNode(element)  &&  !UniDOM.isWindow(element))  {
		throw new Error('UniDOM.removeAllEventHandlers is a method of a DOM Element or window, or must be supplied an element or window as an argument.');  }
	getAllEventsInWindow((element.ownerDocument  ||  element.document  ||  element).defaultView, false);
	if (UniDOM.isElementNode(element))  { // DOM element passed in
		remover(element);
		if (goDeep)  UniDOM.getElements(element, remover, goDeep);  }
	else   // a window passed in
		for (var id in allEvents)  {allEvents[id].remove();}  }
removeAllEventHandlers.apply=applyToElement;  // (element, Array→[eventType, handler, useCapture])
removeAllEventHandlers._apply_=Function.prototype.apply;



//For MSIE9 both event paradigms may be triggered if UniDOM.addEventHandler.retroMSIE9=null
//  only old-MSIE ‖or‖ Standards may be triggered if UniDOM.addEventHandler.retroMSIE9=Boolean(true‖false)
UniDOM.generateEvent=generateEvent;
function generateEvent(element, eventType, eSpecs)  {  var i, j, p, d, eT, event;
	element=xElement(element);
	if (typeof eSpecs !== 'object')  eSpecs={bubbles: false};  //new Object;
	eventType=arrayify(eventType);
	for (i=0; i<eventType.length; i++)  {
		eT=getEventType(eventType[i]);
		var subT=eT.match( /wheel|mouse|click|key|focus|dom|resize|scroll|./ );
		switch (eSpecs && eSpecs.view && subT[0])  {
			case 'wheel':
				if (typeof WheelEvent === 'function')  {event=new WheelEvent(eT, eSpecs);  break;}
			case 'mouse':
			case 'click':
				if (typeof MouseEvent === 'function')  event=new MouseEvent(eT, eSpecs); //allow newer properties when possible
				else  { event=document.createEvent('MouseEvent');
					event.initMouseEvent(eT, eSpecs.bubbles, eSpecs.cancelable,
						eSpecs.view, eSpecs.detail,
						eSpecs.screenX, eSpecs.screenY, eSpecs.clientX, eSpecs.clientY,
						eSpecs.ctrlKey, eSpecs.altKey, eSpecs.shiftKey, eSpecs.metaKey,
						eSpecs.button, eSpecs.relatedTarget);  }   //Note IE9 (at least) *requires* all arguments be passed. undefined values convert by default except:  eT, view, relatedTarget  are required valid
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
					event.initUIEvent(eT, eSpecs.bubbles, eSpecs.cancelable,
						eSpecs.view, eSpecs.detail);  } //it is unclear what “detail” has to do with the keyboard, or how to set a key value except maybe through the eSpecs.userArgs
			break;
			default:  //Mouse & UI Events without user-defined eSpecs “should” auto-generate appropriate real-time values
				if (eSpecs  &&  eSpecs.detail!==undefined  &&  typeof CustomEvent === 'function')  event=new CustomEvent(eT, eSpecs);
				else
				if (typeof Event === 'function')  event=new Event(eT, eSpecs);
				else  { event=document.createEvent('Event');
					event.initEvent(eT, eSpecs.bubbles, eSpecs.cancelable);  }  }
		//for (p in eSpecs)  {if (event[p] === undefined  &&  !event.hasOwnProperty(p))  event[p]=eSpecs[p];}
		if (eSpecs.userArgs)  for (p in eSpecs.userArgs)  {event[p]=eSpecs.userArgs[p];}
		element.dispatchEvent(event);  }  }
generateEvent.apply=applyToElement;  // (element, Array→[eventType, eSpecs])
generateEvent._apply_=Function.prototype.apply;


UniDOM.triggerEvent=function triggerEvent(element, event)  {
	element=xElement(element);
	element.dispatchEvent(event);  };





UniDOM.setMouseEventOffsets=setMouseEventOffsets;
function setMouseEventOffsets(event)  {  //returns the event object, modified to reflect the offset-values.
		var offset=UniDOM.getElementOffset(event.target, true);
		event.offsetX=event.clientX-offset.x;
		event.offsetY=event.clientY-offset.y;
		event.fixedOffset=offset.fixed;
		try { var offset=UniDOM.getElementOffset(event.currentTarget, true);
			event.currentX=event.clientX-offset.x;
			event.currentY=event.clientY-offset.y;  }
		catch(e) {}
		return event;  }


UniDOM.getMouseOffset=getMouseOffset;
function getMouseOffset(element, event)  {  //returns an offset-values object; event object is not modified.
		element=xElement(element);
		var offset=UniDOM.getElementOffset(element, true);
		offset.x=event.clientX-offset.x;
		offset.y=event.clientY-offset.y;
		return offset;  }


//  Returns the element offset from the window’s top-left corner if scroll=true;
//  or if  scroll=false  from the document’s top-left corner.
//  If the element is − or is nested within − a fixed-position element, it will be noted in the return object…
UniDOM.getElementOffset=getElementOffset;
function getElementOffset(element, scroll)  {
										//  (element, ancestor)  ← alternate, find the offset from the ancestor
	var x=0, y=0, scrl=false, fixed=false, ancestor=null;
	element=xElement(element);
	if (typeof scroll === 'boolean')  scrl=scroll;
	else if (isElementNode(arguments[1]))  ancestor=arguments[1];
//	console.log('---');
	while (!fixed  &&  (s=getComputedStyle(element, null))
			&&  element!==ancestor  &&  element.offsetParent)  {
		if (s.position==='fixed')  {scrl=false;  fixed=true;}
//								console.log("<"+element.nodeName+" id="+element.id+">  postion: "+s.position+";  offsetLeft: "+element.offsetLeft+";  offsetTop: "+element.offsetTop);
		x+= element.offsetLeft - (scrl? element.offsetParent.scrollLeft : 0);
		y+= element.offsetTop - (scrl? element.offsetParent.scrollTop : 0);
		element=element.offsetParent;  }
	if (scrl)  {x-=UniDOM.getScrollX();  y-=UniDOM.getScrollY();}  //console.log('pageYOffset: '+window.pageYOffset);
//	console.log('---');
	return {x:x, y:y, fixed:fixed};  }


UniDOM.isElementNode=isElementNode;
function isElementNode(e)  {return  typeof e == 'object'  &&  (e instanceof Element  ||  (e instanceof Node  &&  e.nodeType===Node.ELEMENT_NODE));};

UniDOM.isElement=isElement;
function isElement(e, i) {return isElementNode(e)  &&   e===e.parentNode.children[i];}

UniDOM.isNode=isNode;
function isNode(n, i) {return (n instanceof Node)  &&  n===n.parentNode.childNodes[i];}

UniDOM.isFirst=isFirst;
function isFirst(e) {return e===e.parentNode.firstElementChild;}

UniDOM.isFirstNode=isFirstNode;
function isFirstNode(e) {return e===e.parentNode.firstChild;}

UniDOM.isLast=isLast;
function isLast(e) {return e===e.parentNode.lastElementChild;}

UniDOM.isLastNode=isLastNode;
function isLastNode(e) {return e===e.parentNode.lastChild;}



UniDOM.isWindow=(Window  &&  (window instanceof Window)) ?
	function(e)  {return  e instanceof Window;}
: function(e)  {return  typeof e == 'object'  &&  ((e=e.toString()) && e.match( /wIndOw/i ));};


window.addEventListener('load', function()  {  // support UniDOM’s legacy for crusty old fossil crutches

//position of the browser window on the desktop:
if (window.screenLeft)  {
	UniDOM.getScreenX=function(w)  {return  (w  ||  window).screenLeft;};
	UniDOM.getScreenY=function(w)  {return  (w  ||  window).screenTop;};  }
else
if (window.screenX)  {
	UniDOM.getScreenX=function(w)  {return  (w  ||  window).screenX;};
	UniDOM.getScreenY=function(w)  {return  (w  ||  window).screenY;};  }


if (window.innerWidth)  { // console.log('using standard:  window.innerWidth');
	UniDOM.getInnerWidth=function(w)  {return  (w  ||  window).innerWidth;};
	UniDOM.getInnerHeight=function(w)  {return  (w  ||  window).innerHeight;};
	UniDOM.getScrollX=function(w)  {return  (w  ||  window).pageXOffset;};
	UniDOM.getScrollY=function(w)  {return  (w  ||  window).pageYOffset;};  }

if (document.documentElement  && document.documentElement.scrollWidth)  { //  console.log('using legacy MSIE with a DOCTYPE:  document.documentElement.scrollWidth');
	UniDOM.getDocumentWidth=function(w)  {return  (w  ||  window).document.documentElement.scrollWidth;};
	UniDOM.getDocumentHeight=function(w)  {return  (w  ||  window).document.documentElement.scrollHeight;};  }
});



/* ========The second half======
 *
 *
 */


// If no match is found, false is returned.
// If goDeep evaluates to false on the first match found, that single element will be returned.
// If goDeep evaluates to true on the first match found, an “ElementArray” (a simple Array with added “UniDOM power methods”)
//  is returned (the result may only be one member, or multiple members of elements)
function getAncestor(cb, goDeep, objFltr, powerSelect)  {
	if (typeof cb !== 'function')  throw new Error('“UniDOM.getAncestor” requires a callback function; type of “'+(typeof cb)+'” passed in.');
	if (typeof goDeep === 'undefined')  goDeep=function() {return false};
	else if (typeof goDeep !== 'function')  {var deep=Boolean(goDeep);  goDeep=function() {return deep;};}
	var parent=this.parentNode,
			found=false;
	do {
		if (cb(parent, this, found))  {
			if (!found  &&  !goDeep(parent, this, found))  return parent;
			if (!found)  found=new ElementArray;
			found.push(parent);  }  }
	while ((!found || goDeep(parent, this, found))  &&  (parent=parent.parentNode));
	if (found && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(found, objFltr, powerSelect);
	return found;  }


// for  getAncestor,  getElements,  getElders,  and  getJuniors:
// cb → callBack function should decide whether each element passed to it is the/an
//  ancestor/descendant/elder/junior of choice and return a Boolean value indicating such choice.
// cb.allNodes → Boolean: true crawls all DOM Nodes, false (default) crawls only Element Nodes (¡not for getAncestor!);
//  this value may be changed while crawling by cb or goDeep.
// goDeep → may be •Boolean (default is false for Ancestors, true for the rest) or
//  a •function that evaluates each individual element passed to it and returns a Boolean value.
// goDeep.doContinue → Boolean may be changed to false by goDeep or cb while crawling to end query immediately (¡not for getAncestor!)
// objFltr → may be a filter-function returning Object-property names.  See the  objectify()  function down below.
// powerSelect → Boolean: ¿apply nonstandard methods (getSelected() & setSelected()) to <select> elements?


// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
//  a.k.a. getDescendents()  …“getElements” reflects the standard DOM method names, but this can gather Nodes of other types also.
	function getElements(cb, goDeep, objFltr, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getElements” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=function() {return true;};
		else if (typeof goDeep !== 'function')  {var deep=Boolean(goDeep);  goDeep=function() {return deep;};}
		goDeep.doContinue=true;
		var found=getKids(this[cb.allNodes ? 'childNodes' : 'children'], cb, goDeep, this);
		if (found.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(found, objFltr, powerSelect);
		return found;  }

	//private
	function getKids(kids, cb, goDeep, contextElement)  {
		var found=new ElementArray,
				grandkids, i, kl;
		for (i=0, kl=kids.length;  goDeep.doContinue && i<kl;  i++)  {
			if (cb(kids[i], contextElement, found))  found.push(kids[i]);
			if (kids[i].hasChildNodes()  &&  goDeep(kids[i], contextElement, found)  &&  (cb.allNodes  ||  kids[i].firstElementChild)
			&&  (grandkids=getKids(kids[i][cb.allNodes ? 'childNodes' : 'children'], cb, goDeep, contextElement)).length)
				found=found.concat(grandkids);  }
		return found;  }



// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
	function getElders(cb, goDeep, objFltr, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getElders” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=function() {return true};
		else if (typeof goDeep !== 'function')  {var deep=Boolean(goDeep);  goDeep=function() {return deep;};}
		goDeep.doContinue=true;
		var elder=this,
				found=new ElementArray;
		do {  while (goDeep.doContinue  &&  elder[cb.allNodes ? 'previousSibling' : 'previousElementSibling'])  {
			elder=elder[cb.allNodes ? 'previousSibling' : 'previousElementSibling'];
			while (elder.hasChildNodes()  &&  goDeep(elder, this, found)  &&  (cb.allNodes  ||  elder.lastElementChild))  {
				elder=elder[cb.allNodes ? 'lastChild' : 'lastElementChild'];  }
			if (cb(elder, this, found))  found.push(elder);  }  }
		while (goDeep.doContinue  &&  (elder=elder.parentNode)  &&  (cb(elder, this, found) ? found.push(elder) : true));
		if (found.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(found, objFltr, powerSelect);
		return found;  }


// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
	function getJuniors(cb, goDeep, objFltr, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getJuniors” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=function() {return true};
		else if (typeof goDeep !== 'function')  {var deep=Boolean(goDeep);  goDeep=function() {return deep;};}
		goDeep.doContinue=true;
		var junior=this, cousins,
				found=new ElementArray;
		do {  while (goDeep.doContinue  &&  junior[cb.allNodes ? 'nextSibling' : 'nextElementSibling'])  {
			junior=junior[cb.allNodes ? 'nextSibling' : 'nextElementSibling'];
			if (cb(junior, this, found))  found.push(junior);
			if (junior.hasChildNodes()  &&  goDeep(junior, this, found)  &&  (cb.allNodes  ||  junior.firstElementChild)
			&&  (cousins=getKids(junior[cb.allNodes ? 'childNodes' : 'children'], cb, goDeep, this)).length)
				found=found.concat(cousins);  }  }
		while (goDeep.doContinue  &&  (junior=junior.parentNode)  &&  goDeep(junior, this, found));
		if (found.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(found, objFltr, powerSelect);
		return found;  }


// returns (e) if the element (e) is an ancestor/descendant of this-Element.
// else returns false.
	function hasAncestor(e)  {return getAncestor.call(this, function(a) {return (a===e)})}
	function hasElement(e)  {ta=this;  return  (isElementNode(e)  &&  getAncestor.call(e, function(a) {return (a===ta)}))  ?  e : false;}


	function getElementsByName(n, deep, objFltr, powerSelect)  { var count;
		if (n===""  ||  typeof n === 'undefined'  ||  n===null)  n=new RegExp('^.+$');
		else
		if (typeof n !== 'object'  ||  !(n instanceof RegExp))  n=new RegExp('^'+n+'$');
		if (typeof deep === 'number')  { //should be >0 or no limit will be reached.
			count=deep;
			deep=function(){return true};  }
		else if (typeof deep === 'function'  &&  deep.count)  count=deep.count;
		if (typeof objFltr !== 'function')  objFltr=function(e) {return e.name;};
		var found=getElements.call(this,
			function(e)  { var flag=(typeof e.name === 'string'  &&  e.name.match(n));
				if (flag && count)  deep.doContinue=(--count);
				return flag;  },
			deep, objFltr, powerSelect);
		return found.length ? found : false;  };


	function getElementsByClass(c, deep, objFltr, powerSelect)  {
		if (typeof c === 'string')  {c=cleanClass(c);  c=c.split(" ");}
		if (typeof deep === 'number')  { //should be >0 or no limit will be reached.
			var count=deep;
			deep=function(){return true};  }
		else if (typeof deep === 'function'  &&  deep.count)  count=deep.count;
		return getElements.call(this,
			function(e)  { var flag=hasClass.call(e, c);
				if (flag && count)  deep.doContinue=(--count);
				return flag;  },
			deep, objFltr, powerSelect );  }
//  ↓↓
// … for strings passed in as members of an Array of classnames …
// see the SPECIAL NOTES for “hasClass” below
//  ↑↑
	function getAncestorByClass(c, deep, objFltr, powerSelect)  {
		if (typeof c === 'string')  {c=cleanClass(c);  c=c.split(" ");}
		return getAncestor.call(this,
			function(e) {return hasClass.call(e, c);},
			deep, objFltr, powerSelect );  }


	function getElementsByComplex(conditions, deep, objFltr, powerSelect)  {
		return getElements.call(this,
			function(e) {return has.call(e, conditions.data, conditions.filter);},
			deep, objFltr, powerSelect );  }

	function getAncestorByComplex(conditions, deep, objFltr, powerSelect)  {
		return getAncestor.call(this,
			function(e) {return has.call(e, conditions.data, conditions.filter);},
			deep, objFltr, powerSelect );  }


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
		if (typeof this.className !== 'string' || this.className==="")  return false;
		if (!(cna instanceof Array))  cna=[cna];
		if (logic) cna.logic=logic;  // see function “has” (above) for legal values for “logic”
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

	function toggleClass(c)  {  // c should be the string name of the class
		if (this.className.match(c))
					this.className=xClass(this.className, c);
		else  this.className=aClass(this.className, c);  }

	function swapOutClass(xc, ac, reverse)  {  // xc=remove class   ac=add class
		if (reverse)  {reverse=xc;  xc=ac;  ac=reverse;}
		var cn=xClass(this.className, xc);
		this.className=aClass(cn, ac);  }


	function disable(flag, className)  {
		if (className===undefined)  className='disabled';
		flag=Boolean(flag);
		var eventArgs={userArgs: {disable: flag}};
		this.disabled=flag;
		useClass.call(this, className, flag);
		try {generateEvent(this, 'onDisabledStateChange', eventArgs);}  catch(e) {console.warn(e);};
		for (var i=0, fields=getElements.call(this, isInterface, goDeeper);  i<fields.length;  i++)  {
			fields[i].disabled=flag;
			try {generateEvent(fields[i], 'onDisabledStateChange', eventArgs);}  catch(e) {};  }
		//private
		function isInterface(e)  { return  e.getAttribute('tabIndex')!==null  ||  e.getAttribute('contentEdible')!==null  ||
			e.nodeName==='INPUT' || e.nodeName==='SELECT' || e.nodeName==='TEXTAREA' || e.nodeName==='BUTTON';  }
		function goDeeper(e) {return !e.disabled  &&  !hasClass.call(e, className);};  }





//  practical versatility vs. performance speed:  should we force this format to accept *only* DOM Elements? ¿ xElement(element)  vs.  element ?
UniDOM.getAncestor=function(element)  {return getAncestor.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getElements=function(element)  {return getElements.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getElders=function(element)  {return getElders.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getJuniors=function(element)  {return getJuniors.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getElementsBy$Name=function(element)  {return getElementsByName.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getElementsBy$Class=function(element)  {return getElementsByClass.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getAncestorBy$Class=function(element)  {return getAncestorByClass.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getElementsByComplex=function(element)  {return getElementsByComplex.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getAncestorByComplex=function(element)  {return getAncestorByComplex.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.hasAncestor=function(element)  {return hasAncestor.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.hasElement=function(element)  {return hasElement.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.has=function(element)  {return has.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.has$Class=function(element)  {return hasClass.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.addClass=function(element)  {return addClass.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.remove$Class=function(element)  {return removeClass.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.useClass=function(element)  {return useClass.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.swapOut$Class=function(element)  {return swapOutClass.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.disable=function(element)  {return disable.apply(xElement(element), aSlice.call(arguments, 1));};
UniDOM.getSelected=function(element)  { element=xElement(element)
	return  element.nodeName==='SELECT' ?
			getSelectedOptions(element)
		: getElementsByName.apply(element, aSlice.call(arguments, 1)).getSelected();  };


//constructor
UniDOM.ElementWrapper=ElementWrapper;
function ElementWrapper(element)  {
	if (element instanceof ElementWrapper)  return element;
	this.element=element;  };

ElementWrapper.prototype.$=function(CSSString, objFltr, powerSelect)  {
	return UniDOM(UniDOM.$(CSSString, this.element, objFltr, powerSelect));  };

ElementWrapper.prototype.addEventHandler=function()  {return addEventHandler.apply(this.element, arguments);};
ElementWrapper.prototype.removeEventHandler=function()  {removeEventHandler.apply(this.element, arguments);  return this;};
ElementWrapper.prototype.removeAllEventHandlers=function(goDeep)  {removeAllEventHandlers(this.element, goDeep);  return this;};
ElementWrapper.prototype.generateEvent=function()  {generateEvent.apply(this.element, arguments);  return this;};
ElementWrapper.prototype.triggerEvent=function(event)  {UniDOM.triggerEvent(this.element, event);  return this;};

ElementWrapper.prototype.getOffset=function(scroll)  {return getElementOffset(this.element, scroll);}
ElementWrapper.prototype.getMouseOffset=function(event)  {return getMouseOffset(this.element, event);}

ElementWrapper.prototype.isElementNode=function()  {return isElementNode(this.element);}
ElementWrapper.prototype.isElement=function(i)  {return isElement(this.element, i);}
ElementWrapper.prototype.isNode=function(i)  {return isNode(this.element, i);}
ElementWrapper.prototype.isFirst=function()  {return isFirst(this.element);}
ElementWrapper.prototype.isFirstNode=function()  {return isFirstNode(this.element);}
ElementWrapper.prototype.isLast=function()  {return isLast(this.element);}
ElementWrapper.prototype.isLastNode=function()  {return isLastNode(this.element);}

ElementWrapper.prototype.getAncestor=function()  {return UniDOM(getAncestor.apply(this.element, arguments), true);};
ElementWrapper.prototype.getElements=function()  {return UniDOM(getElements.apply(this.element, arguments), true);};
ElementWrapper.prototype.getElders=function()  {return UniDOM(getElders.apply(this.element, arguments), true);};
ElementWrapper.prototype.getJuniors=function()  {return UniDOM(getJuniors.apply(this.element, arguments), true);};
ElementWrapper.prototype.getElementsBy$Name=function()  {return UniDOM(getElementsByName.apply(this.element, arguments), true);};
ElementWrapper.prototype.getElementsBy$Class=function()  {return UniDOM(getElementsByClass.apply(this.element, arguments), true);};
ElementWrapper.prototype.getAncestorBy$Class=function()  {return UniDOM(getAncestorByClass.apply(this.element, arguments), true);};
ElementWrapper.prototype.getElementsByComplex=function()  {return UniDOM(getElementsByComplex.apply(this.element, arguments), true);};
ElementWrapper.prototype.getAncestorByComplex=function()  {return UniDOM(getAncestorByComplex.apply(this.element, arguments), true);};
ElementWrapper.prototype.getElementsByTagName=function(tn)  {return UniDOM(this.element.getElementsByTagName(tn));};
ElementWrapper.prototype.hasAncestor=function()  {return UniDOM(hasAncestor.apply(this.element, arguments), true);};
ElementWrapper.prototype.hasElement=function()  {return UniDOM(hasElement.apply(this.element, arguments), true);};
ElementWrapper.prototype.has=function()  {return has.apply(this.element, arguments);};
ElementWrapper.prototype.has$Class=function()  {return hasClass.apply(this.element, arguments);};
ElementWrapper.prototype.addClass=function()  {addClass.apply(this.element, arguments);  return this;};
ElementWrapper.prototype.remove$Class=function()  {removeClass.apply(this.element, arguments);  return this;};
ElementWrapper.prototype.useClass=function()  {useClass.apply(this.element, arguments);  return this};
ElementWrapper.prototype.swapOut$Class=function()  {swapOutClass.apply(this.element, arguments);  return this};
ElementWrapper.prototype.disable=function()  {disable.apply(this.element, arguments);  return this;};

ElementWrapper.prototype.getSelected=function() {
	return  this.element.nodeName==='SELECT' ?
			getSelectedOptions.call(this.element)
		: getElementsByName.apply(this.element, aSlice.call(arguments, 1)).getSelected();  };
ElementWrapper.prototype.setSelected=function() {if (this.element.nodeName==='SELECT') return setSelected.apply(this.element, arguments);};



class ElementArray extends Array  {  //  ← a new Array will be created with the relevant “UniDOM power methods”.
/*
 *  When a standard Array method returns an array, when used in this class it will instead return an ElementArray.
 *  In the process, it will call this constructor and pass an integer value for the array length.
 *  Users of this class are therefore forced to pass in a Boolean value for wrapElements, or the default value will be used.
 */
	constructor(wrapElements)  { super();
		Object.defineProperty(this, 'wrappedElements', { writable: true,
			value: ((typeof wrapElements === 'boolean') ? wrapElements : ElementArray.wrappedElements) } );  }

	/*******  see the private variable  cb  (callBack) below this class  *******/

	getAncestor() {cb=getAncestor;  return getConglomerate.apply(this, arguments);}
	getElements() {cb=getElements;  return getConglomerate.apply(this, arguments);}
	getElders() {cb=getElders;  return getConglomerate.apply(this, arguments);}
	getJuniors() {cb=getJuniors;  return getConglomerate.apply(this, arguments);}
	getElementsBy$Name() {cb=getElementsByName;  return getConglomerate.apply(this, arguments);}
	getElementsBy$Class() {cb=getElementsByClass;  return getConglomerate.apply(this, arguments);}
	getAncestorBy$Class() {cb=getAncestorByClass;  return getConglomerate.apply(this, arguments);}
	getElementsByComplex() {cb=getElementsByComplex;  return getConglomerate.apply(this, arguments);}
	getAncestorByComplex() {cb=getAncestorByComplex;  return getConglomerate.apply(this, arguments);}
  getElementsByTagName()  {cb=Element.prototype.getElementsByTagName;  return getConglomerate.apply(this, arguments);}

	setAttributes(n,v) {this.forEach(function(e){if (isElementNode(e))  e.setAttribute(n,v);});  return this;}
	removeAttributes(n) {this.forEach(function(e){if (isElementNode(e))  e.removeAttribute(n);});  return this;}
	hasAttributes(n) {cb=Element.prototype.hasAttribute;  return applyToAll.apply(this. arguments)}
	getAttributes(n) {cb=Element.prototype.getAttribute;  return applyToAll.apply(this. arguments)}

	hasAncestor() {cb=hasAncestor;  return getConglomerate.apply(this, arguments);}
	hasElement() {cb=hasElement;  return getConglomerate.apply(this, arguments);}

	has() {cb=has;  return applyToAll.apply(this, arguments);}

	has$Class() {cb=hasClass;  return applyToAll.apply(this, arguments);}
	addClass() {cb=addClass;  return applyToAll.apply(this, arguments);}
	remove$Class() {cb=removeClass;  return applyToAll.apply(this, arguments);}
	useClass() {cb=useClass;  return applyToAll.apply(this, arguments);}
	swapOut$Class() {cb=swapOutClass;  return applyToAll.apply(this, arguments);}
	disable() {cb=disable; return applyToAll.apply(this, arguments);}

	addEventHandler() {cb=addEventHandler;  return applyToAll.apply(this, arguments);}
	removeEventHandler() {cb=removeEventHandler;  return applyToAll.apply(this, arguments);}
	generateEvent() {cb=generateEvent;  return applyToAll.apply(this, arguments);}
	triggerEvent() {cb=triggerEvent;  return applyToAll.apply(this, arguments);}

	isElementNode() {cb=isElementNode;  return invokeAll.apply(this);}

	getSelected() {return getSelectedInputs.apply(this, arguments);}
	setSelected() {return setSelected.apply(this, arguments);}
	getValues(includeEmpty, goDeep) { var r=new Array, deep;
		if (typeof goDeep !== 'function')  {deep=Boolean(goDeep);  goDeep=function(){return deep;}}
		function gatherValue(e)  { //note we never gather any elements, just extract their data
			if (includeEmpty || (('value' in e) && e.value!==undefined && e.value!==""))  r.push(e.value);
			if (e.children.length  &&  goDeep(e))  getElements.call(e, gatherValue, false);  }
		this.forEach(gatherValue);
		return r;  }

	objectify(filter, powerSelect) {objectify(this, filter, powerSelect);  return this;}

	wrap(flag, doso)  { this.wrappedElements=(flag===undefined) ? true : Boolean(flag);
		if (doso)  this.alignWrappedState();
		return this;  }
	raw(flag, doso)  {this.wrappedElements=(flag===undefined) ? false : !Boolean(flag);
		if (doso)  this.alignWrappedState();
		return this;  }
  alignWrappedState()  {
		if (this.wrappedElements)  UniDOM(this);
		else  for (i in this)  {if (this[i] instanceof ElementWrapper)  this[i]=this[i].element;}  }

	get()  {//  this will retrieve elements and guarantee the format specified by .warppedElements
		if (arguments.length===1)  return this.wrappedElements ? new ElementWrapper(this[arguments[0]]) : this[arguments[0]];
		for (var i=0, a=new ElementArray(this.wrappedElements);  i<arguments.length;  i++)  {
			a.push(this.wrappedElements ? new ElementWrapper(this[arguments[i]]) : this[arguments[i]]);  }
		return a;  }

	add()  { for (var i=0;  i<arguments.length;  i++)  {
			if (arguments[i] instanceof Array
			||  arguments[i] instanceof NodeList
			||  arguments[i] instanceof HTMLCollection )  this.add.apply(this, arguments[i]);
			else
			this.push( this.wrappedElements ?
				((arguments[i] instanceof ElementWrapper) ? arguments[i] : UniDOM(arguments[i]))
			: ((arguments[i] instanceof ElementWrapper) ? arguments[i].element : arguments[i]) );  }
		return this;  }

	filter(cb, o)  {
		for (var i=0, filtered=new ElementArray(this.wrappedElements);  i<this.length;  i++)  {
			if (o)  {if (cb.call(o, xElement(this[i]), i, this))  filtered.add(this[i]);}
			else if (cb(xElement(this[i]), i, this))  filtered.add(this[i]);  }
		return filtered;  }

}
// default value for constructor above (unused internally by UniDOM’s functions and methods)
ElementArray.wrappedElements=false;
UniDOM.ElementArray=ElementArray;


var cb,  //private
		block=false;

//↓private----===========*********===========----
	function getConglomerate(xData, deep, objFltr, powerSelect)  {
		var r=new ElementArray(this.wrappedElements);
		block=true;  //see objectify() below
		try  { for (var i=0, t;  i<this.length;  i++)  {
			t=cb.apply(xElement(this[i]), arguments);
			r=r.concat(this.wrappedElements ? UniDOM(t, true) : t);  }  }
		finally {block=false;}
		if (objFltr || powerSelect)  objectify(r, objFltr, powerSelect);
		return r;  }

	function applyToAll() {
		for (var i=0, r=new Array;  i<this.length;  i++)  {r[i]=cb.apply(xElement(this[i]), arguments);}
		return r;  }

	function invokeAll()  {
		for (var args, i=0, r=new Array;  i<this.length;  i++)  {
			args=aSlice.call(arguments, 0);  args.unshift(xElement(this[i]));
			r=r.concat(cb.apply(UniDOM, args));  }
		return r;  }

	function asArray(a, asArray) {return asArray ? a : (a.length<1 ? null : ((asArray===false && a.length<2) ? a[0] : a));}

	function xElement(e) {return (!UniDOM.isWindow(e)  &&  (e instanceof ElementWrapper)) ? e.element : e;}
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
			else  this[i].checked= (this[i].value==value[j]);  }  }
		return this;  }

	function getSelectedInputs(forceReturnArray)  {
		for (var i=0, selected=new ElementArray;  i<this.length;  i++)  {
			if (this[i].checked)  {
				if (this[i].type==='radio')  return  forceReturnArray ? (selected.push(this[i]), selected) : this[i];
				if (this[i].type==='checkbox')  selected.push(this[i]);  }  }
		return asArray(selected, forceReturnArray);  }

	function objectify(a, filter, powerSelect)  {
		if (block)  return;   //block is controlled exclusively by getConglomerate above
		if (typeof filter !== 'function')  filter=function() {};
		for (var n, e, i=0;  i<a.length;  i++)  {
			e=xElement(a[i]);
			if (e.nodeName==='SELECT' && (powerSelect || (UniDOM.powerSelect && powerSelect!==false)))  {
				e.getSelected=getSelectedOptions;  e.setSelected=setSelected;  }
			if (!(n=filter(e)))  continue;  //get a property name corresponding to this array member
			if (a[n] instanceof ElementArray)  a[n].add(e);
			else if (a[n])  a[n]=(new ElementArray(a.wrappedElements)).add(a[n], e);  //note that if a[n] was defined before this function was called, and it was an Array-like Object, it will be flattened (recursively) into this new ElementArray
			else  a[n]=e;  }
		return a;  };

var xTimes=0

	//applyToElement replaces the prototyped “apply” method for certain (non-OO) UniDOM >functions< (see event-related)
	//to allow passing arguments as an array through the ElementWrapper prototype methods (which don’t take an Element argument)
	//The true Function.apply method is scuttled to the _apply_ alias.
	function applyToElement(element, args)  { var aa=aSlice.call(args, 0);  aa.unshift(element);
		return this._apply_(UniDOM, aa);  } //the functions never actually reference the UniDOM Object through “this”, but may do so in the future; to pass arguments as an array, we must never-the-less have an Object to apply to…
	function invoke(Obj, method /* , firstArg «, secondArg «, thirdArg, … … … »» , moreArgumentsArray */ )  {    //currently unused by UniDOM
		var aa=aSlice.call(arguments[arguments.length-1], 0);
		aa.unshift(aSlice.call(arguments, 2, -1));
		return method.apply(Obj, aa);  };


//some nice static convenience functions:
UniDOM.getSelectedOptions=function(select, forceReturnArray) {return getSelectedOptions.call(select, forceReturnArray);};
UniDOM.setSelectedOptions=function(select, value) {return setSelected.call(select, value);};
UniDOM.addPowerSelect=function(select) {select.getSelected=getSelectedOptions;  select.setSelected=setSelected;  return select;};

UniDOM.objectifyArray=objectify;
UniDOM.invoker=invoke;
UniDOM.objHas=function(obj, conditions, filter) {return has.call(obj, conditions, filter);};

Array.objectify=objectify;
Object.has=has;   //  myObject={};  myObject.has=Object.has;  flag=myObject.has(conditions, filter);


// ******************************************************************** \\

// If you set the  id  attribute of the <link> that loads the styleSheet or the <style> tag that contains the stylesheet,
//  you may pass in a string containing that id attrubute value to reference the styleSheet:
//  ¡HOWEVER! ¡WARNING! if a linked stylesheet does not load, this will cause an error, and the wrong stylesheet will be returned;
//  usually if a stylesheet fails, the web-page fails, but if this is a "feature' or you need to recoup,
//  you can mitigate this problem with an onerror event in the link as shown below:
//  <link rel='stylesheet' id='MyStylesheet' href='path/to/stylesheet.css' onerror='this.parentNode.removeChild(this)' />
// If you set the  title  attribute of the <link> that loads the styleSheet or the <style> tag that contains the stylesheet,
//  you may pass in a string containing that title attrubute value to reference the styleSheet.
// Or you may pass in an array of “titles” and/or “names”, and the first one in the array found in the document will be used.
// Or you may pass in the indexNumber of the styleSheet or simply the styleSheet itself.
UniDOM.StyleSheetShell=StyleSheetShell;
function StyleSheetShell(ss)  { var i;
	function getSSByName (ss)  { var id, j=0;
		function isSSElement(e) {return e.nodeName==='STYLE' || (e.nodeName==='LINK' && e.rel==='stylesheet');}
		if ((id=document.getElementById(ss))  &&  isSSElement(id))  {
			getElders.call(id, function(e) {if (isSSElement(e))  j++;},	true);
			return document.styleSheets[j];  }
		for (; j<document.styleSheets.length; j++)  {
			if (document.styleSheets[j].title===ss)  return document.styleSheets[j];  }  }
	if (!new.target)  throw new Error("UniDOM.Stylesheet (StyleSheetShell) is a constructor, not a function");
	if (typeof ss === 'number')  ss=document.styleSheets[ss];
	else if (typeof ss === 'string')  ss=getSSByName(ss);
	else if (typeof ss === 'object'  &&  ss instanceof Array)
		for (i=0; i<ss.length; i++) {if (ss[i]=getSSByName(ss[i]))  {ss=ss[i];  break;}}
	this.ss=ss;
	this.initLength=this.ss.cssRules.length;  }

// pass in a string of the selector text.
// returns an array of indexNumbers that refer to that rule, in ¡reverse order! found in the stylesheet.
// returns null if no match is found.
StyleSheetShell.prototype.getRuleIndexes=function(s)  {
	var rules=this.ss.cssRules;
	if (!rules)  return null;
	var i, found=new Array;
	if (s instanceof RegExp)
		for (i=rules.length; --i>=0;)  {if (rules[i].selectorText.match(s))  found.push(i);}
	else
		for (i=rules.length; --i>=0;)  {if (rules[i].selectorText===s)  found.push(i);}
	if (found.length>0)  return found;  }

StyleSheetShell.prototype.insertRule=function(selector, styles, n)  {
	if (typeof n != 'number')  n=this.ss.cssRules.length;
	this.ss.insertRule(selector+'{'+styles+'}', n);
	return n;  }

StyleSheetShell.prototype.deleteRule=function(n)  {
	if (typeof n === 'string'  ||  n instanceof RegExp)  n=this.getRuleIndexes(n);
	else
	if (typeof n === 'number')  n=[n];
	else
	if (!n instanceof Array)  n=[this.ss.cssRules.length-1];
	for (var i=0; i<n.length; i++)  {
		if (this.ss.deleteRule)  this.ss.deleteRule(n);  }
	return n;  }


// ******************************************************************** \\


UniDOM.globalize=function(myWindow)  { //hog the space
	if (myWindow===undefined)  myWindow=window;
	console.log('UniDOM Functions and Constructors that are now global: ====================');
	for (var p in UniDOM)  {
		switch (p)  {
		case 'CSSEngine':
		case 'globalize':
		case 'prototypify':  continue;
		default:  myWindow[p]=UniDOM[p];
							console.log('UniDOM.'+p+'  ='+(typeof UniDOM[p]));  }  }
		console.log('============================================');  }


UniDOM.prototypify=function(objectsToo)  { //invade the DOM
//  https://developer.mozilla.org/en-US/docs/Web/JavaScript/The_performance_hazards_of__[[Prototype]]_mutation

	if (CSSEngine)
	Element.prototype.$=function(CSSString, objFltr, powerSelect)  {
		var EA=(new ElementArray).concat(CSSEngine.call(this, CSSString), false);
		if (EA.length && (objFltr || powerSelect || UniDOM.powerSelect))  objectify(EA, objFltr, powerSelect);
		return EA;  }

	Element.prototype.getAncestor=getAncestor;
	Element.prototype.getElements=getElements;
	Element.prototype.getElders=getElders;
	Element.prototype.getJuniors=getJuniors;

	// While UniDOM’s method will accept the same arguments as the DOM standard getElementsByClassName(),
	// the latter returns a live node-list that changes as the DOM is updated,
	// and we need to retain that functionality for cross-library compatibility.
	// Also note that methods that can accept RegExps use the $ marker as such in their names.

	Element.prototype.getElementsBy$Class=getElementsByClass;
	Element.prototype.getAncestorBy$Class=getAncestorByClass;
	Element.prototype.getElementsBy$Name=getElementsByName;
	Element.prototype.getElementsByComplex=getElementsByComplex;
	Element.prototype.getAncestorByComplex=getAncestorByComplex;
	Element.prototype.hasAncestor=hasAncestor;
	Element.prototype.hasElement=hasElement;
	Element.prototype.has$Class=hasClass;
	Element.prototype.has=has;
	Element.prototype.addClass=addClass;
	Element.prototype.swapOut$Class=swapOutClass;
	Element.prototype.remove$Class=removeClass;
	Element.prototype.useClass=useClass;
	Element.prototype.disable=disable;

	Element.prototype.addEventHandler=function() {addEventHandler.apply(this, arguments);};
	Element.prototype.removeEventHandler=function() {removeEventHandler.apply(this, arguments);};
	Element.prototype.removeAllEventHandlers=function(goDeep) {removeAllEventHandlers(this, goDeep);};
	Element.prototype.getEventHandler=function() {getEventHandler.apply(this, arguments);};
	Element.prototype.generateEvent=function() {generateEvent.apply(this, arguments);};

	Object.defineProperties(Node.prototype, {
		isFirstNode: {enumerable:true, get: function() {return this===this.parentNode.firstChild;}, configurable:true},
		isLastNode:  {enumerable:true, get: function() {return this===this.parentNode.lastChild;}, configurable:true} });
	Object.defineProperties(Element.prototype, {
		isFirst: {enumerable:true, get: function() {return this===this.parentNode.firstElementChild;}, configurable:true},
		isLast:  {enumerable:true, get: function() {return this===this.parentNode.lastElementChild;}, configurable:true} });
	Node.prototype.isNode=function(i) {return this===this.parentNode.childNodes[i];}
	Element.prototype.isElement=function(i) {return this===this.parentNode.children[i];}

	Element.prototype.getOffset=function(scroll)  {return UniDOM.getElementOffset(this, scroll);};
	Element.prototype.getMouseOffset=function(event)  {return UniDOM.getMouseOffset(this, event);};

	Select.prototype.getSelected=getSelectedOptions;
	Select.prototype.setSelected=setSelected;

	Fieldset.prototype.getSelected=function() {getSelectedInputs.apply(this.elements, arguments)}
	Fieldset.prototype.setSelected=function() {setSelected.apply(this.elements, arguments);}

	if (!objectsToo)  return;
	Object.defineProperty(Object.prototype, "has", {value: has});
	Object.defineProperty(Array.prototype, "objectify", {value: function(nameFilter) {objectify(this, nameFilter);  return this;}});
	}
/*  still waiting………
HTMLCollection.prototype.
NodeList.prototype.boogar=function() {console.log('boogar', this[2]);}
var NL=document.getElementsByTagName('input');
NL.boogar();
 */

UniDOM.isConnected_polyfill=function isConnected_polyfill() {
// https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected
/*
 * Node.isConnected polyfill for IE and EdgeHTML
 * 2020-02-04
 *
 * By Eli Grey, https://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */
if (!('isConnected' in Node.prototype)) {
  Object.defineProperty(Node.prototype, 'isConnected', {
    get() {
      return (
        !this.ownerDocument ||
        !(
          this.ownerDocument.compareDocumentPosition(this) &
          this.DOCUMENT_POSITION_DISCONNECTED
        )
      );
    },
  });
}
}

window.UniDOM=UniDOM;


})();  // close UniDOM private-space wrapper

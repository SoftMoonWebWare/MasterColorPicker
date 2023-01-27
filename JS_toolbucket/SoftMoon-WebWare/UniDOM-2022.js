//  character-encoding: UTF-8 DOS   tab-spacing: 2   word-wrap: no   standard-line-length: 160   max-line-length: 2400
/*  UniDOM-2022  version 1.2.0  January 26, 2023
 *  copyright © 2013, 2014, 2015, 2018, 2019, 2020, 2022, 2023 Joe Golembieski, SoftMoon-WebWare
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


/*  required support file:  JS_toolbucket/+++JS/+++.js
 *  for:
	RegExp.escape
	Object.lock
	Object.prototype.has
*/


;(function UniDOM_NS()  { //open UniDOM’s private namespace (to end of file)

														 // ↓ optional
const UniDOM=function(element, passData)  {  /* ALTERNATE ARGUMENTS:
									 (ElementWrapper)           // ← passData is irrelevant for elements and ElementWrappers
									 (CSSQueryString)           // ← passData must be ==false (undefined)
									 (element‖ElementWrapper, CSSQueryString, passData)   // ← currently passData is irrelevant unless the CSS-Engine fails to return an array
									 (Array→[…may contain any number of legal arguments to this UniDOM function including nested Arrays…], passData)
									 (element‖ElementWrapper‖Array‖userData, passData=true)
*/
	if (!element)  return null;
	element=xElement(element);
	if (isElement(element))  {
		if (CSSEngine  &&  typeof arguments[1] === 'string')  return UniDOM(UniDOM.$(arguments[1], element), arguments[2]);
		else  return new ElementWrapper(element);  }
	else
	if (isArrayish(arguments[0]))  {
		const wrapped=(arguments[0] instanceof ElementArray) ? (arguments[0].wrappedElements=true, arguments[0]) : new ElementArray(true);
		for (const i in arguments[0])  {wrapped[i]=UniDOM(arguments[0][i], passData);}
		return  wrapped;  }
	else
	if (passData)  return arguments[0];
	else
	if (CSSEngine  &&  typeof arguments[0] === 'string')  return UniDOM(UniDOM.$(arguments[0], document));
	else  throw new Error("“UniDOM” accepts only:\n •a single DOM Element or UniDOM.ElementWrapper,"+(CSSEngine ? "":" or")+"\n •an Array of DOM Elements or UniDOM.ElementWrappers"+(CSSEngine ? ", or\n •a CSS-definer String":"")+".\n  Type of “"+(typeof arguments[0])+"” passed in.");
	};


	var CSSEngine;  //private

	function $query(CSSString, element, objFltr, powerSelect)  {
		const EA=(new ElementArray).concat(CSSEngine.call(xElement(element), CSSString));
		if (EA.length && (objFltr || powerSelect || UniDOM.doPowerSelects))  EA.objectify(objFltr, powerSelect);
		return EA;  }


//  ☆☆☆ ¡¡¡DO NOT CONFUSE Sizzle with jQuery!!! ☆☆☆
//  ☆☆☆                                         ☆☆☆
//  ☆☆☆ ¡ if you call  UniDOM.globalize()       ☆☆☆
//  ☆☆☆ UniDOM’s $ will overwrite window.$ !    ☆☆☆
UniDOM.$=function() {
	if (typeof UniDOM.CSSEngine === 'function')  CSSEngine=UniDOM.CSSEngine;
	else
	if (typeof window.Sizzle === 'function')  CSSEngine=function(s) {return Sizzle(s, this)};  // http://sizzlejs.com/   https://github.com/jquery/sizzle/wiki
	else
	if (typeof window.Slick === 'function')   CSSEngine=function(s) {return Slick(s, this)};   // http://mootools.net/docs/core/Slick/Slick  now defunct…
	if (CSSEngine)  {
		UniDOM.$=$query;          // auto-plugin Engine
		return $query.apply(UniDOM, arguments);  }
	else
	throw new Error("“UniDOM.$” requires “Sizzle.js” or “Slick.js” or the native “querySelectorAll” method (or similar CSSEngine) but none is installed.\n  See:\n  http://sizzlejs.com/\n  http://mootools.net/docs/core/Slick/Slick");  }
// if you don’t want to use Sizzle, Slick, or a similar package, remove the above function from UniDOM,
// and the UniDOM constructor method will supply a more appropriate Error message for debugging.

if (typeof Element.prototype.querySelectorAll === 'function')
	UniDOM.CSSEngine=Element.prototype.querySelectorAll;
// PS I'm already brainstorming while I sleep on an Engine to utilize UniDOM’s more powerful query methods…



 /* ======= event-centric functions =======
	*
	*/
	//private
	function isArrayish(a) {return a instanceof Array || a instanceof HTMLCollection || a instanceof NodeList}
	function arrayify(v) {return  (v instanceof Array) ? v : [v];}
	function getEventType(eT) {return eT.toLowerCase().match( /^(?:on)?(.+)$/ )[1];}
	const aSlice=Array.prototype.slice;

	var handlerCounter=0, eventCounter=0;

UniDOM.addEventHandler=addEventHandler;
function addEventHandler(element, eventType, handler, useCapture)  {
	element=xElement(element);
	if (isArrayish(element))  {
		const allAdded=new Array;
		for (const elmnt of element)  {
			allAdded.push(addEventHandler(elmnt, eventType, handler, useCapture));  }
		return allAdded;  }
	const
		userArgs=aSlice.call(arguments, 4),
		wrappers=new Array,
		doWrap=useCapture?.doWrap;
	eventType=arrayify(eventType);  handler=arrayify(handler);  useCapture=Boolean(typeof useCapture === 'object' ? useCapture.useCapture : useCapture);
	for (let i=0; i<eventType.length; i++)  {
		const etype=getEventType(eventType[i]);
		if (UniDOM.getEventHandler(element, etype, handler, useCapture) !== false)  {
			console.error('UniDOM will not double-bind event handlers.\n •Element: '+element+'\n •event type: '+etype+' with'+(useCapture ? "" : "out")+' capture\n •handler: '+handler);
			if (UniDOM.addEventHandler.errorOnDoubleBind)
				throw new Error('UniDOM will not double-bind event handlers.');
			else  continue;  }
		addingHandler=true;
		if (doWrap  ||  handler.length>1  ||  userArgs.length>0
		||  (typeof handler[0]['on'+etype] === 'function')
		||  (typeof handler[0].handleEvent === 'function'))  {
			wrappers[i]=function UniDOM_EventHandlerWrapper(event)  {
				if (handler.suspend)  return;
				const pass=userArgs.slice(0);  pass.unshift(event);
				event.id=eventCounter++;
				event.doContinue=true;
				for (let j=0;  event.doContinue && j<handler.length;  j++)  {
					if (typeof handler[j]['on'+event.type] === 'function')  handler[j]['on'+event.type](...pass);
					else if (typeof handler[j].handleEvent === 'function')  handler[j].handleEvent(...pass);
					else  handler[j].apply(element, pass);  }  }
			element.addEventListener(etype, wrappers[i], useCapture);
			wrappers[eventType[i]]=new UniDOM.EventHandler(element, etype, handler, useCapture, wrappers[i], userArgs);  }
		else  {
			element.addEventListener(etype, handler[0], useCapture);
			wrappers[eventType[i]]=new UniDOM.EventHandler(element, etype, handler[0], useCapture);  }  }

	return wrappers;  }

addEventHandler.errorOnDoubleBind=true;  // false quietly ignores double-binds

	//private
	var addingHandler=false,
			allEvents;
	const eventedWindows=new Array;

// (PS don't forget addEventHandler returns an Array–Object with case-sensitive properties that relate event-types to “EventHandler”s:
//  added=UniDOM.addEventHandler(e, 'onClick', [h1, h2]);  added.onClick.handler.push(another_h);  added.onClick.remove();
//  whereas getEventHandler returns only the EventHandler and is case-INsensitive for event-types:
//  EH=UniDOM.getEventHandler(e, 'onclick', [h1, h2]);  EH.handler.push(another_h);  EH.remove();
//  in-other-words:  UniDOM.addEventHandler(e, 'onClick', [h1, h2]).onClick === UniDOM.getEventHandler(e, 'onclick', [h1, h2]) )
/*
	* a UniDOM.EventHandler Object has the following properties and method:
			id         unique id  ←do NOT change this value
			element    ←do NOT change this value, it is not live
			eventType  ←do NOT change this value, it is not live
			handler    {{LIVE}}  an array of the handlers that are executed in order for each event;
									or a single basic handler with no user-arguments to pass, and wrapper will be “undefined” (see below).
			handler.suspend   {{LIVE}}  Boolean value to temporarily suspend calling the handlers
									in the handler Array (but the wrapper is still active)
			wrapper    ←do NOT change this value, it is not generally live.
									the wrapper function that is actually added as an event handler to the element.
									You may invoke this wrapper directly to simulate an event.
									For a single basic handler with no user-arguments to pass, the wrapper will be “undefined”.
			userArgs   {{LIVE}}  an array of user arguments — each passed as an argument to each handler function by the wrapper;
									For a single basic handler with no user-arguments to pass, userArgs will be “undefined”.
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
	this.handler=handler;  // this is an Array and it may be modified; or a single basic handler with no user-arguments to pass
	this.useCapture=useCapture;  /*    ♪ ♫ ♪ I’m a capturah; soul adventurah… … … ♫ ♪ ♫    */
	this.wrapper=wrapper;  // the wrapper function; or “undefined” for a single basic handler with no user-arguments to pass
	this.userArgs=userArgs;  // this is an Array and it may be modified; or it may be “undefined” for a single basic handler with no user-arguments to pass
//	Object.freeze(this);  }
	Object.lock(this);  }  // properties may not be modified, but new properties may be added by the user

EventHandler.prototype.remove=function()  {
	// since EventHandler objects are now frozen/locked (they could not be when UniDOM was created and JavaScript was young)
	// there should be no way to throw Errors; but just in case…we leave the sanity checks.
	if (!isElement(this.element)  &&  !isWindow(this.element))
		throw new Error("Can not remove “UniDOM.EventHandler”: its “element reference” has been corrupted.");
	const w=(this.element.ownerDocument  ||  this.element.document  ||  this.element).defaultView;  // ← (ElementNode || window || document)
	getAllEventsInWindow(w, false);
	if (allEvents[this.id] !== this)  throw new Error("Can not remove “UniDOM.EventHandler”: its “id” has been corrupted.");
	this.element.removeEventListener(this.eventType, this.wrapper || this.handler, this.useCapture);
	delete allEvents[this.id];
	this.id=false;
	cleanWindow(w);  }



UniDOM.getEventHandler=getEventHandler;
function getEventHandler(element, eventType, handler, useCapture)  {
	element=xElement(element);
	eventType=getEventType(eventType);
	handler=arrayify(handler);
	getAllEventsInWindow((element.ownerDocument  ||  element.document  ||  element).defaultView, false);
	if (allEvents)  loopAllEvents: for (const id in allEvents)  {
		const EH=allEvents[id];
		if (element===EH.element  &&  eventType===EH.eventType  &&  useCapture==EH.useCapture
		&&  ((typeof EH.handler === 'funciton'  &&  handler.length===1  &&  EH.handler===handler[0])
				 ||  handler.length===EH.handler.length))  {
			for (let j=0; j<handler.length; j++)  {if (handler[j]!==EH.handler[j])  continue loopAllEvents;}
			return EH;  }  }
	return false;  }


	//private
	function getAllEventsInWindow(win, makeNew)  {
		for (const w of eventedWindows)  {if (win===w.window)  return allEvents=w.allEvents;}
		if (!makeNew)  return allEvents=false;
		const ref={window:win, allEvents:new Object};
		eventedWindows.push(ref);
		// crusty fossilized dinosaur browsers (MSIE) had memory leaks — but ¿maybe you still want to do this for some reason?
		// win.addEventListener('unload', UniDOM.removeAllEventHandlers, false);
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


	//private
	function cleanWindow(win)  {
		if (eventedWindows.length===0)  return;
		for (var i=0;  i<eventedWindows.length;  i++)  {if (win===eventedWindows[i].window)  break;}
		for (const id in eventedWindows[i].allEvents)  {return false;}    //if there are any EventHandlers still registered in this window, we can’t yet clean it.
		eventedWindows.splice(i, 1);
		// crusty fossilized dinosaur browsers (MSIE) had memory leaks —
		// win.removeEventListener('unload', UniDOM.removeAllEventHandlers, false);
		}


// registered to a window or element, or is a property of an element, so “this” is the window or element…
UniDOM.removeAllEventHandlers=removeAllEventHandlers;
function removeAllEventHandlers(element, goDeep)  {
	function remover(element)  {for (const id in allEvents)  {if (allEvents[id].element===element)  allEvents[id].remove();}}
	if (isWindow(this))  element=this;

	else  element=xElement(element||this);

	if (!isElement(element)  &&  !isWindow(element))  {
		throw new Error('UniDOM.removeAllEventHandlers is a method of a DOM Element or window, or must be supplied an element or window as an argument.');  }
	getAllEventsInWindow((element.ownerDocument  ||  element.document  ||  element).defaultView, false);
	if (isElement(element))  { // DOM element passed in
		remover(element);
		if (goDeep)  UniDOM.getElements(element, remover, goDeep);  }
	else   // a window passed in
		for (var id in allEvents)  {allEvents[id].remove();}  }


UniDOM.generateEvent=generateEvent;
function generateEvent(element, eventType, eSpecs, userArgs)  {
	element=xElement(element);
	eventType=arrayify(eventType);
	for (let eT of eventType)  {
		eT=getEventType(eT);
		let
			subT=eT.match( /wheel|mouse|click|key|focus|touch|resize|scroll|./ ),
			event;
		switch (subT[0])  {
			case 'wheel': event=new WheelEvent(eT, eSpecs);
			break;
			case 'mouse':
			case 'click': event=new MouseEvent(eT, eSpecs);
			break;
			case 'key': event=new KeyboardEvent(eT, eSpecs);
			break;
			case 'focus': event=new FocusEvent(eT, eSpecs);
			break;
			case 'touch': event=new TouchEvent(eT, eSpecs);
			break;
			case 'resize':
			case 'scroll': event=new UIEvent(eT, eSpecs);
			break;
			default: event=new CustomEvent(eT, eSpecs);  }
		if (userArgs)  for (p in userArgs)  {event[p]=userArgs[p];}
		element.dispatchEvent(event);  }  }

UniDOM.triggerEvent=function triggerEvent(element, event)  {
	element=xElement(element);
	element.dispatchEvent(event);  };



/* The KeySniffer constructor can accept a KeyboardEvent to allow host software to customize a keyboard response
 * by asking the end-user to press the desired key for a given function
 * and that key plus its modifier keys’ states will be captured;
 * or you can directly specify the keypress by string or keyCode, plus flags for the modifier keys.
 * Note if you pass modifier key flags, they MUST be Boolean values to match a modifier key state,
 * or MUST be “undefined” if you don’t care about the state of the modifier key.
 */
UniDOM.KeySniffer=KeySniffer;
function KeySniffer(key, shift, ctrl, alt, meta, graph, os, capsLock, numLock, scrollLock)  {
//function KeySniffer(event, checkCapsLock, checkNumLock, checkScrollLock)  {  // ← alternative arguments
	if (!new.target)  throw new Error('KeySniffer is a contructor, not a function.');
	if (arguments[0] instanceof KeyboardEvent)  {
		this.key=arguments[0].keyCode;  // ←a specific key on the keyboard; event.key could be more than one physical key
		this.shift=arguments[0].shiftKey;
		this.ctrl=arguments[0].ctrlKey;
		this.alt=arguments[0].altKey;
		this.meta=arguments[0].metaKey;
		this.graph=arguments[0].getModifierState('AltGraph');
		this.os=arguments[0].getModifierState('OS');
		this.capslock= arguments[1] ? arguments[0].getModifierState('CapsLock') : undefined;
		this.numlock= arguments[2] ? arguments[0].getModifierState('NumLock') : undefined;
		this.scrolllock= arguments[3] ? arguments[0].getModifierState('ScrollLock') : undefined;  }
	else  {
		this.key=key;  // ←this could be a numeric keycode for a specific key on the keyboard; or a string that represents more than one physical key
		this.shift=shift;
		this.ctrl=ctrl;
		this.alt=alt;
		this.meta=meta;
		this.graph=graph;  //  remember, the “AltGraph” modifier state can also be triggered by a CTRL ALT key-combo, not only the ALTGRAPH key
		this.os=os;
		this.capsLock=capsLock;
		this.numLock=numLock;
		this.scrollLock=scrollLock;  }  }
// returns true if the event’s key-press matches this KeySniffer’s key-combo-specs; returns false otherwise.
KeySniffer.prototype.sniff=function sniffKeyEvent(event)  {
	return (typeof this.key === 'number' ? event.keyCode : event.key) === this.key  &&
					(this.shift===undefined || event.shiftKey===this.shift)  &&
					(this.ctrl===undefined  || event.ctrlKey===this.ctrl)  &&
					(this.alt===undefined   || event.altKey===this.alt)  &&
					(this.meta===undefined  || event.metaKey===this.meta)  &&
					(this.graph===undefined || event.getModifierState('AltGraph')===this.graph)  &&
					(this.os===undefined    || event.getModifierState('OS')===this.os)  &&
					(this.capsLock===undefined   || event.getModifierState('CapsLock')===this.os)  &&
					(this.numLock===undefined    || event.getModifierState('NumLock')===this.os)  &&
					(this.scrollLock===undefined || event.getModifierState('ScrollLock')===this.os);  }




UniDOM.getMouseOffset=getMouseOffset;
function getMouseOffset(element, event)  {  //returns an offset-values object; event object is not modified.
	element=xElement(element);
	var offset=UniDOM.getElementOffset(element, true);
	offset.x=event.clientX-offset.x;
	offset.y=event.clientY-offset.y;
	return offset;  }



/* ======= DOM-centric functions =======
 *
 *
 */

//  Returns the element offset from the window’s top-left corner if scroll=true;
//  or if  scroll=false  from the document’s top-left corner.
//  If the element is − or is nested within − a fixed-position element, it will be noted in the return object…
UniDOM.getElementOffset=getElementOffset;
function getElementOffset(element, scroll)  {
										//  (element, ancestor)  ← alternate, find the offset from the ancestor
	var x=0, y=0, scrl=false, fixed=false, ancestor=null;
	element=xElement(element);
	if (typeof scroll === 'boolean')  scrl=scroll;
	else if (isElement(arguments[1]))  ancestor=arguments[1];
//	console.log('---');
	while (!fixed  &&  (s=getComputedStyle(element, null))
			&&  element!==ancestor  &&  element.offsetParent)  {
		if (s.position==='fixed')  {scrl=false;  fixed=true;}
//								console.log("<"+element.nodeName+" id="+element.id+">  postion: "+s.position+";  offsetLeft: "+element.offsetLeft+";  offsetTop: "+element.offsetTop);
		x+= element.offsetLeft - (scrl? element.offsetParent.scrollLeft : 0);
		y+= element.offsetTop - (scrl? element.offsetParent.scrollTop : 0);
		element=element.offsetParent;  }
	if (scrl)  {x-=window.pageXOffset;  y-=window.pageYOffset;}  //console.log('pageYOffset: '+window.pageYOffset);
//	console.log('---');
	return {x:x, y:y, fixed:fixed};  }


UniDOM.isElement=isElement;
function isElement(e, i) {return (e instanceof Element)  &&  (typeof i !== 'number'  ||   e===e.parentNode?.children[i]);}

UniDOM.isNode=isNode;
function isNode(n, i) {return (n instanceof Node)  &&  (typeof i !== 'number'  ||   n===n.parentNode?.childNodes[i]);}

UniDOM.isFirst=isFirst;
function isFirst(e) {return (e instanceof Element)  &&   e===e.parentNode?.firstElementChild;}

UniDOM.isFirstNode=isFirstNode;
function isFirstNode(n) {return (n instanceof Node)  &&   n===n.parentNode?.firstChild;}

UniDOM.isLast=isLast;
function isLast(e) {return (e instanceof Element)  &&   e===e.parentNode?.lastElementChild;}

UniDOM.isLastNode=isLastNode;
function isLastNode(e) {return (n instanceof Node)  &&   n===n.parentNode?.lastChild;}

UniDOM.isWindow=isWindow;
function isWindow(w)  {return  w instanceof Window;}




// If no match is found, false is returned.
// If goDeep returns false on the first match found, that single element will be returned.
// If goDeep returns true on the first match found, an “ElementArray” (a simple Array with added “UniDOM power methods”)
//  is returned (the result may only be one member, or multiple members of elements)
function getAncestor(cb, goDeep, objFltr, powerSelect)  {
	if (typeof cb !== 'function')  throw new TypeError('“UniDOM.getAncestor” requires a callback function; type of “'+(typeof cb)+'” passed in.');
	if (typeof goDeep === 'undefined')  goDeep=function() {return false};
	else if (typeof goDeep !== 'function')  {const deep=Boolean(goDeep);  goDeep=()=>deep;}
	var parent=this.parentNode,
			found=false;
	do {
		if (cb(parent, this, found))  {
			if (!found  &&  !goDeep(parent, this, found))  return parent;
			if (!found)  found=new ElementArray;
			found.push(parent);  }  }
	while ((!found || goDeep(parent, this, found))  &&  (parent=parent.parentNode));
	if (found && (objFltr || powerSelect || UniDOM.doPowerSelects))  found.objectify(objFltr, powerSelect);
	return found;  }


// for  getAncestor,  getElements,  getElders,  and  getJuniors:
// cb → callBack function should decide whether each element passed to it is the/an
//  ancestor/descendant/elder/junior of choice and return a Boolean value indicating such choice.
// cb.allNodes → Boolean: true crawls all DOM Nodes, false (default) crawls only Element Nodes (¡not for getAncestor!);
//  this value may be changed by cb or goDeep while crawling.
// goDeep → may be •Boolean (default is false for Ancestors, true for the rest) or
//  a •function that evaluates each individual element passed to it and returns a Boolean value.
// goDeep.doContinue → Boolean may be changed to false by goDeep or cb while crawling to end query immediately (¡not for getAncestor!)
// objFltr → may be a filter-function returning Object-property names.  See the  objectify()  function down below.
// powerSelect → Boolean: ¿apply nonstandard methods (getSelected() & setSelected()) to <select> elements?

//you can use the following function as the value of  goDeep  for getElements, getElders, & getjuniors
//these functions will use it by default anyway if  goDeep  is undefined
//then your cb() can include something like: function(){ … … if (done_with_search)  UniDOM.alwaysTrue.doContinue=false; … … }
Object.defineProperty(UniDOM, 'alwaysTrue', {enumerable:true, value:alwaysTrue});
function alwaysTrue() {return true}


// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
//  a.k.a. getDescendents()  …“getElements” reflects the standard DOM method names, but this can gather Nodes of other types also.
	function getElements(cb, goDeep, objFltr, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getElements” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=alwaysTrue;
		else if (typeof goDeep !== 'function')  {const deep=Boolean(goDeep);  goDeep=()=>deep;}
		goDeep.doContinue=true;
		const found=getKids(this[cb.allNodes ? 'childNodes' : 'children'], cb, goDeep, this);
		if (found.length && (objFltr || powerSelect || UniDOM.doPowerSelects))  found.objectify(objFltr, powerSelect);
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
		if (typeof goDeep === 'undefined')  goDeep=alwaysTrue;
		else if (typeof goDeep !== 'function')  {const deep=Boolean(goDeep);  goDeep=()=>deep;}
		goDeep.doContinue=true;
		var elder=this;
		const found=new ElementArray;
		do {  while (goDeep.doContinue  &&  elder[cb.allNodes ? 'previousSibling' : 'previousElementSibling'])  {
			elder=elder[cb.allNodes ? 'previousSibling' : 'previousElementSibling'];
			while (elder.hasChildNodes()  &&  goDeep(elder, this, found)  &&  (cb.allNodes  ||  elder.lastElementChild))  {
				elder=elder[cb.allNodes ? 'lastChild' : 'lastElementChild'];  }
			if (cb(elder, this, found))  found.push(elder);  }  }
		while (goDeep.doContinue  &&  (elder=elder.parentNode)  &&  (cb(elder, this, found) ? found.push(elder) : true));
		if (found.length && (objFltr || powerSelect || UniDOM.doPowerSelects))  found.objectify(objFltr, powerSelect);
		return found;  }


// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
	function getJuniors(cb, goDeep, objFltr, powerSelect)  {
		if (typeof cb !== 'function')  throw new Error('“UniDOM.getJuniors” requires a callback function; type of “'+(typeof cb)+'” passed in.');
		if (typeof goDeep === 'undefined')  goDeep=alwaysTrue;
		else if (typeof goDeep !== 'function')  {const deep=Boolean(goDeep);  goDeep=()=>deep;}
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
		if (found.length && (objFltr || powerSelect || UniDOM.doPowerSelects))  found.objectify(objFltr, powerSelect);
		return found;  }


// returns (e) if the element (e) is an ancestor/descendant of this-Element.
// else returns false.
	function hasAncestor(e)  {return getAncestor.call(this, a => a===e)}
	function hasElement(e)  {return  (isElement(e)  &&  getAncestor.call(e, a => a===this))  ?  e : false;}


	function getElementsByName(n, deep, objFltr, powerSelect)  { var count;
		if (n===""  ||  typeof n === 'undefined'  ||  n===null)  n=new RegExp('^.+$');
		else
		if (typeof n !== 'object'  ||  !(n instanceof RegExp))  n=new RegExp('^'+RegExp.escape(n)+'$');
		if (typeof deep === 'number')  {
			count=Math.max(1,deep);
			deep=alwaysTrue;  }
		else if (typeof deep === 'function'  &&  deep.count)  count=Math.max(1,deep.count);
		if (typeof objFltr !== 'function')  objFltr=function(e) {return e.name;};
		const found=getElements.call(this,
			function(e)  { const flag=(typeof e.name === 'string'  &&  n.test(e.name));
				if (flag && count)  deep.doContinue=(--count);
				return flag;  },
			deep, objFltr, powerSelect);
		return found.length ? found : false;  };


	function getElementsByClass(c, deep, objFltr, powerSelect)  {
		if (typeof c === 'string')  {c=cleanClass(c);  c=c.split(" ");}
		if (typeof deep === 'number')  {
			var count=Math.max(1,deep);
			deep=alwaysTrue;  }
		else if (typeof deep === 'function'  &&  deep.count)  count=Math.max(1,deep.count);
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
			function(e) {return e.has(conditions.data, conditions.filter);},
			//function(e) {return has.call(e, conditions.data, conditions.filter);},
			deep, objFltr, powerSelect );  }

	function getAncestorByComplex(conditions, deep, objFltr, powerSelect)  {
		return getAncestor.call(this,
			function(e) {return e.has(conditions.data, conditions.filter);},
			//function(e) {return has.call(e, conditions.data, conditions.filter);},
			deep, objFltr, powerSelect );  }


	/* adding to Object.prototype is an extreme condition — maybe we should not depend on it…
	 * but code “should” run faster if we do
	 *
	const has=Object.prototype.has;  // ← see the file  JS_toolbucket/+++JS/+++.js
	 *
	 */

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
		return this.has(cna, function(e, c)  { //is passed one className in the cna at a time
		//return has.call(this, cna, function(e, c)  { //is passed one className in the cna at a time
			var not=false;
			if (typeof c === 'function')  return c(e)^c.not;
			if (typeof c !== 'object'  ||  !(c instanceof RegExp))  {
				if (typeof c === 'string'  &&  c.charAt(0)==='!')  {c=c.substr(1);  not=true;}
				c=new RegExp('\\b'+RegExp.escape(c)+'\\b');  }
			return (not  ||  c.not)  ?  !c.test(e.className) : e.className.match(c);  });  }


	// c must be the string name of the class  or an array of these strings
	function addClass(c)  {this.className=aClass(this.className, c);}
	function aClass(cn, acs)  {  //private
		if (!(acs instanceof Array))  acs=[acs];
		for (const ac of acs)  {
			if (!(typeof cn === 'string'  &&  ( new RegExp('\\b'+RegExp.escape(ac)+'\\b') ).test(cn)))
				cn+=(cn) ? (" "+ac) : ac;  }
		cn=cleanClass(cn);
		return cn;  }

	// c may be the string name of the class or a RegExp  or an array of these
	function removeClass(c) {this.className=xClass(this.className, c);}
	function xClass(cn, xcs) {  //private
		if (typeof cn !== 'string')  return;
		if (!(xcs instanceof Array))  xcs=[xcs];
		for (const xc of xcs)  {
			cn=cn.replace(xc instanceof RegExp ?  xc  :  new RegExp('\\b'+RegExp.escape(xc)+'\\b', 'g'),  "");
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
		const cn=xClass(this.className, xc);
		this.className=aClass(cn, ac);  }


	function disable(flag, className='disabled', bubbles)  {
		if (this.hasAttribute('lock-disabled-state'))  return;
		flag=Boolean(flag);
		this.disabled=flag;
		useClass.call(this, className, flag);
		try {generateEvent(this, 'onDisabledStateChange', {bubbles:bubbles}, {disable:flag});}  catch(e) {console.warn(e);};
		for (const field of getElements.call(this, isInterface, goDeeper))  {
			field.disabled=flag;
			try {generateEvent(field, 'onDisabledStateChange', {bubbles:bubbles}, {disable:flag});}  catch(e) {};  }
		//private
		function isInterface(e)  { return  e.nodeName==='INPUT' || e.nodeName==='SELECT' || e.nodeName==='TEXTAREA' || e.nodeName==='BUTTON'  ||
			e.getAttribute('tabIndex')!==null  ||  e.getAttribute('contentEdible')!==null;  }
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

ElementWrapper.prototype.addEventHandler=function()  {return addEventHandler(this.element, ...arguments);};
ElementWrapper.prototype.removeEventHandler=function()  {removeEventHandler(this.element, ...arguments);  return this;};
ElementWrapper.prototype.removeAllEventHandlers=function(goDeep)  {removeAllEventHandlers(this.element, goDeep);  return this;};
ElementWrapper.prototype.generateEvent=function()  {generateEvent(this.element, ...arguments);  return this;};
ElementWrapper.prototype.triggerEvent=function(event)  {UniDOM.triggerEvent(this.element, event);  return this;};

ElementWrapper.prototype.getOffset=function(scroll)  {return getElementOffset(this.element, scroll);}
ElementWrapper.prototype.getMouseOffset=function(event)  {return getMouseOffset(this.element, event);}

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
ElementWrapper.prototype.getElementsByTagName=function(tn)  {return UniDOM(this.element.getElementsByTagName(tn), true);};
ElementWrapper.prototype.hasAncestor=function()  {return UniDOM(hasAncestor.apply(this.element, arguments), true);};
ElementWrapper.prototype.hasElement=function()  {return UniDOM(hasElement.apply(this.element, arguments), true);};
ElementWrapper.prototype.has=function()  {return has.apply(this.element, arguments);};
ElementWrapper.prototype.has$Class=function()  {return hasClass.apply(this.element, arguments);};
ElementWrapper.prototype.addClass=function()  {addClass.apply(this.element, arguments);  return this;};
ElementWrapper.prototype.remove$Class=function()  {removeClass.apply(this.element, arguments);  return this;};
ElementWrapper.prototype.useClass=function()  {useClass.apply(this.element, arguments);  return this};
ElementWrapper.prototype.swapOut$Class=function()  {swapOutClass.apply(this.element, arguments);  return this};
ElementWrapper.prototype.disable=function()  {disable.apply(this.element, arguments);  return this;};

ElementWrapper.prototype.getSelected= function() {
	return  this.element.nodeName==='SELECT' ?
			getSelectedOptions.call(this.element)
		: getElementsByName.apply(this.element, aSlice.call(arguments, 1)).getSelected();  };
ElementWrapper.prototype.setSelected=function() {if (this.element.nodeName==='SELECT') return setSelectedOptions.apply(this.element, arguments);};



class ElementArray extends Array  {  //  ← a new Array will be created with the relevant “UniDOM power methods”.
/*
 *  When a standard Array method returns an array, when used in this class it will instead return an ElementArray.
 *  In the process, it will call this constructor and pass an integer value for the array length.
 *  Users of this class are therefore forced to pass in a Boolean value for wrapElements, or the default value will be used.
 */
	constructor(wrapElements)  {
		if (arguments[0] instanceof Node)  {super(...arguments);  wrapElements=false;}
		else if (arguments[0] instanceof ElementWrapper)  {super(...arguments);  wrapElements=true;}
		else if (typeof arguments[0]==='number')  super(arguments[0]);
		else  super();
		Object.defineProperty(this, 'wrappedElements', { writable: true,
			value: (typeof wrapElements === 'boolean') ? wrapElements : ElementArray.wrappedElements } );  }

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
  getElementsByTagName() {cb=Element.prototype.getElementsByTagName;  return getConglomerate.apply(this, arguments);}

	setAttributes(n,v) {this.forEach(function(e){if (isElement(e))  e.setAttribute(n,v);});  return this;}
	removeAttributes(n) {this.forEach(function(e){if (isElement(e))  e.removeAttribute(n);});  return this;}
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

	addEventHandler() {cb=addEventHandler;  return invokeAll.apply(this, arguments);}
	removeEventHandler() {cb=removeEventHandler;  return invokeAll.apply(this, arguments);}
	generateEvent() {cb=generateEvent;  return invokeAll.apply(this, arguments);}
	triggerEvent() {cb=triggerEvent;  return invokeAll.apply(this, arguments);}

	isElement() {cb=isElement;  return invokeAll.apply(this);}

	getSelected(forceReturnArray)  {
		const selected=new ElementArray;
		for (const elmnt of this)  { if (elmnt?.checked)  switch (elmnt.type)  {
			case 'radio':  return  forceReturnArray ? (selected.push(elmnt), selected) : elmnt;
			case 'checkbox':  selected.push(elmnt);  }  }
		return asArray(selected, forceReturnArray);  }

	setSelected(value)  {
		if (!(value instanceof Array))  value=[value];
		for (const elmnt of this)  { if (elmnt?.nodeName==='INPUT')  switch (elmnt.type)  {
			case 'radio':
			case 'checkbox': elmnt.checked=value.includes(elmnt.value);  }  }
		return this;  }

	getValues(includeEmpty, goDeep)  { var r=new Array;
		if (typeof goDeep !== 'function')  {const deep=Boolean(goDeep);  goDeep=()=>deep;}
		function gatherValue(e)  { //note we never gather any elements, just extract their data
			if (includeEmpty || (('value' in e) && e.value!==undefined && e.value!==""))  r.push(e.value);
			if (e.children.length  &&  goDeep(e))  getElements.call(e, gatherValue, false);  }
		this.forEach(gatherValue);
		return r;  }

	objectify(filter, powerSelect)  {
		if (block)  return;   //block is controlled exclusively by getConglomerate below
		if (typeof filter !== 'function')  filter=null;
		for (let e of this)  {
			e=xElement(e);
			if (e.nodeName==='SELECT' && (powerSelect || (UniDOM.doPowerSelects && powerSelect!==false)))  {
				e.getSelected=getSelectedOptions;  e.setSelected=setSelectedOptions;  }
			const n=filter?.(e);  //get a property name corresponding to this array member
			if (!n)  continue;
			if (this[n] instanceof ElementArray)  this[n].add(e);
			else if (this[n])  this[n]=(new ElementArray(this.wrappedElements)).add(this[n], e);  //note that if this[n] was defined before this function was called, and it was an Array-like Object, it will be flattened (recursively) into this new ElementArray
			else  this[n]=e;  }
		return this;  }

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
Object.defineProperty(ElementArray.prototype, 'type', {value: 'UniDOM ElementArray'});
// default value for constructor above (unused internally by UniDOM’s functions and methods)
ElementArray.wrappedElements=false;
UniDOM.ElementArray=ElementArray;


var cb,  //private
		block=false;

//↓private----===========*********===========----
	function getConglomerate(xData, deep, objFltr, powerSelect)  {
		var r=new ElementArray(this.wrappedElements);
		block=true;  //see objectify() above in the ElementArray class
		try  { for (let e of this)  {
			e=cb.apply(xElement(e), arguments);
			r=r.concat(this.wrappedElements ? UniDOM(e, true) : e);  }  }
		finally {block=false;}
		if (objFltr || powerSelect)  r.objectify(objFltr, powerSelect);
		return r;  }

	function applyToAll() { const r=new Array;
		for (const e of this)  {r.push(cb.apply(xElement(e), arguments));}
		return r;  }

	function invokeAll()  { var r=new Array;
		for (const e of this)  {
			const args=Array.from(arguments);  args.unshift(xElement(e));
			r=r.concat(cb.apply(UniDOM, args));  }
		return r;  }

	function asArray(a, asArray) {return asArray ? a : (a.length<1 ? null : ((asArray===false && a.length<2) ? a[0] : a));}

	function xElement(e) {return (!UniDOM.isWindow(e)  &&  (e instanceof ElementWrapper)) ? e.element : e;}
//↑private----===========*********===========----


	function getSelectedOptions(forceReturnArray)  {
		if (this.type==='select-one')  { var s= (this.selectedIndex>=0) ? this.options[this.selectedIndex] : null;
			return  forceReturnArray ? [s] : s;  }
		return asArray(this.selectedOptions, forceReturnArray);  }

	function setSelectedOptions(values)  {
		if (!(values instanceof Array))  values=[values];
		for (const opt of this.options)  {
			if (opt.hasAttribute('value'))
				opt.selected= values.includes(opt.value);
			else  opt.selected= values.includes(opt.text);  }
		return this;  }


var xTimes=0

	function invoke(Obj, method /* , firstArg «, secondArg «, thirdArg, … … … »» , moreArgumentsArray */ )  {    //currently unused by UniDOM
		const aa=aSlice.call(arguments[arguments.length-1], 0);
		aa.unshift(aSlice.call(arguments, 2, -1));
		return method.apply(Obj, aa);  };


//some nice static convenience functions:
UniDOM.getSelectedOptions=function(select, forceReturnArray) {return getSelectedOptions.call(select, forceReturnArray);};
UniDOM.setSelectedOptions=function(select, values) {return setSelectedOptions.call(select, values);};
//note the point of “getSelected” & “addSelected” is to have identical method names for <select> elements and UniDOM.ElementArrays of <input type='radio‖checkbox'>
//JavaScript can then easily work with either when gathered by name and the HTML “form” content is freed up a bit for the front-end developer’s choice
UniDOM.addPowerSelect=function(select) {select.getSelected=getSelectedOptions;  select.setSelected=setSelectedOptions;  return select;};

UniDOM.doPowerSelects=false;  // if “true”, UniDOM’s element-gathering functions will always add “getSelected()” & “setSelected()” methods to <select> elements

UniDOM.invoker=invoke;


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
function StyleSheetShell(ssName)  { var ss, i;
	function getSSByName(ssName)  { var id, j=0;
		function isSSElement(e) {return e.nodeName==='STYLE' || (e.nodeName==='LINK' && e.rel==='stylesheet');}
		if ((id=document.getElementById(ssName))  &&  isSSElement(id))
			return id.sheet;
		for (; j<document.styleSheets.length; j++)  {
			if (document.styleSheets[j].title===ssName)  return document.styleSheets[j];  }  }
	if (!new.target)  throw new Error('“UniDOM.StyleSheetShell” is a constructor, not a function.');
	if (typeof ssName === 'number')  ss=document.styleSheets[ssName];
	else if (typeof ssName === 'string')  ss=getSSByName(ssName);
	else if (typeof ssName === 'object'  &&  ssName instanceof Array)
		for (i=0; i<ssName.length; i++) {if (ss=getSSByName(ssName[i]))  break;}
	if (ss)
		Object.defineProperties(this, {ss: {enumerable:true, value:ss}, initLength: {enumerable:true, value:ss.cssRules.length}});  }


// pass in a string or EegExp of the selector text.
// returns an array of indexNumbers that refer to that rule, in ¡reverse order! found in the stylesheet.
// returns null if no match is found.
StyleSheetShell.prototype.getRuleIndexes=function getRuleIndexes(s)  {
	var rules=this.ss.cssRules;
	if (!rules)  return null;
	var i, found=new Array;
	if (s instanceof RegExp)
		for (i=rules.length; --i>=0;)  {if (rules[i].selectorText  &&  s.test(rules[i].selectorText))  found.push(i);}
	else
		for (i=rules.length; --i>=0;)  {if (rules[i].selectorText===s)  found.push(i);}
	if (found.length>0)  return found;  };

StyleSheetShell.prototype.insertRule=function insertRule(selector, styles, n)  {
	if (typeof n != 'number')  n=this.ss.cssRules.length;
	this.ss.insertRule(selector+'{'+styles+'}', n);
	return n;  };

StyleSheetShell.prototype.deleteRule=function(n)  {
	if (typeof n === 'string'  ||  n instanceof RegExp)  n=this.getRuleIndexes(n);
	else
	if (typeof n === 'number')  n=[n];
	else
	if (!n instanceof Array)  n=[this.ss.cssRules.length-1];
	for (var i=0; i<n.length; i++)  {this.ss.deleteRule(n);}
	return n;  };


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


UniDOM.prototypify=function()  { //invade the DOM

	if (CSSEngine)
	Element.prototype.$=function(CSSString, objFltr, powerSelect)  {
		var EA=(new ElementArray).concat(CSSEngine.call(this, CSSString), false);
		if (EA.length && (objFltr || powerSelect || UniDOM.doPowerSelects))  EA.objectify(objFltr, powerSelect);
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

	Element.prototype.addEventHandler=function() {return addEventHandler(this, ...arguments);};
	Element.prototype.removeEventHandler=function() {return removeEventHandler(this, ...arguments);};
	Element.prototype.removeAllEventHandlers=function(goDeep) {return removeAllEventHandlers(this, goDeep);};
	Element.prototype.getEventHandler=function() {return getEventHandler(this, ...arguments);};
	Element.prototype.generateEvent=function() {return generateEvent(this, ...arguments);};

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
	Select.prototype.setSelected=setSelectedOptions;

	Fieldset.prototype.getSelected=function(forceReturnArray, disabled='disabled')  {
		function goDeep(e) {return !e.disabled && !e.has$Class(disabled);}
		const selected=this.getElements( elmnt => {
				if (!elmnt.disabled  &&  elmnt.checked)  switch (elmnt.type)  {
				case 'radio':  goDeep.doContinue=false;
				case 'checkbox':  return true;  }  },
			goDeep);
		return asArray(selected, forceReturnArray);  }

	Fieldset.prototype.setSelected=function(value, forceReturnArray, disabled='disabled') {
		function goDeep(e) {return !e.disabled && !e.has$Class(disabled);}
		const selected=this.getElements( elmnt => {
				if (!elmnt.disabled)  switch (elmnt.type)  {
				case 'radio':  goDeep.doContinue=false;
				case 'checkbox':  return elmnt.checked=(value.includes(elmnt.value));  }  },
			goDeep);
		return asArray(selected, forceReturnArray);  }

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

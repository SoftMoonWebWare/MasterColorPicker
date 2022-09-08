//  character encoding: UTF-8 UNIX   tab-spacing: 2 ¡important!   word-wrap: no   standard-line-length: 160

// Picker.js  Beta-4.0.6   August 6, 2022  by SoftMoon-WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2014, 2015, 2019, 2020, 2022 Joe Golembieski, SoftMoon-WebWare

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

// requires SoftMoon-WebWare’s +++.js package.
// requires SoftMoon-WebWare’s UniDOM-2020 package.


/*   The SoftMoon property is usually a constant defined in a “pinnicle” file somewhere else
if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')   SoftMoon.WebWare=new Object;
*/

								 // ¡!YO!¡ \\
								//  ↓    ↓  \\
//  ********  be SURE to READ the comments on applied classNames just below the Picker constructor function  **********

'use strict';

;(function Picker_NS() {  // create a private namespace for the Picker class

//********* Picker constructor ************\\
// the “mainPanel” should •be 1 or •wrap 1 or more
//    “picker” DOM Elements→ className = PickerInstance.classNames.picker,
//    each Element being a separate picker (note also the picker_select option below).
// “opts.picker_select” optional - should be a <select> tag or an Array of <input type='checkbox|radio' />
//    to choose which picker is “active” (using PickerInstance.classNames.activePicker);
//    or null may be passed in and all pickers will be considered “active” when the picker-interface is active.
// “opts.pickFilter” optional - may be a function, an Object with an “onPick” method, or an Array of these to supplement (or replace by returning false)
//    the standard “PickerInstance.pick” function.  The function will be a method of the Picker instance, but the Object.onPick will be a method of the Object.
// “opts.masterDataTarget” optional - may be a DOM Element which will *always* receive the value picked
//    by the Picker, unless picker is activated using  PickerInstance.setActivePickerState(true, dataTarget)
//    and when this dataTarget relinquishes focus, the picker reverts back to using the “masterDataTarget”
// “opts.classNames” optional - may be an Object with properties to replace the implementation level of
//    the standard-default Picker.CLASSNAMES
// “opts.doKeepInterfaceFocus” optional - Boolean ← ¿do interface elements keep focus when the ENTER key is pressed?
//    if not focus is returned to the dataTarget
//    you can also control this value globally through the prototype
// if “registerPanel” is not true, you can register individual “interfaceElements” before registering the “mainPanel”
// (so you can set individual TAB-control and interfaceTarget properties without needing to touch the HTML markup)
// but you must then be sure to register the mainPanel “manually” after registering the specific “interfaceElements”.
SoftMoon.WebWare.Picker=Picker;
function Picker(mainPanel, opts)  {
	if (!new.target)  throw new Error("Picker is a constructor, not a function.");
	if (!UniDOM.isElement(mainPanel))  throw new TypeError("Picker mainPanel must be a DOM Element Node.");

	this.mainPanel=mainPanel;
	this.panels=new UniDOM.ElementArray(false);
	this.pickers=new UniDOM.ElementArray(false);
	this.pickerActiveFlag=false;
	this.interfaceActiveFlag=false;
	this.dataTarget=null;
	this.masterTarget=null;
	this.registeredTargets=new UniDOM.ElementArray(false);
	this.pickFilters=new Array;
	this.ATTRIBUTE_NAMES=Object.create(Picker.ATTRIBUTE_NAMES);
	this.classNames=Object.create(Picker.CLASSNAMES);

	if (typeof opts === 'object')  {

		if (opts.picker_select)  {
			if ((UniDOM.isElement(opts.picker_select)  &&  opts.picker_select.nodeName==='SELECT')
			||  (opts.picker_select instanceof Array
					&&  opts.picker_select.length
					&&  opts.picker_select.every(e => UniDOM.isElement(e)  &&
																						e.nodeName==='INPUT'  &&
																						(e.type==='checkbox' ||  e.type==='radio'))))  {
				if (opts.picker_select.nodeName==='SELECT')  {
					this.picker_select=UniDOM.addPowerSelect(opts.picker_select);
					for (const opt of this.picker_select.options)  {
						if (opt.value === undefined)  opt.value=opt.text;  }  }
				else  this.picker_select=(new UniDOM.ElementArray).concat(opts.pickerSelect);
				UniDOM.addEventHandler(this.picker_select, 'onchange', () => {
					this.choosePicker(this.classNames.activePicker, null, this.pickerActiveFlag);
					this.choosePicker(this.classNames.activePickerInterface, null, this.interfaceActiveFlag);  });
				this.picker_select.isChosenPicker=function(picker)  {
					return this.getSelected(true).some(e => picker.id===e.value.replace( /\s/g , ""));  }  }

			else  throw new TypeError("picker_select must be a DOM <select> Element Node or an Array of DOM <input type='checkbox|radio'> Element Nodes");  }

		if (!(opts.pickFilters instanceof Array))  opts.pickFilters=[opts.pickFilters];
		for (let i=0; i<opts.pickFilters.length; i++)  {
			if (typeof opts.pickFilters[i] === 'function')  this.pickFilters.push(opts.pickFilters[i]);
			else if (opts.pickFilters[i])  throw new TypeError("Picker “opts.pickFilters["+i+"]” must be a function");  }

		if (opts.masterDataTarget)  {
			this.dataTarget=opts.masterDataTarget;
			this.masterTarget=opts.masterDataTarget;  }

		if (opts.classNames)  { const errTxt="Picker “classNames” Object is invalid.";
			if (typeof opts.classNames !== 'object')  throw new TypeError(errTxt);
			for (const p in Picker.CLASSNAMES)  { if (opts.classNames[p] !== undefined)  {
				if (typeof opts.classNames[p] !== 'string'
				&&  (p!=='picker'  ||  !(opts.classNames[p] instanceof RegExp)))
					throw new TypeError(errTxt+" ClassNames must be strings; except “picker” may be a Regular Expression.");
				this.classNames[p]=opts.classNames[p];  }  }  }

		if ('doKeepInterfaceFocus' in opts)  this.doKeepInterfaceFocus=opts.doKeepInterfaceFocus;  }

	if (opts?.registerPanel!==false)  this.registerInterfacePanel(mainPanel, opts?.panelOpts);  }



								 // ¡!YO!¡ \\
								//  ↓    ↓  \\
//these are default class names.  Changing them changes the values for all future Pickers created.
//Pass in opts.classNames when creating a Picker for instance-based class names; or modify  yourInstance.classNames

//Content within a pickerPanel including the Pickers themselves should not use scroll-bars;
//  the mainPanel or other panels should scroll if necessary.
//This is required to keep focus on the targetElement when the scroll-bars are clicked-on without blocking a click on the Picker.
Picker.CLASSNAMES={
	picker: 'picker',/*see ‡NOTE‡ below*/      // ← the className that needs to be applied to all pickers in all panels
	pickerPanel: 'pickerPanel',                // ← applied to the mainPanel and any other registered panels
	selectedPicker: 'selectedPicker',          // ← applied to a picker when it is selected
	activePicker: 'activePicker',              // ← applied to:  ((active means the dataTarget input has focus))
																						 //   • a picker when it is selected and active
																						 //   • all panels when a picker is active
	activePickerInterface: 'activePickerInterface',  // ← applied to:
																						 //   • the selected picker(s) when any interfaceElement has focus
																						 //     (an interfaceElement is an element in your picker
																						 //      or one of the panels, that the user modifies and therefore requires
																						 //      “focus” — <input type='(most but not all)' /> <textarea> <select> —
																						 //      to adjust the picker itself and/or its choices;
																						 //      see “registerInterfacePanel” below)
	activeInterfaceElement: 'activeInterfaceTarget', // ← applied to an interfaceTarget when it has focus
	activeInterface: 'activeInterface',        // ← applied to:
																						 //   • all panels when any one of the interfaceElements has focus
																						 //   • an interfaceElement when it has focus
	activePanel: 'activePickerPanel',          // ← applied to a panel when
																						 //   • it is the top panel and the dataTarget has focus (is active)
																						 //   • it is the top panel and one of its interfaceElements has focus
	topPanel: 'topPickerPanel',                // ← applied to a panel when it is the top panel; see also “panel level” below.
	panelLevel: 'pickerPanelZLevel' };    // ← panelZLevel will be post-fixed with a digital level (1 – ∞, 1 at the bottom)
			// representing a CSS z-index level (like this:  div.pickerPanelZLevel1 {z-index: 1}   ← of course use your own z-index values as needed……and any element, not only <div>
			//																							 div.pickerPanelZLevel2 {z-index: 2}   etc… … …)
			// **when you have more than one panel (mainPanel + others)** clicking on a panel brings it to the top level.
			// These ZLevel classNames are applied automatically to →→ all ←← panels when you:
			//   • pass in a mainPanel with “opts.registerPanel!==false” as you create a new PickerInstance
			//   • register a panel (see:  Picker.prototype.registerInterfacePanel  below)
			//   • click on any registered panel
			// Initially, the mainPanel is at the top, and the sub-panels are arranged last-registered at the bottom.
// ‡NOTE‡ all classNames must be simple strings
//  EXCEPT:  “classNames.picker”  MAY BE ANY VALUE ↓ LEGAL FOR →  UniDOM.has$Class()
//  • a string or a regular expression
//  • a “logic” array of strings, regular expressions, and/or nested “logic” arrays


	// ↓ for “simulating” a double-click, triple-click, etc.,
	// ↓ when a buttonpress event is generated by the enter-key,
	// ↓ and it is pressed x times in this many milliseconds
Picker.prototype.enterKeyPressRepeatTimeoutDelay=1000;
	// ↓ Boolean ← ¿do InterfaceElements (input-type=text for example) keep focus by default when the ENTER key is pressed?  =false → the data/master target is focused instead
	// ↓  the InterfaceElement may have an attribute 'keep-focus' —  ===true when value undefined; or the value is evaluated by Boolean.eval()
Picker.prototype.doKeepInterfaceFocus=false;

/* In previous versions, only QUERTY keyboards were supported, and you could avoid pressing  SHIFT  with  CTRL  ,<  .>
	To support other keyboards, that convenience is now gone.
	Also, now we are forced to accept that some OSs will generate different key values with the CTRL key pressed
	and we will then not be able to tab to other panels with these default values.
	Still stuck in the “not enough mid-level support in events” rut………
	…Would love to use the ← → keys (with CTRL) instead, but the browser uses them.
	You can customize these keys for your keyboard through this prototype or after you create a picker instance
	(see UniDOM, & the function  keyDownOnInterfaceElement  below).
	Note for now, the CTRL key must be pressed for panel-tabbing to work if you customize these keys – it is hardcoded into the function itself.
	These keys defined ↓ below ↓ control tabbing •from the data-target to the picker-select or a panel, or •from one panel to another
*/
Picker.prototype.panelTabKey=new UniDOM.KeySniffer('>', undefined, true, false, false, false, false);
Picker.prototype.panelBacktabKey=new UniDOM.KeySniffer('<', undefined, true, false, false, false, false);
                                                  //   key  shift      ctrl  alt    meta   altGraph  OS

Picker.prototype.setTopPanel=function setTopPanel(panel, rotate)  {
	if (panel===this.panels[this.panels.length-1])  return;
	if (typeof rotate === 'number')  this.panels=this.panels.slice(rotate).concat(this.panels.slice(0, rotate));
	if (panel)  {
		const i=this.panels.indexOf(panel);
		if (i>=0)  this.panels.splice(i, 1);
		this.panels.push(panel);  }  // note that if “panel” was never registered, it will be added to the “panels” array
	for (var i=0; i<this.panels.length; i++)  {
		UniDOM.generateEvent(this.panels[i], 'pickerPanelZLevelChange',
			{bubbles:true}, {Picker: this, newTopPanel: panel, currentLevel: i, rotate: rotate});  }
	const rc=RegExp('\\b(' + this.classNames.panelLevel + '[0-9]+|' + this.classNames.topPanel + '|' + this.classNames.activePanel + ')\\b', 'g');
	for (i=0; i<this.panels.length; i++)  {
		UniDOM.swapOut$Class(this.panels[i], rc, this.classNames.panelLevel+String(i+1));  }
	const tc=[this.classNames.topPanel];
	if (this.pickerActiveFlag  ||  this.interfaceActiveFlag)  tc.push(this.classNames.activePanel);
	UniDOM.addClass(this.panels[i-1], tc);  }



// MSIE9 (and most likely previous versions) fail to trigger an onblur event for the target element under certain
//  circumstances when you click on a scroll-bar within the picker.  {code to handle this has been removed}
Picker.prototype.setActivePickerState=function setActivePickerState(flag, target)  {
// when flag=true, target is:
//                     • an object with a “focus()” method and a “value” property which becomes the “dataTarget”
//                     • a flag when ===false → use the current “dataTarget”
// when flag=false, target is a flag → true=“revert to masterTarget”  false=“retain dataTarget”
	if (!flag  &&  this.interfaceActiveFlag   &&  this.interfaceElement)
		this.setActiveInterfaceState(false, this.interfaceElement);
	const wasActive=this.pickerActiveFlag;
	this.pickerActiveFlag=flag;
	if (target)  this.dataTarget=(flag ? target : this.masterTarget);
	if (flag  &&  this.dataTarget.pickerContainer)  {
		if (typeof this.dataTarget.pickerContainer==='string')
			document.getElementById(this.dataTarget.pickerContainer).appendChild(this.mainPanel);
		else  this.dataTarget.pickerContainer.appendChild(this.mainPanel);  }
	this.choosePicker(this.classNames.activePicker, null, flag);
	this.setTopPanel();
	for (const panel of this.panels)  {
		UniDOM.useClass(panel, this.classNames.activePicker, flag);
		UniDOM.generateEvent(panel, 'pickerStateChange',
			{bubbles:true}, {pickerStateFlag: flag,  oldState: wasActive,  Picker: this,  currentDataTarget: target});  }
	if (this.onPickerStateChange)  this.onPickerStateChange(flag, wasActive, target);  }



Picker.prototype.setActiveInterfaceState=function setActiveInterfaceState(flag, target, isInterfaceTarget)  {
	if (flag  &&  !this.pickerActiveFlag   &&  this.masterTarget)
		this.setActivePickerState(true, this.masterTarget);
	if (flag  &&  this.interfaceActiveFlag  &&  target===this.interfaceElement)  return false;  //avoid wasting time
	UniDOM.useClass(target, this.classNames.activeInterface, flag);
	UniDOM.useClass(target, this.classNames.activeInterfaceTarget, flag && isInterfaceTarget);
	if (!flag  &&  target  &&  this.interfaceElement!==target)  return false;  //avoid overlapping events when calling onfocus of one causes onblur of a previous to follow
	const wasActive=this.interfaceActiveFlag;
	this.interfaceActiveFlag=flag;
	this.choosePicker(this.classNames.activePickerInterface, null, flag);
	this.interfaceElement= flag ? target : undefined;
	this.interfaceTarget= (flag  &&  isInterfaceTarget) ? target : undefined;
	for (const panel of this.panels)  {
		UniDOM.useClass(panel, this.classNames.activeInterface, flag);
		UniDOM.generateEvent(panel, 'interfaceStateChange',
			{bubbles:true},  {interfaceStateFlag: flag,  oldState: wasActive,  Picker: this,  currentDataTarget: target});	}
	if (this.onInterfaceStateChange)  this.onInterfaceStateChange(flag, wasActive, target);  }



Picker.prototype.choosePicker=function choosePicker(activeClasses, pickerName, flag)  {
	var pickers=new Array;
	for (const panel of this.panels)  {
		let temp=UniDOM.getElementsBy$Class(panel, this.classNames.picker);
		if (temp)  pickers=pickers.concat(temp);  }
	if (pickers.length)  {
		if (activeClasses===undefined)  activeClasses=[this.classNames.activePicker];
		else if (!(activeClasses instanceof Array))  activeClasses=[activeClasses];
		if (typeof flag !== 'boolean')  flag=true;
		if (pickerName  &&  this.picker_select)  this.picker_select.setSelected(pickerName);
		for (const pckr of pickers)  {
			let chosen= (pckr.id==="") || (!this.picker_select) || this.picker_select.isChosenPicker(pckr);
			UniDOM.useClass(pckr, this.classNames.selectedPicker, chosen);
			chosen=flag && chosen;
			for (const cn of activeClasses)  {UniDOM.useClass(pckr, cn, chosen);}
			UniDOM.generateEvent(pckr, 'pickerStateChange', {bubbles:true}, {pickerStateFlag: chosen, classes: activeClasses});  }  }  }



Picker.prototype.pick=function pick(chosen)  {
	chosen=this.applyFilters(...arguments);
	if (chosen===false)  return;
	const currentTarget= this.interfaceTarget || this.dataTarget;
	switch (currentTarget.nodeName)  {
		case '#text':     currentTarget.data=chosen;
		break;
		case 'SELECT':    currentTarget.options[this.currentTarget.options.length]=chosen;
											currentTarget.selectedIndex=currentTarget.options.length-1;
		break;
		case 'TEXTAREA':
			if (currentTarget.getAttribute('type')?.match(/colorPicker/i))
											currentTarget.value=chosen;
			else  					currentTarget.value+=chosen;
		break;
		case 'INPUT':     const dl=document.getElementById(currentTarget.list);
											if (dl)  dl.options[dl.options.length]=chosen;
		default:          currentTarget.value=chosen;  }
	if (UniDOM.isElement(currentTarget))  {
		try {UniDOM.generateEvent(currentTarget, 'onchange', {bubbles:true});}
		catch(err) {console.error(err);};
		try {currentTarget.focus();}
		catch(err) {};  }  }



Picker.prototype.applyFilters=function applyFilters(chosen)  {
	// this worked so easy without strict mode … when chosen referenced arguments[0] …
	for (const filter of this.pickFilters)  {
    if (typeof filter.onPick === 'function')
			arguments[0]=filter.onPick(...arguments);
		else  arguments[0]=filter.apply(this, arguments);  }
	return arguments[0];  }





//You may use this quick utility to register standard event handlers that activate the picker
// when the given <input> element is active (has focus)
//pass in the <input> as the “element”
//if you want the picker to “move” (pop-up, etc) with each <input> registered, include a “PickerContainer” that
// the picker will be inserted into when the given <input> is activated
//  the Element will be a “PickerInstance.dataTarget” when focused
Picker.prototype.registerTargetElement=function registerTargetElement(element, pickerContainer)  {
	// the following two properties are meant to be attached to an <input>, <textarea> etc. (i.e. a “dataTarget”) as event handlers.
	UniDOM.addEventHandler(element, 'onFocus', () => {
		this.setActivePickerState(true, element);  });
	UniDOM.addEventHandler(element, 'tabIn', () => {element.focus();});
	UniDOM.addEventHandler(element, 'onBlur', event => {
		if (!this.isInterfaceElement(event.relatedTarget))  this.setActivePickerState(false, element);  });
	UniDOM.addEventHandler(element, 'onKeyDown', event => {
		goDeep.className=this.classNames.picker;   // see private members below
		goDeep.picker_select=this.picker_select;  //
		var tabTo;
		if ((this.panelTabKey.sniff(event)  ||  (event.ctrlKey  &&  event.key==='Tab'))
		&&  (tabTo=( this.picker_select
							|| this.panels.filter(outDisabled).reverse().getElements(isTabStop, goDeep)[0] )))  {
			event.preventDefault();
			UniDOM.generateEvent(tabTo, 'tabIn', {bubbles:true}, {relatedTarget: event.target, tabbedFrom: event.target});  }  });
	// note the element may have a “data-picker-container” attribute as well!
	if (typeof pickerContainer === 'string'  // ←id of the element; ↓ or the element itself
	||  UniDOM.isElement(pickerContainer))  element.pickerContainer=pickerContainer;
	this.registeredTargets.push(element);  }


Picker.prototype.isInterfaceElement=function(elmnt)  {
	//a previous event may have removed this element from the DOM
	if (elmnt?.parentNode  &&  UniDOM.isElement(elmnt))  {
		if (this.interfaceElements?.includes(elmnt))  return true;
		for (const panel of this.panels)  {if (UniDOM.hasAncestor(elmnt, panel))  return true;}  }
	return false;  }


	//private members for registering “inputs” (TargetElements & InterfaceElements) - to be used with UniDOM’s DOM-crawling methods
	function isInput(e)  {
		return ( e.type!=='hidden'
					 &&  (e.nodeName==='INPUT' || e.nodeName==='SELECT' || e.nodeName==='TEXTAREA' || e.nodeName==='BUTTON') );  }
	function isTabStop(e)  {
		var ti,
				isI=( isInput(e)
						 &&  !e.disabled
						 &&  (!(ti=e.getAttribute('tabIndex')) || parseInt(ti)>=0) );
		if (isI)  goDeep.doContinue=false;
		return isI;  }
	function goDeep(e)  {
		return ( //avoids inputs on non-active pickers
		goDeep.doContinue  // note that UniDOM’s DOM-crawling methods use this property to completely terminate further searching
		&&  (!e.disabled)  // see UniDOM.disable()
		&&  ( e.id==""  ||  !goDeep.picker_select  ||  !UniDOM.has$Class(e, goDeep.className)
			||  goDeep.picker_select.isChosenPicker(e) ) );  }
	function outDisabled(e) {return !e.disabled}

//The functionality of the above private members is exposed here for your convenience as static functions of the Picker Class,
// but changing these Picker properties will not effect the Picker's performance.
Picker.isInput=isInput;
Picker.isTabStop=isTabStop;
Picker.goDeep=goDeep;

Picker.is_UserData_InputType=is_UserData_InputType;
function is_UserData_InputType(e)  { return (
				e.type!=='hidden'
		&&  (e.nodeName==='SELECT'
			|| e.nodeName==='TEXTAREA'
			|| (e.nodeName==='INPUT' && inpTypes.includes(e.type))
/*
 *   this is a hang-up: with it, browser(s) now fail to keep focus on the target due to event.preventDefault();
 *   without it, you can not focus an <input> by clicking on its label
			|| (e.nodeName==='LABEL' && has_UserData_InputType(e))
 */
			) );  }
function has_UserData_InputType(e)  {
	function hasit(c) {const isit=is_UserData_InputType(c);  if (isit) UniDOM.alwaysTrue.doContinue=false;  return isit;}
	return UniDOM.getElements(e, hasit, UniDOM.alwaysTrue)[0];  }

const inpTypes=[
		'text', 'search', 'tel', 'url', 'email', 'password', 'datetime', 'datetime-local',
		 'date', 'month', 'week', 'time', 'number', 'color', 'file', 'range' ];
Object.freeze(inpTypes);
Object.defineProperty(is_UserData_InputType, 'inpTypes', {value: inpTypes, enumerable:true});


/* If you want to use an input or select that requires “focus” as an interface control for your picker (i.e., your
		picker may be dynamic, and the user may control this dynamism using HTML form elements either integrated into
		the picker HTML itself or elsewhere in the document), this will take focus away from the target input (or whatever you use).
		Without registering your interface control, the Picker Class will loose track of whether to show the picker, etc.
	 So for every <input /> (type = text, number, file, etc: any that requires or accepts keyboard input)
		and every <textbox> and every <select> that is an interface control for your picker, use the method below.
	 Checkboxes, radio buttons, <input type='range' /> etc. do not require focus,
		and do not strictly need to be registered.
		However, to give them full keyboard access through use of the TAB key,
		they should all be registered with this function.

	 Since the event handlers within alter normal “tab key” functioning, complete tab-control is included.
	 This feature is especially handy with multiple panels that may or not be shown,
	 or with a mainPanel (etc.) that “floats” to multiple different dataTargets’ HTML while another subpanel remains stationary.
	 Trying to manage “tabIndexes” under these conditions is hazardous at best.
	 Using all the Picker methods as prescribed yields the following default user-interface functionality:
	 (note an input is “active” unless it is within a “picker” that is not selected as active)
== TAB | backTAB → from dataTarget  → follows normal HTML DOM form
== ctrlTAB       → from dataTarget  → to the picker_select (if it exists) or to the first active input on the topmost panel
== TAB | backTAB → from interfaceElement  → follows the normal HTML DOM form except:
																				•the first interfaceElement on a panel backTABs to the dataTarget
																				•the last interfaceElement on a panel TABs to the dataTarget
== ctrlTAB       → from interfaceElement  → to the first active input on the second-from-topmost panel (and the current-topmost panel is sent to the bottom)
== ctrlbackTAB   → from interfaceElement  → to the first active input on the bottom panel

	The “actions” object passed in is optional, and may contain the following relevant functions / properties / flags:


	enterKeyed:  «function» enhance the default action of the enter key, or prevent the default Picker action by returning true.
	tabbedOut:   «function» enhance the default action of the tab key, or prevent the default Picker action by returning true.
	tabTo:       «string» ‖ «DOM_Element» tab key sends focus here.
								«string» may be a “DOM Element id” or a JavaScript expression that evaluates to a “DOM ELement.”
								This may be overridden or replaced using an HTML attribute “tabTo” in the interface-control element
								with values similar to «string».
	backTabTo:   «string» ‖ «DOM_Element» shift-tab key sends focus here.
								«string» may be a “DOM Element id” or a JavaScript expression that evaluates to a “DOM ELement.”
								This may be overridden or replaced using an HTML attribute “backTabTo” in the interface-control element
								with values similar to «string».
	tabToTarget: «Boolean» tab key returns focus to the target (input) element, instead of the default of passing focus
								to the “next” focus-able form element.
								This may be overridden or replaced using an HTML attribute “tabToTarget” in the interface-control element
								with values of 'true' or 'false'.
	backtabToTarget: «Boolean» shift-tab key returns focus to the target (input) element, instead of the default of passing focus
								to the “previous” focus-able form element.
								This may be overridden or replaced using an HTML attribute “backtabToTarget” in the interface-control element
								with values of 'true' or 'false'.
	onchange:    «function» enhance the default action of the Picker onchange method, or prevent the default Picker action by returning true.
 */
// If you ever want to manually focus an InterfaceElement, you should generate a “tabin” event on it.
// NOTE do NOT use this method for Interface-Elements in a registered Picker-Panel, only “lone-wolf” elements
Picker.prototype.registerInterfaceElement=function registerInterfaceElement(element, actions)  {
	if (this.interfaceElements instanceof Array)  {
		if (this.interfaceElements.includes(element))  return;  }  //prevent multiple-registration
	else  this.interfaceElements=new UniDOM.ElementArray;
	this.interfaceElements.push(element);
	const isTarget=Boolean.eval(element.getAttribute(this.ATTRIBUTE_NAMES.interfaceTarget), null);
	if (isTarget  ||  (actions?.interfaceTarget  &&  isTarget!==false))  {
		if (!(this.interfaceTargets instanceof Array))  this.interfaceTargets=new UniDOM.ElementArray;
		this.interfaceTargets.push(element)  }

	const isUserdataInputType=is_UserData_InputType(element);  //note that “Data” is capitaliized in the Function name, not the result’s name

	registerInterfaces.call(this, element, actions, isUserdataInputType);  }



//  private METHOD of a Picker-instance
function registerInterfaces(element, actions, isUserdataInputType)  {  //element may be an INPUT (etc.) or a whole panel
	const PickerInstance=this;

	var tabbedOut, enterKeyed, selectPan, escaped;

	if (isUserdataInputType)  {  // these can be focused with the mouse or the TAB key
		UniDOM.addEventHandler(element, 'onFocus',  focusOnInterfaceElement);
		UniDOM.addEventHandler(element, 'tabIn', tabIntoUserdataInputType);  }
	else if (isInput(element))  // what is left can only be focused with the TAB key (checkbox | radio)
		UniDOM.addEventHandler(element, 'tabIn', tabIntoInterfaceElement);
	else  {  // these are panels and do not themselves focus
		UniDOM.addEventHandler(element, 'tabIn', function tabIntoPanel(event)  {
			if (is_UserData_InputType(event.target))  tabIntoUserdataInputType(event);
			else tabIntoInterfaceElement(event);  });
		UniDOM.addEventHandler(element, 'focusIn', function focusInInPanel(event)  {
			if (is_UserData_InputType(event.target))  focusOnInterfaceElement(event);  });  }

	UniDOM.addEventHandler(element, 'change', function refocusFileInput()  {
		if (event.target.type==='file')  {
			PickerInstance.setActivePickerState(true);
			event.target.focus();  }  });

// If you ever want to manually focus an InterfaceElement, you should generate a “tabin” event on it
// unless it is guaranteed to already be displayed to the user.
	function focusOnInterfaceElement(event)  {
		const
			flag=Boolean.eval(event.target.getAttribute(PickerInstance.ATTRIBUTE_NAMES.interfaceTarget, null)),
			thisPanel=UniDOM.getAncestorBy$Class(event.target, PickerInstance.classNames.pickerPanel);
		PickerInstance.setActiveInterfaceState(true, event.target, (flag || (actions?.interfaceTarget && flag!==false)));
		if (thisPanel)  PickerInstance.setTopPanel(thisPanel);
		tabbedOut= enterKeyed= selectPan= escaped= false;  }

	function tabIntoUserdataInputType(event) {
		//an element must be displayed to receive focus, so we get a bit redundant
		const
			flag=Boolean.eval(event.target.getAttribute(PickerInstance.ATTRIBUTE_NAMES.interfaceTarget), null),
			thisPanel=UniDOM.getAncestorBy$Class(event.target, PickerInstance.classNames.pickerPanel);
		PickerInstance.setActiveInterfaceState(true, event.target, (flag || (actions?.interfaceTarget && flag!==false)));
		if (thisPanel)  PickerInstance.setTopPanel(thisPanel, event.rotatePanels);
		setTimeout(() => {event.target.focus();}, 0);  }

	function tabIntoInterfaceElement(event) {
		PickerInstance.setActiveInterfaceState(true, event.target);
		const
			thisPanel=UniDOM.getAncestorBy$Class(event.target, PickerInstance.classNames.pickerPanel);
		if (thisPanel) PickerInstance.setTopPanel(thisPanel, event.rotatePanels);
		tabbedOut= enterKeyed= selectPan= escaped= false;
		setTimeout(() => {event.target.focus();}, 0);  }


	UniDOM.addEventHandler(element, 'onkeydown', function keyDownOnInterfaceElement(event)  {
		tabbedOut=(event.key==='Tab'  ||  PickerInstance.panelTabKey.sniff(event)  ||  PickerInstance.panelBacktabKey.sniff(event));
		enterKeyed=(event.key==='Enter');
		selectPan=(event.target.nodeName==='SELECT'  &&  (event.key==='ArrowUp' || event.key==='ArrowDown'));
		escaped=(event.key==='Escape');
		if (tabbedOut)  {
			if (actions?.onTabOut?.(event))  return;
			var tabTo, i;
			const shifted=(event.key==='Tab' && event.shiftKey)  ||  PickerInstance.panelBacktabKey.sniff(event);
			event.preventDefault();
			goDeep.className=PickerInstance.classNames.picker;
			goDeep.picker_select=PickerInstance.picker_select;
			if (event.ctrlKey  //note browsers use CTRL-TAB to switch between open browser tabs - this key-combo is fully blocked to scripts and should be - too easy to spoof “PayPal” if your script opens paypal.com in a new window for a “payment” …
			&&  ( tabTo= PickerInstance.panels.ctrlTabTo  // this property is entirely application controlled; it may be a tabStop or a UniDOM.ElementArray of panel(s) with a tabStop
								||  ( (i=PickerInstance.panels.indexOf(UniDOM.getAncestorBy$Class(event.target, PickerInstance.classNames.pickerPanel))),
											PickerInstance.panels.slice(i+1).concat(PickerInstance.panels.slice(0, i)) ) )
			&&  ( isTabStop(tabTo)  //  ← see private members above  ↓                         ↓          ↓
				 || (tabTo=(shifted ? tabTo : tabTo.reverse()).filter(outDisabled).getElements(isTabStop, goDeep)[0])
				 || (isTabStop(PickerInstance.dataTarget)  &&  (tabTo=PickerInstance.dataTarget))  ) )  {
				UniDOM.generateEvent(tabTo, 'tabIn', {bubbles:true}, {relatedTarget: event.target, tabbedFrom: event.target, rotatePanels: (shifted ? false : i )});
				UniDOM.generateEvent(event.target, 'tabOut', {bubbles:true}, {relatedTarget: tabTo, tabTo: tabTo});
				return;  }
			if ((!shifted
					&&  (tabTo=(event.target.getAttribute(PickerInstance.ATTRIBUTE_NAMES.tabTo)  ||  actions?.tabTo)))
			||  (shifted
					&&  (tabTo=(event.target.getAttribute(PickerInstance.ATTRIBUTE_NAMES.backtabTo)  ||  actions?.backtabTo))))
				try {
					if (typeof tabTo === 'string')  {
						if (tabTo==='{none}')  return;
						tabTo=( event.target.ownerDocument.getElementById(tabTo)
								 || (new Function('event', 'actions', 'return ('+tabTo+');')).call(event.target, event, actions) );  }
					else if (typeof tabTo == 'function')  tabTo=tabTo(event);
					if (UniDOM.isElement(tabTo))  {
						UniDOM.generateEvent(tabTo, 'tabIn', {bubbles:true}, {relatedTarget: event.target, tabbedFrom: event.target});
						UniDOM.generateEvent(event.target, 'tabOut', {bubbles:true}, {relatedTarget: tabTo, tabbedTo: tabTo});
						return;  }  }
				catch(e) {console.error("Custom tab expression failed in Picker’s “interfaceElement.onKeyDown” handler:",e);};
			const
				tabToTarget=Boolean.eval(event.target.getAttribute(PickerInstance.ATTRIBUTE_NAMES.tabToTarget), event.target.hasAttribute(PickerInstance.ATTRIBUTE_NAMES.tabToTarget)),
				backtabToTarget=Boolean.eval(event.target.getAttribute(PickerInstance.ATTRIBUTE_NAMES.backtabToTarget), event.target.hasAttribute(PickerInstance.ATTRIBUTE_NAMES.backtabToTarget));
			if ((!shifted  &&  (tabToTarget  ||  (actions?.tabToTarget  &&  tabToTarget!==false)))
			||  (shifted  &&  (backtabToTarget  ||  (actions?.backtabToTarget  &&  backtabToTarget!==false))))
				try {
					UniDOM.generateEvent(event.target, 'tabOut', {bubbles:true}, {relatedTarget: PickerInstance.dataTarget, tabbedTo: PickerInstance.dataTarget});
					PickerInstance.dataTarget.focus();  // tabIn to a dataTarget does nothing special
					return;  }
				catch(e) {};
			if (tabTo=( shifted ? UniDOM.getElders(event.target, isTabStop, goDeep)[0] : UniDOM.getJuniors(event.target, isTabStop, goDeep)[0]))  {
				UniDOM.generateEvent(tabTo, 'tabIn', {bubbles:true}, {relatedTarget: event.target, tabbedFrom: event.target});
				UniDOM.generateEvent(event.target, 'tabOut', {bubbles:true}, {relatedTarget: tabTo, tabbedTo: tabTo});  }  }
		if (enterKeyed)  {
			enterKeyPressCount++;  clearTimeout(enterKeyPressRepeatTimeout);
			enterKeyPressRepeatTimeout=setTimeout(function() {enterKeyPressCount=0;}, PickerInstance.enterKeyPressRepeatTimeoutDelay);
			if (actions?.onEnterKeyed?.(event))  return;
			if (event.target.nodeName!=='SELECT'  &&  event.target.nodeName!=='TEXTAREA'  &&  event.target.nodeName!=='BUTTON'
			&&  (event.target.nodeName!=='INPUT'
					||  ( event.target.type!=='button'
						&&  event.target.type!=='checkbox'
						&&  event.target.type!=='radio'
						&&  event.target.type!=='range' )) )  {
				event.preventDefault();
				//note below we want to allow other user-added event-handlers to be executed as well…
				UniDOM.generateEvent(event.target, 'change', {bubbles:true}, {enterKeyed: true, keyedCount: enterKeyPressCount});
				enterKeyed=false;
				if ( event.target.hasAttribute('keep-focus') ?
								Boolean.eval(event.target.getAttribute('keep-focus'), true)
							: PickerInstance.doKeepInterfaceFocus )
					{;} //event.target.focus();
				else  try {(PickerInstance.dataTarget || PickerInstance.masterTarget)?.focus();}catch(e){}  }
			else {
				if (event.target.type==='checkbox'  ||  event.target.type==='radio')  {event.target.checked=!event.target.checked;  event.preventDefault();}
				else if (event.target.nodeName==='BUTTON')  {
					UniDOM.generateEvent(event.target, 'buttonpress',
						{bubbles:true, detail: enterKeyPressCount}, {shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey});
					event.preventDefault();  }
				UniDOM.generateEvent(event.target, 'change',
						{bubbles: true}, {enterKeyed: true, keyedCount: enterKeyPressCount, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey});
				}  }
		if (escaped)  {
			if (actions?.onEscape?.(event))  return;
			try {(PickerInstance.dataTarget || PickerInstance.masterTarget)?.focus?.();}catch(e){}  }  } );


	var enterKeyPressCount=0, enterKeyPressRepeatTimeout;

	if (isInput(element))
		UniDOM.addEventHandler(element, 'onBlur', focusOutOfInterfaceElement);
	else
		UniDOM.addEventHandler(element, 'focusOut', function(event)  {
			if (isInput(event.target))  focusOutOfInterfaceElement(event);  });


	function focusOutOfInterfaceElement(event)  {
		if (enterKeyed)  {enterKeyed=false;  event.target.focus();  return;}
		PickerInstance.setActiveInterfaceState(false, event.target);
		if (!tabbedOut  //we can only TAB to other related InterfaceElements
		&&  (!event.relatedTarget  //but we can click anywhere…
			||  ( event.relatedTarget!==PickerInstance.dataTarget
				&&  event.relatedTarget!==PickerInstance.masterTarget ))
		&&  !PickerInstance.isInterfaceElement(event.relatedTarget))
			PickerInstance.setActivePickerState(false);  }


} // close  registerInterfaces()



Picker.prototype.registerInterfacePanel=function(panel, actions)  {
	UniDOM.addClass(panel, this.classNames.pickerPanel);
	this.panels.unshift(panel);
	this.setTopPanel();
	const
		PickerInstance=this,
		pickers=UniDOM.getElementsBy$Class(panel, this.classNames.picker);

	for (const pckr of pickers)  {this.registerPicker(pckr);}

	UniDOM.addEventHandler(panel, 'onClick', clickOnInterfacePanel);
	UniDOM.addEventHandler(panel, 'onMouseDown', mousedownOnInterfacePanel);

	function clickOnInterfacePanel(event)  {
		if (is_UserData_InputType(event.target))  return ;
		if (!document.hasFocus()
		||  (  (!PickerInstance.isInterfaceElement(event.target)  ||  !is_UserData_InputType(event.target))
				&&  !PickerInstance.registeredTargets.includes(document.activeElement)))    {
			setTimeout(function refocusTarget()  { //help Google’s Chrome to keep track of what’s going on by setting a timeout (it has a hard time remembering to make the cursor blink)
				(PickerInstance.interfaceTarget || PickerInstance.dataTarget || PickerInstance.masterTarget)?.focus?.();  },
				0);  }
		if (!PickerInstance.interfaceTarget
		||  !event.target.parentNode  // a previous event-handler may have removed this element from the DOM
		||  !UniDOM.getAncestorBy$Class(event.target, PickerInstance.classNames.picker))
			PickerInstance.setTopPanel(panel);  }

	function mousedownOnInterfacePanel(event)  {
		if (!is_UserData_InputType(event.target))  event.preventDefault();	}

	registerInterfaces.call(this, panel, actions);  }


Picker.prototype.registerPicker=function (picker)  {
	this.pickers.push(picker);  }


})();  // close private namespace for Picker

// using relaxed rules; perhaps you want to prefix "data-" to each
SoftMoon.WebWare.Picker.ATTRIBUTE_NAMES={
	interfaceTarget: 'interfaceTarget',
	tabTo: 'tabTo',
	backtabTo: 'backtabTo',
	tabToTarget: 'tabToTarget',
	backtabToTarget: 'backtabToTarget' }

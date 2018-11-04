// SoftMoon.WebWare.Picker.js Beta-2.5.0 release 1.6.0  March-26-2015  by SoftMoon-WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2014, 2015 Joe Golembieski, SoftMoon-WebWare

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

//  character encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 120

// requires SoftMoon-WebWare’s UniDOM package.

if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')   SoftMoon.WebWare=new Object;

								 // ¡!YO!¡ \\
								//  ↓    ↓  \\
//  ********  be SURE to READ the comments on applied classNames just below the Picker constructor function  **********


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
//    the standard-default SoftMoon.WebWare.Picker.CLASSNAMES
// if “registerPanel” is not true, you can register individual “interfaceElements” before registering the “mainPanel”
// (so you can set individual TAB-control and interfaceTarget properties without needing to touch the HTML markup)
// but you must then be sure to register the mainPanel “manually” after registering the specific “interfaceElements”.
SoftMoon.WebWare.Picker=function(mainPanel, opts)  {
	if (this===SoftMoon.WebWare)  throw new Error("Picker is a constructor, not a function.");
	if (!UniDOM.isElementNode(mainPanel))  throw new Error("Picker mainPanel must be a DOM Element Node.");

	var p, i, PickerInstance=this;

	this.mainPanel=mainPanel;
	this.panels=UniDOM.ElementWrapperArray(false, true);
	this.pickers=UniDOM.ElementWrapperArray(false, true);
	this.pickerActiveFlag=false;
	this.interfaceActiveFlag=false;
	this.mouseOverPickerPanel=false;
	this.mouseOverPanelBody=false;
	this.mouseOverPicker=false;
	this.mouseOverDataTarget=false;
	this.mouseOverInterfaceElement=false;
	this.mouseOverUserdataInterface=false;
	this.dataTargetTabOut=false;
	this.dataTarget=null;
	this.masterTarget=null;
	this.registeredTargets=UniDOM.ElementWrapperArray(false, true);
	this.pickFilters=new Array;
	this.ATTRIBUTE_NAMES=new Object;
	for (p in SoftMoon.WebWare.Picker.ATTRIBUTE_NAMES)  {this.ATTRIBUTE_NAMES[p]=SoftMoon.WebWare.Picker.ATTRIBUTE_NAMES[p];}
	this.classNames=new Object;
	for (p in SoftMoon.WebWare.Picker.CLASSNAMES)  {this.classNames[p]=SoftMoon.WebWare.Picker.CLASSNAMES[p];}

	if (typeof opts == 'object')  {

		if (opts.picker_select)  {
			if ((UniDOM.isElementNode(opts.picker_select)  &&  opts.picker_select.nodeName=='SELECT')
			||  (opts.picker_select instanceof Array
					&&  (function(a)  {
						for (var i=0; i<a.length; i++)  {
							if ( !UniDOM.isElementNode(a[i])
							||  a[i].nodeName!='INPUT'
							||  (a[i].type!='checkbox' && a[i].type!='radio'))
								return false;  }
						return true;  }
						)(opts.picker_select)))  {

				if (opts.picker_select.nodeName=='SELECT')  {
					this.picker_select=UniDOM.addPowerSelect(opts.picker_select);
					for (p=0; p<this.picker_select.options.length;  p++)  {
						if (typeof this.picker_select.options[p].value === 'undefined')
							this.picker_select.options[p].value=this.picker_select.options[p].text;  }  }
				else  this.picker_select=UniDOM.ElementWrapperArray(opts.pickerSelect, false, true);
				UniDOM.addEventHandler(this.picker_select, 'onchange', function() {
					PickerInstance.choosePicker(PickerInstance.classNames.activePicker, null, PickerInstance.pickerActiveFlag);
					PickerInstance.choosePicker(PickerInstance.classNames.activePickerInterface, null, PickerInstance.interfaceActiveFlag);  });
				this.picker_select.isChosenPicker=function(picker)  {
					for (var j=0, pickerNames=this.getSelected(true);  j<pickerNames.length;  j++)  {
						if (picker.id===pickerNames[j].value.replace( /\s/g , ""))  return true;  }
					return false;  }  }

			else  throw new Error("picker_select must be a DOM <select> Element Node or an Array of DOM <input type='checkbox|radio' /> Element Nodes");  }

		if (!(opts.pickFilters instanceof Array))  opts.pickFilters=[opts.pickFilters];
		for (i=0; i<opts.pickFilters.length; i++)  {
			if (typeof opts.pickFilters[i] == 'function')  this.pickFilters.push(opts.pickFilters[i]);
			else if (opts.pickFilters[i])  throw new Error("Picker “opts.pickFilters["+i+"]” must be a function");  }

		if (opts.masterDataTarget)  {
			this.dataTarget=opts.masterDataTarget;
			this.masterTarget=opts.masterDataTarget;  }

		if (opts.classNames)  { var c=0, errTxt="Picker “classNames” Object is invalid.";
			if (typeof opts.classNames != 'object')  throw new Error(errTxt);
			for (p in SoftMoon.WebWare.Picker.CLASSNAMES)  { if (typeof opts.classNames.p != 'undefined')  {
				if (typeof opts.classNames[p] != 'string')  throw new Error(errTxt);
				else  this.classNames[p]=opts.classNames[p];  }  }  }  }

	if (!opts  ||  opts.registerPanel!==false)  this.registerInterfacePanel(mainPanel, opts ? opts.panelOpts : undefined);  }



								 // ¡!YO!¡ \\
								//  ↓    ↓  \\
//these are default class names.  Changing them changes the values for all future Pickers created.
//Pass in opts.classNames when creating a Picker for instance-based class names; or modify  yourInstance.classNames

//Content within a pickerPanel including the Pickers themselves should not use scroll-bars;
//  the mainPanel or other panels should scroll if necessary.
//This is required to keep focus on the targetElement when the scroll-bars are clicked-on without blocking a click on the Picker.
SoftMoon.WebWare.Picker.CLASSNAMES={
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
			// These ZLevel classNames are applied automatically to all panels when you:
			//   • pass in a mainPanel with “registerNow=true” as you create a new PickerInstance
			//   • register a panel (see: SoftMoon.WebWare.Picker.prototype.registerInterfacePanel below)
			//   • click on any registered panel
			// Initially, the mainPanel is at the top, and the sub-panels are arranged last-registered at the bottom.
// ‡NOTE‡ all classNames must be simple strings
//  EXCEPT:  “classNames.picker”  MAY BE ANY VALUE ↓ LEGAL FOR →  UniDOM.hasClass()
//  • a string or a regular expression
//  • a “logic” array of strings, regular expressions, and/or nested “logic” arrays



SoftMoon.WebWare.Picker.prototype.setTopPanel=function(panel, rotate)  {
	if (panel===this.panels[this.panels.length-1])  return;
	if (rotate)  {rotate=this.panels.pop();  this.panels.unshift(rotate);}
	var i=0, tc, rc=RegExp('\\b(' + this.classNames.panelLevel + '[0-9]+|' + this.classNames.topPanel + '|' + this.classNames.activePanel + ')\\b', 'g');
	if (panel)  {
		while (panel!==this.panels[i]  &&  i<this.panels.length)  {i++;}
		this.panels.splice(i, 1);  this.panels.push(panel);  }  // note that if “panel” was never registered, it will be added to the “panels” array
	for (i=0; i<this.panels.length; i++)  {
		UniDOM.swapOutClass(this.panels[i], rc, this.classNames.panelLevel+String(i+1));  }
	tc=[this.classNames.topPanel];
	if (this.pickerActiveFlag  ||  this.interfaceActiveFlag)  tc.push(this.classNames.activePanel);
	UniDOM.addClass(this.panels[i-1], tc);  }



// MSIE9 (and most likely previous versions) fail to trigger an onblur event for the target element under certain
//  circumstances when you click on a scroll-bar within the picker.
SoftMoon.WebWare.Picker.prototype.setActivePickerState=function(flag, target)  {
// when flag=true, target is:
//                     • an object with a “focus()” method and a “value” property which becomes the “dataTarget”
//                     • a flag when ===false → use the current “dataTarget”
// when flag=false, target is a flag → true=“revert to masterTarget”  false=“retain dataTarget”

	if (!this.dataTargetTabOut  &&  this.mouseOverPickerPanel  &&  !flag)  {  //catch a click on a picker scroll-bar
		if (/*!this.mouseOverInterfaceElement  &&*/  !this.mouseOverPanelBody)  {
			var thisTarget= this.interfaceTarget || this.dataTarget;
			setTimeout(function() {try {thisTarget.focus();} catch(e) {}}, 0);  }  //help Google’s Chrome to keep track of what’s going on by setting a timeout (it has a hard time remembering to make the cursor blink)
		return;  }
	if (!this.dataTargetTabOut  &&  this.mouseOverInterfaceElement  &&  !flag)  return;  //for interfaceElements that are not on a panel

	this.dataTargetTabOut=false;
	var wasActive=this.pickerActiveFlag;
	this.pickerActiveFlag=flag;
	if (target)  this.dataTarget=(flag) ? target : this.masterTarget;
	if (flag  &&  this.dataTarget.PickerContainer)  this.dataTarget.PickerContainer.appendChild(this.mainPanel);
	this.choosePicker(this.classNames.activePicker, null, flag);
	this.setTopPanel();
	for (var i=0, PickerInstance=this;  i<this.panels.length;  i++)  {
		UniDOM.useClass(this.panels[i], this.classNames.activePicker, flag);
		UniDOM.generateEvent(this.panels[i], 'onPickerStateChange',
			{canBubble: false,  userArgs: {flag: flag,  oldState: wasActive,  Picker: PickerInstance,  currentDataTarget: target}});  }
	if (this.onPickerStateChange)  this.onPickerStateChange(flag, wasActive, target);  }



SoftMoon.WebWare.Picker.prototype.setActiveInterfaceState=function(flag, target, isInterfaceTarget)  {
	if (flag && this.interfaceActiveFlag && target===this.interfaceElement)  return false;  //avoid wasting time
	UniDOM.useClass(target, this.classNames.activeInterface, flag);
	UniDOM.useClass(target, this.classNames.activeInterfaceTarget, flag && isInterfaceTarget);
	var wasActive=this.interfaceActiveFlag;
	if (!flag && target &&  this.interfaceElement!==target)  return false;  //avoid overlapping events when calling onfocus of one causes onblur of a previous to follow
	this.interfaceActiveFlag=flag;
	this.choosePicker(this.classNames.activePickerInterface, null, flag);
	this.interfaceElement= flag ? target : undefined;
	this.interfaceTarget= (flag && isInterfaceTarget) ? target : undefined;
	for (var i=0;  i<this.panels.length;  i++)  {
		UniDOM.useClass(this.panels[i], this.classNames.activeInterface, flag);
		UniDOM.generateEvent(this.panels[i], 'onInterfaceStateChange',
			{canBubble: false,  userArgs: {flag: flag,  oldState: wasActive,  Picker: this,  currentDataTarget: target}});	}
	if (this.onInterfaceStateChange)  this.onInterfaceStateChange(flag, wasActive, target);  }



SoftMoon.WebWare.Picker.prototype.choosePicker=function(activeClasses, pickerName, flag)  {
	var i, j, chosen, temp, pickers=new Array;
	for (i=0; i<this.panels.length; i++)  {
		if (temp=UniDOM.getElementsByClass(this.panels[i], this.classNames.picker))  pickers=pickers.concat(temp);  }
	if (pickers.length)  {
		if (activeClasses===undefined)  activeClasses=[this.classNames.activePicker];
		else if (!(activeClasses instanceof Array))  activeClasses=[activeClasses];
		if (typeof flag !== 'boolean')  flag=true;
		if (pickerName && this.picker_select)  this.picker_select.setSelected(pickerName);
		for (i=0; i<pickers.length; i++)  {
			chosen= (pickers[i].id=="") || (!this.picker_select) || this.picker_select.isChosenPicker(pickers[i]);
			UniDOM.useClass(pickers[i], this.classNames.selectedPicker, chosen);
			chosen=flag && chosen;
			for (j=0;  j<activeClasses.length;  j++)  {
				UniDOM.useClass(pickers[i], activeClasses[j], chosen);  }
			UniDOM.generateEvent(pickers[i], 'onPickerStateChange', {canBubble: false, userArgs: {flag: chosen, classes: activeClasses}});  }  }  }



SoftMoon.WebWare.Picker.prototype.pick=function(chosen)  {
	chosen=this.applyFilters.apply(this, arguments);
	if (chosen===false)  return;
	var currentTarget= this.interfaceTarget || this.dataTarget;
	switch (currentTarget.nodeName)  {
		case '#text':     currentTarget.data=chosen;
		break;
		case 'SELECT':    currentTarget.options[this.currentTarget.options.length]=chosen;
											currentTarget.selectedIndex=currentTarget.options.length-1;
		break;
		case 'TEXTAREA':  currentTarget.value+=chosen;
		break;
		case 'INPUT':     var dl=document.getElementById(currentTarget.list);
											if (dl)  dl.options[dl.options.length]=chosen;
		default:          currentTarget.value=chosen;  }
	if (UniDOM.isElementNode(currentTarget))  {
		try {UniDOM.generateEvent(currentTarget, 'onchange', {canBubble: false});}
		catch(err) {console.log(err.getMessage());};
		try {currentTarget.focus();}
		catch(err) {};  }  }



SoftMoon.WebWare.Picker.prototype.applyFilters=function(chosen)  {
	// note how “chosen” is a ☆reference☆ to the first member of “arguments” (a special type of array!)
	//  so changing “chosen” modifies “arguments[0]” and visa-versa.
	for (var i=0; i<this.pickFilters.length;  i++)  {
    if (typeof this.pickFilters[i].onPick === 'function')
			chosen=this.pickFilters[i].onPick.apply(this.pickFilters[i], arguments);
		else  chosen=this.pickFilters[i].apply(this, arguments);  }
	return chosen;  }


SoftMoon.WebWare.Picker.prototype.registerPicker=function(picker)  {
	var PickerInstance=this;
	this.pickers.push(picker);
	UniDOM.addEventHandler(picker, 'onmouseover', function() {PickerInstance.mouseOverPicker=this;});
	UniDOM.addEventHandler(picker, 'onmouseout', function() {PickerInstance.mouseOverPicker=false;});  }



;(function() {  //wrap private members: for checking picker selection and for registering “inputs”


//You may use this quick utility to register standard event handlers that activate the picker
// when the given <input> element is active (has focus)
//pass in the <input> as the “element”
//if you want the picker to “move” (pop-up, etc) with each <input> registered, include a “PickerContainer” that
// the picker will be inserted into when the given <input> is activated
SoftMoon.WebWare.Picker.prototype.registerTargetElement=function(element, PickerContainer)  {
	// the following two properties are meant to be attached to an <input>, <textarea> etc. (i.e. a “dataTarget”) as event handlers.
	var PickerInstance=this;
	UniDOM.addEventHandler(element, 'onfocus', function()  {
		PickerInstance.dataTargetTabOut=false;
		PickerInstance.setActivePickerState(true, this);  });
	UniDOM.addEventHandler(element, 'onTabIn', function()  {
		this.focus();  });
	UniDOM.addEventHandler(element, 'onblur', function()  {
/*
		if (!PickerInstance.dataTargetTabOut
		&&  PickerInstance.mouseOverPickerPanel
		&&  !PickerInstance.mouseOverInterfaceElement)
			setTimeout(function() {console.log('refocus');  this.focus();}, 0);
		else
*/
		if (!PickerInstance.interfaceActiveFlag)  PickerInstance.setActivePickerState(false, this);  });
	UniDOM.addEventHandler(element, 'onMouseOver', function() {PickerInstance.mouseOverDataTarget=this;});
	UniDOM.addEventHandler(element, 'onMouseOut', function() {PickerInstance.mouseOverDataTarget=false;});
	UniDOM.addEventHandler(element, 'onKeyDown', function(event)  { var tabTo;
		PickerInstance.dataTargetTabOut=false;
		goDeep.className=PickerInstance.classNames.picker;   // see private members below
		goDeep.picker_select=PickerInstance.picker_select;  //
		if (event.ctrlKey  &&  (event.keyCode===9 || event.keyCode===190)  //TAB key  or  .> key
		&&  (tabTo=( PickerInstance.picker_select
							|| UniDOM.ElementWrapperArray(PickerInstance.panels.reverse())._.filter(outDisabled)._.getElements(isTabStop, goDeep)[0] )))  {
			event.preventDefault();
			PickerInstance.interfaceActiveFlag=true;
			tabTo.focus();  }
		if (event.keyCode===9)  PickerInstance.dataTargetTabOut=true;  });
	element.PickerContainer=UniDOM.isElementNode(PickerContainer) ? PickerContainer : false;
	this.registeredTargets.push(element);  }



	//private members for registering “inputs” (TargetElements & InterfaceElements) - to be used with UniDOM.getElements()
	function isInput(e)  {
		return ( e.nodeType===1  &&  e.type!=='hidden'
					 &&  (e.nodeName==='INPUT' || e.nodeName==='SELECT' || e.nodeName==='TEXTAREA' || e.nodeName==='BUTTON') );  }
	function isTabStop(e)  {
		var ti,
				isI=( isInput(e)  &&  !e.disabled  &&  (!(ti=e.getAttribute('tabIndex')) || parseInt(ti)>=0) );
		goDeep.doContinue=!isI;
		return isI;  }
	function goDeep(e)  { return ( //avoids inputs on non-active pickers
		arguments.callee.doContinue  // note that getElements() uses this property to completely terminate further searching
		&&  !e.disabled              // see UniDOM.disable()
		&&  ( e.id==""  ||  !arguments.callee.picker_select  ||  !UniDOM.hasClass(e, arguments.callee.className)
			||  arguments.callee.picker_select.isChosenPicker(e) ) );  }
	function outDisabled(e) {return !e.disabled}


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
SoftMoon.WebWare.Picker.prototype.registerInterfaceElement=function(element, actions)  {
	if (this.interfaceElements instanceof Array)  { for (var i=0; i<this.interfaceElements.length; i++)  {
		if (this.interfaceElements[i]===element)  return;  }  } //prevent multiple-registration
	else  this.interfaceElements=new Array;
	this.interfaceElements.push(element);
	if ((actions && actions.interfaceTarget  &&  this.getAttribute(this.ATTRIBUTE_NAMES.interfaceTarget)!=='false')
	||  element.getAttribute(this.ATTRIBUTE_NAMES.interfaceTarget)==='true')  {
		if (this.interfaceTargets instanceof Array)  this.interfaceTargets.push(element)
		else  this.interfaceTargets=[element];  }
	var tabbedOut, enterKeyed, selectPan, PickerInstance=this,
			inpTypes=[
		'text', 'search', 'tel', 'url', 'email', 'password', 'datetime', 'date',
		'month', 'week', 'time', 'datetime-local', 'number', 'color', 'file' ];

	var isUserdataInputType= (function()  {
		if (element.nodeName==='BUTTON')  return false;
		if (element.nodeName!=='INPUT')  return true;   //select, textarea, [contentEdible]
		for (var j=0; j<inpTypes.length; j++)  {if (element.type===inpTypes[j])  return true;}
		return false;  })();

	UniDOM.addEventHandler(element, 'onMouseOver', function() {PickerInstance.mouseOverInterfaceElement=this;});
	UniDOM.addEventHandler(element, 'onMouseOut', function() {PickerInstance.mouseOverInterfaceElement=false;});

 if (isUserdataInputType)  {
	UniDOM.addEventHandler(element, 'onMouseOver', function() {PickerInstance.mouseOverUserdataInterface=this;});
	UniDOM.addEventHandler(element, 'onMouseOut', function() {PickerInstance.mouseOverUserdataInterface=false;});  }

 if (isUserdataInputType)
	UniDOM.addEventHandler(element, 'onClick', function(event)  {
		tabbedOut= enterKeyed= selectPan= false;
		event.stopPropagation();  });  //clicking on a picker-panel normally causes PickerInstance.dataTarget.focus();

 if (isUserdataInputType)  {
	UniDOM.addEventHandler(element, 'onFocus', function(event)  {
		PickerInstance.setActiveInterfaceState(true, this,
			((actions && actions.interfaceTarget  &&  this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.interfaceTarget)!=='false')
			 ||  this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.interfaceTarget)==='true') );
		var thisPanel=UniDOM.getAncestorByClass(this, PickerInstance.classNames.pickerPanel);
		if (thisPanel)  PickerInstance.setTopPanel(thisPanel);
		PickerInstance.event=false;
		tabbedOut= enterKeyed= selectPan= false;  } );
	UniDOM.addEventHandler(element, 'onTabIn', function(event) {
		//an element must be displayed to receive focus, so we get a bit redundant
		PickerInstance.setActiveInterfaceState(true, this,
			((actions && actions.interfaceTarget  &&  this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.interfaceTarget)!=='false')
			 ||  this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.interfaceTarget)==='true') );
		var newFocus=this,
				thisPanel=UniDOM.getAncestorByClass(this, PickerInstance.classNames.pickerPanel);
		if (thisPanel)  PickerInstance.setTopPanel(thisPanel, event.rotatePanels);
		setTimeout(function() {newFocus.focus();}, 0);  });  }
 else
	UniDOM.addEventHandler(element, 'onTabIn', function(event) {
		PickerInstance.setActiveInterfaceState(true, this);
		var newFocus=this,
				thisPanel=UniDOM.getAncestorByClass(this, PickerInstance.classNames.pickerPanel);
		if (thisPanel)  PickerInstance.setTopPanel(thisPanel, event.rotatePanels);
		PickerInstance.event=false;
		setTimeout(function() {newFocus.focus();}, 0);  });

	UniDOM.addEventHandler(element, 'onkeydown', function(event)  {
		//note older versions of Chrome do not trigger key events for <select> elements -  it does now
		PickerInstance.event=event;                         //            === ,<                 === .>
		tabbedOut=(event.keyCode===9  ||  (event.ctrlKey && (event.keyCode===188 || event.keyCode===190)));
		var shifted=event.shiftKey  ||  (event.ctrlKey && event.keyCode===188);
		enterKeyed=(event.keyCode===13);         //            === ↑                 === ↓
		selectPan=(this.nodeName==='SELECT'  &&  (event.keyCode===38 || event.keyCode===40));
		if (tabbedOut)  { var tabTo, panel;
			if (actions && actions.tabbedOut && actions.tabbedOut(event))  return;
			event.preventDefault();
			goDeep.className=PickerInstance.classNames.picker;
			goDeep.picker_select=PickerInstance.picker_select;
			if (event.ctrlKey
			&&  (tabTo= ((PickerInstance.panels.length<2) ?  PickerInstance.dataTarget  :  PickerInstance.panels.slice(0, -1)))//.filter(outDisabled)))
			&&  ( isTabStop(tabTo)                              //  ←  see private members above  ↓                          ↓          ↓
				 || (tabTo=UniDOM.ElementWrapperArray(shifted ? tabTo : tabTo.reverse())._.filter(outDisabled)._.getElements(isTabStop, goDeep)[0]) ) )  {
				UniDOM.generateEvent(tabTo, 'onTabIn', {canBubble:false, userArgs:{rotatePanels: !shifted}});
				UniDOM.generateEvent(this, 'onTabOut', {canBubble:false});
				return;  }
			if ((!shifted
					&&  (tabTo=((this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.tabTo)==null  &&  actions  &&  actions.tabTo)
										||  (this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.tabTo)))))
			||  (shifted
					&&  (tabTo=((this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.backtabTo)==null  &&  actions  &&  actions.backtabTo)
										||  (this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.backtabTo))))))
				try {
					if (typeof tabTo == 'string')
						tabTo=( this.ownerDocument.getElementById(tabTo)
								 || (new Function('event', 'actions', 'return ('+tabTo+');')).call(this, event, actions) );
					else if (typeof tabTo == 'function')  tabTo=tabTo(event);
					if (UniDOM.isElementNode(tabTo))  {
						UniDOM.generateEvent(tabTo, 'onTabIn', {canBubble:false});
						UniDOM.generateEvent(this, 'onTabOut', {canBubble:false});
						return;  }  }
				catch(e) {console.log("Custom tab expression failed in SoftMoon.WebWare.Picker’s “interfaceElement.onKeyDown” handler:\n"+e.message);};
			if ((!shifted
					&&  ((actions  &&  actions.tabToTarget  &&  this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.tabToTarget)!=='false')
							||  (this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.tabToTarget)==='true')))
			||  (shifted
					&&  ((actions  &&  actions.backtabToTarget  &&  this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.backtabToTarget)!=='false')
							||  (this.getAttribute(PickerInstance.ATTRIBUTE_NAMES.backtabToTarget)==='true'))))
				try {
					UniDOM.generateEvent(this, 'onTabOut', {canBubble:false});
					PickerInstance.dataTarget.focus();
					return;  }
				catch(e) {};
			if (tabTo=( shifted ? UniDOM.getElders(this, isTabStop, goDeep)[0] : UniDOM.getJuniors(this, isTabStop, goDeep)[0]))  {
				UniDOM.generateEvent(tabTo, 'onTabIn', {canBubble:false});
				UniDOM.generateEvent(this, 'onTabOut', {canBubble:false});  }  }
		if (enterKeyed)  {
			if (actions && actions.enterKeyed && actions.enterKeyed(event))  return;
			if (this.nodeName!=='SELECT')  {
				event.preventDefault();
				//note below we want to allow other user-added event-handlers to be executed as well…
				UniDOM.generateEvent(this, 'onchange', {canBubble: false, userArgs: {flag: true}});
				enterKeyed=false;
				PickerInstance.event=false;
				this.focus();  }  }  } );

 if (isUserdataInputType)
	UniDOM.addEventHandler(element, 'onchange', function(event)  {
		var key=PickerInstance.event && PickerInstance.event.keyCode;
		if ((key && !tabbedOut && !enterKeyed)
		||  actions && actions.onchange && actions.onchange(event, enterKeyed, tabbedOut, selectPan))  return;
		if ((!enterKeyed  &&  !selectPan)  &&  PickerInstance.pickerActiveFlag)  {
			if (!PickerInstance.mouseOverUserdataInterface  &&  !tabbedOut)
				setTimeout(function() {try {PickerInstance.dataTarget.focus();} catch(e) {};}, 0);  }  } );  //help Google’s Chrome to keep track of what’s going on by setting a timeout (it has a hard time remembering to make the cursor blink)

	UniDOM.addEventHandler(element, 'onkeyup', function()  {PickerInstance.event=false;});

 if (isUserdataInputType)
	UniDOM.addEventHandler(element, 'onblur', function(event)  {
		PickerInstance.event=false;
		if (enterKeyed)  {enterKeyed=false;  this.focus();  return;}
		if (PickerInstance.interfaceTarget===this  &&  !tabbedOut
		&&  PickerInstance.mouseOverPicker  &&  !PickerInstance.mouseOverUserdataInterface)  {
			thisInput=this;
			setTimeout(function() {thisInput.focus();}, 0);  //help Google’s Chrome to keep track of what’s going on by setting a timeout (it has a hard time remembering to make the cursor blink)
			return;  }
		PickerInstance.setActiveInterfaceState(false, this);
		if (!tabbedOut
		&& !PickerInstance.mouseOverPickerPanel && !PickerInstance.mouseOverInterfaceElement && !PickerInstance.mouseOverDataTarget)
			PickerInstance.setActivePickerState(false);  } );
 else
	UniDOM.addEventHandler(element, ['onblur'], function(event)  {   // , 'onTabOut'
		PickerInstance.event=false;
		PickerInstance.setActiveInterfaceState(false, this);  } );  }
// Note we do NOT set the “activePickerState” to false because by default the Picker is designed to work as follows:
// • ASSUME all interfaceElements reside on registered panels;
// • when registering the panels, the default action is to cause the first and last interfaceElements to (back)tabToTarget;
// BUT these conditions are not required.
// If you individually register interfaceElements that are off of a pickerPanel without appropriate “(back)tabTo”
// attributes, and/or otherwise allow them to tab from/to other off-picker form elements,
// then you should be sure to manually generate an "onTabIn" event from off-picker form elements as appropriate,
// and/or add an additional "onTabOut" to this interfaceElement as similar follows:
/*
	UniDOM.addEventHandler(element, 'onTabOut', function() {PickerInstance.setActivePickerState(false, this);});
*/



SoftMoon.WebWare.Picker.prototype.registerInterfacePanel=function(panel, actions)  {

	UniDOM.addClass(panel, this.classNames.pickerPanel);
	this.panels.unshift(panel);
	this.setTopPanel();
	var PickerInstance=this,
			isMainPanel=(panel===this.mainPanel) ? panel : false;

	UniDOM.addEventHandler(panel, 'onclick', function()  {
		if (PickerInstance.pickerActiveFlag)  setTimeout(function()  { //help Google’s Chrome to keep track of what’s going on by setting a timeout (it has a hard time remembering to make the cursor blink)
			try {(PickerInstance.interfaceTarget || PickerInstance.dataTarget).focus();}  catch(e) {};  },
			0);
		if (!PickerInstance.interfaceTarget || !PickerInstance.mouseOverPicker)  PickerInstance.setTopPanel(panel);  });

	UniDOM.addEventHandler(panel, 'onmouseover', function()  {
		PickerInstance.mouseOverPickerPanel=this;  PickerInstance.mouseOverMainPanel=isMainPanel;  });
	UniDOM.addEventHandler(panel, 'onmouseout', function()  {
		PickerInstance.mouseOverPickerPanel=false;  PickerInstance.mouseOverMainPanel=false;  });

	var i, panelBody=panel.childNodes;
	if (panelBody)  for (i=0; i<panelBody.length; i++)  { if (panelBody[i].nodeType===Node.ELEMENT_NODE)  {
		UniDOM.addEventHandler(panelBody[i], 'onmouseover', function()  {
			PickerInstance.mouseOverPanelBody=this;  });
		UniDOM.addEventHandler(panelBody[i], 'onmouseout', function()  {
			PickerInstance.mouseOverPanelBody=false;  });  }  }

	var pickers=UniDOM.getElementsByClass(panel, this.classNames.picker);
	for (i=0; i<pickers.length;  i++)  {this.registerPicker(pickers[i]);}

	//Traverse the descendents of “panel” looking for elements that need registering, and collect them into an array-object.
	//This array is ordered by the order the elements are found in the document.
	var registered=UniDOM.getElements(panel, isInput);  // see private member above

	for (i=0; i<registered.length; i++)  {
		actns=(actions && actions[elmnt.name]) || {};
		actns.tabToTarget=(typeof actns.tabToTarget == 'boolean') ? actns.tabToTarget : (i===registered.length-1);
		actns.backtabToTarget=(typeof actns.backtabToTarget == 'boolean') ? actns.backtabToTarget : (i===0);
		this.registerInterfaceElement(registered[i], actns);  }

	return registered;  }


})();  // close wrap private members for registering “inputs”

// using relaxed rules; perhaps you want to prefix "data-" to each for strict HTML5/XHTMLx conformance.
SoftMoon.WebWare.Picker.ATTRIBUTE_NAMES={
	interfaceTarget: 'interfaceTarget',
	tabTo: 'tabTo',
	backtabTo: 'backtabTo',
	tabToTarget: 'tabToTarget',
	backtabToTarget: 'backtabToTarget' }

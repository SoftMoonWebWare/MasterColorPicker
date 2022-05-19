//    encoding: UTF-8 UNIX   tabspacing: 2   word-wrap: none

/* FormFieldGenie version 4.2.1 (May 16, 2022)  written by and Copyright © 2010,2011,2012,2015,2019,2020 Joe Golembieski, Softmoon-Webware

*=*=*= ¡REQUIRES A MODERN BROWSER!  No longer compatable with early versions of MSIE =*=*=*

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


if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')  SoftMoon.WebWare=new Object;



;(function FormFieldGenie_NS(){  // open a private namespace



SoftMoon.WebWare.FormFieldGenie=FormFieldGenie;


// ======= class constructor =======
function FormFieldGenie(opts, HTML_clipMenu)  {
	if (!new.target)  throw new Error("“FormFieldGenie” is a constructor, not a function or method.");
	this.config=new FormFieldGenie.ConfigStack(this, opts);
	this.clipboard=new Array;  //new Object; ← the Array acts like a simple Object
	this.HTML_clipMenu=HTML_clipMenu;
	this.tabbedOut=false;
	this.catchTab=this.catchTab.bind(this);  }


/*
	The FormFieldGenie instance:
	• provides a framework for automatically and manually adding or deleting another form-field or group of form-fields.
	• makes it easy to manage the names of consecutive form-field elements when adding or deleting.
	• provides a multi-clip clipboard framework for cut/copy/paste operations of a form-field or group of form-fields.

	When adding a new form-field or group of form-fields (using the popNewField() method),
	the FormFieldGenie can create (clone) one based on what already exists in the form (more on that below),
	or you can explicitly give it a form-field or group of form-fields to clone.
	You may define an explicit DOM node (form-field or group of form-fields) to clone
	when creating an instance of the FormFieldGenie; for example:
		myGenie=new SoftMoon.WebWare.FormFieldGenie({clone:……my DOM node to clone……, ……more of my options……});
		myGenie.popNewField(……)
	After creating an instance of the FormFieldGenie, you may also
	set the instance.config.clone to the explicit DOM node (form-field or group of form-fields) you want to clone (if any).
	An example of defining an explicit node to clone:
		myGenie=new SoftMoon.WebWare.FormFieldGenie;
		myGenie.config.clone= ……my DOM node to clone……
		myGenie.popNewField(………)
	After creating an instance of the FormFieldGenie, you may also
	pass-in as an option the explicit DOM node (form-field or group of form-fields) you want to clone (if any).
	An example of passing an explicit node to clone:
		myGenie=new SoftMoon.WebWare.FormFieldGenie;
		myGenie.popNewField({clone:……my DOM node to clone……, ……more of my options……})


	The publicly accessible properties of a FormFieldGenie instance are:
		.config
		.clipboard
		.HTML_clipMenu
		.tabbedOut

	The publicly accessible user-methods of a FormFieldGenie instance are:
	popNewField(fieldNodeGroup, opts)     returns true if a new fieldNodeGroup is ‘popped’ or false if not.
	deleteField(fieldNodeGroup, opts)     returns true if the fieldNodeGroup was deleted, false if not.
		 cutField(fieldNodeGroup, opts)     returns true if the fieldNodeGroup was deleted, false if not.  fieldNodeGroup will always be copied to the clipboard.
		copyField(fieldNodeGroup, opts)     returns null.  fieldNodeGroup will always be copied to the clipboard.
	 pasteField(fieldNodeGroup, opts)     returns false if the clipboard clip is empty, true if it is pasted.
	clearClipboard()
	getClip(clipID, doInit)  this method is also called internally by other user-methods as a worker-method, but you may utilize it if manually working with the clipboard.
	update_HTML_clipMenu()   this method is also called internally by other user-methods as a worker-method, but you may utilize it if manually updating the clipboard.

	The publicly accessible (and user-replacable) worker-methods of a FormFieldGenie instance are:
	isActiveField(fieldNode, cbParams)  ← this is called internally by user methods
	catchTab(event)  ← this is to be utilized (called by) by your “onKeyDown” event handler
	catchKey(event)  ← this is NOT defined natively, but is recognized and called by the standard “catchTab” method of an instance


	Note you can paste _two_ different ways using _three_ different methods:
		• paste over an existing fieldNodeGroup using   pasteField(fieldNodeGroup, {clip: %%your-clip-reference%%})
		• insert a new fieldNodeGroup using   pasteField(fieldNodeGroup, {doso: 'insert', clip: %%your-clip-reference%%})
		• insert a new fieldNodeGroup using   popNewField(fieldNodeGroup, {doso: 'paste', clip: %%your-clip-reference%%})
	( see “clip” in “opts” below for more info on %%your-clip-reference%% )
	The difference between popNewField and pasteField is that pasteField will return false if the clip is empty,
	while popNewField will simply pop a new “blank” clone if the clip is empty.
	After creating an instance of the FormFieldGenie, the clipboard Object may be accessed through instance.clipboard;
	each clipboard Object property may contain another Object with two properties:
		{
			node: individual clip (DOM node).
			position: the actual position from which this clip was cut (may be different from the field.name’s index value).
		}


		fieldNodeGroup =
			DOM node object - either the text-input / text-box, or one of its parent containing nodes (up the DOM hierarchy).
			If a containing node, it may contain any other DOM nodes including nested “fieldNodeGroupFieldsets” and their “fieldNodeGroups”.
			The “fieldNodeGroupFieldset” is the DOM node that contains the complete list/collection of “fieldNodeGroups”.
			However, if  opts.doso='addTo'  is passed into the  popNewField()  method, then the value which is passed in as
			fieldNodeGroup  should instead be the containing node (fieldNodeGroupFieldset) that holds all the  fieldNodeGroups
			Very simple Example of HTML:

			<script> var Genie=new SoftMoon.WebWare.FormFieldGenie </script>
			<fieldset>
				<label>
					<input type='text' name='myName[0]'
						onfocus='Genie.tabbedOut=false'
						onkeydown='Genie.catchTab(event)'
						onblur='Genie.popNewField(this.parentNode)' />
				</label>
			<fieldset>

			In the above example:
			• The <fieldset> is the fieldNodeGroupFieldset
			• The <labeL> is the fieldNodeGroup – this could be another tag holding many <labels> and their <inputs>
				There may be any number of fieldNodeGroups within the fieldNodeGroupFieldset
			• The <input> is the inputNode a.k.a. fieldNode
			• When the end-user of the above example types something into the input box and then exits it, the HTML above becomes:

			<script> var Genie=new SoftMoon.WebWare.FormFieldGenie </script>
			<fieldset>
				<label>
					<input type='text' name='myName[0]'
						onfocus='Genie.tabbedOut=false'
						onkeydown='Genie.catchTab(event)'
						onblur='Genie.popNewField(this.parentNode)' />
				</label>
				<label>
					<input type='text' name='myName[1]'
						onfocus='Genie.tabbedOut=false'
						onkeydown='Genie.catchTab(event)'
						onblur='Genie.popNewField(this.parentNode)' />
				</label>
			<fieldset>

			======= this “options” Object is optional to pass at all, as are all of its properties ========
		opts = {

			maxTotal: maximum number of clones (fieldNodeGroups) in the fieldNodeGroupFieldset.
				There is no minTotal, as this would impose restrictions on how the fieldNodeGroupFieldset is structured.
				To retain a minimum total, use a custom function for  dumpEmpties  which can make this distinction.

			indxTier: number of index “tiers” to ignore at the end of a name; used to skip over tier(s) when updating names.
				“climbTiers” must be true (see below).
				example:  name → myField[4][3][2]  when indxTier=2 the FormFieldGenie updates/modifies the index that contains “4”
				note the Genie looks for the ==next numeric== index, so note the following
				example:  name → myField[4][subsection][3][2]  when indxTier=2 the FormFieldGenie updates/modifies the index that contains “4”

			climbTiers: true | false   check all levels of indices for a numeric value (true is default), or only the last?

			updateValue: 'all' | 'non-implicit' | 'non-indexed' | 'indexed' | 'implicit'
				Controls the application of updating _values_ instead of _names_ in
						checkbox and radio-button fields that have _values_ formatted similar to "[0]"
				Any other (string value) condition passed yields no values updated (use "no" or "none" or "nope" or "nay" etc).
				No passed condition yields the default action "all".
						=== examples ===
				all             name  name[string]  name[number]  name[]
				non-implicit    name  name[string]  name[number]
				non-indexed     name
				indexed         name[string]  name[number]
				implicit        name[]
						=== examples only show final indices or lack of; indexed names may have additional indices  ===

			focusField: number
				========= this applies to pasteField() and popNewField() only =========
				Pass the field number (counted from ZERO) of the text/filename field you want the cursor focused on
				when popping a new fieldNodeGroup, or pasting a fieldNodeGroup with  opts.focus=true

			focus: true | false
				========= this applies to pasteField() and popNewField() only =========
				If true, the  focusField  will receive focus, whether or not the tab-key was pressed.
				If false, the  focusField  will not receive focus when the tab key is pressed.
				If no value is passed, then the tab-key will cause the focusField to receive focus
				when popping a new fieldNodeGroup.

			dumpEmpties: true | false | function(empty_fieldNodeGroupInQuestion, deleteFlag)  remove emptied fields on the fly?
				========= this applies to deleteField() and popNewField() only, and not when inserting or pasting =========
				if a function is supplied, it should return  true | false | null
				and if null is returned, the function should remove the field itself.
				If you use deleteField(), the fieldNodeGroup will be removed even if dumpEmpties===false;
					however, if dumpEmpties	is a function, it will be called with the value of  deleteFlag=true
					and its return value (true|false) will be respected.

			checkForEmpty: 'all' | 'one' | 'some'
				========= this applies to deleteField() and popNewField() only, and not when inserting or pasting =========
				If set, the corresponding text/filename fields in the nodeGroup will be checked.
				By default only the -first- one is checked.
				If 'one' or 'some', the  checkField  option should be used also.
				If 'some', each of the -first- "checkField" number of fields will be checked.

			checkField: number
				========= this applies to deleteField() and popNewField() only, and not when inserting or pasting =========
				Used in conjunction with  checkForEmpty
				Pass the field number (counted from ZERO) of the field or fields you want checked for "Empty" when popping.
				If  checkForEmpty='some'  the each of the first  number  of fields will be checked.

			updateName: function(field, indxOffset, fieldNodeGroupFieldset, cbParams)  { your plugin code }
				Pass a plugin callback function to handle the process of updating each name.
				The function will be passed each individual form DOM object (<input> or <textarea> or <select> or <button>)
					one at a time in the  field  variable.
				The  indxOffset  variable contains the numerical positional offset
					of the new  field  compared to the  field  passed in.
				The Function should pass back a string of the new name, or  null .
				If a string is returned, the name attribute of the DOM object will be set to that value;
					no need for your function to alter the name directly, unless returning  null .
				If  null  is returned, the usual process of updating the name continues.
				The updateName function may do anything it needs from partial updating the name directly (to be continued
				by the usual process), to updating the value, to updating the parentNode text, or whatever you can imagine…

			cbParams:
				This will be passed through to the updateName plugin callback function as the fourth variable (cbPrams),
				and to the isActiveField†, cloneCustomizer‡, eventRegistrar‡ and groupCusomizer‡ plugin callback functions
				as the †second or ‡third.  It may be any type as required by your plugin callback functions,
				but if they share you may want to use an object with separate properties.

			cloneCustomizer: function(fieldNodeGroup, pasteOver, cbParams)  { your customizing code }
				If there is something special you want to do to each nodeGroup cloned, you may pass a function to
				handle that.  All field names will have been updated,
				but the node will not yet have been added to the document.
				The passed variable  pasteOver  will be (true | false | 'paste-over').
				This Function is called only when a new fieldNodeGroup is being popped or pasted over.

			eventRegistrar: function(fieldNodeGroup, pasteOver, cbParams)  { your customizing code }
				While HTML attributes including event handlers are cloned,
				DOM level 2 (and similar for MSIE) event handlers are NOT cloned.
				If you need event handlers registered for any elements in your cloned fieldNodeGroup,
				you must do them "by hand" through this function.
				The function will be passed the fieldNodeGroup AFTER it has been added to the document.
				This Function is called only when a new fieldNodeGroup is being popped or pasted over.

			fieldsetCustomizer: function(fieldNodeGroupFieldset, pasteOver, cbParams)  { your customizing code }
				This is called when a new fieldNodeGroup is being popped, pasted,
					or when a fieldNodeGroup is deleted or was empty and has been dumped.
				It is called from a setTimeout function, so the DOM will be fully updated.
				Use it to do any final customizing.
				Note it is passed the whole fieldNodeGroupFieldset node containing all fieldNodeGroups
				including the new one after it has been added to the document, not simply the newly cloned group.

			doso: true | "insert" | "paste"
				========= this applies to popNewField() and pasteField() only =========
				If you pass (Boolean)true when using popNewField(), a new field will be popped at the end regardless of whether the last field is empty;
					but not exceeding maxTotal.  Empty fieldNodeGroups may be removed as usual.
				Empty fieldNodeGroups will NOT be automatically removed if "insert" when using popNewField().
				If you pass "insert" or "paste" when using popNewField(), a new field will be popped and inserted BEFORE the passed fieldNodeGroup,
					regardless of whether the last field is empty; but not exceeding maxTotal.
				With popNewField(), “insert” inserts an empty fieldNodeGroup.
				With pasteField(), “insert” inserts the selected clip.
				With popNewField(), “paste” inserts the selected clip.

			addTo: true
				========= this applies to popNewField() only =========
				If you pass  opts.addto=true, then the value that would be passed into popNewField as  fieldNodeGroup
					will be instead considered the  fieldNodeGroupFieldset.
				This will allow you to add a new field to empty  fieldNodeGroupFieldsets
					but only if •the Genie.clone is set; •or opts.doso='paste' while the clipboard has contents.
				Passing  opts.addto=true  acts similar as passing  opts.doso=true  in that it will always pop a new field
					(unless as noted above the  fieldNodeGroupFieldset  is empty and there is no clone and no paste)
				Note that pasteField() with opts.doso='insert' internally calls calls popNewField(), and this option
					may then take effect.

			clip: Object-member-identifier  ( Number | String.match( /^[_a-z][_a-z0-9]*$/i ) )
				( a.k.a. %%your-clip-reference%% )
				This is a reference to the member of the clipboard object associated with an instance of the FormFieldGenie.
				Each FormFieldGenie instance has its own clipboard, and each clipboard can hold an “unlimited” number of clips
					(limited by the machine).
				You may copy, cut and paste into/from any clip.
		}



*/
//===============================================================

// ======= configuration prototype-stack constructor =======
FormFieldGenie.ConfigStack=function($owner, $config)  {
	Object.defineProperties(this, {
		owner: {value: $owner}  } );
	if (typeof $config == 'object')  for (var f in $config)  {this[f]=$config[f];}  }


FormFieldGenie.ConfigStack.prototype={
	constructor: FormFieldGenie.ConfigStack,

//you may re-define defaults globally through these properties
	maxTotal: 100,
	indxTier: 0,
	climbTiers: true,
	updateValue: "all",
	focusField: 0,
	doFocus: null,
	isActiveField: undefined,   /*Boolean  or  user function returns Boolean;  see also isActiveField() method*/
	dumpEmpties: dumpEmpties,   /*Boolean  or  user function returns Boolean|null*/
	minFields: 1,   /* min number of input-fields in a group when checking to dump empties */
	nodeName: null,  /*specific nodeName of Elements in a group when checking to dump empties*/
	checkForEmpty: "one",
	checkField: 0,
	updateName: null,
	cloneCustomizer: null,  /*user function*/
	eventRegistrar: null,   /*user function*/
	fieldsetCustomizer: null,   /*user function*/
	groupClass: "",       /* string  or  RegExp */
	groupTag: null,        /* htmlTagNameString.toUpper() */
	minPixWidth: 4,  //for an input to be "active"
	minPixHeight: 4,  // ↑
	clone: null,
	clip: "_FormFieldGenie_system_",  //if you cut/copy/paste w/out specifying the clipboard “clip”
	only_clips_inAll: true, // when using Genie.getClip('all clips'), only return the clipboard.clips array ?
	no_system_inAllClips: true, // when using Genie.getClip('all clips'), avoid clips with names that contain _system_ ?
	userDataInputTypes: [
		'text', 'search', 'tel', 'url', 'email', 'password', 'datetime', 'date',
		'month', 'week', 'time', 'datetime-local', 'number', 'color', 'file' ]
		}
Object.defineProperties( FormFieldGenie.ConfigStack.prototype, {
	push: { value: function($newConfig) {
			this.owner.config=Object.create(this);
			for (var p in $newConfig) {this.owner.config[p]=$newConfig[p];}
			return this.owner.config;  }  },
	pop: { value: function() {
			if (!this.hasOwnProperty("owner"))  this.owner.config=Object.getPrototypeOf(this);
			return this.owner.config;  }  },
	reset: { value: function() {
			while (!this.owner.config.hasOwnProperty("owner"))  {
				this.owner.config=Object.getPrototypeOf(this.owner.config);  }
			return this.owner.config;  }  }  } );

//===============================================================


// ======= worker methods =======

// The “catchtab” method is meant to be called by an “onKeyDown” event handler
// which you attach to the form field(s) in your project that utilize the FormFieldGenie.
// The other “worker methods” are called internally by the “user methods”.
// Some are exposed to allow fine-tuned customization of your Genie to your Form’s needs.


//  use  onkeydown  event to capture the Tab key
//  Since the form field that the event-handler (which calls this method) is attached to is likely to be cloned,
//  it is easier to attach it “inline”, i.e. a part of the HTML tag,
//  so the attribute that calls this method is inclusively cloned,
//  rather than using “unobtrusive” JavaScript addEventListener methods every time the form field is cloned.
//  This conception, however, limits you to only one (1) “onkeydown” event handler,
//  so the “catchkey” hook is internal to allow you to add additional “onkeydown” handlers.
//  Alternatively, you may utilize the “eventRegistrar” functional option (see the config options above)
//  to add on a handler that calls this method, or any additional handlers, to newly cloned form fields as needed.
FormFieldGenie.prototype.catchTab=function(event)  {
	this.tabbedOut=(event.key==='Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey
									&& !event.getModifierState('AltGraph') && !event.getModifierState('OS'));
	// ¡NOTE! the HTML-attribute is “catchkey” (all lowercase) while the method on the Element is “catchKey” (camelCase)
	if (typeof event.target.catchKey !== 'function'  &&  event.target.hasAttribute('catchkey'))  {
		try {event.target.catchKey=new Function('event', event.target.getAttribute('catchkey'));} catch(e){}  }
	if (typeof event.target.catchKey === 'function')  return event.target.catchKey(event);
	if (typeof this.catchKey === 'function')  return this.catchKey(event);
	return true;  }


//	isActiveField: function(fieldNode, cbParams)  { your customizing code }
//  You can replace this standard function to check if a form field is currently active or not;
//  i.e. is it disabled?, or is it even displayed at all?
//  You may add/subtract your own rules, perhaps checking the status of another element.
//  Inactive elements will not be considered when deciding to pop a new fieldNodeGroup or dump an empty one.
// 	Your function should return true/false.
FormFieldGenie.prototype.isActiveField=function(fieldNode, cbParams)  {
	switch (typeof this.config.isActiveField)  {
		case 'function': return this.config.isActiveField(fieldNode, cbParams);
		case 'boolean':  return this.config.isActiveField;  }
	if ( typeof fieldNode.offsetWidth === 'number'
	&&  ( fieldNode.offsetWidth<this.config.minPixWidth
		||  fieldNode.offsetHeight<this.config.minPixHeight ) )  return false;
	var style;
	do {
		if (fieldNode.disabled
		||  ( (style=getComputedStyle(fieldNode))
				 &&  (style.display==='none'  ||  style.visibility==='hidden') ) )  return false;  }
	while  ( (fieldNode=fieldNode.parentNode)  instanceof Element );
	return true;  }


// This is the default function found at: SoftMoon.WebWare.FormFieldGenie.ConfigStack.prototype.dumpEmpties
//    ( GenieInstance.config.dumpEmpties )
// Note that: deleteField() passes  true  as the second value, which this default function below ignores.
// Your custom dumpEmpties function may utilize this second value passed by deleteField()
// to make a distinction between a user request and an automatic “cleanup”.
function dumpEmpties(elmnt)  {
	elmnt=elmnt.parentNode.children;
	for (var count=0, i=0; i<elmnt.length; i++)  {
		if (typeof config.nodeName !== 'string'
		||  elmnt[i].nodeName===config.nodeName)
				count++;  }
	return (count>config.minFields);  }





	// these are "private" variables "global" to this class
	var thisGenie,
			config,
			checkOne=true, checkAll=false,
			groupClass,
			fieldNodeGroupFieldset;


	// "private" methods to this class are below

	function init(fieldNodeGroup, opts, addTo) {

		thisGenie=this;

		if (opts)  this.config.push(opts);
		config=this.config;

		if (config.checkForEmpty==="all")  {checkAll=true;  checkOne=false;}  else
		if (config.checkForEmpty==="one")  {checkOne=true;  checkAll=false;}  else
		if (config.checkForEmpty==="some")  {checkAll=false;  checkOne=false;}

		if (typeof config.groupClass === "string"  &&  config.groupClass.length>0)  groupClass=RegExp("\\b"+config.groupClass+"\\b");
		else if (config.groupClass instanceof RegExp)  groupClass=config.groupClass;
		else groupClass="";

		if (addTo)  fieldNodeGroupFieldset=fieldNodeGroup;  // only Genie.popNewField(fieldNodeGroupFieldset, {addTo:true})
		else  fieldNodeGroupFieldset=fieldNodeGroup.parentNode;  //may be any parent tag; not limited to <fieldset> <ol> <td> <div> etc.

	}  // close init



	function getField(fieldNode, check)  {
		if (!(fieldNode instanceof Element)  ||  fieldNode.nodeType!=Node.ELEMENT_NODE)  return null;
		if (!fieldNode.hasChildNodes())  { switch (fieldNode.nodeName)  {
				case "INPUT": { if (config.userDataInputTypes.indexOf(fieldNode.type) === -1)  return null;  }
				case "TEXTAREA": { if (!thisGenie.isActiveField(fieldNode, config.cbParams))  return null;
					return (check) ?  ((fieldNode.value.length==0)^(check=="isFull?"))  :  fieldNode;  }
				default: return null;  }  }
		else
		var fields= function(fldNode)  {
			for (var n, fields=new Array, i=0;  i<fldNode.childElementCount;  i++)  { n=fldNode.children[i];
				if (n.hasChildNodes())  {fields=fields.concat(arguments.callee(n));  continue;}
				switch (n.nodeName)  {
					case "INPUT": {if (config.userDataInputTypes.indexOf(n.type) === -1)  continue;}
					case "TEXTAREA": {if (thisGenie.isActiveField(n, config.cbParams))  fields.push(n);}  }  }
			return fields;
		}(fieldNode);  //invoke the above function passing fieldNode as the value of fldNode
		if (check)  {
			if (checkOne) //{  if (testFlag) alert("name:="+fields[checkField].name+"=\nvalue:="+fields[checkField].value +"=\nlength:"+ fields[checkField].value.length +"\nfields.length: "+ fields.length +"\ncheckField: "+ checkField);
				return (fields.length>config.checkField) ?  (fields[config.checkField].value.length===0)^(check==="isFull?")  :  null;  //}
			for (var i=0; i<fields.length; i++)  {
				if ((fields[i].value.length===0)^(check=="isFull?"))  {if (!checkAll  &&  i>=config.checkField)  return true;}
				else  return false;  }
			return (fields.length) ? true : null;  }
		else  return (fields.length>config.focusField) ?  fields[config.focusField]  :  null;  }


	function isGroup(e)  {return (!config.groupTag  ||  e.nodeName===config.groupTag)  &&  e.className.match(groupClass);}

	function getNextGroup(nodeGroup)  {
		do {nodeGroup=nodeGroup.nextElementSibling}
		while  (nodeGroup!=null  &&  (!isGroup(nodeGroup)  ||  getField(nodeGroup)==null));
		return  nodeGroup;  }

	function getFirstGroup()  { var firstGroup=fieldNodeGroupFieldset.firstElementChild;
		while (firstGroup!=null  &&  (!isGroup(firstGroup)  ||  getField(firstGroup)==null))  {
			firstGroup=firstGroup.nextElementSibling;  }
		return firstGroup;  }

	function getLastGroup()  { var lastGroup=fieldNodeGroupFieldset.lastElementChild;
		while (lastGroup!=null  &&  (!isGroup(lastGroup)  ||  getField(lastGroup)==null))  {
			lastGroup=lastGroup.previousElementSibling;  }
		return lastGroup;  }


	function updateGroupNames(group, indxOffset, resetFlag)  {  //also reset default values when resetFlag==true
		if (typeof indxOffset !== "number")  indxOffset=1;
		if (typeof resetFlag !== "boolean")  resetFlag=true;
		var elmnt, inputNodes=['input', 'textarea', 'select', 'button' /*, 'map' */], field, i;
		// you could in theory? use the <map> tag with the JavaScript: pseudo-protocol in the URLs, in which the script
		// uses the current name attribute to do something (like pre-enter an index number into a corresponding text field).
		if (!group.hasChildNodes())  {
			group.name=updateName(group);
			if (resetFlag)  updateValsEtc(group);  }
		else
		while (elmnt=inputNodes.pop())  { if (field=group.getElementsByTagName(elmnt))
			for (i=0; i<field.length; i++)  {
				field[i].name=updateName(field[i]);
				if (resetFlag)  updateValsEtc(field[i]);  }  }

		//extend updateGroupNames()

		function updateValsEtc(field)  {
			if (field.nodeName==='INPUT'  &&  field.type.toLowerCase()==='file')  {    // alert("==="+field.value+"==="+field.type.toLowerCase()+"===");  continue;
				field.value="";  //most browsers ignore this anyway
				if (field.value=="")  return;
				var prop, newFileField=document.createElement('input');  // alert('new');
				for (prop in field)  { try  {
					if (prop!=='value'  &&  prop!=='defaultValue'  &&  prop!=='id')  //  &&  prop!=='attributes'  &&  prop!=='baseURI'  &&  prop!=='document'  &&  prop!=='childNodes'  &&  prop!=='children'  &&  prop!=='parentNode'
							{newFileField[prop]=field[prop];}  }  //Opera had a bug that will not propagate the copy of a copy of a copy properly.
					catch(e) {}  }
				field.parentNode.replaceChild(newFileField, field);  return;  }
			if (field.defaultValue!==undefined)  field.value=field.defaultValue;
			if (field.defaultChecked!==undefined)  field.checked=field.defaultChecked;
			if (field.selectedIndex!==undefined)  field.selectedIndex=selectDefaults(field);  }

		function updateName(field)  { var valIncr;
			if (config.updateName)  {
				var fieldName=config.updateName(field, indxOffset, fieldNodeGroupFieldset, config.cbParams);
				if (typeof fieldName === "string")  return fieldName;  }
			if (config.updateValue==="all"  &&  valueUpdater(field))  return field.name;
			if (field.name.charAt(field.name.length-2)!="[")  {
				if (config.updateValue=="non-implicit"  &&  valueUpdater(field))  return field.name;
				if (field.name.charAt(field.name.length-1)!="]")  {  // non-indexed  name
					if (config.updateValue=="non-indexed"  &&  valueUpdater(field))  return field.name;
					if ((valIncr=field.name.match(/(.*[^0-9])?([0-9]+)$/))!==null)
						return ((typeof valIncr[1] !== "undefined") ? valIncr[1] : "") + (Number(valIncr[2])+indxOffset).toString();
					else  return field.name;  }
				else  {  //indexed with contained value  name[value]
					if (config.updateValue==="indexed"  &&  valueUpdater(field))  return field.name;
					return updateTieredName(field.name, field.name.length);  }  }
			else  {  //indexed with no contained value  name[]
				if (config.updateValue==="implicit"  &&  valueUpdater(field))  return field.name;
				if (field.tagName==='INPUT'  &&  field.type==='checkbox'  &&  field.name.substr(-3)=="][]")
					return updateTieredName(field.name, field.name.length-2);
				else  return field.name;  }  }

		function valueUpdater(field)  { var valIncr;
			if (field.tagName==='INPUT'  &&  (field.type==='radio'  ||  field.type==='checkbox')
			&&  (valIncr=field.value.match(/^\[([0-9]+)\]$/)))  {
				field.value="["+(Number(valIncr[1])+indxOffset).toString()+"]";  return true;  }  }

		//find and update the last index with a numeric value, or return the original name if none are numeric
		function updateTieredName(fieldName, position)  { var indx, indxCount=0;
			position=(typeof position == "number") ?  fieldName.lastIndexOf("[", position-1)  :  fieldName.lastIndexOf("[");
			do {indx=( Number(fieldName.substring(position+1, fieldName.indexOf("]", position))) +indxOffset ).toString();}
			while ((indxCount++<config.indxTier  ||  indx==="NaN")
				&&  config.climbTiers  &&  position>3  &&  (position=fieldName.lastIndexOf("[", position-1)) != (-1));
			return (indx=="NaN") ? fieldName  :
				fieldName.substring(0, position+1) +indx+ fieldName.substring(fieldName.indexOf("]", position));  }

		function selectDefaults(slct)  { var allOptns=slct.getElementsByTagName('option'), slctdOpt=null;
			if (allOptns.length==0)  return null;
			for (var i=allOptns.length-1; i>=0; i--)  {if (allOptns[i].selected=allOptns[i].defaultSelected)  slctdOpt=i;}
			return slctdOpt;  }

	/*close updateGroupNames*/  }


	function getPosition(fieldNodeGroup)  {
		var fieldNode=getFirstGroup(), fieldCount=0;
		while (fieldNode  &&  fieldNode!==fieldNodeGroup)  {
			++fieldCount;
			fieldNode=getNextGroup(fieldNode);  }
		return fieldCount;  }


	function deleteField(fieldNodeGroup, opts)  {
		if ( typeof thisGenie.config.dumpEmpties === 'function'  &&  !thisGenie.config.dumpEmpties(fieldNodeGroup, true) )   return false;
		var nextNode=getNextGroup(fieldNodeGroup);
		fieldNodeGroupFieldset.removeChild(fieldNodeGroup);
		while (nextNode!==null) {updateGroupNames(nextNode, -1, false);  nextNode=getNextGroup(nextNode);}
		if (typeof fieldsetCustomizer == "function")  fieldsetCustomizer(fieldNodeGroupFieldset, false, config.cbParams);
		if (opts  &&  opts.refocus)  setTimeout(function() {getField(getLastGroup()).focus();}, 1);
		return true;  }

	function alignSelectValues(source, clone)  { var _clone_=clone;
		if ((source=source.getElementsByTagName('select'))
		&&  (clone=clone.getElementsByTagName('select')))
			for (var j, i=0; i<source.length; i++)  { for (j=0; j<clone[i].options.length; j++)  {
				clone[i].options[j].selected= source[i].options[j].selected;  }  }
		return _clone_;  }


 function popNewField(fieldNodeGroup, opts, clip, avoidTimeout)  {
	var newField, cloned, fieldCount=0, fieldNode=getFirstGroup(), flag=false, pasted=false;
	function timeoutForInsert()  {
		if (typeof config.fieldsetCustomizer === 'function')  config.fieldsetCustomizer(fieldNodeGroupFieldset, pasted, config.cbParams);
		if (config.doFocus!==false)  getField(newField).focus();  }

	if (opts  &&  (opts.doso==='insert'  ||  opts.doso==='paste'))  {
		var fieldPos=0, offSet;
		while (fieldNode)  {
			if (++fieldCount>config.maxTotal)  return false;
			else  {
				if (fieldNode===fieldNodeGroup)  fieldPos=fieldCount-1;
				fieldNode=getNextGroup(fieldNode);  }  }
		if (opts.addTo)  fieldPos=fieldCount;
		if (opts.doso==='paste'
		&&  (clip=clip||this.getClip(config.clip)))  {
			if (clip.node instanceof Element)  {
				pasted=true;
				newField=(cloned=clip.node).cloneNode(true);
				alignSelectValues(cloned, newField);
				offSet=fieldPos-clip.position;  }
			else if (clip instanceof Array)  {
				for (var i=0; i<clip.length; i++)  {if (popNewField.call(this, fieldNodeGroup, opts, clip[i], true))  flag=true;}
				if (flag)  setTimeout(timeoutForInsert, 0);
				return flag;  }
			else  return false;  }
		else if (config.clone instanceof Element)  {
			newField=(cloned=config.clone).cloneNode(true);
			alignSelectValues(cloned, newField);
			offSet=fieldPos;  }
		else {
		//the last field should have standard default values, so we clone this one.
		//the server-side script may accept the list and spit it back out as filled-in values in the form;
		// if it does this, one more (empty) fieldNodeGroup should be added at the end
			cloned=getLastGroup();
			if (cloned===null)  return false;
			newField=cloned.cloneNode(true);
			alignSelectValues(cloned, newField);
			offSet=fieldPos-fieldCount+1;
			flag=true;  }
		if (!opts.addTo)  {
			fieldNode=fieldNodeGroup;
			do {updateGroupNames(fieldNode, 1, false);}  while ((fieldNode=getNextGroup(fieldNode))!==null);  }
		updateGroupNames(newField, offSet, flag);
		if (typeof config.cloneCustomizer === 'function')
			config.cloneCustomizer(newField, pasted, config.cbParams);
		if (opts.addTo)
			fieldNodeGroupFieldset.appendChild(newField);
		else  fieldNodeGroupFieldset.insertBefore(newField, fieldNodeGroup);
		if (typeof config.eventRegistrar === 'function')  config.eventRegistrar(newField, pasted, config.cbParams);
		newField.dispatchEvent(new CustomEvent('formfieldgenieclone',
			{detail: {genie: this, clip:{node:cloned, position:fieldPos-offSet}, pasted:pasted}, bubbles: true, cancelable: true}));
		if (!avoidTimeout)  setTimeout(timeoutForInsert, 0);
		return true;  }
	var nextNode, fieldFlag, removedCount=0, lastGroup;
	// remove sibling node Groups with empty text fields
	if (fieldNode!==null)
	do  { nextNode=getNextGroup(fieldNode);  fieldFlag=getField(fieldNode, "isEmpty?");
		if (fieldFlag!==null)  {
			if (config.dumpEmpties  &&  nextNode!==null  &&  fieldFlag)  {
				if ( typeof config.dumpEmpties === 'function'  &&  !(flag=config.dumpEmpties(fieldNode)) )  {
					if (flag===false)  { fieldCount++;
						if (removedCount<0)  updateGroupNames(fieldNode, removedCount, false);  }
					if (flag===null)  removedCount--;  }
				else  {
					fieldNodeGroupFieldset.removeChild(fieldNode);
					removedCount--;  }  }
			else  { fieldCount++;
				if (removedCount<0)  updateGroupNames(fieldNode, removedCount, false);  }  }  }
	while (nextNode!==null  &&  (fieldNode=nextNode));

	if (fieldCount<config.maxTotal
	&&  (getField(lastGroup=getLastGroup(), "isFull?")	||  (opts && (opts.doso || opts.addTo))))  {
	// create a new node containing an empty text-input field
	//  clone the node at the end of the <fieldset> (or other <parent>) of the node passed to keep names sequential
	//  clone the whole node to allow wrapper tags
	//     (for example <label> or <fieldset>), other text, other fields, etc.
	//  update all form-control-tag "name"s and reset default values
	//  if the TAB key was pressed to exit this input field, focus the cursor at the newly generated field.
		if (config.clone instanceof Element)  {
			newField=(cloned=config.clone).cloneNode(true);
			alignSelectValues(cloned, newField);
			offSet=fieldCount;
			flag=false;  }
		else {
			cloned=getLastGroup();
			if (cloned===null)  return false;
			newField=cloned.cloneNode(true);
			alignSelectValues(cloned, newField);
			offSet=1;
			flag=true;   }
		updateGroupNames(newField, offSet, flag);
		if (typeof config.cloneCustomizer == "function")
			config.cloneCustomizer(newField, false, config.cbParams);
		if (fieldNodeGroupFieldset.lastElementChild===lastGroup)
			fieldNodeGroupFieldset.appendChild(newField);
		else  fieldNodeGroupFieldset.insertBefore(lastGroup.nextElementChild, newField);
		if (typeof config.eventRegistrar == "function")
			config.eventRegistrar(newField, false, config.cbParams);
		newField.dispatchEvent(new CustomEvent('formfieldgenieclone',
			{detail: {genie: this, clip:{node:cloned, position:fieldCount-offSet}, pasted:false}, bubbles: true, cancelable: true}));
		flag=true;  }
	else  flag=false;  //we are not popping a new field

	if (removedCount<0  ||  newField)   {
		var tabbedOut=this.tabbedOut;
		setTimeout(
			function () {
				if (typeof config.fieldsetCustomizer === "function")
					config.fieldsetCustomizer(fieldNodeGroupFieldset, false, config.cbParams);
				if ((tabbedOut && config.doFocus!==false)  ||  config.doFocus)
					getField(getLastGroup()).focus();  },
			0);  }

	return flag;  }

//===============================================================


// ======= user methods =======


FormFieldGenie.prototype.popNewField=function(fieldNodeGroup, opts)  {
	try {
		init.call(this, fieldNodeGroup, opts, (opts && opts.addTo));
		return popNewField.call(this, fieldNodeGroup, opts);  }
	finally {if (opts)  this.config.pop();}  }

FormFieldGenie.prototype.pasteField=function(fieldNodeGroup, opts)  {
	try {
		init.call(this, fieldNodeGroup, opts);
		var flag, clip;
		if ( !( (clip=this.getClip(config.clip))  &&  (clip instanceof Array  ||  clip.node instanceof Element) ) ) return false;
		if (opts  &&  opts.doso==='insert')  {
			opts.doso='paste';  flag=popNewField.call(this, fieldNodeGroup, opts, clip);  opts.doso='insert';
			return flag;  }
		var newField=clip.node.cloneNode(true);
		alignSelectValues(clip.node, newField);
		updateGroupNames(newField, getPosition(fieldNodeGroup)-clip.position, false);
		if (typeof config.cloneCustomizer === 'function')
			config.cloneCustomizer(newField, 'paste-over', config.cbParams);
		fieldNodeGroupFieldset.replaceChild(newField, fieldNodeGroup);
		if (typeof config.eventRegistrar === 'function')  config.eventRegistrar(newField, 'paste-over', config.cbParams);
		newField.dispatchEvent(new CustomEvent('formfieldgenieclone',
			{detail: {genie: this, clip:clip, pasted:'paste-over'}, bubbles: true, cancelable: true}));
		setTimeout(function() { var o;
			if (typeof config.fieldsetCustomizer === 'function')  config.fieldsetCustomizer(fieldNodeGroupFieldset, 'paste-over', config.cbParams);
			if (opts  &&  opts.doso)  {
				o=opts.doso;  opts.doso=null;
				popNewField.call(thisGenie, fieldNodeGroup, opts);
				opts.doso=o;  }
			if (config.doFocus)  getField(newField).focus();  }, 0);
		return true;  }
	finally {if (opts)  this.config.pop();}  }

FormFieldGenie.prototype.deleteField=function(fieldNodeGroup, opts)  {
	try {
		init.call(this, fieldNodeGroup, opts);
		return deleteField(fieldNodeGroup, opts);  }
	finally {if (opts)  this.config.pop();}  }

FormFieldGenie.prototype.cutField=function(fieldNodeGroup, opts)  {
	try {
		init.call(this, fieldNodeGroup, opts);
		copyField.call(this, fieldNodeGroup);
		return deleteField(fieldNodeGroup, opts);  }
	finally {
		this.update_HTML_clipMenu();
		if (opts)  this.config.pop();  }  }

function copyField(fieldNodeGroup)  {
	Object.defineProperties(this.getClip(config.clip, true), {      //  ↓↓ this is returned from alignSelectValues()
		node: {value: alignSelectValues(fieldNodeGroup, fieldNodeGroup.cloneNode(true)), enumerable: true, writable: false, configurable: false},
		position: {value: getPosition(fieldNodeGroup), enumerable: true, writable: false, configurable: false}  });  }

FormFieldGenie.prototype.copyField=function(fieldNodeGroup, opts)  {
	try {
		init.call(this, fieldNodeGroup, opts);
		copyField.call(this, fieldNodeGroup);  }
	finally {
		this.update_HTML_clipMenu();
		if (opts)  this.config.pop();  }  }

// note that when  ref='clip X'  (where X is a number) clipboard.clips[X-1] is returned
// but that when  ref=X  (where X is a number) clipboard.clips[X] is returned
FormFieldGenie.prototype.getClip=function(ref, doInit)  { var x;
	if (!(this.clipboard instanceof Object))  {
		if (doInit)  this.clipboard=new Object;
		else  return false;  }
	if (typeof ref === 'string')  {
		if (ref.toLowerCase()==="all clips")  {
			var allClips= (this.clipboard.clips instanceof Array  &&  this.clipboard.clips.length>0  &&  this.clipboard.clips.slice(0));
			if (config.only_clips_inAll)  return allClips;
			allClips= allClips || new Array;
			for (x in this.clipboard)  {
				if (x==='clips'  ||  (config.no_system_inAllClips  &&  x.match( /_system_/ )))  continue;
				allClips.push(this.clipboard[x]);  }
			return allClips.length>0  &&  allClips;  }
		if (ref.toLowerCase()==="new clip")  {
			if (!(this.clipboard.clips instanceof Array))  this.clipboard.clips=new Array;
			return this.clipboard.clips[this.clipboard.clips.length]=new Object;  }
		if (!doInit  &&  this.clipboard[ref] instanceof Object)  return this.clipboard[ref];
		if (x=ref.match( /^clip ?([0-9]+)$/i ))  ref=parseInt(x[1])-1;
		else
		if (doInit)  return this.clipboard[ref]=new Object;  }
	if (typeof ref !== 'number')  return false;
	if (!(this.clipboard.clips instanceof Array))  {
		if (doInit)  this.clipboard.clips=new Array;
		else  return false;  }
	if (doInit)  return this.clipboard.clips[ref]=new Object;
	if (this.clipboard.clips[ref] instanceof Object)  return this.clipboard.clips[ref];
	return false;  }


FormFieldGenie.prototype.clearClipboard=function(confirmed)  {
	if (confirmed  ||  confirm("Do you want to clear this Form's Clipboard?"))  {
		this.clipboard=new Object;
		this.update_HTML_clipMenu();  }  }


FormFieldGenie.prototype.update_HTML_clipMenu=function()  {
	if (!(this.HTML_clipMenu instanceof Element)  ||  typeof this.clipboard !== 'object')	 return false;
	var ul=this.HTML_clipMenu.getElementsByTagName('ul'),
			li, i, j,
			items=document.createDocumentFragment(),
			stndrd=this.HTML_clipMenu.getAttribute('standardItems') || 'genie';
	if (this.clipboard.clips instanceof Array)  for (i=0; i<this.clipboard.clips.length; i++)  {
		if (this.clipboard.clips[i])  {
			li=document.createElement('li');
			//li.innerHTML='clip '+i;
			li.appendChild(document.createTextNode('clip '+(1+i)));
			items.appendChild(li);  }  }
	if (!config.only_clips_inAll)  for (i in this.clipboard)  {
		if (i==='clips'  ||  (config.no_system_inAllClips  &&  i.match( /_system_/ )))  continue;
		li=document.createElement('li');
		//li.innerHTML=i;
		li.appendChild(document.createTextNode(i));
		items.appendChild(li);  }
	for (i=0; i<ul.length; i++)  {
		li=ul[i].getElementsByTagName('li');
		for (j=0; j<li.length; )  {if (li[j].classList.contains(stndrd))  j++;  else  ul[i].removeChild(li[j]);}
		if (items.hasChildNodes())  {
			if  ((i+1) === ul.length)
				ul[i].appendChild(items);
			else
				ul[i].appendChild(items.cloneNode(true));  }  }  }



})()  //close and invoke the NameSpace wrapper for private members/functions



/* This is the “HTML clip Menu”
 * You may copy and paste this snippit of HTML into your page – one copy per Genie instance.
 * You may change/add any id or classNames to this HTML for CSS handles.
 * You may modify the <li>TEXT</li> in the outer <menu> but not the inner <ul>s.
 *  For instance, with a list of names, your TEXT may become: “insert name” “copy name” “cut name” “paste name” “delete name”,
 *  and your confirm dialog may become “Do you want to delete this name?”
 * Embedded JavaScript™ event-handler attributes may also be modified and/or expanded as appropriate to your needs;
 *  however, note the FormFieldGenie copies these 'onclick' attributes as it auto-creates new <li> items for each new “clip”
 *  the end-user copies/cuts to.
 *
<menu id='myGenie_popUpMenu' standardItems='genie'>
	<li>insert:<span onclick='myGenie.popNewField(this.closest("."+myGenie.config.groupClass), {doso:"insert"})'>empty field</span>
							<ul onclick='if (event.phase===Event.BUBBLING_PHASE) myGenie.pasteField(this.closest("."+myGenie.config.groupClass), {doso:"insert", clip:event.target.className})'>
								<li class='genie'>all clips</li>
							</ul></li>
	<li>copy to:<ul onclick='if (event.phase===Event.BUBBLING_PHASE) myGenie.copyField(this.closest("."+myGenie.config.groupClass), {clip:event.target.className})'>
								<li class='genie'>new clip</li>
							</ul></li>
	<li>cut to:<ul onclick='if (event.phase===Event.BUBBLING_PHASE) myGenie.cutField(this.closest("."+myGenie.config.groupClass), {clip:event.target.className})'>
								<li class='genie'>new clip</li>
							</ul></li>
	<li>paste from:<ul onclick='if (event.phase===Event.BUBBLING_PHASE) myGenie.pasteField(this.closest("."+myGenie.config.groupClass), {clip:event.target.className})'>
								</ul></li>
	<li onclick='if (confirm("Do you want to delete this fieldNodeGroup?")) myGenie.deleteField(this.closest("."+myGenie.config.groupClass))'>delete</li>
	<li onclick='myGenie.clearClipboard();'>clear clipboard</li>
</menu>
 *
 *the above would be used like this:
<script type='text/javascript'>
myGenie=new SoftMoon.WebWare.FormFieldGenie(opts, document.getElementById('myGenie_popUpMenu'));
</script>
 */


//===================================================================================\\


// “updateName” plugin for popNewField
//  usage example:
// Genie=new SoftMoon.WebWare.FormFieldGenie( {
//		updateName: SoftMoon.WebWare.FormFieldGenie.updateNameByList,
//    cbParams: {order:SoftMoon.WebWare.FormFieldGenie.RomanOrder}  } );
SoftMoon.WebWare.FormFieldGenie.updateNameByList=function(field, indxOffset, params)  { if (typeof params !== 'object')  params=false;
	var pcre=(params  &&  typeof params.pcre == 'object' &&  params.pcre instanceof RegExp)  ?  params.pcre
				:  new RegExp(/\[([a-z]+|[0-9]+)\]/);
	var order=(params  &&  typeof params.order == 'object'  &&  params.order instanceof Array)  ?  params.order
				:  ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh"];
	var indx, lastPosition=field.name.match(pcre);
	if ( (indx=(Number(lastPosition[1])+indxOffset).toString()) === "NaN" )  {
		for (var i=0; i<order.length;)  {i++;  if (lastPosition[1]===order[i-1])  break;}
		if (i+indxOffset>order.length)  indx=(i+indxOffset).toString();  else  indx=order[i-1+indxOffset];  }
	else  {if (Number(indx)<order.length  &&  Number(indx)>0)  indx=order[Number(indx)-1];}
	return field.name.substring(0, lastPosition.index+1) +indx+ field.name.substring(lastPosition.index+lastPosition[1].length+1);
}

// create a new custom order for the standard plugin  updateNameByList
SoftMoon.WebWare.FormFieldGenie.RomanOrder=new Object();
SoftMoon.WebWare.FormFieldGenie.RomanOrder.order=new Array('i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii');
SoftMoon.WebWare.FormFieldGenie.RomanOrder.pcre=null;  //use the default Regular Expression; or you may customize this property

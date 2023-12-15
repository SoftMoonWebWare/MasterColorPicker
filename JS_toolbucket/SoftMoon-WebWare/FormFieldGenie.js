//    encoding: UTF-8 UNIX   tabspacing: 2   word-wrap: none

/* FormFieldGenie version 4.9  (December 13, 2023)
 * written by and Copyright © 2010,2011,2012,2015,2019,2020,2022,2023 Joe Golembieski, Softmoon-Webware
 *
 * API changes from version 4.4 to version 4.5 to version 4.6 to version 4.8 to version 4.9

*=*=*= ¡REQUIRES A MODERN BROWSER!  No longer compatible with early versions of MSIE =*=*=*

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


'use strict';


/*   The SoftMoon “namespace” is usually a constant defined in a “pinnicle” file somewhere else
const SoftMoon=Object.defineProperty({}, "WebWare", {value:{}, enumerable:true});
*/


{  // open a private namespace


//this is our global namespace reference
SoftMoon.WebWare.FormFieldGenie=FormFieldGenie;


// ======= class constructor =======
function FormFieldGenie(opts, HTML_clipMenu, name)  {
	if (!new.target)  throw new Error("“FormFieldGenie” is a constructor, not a function or method.");
	this.config=new FormFieldGenie.ConfigStack(this, opts);
	this.clipboard=new Array;  //new Object; ← the Array acts like a simple Object
	if (HTML_clipMenu instanceof Element)  this.bind_clipMenu(HTML_clipMenu);  
	else if (HTML_clipMenu!==undefined)  throw new Error('The FormFieldGenie “HTML_clipMenu” must be a DOM Element. passed in:',HTML_clipMenu);
	Object.defineProperty(this, "name",
		{get: ()=>name,
		 set: n=>  {
			if (typeof n !== 'string'
			&&  n!==undefined)  throw new Error('FormFieldGenie names must be a string-type variable. typeof '+(typeof n)+' passed in: ',n)
			if (/\n|\r|,/.test(n))  throw new Error('FormFieldGenie names may not contain the comma , character or line-ending \\n \\r characters.');
			name=n?.trim();  },
		 enumerable: true});
	this.name=name;
	this.tabbedOut=false;
	this.catchTab=this.catchTab.bind(this);  }


/*
	The FormFieldGenie instance:
	• provides a framework for automatically and manually adding or deleting another form-field or group of form-fields.
	• makes it easy to manage the names of consecutive form-field elements when adding or deleting.
	• provides a multi-clip clipboard framework for cut/copy/paste operations of a form-field or group of form-fields.

	When adding a new form-field or group of form-fields (using the popNewGroup() method),
	the FormFieldGenie can create (clone) one based on what already exists in the form (more on that below),
	or you can explicitly give it a form-field or group of form-fields to clone.
	You may define an explicit DOM node (form-field or group of form-fields) to clone
	when creating an instance of the FormFieldGenie; for example:
		myGenie=new SoftMoon.WebWare.FormFieldGenie({clone:……my DOM node to clone……, ……more of my options……});
		myGenie.popNewGroup(……)
	After creating an instance of the FormFieldGenie, you may also
	set the instance.config.clone to the explicit DOM node (form-field or group of form-fields) you want to clone (if any).
	An example of defining an explicit node to clone:
		myGenie=new SoftMoon.WebWare.FormFieldGenie;
		myGenie.config.clone= ……my DOM node to clone……
		myGenie.popNewGroup(………)
	After creating an instance of the FormFieldGenie, you may also
	pass-in as an option the explicit DOM node (form-field or group of form-fields) you want to clone (if any).
	An example of passing an explicit node to clone:
		myGenie=new SoftMoon.WebWare.FormFieldGenie;
		myGenie.popNewGroup({clone:……my DOM node to clone……, ……more of my options……})


	The publicly accessible properties of a FormFieldGenie instance are:
		.config
		.clipboard
		.HTML_clipMenu
		.tabbedOut

	The publicly accessible user-methods of a FormFieldGenie instance are:
	popNewGroup(group, opts)     returns true if a new group is ‘popped’ or false if not.
	deleteGroup(group, opts)     returns true if the group was deleted, false if not.
		 cutGroup(group, opts)     returns true if the group was deleted, false if not.  group will always be copied to the clipboard.
		copyGroup(group, opts)     returns null.  group will always be copied to the clipboard.
	 pasteGroup(group, opts)     returns false if the clipboard clip is empty, true if it is pasted.
	clearClipboard()
	getClip(clipID, doInit)  this method is also called internally by other user-methods as a worker-method, but you may utilize it if manually working with the clipboard.
	update_HTML_clipMenu()   this method is also called internally by other user-methods as a worker-method, but you may utilize it if manually updating the clipboard.

	The publicly accessible (and user-replaceable) worker-methods of a FormFieldGenie instance are:
	isActiveField(fieldNode, cbParams)  ← this is called internally by user methods
	catchTab(event)  ← this is to be utilized (called by) by your “onKeyDown” event handler
	catchKey(event)  ← this is NOT defined natively, but is recognized and called by the standard “catchTab” method of an instance


	Note you can paste _two_ different ways using _three_ different methods:
		• paste over an existing group using   pasteGroup(group, {clip: %%your-clip-reference%%})
		• insert a new group using   pasteGroup(group, {doso: 'insert', clip: %%your-clip-reference%%})
		• insert a new group using   popNewGroup(group, {doso: 'paste', clip: %%your-clip-reference%%})
	( see “clip” in “opts” below for more info on %%your-clip-reference%% )
	The difference between popNewGroup and pasteGroup is that pasteGroup will return false if the clip is empty,
	while popNewGroup will simply pop a new “blank” clone if the clip is empty.
	After creating an instance of the FormFieldGenie, the clipboard Object may be accessed through instance.clipboard;
	each clipboard Object property may contain another Object with two properties:
		{
			node: individual clip (DOM node).
			position: the actual position from which this clip was cut (may be different from the field.name’s index value).
		}


		group =
			DOM node object - either the text-input / text-box (i.e. a “fieldNode”), or one of its parent containing nodes (up the DOM hierarchy).
			If a containing node, it may contain any other DOM nodes including nested “batches” and their “groups”.
			The “batch” is the DOM node that contains the complete list/collection of “groups”.
			However, if  opts.doso='addTo'  is passed into the  popNewGroup()  method, then the value which is passed in as
			group  should instead be the containing node (batch) that holds all the  groups
			Very simple Example of HTML:

			<script> var Genie=new SoftMoon.WebWare.FormFieldGenie </script>
			<fieldset>
				<label>
					<input type='text' name='myName[0]'
						onfocus='Genie.tabbedOut=false'
						onkeydown='Genie.catchTab(event)'
						onblur='Genie.popNewGroup(this.parentNode)' />
				</label>
			<fieldset>

			In the above example (and the one below):
			• The <fieldset> is the batch
			• The <labeL> is the group – this could be another tag holding many <labels> and their <inputs>
				There may be any number of groups within the batch
			• The <input> is the fieldNode
			• When the end-user of the above example types something into the input box and then exits it, the HTML above “magically” becomes:

			<script> var Genie=new SoftMoon.WebWare.FormFieldGenie </script>
			<fieldset>
				<label>
					<input type='text' name='myName[0]'
						onfocus='Genie.tabbedOut=false'
						onkeydown='Genie.catchTab(event)'
						onblur='Genie.popNewGroup(this.parentNode)' />
				</label>
				<label>
					<input type='text' name='myName[1]'
						onfocus='Genie.tabbedOut=false'
						onkeydown='Genie.catchTab(event)'
						onblur='Genie.popNewGroup(this.parentNode)' />
				</label>
			<fieldset>

			======= this “options” Object is optional to pass at all, as are all of its properties ========
		opts = {

			maxGroups: maximum number of clones (groups) in the batch.

			minGroups: minimum number of clones (groups) in the batch WHEN USING THE DEFAULT dumpEmpties FUNCTION (see below)

			indxTier: number of index “tiers” to ignore from the beginning or end of a name; used to skip over tier(s) when updating names.
				Positive values skip over tiers starting from the beginning of the name progressing forwards (i.e. a zero-based count),
				while negative values count tiers starting from the end of the name progressing backwards.
				example:  name → myField[4][3][2]  when indxTier=(2) the FormFieldGenie updates/modifies the index that contains “2”
				example:  name → myField[4][3][2]  when indxTier=(-2) the FormFieldGenie updates/modifies the index that contains “3”
				note the Genie looks for the ==next numeric== index, so note the following
				example:  name → myField[4][subsection][3][2]  when indxTier=(-3) the FormFieldGenie updates/modifies the index that contains “4”

			focusField: number
				========= this applies to pasteGroup() and popNewGroup() only =========
				Pass the field number (counted from ZERO) of the text/filename field you want the cursor focused on
				when popping a newly cloned group, or pasting a cloned group with  opts.focus=true

			groupClass: string ‖ RegExp
			groupTag: string → HTML_tagName.toUpperCase();
				these are used to identify which children of a batch are a true group; other children are just ignored “fluff”

			doFocus: true | false
				========= this applies to pasteGroup() and popNewGroup() only =========
				If true, the  focusField  will receive focus, whether or not the tab-key was pressed.
				If false, the  focusField  will not receive focus when the tab key is pressed.
				If no value is passed, then the tab-key will cause the focusField to receive focus
				when popping a new fieldNodeGroup.

			dumpEmpties: true | false | function(empty_groupInQuestion, deleteFlag)  remove emptied groups on the fly?
				========= this applies to deleteGroup() and popNewGroup() only, and not when inserting or pasting =========
				if a function is supplied, it should return  true | false | null
				and if null is returned, the function should remove the field itself.
				If you use deleteGroup(), the fieldNodeGroup will be removed even if dumpEmpties===false;
					however, if dumpEmpties	is a function, it will be called with the value of  deleteFlag=true
					and its return value (true|false) will be respected.

			checkForFilled: 'all' ‖ 'one' ‖ 'some' ‖ 'any'
				========= this applies to deleteGroup() and popNewGroup() only, and not when inserting or pasting =========
				If set, the corresponding text/filename fields in the nodeGroup will be checked.
				By default only the -first- one is checked.
				If 'one' or 'some' or possibly 'any', the  checkField  option should be used also (see below).
				• 'one' →
					the “specified field” is indexed by  checkField
					if the one specified field is full, a new group is popped.
					if the one specified field is empty, the group may be dumped (automatically deleted).
				• 'any' →
					the “specified fields” are either all of the fields in the group,
					or if  checkField  is an array, it should contain the numeric indices of the fields
					if any one of the specified fields is full, a new group is popped.
					if all of the specified fields are empty, the group may be dumped (automatically deleted).
				• 'some' →
					each of the -first- "checkField" number of fields specified will be checked,
					or if  checkfield  is an array, it should contain the numeric indices of the fields
					if all of the specified fields are full, a new group is popped.
					if all of the specified fields are empty, the group may be dumped (automatically deleted).
				• 'all'
					if all of the fields in the group are full, a new group is popped.
					if all of the fields in the group are empty, the group may be dumped (automatically deleted).

			checkField: number ‖ array
				========= this applies to deleteGroup() and popNewGroup() only, and not when inserting or pasting =========
				Used in conjunction with  checkForFilled
				• if checkField is a number (when  checkForFilled = 'one' ‖ 'some')
					Pass the field number (counted from ZERO) of the field or fields you want checked for "Empty" when popping.
					If  checkForFilled='some'  the each of the first  number  of fields will be checked.
				• if checkField is an Array (when  checkForFilled = 'any' ‖ 'some')
					The array should contain numeric values that are the indices of the fields to check

			updateName: function(field, indxOffset, batch, cbParams)  { your plugin code }
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

			batchCustomizer: function(batch, pasteOver, cbParams)  { your customizing code }
				This is called when a new fieldNodeGroup is being popped, pasted,
					or when a fieldNodeGroup is deleted or was empty and has been dumped.
				It is called from a setTimeout function, so the DOM will be fully updated.
				Use it to do any final customizing.
				Note it is passed the whole batch node containing all groups
				including the new one after it has been added to the document, not simply the newly cloned group.

			doso: true | "insert" | "paste"
				========= this applies to popNewGroup() and pasteGroup() only =========
				If you pass (Boolean)true when using popNewGroup(), a new field will be popped at the end regardless of whether the last field is empty;
					but not exceeding maxGroups.  Empty fieldNodeGroups may be removed as usual.
				Empty fieldNodeGroups will NOT be automatically removed if "insert" when using popNewGroup().
				If you pass "insert" or "paste" when using popNewGroup(), a new field will be popped and inserted BEFORE the passed fieldNodeGroup,
					regardless of whether the last field is empty; but not exceeding maxGroups.
				With popNewGroup(), “insert” inserts an empty fieldNodeGroup.
				With pasteGroup(), “insert” inserts the selected clip.
				With popNewGroup(), “paste” inserts the selected clip.

			addTo: true
				========= this applies to popNewGroup() only =========
				If you pass  opts.addto=true, then the value that would be passed into popNewGroup as  fieldNodeGroup
					will be instead considered the  batch.
				This will allow you to add a new field to empty  batches
					but only if •the Genie.clone is set; •or opts.doso='paste' while the clipboard has contents.
				Passing  opts.addto=true  acts similar as passing  opts.doso=true  in that it will always pop a new field
					(unless as noted above the  batch  is empty and there is no clone and no paste)
				Note that pasteGroup() with opts.doso='insert' internally calls calls popNewGroup(), and this option
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
	indxTier: -1,
	focusField: 0,
	doFocus: null,
	isActiveField: undefined,   /*Boolean  or  user function returns Boolean;  see also isActiveField() method*/
	dumpEmpties: dumpEmpties,   /*Boolean  or  user function returns Boolean|null*/
	minGroups: 1,   /* min number of groups in the batch when checking to dump empties using the above default “dumpEmpties” function */
	maxGroups: 100,
	groupClass: "",       /* string  or  RegExp */
	groupTag: null,        /* htmlTagNameString.toUpper() */
	checkForFilled: "one",  // ‖ any ‖ all ‖ some
	checkField: 0, //← zero(0)-based index when checkForFilled='one';  1-based count when ='some';  may be an Array of indices for 'any' & 'some';  unused otherwise
	updateName: null,       /*user function*/
	cloneCustomizer: null,  /*user function*/
	eventRegistrar: null,   /*user function*/
	batchCustomizer: null,  /*user function*/
	minPixWidth: 4,  //for an input to be "active"
	minPixHeight: 4,  // ↑
	clone: null,
	clip: "_system_",  //if you cut/copy/paste w/out specifying the clipboard “clip”
	clear_clips_whenRetrieved: false, // can we paste the same clip multiple times, or do we automatically free up memory?
	only_clips_inAll: true, // when using Genie.getClip('all clips'), only return the clipboard.clips array ? (clipboard is itself an Array that can hold other clips).
	no_system_inAllClips: true, // when using Genie.getClip('all clips'), avoid clips with names that contain _system_ ?
	// the above two items also control the  update_HTML_clipMenu()  method and which clipboard items are added to the menu.
	make_clipMenu_focusable: true,  // add a  tabindex="-1"  attribute to dynamic HTML_clipMenu list items
	namedElements: 'input, textarea, select, button',  //←this string must work with querySelectorAll();  These are elements who’s names will be updated
	userDataInputTypes: [  // these are the input-types that users have to type something into for them to have a “value”
		'text', 'search', 'tel', 'url', 'email', 'password', 'datetime', 'date',
		'month', 'week', 'time', 'datetime-local', 'number', 'color', 'file' ]
		}
Object.defineProperties( FormFieldGenie.ConfigStack.prototype, {
	stack: { value: function($newConfig) {
			this.owner.config=Object.create(this);
			for (var p in $newConfig) {this.owner.config[p]=$newConfig[p];}
			return this.owner.config;  }  },
	cull: { value: function() {
			if (!this.hasOwnProperty("owner"))  this.owner.config=Object.getPrototypeOf(this);
			return this.owner.config;  }  },
	reset: { value: function() {
			while (!this.owner.config.hasOwnProperty("owner"))  {
				this.owner.config=Object.getPrototypeOf(this.owner.config);  }
			return this.owner.config;  }  }  } );

//===============================================================


// ======= worker methods =======

// The “catchTab” method is meant to be called by an “onKeyDown” event handler
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
	// ¡NOTE! the HTML-attribute is “catch-key” (all lowercase) while the method on the Element is “catchKey” (camelCase)
	if (typeof event.target.catchKey !== 'function'  &&  event.target.hasAttribute('catch-key'))  {
		try {event.target.catchKey=new Function('event', event.target.getAttribute('catch-key'));} catch(e){}  }
	if (typeof event.target.catchKey === 'function')  return event.target.catchKey(event);
	if (typeof this.catchKey === 'function')  return this.catchKey(event);
	return true;  }


//	isActiveField: function(field, cbParams)  { your customizing code }
//  You can replace this standard function to check if a form field is currently active or not;
//  i.e. is it disabled?, or is it even displayed at all?
//  You may add/subtract your own rules, perhaps checking the status of another element.
//  Inactive elements will not be considered when deciding to pop a new group or dump an empty one.
// 	Your function should return true/false.
FormFieldGenie.prototype.isActiveField=function(field, cbParams)  {
	switch (typeof this.config.isActiveField)  {
		case 'function': return this.config.isActiveField(field, cbParams);
		case 'boolean':  return this.config.isActiveField;  }
	if ( typeof field.offsetWidth === 'number'
	&&  ( field.offsetWidth<this.config.minPixWidth
		||  field.offsetHeight<this.config.minPixHeight ) )  return false;
	var style;
	do {
		if (field.disabled
		||  ( (style=getComputedStyle(field))
				 &&  (style.display==='none'  ||  style.visibility==='hidden') ) )  return false;  }
	while  ( (field=field.parentNode)  instanceof Element );
	return true;  }


// This is the default function found at: SoftMoon.WebWare.FormFieldGenie.ConfigStack.prototype.dumpEmpties
//    ( GenieInstance.config.dumpEmpties )
// Note that: deleteGroup() passes  true  as the second value, which this default function below ignores.
// Your custom dumpEmpties function may utilize this second value passed by deleteGroup()
// to make a distinction between a user request and an automatic “cleanup”.
function dumpEmpties(elmnt)  {
	var count=0;
	for (const group of elmnt.parentNode.children)  {
		if (isGroup(group))  count++;  }
	return count>config.minGroups;  }
/*
function dumpEmpties(elmnt)  {
	elmnt=elmnt.parentNode.children;
	for (var count=0, i=0; i<elmnt.length; i++)  {
		if (typeof config.groupTag !== 'string'
		||  elmnt[i].nodeName===config.groupTag)
				count++;  }
	return (count>config.minFields);  }
*/




	// these are "private" variables "global" to this class
	let thisGenie,
			config,
			groupClass,
			batch;


	// "private" methods to this class are below

	function init(group, opts, addTo) {

		thisGenie=this;

		if (opts)  this.config.stack(opts);
		config=this.config;

		if (typeof config.groupClass === "string"  &&  config.groupClass.length>0)  groupClass=RegExp("\\b"+config.groupClass+"\\b");
		else if (config.groupClass instanceof RegExp)  groupClass=config.groupClass;
		else groupClass="";

		if (addTo)  batch=group;  // only myGenie.popNewGroup(batch, {addTo:true})
		else  batch=group.parentNode;  //may be any parent tag; not limited to <fieldset> <ol> <td> <div> etc.

	}  // close init


	function gatherFields(group)  {
		var fields=new Array;
		for (let i=0; i<group.childElementCount; i++)  {
			const n=group.children[i];
			if (n.hasChildNodes())  {fields=fields.concat(gatherFields(n));  continue;}
			switch (n.nodeName)  {
				case "INPUT": 	 if (!config.userDataInputTypes.includes(n.type))  continue;
				case "TEXTAREA": if (thisGenie.isActiveField(n, config.cbParams))  fields.push(n);  }  }
		return fields;  }

	function getField(group, check)  {
		if (!(group instanceof Element))  return null;
		if (!group.hasChildNodes())  switch (group.nodeName)  {
				case "INPUT":     if (!config.userDataInputTypes.includes(group.type))  return null;
				case "TEXTAREA":  if (!thisGenie.isActiveField(group, config.cbParams))  return null;
					return (check) ?  ((group.value.length===0)^(check==="isFull?"))  :  group;
				default: return null;  }
		const fields=gatherFields(group);
		if (check)  switch (config.checkForFilled)  {
			case 'one':
				//a specific field is checked to be either full or empty
				return (fields.length>config.checkField) ?  (fields[config.checkField].value.length===0)^(check==="isFull?")  :  null;
			case 'any':
				//any one field in the Array of specified fields of the group may be filled for the group to be "full";  (do we pop a new field?)
				//all must be empty to be empty;  (do we dump this group?)
				if (config.checkField instanceof Array)  {
					for (const i of config.checkField)  {
						if (fields[i]===undefined)  return null;
						if (fields[i].value.length!==0)  return check==='isFull?';  }
					return (fields.length) ? (check==='isEmpty?') : null;  }
				//any one field in the group may be filled for the group to be "full";  (do we pop a new field?)
				//all must be empty to be empty;  (do we dump this group?)
				for (const field of fields)  {
					if (field.value.length!==0)  return check==='isFull?';  }
				return (fields.length) ? check==='isEmpty?' : null;
			case 'some':
				//all of the fields in the Array of specified fields of the group must be filled for the group to be "full";  (do we pop a new field?)
				//all of the fields in the Array of specified fields of the group must be empty to be empty;  (do we dump this group?)
				if (config.checkField instanceof Array)  {
					for (const i of config.checkField)  {
						if (fields[i]===undefined)  return null;
						if ((fields[i].value.length===0)^(check==="isEmpty?"))  return false;  }
					return (fields.length) ? true : null;  }
				//all of the first “checkField” number of fields in the group must be filled for the group to be "full";  (do we pop a new field?)
				//all of the first “checkField” number of fields must be empty to be empty;  (do we dump this group?)
				if (fields.length<config.checkField  ||  config.checkField<1)  return null;
				var s=config.checkField;
			case 'all':
				//all fields in the group must be filled for the group to be "full";  (do we pop a new field?)
				//all must be empty to be empty;  (do we dump this group?)
				s??=fields.length;
				for (let i=0; i<s; i++)  {
					if ((fields[i].value.length===0)^(check==="isEmpty?"))  return false;  }
				return (fields.length) ? true : null;  }
		else  return (fields.length>config.focusField) ?  fields[config.focusField]  :  null;  }


	function isGroup(e)  {return (!config.groupTag  ||  e.nodeName===config.groupTag)  &&  e.className.match(groupClass);}

	function getNextGroup(group)  {
		do {group=group.nextElementSibling}
		while  (group!=null  &&  (!isGroup(group)  ||  getField(group)==null));
		return  group;  }

	function getPreviousGroup(group)  {
		do {group=group.previousElementSibling}
		while  (group!=null  &&  (!isGroup(group)  ||  getField(group)==null));
		return  group;  }

	function getFirstGroup()  { var firstGroup=batch.firstElementChild;
		while (firstGroup!=null  &&  (!isGroup(firstGroup)  ||  getField(firstGroup)==null))  {
			firstGroup=firstGroup.nextElementSibling;  }
		return firstGroup;  }

	function getLastGroup()  { var lastGroup=batch.lastElementChild;
		while (lastGroup!=null  &&  (!isGroup(lastGroup)  ||  getField(lastGroup)==null))  {
			lastGroup=lastGroup.previousElementSibling;  }
		return lastGroup;  }


	function updateGroupNames(group, indxOffset=1, resetFlag=true)  {  //also reset default values when resetFlag==true
		if (group.hasChildNodes())
			for (const field  of  group.querySelectorAll(config.namedElements))  {
				field.name=updateName(field, group);
				if (resetFlag)  resetValsEtc(field);  }
		else  {
			group.name=updateName(group, group);
			if (resetFlag)  resetValsEtc(group);  }

		//extend updateGroupNames()

		function resetValsEtc(field)  {
			if (field.nodeName==='INPUT'  &&  field.type.toLowerCase()==='file')  {
				field.value="";  //most browsers ignore this anyway
				if (field.value=="")  return;
				const newFileField=document.createElement('input');  // alert('new');
				for (const prop in field)  { try  {
					if (prop!=='value'  &&  prop!=='defaultValue'  &&  prop!=='id')  //  &&  prop!=='attributes'  &&  prop!=='baseURI'  &&  prop!=='document'  &&  prop!=='childNodes'  &&  prop!=='children'  &&  prop!=='parentNode'
							{newFileField[prop]=field[prop];}  }  //Opera had a bug that will not propagate the copy of a copy of a copy properly.
					catch(e) {}  }
				field.parentNode.replaceChild(newFileField, field);  return;  }
			if (field.defaultValue!==undefined)  field.value=field.defaultValue;
			if (field.defaultChecked!==undefined)  field.checked=field.defaultChecked;
			if (field.selectedIndex!==undefined)  field.selectedIndex=selectDefaults(field);  }

		function updateName(field, group)  {
			if (config.updateName)  {
				const fieldName=config.updateName(field, indxOffset, group, batch, config.cbParams);
				if (typeof fieldName === "string")  return fieldName;  }
			if (field.hasAttribute('update-value-genie')  &&  valueUpdater(field))  return field.name;
			if (field.name.endsWith("]"))  return updateTieredName(field);
			const valIncr=field.name.match(/(.*[^0-9])?([0-9]+)$/); 
			if (valIncr!==null)
				return ((typeof valIncr[1] !== "undefined") ? valIncr[1] : "") + (Number(valIncr[2])+indxOffset).toString();
			else  return field.name;  }

		function valueUpdater(field)  { 
			const genieNames=field.getAttribute('update-value-genie')?.split(',').map(n=>n.trim());
			if (genieNames!==null  &&  !genieNames.includes(thisGenie.name))  return false;
			if (field.tagName==='INPUT'  &&  (field.type==='radio'  ||  field.type==='checkbox')
			&&  /^([0-9]*\.)?[0-9]+$/.test(field.value))  {
				field.value=(parseFloat(field.value)+indxOffset).toString();  return true;  }  }

		function updateTieredName(field)  {
			const
				nummedTiers=new Array,
				tierRegEx=/\[\d+\]/g;
			var tier, indxTier;
			while (tier=tierRegEx.exec(field.name))  {nummedTiers.push({spec:tier[0], pos:tier.index})};
			getTierIndex: {
				if (field.hasAttribute('genie-tier-index'))  { // your Genie names:   ↓↓↓           ↓↓↓           ↓↓↓     
					// <input name='foo[1][bar][3][baz][7][bing][]' genie-tier-index='myGenie: 0, otherGenie: 1, etcGenie: -2'>
					//                                                           updates:  [1] ↑          [3] ↑        [7] ↑↑
					// remember only numeric indexes in the name are “counted”
					// the default indxTier value of (-1) points to the numerically-implicit index [] at the end
					indxTier=field.getAttribute('genie-tier-index').split(",").map(s=>s.trim().split(":"));
					for (const _tier of indxTier)  {
						if (_tier[0]===thisGenie.name) {indxTier=parseInt(_tier[1]);  break getTierIndex;}  }  }
				indxTier=config.indxTier;  }
			if (Number.isNaN(indxTier)  ||  (typeof indxTier !== 'number'  &&  !(indxTier instanceof Number)))  return field.name;
			if (field.name.endsWith("[]"))  { // an “implicitly numbered tier”
				if  (indxTier===(-1)  ||  indxTier===nummedTiers.length)  return field.name;
				nummedTiers.length++;  }
			if (indxTier>=nummedTiers.length
			||  (indxTier<0  &&  Math.abs(indxTier)>nummedTiers.length))  return field.name;
			tier= nummedTiers[ (indxTier<0) ? (nummedTiers.length+indxTier) : indxTier ];
			return field.name.substring(0,tier.pos+1) + (parseInt(tier.spec.substring(1)) + indxOffset) + field.name.substring(tier.pos+tier.spec.length-1);  }

		function selectDefaults(slct)  {
			const allOptns=slct.getElementsByTagName('option');
			if (allOptns.length==0)  return null;
			var slctdOpt=null;
			for (let i=allOptns.length-1; i>=0; i--)  {if (allOptns[i].selected=allOptns[i].defaultSelected)  slctdOpt=i;}
			return slctdOpt;  }

	/*close updateGroupNames*/  }


	function getPosition(targetGroup)  {
		var group=getFirstGroup(), count=0;
		while (group  &&  group!==targetGroup)  {
			++count;
			group=getNextGroup(group);  }
		return count;  }


	function deleteGroup(group, opts)  {
		if ( typeof thisGenie.config.dumpEmpties === 'function'  &&  !thisGenie.config.dumpEmpties(group, true) )   return false;
		var nextGroup=getNextGroup(group);
		batch.removeChild(group);
		while (nextGroup!==null) {updateGroupNames(nextGroup, -1, false);  nextGroup=getNextGroup(nextGroup);}
		if (typeof batchCustomizer == "function")  batchCustomizer(batch, false, config.cbParams);
		if (opts  &&  opts.refocus)  setTimeout(function() {getField(getLastGroup()).focus();}, 1);
		return true;  }

	function alignSelectValues(source, clone)  { const _clone_=clone;
		if ((source=source.getElementsByTagName('select'))
		&&  (clone=clone.getElementsByTagName('select')))
			for (var j, i=0; i<source.length; i++)  { for (j=0; j<clone[i].options.length; j++)  {
				clone[i].options[j].selected= source[i].options[j].selected;  }  }
		return _clone_;  }


 function popNewGroup(focusGroup, opts, clip, avoidInsertTimeout=false)  {
	var newGroup, cloned, groupCount=0, group=getFirstGroup(), flag=false, pasted=false;
	function timeoutForInsert(insertedGroup)  {
		if (typeof config.batchCustomizer === 'function')  config.batchCustomizer(batch, pasted, config.cbParams);
		if (config.doFocus!==false)  getField(insertedGroup).focus();  }

	if (opts  &&  (opts.doso==='insert'  ||  opts.doso==='paste'))  {
		var groupPos=0, offSet;
		while (group)  {
			if (++groupCount>config.maxGroups)  return false;
			else  {
				if (group===focusGroup)  groupPos=groupCount-1;
				group=getNextGroup(group);  }  }
		if (opts.addTo)  groupPos=groupCount;
		if (opts.doso==='paste'
		&&  (clip=clip||this.getClip(config.clip)))  {
			if (clip.node instanceof Element)  {
				pasted=true;
				cloned=clip.node;
				newGroup=config.clear_clips_whenRetrieved ? cloned : cloned.cloneNode(true);
				alignSelectValues(cloned, newGroup);
				offSet=groupPos-clip.position;  }
			else if (clip instanceof Array)  {
				for (let i=0; i<clip.length; i++)  {
					const inserted=popNewGroup.call(this, focusGroup, opts, clip[i], true);
					if (inserted)  {flag=true;  newGroup=inserted;}  }
				if (flag)  setTimeout(timeoutForInsert.bind(null, newGroup), 0);
				return flag;  }
			else  return false;  }
		else if (config.clone instanceof Element)  {
			newGroup=(cloned=config.clone).cloneNode(true);
			alignSelectValues(cloned, newGroup);
			offSet=groupPos;  }
		else {
		//the last field should have standard default values, so we clone this one.
		//the server-side script may accept the list and spit it back out as filled-in values in the form;
		// if it does this, one more (empty) group should be added at the end
			cloned=getLastGroup();
			if (cloned===null)  return false;
			newGroup=cloned.cloneNode(true);
			alignSelectValues(cloned, newGroup);
			offSet=groupPos-groupCount+1;
			flag=true;  }
		if (!opts.addTo)  {
			group=focusGroup;
			do {updateGroupNames(group, 1, false);}  while ((group=getNextGroup(group))!==null);  }
		updateGroupNames(newGroup, offSet, flag);
		if (typeof config.cloneCustomizer === 'function')
			config.cloneCustomizer(newGroup, pasted, config.cbParams);
		if (opts.addTo)
			batch.appendChild(newGroup);
		else  batch.insertBefore(newGroup, focusGroup);
		if (typeof config.eventRegistrar === 'function')  config.eventRegistrar(newGroup, pasted, config.cbParams);
		newGroup.dispatchEvent(new CustomEvent('formfieldgenieclone',
			{detail: {genie: this, clip:{node:cloned, position:groupPos-offSet}, pasted:pasted}, bubbles: true, cancelable: true}));
		if (!avoidInsertTimeout)  setTimeout(timeoutForInsert.bind(null, newGroup), 0);
//		this.lastNewField=newGroup;
		return newGroup;  }
	var nextGroup, emptyFlag, removedCount=0;
	// remove sibling node Groups with empty text fields
	if (group!==null)
	do  { nextGroup=getNextGroup(group);  emptyFlag=getField(group, "isEmpty?");
		if (emptyFlag!==null)  {
			if (config.dumpEmpties  &&  nextGroup!==null  &&  emptyFlag)  {
				if ( typeof config.dumpEmpties === 'function'  &&  !(flag=config.dumpEmpties(group)) )  {
					if (flag===false)  { groupCount++;
						if (removedCount<0)  updateGroupNames(group, removedCount, false);  }
					if (flag===null)  removedCount--;  }
				else  {
					batch.removeChild(group);
					removedCount--;  }  }
			else  { groupCount++;
				if (removedCount<0)  updateGroupNames(group, removedCount, false);  }  }  }
	while (nextGroup!==null  &&  (group=nextGroup));

	var lastGroup;
	if (groupCount<config.maxGroups
	&&  (getField(lastGroup=getLastGroup(), "isFull?")	||  (opts && (opts.doso || opts.addTo))))  {
	// create a new node containing an empty text-input field
	//  clone the node at the end of the <fieldset> (or other <parent>) of the node passed to keep names sequential
	//  clone the whole node to allow wrapper tags
	//     (for example <label> or <fieldset>), other text, other fields, etc.
	//  update all form-control-tag "name"s and reset default values
	//  if the TAB key was pressed to exit this input field, focus the cursor at the newly generated field.
		if (config.clone instanceof Element)  {
			newGroup=(cloned=config.clone).cloneNode(true);
			alignSelectValues(cloned, newGroup);
			offSet=groupCount;
			flag=false;  }
		else {
			cloned=getLastGroup();
			if (cloned===null)  return false;
			newGroup=cloned.cloneNode(true);
			alignSelectValues(cloned, newGroup);
			offSet=1;
			flag=true;   }
		updateGroupNames(newGroup, offSet, flag);
		if (typeof config.cloneCustomizer == "function")
			config.cloneCustomizer(newGroup, false, config.cbParams);
		if (batch.lastElementChild===lastGroup)
			batch.appendChild(newGroup);
		else  batch.insertBefore(lastGroup.nextElementChild, newGroup);
		if (typeof config.eventRegistrar == "function")
			config.eventRegistrar(newGroup, false, config.cbParams);
		newGroup.dispatchEvent(new CustomEvent('formfieldgenieclone',
			{detail: {genie: this, clip:{node:cloned, position:groupCount-offSet}, pasted:false}, bubbles: true, cancelable: true}));
		flag=true;  }
	else  flag=false;  //we are not popping a new field

	if (removedCount<0  ||  newGroup)   {
		var tabbedOut=this.tabbedOut;
		setTimeout(
			function () {
				if (typeof config.batchCustomizer === "function")
					config.batchCustomizer(batch, false, config.cbParams);
				if ((tabbedOut && config.doFocus!==false)  ||  config.doFocus)
					getField(getLastGroup()).focus();  },
			0);  }

	//if (flag)  this.lastNewField=newGroup;

	return flag && newGroup;  }

//===============================================================


// ======= user methods =======


FormFieldGenie.prototype.popNewGroup=function(focusGroup, opts)  {
	try {
		init.call(this, focusGroup, opts, opts?.addTo);
		return popNewGroup.call(this, focusGroup, opts);  }
	finally {if (opts)  this.config.cull();}  }

FormFieldGenie.prototype.pasteGroup=function(group, opts)  {
	try {
		init.call(this, group, opts);
		var flag, clip;
		if ( !( (clip=this.getClip(config.clip))  &&  (clip instanceof Array  ||  clip.node instanceof Element) ) ) return false;
		if (opts  &&  opts.doso==='insert')  {
			opts.doso='paste';  flag=popNewGroup.call(this, group, opts, clip);  opts.doso='insert';
			return flag;  }
		const newGroup=config.clear_clips_whenRetrieved ? clip.node : clip.node.cloneNode(true);
		alignSelectValues(clip.node, newGroup);
		updateGroupNames(newGroup, getPosition(group)-clip.position, false);
		if (typeof config.cloneCustomizer === 'function')
			config.cloneCustomizer(newGroup, 'paste-over', config.cbParams);
		batch.replaceChild(newGroup, group);
		if (typeof config.eventRegistrar === 'function')  config.eventRegistrar(newGroup, 'paste-over', config.cbParams);
		newGroup.dispatchEvent(new CustomEvent('formfieldgenieclone',
			{detail: {genie: this, clip:clip, pasted:'paste-over'}, bubbles: true, cancelable: true}));
		setTimeout(function() {
			if (typeof config.batchCustomizer === 'function')  config.batchCustomizer(batch, 'paste-over', config.cbParams);
			if (opts  &&  opts.doso)  {
				const ods=opts.doso;  opts.doso=null;
				popNewGroup.call(thisGenie, group, opts);
				opts.doso=ods;  }
			if (config.doFocus)  getField(newGroup).focus();  }, 0);
		return true;  }
	finally {if (opts)  this.config.cull();}  }

FormFieldGenie.prototype.deleteGroup=function(group, opts)  {
	try {
		init.call(this, group, opts);
		return deleteGroup(group, opts);  }
	finally {if (opts)  this.config.cull();}  }

FormFieldGenie.prototype.cutGroup=function(group, opts)  {
	try {
		init.call(this, group, opts);
		copyGroup.call(this, group);
		return deleteGroup(group, opts);  }
	finally {
		this.update_HTML_clipMenu();
		if (opts)  this.config.cull();  }  }

function copyGroup(group)  {
	Object.defineProperties(this.getClip(config.clip, true), {      //  ↓↓ this is returned from alignSelectValues()
		node: {value: alignSelectValues(group, group.cloneNode(true)), enumerable: true, writable: false, configurable: false},
		position: {value: getPosition(group), enumerable: true, writable: false, configurable: false}  });  }

FormFieldGenie.prototype.copyGroup=function(group, opts)  {
	try {
		init.call(this, group, opts);
		copyGroup.call(this, group);  }
	finally {
		this.update_HTML_clipMenu();
		if (opts)  this.config.cull();  }  }


// here you can change the text-content and/or language that the FormFieldGenie recognizes/produces in “HTML_clipMenus”
FormFieldGenie.prototype.HTML_clipMenu_TEXT={
	insert: 'insert:',
	copy:'copy to:',      
	cut:'cut to:',        
	paste:'paste from:',    
	dlt:'delete',         
	clear:'clear clipboard',
	confirm: "Do you want to clear this Form's Clipboard?",
	clip: "clip ",
	allClips: "all clips",
	newClip: "new clip" };
	

// note that when  ref='clip X'  (where X is a number) clipboard.clips[X-1] is returned
// but that when  ref=X  (where X is a number) clipboard.clips[X] is returned
FormFieldGenie.prototype.getClip=function(ref, doInit)  {
	var x, grabbed=false;
	try  {
		if (!(this.clipboard instanceof Object))  {
			if (doInit)  this.clipboard=new Object;
			else  return false;  }
		if (typeof ref === 'string')  {
			if (ref.toLowerCase()===this.HTML_clipMenu_TEXT.allClips)  {
				var allClips= (this.clipboard.clips instanceof Array  &&  this.clipboard.clips.length>0  &&  this.clipboard.clips.slice(0));
				if (allClips)  grabbed=true;
				if (config.clear_clips_whenRetrieved)  this.clipboard.clips=new Array;
				if (config.only_clips_inAll)  return allClips;
				allClips= allClips || new Array;
				for (x in this.clipboard)  {
					if (x==='clips'  ||  (config.no_system_inAllClips  &&  /_system_/.test(x)))  continue;
					grabbed=true;
					allClips.push(this.clipboard[x]);
					if (config.clear_clips_whenRetrieved)  delete this.clipboard[x];  }
				return allClips.length>0  &&  allClips;  }
			if (ref.toLowerCase()===this.HTML_clipMenu_TEXT.newClip)  {
				if (!(this.clipboard.clips instanceof Array))  this.clipboard.clips=new Array;
				return this.clipboard.clips[this.clipboard.clips.length]=new Object;  }
			if (!doInit  &&  this.clipboard[ref] instanceof Object)  {
				grabbed=true;
				const clip=this.clipboard[ref];
				if (config.clear_clips_whenRetrieved)  delete this.clipboard[ref];
				return clip;  }
			if (x=ref.match( /^clip ?([0-9]+)$/i ))  ref=parseInt(x[1])-1;
			else
			if (doInit)  return this.clipboard[ref]=new Object;  }
		if (typeof ref !== 'number')  return false;
		if (!(this.clipboard.clips instanceof Array))  {
			if (doInit)  this.clipboard.clips=new Array;
			else  return false;  }
		if (doInit)  return this.clipboard.clips[ref]=new Object;
		if (this.clipboard.clips[ref] instanceof Object)  {
			grabbed=true;
			const clip=this.clipboard.clips[ref];
			if (config.clear_clips_whenRetrieved)  delete this.clipboard.clips[ref];
			return clip;  }
		return false;  }
	finally {if (grabbed  &&  config.clear_clips_whenRetrieved)  this.update_HTML_clipMenu();}  }


FormFieldGenie.prototype.clearClipboard=function(confirmed)  {
	if (confirmed  ||  confirm(this.HTML_clipMenu_TEXT.confirm))  {
		this.clipboard=new Object;
		this.update_HTML_clipMenu();  }  }


FormFieldGenie.prototype.update_HTML_clipMenu=function()  {
	if (!(this.HTML_clipMenu instanceof Element)  ||  typeof this.clipboard !== 'object')	 return false;
	const
		ul=this.HTML_clipMenu.getElementsByTagName('ul'),
		items=document.createDocumentFragment();
	if (this.clipboard.clips instanceof Array)  for (let i=0; i<this.clipboard.clips.length; i++)  {
		if (this.clipboard.clips[i])  {
			const li=document.createElement('li');
			li.append(this.HTML_clipMenu_TEXT.clip+(1+i));
			if (this.config.make_clipMenu_focusable
			||  this.HTML_clipMenu_is_bound)  li.setAttribute('tabindex', '-1');
			items.appendChild(li);  }  }
	if (!this.config.only_clips_inAll)  for (const i in this.clipboard)  {
		if (i==='clips'  ||  (this.config.no_system_inAllClips  &&  i.match( /_system_/ )))  continue;
		const li=document.createElement('li');
		li.append(i);
		if (this.config.make_clipMenu_focusable
		||  this.HTML_clipMenu_is_bound)  li.setAttribute('tabindex', '-1');
		items.appendChild(li);  }

	for (let i=0; i<ul.length; i++)  {
		const li=ul[i].getElementsByTagName('li');
		for (let j=0; j<li.length  &&  li.length!==0; )  {if (li[j].hasAttribute('standard'))  j++;  else  ul[i].removeChild(li[j]);}
		if (items.hasChildNodes())  {
			if  ((i+1) === ul.length)
				ul[i].appendChild(items);
			else
				ul[i].appendChild(items.cloneNode(true));  }  }
	const event=new CustomEvent('ffgeniemenuupdate', {bubbles:true});
	event.genie=this;
	this.HTML_clipMenu.dispatchEvent(event);  }


FormFieldGenie.prototype.bind_clipMenu=function bind_clipMenu(flag=true)  {
	const menu=(flag instanceof Element) ? flag : this.HTML_clipMenu;
	flag=Boolean(flag);
	if (flag)  {
		this.HTML_clipMenu=menu;
		menu.addEventListener('click', this);
		menu.addEventListener('keydown', this);
		menu.addEventListener('focusout', this);  }
	else  {
		menu.removeEventListener('click', this);
		menu.removeEventListener('keydown', this);
		menu.removeEventListener('focusout', this);  }
	this.HTML_clipMenu_is_bound=flag;
	// we initially remove the menu from the DOM so it is not displayed or active
	menu.remove();  }


FormFieldGenie.prototype.show_clipMenu=function show_clipMenu(event, group, container)  {
	event.preventDefault();  event.stopPropagation();
	const menu=this.HTML_clipMenu;
	if (menu.isConnected)  {
		if  (container.contains(menu))  return;
		menu.parentNode.removeAttribute('aria-controls');
		menu.parentNode.removeAttribute('aria-expanded');
		for (const li of menu.querySelectorAll('*[aria-expanded]'))  {li.setAttribute('aria-expanded', 'false');}  }
	currentGroup=group;
	container.appendChild(menu);
	container.setAttribute('aria-controls', menu.id);
	container.setAttribute('aria-expanded', 'true');

	originalTarget= (event.type==='keydown') ?  event.target : undefined; 
	nextOfKin=getNextGroup(group)||getPreviousGroup(group);
	if (nextOfKin)  nextOfKin=getField(nextOfKin);

	const e=new CustomEvent('popUp', {bubbles:true, detail:event});
	e.group=group;  e.container=container;
	menu.dispatchEvent(e);
	const newFocus=menu.querySelector('*[tabindex]');
	if (newFocus)  {
		if (newFocus.childElementCount>0)  newFocus.setAttribute('aria-expanded', 'true');
		newFocus.focus();  }  }

	
let currentGroup, originalTarget, nextOfKin;


FormFieldGenie.prototype.handleEvent=
FormFieldGenie.prototype.clipMenu_controller=menuController;
function menuController(event)  {
	const menu=this.HTML_clipMenu;
	switch (event.type)  {
	case 'keydown':  {
		if (this.handleKeydownInMenu(event))  return;
		if (this.config.doFocus)  switch (event.opStatus)  {  //other opStatus means the Genie handles focus or user clicked elsewhere
			case 'noMod':
				originalTarget?.focus(); 
			break;
			case 'removed':  // the Genie will always insure at least one group is left
				nextOfKin?.scrollIntoView({behavior:'smooth', block:'nearest'});
				nextOfKin?.focus();  }  
		const e=new CustomEvent('popDown', {bubbles:true, detail:event});
		menu.dispatchEvent(e);
		return;  }
	case 'click':  {
		this.onGenieMenuSelect(event);
		if (event.menuSelectReturnStatus)  {event.stopPropagation();}
		else  {
			const e=new CustomEvent('popDown', {bubbles:true, detail:event});
			menu.dispatchEvent(e);  }
		return;  }
	case 'focusout':  {
		if (menu.contains(event.relatedTarget))  return;
		menu.parentNode.removeAttribute('aria-controls');
		menu.parentNode.removeAttribute('aria-expanded');
		for (const li of menu.querySelectorAll('*[aria-expanded]'))  {li.setAttribute('aria-expanded', 'false');}
		currentGroup=undefined;
		const e=new CustomEvent('popDown', {bubbles:true, detail:event});
		menu.dispatchEvent(e);
		menu.remove();  }  }  }

	
SoftMoon.keyPressRepeatTimeoutDelay??=1200;  //milliseconds
let
	digitTime=0,
	digitCollection="",  //user must press multiple digit keys within (1.2)(default) secs of each other
	enterTime,
	enterCount=0;  //user must press Enter/Space 3 times within (1.2)(default) secs to delete or clear-clipboard
	
// returns true if the menu should stay open, false if the menu should close
FormFieldGenie.prototype.handleKeydownInMenu=function handleKeydownInMenu(event)  {
	event.preventDefault();  event.stopPropagation();
	if (event.key!=='Enter'  &&  event.key!=="Space")  enterTime=enterCount=0;
	if (SoftMoon.altMenuKey?.sniff(event))  return false;
	if (event.shiftKey ||  (event.ctrlKey && !"xXcCvV".includes(event.key))  || event.altKey || event.metaKey
	||  event.getModifierState('AltGraph')  ||  event.getModifierState('OS'))  return true;
	var newFocus;
	if (event.key>="0"  &&  event.key<="9")  numberKey: {
		if (digitTime+SoftMoon.keyPressRepeatTimeoutDelay<event.timeStamp)  digitCollection=event.key;
		else  digitCollection+=event.key;
		digitTime=event.timeStamp;  
		const ul= (event.target.parentNode.tagName==='UL') ? event.target.parentNode : event.target.querySelector('ul');
		if (ul)  for (const li of ul.children)  {
			if (li.innerText.endsWith(" "+digitCollection))  {
				newFocus=li;
				break numberKey;  }  }
		return true;  }
	else  {
		digitCollection="";
		switch (event.key)  {
		case 'Space':
		case 'Enter':
			if (!enterTime  
			||  enterTime+SoftMoon.keyPressRepeatTimeoutDelay<event.timeStamp)  {
					enterTime=event.timeStamp;
					enterCount=0;  }  
			event.enterPress=++enterCount;
			this.onGenieMenuSelect(event);
			return event.menuSelectReturnStatus;
		case 'Escape': event.opStatus='noMod';   
			return false;
		case 'ArrowDown':
			if (newFocus=event.target.nextElementSibling)  {
				if (newFocus.tagName==='UL')  newFocus=newFocus.firstElementChild;  } 
			else return true;
			if (newFocus)  break;
			else return true;
		case 'ArrowUp':
			if (newFocus=event.target.previousElementSibling)  break;
			newFocus=event.target.parentNode.previousElementSibling;
			if (newFocus?.tagName==='SPAN')  break;
			return true;
		case 'ArrowRight':
			if (newFocus=event.target.firstElementChild)  {
				if (newFocus.tagName==='UL')  
					newFocus=newFocus.firstElementChild;
				if (newFocus)  break;  }  
			return true;
		case 'ArrowLeft':
			if (event.target.parentNode.tagName==='MENU')  return true;
			newFocus=event.target.parentNode;
			while (newFocus.parentNode.tagName!=='MENU')  {
				newFocus=newFocus.parentNode;  }
		break;
		case 'Insert': newFocus=menu.querySelector('.insert');
		break;
		case 'Delete': newFocus=menu.querySelector('.delete');
		break;
		case 'x':
		case 'X':  if (!event.ctrlkey)  return true;
		case 'Cut':    newFocus=menu.querySelector('.cut');
		break;
		case 'c':
		case 'C':  if (!event.ctrlkey)  return true;
		case 'Copy':   newFocus=menu.querySelector('.copy');
		break;
		case 'v':
		case 'V':  if (!event.ctrlkey)  return true;
		case 'Paste':  newFocus=menu.querySelector('.paste');
		break;
		default: return true;  }  }
	if (event.target.childElementCount>0  &&  !event.target.contains(newFocus))  event.target.setAttribute('aria-expanded', 'false');
	if (newFocus.childElementCount>0)  newFocus.setAttribute('aria-expanded', 'true');  
	newFocus.focus();  
	return true;  }  


FormFieldGenie.prototype.onGenieMenuSelect=function onGenieMenuSelect(event)  {
	const
		group=currentGroup,  // private, set by show_clipMenu()
		text=this.HTML_clipMenu_TEXT;
	event.menuSelectReturnStatus=false;
	switch (group  &&  event.target.tagName)  {
		case 'SPAN':               return this.popNewGroup(group, {doso:"insert"});
		case 'LI':  if (event.target.parentNode.tagName==='UL')  switch (event.target.parentNode.parentNode.firstChild.data.trim())  {
			case text.insert:  return this.pasteGroup(group, {doso:"insert", clip:event.target.innerText});
			case text.copy:    event.opStatus='noMod';  return this.copyGroup(group, {clip:event.target.innerText});
			case text.cut:     event.opStatus='removed';  return this.cutGroup(group, {clip:event.target.innerText});
			case text.paste:   return this.pasteGroup(group, {clip:event.target.innerText});  }
			else
			if (event.detail===3  ||  event.enterPress===3)  switch (event.target.innerText)  {
			case text.dlt:     event.opStatus='removed';  return this.deleteGroup(group);
			case text.clear:   event.opStatus='noMod';  return this.clearClipboard(true);  }  }
	event.menuSelectReturnStatus=true;  }



}  //close the NameSpace wrapper for private members/functions



/* This is the “HTML clip Menu” example when you “bind” it to the Genie.
 * (The Genie will update the Menu contents automatically as appropriate.
 *  The Genie will handle all click events on the Menu to select a choise,
 *  and handle keyboard-navigation events and keyboard-choise-select events,
 *  and shut down the Menu when appropriate.
 *  It’s up to you to add the Javascript to your web-page to activate the menu,
 *  then the Genie will handle the rest…)
 * You may copy and paste this snippet of HTML into your page – one copy per Genie instance.
 * You may not add Elements or change any tagNames or remove any classNames.
 * You may change/add any id or classNames to this HTML for CSS handles.
 * The TEXT within this menu may be modified only if you modify or replace the FormFieldGenie’s .HTML_clipMenu_TEXT Object,
 * with the exception of the <span>’s content — you may modify that without problems.
 *  For instance, with a list of names, your TEXT may become: “insert name” “copy name” “cut name” “paste name” “delete name” “new name” “all names” etc…,
 *  and your confirm dialog may become “Do you want to delete this name?”
 *
<menu class='myGenie_popUpMenu'>
	<li class='insert' tabindex="-1" controls='myGenie_popUpMenu_insertA myGenie_popUpMenu_insertB'>insert:
		<span id='myGenie_popUpMenu_insertA' tabindex="-1">new group</span>
		<ul id='myGenie_popUpMenu_insertB'>
			<li standard tabindex="-1">all clips</li>
		</ul>
	</li>
	<li class='copy'  tabindex="-1" controls='myGenie_popUpMenu_copy'>copy to:<ul id='myGenie_popUpMenu_copy'>
		<li standard tabindex="-1">new clip</li></ul></li>
	<li class='cut'   tabindex="-1" controls='myGenie_popUpMenu_cut'>cut to:<ul id='myGenie_popUpMenu_cut'>
		<li standard tabindex="-1">new clip</li></ul></li>
	<li class='paste' tabindex="-1" controls='myGenie_popUpMenu_paste'>paste from:<ul id='myGenie_popUpMenu_paste'>
		</ul></li>
	<li class='delete' title='triple-click' tabindex="-1">delete</li>
	<li title='triple-click' tabindex="-1">clear clipboard</li>
</menu>
 *
 *the above menu would be used like this:
<script type='text/javascript'>
// the Genie will automatically “bind” it:
myGenie=new SoftMoon.WebWare.FormFieldGenie(opts, document.getElementById('myGenie_popUpMenu'));
</script>
 *
 *or we could use the above menu like this:
<script type='text/javascript'>
myGenie=new SoftMoon.WebWare.FormFieldGenie(opts);
myGenie.bind_clipMenu(document.getElementById('myGenie_popUpMenu'));
</script>
 */



/* This is the “HTML clip Menu” example when you don’t want it “bound” to the Genie.
 * (The Genie will update the Menu contents automatically as appropriate.
 *  You must handle all EndUser-Menu-interaction with your own event-handlers - in this example embedded within the HTML)
 * You may copy and paste this snippet of HTML into your page – one copy per Genie instance.
 * You may not add Elements or change any tagNames.
 * You may change/add any id or classNames to this HTML for CSS handles.
 * You may simply modify the <li>TEXT</li> in the outer <menu> but not the inner <ul>s.
 *  For instance, with a list of names, your TEXT may become: “insert name” “copy name” “cut name” “paste name” “delete name”,
 *  and your confirm dialog may become “Do you want to delete this name?”
 * The <span>’s content may also be modified without problems.
 * The <li>TEXT</li> in the inner <ul>s may be modified only if you modify or replace the FormFieldGenie’s .HTML_clipMenu_TEXT Object.
 * Embedded JavaScript™ event-handler attributes may also be modified and/or expanded as appropriate to your needs.
 * **NOTE this example assumes you are using the  .config.groupClass  property.
 * **You may need to modify these event-handlers as appropriate to your needs.
 *
<menu id='myGenie_popUpMenu'>
	<li>insert:<span onclick='myGenie.popNewGroup(this.closest("."+myGenie.config.groupClass), {doso:"insert"})'>empty field</span>
		<ul onclick='if (event.phase===Event.BUBBLING_PHASE) myGenie.pasteGroup(this.closest("."+myGenie.config.groupClass), {doso:"insert", clip:event.target.innerText})'>
			<li standard>all clips</li>
		</ul></li>
	<li>copy to:<ul onclick='if (event.phase===Event.BUBBLING_PHASE) myGenie.copyGroup(this.closest("."+myGenie.config.groupClass), {clip:event.target.innerText})'>
			<li standard>new clip</li>
		</ul></li>
	<li>cut to:<ul onclick='if (event.phase===Event.BUBBLING_PHASE) myGenie.cutGroup(this.closest("."+myGenie.config.groupClass), {clip:event.target.innerText})'>
			<li standard>new clip</li>
		</ul></li>
	<li>paste from:<ul onclick='if (event.phase===Event.BUBBLING_PHASE) myGenie.pasteGroup(this.closest("."+myGenie.config.groupClass), {clip:event.target.innerText})'>
		</ul></li>
	<li onclick='if (confirm("Do you want to delete this group?")) myGenie.deleteGroup(this.closest("."+myGenie.config.groupClass))'>delete</li>
	<li onclick='myGenie.clearClipboard();'>clear clipboard</li>
</menu>
 *
 *the above would be used like this:
<script type='text/javascript'>
// we don’t pass the Menu into the constructor, because we don’t want it “bound”
myGenie=new SoftMoon.WebWare.FormFieldGenie(opts);
myGenie.HTML_clipMenu=document.getElementById('myGenie_popUpMenu');
</script>
 */


//===================================================================================\\


// “updateName” plugin for popNewGroup
//  usage example:
// Genie=new SoftMoon.WebWare.FormFieldGenie( {
//		updateName: SoftMoon.WebWare.FormFieldGenie.updateNameByList,
//    cbParams: {order:SoftMoon.WebWare.FormFieldGenie.RomanOrder}  } );
SoftMoon.WebWare.FormFieldGenie.updateNameByList=function(field, indxOffset, group, batch, params)  {
	if (typeof params !== 'object')  params=false;
	const
		pcre=(params  &&  params.pcre instanceof RegExp)  ?  params.pcre
				:  new RegExp(/\[([a-z]+|[0-9]+)\]/),
		order=(params  &&  params.order instanceof Array)  ?  params.order
				:  ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh"],
		oldIndex=field.name.match(pcre);
	var indx=parseInt(oldIndex[1]);
	if (Number.isNaN(indx))  {
		const i=order.indexOf(oldIndex[1]);
		if (i===-1)  {console.error('can not find textual index “'+oldIndex[1]+'” in the “order”:',order,'using:',pcre);  return field.name;}
		if (i+indxOffset+1>order.length)
			indx=(i+indxOffset+1).toString();
		else  indx=order[i+indxOffset];  }
	else  {if ((indx+=indxOffset)<=order.length  &&  indx>0)  indx=order[indx-1];}
	return field.name.substring(0, oldIndex.index+1) +indx+ field.name.substring(oldIndex.index+oldIndex[1].length+1);  }

// create a new custom order for the standard plugin  updateNameByList
SoftMoon.WebWare.FormFieldGenie.updateNameByList.RomanOrder=new Object();
SoftMoon.WebWare.FormFieldGenie.updateNameByList.RomanOrder.order=new Array('i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii');
SoftMoon.WebWare.FormFieldGenie.updateNameByList.RomanOrder.pcre=null;  //use the default Regular Expression; or you may customize this property

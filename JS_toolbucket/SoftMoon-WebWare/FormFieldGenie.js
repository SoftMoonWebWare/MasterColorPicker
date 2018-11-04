/* FormFieldGenie version 3.0 (April 13, 2015)  written by and Copyright © 2010,2011,2012,2015 Joe Golembieski, Softmoon-Webware

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

//  tabspacing: 2   word-wrap: none    encoding: UTF-8


if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')  SoftMoon.WebWare=new Object;

SoftMoon.WebWare.FormFieldGenie=function(opts, clone, popUpMenuHTML)  { this.defaults=new Object;
	for (o in SoftMoon.WebWare.FormFieldGenie.defaults)  {
		this.defaults[o]= (typeof opts=='object'  &&  opts.hasOwnProperty(o))  ?
			opts[o]
		: SoftMoon.WebWare.FormFieldGenie.defaults[o];  }
	if (clone instanceof Element)  this.clone=clone;
	if (popUpMenuHTML instanceof Element)  this.popUpMenuHTML=popUpMenuHTML;
	this.tabbedOut=false;  }

//  Apple's Safari and Google's Chrome do not generate an onkeypress event for the Tab Key; use onkeydown
SoftMoon.WebWare.FormFieldGenie.prototype.catchTab=function(event)  {
	event=(event || window.event);
	var code=(event.charCode || event.keyCode);
	if (code==9)  this.tabbedOut=true;  else  this.tabbedOut=false;
	if (typeof this.catchKey == 'function')  return this.catchKey.call(this, event);
	return true;  }



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
		myGenie=new SoftMoon.WebWare.FormFieldGenie({……my options……}, ……my DOM node to clone……);
		myGenie.popNewField(……)
	After creating an instance of the FormFieldGenie, you may also
	set the instance.clone to the explicit DOM node (form-field or group of form-fields) you want to clone (if any).
	An example of passing an explicit node to clone:
		myGenie=new SoftMoon.WebWare.FormFieldGenie({……my options……});
		myGenie.clone= ……my DOM node to clone……
		myGenie.popNewField(………)


	The publicly accessible properties of a FormFieldGenie instance are:
		.clone
		.clipboard
		.popUpMenuHTML
		.defaults
		.tabbedOut
		.catchKey  ← this is NOT defined natively, but is recognized by the catchTab method of an instance

	The publicly accessible methods of a FormFieldGenie instance are:
	popNewField(fieldNodeGroup, opts)     returns true if a new fieldNodeGroup is ‘popped’ or false if not.
	deleteField(fieldNodeGroup, opts)     returns true if the fieldNodeGroup was deleted, false if not.
		 cutField(fieldNodeGroup, opts)     returns true if the fieldNodeGroup was deleted, false if not.  fieldNodeGroup will always be copied to the clipboard.
		copyField(fieldNodeGroup, opts)     returns null.  fieldNodeGroup will always be copied to the clipboard.
	 pasteField(fieldNodeGroup, opts)     returns false if the clipboard clip is empty, true if it is pasted.

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
			If a containing node, it may contain any other DOM nodes including nested “fieldNodeGroups”.
			The “fieldNodeGroupFieldset” is the DOM node that contains the complete list/collection of “fieldNodeGroups”.
			However, if  opts.doso='addTo'  is passed into the  popNewField()  method, then the value which is passed in as
			fieldNodeGroup  should instead be the containing node (fieldNodeGroupFieldset) that holds all the  fieldNodeGroups
			Very simple Example of HTML:

			<script> Genie=New SoftMoon.WebWare.FormFieldGenie </script>
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
			• The <input> is the inputNode

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
				Any other (string value) condition passed yields no values updated (use "no" or "none" or "nope" or "nay" or "nyet" etc).
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

			isActiveField: function(fieldNode, cbParams)  { your customizing code }
				This can replace the standard function to check if a form field is currently active or not;
				i.e. is it disabled?, or is it even displayed at all?
				You may add/subtract your own rules, perhaps checking the status of another element.
				Inactive elements will not be considered when deciding to pop a new fieldNodeGroup or dump an empty one.
				Your function should return true|false.

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

			groupCusomizer: function(fieldNodeGroupFieldset, pasteOver, cbParams)  { your customizing code }
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

//you may re-define defaults globally through these properties - ¡but do not add or delete properties!
SoftMoon.WebWare.FormFieldGenie.defaults={
	maxTotal: 100,
	indxTier: 0,
	climbTiers: true,
	updateValue: "all",
	focusField: 0,
	dumpEmpties: true,      /*Boolean  or  user function returns Boolean|null*/
	checkForEmpty: "one",
	checkField: 0,
	isActiveField: null,    /*user function - replaces standard function*/
	updateName: null,
	cloneCustomizer: null,  /*user function*/
	eventRegistrar: null,   /*user function*/
	groupCustomizer: null,   /*user function*/
	groupClass: null,       /* string  or  RegExp */
	groupTag: null,					/* htmlTagNameString.toUpper() */
		}


//You may completely replace this Class default function globally
//  by redefining SoftMoon.WebWare.FormFieldGenie.isActiveField (as a function)
//You may override this default per instance (or per call)
//  through instance.defaults.isActiveField (or by passing opts.isActiveField)
//You may call this static Class function from your custom instance function
SoftMoon.WebWare.FormFieldGenie.isActiveField=function(fieldNode)  { if (fieldNode.disabled)  return false;
//	 	alert(fieldNode.name+"\nwidth: "+fieldNode.offsetWidth+"\nheight: "+fieldNode.offsetHeight);
			//Opera does not seem to set the dimensions of a newly created <input type='file' /> tag as required
			// by this functional class.
		if (SoftMoon.WebWare.FormFieldGenie.browser!=="Opera"  &&  typeof fieldNode.offsetWidth == 'number'
		&&  (fieldNode.offsetWidth<4  ||  fieldNode.offsetHeight<4))  return false;
//    However, it will recognize  display: none;  from a style-sheet, where some others require the style to be inline.
		do {
			if (fieldNode.style && (fieldNode.style.display==='none' || fieldNode.style.visibility==='hidden'))
				{  return false;}  }      //  alert(fieldNode.nodeName);
		while  (fieldNode=fieldNode.parentNode);
		return true;  }


// To make full use of this default function, you must create your own dumpEmpties function which calls this one;
//  it should pass the correct values for minCount and nName.
// Note that dumpEmpties is called by popNewField() and deleteField(), and neither pass values for  minCount  or  nName.
// However, deleteField() passes  true  as the second value, which this default function below ignores.
// Your custom dumpEmpties function may utilize this second value passed by deleteField()
// to make a distinction between a user request and an automatic “cleanup”.
SoftMoon.WebWare.FormFieldGenie.dumpEmpties=function(elmnt, minCount, nName)  { var count=0;
	if (typeof minCount != 'number')  minCount=1;
	elmnt=elmnt.parentNode.childNodes;
	for (var i=0; i<elmnt.length; i++)  {
		if (elmnt[i].nodeType===Node.ELEMENT_NODE
		&&  (typeof nName != 'string'  ||  elmnt[i].nodeName===nName))  count++;  }
	return (count>minCount); }


SoftMoon.WebWare.FormFieldGenie.browser=(function()  {
	try {var browser=navigator.userAgent.match(/(Opera|Chrome|Safari|Firefox|MSIE)/)[0];}
	catch(e) {var browser="MSIE";}  // if it's not a modern browser, assume it's as inept as Microsoft's Internet Explorer
	return browser;  })();  //invoke the function



(function()  {  // ===================here we wrap the “private members/methods” of this class=======================
	var maxTotal, indxTier, climbTiers, updateValue, focusField,
			dumpEmpties, checkOne, checkAll, checkField, isActiveField,
			callback, cbParams, cloneCustomizer, eventRegistrar, groupCustomizer, doFocus,
			fieldNodeGroupFieldset, addTo=false,
			groupClass, groupTag;

function init(fieldNodeGroup, opts) {
	// define internal "defaults"
	maxTotal=100, indxTier=0, climbTiers=true, updateValue="all", focusField=0,
	dumpEmpties=SoftMoon.WebWare.FormFieldGenie.dumpEmpties || true, checkOne=true, checkAll=false, checkField=0, isActiveField=null,
	callback=false, cloneCustomizer=null, eventRegistrar=null, groupCustomizer=null, doFocus=null, groupClass="", groupTag=null, popUpMenuHTML=null;

	var dflt=(typeof this.defaults == "object") ?  this.defaults  :  false;
			//reset to instance/global defaults
 if (dflt) {
	if (typeof dflt.maxTotal == "number"  &&  dflt.maxTotal>=1)  maxTotal=dflt.maxTotal;
	if (typeof dflt.indxTier == "number"  &&  dflt.indxTier>=0)  indxTier=dflt.indxTier;
	if (typeof dflt.climbTiers == "boolean")  climbTiers=dflt.climbTiers;
	if (typeof dflt.updateValue == "string")  updateValue=dflt.updateValue;
	if (typeof dflt.focusField == "number"  &&  dflt.focusField>=0)  focusField=dflt.focusField;
	if (typeof dflt.dumpEmpties == "boolean"  ||  typeof dflt.dumpEmpties == "function")  dumpEmpties=dflt.dumpEmpties;
	if (dflt.checkForEmpty==="all")  {checkAll=true;  checkOne=false;}
	if (dflt.checkForEmpty==="one")  {checkOne=true;  checkAll=false;}
	if (dflt.checkForEmpty==="some")  {checkAll=false;  checkOne=false;}
	if ((dflt.checkForEmpty==="some"  ||  dflt.checkForEmpty==="one")
	&&  typeof dflt.checkField == "number"  &&  dflt.checkField>=0)
		checkField=dflt.checkField;
	if (typeof dflt.isActiveField == "function")  isActiveField=dflt.isActiveField;
	if (typeof dflt.updateName == "function")  callback=dflt.updateName;
	if (typeof dflt.cloneCustomizer == "function")  cloneCustomizer=dflt.cloneCustomizer;
	if (typeof dflt.eventRegistrar == "function")  eventRegistrar=dflt.eventRegistrar;
	if (typeof dflt.groupCustomizer == "function")  groupCustomizer=dflt.groupCustomizer;
	if (typeof dflt.focus == "boolean")  doFocus=dflt.focus;
	if (typeof dflt.groupClass == "string")    groupClass=RegExp("\\b"+dflt.groupClass+"\\b");
	if (dflt.groupClass instanceof RegExp)  groupClass=dlft.groupClass;
	if (typeof dflt.groupTag == "string")  groupTag=dflt.groupTag.toUpperCase();
 }

	if (typeof opts !== "object")  opts=false;
	else {  // reset to current options
	if (typeof opts.maxTotal == "number"  &&  opts.maxTotal>=1)  maxTotal=opts.maxTotal;
	if (typeof opts.indxTier == "number"  &&  opts.indxTier>=0)  indxTier=opts.indxTier;
	if (typeof opts.climbTiers == "boolean")  climbTiers=opts.climbTiers;
	if (typeof opts.updateValue == "string")  updateValue=opts.updateValue;
	if (typeof opts.focusField == "number"  &&  opts.focusField>=0)  focusField=opts.focusField;
	if (typeof opts.dumpEmpties == "boolean"  ||  typeof opts.dumpEmpties == "function")  dumpEmpties=opts.dumpEmpties;
	if (opts.checkForEmpty==="all")  {checkAll=true;  checkOne=false;}
	if (opts.checkForEmpty==="one")  {checkOne=true;  checkAll=false;}
	if (opts.checkForEmpty==="some")  {checkAll=false;  checkOne=false;}
	if ((opts.checkForEmpty==="some"  ||  opts.checkForEmpty==="one")
	&&  typeof opts.checkField == "number"  &&  opts.checkField>=0)
		checkField=opts.checkField;
	if (typeof opts.isActiveField == "function"  ||  opts.isActiveField===null)  isActiveField=opts.isActiveField;
	if (typeof opts.updateName == "function"  ||  opts.updateName===null)  callback=opts.updateName;
	if (typeof opts.cloneCustomizer == "function"  ||  opts.cloneCustomizer===null)  cloneCustomizer=opts.cloneCustomizer;
	if (typeof opts.eventRegistrar == "function"  ||  opts.eventRegistrar===null)  eventRegistrar=opts.eventRegistrar;
	if (typeof opts.groupCustomizer == "function"  ||  opts.groupCustomizer===null)  groupCustomizer=opts.groupCustomizer;
	if (typeof opts.focus == "boolean")  doFocus=opts.focus;
	if (typeof opts.groupClass == "string")  groupClass=RegExp("\\b"+opts.groupClass+"\\b");
	if (opts.groupClass instanceof RegExp)  groupClass=opts.groupClass;
	if (typeof opts.groupTag == "string")  groupTag=opts.groupTag.toUpperCase();
	}

	if (typeof isActiveField !== "function")  isActiveField=SoftMoon.WebWare.FormFieldGenie.isActiveField;

	if (!addTo)  fieldNodeGroupFieldset=fieldNodeGroup.parentNode;  //may be any parent tag; not limited to <fieldset> <ol> <td> <div> etc.
	addTo=false;  // only Genie.popNewField(fieldNodeGroupFieldset, {addTo:true}) changes this to true – reset it for all others

	if (typeof callback !== 'function')  callback=false;
	cbParams=(opts) ? opts.cbParams : null

	}  // close init



	var userDataInputTypes=[
		'text', 'search', 'tel', 'url', 'email', 'password', 'datetime', 'date',
		'month', 'week', 'time', 'datetime-local', 'number', 'color', 'file' ];



	function getField(fieldNode, check)  {
		if (!(fieldNode instanceof Element)  ||  fieldNode.nodeType!=Node.ELEMENT_NODE)  return null;
		if (!fieldNode.hasChildNodes())  { switch (fieldNode.nodeName)  {
				case "INPUT": { if (userDataInputTypes.indexOf(fieldNode.type) === -1)  return null;  }
				case "TEXTAREA": { if (!isActiveField(fieldNode, cbParams))  return null;
					return (check) ?  ((fieldNode.value.length==0)^(check=="isFull?"))  :  fieldNode;  }
				default: return null;  }  }
		else
		var fields=function(fldNode)  {
			for (var n, fields=new Array, i=0;  i<fldNode.childElementCount;  i++)  { n=fldNode.children[i];
				if (n.hasChildNodes())  {fields=fields.concat(arguments.callee(n));  continue;}
				switch (n.nodeName)  {
					case "INPUT": {if (userDataInputTypes.indexOf(n.type) === -1)  continue;}
					case "TEXTAREA": {if (isActiveField(n, cbParams))  fields.push(n);}  }  }
			return fields;
		}(fieldNode);  //invoke the above function passing fieldNode as the value of fldNode
		if (check)  {
			if (checkOne) //{  if (testFlag) alert("name:="+fields[checkField].name+"=\nvalue:="+fields[checkField].value +"=\nlength:"+ fields[checkField].value.length +"\nfields.length: "+ fields.length +"\ncheckField: "+ checkField);
				return (fields.length>checkField) ?  (fields[checkField].value.length==0)^(check=="isFull?")  :  null;  //}
			for (var i=0; i<fields.length; i++)  {
				if ((fields[i].value.length==0)^(check=="isFull?"))  {if (!checkAll  &&  i>=checkField)  return true;}
				else  return false;  }
			return (fields.length) ? true : null;  }
		else  return (fields.length>focusField) ?  fields[focusField]  :  null;  }


	function isGroup(e)  {return (!groupTag  ||  e.nodeName===groupTag)  &&  e.className.match(groupClass);}

	function getNextGroup(nodeGroup)  {
		do {nodeGroup=nodeGroup.nextElementSibling}
		while  (nodeGroup!==null  &&  (!isGroup(nodeGroup)  ||  getField(nodeGroup)===null));
		return  nodeGroup;  }

	function getFirstGroup()  { var firstGroup=fieldNodeGroupFieldset.firstElementChild;
		while (firstGroup!==null  &&  (!isGroup(firstGroup)  ||  getField(firstGroup)===null))  {
			firstGroup=firstGroup.nextElementSibling;  }
		return firstGroup;  }

	function getLastGroup()  { var lastGroup=fieldNodeGroupFieldset.lastElementChild;
		while (lastGroup!==null  &&  (!isGroup(lastGroup)  ||  getField(lastGroup)===null))  {
			lastGroup=lastGroup.previousElementSibling;  }
		return lastGroup;  }


	function updateGroupNames(group, indxOffset, resetFlag)  {  //also reset default values unless resetFlag=false

		if (typeof indxOffset != "number")  indxOffset=1;
		if (typeof resetFlag != "boolean")  resetFlag=true;
		var elmnt, inputNodes=['input', 'textarea', 'select', 'button' /*, 'map' */], field, i;
		// you could in theory? use the <map> tag with the JavaScript: pseudo-protocol in the URLs, in which the script
		// uses the current name attribute to do something (like pre-enter an index number into a corresponding text field).
		if (!group.hasChildNodes())  {
			group.name=updateName(group);
			if (resetFlag)  updateValsEtc(group);  }
		else
		while (elmnt=inputNodes.pop())  { if (field=group.getElementsByTagName(elmnt))  {
			for (i=0; i<field.length; i++)  {
				field[i].name=updateName(field[i]);
				if (resetFlag)  updateValsEtc(field[i]);  }  }  }

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

		function updateName(field)  {
			if (callback)  {
				var fieldName=callback(field, indxOffset, fieldNodeGroupFieldset, cbParams);
				if (typeof fieldName == "string")  return fieldName;  }
			if (updateValue=="all"  &&  valueUpdater(field))  return field.name;
			if (field.name.charAt(field.name.length-2)!="[")  {
				if (updateValue=="non-implicit"  &&  valueUpdater(field))  return field.name;
				if (field.name.charAt(field.name.length-1)!="]")  {  // non-indexed  name
					if (updateValue=="non-indexed"  &&  valueUpdater(field))  return field.name;
					if ((valIncr=field.name.match(/(.*[^0-9])?([0-9]+)$/))!==null)
						return ((typeof valIncr[1] !== "undefined") ? valIncr[1] : "") + (Number(valIncr[2])+indxOffset).toString();
					else  return field.name;  }
				else  {  //indexed with contained value  name[value]
					if (updateValue=="indexed"  &&  valueUpdater(field))  return field.name;
					return updateTieredName(field.name, field.name.length);  }  }
			else  {  //indexed with no contained value  name[]
				if (updateValue=="implicit"  &&  valueUpdater(field))  return field.name;
				if (field.tagName=='INPUT'  &&  field.type=='checkbox'  &&  field.name.substr(-3)=="][]")
					return updateTieredName(field.name, field.name.length-2);
				else  return field.name;  }  }

		function valueUpdater(field)  { var valIncr;
			if (field.tagName=='INPUT'  &&  (field.type=='radio'  ||  field.type=='checkbox')
			&&  (valIncr=field.value.match(/^\[([0-9]+)\]$/)))  {
				field.value="["+(Number(valIncr[1])+indxOffset).toString()+"]";  return true;  }  }

		//find and update the last index with a numeric value, or return the original name if none are numeric
		function updateTieredName(fieldName, position)  { var indx, indxCount=0;
			position=(typeof position == "number") ?  fieldName.lastIndexOf("[", position-1)  :  fieldName.lastIndexOf("[");
			do {indx=( Number(fieldName.substring(position+1, fieldName.indexOf("]", position))) +indxOffset ).toString();}
			while ((indxCount++<indxTier  ||  indx=="NaN")
				&&  climbTiers  &&  position>3  &&  (position=fieldName.lastIndexOf("[", position-1)) != (-1));
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
		if ( typeof dumpEmpties == 'function'  &&  !dumpEmpties(fieldNodeGroup, true) )   return false;
		var nextNode=getNextGroup(fieldNodeGroup);
		fieldNodeGroupFieldset.removeChild(fieldNodeGroup);
		while (nextNode!==null) {updateGroupNames(nextNode, -1, false);  nextNode=getNextGroup(nextNode);}
		if (typeof groupCustomizer == "function")  groupCustomizer(fieldNodeGroupFieldset, false, cbParams);
		if (opts  &&  opts.refocus)  setTimeout(function() {getField(getLastGroup()).focus();}, 1);
		return true;  }

 function popNewField(fieldNodeGroup, opts)  {
	var newField, fieldCount=0, fieldNode=getFirstGroup(), flag=false, pasted=false;

	if (opts  &&  (opts.doso==='insert'  ||  opts.doso==='paste'))  {
		var fieldPos=0, offSet, clip;
		while (fieldNode)  {
			if (++fieldCount>maxTotal)  return false;
			else  {
				if (fieldNode===fieldNodeGroup)  fieldPos=fieldCount-1;
				fieldNode=getNextGroup(fieldNode);  }  }
		if (opts.addTo)  fieldPos=fieldCount;
		if (opts.doso==='paste'
		&&  (clip=this.getClip(opts.clip))
		&&  clip.node instanceof Element)  { pasted=true;
			newField=clip.node.cloneNode(true);
			offSet=fieldPos-clip.position;  }
		else if (this.clone instanceof Element)  {
			newField=this.clone.cloneNode(true);
			offSet=fieldPos;  }
		else {
		//the last field should have standard default values, so we clone this one.
		//the server-side script may accept the list and spit it back out as filled-in values in the form;
		// if it does this, one more (empty) fieldNodeGroup should be added at the end
			newField=getLastGroup()
			if (newField===null)  return false;
			newField=newField.cloneNode(true);
			offSet=fieldPos-fieldCount+1;
			flag=true;  }
		if (!opts.addTo)  {
			fieldNode=fieldNodeGroup;
			do {updateGroupNames(fieldNode, 1, false);}  while ((fieldNode=getNextGroup(fieldNode))!==null);  }
		updateGroupNames(newField, offSet, flag);
		if (typeof cloneCustomizer == 'function')
			cloneCustomizer(newField, pasted, cbParams);
		if (opts.addTo)
			fieldNodeGroupFieldset.appendChild(newField);
		else  fieldNodeGroupFieldset.insertBefore(newField, fieldNodeGroup);
		if (typeof eventRegistrar == 'function')  eventRegistrar(newField, pasted, cbParams);
		if (typeof groupCustomizer == 'function')  groupCustomizer(fieldNodeGroupFieldset, pasted, cbParams);
		if (doFocus!==false)  setTimeout(function() {getField(newField).focus();}, 0);
		return true;  }

	var nextNode, fieldFlag, removedCount=0, lastGroup;
	// remove sibling node Groups with empty text fields
	if (fieldNode!==null)
	do  { nextNode=getNextGroup(fieldNode);  fieldFlag=getField(fieldNode, "isEmpty?");
		if (fieldFlag!==null)  {
			if (dumpEmpties  &&  nextNode!==null  &&  fieldFlag)  {
				if ( typeof dumpEmpties == 'function'  &&  !(flag=dumpEmpties(fieldNode)) )  {
					if (flag===false)  { fieldCount++;
						if (removedCount<0)  updateGroupNames(fieldNode, removedCount, false);  }
					if (flag===null)  removedCount--;  }
				else  {
					fieldNodeGroupFieldset.removeChild(fieldNode);
					removedCount--;  }  }
			else  { fieldCount++;
				if (removedCount<0)  updateGroupNames(fieldNode, removedCount, false);  }  }  }
	while (nextNode!==null  &&  (fieldNode=nextNode));

	if (fieldCount<maxTotal
	&&  (getField(lastGroup=getLastGroup(), "isFull?")	||  (opts && (opts.doso || opts.addTo))))  {
	// create a new node containing an empty text-input field
	//  clone the node at the end of the <fieldset> (or other <parent>) of the node passed to keep names sequential
	//  clone the whole node to allow wrapper tags
	//     (for example <label> or <fieldset>), other text, other fields, etc.
	//  update all form-control-tag "name"s and reset default values
	//  if the TAB key was pressed to exit this input field, focus the cursor at the newly generated field.
		if ((this.clone) instanceof Element)  {
			newField=this.clone.cloneNode(true);
			offSet=fieldCount;
			flag=false;  }
		else {
			newField=getLastGroup();
			if (newField===null)  return false;
			newField=newField.cloneNode(true);
			offSet=1;
			flag=true;   }
		updateGroupNames(newField, offSet, flag);
		if (typeof cloneCustomizer == "function")
			cloneCustomizer(newField, false, cbParams);
		if (fieldNodeGroupFieldset.lastElementChild===lastGroup)
			fieldNodeGroupFieldset.appendChild(newField);
		else  fieldNodeGroupFieldset.insertBefore(lastGroup.nextElementChild, newField);
		if (typeof eventRegistrar == "function")  eventRegistrar(newField, false, cbParams);
		flag=true;  }
	else  flag=false;  //we are not popping a new field

	if (removedCount<0  ||  newField)   {
		var tabbedOut=this.tabbedOut;
		setTimeout(
			function () {
				if (typeof groupCustomizer == "function")  groupCustomizer(fieldNodeGroupFieldset, false, cbParams);
				if ((tabbedOut && doFocus!==false)  ||  doFocus)  getField(getLastGroup()).focus();  },
			0);  }

	return flag;  }


//below are the public methods that access the above private members/methods

SoftMoon.WebWare.FormFieldGenie.prototype.popNewField=function(fieldNodeGroup, opts)  {
	if (opts && opts.addTo)  {fieldNodeGroupFieldset=fieldNodeGroup;  addTo=true;}
	init.call(this, fieldNodeGroup, opts)
	return popNewField.call(this, fieldNodeGroup, opts);  }

SoftMoon.WebWare.FormFieldGenie.prototype.pasteField=function(fieldNodeGroup, opts)  {
	var clip;
	if (!(opts instanceof Object  &&  (clip=this.getClip(opts.clip))  &&  clip.node instanceof Element)) return false;
	init.call(this, fieldNodeGroup, opts)
	if (opts  &&  opts.doso==='insert')  {
		opts.doso='paste';  var flag=popNewField.call(this, fieldNodeGroup, opts);  opts.doso='insert';
		return flag;  }
	var newField=clip.node.cloneNode(true);
	updateGroupNames(newField, getPosition(fieldNodeGroup)-clip.position, false);
	if (typeof cloneCustomizer == 'function')
		cloneCustomizer(newField, 'paste-over', cbParams);
	fieldNodeGroupFieldset.replaceChild(newField, fieldNodeGroup);
	if (typeof eventRegistrar == 'function')  eventRegistrar(newField, 'paste-over', cbParams);
	setTimeout(function() { var o;
		if (typeof groupCustomizer == 'function')  groupCustomizer(fieldNodeGroupFieldset, 'paste-over', cbParams);
		if (opts  &&  opts.doso)  {
			o=opts.doso;  opts.doso=null;
			popNewField(fieldNodeGroup, opts);
			opts.doso=o;  }
		if (doFocus)  getField(newField).focus();  }, 0);
	return true;  }

SoftMoon.WebWare.FormFieldGenie.prototype.deleteField=function(fieldNodeGroup, opts)  {
	init.call(this, fieldNodeGroup, opts)
	return deleteField(fieldNodeGroup, opts)  }

SoftMoon.WebWare.FormFieldGenie.prototype.cutField=function(fieldNodeGroup, opts)  {
	this.copyField(fieldNodeGroup, opts)
	return deleteField(fieldNodeGroup, opts)  }

SoftMoon.WebWare.FormFieldGenie.prototype.copyField=function(fieldNodeGroup, opts)  {
	init.call(this, fieldNodeGroup, opts);
	var clip=this.getClip(opts.clip, true);
	clip.node=fieldNodeGroup.cloneNode(true);
	clip.position=getPosition(fieldNodeGroup);  };

SoftMoon.WebWare.FormFieldGenie.prototype.getClip=function(ref, doInit)  { var x;
	if (!(this.clipboard instanceof Object))  {
		if (doInit)  this.clipboard=new Object;
		else  return false;  }
	if (typeof ref === 'string')  {
		if (ref.toLowerCase()==="new clip")  {
			if (!(this.clipboard.clips instanceof Array))  this.clipboard.clips=new Array;
			return this.clipboard.clips[this.clipboard.clips.length]=new Object;  }
		if (this.clipboard[ref] instanceof Object)  return this.clipboard[ref];
		if (x=ref.match( /$clip ?([0-9]+)^/ ))  ref=parseInt(x[1]);
		else
		if (doInit)  return this.clipboard[ref]=new Object;  }
	if (typeof ref !== 'number')  return false;
	if (!(this.clipboard.clips instanceof Array))  {
		if (doInit)  this.clipboard.clips=new Array;
		else  return false;  }
	if (this.clipboard.clips[ref] instanceof Object)  return this.clipboard.clips[ref];
	if (doInit)  return this.clipboard.clips[ref]=new Object;
	return false;  }

//a peek into the future:

SoftMoon.WebWare.FormFieldGenie.prototype.clearClipboard=function()  {
	if (confirm('Do you want to clear the clipboard?'))  {}
}

	})()  //close and invoke the wrapper for private members/functions

/* This is the “popUpMenuHTML”
 * You may copy and paste this snippit of HTML into your page – one copy per Genie instance.
 * You may change/add any id or classNames to this HTML for CSS handles.
 * You may modify the <li>TEXT</li> in the outer <menu> but not the inner <ol>s.
 *  For instance, with a list of names, your TEXT may become: “insert name” “copy name” “cut name” “paste name” “delete name”,
 *  and your confirm dialog may become “Do you want to delete this name?”
 * Embedded JavaScript™ event-handler attributes may also be modified and/or expanded as appropriate to your needs;
 *  however, note the FormFieldGenie copies these 'onclick' attributes as it auto-creates new <li> items for each new “clip”
 *  the end-user copies/cuts to.
 *
<menu id='myGenie_popUpMenu'>
	<li>insert:<span onclick='myGenie.popNewField(this.parentNode.parentNode.parentNode.parentNode, {doso:"insert"})'>empty field</span>
							<ol><li onclick='myGenie.pasteField(this.parentNode.parentNode.parentNode.parentNode, {doso:'insert', clip:this.innerHTML})'>all clips</li></ol></li>
	<li>copy to:<ol><li onclick='myGenie.copyField(this.parentNode.parentNode.parentNode.parentNode, this.innerHTML)'>new clip</li></ol></li>
	<li>cut to:<ol><li onclick='myGenie.cutField(this.parentNode.parentNode.parentNode.parentNode, this.innerHTML)'>new clip</li></ol></li>
	<li>paste from:<ol></ol></li>
	<li onclick='if (confirm("Do you want to delete this fieldNodeGroup?")) myGenie.deleteField(this.parentNode.parentNode)'>delete</li>
	<li onclick='if (confirm("Do you want to clear the clipboard?")) myGenie.clipboard=new Object;'>clear clipboard</li>
</menu>
 *
 *the above would be used like this:
<script type='text/javascript'>
myGenie=new SoftMoon.WebWare.FormFieldGenie(opts, clone, document.getElementById('myGenie_popUpMenu'));
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

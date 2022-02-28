//  character-encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160

// MasterColorPicker2.js   ~release ~2.2-alpha   Feb 22, 2022   by SoftMoon WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2014, 2015, 2018, 2019, 2020, 2021, 2022 Joe Golembieski, SoftMoon WebWare

		This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version, with the following additional requirements
		ADDED BY THE ORIGINAL SOFTWARE CREATOR AND LICENSOR that supersede any possible GNU license definitions:
		This original copyright information must remain intact.
		The phrase “MasterColorPicker™ by SoftMoon-WebWare” must be visually presented to the end-user
			in a commonly readable font at 8pt or greater when this software is actively in use
			and when this software is integrated into any:
			• publicly available display (for example, an internet web-page),
			• software package (for example, another open-source project, whether free or distributed for-profit),
			• internally used software packages and/or displays within a business extablishment’s operational framework
				(for examples, an intranet system, or a proprietary software package used exclusively by employees).

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with this program.  If not, see <http://www.gnu.org/licenses/>   */



// requires  SoftMoon-WebWare’s UniDOM-2020 package  (in  JS_toolbucket/SoftMoon-WebWare/))
// requires  SoftMoon.WebWare.Picker  (“Picker.js”  or  “Picker.withDebug.js”  in  JS_toolbucket/SoftMoon-WebWare/)
// requires  “+++.js”  in  JS_toolucket/+++JS/+++.js/
// requires  “+++Math.js”  in  JS_toolucket/+++JS/+++.js/
// requires  SoftMoon.WebWare.RGB_Calc  (in  JS_toolbucket/SoftMoon-WebWare/)
// requires  SoftMoon.WebWare.FormFieldGenie  (“FormFieldGenie.js”  in  JS_toolbucket/SoftMoon-WebWare/)   for MyPalette and ColorFilter
// requires  Softmoon.WebWare.Log  if you want to log with “event grouping” for easier debugging (see this file's end)
// subject to move to unique files (with more functions) in the future:
//  • SoftMoon.WebWare.canvas_graphics


/*==================================================================*/

'use strict';

UniDOM.isConnected_polyfill();


SoftMoon.WebWare.canvas_graphics={
	line: function(context, sp, ep, w, style)  {
		context.beginPath();
		context.moveTo(sp.x, sp.y);
		context.lineWidth=w;
		context.strokeStyle=style;
		context.lineTo(ep.x, ep.y);
		context.stroke();  },
	shapes: {}  };
//                                                           centerpoint ↓   # of ↓ vertexes   ↓ pass in function− typically “lineTo”
SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon=function(canvas, x,y, h,w, vCount, atVertex, rotate)  {
	var i, pX, pY, angle;  //, out='';      //     before rotation ↑           radian value ↑ ¡not degrees!
	const vertexes=[];
	if (typeof rotate !== 'number')  rotate=0;
	if (rotate+=_['90°'])  {pX=Math.cos(rotate)*w+x;  pY=y-Math.sin(rotate)*h;}  // place odd-point at top
	else {pX=x+w;  pY=y;}
	canvas.moveTo(pX, pY);            angle=rotate;
	for (i=1;  vertexes.push([pX, pY, angle]), i<vCount;  i++)  {
		angle=(_['π×2']/vCount)*i+rotate;
		pX=x+Math.cos(angle)*w;
		pY=y-Math.sin(angle)*h;
		atVertex(pX, pY);  }
	atVertex(vertexes[0][0], vertexes[0][1]);
//	for (i=0; i<vCount; i++)  {out+=vertexes[i][0]+'     '+vertexes[i][1]+'\n';}  alert(out);
	return vertexes;  };


/* this state is expected upon entry for use with undefined colorFilter:
		RGB_Calc.config.RGBAFactory === Array
		RGB_Calc.config.useHexSymbol === true
 */
SoftMoon.WebWare.canvas_graphics.rainbowRing=function(canvas, centerX, centerY, outRad, inRad, colorFilter)  {
	var j, x, y, ym, yq, a;
	const ors=outRad*outRad, irs=inRad*inRad++, RGB_Calc=SoftMoon.WebWare.RGB_Calc;
	if (typeof colorFilter !== 'function')  colorFilter=RGB_Calc.to.hex.bind(RGB_Calc.to);
	for (x=-(outRad++); x<outRad; x++)  {
		for (y=Math.round(Math.sqrt(ors-x*x)),  ym=(Math.abs(x)<inRad) ? Math.round(Math.sqrt(irs-x*x)) : 0;  y>=ym;  y--)  {
			for (j=-1; j<2; j+=2)  { yq=y*j;  a=Math.Trig.getAngle(x,yq);
				canvas.fillStyle=colorFilter(RGB_Calc.from.hue(a / _['π×2']), a);
				canvas.beginPath();
				canvas.fillRect(centerX+x, centerY-yq, 1,1);  }  }  } };


//                            centerpoint & size given as: pixels,angle → →↓→→→→↓   ↓ pass in function− typically “lineTo”
SoftMoon.WebWare.canvas_graphics.shapes.polarizedDiamond=function(canvas, r,a, h,w, atVertex)  {
	h=h/2; w=w/2;   //alert(r +'\n'+ a +'\n'+ h +'\n'+ w);
	var x, y;
	const vertexes=[];  //  , out

	x=r*Math.cos(Math.rad(a-w)); y=r*Math.sin(Math.rad(a-w));
	vertexes.push([x, y]);
	canvas.moveTo(x, y);

	x=(r+h)*Math.cos(a); y=(r+h)*Math.sin(a);
	vertexes.push([x, y]);
	atVertex(x,y);

	x=r*Math.cos(a+w); y=r*Math.sin(a+w);
	vertexes.push([x, y]);
	atVertex(x,y);

	x=(r-h)*Math.cos(a); y=(r-h)*Math.sin(a);
	vertexes.push([x, y]);
	atVertex(x,y);

	atVertex(vertexes[0][0], vertexes[0][1]);
//	for (i=0; i<4; i++)  {out+=vertexes[i][0]+'     '+vertexes[i][1]+'\n';}  alert(out);
	return vertexes;  };


/*==================================================================*/
/*==================================================================*/
window.addEventListener('load', function ()  {
	const err=localStorage.getItem('restoreError');
	localStorage.setItem('restoreError', "");
	if (err)  console.error('error saving settings last time: ',err);
	const allSettings=UniDOM.getElementsBy$Name(document.getElementById('MasterColorPicker'), "", true, undefined, true);
	try {
		const allValues=JSON.parse(localStorage.getItem('settingsValues'));
		for (const p in allValues)  { if (p in allSettings)
			switch (allSettings[p].type)  {
				//  radio buttons come in ElementArray groups, not alone; but as a backup…
			case 'radio':  allSettings[p].checked=(allSettings[p].value===allValues[p]);
			break;
			case 'checkbox':  allSettings[p].checked=allValues[p];
			break;
			case 'select-one':
			case 'select-multiple':
			case 'UniDOM ElementArray': allSettings[p].setSelected(allValues[p]);
			break;
			default:  if (allSettings[p].hasAttribute('value'))  allSettings[p].value=allValues[p];  }  }  }
	catch(e) {console.error("error restoring settings upon startup: ",e);}
	window.addEventListener('unload', function()  {  // pagehide  visualstatechange
		try  { if (document.getElementsByName('MasterColorPicker_preserveSettings')[0].checked)  {
			const allValues={};
			for (const p in allSettings)  {
				if (p.match( /^[0-9]+$/ )
				||  (p.match( /^MasterColorPicker_MyPalette/ )
						 &&  (allSettings[p] instanceof Array || !allSettings[p].closest('.options'))))  continue;  //
				switch (allSettings[p].type)  {
				//  radio buttons come in ElementArray groups, not alone; but as a backup…
				case 'radio':  if (allSettings[p].checked)  allValues[p]=allSettings[p].value;
				break;
				case 'checkbox':  allValues[p]=allSettings[p].checked;
				break;
				case 'select-one':
				case 'select-multiple':
				case 'UniDOM ElementArray': {const s=allSettings[p].getSelected();  if (s)  allValues[p]=s.value;}
				break;
				default:  if (allSettings[p].getAttribute('value')!==undefined)  allValues[p]=allSettings[p].value;  }  }
			localStorage.setItem('settingsValues', JSON.stringify(allValues));  }
		else
			localStorage.setItem('settingsValues', "");  }
		catch(e) {localStorage.setItem('restoreError', e.toString());}  });  });
/*==================================================================*/
/*==================================================================*/


//  the x_ColorPicker class is an extension of and interface between
//   the MasterColorPicker implementation of the Picker Class Object and the individual color-picker Classes.
//  see also the end of this file
//  an x_ColorPicker implementation is expected to have (besides the prototype-inherited methods/properties):
//    a  getColor(event)  method  :called by the .prototype.onmouse… and .onclick methods - see their comments
//    a  swatch    :pointer to the swatch HTML for mouse events
//    a  txtInd    :pointer to the HTML text indicator on the color-picker for mouse events
;(function() {  // wrap private members of x_ColorPicker

var userOptions;

/*  Note the following sub-section (the window onload function, with support from UniDOM) is designed to accommodate
	different “options panel” setups.  The palette_select may be a select, radio buttons, or checkboxes.
	A multiple-select or group of checkboxes, either of which allow multiple pickers to be displayed at once,
	preclude the need to “apply to all” on the options panel.  Therefore, if you want to allow multiple pickers,
	remove the “apply to all” option from the HTML options panel.
	You may also remove it if you simply want to force all pickers to conform to the
	currently displayed settings, as opposed to the settings automatically changing as a different picker is selected.
 */
	UniDOM.addEventHandler(window, "onLoad", function() {
		function getName(n) {return n.name.match( /^(?:MasterColorPicker_)?(.+)(?:\[\])?$/ )[1];};

		//first we set the private global members:  grab all the elements with a 'name' attribute (the <input>s) into an array, with corresponding properties
		userOptions=UniDOM.getElementsBy$Class(document.getElementById("MasterColorPicker_options"), 'pickerOptions').getElementsBy$Name("", true, getName);
																																						 // this defines property names (of the array-object: userOptions) ↑ ↑
		userOptions.palette_select=UniDOM(document.getElementById('MasterColorPicker_palette_select'));

  	SoftMoon.WebWare.x_ColorPicker.registeredPickers.setOptions();

		if (userOptions.applyToAll)
			UniDOM.addEventHandler(userOptions.applyToAll, 'onchange', function()  {
				// ↓ ↓ ↓ ¡we can not do this if the palette_select allows multiple palettes at once!
				if (!this.checked)  SoftMoon.WebWare.x_ColorPicker.registeredPickers[userOptions.palette_select.getSelected().value].setOptions();  });
		else  userOptions.applyToAll={checked: true};

		UniDOM.addEventHandler(userOptions.showLocator, 'onchange', function()  {
			if (!userOptions.applyToAll.checked)
      	SoftMoon.WebWare.x_ColorPicker.registeredPickers[userOptions.palette_select.getSelected().value].doIndexLocator=this.checked;
			UniDOM.disable(document.getElementById('MasterColorPicker_locatorStyle'), !this.checked);
			UniDOM.disable(document.getElementById('MasterColorPicker_locatorColor'), !this.checked);
			UniDOM.disable(document.getElementById('MasterColorPicker_interlink'), !this.checked);  });

		UniDOM.addEventHandler([userOptions.doInterlink, userOptions.keepPrecision], 'onchange', function()  {
			if (!userOptions.applyToAll.checked)
      	SoftMoon.WebWare.x_ColorPicker.registeredPickers[userOptions.palette_select.getSelected().value][getName(this)]=this.checked;  });

		UniDOM.addEventHandler([userOptions.outputMode, userOptions.locatorStyle, userOptions.locatorColor], 'onchange', function()  {
			//note that, “technically,” changing one radio button (selecting it) should change another (it automatically deselects)
			//however, by specs only the newly selected one fires an onchange event, simplifying and streamlining this function
			if (!userOptions.applyToAll.checked)
      	SoftMoon.WebWare.x_ColorPicker.registeredPickers[userOptions.palette_select.getSelected().value][getName(this)]=this.value;  });

//		UniDOM.addEventHandler(userOptions.palette_select, 'onchange', function()  {
		UniDOM.addEventHandler(userOptions.palette_select.element, 'onchange', function()  {
			const p=userOptions.palette_select.getSelected();
			if (!(p instanceof Array))
				SoftMoon.WebWare.x_ColorPicker.registeredPickers[p.firstChild.data].putOptions();  });

  });  //close  window onload





SoftMoon.WebWare.x_ColorPicker=function(name)  { // name should match the name given in the HTML  palette_select  (may include spaces)
	if (!new.target)  throw new Error('x_ColorPicker is a constructor, not a function.');
	this.name=name;
	this.id=SoftMoon.WebWare.x_ColorPicker.registeredPickers.length;
	SoftMoon.WebWare.x_ColorPicker.registeredPickers.push(this);
	SoftMoon.WebWare.x_ColorPicker.registeredPickers[name]=this;  }


SoftMoon.WebWare.x_ColorPicker.registeredPickers=new Array;
SoftMoon.WebWare.x_ColorPicker.registeredPickers.setOptions=function()  {
	for (var i=0; i<this.length; i++)  {this[i].setOptions();}  }

/*read the HTML “options” and return the appropriate values for this ColorPicker’s options accordingly*/
SoftMoon.WebWare.x_ColorPicker.prototype.getOptions=function()  {
	if (userOptions.applyToAll.checked)
	  return {
			outputMode: userOptions.outputMode.value,
			keepPrecision: userOptions.keepPrecision.checked,
			canInterlink: this.canInterlink,
			doInterlink: userOptions.doInterlink.checked,
			canIndexLocator: this.canIndexLocator,
			doIndexLocator: userOptions.indexLocator.checked,
			locatorType: userOptions.locatorType.getSelected().value,
			locatorColor: userOptions.locatorColor.getSelected().value }
	else  return this;  }

/*read the HTML “options” and set this ColorPicker’s options accordingly*/
SoftMoon.WebWare.x_ColorPicker.prototype.setOptions=function()  {
	this.outputMode=userOptions.outputMode.value;
	this.keepPrecision=userOptions.keepPrecision.checked;
	this.doInterlink= (this.canIndexLocator && this.canInterlink) ?  userOptions.doInterlink.checked : false;
	this.doIndexLocator= this.canIndexLocator ?  userOptions.showLocator.checked : false;
	this.locatorStyle= this.canIndexLocator ?  userOptions.locatorStyle.getSelected().value : null;
	this.locatorColor= this.canIndexLocator ?  userOptions.locatorColor.getSelected().value : null;  };

/*set the HTML “options” according to this ColorPicker’s options*/
SoftMoon.WebWare.x_ColorPicker.prototype.putOptions=function()  {
	if (!userOptions.applyToAll.checked)  {
		userOptions.outputMode.value=this.outputMode;
		userOptions.keepPrecision.checked=this.keepPrecision;
		userOptions.showLocator.checked=this.canIndexLocator && this.doIndexLocator;
		userOptions.doInterlink.checked=userOptions.showLocator.checked && this.canInterlink && this.doInterlink;
		userOptions.locatorStyle.setSelected(this.locatorStyle);
		userOptions.locatorColor.setSelected(this.locatorColor);  }
		UniDOM.disable(document.getElementById('MasterColorPicker_showLocator'), !this.canIndexLocator);
		UniDOM.disable(document.getElementById('MasterColorPicker_locatorStyle'), !this.canIndexLocator || !this.doIndexLocator);
		UniDOM.disable(document.getElementById('MasterColorPicker_locatorColor'), !this.canIndexLocator || !this.doIndexLocator);
		UniDOM.disable(document.getElementById('MasterColorPicker_interlink'), !this.canIndexLocator || !this.doIndexLocator || !this.canInterlink);  };

SoftMoon.WebWare.x_ColorPicker.prototype.noClrTxt="";       //depends on each color-picker’s HTML requirements.  Often a “hard space” (String.fromCharCode(160))
SoftMoon.WebWare.x_ColorPicker.prototype.outputMode='hex';  //  ‖ 'RGB' ‖ 'HSV' ‖ 'HSB' ‖ 'HSL' ‖ 'HCG' ‖ 'CMYK' ‖ 'native'
SoftMoon.WebWare.x_ColorPicker.prototype.keepPrecision=true;
SoftMoon.WebWare.x_ColorPicker.prototype.canInterlink=true;
SoftMoon.WebWare.x_ColorPicker.prototype.doInterlink=true;
SoftMoon.WebWare.x_ColorPicker.prototype.canIndexLocator=true;
SoftMoon.WebWare.x_ColorPicker.prototype.doIndexLocator=true;
SoftMoon.WebWare.x_ColorPicker.prototype.locatorStyle='o';   //  'x' ‖ 'o' ‖ 'O'
SoftMoon.WebWare.x_ColorPicker.prototype.locatorColor='transforming';  // ‖ 'spinning' ‖ 'b/w'


SoftMoon.WebWare.x_ColorPicker.prototype.onmouseover=function(event)  {
	const x_Colors=this.getColor.apply(this, arguments);
	if (x_Colors)
		this.txtInd.firstChild.data = MasterColorPicker.applyFilters(x_Colors, event, this.name);
	else
		this.txtInd.firstChild.data = this.noClrTxt;
	this.swatch.style.backgroundColor=x_Colors ? x_Colors.RGB.hex : "";
	this.swatch.style.color=x_Colors ? x_Colors.RGB.contrast : "";
	return x_Colors;  }

SoftMoon.WebWare.x_ColorPicker.prototype.onmousemove=SoftMoon.WebWare.x_ColorPicker.prototype.onmouseover;

SoftMoon.WebWare.x_ColorPicker.prototype.onmouseout=function()  {
	this.txtInd.firstChild.data=this.noClrTxt;
	this.swatch.style.backgroundColor="";
	this.swatch.style.color="";  }


SoftMoon.WebWare.x_ColorPicker.prototype.onclick=function(event)  {
	//if (event.type==='contextmenu')  event.preventDefault();
	const x_Colors=this.getColor.apply(this, arguments);
  if (x_Colors && x_Colors.RGB)  MasterColorPicker.pick(x_Colors, event, this.name);  }


// =================================================================================================== \\

// below are the sub-methods (MasterColorPicker.pickFilter) for
//  the MasterColorPicker implementation of the Picker’s “pick()” method. (see the end of this file)
// these become methods of the MasterColorPicker implementation, so “this” refers to  MasterColorPicker

// =================================================================================================== \\

const RGB_calc=new SoftMoon.WebWare.RGB_Calc({
				RGBAFactory: SoftMoon.WebWare.RGBA_Color,
				CMYKAFactory: SoftMoon.WebWare.CMYKA_Color,
				ColorWheelFactory: SoftMoon.WebWare.ColorWheel_Color}, true);

SoftMoon.WebWare.x_ColorPicker.pickFilter=function(x_Colors)  {
	if (this.colorSwatch)  //we must wait until after the input.value is set  ← input.value = thisInstance.interfaceTarget || thisInstance.dataTarget
		setTimeout(() => {this.colorSwatch();}, 0);
	if (typeof x_Colors === 'string')  return x_Colors;
	var chosen;
	const mode=userOptions.outputMode.value.toUpperCase(),
			format={
		stringFormat: {value:this.outputFormat},
		hueAngleUnit: {value:this.hueAngleUnit},
		useAngleUnitSymbol: {value:null}  };
	if (x_Colors[mode]  &&  x_Colors[mode].config)  x_Colors[mode].config.push(format);
	switch (mode)  {
		case 'HEX':  x_Colors.RGB.config.useHexSymbol=this.useHexSymbol;
								 chosen=x_Colors.RGB.hex;
			break;
		case 'RGB':  chosen=x_Colors.RGB.toString();
			break;
		case 'HSB':
		case 'HSV':
		case 'HSL':
		case 'HWB':
		case 'HCG':
		case 'CMYK':
		case 'XYZ':  //these are always wrapped
			try {
				if (!(chosen=x_Colors[mode]))  (x_Colors[mode]=RGB_calc.to[mode.toLowerCase()](x_Colors.RGB.rgba)).config.push(format);
				chosen=x_Colors[mode].toString();
				break;  }
			catch(e) {console.error('MCP pickFilter bummer!  mode='+mode+' error!: ',e);}
		case 'NATIVE':
		default:
			if (x_Colors[x_Colors.model].config)  x_Colors[x_Colors.model].config.push(format);
			chosen=x_Colors[x_Colors.model].toString();  }
	x_Colors.text_output=chosen;
	return x_Colors;  }




SoftMoon.WebWare.x_ColorPicker.toSystemClipboard=function(x_Colors, event)  {
	if (event.type==='click'  &&  MasterColorPicker.copyToClipboard)  {
		try {navigator.clipboard.writeText(x_Colors.text_output);}
		catch(e) {
			var inp=this.interfaceTarget || this.dataTarget;
			inp.value=x_Colors.text_output;  inp.select();
			document.execCommand("copy");
			inp.setSelectionRange(inp.value.length, inp.value.length);  }  }
	return x_Colors;  }


// We need a function that returns the text for the Picker’s  pickFilter
SoftMoon.WebWare.x_ColorPicker.color_to_text=function(x_Colors)  {return x_Colors.text_output;}


SoftMoon.WebWare.x_ColorPicker.x_Color=function(color)  { var RGB;
	if (!new.target)  throw new Error('“x_Color” is a constructor, not a function.');
  if (!(RGB=MasterColorPicker.RGB_calc(color)))  return false;
	this.RGB=RGB;
	this.model='text';
	this.text=color;  }




SoftMoon.WebWare.x_ColorPicker.ColorFilter=ColorFilter;
function ColorFilter(x_Colors)  {
	const
		HTML=document.getElementById('MasterColorPicker_Filter'),
		rgb_calc=MasterColorPicker.RGB_calc;
	if ( typeof x_Colors == 'string'
	||  !userOptions.showFilter.checked
	||  (MasterColorPicker.interfaceTarget  &&  UniDOM.hasAncestor(MasterColorPicker.interfaceTarget, HTML)) )
		return x_Colors;
	var i, f, filter, isFiltered=false;
	const
		colors=UniDOM.getElementsBy$Name(HTML, /color/ ),
		factors=UniDOM.getElementsBy$Name(HTML, /factor/ );

	rgb_calc.config.push({RGBAFactory: {value:Array}});
	try {
		if (filterOptions.average.value==='average')  {
			var count=0, fs=0;
			const sum=[0,0,0];
			for (i=0;  i<colors.length;  i++)  {
				if (colors[i].value  &&  (filter=rgb_calc(colors[i].value)))  {
					sum[0]+=filter[0];  sum[1]+=filter[1];  sum[2]+=filter[2];
					f= parseFloat(factors[i].value||0);
					if (factors[i].value  &&  factors[i].value.match(/%/))   f/=100;
					fs+=f;
					count++;  }  }
			if (count)  { isFiltered=true;
				sum[0]/=count;  sum[1]/=count;  sum[2]/=count;  fs/=count;
				ColorFilter.applyFilter(x_Colors.RGB.rgb, sum, fs, filterOptions.applyToAverage);  }  }

		else  {
			const applies=UniDOM.getElementsBy$Name(HTML, /apply\[/ );
			for (i=0;  i<colors.length;  i++)  {
				if (colors[i].value  &&  (filter=rgb_calc(colors[i].value)))  { isFiltered=true;
					f= parseFloat(factors[i].value||0);
					if (factors[i].value  &&  factors[i].value.match(/%/))   f/=100;
					ColorFilter.applyFilter(x_Colors.RGB.rgb, filter, f, applies[i]);  }  }  }

		if (isFiltered)  {
	//		x_Colors.RGB=new SoftMoon.WebWare.RGBColor(x_Colors.RGB.rgb[0], x_Colors.RGB.rgb[1], x_Colors.RGB.rgb[2], true);
			if (x_Colors.model.toLowerCase() !== 'rgb')  {
				if (x_Colors.model==='text')  x_Colors.model='RGB';
				else  x_Colors[x_Colors.model]=RGB_calc.to[x_Colors.model.toLowerCase()](x_Colors.RGB.rgba);  }  }  }
	finally {rgb_calc.config.pop();}
	return x_Colors;  }

ColorFilter.applyFilter=function(rgb, filter, f, apply)  {
	switch (apply.value)  {
	case 'add to':
		rgb[0]+=filter[0]*f,  rgb[1]+=filter[1]*f,  rgb[2]+=filter[2]*f;
		return;
	case 'sub from':
		rgb[0]-=filter[0]*f,  rgb[1]-=filter[1]*f,  rgb[2]-=filter[2]*f;
		return;
	case 'grade to':
		rgb[0]+=(filter[0]-rgb[0])*f,  rgb[1]+=(filter[1]-rgb[1])*f,  rgb[2]+=(filter[2]-rgb[2])*f;
		return;  }  }

var filterOptions;

UniDOM.addEventHandler(window, 'onload', function()  {
	const
		Filter=UniDOM(document.getElementById('MasterColorPicker_Filter')),
		tBody=Filter.getElementsByTagName('tbody')[0],
		Genie=
	ColorFilter.Genie=new SoftMoon.WebWare.FormFieldGenie(
		{ maxTotal:7,
			climbTiers:false,
			groupClass: 'filterColor',
			doFocus:false,  //at this time (Feb2020) giving focus to the newly cloned field via the Genie will cause the Picker to disapear, as focus is lost in the current field before giving focus to the new element
			cloneCustomizer:function(tr)  { var s=tr.getElementsByTagName('span')[0]; s.style.backgroundColor=""; s.style.color="";
				UniDOM.getElementsBy$Name(tr).remove$Class([MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceElement]);  },
			fieldsetCustomizer:function()  { Filter.getElementsBy$Name( /apply\[/ ).map( function(e, i, a)  {
				e.element.setAttribute("tabToTarget", (i<a.length-1) ? "false" : "true");  } );  }  } );
	Genie.catchTab=tabbedOut.bind(Genie, /color/ ,  /_average/ );
	filterOptions=Filter.getElementsBy$Name( /average/i , true, function(n) {return n.name.match( /Filter_(.+)$/ )[1];}, true);
	UniDOM.addEventHandler(filterOptions.average.element, 'onchange', function()  {
		UniDOM.disable(filterOptions.applyToAverage.element.parentNode, this.value!=='average');
		Filter.getElementsBy$Name( /apply\[/ ).disable(this.value==='average');  });
	UniDOM.generateEvent(filterOptions.average, 'onchange', {bubbles: false});
	UniDOM.addEventHandler(tBody, 'onFocusIn', function() {Genie.tabbedOut=false;});
	UniDOM.addEventHandler(tBody, 'onKeyDown', Genie.catchTab);
	UniDOM.addEventHandler(tBody, 'onFocusOut', function()  {
		if (!Genie.tabbedOut  &&  event.target.name.match( /color/ ))  Genie.popNewField(event.target.closest('tr'));  });  });



// =================================================================================================== \\

// this is here for your convenience in hacking.  Changing it will not affect normal operation.
SoftMoon.WebWare.x_ColorPicker.tabbedOut=tabbedOut;

// This supersedes the Picker’s InterfaceElement → keydown handler.
// Getting the FormFieldGenie and the Picker to work together is like choreographing a dance where one is doing the Waltz and the other the Lindy.
// The first two (2) arguments and the value of “this” are bound by/to the Genies.
// The “event” Object argument is passed by UniDOM.
function tabbedOut(GENIE_FIELDS, DOM_CRAWL_STOP, event)  {
	if (!( event.target.name.match( GENIE_FIELDS )                    //            === ,<                 === .>
			&&  (this.tabbedOut=(event.keyCode===9  ||  (event.ctrlKey && (event.keyCode===188 || event.keyCode===190)))) ))  return;
	function isTabStop(e)  {
		const isI=(SoftMoon.WebWare.Picker.isInput(e)  &&  !e.disabled);
		if (isI  &&  e.name.match( DOM_CRAWL_STOP ))  goDeep.doContinue=false;
		return isI;  }
	function goDeep(e) {return !e.disabled;}
	const tabToTarget=(!event.shiftKey  &&  !event.ctrlKey  &&  event.target.getAttribute('tabToTarget')==='true');
	var old, e, i=0;
	if (!tabToTarget  &&  !event.ctrlKey)  old=UniDOM.getElders(event.target, isTabStop, goDeep);
	this.popNewField(this.config.groupClass ? UniDOM.getAncestorBy$Class(event.target, this.config.groupClass) : event.target);
	if (event.ctrlKey)  return;  //the Picker will catch it on the bubble-up to the MyPalette picker-panel
	if (tabToTarget)  {
		MasterColorPicker.dataTarget.focus();
		event.preventDefault();   // stop the browser from controlling the tab
		event.stopPropagation();  // stop the Picker from controlling the tab
		return;  }
	if (event.shiftKey)  //backtab
		try{
		do {e=old[i++]}  while (!e.isConnected);
		}catch(e){  event.preventDefault();  event.stopPropagation();  return;}
	else  {//forward tab
		if (!(e=event.target).isConnected)  do {e=old[i++]}  while (!e.isConnected);
		SoftMoon.WebWare.Picker.goDeep.className=MasterColorPicker.classNames.picker;
		SoftMoon.WebWare.Picker.goDeep.picker_select=MasterColorPicker.picker_select;
		e=UniDOM.getJuniors(e, SoftMoon.WebWare.Picker.isTabStop, SoftMoon.WebWare.Picker.goDeep)[0];  }
	UniDOM.generateEvent(e, 'tabIn', {bubbles:true});
	event.preventDefault();
	event.stopPropagation();
	return;  }

// =================================================================================================== \\

function idGen(e)  {if (!e.id)  e.id='SoftMoon.'+Date.now();  return e;}
SoftMoon.WebWare.x_ColorPicker.idGen=idGen;

SoftMoon.WebWare.x_ColorPicker.MyPalette=MyPalette;
function MyPalette(HTML, PNAME)  {
	if (!new.target) throw new Error("“MyPalette” is a constructor, not a method or function.");
	var thisPalette=this;
	//this.palette=new Array;
	this.HTML=HTML;
	this.table=HTML.getElementsByTagName('table')[0];
	this.tbodys=this.table.getElementsByTagName('tbody');
	this.trs=this.table.getElementsByTagName('tr');
	this.addToMyPalette=UniDOM.getElementsBy$Name(HTML, /addToMyPalette/ , 1)[0];
	this.MetaGenie=new SoftMoon.WebWare.FormFieldGenie({
		maxTotal: 10,
		doFocus: false,
		grouptTag: 'TEXTAREA',
		cloneCustomizer:function(ta)  {
			UniDOM.remove$Class(ta, [MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceElement]);  },
		dumpEmpties:true  });
	this.MetaGenie.catchTab=tabbedOut.bind(this.MetaGenie, /header|footer/ ,  /_name/ );
	this.MetaGenie.isActiveField=UniDOM.alwaysTrue;
	this.ColorGenie=new SoftMoon.WebWare.FormFieldGenie({
		groupClass:"MyColor",
		maxTotal:420,
		doFocus:false,
		updateName:function(inp, i, tbody) { i=0;
			while (thisPalette.tbodys[i] && tbody!==thisPalette.tbodys[i])  {i++;};
			inp.name=inp.name.replace( /MyPalette\[[0-9]+\]/ , "MyPalette["+i+"]");  },
		dumpEmpties:function(tr, deleteEntry)  {
			var flag=(tr.children[0].nodeName!=="TH");
			if (flag)
				flag=( deleteEntry  ||
					 UniDOM.getElementsBy$Name(tr, /definition/ , 1)[0].value==""
				&& UniDOM.getElementsBy$Name(tr, /name/ , 1)[0].value=="");
			return flag;  },
		cloneCustomizer:function(tr, paste)  { var i, td, menu;
			if (!paste)  { for (i=0; i<4; i++)  {
				td=tr.children[i]; td.style.backgroundColor=""; td.style.color=""; td.style.borderStyle=""; td.style.borderColor=""  }  }
			if (menu=tr.getElementsByClassName("MyPalette_ColorGenieMenu")[0])  menu.parentNode.removeChild(menu);
			UniDOM.getElementsBy$Name(tr).remove$Class([MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceElement]);  },
		fieldsetCustomizer:function(tb) {UniDOM.getElementsBy$Name(tb, /\[name\]/ ).map(function(e, i, a)  {
			e.setAttribute("tabToTarget", (i<a.length-1  ||  tb!==tb.parentNode.lastElementChild) ? "false" : "true")});}  });
	this.ColorGenie.catchTab=tabbedOut.bind(this.ColorGenie, /\d\]\[(?:definition|name)/ , /addToHere/ );
	this.ColorGenie.isActiveField=UniDOM.alwaysTrue;
	this.ColorGenie.HTML_clipMenu=HTML.removeChild(HTML.getElementsByClassName('MyPalette_ColorGenieMenu')[0]);;
	this.ColorGenie.HTML_clipMenu.onclick=function(event) {thisPalette.onColorGenieMenuSelect(event);}
	this.SubPaletteGenie=new SoftMoon.WebWare.FormFieldGenie({
		indxTier:2,
		groupTag:"TBODY",
		maxTotal:420,
		doFocus:false,
		dumpEmpties:function(tbody, deleteFlag) {return deleteFlag||false;},
		cloneCustomizer:function(tbody)  {
			idGen(tbody);
			if (thisPalette.options.autoSelect)  tbody.querySelector("[name$='addToHere']").checked=true;  },
		fieldsetCustomizer:function(tbl)  {
			thisPalette.alignParentPaletteSelectors();
			for (var i=1; i<tbl.children.length; i++)  {
				UniDOM.getElementsBy$Class(tbl.children[i].firstElementChild, 'subPalette').disable(i===1);
				tbl.children[i].lastElementChild.lastElementChild.firstElementChild.setAttribute("tabToTarget", (i<tbl.children.length-1) ? "false" : "true");  }  }  });
	this.SubPaletteGenie.isActiveField=UniDOM.alwaysTrue;

	// the Genies’ updateName methods will have to be rewritten if you create more than one instance of MyPalette (with two separate HTML sets)
	//  AND if you want the two separate MyPalette HTML form controls to be sent to a server with a standard form-submit.

	// init the HTML with handlers, etc.

	const optionsHTML=HTML.querySelector('fieldset.options');
	UniDOM.addEventHandler(optionsHTML, 'onMouseEnter', function(event){UniDOM.addClass(event.currentTarget.parentNode, 'pseudoHover');});
	UniDOM.addEventHandler(optionsHTML, 'onMouseleave', function(event){UniDOM.remove$Class(event.currentTarget.parentNode, 'pseudoHover');});
	this.options=UniDOM.getElementsBy$Name(optionsHTML, "", true, function(e){return e.name.match( /_([^_]+)$/ )[1];});
	UniDOM.addEventHandler(this.options.showColorblind, 'onchange', showColorBlind);
	function showColorBlind(){UniDOM.useClass(thisPalette.table, "showColorblind", thisPalette.options.showColorblind.checked);}
	showColorBlind();

	const
		portHTML=HTML.querySelector(".portDialog"),
		paletteMetaHTML=portHTML.querySelector(".paletteMeta");

	UniDOM(HTML).getElementsBy$Name( /_delete/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function() {thisPalette.onDelete();});
	UniDOM(HTML).getElementsBy$Name( /_makeSub/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function() {thisPalette.makeSub();});
	UniDOM(HTML).getElementsBy$Name( /_port\]?$/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function() {portHTML.disabled= !portHTML.disabled});
	UniDOM(HTML).getElementsBy$Name( /_porter/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function(event) {thisPalette.porter(event);});

	const
		_import  =UniDOM.getElementsBy$Name(portHTML, /_import/ , 1)[0],  //the input type=file
		_porter  =UniDOM.getElementsBy$Name(portHTML, /_porter/ , 1)[0],  //the load/save button
		_replace =UniDOM.getElementsBy$Name(portHTML, /_replace_file/ , 1)[0],  //checkbox
		_autoload=UniDOM.getElementsBy$Name(portHTML, /_autoload/ , 1)[0],  //checkbox
		_mergeMode=portHTML.querySelector('.paletteMerge'),  //fieldset
		_filetype=paletteMetaHTML.querySelector('.filetype'),   //fieldset
		activeClasses=[['import', 'export'], ['server', 'local', 'browser', 'current']],
		fileExportClasses=['server', 'local', 'browser'];
	activeClasses[0].logic= activeClasses[1].logic= 'or';  //“logic” is only applicable to has$Class()
	fileExportClasses.logic='or';

	UniDOM.addEventHandler(portHTML, 'onchange', function(event)  {
		UniDOM.disable(_porter, !UniDOM.has$Class(portHTML, activeClasses)
												 || (UniDOM.has$Class(portHTML, ['import', 'local']) && !_import.value)
												 || (UniDOM.has$Class(portHTML, ['export', 'local']) && !UniDOM.getSelected(_filetype))
												 || (UniDOM.has$Class(portHTML, ['export', fileExportClasses]) && !paletteMetaHTML.querySelector("input[name$='filename']").value)
												 || (UniDOM.has$Class(portHTML, 'import') && !UniDOM.getSelected(_mergeMode)) );  });

	UniDOM.addEventHandler(portHTML.querySelector(".portMode"), 'onchange', function(event)  {
		UniDOM.remove$Class(portHTML, activeClasses[0]);
		UniDOM.addClass(portHTML, event.target.value);
		UniDOM.disable(paletteMetaHTML, event.target.value==='import');
		UniDOM.disable(_import.parentNode, event.target.value==='export' || !UniDOM.has$Class(portHTML, 'local'));
		UniDOM.disable(_mergeMode, event.target.value==='export');
		});

	UniDOM.addEventHandler(portHTML.querySelector('.port'), 'onchange', function(event)  { var ft;
		if (!event.target.name.match( /_port\]?$/ ))  return;
		UniDOM.remove$Class(portHTML, activeClasses[1]);
		UniDOM.addClass(portHTML, event.target.value);
		UniDOM.disable(_import.parentNode, event.target.value!=='local' ||  UniDOM.has$Class(portHTML, 'export'));
		UniDOM.disable(_replace.parentNode, (event.target.value!=='browser' && event.target.value!=='server') );
		UniDOM.disable(_autoload.parentNode, (event.target.value!=='browser' && event.target.value!=='server')
																			|| (event.target.value==='server'  &&  (!(ft=UniDOM.getSelected(_filetype))  ||  ft.value!=='json')) );
		UniDOM.disable(_filetype, event.target.value!=='server'  &&  event.target.value!=='local');
		UniDOM.disable(_filetype.querySelector("input[value='js']").parentNode, event.target.value!=='local');
		});

	UniDOM.addEventHandler(_filetype, 'onchange', function(event)  {
		UniDOM.disable(_autoload.parentNode, event.target.value!=='json' );  });

	UniDOM.addEventHandler(Array.from(portHTML.querySelectorAll("note[referto]")), 'click', function findHelp(event)  {
		MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Help'));
		document.getElementById(event.currentTarget.getAttribute('referto')).scrollIntoView();  });
  UniDOM.addPowerSelect(paletteMetaHTML.querySelector("select.duplicate"));
	UniDOM.addPowerSelect(paletteMetaHTML.querySelector("select.alternative"))

	for (let i=0; i<portHTML.elements.length; i++)  {if (portHTML.elements[i].type==='radio')  portHTML.elements[i].checked=false;}
	UniDOM.disable(paletteMetaHTML, true);
	UniDOM.disable(_import.parentNode, true);
	UniDOM.disable(_porter, true);
	UniDOM.disable(_replace.parentNode, true);
	UniDOM.disable(_autoload.parentNode, true);
	UniDOM.disable(_mergeMode, true);
	UniDOM.disable(_filetype, true);

  UniDOM.addEventHandler(paletteMetaHTML, 'onFocusIn', function() {thisPalette.MetaGenie.tabbedOut=false});
	UniDOM.addEventHandler(paletteMetaHTML, 'onKeyDown', this.MetaGenie.catchTab);
	UniDOM.addEventHandler(paletteMetaHTML, 'onFocusOut', function()  {
		if (event.target.nodeName==='TEXTAREA'
		&&  !thisPalette.MetaGenie.tabbedOut)  thisPalette.MetaGenie.popNewField(event.target);  });

	UniDOM.addEventHandler(this.table, 'onKeyDown', function(event)  {
		var inpName;
		const goDeep=UniDOM.alwaysTrue;
		function getTabStop(e, src)  {
			const isit=(e.name && e.name.indexOf(inpName[0])>=0);
			if (isit) goDeep.doContinue=false;
			return isit;  }
		if (event.keyCode===113  &&  event.ctrlKey)  {  // F2 key
			event.stopPropagation();
			event.preventDefault();
			inpName=thisPalette.makeSub().querySelector("input[name$='[Name]']");
			UniDOM.generateEvent(inpName, 'tabIn', {bubbles:true});   }
		else
		if ( ( event.keyCode===38  ||  event.keyCode===40)  //verticle tab ↑ ↓
		&&  (inpName=event.target.name.match( /selected|definition|[Nn]ame/ ))
		&&  (inpName= (event.keyCode===38) ?
								UniDOM.getElders(event.target, getTabStop, goDeep)[0]
							: UniDOM.getJuniors(event.target, getTabStop, goDeep)[0] ) )  {
			UniDOM.generateEvent(inpName, 'tabIn', {bubbles:true});
			event.preventDefault();  }  });

	UniDOM.addEventHandler(this.table, 'buttonpress', function(event)  {
		if (event.target.name.match( /addSelected/ ))  thisPalette.addSelected(event.target.parentNode.parentNode.parentNode);  });
	// Note we set attributes so the FormFieldGenies will clone them without hassle.
	UniDOM.getElementsBy$Name(this.table, /selectAll/ ).map(function(e)  {e.setAttribute('onchange',
			"MasterColorPicker."+PNAME+".selectAll(event, this);")  });
	UniDOM.getElementsBy$Name(this.table, /addSelected/ ).map(function(e)  { e.setAttribute('onclick',
			"MasterColorPicker."+PNAME+".addSelected(this.closest('tbody'));")  });
	UniDOM.getElementsBy$Name(this.table, /addToHere/ , 1)[0].checked=true;
	UniDOM.getElementsBy$Class(this.table, 'MyColor').map(function(e)  {
		e.setAttribute('onfocusin', "MasterColorPicker."+PNAME+".ColorGenie.tabbedOut=false");
		e.setAttribute('onkeydown', "MasterColorPicker."+PNAME+".ColorGenie.catchTab(event)");
		e.setAttribute('onfocusout', "if (!MasterColorPicker."+PNAME+".ColorGenie.tabbedOut)  MasterColorPicker."+PNAME+".ColorGenie.popNewField(this)");  });
	UniDOM.getElementsBy$Class(this.table, "dragHandle" ).map(function(e)  { e.setAttribute('oncontextmenu',
			"if (event.button===2)  MasterColorPicker."+PNAME+".showColorGenieMenu(event, this);");  });
	const tr=this.trs;
	for (var sel, i=1;  i<tr.length;  i++)  {
		switch (tr[i].children[0].nodeName)  {
		case 'TD':
			tr[i].children[0].setAttribute('onclick',
				"if (event.target===this  &&  (x_Color=new SoftMoon.WebWare.x_ColorPicker.MyPalette_Color(this.parentNode.querySelector(\"[name$='[definition]']\").value))  &&  x_Color.RGB)  MasterColorPicker.pick(x_Color, event, '"+PNAME+"');");
			tr[i].querySelector('.dragHandle').setAttribute('onmousedown',
				"if (event.target===this)  MasterColorPicker."+PNAME+".dragger(event, this.parentNode, 'MCP_dragMyPaletteColor', 'isBeingDragged', 'MyColor');");
		break;
		case 'TH':
			if (sel=tr[i].querySelector("select[name$='[parent]']"))  sel.setAttribute('onchange',
				"MasterColorPicker."+PNAME+".alignParentPaletteSelectors(this);");
			tr[i].querySelector("input[name$='[Name]']").setAttribute('onchange',
				"MasterColorPicker."+PNAME+".alignParentPaletteSelectors(this);");
			tr[i].setAttribute('onmousedown',
				"switch (event.target.tagName) {case'LABEL': case'SELECT': case'INPUT': case'BUTTON': return; default: MasterColorPicker."+PNAME+".dragger(event, this.parentNode, 'MCP_dragMySubPalette', 'isBeingDragged', 'MyPaletteBody')}");  }  }

	this.SubPaletteGenie.config.clone=this.tbodys[0].cloneNode(true);
	UniDOM.getElementsBy$Class(this.tbodys[0], 'subPalette').disable(true);
	idGen(this.tbodys[0]);
	this.alignParentPaletteSelectors();  }


class MyPalette_Color extends SoftMoon.WebWare.x_ColorPicker.x_Color  {  }
SoftMoon.WebWare.x_ColorPicker.MyPalette_Color=MyPalette_Color;


MyPalette.prototype.onPick=function(x_Color, event)  {
	if (!userOptions.showMyPalette.checked
	||  (MasterColorPicker.interfaceTarget  &&  UniDOM.hasAncestor(MasterColorPicker.interfaceTarget, this.table)))  return x_Color;
	const mp=this.addToMyPalette.value;
	if (event instanceof Event
	&& (  (event.type==='click'
				 && ((mp==='single-click' && event.detail===1  &&  !(x_Color instanceof MyPalette_Color))
					|| (mp==='single-click' && event.detail===2  &&  x_Color instanceof MyPalette_Color)
					|| (mp==='double-click' && event.detail===2)
					|| (mp==='shift-click'  && event.detail===1  &&  event.shiftKey)))
		 || (event.type==='contextmenu'
				 && mp==='right-click' && event.detail===1) ) )
		this.addColor(x_Color.text_output);
	return x_Color;  }

MyPalette.prototype.addColor=function(color, name)  {
	//if (name)  for (var i=0; i<this.palette.length; i++)  {if (this.palette[i].name===name)  return false;}
	for (var i=0; i<this.tbodys.length; i++)  {
		if (UniDOM.getElementsBy$Name(this.tbodys[i], /_addToHere/ , 1)[0].checked)  break;  }  //.children[0].children[0].lastElementChild.children[0]
	if (i>=this.tbodys.length)  return false;
	const
		tr=this.tbodys[i].lastElementChild,
		inp=tr.querySelector("[name$='[definition]']");
	inp.value=color;
	tr.querySelector("[name$='[name]']").value=name||"";
	MasterColorPicker.colorSwatch(inp);
	this.ColorGenie.popNewField(tr, {doso:true});
	tr.scrollIntoView();
	return true;  }

MyPalette.prototype.getColor=function(name)  {
	for (var i=1; i<this.trs.length; i++)  {

	}
	}

MyPalette.prototype.alignParentPaletteSelectors=function()  {
	const
		names=this.table.querySelectorAll("input[name$='[Name]']"),
		selectors=this.table.querySelectorAll("select[name$='[parent]']"),
		tbodys=this.tbodys;
	var i, j, parent, kids, n, opt;
	function getChain(id)  { for (var k=1; k<selectors.length; k++)  { if (i===k)  continue;
		if (selectors[k].value===id)  {kids.push(k);  getChain(tbodys[k].id)}  }  }
	for (i=1; i<selectors.length; i++)  {
		parent=selectors[i].value;
		kids=new Array;
		getChain(tbodys[i].id);
		selectors[i].length=0;
		for (j=0; j<names.length; j++)  {
			if ( i!==j  &&  kids.indexOf(j)<0
			&& ( (n=names[j].value)
				|| (j===0  &&  (n="«« MyPalette «root» »»")) ) )  {
					opt=new Option(n, tbodys[j].id, j===0, tbodys[j].id===parent);
					opt.setAttribute('name', tbodys[j].id);
					selectors[i].add(opt);  }  }  }  }


MyPalette.prototype.selectAll=function(event, checkbox)  {
	const tr=checkbox.closest('tbody').getElementsByTagName('tr');
	for (var i=1;  i<tr.length-1;  i++)  {tr[i].children[0].children[0].checked=checkbox.checked;}  }

MyPalette.prototype.onDelete=function()  {
	for (var i=1;  i<this.trs.length-1;  i++)  {
		if (this.trs[i].children[0].nodeName==='TH'
		&&  this.trs[i].parentNode.className.match( /\bMyPaletteBody\b/ )
		&&  UniDOM.getElementsBy$Name(this.trs[i].children[0], /selectThis/ , 1)[0].checked)
			this.SubPaletteGenie.deleteField(this.trs[i--].parentNode);
		else
		if (this.trs[i].children[0].children[0].checked)
			this.ColorGenie.deleteField(this.trs[i--]);  }  }

MyPalette.prototype.moveColor=function(from, to)  {
		this.ColorGenie.cutField(from, {clip:"MCP_system", dumpEmpties:false});
		this.ColorGenie.pasteField(to, {clip:"MCP_system", doso:"insert", dumpEmpties:false, doFocus:false});  }

//Note we can always do a simple cut/paste with fields, because there is always an empty field at the end to “insertBefore” — not so with moving subPalettes

MyPalette.prototype.moveSub=function(from, to)  {
		this.SubPaletteGenie.cutField(from, {clip:"MCP_system", dumpEmpties:false});
		this.SubPaletteGenie.popNewField(to||this.table, {clip:"MCP_system", doso:"paste", addTo:!to, dumpEmpties:false, doFocus:false});  }

MyPalette.prototype.makeSub=function()  {
	if (this.SubPaletteGenie.popNewField(this.table, {addTo:true}))  {
		for (var i=1, l=this.trs.length-3, newSub=this.tbodys[this.tbodys.length-1];  i<l;  i++)  {
			if (this.trs[i].querySelector("input[type='checkbox']").checked  &&  this.trs[i]!==this.trs[i].parentNode.lastElementChild)
				this.moveColor(this.trs[l--, i--], newSub.lastElementChild);  }  }
	return newSub;  }

MyPalette.prototype.addSelected=function(tbody)  {
	for (var i=1, iOff=1;  i<this.trs.length;  i++)  {
		if (this.trs[i].parentNode===tbody)  {iOff=0;  continue;}
		if (this.trs[i].children[0].nodeName==='TH')  continue;
		if ((chk=this.trs[i].querySelector("input[type='checkbox']")).checked  &&  this.trs[i]!==this.trs[i].parentNode.lastElementChild)  {
			if (this.options.autoUncheck.checked)  chk.checked=false;
			this.moveColor(this.trs[i], tbody.lastElementChild);
			i-=iOff;  }  }
	var chk, sel, index=Array.prototype.indexOf.call(this.tbodys, tbody)+1;
	for (i=1; i<this.tbodys.length; i++)  {
		if (i===index-1)  continue;
		if (this.options.autoUncheck.checked)  this.tbodys[i].children[0].querySelector("[name$='selectAll']").checked=false;
		if ((chk=this.tbodys[i].children[0].querySelector("[name$='selectThis']")).checked)  {
			if (this.options.autoUncheck.checked)  chk.checked=false;
			sel=this.tbodys[i].children[0].querySelector("select[name$='[parent]']");
			if (sel.options[tbody.id])  sel.options[tbody.id].selected=true;
			else  sel.options.add(new Option('♪Hi♫ HO!  ♫HI♪ ho! It’s home from work we go…♪♫♪♫', tbody.id, false, true));
			if (i!==index)  this.moveSub(this.tbodys[i--], this.tbodys[index++]);
			else  this.alignParentPaletteSelectors();  }  }  }

MyPalette.prototype.dragger=function(event, group, bodyClass, dragClass, groupClass)  {
	if (event.button!==0)  return;
	event.preventDefault();
	UniDOM.addClass(document.body, bodyClass);
	UniDOM.addClass(group, dragClass);
	var mouseEvent=null;
	const
		thisPalette=this,
		tablePos=this.HTML.getBoundingClientRect(),
		drop=UniDOM.addEventHandler(document.body, 'onMouseUp',
			function(event)  {
				event.preventDefault();
				UniDOM.remove$Class(document.body, bodyClass);
				UniDOM.remove$Class(group, dragClass);
				drop.onMouseUp.remove();
				catsEye.onMouseMove.remove();
				clearInterval(scroller);
				var moveTo;
				if (UniDOM.hasAncestor(event.target, thisPalette.table)
				&&  (moveTo= UniDOM.has$Class(event.target, groupClass)  ?  event.target : UniDOM.getAncestorBy$Class(event.target, groupClass))
				&&  group!==moveTo  &&  group.nextElementSibling!==moveTo)
					(group.tagName==="TR") ? thisPalette.moveColor(group, moveTo) : thisPalette.moveSub(group, moveTo);  },
			true),
		catsEye=UniDOM.addEventHandler(document.body, 'onMouseMove', function(event) {mouseEvent=event}, true),
		scroller=setInterval(function()  {
				if (!mouseEvent  ||  mouseEvent.clientX<tablePos.left  ||  mouseEvent.clientX>tablePos.right)  return;
				if (mouseEvent.clientY<tablePos.top)  thisPalette.HTML.scrollTop-=tablePos.top-mouseEvent.clientY;
				else
				if (mouseEvent.clientY>tablePos.bottom)  thisPalette.HTML.scrollTop+=mouseEvent.clientY-tablePos.bottom;  },
			42);  }

MyPalette.prototype.showColorGenieMenu=function(event, handle)  {
	event.preventDefault();  event.stopPropagation();
	if (this.ColorGenie.HTML_clipMenu.parentNode  &&  UniDOM.hasAncestor(this.ColorGenie.HTML_clipMenu, handle))  return;
	UniDOM.addClass(handle, "withMenu");
	const
		thisPalette=this,
		xer=UniDOM.addEventHandler(handle, 'onMouseLeave', function()  {
			xer.onMouseLeave.remove();
			UniDOM.remove$Class(handle, "withMenu");
			handle.removeChild(thisPalette.ColorGenie.HTML_clipMenu);  }),
		xyPos=UniDOM.getElementOffset(handle, true);
	this.ColorGenie.HTML_clipMenu.style.position= 'fixed';
	this.ColorGenie.HTML_clipMenu.style.top= xyPos.y+'px';
	this.ColorGenie.HTML_clipMenu.style.left=xyPos.x+'px';
	handle.appendChild(this.ColorGenie.HTML_clipMenu);  }

MyPalette.prototype.onColorGenieMenuSelect=function(event)  {
	const myColor=UniDOM.getAncestorBy$Class(this.ColorGenie.HTML_clipMenu, "MyColor");
	switch (event.target.tagName)  {
		case 'SPAN':               return this.ColorGenie.popNewField(myColor, {doso:"insert"});
		case 'LI':  if (event.target.parentNode.tagName==='UL')  switch (event.target.parentNode.parentNode.firstChild.data.trim())  {
			case 'insert:':          return this.ColorGenie.pasteField(myColor, {doso:"insert", clip:event.target.innerHTML});
			case 'copy to:':         return this.ColorGenie.copyField(myColor, {clip:event.target.innerHTML});
			case 'cut to:':          return this.ColorGenie.cutField(myColor, {clip:event.target.innerHTML});
			case 'paste from:':      return this.ColorGenie.pasteField(myColor, {clip:event.target.innerHTML});  }
			else if (event.detail===3)  switch (event.target.innerHTML)  {
			case 'delete':           return this.ColorGenie.deleteField(myColor);
			case 'clear clipboard':  return this.ColorGenie.clearClipboard(true);  }  }  }

MyPalette.prototype.clearPalette=function()  {
	var paletteMeta=this.HTML.querySelector('.paletteMeta');
	UniDOM.getElementsBy$Name(paletteMeta, /name/ , 1)[0].value="";
	paletteMeta=UniDOM.getElementsBy$Name(paletteMeta, /header|footer/ );
	for (var i=paletteMeta.length; --i>=0;)  {
		if (UniDOM.isLast(paletteMeta[i]))  paletteMeta[i].value="";
		else  this.MetaGenie.deleteField(paletteMeta[i]);}
	for (i=this.tbodys.length;  --i>0;)  {this.SubPaletteGenie.deleteField(this.tbodys[i]);}
	for (i=this.trs.length-1;  --i>1;)  {this.ColorGenie.deleteField(this.trs[i]);}
	i=UniDOM.getElementsBy$Name(this.trs[2], /definition|name/ );  i[0].value="";  i[1].value="";  }

MyPalette.prototype.fromJSON=function(JSON_palette, mergeMode)  {
	if (typeof JSON_palette !== 'object')  return false;
	if (mergeMode===undefined)  mergeMode=UniDOM.getElementsBy$Name(this.HTML.querySelector('.paletteMerge'), /import_merge_mode/ ).getSelected().value;
	if (mergeMode==='replace')  this.clearPalette();
	var pName, palette;
	for (pName in JSON_palette)  {
		JSON_palette=JSON_palette[pName];
		palette= getPalette(JSON_palette);
		break;  }
	if (typeof palette !== 'object')  return false;
	const
		thisPalette=this,
		metaHTML=this.HTML.getElementsByClassName('paletteMeta')[0],
		tbodys=this.tbodys,
		rootName=tbodys[0].querySelector("input[name$='[Name]']");
	pName=pName.trim();

	if (JSON_palette.header)  setHdFt(JSON_palette.header, metaHTML.querySelector('fieldset'));
	if (JSON_palette.footer)  setHdFt(JSON_palette.footer, metaHTML.querySelector('fieldset+fieldset'));
	function setHdFt(a, flds)  {
		if (!(a instanceof Array))  a=[a];
		for (var i=0; i<a.length; i++)  {
			if (!a[i])  continue;
			flds.lastElementChild.value=a[i];
			if (!thisPalette.MetaGenie.popNewField(flds.lastElementChild))  break;  }  }
  metaHTML.querySelector('select.alternative').setSelected(JSON_palette.alternatives ? JSON_palette.alternatives : '—none—');

	var tbody, id;
	switch (mergeMode)  {
		case 'replace':  tbody=tbodys[0];  rootName.value=pName;  break;
		case 'merge':
		case 'merge-over':
			if (rootName.value.trim()===pName)  {tbody=tbodys[0];  break;}
		case 'over':  if (mergeMode==='over'  &&  (tbody=get_tBody(pName, [rootName.value.trim()])))  {
			id=tbody.id;
			this.SubPaletteGenie.deleteField(tbody);  }
		case 'add':
		default:  tbody=makeNew_tBody(pName, rootName.value.trim(), tbodys[0].id);  if (id)  tbodys.id=id;  }

	const
		CGFC=this.ColorGenie.config.fieldsetCustomizer,
		SPGFC=this.SubPaletteGenie.config.fieldsetCustomizer;
	this.ColorGenie.config.fieldsetCustomizer=null;  this.SubPaletteGenie.config.fieldsetCustomizer=null;
	try {fill_tBody(palette, tbody, JSON_palette.referenceMarks, [pName]);}
	finally {this.ColorGenie.config.fieldsetCustomizer=CGFC;  this.SubPaletteGenie.config.fieldsetCustomizer=SPGFC;}
	SPGFC.call(this.SubPaletteGenie, this.table);
	this.alignParentPaletteSelectors();
	tbodys[0].querySelector("input[name$='addToHere']").checked=true;
	tbodys[0].scrollIntoView(true);

	function getPalette(JSON_palette)  {
		return (JSON_palette instanceof SoftMoon.WebWare.Palette) ? Object.getPrototypeOf(JSON_palette.palette) : JSON_palette.palette;  }

	function makeNew_tBody(sName, parentName, parentId)  {
		if (thisPalette.SubPaletteGenie.popNewField(thisPalette.table, {addTo:true}))	 {
			tbodys[tbodys.length-1].querySelector("input[name$='[Name]']").value=sName;
			tbodys[tbodys.length-1].querySelector("select[name$='[parent]']").options.add(
				new Option(parentName, parentId, true, true))
			return tbodys[tbodys.length-1];  }
		else  return tbodys[0];  }

	function find_tBody(sName, chain)  {
		const parent=chain.pop();
		for (var i=1;  i<tbodys.length;  i++)  {
			if (tbodys[i].querySelector("input[name$='[Name]']").value.trim()===sName
			&&  tbodys[i].querySelector("select[name$='[parent]']").selectedOptions[0].text.trim()===parent
			&&  (chain.length===0  ||  find_tBody(parent, chain)))
				return tbodys[i];  }  }

	function get_tBody(sName, chain, parentId)  { var tbody;
		if (mergeMode!=='add'  &&  mergeMode!=='replace')  tbody=find_tBody(sName, chain)
		switch (tbody  &&  mergeMode)  {
		case 'merge':
		case 'merge-over': return tbody;
		case 'over':  thisPalette.SubPaletteGenie.deleteField(tbody);
		case 'add':
		case 'replace':
		default: return makeNew_tBody(sName, chain.pop(), parentId);  }  }

	function fill_tBody(palette, tbody, marks, chain)  {
		marks.open=new RegExp('^'+RegExp.escape(marks[0]));
		marks.close=new RegExp(RegExp.escape(marks[1])+'$');
		tbody.querySelector("input[name$='addToHere']").checked=true;
		for (const pRef in palette)  { let cName=pRef.trim();
			if (palette[pRef].palette)  {
				fill_tBody(getPalette(palette[pRef]),
									 get_tBody(cName, chain.slice(0), tbody.id),
									 palette[pRef].referenceMarks || marks,
									 chain.concat(cName));
				continue;  }
			if (marks  &&  cName.substr(0, marks[0].length)===marks[0]  &&  cName.substr(-marks[1].length)===marks[1])  cName="";
			switch(cName  &&  mergeMode)  {
				case 'merge-over':
				case 'over':  for (var trs=tbody.children, i=1;  i<trs.length;  i++)  {
					if (trs[i].querySelector("input[name$='[name]']").value.trim()===cName)
						thisPalette.ColorGenie.deleteField(trs[i]);  }  }
			thisPalette.addColor(palette[pRef].trim().replace(marks.open,"").replace(marks.close,""), cName);  }
		CGFC.call(thisPalette.ColorGenie, tbody);  }  }


MyPalette.prototype.referenceMarks=[ '«' , '»' ];


MyPalette.prototype.toJSON=function(onDupColor)  {
	var requireSubindex=false;
	const
		metaHTML=this.HTML.querySelector('.paletteMeta'),
		tbodys=this.tbodys,
		subs=new Array,
		marks=this.referenceMarks,
		pName= ( tbodys[0].querySelector("input[name$='[Name]']").value.trim()
						||  ('MyPalette '+((new Date()).toUTCString()))
					).replace( /:/g , ';').replace( /\(/g , '[').replace( /\)/g , ']');
	onDupColor=onDupColor ||  metaHTML.querySelector('select.duplicate').getSelected().value;
	return { [pName]: {
		header: UniDOM.getElementsBy$Name(metaHTML, /headers/ ).getValues(),
		footer: UniDOM.getElementsBy$Name(metaHTML, /footers/ ).getValues(),
		alternatives: metaHTML.querySelector('.alternative').getSelected().value,
		requireSubindex: requireSubindex,
		referenceMarks: marks,
		paletteName: pName,
		palette: buildPaletteObject(tbodys[0], 0) } };
	function buildPaletteObject(tbody, tbIndex)  {
		var j, cName, def, e,  p, subName;
		const
			pltt=new Object,
			trs=tbody.getElementsByTagName('tr');
		for (j=1; j<trs.length; j++)  { // if (trs[j].firstElementChild.tagName==='TH')  continue;  //this is a foolproofer condition - it should never happen unless the table stucture is changed
			def=UniDOM.getElementsBy$Name(trs[j], /definition/ , 1)[0].value.trim();
			cName=UniDOM.getElementsBy$Name(trs[j], /name/ , 1)[0].value.trim();
			if (def==="" && cName==="")  continue;  //note it is possible to create a color with no definition (maybe to be filled in later)
			if (cName==="")  cName=marks[0]+"["+(j)+"]"+marks[1];  // mark the name as a “forward reference”
			else  def=marks[0]+def+marks[1];   // mark the definition as a “back reference” : see  SoftMoon.WebWare.buildPaletteTable
			loop:{ while (cName in pltt)  {
				switch (onDupColor)  {
				case 'forbid':
				case 'forbid all':
					e=new Error('Duplicate Color Names in the '+(tbIndex!==0 ? 'same sub-' : (tbodys.length>1 ? 'root ' : ""))+'Palette found when building MyPalette JSON');
					e.name='MyPalette Duplicate Name';
					e.type='Color';
					e.duplicateName=cName;
					//e.subName=subName;
					e.tr={index: j, tr: trs[j]}
					e.tbody={index: tbIndex, tbody: tbody}
					throw e;
				case 'ignore': break loop;
				default: cName=cName+"["+(j)+"]";  }  }  }
			if (tbIndex!==0
			&&  subs.some(function(sp){return cName in sp  &&  (p=sp);}) )  {
				if (onDupColor==='forbid all'  &&  !p[cName].palette)  {
					e=new Error('Duplicate Color Names found when building MyPalette JSON');
					e.name='MyPalette Duplicate Name';
					e.type='Color';
					e.duplicateName=cName;
					//e.subName=subName;
					e.tr={index: j, tr: trs[j]}
					e.tbody={index: tbIndex, tbody: tbody}
					throw e;  }
				else requireSubindex=true;  }
			if (def.match( /^ ?MyPalette\s*:/i )  ||  def.match( /^ ?MyPalette\s*\(.*\)$/i ))  def.replace( /MyPalette/i , pName);
			pltt[cName] = def;  }
		subs.push(pltt);
		for (tbIndex=1; tbIndex<tbodys.length; tbIndex++)  {
			if (tbody.id!==tbodys[tbIndex].querySelector("select[name$='[parent]']").value)  continue;
			subName=( tbodys[tbIndex].querySelector("input[name$='[Name]']").value.trim().replace( /:/g , ';').replace( /\(/g , '[').replace( /\)/g , ']')
						||  ("{"+tbIndex+"}") );
			loop:{ while (subName in pltt)  { switch (onDupColor)  {
				case 'forbid':
					e=new Error('Duplicate Color/sub-Palette Names found when building MyPalette JSON');
					e.name='MyPalette Duplicate Name';
					e.type='sub-Palette';
					e.duplicateName=subName;
					e.tbody={index: tbIndex, tbody: tbodys[i]}
					throw e;
				case 'ignore': break loop;
				default: subName=subName+"{"+tbIndex+"}";  }  }  }
			pltt[subName] = {paletteName: subName, palette: buildPaletteObject(tbodys[tbIndex], tbIndex)};  }
		return pltt;  }  }


MyPalette.prototype.portNotice=function(notice, wait)  {
	const div=document.createElement('div'),
				portDialog=this.HTML.querySelector('.portDialog');
	div.className='portNotice' + (wait? ' wait' : "");
	div.wait=wait;
	div.innerHTML=notice;
	portDialog.insertBefore(div, portDialog.querySelector('.port'));
	return div;  }

const BUILDING_NOTICE= '<strong>Building MyPalette… … …please wait…</strong>',
			NO_FILE_NOTICE=  '<strong>No file chosen.&nbsp; Please choose a file to import.</strong>',
			FILE_NAME_NOTICE='<strong>Improper filename extension for imported file.</strong>',
			CORRUPT_NOTICE=  '<strong>File is corrupt: can not load.</strong>',
			HTTP_NOTICE=     '<strong>¡Error! :\n problem with the HTTP connection or server.</strong>';


MyPalette.prototype.porter=function(event)  {
	if (event.detail>1) return;
	const
		portMode=UniDOM.getElementsBy$Name(this.HTML.querySelector(".portMode"), /_portMode/ ).getSelected().value,
		port=UniDOM.getElementsBy$Name(this.HTML.querySelector(".port"), /_port\]?$/ ).getSelected().value,
		divs=this.HTML.querySelectorAll('.portNotice'),
		thisPalette=this,
		underConstruction='<strong>Under Construction: ' + portMode + ', ' + port + '</strong>';
	var i, pName, palette, div;
	for (i=0; i<divs.length; i++)  { if (divs[i].wait)  continue;
		if (divs[i].evented)  UniDOM.removeAllEventHandlers(divs[i], true);
		divs[i].parentNode.removeChild(divs[i]);  }
	switch (portMode)  {
	case 'import':  switch (port)  {
		case 'current':
			if (palette=SoftMoon.palettes[pName=MasterColorPicker.picker_select.getSelected().firstChild.data])  {
				div=this.portNotice(BUILDING_NOTICE, true);
				setTimeout(function() {thisPalette.fromJSON({[pName]: palette});  div.parentNode.removeChild(div);},  38);  }
			else this.portNotice('<strong>Please choose a MasterColorPicker™ Palette Table from the main palette-select.</strong>');
			return;
		case 'local':
			if (palette=(this.droppedImportPaletteFile
								||  UniDOM.getElementsBy$Name(this.HTML.querySelector(".port"), /_import\]?$/ , 1)[0].files[0]))
				this.importPaletteFile(palette);
			else  this.portNotice(NO_FILE_NOTICE);
			return;
		case 'server':   this.getRemotePaletteFilesIndex();  return;
		case 'browser':  this.portNotice(underConstruction);
		default: console.log('porter:', portMode, port);  return;
	}
	case 'export':  try { switch (port)  {
		case 'current':
			SoftMoon.WebWare.addPalette(palette=this.toJSON());
			SoftMoon.WebWare.initLoadedPaletteTable(palette);
			this.portNotice('Exported to MasterColorPicker™');
			return;
		case 'server':  this.uploadPalette();  return;
		case 'local':   this.savePalette();  return;
		case 'browser': this.portNotice(underConstruction);
		default: console.log('porter:', portMode, port);  return;  }  }
		catch(e)  {
			if (e.name!=='MyPalette Duplicate Name')  {
				e.message="¡Error exporting MyPalette! at port:",port,"\n…sorry we lost the stack trace…\n"+e.message;
				throw e;  }
			this.portNotice("<strong>¡ Duplicate Name Error !\n"+e.duplicateName+(e.subName? "in "+e.subName : "")+"</strong>");
			const
				which=e.tr ? e.tr.tr : e.tbody.tbody,
				namer=UniDOM.getElementsBy$Name(which, /name/i )[0];
			UniDOM.addClass(which, 'duplicatename');
			namer.onkeydown=function() {UniDOM.removeClass(which, 'duplicatename');  delete namer.onkeydown;}
			setTimeout(function() {namer.focus();}, 2500);  }  }  }


MyPalette.prototype.importPaletteFile=function(PaletteFile)  {
	if (!PaletteFile.name.match( /\.palette\.js(?:on)?$/i ))  {
		this.portNotice(FILE_NAME_NOTICE);
		return false;  }
	const
		thisPalette=this,
		fr=new FileReader(),
		div=this.portNotice(BUILDING_NOTICE, true);
	fr.onload=function()  {
		try {
			thisPalette.fromFileText(fr.result)  }
		catch(e)  {
			console.error(CONSOLE_IMPORT_ERROR,e.message,"\n",fr.result);
			thisPalette.portNotice(CORRUPT_NOTICE);  }
		finally {div.parentNode.removeChild(div);}  };
	fr.onerror=function()  {
		console.error(CONSOLE_IMPORT_ERROR,fr.error);
		thisPalette.portNotice(CORRUPT_NOTICE);
		div.parentNode.removeChild(div);  };
	fr.readAsText(PaletteFile);
	return fr;  }


MyPalette.prototype.fromFileText=function(ft)  {
	return this.fromJSON(JSON.parse(ft.trim().replace( /^SoftMoon\.loaded_palettes\.push\s*\(\s*/ , "").replace( /\s*\)\s*;?[^{}]*$/ , "")));  }


const CONSOLE_IMPORT_ERROR='MasterColorPicker MyPalette import file error:\n';

const HTTP=SoftMoon.WebWare.HTTP,
			Connector= HTTP ? new HTTP() : null;


MyPalette.prototype.downloadPalette=function(filename)  {
	console.log(' ←← downloading palette from: ',filename);
	var div;
	const
		thisPalette=this,
		connection=HTTP.Connection(filename, 'Can not download Palette from server: no HTTP service available.');
	connection.onFileLoad=function()  { console.log(' ←← Download response:\n',this.responseText);
		if (this.responseText.substr(0,10)==='¡Error! : ')  {
			UniDOM.remove$Class(div, 'wait');  div.wait=false;
			div.innerHTML= '<strong>' + this.responseText + '</strong>';
			return;  }
		setTimeout(function()  {
			try {
				thisPalette.fromFileText(connection.responseText);
				div.parentNode.removeChild(div);  }
			catch(e) {
				console.error(CONSOLE_IMPORT_ERROR,e.message,"\n",connection.responseText);
				UniDOM.remove$Class(div, 'wait');  div.wait=false;
				div.innerHTML=CORRUPT_NOTICE;  }  },
		 38);
		div.innerHTML=BUILDING_NOTICE;  };
	connection.loadError=function()  { console.warn(' ←← Download: HTTP or server error.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=HTTP_NOTICE;  }
	Connector.commune(connection);
	div=this.portNotice('Downloading <span>' + filename + '</span> from:\n<span>' +
		document.URL.substring(0, document.URL.lastIndexOf("/")+1) + '</span>', true);  }


MyPalette.prototype.getRemotePaletteFilesIndex=function()  {
	console.log(' ←← downloading palette index from:',SoftMoon.colorPalettes_defaultPath);
	var div;
	const
		thisPalette=this,
		connection=HTTP.Connection(SoftMoon.colorPalettes_defaultPath, 'Can not download Palette index from server: no HTTP service available.');
	connection.onFileLoad=function()  { console.log(' ←← remote Palette index response:\n',this.responseText);
		div.parentNode.removeChild(div);
		div=thisPalette.presentPaletteFileIndex(this.responseText);
		UniDOM.addEventHandler(div, ['click', 'buttonpress'], function (event)  {
			if (event.target.nodeName!=='BUTTON')  return;
			UniDOM.removeAllEventHandlers(div, true);
			div.parentNode.removeChild(div);
			thisPalette.downloadPalette(event.target.firstChild.data);  });
		div.evented=true;  }
	connection.loadError=function()  { console.warn(' ←← Download Palette index: HTTP or server error.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=HTTP_NOTICE;  }
	Connector.commune(connection);
	div=this.portNotice('Requesting the palette file index from:\n<span>' +
		document.URL.substring(0, document.URL.lastIndexOf("/")+1) + SoftMoon.colorPalettes_defaultPath + '</span>\n … … please wait.', true);  }


MyPalette.prototype.presentPaletteFileIndex=function(indexText)  {
	const div=this.portNotice('<h4>Choose a Palette to download for import:</h4>');
	UniDOM.addClass(div, 'import server');
	indexText=indexText.split("\n").map(function(t) {return t.trim();});
	for (let i=0, btn, tn; i<indexText.length; i++)  {
		if (this.filterOutPaletteFileForImport(indexText[i]))  continue;
		btn=document.createElement('button');  btn.type='button';
		tn=document.createTextNode(indexText[i]);
		btn.appendChild(tn);
		div.appendChild(btn);  }
	return div;  }

// note this complements the function  SoftMoon.WebWare.initPaletteTables();
MyPalette.prototype.filterOutPaletteFileForImport=function(path)  {
	return  path===""  ||  path.indexOf('/users/') === -1  ||  path.indexOf('/autoload/')>0  }


MyPalette.prototype.uploadPalette=function(JSON_Palette) {
	console.log(' →→ Uploading palette to: ',SoftMoon.colorPalettes_defaultPath);
	const
		palette=JSON_Palette || this.toJSON(),
		filetype=UniDOM.getSelected(this.HTML.querySelector('.filetype')).value,
		filename=this.HTML.querySelector("input[name$='filename']").value.trim()+".palette."+filetype,
		connection=HTTP.Connection(SoftMoon.colorPalettes_defaultPath, 'Can not upload Palette to server: no HTTP service available.');
	var pName, div;
  for (pName in palette)  {break;}
	connection.onFileLoad=function()  { console.log(' →→ Upload response:',this.responseText);
		if (this.responseText.substr(0,10)==='¡Error! : ')  div.innerHTML= '<strong>' + this.responseText + '</strong>';
		else  div.innerHTML= 'Successfully uploaded to:\n<span>' + document.URL.substring(0, document.URL.lastIndexOf("/")+1) + this.responseText + '</span>';  };
	connection.loadError=function()  { console.warn(' →→ Upload: HTTP or server Error.');
		div.innerHTML=HTTP_NOTICE;  }
	connection.onloadend=function() {UniDOM.remove$Class(div, 'wait');  div.wait=false;};
  connection.requestHeaders={'Content-Type': 'application/x-www-form-urlencoded'};
	connection.postData=HTTP.URIEncodeObject({
		filename: filename,
		palette: this.toFileText(palette, filetype, filename, this.HTML.querySelector('[name$="CSSautoType"]').value),
		replace_file: UniDOM.getElementsBy$Name(this.HTML, /replace_file/ , 1)[0].checked.toString(),
		autoload: UniDOM.getElementsBy$Name(this.HTML, /autoload/ , 1)[0].checked.toString() });
	Connector.commune(connection);
	div=this.portNotice('Uploading <span>' + pName + '</span> to:\n<span>' +
		document.URL.substring(0, document.URL.lastIndexOf("/")+1)+SoftMoon.colorPalettes_defaultPath + '</span>', true);  }


MyPalette.prototype.toFileText=function toFileText(JSON_Palette, $filetype, $filename, $autoType)  {
	const GEN="generated by MasterColorPicker™ – MyPalette from SoftMoon-WebWare";
	var pName, paletteText;
	switch ($filetype)  {
	case 'json':
	case 'js':   paletteText=JSON.stringify(JSON_Palette, undefined, "\t");
		if ($filetype==="js")  paletteText='SoftMoon.loaded_palettes.push(\n'+paletteText+'\n); // close loaded_palettes.push\n';
	break;
	case 'css':
		for (pName in JSON_Palette)  {break;}
		const marks=JSON_Palette.marks || "";
		paletteText="/* charset: 'UTF-8'\n *\n * filename: "+ $filename +"\n * CSS Palette "+GEN+"\n * "+(new Date).toUTCString()+" */";
		if (JSON_Palette[pName].header  &&  JSON_Palette[pName].header.length)  addCSSHeadFoot('', JSON_Palette[pName].header);
		if (JSON_Palette[pName].alternatives)  paletteText+= "\n/* Alternative color names: " + JSON_Palette[pName].alternatives + " */";
		paletteText+= "\n";
		MasterColorPicker.RGB_calc.config.push({RGBAFactory: {value: SoftMoon.WebWare.RGBA_Color}});
		try {toCSS(JSON_Palette[pName].palette, pName);}
		finally {MasterColorPicker.RGB_calc.config.pop();}
		if (JSON_Palette[pName].footer  &&  JSON_Palette[pName].footer.length)  addCSSHeadFoot('', JSON_Palette[pName].footer);
		function addCSSHeadFoot(txt, hf)  {
			if (typeof hf === 'string')  paletteText += "\n/*\n" + txt + hf + "\n */";
			else if (hf instanceof Array)  for (var _hf_ of hf)  {addCSSHeadFoot(txt, _hf_);}  }
		function toCSS(palette, sub)  {
			const
				RegExp=SoftMoon.RegExp || window.RegExp,
				cssVars=new Object;
			var c, clr, cs, bg, type, important, subText="";
			loopThroughPalette: for (c in palette)  {
				if (palette[c].palette)  {toCSS(palette[c].palette, sub+" "+c);  continue loopThroughPalette;}
				if ((clr=palette[c].match(RegExp.stdWrappedColor))
				&&  (cs=clr[1].match( /^(rgb|hsl)a?$/i ))
				&&  (cs=clr[2].match(RegExp[cs[0].toLowerCase()+'_a'])))  {
					clr=palette[c].replace( /°/ , "deg").replace( /ʳ|ᴿ|ᶜ/ , "rad").replace( /ᵍ|ᴳ/ , "grad").replace( /●/ , "turn");
					if (cs[1].indexOf("%"))  clr=clr.replace( /[.\d]+%/ , (parseFloat(cs[1].substr(0, cs[1].length-1))/100)+"turn");  }
				else  clr=MasterColorPicker.RGB_calc(palette[c]).toString('#hex');
				if (c.substr(0,4)==='¡bg!')  {bg="background-";  c=c.substr(4).trim();}
				else  bg="";
				if (c.substr(0,1)==='!')  {important=" !important";  c=c.substr(1).trim();}
				else  important="";
				if ((c.substr(0,marks[0].length)===marks[0]  &&  c.substr(-marks[1].length)===marks[1])
				||  c==="")  {cssVars[bg+'color']=clr+important;  continue loopThroughPalette;}
				switch ((type=c.match( /^(--|#|.|:|\[|\*|\|\*|\$)/ ))  &&  type[0])  {
				case '--':
				case '#':
				case '.':
				case ':':
				case '[':
				case '*':
				case '|*': break;
				case '$': c=c.substr(1);  break;
				default:  c=$autoType+c;  }
				if (c.substr(0,2)==='--')  {
					if (bg || important)  {
						var e=new Error('CSS variables can not be specified as “background” or “important”.');
						e.name='corrupt syntax';
						throw e;  }
					cssVars[c]=clr;
					continue loopThroughPalette;  }
				subText+= "\n" + sub + " " + c + " { " + bg + "color: " + clr + important+ "; }";  }
			for (c in cssVars)  {paletteText+= "\n" + sub + " {";  break;}
			for (c in cssVars)  {paletteText+= "\n" + toFileText.indent + c + ": " + cssVars[c] + ";";}
			for (c in cssVars)  {paletteText+= "\n }";  break;}
			paletteText+= subText;  }
	break;
	case 'gpl':
		for (pName in JSON_Palette)  {break;}
		paletteText="GIMP Palette\nName: "+pName+"\n# charset: 'UTF-8'\n# filename: " + $filename + "\n# "+GEN+"\n# "+(new Date).toUTCString();
		if (JSON_Palette[pName].header  &&  JSON_Palette[pName].header.length)  addGPLHeadFoot('Header: ', JSON_Palette[pName].header);
		if (JSON_Palette[pName].alternatives)  paletteText+= "\n# Alternative color names: " + JSON_Palette[pName].alternatives;
		paletteText+= "\n#";
		MasterColorPicker.RGB_calc.config.push({RGBAFactory: {value: SoftMoon.WebWare.RGBA_Color}});
		try {toGPL(JSON_Palette[pName].palette);}
		finally {MasterColorPicker.RGB_calc.config.pop();}
		if (JSON_Palette[pName].footer  &&  JSON_Palette[pName].footer.length)  addGPLHeadFoot('Footer: ', JSON_Palette[pName].footer);
		function addGPLHeadFoot(txt, hf)  {
			if (typeof hf === 'string')  paletteText += '\n# ' + txt + hf.replace( /\n|\r|\n\r|\r\n/g , " _ ");
			else if (hf instanceof Array)  for (const _hf_ of hf)  {addGPLHeadFoot(txt, _hf_);}  }
		function toGPL(palette)  { for (const c in palette)  {
			if (palette[c].palette)  {
				paletteText+= "\n#\n# ------- SubPalette Name: " + c.replace( /\n\r|\r\n|\n|\r/g , " _ ");
				toGPL(palette[c].palette);
				paletteText+= "\n# ------- end SubPalette Name: " + c.replace( /\n\r|\r\|\n|\r/g , " _ ") + "\n#";
				continue;  }
			paletteText+= "\n" + MasterColorPicker.RGB_calc(palette[c]).toString('tabbed') + "\t" + c.replace( /\n\r|\r\n|\n|\r/g , " _ ");  }  }
	break;  }
	return paletteText;  }
MyPalette.prototype.toFileText.indent="\t";


MyPalette.prototype.savePalette=function(JSON_Palette)  {
	const
		iframe=document.getElementById('MasterColorPicker_MyPalette_local_filesaver') || document.createElement('iframe'),
		filetype=UniDOM.getSelected(this.HTML.querySelector('.filetype')).value,
		filename=this.HTML.querySelector("input[name$='filename']").value.trim()+".palette."+filetype;
	var palette=JSON_Palette || this.toJSON(),
			mimeType,
			autoType;
	switch (filetype)  {
		case 'gpl': mimeType="application/x-gimp-palette";  break;
		case 'css': autoType=this.HTML.querySelector('[name$="CSSautoType"]').value;
		case 'js':
		case 'json':
		default: mimeType="application/unknown";  break;  } //if if the browser recognizes the type, it may open & display it.
	try {palette=this.toFileText(palette, filetype, filename, autoType);}
	catch (e)  { if (e.name!=='corrupt syntax')  throw e;
		this.portNotice("<strong>"+e.message+"</strong>");
		return;  }
	palette=new File([palette], filename, {type: mimeType});
	palette=URL.createObjectURL(palette);
	if (!iframe.id)  {
		iframe.id='MasterColorPicker_MyPalette_local_filesaver';
		iframe.style.display='none';
		document.body.appendChild(iframe);  }
	iframe.setAttribute('src', palette);
	URL.revokeObjectURL(palette);  }



// =================================================================================================== \\

})();  // close private member wrapper for x_ColorPicker




// this is or is called as a method of the MasterColorPicker implementation, so “this” is  MasterColorPicker
// this will read an <input> tag's value and interpret the color
// then set the background-color of it or a separate swatch;
// text-color will then be set using “SoftMoon.WebWare.makeTextReadable()”
SoftMoon.WebWare.x_ColorPicker.colorSwatch=function colorSwatch(inp, swatch)  {
	if (!UniDOM.isElementNode(inp))  inp=this.interfaceTarget || this.dataTarget;
	var c, e, f;
	if (!swatch)  {
		if (swatch= (inp.getAttribute('swatch')  ||  inp.swatch))  {
			if (typeof swatch===Function  ||  !UniDOM.isElementNode(document.getElementById(swatch)))  {
				try  {
					if (typeof swatch!==Function)  swatch=new Function("return "+swatch+";")
					swatch=swatch.call(inp);  }
				catch(e) {console.error('Custom “swatch” expression failed for ',inp,'\n with Error message:\n ',e.message);};  }  }
		else  switch (this.showColorAs)  {
			case 'swatch':  swatch=(document.getElementById(inp.getAttribute('swatch')) || this.swatch || inp.nextSibling);  break;
			case 'background':
			default:  swatch=inp;  }  }
	if (!UniDOM.isElementNode(swatch))  return;   // (swatch==null  ||  swatch.nodeType!==1)
	if (!swatch.defaultBack)
		swatch.defaultBack=getComputedStyle(swatch).backgroundColor;
	if (!swatch.defaultBorder)
		swatch.defaultBorder=getComputedStyle(swatch).borderColor || getComputedStyle(swatch).color;
	var toggleBorder= swatch.hasAttribute('toggleBorder') ?
		  Boolean.evalString(swatch.getAttribute('toggleBorder'))
		: this.toggleBorder;
	if (inp.value.match( /^(none|blank|gap|zilch|\-|\_|\u2013|\u2014)$/i ))  {
		if (toggleBorder)  {
			swatch.style.borderColor=(this.borderColor==='invert') ? MasterColorPicker.RGB_calc.to.contrast(swatch.defaultBorder) : this.borderColor;
			swatch.style.borderStyle='dotted';  }
		swatch.style.backgroundColor='transparent';
		if (swatch.defaultColor)  swatch.style.color=swatch.defaultColor;
		if (swatch.nextElementSibling  &&  swatch.nextElementSibling.hasAttribute('colorblind'))  colorSwatch(inp, swatch.nextElementSibling);
		return;  }
	if (inp.value  &&  ((c=MasterColorPicker.RGB_calc(inp.value)) != null))  {
		if (toggleBorder)  {
			swatch.style.borderColor=(this.borderColor==='invert') ?
				MasterColorPicker.RGB_calc.to.contrast(swatch.defaultBorder)
			: this.borderColor;
			swatch.style.borderStyle='solid';  }
		if (swatch.hasAttribute('colorblind'))
			c=MasterColorPicker.RGB_calc.to.colorblind(c.rgba, swatch.getAttribute('colorblind'));
		swatch.style.backgroundColor=c.useHexSymbol(true).hex;
		SoftMoon.WebWare.makeTextReadable(swatch, c.rgb);
		if (swatch.nextElementSibling  &&  swatch.nextElementSibling.hasAttribute('colorblind'))  colorSwatch(inp, swatch.nextElementSibling);
		return;  }
	if (toggleBorder)  {
		swatch.style.borderColor=swatch.defaultBorder;
		swatch.style.borderStyle='solid';  }
	swatch.style.backgroundColor=swatch.defaultBack;
	if (swatch.defaultColor)  swatch.style.color=swatch.defaultColor;
	if (swatch.nextElementSibling  &&  swatch.nextElementSibling.hasAttribute('colorblind'))  colorSwatch(inp, swatch.nextElementSibling);
	};

// text-color will be set to black or white depending on the rgb brightness (not necessarily
//  the “perceived” brightness) of the background-color.
SoftMoon.WebWare.makeTextReadable=function(elmnt, back)  {
	if (!back)  back=window.getComputedStyle(elmnt).backgroundColor;
	if (back===null)  return;
	if (!elmnt.defaultColor)
		elmnt.defaultColor=window.getComputedStyle(elmnt).color;
	elmnt.style.color=MasterColorPicker.RGB_calc.to.contrast(back);  };



// =================================================================================================== \\

;(function(){ // open a private namespace for the Color-Space Lab

const
ColorSpaceLab=new Object,
RGB_Calc=SoftMoon.WebWare.RGB_Calc,
CSL_calc=new RGB_Calc({
	inputAsFactor: false,
	hueAngleUnit: 'deg',
	RGBAFactory: SoftMoon.WebWare.RGBA_Color,
	CMYKAFactory: SoftMoon.WebWare.CMYKA_Color,
	ColorWheelFactory: SoftMoon.WebWare.ColorWheel_Color  })

SoftMoon.WebWare.ColorSpaceLab=ColorSpaceLab;

var settings;

ColorSpaceLab.rgbPrecision=0;  //number of decimal places to show after RGB byte values.
ColorSpaceLab.hueAngleUnit='deg';  //hue values default to degrees

ColorSpaceLab.getColor=function(withAlpha)  {return new SpaceLab_Colors(withAlpha);}

SoftMoon.WebWare.SpaceLab_Colors=SpaceLab_Colors;
function SpaceLab_Colors(withAlpha)  {
	if (!new.target)  throw new Error("“SoftMoon.WebWare.SpaceLab_Colors” is a constructor, not a function or method.");
	const alpha= (settings.applyOpacity.checked || withAlpha) ? parseFloat(settings.opacity_percent.value)/100 : undefined;
	this.RGB= new SoftMoon.WebWare.RGBA_Color(settings.Rgb_byte.value, settings.rGb_byte.value, settings.rgB_byte.value, alpha, {useHexSymbol:true} );
	this.model='RGB';
	const hue= parseFloat(settings.Hue_degrees.value) / SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[ColorSpaceLab.hueAngleUnit];
	this.HSL= new SoftMoon.WebWare.HSLA_Color(hue, parseFloat(settings.hSl_percent.value)/100, parseFloat(settings.hsL_percent.value)/100, alpha);
	this.HSB=
	this.HSV= new SoftMoon.WebWare.HSVA_Color(hue, parseFloat(settings.hSv_percent.value)/100, parseFloat(settings.hsV_percent.value)/100, alpha);
	this.HWB= new SoftMoon.WebWare.HWBA_Color(hue, parseFloat(settings.hWb_percent.value)/100, parseFloat(settings.hwB_percent.value)/100, alpha);
	this.HCG= new SoftMoon.WebWare.HCGA_Color(hue, parseFloat(settings.hCg_percent.value)/100, parseFloat(settings.hcG_percent.value)/100, alpha);
	this.CMYK= new SoftMoon.WebWare.CMYKA_Color(parseFloat(settings.Cmyk_percent.value)/100, parseFloat(settings.cMyk_percent.value)/100, parseFloat(settings.cmYk_percent.value)/100, parseFloat(settings.cmyK_percent.value)/100, alpha);
	}



ColorSpaceLab.setColor=function(CLR, space)  {
	if ( (CLR instanceof SpaceLab_Colors)
	||  !document.getElementById('MasterColorPicker_showLab').checked
	||  (arguments[1] instanceof Event  &&  arguments[1].type.match( /mouse/ )  &&  !settings.updateLabOnMouseMove.checked) )
		return CLR;

	RGB_Calc.config.push({
		RGBAFactory:       {value: SoftMoon.WebWare.RGBA_Color},
		CMYKAFactory:      {value: SoftMoon.WebWare.CMYKA_Color},
		ColorWheelFactory: {value: SoftMoon.WebWare.ColorWheel_Color}  });

	const RegExp= SoftMoon.RegExp || window.RegExp;
	var alpha;
	function setDefaultAlpha() {
		settings.opacity_percent.value=
		settings.opacity_range.value= 100;
		ColorSpaceLab.update_Alpha_rangeHandle();  }

	if (typeof CLR.RGB.alpha === 'number')  {
		settings.opacity_percent.value=
		settings.opacity_range.value=
		(alpha= CLR.RGB.alpha)*100;
		ColorSpaceLab.update_Alpha_rangeHandle();  }
	else if (settings.applyOpacity.checked
			 &&  CLR.model !== 'text'
			 &&  !(arguments[1] instanceof Event  &&  arguments[1].type.match( /key/ )))
		CLR.RGB.alpha= alpha= parseFloat(settings.opacity_percent.value)/100;
	else if (settings.applyOpacity.checked
			 &&  CLR.model === 'text')  {
		let m, alphaTxt=Math.roundTo(parseFloat(settings.opacity_percent.value), 1) + '%';
		if (((m=CLR.text.match(RegExp.stdWrappedColor))  ||  (m=CLR.text.match(RegExp.stdPrefixedColor)))
		&&  typeof RGB_Calc.from[m=m[1].toLowerCase()] === 'function')  {
			CLR.RGB.alpha= alpha= parseFloat(settings.opacity_percent.value)/100;
			alphaTxt= (m.substr(0,3)==='hwb' ? ' / ' : ', ') + alphaTxt;
			if (CLR.text.slice(-1)===')')  CLR.text=CLR.text.slice(0,-1)+alphaTxt+')';
			else  CLR.text+=alphaTxt;  }
		else if (RegExp.hex.test(CLR.text))  {
			CLR.RGB.alpha= alpha= parseFloat(settings.opacity_percent.value)/100;
			CLR.text+=Math._2hex(alpha*255);  }
		else  switch (settings.alphaApplicationMode.getSelected().value)  {
			case 'avoid': setDefaultAlpha();
			break;
			case 'convert':
				CLR.model='RGB';
				if (!MasterColorPicker.alwaysApplyAlphaToPaletteColors)  {
					CLR.RGB.alpha= alpha= parseFloat(settings.opacity_percent.value)/100;
					break;  }
			case 'apply':
				CLR.text+=' / '+alphaTxt+' opacity;';
				CLR.RGB.alpha= alpha= parseFloat(settings.opacity_percent.value)/100;  }  }
	else  setDefaultAlpha();

	if (space!=='rgb')  {
		settings.Rgb_byte.value= settings.Rgb_range.value= Math.roundTo(CLR.RGB.red, ColorSpaceLab.rgbPrecision);
		settings.rGb_byte.value= settings.rGb_range.value= Math.roundTo(CLR.RGB.green, ColorSpaceLab.rgbPrecision);
		settings.rgB_byte.value= settings.rgB_range.value= Math.roundTo(CLR.RGB.blue, ColorSpaceLab.rgbPrecision);

		settings.Rgb_percent.value=Math.roundTo(CLR.RGB.red/2.55, 5);
		settings.rGb_percent.value=Math.roundTo(CLR.RGB.green/2.55, 5);
		settings.rgB_percent.value=Math.roundTo(CLR.RGB.blue/2.55, 5);
		settings.Rgb_hex.value=CLR.RGB.hex.substr(1,2);
		settings.rGb_hex.value=CLR.RGB.hex.substr(3,2);
		settings.rgB_hex.value=CLR.RGB.hex.substr(5,2);  }

	if (!CLR.HSV)  CLR.HSV=RGB_Calc.to.hsv(CLR.RGB.rgba);
	else if (typeof alpha === 'number')  CLR.HSV.alpha=alpha;

	if (space!=='hsb' && space!=='hsv' && space!=='hsl' && space!=='hcg')  {
		var hau=ColorSpaceLab.hueAngleUnit
		settings.Hue_degrees.value=
//				Math.roundTo(parseFloat(CLR.HSV.hue)*ColorSpaceLab.hueAngleUnitFactor, SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision.deg);
			Math.roundTo(CLR.HSV.hue*RGB_Calc.hueAngleUnitFactors[hau], SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau]);
		settings.Hue_range.value=
			Math.roundTo(CLR.HSV.hue*360, SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision['deg']);

		settings.Hue_percent.value= Math.roundTo(parseFloat(CLR.HSV.hue)*100, SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision['%']);  }

	if (space!=='hsb' && space!=='hsv')  {
		settings.hSv_percent.value= settings.hSv_range.value= Math.roundTo(CLR.HSV.saturation*100, 5);
		settings.hsV_percent.value= settings.hsV_range.value= Math.roundTo(CLR.HSV.value*100, 5);  }

	if (space!=='hsl')  {
		if (!CLR.HSL)  CLR.HSL=RGB_Calc.to.hsl(CLR.RGB.rgba);
		else if (typeof alpha === 'number')  CLR.HSL.alpha=alpha;
		settings.hSl_percent.value= settings.hSl_range.value= Math.roundTo(CLR.HSL.saturation*100, 5);
		settings.hsL_percent.value= settings.hsL_range.value= Math.roundTo(CLR.HSL.lightness*100, 5);  }

	if (space!=='hwb')  {
		if (!CLR.HWB)  CLR.HWB=RGB_Calc.to.hwb(CLR.RGB.rgba);
		else if (typeof alpha === 'number')  CLR.HWB.alpha=alpha;
		settings.hWb_percent.value= settings.hWb_range.value= Math.roundTo(CLR.HWB.white*100, 5);
		settings.hwB_percent.value= settings.hwB_range.value= Math.roundTo(CLR.HWB.black*100, 5);  }

	if (space!=='hcg')  {
		if (!CLR.HCG)  CLR.HCG=RGB_Calc.to.hcg(CLR.RGB.rgba);
		else if (typeof alpha === 'number')  CLR.HCG.alpha=alpha;
		settings.hCg_percent.value= settings.hCg_range.value= Math.roundTo(CLR.HCG.chroma*100, 5);
		settings.hcG_percent.value= settings.hcG_range.value= Math.roundTo(CLR.HCG.gray*100, 5);  }

	if (space!=='cmyk')  {
		if (!CLR.CMYK)  CLR.CMYK=RGB_Calc.to.cmyk(CLR.RGB.rgba);
		else if (typeof alpha === 'number')  CLR.CMYK.alpha=alpha;
		settings.Cmyk_percent.value= settings.Cmyk_range.value= Math.roundTo(CLR.CMYK.cyan*100, 5);
		settings.cMyk_percent.value= settings.cMyk_range.value= Math.roundTo(CLR.CMYK.magenta*100, 5);
		settings.cmYk_percent.value= settings.cmYk_range.value= Math.roundTo(CLR.CMYK.yellow*100, 5);
		settings.cmyK_percent.value= settings.cmyK_range.value= Math.roundTo(CLR.CMYK.black*100, 5);  }

	RGB_Calc.config.pop();
	ColorSpaceLab.update_Hue_rangeHandle();

	ColorSpaceLab.swatch.color(CLR);

	return CLR;  }


ColorSpaceLab.alignColor=function()  {
	const
		thisValue=this.value||0,
		model=this.name.match( /_([a-z]{3,4})_/i )[1],
		format=this.name.match( /_([a-z]+)$/ )[1];  // results: dec hex byte percent deg range
	var space=model.toLowerCase();  // results: rgb hsv hsl hwb hcg cmyk
	switch (format)  {
		case 'byte':
			if (thisValue<0)  this.value=0;
			if (thisValue>255)  this.value=255;
			break;
		case 'percent':
			if (thisValue<0)  this.value=0;
			if (thisValue>100)  this.value=100;  }
	setLikeInputs:  { switch (space)  {
	case 'rgb':  {  switch (format)  {
		case 'byte':  {
			settings[model+'_range'].value=thisValue;
			settings[model+'_percent'].value=Math.roundTo(thisValue/2.55, 5);
			settings[model+'_hex'].value=Math._2hex(parseInt(thisValue));
			break setLikeInputs;  }
		case 'range':  {
			settings[model+'_byte'].value=thisValue;
			settings[model+'_percent'].value=Math.roundTo(thisValue/2.55, 5);
			settings[model+'_hex'].value=Math._2hex(parseInt(thisValue));
			break setLikeInputs;  }
		case 'percent':  {
			settings[model+'_range'].value=thisValue*2.55;
			settings[model+'_byte'].value=Math.roundTo(thisValue*2.55, ColorSpaceLab.rgbPrecision);
			settings[model+'_hex'].value=Math._2hex(parseFloat(thisValue)*2.55);
			break setLikeInputs;  }
		case 'hex':  {
			settings[model+'_range'].value=parseInt(thisValue, 16);
			settings[model+'_percent'].value=Math.roundTo(parseInt(thisValue, 16)/2.55, 5);
			settings[model+'_byte'].value=parseInt(thisValue, 16);
			break setLikeInputs;  }  }  }
	case 'hue':  {
		const
			hau=ColorSpaceLab.hueAngleUnit,
			hauf=RGB_Calc.hueAngleUnitFactors[hau];
		switch (format)  {
		case 'degrees':  {
			const hue=parseFloat(thisValue)/hauf;
			settings.Hue_range.value=Math.deg(hue*360);
			settings.Hue_percent.value=Math.roundTo(Math.sawtooth(100, hue*100), 5);
			break setLikeInputs;  }
		case 'range':  {
			settings.Hue_degrees.value=Math.roundTo(
				Math.sawtooth(hauf, (thisValue/360)*hauf),
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau] );
			settings.Hue_percent.value=Math.roundTo(Math.sawtooth(100, thisValue/3.60), 5);
			break setLikeInputs;  }
		case 'percent':  {
			settings.Hue_range.value=Math.deg(thisValue*3.60);
			settings.Hue_degrees.value=Math.roundTo(
				Math.sawtooth(hauf, (thisValue/100)*hauf),
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau] );
			break setLikeInputs;  }  }  }
	default:  { switch (format)  {
			case 'range':   settings[model+'_percent'].value=Math.roundTo(thisValue, 5);  break;
			case 'percent':
				settings[model+'_range'].value=thisValue;
				}  }  }  }

	var build;
	switch (space)  {
	case 'rgb':  {
		build=[settings.Rgb_byte.value||0, settings.rGb_byte.value||0, settings.rgB_byte.value||0];
		break;  }
	case 'cmyk': {
		build=[parseFloat(settings.Cmyk_percent.value||0), parseFloat(settings.cMyk_percent.value||0), parseFloat(settings.cmYk_percent.value||0), parseFloat(settings.cmyK_percent.value||0)];
		break;  }
	default:  {
		build=[parseFloat(settings.Hue_range.value||0)];
		switch (space)  {
		case 'hue':  space='hsl';
		case 'hsl':  build[1]=parseFloat(settings.hSl_percent.value||0); build[2]=parseFloat(settings.hsL_percent.value||0);  break;
		case 'hsb':
		case 'hsv':  build[1]=parseFloat(settings.hSv_percent.value||0); build[2]=parseFloat(settings.hsV_percent.value||0);  break;
		case 'hwb':  build[1]=parseFloat(settings.hWb_percent.value||0); build[2]=parseFloat(settings.hwB_percent.value||0);  break;
		case 'hcg':  build[1]=parseFloat(settings.hCg_percent.value||0); build[2]=parseFloat(settings.hcG_percent.value||0);  break;  }  }  }

	build.push(parseFloat(settings.opacity_percent.value||0)/100);
	ColorSpaceLab.setColor({RGB: CSL_calc.from[space](build)}, space);  }



var MCP_stylesheet;

ColorSpaceLab.update_Hue_rangeHandle=function(cssColor)  {  // pass in valid CSS String
	if (!MCP_stylesheet.hue_range_thumb_Indexes)  return;
	if (typeof cssColor !== 'string')  cssColor=CSL_calc.from.hue(settings.Hue_range.value).toString('css');
	const rules=MCP_stylesheet.ss.cssRules;
	for (const i of MCP_stylesheet.hue_range_thumb_Indexes)  {
		rules[i].style.backgroundColor=cssColor;  }  }

ColorSpaceLab.update_Alpha_rangeHandle=function()  {
	if (!MCP_stylesheet.alpha_range_thumb_Indexes)  return;
	// ¡We need the initial “computed” color!  Right now we assume it is the same as the panel background
//console.log('none: ',getComputedStyle(settings.opacity_range));
//console.log('moz: ',getComputedStyle(settings.opacity_range, ':-moz-range-thumb'));
//console.log('webkit: ',getComputedStyle(settings.opacity_range, ':-webkit-slider-thumb'));
//console.log('ms: ',getComputedStyle(settings.opacity_range, ':-ms-thumb'));
//console.log('foo: ',getComputedStyle(settings.opacity_range, ':-foo-bar'));
	var cssColor=window.getComputedStyle(document.getElementById('MasterColorPicker_Lab')).backgroundColor;
	//we assume there is no alpha set for the background; cssColor will be a 3-value RGB(r,g,b)
	cssColor=cssColor.slice(0,-1)+', '+(parseFloat(settings.opacity_range.value)/100)+')';
	for (const i of MCP_stylesheet.alpha_range_thumb_Indexes)  {
		MCP_stylesheet.ss.cssRules[i].style.backgroundColor=cssColor;  }  }


UniDOM.addEventHandler(window, 'onload', function() {
	settings=UniDOM.getElementsBy$Name(document.getElementById('MasterColorPicker_Lab'), "", true,
																				function(e) {return e.name.match( /^[a-z]+_([a-z_]+)$/i )[1];});
	for (var i=0; i<settings.length-8; i++)  {  // ignore Alpha, & the last five inputs are “options” checkboxes
		UniDOM.addEventHandler(settings[i], ['onchange', 'onkeyup'], ColorSpaceLab.alignColor);
		if (settings[i].type!=='range')  {
			UniDOM.addEventHandler(settings[i], 'onpaste', function()  {  //wait for paste to change the value
				setTimeout(() => {ColorSpaceLab.alignColor.call(this);}, 0);  });  }  }
	const swatch=document.getElementById('MasterColorPicker_Lab').getElementsByClassName('swatch')[0];
	UniDOM.addEventHandler(settings.opacity_percent, ['onchange', 'onkeyup', 'onpaste'], function()  {
		setTimeout(() =>  { //wait for paste to change the value
			settings.opacity_range.value=this.value;
			swatch.color();
			ColorSpaceLab.update_Alpha_rangeHandle();  }, 0);  });
	UniDOM.addEventHandler(settings.opacity_range, ['onchange', 'onkeyup'], function() {
		settings.opacity_percent.value=this.value;
		swatch.color();
		ColorSpaceLab.update_Alpha_rangeHandle();  });

	ColorSpaceLab.swatch=swatch;
	swatch.color=function(CLR)  {
		CLR=CLR||ColorSpaceLab.getColor(true);
		const tds=this.closest('button').getElementsByTagName('td');
		this.style.backgroundColor=CLR.RGB.hex;
		this.style.color=CLR.RGB.contrast;
		CLR.RGB.rgba.hcga=CLR.HCG.hcga;
		RGB_Calc.config.push({RGBAFactory: {value: SoftMoon.WebWare.RGBA_Color}});
		try  { for (const td of tds)  {
			const cbc=RGB_Calc.to.colorblind(CLR.RGB.rgba, td.getAttribute('title'));
			td.style.backgroundColor=cbc.hex;
			td.style.color=cbc.contrast;  }  }
		finally {RGB_Calc.config.pop();}  }
	swatch.color();
	function CSL_picker(event)  {MasterColorPicker.pick(ColorSpaceLab.getColor(), event, "ColorSpace Lab");}
  UniDOM.addEventHandler(ColorSpaceLab.swatch, 'onClick', CSL_picker);
  UniDOM.addEventHandler(ColorSpaceLab.swatch.closest('button'), 'onKeyUp', function(event)  {  //'onKeyPress'
		if (event.key==='Enter')  CSL_picker(event);  });

	for (i=settings.length-6; i<settings.length; i++)  {
		UniDOM.addEventHandler(settings[i], ['tabIn', 'tabOut'], function(event) {
			UniDOM.useClass(this.closest('fieldset.options'), 'focus-within', event.type==='tabin');  });  }


	MCP_stylesheet=new UniDOM.StyleSheetShell(['MasterColorPicker_desktop_stylesheet', 'MasterColorPicker_stylesheet']),
	MCP_stylesheet.hue_range_thumb_Indexes=MCP_stylesheet.getRuleIndexes( /^#MasterColorPicker_Lab tr.hue input\[type="range"\]::.+-thumb$/ );
	MCP_stylesheet.alpha_range_thumb_Indexes=MCP_stylesheet.getRuleIndexes( /^#MasterColorPicker_Lab fieldset input\[type="range"\]::.+-thumb$/ );
	const rules=MCP_stylesheet.ss.cssRules;
	for (var dflt, i=0;  i<MCP_stylesheet.alpha_range_thumb_Indexes.length;  i++)  {
		if (dflt=rules[MCP_stylesheet.alpha_range_thumb_Indexes[i]].style.backgroundColor)  {
			MCP_stylesheet.alpha_range_thumb_color=dflt;  // ¡We need the “computed” color, not the SS text!
			break;  }  }

	ColorSpaceLab.update_Hue_rangeHandle();
	ColorSpaceLab.update_Alpha_rangeHandle();

	function updateHandle(event, updater)  {
		const
			move=UniDOM.addEventHandler(document.body, 'onMouseMove', updater, true),
			drop=UniDOM.addEventHandler(document.body, 'onMouseUp',
				function(event)  {
					move.onMouseMove.remove();  drop.onMouseUp.remove();
					event.stopPropagation();  },
				true);
		event.stopPropagation();  }

	UniDOM.addEventHandler(settings.Hue_range, 'onMouseDown',
		updateHandle, false, ColorSpaceLab.update_Hue_rangeHandle);
	UniDOM.addEventHandler(settings.opacity_range, 'onMouseDown',
		updateHandle, false, ColorSpaceLab.update_Alpha_rangeHandle);
  });

})(); //  close private namespace of ColorSpaceLab
// =================================================================================================== \\



;(function()  { //  private “globals” wrapper for BeezEye Color Picker
	var hue, saturation, color_value, settings, RGB_Calc=SoftMoon.WebWare.RGB_Calc;

SoftMoon.WebWare.BeezEye=new SoftMoon.WebWare.x_ColorPicker('BeezEye');

SoftMoon.WebWare.BeezEye.buildPalette=function()  {
	var BeezEye=document.getElementById('BeezEye'),
			palette=BeezEye.getElementsByTagName('canvas')[0],
			replacement=document.createElement('canvas'),
			canvas=replacement.getContext('2d'),
			pStylz=getComputedStyle(palette),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
//			size=settings.size.value-100,
			variety=settings.variety.value,
			center={x: Math.round(w/2), y: Math.round(h/2)},     //  w  h  ↔  size
			space={x: w/variety};     //  w ↔ size
			space.y=Math.sin(_['60°'])*space.x;
	var radius=space.y/1.5+.5,
			maxSatPoint=w/2-space.x/2,    //  w ↔ size
			model, row, cells, x, y, flag=false;

	replacement.width=w;    //  w ↔ size
	replacement.height=h;   //  h ↔ size
	palette.parentNode.replaceChild(replacement, palette);
	replacement.style.backgroundColor=pStylz.backgroundColor;
	replacement.style.border=pStylz.border;
	replacement.style.width=w+'px';    //  w ↔ size    / does not
	replacement.style.height=h+'px';   //  h ↔ size    \ take effect (at least not within a fixed-position table…)

	color_value=settings.value.value;
	for (let i=0; i<settings.model.length; i++)  {
		if (settings.model[i].checked)  {model=settings.model[i].value;  break;}  }

	RGB_Calc.config.push({
		RGBAFactory: {value: Array},
		useHexSymbol: {value: true}  });

	SoftMoon.WebWare.HSVA_Color.config.CMYKAFactory=Array;

	for (let rows=0;  rows<h/2;  rows+=space.y, flag=!flag)  {  // h ↔ size
		for (let cells= flag ? (space.x/2) : 0;  cells<w/2;  cells+=space.x)  {   // w ↔ size
			drawHex(cells, rows);  drawHex(-cells, -rows);  drawHex(cells, -rows);  drawHex(-cells, rows);  }  }

	RGB_Calc.config.pop();

	function drawHex(cell, row)  { var natv;
		x=center.x+cell;  y=center.y-row;
		SoftMoon.WebWare.BeezEye.calcNativeHSV(cell, row, maxSatPoint);  //→↓ globals ↓
		if (saturation>100)  return;
		canvas.fillStyle=RGB_Calc.to.hex(natv=SoftMoon.WebWare.BeezEye.nativeToRGB(hue, saturation, color_value));
		canvas.beginPath();
		SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon(canvas, x, y, radius, radius, 6, function(x2, y2) {canvas.lineTo(x2, y2);});
		canvas.closePath();                                                                  // ↑ simply passing  canvas.lineTo  would be nice…
		canvas.fill();  }  }


SoftMoon.WebWare.BeezEye.nativeToRGB=function(h,s,v)  {
	var i, model;
	for (i=0; i<settings.model.length; i++)  {
		if (settings.model[i].checked)  {model=settings.model[i].value.toLowerCase();  break;}  }
	switch (model)  {
	case 'cmyk':
		return RGB_Calc.from.cmyk(SoftMoon.WebWare.HSVA_Color.to_CMYK([h/360, s/100, v/100]));
	default:
		return RGB_Calc.from[model]([h/360, s/100, v/100]);  }  }


SoftMoon.WebWare.BeezEye.calcNativeHSV=function(x, y, maxRadius)  {  // {x,y} are Cartesian co-ordinates
	hue=(Math.Trig.getAngle(x,y)/_['π'])*180;
	saturation=Math.sqrt(x*x+y*y)/maxRadius;
	var twist,
			curve= settings.curve.checked ?  settings.curve_value.value : false;   //  0 < curve <= 100
	if (settings.twist.checked  &&  saturation<1)  {
		twist=settings.twist_value.value-50;    //  0 <= twist <= 100
		hue=Math.deg(hue+360*(twist/50)*(1-saturation));  }
	if (curve  &&  saturation>0  &&  saturation<1)  {
		if (settings.curve_midring.checked)  {
			if (curve<=50)  curve=1-((51-curve)/50);  //  curve becomes:  0 < curve <= 1
			else            curve=((curve-50)/50)+1;  //  curve becomes:  1 < curve <= 2  //?? 2.5
			saturation=(Math.tan( Math.atan(Math.tan(saturation * _['π'] - _['π÷2']) / curve) /2 ) + 1)/2;  }
		else  {
			if (curve<=50)  curve=1-((51-curve)/50);  //  curve becomes:  0 < curve <= 1
			else            curve=((curve-50)/25)+1;  //  curve becomes:  1 < curve <= 3
			saturation=Math.sin(Math.atan( Math.tan( saturation * _['π÷2'] ) / curve ) + _['π']*1.5) + 1;  }  }
	color_value=parseInt(color_value  ||  settings.value.value);
	//  the return value variables are global to BeezEye.buildPalette and BeezEye.getColor, and the return value is therein ignored.
	// hue format is degrees; others are as percents (0-100) although saturation may be greater than 100 meaning the color is invalid: {x,y} is out of the BeezEye
	return [hue, saturation*=100, color_value];  }


SoftMoon.WebWare.BeezEye.getColor=function(event)  {
	var BeezEye=document.getElementById('BeezEye'),
			palette=BeezEye.getElementsByTagName('canvas')[0],
			pStylz=getComputedStyle(palette),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
			center={x: Math.round(w/2), y: Math.round(h/2)},
			variety=settings.variety.value,
			space={x: w/variety};
			space.y=Math.sin(_['60°'])*space.x;
	var maxSatPoint=w/2-space.x/2,
			x=event.offsetX-center.x,
			y=center.y-event.offsetY,
			row=Math.round(y/space.y),
			clr;
	y=row*space.y;
	if (row/2===Math.round(row/2))
		x=Math.round(x/space.x)*space.x;
	else
		x=Math.floor((x)/space.x)*space.x+space.x/2;
	SoftMoon.WebWare.BeezEye.calcNativeHSV(x, y, maxSatPoint);  // globals ↓
	if (saturation>100)  return;
	return new SoftMoon.WebWare.BeezEyeColor(hue, saturation, color_value);  }


SoftMoon.WebWare.BeezEyeColor=function(h, s, v)  { // degrees, percent, percent  → but ¡NO percent% or degrees° marks!
	if (!new.target)  throw new Error('BeezEyeColor is a constructor, not a function.');
	var i, model;
	for (i=0; i<settings.model.length; i++)  {
		if (settings.model[i].checked)  {model=settings.model[i].value.toUpperCase();  break;}  }
	this.model=model;
	h/=360; s/=100;  v/=100;
	MasterColorPicker.RGB_calc.config.push({inputAsFactor: {value: true}});
	if (model==='CMYK')  {
		SoftMoon.WebWare.HSVA_Color.config.CMYKAFactory=SoftMoon.WebWare.CMYKA_Color;
		this.CMYK=SoftMoon.WebWare.HSVA_Color.to_CMYK([h, s, v]);
		this.RGB=MasterColorPicker.RGB_calc.from.cmyk(this.CMYK.cmyk);  }
	else  {
		this[model]=new SoftMoon.WebWare.ColorWheel_Color(h, s, v, undefined, model);
		this.RGB=MasterColorPicker.RGB_calc.from[model.toLowerCase()]([h, s, v]);  }
	MasterColorPicker.RGB_calc.config.pop();  }


	UniDOM.addEventHandler(window, 'onload', function()  { var model, i, BeezEye=SoftMoon.WebWare.BeezEye;
		//first we set the private global members                                        ↓  this defines property names (of the array-object: settings)
		settings=UniDOM.getElementsBy$Name(document.getElementById('BeezEye'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <input>s) into an array, with corresponding properties
		for (i=0; i<settings.model.length; i++)  {
			UniDOM.addEventHandler(settings.model[i], 'onchange', setColorSpace);
			if (settings.model[i].checked)  setColorSpace.call(settings.model[i], false);  }
		UniDOM.addEventHandler(settings.curve, 'onchange', setColorSpace);
		setColorSpace.call(settings.curve, false);
		UniDOM.addEventHandler(settings.twist, 'onchange', setColorSpace);
		setColorSpace.call(settings.twist, false);
		UniDOM.addEventHandler(settings.value, 'onchange', BeezEye.buildPalette);
		UniDOM.addEventHandler(settings.variety, 'onchange', BeezEye.buildPalette);
		UniDOM.addEventHandler(settings.curve_value, 'onchange', BeezEye.buildPalette);
		UniDOM.addEventHandler(settings.curve_midring, 'onchange', BeezEye.buildPalette);
		UniDOM.addEventHandler(settings.twist_value, 'onchange', BeezEye.buildPalette);
		BeezEye.txtInd=document.getElementById('BeezEye_indicator');
		BeezEye.swatch=document.getElementById('BeezEye_swatch');
		var cnvsWrap=document.getElementById('BeezEye').getElementsByTagName('canvas')[0].parentNode;
		UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut', 'onclick'], BeezEye);
		BeezEye.buildPalette();

		function setColorSpace(flag)  { // flag is false upon start-up and ==true (it’s an “onchange” Event Object) otherwise
			var lbl=settings.value.parentNode,
					crv=settings.curve_value,
					twt=settings.twist_value;
			switch (this.value.toLowerCase())  {
			case 'cmyk': lbl.firstChild.data='Black';  lbl.childNodes[1].firstChild.data='(K)';  break;
			case 'hsv':
			case 'hsb': lbl.firstChild.data='Brightness';  lbl.childNodes[1].firstChild.data='Value';  break;
			case 'hsl': lbl.firstChild.data='Lightness';  lbl.childNodes[1].firstChild.data='';  break;
			case 'hcg': lbl.firstChild.data='Gray';  lbl.childNodes[1].firstChild.data='';  break;
			case 'curve': UniDOM.disable(crv.parentNode.parentNode, !this.checked);  break;
			case 'twist': UniDOM.disable(twt.parentNode, !this.checked);  break;  }
			if (flag)  BeezEye.buildPalette();  }
		});  // close window onload
})();  // close “BeezEye globals” wrapper



/*==================================================================*/



SoftMoon.WebWare.RainbowMaestro=new SoftMoon.WebWare.x_ColorPicker('RainbowMaestro');

SoftMoon.WebWare.RainbowMaestro.grayRing={inRad: 12/360, outRad: 30/360};   //default canvas width is 360 px…
SoftMoon.WebWare.RainbowMaestro.smRainbowRing={inRad: 50/360, outRad: 60/360};
SoftMoon.WebWare.RainbowMaestro.lgRainbowRing={inRad: 178/360, outRad: 180/360};
SoftMoon.WebWare.RainbowMaestro.focalHuesRing={outRad: 175/360};  //  inRad is always outRad/2

;(function()  { //wrap private members

var settings, hexagonSpace, focalHue;
const
		RGB_Calc=SoftMoon.WebWare.RGB_Calc,
		RainbowMaestro=SoftMoon.WebWare.RainbowMaestro;

RainbowMaestro.hueAngleUnit=document.getElementsByName('MasterColorPicker_hue_angle_unit')[0];
RainbowMaestro.hueAngleUnit= RainbowMaestro.hueAngleUnit ? 	RainbowMaestro.hueAngleUnit.value  :  'deg';

RainbowMaestro.buildPalette=function(onlyColorblind)  {
	focalHue=parseFloat(settings.focalHue.value);
	if (RainbowMaestro.hueAngleUnit!=='rad'  &&  RainbowMaestro.hueAngleUnit!=='ᴿ')
		focalHue=(focalHue/RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])*_['π×2'];
	var oc=document.getElementById('RainbowMaestro').getElementsByTagName('canvas'),
			f, h, hcg, i, j, k, km, sa, ea, grdnt, r, x, y, temp=new Object, fb, fa, fh, sp, ep, da, dh, hueWidth,
			inRad=new Array, outRad=new Array, cnvs=new Array,
			variety=parseInt(settings.variety.value),
			maxVariety=parseInt(settings.variety.getAttribute('max')),   //  we have to use 'getAttribute' just for MSIE9
			beginCount=onlyColorblind ? 1 : 0,
			cbTypes=RGB_Calc.to.colorblind.types;  //  should be  ['protan', 'deutan', 'tritan']
																						// (spelled any way that makes sense to the colorblind function)
																					 //  in that order for the default HTML


	if (settings.colorblind.checked)  oc.count=oc.length;  else  oc.count=1;
	if (settings.websafe.checked)  {
		settings.focalHue.value = focalHue = 0;
		variety=6;  }

	for (i=beginCount; i<oc.count; i++)  {
		cnvs[i]=document.createElement('canvas');
		cnvs[i].width=oc[i].width;
		cnvs[i].height=oc[i].height;
		cnvs[i].context=cnvs[i].getContext('2d');
		cnvs[i].centerX=Math.round(cnvs[i].width/2);
		cnvs[i].centerY=Math.round(cnvs[i].height/2);
		inRad[i]= cnvs[i].width*this.grayRing.inRad;
		outRad[i]=cnvs[i].width*this.grayRing.outRad;
		oc[i].parentNode.replaceChild(cnvs[i], oc[i]);  }

	RGB_Calc.config.push({RGBAFactory: {value: Array},
												useHexSymbol: {value: true},
												roundRGB: {value: false} });

	try {
	for (j=0; j<variety; j++)  {  // black-grays-white picker ring
		h=255*(j/(variety-1));  h=[h,h,h];  h.hcga=[0,0,j/(variety-1)];
		sa=_['π×2']*(j/variety);
		ea=_['π×2']*((j+1)/variety);
		for (i=beginCount; i<cnvs.length; i++)  {
			cnvs[i].context.beginPath();                                             //  ↓ note the ☆insanity☆ of arc() in that angles are measured starting at 3:00 and go CLOCKWISE, yet the stroke is COUNTERCLOCKWISE by default from the second angle to the first! WHAT?
			cnvs[i].context.moveTo(cnvs[i].centerX+inRad[i]*Math.cos(sa), cnvs[i].centerY+inRad[i]*Math.sin(sa));
			cnvs[i].context.fillStyle=RGB_Calc.to.hex( (i>0) ?  RGB_Calc.to.colorblind(h, cbTypes[i-1]) : h);
			cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, inRad[i], sa, ea, false);
			cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, outRad[i], ea, sa, true);
			cnvs[i].context.closePath();
			cnvs[i].context.fill();  }  }

	for (i=beginCount; i<cnvs.length; i++)  {  //  outline for black-grays-white picker ring
		grdnt=cnvs[i].context.createLinearGradient(cnvs[i].centerX, cnvs[i].centerY+inRad[i], cnvs[i].centerX, cnvs[i].centerY-inRad[i]);
		grdnt.addColorStop(0, '#FFFFFF')
		grdnt.addColorStop(1, '#000000')
		cnvs[i].context.strokeStyle=grdnt;
		cnvs[i].context.beginPath();
		cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, inRad[i], 0, _['π×2']);
		cnvs[i].context.stroke();
		grdnt=cnvs[i].context.createLinearGradient(cnvs[i].centerX, cnvs[i].centerY+outRad[i], cnvs[i].centerX, cnvs[i].centerY-outRad[i]);
		grdnt.addColorStop(0, '#FFFFFF')
		grdnt.addColorStop(1, '#000000')
		cnvs[i].context.strokeStyle=grdnt;
		cnvs[i].context.beginPath();
		cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, outRad[i], 0, _['π×2']);
		cnvs[i].context.stroke();  }

	// color rings
	f=function(rgb, a) {return RGB_Calc.to.hex((i===0) ?  rgb  :  (rgb.hcga=[a/_['π×2'],1,.5],  RGB_Calc.to.colorblind(rgb, cbTypes[i-1])));};
	fb=function(rgb, a)  { return f(
			settings.splitComplement.checked  ?
					RGB_Calc.from.hue( ( (Math.Trig.ellipseAngle(a-focalHue, 1/3) + focalHue) % _['360°'] ) / _['π×2'] )
				: rgb,
			a );  };
	for (i=beginCount; i<cnvs.length; i++)  { //cycle through each canvas
		SoftMoon.WebWare.canvas_graphics.rainbowRing(
			cnvs[i].context,  cnvs[i].centerX,  cnvs[i].centerY,
			Math.floor(cnvs[i].width*this.smRainbowRing.outRad),
			Math.floor(cnvs[i].width*this.smRainbowRing.inRad),
			f );
		SoftMoon.WebWare.canvas_graphics.rainbowRing(
			cnvs[i].context,  cnvs[i].centerX,  cnvs[i].centerY,
			Math.floor(cnvs[i].width/2),
			Math.floor(cnvs[i].width*this.lgRainbowRing.inRad),
			fb );  }

	// focal shades: hexagons arranged in a triangle
	// “loose diamonds”: mathematically-harmonious (¡NOT exactly color harmony!) hues & shades that fall between focal hues
	variety--;
	function lineTo(x2, y2) {cnvs[i].context.lineTo(x2, y2);};

	for (i=beginCount; i<cnvs.length; i++)  { //cycle through each canvas
		outRad=Math.floor(cnvs[i].width*this.focalHuesRing.outRad);
		const
		space={y: Math.tan(_['30°'])*outRad / variety,
					 w: _['60°']/maxVariety };
		space.x=Math.sin(_['60°'])*space.y;
		space.h=space.x*.854;
		if (i===0)  hexagonSpace=space;  //(private) save for getColor
		const h_r=space.y/1.5;  //hexagon radius
		cnvs[i].context.save();
		cnvs[i].context.translate(cnvs[i].centerX, cnvs[i].centerY);

		if (!settings.focalsOnly.checked)  for (f=0; f<6; f++)  { //cycle through 6 intermix sections
	// “loose Diamonds”
			for (j=2; j<=variety; j++)  { for (let n=1, hueWidth=_['60°']/j, halfHW=hueWidth/2+space.w/2;  n<j;  n++)  {
				da=f*_['60°']+hueWidth*n;
				dh= (settings.splitComplement.checked  &&  !settings.websafe.checked) ?
					Math.Trig.ellipseAngle(da, 1/3)
				: da;
				da=Math.rad(da-focalHue);
				dh=Math.rad(dh-focalHue);
				r=outRad-(variety-j)*space.h-space.h/2;
				for (k=0, km=variety-j+1; k<km; k++)  {
					let a=da - (space.w*(variety-j+1)/2) + space.w*(k+.5);
					if (a<da-halfHW  ||  a>da+halfHW)  continue;
					a=Math.rad(a);
					hcg=[1-dh/_['360°'],  j/variety,  km>1 ? (k/(km-1)) : .5];
					h=RGB_Calc.from.hcg(hcg);
					cnvs[i].context.fillStyle= RGB_Calc.to.hex( (i===0) ?  h  :  (h.hcga=hcg,  RGB_Calc.to.colorblind(h, cbTypes[i-1])));
					cnvs[i].context.beginPath();
					SoftMoon.WebWare.canvas_graphics.shapes.polarizedDiamond(cnvs[i].context, r, a, space.h, space.w, lineTo);
					cnvs[i].context.closePath();
					cnvs[i].context.fill();  }  }  }  }

		for (f=0; f<6; f++)  { //cycle through 6 focal hues
			fa=f*_['60°'];
			fh= (settings.splitComplement.checked  &&  !settings.websafe.checked) ?
				Math.Trig.ellipseAngle(fa, 1/3)
			: fa;
			fa=Math.rad(fa-focalHue);
			fh=Math.rad(fh-focalHue);
			if (settings.splitComplement.checked  &&  !settings.websafe.checked)  {
				sp=Math.Trig.polarToCartesian(cnvs[i].width*this.focalHuesRing.outRad/2, fa);
				ep=Math.Trig.polarToCartesian(cnvs[i].width*this.smRainbowRing.outRad,   fh);
				SoftMoon.WebWare.canvas_graphics.line(cnvs[i].context, sp, ep, 3, '#000000');
				SoftMoon.WebWare.canvas_graphics.line(cnvs[i].context, sp, ep, 1, '#FFFFFF');  }
			cnvs[i].context.save();
			cnvs[i].context.rotate(fa);
	// focal hues triangles
			for (j=0; j<variety; j++)  { for (k=0; k<=j; k++)  {
				hcg=[Math.sawtooth(1, 1-fh/_['360°']),  1-j/variety,  (j===0) ? .5 : k/j];
				h=RGB_Calc.from.hcg(hcg);
				cnvs[i].context.fillStyle= RGB_Calc.to.hex( (i===0) ?  h  :  (h.hcga=hcg,  RGB_Calc.to.colorblind(h, cbTypes[i-1])));
				cnvs[i].context.beginPath();
				x=outRad-j*space.x-space.x/2;
				y=space.y*j/2 - space.y*k;
				SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon(cnvs[i].context, x, y, h_r, h_r, 6, lineTo, _['90°']);
				cnvs[i].context.closePath();
				cnvs[i].context.fill();  }  }
			cnvs[i].context.restore();  }
		cnvs[i].context.restore();  }

	}finally{RGB_Calc.config.pop();}
	};  // close  RainbowMaestro.buildPalette



var mouseColor, targetHue; //private members

SoftMoon.WebWare.RainbowMaestro.getColor=function(event)  { mouseColor=null;  targetHue=null;
	if (event.target===event.currentTarget)  return null;

	MasterColorPicker.RGB_calc.config.push({inputAsFactor: {value: true}})

	focalHue=parseFloat(settings.focalHue.value);  //private member
	if (RainbowMaestro.hueAngleUnit!=='rad'  &&  RainbowMaestro.hueAngleUnit!=='ᴿ')
		focalHue=(focalHue/RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])*_['π×2'];
	var pStylz=getComputedStyle(event.target),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
			x=event.offsetX-Math.round(w/2),
			y=Math.round(h/2)-event.offsetY,
			a=Math.Trig.getAngle(x, y),
			r=Math.sqrt(x*x+y*y),
			variety=parseInt(settings.variety.value),
			color=null;

	calcColor: {

	if (r<w*this.grayRing.inRad)  break calcColor;
	if (r<w*this.grayRing.outRad)  {

		var g=1-Math.floor(a*variety/_['360°'])*(1/(variety-1));
		color=mouseColor=new RainbowMaestro.MaestroColor(
				MasterColorPicker.RGB_calc.from.rgb([g,g,g]),  0, 0, g,  'grays');
		break calcColor;  }
	if (r<w*this.smRainbowRing.inRad)  break calcColor;
	if (r<w*this.smRainbowRing.outRad)  {
		if (settings.websafe.checked)  a=Math.round(a/_['24°'])*_['24°'];
    targetHue=a;
		color=mouseColor=new RainbowMaestro.MaestroColor(
				MasterColorPicker.RGB_calc.from.hue(a/_['360°']),  a, 1, .5, 'smRainbow', a);
		break calcColor;  }
	if (r<w*this.focalHuesRing.outRad/2)  {
    targetHue=a;
		break calcColor;  }

	if (r<w*this.focalHuesRing.outRad)  {

		focalHueTriangle: {
		var fa=Math.round(Math.rad(a-focalHue)/_['60°'])*_['60°']+focalHue,
				cgp=Math.Trig.polarToCartesian(r, a-fa),  //get chroma/gray point: {x,y} calculated as if the color-triangle in question is rotated to point the full-color tip to the 3:00 (0°) position, i.e. the tip is on the positive x-axis
				chroma= Math.floor((w*this.focalHuesRing.outRad-cgp.x)/(hexagonSpace.x));  //inverse progression from Chroma-factor
		if (chroma>variety-2)  break calcColor;  //break focalHueTriangle;  //area just below focal triangles - currently unused.
		var gray= Math.floor((cgp.y+(chroma+1)*hexagonSpace.y/2)/hexagonSpace.y);  //get gray level
		if (gray<0  ||  gray>chroma)  break focalHueTriangle;
		gray=(chroma===0) ? .5 : gray/chroma;  //get gray factor
		chroma=1-chroma/(variety-1);  //get chroma factor
		if (settings.splitComplement.checked  &&  !settings.websafe.checked)
			fa=Math.Trig.ellipseAngle(fa-focalHue, 1/3)+focalHue;
		fa=Math.rad(fa);
		color=mouseColor=new RainbowMaestro.MaestroColor(
				MasterColorPicker.RGB_calc.from.hcg([fa/_['π×2'],  chroma,  gray]),
				fa, chroma, gray, 'focalTriangles');
		break calcColor;  }

		looseDiamonds: {
		if (settings.focalsOnly.checked)  break calcColor;  //break looseDiamonds; //there is currently nothing else in this area
		chroma=Math.ceil((r-w*this.focalHuesRing.outRad+(variety-1)*hexagonSpace.h) / hexagonSpace.h) ;
		if (chroma<2) break calcColor;  //break looseDiamonds;
		fa= _['60°'] / chroma;
		fa=Math.rad(Math.round(Math.rad(a-focalHue)/fa)*fa+focalHue);
		chroma=variety - chroma - 1;
		gray=Math.round(Math.rad(a-(fa-hexagonSpace.w*chroma/2))/hexagonSpace.w);  //get gray level
		if (gray<0  ||  gray>chroma)  break calcColor;  //break looseDiamonds;
		gray=(chroma===0) ? .5 : 1-gray/chroma;  //get gray factor
		chroma=1-chroma/(variety-1);  //get chroma factor
		if (settings.splitComplement.checked  &&  !settings.websafe.checked)
			fa=Math.rad(Math.Trig.ellipseAngle(fa-focalHue, 1/3)+focalHue);
		color=mouseColor=new RainbowMaestro.MaestroColor(
				MasterColorPicker.RGB_calc.from.hcg([fa/_['π×2'],  chroma,  gray]),
				fa, chroma, gray, 'looseDiamonds');
		break calcColor;  }
		//we never actually get here, but if more than looseDiamonds needs calculating (in future editions), we would break from looseDiamonds above instead…
		break calcColor;  }

	if (r>=w*this.lgRainbowRing.inRad
	&&  r<=w*this.lgRainbowRing.outRad)  {
		if (settings.websafe.checked)  a=Math.round(a/_['24°'])*_['24°'];
		else if (settings.splitComplement.checked)
			a=Math.rad(Math.Trig.ellipseAngle(a-focalHue, 1/3)+focalHue);
    targetHue=a;
		color=mouseColor=new RainbowMaestro.MaestroColor(
				MasterColorPicker.RGB_calc.from.hue(a/_['360°']),  a, 1, .5, 'lgRainbow', a);  }

	}  //close  calcColor

	MasterColorPicker.RGB_calc.config.pop();
	return color;  }  //close getColor



SoftMoon.WebWare.RainbowMaestro.MaestroColor=function(RGB, H, C, G, ring, targetHue)  {
	if (!new.target)  throw new Error('MaestroColor is a constructor, not a function.');
	this.RGB=RGB;
	this.model='HCG';
	this.HCG=new SoftMoon.WebWare.HCGA_Color(Math.rad(H)/_['π×2'], C, G, 'HCG');
	this.ring=ring;
	this.targetHue=targetHue;  }


//unused function for your hacking convenience:
// you must call RainbowMaestro.getColor(event) before calling this
SoftMoon.WebWare.RainbowMaestro.getTargetHue=function()  {return targetHue;}


/******note below that  x_ColorPicker.…mouse…  calls  RainbowMaestro.getColor  before  handleMouse  is called******/
SoftMoon.WebWare.RainbowMaestro.handleMouse=function(event)  {
	if (event.type==='mouseout')  {mouseColor=null;  targetHue=null;}
	if (!settings.lock.checked  &&  !settings.websafe.checked)  {
		var hueIndicator=document.querySelector('#RainbowMaestro_hueIndicator span.hueIndicator').firstChild;
		hueIndicator.data=(targetHue===null)  ?  ""
			:  (Math.roundTo((targetHue/_['π×2'])*RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit], SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[RainbowMaestro.hueAngleUnit])+RainbowMaestro.hueAngleUnit);
		UniDOM.useClass(hueIndicator.parentNode, 'active', targetHue!==null);  }
	const spsw=document.getElementById('RainbowMaestro').getElementsByClassName('subpalette_swatch'),
				count= settings.colorblind.checked  ?  spsw.length : 1;
	RGB_Calc.config.push({useHexSymbol: {value: true},  RGBAFactory: {value: Array},  roundRGB: {value: false}});
	for (var i=0; i<count; i++)  {
		spsw[i].style.backgroundColor= (mouseColor)  ?   // && mouseColor.ring
			((i>0) ?  RGB_Calc.to.hex(RGB_Calc.to.colorblind(mouseColor.RGB.rgba, RGB_Calc.to.colorblind.types[i-1]))
						 :  mouseColor.RGB.hex)
		: "";  }
	RGB_Calc.config.pop();  };

/****** note below that  x_ColorPicker.onclick  calls  RainbowMaestro.getColor  before  handleClick  is called ******/
SoftMoon.WebWare.RainbowMaestro.handleClick=function()  {
	if (!settings.lock.checked && !settings.websafe.checked  &&  targetHue!==null)  {
		settings.focalHue.value= Math.roundTo(
			(RainbowMaestro.hueAngleUnit==='rad'  ||  RainbowMaestro.hueAngleUnit==='ᴿ')  ?
					targetHue
				: (targetHue/_['π×2'])*RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit],
			SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[RainbowMaestro.hueAngleUnit] );
		SoftMoon.WebWare.RainbowMaestro.buildPalette();  }  }

SoftMoon.WebWare.RainbowMaestro.showColorblind=function()  {
	UniDOM.useClass(document.getElementById('RainbowMaestro'), 'no_colorblind', !this.checked);
	if (this.checked) RainbowMaestro.buildPalette(true);  }

SoftMoon.WebWare.RainbowMaestro.makeWebsafe=function(flag)  {
	if (settings.lock.checked)  this.checked=false;
	else
	if (this.checked  ||  flag===true)  { settings.websafe.checked=true;
		settings.focalsOnly.checked=false;
		settings.variety.value='6';
		settings.splitComplement.checked=false;
		RainbowMaestro.buildPalette();  }  }

SoftMoon.WebWare.RainbowMaestro.makeSplitComplement=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	if (settings.lock.checked)  this.checked=false;
	else  {
		if (flag)  { settings.splitComplement.checked=true;
			settings.websafe.checked=false;  }
		RainbowMaestro.buildPalette();  }  }

SoftMoon.WebWare.RainbowMaestro.alterVariety=function(event)  {
	if (settings.lock.checked
	||  (event.type==='change'  &&  (!event.enterKeyed  ||  event.enterKeyPressCount>1)) )  return;
	settings.websafe.checked=false;
	if (typeof arguments[0] == 'number'  ||  (typeof arguments[0] == 'string' &&  arguments[0].match( /^[0-9]+$/ )))
		settings.variety.value=arguments[0];
	RainbowMaestro.buildPalette();  }

SoftMoon.WebWare.RainbowMaestro.lock=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	else  this.checked=flag;
	settings.websafe.disabled=flag;
	settings.splitComplement.disabled=flag;
	settings.variety.disabled=flag;
	settings.focalHue.disabled=flag;  }

SoftMoon.WebWare.RainbowMaestro.handle_focalsOnly=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	else  settings.focalsOnly.checked=flag;
	if (flag)  settings.websafe.checked=false;
	RainbowMaestro.buildPalette();  }

//unused function for your hacking convenience
SoftMoon.WebWare.RainbowMaestro.setFocalHue=function(hueAngle, radianFlag)  {  hueAngle=parseFloat(hueAngle);
	if (radianFlag)  settings.focalHue.value=hueAngle;
	else  settings.focalHue.value=(hueAngle/RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])*_['π×2'];
	if (hueAngle !== focalHue)
		RainbowMaestro.buildPalette();  }

UniDOM.addEventHandler( window, 'onload', function()  {
		//first we set the private global members                                               ↓  this defines property names (of the array-object: settings)
		settings=UniDOM.getElementsBy$Name(document.getElementById('RainbowMaestro'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <inputs>s) into an array, with corresponding properties
		if (!settings.colorblind.checked)  //the colorblind provider initiator will build the palette otherwise
			UniDOM.addEventHandler(window, 'mastercolorpicker_ready', ()=>{RainbowMaestro.buildPalette();});
		UniDOM.addEventHandler(settings.websafe, 'onclick', RainbowMaestro.makeWebsafe);
		UniDOM.addEventHandler(settings.splitComplement, 'onclick', RainbowMaestro.makeSplitComplement);
		UniDOM.addEventHandler(settings.lock, 'onclick', RainbowMaestro.lock);
		UniDOM.addEventHandler(settings.colorblind, 'onclick', RainbowMaestro.showColorblind);
		UniDOM.addEventHandler(settings.variety, ['onmouseup', 'onchange', 'onblur'], RainbowMaestro.alterVariety);
		UniDOM.addEventHandler(settings.focalsOnly, 'onclick', RainbowMaestro.handle_focalsOnly);

		UniDOM.addEventHandler(settings.focalHue, 'onkeydown', function(event) {
			MasterColorPicker.event=event;
			if (MasterColorPicker.debug)  MasterColorPicker.debug.log.write('MasterColorPicker — keydown  — keyPressed= '+event.keyCode+' ¦ keepKey= now unknown here');
			});
		UniDOM.addEventHandler(settings.focalHue, 'onchange', function(event)  {
			var key=MasterColorPicker.event && MasterColorPicker.event.keyCode;
			if (MasterColorPicker.debug)  MasterColorPicker.debug.log.write('MasterColorPicker — onchange — keyPressed= '+key+' ¦ synFlag= '+event.enterKeyed);
			if (key  &&  key!==13  &&  key!==9)  return;    // fix Opera − onchange “should” only occur in tandem with onblur when using keyboard input but occurs with every “characterized keystroke” when using Opera
			settings.websafe.checked=false;
			this.value.replace( /[^-0-9.]/ , "");
			this.value=Math.sawtooth(RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit], parseFloat(this.value)) || 0;
			if ((this.value/RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])*_['π×2'] !== focalHue) //focalHue is a private member
				RainbowMaestro.buildPalette();  } );

		UniDOM.useClass(document.getElementById('RainbowMaestro'), 'no_colorblind', !settings.colorblind.checked);

		RainbowMaestro.txtInd=document.getElementById('RainbowMaestro_indicator');
		RainbowMaestro.swatch=document.getElementById('RainbowMaestro_swatch');
		var cnvsWrap=document.getElementById('RainbowMaestro').getElementsByTagName('canvas')[0].parentNode;
		UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut'], [RainbowMaestro, RainbowMaestro.handleMouse]);
		UniDOM.addEventHandler(cnvsWrap, ['onclick', 'oncontextmenu'], [RainbowMaestro, RainbowMaestro.handleClick]);
	} );

})();  //close  wrap private members




/*==================================================================*/
SoftMoon.WebWare.SimpleSqColorPicker=new SoftMoon.WebWare.x_ColorPicker('Simple²');

;(function() {
	var settings, variety, cnvs, sbcnvs=new Array(),
			RGB_calc=new SoftMoon.WebWare.RGB_Calc({
				useHexSymbol: true,
				inputAsFactor: true,
				RGBAFactory: Array,
				onError: function() {throw null;}});

RGB_calc.to.config=Object.create(RGB_calc.config, {inputAsFactor: {value:false}});

	function initBuild(id)  {
		var wp=document.getElementById(id),
				oc=wp.getElementsByTagName('canvas')[0],
				xcnvs;
		variety=parseInt(settings.variety.value);
		xcnvs=document.createElement('canvas');
		xcnvs.width=oc.width;
		xcnvs.height=oc.height;
		wp.replaceChild(xcnvs, oc);
		xcnvs.context=xcnvs.getContext('2d');
		return xcnvs;  }

SoftMoon.WebWare.SimpleSqColorPicker.buildPalette=function(event)  {
	if (event  &&  event.type==='change'  &&  (!event.enterKeyed  ||  event.enterKeyPressCount>1))  return;
	cnvs=initBuild('Simple²wrapper');
	var space={ x: cnvs.width/(variety+1),
							y: cnvs.height/variety },
			centerX=cnvs.width/2,
			x, y;
	for (x=0; x<cnvs.width; x+=space.x)  { for (y=0; y<cnvs.height; y+=space.y)  {
		try {
			cnvs.context.fillStyle=RGB_calc.to.hex(RGB_calc.from.hcg([
				y/cnvs.height,
				1-Math.abs((centerX-x-space.x/2)/(centerX-space.x/2)),
				(x<centerX) ? 0 : 1
			]));
		} catch(e) {continue;}   //round-off errors at high-end of palette
		cnvs.context.beginPath();
		cnvs.context.fillRect(x, y, space.x+.5, space.y+.5);  }  }
	updateIndicators();
	updateAllSubs();  }

var space, c, hue=.5, sat=.5, lvl=.5;
function build_sats(model)  {
	var y;  //
	for (y=0; y<variety+1; y++)  {
		sbcnvs[c].context.fillStyle=RGB_calc.to.hex(RGB_calc.from[model]([hue, y/variety, lvl]));
		sbcnvs[c].context.beginPath();
		sbcnvs[c].context.fillRect(0, y*space,  sbcnvs[c].width, space+.5);  }
	y=sat*variety*space+space/2;
	sbcnvs[c].context.strokeWidth=2.618;
	sbcnvs[c].context.strokeStyle='#000000';
	sbcnvs[c].context.beginPath();
	sbcnvs[c].context.moveTo(0, y-5);
	sbcnvs[c].context.lineTo(sbcnvs[c].width/2, y);
	sbcnvs[c].context.lineTo(0, y+5);
	sbcnvs[c].context.stroke();
	sbcnvs[c].context.strokeStyle='#FFFFFF';
	sbcnvs[c].context.beginPath();
	sbcnvs[c].context.moveTo(sbcnvs[c].width, y-5);
	sbcnvs[c].context.lineTo(sbcnvs[c].width/2, y);
	sbcnvs[c].context.lineTo(sbcnvs[c].width, y+5);
	sbcnvs[c].context.stroke();  }

function build_lvls(model)  {
	var x;
	for (x=0; x<variety+1; x++)  {
		sbcnvs[c].context.fillStyle=RGB_calc.to.hex(RGB_calc.from[model]([hue, sat, x/variety]));
		sbcnvs[c].context.beginPath();
		sbcnvs[c].context.fillRect(x*space, 0,  space+.5, sbcnvs[c].height);  }
	x=lvl*variety*space+space/2;
	sbcnvs[c].context.strokeWidth=2.618;
	sbcnvs[c].context.strokeStyle='#000000';
	sbcnvs[c].context.beginPath();
	sbcnvs[c].context.moveTo(x-5, 0);
	sbcnvs[c].context.lineTo(x, sbcnvs[c].height/2);
	sbcnvs[c].context.lineTo(x+5, 0);
	sbcnvs[c].context.stroke();
	sbcnvs[c].context.strokeStyle='#FFFFFF';
	sbcnvs[c].context.beginPath();
	sbcnvs[c].context.moveTo(x-5, sbcnvs[c].height);
	sbcnvs[c].context.lineTo(x, sbcnvs[c].height/2);
	sbcnvs[c].context.lineTo(x+5, sbcnvs[c].height);
	sbcnvs[c].context.stroke();  }

SoftMoon.WebWare.SimpleSqColorPicker.build_hSv=function()  {
	sbcnvs[c=0]=initBuild('Simple²hSv');
	space=sbcnvs[c].height/(variety+1);
	build_sats('hsv');  }

SoftMoon.WebWare.SimpleSqColorPicker.build_hSl=function()  {
	sbcnvs[c=1]=initBuild('Simple²hSl');
	space=sbcnvs[c].height/(variety+1),
	build_sats('hsl');  }

SoftMoon.WebWare.SimpleSqColorPicker.build_hsV=function()  {
	sbcnvs[c=2]=initBuild('Simple²hsV');
	space=sbcnvs[c].width/(variety+1);
	build_lvls('hsv');  }

SoftMoon.WebWare.SimpleSqColorPicker.build_hsL=function()  {
	sbcnvs[c=3]=initBuild('Simple²hsL');
	space=sbcnvs[c].width/(variety+1);
	build_lvls('hsl');  }

var moHue, moSat, moLvl;

SoftMoon.WebWare.SimpleSqColorPicker.handleClick=function(event, colorSpace)  {
//	SoftMoon.WebWare.x_ColorPicker.prototype.onclick.apply(this, arguments);
	SoftMoon.WebWare.SimpleSqColorPicker.handleClick[colorSpace](event);  };

SoftMoon.WebWare.SimpleSqColorPicker.getColor=function(event, colorSpace)  {
	return this.getColor[colorSpace](event);  };

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hcg=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>cnvs.width || event.offsetY>cnvs.height)  return false;
	var satBlock=Math.floor((event.offsetX/(cnvs.width/(variety+1)))),
			fullSatBlock=Math.floor(variety/2);
	moHue=Math.floor((event.offsetY/cnvs.height)*variety)/variety,
	moSat=1-Math.abs(fullSatBlock-satBlock)/fullSatBlock;
	return getColor('hcg', moHue, moSat, Math.floor(event.offsetX/(cnvs.width/2)));  }


function getColor(model, h, c_s, g_v_l)  { var RGB, clr, e;
		MasterColorPicker.RGB_calc.config.push({
				inputAsFactor: {value: true},
				onError: {value: function() {throw null;}}});
		try {
			RGB=MasterColorPicker.RGB_calc.from[model]([h, c_s, g_v_l])
			model=model.toUpperCase();
			clr={RGB: RGB, model: model};
			clr[model]=new SoftMoon.WebWare.ColorWheel_Color(h, c_s, g_v_l, undefined, model);  }
		catch(e)  {  //round-off errors at high-end of palette
			clr=false;  }
		MasterColorPicker.RGB_calc.config.pop();
		return clr;  }

SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hcg=function(event) {
	hue=moHue;
	if (!settings.lock.checked)  sat=moSat;
	updateAllSubs();
	updateIndicators();  }

function updateAllSubs()  {
		SoftMoon.WebWare.SimpleSqColorPicker.build_hSv();
		SoftMoon.WebWare.SimpleSqColorPicker.build_hSl();
		SoftMoon.WebWare.SimpleSqColorPicker.build_hsV();
		SoftMoon.WebWare.SimpleSqColorPicker.build_hsL();  };

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hSl=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>sbcnvs[0].width || event.offsetY>sbcnvs[0].height)  return false;
	moSat=Math.floor(event.offsetY/(sbcnvs[0].height/(variety+1)))/variety;
	return getColor('hsl', hue, moSat, lvl);  }

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hSv=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>sbcnvs[1].width || event.offsetY>sbcnvs[1].height)  return false;
	moSat=Math.floor(event.offsetY/(sbcnvs[1].height/(variety+1)))/variety;
	return getColor('hsv', hue, moSat, lvl);  }

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hsV=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>sbcnvs[2].width || event.offsetY>sbcnvs[2].height)  return false;
	moLvl=Math.floor(event.offsetX/(sbcnvs[2].width/(variety+1)))/variety;
	return getColor('hsv', hue, sat, moLvl);  }

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hsL=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>sbcnvs[3].width || event.offsetY>sbcnvs[3].height)  return false;
	moLvl=Math.floor(event.offsetX/(sbcnvs[3].width/(variety+1)))/variety;
	return getColor('hsl', hue, sat, moLvl);  }

function updateIndicators()  {  //private
		document.getElementById('Simple²hue').firstChild.data=Math.roundTo(hue*360, 3)+'°';
		document.getElementById('Simple²saturation').firstChild.data=Math.roundTo(sat*100, 1)+'%';
		document.getElementById('Simple²lvl').firstChild.data=Math.roundTo(lvl*100, 1)+'%';  }

SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hSv=
SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hSl=function(event)  {
	if (settings.lock.checked)  return;
	sat=moSat;
	updateAllSubs();
	updateIndicators();  }

SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hsL=
SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hsV=function(event)  {
	if (settings.lock.checked)  return;
	lvl=moLvl;
	updateAllSubs();
	updateIndicators();  }


UniDOM.addEventHandler( window, 'onload', function()  { var SimpleSqColorPicker=SoftMoon.WebWare.SimpleSqColorPicker;
	//first we set the private global members                                        ↓  this defines property names (of the array-object: settings)
	settings=UniDOM.getElementsBy$Name(document.getElementById('Simple²'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <inputs>s) into an array, with corresponding properties

	UniDOM.addEventHandler(settings.variety, ['onMouseUp', 'onChange', 'onBlur'], SimpleSqColorPicker.buildPalette);

	SimpleSqColorPicker.txtInd=document.getElementById('Simple²indicator');
	SimpleSqColorPicker.swatch=document.getElementById('Simple²swatch');
	SimpleSqColorPicker.noClrTxt=String.fromCharCode(160);
	var i, cnvsWrap, wraps=[
		{id: 'Simple²wrapper', model: 'hcg'},
		{id: 'Simple²hSl', model: 'hSl'},
		{id: 'Simple²hSv', model: 'hSv'},
		{id: 'Simple²hsV', model: 'hsV'},
		{id: 'Simple²hsL', model: 'hsL'}
		 ];
	for (i=0; i<wraps.length; i++)  {
		cnvsWrap=document.getElementById(wraps[i].id);
		UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut'], SimpleSqColorPicker, false, wraps[i].model);
		UniDOM.addEventHandler(cnvsWrap, 'onClick', [SimpleSqColorPicker, SimpleSqColorPicker.handleClick], false, wraps[i].model);  }

	SimpleSqColorPicker.buildPalette();  } );

})();
/*==================================================================*/




;(function () {// open a private namespace for YinYangNiHong

//                                    ↓radians    ↓factor(0-1)
var baseCanvas, mainCanvas, settings, focalHue=0, swatchHue=0, aniOffset=0, Color;
const RGB_Calc=SoftMoon.WebWare.RGB_Calc;

SoftMoon.WebWare.YinYangNiHong=new SoftMoon.WebWare.x_ColorPicker('YinYang NíHóng');

SoftMoon.WebWare.YinYangNiHong.buildBasePalette=function()  {
	baseCanvas=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas')[0];
	baseCanvas.context=baseCanvas.getContext('2d');
	baseCanvas.centerX=baseCanvas.width/2;
	baseCanvas.centerY=baseCanvas.height/2;
	var inRad=Math.min(baseCanvas.centerX, baseCanvas.centerY)-13;

	baseCanvas.context.beginPath();
	baseCanvas.context.fillStyle='#FFFFFF';
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY, inRad, 0, _['π×2']);
	baseCanvas.context.fill();
	baseCanvas.context.beginPath();
	baseCanvas.context.fillStyle='#000000';
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY+inRad/2, inRad/2, _['π÷2'], _['π×3÷2'], false);
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY-inRad/2, inRad/2, _['π÷2'], _['π×3÷2'], true);
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY, inRad, _['π×3÷2'], _['π÷2'], false);
	baseCanvas.context.fill();

	RGB_Calc.config.push({RGBAFactory: {value: Array},
												useHexSymbol: {value: true},
												roundRGB: {value: false} });

	inRad=Math.floor(inRad);
	SoftMoon.WebWare.canvas_graphics.rainbowRing(
		baseCanvas.context,  Math.floor(baseCanvas.centerX), Math.floor(baseCanvas.centerY),  inRad+13, inRad );

	RGB_Calc.config.pop();  }



//for animated yin/yang
SoftMoon.WebWare.YinYangNiHong.buildHueSwatches=function(hue)  { //hue should be between 0-1
	if (typeof hue === 'undefined')  hue=swatchHue;
	RGB_Calc.config.push({RGBAFactory: {value:Array}});
	var canvases=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas'),
			cnvs=document.createElement('canvas'),
			grad;
	cnvs.width=87;   //see animate
	cnvs.height=297;
	if (canvases[1])
		canvases[1].parentNode.replaceChild(cnvs, canvases[1]);
	else  canvases[0].parentNode.appendChild(cnvs);
	cnvs.context=cnvs.getContext('2d');
	cnvs.context.beginPath();
	grad=cnvs.context.createRadialGradient(43.5, 43.5,0, 43.5, 43.5,43.5);
	if (aniOffset)
		grad.addColorStop(0, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, 1-aniOffset, 0])));
	grad.addColorStop(1-aniOffset, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, 1, 0])));
	grad.addColorStop(1, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, 1-aniOffset, 0])));
	cnvs.context.fillStyle=grad;
	cnvs.context.arc(43.5, 43.5, 43.5, 0, _['π×2']);
	cnvs.context.fill();
	cnvs.context.beginPath();
	grad=cnvs.context.createRadialGradient(43.5, 253.5, 0,  43.5, 253.5, 43.5);
	if (aniOffset)
		grad.addColorStop(0, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, aniOffset, 1])));
	grad.addColorStop(aniOffset, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, 1, 1])));
	grad.addColorStop(1, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, aniOffset, 1])));
	cnvs.context.fillStyle=grad;
	cnvs.context.arc(43.5, 253.5, 43.5, 0, _['π×2']);
	cnvs.context.fill();
	RGB_Calc.config.pop();  }


SoftMoon.WebWare.YinYangNiHong.buildPalette=function()  {
	RGB_Calc.config.push({RGBAFactory: {value: SoftMoon.WebWare.RGBA_Color},  roundRGB: {value: true}});
	var canvases=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas'),
			cnvs=document.createElement('canvas'),
			hue=RGB_Calc.from.hue(focalHue/_['π×2']),
			grad;
	mainCanvas=cnvs;
	cnvs.width=256;
	cnvs.height=256;
	if (canvases[2])
		canvases[2].parentNode.replaceChild(cnvs, canvases[2]);
	else  canvases[0].parentNode.appendChild(cnvs);
	cnvs.context=cnvs.getContext('2d');
	var mode, i;
	for (i=0; i<settings.length; i++)  {if (settings[i].checked)  {mode=settings[i].value;  break;}}
	switch (mode.toUpperCase())  {
	case 'HSV':
	case 'HSB':
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 0,256);
			grad.addColorStop(0, hue.toString('css'));
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			grad=cnvs.context.createLinearGradient(0,0, 256,0);
			grad.addColorStop(0, 'rgba(0,0,0,1)');
			grad.addColorStop(1, 'rgba(0,0,0,0)');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			break;
	case 'HSL':
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 256,0);
			grad.addColorStop(0, '#000000');
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			grad=cnvs.context.createLinearGradient(0,0, 0,256);
			hue.a=1;
			grad.addColorStop(0, hue.toString('css'));
			hue.a=0;
			grad.addColorStop(1, hue.toString('css'));
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			grad=cnvs.context.createLinearGradient(0,0, 256,0);
			grad.addColorStop(0, 'rgba(0,0,0,1)');
			grad.addColorStop(.5, 'rgba(128,128,128,0)');
			grad.addColorStop(1, 'rgba(255,255,255,1)');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			break;
	case 'HCG':
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 256,0);
			grad.addColorStop(0, '#000000');
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 0,256);
			hue.a=1;
			grad.addColorStop(0, hue.toString('css'));
			hue.a=0;
			grad.addColorStop(1, hue.toString('css'));
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);  }
	RGB_Calc.config.pop();  }


SoftMoon.WebWare.YinYangNiHong.getColor=function(event)  {
	var x=event.offsetX-baseCanvas.centerX,
			y=baseCanvas.centerY-event.offsetY,
			r=Math.sqrt(x*x+y*y),
			fa, mode, i,
			RGB_calc=MasterColorPicker.RGB_calc;
	Color=null;
	for (i=0; i<settings.length; i++)  {if (settings[i].checked)  {mode=settings[i].value.toUpperCase();  break;}}
	if (event.target===baseCanvas)  {
		if (r>baseCanvas.centerX  ||  r<baseCanvas.centerX-13)  return null;
		fa=Math.Trig.getAngle(x,y);
		RGB_calc.config.push({inputAsFactor: {value: true}});
		Color={
			RGB: RGB_calc.from.hue(fa/_['π×2']),
			model: mode,
			focal: fa };
		Color[mode]=new SoftMoon.WebWare.ColorWheel_Color(fa/_['π×2'], 1, (mode=='HSL') ? .5 : 1, undefined, mode);
		RGB_calc.config.pop();
		return Color;  }
	if (event.target===mainCanvas)  {
		x=event.offsetX;
		y=event.offsetY;
		if (x>=0 && x<=255 && y>=0 && y<=255)  {
			RGB_calc.config.push({inputAsFactor: {value: true}});
			Color={
				RGB: RGB_calc.from[mode.toLowerCase()]([focalHue/_['π×2'],  y=1-y/255,  x=x/255]),
				model: mode };
			Color[mode]=new SoftMoon.WebWare.ColorWheel_Color(focalHue/_['π×2'], y, x, undefined, mode);
			RGB_calc.config.pop();
			return Color;  }  }
	return null;  }


//these mouse event handlers are maintained by UniDOM, and “this” refers to YinYangNiHong
SoftMoon.WebWare.YinYangNiHong.onmousemove=function(event)  {
	this.constructor.prototype['on'+event.type].apply(this, arguments);
	if (Color && Color.focal   &&  event.type==='mousemove')  {
		mainCanvas.style.display='none';
		swatchHue=Color[Color.model].hue;
		this.buildHueSwatches();  }
	else  {
		mainCanvas.style.display='block';
		swatchHue=focalHue/_['π×2'];
		this.buildHueSwatches();  }  }

SoftMoon.WebWare.YinYangNiHong.onmouseout=SoftMoon.WebWare.YinYangNiHong.onmousemove;


SoftMoon.WebWare.YinYangNiHong.onclick=function()  {
  this.constructor.prototype.onclick.apply(this, arguments);
	if (Color && Color.focal)  {
		focalHue=Color.focal;
		settings.focalHueInput.value=focalHue;
		this.buildPalette();  }  }


SoftMoon.WebWare.YinYangNiHong.animate=function animate(event)  {
	if (event.classes[0] !== MasterColorPicker.classNames.activePicker)  return;
	if (event.pickerStateFlag)  {
		if (typeof animate.interval != 'number')
			animate.interval=setInterval(
				function() {if ((aniOffset+=1/44) > 1)  aniOffset=0;  SoftMoon.WebWare.YinYangNiHong.buildHueSwatches();},
				47 );  }
	else  {
		clearInterval(animate.interval);
		animate.interval=null;  }  }


UniDOM.addEventHandler( window, 'onload', function()  { var YinYangNiHong=SoftMoon.WebWare.YinYangNiHong;
	const picker=document.getElementById('YinYangNíHóng');
		//first we set the private global members
	settings=UniDOM.getElementsBy$Name(picker, '');
	settings.focalHueInput=settings[3];
	focalHue=Math.rad(parseFloat(settings.focalHueInput.value)||0);
	swatchHue=focalHue/_['π×2'];

	for (var i=0; i<settings.length-1; i++)  {
		UniDOM.addEventHandler(settings[i], 'onchange', YinYangNiHong.buildPalette);  }

	YinYangNiHong.buildBasePalette();
	YinYangNiHong.buildHueSwatches();
	YinYangNiHong.buildPalette();

	YinYangNiHong.txtInd=document.getElementById('YinYangNíHóng_indicator');
	YinYangNiHong.swatch=document.getElementById('YinYangNíHóng_swatch');
	YinYangNiHong.noClrTxt=String.fromCharCode(160);
	const cnvsWrap=picker.getElementsByTagName('canvas')[0].parentNode;
	UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut', 'onClick'], YinYangNiHong);
	UniDOM.addEventHandler(picker, 'pickerStateChange',  YinYangNiHong.animate);
		} );

}());  //  close private namespace of YinYangNiHong
/*==================================================================*/




// sinebow based on:
// makeColorGradient thanks to:  http://www.krazydad.com/makecolors.php
SoftMoon.WebWare.sinebow=function(settings, phase, callback)  { var freq=2*Math.PI/settings.hue_variety;
	for (var i = 0; i < settings.hue_variety; ++i)  { callback(
		Math.max(0, Math.min(255, Math.sin((2-settings.red_f)*i*freq + settings.red_s + phase.r) * settings.red_v + settings.red_i)),
		Math.max(0, Math.min(255, Math.sin((2-settings.grn_f)*i*freq + settings.grn_s + phase.g) * settings.grn_v + settings.grn_i)),
		Math.max(0, Math.min(255, Math.sin((2-settings.blu_f)*i*freq + settings.blu_s + phase.b) * settings.blu_v + settings.blu_i)) );  }  }  ;



;(function() {  // wrap private members of buildSpectralPalette
var spectral,
		Spectral_CP=new SoftMoon.WebWare.x_ColorPicker("Spectral"),
		handleMouse=function(event) {Spectral_CP['on'+event.type](event);};
		Spectral_CP.canInterlink=false;
		Spectral_CP.canIndexLocator=false;
		Spectral_CP.getColor=function(event) {return {RGB: MasterColorPicker.RGB_calc((event.target || event.srcElement).title), model: 'RGB'};};

UniDOM.addEventHandler(window, 'onload', function()  {
	spectral=document.getElementById('Spectral');
	Spectral_CP.txtInd=document.getElementById('SpectralIndicator');
	Spectral_CP.swatch=document.getElementById('SpectralSwatch');
	Spectral_CP.noClrTxt=String.fromCharCode(160);
	SoftMoon.WebWare.buildSpectralPalette();  });


SoftMoon.WebWare.buildSpectralPalette=function()  {
	var settings=new Object,  board,
			MSIE=navigator.userAgent.match( /MSIE/i ),
			palette=(spectral.getElementsByTagName('tbody'))[1];
	if (MSIE)  {   //    ↓ generally ignored
		var tWidth=spectral.offsetWidth  ||  parseInt(getComputedStyle(spectral).width);
		 // fix MS Internet Exploder’s lameness - it will not recognize <input type='range' /> tags when using the native getElementsByTagName() method
		board=UniDOM.getElements(spectral.getElementsByTagName('thead')[0], function(e) {return e.nodeName==='INPUT';});  }
	else  board=spectral.getElementsByTagName('thead')[0].getElementsByTagName('input');
	for (i=0; i<board.length; i++)  {
		if ( board[i].getAttribute('type')==='range'  ||  board[i].checked )   settings[board[i].name]=parseFloat(board[i].value);  }
	settings.phase_shift=9.42-settings.phase_shift-Math.PI;
	settings.x_shift=6.28-settings.x_shift;
	settings.red_c-=1;  settings.grn_c-=1;  settings.blu_c-=1;
	var yShift=settings.y_shift*settings.mix_variety*3,
			phase, phaseOff, i, tr, tbody=document.createElement('tbody');
	SoftMoon.WebWare.RGB_Calc.config.push({useHexSymbol:{value:true}});
	for (i=yShift; i<yShift+settings.mix_variety*3; i++)  {
		phase=((2*Math.PI/3)/settings.mix_variety)*i;
		phaseOff=settings.phase_shift*((settings.mix_variety-i)/settings.mix_variety) + settings.x_shift;
		tr=document.createElement('tr');
		SoftMoon.WebWare.sinebow(settings,
			{r:phase*settings.red_c + phaseOff, g:phase*settings.grn_c + phaseOff, b:phase*settings.blu_c + phaseOff},
			function(r,g,b) { var clr=SoftMoon.WebWare.RGB_Calc.to.hex([r,g,b]), td;
				td=document.createElement('td');
				td.title=clr;  td.style.backgroundColor=clr;
				if (MSIE && !isNaN(tWidth))  td.style.width=Math.floor(tWidth/settings.hue_variety)+"px";  //if using MSIE you should use CSS to set an absolute width for the Spectral parent table
				td.onmouseover=handleMouse;
				td.onmouseout=handleMouse;
				td.onclick=handleMouse;
				tr.appendChild(td);  } );
		tbody.appendChild(tr);  }
	SoftMoon.WebWare.RGB_Calc.config.pop();
	spectral.replaceChild(tbody, palette);
	spectral.getElementsByTagName('thead')[0].getElementsByTagName('td')[0].colSpan=""+settings.hue_variety;
	spectral.getElementsByTagName('thead')[0].getElementsByTagName('td')[0].setAttribute('colspan', ""+settings.hue_variety);
	}
})();  //close & execute the anonymous wrapper function holding long-term private variables of buildSpectralPalette




/*==================================================================*/


;(function() {  //create a private namespace for the Palette Tables manager/constructor


	// these are the properties of a Palette that MasterColorPicker uses to build Palette Tables
const paletteProps=['header', 'footer', 'footnote', 'useShortChains', 'alternatives', 'display', 'columns',
										'ignoreUnknownColors', 'referenceMarks', 'backReferenceAll', 'forwardReferenceAll'];
const inherited=['requireSubindex', 'useShortChains', 'alternatives', 'display', 'columns',
										'ignoreUnknownColors', 'referenceMarks', 'backReferenceAll', 'forwardReferenceAll'];
Object.lock(paletteProps);
Object.freeze(inherited);
Object.defineProperty(paletteProps, 'inherited', {value: inherited, enumerable: true});
// You can add your custom properties as needed for your hack, but you can not remove or change any default vaules.
// You should only modify this array if you are adding a wrapper-function to “builtPaletteTable()”
//  that needs additional specification properties.
// If your host-environment or another module needs additional properties added to a Palette class instance,
//  you should add them to the  SoftMoon.WebWare.Palette.properties  array instead.
// Replacing this globally accessable pointer does nothing.
SoftMoon.MasterColorPicker_Palette_properties=paletteProps;


SoftMoon.loaded_palettes=new Array;  // each desktop-palette file should push its palette(s) onto this Array


//   If you don’t supply a  path  then the loadPalettes() function will use
// its default path to the palettes’ folder on the server. (see RGB_Calc.js : SoftMoon.colorPalettes_defaultPath='color_palettes/';)
//   If you supply a  whenLoaded  function, it will be passed the freshly loaded palette name and data
// before each palette <table> HTML is built.  If this function passes back  true  then the HTML <table>
// will NOT be built, nor will it be added to the “palette select”; it will be then assumed that this
// function (the whenLoaded function) handled all that if required.
//   If you supply a  whenDone  function, it will be passed an array of
// HTTP-connect Objects (their connections completed) (see the comments for the loadPalettes() function in the rgb.js file)
// after all the palette files are loaded and their HTML <table>s are built, just before the document.body.classname{'MCP-int'} is removed.
SoftMoon.WebWare.initPaletteTables=initPaletteTables;
function initPaletteTables(path, whenLoaded, whenDone)  {

	const preLoaded= SoftMoon.loaded_palettes instanceof Array ? SoftMoon.loaded_palettes : new Array;
	if (arguments[0] instanceof Array)  preLoaded.push.apply(preLoaded, arguments[0]);

	// we need to tell the Palette class constructor to include the
	// properties of a Palette that MasterColorPicker uses to build Palette Tables
	for (const p of paletteProps)  {
	if (!SoftMoon.WebWare.Palette.properties.includes(p))  SoftMoon.WebWare.Palette.properties.push(p);  }

	function preLdErr(palette, e)  {
		if (typeof palette === 'object')  palette.malformed=true;
		console.error('The MasterColorPicker JSON palette file was malformed.\n  Preloaded palette: ',palette,'\n  Error: ', e);  }
	for (let palette of preLoaded)  {
		try  {
			palette=SoftMoon.WebWare.addPalette(palette);
			for (const p in palette) {cleanPaletteMarks(palette[p], palette[p].referenceMarks);}  }
		catch(e) {preLdErr(palette, e);}  }
	while (preLoaded.length)  {
		let palette=preLoaded.shift();
		try  {SoftMoon.WebWare.initLoadedPaletteTable(palette, whenLoaded);}
		catch(e) {preLdErr(palette, e);}  }

	const alertBox=document.getElementById('paletteLoadingAlert');
	if (arguments[0] instanceof Array
	||  !SoftMoon.WebWare.HTTP
	||  !window.location.protocol.match( /^https?\:$/ ))  {
		UniDOM.addClass(alertBox, 'disabled');
		return;  }

	const HTML=initPaletteTables.HTML,
				fadeRate=initPaletteTables.fadeRate,
				files=SoftMoon.WebWare.loadPalettes(  // see RGB_Calc.js
								path,
								updateAlertBox,
								function()  {
									try {
										this.json_palette=SoftMoon.WebWare.addPalette(this.responseText);
										//for (p in this.json_palette) {cleanPaletteMarks(this.json_palette[p], this.json_palette[p].referenceMarks);}
										}
									catch(e)  {
										this.json_palette=null;
										this.malformed=true;
										console.error('The MasterColorPicker JSON palette file was malformed.  Filename:\n  '+this.url+'\n Error:  ', e);  }
									updateAlertBox();  },
								function()  { if (files.length>0)  return;  //load errors are silently ignored here for palettes; updateAlertBox() notes it to the user
									files.noneGiven=true;
									files.indexFailed=true;  },
								SoftMoon.WebWare.HTTP.handleMultiple );

	if (alertBox.isDirty)  alertBox.replaceChild(HTML.initDefault.cloneNode(true), alertBox.firstChild);
	else alertBox.isDirty=true;
	const alrtBox=alertBox.firstChild;  // ¡don’t confuse the two!
	function updateAlertBox()  {
		if (files.noneGiven)  {
			alrtBox.innerHTML= (files.indexFailed ? HTML.indexFailed : HTML.noPalettes);
			opacity=100;  fade=setInterval(fadeAlertBox, fadeRate);
			return false;  }
		var i, flag=false, built=0, failed=false, html="<ul>\n";
		for (i=0; i<files.length; i++)  {
			html+="<li>"+files[i].url.replace( /&/g , '&amp;').replace( /</g , '&lt;').replace( />/g , '&gt;');
			if (files[i].trying)  { flag=true;
				if (files[i].readyState>=3)  html+=HTML.connected;
				else  html+=(files[i].attempts>1 ? HTML.reload : "");  }
			else  {
				if (files[i].status===200
				&&  !files[i].malformed)  html+= (files[i].built) ? (built++, HTML.loaded) : HTML.building;
				else  {failed=true;  built++;  html+= (files[i].malformed ? HTML.malformed : HTML.failed);}  }
			html+="</li>\n";  }
		html+="</ul>\n";
		alrtBox.lastChild.innerHTML= html;
		if (files.length>0  &&  built===files.length)  {
			if (failed)  {
				const button1=document.createElement('button');  button1.append("X");
				const button2=document.createElement('button');  button2.append(HTML.close);
				const button3=document.createElement('button');  button3.append(HTML.hold);
				button1.onclick= button2.onclick= function(event)  {
					event.preventDefault();  event.stopPropagation();
					clearInterval(fade);  UniDOM.addClass(alertBox, 'disabled');  };
				button3.onclick=function(event)  {
					event.preventDefault();  event.stopPropagation();
					clearInterval(fade);  alertBox.style.opacity='1';  }
				alrtBox.lastChild.insertBefore(button1, alrtBox.lastChild.firstChild);
				alrtBox.lastChild.append(button3, button2);
				opacity=100;  fade=setInterval(fadeAlertBox, fadeRate);  }
			else UniDOM.addClass(alertBox, 'disabled');  }
		return flag;
		var opacity, fade;
		function fadeAlertBox()  {
			if (--opacity>0  &&  !MasterColorPicker.pickerActiveFlag)  alertBox.style.opacity=String(opacity/100);
			else  {clearInterval(fade);  UniDOM.addClass(alertBox, 'disabled');}  }  }

	UniDOM.remove$Class(alertBox, 'disabled');
	UniDOM.addClass(document.body, 'MCP_init');
	alertBox.style.opacity='1';

	var wait=setInterval(
		function()  {
			var i, flag;
			if (files.length)  flag=updateAlertBox();
			else  flag=(files instanceof Array  &&  !files.noneGiven);
			if (flag)  return;
			clearInterval(wait);
			if (files.noneGiven)  {
				if (typeof whenDone === 'function')  {try{whenDone(files);} catch(e){console.error(e);}}
				UniDOM.remove$Class(document.body, 'MCP_init');
				return;  }
			i=0;
			wait=setInterval(function ()  { //this exists only to give the DOM a chance to update between building palette tables
					try  { if (files[i].json_palette)
						SoftMoon.WebWare.initLoadedPaletteTable(files[i].json_palette, whenLoaded);  }
					catch (e)  {
						files[i].malformed=true;
						console.error('The MasterColorPicker JSON palette file was malformed.  Filename:\n  '+files[i].url+'\n  Error: ', e);  }
					files[i].built=true;
					updateAlertBox();
				  if (++i >= files.length)  {
						clearInterval(wait);
						if (typeof whenDone === 'function')  {
							try {whenDone(files);}
							catch(e) {console.error('User-supplied “whenDone” function failed in SoftMoon.WebWare.initPaletteTables()  ',e);}  }
						UniDOM.remove$Class(document.body, 'MCP_init');
						}  },
				7);  },
		100 );

	return files;  }
SoftMoon.WebWare.initPaletteTables.autoFadeOnError=true;
SoftMoon.WebWare.initPaletteTables.fadeRate=162;
SoftMoon.WebWare.initPaletteTables.HTML={
	connected: " <span class='connected'>…connected and loading…</span>",
  building: " <span class='loaded'>¡Loaded!……building table……</span>",
  loaded: " <span class='loaded'>¡Loaded and Built!</span>",
  reload: " <span class='reload'>¡Retrying to Load!</span>",
  failed: " <span class='failed'>¡Failed to Load!</span>",
	malformed: " <span class='failed'>¡Malformed File!</span>",
	noPalettes: "<p class='noPalettes'>No MasterColorPicker Palettes found on the Server.</p>",
	indexFailed: "<p class='indexFailed'>The index to the MasterColorPicker Palettes’ files <strong>¡Failed!</strong> to load from the Server</p>",
	close: "close", //these last two are for button text
	hold: "hold" };
SoftMoon.WebWare.initPaletteTables.HTML.initDefault=document.getElementById('paletteLoadingAlert')?.firstChild.cloneNode(true);



SoftMoon.WebWare.initLoadedPaletteTable=function(json_palette, whenLoaded)  {
	const slct=document.getElementById('MasterColorPicker_palette_select'),
				wrap=document.getElementById('MasterColorPicker_paletteTables');
	for (const paletteName in json_palette)  {
		if (typeof whenLoaded === 'function')  {
			try {if (whenLoaded(paletteName, json_palette[paletteName]))  continue;}
			catch(e) {console.error('User-supplied “whenLoaded” function failed in SoftMoon.WebWare.initLoadedPaletteTable()  ',e);}  }
		cleanPaletteMarks(json_palette[paletteName], json_palette[paletteName].referenceMarks);
		if (json_palette[paletteName].display==='none')  continue;
		MasterColorPicker.registerPicker( wrap.appendChild( (typeof json_palette[paletteName].buildPaletteHTML == 'function')  ?
				json_palette[paletteName].buildPaletteHTML(paletteName)       // ← ↓ init: note custom init methods should return the HTML
			: SoftMoon.WebWare.buildPaletteTable(paletteName, json_palette[paletteName], 'color_chart picker') ) );
		const o=document.createElement('option');
		o.value=paletteName.replace( /\s/g, "_");
		o.appendChild(document.createTextNode(paletteName));
		o.selected=(SoftMoon._POST  &&  SoftMoon._POST.palette_select===paletteName);
		slct.appendChild(o);  }  };



function cleanPaletteMarks(jp, referenceMarks)  {  // jp= JSON Palette descriptor
	referenceMarks=getReferenceMarks(referenceMarks);
	if (referenceMarks)  for (const cn in jp.palette)  {
		if (jp.palette[cn].palette)  {
			cleanPaletteMarks(jp.palette[cn],
					jp.palette[cn].referenceMarks===undefined ? referenceMarks : jp.palette[cn].referenceMarks);
			continue;  }
		const clean=checkIsRef(jp.palette[cn], referenceMarks);
		// remember, the original color-data is in the prototype; we are merely masking it here.
		if (clean)  jp.palette[cn]=clean;  }  }

function getReferenceMarks(marks)  {
	if (marks)  {
		if ((marks instanceof Array  ||  typeof marks === 'string')  &&  marks.length===2)  return marks;
		throw new TypeError('Malformed “referenceMarks” property of a JSON encoded palette.');  }  }

function checkIsRef(v, referenceMarks) {
	if (referenceMarks  &&  typeof v === 'string'
	&&  v.substr(0, referenceMarks[0].length)===referenceMarks[0]
	&&  v.substr(-referenceMarks[1].length)===referenceMarks[1])
		return v.slice(referenceMarks[0].length, -referenceMarks[1].length);  }


class Tabular_ColorPicker extends SoftMoon.WebWare.x_ColorPicker {
// getColor below is also called by the x_ColorPicker.onclick implementation,
// both of which (mouseover, click) are applied to the entire Palette <table> via UniDOM
	getColor(event)  {
		const target=event.target.closest('td');
		if (target  &&  target.getColor_cb)
			return target.getColor_cb(event, target.closest('tbody').getAttribute('chain'));  }
	onmouseover(event)  { // this will update the ColorSpace_Lab
		const x_Color=this.getColor(event);
		if (x_Color  &&  x_Color.RGB)  MasterColorPicker.applyFilters(x_Color, event, this.name);  }  }

Tabular_ColorPicker.prototype.canInterlink=false;
Tabular_ColorPicker.prototype.canIndexLocator=false;

SoftMoon.WebWare.Tabular_ColorPicker=Tabular_ColorPicker;

// the following are the callback (cb) functions for Tabular_ColorPicker.getColor above
function noColor() {return {RGB:null, text:"none", model:'text'};}
function addEntry(event, chain)  {
	const txt=chain+this.firstChild.data;
	return  {RGB: MasterColorPicker.RGB_calc(txt),  text: txt,  model: 'text'};  }
function addGridEntry(event, chain)  {
	const txt=chain+this.firstChild.firstChild.data;
	return  {RGB: MasterColorPicker.RGB_calc(txt),  text: txt,  model: 'text'};  }
function returnNext(event)  {
	// return this.nextSibling.getColor_cb(event, chain);
	UniDOM.generateEvent(this.nextSibling, event.type, { bubbles: true, relatedTarget: this,
		view: event.view, cancelable: event.cancelable, detail: event.detail, button: event.button,
		screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
		ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey, metaKey: event.metaKey  });  }
function addRef()  {
	const txt=this.firstChild.data;
	return  {RGB: MasterColorPicker.RGB_calc(txt),  text: txt,  model: 'text'};}
function addBackRef()  {
	const txt=this.firstChild.firstChild.data;
	return  {RGB: MasterColorPicker.RGB_calc(txt),  text: txt,  model: 'text'};}



SoftMoon.WebWare.buildPaletteTable=buildPaletteTable;
function buildPaletteTable(pName, pData, className)  {
	const x_CP=new Tabular_ColorPicker(pName),
				tbl=document.createElement('table'),
				cpt=document.createElement('caption'),
				displayChain= (pName===SoftMoon.defaultPalette) ? "" : (pName+': '),
				clickChain=displayChain,
				footer= (pData.footer instanceof Array) ? pData.footer.slice() : (pData.footer ? [pData.footer] : []);
				// footer may have additional “footers” added from sub-palettes.
				// These are all displayed togeter at the bottom of the complete MasterColorPicker palette table.
				// (sub)palettes may also have a “footnote” which is added to the bottom of each said (sub)palette.
	footer.add=function(foots)  {
		if (!(foots instanceof Array))  this.push(foots);
		else for (const ft in foots) {this.push(ft);}  };

	tbl.className=className;  // 'color_chart'
	tbl.id=pName.replace( /\s/g , "_");
	if (pData.caption)  cpt.appendChild(document.createTextNode(pData.caption));
	else  {
		const h6=document.createElement('h6');
		for (const p of buildPaletteTable.caption.h6)  {
			if (p==='{pName}')  h6.appendChild(document.createElement('strong')).appendChild(document.createTextNode(pName));
			else  h6.appendChild(document.createTextNode(p));  }
		cpt.append(h6);
		if (buildPaletteTable.caption.text)  {
			cpt.appendChild(document.createElement('span')).appendChild(document.createTextNode(buildPaletteTable.caption.text));  }  }
	tbl.appendChild(cpt);
	if (pData.header)  tbl.appendChild(buildTableHdFt(pData.header, 'thead', 'th'));
/*
	if (pData.display!=='grid')
		tbl.appendChild(buildTableRow('td', [
			{ stylez:{border: '2px dotted'},
				onclick: handleClick,
				getColor_cb: noColor  },
			{ text:'none',
				onclick: handleClick,
				getColor_cb: noColor  },
			],
		'noColor'));
 */
	tbl.appendChild(buildTableBodys(pData, displayChain, clickChain));
	if (footer.length)  tbl.appendChild(buildTableHdFt(footer, 'tfoot', 'td'));
	UniDOM.addEventHandler(tbl, ["onMouseOver", "onClick"], x_CP);
	return tbl;

	function buildTableHdFt(data, hf, clmn)  {
		if (!(data instanceof Array))  data=[data];
		const hdft=document.createElement(hf);
		for (var i=0; i<data.length; i++)  {hdft.appendChild( buildTableRow(clmn, [{colSpan:2, text:data[i] }]) );}
		return hdft;  }

	function buildTableBodys(pData, displayChain, clickChain)  {
    var display = (pData.display===undefined) ? 'list' : pData.display;
		const dlb=[];
		function chkDisp(disp)  {
			if (typeof disp !== 'string'
			||  !['list', 'grid', 'none'].includes(disp)
			||  dlb.includes(disp))
				throw new TypeError('Unrecognized or doubled “display” type in MasterColorPicker JSON palette “'+pName+'”: '+disp);
			dlb.push(disp);  }
		if (typeof display === 'object'  &&  display instanceof Array
		&&  display.length>0  &&  display.length<4)
			display.forEach(chkDisp);
		else  chkDisp(display);
		if (display.length===1)  display=display[0];

		const frag=document.createDocumentFragment();

		if (typeof display !== 'string')  {
			const th=document.createDocumentFragment();
			th.appendChild(document.createTextNode('display: '));
			var flag=true;
			for (const disp of display)  {
				const inp=document.createElement('input');
				inp.type='radio';
				inp.name='MCP display for '+displayChain;
				inp.value=disp;
				inp.checked=flag;
				inp.onchange=function() {this.closest('tr').className='switch '+this.value;}
				th.appendChild(document.createElement('label')).append(inp, disp);
				flag=false;  }
			const tr=buildTableRow('th', [{colSpan:2, html:th}]);
			tr.className='switch '+display[0];
			tr.firstChild.className='display';
			frag.appendChild(tr);  }

		var unbuilt=true;
		const subs=new Object,
					useShortChains=Boolean.eval(pData.useShortChains, false),
					referenceMarks=getReferenceMarks(pData.referenceMarks),
					bakRefAll=Boolean.eval(pData.backReferenceAll, false),
					fwdRefAll=Boolean.eval(pData.forwardReferenceAll, false),
					ignore=Boolean.eval(pData.ignoreUnknownColors, false),
					colors=Object.getPrototypeOf(pData.palette);  //the palette has been “cleansed” so we need the original data with formatting marks

		if (canDisplay('grid'))  {
			const columns= Number(pData.columns || buildPaletteTable.defaultGridColumns);
			if (Number.isNaN(columns))
				throw new TypeError('Column value for MasterColorPicker palette '+displayChain+' is not a number: '+(pData.columns || buildPaletteTable.defaultGridColumns));
			if (columns<2  ||  columns>61)
				throw new RangeError('Column value for MasterColorPicker palette '+displayChain+' is out of range: '+columns);
			let tb=false, tbl, row= new Object, i=0;
			for (const c in colors)  {
				if (isAlternative(c))  continue;
				if (colors[c].palette)  {             // ←← this has the original palette data
					subs[c]=get_subP(pData.palette[c]); // ←← this has the Palette class instance
					continue;  }
				if (ignore
				&&  MasterColorPicker.RGB_calc( checkIsRef(colors[c], referenceMarks) || colors[c] ) == null)
					continue;
				row[c]=colors[c];
				if (!tb)  {
					tb=document.createElement('tbody');
					const tr=document.createElement('tr');
					const td=document.createElement('td');  td.colSpan='2';
					tbl=document.createElement('table');  tbl.className='grid';
					tb.appendChild(tr).appendChild(td).appendChild(tbl);  }
				if (++i===columns)  { i=0;
					tbl.appendChild(buildGridRow(row, columns, referenceMarks, bakRefAll, fwdRefAll));
					row=new Object;  }  }
			if (i>0)  tbl.appendChild(buildGridRow(row, columns, referenceMarks, bakRefAll, fwdRefAll));
			if (tb)  addTB(tb, 'grid');
			unbuilt=false;  }

		if (canDisplay('list'))  {
			let tb=false, html;
			for (const c in colors)  {
				if (isAlternative(c))  continue;
				if (colors[c].palette  &&  unbuilt)  {  // ←← this has the original palette data
					subs[c]=get_subP(pData.palette[c]);   // ←← this has the Palette class instance
					continue;  }
				const clr=checkIsRef(colors[c], referenceMarks);
				const flagBakRef= bakRefAll || clr
				const flagFwdRef= fwdRefAll || checkIsRef(c, referenceMarks);
				const clrOb=MasterColorPicker.RGB_calc(clr||colors[c]);
				if (ignore  &&  clrOb == null)  continue;
				if (!tb)  tb=document.createElement('tbody');
				if (flagBakRef)  {
					html=document.createElement('div');  html.appendChild(document.createTextNode(clr||colors[c]));  }
				else html=undefined;
				tb.appendChild(buildTableRow('td', [
					{ html: html,
						stylez: {backgroundColor: clrOb ? clrOb.hex : "",  color: clrOb ? clrOb.contrast : ""},
						getColor_cb: clrOb ? (flagBakRef ?  addBackRef : returnNext) : undefined },
					{ text: flagFwdRef ? (clr||colors[c]) : c,
						getColor_cb: clrOb ? (flagFwdRef ?  addRef : addEntry) : undefined }  ]));  }
			if (tb)  addTB(tb, 'list');  }

		if (display === 'none')
			for (const c in colors)  {
				if (colors[c].palette)  subs[c]= get_subP(pData.palette[c]);  }

		for (const s in subs)  { const subChain=displayChain+s;
			frag.appendChild(buildTableRow('th', [{colSpan:2, className:'head', text:subChain}]));
			if (subs[s].header)
				frag.appendChild(buildTableRow('th', [{colSpan:2, className:'header', text:subs[s].header}]));
			if (subs[s].footer)  footer.add(subs[s].footer);
			frag.appendChild(buildTableBodys(subs[s], subChain+': ',      // pData.requireSubindex is evaluated to a Boolean by the Palette class constructor.
																			 clickChain+((useShortChains && !pData.requireSubindex) ? "" : (s+": "))));  }

		return frag;

		function addTB(tb, disp)  {
			if (pData.footnote)  {
				const footnote= (pData.footnote instanceof Array) ? pData.footnote : [pData.footnote],
							tr=buildTableRow('td', [{colSpan:2}]);
				tr.className='footnote';
				for (const fn of footnote)  {
					tr.firstChild.appendChild(document.createElement('p')).appendChild(document.createTextNode(fn));  }
				tb.appendChild(tr);  }
			tb.setAttribute('chain', clickChain);
			tb.setAttribute('full-chain', displayChain);
			tb.className=disp;
			frag.appendChild(tb);  }
		function canDisplay(format)  {
			return display===format  ||  (display instanceof Array  &&  display.includes(format));  }
		function get_subP(plt)  {
			const subP=Object.create(plt);
			for (const p of paletteProps.inherited)  {if (!(p in plt)) subP[p]=pData[p];}
			return subP;  }
		function isAlternative(c)  {
			// color names that are in all-lowercase/UPPERCASE may be alternative spellings and ifso are not displayed
			// for example,  HTML: grey  HTML: Gray
			return ((pData.alternatives==='lowercase'  &&  c.match( /[a-z]/ )  &&  !c.match( /[A-Z]/ ))
					||  (pData.alternatives==='UPPERCASE'  &&  c.match( /[A-Z]/ )  &&  !c.match( /[a-z]/ )));  }  }


	function buildTableRow(chlds, data, className)  {
		const tr=document.createElement('tr');
		if (tr.className)  tr.className=className;
		for (const i in data)  {
			const td=document.createElement(chlds); // td ‖ th
			for (const p in data[i])  { switch (p)  {
				case 'text':  td.appendChild(document.createTextNode(data[i].text));
				break;
				case 'html':  if (data[i].html)  td.appendChild(data[i].html);
				break;
				case 'stylez':  for (const s in data[i].stylez)  {td.style[s]=data[i].stylez[s]};
				break;
				default:  td[p]=data[i][p];  }  }
			tr.appendChild(td);  }
		return tr;  }

	function buildGridRow(colors, columns, referenceMarks, backRefAll, fwdRefAll)  {
		var i=0, j;
		const tr=document.createElement('tr');
		for (const c in colors)  { i++;
			let clr=checkIsRef(colors[c], referenceMarks);
			const flagBackRef= backRefAll||clr;
			if (flagBackRef) colors[c]=flagBackRef;
			clr=MasterColorPicker.RGB_calc(clr||colors[c]);
			const td=document.createElement('td');
			td.appendChild(document.createElement('span')).appendChild(document.createTextNode(
				(fwdRefAll||checkIsRef(c, referenceMarks)) ? colors[c] : c ));
			td.style.backgroundColor= clr ? clr.hex : "";
			td.style.color= clr ? clr.contrast : "";
			if (flagBackRef)  td.title=colors[c];
			td.getColor_cb=addGridEntry;
			tr.appendChild(td);  }
		for (j=0; j<columns-i; j++)  {tr.appendChild(document.createElement('td')).className='filler';}
		return tr;  }

 }; //close  SoftMoon.WebWare.buildPaletteTable
})();  //close & execute the private namespace for the Palette Tables manager/constructor


SoftMoon.WebWare.buildPaletteTable.caption={
	"h6": ["{pName}"," color-picker table"],  // you may add in other strings of text; they build in order.  {pName} gets put in a <strong>pName</strong>
	"text": "click to choose" };  //  '<h6><strong>{pName}</strong> color-picker table</h6><span>click to choose</span>';  //  '{pName} colors'  //  'couleurs de {pName}'
SoftMoon.WebWare.buildPaletteTable.defaultGridColumns=13;  // the default number of columns in a grid layout format
// The following property is no longer used by MasterColorPicker.
// Instead, referenceMarks are a property of a specific Palette instance.
// The MyPalette class prototype now contains this value to use in the toJSON method.
// The followings’ comments give a good description of how they work:
/*
// note that if (and only if) your marks are a single-character (UTF-8) each,
//  you may use a string instead of an array:    ='«»';
SoftMoon.WebWare.buildPaletteTable.referenceMarks=[ '«' , '»' ];  // if a color name in a palette is wrapped
		// with these characters, it is a “forward-reference” to the color-definition.  This means that when the
		// HTML palette <table> is being built, the color-name is not listed, rather the color-definition is listed.
		// Back-referencing the color-definition can be accomplished in a similar way,
		// by wrapping the color-definition with these characters:
		// in this case, the color-name will be listed, but the color-definition-text will be either:
		// (a) for list-displays: placed inside a <div></div> within the color-swatch <td></td> (the first column of the row which is usually text-less).
		//     Use CSS to manage this added <div>, noting its parent color-swatch <td></td> background will be set as usual,
		//     but the <td></td> foreground will also be set to a contrasting color.
		// (b) for grid-displays: set as a title for the <td></td> to be a standard pop-up tool-tip.
*/

// =================================================================================================== \\


/*


SoftMoon.WebWare.Gradientor=new Object;

SoftMoon.WebWare.Gradientor.buildPalette=function()  {}

 */

/*==================================================================*/




var MasterColorPicker={};  // this is a global variable: a property of the window Object.
// You can add configuration properties to this object before the window is fully loaded.
// This object will be replaced in the window.onload function below:


UniDOM.addEventHandler(window, 'onload', function()  {  //until file end:






var user=MasterColorPicker,  //capture user options set via JavaScript
		meta=document.getElementsByTagName('meta'),
		i, o;

for (i in meta) {if (meta[i].name==="MasterColorPicker"  &&  (o=meta[i].getAttribute('option')))  meta[o]=meta[i].getAttribute('value') || "";}

//the Picker Class is generic; the pickFilter is for our color-picker application
MasterColorPicker=new SoftMoon.WebWare.Picker(  //if you want to debug, you must use the Picker.withDebug.js file
	document.getElementById('MasterColorPicker_mainPanel'),
	{ // debugLogger: document.getElementById('MasterColorPicker_debugLog'),   //requires SoftMoon.WebWare.Log
		// debugLogger: new SoftMoon.WebWare.Log(),  //requires SoftMoon.WebWare.Log, but will log to the console with event-grouping
	  // debugLogger: window.console,
		//  registerPanel: true,  //currently is default
		picker_select: document.getElementById('MasterColorPicker_palette_select'),
		pickFilters: [SoftMoon.WebWare.x_ColorPicker.ColorFilter,   //modifies the selected color: filters colors in or out
									SoftMoon.WebWare.ColorSpaceLab.setColor,      //sets the input-values of the Lab and expands the selected color’s data-format to include all applicable Color-Spaces
									SoftMoon.WebWare.x_ColorPicker.pickFilter,    //determines the final text-output of the picked color and adds it to the x_Color object:  x_Color.text_output
									SoftMoon.WebWare.x_ColorPicker.toSystemClipboard] } );
							//  ↑ the pickFilters filter the “picked” data and handle any other
							// chores before MasterColorPicker.pick() adds the text
							// to the active MasterColorPicker.dataTarget.value

var calcOpts={
	RGBAFactory: function(r,g,b,a) {return new SoftMoon.WebWare.RGBA_Color(r,g,b,a,{useHexSymbol: true})},
	useHexSymbol: true  };
if ("hueAngleUnit" in user) calcOpts.hueAngleUnit=user.hueAngleUnit;  // per SoftMoon.WebWare.RGB_Calc:   'deg' ‖ "°" ‖ 'rad' ‖ "ᴿ" ‖ 'grad' ‖ "%" ‖ 'turn' ‖ "●"
else
if ("hueAngleUnit" in meta) calcOpts.hueAngleUnit=meta.hueAngleUnit;  // per SoftMoon.WebWare.RGB_Calc:   'deg' ‖ "°" ‖ 'rad' ‖ "ᴿ" ‖ 'grad' ‖ "%" ‖ 'turn' ‖ "●"
if ("keepPrecision" in user) calcOpts.roundRGB=!user.keepPrecision;
else
if ("keepPrecision" in meta) calcOpts.roundRGB=!Boolean.evalString(meta.keepPrecision, !SoftMon.WebWare.RGB_Calc.ConfigStack.prototype.roundRGB);
MasterColorPicker.RGB_calc=new SoftMoon.WebWare.RGB_Calc(calcOpts);

Object.defineProperty(MasterColorPicker, 'HTML', {value: document.getElementById('MasterColorPicker'), enumerable: true});



Object.defineProperty(MasterColorPicker, "keepPrecision", { enumerable: true,
	get: function() {return !MasterColorPicker.RGB_calc.config.roundRGB;},
	set: function(kp) {MasterColorPicker.RGB_calc.config.roundRGB=!kp;}  });

//these are options for the pickFilter function and its related colorSwatch function
Object.defineProperty(MasterColorPicker, "hueAngleUnit", { enumerable: true,
	get: function() {return MasterColorPicker.RGB_calc.config.hueAngleUnit;},
	set: function(hau) {MasterColorPicker.RGB_calc.config.hueAngleUnit=hau;}  });
MasterColorPicker.useHexSymbol=("useHexSymbol" in user) ? user.useHexSymbol : ("useHexSymbol" in meta) ? Boolean.evalString(meta.useHexSymbol, true) : true;  // ¿prefix hex values with a hash like this: #FF0099 ?
MasterColorPicker.outputFormat=("outputFormat" in user) ? user.outputFormat : ("outputFormat" in meta) ? meta.outputFormat : 'css';  // see  SoftMoon.WebWare.« RGBA_Color ‖ ColorWheel_Color ‖ CMYKA_Color ».toString  in RGB_Calc.js file


//we tell the x_ColorPicker.pickFilter to use its related colorSwatch function: (we can also use it by calling it directly)
MasterColorPicker.colorSwatch=  ("colorSwatch" in user) ? user.colorSwatch  : SoftMoon.WebWare.x_ColorPicker.colorSwatch;
//options for the default colorSwatch function given above
MasterColorPicker.showColorAs=  ("showColorAs" in user) ? user.showColorAs  :  ("showColorAs" in meta) ? meta.showColorAs                     : 'swatch';   //  'swatch'  or  'background'←of the element passed into colorSwatch()←i.e. the current MasterColorPicker.dataTarget
MasterColorPicker.swatch=            ("swatch" in user) ? user.swatch       :       ("swatch" in meta) ? document.getElementById(meta.swatch) : false;     // no universal swatch element provided here, so colorSwatch() will figure it from the dataTarget ↑.
MasterColorPicker.toggleBorder=("toggleBorder" in user) ? user.toggleBorder : ("toggleBorder" in meta) ? Boolean.evalString(meta.toggleBorder, true)  : true;      // of the swatch when it has a valid color
MasterColorPicker.borderColor=  ("borderColor" in user) ? user.borderColor  :  ("borderColor" in meta) ? meta.borderColor                     : 'invert';  // HTML/CSS color  or  'invert'
// When the ColorSpaceLab wants to add an alpha value to a Palette color,
// and the setting is for “convert to RGB”,
// do we still add (non-standard) alpha data to the color name text?
MasterColorPicker.alwaysApplyAlphaToPaletteColors=  ("alwaysApplyAlphaToPaletteColors" in user) ? user.alwaysApplyAlphaToPaletteColors  :  ("alwaysApplyAlphaToPaletteColors" in meta) ? meta.borderColor  : true;



MasterColorPicker.MyPalette=new SoftMoon.WebWare.x_ColorPicker.MyPalette(document.getElementById('MasterColorPicker_MyPalette'), "MyPalette");
MasterColorPicker.pickFilters.push(MasterColorPicker.MyPalette);




//Any document subsection that is not part of the picker mainPanel, but is part of the picker interface and
//therefore may require “clicking on” or have elements that require “focus”, needs to be registered to work properly
//the order of registration will affect the initial  CSS: z-index  properties.  First registered on top.
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_options'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_MyPalette'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Lab'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Filter'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Gradientor'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Thesaurus'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Help'));}catch(e){}


try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showMyPalette'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showLab'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showFilter'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showGradientor'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showThesaurus'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showHelp'), 'change');}catch(e){}



//after all other modules have access to the original x_Color Object data.
// note we are pushing a function
MasterColorPicker.pickFilters.push(SoftMoon.WebWare.x_ColorPicker.color_to_text);





/****************************************************
 *This section below supports the “default” HTML/CSS files
 */
const mainHTML= MasterColorPicker.mainPanel_HTML= document.getElementById('MasterColorPicker_mainPanel'),
			optsHTML= MasterColorPicker.optsPanel_HTML= document.getElementById('MasterColorPicker_options'),
			labOptsHTML= document.querySelector('#MasterColorPicker_Lab fieldset.options'),
			optsubHTML=optsHTML.getElementsByTagName('div')[0];

UniDOM.addEventHandler(optsHTML, 'pickerStateChange',
	// note that in testing, an “onblur” event never happens for the dataTarget when clicking on a pickerPanel,
	// as the “onclick” event for the picker happens first and re-focuses the dataTarget;
	// this should not be guaranteed (events occur by definition in random order){{old docs...for legacy MSIE only}}.
	// Using UniDOM.disable preserves the disabled states of subsections…
	function(event) {if (event.oldState!==event.pickerStateFlag)  UniDOM.getElementsBy$Class(this, 'pickerOptions').disable(!event.pickerStateFlag);},
	false);
//we could avoid this handler below altogether if MSIE or MS-Edge was up-to-date on CSS rules.
//UniDOM.addEventHandler([optsHTML, labOptsHTML], 'interfaceStateChange',
UniDOM.addEventHandler(optsHTML, 'interfaceStateChange',
	function() {
		UniDOM.useClass( optsubHTML,
			MasterColorPicker.classNames.activeInterface,
			MasterColorPicker.interfaceActiveFlag  &&  UniDOM.hasAncestor(MasterColorPicker.interfaceElement, optsubHTML));  },
	false);
//we could avoid this handler below altogether if CSS rules allowed the ~ combinator to select previous siblings.
//this is for when the options panel is before the mainPanel in the HTML layout
UniDOM.addEventHandler(mainHTML,  ['onMouseEnter', 'onMouseLeave'],
	function(event) {UniDOM.useClass(optsHTML, "pseudoHover", event.type==='mouseenter');},
	false);
UniDOM.addEventHandler(mainHTML, 'pickerPanelZLevelChange',
	function(event) { if (this===event.newTopPanel)  {
		MasterColorPicker.panels.splice(MasterColorPicker.panels.indexOf(optsHTML), 1);
		MasterColorPicker.panels.push(optsHTML);  }  },  // options on top
		//MasterColorPicker.panels.splice(-1, 0, optsHTML);  }  },  // main (picker-panel) on top
	false);
UniDOM.addEventHandler(optsHTML, 'pickerPanelZLevelChange',
	function(event) { if (this===event.newTopPanel)  {
		MasterColorPicker.panels.splice(MasterColorPicker.panels.indexOf(mainHTML), 1);
		MasterColorPicker.panels.splice(-1, 0, mainHTML);  }  },  // options on top
		//MasterColorPicker.panels.push(mainHTML);  }  },  // main (picker-panel) on top
	false);


		//grab all the elements with a 'name' attribute (the <input>s) into an array, with corresponding properties
var userOptions=UniDOM.getElementsBy$Name(optsHTML, "", true, function(n) {return n.name.match( /^(?:MasterColorPicker_)?(.+)(?:\[\])?$/ )[1];});



//UniDOM.generateEvent(document.getElementById('MasterColorPicker_options'), 'pickerStateChange', {bubbles: false, userArgs: {flag:false}});
UniDOM.generateEvent(optsHTML, 'pickerStateChange', {bubbles: false, userArgs: {flag:false}});
try{UniDOM.generateEvent(document.getElementsByName('MasterColorPicker_Gradientor_tricolor')[0], 'onchange', {bubbles: false});}catch(e){}

UniDOM.addEventHandler(userOptions.palette_select, 'onchange', function()  {
	document.getElementById('x_ColorPicker_options').firstChild.firstChild.data = this.options[this.selectedIndex].text + ' mode:';  }  );

var inp;
if (inp=userOptions.keepPrecision)
	MasterColorPicker.keepPrecision=inp.checked;

if (inp=userOptions.useHexSymbol)
	MasterColorPicker.useHexSymbol=inp.checked;

if (inp=userOptions.copyColorToClipboard)
	MasterColorPicker.copyToClipboard=inp.checked;

if (inp=userOptions.hue_angle_unit)  {
	UniDOM.addEventHandler(inp, 'onchange', function(event) {
		var text, hau, hauFactors=SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors;
		MasterColorPicker.hueAngleUnit=this.value;
		switch (this.value) {
			case 'rad':
			case "ᶜ":
			case "ᴿ":
			case "ʳ":  text='radiansᴿ';  hau='rad';
			break;
			case 'grad':
			case "ᵍ":
			case "ᴳ":  text='gradians';  hau='grad';
			break;
			default:  text='degrees°';  hau='deg';  }
		document.getElementById('MasterColorPicker_Lab_hueUnitText').firstChild.data=text;
		if (!event.init)  {
			inp=document.getElementsByName('MasterColorPicker_Hue_degrees')[0];
			inp.value=Math.roundTo(
				(parseFloat(inp.value)/hauFactors[SoftMoon.WebWare.ColorSpaceLab.hueAngleUnit])*hauFactors[hau],
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau] );  }
		SoftMoon.WebWare.ColorSpaceLab.hueAngleUnit=hau;
		switch (this.value) {
			case 'deg':
			case "°":  text='degrees (0°—360°)';
			break;
			case 'rad':
			case "ᶜ":
			case "ᴿ":
			case "ʳ":  text='radians (0ᴿ—2πᴿ ≈6.2831853ᴿ)';
			break;
			case 'grad':
			case "ᵍ":
			case "ᴳ":  text='gradians (0—400)';
			break;
			case '%':  text='percent of a turn (0%—100%)';
			break;
			case 'turn':
			case "●":  text='turn of a circle (0.0●—1.0●)';  }
		document.querySelector('#RainbowMaestro_hueIndicator span.hueAngleUnit').firstChild.data=text;
		if (!event.init)  {
			inp=document.getElementsByName('RainbowMaestro_focalHue')[0];
			inp.value=Math.roundTo(
				(parseFloat(inp.value)/hauFactors[SoftMoon.WebWare.RainbowMaestro.hueAngleUnit])*hauFactors[this.value],
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[this.value] );  }
		SoftMoon.WebWare.RainbowMaestro.hueAngleUnit=this.value;  });

	UniDOM.generateEvent(inp, 'onchange', {bubbles: false, userArgs: {init:true}});
	}


const provSelect=userOptions.colorblind_provider;
for (const prov in SoftMoon.WebWare.RGB_Calc.colorblindProviders)  {
	provSelect.add(new Option(SoftMoon.WebWare.RGB_Calc.colorblindProviders[prov].title,  prov));  }
UniDOM.addEventHandler(provSelect, 'onchange', function() {
	SoftMoon.WebWare.RGB_Calc.install('colorblind', this.value);
	MasterColorPicker.RGB_calc.to.colorblind=SoftMoon.WebWare.RGB_Calc.to.definer.audit.colorblind.value;
	SoftMoon.WebWare.ColorSpaceLab.swatch.color();
	document.getElementById('RainbowMaestro').getElementsByClassName('thanks')[0].innerHTML=SoftMoon.WebWare.RGB_Calc.colorblindProviders[this.value].thanks;
	if (document.getElementsByName('RainbowMaestro_colorblind')[0].checked)  SoftMoon.WebWare.RainbowMaestro.buildPalette();
	var trs=MasterColorPicker.MyPalette.trs;
	for (var inp, i=1; i<trs.length; i++)  {
		if (inp=trs[i].querySelector("[name$='[definition]']"))  MasterColorPicker.colorSwatch(inp);  }  }  );
UniDOM.generateEvent(provSelect, 'onchange');





	function enhanceKeybrd(event)  {
		if (!event.target.parentNode  //the Genie may delete them before this handler occurs.
		||  event.keyCode===9  // ← tab key    ↓ ,<                .> ↓
		||  (event.ctrlKey && event.keyCode===188 || event.keyCode===190))  return;
		if (UniDOM.hasAncestor(event.target, MasterColorPicker.HTML))
			MasterColorPicker.setTopPanel(event.target.closest('.pickerPanel'));
		var txt, curPos, color;
		findKey: {
			if (event.altKey)  switch (!event.shiftKey && !event.ctrlKey && event.keyCode)  {
			case 67: txt="ᶜ";   // C
			break findKey;
			case 71: txt="ᵍ";   // G
			break findKey;
			case 82: txt="ᴿ";   // R
			break findKey;
			default:  return;  }
			switch (event.keyCode)  {
			case 49: if (event.ctrlKey)  txt= event.shiftKey ? "¡" : "●";  // 1! key
			break;
			case 50: if (event.ctrlKey)  txt= event.shiftKey ? "®" : "©";  // 2@ key
			break;
			case 53: if (event.ctrlKey && event.shiftKey)  txt="°";  // 5% key
			break;
			case 54: if (event.ctrlKey)  txt= event.shiftKey ? "☻" : "☺";  // 6^ key
			break;
			case 55: if (event.ctrlKey)  txt= event.shiftKey ? "♫" : "♪";  // 7& key
			break;
			case 56: if (event.ctrlKey)  txt= event.shiftKey ? "☼" : "×";  // 8* key
			break;
			case 61: if (event.ctrlKey)  txt= event.shiftKey ? "≈" : "±";  // =+ key
			break;
			case 112: if (!event.ctrlKey)  {  // F1 function key
				userOptions.showHelp.checked= !event.shiftKey;
				UniDOM.generateEvent(userOptions.showHelp, 'change');
				if (!event.ShiftKey)  MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Help'));
				event.preventDefault();  }
			break;
			case 113:   // F2 function key
				userOptions.showMyPalette.checked= !event.shiftKey;
				UniDOM.generateEvent(userOptions.showMyPalette, 'change');
				if (!event.ShiftKey)  {
					MasterColorPicker.setTopPanel(MasterColorPicker.MyPalette.HTML);  //document.getElementById('MasterColorPicker_MyPalette')
					if (event.ctrlKey   //add color in user-input box to MyPalette
					&&  !UniDOM.hasAncestor(event.target, MasterColorPicker.MyPalette.HTML)
					&&  MasterColorPicker.RGB_calc(event.target.value))  {
						MasterColorPicker.MyPalette.addColor(event.target.value);
						return;  }  }
				event.preventDefault();
			break;
			case 114:   // F3 function key
				userOptions.showLab.checked= !event.shiftKey;
				UniDOM.generateEvent(userOptions.showLab, 'change');
				event.preventDefault();
				if (!event.ShiftKey)  {
					MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Lab'));
					if (event.ctrlKey    //sync color in user-input box to ColorSpaceLab
					&&  (color=MasterColorPicker.RGB_calc(event.target.value)))  {
						SoftMoon.WebWare.ColorSpaceLab.setColor({RGB: color});
						return;  }  }
			break;
			case 115:   // F4 function key
				userOptions.showThesaurus.checked= !event.shiftKey;
				UniDOM.generateEvent(userOptions.showThesaurus, 'change');
				if (!event.ShiftKey)  {
					MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Thesaurus'));
					if (event.ctrlKey //match color in user-input box using Thesaurus  ¡STOLEN! by the browser…oh well.
					&&	MasterColorPicker.RGB_calc(event.target.value))  {
						document.getElementsByName('MasterColorPicker_Thesaurus_color')[0].value=event.target.value;
						}  }
				event.preventDefault();
			break;
			case 118:   // F7 function key  ¡STOLEN! by the browser…oh well.  SHIFT+F7 is thesaurus in MS Word, CTRL+F7 in LibreOffice
				userOptions.showThesaurus.checked= !event.shiftKey;
				UniDOM.generateEvent(userOptions.showThesaurus, 'change');
				if (!event.ShiftKey)  {
					MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Thesaurus'));
					if (event.ctrlKey //match color in user-input box using Thesaurus  this key-combo works in FireFox
					&&	MasterColorPicker.RGB_calc(event.target.value))  {
						document.getElementsByName('MasterColorPicker_Thesaurus_color')[0].value=event.target.value;
						}  }
				event.preventDefault();
			break;
			case 191:   // /? key
				if (event.ctrlKey)  txt= event.shiftKey ? '¿' : '÷';
			break;
			case 219:   // [{ key
				if (event.ctrlKey)  txt= event.shiftKey ? '“' : '‘';
			break;
			case 221:   // ]} key
				if (event.ctrlKey)  txt= event.shiftKey ? '”' : '’';
			break;
			case 222:   // '" key
				if (event.ctrlKey)  txt= event.shiftKey ? 'φ' : 'π';
			break;  }
		}  // close findKey
		if (txt)  {
			curPos=event.target.selectionStart;
			event.target.value=event.target.value.substr(0,curPos)+txt+event.target.value.substr(event.target.selectionEnd||curPos);
			event.target.selectionStart=
			event.target.selectionEnd=curPos+1;
			event.preventDefault();  }  };

	function syncLabAndSwatch(event, isTargetInput)  {
			//wait for the keystroke or paste to be entered into the input box,
			//then sync any color in user-input box to ColorSpaceLab and set the Swatch
		if (isTargetInput  ||  event.target.hasAttribute('interfaceTarget'))  setTimeout( function() {
			MasterColorPicker.colorSwatch(event.target);
			var color;
			if ( document.getElementsByName('MasterColorPicker_updateLabOnKeystroke')[0].checked
			&&  (color=MasterColorPicker.RGB_calc(event.target.value)) )
				SoftMoon.WebWare.ColorSpaceLab.setColor({RGB: color}, event);  },
			0 );  };

	MasterColorPicker.enhanceKeybrd=enhanceKeybrd;
	MasterColorPicker.syncLabAndSwatch=syncLabAndSwatch;

	MasterColorPicker.registerTargetElement=function(inp)  {
		UniDOM.addEventHandler(inp, 'onkeydown', enhanceKeybrd);
		//the final value (true) maps to the 2nd argument, “isTargetInput”, in the handler
		UniDOM.addEventHandler(inp, ['onkeyup', 'onpaste', 'onchange'], syncLabAndSwatch, false, true);
		return Object.getPrototypeOf(this).registerTargetElement.call(this, inp);  };

	for (var i=0, inps=document.getElementsByTagName('input');  i<inps.length;  i++)  {
		if (inps[i].getAttribute('type').toLowerCase() === 'mastercolorpicker'
		||  (inps[i].hasAttribute('pickerType') && inps[i].getAttribute('pickerType').toLowerCase() === 'mastercolorpicker'))
			MasterColorPicker.registerTargetElement(inps[i]);  }
	UniDOM.addEventHandler(MasterColorPicker.HTML, 'onKeyDown', enhanceKeybrd);
	UniDOM.addEventHandler(MasterColorPicker.HTML, ['onKeyUp','onPaste','onChange'], syncLabAndSwatch);

	UniDOM.addEventHandler(mainHTML, 'tabIn', function(event)  {
		if (event.target!==this)  return;
		for (var tabTo, i=0;  i<MasterColorPicker.pickers.length;  i++)  {
			if ( MasterColorPicker.picker_select.isChosenPicker(MasterColorPicker.pickers[i])
			&&  (tabTo=UniDOM.getElements(MasterColorPicker.pickers[i], SoftMoon.WebWare.Picker.isTabStop, SoftMoon.WebWare.Picker.goDeep)[0]) )  {
				UniDOM.generateEvent(tabTo, 'tabIn', {bubbles:true, userArgs:{tabbedFrom: event.tabbedFrom}});
				return;  }  }
		setTimeout(function() {MasterColorPicker.dataTarget.focus();}, 0);  });






	//the following section requires that the picker panels’ CSS-position is fixed or absolute,
	// and assumes the default HTML and CSS files:
	// (using default CSS files: panels are in a fixed position, except for MSIE9, they are absolute to support FD-slider)

	//Note these flags are dynamic: you may toggle them on/off with your custom JavaScript depending on the state of your application as you deem necessary.
	if (MasterColorPicker.enablePanelDrag===undefined)  MasterColorPicker.enablePanelDrag=true;
  //StickyPanels allow the user to drag&drop back and forth to/from fixed/absolute positions by holding the shift key (except MSIE 9).
	if (MasterColorPicker.enableStickyPanels===undefined)  MasterColorPicker.enableStickyPanels=true;
	//This is the restraining element for dragging an absolutely positioned panel: it will not drag outside of the bounder.
	//Note that your custom JavaScript may dynamically relocate the div#MasterColorPicker anywhere in your HTML page
	// (as needed to be close to the associated target <input>),
	// and you may then also redefine the bounder dynamically.
	if (MasterColorPicker.dragBounder===undefined)  MasterColorPicker.dragBounder=document.body;
	//the image & src below is also dynamic…
	MasterColorPicker.thumbtackImage=new Image();
	MasterColorPicker.thumbtackImage.src="images/thumbtack.gif";

	for (var i=0, handle, panels=MasterColorPicker.panels;  i<panels.length;  i++)  {
		if (panels[i]===MasterColorPicker.mainPanel)  continue;
		if (panels[i].id==='MasterColorPicker_options')  {
			handle=panels[i].getElementsByTagName('header')[0];             // ↓ ↓ for drag, the first panel must be the largest and contain the other(s) in its margin
			UniDOM.addEventHandler(handle, 'onmousedown', dragPanel, false, [MasterColorPicker.mainPanel, panels[i]]);
			UniDOM.addEventHandler(handle, 'onmouseup', returnPanelsOn3, false, [MasterColorPicker.mainPanel, panels[i]]);  }
		else  {
			handle=panels[i].getElementsByTagName('h2')[0].getElementsByTagName('span')[0];
			UniDOM.addEventHandler(handle, 'onmousedown', dragPanel, false, [panels[i]]);
			UniDOM.addEventHandler(handle, 'onmouseup', returnPanelsOn3, false, [panels[i]]);  }
		UniDOM.addEventHandler(handle, 'oncontextmenu', abortContextMenu);  }
	UniDOM.addEventHandler(document.getElementById("MasterColorPicker_returnPanelsOn3"), 'onmouseup', returnPanelsOn3, false, panels);
	function dragPanel(event, stickyPanels)  {
		event.stopPropagation();
		event.preventDefault();
		if (event.detail>1  ||  !MasterColorPicker.enablePanelDrag)  return;
		var stick=(event.shiftKey || event.button===2) && MasterColorPicker.enableStickyPanels,
				ttcn= (stick ? 'MCP_thumbtack' : ""),
				CSS=getComputedStyle(stickyPanels[0], null),
				mOff= (CSS.position==='fixed') ?
						{x: (document.body.offsetWidth-event.clientX)-parseInt(CSS.right),  y: event.clientY-parseInt(CSS.top)}
					: UniDOM.getMouseOffset(stickyPanels[0], event),
		    dragHandle=event.currentTarget,
				move=UniDOM.addEventHandler(document.body, 'onmousemove', function(event)  {
					var CSS=getComputedStyle(stickyPanels[0], null);
					if (CSS.position==='fixed')
					var b={w: document.body.offsetWidth, h: document.documentElement.clientHeight || window.innerHeight, x: 0, y: 0},
							y=(event.clientY - mOff.y),
							x=((b.w-event.clientX) - mOff.x);
					else
					var b=UniDOM.getElementOffset(stickyPanels[0].offsetParent, MasterColorPicker.dragBounder),
					    b={y: b.y, x: b.x, w: MasterColorPicker.dragBounder.offsetWidth, h: MasterColorPicker.dragBounder.offsetHeight},
					    m=UniDOM.getMouseOffset(stickyPanels[0].offsetParent, event),
							y=m.y - (parseInt(CSS.marginTop) + mOff.y),
							x=(b.w-m.x) - (stickyPanels[0].offsetWidth-mOff.x) + parseInt(CSS.marginRight);
					y= (y<-b.y) ?  (-b.y)  :  ( (y>(m=b.h-(stickyPanels[0].offsetHeight+parseInt(CSS.marginTop)+parseInt(CSS.marginBottom)+b.y))) ? m : y );
					x= (x<-b.x) ?  (-b.x)  :  ( (x>(m=b.w-(stickyPanels[0].offsetWidth+parseInt(CSS.marginLeft)+parseInt(CSS.marginRight)+b.x))) ? m : x );
					for (i=0;  i<stickyPanels.length;  i++)  {
						stickyPanels[i].style.top= y + 'px';
						stickyPanels[i].style.right= x + 'px';  }
					event.stopPropagation();
					event.preventDefault();  }
				, true),
				blockMenu=UniDOM.addEventHandler(document.body, 'oncontextmenu', abortContextMenu, true),
				drop=UniDOM.addEventHandler(document.body, 'onmouseup', function(event)  {
					move.onmousemove.remove();  blockMenu.oncontextmenu.remove();  drop.onmouseup.remove();
					event.stopPropagation();
					event.preventDefault();
				  for (var i=0;  i<stickyPanels.length;  i++)  {UniDOM.remove$Class(stickyPanels[i], ['dragging', ttcn]);}
					UniDOM.remove$Class(document.body, ['MCP_drag', ttcn]);
					if (stick) dragHandle.removeChild(MasterColorPicker.thumbtackImage);
					try {MasterColorPicker.dataTarget.focus();} catch(e) {}  }
				, true);
	  for (var i=0;  i<stickyPanels.length;  i++)  {
		  UniDOM.addClass(stickyPanels[i], ['dragging', ttcn]);
			MasterColorPicker.setTopPanel(stickyPanels[i]);  }
		if (stick)  {
			mOff.x=stickyPanels[0].offsetWidth-mOff.x;
			if (CSS.position==='fixed')  {
				mOff.y= -(parseInt(CSS.marginTop)-mOff.y);
				var currentCN='floating', newCN='scrollable';  }
			else  {
				mOff.y += parseInt(CSS.marginTop);
				var currentCN='scrollable', newCN='floating';  }
		  while (--i>=0)  {UniDOM.swapOut$Class(stickyPanels[i], currentCN, newCN);}
		  dragHandle.appendChild(MasterColorPicker.thumbtackImage);
		  move.onmousemove.wrapper(event);  }
		UniDOM.addClass(document.body, ['MCP_drag', ttcn]);  }
	function returnPanelsOn3(event, stickyPanels)  {
		event.stopPropagation();
		event.preventDefault();
		if (event.detail!==3  ||  event.button!==0)  return;
		MasterColorPicker.returnPanelsHome(stickyPanels);  }
	function abortContextMenu(event) {event.preventDefault();  event.stopPropagation();}
	MasterColorPicker.returnPanelsHome=function(stickyPanels)  {
	  for (var i=0;  i<stickyPanels.length;  i++)  {
			stickyPanels[i].style.top= "";
			stickyPanels[i].style.right= "";
			UniDOM.remove$Class(stickyPanels[i], ['scrollable', 'floating']);  }  }

UniDOM.generateEvent(window, 'mastercolorpicker_ready');

} );  //close window onload

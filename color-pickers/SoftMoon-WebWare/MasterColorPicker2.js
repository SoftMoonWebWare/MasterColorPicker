//  character-encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160

// MasterColorPicker2.js   ~release ~2.6.3~BETA   March 12, 2024   by SoftMoon WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2014, 2015, 2018, 2019, 2020, 2021, 2022, 2023, 2024 Joe Golembieski, SoftMoon WebWare

		This program is licensed under the SoftMoon Humane Use License ONLY to “humane entities” that qualify under the terms of said license.
		For qualified “humane entities”, this program is free software:
		you can use it, redistribute it, and/or modify it
		under the terms of the GNU Affero General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version, with the following additional requirements
		ADDED BY THE ORIGINAL SOFTWARE CREATOR AND LICENSOR that supersede any possible GNU license definitions:
		This original copyright and licensing information and requirements must remain intact at the top of the source-code.
		The phrase “MasterColorPicker™ by SoftMoon-WebWare” must be visually presented to the end-user
			in a commonly readable font at 8pt or greater when this software is actively in use
			and when this software is integrated into any:
			• publicly available display (for example, an internet web-page),
			• software package (for example, another open-source project, whether free or distributed for-profit),
			• internally used software packages and/or displays within a business establishment’s operational framework
				(for examples, an intranet system, or a proprietary software package used exclusively by employees).

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU Affero General Public License for more details.

		You should have received a copy of:
		 • the SoftMoon Humane Use License
		and
		 • the GNU Affero General Public License
		along with this program.  If not, see:
			https://softmoon-webware.com/humane-use-license/
			https://www.gnu.org/licenses/#AGPL
		 */



// requires  “+++.js”  → → → →  JS_toolucket/+++JS/+++.js
// requires  “+++Math.js”  → → → →  JS_toolucket/+++JS/+++Math.js/
// requires  “+++input_type.js”  → → → →  JS_toolucket/+++JS/+++input_type.js/
// requires  SoftMoon.WebWare.RGB_Calc   → → → →  JS_toolbucket/SoftMoon-WebWare/RGB_Calc.js
// requires  SoftMoon-WebWare’s UniDOM-2022 package   → → → →  JS_toolbucket/SoftMoon-WebWare/UniDOM-2022.js
// requires  SoftMoon.WebWare.Picker   → → → →   JS_toolbucket/SoftMoon-WebWare/Picker.js
// requires  SoftMoon.WebWare.FormFieldGenie   → → → →  JS_toolbucket/SoftMoon-WebWare/FormFieldGenie.js  → → → →  for MyPalette and ColorFilter and Gradientor
// requires  SoftMoon.WebWare.HTTP   → → → →  JS_toolbucket/SoftMoon-WebWare/HTTP.js  → → → →  for Palette load/save on a server - not with  file://  protocol use
// subject to move to unique files (with more functions and features) in the future:
//  • SoftMoon.WebWare.canvas_graphics → → → → will likely be:  +++Canvas.js


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
//                                                                              centerpoint ↓    ↓ height,width before rotation
SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon=function(context, atVertex, vCount, x,y, h,w, rotate=0)  {
	var i, pX, pY, angle;  //           pass in function− typically “lineTo” ↑    # of ↑ vertexes       ↑ radian value ¡not degrees!
	const vertexes=[];
	if (typeof rotate !== 'number')  rotate=0;
	if (rotate+=_['90°'])  {pX=Math.cos(rotate)*w+x;  pY=y-Math.sin(rotate)*h;}  // place odd-point at top
	else {pX=x+w;  pY=y;}
	context.moveTo(pX, pY);            angle=rotate;
	for (i=1;  vertexes.push([pX, pY, angle]), i<vCount;  i++)  {
		angle=(π2/vCount)*i+rotate;
		pX=x+Math.cos(angle)*w;
		pY=y-Math.sin(angle)*h;
		atVertex(pX, pY);  }
	atVertex(vertexes[0][0], vertexes[0][1]);
//	for (i=0; i<vCount; i++)  {out+=vertexes[i][0]+'     '+vertexes[i][1]+'\n';}  alert(out);
	return vertexes;  };


/* this state is expected upon entry for use with undefined colorFilter:
		RGB_Calc.config.RGBA_Factory === Array
		RGB_Calc.config.useHexSymbol === true
 */
//SoftMoon.WebWare.canvas_graphics.rainbowRing=function(canvas, centerX, centerY, outRad, inRad, colorFilter)  {
CanvasRenderingContext2D.prototype.rainbowRing=function(centerX, centerY, outRad, inRad, colorFilter)  {
	var j, x, y, ym, yq, a;
	const ors=outRad*outRad, irs=inRad*inRad++, RGB_Calc=SoftMoon.WebWare.RGB_Calc;
	if (typeof colorFilter !== 'function')  colorFilter=RGB_Calc.to.hex.bind(RGB_Calc.to);
	for (x=-(outRad++); x<outRad; x++)  {
		for (y=Math.round(Math.sqrt(ors-x*x)),  ym=(Math.abs(x)<inRad) ? Math.round(Math.sqrt(irs-x*x)) : 0;  y>=ym;  y--)  {
			for (j=-1; j<2; j+=2)  { yq=y*j;  a=Math.Trig.getAngle(x,yq);
				this.fillStyle=colorFilter(RGB_Calc.from.hue(a / π2), a);
				this.beginPath();
				this.fillRect(centerX+x, centerY-yq, 1,1);  }  }  }  };


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

/* it would help if MDN docs actually documented the complete behavior of drawImage() regarding canvas.context.imageSmoothingEnabled
// drawImage() creates a “smooth” bitmap when the scale>1  (¡by DEFAULT! ↑↑↑)
// copyPixels creates a “rough” bitmap when the scale>1
SoftMoon.WebWare.canvas_graphics.copyPixels=function copyPixels(src, dst, sx, sy, sw, sh, dx, dy, dw, dh)  {
	var img, x,y,b,scalerX,scalerY;
	if (src.tagname!=='CANVAS')  {
		img=src;
		src=document.createElement('canvas');
		src.width=img.naturalWidth;  src.height=img.naturalHeight;  }
	src.context??=src.getContext('2d');  dst.context??=dst.getContext('2d');
	if (img)  src.context.drawImage(img,0,0);
	const
		sPix=src.context.getImageData(sx,sy,sw,sh).data,
		dIDO=dst.context.createImageData(dw,dh),
		dPix=dIDO.data,
		xScale=dw/sw,
		yScale=dh/sh;
	// ↓↑ note the destination should be => the source and the “scale” should be a positive integer; however if scale=1, drawImage is faster!
	for (y=0; y<sh; y++)  { for (scalerY=0; scalerY<yScale; scalerY++) {
		for (x=0; x<sw; x++)  { for (scalerX=0; scalerX<xScale; scalerX++)  {
			for (b=0; b<4; b++)  {
				dPix[((y*yScale+scalerY)*dw + x*xScale+scalerX)*4 + b]  =  sPix[(y*sw + x)*4 + b];  }  }  }  }  }
	dst.context.putImageData(dIDO,dx,dy);
	return dIDO;  }
*/


/*==================================================================*/
/*==================================================================*/
window.addEventListener('load', function settings_restorer()  {
	const err=localStorage.getItem('restoreError');
	localStorage.setItem('restoreError', "");
	if (err)  console.error('Error saving MasterColorPicker settings last time: ',err);
	const allSettings=UniDOM.getElementsBy$Name(document.getElementById('MasterColorPicker'), "", true, undefined, true);
	try {
		const storage=localStorage.getItem('MasterColorPicker_settingsValues');
		if (storage)  {
			const allValues=JSON.parse(storage);
			console.log('Restoring MasterColorPicker settings…');
			SoftMoon.MasterColorPicker_restored_interface_values=allValues;
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
		else  console.log('No MasterColorPicker settings found to restore.');  }
	catch(e) {console.error("Error restoring MasterColorPicker settings upon startup: ",e);}
	window.addEventListener('unload', function settings_unloader()  {  // pagehide  visualstatechange
		try  { if (document.getElementsByName('MasterColorPicker_preserveSettings')[0].checked)  {
			const allValues={};
			for (const p in allSettings)  {
				if (!(allSettings[p] instanceof Element)
				||  allSettings[p].type==='file'
				||  allSettings[p].type==='button'
				||  ( /\[\d+\]/ ).test(p)
				||  p.startsWith('MasterColorPicker_Gradientor')
				||  p.startsWith('MasterColorPicker_PaletteMngr')
				||  (p.startsWith('MasterColorPicker_MyPalette')  &&  !allSettings[p].closest('.options')))  continue;
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
			localStorage.setItem('MasterColorPicker_settingsValues', JSON.stringify(allValues));  }
		else
			localStorage.setItem('MasterColorPicker_settingsValues', "");  }
		catch(e) {localStorage.setItem('restoreError', e.toString());}  });  });
/*==================================================================*/
/*==================================================================*/





//  the Color_Picker class is an extension of and interface between
//   the MasterColorPicker implementation of the Picker Class Object and the individual color-picker Classes.
//  see also the end of this file
//  an Color_Picker implementation is expected to have (besides the prototype-inherited methods/properties):
//    a  getColor(event)  method  :called by the .prototype.onmouse… and .onclick methods - see their comments
//    a  swatch    :pointer to the swatch HTML for mouse events
//    a  txtInd    :pointer to the HTML text indicator on the color-picker for mouse events


{  // open private namespace of Color_Picker

let userOptions;

/*  Note the following sub-section (the window onload function, with support from UniDOM) is designed to accommodate
	different “options panel” setups.  The palette_select may be a select, radio buttons, or checkboxes.
	A multiple-select or group of checkboxes, either of which allow multiple pickers to be displayed at once,
	preclude the need to “apply to all” on the options panel.  Therefore, if you want to allow multiple pickers,
	remove the “apply to all” option from the HTML options panel.
	You may also remove it if you simply want to force all pickers to conform to the
	currently displayed settings, as opposed to the settings automatically changing as a different picker is selected.
 */
	UniDOM.addEventHandler(window, "onLoad", function Color_Picker_onload() {

		//first we set the private global members:  grab all the elements with a 'name' attribute (the <input>s) into an array, with corresponding properties
		userOptions=UniDOM.getElementsBy$Class(document.getElementById("MasterColorPicker_options"), 'pickerOptions').getElementsBy$Name("", true,
			n => n.name.match( /^(?:MasterColorPicker_)?(.+)(?:\[\])?$/ )[1]);  // ←←this defines property names (of the array-object: userOptions) ↑ ↑
		userOptions.palette_select=UniDOM(document.getElementById('MasterColorPicker_palette_select'));

  	Color_Picker.registeredPickers.setOptions();

		if (userOptions.applyToAll)
			UniDOM.addEventHandler(userOptions.applyToAll, 'onchange', function()  {
				// ↓ ↓ ↓ ¡we can not do this if the palette_select allows multiple palettes at once!
				if (!this.checked)  Color_Picker.registeredPickers[userOptions.palette_select.getSelected().value].setOptions();  });
		else  userOptions.applyToAll={checked: true};

		UniDOM.addEventHandler(userOptions.showLocator, 'onchange', function()  {
			if (!userOptions.applyToAll.checked)
      	Color_Picker.registeredPickers[userOptions.palette_select.getSelected().value].doIndexLocator=this.checked;
			UniDOM.disable(document.getElementById('MasterColorPicker_locatorStyle'), !this.checked);
			UniDOM.disable(document.getElementById('MasterColorPicker_locatorColor'), !this.checked);
			UniDOM.disable(document.getElementById('MasterColorPicker_interlink'), !this.checked);  });

		UniDOM.addEventHandler([userOptions.doInterlink, userOptions.keepPrecision], 'onchange', function()  {
			if (!userOptions.applyToAll.checked)
      	Color_Picker.registeredPickers[userOptions.palette_select.getSelected().value][getName(this)]=this.checked;  });

		UniDOM.addEventHandler([userOptions.outputMode, userOptions.locatorStyle, userOptions.locatorColor], 'onchange', function()  {
			//note that, “technically,” changing one radio button (selecting it) should change another (it automatically deselects)
			//however, by specs only the newly selected one fires an onchange event, simplifying and streamlining this function
			if (!userOptions.applyToAll.checked)
      	Color_Picker.registeredPickers[userOptions.palette_select.getSelected().value][getName(this)]=this.value;  });

//		UniDOM.addEventHandler(userOptions.palette_select, 'onchange', function()  {
		UniDOM.addEventHandler(userOptions.palette_select.element, 'onchange', function()  {
			const p=userOptions.palette_select.getSelected();
			if (!(p instanceof Array))
				Color_Picker.registeredPickers[p.firstChild.data].putOptions();  });

  });  //close  window onload




SoftMoon.WebWare.Color_Picker=Color_Picker;
function Color_Picker(name)  { // name should match the name given in the HTML  palette_select  (may include spaces)
	if (!new.target)  throw new Error('Color_Picker is a constructor, not a function.');
	this.name=name;
	this.id=Color_Picker.registeredPickers.length;
	Color_Picker.registeredPickers.push(this);
	Color_Picker.registeredPickers[name]=this;  }


Color_Picker.registeredPickers=new Array;
Color_Picker.registeredPickers.setOptions=function() {for (const picker of this)  {picker.setOptions();}}

/*read the HTML “options” and return the appropriate values for this ColorPicker’s options accordingly*/
Color_Picker.prototype.getOptions=function()  {
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
Color_Picker.prototype.setOptions=function()  {
	this.outputMode=userOptions.outputMode.value;
	this.keepPrecision=userOptions.keepPrecision.checked;
	this.doInterlink= (this.canIndexLocator && this.canInterlink) ?  userOptions.doInterlink.checked : false;
	this.doIndexLocator= this.canIndexLocator ?  userOptions.showLocator.checked : false;
	this.locatorStyle= this.canIndexLocator ?  userOptions.locatorStyle.getSelected().value : null;
	this.locatorColor= this.canIndexLocator ?  userOptions.locatorColor.getSelected().value : null;  };

/*set the HTML “options” according to this ColorPicker’s options*/
Color_Picker.prototype.putOptions=function()  {
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

Color_Picker.prototype.noClrTxt="";       //depends on each color-picker’s HTML requirements.  Often a “hard space” (String.fromCharCode(160))
Color_Picker.prototype.outputMode='hex';  //  ‖ 'RGB' ‖ 'HSV' ‖ 'HSB' ‖ 'HSL' ‖'HWB' ‖ 'HCG' ‖ 'CMYK' ‖ 'native'
Color_Picker.prototype.keepPrecision=true;
Color_Picker.prototype.canInterlink=true;
Color_Picker.prototype.doInterlink=true;
Color_Picker.prototype.canIndexLocator=true;
Color_Picker.prototype.doIndexLocator=true;
Color_Picker.prototype.locatorStyle='o';   //  'x' ‖ 'o' ‖ 'O'
Color_Picker.prototype.locatorColor='transforming';  // ‖ 'spinning' ‖ 'b/w'


Color_Picker.prototype.onmouseover=function(event)  {
	const colorSpecCache=this.getColor.apply(this, arguments);
	if (colorSpecCache)
		this.txtInd.firstChild.data = MasterColorPicker.applyFilters(colorSpecCache, event, this.name);
	else
		this.txtInd.firstChild.data = this.noClrTxt;
	this.swatch.style.backgroundColor=colorSpecCache ? colorSpecCache.RGB.hex : "";
	this.swatch.style.color=colorSpecCache ? colorSpecCache.RGB.contrast : "";
	return colorSpecCache;  }

Color_Picker.prototype.onmousemove=Color_Picker.prototype.onmouseover;

Color_Picker.prototype.onmouseout=function()  {
	this.txtInd.firstChild.data=this.noClrTxt;
	this.swatch.style.backgroundColor="";
	this.swatch.style.color="";  }


Color_Picker.prototype.onclick=function(event)  {
	//if (event.type==='contextmenu')  event.preventDefault();
	const colorSpecCache=this.getColor.apply(this, arguments);
  if (colorSpecCache && colorSpecCache.RGB)  MasterColorPicker.pick(colorSpecCache, event, this.name);  }


// =================================================================================================== \\

// below are the sub-methods (MasterColorPicker.pickFilter) for
//  the MasterColorPicker implementation of the Picker’s “pick()” method. (see the end of this file)
// these become methods of the MasterColorPicker implementation, so “this” refers to  MasterColorPicker

// =================================================================================================== \\

const RGB_calc=new SoftMoon.WebWare.RGB_Calc({
	defaultAlpha: undefined,
	RGBA_Factory: SoftMoon.WebWare.RGBA_Color,
	HSLA_Factory: SoftMoon.WebWare.HSLA_Color,
	HSBA_Factory: SoftMoon.WebWare.HSBA_Color,
	HSVA_Factory: SoftMoon.WebWare.HSVA_Color,
	HCGA_Factory: SoftMoon.WebWare.HCGA_Color,
	HWBA_Factory: SoftMoon.WebWare.HWBA_Color,
	CMYKA_Factory: SoftMoon.WebWare.CMYKA_Color,
	OKLabA_Factory: SoftMoon.WebWare.OKLabA_Color,
	OKLChA_Factory: SoftMoon.WebWare.OKLChA_Color,
	LabA_Factory: SoftMoon.WebWare.LabA_Color,
	LChA_Factory: SoftMoon.WebWare.LChA_Color,
	XYZA_Factory: SoftMoon.WebWare.XYZA_Color }, true);

Color_Picker.pickFilter=function(colorSpecCache)  {
	if (this.colorSwatch)  //we must wait until after the input.value is set  ← input.value = thisInstance.interfaceTarget || thisInstance.dataTarget
		setTimeout(() => {this.colorSwatch();}, 0);
	if (typeof colorSpecCache === 'string')  return colorSpecCache;
	var chosen;
	const mode=userOptions.outputMode.value,
			format={
		stringFormat: {value:this.outputFormat},
		hueAngleUnit: {value:this.hueAngleUnit},
		useAngleUnitSymbol: {value:null}  };
	if (colorSpecCache[mode]  &&  colorSpecCache[mode].config)  colorSpecCache[mode].config.stack(format);
	switch (mode)  {
		case 'HEX':  colorSpecCache.RGB.config.useHexSymbol=this.useHexSymbol;
								 chosen=colorSpecCache.RGB.hex;
			break;
		case 'RGB':  chosen=colorSpecCache.RGB.toString();
			break;
		case 'HSB':
		case 'HSV':
		case 'HSL':
		case 'HWB':
		case 'HCG':
		case 'CMYK':
		case 'LCh':
		case 'Lab':
		case 'OKLCh':
		case 'OKLab':
		case 'XYZ':  //these are always wrapped
			try {
				if (!colorSpecCache[mode])  (colorSpecCache[mode]=RGB_calc.to[mode.toLowerCase()](colorSpecCache.RGB.rgba)).config.stack(format);
				chosen=colorSpecCache[mode].toString();
				break;  }
			catch(e) {console.error('MCP pickFilter bummer!  mode='+mode+' error!: ',e);}
		case 'NATIVE':
		default:
			if (colorSpecCache[colorSpecCache.model].config)  colorSpecCache[colorSpecCache.model].config.stack(format);
			chosen=colorSpecCache[colorSpecCache.model].toString();  }
	colorSpecCache.text_output=chosen;
	return colorSpecCache;  }




Color_Picker.toSystemClipboard=function(colorSpecCache, event)  {
	if (event.type==='click'  &&  MasterColorPicker.copyToClipboard)  {
		try {navigator.clipboard.writeText(colorSpecCache.text_output);}
		catch(e) {
			var inp=this.currentTarget;
			inp.value=colorSpecCache.text_output;  inp.select();
			document.execCommand("copy");
			inp.setSelectionRange(inp.value.length, inp.value.length);  }  }
	return colorSpecCache;  }


// We need a function that returns the text for the Picker’s  pickFilter
Color_Picker.color_to_text=function(colorSpecCache)  {return colorSpecCache.text_output;}


Color_Picker.Color_SpecCache=function(color, model='text', RGB)  {
	if (!new.target)  throw new Error('“Color_SpecCache” is a constructor, not a function.');
	if (!RGB)  switch (model)  {
		case "text": RGB=MasterColorPicker.RGB_calc(color);
			break;
		default: RGB=RGB_calc.from[model.toLowerCase()](color instanceof Array ? color : color[model.toLowerCase()+'a']);  }
  if (!RGB)  return false;
	this.RGB=RGB;
	this.model=model;
	if (model!=='RGB')  this[model]=color;  }
Color_Picker.Color_SpecCache.prototype.name="SoftMoon.WebWare.Color_Picker.Color_SpecCache";


let filterOptions;


Color_Picker.ColorFilter=ColorFilter;
function ColorFilter(colorSpecCache)  {
	const
		HTML=document.getElementById('MasterColorPicker_Filter'),
		rgb_calc=MasterColorPicker.RGB_calc;
	if ( typeof colorSpecCache == 'string'
	||  !userOptions.showMixer.checked
	||  document.querySelector("#MasterColorPicker_Mixer input[name*='mixerMode']:checked").value!=='filter'
	||  (MasterColorPicker.interfaceTarget  &&  UniDOM.hasAncestor(MasterColorPicker.interfaceTarget, HTML)) )
		return colorSpecCache;
	var i, f, filter, isFiltered=false;
	const
		colors=UniDOM.getElementsBy$Name(HTML, /color/ ),
		factors=UniDOM.getElementsBy$Name(HTML, /factor/ );

	rgb_calc.config.stack({RGBA_Factory: {value:Array}});
	try {
		if (filterOptions.average.value==='average')  {
			var count=0, fs=0;
			const sum=[0,0,0,0];
			for (i=0;  i<colors.length;  i++)  {
				if (colors[i].value  &&  (filter=rgb_calc(colors[i].value)))  {
					sum[0]+=filter[0];  sum[1]+=filter[1];  sum[2]+=filter[2];  sum[3]+=filter[3];
					f= parseFloat(factors[i].value||0);
					if (factors[i].value  &&  factors[i].value.includes('%'))   f/=100;
					fs+=f;
					count++;  }  }
			if (count)  { isFiltered=true;
				sum[0]/=count;  sum[1]/=count;  sum[2]/=count;  sum[3]/=count;  fs/=count;
				ColorFilter.applyFilter(colorSpecCache.RGB.rgb, sum, fs, filterOptions.applyToAverage);  }  }

		else  {
			const applies=UniDOM.getElementsBy$Name(HTML, /apply\[/ );
			for (i=0;  i<colors.length;  i++)  {
				if (colors[i].value  &&  (filter=rgb_calc(colors[i].value)))  { isFiltered=true;
					f= parseFloat(factors[i].value||0);
					if (factors[i].value  &&  factors[i].value.includes('%'))   f/=100;
					ColorFilter.applyFilter(colorSpecCache.RGB.rgb, filter, f, applies[i]);  }  }  }

		if (isFiltered)  {
			if (colorSpecCache.model.toLowerCase() !== 'rgb')  {
				if (colorSpecCache.model==='text')  colorSpecCache.model='RGB';
				else  colorSpecCache[colorSpecCache.model]=RGB_calc.to[colorSpecCache.model.toLowerCase()](colorSpecCache.RGB.rgba);  }  }  }
	finally {rgb_calc.config.cull();}
	return colorSpecCache;  }

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


UniDOM.addEventHandler(window, 'onload', function()  {
	const
		Filter=UniDOM(document.getElementById('MasterColorPicker_Filter')),
		tBody=Filter.getElementsByTagName('tbody')[0],
		Genie=
	ColorFilter.Genie=new SoftMoon.WebWare.FormFieldGenie(
		{ maxGroups:7,
			climbTiers:false,
			groupClass: 'filterColor',
			doFocus:false,  //at this time (Feb2020) giving focus to the newly cloned field via the Genie will cause the Picker to disapear, as focus is lost in the current field before giving focus to the new element
			cloneCustomizer:function(tr)  { var s=tr.getElementsByTagName('span')[0]; s.style.backgroundColor=""; s.style.color="";
				UniDOM.getElementsBy$Name(tr).remove$Class([MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceControl]);  },
			batchCustomizer:function()  { Filter.getElementsBy$Name( /apply\[/ ).map( function(e, i, a)  {
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
		if (!Genie.tabbedOut  &&  event.target.name.includes('color'))  Genie.popNewGroup(event.target.closest('tr'));  });  });



// =================================================================================================== \\

// this is here for your convenience in hacking.  Changing it will not affect normal operation.
Color_Picker.tabbedOut=tabbedOut;

// This supersedes the Picker’s InterfaceControl → keydown handler.
// Getting the FormFieldGenie and the Picker to work together is like choreographing a dance where one is doing the Waltz and the other the Lindy.
// The first two (2) arguments and the value of “this” are bound by/to the Genies.
// The “event” Object argument is passed by UniDOM.
function tabbedOut(GENIE_FIELDS, DOM_CRAWL_STOP, event)  {
	if (!( GENIE_FIELDS.test(event.target.name)
			&&  (this.tabbedOut=(
				event.key==='Tab' || MasterColorPicker.panelTabKey.sniff(event) || MasterColorPicker.panelBacktabKey.sniff(event))) ))
		return;
	function isTabStop(e)  {
		const isI=(SoftMoon.WebWare.Picker.isInput(e)  &&  !e.disabled);
		if (isI  &&  DOM_CRAWL_STOP.test(e.name))  goDeep.doContinue=false;
		return isI;  }
	function goDeep(e) {return !e.disabled;}
	const tabToTarget=(!event.shiftKey  &&  !event.ctrlKey  &&  event.target.getAttribute('tabToTarget')==='true');
	var old, e, i=0;
	if (!tabToTarget  &&  !event.ctrlKey)  old=UniDOM.getElders(event.target, isTabStop, goDeep);
	this.popNewGroup(this.config.groupClass ? UniDOM.getAncestorBy$Class(event.target, this.config.groupClass) : event.target);
	if (event.ctrlKey)  return;  //the Picker will catch it on the bubble-up to the MyPalette picker-panel
	if (tabToTarget)  {
		MasterColorPicker.dataTarget?.focus();
		event.preventDefault();   // stop the browser from controlling the tab
		event.stopPropagation();  // stop the Picker from controlling the tab
		return;  }
	if (event.shiftKey)  //backtab
		try{
		do {e=old[i++]}  while (!e.isConnected);
		}catch(e){event.preventDefault();  event.stopPropagation();  return;}
	else  {//forward tab
		if (!(e=event.target).isConnected)  do {e=old[i++]}  while (!e.isConnected);
		SoftMoon.WebWare.Picker.goDeep.className=MasterColorPicker.classNames.picker;
		SoftMoon.WebWare.Picker.goDeep.picker_select=MasterColorPicker.picker_select;
		e=UniDOM.getJuniors(e, SoftMoon.WebWare.Picker.isTabStop, SoftMoon.WebWare.Picker.goDeep)[0];  }
	UniDOM.generateEvent(e, 'tabIn', {bubbles:true}, {relatedTarget: event.target, tabbedFrom: event.target});
	event.preventDefault();
	event.stopPropagation();
	return;  }

// =================================================================================================== \\

function idGen(e)  {if (!e.id)  e.id='SoftMoon.'+Date.now();  return e;}
Color_Picker.idGen=idGen;

Color_Picker.MyPalette=MyPalette;
function MyPalette(HTML, PNAME)  {
	if (!new.target) throw new Error("“MyPalette” is a constructor, not a method or function.");
	const thisPalette=this;
	//this.palette=new Array;
	this.HTML=HTML;
	this.table=HTML.getElementsByTagName('table')[0];
	this.tbodys=this.table.getElementsByTagName('tbody');
	this.trs=this.table.getElementsByTagName('tr');
	this.addToMyPalette=HTML.querySelector('select[name*="addToMyPalette"]');  //UniDOM.getElementsBy$Name(HTML, /addToMyPalette/ , 1)[0];
	this.MetaGenie=new SoftMoon.WebWare.FormFieldGenie({
		maxGroups: 10,
		doFocus: false,
		grouptTag: 'TEXTAREA',
		cloneCustomizer:function(ta)  {
			UniDOM.remove$Class(ta, [MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceControl]);  },
		dumpEmpties:true  });
	this.MetaGenie.catchTab=tabbedOut.bind(this.MetaGenie, /header|footer/ ,  /_name/ );
	this.MetaGenie.isActiveField=UniDOM.alwaysTrue;
	this.ColorGenie=new SoftMoon.WebWare.FormFieldGenie({
		groupClass:"MyColor",
		maxGroups:420,
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
			if (thisPalette.options.autoUncheck1.checked)  tr.querySelector('input[type="checkbox"]').checked=false;
			UniDOM.getElementsBy$Name(tr).remove$Class([MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceControl]);  },
		batchCustomizer:function(tb) {UniDOM.getElementsBy$Name(tb, /\[name\]/ ).map(function(e, i, a)  {
			e.setAttribute("tabToTarget", (i<a.length-1  ||  tb!==tb.parentNode.lastElementChild) ? "false" : "true")});}  });
	this.ColorGenie.catchTab=tabbedOut.bind(this.ColorGenie, /\d\]\[(?:definition|name)/ , /addToHere/ );
	this.ColorGenie.isActiveField=UniDOM.alwaysTrue;
	this.ColorGenie.bind_clipMenu(HTML.getElementsByClassName('MyPalette_ColorGenieMenu')[0]);
	UniDOM.addEventHandler(this.ColorGenie.HTML_clipMenu, new String('popUp'), function(event)  {
	/* we do this because the menu may appear low on the panel, which has CSS overflow:auto,
	* so the menu can not then be properly rendered - it should overflow the boundaries of the panel if necessary.
	* However, if the panel is "pinned" to the page (it scrolls with the page)
	* the user may scroll the panel away from the pop-up menu, which is a delema without a good known solution
	* (block the page scroll while the menu is shown?)
	* At this time, the CSS file positions the menu absolutely. */
		thisPalette.ColorGenie.config.stack({doFocus: true});
		const xyPos= event.container.getBoundingClientRect();
		this.style.position= 'fixed';
		this.style.top= xyPos.y+'px';
		this.style.left=xyPos.x+'px';  });
	UniDOM.addEventHandler(this.ColorGenie.HTML_clipMenu, new String('popDown'), function(event)  {
		if (event.detail.opStatus==='removed')  thisPalette.ColorGenie.config.cull();
		switch (event.detail.type)  {
		case 'keydown':
			event.detail.stopPropagation();
			if (document.activeElement!==MasterColorPicker.currentInterface)
				MasterColorPicker.currentInterface?.focus();
		break;
		case 'focusout':
			event.detail.stopPropagation();
			thisPalette.ColorGenie.config.cull();  }  });
	this.SubPaletteGenie=new SoftMoon.WebWare.FormFieldGenie({
		indxTier:0,
		groupTag:"TBODY",
		maxGroups:420,
		doFocus:false,
		dumpEmpties:function(tbody, deleteFlag) {return deleteFlag||false;},
		cloneCustomizer:function(tbody)  {
			idGen(tbody);
			if (thisPalette.options.autoSelect)  tbody.querySelector("[name$='addToHere']").checked=true;  },
		batchCustomizer:function(tbl)  {
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
	UniDOM.addEventHandler(optionsHTML, ['tabIn', 'focusOut'], function(event) {
		const flag= event.type==='tabin'  ||  event.relatedTarget?.closest('fieldset.options')===this;
		UniDOM.useClass(this.parentNode, 'focus-within-options', flag);
		UniDOM.useClass(this, 'focus-within', flag);  });
	this.options=UniDOM.getElementsBy$Name(optionsHTML, "", true, function(e){return e.name.match( /_([^_]+)$/ )[1];});
	UniDOM.addEventHandler(this.options.showColorblind, 'onchange', showColorBlind);
	function showColorBlind()  {
		UniDOM.useClass(thisPalette.table, "showColorblind", thisPalette.options.showColorblind.checked);
		const panel=thisPalette.table.offsetParent;
		if (panel)  {
			const slide=setInterval(function()  {
				// this supports the default CSS file, and the panel-dragger code within this file
				const CSS=getComputedStyle(panel, null);
				if (parseInt(CSS.left)<0)  panel.style.right= (parseInt(CSS.right)-1) + 'px';
				else clearInterval(slide);  }
			, 1);  }  }

	showColorBlind();

	UniDOM.addEventHandler(this.options.autoClearClip, 'onchange', alignAutoClearClip);
	function alignAutoClearClip() {thisPalette.ColorGenie.config.clear_clips_whenRetrieved=this.checked;}

	alignAutoClearClip.call(this.options.autoClearClip);

	UniDOM.addEventHandler(this.options.keepEditorsSticky, 'onchange', keepEditorsSticky);
	function keepEditorsSticky() {this.closest('.pickerPanel').querySelector('fieldset.editors').classList[this.checked ? 'add' : 'remove']('sticky');}

	keepEditorsSticky.call(this.options.keepEditorsSticky);

	const
		porterFlag=UniDOM.getElementsBy$Name(HTML, /_port\]?$/ , 1)[0],  //the button that opens/closes the port dialog
		portHTML=HTML.querySelector(".portDialog"),
		paletteMetaHTML=portHTML.querySelector(".paletteMeta");

	/* The MyPalette interface is designed to NOT have hardcoded “id” attributes in the HTML,
	 * as it is meant to be cloned to allow multiple “MyPalette” interfaces (someday in the “pro” version).
	 * But to be ARIA compliant (silly as it may seem, but for folks who can’t read, not folks who can’t see where picking a color means nothing anyway!)
	 * we need ids.  So here we create unique ids for the elements that need them:
	 */
	portHTML.id=portHTML.id+"&"+Date.now();
	porterFlag.setAttribute('aria-controls', portHTML.id);

	UniDOM(HTML).getElementsBy$Name( /_makeSub/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function() {thisPalette.makeSub();});
	UniDOM(HTML).getElementsBy$Name( /_copy/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function() {thisPalette.onCopy();});
	UniDOM(HTML).getElementsBy$Name( /_cut/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function() {thisPalette.onCut();});
	UniDOM(HTML).getElementsBy$Name( /_delete/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function() {thisPalette.onDelete();});
	UniDOM(HTML).getElementsBy$Name( /_clearClips/ , 1)[0].addEventHandler(['onclick', 'buttonpress'], function()  {
		if (event.detail===3)  thisPalette.ColorGenie.clearClipboard(true);  });
	UniDOM(HTML).getElementsBy$Name( /_copy/ , 1).addEventHandler(['mousedown', 'mouseup'], function(e)  {
		this.classList[e.type==='mousedown' ? 'add' : 'remove']('pressed')});
	UniDOM(HTML).getElementsBy$Name( /_clearClips/ , 1).addEventHandler(['mousedown', 'mouseup'], function(e)  {
		this.classList[e.type==='mousedown' ? 'add' : 'remove'](e.detail<3 ? 'pressed' : 'activated');  });
	UniDOM.addEventHandler(porterFlag, ['onclick', 'buttonpress'], function()  {
		porterFlag.setAttribute('aria-pressed', portHTML.disabled ? 'true' : 'false');
		porterFlag.setAttribute('aria-expanded', portHTML.disabled ? 'true' : 'false');
		portHTML.disabled= !portHTML.disabled;  });
	//↓the “load”/“save” button (only active after the proper required options are selected in the port dialog)
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
		if (!( /_port\]?$/ ).test(event.target.name))  return;
		UniDOM.remove$Class(portHTML, activeClasses[1]);
		UniDOM.addClass(portHTML, event.target.value);
		UniDOM.disable(_import.parentNode, event.target.value!=='local' ||  UniDOM.has$Class(portHTML, 'export'));
		UniDOM.disable(_replace.parentNode, (event.target.value!=='browser' && event.target.value!=='server') );
		UniDOM.disable(_autoload.parentNode, (event.target.value!=='browser' && event.target.value!=='server')
																			|| (event.target.value==='server'  &&  (!(ft=UniDOM.getSelected(_filetype))  ||  ft.value!=='json')) );
		UniDOM.disable(_filetype, event.target.value!=='server'  &&  event.target.value!=='local');
		UniDOM.disable(_filetype.querySelector("input[value='js']").parentNode, event.target.value!=='local');
		});

	UniDOM.addEventHandler(_import, 'onchange', function()  {
		MasterColorPicker.setActivePickerState(true);
		_import.focus();  });

	UniDOM.addEventHandler(_filetype, 'onchange', function(event)  {
		UniDOM.disable(_autoload.parentNode, event.target.value!=='json' );  });

	UniDOM.addEventHandler(portHTML.querySelectorAll("note[referto]"), 'click', function findHelp(event)  {
		MasterColorPicker.userOptions.showHelp.checked=true;
		UniDOM.generateEvent(MasterColorPicker.userOptions.showHelp, 'change');
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
		&&  !thisPalette.MetaGenie.tabbedOut)  thisPalette.MetaGenie.popNewGroup(event.target);  });

	const                                  //   shift  ctrl  alt    meta   altGraph   altOS
		newPaletteKey=new UniDOM.KeySniffer('F2', false, true, false, false, undefined, false),
		tabUpKey=new UniDOM.KeySniffer('ArrowUp', false, false, false, false, undefined, false),
		tabDownKey=new UniDOM.KeySniffer('ArrowDown', false, false, false, false, undefined, false),
		altTabUpKey=new UniDOM.KeySniffer('ArrowUp', false, false, true, false, undefined, false),
		altTabDownKey=new UniDOM.KeySniffer('ArrowDown', false, false, true, false, undefined, false);

	UniDOM.addEventHandler(this.table, 'onKeyDown', function(event)  {
		var inpName, inp, neighbor, count=0;
		const goDeep=UniDOM.alwaysTrue;
		function getTabStop(e)  {
			const isit=(e.name && e.name.includes(inpName[0]));
			if (isit  ||  e.nodeName==="TABLE") goDeep.doContinue=false;
			return isit;  }
		function getNeighbor(e)  {
			const isit= e.classList.contains("MyColor")  &&  (event.key==='ArrorUp'  ||  ++count>1);
			if (isit  ||  e.nodeName==="TABLE") goDeep.doContinue=false;
			return isit;  }
		if (newPaletteKey.sniff(event))  {
			event.stopPropagation();
			event.preventDefault();
			inp=thisPalette.makeSub().querySelector("input[name$='[Name]']");
			UniDOM.generateEvent(inp, 'tabIn', {bubbles:true}, {relatedTarget: event.target, tabbedFrom: event.target});  }
		else
		if ( (tabUpKey.sniff(event)  ||  tabDownKey.sniff(event))  //verticle tab ↑ ↓
		&&  (inpName=event.target.name.match(/\[(selected|definition|[Nn]ame)\]/)) //←inpName here is used by getTabStop ↓
		&&  (inp= (event.key==='ArrowUp') ?
								UniDOM.getElders(event.target, getTabStop, goDeep)[0]
							: UniDOM.getJuniors(event.target, getTabStop, goDeep)[0] ) )  {
			UniDOM.generateEvent(inp, 'tabIn', {bubbles:true}, {relatedTarget: event.target, tabbedFrom: event.target});
			event.preventDefault();  }
		else
		if ( (altTabUpKey.sniff(event)  ||  altTabDownKey.sniff(event))  //verticle shift ↑ ↓
		&&  (inpName=event.target.name.match(/\[(selected|definition|[Nn]ame)\]/)) //←inpName here is used by getTabStop ↓
		&&  (neighbor= (event.key==='ArrowUp') ?
								UniDOM.getElders(event.target, getNeighbor, goDeep)[0]
							: UniDOM.getJuniors(event.target, getNeighbor, goDeep)[0] ) )  {
			thisPalette.ColorGenie.cutGroup(event.target.closest('.MyColor'));
			thisPalette.ColorGenie.pasteGroup(neighbor, {doso:'insert', doFocus:true});  }
		else
		if (SoftMoon.altMenuKey.sniff(event)
		&&  /\[(selected|definition|name)\]/.test(event.target.name))  {
			const group=event.target.closest("tr.MyColor");
			thisPalette.ColorGenie.show_clipMenu(event, group, group.querySelector(".dragHandle"));  }  });

	UniDOM.addEventHandler(this.table, ['click', 'buttonpress'], function(event)  {
		if (/addSelected/.test(event.target.name))  thisPalette.addSelected(event.target.closest('tbody'));
		else
		if (/pasteAll/.test(event.target.name))  thisPalette.onPaste(event.target.closest('tbody'));  });
	// Note we set attributes so the FormFieldGenies will clone them without hassle.
	UniDOM.getElementsBy$Name(this.table, /selectAll/ ).map(function(e)  {e.setAttribute('onchange',
			"MasterColorPicker."+PNAME+".selectAll(event, this);")  });
	UniDOM.getElementsBy$Name(this.table, /addToHere/ , 1)[0].checked=true;
	UniDOM.getElementsBy$Class(this.table, 'MyColor').map(function(e)  {
		e.setAttribute('onfocusin', "MasterColorPicker."+PNAME+".ColorGenie.tabbedOut=false");
		e.setAttribute('onkeydown', "MasterColorPicker."+PNAME+".ColorGenie.catchTab(event)");
		e.setAttribute('onfocusout', "if (!MasterColorPicker."+PNAME+".ColorGenie.tabbedOut)  MasterColorPicker."+PNAME+".ColorGenie.popNewGroup(this)");  });
	UniDOM.getElementsBy$Class(this.table, "dragHandle" ).map(function(e)  { e.setAttribute('oncontextmenu',
			"MasterColorPicker."+PNAME+".ColorGenie.show_clipMenu(event, this.closest('tr.MyColor'), this);");  });
	const tr=this.trs;
	for (var sel, i=1;  i<tr.length;  i++)  {
		switch (tr[i].children[0].nodeName)  {
		case 'TD':
			tr[i].children[0].setAttribute('onclick',
				"var colorSpecCache; if (event.target===this  &&  (colorSpecCache=new SoftMoon.WebWare.Color_Picker.MyPalette.Color_SpecCache(this.parentNode.querySelector(\"[name$='[definition]']\").value))  &&  colorSpecCache.RGB)  MasterColorPicker.pick(colorSpecCache, event, '"+PNAME+"');");
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


MyPalette.Color_SpecCache=class extends Color_Picker.Color_SpecCache  {  }
MyPalette.Color_SpecCache.prototype.name="MyPalette.Color_SpecCache";

// this runs when a color is picked from any other picker
MyPalette.prototype.onPick=function(colorSpecCache, event)  {
	if (!userOptions.showMyPalette.checked
	||  (MasterColorPicker.interfaceTarget  &&  UniDOM.hasAncestor(MasterColorPicker.interfaceTarget, this.table)))  return colorSpecCache;
	const mp=this.addToMyPalette.value;
	if (event instanceof Event
	&& (  (event.type==='click'
				 && ((mp==='single-click' && event.detail===1  &&  !(colorSpecCache instanceof MyPalette.Color_SpecCache))
					|| (mp==='single-click' && event.detail===2  &&  colorSpecCache instanceof MyPalette.Color_SpecCache)
					|| (mp==='double-click' && event.detail===2)
					|| (mp==='shift-click'  && event.detail===1  &&  event.shiftKey)))
		 || (event.type==='contextmenu'
				 && mp==='right-click' && event.detail===1) ) )
		this.addColor(colorSpecCache.text_output);
	return colorSpecCache;  }

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
	this.ColorGenie.popNewGroup(tr, {doso:true});
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

MyPalette.prototype.onCopy=function()  {
	for (var i=1;  i<this.trs.length-1;  i++)  {
		if (this.trs[i].children[0].nodeName==='TH')  continue;
		if (this.trs[i].children[0].children[0].checked)  {
			this.ColorGenie.copyGroup(this.trs[i], {clip:'new clip'});
			if (this.options.autoUncheck2.checked)  {
				this.trs[i].children[0].children[0].checked=false;
				this.trs[i].closest('tbody').querySelector('input[name*="selectAll"]').checked=false;  }  }  }  }

MyPalette.prototype.onCut=function()  {
	for (var i=1;  i<this.trs.length-1;  i++)  {
		if (this.trs[i].children[0].nodeName==='TH')  continue;
		if (this.trs[i].children[0].children[0].checked)
			this.ColorGenie.cutGroup(this.trs[i--], {clip:'new clip'});  }
	UniDOM.getElementsBy$Name(this.table, /selectAll/ ).map(function(e) {e.checked=false;});  }

MyPalette.prototype.onDelete=function()  {
	for (var i=1;  i<this.trs.length-1;  i++)  {
		if (this.trs[i].children[0].nodeName==='TH'
		&&  ( /\bMyPaletteBody\b/ ).test(this.trs[i].parentNode.className)
		&&  UniDOM.getElementsBy$Name(this.trs[i].children[0], /selectThis/ , 1)[0].checked)
			this.SubPaletteGenie.deleteGroup(this.trs[i--].parentNode);
		else
		if (this.trs[i].children[0].children[0].checked)
			this.ColorGenie.deleteGroup(this.trs[i--]);  }
	UniDOM.getElementsBy$Name(this.table, /selectAll/ ).map(function(e) {e.checked=false;});  }

MyPalette.prototype.onPaste=function(tbody)  {
	this.ColorGenie.pasteGroup(tbody.rows[tbody.rows.length-1], {clip:'all clips', doso:'insert', dumpEmpties:false, doFocus:false});  }

MyPalette.prototype.moveColor=function(from, to)  {
		this.ColorGenie.cutGroup(from, {clip:"MCP_system", dumpEmpties:false});
		this.ColorGenie.pasteGroup(to, {clip:"MCP_system", doso:"insert", dumpEmpties:false, doFocus:false});  }

//Note we can always do a simple cut/paste with fields, because there is always an empty field at the end to “insertBefore” — not so with moving subPalettes

MyPalette.prototype.moveSub=function(from, to)  {
		this.SubPaletteGenie.cutGroup(from, {clip:"MCP_system", dumpEmpties:false});
		this.SubPaletteGenie.popNewGroup(to||this.table, {clip:"MCP_system", doso:"paste", addTo:!to, dumpEmpties:false, doFocus:false});  }

MyPalette.prototype.makeSub=function()  {
	if (this.SubPaletteGenie.popNewGroup(this.table, {addTo:true}))  {
		for (var i=1, l=this.trs.length-3, newSub=this.tbodys[this.tbodys.length-1];  i<l;  i++)  {
			if (this.trs[i].querySelector("input[type='checkbox']").checked  &&  this.trs[i]!==this.trs[i].parentNode.lastElementChild)
				this.moveColor(this.trs[l--, i--], newSub.lastElementChild);  }  }
	return newSub;  }

MyPalette.prototype.addSelected=function(tbody)  {
	for (var i=1, iOff=1;  i<this.trs.length;  i++)  {
		if (this.trs[i].parentNode===tbody)  {iOff=0;  continue;}
		if (this.trs[i].children[0].nodeName==='TH')  continue;
		if ((chk=this.trs[i].querySelector("input[type='checkbox']")).checked  &&  this.trs[i]!==this.trs[i].parentNode.lastElementChild)  {
			if (this.options.autoUncheck1.checked)  chk.checked=false;
			this.moveColor(this.trs[i], tbody.lastElementChild);
			i-=iOff;  }  }
	var chk, sel, index=Array.prototype.indexOf.call(this.tbodys, tbody)+1;
	for (i=1; i<this.tbodys.length; i++)  {
		if (i===index-1)  continue;
		if (this.options.autoUncheck1.checked)  this.tbodys[i].children[0].querySelector("[name$='selectAll']").checked=false;
		if ((chk=this.tbodys[i].children[0].querySelector("[name$='selectThis']")).checked)  {
			if (this.options.autoUncheck1.checked)  chk.checked=false;
			sel=this.tbodys[i].children[0].querySelector("select[name$='[parent]']");
			if (sel.options[tbody.id])  sel.options[tbody.id].selected=true;
			else  sel.options.add(new Option('♪Hi♫ HO!  ♫HI♪ ho! It’s home from work we go…♪♫♪♫', tbody.id, false, true));
			if (i!==index)  this.moveSub(this.tbodys[i--], this.tbodys[index++]);
			else  this.alignParentPaletteSelectors();  }  }  }

MyPalette.prototype.dragger=function(event, group, bodyClass, dragClass, groupClass)  {
	if (event.buttons!==1)  return;
	event.preventDefault();
	UniDOM.addClass(document.body, bodyClass);
	UniDOM.addClass(group, dragClass);
	var mouseEvent=null;
	const
		thisPalette=this,
		tablePos=this.HTML.getBoundingClientRect(),
		//  ↓↓ see “A Note About dragging & dropping” near the end of this file ↓↓
		auditor=UniDOM.addEventHandler(document, ['onVisibilityStateChange', 'onPickerStateChange'], done, true),
		drop=UniDOM.addEventHandler(document.body, 'onMouseUp', [done, mover], true),
		catsEye=UniDOM.addEventHandler(document.body, 'onMouseMove',
			function(event)  {
				if (event.buttons===1)  mouseEvent=event;
				else  done(event);  },
			true),
		scroller=setInterval(
			function()  {
				if (!mouseEvent  ||  mouseEvent.clientX<tablePos.left  ||  mouseEvent.clientX>tablePos.right)  return;
				if (mouseEvent.clientY<tablePos.top)  thisPalette.HTML.scrollTop-=tablePos.top-mouseEvent.clientY;
				else
				if (mouseEvent.clientY>tablePos.bottom)  thisPalette.HTML.scrollTop+=mouseEvent.clientY-tablePos.bottom;  },
			42);
		function done(event)  {
			event.preventDefault();
			UniDOM.remove$Class(document.body, bodyClass);
			UniDOM.remove$Class(group, dragClass);
			auditor.onVisibilityStateChange.remove();
			auditor.onPickerStateChange.remove();
			drop.onMouseUp.remove();
			catsEye.onMouseMove.remove();
			clearInterval(scroller);  }
		function mover(event)  {
			var moveTo;
			if (UniDOM.hasAncestor(event.target, thisPalette.table)
			&&  (moveTo= UniDOM.has$Class(event.target, groupClass)  ?  event.target : UniDOM.getAncestorBy$Class(event.target, groupClass))
			&&  group!==moveTo  &&  group.nextElementSibling!==moveTo)
				(group.tagName==="TR") ? thisPalette.moveColor(group, moveTo) : thisPalette.moveSub(group, moveTo);  }  }

MyPalette.prototype.clearPalette=function()  {
	var paletteMeta=this.HTML.querySelector('.paletteMeta');
	UniDOM.getElementsBy$Name(paletteMeta, /name/ , 1)[0].value="";
	paletteMeta=UniDOM.getElementsBy$Name(paletteMeta, /header|footer/ );
	for (var i=paletteMeta.length; --i>=0;)  {
		if (UniDOM.isLast(paletteMeta[i]))  paletteMeta[i].value="";
		else  this.MetaGenie.deleteGroup(paletteMeta[i]);}
	for (i=this.tbodys.length;  --i>0;)  {this.SubPaletteGenie.deleteGroup(this.tbodys[i]);}
	for (i=this.trs.length-1;  --i>1;)  {this.ColorGenie.deleteGroup(this.trs[i]);}
	i=UniDOM.getElementsBy$Name(this.trs[2], /definition|name/ );  i[0].value="";  i[1].value="";  }

MyPalette.prototype.fromJSON=function($JSON_palette, mergeMode)  {
	if (typeof $JSON_palette !== 'object')  return false;
	if (mergeMode===undefined)  mergeMode=UniDOM.getElementsBy$Name(this.HTML.querySelector('.paletteMerge'), /import_merge_mode/ ).getSelected().value;
	if (mergeMode==='replace')  this.clearPalette();
	var pName, palette, JSON_palette;
	for (pName in $JSON_palette)  {
		JSON_palette=$JSON_palette[pName];
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
			if (!thisPalette.MetaGenie.popNewGroup(flds.lastElementChild))  break;  }  }
  metaHTML.querySelector('select.alternative').setSelected(JSON_palette.alternatives ? JSON_palette.alternatives : '—none—');

	var tbody, id;
	switch (mergeMode)  {
		case 'replace':  tbody=tbodys[0];  rootName.value=pName;  break;
		case 'merge':
		case 'merge-over':
			if (rootName.value.trim()===pName)  {tbody=tbodys[0];  break;}
		case 'over':  if (mergeMode==='over'  &&  (tbody=get_tBody(pName, [rootName.value.trim()])))  {
			id=tbody.id;
			this.SubPaletteGenie.deleteGroup(tbody);  }
		case 'add':
		default:  tbody=makeNew_tBody(pName, rootName.value.trim(), tbodys[0].id);  if (id)  tbodys.id=id;  }

	const
		CGBC=this.ColorGenie.config.batchCustomizer,
		SPGBC=this.SubPaletteGenie.config.batchCustomizer;
	this.ColorGenie.config.batchCustomizer=null;  this.SubPaletteGenie.config.batchCustomizer=null;
	try {fill_tBody(palette, tbody, JSON_palette.referenceMarks, [pName]);}
	finally {this.ColorGenie.config.batchCustomizer=CGBC;  this.SubPaletteGenie.config.batchCustomizer=SPGBC;}
	SPGBC.call(this.SubPaletteGenie, this.table);
	this.alignParentPaletteSelectors();
	tbodys[0].querySelector("input[name$='addToHere']").checked=true;
	tbodys[0].scrollIntoView(true);
	return $JSON_palette;

	function getPalette(JSON_palette)  {
		return (JSON_palette instanceof SoftMoon.WebWare.Palette) ? Object.getPrototypeOf(JSON_palette.palette) : JSON_palette.palette;  }

	function makeNew_tBody(sName, parentName, parentId)  {
		if (thisPalette.SubPaletteGenie.popNewGroup(thisPalette.table, {addTo:true}))	 {
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
		case 'over':  thisPalette.SubPaletteGenie.deleteGroup(tbody);
		case 'add':
		case 'replace':
		default: return makeNew_tBody(sName, chain.pop(), parentId);  }  }

	function fill_tBody(palette, tbody, marks, chain)  {
		if (marks)  {
			marks.open=new RegExp('^'+RegExp.escape(marks[0]));
			marks.close=new RegExp(RegExp.escape(marks[1])+'$');  }
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
						thisPalette.ColorGenie.deleteGroup(trs[i]);  }  }
			thisPalette.addColor(palette[pRef].trim().replace(marks?.open,"").replace(marks?.close,""), cName);  }
		CGBC.call(thisPalette.ColorGenie, tbody);  }  }


MyPalette.prototype.referenceMarks=[ '«' , '»' ];


MyPalette.prototype.toJSON=function toJSON(onDupColor)  {
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
			else  def=marks[0]+def+marks[1];   // mark the definition as a “back reference” : see  SoftMoon.WebWare.Tabular_ColorPicker.buildPaletteTable
			loop:{ while (cName in pltt)  {
				switch (onDupColor)  {
				case 'forbid':
				case 'forbid all':
					e=new Error(toJSON.errorNotes[0](tbIndex, tbodys));
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
					e=new Error(toJSON.errorNotes[1]);
					e.name='MyPalette Duplicate Name';
					e.type='Color';
					e.duplicateName=cName;
					//e.subName=subName;
					e.tr={index: j, tr: trs[j]}
					e.tbody={index: tbIndex, tbody: tbody}
					throw e;  }
				else requireSubindex=true;  }
			if (( /^ ?MyPalette\s*:/i ).test(def)  ||  ( /^ ?MyPalette\s*\(.*\)$/i ).test(def))  def.replace( /MyPalette/i , pName);
			pltt[cName] = def;  }
		subs.push(pltt);
		for (tbIndex=1; tbIndex<tbodys.length; tbIndex++)  {
			if (tbody.id!==tbodys[tbIndex].querySelector("select[name$='[parent]']").value)  continue;
			subName=( tbodys[tbIndex].querySelector("input[name$='[Name]']").value.trim().replace( /:/g , ';').replace( /\(/g , '[').replace( /\)/g , ']')
						||  ("{"+tbIndex+"}") );
			loop:{ while (subName in pltt)  { switch (onDupColor)  {
				case 'forbid':
					e=new Error(toJSON.errorNotes[2]);
					e.name='MyPalette Duplicate Name';
					e.type='sub-Palette';
					e.duplicateName=subName;
					e.tbody={index: tbIndex, tbody: tbodys[i]}
					throw e;
				case 'ignore': break loop;
				default: subName=subName+"{"+tbIndex+"}";  }  }  }
			pltt[subName] = {paletteName: subName, palette: buildPaletteObject(tbodys[tbIndex], tbIndex)};  }
		return pltt;  }  }

MyPalette.prototype.toJSON.errorNotes=[ // here you can change the language on-the-fly
	(tbIndex, tbodys) => 'Duplicate Color Names in the '+(tbIndex!==0 ? 'same sub-' : (tbodys.length>1 ? 'root ' : ""))+'Palette found when building MyPalette JSON',
	'Duplicate Color Names found when building MyPalette JSON',
	'Duplicate Color/sub-Palette Names found when building MyPalette JSON' ];



MyPalette.prototype.portNotice=function(notice, wait)  {
	const div=document.createElement('div'),
				portLog=this.HTML.querySelector('.portLog');
	div.className='portNotice' + (wait? ' wait' : "");
	div.wait=wait;
	div.innerHTML=notice;
	portLog.appendChild(div);
	return div;  }


const
	CONSOLE_IMPORT_ERROR='MasterColorPicker MyPalette import file error:\n';

//here you can change the output notices language for MyPalette on-the-fly
MyPalette.NOTICES={
	CHOOSE_PRE: '<strong>Please choose a MasterColorPicker™ Palette Table from the main palette-select.</strong>',
	CHOOSE:   '<h4>Choose a Palette to import:</h4>',
	NO_FILES: 'No palette files found.',
	NO_FILE:  '<strong>No file chosen.&nbsp; Please choose a file to import.</strong>',
	FILE_NAME:'<strong>Improper filename extension for imported file.</strong>',
	CORRUPT:  '<strong>File is corrupt: can not load.</strong>',
	X_TO_MCP: 'Exported to MasterColorPicker™',
	UPLOAD:   (file,path)=>'Uploading <filepath>' +file+ '</filepath> to:\n<filepath>' +path+ '</filepath>',
	DID_UPLD: (filepath)=>'Successfully uploaded to:\n<filepath>' +filepath+ '</filepath>',
	DOWNLOAD: (file,path)=>'Downloading <filepath>' +file+ '</filepath> from:\n<filepath>' +path+ '</filepath>',
	INDX_RQST:(path)=>'Requesting the palette file index from:\n<filepath>' +path+ '</filepath>\n … … please wait.',
	DB_INX_RQ:(store)=>'<p>Requesting the palette file index from the browser “'+store+'”  DataBase…</p>',
	DB_RQST:  'Requesting the palette from the browser DataBase…',
	DB_SAVING:(store)=>'<p>Saving MyPalette to the browser “'+store+'”  DataBase…</p>',
	DB_SAVED: (store)=>'<p>MyPalette saved to the browser “'+store+'” DataBase.</p>',
	DB_EXISTS:(store)=>'<p>The filename already exists in the browser “'+store+'” DataBase.</p>',
	DB:       '<strong>¡Error! :\n The browser’s private storage DataBase is not available.</strong>',
	BUILDING: '<strong>Building MyPalette… … …please wait…</strong>',
	DUP_NAME: (name,palette)=>'<strong>¡ Duplicate Name Error !\n' +name+ (palette ? (' in '+palette) : "") + '</strong>',
	HTTP:     '<strong>¡Error! :\n problem with the HTTP connection or server.</strong>'
}

MyPalette.prototype.porter=function(event)  {
	if (event.detail>1) return;
	const
		portMode=UniDOM.getElementsBy$Name(this.HTML.querySelector(".portMode"), /_portMode/ ).getSelected().value,
		port=UniDOM.getElementsBy$Name(this.HTML.querySelector(".port"), /_port\]?$/ ).getSelected().value,
		divs=this.HTML.querySelectorAll('.portNotice'),
		thisPalette=this;
	var i, pName, palette, div;
	for (i=divs.length; i>0;)  { if (divs[--i].wait)  continue;
		if (divs[i].evented)  UniDOM.removeAllEventHandlers(divs[i], true);
		divs[i].parentNode.removeChild(divs[i]);  }
	switch (portMode)  {
	case 'import':  switch (port)  {
		case 'current':
			if (palette=SoftMoon.palettes[pName=MasterColorPicker.picker_select.getSelected().firstChild.data])  {   // .value
				div=this.portNotice(MyPalette.NOTICES.BUILDING, true);
				setTimeout(function() {thisPalette.fromJSON({[pName]: palette});  div.parentNode.removeChild(div);},  38);  }
			else this.portNotice(MyPalette.NOTICES.CHOOSE_PRE);
			return;
		case 'local':
			if (palette=(this.droppedImportPaletteFile  // ←the browser takes care of dropping the file into ↓ the file-input
								||  this.HTML.querySelector('.port input[type="file"]').files[0]))
				this.importPaletteFile(palette);
			else  this.portNotice(MyPalette.NOTICES.NO_FILE);
			return;
		case 'server':   this.getPaletteIndexFromServer();  return;
		case 'browser':  this.getPaletteIndexFromBrowserDB();  return;
		default: console.error('unknown porter:', portMode, port);  return;
	}
	case 'export':  try { switch (port)  {
		case 'current':
			SoftMoon.WebWare.addPalette(palette=this.toJSON());
			SoftMoon.WebWare.initLoadedPaletteTable(palette, undefined, true);
			SoftMoon.userLoaded_palettes.push({filename: this.getCurrentFileName(), data:palette, isProcessed:true});
			UniDOM.generateEvent(window, 'mastercolorpicker_palettes_userLoaded');
			this.portNotice(MyPalette.NOTICES.X_TO_MCP);
			return;
		case 'server':  this.uploadPalette();  return;
		case 'local':   this.savePaletteFile();  return;
		case 'browser': this.savePaletteToBrowserDB();  return;
		default: console.error('unknown porter:', portMode, port);  return;  }  }
		catch(e)  {
			if (e.name!=='MyPalette Duplicate Name')  {  //← color names in the palette
				throw new Error("¡Error exporting MyPalette! at port: "+port, {cause: e});  }
			this.portNotice(MyPalette.NOTICES.DUP_NAME(e.duplicateName, e.subName));
			const
				which=e.tr ? e.tr.tr : e.tbody.tbody,
				namer=UniDOM.getElementsBy$Name(which, /name/i )[0];
			UniDOM.addClass(which, 'duplicatename');
			namer.onkeydown=function() {UniDOM.removeClass(which, 'duplicatename');  delete namer.onkeydown;}
			setTimeout(function() {namer.focus();}, 2500);  }  }  }


MyPalette.prototype.importPaletteFile=function(PaletteFile)  {
	if (!( /\.palette\.js(?:on)?$/i ).test(PaletteFile.name))  {
		this.portNotice(MyPalette.NOTICES.FILE_NAME);
		return false;  }
	const
		thisPalette=this,
		fr=new FileReader(),
		div=this.portNotice(MyPalette.NOTICES.BUILDING, true);
	fr.onload=function()  {
		try {
			const JSON_palette=thisPalette.fromFileText(fr.result);
			SoftMoon.userLoaded_palettes.push({filename: PaletteFile.name, data:JSON_palette, isProcessed:true});
			UniDOM.generateEvent(window, 'mastercolorpicker_palettes_userLoaded');
			thisPalette.HTML.querySelector('input[name*="filename"]').value=PaletteFile.name.match( /^(.+)\.palette\.js(?:on)?$/i )[1];
			}
		catch(e)  {
			console.error(CONSOLE_IMPORT_ERROR,e,"\n ↓ ↓ ↓\n",fr.result);
			thisPalette.portNotice(MyPalette.NOTICES.CORRUPT);  }
		finally {div.parentNode.removeChild(div);}  };
	fr.onerror=function()  {
		console.error(CONSOLE_IMPORT_ERROR,fr.error);
		thisPalette.portNotice(MyPalette.NOTICES.CORRUPT);
		div.parentNode.removeChild(div);  };
	fr.readAsText(PaletteFile);
	return fr;  }


MyPalette.prototype.fromFileText=function(ft)  {
	return this.fromJSON(JSON.parse(ft.trim().replace( /^SoftMoon.loaded_palettes.push\(\s*{\s*filename:[^,]+,\s*data:\s*/ , "").replace( /\s*\}\s*\)\s*;?$/ , "")));  }
//	return this.fromJSON(JSON.parse(ft.trim().replace( /^SoftMoon.loaded_palettes.push\(\s*{\s*filename:\s*document.currentScript.src\s*,\s*data:\s*/ , "").replace( /\s*\}\s*\)\s*;?$/ , "")));  }


const HTTP=SoftMoon.WebWare.HTTP,
			Connector= HTTP ? new HTTP() : null,
			// ↓ these deliminate filenames in MESSAGES (not the index or the path of an uploaded file) returned from the server
			SI=String.fromCharCode(15),  // ← ASCII “shift in”
			SO=String.fromCharCode(14),  // ← ASCII “shift out”
			// ↓ the server’s  color_palettes/  index returns info in “groups”
			GS=String.fromCharCode(29),  // ← ASCII “group separator”
			// ↓ sent by the server to indicate an error message
			NAK=String.fromCharCode(21),  // ← ASCII “negative aknowledge”
			ERROR=NAK+'¡Error! :';

function markup(text) {return text.replaceAll(SI, '<filepath>').replaceAll(SO, '</filepath>');}

MyPalette.prototype.doLog=true;

MyPalette.prototype.downloadPalette=function(filename)  {
	if (this.doLog)  console.log(' →→ downloading palette from: ',filename);
	var div;
	const
		thisPalette=this,
		connection=HTTP.Connection(filename, 'Can not download Palette from server: no HTTP service available.');
	connection.onFileLoad=function()  {
		if (thisPalette.doLog)  console.log(' →→ Download response:\n',this.responseText);
		if (this.responseText.startsWith(ERROR))  {
			UniDOM.remove$Class(div, 'wait');  div.wait=false;
			div.innerHTML= '<strong>' + markup(this.responseText) + '</strong>';
			return;  }
		setTimeout(function()  {
			try {
				thisPalette.fromFileText(connection.responseText);
				thisPalette.HTML.querySelector('input[name*="filename"]').value=filename.match( /([^\/]+)\.palette\.js(?:on)?$/i )?.[1];
				div.parentNode.removeChild(div);  }
			catch(e) {
				if (thisPalette.doLog)  console.error(CONSOLE_IMPORT_ERROR,e,"\n ↓ ↓ ↓\n",connection.responseText);
				UniDOM.remove$Class(div, 'wait');  div.wait=false;
				div.innerHTML=MyPalette.NOTICES.CORRUPT;  }  },
		 38);
		div.innerHTML=MyPalette.NOTICES.BUILDING;  };
	connection.loadError=function()  {
		if (thisPalette.doLog)  console.warn(' →→ Download: HTTP or server error.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=MyPalette.NOTICES.HTTP;  }
	Connector.commune(connection);
	div=this.portNotice(MyPalette.NOTICES.DOWNLOAD(filename, document.URL.substring(0, document.URL.lastIndexOf("/")+1)), true);  }


MyPalette.prototype.getPaletteIndexFromServer=function()  {
	if (this.doLog)  console.log(' →→ downloading palette index from:',SoftMoon.colorPalettes_defaultPath);
	var div;
	const
		thisPalette=this,
		connection=HTTP.Connection(SoftMoon.colorPalettes_defaultPath, 'Can not download Palette index from server: no HTTP service available.');
	connection.onFileLoad=function()  {
		if (thisPalette.doLog)  console.log(' →→ remote Palette index response:\n',this.responseText);
		div.parentNode.removeChild(div);
		div=thisPalette.presentPaletteFileIndex(this.responseText, 'server', SoftMoon.colorPalettes_defaultPath);
		UniDOM.addEventHandler(div, ['click', 'buttonpress'], function (event)  {
			if (event.target.nodeName!=='BUTTON')  return;
			UniDOM.removeAllEventHandlers(div, true);
			div.parentNode.removeChild(div);
			thisPalette.downloadPalette(event.target.firstChild.data);  });
		div.evented=true;  }
	connection.loadError=function()  {
		if (thisPalette.doLog)  console.warn(' →→ Download Palette index: HTTP or server error.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=MyPalette.NOTICES.HTTP;  }
	Connector.commune(connection);
	div=this.portNotice(MyPalette.NOTICES.INDX_RQST(
		document.URL.substring(0, document.URL.lastIndexOf("/")+1) + SoftMoon.colorPalettes_defaultPath ), true);  }


MyPalette.prototype.presentPaletteFileIndex=function(indexText, port, basepath="")  {
	const div=this.portNotice(MyPalette.NOTICES.CHOOSE);
	UniDOM.addClass(div, 'import '+port);
	if (typeof indexText === 'string')
		indexText=indexText.split("\n").map(function(t) {return t.trim();});
	else if (!(length in indexText))
		throw new TypeError('“indexText” must be a string or an iterable object.');
	if (indexText.length<1)  div.appendChild(document.createElement('p')).append(MyPalette.NOTICES.NO_FILES);
	else for (const filename of indexText)  {
		if (port==='server'  &&  this.filterOutPaletteFileForImport(filename))  continue;
		const btn=document.createElement('button');  btn.type='button';
		div.appendChild(btn).append(basepath+filename);  }
	return div;  }

const masks=SoftMoon.WebWare.loadPalettes; // ← the masks are properties

// note this complements the function  SoftMoon.WebWare.initPaletteTables();
MyPalette.prototype.filterOutPaletteFileForImport=function(path)  {
	return  path===""  ||
					!masks.paletteMask.test(path)  ||
					!masks.userPaletteMask.test(path)  ||
					masks.autoloadPaletteMask.test(path)  ||
					masks.trashMask.test(path);  }

MyPalette.prototype.getCurrentFileName=function(ext="")  {
	const name= SoftMoon.WebWare.filename_safe(this.HTML.querySelector("input[name$='filename']").value)  ||  (
			'MyPalette '+((new Date()).toUTCString()).replace( /:/g , ';').replace( /\(/g , '[').replace( /\)/g , ']') );
	return  (ext  &&  name.substr(-ext.length) === ext) ? name : (name+ext);  }


MyPalette.prototype.uploadPalette=function(JSON_Palette) {
	if (this.doLog)  console.log(' ←← Uploading palette to: ',SoftMoon.colorPalettes_defaultPath);
	const
		thisPalette=this,
		palette=JSON_Palette || this.toJSON(),
		filetype=UniDOM.getSelected(this.HTML.querySelector('.filetype')).value,
		filename=this.getCurrentFileName(".palette."+filetype),
		filepath=document.URL.substring(0, document.URL.lastIndexOf("/")+1)+SoftMoon.colorPalettes_defaultPath,
		connection=HTTP.Connection(SoftMoon.colorPalettes_defaultPath, 'Can not upload Palette to server: no HTTP service available.');
	var pName, div;
  for (pName in palette)  {break;}
	connection.onFileLoad=function()  {
		if (thisPalette.doLog)  console.log(' ←← Upload response:',this.responseText);
		const response=this.responseText.split(GS)[0];  // ASCII code29=“group separator” : the response may be followed by the index
		if (response.startsWith(ERROR))  div.innerHTML= '<strong>' + markup(response) + '</strong>';
		else  {
			div.innerHTML= MyPalette.NOTICES.DID_UPLD( filepath + response );
			UniDOM.generateEvent(window, 'MasterColorPicker_ServerDB_update');  }  };
	connection.loadError=function()  {
		if (thisPalette.doLog)  console.warn(' ←← Upload: HTTP or server Error.');
		div.innerHTML=MyPalette.NOTICES.HTTP;  }
	connection.onloadend=function() {UniDOM.remove$Class(div, 'wait');  div.wait=false;};
  connection.requestHeaders={'Content-Type': 'application/x-www-form-urlencoded'};
	connection.postData=HTTP.URIEncodeObject({
		filename: filename,
		palette: this.toFileText(palette, filetype, filename, this.HTML.querySelector('[name$="CSSautoType"]').value),
		replace_file: UniDOM.getElementsBy$Name(this.HTML, /replace_file/ , 1)[0].checked.toString(),
		autoload: UniDOM.getElementsBy$Name(this.HTML, /autoload/ , 1)[0].checked.toString(),
		no_index: 'true' });
	Connector.commune(connection);
	div=this.portNotice(MyPalette.NOTICES.UPLOAD(pName, filepath), true);  }

function removePaletteMarks(s, marks)  {
	if (marks  &&  s.startsWith(marks[0])  &&  s.endsWith(marks[1]))  s=s.slice(marks[0].length, -marks[1].length);
	return s;  }


Object.defineProperty(SoftMoon, "paletteFile_JavaScript_wrapper", {enumerable:true, value:[
		'SoftMoon.loaded_palettes.push( {filename: document.currentScript.src, data:\r\n',
		'\r\n}); // close loaded_palettes.push\n']});


MyPalette.prototype.toFileText=function toFileText(JSON_Palette, $filetype, $filename, $autoType)  {
	const GEN="generated by MasterColorPicker™ – MyPalette from SoftMoon-WebWare";
	var pName, paletteText;
	switch ($filetype)  {
	case 'json':
	case 'js':   paletteText=JSON.stringify(JSON_Palette, undefined, "\t").replace(/(?<!\r)\n/gu, "\r\n");
		if ($filetype==="js")  paletteText= SoftMoon.paletteFile_JavaScript_wrapper[0] +paletteText+ SoftMoon.paletteFile_JavaScript_wrapper[1] ;
	break;
	case 'css':
		for (pName in JSON_Palette)  {break;}
		const marks=JSON_Palette[pName].referenceMarks || "";
		paletteText="/* charset: 'UTF-8'\r\n *\r\n * filename: "+ $filename +"\r\n * CSS Palette "+GEN+"\r\n * "+(new Date).toUTCString()+" */";
		if (JSON_Palette[pName].header  &&  JSON_Palette[pName].header.length)  addCSSHeadFoot('', JSON_Palette[pName].header);
		if (JSON_Palette[pName].alternatives)  paletteText+= "\r\n/* Alternative color names: " + JSON_Palette[pName].alternatives + " */";
		paletteText+= "\r\n";
		MasterColorPicker.RGB_calc.config.stack({RGBA_Factory: {value: SoftMoon.WebWare.RGBA_Color}});
		try {toCSS(JSON_Palette[pName].palette, pName);}
		finally {MasterColorPicker.RGB_calc.config.cull();}
		if (JSON_Palette[pName].footer  &&  JSON_Palette[pName].footer.length)  addCSSHeadFoot('', JSON_Palette[pName].footer);
		function addCSSHeadFoot(txt, hf)  {
			if (typeof hf === 'string')  paletteText += "\r\n/*\r\n" + txt + hf + "\r\n */";
			else if (hf instanceof Array)  for (var _hf_ of hf)  {addCSSHeadFoot(txt, _hf_);}  }
		function toCSS(palette, sub)  {
			const
				RegExp=SoftMoon.RegExp || window.RegExp,
				cssVars=new Object;
			var subText="";
			loopThroughPalette: for (let c in palette)  {
				if (palette[c].palette)  {toCSS(palette[c].palette, sub+" "+c);  continue loopThroughPalette;}
				const color=removePaletteMarks(palette[c], marks);
				let clr, cs, cd, bg, type, important;
				if ((clr=color.match(RegExp.stdWrappedColor))
				&&  (cs=clr[1].match( /^(rgb|hsl|hwb)a?$/i ))
				&&  (cd=clr[2].match(RegExp[cs[1].toLowerCase()+'_a'])))  {
					clr=color.replace( /°/ , "deg").replace( /ʳ|ᴿ|ᶜ/ , "rad").replace( /ᵍ|ᴳ/ , "grad").replace( /●/ , "turn");
					if (cd[1].includes("%"))  clr=clr.replace( /[.\d]+%/ , (parseFloat(cd[1])/100)+"turn");  //most browsers recognize hue-angles in percents, but we keep to specs anyway
					if (cs[1].toLowerCase()==='hwb')  {  // ¡curses to the folks to de-standardized this spec!
						clr=clr.replace( /\s*,\s*/g , " ");
						if (cd.length>4)  {
							let i=clr.lastIndexOf(" ");
							clr=clr.substring(0, i)+" /"+clr.substring(i);  }  }  }
				else  clr=MasterColorPicker.RGB_calc(color)?.toString('#hex');
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
			for (const c in cssVars)  {paletteText+= "\n" + sub + " {";  break;}  //we only do this if there is a property of cssVars
			for (const c in cssVars)  {paletteText+= "\n" + toFileText.indent + c + ": " + cssVars[c] + ";";}
			for (const c in cssVars)  {paletteText+= "\n }";  break;}             //we only do this if there is a property of cssVars
			paletteText+= subText;  }
	break;
	case 'gpl':
		for (pName in JSON_Palette)  {break;}
		paletteText="GIMP Palette\nName: "+pName+"\n# charset: 'UTF-8'\n# filename: " + $filename + "\n# "+GEN+"\n# "+(new Date).toUTCString();
		if (JSON_Palette[pName].header  &&  JSON_Palette[pName].header.length)  addGPLHeadFoot('Header: ', JSON_Palette[pName].header);
		if (JSON_Palette[pName].alternatives)  paletteText+= "\n# Alternative color names: " + JSON_Palette[pName].alternatives;
		paletteText+= "\n#";
		MasterColorPicker.RGB_calc.config.stack({RGBA_Factory: {value: SoftMoon.WebWare.RGBA_Color}});
		try {toGPL(JSON_Palette[pName].palette);}
		finally {MasterColorPicker.RGB_calc.config.cull();}
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


MyPalette.prototype.savePaletteFile=function(JSON_Palette)  {
	const
		iframe=document.getElementById('MasterColorPicker_local_filesaver') || document.createElement('iframe'),
		filetype=UniDOM.getSelected(this.HTML.querySelector('.filetype')).value,
		filename=this.getCurrentFileName(".palette."+filetype);
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
		iframe.id='MasterColorPicker_local_filesaver';
		iframe.style.display='none';
		document.body.appendChild(iframe);  }
	iframe.setAttribute('src', palette);
	URL.revokeObjectURL(palette);  }


MyPalette.prototype.getPaletteIndexFromBrowserDB=function()  {
	if (this.doLog)  console.log(' →→ retrieving palette index from browser DB');
	var div;
	const db=MasterColorPicker.db;
	if (!db)  {portNotice(MyPalette.NOTICES.DB);  return;}
	const
		thisPalette=this,
		trans=db.transaction("palettes");
	trans.onerror=function()  {
		if (thisPalette.doLog)  console.warn(' →→ Load Palette index from browser’s DB error.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=MyPalette.NOTICES.DB;  }
	trans.objectStore("palettes").getAllKeys().onsuccess = function(event)  {
		div.parentNode.removeChild(div);
		div=thisPalette.presentPaletteFileIndex(event.target.result, 'browserDB');        // ←← ?? ←←  event.target.result
		UniDOM.addEventHandler(div, ['click', 'buttonpress'], function (event)  {
			if (event.target.nodeName!=='BUTTON')  return;
			UniDOM.removeAllEventHandlers(div, true);
			div.parentNode.removeChild(div);
			thisPalette.loadPaletteFromBrowserDB(event.target.firstChild.data);  });
		div.evented=true;  }
	div=this.portNotice(MyPalette.NOTICES.DB_INX_RQ('palettes'), true);  }


MyPalette.prototype.loadPaletteFromBrowserDB=function(filename)  {
	if (this.doLog)  console.log(' →→ retrieving palette file from browser DB');
	var div;
	const db=MasterColorPicker.db;
	if (!db)  {portNotice(MyPalette.NOTICES.DB);  return;}
	const
		thisPalette=this,
		trans=db.transaction("palettes");
	trans.onerror=function()  {
		if (thisPalette.doLog)  console.warn(' →→ Load Palette file from browser’s DB error.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=MyPalette.NOTICES.DB;  }
	trans.objectStore("palettes").get(filename).onsuccess = function(event)  {
		setTimeout(function()  {
			try {
				thisPalette.fromJSON(event.target.result.JSON);                                  // ←← ?? ←←  event.result
				thisPalette.HTML.querySelector('input[name*="filename"]').value=filename;
				div.parentNode.removeChild(div);  }
			catch(e) {
				if (thisPalette.doLog)  console.error(CONSOLE_IMPORT_ERROR,e,"\n ↓ ↓ ↓\n",event.target.result);  // ←← ?? ←←  event.result
				UniDOM.remove$Class(div, 'wait');  div.wait=false;
				div.innerHTML=MyPalette.NOTICES.CORRUPT;  }  },
		 38);
		div.innerHTML=MyPalette.NOTICES.BUILDING;  };
	div=this.portNotice(MyPalette.NOTICES.DB_RQST, true);  }


MyPalette.prototype.savePaletteToBrowserDB=function(JSON_Palette, filename)  {
	if (this.doLog)  console.log(' ←← saving palette file to browser DB');
	const db=MasterColorPicker.db;
	if (!db)  {portNotice(MyPalette.NOTICES.DB);  return;}
	JSON_Palette??=this.toJSON();
	filename??=this.getCurrentFileName();
	const
		thisPalette=this,
		store= UniDOM.getElementsBy$Name(this.HTML, /autoload/ , 1)[0].checked ? 'autoload_palettes' : 'palettes',
		trans=db.transaction(store);
	var div=this.portNotice(MyPalette.NOTICES.DB_INX_RQ(store), true);
	function dbErr()  {
		if (thisPalette.doLog)  console.warn(' ←← Save Palette file to browser’s DB error.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=MyPalette.NOTICES.DB;  }
	trans.onerror=dbErr;
	trans.objectStore(store).getAllKeys().onsuccess = (event) => {
		if (!event.target.result.includes(filename)
		||  UniDOM.getElementsBy$Name(this.HTML, /replace_file/ , 1)[0].checked)  {
			const
				trans=db.transaction(store, 'readwrite');
			trans.onerror=dbErr;
			trans.objectStore(store).put({JSON: JSON_Palette, filename: filename}).onsuccess = function()  {
				UniDOM.remove$Class(div, 'wait');  div.wait=false;
				div.innerHTML=MyPalette.NOTICES.DB_SAVED(store);
				UniDOM.generateEvent(window, 'MasterColorPicker_BrowserDB_update');  };
			div.innerHTML=MyPalette.NOTICES.DB_SAVING(store);  }
		else  {
			UniDOM.remove$Class(div, 'wait');  div.wait=false;
			div.innerHTML=MyPalette.NOTICES.DB_EXISTS(store);  }  }  }





// =================================================================================================== \\





// this is or is called as a method of the MasterColorPicker implementation, so “this” is  MasterColorPicker
// this will read an <input> tag's value and interpret the color
// then set the background-color of it or a separate swatch;
// text-color will then be set using “SoftMoon.WebWare.makeTextReadable()”
Color_Picker.colorSwatch=function colorSwatch(inp, swatch)  {
	if (!UniDOM.isElement(inp))  inp=this.currentTarget;
	var c, e, f;
	if (!swatch)  {
		if (swatch= (inp.getAttribute('swatch')  ||  inp.swatch))  {
			if (typeof swatch===Function  ||  !UniDOM.isElement(document.getElementById(swatch)))  {
				try  {
					if (typeof swatch!==Function)  swatch=new Function("return "+swatch+";")
					swatch=swatch.call(inp);  }
				catch(e) {console.error('Custom “swatch” expression failed for ',inp,'\n with Error message:\n ',e.message);};  }  }
		else  switch (this.showColorAs)  {
			case 'swatch':  swatch=(document.getElementById(inp.getAttribute('swatch')) || this.swatch || inp.nextSibling);  break;
			case 'background':
			default:  swatch=inp;  }  }
	if (!UniDOM.isElement(swatch))  return;   // (swatch==null  ||  swatch.nodeType!==1)
	if (!swatch.defaultBack)
		swatch.defaultBack=getComputedStyle(swatch).backgroundColor;
	if (!swatch.defaultBorder)
		swatch.defaultBorder=getComputedStyle(swatch).borderColor || getComputedStyle(swatch).color;
	var toggleBorder= swatch.hasAttribute('toggleBorder') ?
		  Boolean.evalString(swatch.getAttribute('toggleBorder'))
		: this.toggleBorder;
	if (( /^(none|blank|gap|zilch|\-|\_|\u2013|\u2014)$/i ).test(inp.value))  {
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

}  // close private namespace wrapper for Color_Picker


// =================================================================================================== \\

{ // open a private namespace for the Color-Space Lab

const
ColorSpaceLab=new Object,
RGB_Calc=SoftMoon.WebWare.RGB_Calc,
CSL_calc=new RGB_Calc({
	defaultAlpha: undefined,
	hueAngleUnit: 'deg',
	RGBA_Factory: SoftMoon.WebWare.RGBA_Color,
	HSLA_Factory: SoftMoon.WebWare.HSLA_Color,
	HSBA_Factory: SoftMoon.WebWare.HSBA_Color,
	HSVA_Factory: SoftMoon.WebWare.HSVA_Color,
	HCGA_Factory: SoftMoon.WebWare.HCGA_Color,
	HWBA_Factory: SoftMoon.WebWare.HWBA_Color,
	CMYKA_Factory: SoftMoon.WebWare.CMYKA_Color  });

SoftMoon.WebWare.ColorSpaceLab=ColorSpaceLab;

let settings;

ColorSpaceLab.rgbPrecision=0;  //number of decimal places to show after RGB byte values.
ColorSpaceLab.hueAngleUnit='deg';  //hue values default to degrees

ColorSpaceLab.getColor=function(withAlpha)  {return new ColorSpaceLab.Color_SpecCache(withAlpha);}

ColorSpaceLab.Color_SpecCache= class extends SoftMoon.WebWare.Color_Picker.Color_SpecCache {
	constructor(withAlpha)  {
		if (!new.target)  throw new Error("“SoftMoon.WebWare.ColorSpaceLab.Color_SpecCache” is a constructor, not a function or method.");
		const alpha= (settings.applyOpacity.checked || withAlpha) ? parseFloat(settings.opacity_percent.value)/100 : undefined;
		super(null, 'RGB', new SoftMoon.WebWare.RGBA_Color(settings.Rgb_byte.value, settings.rGb_byte.value, settings.rgB_byte.value, alpha, {useHexSymbol:true} ));
		const hue= parseFloat(settings.Hue_degrees.value) / RGB_Calc.hueAngleUnitFactors[ColorSpaceLab.hueAngleUnit];
		this.HSL= new SoftMoon.WebWare.HSLA_Color(hue, parseFloat(settings.hSl_percent.value)/100, parseFloat(settings.hsL_percent.value)/100, alpha);
		this.HSB= new SoftMoon.WebWare.HSBA_Color(hue, parseFloat(settings.hSv_percent.value)/100, parseFloat(settings.hsV_percent.value)/100, alpha);
		this.HSV= new SoftMoon.WebWare.HSVA_Color(hue, parseFloat(settings.hSv_percent.value)/100, parseFloat(settings.hsV_percent.value)/100, alpha);
		this.HWB= new SoftMoon.WebWare.HWBA_Color(hue, parseFloat(settings.hWb_percent.value)/100, parseFloat(settings.hwB_percent.value)/100, alpha);
		this.HCG= new SoftMoon.WebWare.HCGA_Color(hue, parseFloat(settings.hCg_percent.value)/100, parseFloat(settings.hcG_percent.value)/100, alpha);
		this.CMYK= new SoftMoon.WebWare.CMYKA_Color(parseFloat(settings.Cmyk_percent.value)/100, parseFloat(settings.cMyk_percent.value)/100, parseFloat(settings.cmYk_percent.value)/100, parseFloat(settings.cmyK_percent.value)/100, alpha);
		}  }
ColorSpaceLab.Color_SpecCache.prototype.name="SoftMoon.WebWare.ColorSpaceLab.Color_SpecCache";

const stackSpecs={
		RGBA_Factory: {value: SoftMoon.WebWare.RGBA_Color},
		HSLA_Factory: {value: SoftMoon.WebWare.HSLA_Color},
		HSBA_Factory: {value: SoftMoon.WebWare.HSBA_Color},
		HSVA_Factory: {value: SoftMoon.WebWare.HSVA_Color},
		HCGA_Factory: {value: SoftMoon.WebWare.HCGA_Color},
		HWBA_Factory: {value: SoftMoon.WebWare.HWBA_Color},
		CMYKA_Factory: {value: SoftMoon.WebWare.CMYKA_Color}  };

ColorSpaceLab.setColor=function(CLR, space)  {
	if ( (CLR instanceof ColorSpaceLab.Color_SpecCache)
	||  !document.getElementById('MasterColorPicker_showLab').checked
	||  (arguments[1] instanceof Event  &&  ( /mouse/ ).test(arguments[1].type)  &&  !settings.updateLabOnMouseMove.checked) )
		return CLR;

	RGB_Calc.config.stack(stackSpecs);

	try
	{
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
			 &&  !(arguments[1] instanceof Event  &&  ( /key/ ).test(arguments[1].type)))
		CLR.RGB.alpha= alpha= parseFloat(settings.opacity_percent.value)/100;
	else if (settings.applyOpacity.checked
			 &&  CLR.model === 'text')  {
		let m, alphaTxt=Math.roundTo(1, parseFloat(settings.opacity_percent.value)) + '%';
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
		settings.Rgb_byte.value= settings.Rgb_range.value= Math.roundTo(ColorSpaceLab.rgbPrecision, CLR.RGB.red);
		settings.rGb_byte.value= settings.rGb_range.value= Math.roundTo(ColorSpaceLab.rgbPrecision, CLR.RGB.green);
		settings.rgB_byte.value= settings.rgB_range.value= Math.roundTo(ColorSpaceLab.rgbPrecision, CLR.RGB.blue);

		settings.Rgb_percent.value=Math.roundTo(5, CLR.RGB.red/2.55);
		settings.rGb_percent.value=Math.roundTo(5, CLR.RGB.green/2.55);
		settings.rgB_percent.value=Math.roundTo(5, CLR.RGB.blue/2.55);
		settings.Rgb_hex.value=CLR.RGB.hex.substr(1,2);
		settings.rGb_hex.value=CLR.RGB.hex.substr(3,2);
		settings.rgB_hex.value=CLR.RGB.hex.substr(5,2);  }

	if (!CLR.HSV)  CLR.HSV=RGB_Calc.to.hsv(CLR.RGB.rgba);
	else if (typeof alpha === 'number')  CLR.HSV.alpha=alpha;

	if (space!=='hsb' && space!=='hsv' && space!=='hsl' && space!=='hcg')  {
		var hau=ColorSpaceLab.hueAngleUnit
		settings.Hue_degrees.value=
//				Math.roundTo(SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision.deg, parseFloat(CLR.HSV.hue)*ColorSpaceLab.hueAngleUnitFactor);
			Math.roundTo(SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau], CLR.HSV.hue*RGB_Calc.hueAngleUnitFactors[hau]);
		settings.Hue_range.value=
			Math.roundTo(SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision['deg'], CLR.HSV.hue*360);

		settings.Hue_percent.value= Math.roundTo(SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision['%'], parseFloat(CLR.HSV.hue)*100);  }

	if (space!=='hsb' && space!=='hsv')  {
		settings.hSv_percent.value= settings.hSv_range.value= Math.roundTo(5, CLR.HSV.saturation*100);
		settings.hsV_percent.value= settings.hsV_range.value= Math.roundTo(5, CLR.HSV.value*100);  }

	if (space!=='hsl')  {
		if (!CLR.HSL)  CLR.HSL=RGB_Calc.to.hsl(CLR.RGB.rgba);
		else if (typeof alpha === 'number')  CLR.HSL.alpha=alpha;
		settings.hSl_percent.value= settings.hSl_range.value= Math.roundTo(5, CLR.HSL.saturation*100);
		settings.hsL_percent.value= settings.hsL_range.value= Math.roundTo(5, CLR.HSL.lightness*100);  }

	if (space!=='hwb')  {
		if (!CLR.HWB)  CLR.HWB=RGB_Calc.to.hwb(CLR.RGB.rgba);
		else if (typeof alpha === 'number')  CLR.HWB.alpha=alpha;
		settings.hWb_percent.value= settings.hWb_range.value= Math.roundTo(5, CLR.HWB.white*100);
		settings.hwB_percent.value= settings.hwB_range.value= Math.roundTo(5, CLR.HWB.black*100);  }

	if (space!=='hcg')  {
		if (!CLR.HCG)  CLR.HCG=RGB_Calc.to.hcg(CLR.RGB.rgba);
		else if (typeof alpha === 'number')  CLR.HCG.alpha=alpha;
		settings.hCg_percent.value= settings.hCg_range.value= Math.roundTo(5, CLR.HCG.chroma*100);
		settings.hcG_percent.value= settings.hcG_range.value= Math.roundTo(5, CLR.HCG.gray*100);  }

	if (space!=='cmyk')  {
		if (!CLR.CMYK)  CLR.CMYK=RGB_Calc.to.cmyk(CLR.RGB.rgba);
		else if (typeof alpha === 'number')  CLR.CMYK.alpha=alpha;
		settings.Cmyk_percent.value= settings.Cmyk_range.value= Math.roundTo(5, CLR.CMYK.cyan*100);
		settings.cMyk_percent.value= settings.cMyk_range.value= Math.roundTo(5, CLR.CMYK.magenta*100);
		settings.cmYk_percent.value= settings.cmYk_range.value= Math.roundTo(5, CLR.CMYK.yellow*100);
		settings.cmyK_percent.value= settings.cmyK_range.value= Math.roundTo(5, CLR.CMYK.black*100);  }
	}
	finally {RGB_Calc.config.cull();}
	ColorSpaceLab.update_Hue_rangeHandle();
	ColorSpaceLab.luminanceIndicator.innerText=Math.roundTo(2, 100*RGB_Calc.luminance(CLR.RGB.rgba))+'%';
	if (settings.showContrastInLab.checked)  updateContrastInd(CLR.RGB.rgba);
	ColorSpaceLab.swatch.color(CLR);

	return CLR;  }

function updateContrastInd(rgba)  {
	MasterColorPicker.RGB_calc.config.stack({RGBA_Factory:{value:Array}});
	try  {
	const back=MasterColorPicker.RGB_calc(settings.LabContrastColor.value);
	if (back)  ColorSpaceLab.contrastIndicator.innerText=Math.roundTo(1, RGB_Calc.contrastRatio(rgba, back))+':1';  }
	finally {MasterColorPicker.RGB_calc.config.cull();}  }


ColorSpaceLab.alignColor=function(event)  {
	// the Picker class controls the Tab key and generates a “tabIn” event that transfers focus to another <input> before the TAB key can be released.
	// the “keyup” event then happens on the newly focused <input> when we only want to align colors after a keypress on a “current” <input>
	if (event.key==='Tab')  return;
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
			settings[model+'_percent'].value=Math.roundTo(5, thisValue/2.55);
			settings[model+'_hex'].value=Math._2hex(parseInt(thisValue));
			break setLikeInputs;  }
		case 'range':  {
			settings[model+'_byte'].value=thisValue;
			settings[model+'_percent'].value=Math.roundTo(5, thisValue/2.55);
			settings[model+'_hex'].value=Math._2hex(parseInt(thisValue));
			break setLikeInputs;  }
		case 'percent':  {
			settings[model+'_range'].value=thisValue*2.55;
			settings[model+'_byte'].value=Math.roundTo(ColorSpaceLab.rgbPrecision, thisValue*2.55);
			settings[model+'_hex'].value=Math._2hex(parseFloat(thisValue)*2.55);
			break setLikeInputs;  }
		case 'hex':  {
			settings[model+'_range'].value=parseInt(thisValue, 16);
			settings[model+'_percent'].value=Math.roundTo(5, parseInt(thisValue, 16)/2.55);
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
			settings.Hue_percent.value=Math.roundTo(5, Math.sawtooth(100, hue*100));
			break setLikeInputs;  }
		case 'range':  {
			settings.Hue_degrees.value=Math.roundTo(
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau],
				Math.sawtooth(hauf, (thisValue/360)*hauf));
			settings.Hue_percent.value=Math.roundTo(5, Math.sawtooth(100, thisValue/3.60));
			break setLikeInputs;  }
		case 'percent':  {
			settings.Hue_range.value=Math.deg(thisValue*3.60);
			settings.Hue_degrees.value=Math.roundTo(
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau],
				Math.sawtooth(hauf, (thisValue/100)*hauf));
			break setLikeInputs;  }  }  }
	default:  { switch (format)  {
			case 'range':   settings[model+'_percent'].value=Math.roundTo(5, thisValue);  break;
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



let MCP_stylesheet;

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


UniDOM.addEventHandler(window, 'onload', function()  {
	ColorSpaceLab.HTML=document.getElementById('MasterColorPicker_Lab');
	settings=UniDOM.getElementsBy$Name(ColorSpaceLab.HTML, "", true,
																				function(e) {return e.name.match( /^[a-z]+_([a-z_]+)$/i )[1];});
	ColorSpaceLab.settings=settings;  //for debugging
	for (var i=0; i<settings.length-10; i++)  {  // ignore Alpha, & the last seven inputs are “options” checkboxes
		UniDOM.addEventHandler(settings[i], ['onChange', 'onKeyUp', 'onTabOut'], ColorSpaceLab.alignColor);
		if (settings[i].type!=='range')  {
			UniDOM.addEventHandler(settings[i], 'onPaste', function(event)  {  //wait for paste to change the value
				setTimeout(() => {ColorSpaceLab.alignColor.call(this, event);}, 0);  });  }  }
	const
		swatch=ColorSpaceLab.HTML.querySelector('swatch'),
		contrastSwatch=ColorSpaceLab.HTML.querySelector('contrastSwatch'),
		contrastIndicator=document.getElementById('MasterColorPicker_LabContrast');
	UniDOM.addEventHandler(settings.opacity_percent, ['onchange', 'onkeyup', 'onpaste'], function()  {
		setTimeout(() =>  { //wait for paste to change the value
			settings.opacity_range.value=this.value;
			swatch.color();
			ColorSpaceLab.update_Alpha_rangeHandle();  }, 0);  });
	UniDOM.addEventHandler(settings.opacity_range, ['onchange', 'onkeyup'], function() {
		settings.opacity_percent.value=this.value;
		swatch.color();
		ColorSpaceLab.update_Alpha_rangeHandle();  });

	ColorSpaceLab.luminanceIndicator=ColorSpaceLab.HTML.querySelector('indicator span');
	ColorSpaceLab.contrastIndicator=contrastIndicator.querySelector('span');
	ColorSpaceLab.swatch=swatch;
	swatch.color=function(CLR)  {
		CLR=CLR||ColorSpaceLab.getColor(true);
		const tds=this.closest('button').getElementsByTagName('td');
		this.style.backgroundColor=CLR.RGB.hex;
		this.style.color=CLR.RGB.contrast;
		RGB_Calc.config.stack({RGBA_Factory: {value: SoftMoon.WebWare.RGBA_Color}, HCGA_Factory: {value: Array}});
		try  {
		CLR.RGB.hcga= CLR.HCG?.hcga || RGB_Calc.to.hcg(CLR.RGB);
		for (const td of tds)  {
			try  {
				const cbc=RGB_Calc.to.colorblind(CLR.RGB, td.getAttribute('title'));
				td.style.backgroundColor=cbc.hex;
				td.style.color=cbc.contrast;   }
			catch(e) {console.trace('failed color:',CLR,e);}  }  }
		finally {RGB_Calc.config.cull();}  }
	swatch.color();
	function CSL_picker(event)  {MasterColorPicker.pick(ColorSpaceLab.getColor(), event, "ColorSpace Lab");}
  UniDOM.addEventHandler(ColorSpaceLab.swatch, 'onClick', CSL_picker);
	UniDOM.addEventHandler(ColorSpaceLab.swatch.closest('button'), 'buttonpress', CSL_picker);

	UniDOM.addEventHandler(settings.showContrastInLab, 'change', function(event)  {
		this.setAttribute('tabToTarget', this.checked ? 'false' : 'true');
		UniDOM.disable(this.parentNode.nextElementSibling, !this.checked);
		UniDOM.useClass(contrastIndicator, 'disabled', !this.checked);
		if (this.checked)  UniDOM.generateEvent(settings.LabContrastColor, 'change', {bubbles:true});
		else  contrastSwatch.style.backgroundColor="";  });

	UniDOM.addEventHandler(settings.LabContrastColor, 'change', function(event)  {
		const color=MasterColorPicker.RGB_calc(this.value);
		contrastSwatch.style.backgroundColor= color?.hex||"";  });

	ColorSpaceLab.optionsHTML=ColorSpaceLab.HTML.querySelector('fieldset.options');
	UniDOM.addEventHandler(ColorSpaceLab.optionsHTML, ['tabIn', 'focusOut'], function(event)  {
		UniDOM.useClass(this, 'focus-within',
			event.type==='tabin'  ||  event.relatedTarget?.closest('fieldset.options')===this);  });

	UniDOM.addEventHandler(ColorSpaceLab.HTML, 'onKeyDown', function(event)  {
		if (event.target.closest('.options')!==ColorSpaceLab.optionsHTML
		&&  SoftMoon.altMenuKey.sniff(event))  {
			event.preventDefault();
			UniDOM.generateEvent(settings.updateLabOnMouseMove, 'tabIn', {bubbles:true});  }  });

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
		if ((event.buttons&1)===0)  {
			console.log('can not update ColorSpaceLab handle using non-primary mouse button');
			return;  }
		const
			slider=event.target,
			eye=UniDOM.addEventHandler(document, 'onVisibilityStateChange', event=>done(event,'eyeballer')),
			audit=UniDOM.addEventHandler(document.body, 'onMouseMove', auditor, true),
			move=UniDOM.addEventHandler(document.body, 'onMouseMove', updater, true),
//with FireFox (¿others?), the mouseUp event happens even if the mouse moves off the browser window when the button is released, likely because it is a native slider
			drop=UniDOM.addEventHandler(document.body, 'onMouseUp', done, true);
		function done(event, canceler='mouseUp')  {
			eye.onVisibilityStateChange.remove();
			audit.onMouseMove.remove();
			move.onMouseMove.remove();
			drop.onMouseUp.remove();
			event.stopImmediatePropagation();  }
		function auditor(event)  {  //if the end-user releases the button dragging the handle while the mouse is off the web-page
			if ((event.buttons&1)===0
			||  document.activeElement!==slider)  done(event, 'auditor');  }
		event.stopPropagation();  }

	UniDOM.addEventHandler(settings.Hue_range, 'onMouseDown',
		updateHandle, false, ColorSpaceLab.update_Hue_rangeHandle);
	UniDOM.addEventHandler(settings.opacity_range, 'onMouseDown',
		updateHandle, false, ColorSpaceLab.update_Alpha_rangeHandle);
	UniDOM.addEventHandler([settings.opacity_percent, settings.opacity_range], 'onChange', function()  {
		settings.applyOpacity.checked=true;
		const rgba=[settings.Rgb_byte.value, settings.rGb_byte.value, settings.rgB_byte.value, this.value/100];
		ColorSpaceLab.luminanceIndicator.innerText=Math.roundTo(2, 100*RGB_Calc.luminance(rgba))+'%';
		if (settings.showContrastInLab.checked)  updateContrastInd(rgba);  });
	UniDOM.addEventHandler(settings.applyOpacity, 'onChange', function() {settings.opacity_percent.value=settings.opacity_range.value=100;});
});

UniDOM.addEventHandler(window, 'mastercolorpicker_palettes_loaded', function()  {
		SoftMoon.WebWare.Color_Picker.colorSwatch(settings.LabContrastColor);
		UniDOM.generateEvent(settings.showContrastInLab, 'change', {bubbles:true});  },
	{once:true});

} //  close private namespace of ColorSpaceLab
// =================================================================================================== \\



{ //  open a private namespace wrapper for BeezEye Color Picker
	let hue, saturation, color_value, settings;
	const
		RGB_Calc=SoftMoon.WebWare.RGB_Calc,
		BeezEye=
			SoftMoon.WebWare.BeezEye=
				new SoftMoon.WebWare.Color_Picker('BeezEye');

BeezEye.buildPalette=function()  {
	const
			palette=document.querySelector("#MasterColorPicker #BeezEye canvas"),
			replacement=document.createElement('canvas'),
			canvas=replacement.getContext('2d'),
			lineTo=canvas.lineTo.bind(canvas),
			hexagon=SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon.bind(null, canvas, lineTo, 6),
			pStylz=getComputedStyle(palette),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
//			size=settings.size.value-100,
			variety=settings.variety.value,
			center={x: Math.round(w/2), y: Math.round(h/2)},     //  w  h  ↔  size
			space={x: w/variety};     //  w ↔ size
			space.y=Math.sin(_['60°'])*space.x;
	const
			radius=space.y/1.5+.5,
			maxSatPoint=w/2-space.x/2;    //  w ↔ size

	replacement.width=w;    //  w ↔ size
	replacement.height=h;   //  h ↔ size
	palette.parentNode.replaceChild(replacement, palette);
	replacement.style.backgroundColor=pStylz.backgroundColor;
	replacement.style.border=pStylz.border;
	replacement.style.width=w+'px';    //  w ↔ size    / does not
	replacement.style.height=h+'px';   //  h ↔ size    \ take effect (at least not within a fixed-position table…)

	color_value=settings.value.value;

	RGB_Calc.config.stack({
		RGBA_Factory: {value: Array},
		useHexSymbol: {value: true}  });

	SoftMoon.WebWare.HSVA_Color.config.CMYKA_Factory=Array;

	for (let rows=0, flag=false;  rows<h/2;  rows+=space.y, flag=!flag)  {  // h ↔ size
		for (let cells= flag ? (space.x/2) : 0;  cells<w/2;  cells+=space.x)  {   // w ↔ size
			drawHex(cells, rows);  drawHex(-cells, -rows);  drawHex(cells, -rows);  drawHex(-cells, rows);  }  }

	RGB_Calc.config.cull();

	function drawHex(cell, row)  {
		BeezEye.calcNativeHSV(cell, row, maxSatPoint);  //→↓ globals ↓
		if (saturation>100)  return;
		canvas.fillStyle=RGB_Calc.to.hex(BeezEye.nativeToRGB(hue, saturation, color_value));
		canvas.beginPath();
		hexagon(center.x+cell, center.y-row, radius, radius);
		canvas.closePath();
		canvas.fill();  }  }


BeezEye.nativeToRGB=function(h,s,v)  {
	var i, model;
	for (i=0; i<settings.model.length; i++)  {
		if (settings.model[i].checked)  {model=settings.model[i].value.toLowerCase();  break;}  }
	switch (model)  {
	case 'cmyk':
		return RGB_Calc.from.cmyk(SoftMoon.WebWare.HSVA_Color.to_CMYK([h/360, s/100, v/100]));
	default:
		return RGB_Calc.from[model]([h/360, s/100, v/100]);  }  }


BeezEye.calcNativeHSV=function(x, y, maxRadius)  {  // {x,y} are Cartesian co-ordinates
	hue=(Math.Trig.getAngle(x,y)/π)*180;
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
			saturation=(Math.tan( Math.atan(Math.tan(saturation * π - π_2) / curve) /2 ) + 1)/2;  }
		else  {
			if (curve<=50)  curve=1-((51-curve)/50);  //  curve becomes:  0 < curve <= 1
			else            curve=((curve-50)/25)+1;  //  curve becomes:  1 < curve <= 3
			saturation=Math.sin(Math.atan( Math.tan( saturation * π_2 ) / curve ) + π*1.5) + 1;  }  }
	color_value=parseInt(color_value  ||  settings.value.value);
	//  the return value variables are global to BeezEye.buildPalette and BeezEye.getColor, and the return value is therein ignored.
	// hue format is degrees; others are as percents (0-100) although saturation may be greater than 100 meaning the color is invalid: {x,y} is out of the BeezEye
	return [hue, saturation*=100, color_value];  }


BeezEye.getColor=function(event)  {
	const
			palette=document.querySelector("#MasterColorPicker #BeezEye canvas"),
			pStylz=getComputedStyle(palette),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
			center={x: Math.round(w/2), y: Math.round(h/2)},
			variety=settings.variety.value,
			space={x: w/variety};
			space.y=Math.sin(_['60°'])*space.x;
	const
			maxSatPoint=w/2-space.x/2;
	var x=Math.round((event.offsetX-center.x)/space.x)*space.x,
			y=center.y-event.offsetY;
	const
			row=Math.round(y/space.y);
	y=row*space.y;
	if (row%2)  x+=space.x/2;
	BeezEye.calcNativeHSV(x, y, maxSatPoint);  // globals ↓
	if (saturation>100)  return;
	return new BeezEye.Color_SpecCache(hue, saturation, color_value);  }

BeezEye.Color_SpecCache=function(h, s, v)  { // degrees, percent, percent  → but ¡NO percent% or degrees° marks!
		if (!new.target)  throw new Error('SoftMoon.WebWare.BeezEye.Color_SpecCache is a constructor, not a function.');
		var i, model;
		for (i=0; i<settings.model.length; i++)  {
			if (settings.model[i].checked)  {model=settings.model[i].value.toUpperCase();  break;}  }
		this.model=model;
		h/=360; s/=100;  v/=100;
		MasterColorPicker.RGB_calc.config.stack({inputAsFactor: {value: true}, preserveInputArrays: {value: true}});
		try {
		if (model==='CMYK')  {
			SoftMoon.WebWare.HSVA_Color.config.CMYKA_Factory=SoftMoon.WebWare.CMYKA_Color;
			this.CMYK=SoftMoon.WebWare.HSVA_Color.to_CMYK([h, s, v]);
			this.RGB=MasterColorPicker.RGB_calc.from.cmyk(this.CMYK.cmyk);
			}
		else  {
			this[model]=SoftMoon.WebWare.ColorWheel_Color.create(h, s, v, undefined, undefined, model);
			this.RGB=MasterColorPicker.RGB_calc.from[model.toLowerCase()]([h, s, v]);
			}  }
		finally {MasterColorPicker.RGB_calc.config.cull();}  }
BeezEye.Color_SpecCache.prototype=Object.create(
			SoftMoon.WebWare.Color_Picker.Color_SpecCache,
			{name: {value: "BeezEye.Color_SpecCache"},
			 constructor: {value: BeezEye.Color_SpecCache}});


UniDOM.addEventHandler(window, 'onload', function()  {
		//first we set the private global members                                        ↓  this defines property names (of the array-object: settings)
		settings=UniDOM.getElementsBy$Name(document.getElementById('BeezEye'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <input>s) into an array, with corresponding properties
		const
			lbl=settings.value.parentNode,
			crv=settings.curve_value,
			twt=settings.twist_value;
		for (let i=0; i<settings.model.length; i++)  {
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
		const cnvsWrap=document.querySelector("#MasterColorPicker #BeezEye canvas").parentNode;
		UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut', 'onclick'], BeezEye);
		BeezEye.buildPalette();

		function setColorSpace(flag)  { // flag is false upon start-up and ==true (it’s an “onchange” Event Object) otherwise
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

}  // close BeezEye namespace



/*==================================================================*/

{ //open a private namepsace for RainbowMaestro

const
		RGB_Calc=SoftMoon.WebWare.RGB_Calc,
		RainbowMaestro=
			SoftMoon.WebWare.RainbowMaestro=
				new SoftMoon.WebWare.Color_Picker('RainbowMaestro');

RainbowMaestro.grayRing={inRad: 12/360, outRad: 30/360};   //default canvas width is 360 px…
RainbowMaestro.smRainbowRing={inRad: 50/360, outRad: 60/360};
RainbowMaestro.lgRainbowRing={inRad: 178/360, outRad: 180/360};
RainbowMaestro.focalHuesRing={outRad: 175/360};  //  inRad is always outRad/2


let settings, hexagonSpace, focalHue;

RainbowMaestro.buildPalette=function(onlyColorblind)  {
	focalHue=parseFloat(settings.focalHue.value);
	if (RainbowMaestro.hueAngleUnit!=='rad'  &&  RainbowMaestro.hueAngleUnit!=='ᴿ'  &&  RainbowMaestro.hueAngleUnit!=='ᶜ')
		focalHue=(focalHue/RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])*π2;
	var f, h, hcg, i, j, k, km, sa, ea, grdnt, r, x, y, fb, fa, fh, sp, ep, da, dh,
			variety=parseInt(settings.variety.value);
	const
			oc=document.getElementById('RainbowMaestro').getElementsByTagName('canvas'),
			inRad=new Array, outRad=new Array, cnvs=new Array,
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

	RGB_Calc.config.stack({RGBA_Factory: {value: Array},
												useHexSymbol: {value: true},
												roundRGB: {value: false} });

	try {
	for (j=0; j<variety; j++)  {  // black-grays-white picker ring
		h=255*(j/(variety-1));  h=[h,h,h];  h.hcga=[0,0,j/(variety-1)];
		sa=π2*(j/variety);
		ea=π2*((j+1)/variety);
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
		cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, inRad[i], 0, π2);
		cnvs[i].context.stroke();
		grdnt=cnvs[i].context.createLinearGradient(cnvs[i].centerX, cnvs[i].centerY+outRad[i], cnvs[i].centerX, cnvs[i].centerY-outRad[i]);
		grdnt.addColorStop(0, '#FFFFFF')
		grdnt.addColorStop(1, '#000000')
		cnvs[i].context.strokeStyle=grdnt;
		cnvs[i].context.beginPath();
		cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, outRad[i], 0, π2);
		cnvs[i].context.stroke();  }

	// color rings
	f=function(rgb, a) {return RGB_Calc.to.hex((i===0) ?  rgb  :  (rgb.hcga=[a/π2,1,.5],  RGB_Calc.to.colorblind(rgb, cbTypes[i-1])));};
	fb=function(rgb, a)  { return f(
			settings.splitComplement.checked  ?
					RGB_Calc.from.hue( ( (Math.Trig.ellipseAngle(a-focalHue, 1/3) + focalHue) % _['360°'] ) / π2 )
				: rgb,
			a );  };
	for (i=beginCount; i<cnvs.length; i++)  { //cycle through each canvas
		cnvs[i].context.rainbowRing(
			cnvs[i].centerX,  cnvs[i].centerY,
			Math.floor(cnvs[i].width*this.smRainbowRing.outRad),
			Math.floor(cnvs[i].width*this.smRainbowRing.inRad),
			f );
		cnvs[i].context.rainbowRing(
			cnvs[i].centerX,  cnvs[i].centerY,
			Math.floor(cnvs[i].width/2),
			Math.floor(cnvs[i].width*this.lgRainbowRing.inRad),
			fb );  }

/*
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
*/
	// focal shades: hexagons arranged in a triangle
	// “loose diamonds”: mathematically-harmonious (¡NOT exactly color harmony!) hues & shades that fall between focal hues
	variety--;
	function lineTo(x2, y2) {cnvs[i].context.lineTo(x2, y2);};

	for (i=beginCount; i<cnvs.length; i++)  { //cycle through each canvas
		const
			outRad=Math.floor(cnvs[i].width*this.focalHuesRing.outRad),
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
				SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon(cnvs[i].context, lineTo, 6, x, y, h_r, h_r, _['90°']);
				cnvs[i].context.closePath();
				cnvs[i].context.fill();  }  }
			cnvs[i].context.restore();  }
		cnvs[i].context.restore();  }

	}finally{RGB_Calc.config.cull();}
	};  // close  RainbowMaestro.buildPalette



let mouseColor, targetHue; //private members

RainbowMaestro.getColor=function(event)  { mouseColor=null;  targetHue=null;
	if (event.target===event.currentTarget)  return null;

	MasterColorPicker.RGB_calc.config.stack({inputAsFactor: {value: true}});
	try {

	focalHue=parseFloat(settings.focalHue.value);  //private member
	if (RainbowMaestro.hueAngleUnit!=='rad'  &&  RainbowMaestro.hueAngleUnit!=='ᴿ'  &&  RainbowMaestro.hueAngleUnit!=='ᶜ')
		focalHue=(focalHue/RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])*π2;
	const
			pStylz=getComputedStyle(event.target),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
			x=event.offsetX-Math.round(w/2),
			y=Math.round(h/2)-event.offsetY,
			r=Math.sqrt(x*x+y*y),
			variety=parseInt(settings.variety.value);
	var a=Math.Trig.getAngle(x, y),
			color=null;

	calcColor: {

	if (r<w*this.grayRing.inRad)  break calcColor;
	if (r<w*this.grayRing.outRad)  {

		const g=1-Math.floor(a*variety/_['360°'])*(1/(variety-1));
		color=mouseColor=new RainbowMaestro.Color_SpecCache(
				MasterColorPicker.RGB_calc.from.rgb([g,g,g]),  0, 0, g,  'grays');
		break calcColor;  }
	if (r<w*this.smRainbowRing.inRad)  break calcColor;
	if (r<w*this.smRainbowRing.outRad)  {
		if (settings.websafe.checked)  a=Math.round(a/_['24°'])*_['24°'];
    targetHue=a;
		color=mouseColor=new RainbowMaestro.Color_SpecCache(
				MasterColorPicker.RGB_calc.from.hue(a/_['360°']),  a, 1, .5, 'smRainbow', a);
		break calcColor;  }
	if (r<w*this.focalHuesRing.outRad/2)  {
    targetHue=a;
		break calcColor;  }

	if (r<w*this.focalHuesRing.outRad)  {
		var fa, chroma, gray;

		focalHueTriangle: {
		fa=Math.round(Math.rad(a-focalHue)/_['60°'])*_['60°']+focalHue;
		const cgp=Math.Trig.polarToCartesian(r, a-fa);  //get chroma/gray point: {x,y} calculated as if the color-triangle in question is rotated to point the full-color tip to the 3:00 (0°) position, i.e. the tip is on the positive x-axis
		chroma= Math.floor((w*this.focalHuesRing.outRad-cgp.x)/(hexagonSpace.x));  //inverse progression from Chroma-factor
		if (chroma>variety-2)  break calcColor;  //break focalHueTriangle;  //area just below focal triangles - currently unused.
		gray= Math.floor((cgp.y+(chroma+1)*hexagonSpace.y/2)/hexagonSpace.y);  //get gray level
		if (gray<0  ||  gray>chroma)  break focalHueTriangle;
		gray=(chroma===0) ? .5 : gray/chroma;  //get gray factor
		chroma=1-chroma/(variety-1);  //get chroma factor
		if (settings.splitComplement.checked  &&  !settings.websafe.checked)
			fa=Math.Trig.ellipseAngle(fa-focalHue, 1/3)+focalHue;
		fa=Math.rad(fa);
		color=mouseColor=new RainbowMaestro.Color_SpecCache(
				MasterColorPicker.RGB_calc.from.hcg([fa/π2,  chroma,  gray]),
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
		color=mouseColor=new RainbowMaestro.Color_SpecCache(
				MasterColorPicker.RGB_calc.from.hcg([fa/π2,  chroma,  gray]),
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
		color=mouseColor=new RainbowMaestro.Color_SpecCache(
				MasterColorPicker.RGB_calc.from.hue(a/_['360°']),  a, 1, .5, 'lgRainbow', a);  }

	}  //close  calcColor

	}  //close “try”
	finally {MasterColorPicker.RGB_calc.config.cull();}
	return color;  }  //close getColor


RainbowMaestro.Color_SpecCache= class extends SoftMoon.WebWare.Color_Picker.Color_SpecCache {
	constructor(RGB, H, C, G, ring, targetHue)  {
		if (!new.target)  throw new Error('RainbowMaestro.Color_SpecCache is a constructor, not a function.');
		super(new SoftMoon.WebWare.HCGA_Color(Math.rad(H)/π2, C, G), 'HCG', RGB);
		this.ring=ring;
		this.targetHue=targetHue;  }  }
RainbowMaestro.Color_SpecCache.prototype.name="RainbowMaestro.Color_SpecCache";


//unused function for your hacking convenience:
// you must call RainbowMaestro.getColor(event) before calling this
RainbowMaestro.getTargetHue=function()  {return targetHue;}


/******note below that  Color_Picker.…mouse…  calls  RainbowMaestro.getColor  before  handleMouse  is called******/
RainbowMaestro.handleMouse=function(event)  {
	if (event.type==='mouseout')  {mouseColor=null;  targetHue=null;}
	if (!settings.lock.checked  &&  !settings.websafe.checked)  {
		const hueIndicator=document.querySelector('#RainbowMaestro_hueIndicator span.hueIndicator').firstChild;
		hueIndicator.data=(targetHue===null)  ?  ""
			:  (Math.roundTo(
											 SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[RainbowMaestro.hueAngleUnit],
											 (targetHue/π2)*RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])
					+ RainbowMaestro.hueAngleUnit);
		UniDOM.useClass(hueIndicator.parentNode, 'active', targetHue!==null);  }
	const spsw=document.getElementById('RainbowMaestro').getElementsByClassName('subpalette_swatch'),
				count= settings.colorblind.checked  ?  spsw.length : 1;
	RGB_Calc.config.stack({useHexSymbol: {value: true},  RGBA_Factory: {value: Array},  roundRGB: {value: false}});
	try {for (var i=0; i<count; i++)  {
		spsw[i].style.backgroundColor= (mouseColor)  ?   // && mouseColor.ring
			((i>0) ?  RGB_Calc.to.hex(RGB_Calc.to.colorblind(mouseColor.RGB.rgba, RGB_Calc.to.colorblind.types[i-1]))
						 :  mouseColor.RGB.hex)
		: "";  }  }
	finally {RGB_Calc.config.cull();}  };

/****** note below that  Color_Picker.onclick  calls  RainbowMaestro.getColor  before  handleClick  is called ******/
RainbowMaestro.handleClick=function()  {
	if (!settings.lock.checked && !settings.websafe.checked  &&  targetHue!==null)  {
		settings.focalHue.value= Math.roundTo(
			SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[RainbowMaestro.hueAngleUnit],
			(RainbowMaestro.hueAngleUnit==='rad'  ||  RainbowMaestro.hueAngleUnit==='ᴿ'  ||  RainbowMaestro.hueAngleUnit==='ᶜ')  ?
					targetHue
				: (targetHue/π2)*RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit] );
		RainbowMaestro.buildPalette();  }  }

RainbowMaestro.showColorblind=function()  {
	UniDOM.useClass(document.getElementById('RainbowMaestro'), 'no_colorblind', !this.checked);
	if (this.checked) RainbowMaestro.buildPalette(true);  }

RainbowMaestro.makeWebsafe=function(flag)  {
	if (settings.lock.checked)  this.checked=false;
	else
	if (this.checked  ||  flag===true)  { settings.websafe.checked=true;
		settings.focalsOnly.checked=false;
		settings.variety.value='6';
		settings.splitComplement.checked=false;
		RainbowMaestro.buildPalette();  }  }

RainbowMaestro.makeSplitComplement=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	if (settings.lock.checked)  this.checked=false;
	else  {
		if (flag)  { settings.splitComplement.checked=true;
			settings.websafe.checked=false;  }
		RainbowMaestro.buildPalette();  }  }

RainbowMaestro.alterVariety=function(event)  {
	if (settings.lock.checked
	||  (event.type==='change'  &&  (!event.enterKeyed  ||  event.enterKeyPressCount>1)) )  return;
	settings.websafe.checked=false;
	if (typeof arguments[0] == 'number'  ||  (typeof arguments[0] == 'string' &&  ( /^[0-9]+$/ ).test(arguments[0])))
		settings.variety.value=arguments[0];
	RainbowMaestro.buildPalette();  }

RainbowMaestro.lock=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	else  this.checked=flag;
	settings.websafe.disabled=flag;
	settings.splitComplement.disabled=flag;
	settings.variety.disabled=flag;
	settings.focalHue.disabled=flag;  }

RainbowMaestro.handle_focalsOnly=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	else  settings.focalsOnly.checked=flag;
	if (flag)  settings.websafe.checked=false;
	RainbowMaestro.buildPalette();  }

//unused function for your hacking convenience
RainbowMaestro.setFocalHue=function(hueAngle, radianFlag)  {  hueAngle=parseFloat(hueAngle);
	if (radianFlag)  settings.focalHue.value=hueAngle;
	else  settings.focalHue.value=Math.roundTo(
		SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[RainbowMaestro.hueAngleUnit],
		(hueAngle/RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])*π2);
	if (hueAngle !== focalHue)
		RainbowMaestro.buildPalette();  }

UniDOM.addEventHandler( window, 'onload', function()  {
		RainbowMaestro.hueAngleUnit=document.getElementsByName('MasterColorPicker_hue_angle_unit')[0].value;
		//first we set the private global members                                               ↓  this defines property names (of the array-object: settings)
		settings=UniDOM.getElementsBy$Name(document.getElementById('RainbowMaestro'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <inputs>s) into an array, with corresponding properties
		if (!settings.colorblind.checked)  //the colorblind provider initiator will build the palette otherwise
			UniDOM.addEventHandler(window, 'mastercolorpicker_ready', ()=>{RainbowMaestro.buildPalette();}, {once:true});
		UniDOM.addEventHandler(settings.websafe, 'onchange', RainbowMaestro.makeWebsafe);
		UniDOM.addEventHandler(settings.splitComplement, 'onchange', RainbowMaestro.makeSplitComplement);
		UniDOM.addEventHandler(settings.lock, 'onchange', RainbowMaestro.lock);
		UniDOM.addEventHandler(settings.colorblind, 'onchange', RainbowMaestro.showColorblind);
		UniDOM.addEventHandler(settings.variety, ['onmouseup', 'onchange', 'onblur'], RainbowMaestro.alterVariety);
		UniDOM.addEventHandler(settings.focalsOnly, 'onchange', RainbowMaestro.handle_focalsOnly);

		UniDOM.addEventHandler(settings.focalHue, 'onchange', function(event)  {
			settings.websafe.checked=false;
			if (this.value)  {
				const
					// here we rely on <input type='numeric'> to properly manage the content of the input’s value
					u=this.value.match(/[^-+0-9.]+$/),
					t=Math.turn((parseFloat(this.value)||0) / RGB_Calc.hueAngleUnitFactors[ u ? u[0] : RainbowMaestro.hueAngleUnit ]);
				this.value=Math.roundTo(
					SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[RainbowMaestro.hueAngleUnit],
					t*RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit]);  }
			else  this.value='0';
			if ((this.value/RGB_Calc.hueAngleUnitFactors[RainbowMaestro.hueAngleUnit])*π2 !== focalHue) //focalHue is a private member
				RainbowMaestro.buildPalette();  } );

		UniDOM.useClass(document.getElementById('RainbowMaestro'), 'no_colorblind', !settings.colorblind.checked);

		RainbowMaestro.txtInd=document.getElementById('RainbowMaestro_indicator');
		RainbowMaestro.swatch=document.getElementById('RainbowMaestro_swatch');
		const cnvsWrap=document.getElementById('RainbowMaestro').getElementsByTagName('canvas')[0].parentNode;
		UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut'], [RainbowMaestro, RainbowMaestro.handleMouse]);
		UniDOM.addEventHandler(cnvsWrap, ['onclick', 'oncontextmenu'], [RainbowMaestro, RainbowMaestro.handleClick]);
	} );

}  //close  RainbowMaestro private namespace




/*==================================================================*/

{  // open a private namespace for SimpleSqColorPicker

	let settings, variety, cnvs, sbcnvs=new Array();
	const
		RGB_calc=new SoftMoon.WebWare.RGB_Calc({
				useHexSymbol: true,
				inputAsFactor: true,
				RGBA_Factory: Array,
				throwErrors: true }),
		SimpleSqColorPicker=
			SoftMoon.WebWare.SimpleSqColorPicker=
				new SoftMoon.WebWare.Color_Picker('Simple²');

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

SimpleSqColorPicker.buildPalette=function(event)  {
	if (event  &&  event.type==='change'  &&  (!event.enterKeyed  ||  event.enterKeyPressCount>1))  return;
	cnvs=initBuild('Simple²wrapper');
	const
		space={ x: cnvs.width/(variety + (variety%2 ? 0 : 1)),
						y: cnvs.height/variety },
		centerX=cnvs.width/2;
	var x, y;
	for (x=0; x<cnvs.width; x+=space.x)  { for (y=0; y<cnvs.height; y+=space.y)  {
		try {
			cnvs.context.fillStyle=RGB_calc.to.hex(RGB_calc.from.hcg([
				y/cnvs.height,
				1-Math.abs((centerX-x-space.x/2)/centerX),
				(x<centerX) ? 0 : 1
			]));
		} catch(e) {continue;}   //round-off errors at high-end of palette
		cnvs.context.beginPath();
		cnvs.context.fillRect(x, y, space.x+.5, space.y+.5);  }  }
	updateIndicators();
	updateAllSubs();  }

let space, c,
		hue=.5,
		sat=.5, lvl=.5;
function build_sats(model)  {
	for (var y=0; y<variety; y++)  {
		sbcnvs[c].context.fillStyle=RGB_calc.to.hex(RGB_calc.from[model]([hue, 1-(y/(variety-1)), lvl]));
		sbcnvs[c].context.beginPath();
		sbcnvs[c].context.fillRect(0, y*space,  sbcnvs[c].width, space+.5);  }
	y=sbcnvs[c].height-(sat*(variety-1)*space+space/2);
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
	for (var x=0; x<variety; x++)  {
		sbcnvs[c].context.fillStyle=RGB_calc.to.hex(RGB_calc.from[model]([hue, sat, x/(variety-1)]));
		sbcnvs[c].context.beginPath();
		sbcnvs[c].context.fillRect(x*space, 0,  space+.5, sbcnvs[c].height);  }
	x=lvl*(variety-1)*space+space/2;
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

SimpleSqColorPicker.build_hSv=function()  {
	sbcnvs[c=0]=initBuild('Simple²hSv');
	space=sbcnvs[c].height/(variety);
	build_sats('hsv');  }

SimpleSqColorPicker.build_hSl=function()  {
	sbcnvs[c=1]=initBuild('Simple²hSl');
	space=sbcnvs[c].height/(variety),
	build_sats('hsl');  }

SimpleSqColorPicker.build_hsV=function()  {
	sbcnvs[c=2]=initBuild('Simple²hsV');
	space=sbcnvs[c].width/(variety);
	build_lvls('hsv');  }

SimpleSqColorPicker.build_hsL=function()  {
	sbcnvs[c=3]=initBuild('Simple²hsL');
	space=sbcnvs[c].width/(variety);
	build_lvls('hsl');  }

let moHue, moSat, moLvl;

SimpleSqColorPicker.handleClick=function(event, colorSpace)  {
	SimpleSqColorPicker.handleClick[colorSpace](event);  };

SimpleSqColorPicker.getColor=function(event, colorSpace)  {
	return this.getColor[colorSpace](event);  };

SimpleSqColorPicker.getColor.hcg=function(event)  {
	if (event.offsetX<=0 || event.offsetY<=0 || event.offsetX>=cnvs.width || event.offsetY>=cnvs.height)  return false;
	const
		vrtyX=variety + (variety%2 ? 0 : 1),
		spaceX=cnvs.width/vrtyX,
		blockX=Math.ceil(event.offsetX/spaceX);
	moHue=Math.floor((event.offsetY/cnvs.height)*variety)/variety;
	moSat=1-Math.abs((vrtyX+1)/2-blockX)*2/vrtyX;
	document.getElementById('Simple²hue').firstChild.data=Math.roundTo(
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[SimpleSqColorPicker.hueAngleUnit],
				moHue*SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[SimpleSqColorPicker.hueAngleUnit]) + SimpleSqColorPicker.hueAngleUnit;
	return getColor('HCG', moHue, moSat, Math.floor(event.offsetX/(cnvs.width/2)));  }


function getColor(model, h, c_s, g_v_l)  { var clr;
/*
		MasterColorPicker.RGB_calc.config.stack({
				inputAsFactor: {value: true},
				onError: {value: function() {throw null;}}});
*/
		try {clr=new SimpleSqColorPicker.Color_SpecCache(model, h, c_s, g_v_l);}
		catch(e)  {  //round-off errors at high-end of palette
			clr=false;  }
//		MasterColorPicker.RGB_calc.config.cull();
		return clr;  }

SimpleSqColorPicker.Color_SpecCache= class extends SoftMoon.WebWare.Color_Picker.Color_SpecCache {
	constructor(model, h, c_s, g_v_l)  {
		if (!new.target)  throw new Error('“SimpleSqColorPicker.Color_SpecCache” is a constructor, not a function.');
		super(SoftMoon.WebWare.ColorWheel_Color.create(h, c_s, g_v_l, undefined, undefined, model), model);  }  }
SimpleSqColorPicker.Color_SpecCache.prototype.name="SimpleSqColorPicker.Color_SpecCache";



SimpleSqColorPicker.handleClick.hcg=function(event) {
	hue=moHue;
	settings.focalHue.value=Math.roundTo(
			SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[SimpleSqColorPicker.hueAngleUnit],
			moHue*SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[SimpleSqColorPicker.hueAngleUnit]);
	if (!settings.lock.checked)  sat=moSat;
	updateAllSubs();
	updateIndicators();  }

function updateAllSubs()  {
		SimpleSqColorPicker.build_hSv();
		SimpleSqColorPicker.build_hSl();
		SimpleSqColorPicker.build_hsV();
		SimpleSqColorPicker.build_hsL();  };

SimpleSqColorPicker.getColor.hSl=function(event)  {
	if (event.offsetX<=0 || event.offsetY<=0 || event.offsetX>=sbcnvs[0].width || event.offsetY>=sbcnvs[0].height)  return false;
	moSat=1-Math.floor(event.offsetY/(sbcnvs[0].height/(variety)))/(variety-1);
	return getColor('HSL', hue, moSat, lvl);  }

SimpleSqColorPicker.getColor.hSv=function(event)  {
	if (event.offsetX<=0 || event.offsetY<=0 || event.offsetX>=sbcnvs[1].width || event.offsetY>=sbcnvs[1].height)  return false;
	moSat=1-Math.floor(event.offsetY/(sbcnvs[1].height/(variety)))/(variety-1);
	return getColor('HSV', hue, moSat, lvl);  }

SimpleSqColorPicker.getColor.hsV=function(event)  {
	if (event.offsetX<=0 || event.offsetY<=0 || event.offsetX>=sbcnvs[2].width || event.offsetY>=sbcnvs[2].height)  return false;
	moLvl=Math.floor(event.offsetX/(sbcnvs[2].width/(variety)))/(variety-1);
	return getColor('HSV', hue, sat, moLvl);  }

SimpleSqColorPicker.getColor.hsL=function(event)  {
	if (event.offsetX<=0 || event.offsetY<=0 || event.offsetX>=sbcnvs[3].width || event.offsetY>=sbcnvs[3].height)  return false;
	moLvl=Math.floor(event.offsetX/(sbcnvs[3].width/(variety)))/(variety-1);
	return getColor('HSL', hue, sat, moLvl);  }

function updateIndicators()  {  //private
		document.getElementById('Simple²hue').firstChild.data=Math.roundTo(
					SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[SimpleSqColorPicker.hueAngleUnit],
					hue*SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[SimpleSqColorPicker.hueAngleUnit]) + SimpleSqColorPicker.hueAngleUnit;
		document.getElementById('Simple²saturation').firstChild.data=Math.roundTo(1, sat*100)+'%';
		document.getElementById('Simple²lvl').firstChild.data=Math.roundTo(1, lvl*100)+'%';  }

SimpleSqColorPicker.handleClick.hSv=
SimpleSqColorPicker.handleClick.hSl=function(event)  {
	if (settings.lock.checked)  return;
	sat=moSat;
	updateAllSubs();
	updateIndicators();  }

SimpleSqColorPicker.handleClick.hsL=
SimpleSqColorPicker.handleClick.hsV=function(event)  {
	if (settings.lock.checked)  return;
	lvl=moLvl;
	updateAllSubs();
	updateIndicators();  }

function updateFocalHue()  {
		const
			factors=SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors,
			v=this.value;
		if (v)  {
			// here we rely on <input type='numeric'> to properly manage the content of the input’s value
			const u= v.match(/[^-−+0-9.]+$/);
			hue= Math.turn((parseFloat(v)||0) / factors[ u ? u[0] : SimpleSqColorPicker.hueAngleUnit ]);
			this.value=Math.roundTo(
					SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[SimpleSqColorPicker.hueAngleUnit],
					hue*factors[SimpleSqColorPicker.hueAngleUnit] );  }
		else {
			hue=0;
			this.value='0';  }  }

UniDOM.addEventHandler( window, 'onload', function()  {
	//first we set the private global members                                        ↓  this defines property names (of the array-object: settings)
	settings=UniDOM.getElementsBy$Name(document.getElementById('Simple²'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <inputs>s) into an array, with corresponding properties

	UniDOM.addEventHandler(settings.focalHue, 'tabIn', function(){this.parentNode.classList.add('focusWithin')});
	UniDOM.addEventHandler(settings.focalHue, 'blur', function(){this.parentNode.classList.remove('focusWithin')});
	UniDOM.addEventHandler(settings.focalHue, 'onChange', [updateFocalHue, updateAllSubs]);
	UniDOM.addEventHandler(settings.variety, ['onMouseUp', 'onChange', 'onBlur'], SimpleSqColorPicker.buildPalette);

	hue= (parseFloat(settings.focalHue.value)||0) / SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[document.getElementsByName('MasterColorPicker_hue_angle_unit')[0].value];


	SimpleSqColorPicker.txtInd=document.getElementById('Simple²indicator');
	SimpleSqColorPicker.swatch=document.getElementById('Simple²swatch');
	SimpleSqColorPicker.noClrTxt=String.fromCharCode(160);
	UniDOM.addEventHandler(document.getElementById('Simple²wrapper'), 'onMouseOut', function()  {
		document.getElementById('Simple²hue').firstChild.data=Math.roundTo(
					SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[SimpleSqColorPicker.hueAngleUnit],
					hue*SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[SimpleSqColorPicker.hueAngleUnit]) + SimpleSqColorPicker.hueAngleUnit;  } );
	const wraps=[
		{id: 'Simple²wrapper', model: 'hcg'},
		{id: 'Simple²hSl', model: 'hSl'},
		{id: 'Simple²hSv', model: 'hSv'},
		{id: 'Simple²hsV', model: 'hsV'},
		{id: 'Simple²hsL', model: 'hsL'} ];
	for (var i=0; i<wraps.length; i++)  {
		const cnvsWrap=document.getElementById(wraps[i].id);
		UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut'], SimpleSqColorPicker, false, wraps[i].model);
		UniDOM.addEventHandler(cnvsWrap, 'onClick', [SimpleSqColorPicker, SimpleSqColorPicker.handleClick], false, wraps[i].model);  }

	UniDOM.addEventHandler(window, 'mastercolorpicker_ready', SimpleSqColorPicker.buildPalette, {once:true});  } );

}  // close SimpleSqColorPicker namespace
/*==================================================================*/




{// open a private namespace for YinYangNiHong

//                                    ↓factor(0-1)    ↓factor(0-1)
let baseCanvas, mainCanvas, settings, focalHue=0, swatchHue=0, aniOffset=0, Color;
const
	RGB_Calc=SoftMoon.WebWare.RGB_Calc,
	YinYangNiHong=
		SoftMoon.WebWare.YinYangNiHong=
			new SoftMoon.WebWare.Color_Picker('YinYang NíHóng');



YinYangNiHong.buildBasePalette=function()  {
	baseCanvas=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas')[0];
	baseCanvas.context=baseCanvas.getContext('2d');
	baseCanvas.centerX=baseCanvas.width/2;
	baseCanvas.centerY=baseCanvas.height/2;
	var inRad=Math.min(baseCanvas.centerX, baseCanvas.centerY)-13;

	baseCanvas.context.beginPath();
	baseCanvas.context.fillStyle='#FFFFFF';
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY, inRad, 0, π2);
	baseCanvas.context.fill();
	baseCanvas.context.beginPath();
	baseCanvas.context.fillStyle='#000000';
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY+inRad/2, inRad/2, π_2, π3_2, false);
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY-inRad/2, inRad/2, π_2, π3_2, true);
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY, inRad, π3_2, π_2, false);
	baseCanvas.context.fill();

	RGB_Calc.config.stack({RGBA_Factory: {value: Array},
												useHexSymbol: {value: true},
												roundRGB: {value: false} });
	try {
	inRad=Math.floor(inRad);
	baseCanvas.context.rainbowRing(
		Math.floor(baseCanvas.centerX), Math.floor(baseCanvas.centerY),  inRad+13, inRad );  }
//	SoftMoon.WebWare.canvas_graphics.rainbowRing(
//		baseCanvas.context,  Math.floor(baseCanvas.centerX), Math.floor(baseCanvas.centerY),  inRad+13, inRad );  }
	finally {RGB_Calc.config.cull();}  }



//for animated yin/yang
YinYangNiHong.buildHueSwatches=function(hue)  { //hue should be between 0-1
	if (typeof hue === 'undefined')  hue=swatchHue;
	RGB_Calc.config.stack({RGBA_Factory: {value:Array}});
	try {
	const
		canvases=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas'),
		cnvs=document.createElement('canvas');
	var grad;
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
	cnvs.context.arc(43.5, 43.5, 43.5, 0, π2);
	cnvs.context.fill();
	cnvs.context.beginPath();
	grad=cnvs.context.createRadialGradient(43.5, 253.5, 0,  43.5, 253.5, 43.5);
	if (aniOffset)
		grad.addColorStop(0, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, aniOffset, 1])));
	grad.addColorStop(aniOffset, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, 1, 1])));
	grad.addColorStop(1, RGB_Calc.to.hex(RGB_Calc.from.hcg([hue, aniOffset, 1])));
	cnvs.context.fillStyle=grad;
	cnvs.context.arc(43.5, 253.5, 43.5, 0, π2);
	cnvs.context.fill();  }
	finally {RGB_Calc.config.cull();}  }


YinYangNiHong.buildPalette=function()  {
	RGB_Calc.config.stack({RGBA_Factory: {value: SoftMoon.WebWare.RGBA_Color},  roundRGB: {value: true}});
	try {
	const
		canvases=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas'),
		cnvs=document.createElement('canvas'),
		hue=RGB_Calc.from.hue(focalHue);
	var grad;
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
			grad=cnvs.context.createLinearGradient(0,0, 0,255);
			grad.addColorStop(0, hue.toString('css'));
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 255, 255);
			grad=cnvs.context.createLinearGradient(0,0, 255,0);
			grad.addColorStop(0, 'rgba(0,0,0,1)');
			grad.addColorStop(1, 'rgba(0,0,0,0)');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 255, 255);
			break;
	case 'HSL':
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 255,0);
			grad.addColorStop(0, '#000000');
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 255, 255);
			grad=cnvs.context.createLinearGradient(0,0, 0,255);
			hue.a=1;
			grad.addColorStop(0, hue.toString('css'));
			hue.a=0;
			grad.addColorStop(1, hue.toString('css'));
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 255, 255);
			grad=cnvs.context.createLinearGradient(0,0, 255,0);
			grad.addColorStop(0, 'rgba(0,0,0,1)');
			grad.addColorStop(.5, 'rgba(128,128,128,0)');
			grad.addColorStop(1, 'rgba(255,255,255,1)');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 255, 255);
			break;
	case 'HCG':
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 255,0);
			grad.addColorStop(0, '#000000');
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 255, 255);
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 0,255);
			hue.a=1;
			grad.addColorStop(0, hue.toString('css'));
			hue.a=0;
			grad.addColorStop(1, hue.toString('css'));
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 255, 255);  }  }
	finally {RGB_Calc.config.cull();}  }


YinYangNiHong.getColor=function(event)  {
	const RGB_calc=MasterColorPicker.RGB_calc;
	Color=null;  //private
	for (var mode, i=0; i<settings.length; i++)  {if (settings[i].checked)  {mode=settings[i].value.toUpperCase();  break;}}
	if (event.target===baseCanvas)  {
		const
			x=event.offsetX-baseCanvas.centerX,
			y=baseCanvas.centerY-event.offsetY,
			r=Math.sqrt(x*x+y*y),
			fa=Math.Trig.getAngle(x,y)/π2;
		if (r>baseCanvas.centerX  ||  r<baseCanvas.centerX-13)  return null;
		RGB_calc.config.stack({inputAsFactor: {value: true}});
		try  { Color=new YinYangNiHong.Color_SpecCache(
			RGB_calc.from.hue(fa),
			mode,
			fa, 1, (mode=='HSL') ? .5 : 1,
			fa*RGB_Calc.hueAngleUnitFactors[this.hueAngleUnit] );  }
		finally {RGB_calc.config.cull();}
		return Color;  }
	if (event.target===mainCanvas)  {
		let x=event.offsetX,
				y=event.offsetY;
		if (x>=0 && x<=255 && y>=0 && y<=255)  {
			RGB_calc.config.stack({inputAsFactor: {value: true}});
			try  { Color=new YinYangNiHong.Color_SpecCache(
				 RGB_calc.from[mode.toLowerCase()]([focalHue,  y=1-y/255,  x=x/255]),
				 mode,
				 focalHue, y, x);  }
			finally {RGB_calc.config.cull();}
			return Color;  }  }
	return null;  }

YinYangNiHong.Color_SpecCache= class extends SoftMoon.WebWare.Color_Picker.Color_SpecCache {
	constructor(rgb, model, h, c_s, g_l_v, fa)  {
		if (!new.target)  throw new Error('“YinYangNiHong.Color_SpecCache” is a constructor, not a function.');
		super(SoftMoon.WebWare.ColorWheel_Color.create(h, c_s, g_l_v, undefined, undefined, model), model, rgb);
		this.focal=fa;  }  }
YinYangNiHong.Color_SpecCache.prototype.name="YinYangNiHong.Color_SpecCache";


let hueIndicator;

//these mouse event handlers are maintained by UniDOM, and “this” refers to YinYangNiHong
YinYangNiHong.onmousemove=function(event)  {
	this.constructor.prototype['on'+event.type].apply(this, arguments);
	if (Color?.focal!==undefined   &&  event.type==='mousemove')  {
		mainCanvas.style.display='none';
		swatchHue=Color[Color.model].hue;
		hueIndicator.classList.add('active');
		hueIndicator.firstChild.data=Math.roundTo(SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[this.hueAngleUnit], Color.focal)+this.hueAngleUnit;  }
	else  {
		mainCanvas.style.display='block';
		swatchHue=focalHue;
		hueIndicator.classList.remove('active');
		hueIndicator.firstChild.data="";  }
	this.buildHueSwatches();  }

YinYangNiHong.onmouseout=YinYangNiHong.onmousemove;


YinYangNiHong.onclick=function()  {
  this.constructor.prototype.onclick.apply(this, arguments);
	if (Color && Color.focal)  {
		focalHue=Color[Color.model].hue;
		settings.focalHueInput.value=Math.roundTo(SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[this.hueAngleUnit], Color.focal);
		this.buildPalette();  }  }

// the animated swatches look cool.  But they also serve to show “perceived” luminocity.
YinYangNiHong.animate=function animate(event)  {
	if (event.classes[0] !== MasterColorPicker.classNames.activePicker)  return;
	if (event.pickerStateFlag)  {
		if (typeof animate.interval != 'number')
			animate.interval=setInterval(
				function() {if ((aniOffset+=1/44) > 1)  aniOffset=0;  YinYangNiHong.buildHueSwatches();},
				47 );  }
	else  {
		clearInterval(animate.interval);
		animate.interval=null;  }  }


UniDOM.addEventHandler( window, 'onload', function()  {
	const
		picker=document.getElementById('YinYangNíHóng');
		//first we set the private global members
	YinYangNiHong.hueAngleUnit= document.getElementsByName('MasterColorPicker_hue_angle_unit')[0].value;
	settings=UniDOM.getElementsBy$Name(picker, '');
	settings.focalHueInput=settings[3];
	function updateFocalHue()  {
		const v=settings.focalHueInput.value;
		if (v)  {
			// here we rely on <input type='numeric'> to properly manage the content of the input’s value
			const u= v.match(/[^-−+0-9.]+$/);
			focalHue= Math.turn((parseFloat(v)||0) / RGB_Calc.hueAngleUnitFactors[ u ? u[0] : YinYangNiHong.hueAngleUnit ]);
			settings.focalHueInput.value=Math.roundTo(
					SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[YinYangNiHong.hueAngleUnit],
					focalHue*RGB_Calc.hueAngleUnitFactors[YinYangNiHong.hueAngleUnit] );  }
		else {
			focalHue=0;
			settings.focalHueInput.value='0';  }
		swatchHue=focalHue;  }
	updateFocalHue();

	UniDOM.addEventHandler(settings.focalHueInput, 'onchange', updateFocalHue);
	UniDOM.addEventHandler(settings, 'onchange', YinYangNiHong.buildPalette);
	hueIndicator=picker.querySelector('.hueIndicator');

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

}  //  close private namespace of YinYangNiHong
/*==================================================================*/




// sinebow based on:
// makeColorGradient thanks to:  http://www.krazydad.com/makecolors.php
SoftMoon.WebWare.sinebow=function(settings, phase, callback)  { var freq=2*π/settings.hue_variety;
	for (var i = 0; i < settings.hue_variety; ++i)  { callback(
		Math.max(0, Math.min(255, Math.sin((2-settings.red_f)*i*freq + settings.red_s + phase.r) * settings.red_v + settings.red_i)),
		Math.max(0, Math.min(255, Math.sin((2-settings.grn_f)*i*freq + settings.grn_s + phase.g) * settings.grn_v + settings.grn_i)),
		Math.max(0, Math.min(255, Math.sin((2-settings.blu_f)*i*freq + settings.blu_s + phase.b) * settings.blu_v + settings.blu_i)) );  }  }  ;



{  // open private namespace of Spectral_ColorPicker
let spectral;
const
		Spectral_CP=new SoftMoon.WebWare.Color_Picker("Spectral"),
		handleMouse=function(event) {Spectral_CP['on'+event.type](event);};
Spectral_CP.canInterlink=false;
Spectral_CP.canIndexLocator=false;
Spectral_CP.getColor=function(event) {return new Spectral_CP.Color_SpecCache(event.target.title);}

Spectral_CP.Color_SpecCache= class extends SoftMoon.WebWare.Color_Picker.Color_SpecCache {
	constructor(txt)  {
		if (!new.target)  throw new Error('“Spectral_CP.Color_SpecCache” is a constructor, not a function.');
		super(null, 'RGB', MasterColorPicker.RGB_calc(txt));  }  }
Spectral_CP.Color_SpecCache.prototype.name="Spectral_CP.Color_SpecCache";

UniDOM.addEventHandler(window, 'onload', function()  {
	spectral=document.getElementById('Spectral');
	Spectral_CP.txtInd=document.getElementById('SpectralIndicator');
	Spectral_CP.swatch=document.getElementById('SpectralSwatch');
	Spectral_CP.noClrTxt=String.fromCharCode(160);
	UniDOM.addEventHandler(spectral, 'change', Spectral_CP.buildPalette);
	Spectral_CP.buildPalette();  });

SoftMoon.WebWare.Spectral_ColorPicker=Spectral_CP;
Spectral_CP.buildPalette=function()  {
	var settings=new Object,  board,
			MSIE=( /MSIE/i ).test(navigator.userAgent),
			palette=(spectral.getElementsByTagName('tbody'))[1];
	if (MSIE)  {   //    ↓ generally ignored
		var tWidth=spectral.offsetWidth  ||  parseInt(getComputedStyle(spectral).width);
		 // fix MS Internet Exploder’s lameness - it will not recognize <input type='range' /> tags when using the native getElementsByTagName() method
		board=UniDOM.getElements(spectral.getElementsByTagName('thead')[0], function(e) {return e.nodeName==='INPUT';});  }
	else  board=spectral.getElementsByTagName('thead')[0].getElementsByTagName('input');
	for (i=0; i<board.length; i++)  {
		if ( board[i].getAttribute('type')==='range'  ||  board[i].checked )   settings[board[i].name]=parseFloat(board[i].value);  }
	settings.phase_shift=9.42-settings.phase_shift-π;
	settings.x_shift=6.28-settings.x_shift;
	settings.red_c-=1;  settings.grn_c-=1;  settings.blu_c-=1;
	var yShift=settings.y_shift*settings.mix_variety*3,
			phase, phaseOff, i, tr, tbody=document.createElement('tbody');
	SoftMoon.WebWare.RGB_Calc.config.stack({useHexSymbol:{value:true}});
	for (i=yShift; i<yShift+settings.mix_variety*3; i++)  {
		phase=(π2/3/settings.mix_variety)*i;
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
	SoftMoon.WebWare.RGB_Calc.config.cull();
	spectral.replaceChild(tbody, palette);
	spectral.getElementsByTagName('thead')[0].getElementsByTagName('td')[0].colSpan=""+settings.hue_variety;
	spectral.getElementsByTagName('thead')[0].getElementsByTagName('td')[0].setAttribute('colspan', ""+settings.hue_variety);
	}
}  //close Spectral_ColorPicker namepsace




/*==================================================================*/


{  //create a private namespace for the Palette Tables manager/constructor


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


// each <script> —loaded palette file should push its palette(s) onto this Array
if (!SoftMoon.loaded_palettes)
	Object.defineProperty(SoftMoon, 'loaded_palettes', {value: new Array, enumerable: true});


/*   If you don’t supply a url  $path  (never use the JavaScript “null” value for the path…it is an “Object”…)
 * then the SoftMoon.WebWare.loadPalettes() function will use its default path to the palettes’ folder on the server.
 * (see RGB_Calc.js : SoftMoon.colorPalettes_defaultPath='color_palettes/';)
 *   If you supply a  $whenLoaded  function, it will be passed the freshly loaded palette name and data
 * before each palette <table> HTML is built.  If this function passes back  true  then the HTML <table>
 * will NOT be built, nor will it be added to the “palette select”; it will be then assumed that this
 * function (the $whenLoaded function) handled all that if required.
 *   If you supply a  $whenDone  function, it will be called after
 * all the palette files are asynchronously loaded and their HTML <table>s are built,
 * just before the document.body.classname{'MCP-init'} is removed,
 * and it will be passed an array of IDBRequest Objects and HTTP-connect Objects
 * (one array entry for each palette file, their requests/connections completed)
 * with two additional properties that are separate Arrays of these same Objects: “dbFiles” and “serverFiles”
 * and these seperate Arrays have additional properties “indexFailed” & “noneGiven” if TRUE,
 * (however, note that “dbFiles” or “serverFiles” may also be undefined if proper),
 * and each Array member will also have a “json_palette” property & a “malformed” property if TRUE,
 * (see the comments for the loadPalettes() & loadDBPalettes() functions in the rgb.js file).
 *   If palette files are being loaded asynchronously (via HTTP or a DataBase)
 * this function returns an Object (see comments at function code end)
 * with properties/members very similar to the ones passed into $whenDone (see above);
 * otherwise this function returns the JavaScript “undefined” value.
 */
SoftMoon.WebWare.initPaletteTables=initPaletteTables;
function initPaletteTables($path, $whenLoaded, $whenDone)  { // ←← optional params;
																														// This format inits (& loads) Palettes from all sources
																													 // (SoftMoon.loaded_palettes, MasterColorPicker’s Database, server)
																													//  if not already initialized (¡except it WILL double load from the same path!).
																												 //   Processed SoftMoon.loaded_palettes’ source files are added to the SoftMoon.hardLoaded_palettes array
										 //   ({IDBDatabase: , storeName: }, $whenLoaded, $whenDone)  // This format only inits SoftMoon.loaded_palettes Palettes
																																								 //  and Palettes from a custom DB (¡it WILL double load from the same store!).
																																								//   Processed SoftMoon.loaded_palettes’ source files are added to the SoftMoon.hardLoaded_palettes array
										 //   ($ArrayOfPalettes, $whenLoaded)  // This format only inits SoftMoon.loaded_palettes Palettes
																													//  and Palettes in the supplied $ArrayOfPalettes.
																												 //   Processed palettes’ source files are added to the SoftMoon.hardLoaded_palettes array
										 //   (null, $whenLoaded)   // This format only inits SoftMoon.loaded_palettes Palettes.
																							 //  Processed palettes’ source files are NOT added to any array
										 //   ($Event, $whenLoaded)   // This format only inits SoftMoon.loaded_palettes Palettes.
																								 //  Processed palettes’ source files are added to the SoftMoon.hardLoaded_palettes array
										 //   ($Symbol, $whenLoaded)   // This format only inits SoftMoon.loaded_palettes Palettes.
																									//  Processed palettes’ source files are added to the array
																								 //   found at SoftMoon[$Symbol]
											 // Since all palettes are already loaded when using the last format, the $whenDone is not needed: it is for asynchronous connections.
											 // When using the last format, all Palettes are built upon return from this function.
											 // When using the other formats, only preLoaded Palettes are built upon return from this function; others are not yet loaded.
	// we need to tell the Palette class constructor to include the
	// properties of a Palette that MasterColorPicker uses to build Palette Tables
	for (const p of paletteProps)  {
		if (!SoftMoon.WebWare.Palette.properties.includes(p))  SoftMoon.WebWare.Palette.properties.push(p);  }

	//  ↓this is an array of raw palette “files” that were processed and not malformed and that were typically loaded via script tags
	if (!(SoftMoon.hardLoaded_palettes instanceof Array))  SoftMoon.hardLoaded_palettes=new Array;

	const
		// ↓ this contains palette “files” that were loaded via script tags
		// ↓ OR it may contain palettes loaded via the PaletteManager by the end-user
		preLoaded= SoftMoon.loaded_palettes,
		loaded= new Array,
		fileCashe= arguments[0]===null ? undefined : (typeof arguments[0] === 'symbol' ? SoftMoon[arguments[0]] : SoftMoon.hardLoaded_palettes),
		oldLength= fileCashe?.length;
	if (arguments[0] instanceof Array)  preLoaded.push(...arguments[0]);

	function preLdErr(palette, e)  {
		if (typeof palette === 'object')  palette.malformed=true;
		console.error('The MasterColorPicker JSON palette file was malformed.\n  Preloaded palette: ',palette,'\n  Error: ', e);  }
	/* In all situations, a Palette may reference a color-definition in another palette.
	 * Therefore, all palettes should be “added” BEFORE the HTML table is “built”,
	 * as the building process requires looking up the color for the color-swatch.
	 * Pre-loaded palettes (from script-tags), however, are built BEFORE any other palettes
	 * (from the server or the DB) are ever loaded. They are considered “core” palettes.
	 * They may load in any order and reference each-other without problems,
	 * but they should not reference any palettes loaded from a server or DB.
	 */
	while (preLoaded.length)  {
		const palette=preLoaded.shift();
		try  {loaded.push([SoftMoon.WebWare.addPalette(palette.data), palette]);}
		catch(e) {preLdErr(palette, e);}  }
	while (loaded.length)  {
		const palette=loaded.shift();
		try  {
			SoftMoon.WebWare.initLoadedPaletteTable(palette[0], $whenLoaded);
			palette[1].isProcessed=true;
			fileCashe?.push(palette[1]);  }
		catch(e) {preLdErr(palette, e);}  }
	/*
	 *	do note above that the SoftMoon.loaded_palettes Array will be empty upon return from this function.
	 */
	if (fileCashe?.length!==oldLength)  switch (fileCashe)  {
		case SoftMoon.hardLoaded_palettes:	UniDOM.generateEvent(window, 'mastercolorpicker_palettes_hardloaded');
		break;
		default:	UniDOM.generateEvent(window, 'mastercolorpicker_palettes_userloaded');  }

	const alertBox=document.getElementById('paletteLoadingAlert');

	if (arguments[0] instanceof Array
	||  arguments[0] instanceof Event
	||  typeof arguments[0] === 'symbol'
	||  arguments[0]===null)  {
		UniDOM.addClass(alertBox, 'disabled');
		return;  }

	var dbFiles, files, database=MasterColorPicker.db, store="autoload_palettes";

	if ((typeof arguments[0] === 'object'  &&  arguments[0].IDBDatabase instanceof IDBDatabase
			 &&  (database=arguments[0].IDBDatabase)  &&  (store=arguments[0].storeName))
	||  (database  &&  !SoftMoon.dbPalettesInitialized))  {
		if (database===MasterColorPicker.db)
			Object.defineProperty(SoftMoon, 'dbPalettesInitialized', {value: true, enumerable: true});
		console.log(' →→ retrieving palette index from browser DB');
		dbFiles=SoftMoon.WebWare.loadDBPalettes(   // see RGB_Calc.js
							database,
							store,
							updateAlertBox,
							function(event)  {
								try {this.json_palette=SoftMoon.WebWare.addPalette(this.result.JSON);}
								catch(e)  {
									this.json_palette=null;
									this.malformed=true;
									console.error('The MasterColorPicker JSON palette file was malformed.  Filename:\n  '+this.filename+'\n Error:  ', e);  }
								updateAlertBox();  },
							function()  {
								if (dbFiles.length>0)  {
									console.warn(' →→ Error loading Palette file “'+this.filename+'” from browser’s DB.');
									return;  }
								console.warn(' →→ Error loading Palette index from browser’s “'+store+'” DB store.');
								dbFiles.noneGiven=true;
								dbFiles.indexFailed=true;  });  }

	if (SoftMoon.WebWare.HTTP
	&&  ( /^https?\:$/ ).test(window.location.protocol))  {
		console.log(' →→ retrieving palette index from server');
		files=SoftMoon.WebWare.loadPalettes(  // see RGB_Calc.js
						$path,
						updateAlertBox,
						function()  {
							try {this.json_palette=SoftMoon.WebWare.addPalette(this.responseText);}
							catch(e)  {
								this.json_palette=null;
								this.malformed=true;
								console.error('The MasterColorPicker JSON palette file was malformed.  Filename:\n  '+this.url+'\n Error:  ', e);  }
							updateAlertBox();  },
						function()  { if (files.length>0)  return;  //load errors are silently ignored here for palettes; updateAlertBox() notes it to the user
							files.noneGiven=true;
							files.indexFailed=true;  },
						SoftMoon.WebWare.HTTP.handleMultiple );  }

	if (dbFiles===undefined  &&  files===undefined)  {
		UniDOM.addClass(alertBox, 'disabled');
		return;  }

	const
		HTML=initPaletteTables.HTML;

	if (alertBox.isDirty)  alertBox.replaceChild(HTML.initDefault.cloneNode(true), alertBox.firstChild);
	else alertBox.isDirty=true;
	const alrtBox=alertBox.firstChild;  // ¡don’t confuse the two!
	function updateAlertBox()  {
		var flag=false, built=0, failed=false, doFade=false, html="";
		if (files)  {
			html+="<h4><strong>From Server:</strong> "+files.paletteIndexConnection.url.replace( /&/g , '&amp;').replace( /</g , '&lt;').replace( />/g , '&gt;')+"</h4>\n";
			if (files.paletteIndexConnection.trying)  html+=HTML.waiting;
			else html+= (files.length>0) ? "<ul>\n" : (files.indexFailed ? (failed=true, HTML.indexFailed) : (doFade=true, HTML.noPalettes));
			for (let i=0; i<files.length; i++)  {
				html+="<li>"+files[i].url.replace( /&/g , '&amp;').replace( /</g , '&lt;').replace( />/g , '&gt;');
				if (files[i].trying)  { flag=true;
					if (files[i].readyState>=3)  html+=HTML.connected;
					else  html+=(files[i].attempts>1 ? HTML.reload : "");  }
				else  {
					if (files[i].status===200
					&&  !files[i].malformed)  html+= (files[i].built) ? (built++, HTML.loaded) : HTML.building;
					else  {failed=true;  built++;  html+= (files[i].malformed ? HTML.malformed : HTML.failed);}  }
				html+="</li>\n";  }
			if (files.length>0)  html+="</ul>\n";  }
		if (dbFiles)  {
			html+="<h4><strong>From Browser DB:</strong> "+dbFiles.store.replace( /&/g , '&amp;').replace( /</g , '&lt;').replace( />/g , '&gt;')+"</h4>\n";
			if (dbFiles.paletteIndexRequest.readyState==='pending')  html+=HTML.waiting;
			else html+= (dbFiles.length>0) ? "<ul>\n" : (dbFiles.indexFailed ? (failed=true, HTML.indexFailed) : HTML.noPalettes);
			for (let i=0; i<dbFiles.length; i++)  {
				html+="<li>"+dbFiles[i].filename.replace( /&/g , '&amp;').replace( /</g , '&lt;').replace( />/g , '&gt;');
				if (dbFiles[i].readyState==='pending')  flag=true;
				else  {
					if (!dbFiles[i].malformed)  html+= (dbFiles[i].built) ? (built++, HTML.loaded) : HTML.building;
					else  {failed=true;  built++;  html+= (dbFiles[i].malformed ? HTML.malformed : HTML.failed);}  }
				html+="</li>\n";  }
			if (dbFiles.length>0)  html+="</ul>\n";  }
		alrtBox.lastChild.innerHTML= html;
		if (!files?.paletteIndexConnection.trying
		&&  !(dbFiles?.paletteIndexRequest.readyState==='pending')
		&&  built===((files?.length||0)+(dbFiles?.length||0)))  {
			if (initPaletteTables.autoFade  &&  (doFade  ||  failed))  {  // ←←note we doFade only for = servers = that return “no palettes” without error, not =DBs=
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
				opacity=100;  fade=setInterval(fadeAlertBox, initPaletteTables.fadeRate);  }
			else UniDOM.addClass(alertBox, 'disabled');  }
		return flag;
		var opacity, fade;
		function fadeAlertBox()  {
			if (--opacity>0  &&  !MasterColorPicker.pickerActiveFlag)  alertBox.style.opacity=String(opacity/100);
			else  {clearInterval(fade);  UniDOM.addClass(alertBox, 'disabled');}  }  }

	UniDOM.remove$Class(alertBox, 'disabled');
	UniDOM.addClass(document.body, 'MCP_init');
	alertBox.style.opacity='1';

	const errMsg='User-supplied “$whenDone” function failed in SoftMoon.WebWare.initPaletteTables()  ';
	var wait=setInterval(
		function()  {
			var i, flag;
			if (files?.length  ||  dbFiles?.length)  flag=updateAlertBox();
			else  flag= files?.paletteIndexConnection.trying || dbFiles?.paletteIndexRequest.readyState==='pending';
			if (flag)  return;
			clearInterval(wait);
			const allFiles=[].concat(dbFiles||[], files||[]);
			allFiles.dbFiles=dbFiles;
			allFiles.serverFiles=files;
			if (allFiles.length===0)  {
				if (typeof $whenDone === 'function')  {try{$whenDone(allFiles);} catch(e){console.error(errMsg,e);}}
				UniDOM.remove$Class(document.body, 'MCP_init');
				return;  }
			i=0;
			wait=setInterval(function ()  { //this exists only to give the DOM a chance to update between building palette tables
					try  { if (allFiles[i].json_palette)
						SoftMoon.WebWare.initLoadedPaletteTable(allFiles[i].json_palette, $whenLoaded);  }
					catch (e)  {
						allFiles[i].malformed=true;
						console.error('The MasterColorPicker JSON palette file was malformed.  Filename:\n  '+(allFiles[i].filename || allFiles[i].url)+'\n  Error: ', e);  }
					allFiles[i].built=true;
					updateAlertBox();
				  if (++i >= allFiles.length)  {
						clearInterval(wait);
						if (typeof $whenDone === 'function')  {
							try {$whenDone(allFiles);}
							catch(e) {console.error(errMsg,e);}  }
						UniDOM.remove$Class(document.body, 'MCP_init');
						UniDOM.generateEvent(window, 'mastercolorpicker_palettes_loaded');
						}  },
				7);  },
		100 );

	return {            //     each Array member ↓↓↓ is for a palette file ↓↓↓
		dbFiles:dbFiles,  //←← an initially empty Array that asynchronously fills with IDBRequest Objects  ‖  undefined
		serverFiles:files //←← an initially empty Array that asynchronously fills with HTTP-connect Objects  ‖  undefined
		};  }
SoftMoon.WebWare.initPaletteTables.autoFade=true;
SoftMoon.WebWare.initPaletteTables.fadeRate=162;
SoftMoon.WebWare.initPaletteTables.HTML={
	waiting: " <p class='waiting'>…waiting for the palette index to load…</p>",
	connected: " <span class='connected'>…connected and loading…</span>",
  building: " <span class='loaded'>¡Loaded!……building table……</span>",
  loaded: " <span class='loaded'>¡Loaded and Built!</span>",
  reload: " <span class='reload'>¡Retrying to Load!</span>",
  failed: " <span class='failed'>¡Failed to Load!</span>",
	malformed: " <span class='failed'>¡Malformed File!</span>",
	noPalettes: "<p class='noPalettes'>No MasterColorPicker Palettes found.</p>",
	indexFailed: "<p class='indexFailed'>The index to the MasterColorPicker Palettes’ files <strong>¡Failed!</strong> to load.</p>",
	close: "close", //these last two are for button text
	hold: "hold" };
SoftMoon.WebWare.initPaletteTables.HTML.initDefault=document.getElementById('paletteLoadingAlert')?.firstChild.cloneNode(true);



SoftMoon.WebWare.initLoadedPaletteTable=function(json_palette, $whenLoaded, doSelect=false)  {
	const slct=document.getElementById('MasterColorPicker_palette_select'),
				wrap=document.getElementById('MasterColorPicker_paletteTables');
	for (const paletteName in json_palette)  {
		if (typeof $whenLoaded === 'function')  {
			try {if ($whenLoaded(paletteName, json_palette[paletteName]))  continue;}
			catch(e) {console.error('User-supplied “$whenLoaded” function failed in SoftMoon.WebWare.initLoadedPaletteTable()  ',e);}  }
		cleanPaletteMarks(json_palette[paletteName], json_palette[paletteName].referenceMarks);
		if (json_palette[paletteName].display==='none')  continue;
		const
			id=paletteName.replace( /\s/g, "_"),
			old=document.getElementById(id);
		if (old)  old.parentNode.removeChild(old);
		else  {
			const o=document.createElement('option');
			o.value=id;
			o.appendChild(document.createTextNode(paletteName));
			o.selected= doSelect;  // || (doSelect!==false  &&  SoftMoon.MasterColorPicker_restored_interface_values?.MasterColorPicker_palette_select===paletteName);
			slct.appendChild(o);  }
		MasterColorPicker.registerPicker( wrap.appendChild( (typeof json_palette[paletteName].buildPaletteHTML === 'function')  ?
				json_palette[paletteName].buildPaletteHTML(paletteName, id)       // ← ↓ init: note custom init methods should return the HTML with the “proper” id
			: buildPaletteTable(paletteName, id, json_palette[paletteName], 'color_chart picker') ) );
		if (doSelect)  UniDOM.generateEvent(slct, 'change', {bubbles:true});  }  };



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
	&&  v.startsWith(referenceMarks[0])
	&&  v.endsWith(referenceMarks[1]))
		return v.slice(referenceMarks[0].length, -referenceMarks[1].length);  }


class Tabular_ColorPicker extends SoftMoon.WebWare.Color_Picker {
// getColor below is also called by the Color_Picker.onclick implementation,
// both of which (mouseover, click) are applied to the entire Palette <table> via UniDOM
	getColor(event)  {
		const target=event.target.closest('td');
		if (target  &&  target.getColor_cb)
			return target.getColor_cb(event, target.closest('tbody').getAttribute('chain'));  }
	onmouseover(event)  { // this will update the ColorSpace_Lab
		const colorSpecCache=this.getColor(event);
		if (colorSpecCache  &&  colorSpecCache.RGB)  MasterColorPicker.applyFilters(colorSpecCache, event, this.name);  }  }

Tabular_ColorPicker.prototype.canInterlink=false;
Tabular_ColorPicker.prototype.canIndexLocator=false;

SoftMoon.WebWare.Tabular_ColorPicker=Tabular_ColorPicker;

// the following are the callback (cb) functions for Tabular_ColorPicker.getColor above
function noColor() {return {RGB:null, text:"none", model:'text'};}  // currently unused
function addEntry(event, chain)  {
	const txt=chain+this.firstChild.data;
	return new Tabular_ColorPicker.Color_SpecCache(txt);  }
function addGridEntry(event, chain)  {
	const txt=chain+this.firstChild.firstChild.data;
	return new Tabular_ColorPicker.Color_SpecCache(txt);  }
function returnNext(event)  {
	// return this.nextSibling.getColor_cb(event, chain);
	UniDOM.generateEvent(this.nextSibling, event.type, { bubbles: true, relatedTarget: this,
		view: event.view, cancelable: event.cancelable, detail: event.detail, button: event.button,
		screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
		ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey, metaKey: event.metaKey  });  }
function addRef()  {
	const txt=this.firstChild.data;
	return new Tabular_ColorPicker.Color_SpecCache(txt);  }
function addBackRef()  {
	const txt=this.firstChild.firstChild.data;
	return new Tabular_ColorPicker.Color_SpecCache(txt);  }

Tabular_ColorPicker.Color_SpecCache= class extends SoftMoon.WebWare.Color_Picker.Color_SpecCache {}
Tabular_ColorPicker.Color_SpecCache.prototype.name="Tabular_ColorPicker.Color_SpecCache";

Tabular_ColorPicker.buildPaletteTable=buildPaletteTable;
function buildPaletteTable(pName, id, pData, className)  {
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
	tbl.id=id;
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
				if (ignore  &&  colors[c]!=='◊'
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
						stylez: {backgroundColor: clrOb ? clrOb.hex : "", color: clrOb ? clrOb.contrast : ""},
						getColor_cb: clrOb ? (flagBakRef ?  addBackRef : returnNext) : undefined },
					{ text: flagFwdRef ? (clr||colors[c]) : c,
						getColor_cb: clrOb ? (flagFwdRef ?  addRef : addEntry) : undefined }  ],
					clrOb ? undefined : "unknown-color"));  }
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
			return ((pData.alternatives==='lowercase'  &&  ( /[a-z]/ ).test(c)  &&  !( /[A-Z]/ ).test(c))
					||  (pData.alternatives==='UPPERCASE'  &&  ( /[A-Z]/ ).test(c)  &&  !( /[a-z]/ ).test(c)));  }  }


	function buildTableRow(chlds, data, className)  {
		const tr=document.createElement('tr');
		if (className)  tr.className=className;
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
			const td=document.createElement('td');
			if (colors[c]==='◊')
				td.className='spacer';
			else {
				let clr=checkIsRef(colors[c], referenceMarks);
				const flagBackRef= backRefAll||clr;
				if (flagBackRef) colors[c]=flagBackRef;
				clr=MasterColorPicker.RGB_calc(clr||colors[c]);
				td.appendChild(document.createElement('span')).appendChild(document.createTextNode(
					(fwdRefAll||checkIsRef(c, referenceMarks)) ? colors[c] : c ));
				if (clr)  {
					td.style.backgroundColor=clr.hex;
					td.style.color=clr.contrast;
					td.getColor_cb=addGridEntry;  }
				else  td.className='unknown-color';
				if (flagBackRef)  td.title=colors[c];  }
			tr.appendChild(td);  }
		for (j=0; j<columns-i; j++)  {tr.appendChild(document.createElement('td')).className='filler';}
		return tr;  }

 }; //close  Tabular_ColorPicker.buildPaletteTable
}  //close the private namespace for the Palette Tables manager/constructor  TabularColorPicker


SoftMoon.WebWare.Tabular_ColorPicker.buildPaletteTable.caption={
	"h6": ["{pName}"," color-picker table"],  // you may add in other strings of text; they build in order.  {pName} gets put in a <strong>pName</strong>
	"text": "click to choose" };  //  '<h6><strong>{pName}</strong> color-picker table</h6><span>click to choose</span>';  //  '{pName} colors'  //  'couleurs de {pName}'
SoftMoon.WebWare.Tabular_ColorPicker.buildPaletteTable.defaultGridColumns=13;  // the default number of columns in a grid layout format
// The following property is no longer used by MasterColorPicker.
// Instead, referenceMarks are a property of a specific Palette instance.
// The MyPalette class prototype now contains this value to use in the toJSON method.
// The followings’ comments give a good description of how they work:
/*
// note that if (and only if) your marks are a single-character (UTF-8) each,
//  you may use a string instead of an array:    ='«»';
Tabular_ColorPicker.buildPaletteTable.referenceMarks=[ '«' , '»' ];  // if a color name in a palette is wrapped
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



{  // open a private namespace for the PaletteManager

const PaletteManager=new Object;
SoftMoon.WebWare.PaletteManager=PaletteManager;

// If set to 'true', a “trash/” folder will be created in the  color_palettes/  folder by its  index.php  file
//  if it does not already exist.
// If said “trash/” folder exists, deleted palettes will be moved there.
PaletteManager.doRecycle='false';

// ¿ log all actions to the browser’s console ?
PaletteManager.doLog=true;

const
	masks=SoftMoon.WebWare.loadPalettes,  // ←the masks are properties
	HTTP=SoftMoon.WebWare.HTTP,
	// ↓ these deliminate filenames in MESSAGES (not the index or the path of an uploaded file) returned from the server
	SI=String.fromCharCode(15),  // ← ASCII “shift in”
	SO=String.fromCharCode(14),  // ← ASCII “shift out”
	// ↓ this deliminates ==sections== of text returned by the server
	GS=String.fromCharCode(29),  // ← ASCII “group separator”
	// ↓ sent by the server to indicate an error message
	NAK=String.fromCharCode(21),  // ← ASCII “negative aknowledge”
	ERROR=NAK+'¡Error! :',
	userLoadedPalettes=Symbol('userLoadedPalettes');  // ← we pass this into “initPaletteTables” to indicate to use a custom “file cashe”

//  ↓ this is an array “cashe” of raw palette “files” that were processed and not malformed
//  ↓ and that were loaded via user-interaction by the PaletteManager or MyPalette
Object.defineProperty(SoftMoon, "userLoaded_palettes", {value:new Array, enumerable: true});
Object.defineProperty(SoftMoon.userLoaded_palettes, "reference", {value:userLoadedPalettes, enumerable: true});
Object.defineProperty(SoftMoon, userLoadedPalettes, {value:SoftMoon.userLoaded_palettes});

function markup(text) {return text.replaceAll(SI, '<filepath>').replaceAll(SO, '</filepath>');}

let HTML;

// here you can adjust the language of the HTML output to the user
PaletteManager.NOTICES={
	NO_HTTP:'<strong>¡Error! :\n Problem with the <abbr title="hyper-text transfer protocol">HTTP</abbr> connection or server.</strong>',
	NO_DB:  '<strong>¡Error! :\n The browser’s private storage DataBase is not available.</strong>',
	DB_LOADED: (filename,store)=>'<p><filepath>'+filename+'</filepath> loaded from the browser’s “<code>'+store+'</code>” DataBase.</p>',
	DB_LOADING:(filename,store)=>'<p>Loading the <filepath>'+filename+'</filepath> palette from the browser’s “<code>'+store+'</code>” DataBase…</p>',
	MALFORMED: (filename)=>'<p><filepath>'+filename+'</filepath> JSON palette file was malformed.</p>',
	HTTP_LOADED: (filename)=>'<p><filepath>'+filename+'</filepath> loaded from the server.</p>',
	HTTP_FAILED: (filename)=>'<p><filepath>'+filename+'</filepath> JSON palette file failed to load.</p>',
	HTTP_LOADING:(filename)=>'<p>Loading the <filepath>'+filename+'</filepath> palette from the server…</p>',
	NONE_TO_LOAD: 'No palettes selected to load.',
	NONE_TO_SAVE: 'No palettes selected to save.',
	DB_DELETED: (filename,store)=>'<p><filepath>'+filename+'</filepath> deleted from the browser’s “<code>'+store+'</code>” DataBase.</p>',
	DB_DELETING:(filename,store)=>'<p>Deleting the <filepath>'+filename+'</filepath> palette from the browser’s “<code>'+store+'</code>” DataBase…</p>',
	ONLY_DEL_USERS: 'You may only delete user palettes.',
	NONE_TO_DEL: 'No palettes selected to delete.',
	CONFIRM_DEL:(count)=>'¿¿ Delete the '+count+' selected palette'+(count>1 ? 's ??' : ' ??'),
	DELETING:   (count)=>'<p>Deleting the '+count+' selected file'+(count>1 ? 's…' : '…')+'</p>',
	NONE_TO_ADD: 'No palettes selected to add.',
	DB_SAVING:(filename,store)=>'<p>Saving <filepath>'+filename+'</filepath> to the browser “'+store+'”  DataBase…</p>',
	DB_SAVED :(filename,store)=>'<p><filepath>'+filename+'</filepath> saved to the browser “'+store+'” DataBase.</p>',
	DB_EXISTS:(filename,store)=>'<strong>The file <filepath>'+filename+'</filepath> already exists in the browser “'+store+'” DataBase.</strong>',
	UPLOADED :(filepath)=>'<p>Successfully uploaded to:\n<filepath>' + filepath + '</filepath></p>',
	UPLOADING:(filename,path)=>'<p>Uploading <filepath>' + filename + '</filepath> to:\n<filepath>' + path + '</filepath></p>',
	ONLY_REN_USERS:'<strong>You may only rename user palette files.</strong>',
	RENAMING:(from,to,port,store)=>'<p>Renaming <filepath>'+from+'</filepath> to <filepath>'+to+'</filepath> in the '+port+' “'+store+'” DataBase.</p>',
	DB_RENAMED:(from,to,store)=>'<p><filepath>'+from+'</filepath> has been renamed to <filepath>'+to+'</filepath> in the browser “'+store+'” DataBase.</p>',
	GET_DB_INDX:   'Retrieving the palette indexes from the browser DataBase…',
	DB_INDX_FAILED:(store)=>'¡The browser’s DataBase “'+store+'” file index failed!',
	GET_HTTP_INDX: 'Retrieving the palette index from the Server…',
	HTTP_INDX_FAILED: '¡The Server’s palette file index failed!',
	IMPROPER_FILETYPE: (filename)=>'¡Improper file type (file extension) to load as palette!&nbsp; File: <filepath>'+filename+'</filepath>&nbsp; Use <filepath>.palette.json</filepath> or <filepath>.palette.js</filepath>',
	CHOOSE_PALETTE: '¡Please choose a MasterColorPicker<footnote>™</footnote> Palette Table from the palette-select!'
	};
const CONSOLE_IMPORT_ERROR='MasterColorPicker PaletteManager import file error:\n';



PaletteManager.notice=notice;
function notice(notice, wait, clear=true)  {
	const
		div=document.createElement('div'),
		dialog=HTML.querySelector('.dialog'),
		oldDivs=dialog.getElementsByTagName('div');
	if (clear)  for (var i=oldDivs.length; i>0;)  {
		if (!oldDivs[--i].wait)  dialog.removeChild(oldDivs[i]);  }
	div.className='notice' + (wait? ' wait' : "");
	div.wait=wait;
	div.innerHTML=notice;
	dialog.appendChild(div);
	return div;  }


PaletteManager.openBrowserPaletteDBTransaction=openBrowserPaletteDBTransaction;
function openBrowserPaletteDBTransaction(store, mode='readonly')  {
	if (MasterColorPicker.db)  return MasterColorPicker.db.transaction(store, mode);
	notice(PaletteManager.NOTICES.NO_DB).classList.add('error');  }

PaletteManager.getServerConnector=getServerConnector;
function getServerConnector(doNotice=true)  {
	const connector= ( /^https?\:$/ ).test(window.location.protocol) ?
					(HTTP && new HTTP())
				: null;
	return connector || (doNotice && notice(PaletteManager.NOTICES.NO_HTTP).classList.add('error'), null);  }


PaletteManager.loadPaletteFromBrowserDB=loadPaletteFromBrowserDB;
function loadPaletteFromBrowserDB(trans, store, filename, $asJSON_text=false)  {
	if (PaletteManager.doLog)  console.log(' →→ loading palette file from browser “'+store+'” DB:',filename);
	var div;
	const requst=trans.objectStore(store).get(filename);
	requst.onerror= ()=>{ if (PaletteManager.doLog)  console.warn(' →→ Error loading Palette file from browser’s DB.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=PaletteManager.NOTICES.NO_DB;
		div.classList.add('error');  }
	requst.onsuccess = function()  {
		SoftMoon.loaded_palettes.push({filename:filename, data: $asJSON_text ? JSON.stringify(this.result.JSON) : this.result.JSON});
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=PaletteManager.NOTICES.DB_LOADED(filename,store);  }
	return div=notice(PaletteManager.NOTICES.DB_LOADING(filename,store), true);  }


PaletteManager.loadPaletteFromServer=loadPaletteFromServer;
function loadPaletteFromServer(connector, filename, $asJSON_text=false)  { // ← ↓ see the restrictions noted below on the filename extension
	const doLog=PaletteManager.doLog;
	if (doLog)  console.log(' →→ loading JSON palette file from server:',filename);
	var div;
	const connection=HTTP.Connection(filename);
	connection.onFileLoad=function()  {
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		try  {
			const palette= $asJSON_text ? this.responseText : JSON.parse(this.responseText);
			/* Here we rely on the filename having the “proper” extension, currently:  .palette.json
			 * SoftMoon.WebWare.loadPalettes()  only loads palette files with that extension  ←see the file:  JS_toolbucket/SoftMoon-WebWare/RGB_Calc.js
			 * PaletteManager.refreshServerList()  only gathers/displays palette files with that extension
			 *  (so in normal use, there will be no issues; only when hacking this method)
			 * MyPalette saves its files with that extension
			 * color_palettes/index.php  filters in files with that extension when asked for an index
			 * The solution below can adapt to the system standard if the paletteMask RegExp changes,
			 * but can not interpret other filenames with additional extensions.
			 */
			const name=filename.match(masks.paletteMask)?.pop() || (
					'userPalette '+((new Date()).toUTCString()).replace( /:/g , ';').replace( /\(/g , '[').replace( /\)/g , ']') );
			SoftMoon.loaded_palettes.push({filename:name, data:palette});
			div.innerHTML=PaletteManager.NOTICES.HTTP_LOADED(filename);  }
		catch(e)  {
			if (doLog)  console.error('The MasterColorPicker JSON palette file was malformed.  Filename:\n  '+this.url+'\n Error:  ', e);
			div.innerHTML=PaletteManager.NOTICES.MALFORMED(filename);
			div.classList.add('error');  }  }
	connection.loadError=function()  {
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		if (doLog)  console.error('The MasterColorPicker JSON palette file failed to load.  Filename:\n  '+this.url);
		div.innerHTML=PaletteManager.NOTICES.HTTP_FAILED(filename);
		div.classList.add('error');  }
	connector.commune(connection);
	return div=notice(PaletteManager.NOTICES.HTTP_LOADING(filename), true);  }


PaletteManager.loadAllSelected=loadAllSelected;
function loadAllSelected(event, basepath)  {
	basepath??= SoftMoon.colorPalettes_defaultPath;
	const
		port=event.target.closest('[port]'),
		chkBoxs=port.querySelectorAll('input[type="checkbox"]'),
		imports=new Array;
	for (let i=1; i<chkBoxs.length; i++)  {  //there will always be a “selectAll” checkbox first
		if (!chkBoxs[i].disabled  &&  chkBoxs[i].checked  &&  ( /filename/ ).test(chkBoxs[i].name))
			imports.push(chkBoxs[i].parentNode);  }  // <label><input type='checkbox'>filename</label>
	if (imports.length===0)  {notice(PaletteManager.NOTICES.NONE_TO_LOAD).classList.add('error');  return;}
	switch (port.className)  {
		case 'browser':
			const trans=openBrowserPaletteDBTransaction(['palettes', 'autoload_palettes']);
			if (trans)  {
				for (let i=0; i<imports.length; i++)  {
					loadPaletteFromBrowserDB(trans, imports[i].closest('fieldset').className, imports[i].lastChild.data);  }
				trans.oncomplete=SoftMoon.WebWare.initPaletteTables.bind(null, null);  }
		break;
		case 'server':
			const connector=getServerConnector();
			if (connector)  {
				for (const file of imports)  {
					loadPaletteFromServer(connector, basepath+file.lastChild.data);  }
				connector.onComplete=SoftMoon.WebWare.initPaletteTables.bind(null, null);  }
		break;
		default: notice('An embarrassing programming error occurred.  Or …sabatage!…');  return;  }  }


PaletteManager.deletePaletteFromBrowserDB=deletePaletteFromBrowserDB;
function deletePaletteFromBrowserDB(trans, store, filename)  {
	if (PaletteManager.doLog)  console.log(' ←← deleting palette file from browser DB:',filename);
	var div;
	const requst=trans.objectStore(store).delete(filename);
	requst.onerror= function()  { if (PaletteManager.doLog)  console.warn(' ←← Error deleting Palette file from browser’s DB.');
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=PaletteManager.NOTICES.NO_DB;
		div.classList.add('error');  }
	requst.onsuccess = function()  {
		UniDOM.remove$Class(div, 'wait');  div.wait=false;
		div.innerHTML=PaletteManager.NOTICES.DB_DELETED(filename,store);  }
	return div=notice(PaletteManager.NOTICES.DB_DELETING(filename,store), true);  }


PaletteManager.deleteAllSelected=deleteAllSelected;
function deleteAllSelected(event, basepath)  {
	basepath??= SoftMoon.colorPalettes_defaultPath;
	const
		chkBoxs= event.target.closest('[port]').querySelectorAll('input[type="checkbox"]'),
		port=event.target.closest('[port]').className,
		deathrow=new Array;
	var flag=false;
	for (const cb of chkBoxs)  {  //there will always be a “selectAll” checkbox first
		if (!cb.disabled  &&  cb.checked  &&  ( /filename/ ).test(cb.name))
			if (port==='browser'  ||  masks.userPaletteMask.test(cb.parentNode.lastChild.data))
				deathrow.push(cb.parentNode);    // <label><input type='checkbox'>filename</label>
			else  flag=true;  }
	if (flag)  notice(PaletteManager.NOTICES.ONLY_DEL_USERS).classList.add('error');
	if (deathrow.length===0)  {notice(PaletteManager.NOTICES.NONE_TO_DEL, false, !flag).classList.add('error');  return;}
	if (!confirm(PaletteManager.NOTICES.CONFIRM_DEL(deathrow.length)))  return;
	switch (port)  {
		case 'browser':
			const trans=openBrowserPaletteDBTransaction(['palettes', 'autoload_palettes'], 'readwrite');
			if (trans)  {
				if (PaletteManager.doLog)  console.log(' ←← Deleting the palette files from the browser: ',deathrow);
				for (const dead of deathrow)  {
					deletePaletteFromBrowserDB(trans, dead.closest('[store]').className, dead.lastChild.data);  }
				trans.oncomplete=() => {UniDOM.generateEvent(window, 'MasterColorPicker_BrowserDB_update', undefined, {clearNotices: false});}  }
		break;
		case 'server':
			const connector=getServerConnector();
			if (!connector)  break;
			const
				doLog=PaletteManager.doLog,
				connection=HTTP.Connection(basepath);
			if (doLog)  console.log(' ←← Deleting the palette files from the server: ',deathrow);
			var div;
			for (let i=0; i<deathrow.length; i++)  {deathrow[i]=deathrow[i].lastChild.data}
			connection.onFileLoad=function()  {
				if (doLog)  console.log(' ←← Delete response:',this.responseText);
				//  ASCII code 29 is “group separator” — the response may be followed by the new current index or other data
				div.innerHTML= '<p>'+markup(this.responseText.split(GS)[0])+'</p>';  }
			connection.loadError=function()  { if (doLog)  console.warn(' ←← Upload: HTTP or server Error.');
				div.innerHTML=PaletteManager.NOTICES.NO_HTTP;
				div.classList.add('error');  }
			connection.onloadend=function() {
				UniDOM.remove$Class(div, 'wait');  div.wait=false;
				UniDOM.generateEvent(window, 'MasterColorPicker_ServerDB_update', undefined, {clearNotices: false});  };
			connection.requestHeaders={'Content-Type': 'application/x-www-form-urlencoded'};
			connection.postData=HTTP.URIEncodeObject({
				do_delete: deathrow.join('\n'),
				recycle: PaletteManager.doRecycle,
				no_index: 'true'  });
			connector.commune(connection);
			div=PaletteManager.notice(PaletteManager.NOTICES.DELETING(deathrow.length), true);
		break;
		default: notice('An embarrassing programming error occurred.  Or …sabatage!…');  return;  }  }

// we expect the  SoftMoon.loaded_palettes  array to be empty when entering this function … if not the palettes there will be added also…
PaletteManager.addAllSelected=addAllSelected;
function addAllSelected(event)  {
	const
		port=event.target.closest('[port]').className,
		store=event.target.closest('[store]').className,
		files= new Array;
	var openBrowserDB= (port==='browser'),
			openServerDB=  (port==='server');
	for (const cb of HTML.querySelectorAll('input[type="checkbox"]'))  {
		if (!cb.disabled  &&  cb.checked  &&  ( /filename/ ).test(cb.name)
		&&  (cb.store!==store  ||  cb.port!==port))  {
			switch (cb.port)  {
				case 'browser': openBrowserDB=true;  break;
				case 'server':  openServerDB=true;  }
			files.push(cb);  }  }  // <label><input type='checkbox'>filename</label>
	if (files.length===0)  {
		notice(PaletteManager.NOTICES.NONE_TO_ADD).classList.add('error');
		return;  }
	var trans, connector;
	if (openBrowserDB)  {trans=openBrowserPaletteDBTransaction(['palettes', 'autoload_palettes']);  trans.completed=true;}
	if (openServerDB)  {connector=getServerConnector();  connector.completed=true;}
	for (const cb of files)  {
		const fileName=cb.parentNode.lastChild.data;
		let cashe=null;
		switch (cb.port)  {
		case 'browser':
			if (trans)  {loadPaletteFromBrowserDB(trans, cb.store, fileName);  trans.completed=false;}
		break;
		case 'server':
			if (connector)  {loadPaletteFromServer(connector, SoftMoon.colorPalettes_defaultPath+fileName);  connector.completed=false;}
		break;
		case 'user': cashe=SoftMoon.userLoaded_palettes;
		case 'document':  cashe??=SoftMoon.hardLoaded_palettes;
			for (const file of cashe)  {
				if (file.filename===fileName)  {
					SoftMoon.loaded_palettes.push({filename:fileName.slice(fileName.lastIndexOf('/')+1, fileName.lastIndexOf('.palette.js')), isProcessed:file.isProcessed, data:file.data});
					break;  }  }  }  }
	if (trans)  trans.oncomplete=moveFiles;
	if (connector)  connector.onComplete=moveFiles;
	if (SoftMoon.loaded_palettes.length)  moveFiles.call({});  // if hard-loaded palettes are being added to the DB or server
	function moveFiles()  {
		this.completed=true;
		if ((trans && !trans.completed)  ||  (connector && !connector.completed))  return;
		switch (port)  {
		case 'browser': PaletteManager.saveFilesToBrowserDB(store);
		break;
		case 'server':  PaletteManager.saveFilesToServerDB(store);
		break;  }  }  }

PaletteManager.saveFilesToBrowserDB=saveFilesToBrowserDB;
function saveFilesToBrowserDB(store)  {
	const
		doLog=PaletteManager.doLog,
		trans=openBrowserPaletteDBTransaction(store, 'readwrite');
	if (!trans)  return false;
	while (SoftMoon.loaded_palettes.length)  {
		const file=SoftMoon.loaded_palettes.shift();
		if (typeof file !== 'object')  {
			console.warn('HMMMM….….… how did THAT get in there? →',file);
			continue;  }
		if (doLog)  console.log('Saving '+file.filename+' to the browser’s DB.');
		const requst=trans.objectStore(store).add({JSON: file.data, filename: file.filename});
		requst.filename=file.filename;
		requst.div=notice(PaletteManager.NOTICES.DB_SAVING(file.filename,store), true);
		requst.onsuccess = function()  {
			UniDOM.remove$Class(this.div, 'wait');  this.div.wait=false;
			this.div.innerHTML=PaletteManager.NOTICES.DB_SAVED(this.filename,store);  }
		requst.onerror=function()  {
			if (doLog)  console.warn(' ←← Save Palette file '+this.filename+' to browser’s DB error: ',this.error);
			UniDOM.remove$Class(this.div, 'wait');  this.div.wait=false;
			if (this.error.name==='ConstraintError')
				this.div.innerHTML=PaletteManager.NOTICES.DB_EXISTS(this.filename,store);
			else this.div.innerHTML=PaletteManager.NOTICES.NO_DB;
			this.div.classList.add('error');  }  }
	trans.oncomplete=function() {UniDOM.generateEvent(window, 'MasterColorPicker_BrowserDB_update', undefined, {clearNotices: false});};
	return trans;  }

PaletteManager.saveFilesToServerDB=saveFilesToServerDB;
function saveFilesToServerDB(store)  {
	const
		doLog=PaletteManager.doLog,
		connector=getServerConnector(),
		divNotices=[];
	if (!connector)  return false;
	connector.onComplete=function() {
		for (const div of divNotices)  {UniDOM.remove$Class(div, 'wait');  div.wait=false;}
		UniDOM.generateEvent(window, 'MasterColorPicker_ServerDB_update', undefined, {clearNotices: false});  }
	const
		path=SoftMoon.colorPalettes_defaultPath,
		fullpath= ( /^(https?\:|file\:|\/)/ ).test(path) ? path : (document.URL.substring(0, document.URL.lastIndexOf("/")+1)+path),
		ext=masks.paletteNameExtension;
	while (SoftMoon.loaded_palettes.length)  {
		const
			file=SoftMoon.loaded_palettes.shift();
		if (!file  ||  typeof file !== 'object')  {
			console.warn('HMMMM….….… how did THAT get in there? →',file);
			continue;  }
		const
			connection=HTTP.Connection(path),
			filename=file.filename+(file.filename.substr(-ext.length)===ext ? "" : ext);
		if (doLog)  console.log(' ←← Uploading palette file ',filename,' to: ',path);
		connection.onFileLoad=function()  { if (doLog)  console.log(' ←← Upload response:',this.responseText);
			//  ASCII code 29 is “group separator” — the response may be followed by the new current index or other data
			const response=this.responseText.split(GS)[0];
			if (response.startsWith(ERROR))  this.div.innerHTML= '<strong>' + markup(response) + '</strong>';
			else  this.div.innerHTML= PaletteManager.NOTICES.UPLOADED(fullpath+response);
			divNotices.push(this.div);  };
		connection.loadError=function()  { if (doLog)  console.warn(' ←← Upload: HTTP or server Error.');
			this.div.innerHTML=PaletteManager.NOTICES.NO_HTTP + " while uploading <filepath>" + this.url.replace('<','&lt;').replace('>','&gt;') + "</filepath>";
			this.div.classList.add('error');
			divNotices.push(this.div);  }
		connection.requestHeaders={'Content-Type': 'application/x-www-form-urlencoded'};
		connection.postData=HTTP.URIEncodeObject({
			filename: filename,
			palette: JSON.stringify(file.data, file.isProcessed ? stringifyProcessedFile : undefined, "\t"),
			replace_file: 'false',
			autoload: (store==='autoload_palettes').toString(),
			no_index: 'true' });
		connector.commune(connection);
		connection.div=notice(PaletteManager.NOTICES.UPLOADING(filename,fullpath), true);  }
	return connector;  }

function stringifyProcessedFile(key,value) {
	if (key==='palette' ||  key==='config')  {
		const nv={}; // ↓ this will capture values in the prototype, while stringify will not otherwise; also, we want the original file value, not the processed value
		for (const p in value)  {nv[p]=Object.getPrototypeOf(value)[p]||value[p];}
		return nv;  }
	return value;}

PaletteManager.saveFilesLocally=saveFilesLocally;
function saveFilesLocally(event)  {
	const
		iframe=document.getElementById('MasterColorPicker_local_filesaver') || document.createElement('iframe'),
		slctd=event.target.closest('[port]').querySelectorAll(':checked');  // label:has(":checked")
	if (slctd.length===0)  {notice(PaletteManager.NOTICES.NONE_TO_SAVE).classList.add('error');  return;}
	if (!iframe.id)  {
		iframe.id='MasterColorPicker_local_filesaver';
		iframe.style.display='none';
		document.body.appendChild(iframe);  }
	switch (event.target.closest('[port]').className)  {
	case 'hardloaded':
		for (const s of slctd)  { if (s.name.endsWith("_selectAll"))  continue;
			const
				fileName=s.closest('label').innerText.trim(),
				file=SoftMoon.hardLoaded_palettes.find((file)=>file.filename===fileName);
			SoftMoon.loaded_palettes.push({
				data: JSON.stringify(file.data, stringifyProcessedFile, "\t"),
				filename: fileName.slice(fileName.lastIndexOf('/')+1, fileName.lastIndexOf('.palette.js'))});  }
		saveIt();
	break;
	case 'browser':
		const trans=openBrowserPaletteDBTransaction(['palettes', 'autoload_palettes']);
		for (const s of slctd)  { if (s.name.endsWith("_selectAll"))  continue;
			PaletteManager.loadPaletteFromBrowserDB(trans, s.closest('[store]').className, s.closest('label').innerText.trim(), true);  }
		trans.oncomplete=saveIt;
	break;
	case 'server':
		const connector=getServerConnector();
		for (const s of slctd)  { if (s.name.endsWith("_selectAll"))  continue;
			PaletteManager.loadPaletteFromServer(connector, SoftMoon.colorPalettes_defaultPath+s.closest('label').innerText.trim(), true);  }
		connector.onComplete=saveIt;
	break;
	default: console.error('PaletteManager.saveFilesLocally: unknown port.');  }
	function saveIt()  {
		const file=SoftMoon.loaded_palettes.shift();
		if (file)  {
			if (PaletteManager.doLog)  console.log('Saving palette file locally:',file.filename);
			if (SoftMoon.loaded_palettes.length)  setTimeout(saveIt, 200);
			const
				ext=HTML.querySelector('input[name*="_saveFileAs"]:checked').value,
				data= (ext===".js") ?  SoftMoon.paletteFile_JavaScript_wrapper[0] + file.data + SoftMoon.paletteFile_JavaScript_wrapper[1]  :  file.data,
				palette=URL.createObjectURL(new File([data], file.filename+'.palette'+ext, {type: "application/unknown"}));
			iframe.setAttribute('src', palette);
			URL.revokeObjectURL(palette);  }  }  }


let renamer;  // ← this will be a reusable/movable input box for renaming files, normally hidden.

PaletteManager.renamePalette=renamePalette;
function renamePalette(event)  {
	switch (event.target.nodeName)  {
	case 'LABEL':
		if ((event.type==='click'  &&  event.detail!==2  &&  !event.shiftKey)
		||  (event.type==='contextmenu'  &&  event.detail!==1))  return;
	break;
	case 'INPUT':
		if (event.type==='change'  &&  event.target.type==='checkbox'  &&  event.enterKeyed
		&&  (event.keyedCount===2 || event.shiftKey))
			break;
		if (event.type==='keydown'  &&  event.target.type==='checkbox'  &&  SoftMoon.altMenuKey.sniff(event))
			break;
	default: return;  }
	event.preventDefault();  //this will not stop the ContextMenu from popping up in Firefox (at least) when you press the “menu” key !?¡¿
	const
		doLog=PaletteManager.doLog,
		file=event.target.closest('label'),
		port=file.closest('fieldset').parentNode.closest('fieldset').className,
		store=file.closest('fieldset').className,
		ext=masks.paletteNameExtension,
		filepath=file.lastChild.data,
		path=filepath.substring(0, filepath.lastIndexOf('/')+1),
		filename=filepath.slice(filepath.lastIndexOf('/')+1,
														 (port==='server') ? -ext.length : undefined );
	if (port==='server'  &&  !masks.userPaletteMask.test(filepath))  {
		notice(PaletteManager.NOTICES.ONLY_REN_USERS).classList.add('error');
		return;  }
	renamer.value=filename;
	renamer.size=Math.max(32, filename.length+7);
	var keybounce=true;
	renamer.onkeydown=function(event)  {if (event.key==='Escape')  renamer.value=filename;}
	file.removeChild(file.lastChild);
	file.appendChild(renamer);
	renamer.onblur=function(event)  {
		UniDOM.generateEvent(renamer, 'focusout', {bubbles: true, relatedTarget: event.relatedTarget});  // tell the picker before removing the element
		file.removeChild(renamer);
		renamer.value=SoftMoon.WebWare.filename_safe(renamer.value);  // see the file:  JS_toolbucket/SoftMoon-WebWare/+++input_type.js
		const newPath=(renamer.value || filename);
		file.append(path + newPath + (port==='server'  &&  newPath.substr(-ext.length)!==ext ? ext : ""));  //this will get refreshed anyway, when completed
		if (renamer.value===filename  ||  renamer.value==="")  return;
		const message=PaletteManager.NOTICES.RENAMING(filepath, path+renamer.value, port, store);
		porter:  { switch (port)  {
		case 'browser':
			const trans=openBrowserPaletteDBTransaction(store, 'readonly')
			if (!trans)  break porter;
			loadPaletteFromBrowserDB(trans, store, filepath);
			trans.oncomplete=function() {
				if (doLog)  console.log('Renaming ',filepath,' to ',renamer.value,' in the browser “',store,'” DataBase.');
				const
					trans=openBrowserPaletteDBTransaction(store, 'readwrite'),
					fileData=SoftMoon.loaded_palettes.pop().data,
					div=notice(message, true);
				trans.objectStore(store).add({JSON: fileData, filename: renamer.value});
				trans.objectStore(store).delete(filepath);
				trans.onerror=function()  {
					if (doLog)  console.warn(' ←← Rename Palette file '+filepath+' in browser’s DB error: ',this.error);
					UniDOM.remove$Class(div, 'wait');  div.wait=false;
					if (this.error==='ConstraintError')
						div.innerHTML=PaletteManager.NOTICES.DB_EXISTS(renamer.value, store);
					else div.innerHTML=PaletteManager.NOTICES.NO_DB;
					div.classList.add('error');  }
				trans.oncomplete=function()  {
					UniDOM.remove$Class(div, 'wait');  div.wait=false;
					if (doLog)  console.log(filepath,' has been renamed to ',renamer.value,' in the browser “',store,'” DataBase.');
					div.innerHTML=PaletteManager.NOTICES.DB_RENAMED(filepath, renamer.value, store);
					UniDOM.generateEvent(window, 'MasterColorPicker_BrowserDB_update', undefined, {clearNotices: false});};  }
		break;
		case 'server':
			const connector=getServerConnector();
			if (!connector)  break porter;
			const
				connection=HTTP.Connection(SoftMoon.colorPalettes_defaultPath),
				div=notice(message, true);
			connection.onFileLoad=function()  { if (doLog)  console.log(' ←← Upload response:',this.responseText);
				//  ASCII code 29 is “group separator” — the response may be followed by the new current index or other data
				const response=markup(this.responseText.split(GS)[0]);
				if (response.startsWith(ERROR))  div.innerHTML= '<strong>' + response + '</strong>';
				else  {
					div.innerHTML= '<p>'+response+'</p>';  }  };
			connection.loadError=function()  { if (doLog)  console.warn(' ←← Upload: HTTP or server Error.');
				div.innerHTML=PaletteManager.NOTICES.NO_HTTP;
				div.classList.add('error');  }
			connection.onloadend=function() {
				UniDOM.remove$Class(div, 'wait');  div.wait=false;
				UniDOM.generateEvent(window, 'MasterColorPicker_ServerDB_update', undefined, {clearNotices: false});  };
			connection.requestHeaders={'Content-Type': 'application/x-www-form-urlencoded'};
			connection.postData=HTTP.URIEncodeObject({
				rename: filepath,
				new_name: path+renamer.value+(renamer.value.substr(-ext.length)===ext ? "" : ext),
				no_index: 'true' });
			connector.commune(connection);
		break;  }  }  }
	setTimeout(()=>{renamer.focus();}, 2);  }


PaletteManager.refreshDBList=
PaletteManager.onmastercolorpicker_browserdb_update= refreshDBList;
function refreshDBList(clearNotices) {
	if (arguments[0] instanceof Event)  {
		if (HTML.disabled)  return;
		if (arguments[0].clearNotices===false)  clearNotices=false;  }
	if (PaletteManager.doLog)  console.log(' →→ PaletteManager retrieving the Palette Index from the Browser’s DB');
	const
		trans=MasterColorPicker.db.transaction(['palettes', 'autoload_palettes']),
		paletteRqst= trans.objectStore('palettes').getAllKeys(),
		autoloadRqst=trans.objectStore('autoload_palettes').getAllKeys(),
		DIV=notice(PaletteManager.NOTICES.GET_DB_INDX, true, clearNotices);
	trans.onerror= (event) => {
		if (PaletteManager.doLog)  console.log('Problem with the database when building the MasterColorPicker PaletteManager');
		DIV.parentNode.removeChild(DIV);
		notice(PaletteManager.NOTICES.DB_INDX_FAILED(event.target.source.name), false, clearNotices).classList.add('error');  }
	trans.oncomplete=function() {DIV.parentNode.removeChild(DIV);}
	paletteRqst.UL= HTML.querySelector('.browser .palettes ul');
	autoloadRqst.UL=HTML.querySelector('.browser .autoload_palettes ul');
	paletteRqst.onsuccess= autoloadRqst.onsuccess= buildList;  }

function buildList(list, UL, port) {
	port??= UL ? 'server' : 'browser';
	list = UL ? list : this.result;
	UL ??= this.UL;
	const store=UL.closest('fieldset').className;
	while (UL.firstChild) {UL.removeChild(UL.firstChild);}
	for (let fn of list)  { if (fn=fn.trim())  {
		const
			chkbox=document.createElement('input'),
			LI=document.createElement('li');
		chkbox.type='checkbox';
		chkbox.name='MasterColorPicker_Palette_filename_select';
		chkbox.port=port;
		chkbox.store=store;
		LI.appendChild(document.createElement('label')).append(chkbox, fn);
		UL.appendChild(LI);   }  }
	if (UL.children.length  &&  store==='palettes'
	&&  (port==='server' 	||  (port==='browser'  &&  !PaletteManager.supportsServer)))
		UL.lastChild.firstChild.firstChild.setAttribute('tabToTarget', 'true');
	if ((port==='server'  ||  (port==='browser'  &&  !PaletteManager.supportsServer))
	&&  store==='palettes')
		UL.parentNode.querySelector('button[name*="_addSelected"]').setAttribute('tabToTarget', (UL.children.length===0).toString());
	return UL.length;  }

PaletteManager.refreshServerList=
PaletteManager.onmastercolorpicker_serverdb_update= refreshServerList;
function refreshServerList(clearNotices) {
	if (arguments[0] instanceof Event)  {
		if (HTML.disabled)  return;
		if (arguments[0].clearNotices===false)  clearNotices=false;  }
	const
		connector= getServerConnector(false);
	if (connector)  {
		if (PaletteManager.doLog)  console.log(' →→ PaletteManager retrieving the Palette Index from the Server');
		const
			indexConn=HTTP.Connection(SoftMoon.colorPalettes_defaultPath),
			DIV=notice(PaletteManager.NOTICES.GET_HTTP_INDX, true, clearNotices);
		indexConn.onFileLoad=function()  {
			DIV.parentNode.removeChild(DIV);
			const
				index=this.responseText?.split("\n") || [],
				plts=[], al_plts=[];
			for (const filename of index)  {
				if (!masks.paletteMask.test(filename)
				||  masks.trashMask.test(filename))  continue;
				if (masks.autoloadPaletteMask.test(filename)  ||  !masks.userPaletteMask.test(filename))
					al_plts.push(filename);
				else  plts.push(filename);  }
			buildList(al_plts, HTML.querySelector('.server .autoload_palettes ul'));
			buildList(plts, HTML.querySelector('.server .palettes ul'));  };
		indexConn.loadError= () => {
			if (PaletteManager.doLog)  console.warn('Problem loading the server’s palette file index when building the MasterColorPicker PaletteManager');
			DIV.parentNode.removeChild(DIV);
			notice(PaletteManager.NOTICES.HTTP_INDX_FAILED).classList.add('error');
			};
		connector.commune(indexConn);  }  }

PaletteManager.refreshHardloadedList=
PaletteManager.onmastercolorpicker_palettes_hardloaded=refreshHardloadedList;
function refreshHardloadedList()  {
	const hlfs=HTML.querySelector('fieldset.hardloaded');
	UniDOM.disable(hlfs, false);
	buildList(SoftMoon.hardLoaded_palettes.map(file=>file.filename), hlfs.querySelector('ul'), 'document');  }

PaletteManager.refreshUserloadedList=
PaletteManager.onmastercolorpicker_palettes_userloaded=refreshUserloadedList;
function refreshUserloadedList()  {
	const ulfs=HTML.querySelector('fieldset.userloaded');
	buildList(SoftMoon.userLoaded_palettes.map(file=>file.filename), ulfs.querySelector('ul'), 'document');  }


function readfile(PaletteFiles, callback)  {
	const readers=new Array;
	for (const file of PaletteFiles)  {
		if (!( /\.palette\.js(?:on)?$/i ).test(file.name))  {
			notice(PaletteManager.NOTICES.IMPROPER_FILETYPE(file.name)).classList.add('error');
			return false;  }
		const fr=new FileReader();
		fr.onload=function()  {
			try {callback(file.name, fromFileText(fr.result));}
			catch(e)  {
				console.error(CONSOLE_IMPORT_ERROR,e,"\n ↓ ↓ ↓\n",fr.result);
				notice(PaletteManager.NOTICES.MALFORMED(file.name)).classList.add('error');  }  };
		fr.onerror=function()  {
			console.error(CONSOLE_IMPORT_ERROR,fr.error);
			notice(PaletteManager.NOTICES.MALFORMED(file.name)).classList.add('error');  };
		fr.readAsText(file);
		readers.push(fr);  }
	return readers;  }

PaletteManager.loadFilesToPalettes=loadFilesToPalette;
function loadFilesToPalette(PaletteFiles)  {
	return readfile(PaletteFiles, function(filename, JSON_palette)  {
			const palette=SoftMoon.WebWare.addPalette(JSON_palette);
			SoftMoon.WebWare.initLoadedPaletteTable(palette, undefined, true);
			SoftMoon.userLoaded_palettes.push({filename: filename, data:JSON_palette, isProcessed:true});
			UniDOM.generateEvent(window, 'mastercolorpicker_palettes_userLoaded');  });  }

PaletteManager.loadFilesToBrowser=loadFilesToBrowser;
function loadFilesToBrowser(store, PaletteFiles)  {
	return readfile(PaletteFiles, function(filename, JSON_palette)  {
			filename=filename.match( /^(?:.+\/)?([^\/]+)\.palette\.js(?:on)?$/i )[1];
			SoftMoon.loaded_palettes.push({data: JSON_palette, filename: filename})
			PaletteManager.saveFilesToBrowserDB(store);  });  }

PaletteManager.loadFilesToServer=loadFilesToServer;
function loadFilesToServer(store, PaletteFiles)  {
	return readfile(PaletteFiles, function(filename, JSON_palette)  {
			filename=filename.match( /^(?:.+\/)?([^\/]+)\.palette\.js(?:on)?$/i )[1];
			SoftMoon.loaded_palettes.push({data: JSON_palette, filename: filename})
			PaletteManager.saveFilesToServerDB(store);  });  }


function fromFileText(ft)  {
	return JSON.parse(ft.trim().replace( /^SoftMoon.loaded_palettes.push\(\s*{\s*filename:[^,]+,\s*data:\s*/ , "").replace( /\s*\}\s*\)\s*;?$/ , ""));  }


PaletteManager.deleteCurrentPalette=deleteCurrentPalette;
function deleteCurrentPalette()  {
	const
		opt=MasterColorPicker.picker_select.getSelected(),
		pName=opt.value;
	if (pName in SoftMoon.palettes)  {
		if (confirm(PaletteManager.NOTICES.CONFIRM_DEL('current MasterColorPicker')))  {
			delete SoftMoon.palettes[pName];
			document.getElementById(pName)?.remove();
			opt.remove();
			MasterColorPicker.picker_select.options[0].selected=true;
			UniDOM.generateEvent(MasterColorPicker.picker_select, 'change', {bubbles:true});  }  }
	else  {
		notice(PaletteManager.NOTICES.CHOOSE_PALETTE).classList.add('error');
		UniDOM.generateEvent(MasterColorPicker.picker_select, 'tabIn', {bubbles:true});  }  }

PaletteManager.tabToNextPort=tabToNextPort;
function tabToNextPort(legend)  {
	var port=legend.parentNode;
	while ((port=port.nextElementSibling)  ||  (port=HTML.querySelector('[port]')))  {
		// at least, the user-loaded port will never be disabled in normal operation
		if (!port.disabled)  return port.firstElementChild;  }  }

function tabToNext(e)  {
	if (e.shiftKey || e.ctrlKey || e.altKey || e.metakey || e.getModifierState('AltGraph') || e.getModifierState('OS'))  return;
	var newt;
	const
		isTabStop=(en)=>{
			const flag=(SoftMoon.WebWare.Picker.isInput(en) || parseInt(en.getAttribute('tabindex'))>=0);
			goDeep.doContinue=!flag;
			return flag;  },
		goDeep=UniDOM.alwaysTrue;
	switch (e.key)  {
		case 'ArrowUp': newt=UniDOM.getElders(e.target, isTabStop, goDeep)[0];
		break;
		case 'ArrowDown':
			if (e.target.getAttribute('tabToTarget')==='true')
				newt=MasterColorPicker.dataTarget;
			else newt=UniDOM.getJuniors(e.target, isTabStop, goDeep)[0];
		break;
		default: return;  }
	e.preventDefault();  e.stopPropagation();
	if (newt)
		UniDOM.generateEvent(newt, 'tabIn', {bubbles:true}, {tabbedFrom:e.target, relatedTarget:e.target});  }


UniDOM.addEventHandler(window, 'onload', function PaletteManager_initializer_1()  {
	HTML=document.getElementById('MasterColorPicker_PaletteManager');
	const
		opts=HTML.querySelector('fieldset.controls fieldset'),
		hlfs=HTML.querySelector('fieldset.hardloaded'),
		ports=HTML.querySelectorAll('[port]');
	UniDOM.addEventHandler(opts, "tabIn", (event)=>{if (!opts.contains(event.relatedTarget))  opts.classList.add('focus-within');});
	UniDOM.addEventHandler(opts, "focusout", (event)=>{if (!opts.contains(event.relatedTarget))  opts.classList.remove('focus-within');});
	UniDOM.disable(hlfs, hlfs.classList.contains('disabled'));
	UniDOM.addEventHandler(ports, 'keydown', tabToNext);
	UniDOM.addEventHandler(window, [
			'MasterColorPicker_BrowserDB_update',
			'MasterColorPicker_ServerDB_update',
			'MasterColorPicker_palettes_hardloaded',
			'MasterColorPicker_palettes_userloaded'], PaletteManager);
	const
		fileInput=HTML.querySelector('input[type="file"]'),
		dropzones=HTML.querySelectorAll('fieldset.userloaded, fieldset.browser, fieldset.server'),
		killer=HTML.querySelector('button[name*="_deleteCurrentPalette"');
	UniDOM.addEventHandler(HTML, ['dragEnter', 'dragOver', 'drop'], function(e)  {
		e.stopPropagation();
		e.preventDefault();  });
	UniDOM.addEventHandler(dropzones, 'drop', function manageDroppedFileInPaletteManager(event)  {
		event.stopPropagation();
		if (event.target.type==='file')  return;
		event.preventDefault();
		const
			port=event.currentTarget.className,
			store=event.target.closest('fieldset').className;
		if (PaletteManager.doLog)  console.log('Dropping file into the “'+port+'” “'+store+'” store.');
		if (port!=='userloaded'  &&  !store.endsWith('palettes'))  {
			if (PaletteManager.doLog)  console.warn('the dropped file missed it’s mark in the PaletteManager');
			return;  }
		switch (port)  {
		case 'userloaded': PaletteManager.loadFilesToPalettes(event.dataTransfer.files);
		break;
		case 'browser':    PaletteManager.loadFilesToBrowser(store, event.dataTransfer.files);
		break;
		case 'server':     PaletteManager.loadFilesToServer(store, event.dataTransfer.files);
		break;
		default: console.error('the PaletteManager HTML is malformed or something…');  }  });
	UniDOM.addEventHandler(fileInput, 'change', function(event)  {
		PaletteManager.loadFilesToPalettes(event.target.files);  });
	UniDOM.addEventHandler(killer, ['click', 'buttonpress'], deleteCurrentPalette);
	UniDOM.addEventHandler(HTML.querySelector('div.dialog'), 'click', function(event)  {
		const oldDivs=event.currentTarget.children;
		for (var i=oldDivs.length; i>0;)  {
			if (!oldDivs[--i].wait)  oldDivs[i].remove();  }  });  });

UniDOM.addEventHandler(window, 'mastercolorpicker_database_ready',
	function PaletteManager_initializer_2(event)  {
		renamer=HTML.querySelector('input[name*="renamer"]');
		renamer.parentNode.removeChild(renamer);
		const server=( /^https?\:$/ ).test(window.location.protocol)  &&  HTTP;
		if (server)
			HTML.querySelector('fieldset.server legend filepath').append(SoftMoon.colorPalettes_defaultPath);
		PaletteManager.supportsServer=server;
		UniDOM.disable(HTML.querySelector('fieldset.server'), !server);
		UniDOM.getElementsBy$Name(HTML, /selectAll/ ).addEventHandler('onchange', function(event)  {
			const chkBoxs=event.target.closest('fieldset').querySelectorAll('input[type="checkbox"]');
			for (var i=1; i<chkBoxs.length; i++)  {chkBoxs[i].checked=event.target.checked;}  });
		if (event.detail)
			UniDOM.addEventHandler(HTML.querySelector('.browser button[name="MasterColorPicker_PaletteMngr_refresh"]'),
				['click', 'buttonpress'], refreshDBList);
		else  {
			UniDOM.disable(HTML.querySelector('fieldset.browser'), true);
			if (!server)  HTML.querySelector('input[type="file"]').setAttribute("tabToTarget", 'true');  }
		if (server)
			UniDOM.addEventHandler(HTML.querySelector('.server button[name="MasterColorPicker_PaletteMngr_refresh"]'),
				['click', 'buttonpress'], refreshServerList);
		UniDOM.addEventHandler(HTML.querySelectorAll('button[name="MasterColorPicker_PaletteMngr_load"]'),
			['click', 'buttonpress'], loadAllSelected);
		UniDOM.addEventHandler(HTML.querySelectorAll('button[name="MasterColorPicker_PaletteMngr_delete"]'),
			['click', 'buttonpress'], deleteAllSelected);
		UniDOM.addEventHandler(HTML.querySelectorAll('button[name="MasterColorPicker_PaletteMngr_save"]'),
			['click', 'buttonpress'], saveFilesLocally);
		UniDOM.addEventHandler(HTML.querySelectorAll('button[name="MasterColorPicker_PaletteMngr_addSelected"]'),
			['click', 'buttonpress'], addAllSelected);
		UniDOM.addEventHandler(HTML.querySelectorAll('.browser ul, .server ul'),
			['click', 'contextmenu', 'change', 'keydown'], renamePalette, true);
		const openButton=document.querySelector('#MasterColorPicker_options button[name="MasterColorPicker_PaletteMngr_open');
		UniDOM.addEventHandler(HTML.querySelectorAll('button[name="MasterColorPicker_PaletteMngr_close"]'),
			['click', 'buttonpress'], function(e)  {
				if (e.type==='buttonpress')  MasterColorPicker.dataTarget.focus();  //this will activate only inline onblur/onfocusout events on the button
				if (HTML.contains(document.activeElement))  // the element will disappear when we disable it, and then it will not automatically generate a focusout event
					UniDOM.generateEvent(document.activeElement, 'focusout', {bubbles:true, relatedTarget:MasterColorPicker.dataTarget});
				openButton.setAttribute('aria-expanded', 'false');
				openButton.setAttribute('aria-pressed', 'false');
				UniDOM.disable(HTML, true);  });
		UniDOM.addEventHandler(openButton,
			['click', 'buttonpress'], function()  {
				if (HTML.disabled)  {
					refreshDBList();
					refreshServerList();  }
				UniDOM.disable(HTML, false);
				this.setAttribute('aria-expanded', 'true');
				this.setAttribute('aria-pressed', 'true');
				setTimeout(function(){MasterColorPicker.setTopPanel(HTML);}, 20);  });
		if (!(HTML.disabled=UniDOM.has$Class(HTML, 'disabled')))  {
			refreshDBList();
			refreshServerList();  }  },
	{once:true});


}  // close the private namespace for the PaletteManager





// =================================================================================================== \\



{  //open a private namespace for the Gradientor

const
	Gradientor= SoftMoon.WebWare.Gradientor= new SoftMoon.WebWare.Color_Picker('Gradientor'),
	RGB_calc= new SoftMoon.WebWare.RGB_Calc({
		defaultAlpha: undefined,
		RGBA_Factory:Array,
		HSLA_Factory:Array,
		HSBA_Factory:Array,
		HCGA_Factory:Array,
		CMYKA_Factory:Array,
		useHexSymbol:true}, true);

let
	steps, triads, colorSpace, width, height;

Gradientor.buildTriadicPalette=function buildGradientorTraidicPalette()  {
	MasterColorPicker.RGB_calc.config.stack({
		RGBA_Factory:{value:Array},
		defaultAlpha:{value:1}});
	try {
	var
		c1=MasterColorPicker.RGB_calc(triads[0].value),
		c2=MasterColorPicker.RGB_calc(triads[1].value),
		c3=MasterColorPicker.RGB_calc(triads[2].value);
	} finally {MasterColorPicker.RGB_calc.config.cull();}
	if (!(c1 && c2 && c3))  return;
	const
		cnvs=document.createElement('canvas'),
		cSpace=colorSpace.value.toLowerCase(),
		variety=parseInt(steps.value)-1,
		spaceX=(width/(variety+1))/2,
		spaceY=spaceX/Math.cos(_['30°']),
		radius=spaceY+0.5;
	cnvs.width=width;  cnvs.height=(width/2)/Math.tan(_['30°'])+spaceY/2;
	const
		context=cnvs.getContext('2d'),
		hexagon=SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon.bind(null, context, context.lineTo.bind(context), 6);
	//first we draw the top point color individually, since we can’t divide by 0 in the loops, so we start the loop below @j=1 : the second row
	//otherwise we test for j===0 for EVERY color drawn and slow the loop
	context.fillStyle= RGB_calc.to.hex(c1);
	context.beginPath();
	hexagon(width/2, spaceY, radius, radius);
	context.closePath();
	context.fill();
	if (cSpace!=='rgb')  {
		c1=RGB_calc.to[cSpace](c1);
		c2=RGB_calc.to[cSpace](c2);
		c3=RGB_calc.to[cSpace](c3);  }
	for (let j=1; j<=variety; j++)  { for (let c$, k=0; k<=j; k++)  {
		context.fillStyle= RGB_calc.to.hex(RGB_calc.from[cSpace](mixTriads(c1,c2,c3,j,k,variety,cSpace)));
		context.beginPath();
		hexagon(width/2 - spaceX*j + spaceX*k*2,  spaceY*j*1.5 + spaceY,  radius, radius);
		context.closePath();
		context.fill();  }  }
	Gradientor.HTML.querySelector('canvas').replaceWith(cnvs);  }

Gradientor.mixTriads=mixTriads;
function mixTriads(c1, c2, c3, j, k, variety, cSpace)  { // j!==0
	switch (cSpace)  {
		case 'cmyk':
		case 'rgb':  return mixColors(c1, mixColors(c2,c3,k/j), j/variety);
		break;
		default:  //round color spaces with a polar factor (hue):
		// if saturation (chroma) === 0, this is a grayscale, no color;
		// grayscale values use the "red" hue (0° or 360°)
		// and we don't want to cycle through all the hues between to grade to a grayscale.
		if (c3[1]===0)  c3[0]= (c2[1]===0) ? c1[0] : c2[0]+(c1[0]-c2[0])*((variety-j)/variety);
		if (c2[1]===0)  c2[0]= (c3[1]===0) ? c1[0] : c3[0]+(c1[0]-c3[0])*((variety-j)/variety);
		// take the shortest path around the circle: counterclockwise or clockwise
		if (c3[0]-c2[0]>0.5)  c2[0]+=1;
		else
		if (c2[0]-c3[0]>0.5)  c3[0]+=1;
		let c$=mixColors(c2, c3, k/j);  c$[0]%=1;
		if (c1[1]===0)  c1[0]=c$[0];
		else
		if (c$[1]===0)  c$[0]=c1[0];
		if (c1[0]-c$[0]>0.5)  c$[0]+=1;
		else
		if (c$[0]-c1[0]>0.5)  c1[0]+=1;
		c$=mixColors(c1, c$, j/variety);  c$[0]%=1;
		return c$;  }  }

// we round to get rid of floating-point math errors; this level of accuracy is sufficient for the sRGB gamut (255³)
const rounder=Math.roundTo.bind(Math, 5);  // ← 5 decimal places
function mixColors(_1, _2, mix) {return _1.map((c,i)=>rounder(c+(_2[i]-c)*mix));}

Gradientor.mixBiads=mixBiads;
function mixBiads(c1, c2, mix, cSpace)  {
	switch (cSpace)  {
		case 'cmyk':
		case 'rgb':  return mixColors(c1,c2,mix);
		default:  //round color spaces with a polar factor (hue):
		// if saturation (chroma) === 0, this is a grayscale, no color;
		// grayscale values use the "red" hue (0° or 360°)
		// and we don't want to cycle through all the hues between to grade to a grayscale.
		if (c1[1]===0)  c1[0]= c2[0];
		else
		if (c2[1]===0)  c2[0]= c1[0];
		// take the shortest path around the circle: counterclockwise or clockwise
		if (c2[0]-c1[0]>0.5)  c1[0]+=1;
		else
		if (c1[0]-c2[0]>0.5)  c2[0]+=1;
		let c$=mixColors(c1, c2, mix);  c$[0]%=1;
		return c$;  }  }


const
	MSG_CANT_ADD='can’t add to non-existant previous position.',
	MSG_CANT_DIV='can’t divide without totalPixels.',
	MSG_OUT_OF_RANGE='stop position out of range (0%–100%).',
	MSG_OUT_OF_ORDER='stop positions out of order.';


Gradientor.gatherLinearStops=function gradientor_gatherStops(sets, map) {
	// we depend on “input type numeric” and it guaranteeing the proper unit (percents or pixels); we do not check syntax within
	// we return an array of objects; or null if any colors or stop-points are invalid.
	// The returned pos (position) values are factors from 0-1.
	const
		stops=new Array;
	for (const set of sets)  {
		const stop=new Object;
		for (let i=0;  i<map.length;  i++)  {
			stop[map[i]]=set.elements[i].value?.trim() || "";  }
		stops.push(stop);  }
	if (stops[0].pos=="")  stops[0].pos='0%';
	else if (parseFloat(stops[0].pos)!==0)  stops.unshift({
			color: stops[0].color,
			pos: '0%' });
	var totalPixels, last=stops.length-1;
	while (last>=0  &&  stops[last].color==""  &&  stops[last].pos=="")  {stops.length--;  last--;}
	if (stops[last].pos?.endsWith('%'))  {
		if (parseFloat(stops[last].pos)!==100)  stops.push({
			color: stops[last].color,
			pos: '100%' });  }
	else {
		if (stops[last].pos!="")  totalPixels=parseFloat(stops[last].pos);
		stops[last].pos='100%';  }
	for (let pending=0, pendOff=0, addTo, i=0;  i<stops.length;  i++)  {
		if (stops[i].pos=="")  {
			if (stops[i].color=="")  {stops.splice(i,1);  i--}
			else  {pending++;  pendOff++;}
			continue;  }
		if (stops[i].pos.startsWith('+'))  {
			if (pending)  {
				if (stops[i].color=="")  {pendOff++;  continue;}  // here we have an additive color-hint in the midst of blank positions, that gets put-off untill the end
				else  return MSG_CANT_ADD;  }
			addTo=parseFloat(stops[i-1].pos);  }
		else addTo=0;
		if (stops[i].pos.endsWith('%'))  stops[i].pos=parseFloat(stops[i].pos)/100 + addTo;
		else  {
			if (totalPixels)  stops[i].pos=parseFloat(stops[i].pos)/totalPixels + addTo;
			else  return {message:MSG_CANT_DIV+' - A', data:stops};  }
		if (stops[i].pos<0  ||  stops[i].pos>1)  return {message:MSG_OUT_OF_RANGE, data:stops};
		if (i>0  &&  stops[i].pos < stops[i-pendOff-1].pos)  return {message:MSG_OUT_OF_ORDER, data:stops};
		if (pending)  {  // here we fill in the positions that were left blank, skipping any ones in the middle that were additive color-hints
			const
				start=i-pendOff-1,
				base=stops[start].pos,
				spread=(stops[i].pos - base) / (pending + 1);
//console.log('pending: ',pending,pendOff,start,i,' base:',base,' spread:',spread);
			do {if (stops[start+pendOff].pos=="")  stops[start+pendOff].pos= base + spread*(pending--);}
			while ( --pendOff );  }  }
	for (let i=0;  i<stops.length;  i++)  {  // here we fill in the remaining mid-point-color-hints that were additive in nature, but were in the midst of blank positions
		if (typeof stops[i].pos !== 'string')  continue;
		if (stops[i].pos.endsWith('%'))
			stops[i].pos= stops[i-1].pos + ( stops[i+1].pos - stops[i-1].pos )*( parseFloat(stops[i].pos)/100 );
		else  {
			if (totalPixels)  stops[i].pos= parseFloat(stops[i].pos)/totalPixels + stops[i-1].pos;
			else  return {message:MSG_CANT_DIV+' - B', data:stops};
			if (stops[i].pos<0  ||  stops[i].pos>1)  return {message:MSG_OUT_OF_RANGE, data:stops};
			if (stops[i].pos < stops[i-1].pos  ||  stops[i].pos > stops[i+1].pos)  return {message:MSG_OUT_OF_ORDER, data:stops};  }  }
	return stops;  }

//Gradientor.doLog=true;

Gradientor.processLinearColorStops=function processGradientorColorStops(cSpace) {
	const
		stops=this.gatherLinearStops(  // ←each has 2 inputs: color and stop-point
			document.querySelectorAll('#MasterColorPicker_Gradientor_linear-colors fieldset'),
			['color', 'pos'] );  // ←this array maps to the order of inputs found in the HTML
	if (!(stops instanceof Array))  {
		if (this.doLog)  console.error('MasterColorPicker Gradientor error: ',stops);
		return;  }
	MasterColorPicker.RGB_calc.config.stack({
		RGBA_Factory: {value: Array},
		HSLA_Factory: {value: Array},
		HSBA_Factory: {value: Array},
		HCGA_Factory: {value: Array},
		CMYKA_Factory: {value: Array},
		defaultAlpha: {value: 1}
		});
	try { for (const stop of stops)  {
		if (stop.color!="")  {
			const boogar=stop.color;
			if (null===(stop.color=MasterColorPicker.RGB_calc.to[cSpace](stop.color)))  {
				if (this.doLog)  console.error('MasterColorPicker Gradientor error: unknown color: “'+boogar+'”');
				return;  }  }  }
	} finally {MasterColorPicker.RGB_calc.config.cull();}
	for (let i=0; i<stops.length; i++)  {
		if (stops[i].color=="")  {
			if (i===0  ||  (stops[i+1]?.color)=="")  {
				if (this.doLog)  console.error('MasterColorPicker Gradientor error: can’t interpolate colors over more than one stop or at end of spectrum; i=',i,stops);
				return;  }
			stops[i].color= mixBiads(stops[i-1].color, stops[i+1].color, 0.5, cSpace);  }  }
	if (this.doLog)  console.log('MasterColorPicker Gradientor color stops: ',stops);
	return stops;  }

Gradientor.buildLinearPalette=function buildGradientorLinearPalette() {
	const
		cSpace=colorSpace.value.toLowerCase(),
		stops=this.processLinearColorStops(cSpace);
	if (!(stops instanceof Array))  return;
	const
		cnvs=document.createElement('canvas'),
		variety=parseInt(steps.value)-1,
		spaceX=width/(variety+1);
	cnvs.width=width;  cnvs.height=height;
	const
		context=cnvs.getContext('2d');
	for (let i=0; i<=variety; i++)  {
		const
			$=i/variety,
			color=this.getColorInGradient(stops, $, cSpace);
		context.fillStyle= RGB_calc.to.hex(RGB_calc.from[cSpace](color));
		context.fillRect(Math.floor(i*spaceX), 0, Math.ceil(spaceX), height);  }
	Gradientor.HTML.querySelector('canvas').replaceWith(cnvs);  }

Gradientor.getColorInGradient=function Gradientor_getColorInGradient(stops, $x, cSpace)  {
	let s=1;
	while (s<stops.length-1  &&  stops[s].pos<$x)  {s++;}
	return mixBiads(stops[s-1].color,  stops[s].color,  ($x-stops[s-1].pos) / (stops[s].pos-stops[s-1].pos),  cSpace);  }

Gradientor.getColor=function Gradientor_getColor(event)  {
	if (event.target.tagName!=='CANVAS'
	||  event.offsetX<0  ||  event.offsetX>=width)  return null;
	MasterColorPicker.RGB_calc.config.stack({
		RGBA_Factory:{value:Array},
		defaultAlpha:{value:1}});
	try {
	const
		cSpace=colorSpace.value.toLowerCase(),
		variety=parseInt(steps.value)-1;
	switch (Gradientor.HTML.querySelector('input[name*="format"]:checked').value)  {
	case 'triadic':
		const
			c1=MasterColorPicker.RGB_calc(triads[0].value),
			c2=MasterColorPicker.RGB_calc(triads[1].value),
			c3=MasterColorPicker.RGB_calc(triads[2].value);
		if (!(c1 && c2 && c3))  return;
		const
			spaceX=(width/(variety+1))/2,
			spaceY=spaceX/Math.cos(_['30°']);
		const j=Math.round((event.offsetY-spaceY)/(spaceY*1.5));
		if (j<0  ||  j>variety)  return null;
		const k=Math.round((event.offsetX-width/2+spaceX*j)/(spaceX*2));
		if (k<0  ||  k>j)  return null;
		let c=RGB_calc.to[cSpace](c1);
		if (j!==0)  c=mixTriads(c, RGB_calc.to[cSpace](c2), RGB_calc.to[cSpace](c3), j,k,variety,cSpace);
		return new Gradientor.Color_SpecCache(c, cSpace);
	case 'linear':
		const
			stops=Gradientor.processLinearColorStops(cSpace);
		if (!(stops instanceof Array))  return null;
		return new Gradientor.Color_SpecCache(this.getColorInGradient(stops, Math.floor(event.offsetX/(width/(variety+1)))/(variety), cSpace), cSpace);
	default: return null  }
	} finally {MasterColorPicker.RGB_calc.config.cull();}  }

Gradientor.Color_SpecCache=function(c, space)  {
		if (!new.target)  throw new Error('“Gradientor.Color_SpecCache” is a constructor, not a function.');
		space=space.toUpperCase();
		this.model=space;
		if (space!=='RGB')  {
			MasterColorPicker.RGB_calc.config.stack({
				inputAsFactor: {value: true},
				RGBA_Factory: {value: SoftMoon.WebWare.RGBA_Color}  });
			try {this.RGB=MasterColorPicker.RGB_calc.from[space.toLowerCase()](c);}
			finally {MasterColorPicker.RGB_calc.config.cull();}
			switch (space)  {
			case 'HSL':  this.HSL=new SoftMoon.WebWare.HSLA_Color(...c);
			break;
			case 'HSB':
			case 'HSV':  this.HSB=new SoftMoon.WebWare.HSBA_Color(...c);
			break;
			case 'HCG':  this.HCG=new SoftMoon.WebWare.HCGA_Color(...c);
			break;
			case 'CMYK':  this.CMYK=new SoftMoon.WebWare.CMYKA_Color(...c);  }  }
		else  this.RGB=new SoftMoon.WebWare.RGBA_Color(...c);  }
Gradientor.Color_SpecCache.prototype=Object.create(
			SoftMoon.WebWare.Color_Picker.Color_SpecCache.prototype,
			{name: {value:'SoftMoon.WebWare.Gradientor.Color_SpecCache'},
			 constructor: {value: Gradientor.Color_SpecCache}});



UniDOM.addEventHandler(window, 'onload', function MasterColorPicker_Gradientor_onload()  {
	Gradientor.HTML=document.getElementById('MasterColorPicker_Gradientor');
	Gradientor.txtInd=Gradientor.HTML.querySelector('indicator');
	Gradientor.swatch=Gradientor.txtInd.querySelector('swatch');
	steps=Gradientor.HTML.querySelector('input[name*="steps"]');
	triads=Gradientor.HTML.querySelectorAll('input[name*="colorT"]');
	colorSpace=Gradientor.HTML.querySelector('select[name*="colorSpace"]');
	const cnvs=Gradientor.HTML.querySelector('canvas');
	width=cnvs.width;  height=cnvs.height;
	const
		colorsFS=document.getElementById('MasterColorPicker_Gradientor_linear-colors'),
		//triadsFS=document.getElementById('MasterColorPicker_Gradientor_triadic-colors'),
		genie=new SoftMoon.WebWare.FormFieldGenie({
			minGroups: 2,
			maxGroups: 64,
			groupTag:'FIELDSET',
			checkForFilled:'any',
			doFocus: false,
			cloneCustomizer: function(fs) {
				const style=fs.querySelector('swatch').style;
				style.border="";  style.color="";  style.backgroundColor="";
				var inp;
				for (inp of fs.querySelectorAll('input'))  {inp.value="";  inp.className="";}
				inp.setAttribute('type', 'numeric');
				SoftMoon.WebWare.register_input_type_numeric(inp);  } });
	UniDOM.addEventHandler(colorsFS, 'onFocusIn', function(){genie.tabbedOut=false});
	UniDOM.addEventHandler(colorsFS, 'onKeyDown', genie.catchTab);
	UniDOM.addEventHandler(colorsFS, 'onFocusOut', function(event)  {
		genie.popNewGroup(event.target.parentNode, {doFocus: event.target.name.includes('offset')});  });
	UniDOM.addEventHandler(Gradientor.HTML, 'onChange', buildGradientorPalette);
	UniDOM.addEventHandler(Gradientor.HTML.querySelectorAll('span[referto]'), 'onClick', function(event)  {
		MasterColorPicker.userOptions.showHelp.checked=true;
		UniDOM.generateEvent(MasterColorPicker.userOptions.showHelp, 'change');
		MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Help'));
		document.getElementById(event.currentTarget.getAttribute('referto')).scrollIntoView();  });
	const init=UniDOM.addEventHandler(window, 'mastercolorpicker_palettes_loaded', buildGradientorPalette, {once:true});
	function buildGradientorPalette()  {
		const format=Gradientor.HTML.querySelector('input[name*="format"]:checked');
		UniDOM.swapOut$Class(Gradientor.HTML, ["linear", "triadic"], format.value);
		UniDOM.toggleTab(format, true);
		//colorsFS.disabled= (format!=='linear');
		//triadsFS.disabled= (format!=='triadic');
		Gradientor.HTML.querySelector('canvas').style.display='none';
		switch (format.value)  {
		case 'triadic': Gradientor.buildTriadicPalette();
		break;
		case 'linear':  Gradientor.buildLinearPalette();  }  }
	UniDOM.addEventHandler(Gradientor.HTML.querySelector('div'), ['mouseOver', 'mouseMove', 'mouseOut', 'click'], Gradientor);
	});  //close window onload

}  //close Gradientor private namespace


/*==================================================================*/




UniDOM.addEventHandler(window, 'onload', function()  {  //the onchange handler is embedded in the HTML ↓↓
	UniDOM.generateEvent(document.querySelector('#MasterColorPicker_Mixer fieldset input:checked'), 'change', {bubbles:true});  });

{  //open a private namespace for the Blender & EyeDropper (they share similar functionality)

const
	EyeDropper=new SoftMoon.WebWare.Color_Picker('EyeDropper'),
	Blender=new Object;
SoftMoon.WebWare.EyeDropper=EyeDropper;
SoftMoon.WebWare.Blender=Blender;
EyeDropper.name='EyeDropper';
Blender.name='Blender';


function loadBG(bgFile, asCanvas=false)  {
	const
		bgImage=new Image(),
		playground=this.playground;
	this.bgImage=bgImage;
	bgImage.onload=function()  {
		URL.revokeObjectURL(this.url);
		if (asCanvas)  {
			scale=1; x= y= undefined;
			EyeDropper.sizzors.classList.remove('uncut');
			EyeDropper.sizzors.title='cut';  }
		applyBG(this, playground, asCanvas);  }
	bgImage.onerror=(e) => {
		console.log('error loading file for the '+this.name+' background:',e);  }
	bgImage.url=URL.createObjectURL(bgFile);
	bgImage.src=bgImage.url;  }

let scale=1, x, y;

function applyBG(img, playground, asCanvas, x=0, y=0, w, h)  {
	if (playground.bgElement?.isConnected)  playground.removeChild(playground.bgElement);
	if (asCanvas)  {
		var canvas=document.createElement('canvas');
		w??=img.naturalWidth;  h??=img.naturalHeight;
		w=Math.round(w);  h=Math.round(h);
		canvas.width=w*scale;
		canvas.height=h*scale;
		canvas.context=canvas.getContext('2d');
		img.clip={x:x, y:y, w:w, h:h};
		if (scale<2  ||  EyeDropper.zoomSmooth.checked)
			canvas.context.drawImage(img,x,y,w,h,0,0,canvas.width,canvas.height);
		else  {
			canvas.context.imageSmoothingEnabled=false;
			canvas.context.drawImage(img,x,y,w,h,0,0,canvas.width,canvas.height);  }  }
	playground.bgElement=canvas||img;
	playground.appendChild(canvas||img);  }


EyeDropper.loadBG=
Blender.loadBG= loadBG;

// this is called by the Color_Picker prototyped event-handlers
EyeDropper.getColor=function getEyeDropperColor(event)  {
	if (event.target.tagName!=='CANVAS')  return null;
	const
		radius=EyeDropper.radius,  // radius=0 → one single pixel;  radius=1 → block of pixels (3×3);  etc.
		r2=radius*radius,
		pixels=event.target.context.getImageData(event.offsetX-radius, event.offsetY-radius, radius*2+1,radius*2+1).data,
		bpl=4*(radius*2+1),  // bytes per line
		center= bpl*radius + 4*radius;
	let
		r=0, g=0, b=0, a=0,
		count=0;
	for (var x=(-radius); x<=radius; x++)  { const yM=Math.round(Math.sqrt(r2-x*x));  //the EyeDropper sample area is “circularish”, not square
		for (var y=(-yM); y<=yM; y++)  {
			const p=center + y*bpl + x*4;
			r+=pixels[p];  g+=pixels[p+1];  b+=pixels[p+2];  a+=pixels[p+3];
			count++  }  }
	return new EyeDropper.Color_SpecCache(new SoftMoon.WebWare.RGBA_Color(r/count, g/count, b/count, (a/count)/255));  }

EyeDropper.Color_SpecCache= class extends SoftMoon.WebWare.Color_Picker.Color_SpecCache {
	constructor(RGB)  {
		if (!new.target)  throw new Error('“EyeDropper.Color_SpecCache” is a constructor, not a function.');
		super(null, 'RGB', RGB);  }  }

// this is the “title” text for the HTML’s zoom buttons, which JavaScript depends on
// if you change the HTML for another language, this should be updated also
EyeDropper.HTMLtext={
	CUT:  'cut',
	UNCUT:'uncut',
	ZOOMIN: 'zoom in',
	ZOOMOUT:'zoom out',
	NOZOOM: 'no zoom' }


UniDOM.addEventHandler(window, 'onload', function MasterColorPicker_EyeDropper_Blender_onload()  {
	EyeDropper.HTML=document.getElementById('MasterColorPicker_EyeDropper');
	Blender.HTML=document.getElementById('MasterColorPicker_Blender');
	EyeDropper.playground=EyeDropper.HTML.querySelector('playground');
	Blender.playground=Blender.HTML.querySelector('playground');
	Blender.helper=Blender.HTML.querySelector('span.help');
	Blender.help=Blender.HTML.querySelector('p.help');
	EyeDropper.screenCtrls=EyeDropper.HTML.querySelectorAll('fieldset > button');
	EyeDropper.porter=EyeDropper.HTML.querySelector('input[type="file"]');
	EyeDropper.txtInd=EyeDropper.HTML.querySelector('indicator');
	EyeDropper.swatch=EyeDropper.HTML.querySelector('swatch');
	EyeDropper.zoomSmooth=EyeDropper.HTML.querySelector('input[type="checkbox"]');
	EyeDropper.sizzors=EyeDropper.HTML.querySelector('button[title="cut"]');
	const
		dropzones=[EyeDropper.HTML, Blender.HTML],
		swatches=Blender.HTML.querySelector('fieldset'),
		playgrounds=[EyeDropper.playground, Blender.playground],
		genie=new SoftMoon.WebWare.FormFieldGenie({
			minGroups: 1,
			maxGroups: 7,
			groupTag:'TEXTAREA',
			doFocus: true,
			cloneCustomizer: function(txta)  {
				const style=txta.style;
				style.border="";  style.color="";  style.backgroundColor="";
				style.left="";  style.top="";  style.zIndex='1';
				txta.value="";  }});
	dropzones[0].tool=EyeDropper;  dropzones[0].imageAsCanvas=true;
	dropzones[1].tool=Blender;
	UniDOM.addEventHandler(dropzones, ['dragEnter', 'dragOver'], function(e)  {
		e.stopPropagation();
		e.preventDefault();  });
	UniDOM.addEventHandler(dropzones, 'drop', function(e)  {
		e.stopPropagation();
		if (event.target.type==='file')  return;
		e.preventDefault();
		this.tool.loadBG(e.dataTransfer.files[0], this.imageAsCanvas);  });
	UniDOM.addEventHandler(dropzones, 'change',  function(event)  {
		if (event.target.type==='file')
			this.tool.loadBG(event.target.files[0], this.imageAsCanvas);  });
	UniDOM.addEventHandler(EyeDropper.screenCtrls, ['click', 'buttonpress'], function(event)  {
		EyeDropper.playground.style.width= "";
		EyeDropper.playground.style.height= "";
		switch (event.target.title)  {
			case 'panel': EyeDropper.HTML.classList.remove('fullscreen');
			break;
			case 'full-screen':
				EyeDropper.HTML.classList.add('fullscreen');
			break;
			default: console.log('Whoa, there, fella!  We got an HTML/JavaScript mismatch goin’ on in the EyeDropper!');  }  });
	UniDOM.addEventHandler(EyeDropper.screenCtrls, 'tabin', function(event)  {
		const fs=EyeDropper.HTML.classList.contains('fullscreen');
		var tabTo;
		switch (this.title)  {
			case 'panel': if (!fs)  {
				if (event.tabbedFrom===EyeDropper.screenCtrls[0])  tabTo=EyeDropper.porter;
				else  tabTo=EyeDropper.screenCtrls[0];
				UniDOM.generateEvent(this, 'tabout', {bubbles:true}, {tabbedTo: tabTo} );
				UniDOM.generateEvent(tabTo, 'tabin', {bubbles:true}, {tabbedFrom: this});  }
			break;
			case 'full-screen':  if (fs)  {
				if (event.tabbedFrom===EyeDropper.screenCtrls[1])  tabTo=MasterColorPicker.picker_select;
				else  tabTo=EyeDropper.screenCtrls[1];
				UniDOM.generateEvent(this, 'tabout', {bubbles:true}, {tabbedTo: tabTo} );
				UniDOM.generateEvent(tabTo, 'tabin', {bubbles:true}, {tabbedFrom: this});  }  }  });
	UniDOM.addEventHandler(EyeDropper.HTML, 'tabout', function(event)  {
		if (!UniDOM.hasAncestor(event.tabbedTo, this))  EyeDropper.HTML.classList.remove('fullscreen');  });

	const box=document.createElement('span');
	var cutter, weBeACuttin=false;
	UniDOM.addEventHandler(EyeDropper.sizzors, ['click'], function(event)  {
		const thisButton=this, sizzors={
			onmousedown: function (event) {
				if (event.buttons!==1
				||  event.target!==EyeDropper.playground.bgElement)  {closeCutter();  x= y= undefined;  return;}
				event.stopPropagation();  event.preventDefault();
				x=event.offsetX;  y=event.offsetY;
				EyeDropper.playground.appendChild(box);
				box.style.width= box.style.height= '0px';
				box.style.left=parseInt(event.target.style.left||0)+x+'px';
				box.style.top=parseInt(event.target.style.top||0)+y+'px';  },
			onmousemove: function(event)  {
				event.stopPropagation();  event.preventDefault();
				if (x===undefined)  return;
				if (event.buttons!==1)  {closeCutter();  x= y= undefined;  return;}
				const
					canvas=EyeDropper.playground.bgElement,
					offset=canvas.getBoundingClientRect(),
					mx=Math.max(offset.x, Math.min(event.clientX, offset.right)),
					my=Math.max(offset.y, Math.min(event.clientY, offset.bottom)),
					w=mx-offset.x-x,
					h=my-offset.y-y,
					bs=box.style;
				bs.width=Math.abs(w)+'px';  bs.height=Math.abs(h)+'px';
				bs.left=parseInt(canvas.style.left||0)+x+(w<0 ? w : 0)+'px';
				bs.top=parseInt(canvas.style.top||0)+y+(h<0 ? h : 0)+'px';  },
			onmouseup: function(event)  {
				event.stopPropagation();  event.preventDefault();
				const
					canvas=EyeDropper.playground.bgElement,
					offset=canvas.getBoundingClientRect(),
					mx=Math.max(offset.x, Math.min(event.clientX, offset.right)),
					my=Math.max(offset.y, Math.min(event.clientY, offset.bottom)),
					w=mx-offset.x-x,
					h=my-offset.y-y;
				applyBG(EyeDropper.bgImage, EyeDropper.playground, true,
								(x+(w<0 ? w : 0))/scale,
								(y+(h<0 ? h : 0))/scale,
								Math.abs(w)/scale,
								Math.abs(h)/scale);
				thisButton.classList.replace('cutting','uncut');  thisButton.title=EyeDropper.HTMLtext.UNCUT;
				closeCutter();  },
			// ↓↓ see “A Note About dragging & dropping” near the end of this file
			onpickerstatechange: done,
			onvisibilitystatechange: done };
		function done()  {closeCutter();  x= y= undefined;}
		function closeCutter()  {
			weBeACuttin=false;
			document.body.classList.remove('MCP_we-be-a-cuttin');
			thisButton.classList.remove('cutting');
			if (box.isConnected)  EyeDropper.playground.removeChild(box);
			if (cutter)  {
				cutter.onMouseDown.remove();  cutter.onMouseMove.remove();  cutter.onMouseUp.remove();
				cutter.onPickerStateChange.remove();  cutter.onVisibilityStateChange.remove();  }
			cutter=undefined;  }
		if (weBeACuttin)  {closeCutter();  x= y= undefined;  return;}  // ←this shouldn’t happen unless we allow buttonpress events on this “cut” button: the sizzors’ mousedown will block it.
		else  {
			if (x===undefined)  {
				weBeACuttin=true;
				document.body.classList.add('MCP_we-be-a-cuttin');
				thisButton.classList.add('cutting')
				cutter=UniDOM.addEventHandler(document, ['onMouseDown','onMouseMove','onMouseUp','onPickerStateChange','onVisibilityStateChange'], sizzors, true);  }
			else  {
				x= y= undefined;
				thisButton.classList.remove('cutting', 'uncut');  thisButton.title=EyeDropper.HTMLtext.CUT;
				applyBG(EyeDropper.bgImage, EyeDropper.playground, true);  }  }  });
	UniDOM.addEventHandler(EyeDropper.HTML.querySelectorAll('label button'), ['click', 'buttonpress'], function(event)  {
		if (!EyeDropper.bgImage)  return;
		switch (event.target.title)  {
			case EyeDropper.HTMLtext.ZOOMIN: if (scale<1)  scale+=.1;  else if (scale<10)  scale=Math.round(scale)+1;
			break;
			case EyeDropper.HTMLtext.ZOOMOUT: if (scale>1)  scale=Math.round(scale)-1;  else if (scale>.2)  scale-=.1;
			break;
			case EyeDropper.HTMLtext.NOZOOM:  scale=1;
			break;
			default: console.error('Whoa, there, fella!  We got an HTML/JavaScript mismatch goin’ on in the EyeDropper!');  }
		const clip=EyeDropper.bgImage.clip;
		applyBG(EyeDropper.bgImage, EyeDropper.playground, true, clip.x, clip.y, clip.w, clip.h);  });
	UniDOM.addEventHandler(EyeDropper.zoomSmooth, 'change', function()  {
		if (scale<2  ||  !EyeDropper.bgImage)  return;
		const clip=EyeDropper.bgImage.clip;
		applyBG(EyeDropper.bgImage, EyeDropper.playground, true, clip.x, clip.y, clip.w, clip.h);  });
	UniDOM.addEventHandler(EyeDropper.zoomSmooth, ['tabin', 'blur'], function(event)  {
		this.closest('fieldset').classList.toggle('focus-within', event.type==='tabin');  });

	UniDOM.addEventHandler(Blender.helper, ['onMouseOver', 'onMouseOut'], function(event)  {
		Blender.help.style.display=(event.type==='mouseover' ? 'block' : "");  });

	UniDOM.addEventHandler(swatches, 'focusIn', function(event)  {
		genie.tabbedOut=false;
		const textarea=event.target;
		textarea.classList.remove('passive');
		textarea.style.color=textarea.foreground;
		// double-clicking to focus selects text – we don’t want to do that
		textarea.selectionStart= textarea.selectionEnd= textarea.value.length;  });
	UniDOM.addEventHandler(swatches, 'onKeyDown', genie.catchTab);
	UniDOM.addEventHandler(swatches, 'focusOut', function(event)  {
		const textarea=event.target;
		textarea.classList.add('passive');
		genie.popNewGroup(textarea);
		textarea.foreground=textarea.style.color;
		// MasterColorPicker’s onchange will recolor the swatch immediately after this focusOut event
		setTimeout(()=>{textarea.style.color="";}, 1);  });
	UniDOM.addEventHandler(swatches, 'mouseDown', function dragSwatch(event)  {
		if (event.target===swatches)  {
			if (event.detail===3
			||  (event.detail===1  &&  event.ctrlKey))  {
				const sws=swatches.querySelectorAll('textarea');
				for (const s of sws)  {s.style.position='relative';  s.style.left=0;  s.style.top=0;}  }
			return;  }
		const
			textarea=event.target,
			notResize= !(event.offsetX>textarea.offsetWidth-14  &&  event.offsetY>textarea.offsetHeight-14);
		// only allow focus on double-click once a color is selected
		if (textarea.value!==""  &&  event.detail!==2
		&&  notResize)
			event.preventDefault();
		if (textarea.style.zIndex != swatches.children.length+9)  {
			const
				kids=Array.from(swatches.children).sort((a,b)=>parseInt(a.style.zIndex)-parseInt(b.style.zIndex)),
				l=kids.length;
			kids.splice(kids.indexOf(textarea), 1);
			kids.push(textarea);
			for (var i=0; i<l; i++)  {kids[i].style.zIndex=(i+10).toString();}  }
		if (notResize  &&  event.detail===1)  {
			const
				swatch=event.target,
				s=swatch.style,
				r=swatch.getBoundingClientRect(),
				mXoff=event.clientX-r.left,
				mYoff=event.clientY-r.top,
				drag=UniDOM.addEventHandler(document.body, 'onMouseMove', dragger, true),
				// ↓↓ see “A Note About dragging & dropping” near the end of this file
				endDrag=UniDOM.addEventHandler(document, ['onMouseUp', 'onPickerStateChange', 'onVisibilityStateChange'], done, true);
			function dragger(event)  {
				event.stopPropagation();  event.preventDefault();
				if (event.buttons!==1)  {done();  return;}
				const
					fr=swatches.getBoundingClientRect(),      //swatches’ fieldset rectangle
					br=Blender.HTML.getBoundingClientRect();  //tool panel’s rectangle
				if (event.clientX<br.left  ||  event.clientX>br.right
				||  event.clientY<br.top   ||  event.clientY>br.bottom)  {
					s.position='fixed';
					s.left=(event.clientX-mXoff)+"px";
					s.top= (event.clientY-mYoff)+"px";
					swatch.classList.add('superTop');  }
				else
				if (event.clientX<fr.left  ||  event.clientX>fr.right
				||  event.clientY<fr.top   ||  event.clientY>fr.bottom)  {
					s.position='absolute';
					s.left=(event.clientX-br.x-mXoff)+"px";
					s.top= (event.clientY-br.y-mYoff)+"px";
					swatch.classList.remove('superTop');   }
				else  {
					if (s.position!=='relative'  ||  !swatch.homeSpot)  {
						s.position='relative';  s.left='0px';  s.top='0px';
						swatch.homeSpot=swatch.getBoundingClientRect();  }
					s.left=(event.clientX-swatch.homeSpot.x-mXoff)+"px";
					s.top= (event.clientY-swatch.homeSpot.y-mYoff)+"px";
					swatch.classList.remove('superTop');  }  }
			function done()  {
				drag.onMouseMove.remove();
				endDrag.onMouseUp.remove();
				endDrag.onPickerStateChange.remove();
				endDrag.onVisibilityStateChange.remove();  }  }  });
	UniDOM.addEventHandler(playgrounds, 'mouseDown', function(event)  {
		const resize= (event.offsetX>this.offsetWidth-14  &&  event.offsetY>this.offsetHeight-14);
		if (resize  &&  event.detail===1)  {
			event.stopPropagation();
			MasterColorPicker.HTML.classList.add('stasis');
			setTimeout(function(){(MasterColorPicker.currentTarget ||  MasterColorPicker.defaultTarget)?.focus();}, 0);
			return;  }
		});
 	UniDOM.addEventHandler(playgrounds, 'mouseUp', function(event)  {
 			MasterColorPicker.HTML.classList.remove('stasis');  });
	UniDOM.addEventHandler(playgrounds[0], ['mouseMove', 'mouseOut', 'click'], EyeDropper);  // Color_Picker prototype handles these
	EyeDropper.size=dropzones[0].querySelector('input[name*="size"]');
	Object.defineProperty(EyeDropper, 'radius', {get() {return parseInt(EyeDropper.size.value);}});
	const bgGray=dropzones[0].querySelector('input[name*="background"]');
	function setBG()  {
		const gray=this.value.toString();
		playgrounds[0].style.backgroundColor='RGB('+gray+','+gray+','+gray+')';  }
	UniDOM.addEventHandler(bgGray, 'change', setBG);
	bgGray.setBG=setBG;  //for your hacking convenience
	bgGray.setBG();  });  // close window onload

}  // close EyeDropper / Blender private namespace


/*==================================================================*/

{  // open a private namespace for the  ColorThesaurus

const ColorThesaurus= SoftMoon.WebWare.ColorThesaurus= new Object;

ColorThesaurus.HTML={
	INVALID: 'Invalid or unknown color.',
	SELECT:  'Please select palette(s) to search.',
	DISPARITY: 'disparity'
}


ColorThesaurus.refreshPaletteList=function refreshPaletteList()  {
	const fs=document.querySelector('#MasterColorPicker_Thesaurus .palette-list');
	while (fs.lastChild.nodeName!=='LEGEND') {fs.removeChild(fs.lastChild);}
	for (const pltName in SoftMoon.palettes)  {
		const
			lbl=fs.appendChild(document.createElement('label')),
			inp=document.createElement('input');
		inp.type='checkbox';
		inp.value=pltName;
		lbl.append(inp, pltName);  }
	fs.lastChild.firstChild.setAttribute('tabToTarget', 'true');  }

ColorThesaurus.matchColor=function matchColor(color)  { /* as an event-handler, “color” is not a color, it’s an Event object and is ignored */
	const
		output=document.querySelector('#MasterColorPicker_Thesaurus output');
	while (output.lastChild)  {output.removeChild(output.lastChild);}
	if (!(color instanceof SoftMoon.WebWare.RGBA_Color))  /* if you pass in a color, it MUST have a valid format */
		color=MasterColorPicker.RGB_calc(document.querySelector('#MasterColorPicker_Thesaurus input').value);
	if (!color)  {
		output.appendChild(document.createElement('p')).append(ColorThesaurus.HTML.INVALID);
		return;  }
	const
		plts=document.querySelectorAll('#MasterColorPicker_Thesaurus input'),
		results=[];
	for (var i=1; i<plts.length; i++)  {if (plts[i].checked)  searchPalette(SoftMoon.palettes[plts[i].value], plts[i].value);}
	if (results.length===0)   {
		output.appendChild(document.createElement('p')).append(ColorThesaurus.HTML.SELECT);
		return;  }
	results.sort((a,b) => a.disparity-b.disparity);
	const
		ol=document.createElement('ol');
	for (const clr of results)  {
		const
			span=document.createElement('span'),
			swatch=document.createElement('span');
		span.className='disparity';
		span.append(clr.disparity.toFixed(7));
		swatch.className='swatch';
		swatch.style.backgroundColor=clr.color.hex;
		swatch.style.color=clr.color.contrast;
		ol.appendChild(document.createElement('li')).append(span, " — ", swatch, clr.name);  }
	output.appendChild(document.createElement('p')).append(ColorThesaurus.HTML.DISPARITY+' —');
	output.append(ol);
	function searchPalette(plt, name, alts, refMarks, requireSubIndex)  {
		if (plt.alternatives)  alts=plt.alternatives;
		if (plt.referenceMarks)  refMarks=plt.referenceMarks;
		if (plt.requireSubindex)  requireSubIndex=plt.requireSubindex;
		for (const pClr in plt.palette)  {
			if (plt.palette[pClr].palette)  {
				searchPalette(plt.palette[pClr], name+(requireSubIndex ? (': '+pClr) : ""), alts, refMarks, requireSubIndex);
				continue;  }
			if (alts  /* do not consider “alternative” color names */
			&&  ((alts==='UPPERCASE'  &&  pClr===pClr.toUpperCase())
				|| (alts==='lowercase'  &&  pClr===pClr.toLowerCase())))  continue;
			if (refMarks  /* do not consider “unnamed” colors */
			&&  pClr.substr(0, refMarks[0].length)===refMarks[0]
			&&  pClr.substr(-refMarks[1].length)===refMarks[1])  continue;
			const pltClr=MasterColorPicker.RGB_calc(plt.palette[pClr]);
			if (pltClr==null)  continue;
			results.push({
				name: name+': '+pClr,
				color: pltClr,
				disparity: ColorThesaurus.compare(color.to.hcg, pltClr.to.hcg) });  }  }  }

/*
	c1 & c2 should each be a SoftMoon.WebWare.HCGA_Color
		or provide similar properties.
	a “disparity” value is returned: 0 =< disparity =< 1
		0 = no disparity – colors match exactly
		1 = complete mismatch (only if one is transparent, otherwise can never actually reach this level because achromatic values don’t consider hues)
*/
ColorThesaurus.compare=function compareColors(c1, c2)  {
	if (c1.alpha===0 ^ c2.alpha===0) return 1;
	if (c1.alpha===0 && c2.alpha===0)  return 0;
	var hdif=Math.abs( c1.hue - c2.hue );
	if (hdif>0.5)  hdif=1-hdif;
	//const hChromaFactor= Math.min(c1.chroma, c2.chroma)
	//const hChromaFactor= c2.chroma===0 ? 0 : c1.chroma;
	const hChromaFactor= (c1.chroma===0 || c2.chroma===0) ? 0 : Math.sin(π_2*((c1.chroma+c2.chroma)/2));
	return (
					hChromaFactor*hdif*2 +
					(1-Math.max(c1.chroma, c2.chroma))*Math.abs(c1.gray-c2.gray) +
					Math.abs(c1.chroma-c2.chroma)
				 )/2;  }

UniDOM.addEventHandler(window, 'mastercolorpicker_palettes_loaded', function()  {
		//SoftMoon.WebWare.ColorThesaurus.refreshPaletteList();
		UniDOM.addEventHandler(document.querySelector('#MasterColorPicker_Thesaurus button.refresh'),
			['click', 'buttonpress'], ColorThesaurus.refreshPaletteList);
		UniDOM.addEventHandler(document.querySelector('#MasterColorPicker_Thesaurus button.match'),
			['click', 'buttonpress'], ColorThesaurus.matchColor);  },
	{once:true});

}  // close  ColorThesaurus  private namespace

/*==================================================================*/



// =================================================================================================== \\


var MasterColorPicker={};  // this is a global variable: a property of the window Object.
// You can add configuration properties to this object before the window is fully loaded.
// This object will be replaced in the window.onload function below:


UniDOM.addEventHandler(window, 'onload', function MasterColorPicker_onload()  {  //until file end:






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
		aria_popUp: document.getElementById('MasterColorPicker'),
		doKeepInterfaceFocus: true,  //←most interface control elements keep focus when the ENTER key is pressed
		picker_select: document.getElementById('MasterColorPicker_palette_select'),
		pickFilters: [SoftMoon.WebWare.Color_Picker.ColorFilter,   //modifies the selected color: filters colors in or out
									SoftMoon.WebWare.ColorSpaceLab.setColor,      //sets the input-values of the Lab and expands the selected color’s data-format to include all applicable Color-Spaces
									SoftMoon.WebWare.Color_Picker.pickFilter,    //determines the final text-output of the picked color and adds it to the colorSpecCache object:  colorSpecCache.text_output
									SoftMoon.WebWare.Color_Picker.toSystemClipboard] } );
							//  ↑ the pickFilters filter the “picked” data and handle any other
							// chores before MasterColorPicker.pick() adds the text
							// to the active MasterColorPicker.dataTarget.value

var calcOpts={
	RGBA_Factory: function(r,g,b,a) {return new SoftMoon.WebWare.RGBA_Color(r,g,b,a,{useHexSymbol: true})},
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
MasterColorPicker.outputFormat=("outputFormat" in user) ? user.outputFormat : ("outputFormat" in meta) ? meta.outputFormat : 'wrapped';  // see  SoftMoon.WebWare.« RGBA_Color ‖ ColorWheel_Color ‖ CMYKA_Color ».toString  in RGB_Calc.js file


//we tell the Color_Picker.pickFilter to use its related colorSwatch function: (we can also use it by calling it directly)
MasterColorPicker.colorSwatch=  ("colorSwatch" in user) ? user.colorSwatch  : SoftMoon.WebWare.Color_Picker.colorSwatch;
//options for the default colorSwatch function given above
MasterColorPicker.showColorAs=  ("showColorAs" in user) ? user.showColorAs  :  ("showColorAs" in meta) ? meta.showColorAs                     : 'swatch';   //  'swatch'  or  'background'←of the element passed into colorSwatch()←i.e. the current MasterColorPicker.dataTarget
MasterColorPicker.swatch=            ("swatch" in user) ? user.swatch       :       ("swatch" in meta) ? document.getElementById(meta.swatch) : false;     // no universal swatch element provided here, so colorSwatch() will figure it from the dataTarget ↑.
MasterColorPicker.toggleBorder=("toggleBorder" in user) ? user.toggleBorder : ("toggleBorder" in meta) ? Boolean.evalString(meta.toggleBorder, true)  : true;      // of the swatch when it has a valid color
MasterColorPicker.borderColor=  ("borderColor" in user) ? user.borderColor  :  ("borderColor" in meta) ? meta.borderColor                     : 'invert';  // HTML/CSS color  or  'invert'
// When the ColorSpaceLab wants to add an alpha value to a Palette color,
// and the setting is for “convert to RGB”,
// do we still add (non-standard) alpha data to the color name text?
MasterColorPicker.alwaysApplyAlphaToPaletteColors=  ("alwaysApplyAlphaToPaletteColors" in user) ? user.alwaysApplyAlphaToPaletteColors  :  ("alwaysApplyAlphaToPaletteColors" in meta) ? meta.borderColor  : true;



MasterColorPicker.MyPalette=new SoftMoon.WebWare.Color_Picker.MyPalette(document.getElementById('MasterColorPicker_MyPalette'), "MyPalette");
MasterColorPicker.pickFilters.push(MasterColorPicker.MyPalette);




//Any document subsection that is not part of the picker mainPanel, but is part of the picker interface and
//therefore may require “clicking on” or have elements that require “focus”, needs to be registered to work properly
//the order of registration will affect the initial  CSS: z-index  properties.  First registered on top.
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_options'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_MyPalette'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Lab'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Mixer'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Gradientor'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Thesaurus'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_Help'));}catch(e){}
try{MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_PaletteManager'));}catch(e){}


try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showMyPalette'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showLab'), 'change');}catch(e){}  // id required elsewhere
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showMixer'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showGradientor'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showThesaurus'), 'change');}catch(e){}
try{UniDOM.generateEvent(document.getElementById('MasterColorPicker_showHelp'), 'change');}catch(e){}



//after all other modules have access to the original colorSpecCache Object data.
// note we are pushing a function
MasterColorPicker.pickFilters.push(SoftMoon.WebWare.Color_Picker.color_to_text);


const DB=indexedDB.open("MasterColorPicker", 1);
DB.onupgradeneeded= () => {
	DB.result.createObjectStore('palettes', {keyPath: 'filename'});
	DB.result.createObjectStore('autoload_palettes', {keyPath: 'filename'});
	DB.result.createObjectStore('trash', {keyPath: 'filename'});  };
DB.onsuccess= () => {
	MasterColorPicker.db=DB.result;
	UniDOM.generateEvent(window, 'mastercolorpicker_database_ready', {detail:true});  };
DB.onerror= () => {
	console.warn('Could not access the MasterColorPicker DataBase in the browser’s private storage.');
	UniDOM.generateEvent(window, 'mastercolorpicker_database_ready', {detail:false});  };


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
	function(event) {
		if (event.oldState!==event.pickerStateFlag)  UniDOM.getElementsBy$Class(this, 'pickerOptions').disable(!event.pickerStateFlag);},
	false);
//we could avoid this handler below altogether if MSIE or MS-Edge was up-to-date on CSS rules.
//UniDOM.addEventHandler([optsHTML, labOptsHTML], 'interfaceStateChange',
UniDOM.addEventHandler(optsHTML, 'interfaceStateChange',
	function() {
		UniDOM.useClass( optsubHTML,
			MasterColorPicker.classNames.activeInterface,
			MasterColorPicker.interfaceActiveFlag  &&  UniDOM.hasAncestor(MasterColorPicker.interfaceControl, optsubHTML));  },
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

MasterColorPicker.userOptions=userOptions;

UniDOM.generateEvent(optsHTML, 'pickerStateChange', {bubbles: false}, {flag:false});
try{UniDOM.generateEvent(document.getElementsByName('MasterColorPicker_Gradientor_tricolor')[0], 'onchange', {bubbles: false});}catch(e){}

UniDOM.addEventHandler(userOptions.palette_select, 'onchange', function()  {
	document.getElementById('Color_Picker_options').firstChild.firstChild.data = this.options[this.selectedIndex].text + ' mode:';  }  );

UniDOM.addEventHandler(window, 'mastercolorpicker_palettes_loaded', function() {UniDOM.generateEvent(userOptions.palette_select, 'change', {bubbles:true})});

UniDOM.addEventHandler(MasterColorPicker.HTML, 'beforeToggle', function(event)  {
	if (event.newState==='closed'  &&  event.target.contains(document.activeElement))
		UniDOM.generateEvent(document.activeElement, 'focusout', {bubbles:true, relatedTarget:MasterColorPicker.dataTarget});  });

var inp;
if (inp=userOptions.keepPrecision)
	MasterColorPicker.keepPrecision=inp.checked;

if (inp=userOptions.useHexSymbol)
	MasterColorPicker.useHexSymbol=inp.checked;

if (inp=userOptions.copyColorToClipboard)
	MasterColorPicker.copyToClipboard=inp.checked;

if (inp=userOptions.hue_angle_unit)  {
	UniDOM.addEventHandler(inp, 'onchange', function(event) {
		var text, hau;
		const hauFactors=SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors;
		MasterColorPicker.hueAngleUnit=this.value;
		switch (this.value) {
			case 'rad':
			case "ᶜ":
			case "ᴿ":
			case "ʳ":  text='radiansᴿ';  hau='rad';
			break;
			case 'grad':
			case "ᵍ":
			case "ᴳ":  text='gradiansᵍ';  hau='grad';
			break;
			default:  text='degrees°';  hau='deg';  }
		document.getElementById('MasterColorPicker_Lab_hueUnitText').firstChild.data=text;
		if (!event.init)  {
			inp=document.getElementsByName('MasterColorPicker_Hue_degrees')[0];
			inp.value=Math.roundTo(
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau],
				(parseFloat(inp.value)/hauFactors[SoftMoon.WebWare.ColorSpaceLab.hueAngleUnit])*hauFactors[hau] );  }
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
			case "ᴳ":  text='gradians (0ᵍ—400ᵍ)';
			break;
			case '%':  text='percent of a turn (0%—100%)';
			break;
			case 'turn':
			case "●":  text='turn of a circle (0.0●—1.0●)';  }
		document.querySelector('#RainbowMaestro_hueIndicator span.hueAngleUnit').firstChild.data=text;
		document.querySelector('#YinYangNíHóng span.hueAngleUnit').firstChild.data=text;
		document.querySelector('#Simple² span.hueAngleUnit').firstChild.data=text;
		if (!event.init)  {
			inp=document.getElementsByName('RainbowMaestro_focalHue')[0];
			inp.value=Math.roundTo(
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[this.value],
				(parseFloat(inp.value)/hauFactors[SoftMoon.WebWare.RainbowMaestro.hueAngleUnit])*hauFactors[this.value]);
			inp=document.getElementsByName('YinYang NíHóng focalHue')[0];
			inp.value=Math.roundTo(
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[this.value],
				(parseFloat(inp.value)/hauFactors[SoftMoon.WebWare.YinYangNiHong.hueAngleUnit])*hauFactors[this.value]);
			inp=document.getElementsByName('Simple²_focalHue')[0];
			inp.value=Math.roundTo(
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[this.value],
				(parseFloat(inp.value)/hauFactors[SoftMoon.WebWare.SimpleSqColorPicker.hueAngleUnit])*hauFactors[this.value]);
			document.getElementById('Simple²hue').firstChild.data=inp.value+this.value;
			}
		SoftMoon.WebWare.RainbowMaestro.hueAngleUnit=this.value;
		SoftMoon.WebWare.YinYangNiHong.hueAngleUnit=this.value;
		SoftMoon.WebWare.SimpleSqColorPicker.hueAngleUnit=this.value;  });

	UniDOM.generateEvent(inp, 'onchange', {bubbles: false}, {init:true});
	}

const provSelect=userOptions.colorblind_provider;
for (const prov in SoftMoon.WebWare.RGB_Calc.colorblindProviders)  {
	provSelect.add(new Option(SoftMoon.WebWare.RGB_Calc.colorblindProviders[prov].title,  prov));  }
UniDOM.addEventHandler(provSelect, 'onchange', function() {
	SoftMoon.WebWare.RGB_Calc.install('colorblind', this.value);
	MasterColorPicker.RGB_calc.to.colorblind=SoftMoon.WebWare.RGB_Calc.definer.audit.to.colorblind.value;
	SoftMoon.WebWare.ColorSpaceLab.swatch.color();
	document.getElementById('RainbowMaestro').getElementsByClassName('thanks')[0].innerHTML=SoftMoon.WebWare.RGB_Calc.colorblindProviders[this.value].thanks;
	if (document.getElementsByName('RainbowMaestro_colorblind')[0].checked)  SoftMoon.WebWare.RainbowMaestro.buildPalette();
	var trs=MasterColorPicker.MyPalette.trs;
	for (var inp, i=1; i<trs.length; i++)  {
		if (inp=trs[i].querySelector("[name$='[definition]']"))  MasterColorPicker.colorSwatch(inp);  }  }  );
UniDOM.generateEvent(provSelect, 'onchange');


UniDOM.addEventHandler(document.querySelector('#MasterColorPicker_Help nav'), ['click', 'buttonpress'], function(event) {
 if (event.target.nodeName==="BUTTON")  document.getElementById("MasterColorPicker_helpFor_"+event.target.getAttribute("section")).scrollIntoView();  });


	function enhanceKeybrd(event)  {
		if (!event.target.parentNode  //the Genie may delete them before this handler occurs.
		||  event.key==='Tab'
		||  MasterColorPicker.panelTabKey.sniff(event)
		||  MasterColorPicker.panelBacktabKey.sniff(event))  return;
		if (UniDOM.hasAncestor(event.target, MasterColorPicker.HTML))
			MasterColorPicker.setTopPanel(event.target.closest('.pickerPanel'));
		if (event.metaKey
		||  event.getModifierState('AltGraph')
		||  event.getModifierState('OS'))  return;
		var txt, curPos, color;
		findKey: {
			if (event.altKey)  switch (!event.shiftKey && !event.ctrlKey && event.key)  {
			case 'c':
			case 'C':  txt="ᶜ";  break findKey;
			case 'g':
			case 'G':  txt="ᵍ";  break findKey;
			case 'r':
			case 'R':  txt="ᴿ";  break findKey;
			default:  return;  }
			if (event.ctrlKey)  switch (event.key)  {
			case '1':  txt="●";  break findKey;
			case '!':  txt="¡";  break findKey;
			case '2':  txt="©";  break findKey;
			case '@':  txt="®";  break findKey;
			case '%':  txt="°";  break findKey;
			case '6':  txt="☺";  break findKey;
			case '^':  txt="☻";  break findKey;
			case '7':  txt="♪";  break findKey;
			case '&':  txt="♫";  break findKey;
			case '8':  txt="×";  break findKey;
			case '*':  txt="☼";  break findKey;
			case '=':  txt="≈";  break findKey;
			case '+':  txt="±";  break findKey;
			case '/':  txt="÷";  break findKey;
			case '?':  txt="¿";  break findKey;
			case '[':  txt="‘";  break findKey;
			case '{':  txt="“";  break findKey;
			case ']':  txt="’";  break findKey;
			case '}':  txt="”";  break findKey;
			case "'":  txt="π";  break findKey;
			case '"':  txt="φ";  break findKey;  }
			switch (event.key)  {
			case 'F1':
				if (!event.ctrlKey)  {  // F1 function key
					event.preventDefault();
					userOptions.showHelp.checked= !event.shiftKey;
					UniDOM.generateEvent(userOptions.showHelp, 'change');
					if (!event.ShiftKey)  {
						MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Help'));
						const note=event.target.labels[0]?.querySelector('note[referto]');
						if (note)  document.getElementById(note.getAttribute('referto')).scrollIntoView();  }  }
				else if (!event.shiftKey)  {
					event.preventDefault();
					userOptions.showHelp.checked= true;
					UniDOM.generateEvent(userOptions.showHelp, 'change');
					const
						HelpHTML=document.getElementById('MasterColorPicker_Help'),
						btn=HelpHTML.querySelector('button');
					MasterColorPicker.setTopPanel(HelpHTML);
					HelpHTML.querySelector('div.scrollbox').scrollTop=0;
					UniDOM.generateEvent(btn, 'tabIn', {bubbles: true}, {relatedTarget: event.target, tabbedFrom: event.target});  }
			break;
			case 'F2':   // F2 function key
				event.preventDefault();
				userOptions.showMyPalette.checked= !event.shiftKey;
				UniDOM.generateEvent(userOptions.showMyPalette, 'change');
				if (!event.ShiftKey)  {
					MasterColorPicker.setTopPanel(MasterColorPicker.MyPalette.HTML);  //document.getElementById('MasterColorPicker_MyPalette')
					if (event.ctrlKey   //add color in user-input box to MyPalette
					&&  !UniDOM.hasAncestor(event.target, MasterColorPicker.MyPalette.HTML)
					&&  MasterColorPicker.RGB_calc(event.target.value))  {
						MasterColorPicker.MyPalette.addColor(event.target.value);
						return;  }  }
			break;
			case 'F3':   // F3 function key
				event.preventDefault();
				userOptions.showLab.checked= !event.shiftKey;
				UniDOM.generateEvent(userOptions.showLab, 'change');
				if (!event.ShiftKey)  {
					MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Lab'));
					if (event.ctrlKey    //sync color in user-input box to ColorSpaceLab
					&&  (color=MasterColorPicker.RGB_calc(event.target.value)))  {
						SoftMoon.WebWare.ColorSpaceLab.setColor({RGB: color});
						return;  }  }
			break;
			case 'F4':   // F4 function key  ¡this key shortcut may be removed or changed in the future
			case 'F7':   // F7 function key  ¡STOLEN! by the browser…oh well. (¡now in 2022, F7 works in at least FireFox & Chrome! ¡yea!)
									 // SHIFT+F7 is thesaurus in MS Word, CTRL+F7 in LibreOffice
				event.preventDefault();
				userOptions.showThesaurus.checked= !event.shiftKey;
				UniDOM.generateEvent(userOptions.showThesaurus, 'change');
				if (!event.ShiftKey)  {
					MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Thesaurus'));
					if (event.ctrlKey //match color in user-input box using Thesaurus  this key-combo works in FireFox
					&&	MasterColorPicker.RGB_calc(event.target.value))  {
						const inp=document.getElementsByName('MasterColorPicker_Thesaurus_color')[0];
						inp.value=event.target.value;
						MasterColorPicker.colorSwatch(inp);
						SoftMoon.WebWare.ColorThesaurus.matchColor();
						}  }
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
	SoftMoon.altMenuKey??=new UniDOM.KeySniffer('ContextMenu', false, false, true, false, false, false); // ← Alt ContextMenu  a.k.a.  Alt ≡

	MasterColorPicker.registerTargetElement=function(inp)  {
		UniDOM.addEventHandler(inp, 'onkeydown', enhanceKeybrd);
		//the final value (true) maps to the 2nd argument, “isTargetInput”, in the handler
		UniDOM.addEventHandler(inp, ['onkeyup', 'onpaste', 'onchange'], syncLabAndSwatch, false, true);
		return Object.getPrototypeOf(this).registerTargetElement.call(this, inp);  };

	for (const inp of document.getElementsByTagName('input'))  {
		if (inp.getAttribute('type')?.toLowerCase() === 'mastercolorpicker'
		||  (inp.getAttribute('picker-type')?.toLowerCase() === 'mastercolorpicker'))
			MasterColorPicker.registerTargetElement(inp);  }
	UniDOM.addEventHandler(MasterColorPicker.HTML, 'onKeyDown', enhanceKeybrd);
	UniDOM.addEventHandler(MasterColorPicker.HTML, ['onKeyUp','onPaste','onChange'], syncLabAndSwatch);

	UniDOM.addEventHandler(mainHTML, 'tabIn', function(event)  {
		if (event.target!==this)  return;
		var tabTo;
		for (const picker of MasterColorPicker.pickers)  {
			if ( MasterColorPicker.picker_select.isChosenPicker(picker)
			&&  (tabTo=UniDOM.getElements(picker, SoftMoon.WebWare.Picker.isTabStop, SoftMoon.WebWare.Picker.goDeep)[0]) )  {
				UniDOM.generateEvent(tabTo, 'tabIn', {bubbles:true}, {relatedTarget: event.tabbedFrom, tabbedFrom: event.tabbedFrom});
				return;  }  }
		setTimeout(function() {MasterColorPicker.dataTarget.focus();}, 0);  });

	MasterColorPicker.HTML.style.setProperty("--scrollbar-width", UniDOM.getScrollbarWidth()+"px");

	UniDOM.generateEvent(window, 'mastercolorpicker_ready');





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

	const panels=MasterColorPicker.panels;
	for (let i=0, handle, side;  i<panels.length;  i++)  {
		if (panels[i]===MasterColorPicker.mainPanel)  continue;
		//we need to be able to read the “applied” CSS values (we want to find the side with 'auto') for a given element.
		//we could look it up in the stylesheet directly, but then we need to know the stylesheet text;
		//if we could search a CSSStyleSheet object by a given element (not just a string descriptor)
		//and get a ruleslist for that specific element that would solve our
		//problem of linking JavaScript/HTML/CSS in intimate ways that require PITA management on modification/upgrade………
		//we could put a “homeside” attribute on each panel’s HTML element and read it
		//but it is more simple at this point to just do this………
		switch (panels[i].id)  {
			case 'MasterColorPicker_PaletteManager':
				side='left';
				break;
			default:
				side='right';  }
		if (panels[i].id==='MasterColorPicker_options')  {
			handle=panels[i].getElementsByTagName('header')[0];             // ↓ ↓ for drag, the first panel must be the largest and contain the other(s) in its margin
			UniDOM.addEventHandler(handle, 'onmousedown', dragPanel, false, [MasterColorPicker.mainPanel, panels[i]], side);
			UniDOM.addEventHandler(handle, 'onmouseup', returnPanelsOn3, false, [MasterColorPicker.mainPanel, panels[i]], side);  }
		else  {
			handle=panels[i].getElementsByTagName('h2')[0].getElementsByTagName('span')[0];
			UniDOM.addEventHandler(handle, 'onmousedown', dragPanel, false, [panels[i]], side);
			UniDOM.addEventHandler(handle, 'onmouseup', returnPanelsOn3, false, [panels[i]], side);  }
		UniDOM.addEventHandler(handle, 'oncontextmenu', abortContextMenu);  }
	UniDOM.addEventHandler(document.getElementById("MasterColorPicker_returnPanelsOn3"), 'onmouseup', returnPanelsOn3, false, panels);
	function dragPanel(event, stickyPanels, side)  {
		event.stopPropagation();
		event.preventDefault();
		if (event.detail>1
		||  (event.buttons!==1  &&  event.buttons!==2)
		||  !MasterColorPicker.enablePanelDrag)  return;
		const
			currentButton=event.buttons,
			stick=(event.shiftKey || event.button===2) && MasterColorPicker.enableStickyPanels,
			ttcn= (stick ? 'MCP_thumbtack' : ""),
			CSS=getComputedStyle(stickyPanels[0], null),  // remember this is a live object
			mOff= (CSS.position==='fixed') ?
					{x: (side==='right' ? document.body.offsetWidth-event.clientX : event.clientX) - parseInt(CSS[side]),
					 y: event.clientY-parseInt(CSS.top)}
				: UniDOM.getMouseOffset(stickyPanels[0], event),
		  dragHandle=event.currentTarget,
			move=UniDOM.addEventHandler(document.body, 'onMouseMove', panelMover, true),
			blockMenu=UniDOM.addEventHandler(document.body, 'onContextMenu', abortContextMenu, true),
			drop=UniDOM.addEventHandler(document, ['onMouseUp', 'onPickerStateChange', 'onVisibilityStateChange'], done, true);
		/* “A Note About dragging & dropping”
		 * If the end-user is dragging and dropping a panel
		 * (or color in MyPalette, swatch in Blender, or using the scizzors in EyeDropper, etc.)
		 * we typically look for a mouseUp event,
		 * but if the end-user moves the mouse-cursor off the browser window and releases the button,
		 * we don’t get the mouseUp event.
		 * If the end-user then presses the button again off-page
		 * and while holding the button moves back onto the page,
		 * the mouseMove & mouseUp would not know; yet we should not then still be dragging.
		 * Typically, we can fall back on the pickerStateChange event,
		 * because it is triggered by an onBlur event that occurs when
		 * the .currentTarget looses focus as the end-user clicks off-page.
		 * We don’t want to listen for an onBlur event directly,
		 * as this may occur “by accident” and the .currentTarget will be re-focused.
		 * However, in implementations where the .dataTarget is not a focusable element
		 * (such as a text-node that simply recieves the picked color)
		 * (and the MasterColorPicker is not implemented to changePickerState with a change in keyboard-focus)
		 * we are out of luck.
		 * Testing in FireFox yields no reason to supply an "onVisibilityStateChange" event-handler to end the drag,
		 * but if your dataTarget is not focusable, it helps, but is not a guaranteed fix.
		 * In the future, I may complicate the drag & drop interfaces even more,
		 * and use setPointerLock, but then the mouse pointer disappears and we want it…
		 * however, using mouseOut on the body to set the pointer-lock
		 * and then release it if the user nudges the mouse in the reverse direction may be the way to go…
		 */
		function panelMover(event)  {
			if ((event.buttons&currentButton)===0)  {done(event);  return;}
			if (CSS.position==='fixed')
			var b={w: document.body.offsetWidth, h: document.documentElement.clientHeight || window.innerHeight, x: 0, y: 0},
					y=(event.clientY - mOff.y),
					x= (side==='right') ?
						((b.w-event.clientX) - mOff.x)
					: (event.clientX - mOff.x);
			else
			var b=UniDOM.getElementOffset(stickyPanels[0].offsetParent, MasterColorPicker.dragBounder),
			    b={y: b.y, x: b.x, w: MasterColorPicker.dragBounder.offsetWidth, h: MasterColorPicker.dragBounder.offsetHeight},
			    m=UniDOM.getMouseOffset(stickyPanels[0].offsetParent, event),
					y=m.y - (parseInt(CSS.marginTop) + mOff.y),
					x= (side==='right') ?
						(b.w-m.x) - (stickyPanels[0].offsetWidth-mOff.x) + parseInt(CSS.marginRight)
					//: (b.w-m.x) + (stickyPanels[0].offsetWidth-mOff.x) + parseInt(CSS.marginLeft);
					: (m.x - mOff.x) + parseInt(CSS.marginLeft);
//console.log('------\n',x);
			y= (y<-b.y) ?  (-b.y)  :  ( (y>(m=b.h-(stickyPanels[0].offsetHeight+parseInt(CSS.marginTop)+parseInt(CSS.marginBottom)+b.y))) ? m : y );
			x= (x<-b.x) ?  (-b.x)  :  ( (x>(m=b.w-(stickyPanels[0].offsetWidth+parseInt(CSS.marginLeft)+parseInt(CSS.marginRight)+b.x))) ? m : x );
//console.log(x,'\n------');
			for (var i=0;  i<stickyPanels.length;  i++)  {
				stickyPanels[i].style.top= y + 'px';
				stickyPanels[i].style[side]= x + 'px';  }
			event.stopPropagation();
			event.preventDefault();  }
		function done(event)  {
			move.onMouseMove.remove();  blockMenu.onContextMenu.remove();
			drop.onMouseUp.remove();  drop.onPickerStateChange.remove();  drop.onVisibilityStateChange.remove();
			event.stopPropagation();
			event.preventDefault();
		  for (var i=0;  i<stickyPanels.length;  i++)  {UniDOM.remove$Class(stickyPanels[i], ['dragging', ttcn]);}
			UniDOM.remove$Class(document.body, ['MCP_drag', ttcn]);
			if (stick) dragHandle.removeChild(MasterColorPicker.thumbtackImage);
			try {MasterColorPicker.dataTarget.focus();} catch(e) {}  }
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
		  move.onMouseMove.handler(event);  }
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
			stickyPanels[i].style.left= "";
			UniDOM.remove$Class(stickyPanels[i], ['scrollable', 'floating']);  }  }


} );  //close window onload

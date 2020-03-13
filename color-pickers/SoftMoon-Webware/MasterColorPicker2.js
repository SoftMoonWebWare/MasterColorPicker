//  character-encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 120

// MasterColorPicker2.js   ~release ~2.0.09-alpha   March 12, 2020   by SoftMoon WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2014, 2015, 2018, 2019, 2020 Joe Golembieski, SoftMoon WebWare

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
// requires  “Math+++.js”  in  JS_toolucket/
// requires  SoftMoon.WebWare.RGB_Calc
// requires  SoftMoon.WebWare.FormFieldGenie  (“FormFieldGenie.js”  in  JS_toolbucket/SoftMoon-WebWare/)   for MyPalette and ColorFilter
// requires  Softmoon.WebWare.Log  if you want to log with “event grouping” for easier debugging (see this file's end)
// subject to move to unique files (with more functions) in the future:
//  • SoftMoon.WebWare.canvas_graphics


/*==================================================================*/

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
//                                                           centerpoint ↓    # of ↓vertexes    ↓ pass in function− typically “lineTo”
SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon=function(canvas, x,y, h,w, vCount, atVertex, rotate)  {
	var i, pX, pY, vertexes=[], angle;  //, out='';      //     before rotation ↑           radian value ↑ ¡not degrees!
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
	var j, x, y, ym, yq, a, ors=outRad*outRad, irs=inRad*inRad++, RGB_Calc=SoftMoon.WebWare.RGB_Calc;
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
	var x, y, vertexes=[];  //  , out

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
			var p=userOptions.palette_select.getSelected();
			if (!(p instanceof Array))
				SoftMoon.WebWare.x_ColorPicker.registeredPickers[p.value].putOptions();  });

		Object.defineProperty(MasterColorPicker, "userOptions_HTML", {value: userOptions});

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
	var x_Colors=this.getColor.apply(this, arguments);
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
	var x_Colors=this.getColor.apply(this, arguments);
  if (x_Colors)  MasterColorPicker.pick(x_Colors, event, this.name);  }


// =================================================================================================== \\

// below are the sub-methods (MasterColorPicker.pickFilter) for
//  the MasterColorPicker implementation of the Picker’s “pick()” method. (see the end of this file)
// these become methods of the MasterColorPicker implementation, so “this” refers to  MasterColorPicker

// =================================================================================================== \\

var RGB_calc=new SoftMoon.WebWare.RGB_Calc({
			RGBAFactory: SoftMoon.WebWare.RGBA_Color,
			CMYKFactory: SoftMoon.WebWare.CMYK_Color,
			ColorWheelFactory: SoftMoon.WebWare.ColorWheel_Color}, true);

SoftMoon.WebWare.x_ColorPicker.pickFilter=function(x_Colors)  {
	if (this.colorSwatch)  {   //we must wait until after the input.value is set  ← input.value = thisInstance.interfaceTarget || thisInstance.dataTarget
		var thisInstance=this;
		setTimeout(function() {thisInstance.colorSwatch();}, 0);  }
	if (typeof x_Colors === 'string')  return x_Colors;
	var chosen, mode=userOptions.outputMode.value.toUpperCase(),
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
		case 'HCG':
		case 'CMYK':
		case 'XYZ':  //these are always wrapped
			try {
				if (!(chosen=x_Colors[mode]))  (x_Colors[mode]=RGB_calc.to[mode.toLowerCase()](x_Colors.RGB.rgb)).config.push(format);
				chosen=x_Colors[mode].toString();
				break;  }
			catch(e) {console.error('MCP pickFilter bummer!  mode='+mode+' error!: '+e);}
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



SoftMoon.WebWare.x_ColorPicker.color_to_text=function(x_Colors)  {return x_Colors.text_output;}




var CF_calc=new SoftMoon.WebWare.RGB_Calc({RGBAFactory: Array});
Object.defineProperty(CF_calc.config, 'roundRGB', {get: function(){return MasterColorPicker.roundRGB;}});

SoftMoon.WebWare.x_ColorPicker.ColorFilter=function(x_Colors)  {
	var HTML=document.getElementById('MasterColorPicker_Filter');
	if ( typeof x_Colors == 'string'
	||  !userOptions.showFilter.checked
	||  (MasterColorPicker.interfaceTarget  &&  UniDOM.hasAncestor(MasterColorPicker.interfaceTarget, HTML)) )
		return x_Colors;
	var i, f, filter, isFiltered=false,
			colors=UniDOM.getElementsBy$Name(HTML, /color/ ),
			factors=UniDOM.getElementsBy$Name(HTML, /factor/ );

	if (filterOptions.average.value==='average')  {
		var sum=[0,0,0], count=0, fs=0;
		for (i=0;  i<colors.length;  i++)  {
			if (colors[i].value  &&  (filter=CF_calc(colors[i].value)))  {
		    sum[0]+=filter[0];  sum[1]+=filter[1];  sum[2]+=filter[2];
				f= parseFloat(factors[i].value||0);
				if (factors[i].value  &&  factors[i].value.match(/%/))   f/=100;
				fs+=f;
				count++;  }  }
		if (count)  { isFiltered=true;
			sum[0]/=count;  sum[1]/=count;  sum[2]/=count;  fs/=count;
			SoftMoon.WebWare.x_ColorPicker.ColorFilter.applyFilter(x_Colors.RGB.rgb, sum, fs, filterOptions.applyToAverage);  }  }

	else  {
		var applies=UniDOM.getElementsBy$Name(HTML, /apply\[/ );
		for (i=0;  i<colors.length;  i++)  {
			if (colors[i].value  &&  (filter=CF_calc(colors[i].value)))  { isFiltered=true;
				f= parseFloat(factors[i].value||0);
				if (factors[i].value  &&  factors[i].value.match(/%/))   f/=100;
				SoftMoon.WebWare.x_ColorPicker.ColorFilter.applyFilter(x_Colors.RGB.rgb, filter, f, applies[i]);  }  }  }

	if (isFiltered)  {
//		x_Colors.RGB=new SoftMoon.WebWare.RGBColor(x_Colors.RGB.rgb[0], x_Colors.RGB.rgb[1], x_Colors.RGB.rgb[2], true);
		if (x_Colors.model.toLowerCase() !== 'rgb')  {
			if (x_Colors.model==='text')  x_Colors.model='RGB';
			else  x_Colors[x_Colors.model]=RGB_calc.to[x_Colors.model.toLowerCase()](x_Colors.RGB.rgb);  }  }
	return x_Colors;  }

SoftMoon.WebWare.x_ColorPicker.ColorFilter.applyFilter=function(rgb, filter, f, apply)  {
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
	var inp,
			Filter=UniDOM(document.getElementById('MasterColorPicker_Filter'));
	if (Filter)  {
		filterOptions=Filter.getElementsBy$Name( /average/i , true, function(n) {return n.name.match( /Filter_(.+)$/ )[1];}, true);
		UniDOM.addEventHandler(filterOptions.average.element, 'onchange', function()  {
			UniDOM.disable(filterOptions.applyToAverage.element.parentNode, this.value!=='average');
			Filter.getElementsBy$Name( /apply\[/ ).disable(this.value==='average');  });
		UniDOM.generateEvent(filterOptions.average, 'onchange', {bubbles: false});
		SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie=new SoftMoon.WebWare.FormFieldGenie(
			{ maxTotal:7,
				climbTiers:false,
				groupClass: 'filterColor',
				doFocus:false,  //at this time (Feb2020) giving focus to the newly cloned field via the Genie will cause the Picker to disapear, as focus is lost in the current field before giving focus to the new element
				cloneCustomizer:function(tr)  { var s=tr.getElementsByTagName('span')[0]; s.style.backgroundColor=""; s.style.color="";
					UniDOM.getElementsBy$Name(tr).remove$Class([MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceElement]);  },
				eventRegistrar:function(tr)  { UniDOM.getElementsBy$Name(tr).map(function(e)  {
					MasterColorPicker.registerInterfaceElement(e, e.name.match( /color/ ) ?
						SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie.onTabbedOut_PickerPlugIn
					:  undefined );  });  },
				fieldsetCustomizer:function()  { Filter.getElementsBy$Name( /apply\[/ ).map( function(e, i, a)  {
					e.element.setAttribute("tabToTarget", (i<a.length-1) ? "false" : "true");  } );  }  } );
		SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie.onTabbedOut_PickerPlugIn=
			{tabbedOut:tabbedOut.bind(SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie, /_average/)};
		inp=Filter.element.getElementsByTagName('tbody')[0].lastElementChild.getElementsByTagName('input')[0];
		inp.setAttribute('onfocus', "SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie.tabbedOut=false;");
		inp.setAttribute('onkeydown', "SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie.catchTab(event);");
		inp.setAttribute('onblur',
			"if (!SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie.tabbedOut)  SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie.popNewField(this.parentNode.parentNode);");  }  });



// =================================================================================================== \\

// this is here for your convenience in hacking.  Changing it will not affect normal operation.
SoftMoon.WebWare.x_ColorPicker.tabbedOut=tabbedOut;

// This is a plug-in control for the Picker’s InterfaceElement → keydown handler.
// Getting the FormFieldGenie and the Picker to work together is like choreographing a dance where one is doing the Waltz and the other the Lindy.
// The first argument and the value of “this” is bound by/to the Genies.
// The “event” Object argument is passed by the Picker’s onkeydown handler.
function tabbedOut(DOM_CRAWL_STOP, event)  {
	function isTabStop(e)  {
		var isI=(SoftMoon.WebWare.Picker.isInput(e)  &&  !e.disabled);
		if (isI  &&  e.name.match( DOM_CRAWL_STOP ))  goDeep.doContinue=false;
		return isI;  }
	function goDeep(e) {return !e.disabled;}
	var tabToTarget=(!event.shiftKey  &&  !event.ctrlKey  &&  event.target.getAttribute('tabToTarget')==='true'),
			old, e, i=0;
	if (!tabToTarget  &&  !event.ctrlKey)  old=UniDOM.getElders(event.target, isTabStop, goDeep);
	this.popNewField(this.config.groupClass ? UniDOM.getAncestorBy$Class(event.target, this.config.groupClass) : event.target);
	if (event.ctrlKey)  return false;
	if (tabToTarget)  {
		MasterColorPicker.dataTarget.focus();
		event.preventDefault();
		return true;  }
	if (event.shiftKey)  //backtab
		try{
		do {e=old[i++]}  while (!e.isConnected);
		}catch(e){  event.preventDefault();  return true;}
	else  {//forward tab
		if (!(e=event.target).isConnected)  do {e=old[i++]}  while (!e.isConnected);
		SoftMoon.WebWare.Picker.goDeep.className=MasterColorPicker.classNames.picker;
		SoftMoon.WebWare.Picker.goDeep.picker_select=MasterColorPicker.picker_select;
		e=UniDOM.getJuniors(e, SoftMoon.WebWare.Picker.isTabStop, SoftMoon.WebWare.Picker.goDeep)[0];  }
	UniDOM.generateEvent(e, 'tabIn', {canBubble:false});
	event.preventDefault();
	return true;  }

// =================================================================================================== \\


SoftMoon.WebWare.x_ColorPicker.MyPalette=MyPalette;
function MyPalette(HTML, PNAME)  {
	if (!new.target) throw new Error("“MyPalette” is a constructor, not a method or function.");
	var thisPalette=this;
	//this.palette=new Array;
	this.HTML=HTML;
	this.table=HTML.getElementsByTagName('table')[0];
	this.tbodys=this.table.getElementsByTagName('tbody');
	this.trs=this.table.getElementsByTagName('tr');
	this.addToMyPalette=UniDOM.getElementsBy$Name(HTML, /addToMyPalette/ )[0];
	this.MetaGenie=new SoftMoon.WebWare.FormFieldGenie({
		maxTotal: 10,
		doFocus: false,
		cloneCustomizer:function(ta)  {
			UniDOM.remove$Class(ta, [MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceElement]);  },
		dumpEmpties:function(ta) {UniDOM.removeAllEventHandlers(ta);  return true;},
		eventRegistrar:function(ta)  {MasterColorPicker.registerInterfaceElement(ta, thisPalette.MetaGenie.onTabbedOut_PickerPlugIn);}  });
	this.MetaGenie.onTabbedOut_PickerPlugIn={tabbedOut:tabbedOut.bind(this.MetaGenie, /_name/)};
	this.ColorGenie=new SoftMoon.WebWare.FormFieldGenie({
		groupClass:"MyColor",
		maxTotal:420,
		doFocus:false,
		updateName:function(inp, i, tbody) { i=0;
			while (thisPalette.tbodys[i] && tbody!==thisPalette.tbodys[i])  {i++;};
			inp.name=inp.name.replace( /MyPalette\[[0-9]+\]/ , "MyPalette["+i+"]");  },
		dumpEmpties:function(tr, deleteEntry)  {
			var flag=(tr.children[0].nodeName!=="TH");
			if (flag
			&&  (flag=( deleteEntry  ||
					 UniDOM.getElementsBy$Name(tr, /definition/)[0].value==""
				&& UniDOM.getElementsBy$Name(tr, /name/)[0].value=="")) )  UniDOM.removeAllEventHandlers(tr, true);
			return flag;  },
		cloneCustomizer:function(tr, paste)  { var menu;
			if (!paste)  {var td=tr.children[0]; td.style.backgroundColor=""; td.style.color="";}
			if (menu=tr.getElementsByClassName("MyPalette_ColorGenieMenu")[0])  menu.parentNode.removeChild(menu);
			UniDOM.getElementsBy$Name(tr).remove$Class([MasterColorPicker.classNames.activeInterface, MasterColorPicker.classNames.activeInterfaceElement]);  },
		eventRegistrar:function(tr)  { UniDOM.getElementsBy$Name(tr).map(function(e)  {
			MasterColorPicker.registerInterfaceElement(e, (e.type==='text') ?  thisPalette.ColorGenie.onTabbedOut_PickerPlugIn  :  undefined);  });  },
		fieldsetCustomizer:function(tb) {UniDOM.getElementsBy$Name(tb, /\[name\]/ ).map(function(e, i, a)  {
			e.setAttribute("tabToTarget", (i<a.length-1  ||  tb!==tb.parentNode.lastElementChild) ? "false" : "true")});}  });
	this.ColorGenie.onTabbedOut_PickerPlugIn={tabbedOut: tabbedOut.bind(this.ColorGenie, /addToHere/)};
	this.ColorGenie.HTML_clipMenu=HTML.removeChild(HTML.getElementsByClassName('MyPalette_ColorGenieMenu')[0]);;
	this.ColorGenie.HTML_clipMenu.onclick=function(event) {thisPalette.onMenuSelect(event);}
	this.SubPaletteGenie=new SoftMoon.WebWare.FormFieldGenie({
		indxTier:2,
		groupTag:"TBODY",
		maxTotal:420,
		doFocus:false,
		dumpEmpties:function(tbody, deleteFlag) {if (deleteFlag)  UniDOM.removeAllEventHandlers(tbody, true);  return deleteFlag||false;},
		eventRegistrar:function(tbody)  { UniDOM.getElementsBy$Name(tbody).map(function(e)  {
			MasterColorPicker.registerInterfaceElement(e,
				(e.type==='text'  &&  !e.name.match( /subPalette/ )) ?  thisPalette.ColorGenie.onTabbedOut_PickerPlugIn  :  undefined );  });  },
		fieldsetCustomizer:function(tbl)  { for (var i=1; i<tbl.children.length; i++)  {
			tbl.children[i].lastElementChild.lastElementChild.firstElementChild.setAttribute("tabToTarget", (i<tbl.children.length-1) ? "false" : "true");  }  },
		clone:this.tbodys[1]  });

	// the Genies’ updateName methods will have to be rewritten if you create more than one instance of MyPalette (with two seperate HTML sets)
	//  AND if you want the two seperate MyPalette HTML form controls to be sent to a server with a standard form-submit.

	// init the HTML with handlers, etc.

	var i, tr,
			portHTML=HTML.querySelector(".portDialog"),
			portModeHTML=portHTML.querySelector(".portMode");
			paletteMetaHTML=portHTML.querySelector(".paletteMeta");

	this.ColorGenie.HTML_clipMenu.onclick=function(event) {thisPalette.onMenuSelect(event);}
	UniDOM(HTML).getElementsBy$Name( /_delete/ )[0].addEventHandler(['onclick', 'buttonpress'], function() {thisPalette.onDelete();});
	UniDOM(HTML).getElementsBy$Name( /_makeSub/ )[0].addEventHandler(['onclick', 'buttonpress'], function() {thisPalette.makeSub();});
	UniDOM(HTML).getElementsBy$Name( /_port\]?$/ )[0].addEventHandler(['onclick', 'buttonpress'], function() {portHTML.disabled= !portHTML.disabled});
	UniDOM(HTML).getElementsBy$Name( /_porter/ )[0].addEventHandler(['onclick', 'buttonpress'], function(event) {thisPalette.porter(event);});

	var _import  =UniDOM.getElementsBy$Name(portHTML, /_import/ )[0],  //the input type=file
			_porter  =UniDOM.getElementsBy$Name(portHTML, /_porter/ )[0],  //the load/save button
			_replace =UniDOM.getElementsBy$Name(portHTML, /_replace_file/ )[0],  //checkbox
			_autoload=UniDOM.getElementsBy$Name(portHTML, /_autoload/ )[0],  //checkbox
			_filetype=portHTML.querySelector('.filetype'),
			activeClasses=[['import', 'export'], ['server', 'local', 'browser', 'current']];
	activeClasses[0].logic= activeClasses[1].logic= 'or';

	UniDOM.addEventHandler(portModeHTML, 'onchange', function(event)  {
		UniDOM.remove$Class(portHTML, ["import", "export"]);
		UniDOM.addClass(portHTML, event.target.value);
		UniDOM.disable(paletteMetaHTML, event.target.value==='import');
		UniDOM.disable(_import.parentNode, event.target.value==='export' || !UniDOM.has$Class(portHTML, 'local'));
		UniDOM.disable(_porter, !UniDOM.has$Class(portHTML, activeClasses)
												 || (UniDOM.has$Class(portHTML, ['import', 'local']) && !_import.value)
												 || (UniDOM.has$Class(portHTML, ['export', 'local']) && !UniDOM.getSelected(_filetype)) );
		});

	UniDOM.addEventHandler(portHTML.querySelector('.port'), 'onchange', function(event) {
		if (!event.target.name.match( /_port\]?$/ ))  return;
		UniDOM.remove$Class(portHTML, ["browser", "local", "server", "current"]);
		UniDOM.addClass(portHTML, event.target.value);
		UniDOM.disable(_import.parentNode, event.target.value!=='local' ||  UniDOM.has$Class(portHTML, 'export'));
		UniDOM.disable(_porter, !UniDOM.has$Class(portHTML, activeClasses)
												 || (UniDOM.has$Class(portHTML, ['import', 'local']) && !_import.value)
												 || (UniDOM.has$Class(portHTML, ['export', 'local']) && !UniDOM.getSelected(_filetype)) );
		UniDOM.disable(_replace.parentNode, (event.target.value!=='browser' && event.target.value!=='server') );
		UniDOM.disable(_autoload.parentNode, (event.target.value!=='browser' && event.target.value!=='server') );
		UniDOM.disable(_filetype, (event.target.value!=='local') );
		});

	UniDOM.addEventHandler(_filetype, 'onchange', function() {UniDOM.disable(_porter, false);})

	UniDOM.addEventHandler(_filetype.querySelector("input[value='js'] + span"), 'click', function() {
		MasterColorPicker.setTopPanel(document.getElementById('MasterColorPicker_Help'));
		document.getElementById('MasterColorPicker_helpFor_MyPalette_autoload').scrollIntoView();  });

	for (i=0; i<portHTML.elements.length; i++)  {if (portHTML.elements[i].type==='radio')  portHTML.elements[i].checked=false;}
	UniDOM.disable(paletteMetaHTML, true);
	UniDOM.disable(_import.parentNode, true);
	UniDOM.disable(_porter, true);
	UniDOM.disable(_replace.parentNode, true);
	UniDOM.disable(_autoload.parentNode, true);
	UniDOM.disable(_filetype, true);

	//we set attributes so the FormFieldGenie will clone them.
	UniDOM.getElementsBy$Name(paletteMetaHTML, /(header|footer)/ ).map(function(e)  {
		//when the user presses the TAB key in these textareas, we need to pop the new field before the Picker interface transfers control.
		//Then it will transfer control to the new field.  The Genie can not do this, because the Picker will deactivate the PickerPanel before
		//it can transfer control (focus()) to the newly popped field; since the newly popped field is deactivated, it would then not receive focus.
		MasterColorPicker.registerInterfaceElement(e, thisPalette.MetaGenie.onTabbedOut_PickerPlugIn);
		e.setAttribute('onfocus', "MasterColorPicker."+PNAME+".MetaGenie.tabbedOut=false");
		e.setAttribute('onkeydown', "MasterColorPicker."+PNAME+".MetaGenie.catchTab(event)");
		e.setAttribute('onblur', "if (!MasterColorPicker."+PNAME+".MetaGenie.tabbedOut)  MasterColorPicker."+PNAME+".MetaGenie.popNewField(this)");  });

	UniDOM.addEventHandler(HTML.getElementsByTagName('table')[0], 'buttonpress', function(event)  {
		if (event.target.name.match( /addSelected/ ))  thisPalette.addSelected(event.target.parentNode.parentNode.parentNode);  });
	UniDOM.getElementsBy$Name(HTML, /selectAll/ ).map(function(e)  {e.setAttribute('onchange',
			"MasterColorPicker."+PNAME+".selectAll(event, this);")  });
	UniDOM.getElementsBy$Name(HTML, /addSelected/ ).map(function(e)  { e.setAttribute('onclick',
			"MasterColorPicker."+PNAME+".addSelected(this.parentNode.parentNode.parentNode);")  });
	UniDOM.getElementsBy$Name(HTML, /addToHere/ )[0].checked=true;
	UniDOM.getElementsBy$Name(HTML, /\[(definition|name)\]/ ).map(function(e)  {
		MasterColorPicker.registerInterfaceElement(e, thisPalette.ColorGenie.onTabbedOut_PickerPlugIn);  });
	UniDOM.getElementsBy$Class(HTML, 'MyColor').map(function(e)  {
		e.setAttribute('onfocusin', "MasterColorPicker."+PNAME+".ColorGenie.tabbedOut=false");
		e.setAttribute('onkeydown', "MasterColorPicker."+PNAME+".ColorGenie.catchTab(event)");
		e.setAttribute('onfocusout', "if (!MasterColorPicker."+PNAME+".ColorGenie.tabbedOut)  MasterColorPicker."+PNAME+".ColorGenie.popNewField(this)");  });
	UniDOM.getElementsBy$Class(HTML, "dragHandle" ).map(function(e)  { e.setAttribute('oncontextmenu',
			"if (event.button===2)  MasterColorPicker."+PNAME+".showMenu(event, this);");  });
	for (i=1, tr=HTML.getElementsByTagName('tr');  i<tr.length;  i++)  {
		switch (tr[i].children[0].nodeName)  {
		case 'TD':
			tr[i].children[0].setAttribute('onclick',
				"if (event.target===this  &&  (x_Color=new SoftMoon.WebWare.x_ColorPicker.MyPalette_Color(this.parentNode.children[1].children[0].value))  &&  x_Color.RGB)  MasterColorPicker.pick(x_Color, event, '"+PNAME+"');");
			tr[i].setAttribute('onmousedown',
				"if (event.target!==this.firstElementChild  &&  event.target.tagName!=='INPUT'  &&  this!==this.parentNode.lastElementChild)  MasterColorPicker."+PNAME+".dragger(event, this, 'MCP_dragMyPaletteColor', 'isBeingDragged', 'MyColor');");
		break;
		case 'TH':
			tr[i].setAttribute('onmousedown',
				"switch (event.target.tagName) {case'INPUT': case'LABEL': case'BUTTON': return; default: MasterColorPicker."+PNAME+".dragger(event, this.parentNode, 'MCP_dragMySubPalette', 'isBeingDragged', 'subPalette')}");  }  }

	HTML.getElementsByTagName('table')[0].removeChild(HTML.getElementsByClassName('subPalette')[0]);  }



SoftMoon.WebWare.x_ColorPicker.MyPalette_Color=MyPalette_Color;
function MyPalette_Color(color)  {
	color=new SoftMoon.WebWare.x_ColorPicker.x_Color(color);
	Object.getPrototypeOf(color).constructor=MyPalette_Color;  }


MyPalette.prototype.onPick=function(x_Color, event)  {
	if (!userOptions.showMyPalette.checked
	||  (MasterColorPicker.interfaceTarget  &&  UniDOM.hasAncestor(MasterColorPicker.interfaceTarget, this.table)))  return x_Color;
	var mp=this.addToMyPalette.value;
	if (event instanceof Event
	&& (  (event.type==='click'
				 && ((mp==='single-click' && event.detail===1  &&  !(x_Color instanceof MyPalette_Color))
					|| (mp==='single-click' && event.detail===2  &&  (x_Color instanceof MyPalette_Color))
					|| (mp==='double-click' && event.detail===2)
					|| (mp==='shift-click'  && event.detail===1  &&  event.shiftKey)))
		 || (event.type==='contextmenu'
				 && mp==='right-click' && event.detail===1) ) )
		this.addColor(x_Color.text_output);
	return x_Color;  }

MyPalette.prototype.addColor=function(color, name)  {
	//if (name)  for (var i=0; i<this.palette.length; i++)  {if (this.palette[i].name===name)  return false;}
	for (i=0; i<this.tbodys.length; i++)  {
		if (UniDOM.getElementsBy$Name(this.tbodys[i], /_addToHere/ , 1)[0].checked)  break;  }  //.children[0].children[0].lastElementChild.children[0]
	if (i>=this.tbodys.length)  return false;
	var hxC, tr=this.tbodys[i].lastElementChild;
	tr.children[1].children[0].value=color;
	tr.children[2].children[0].value=name||"";
	if (hxC=color.match(RegExp.hex))  hxC="#"+hxC[1];
	else  hxC=MasterColorPicker.RGB_calc.to.hex(color);
	tr.children[0].style.backgroundColor=hxC;
	this.ColorGenie.popNewField(tr, {doso:true});
	tr.scrollIntoView();
	return true;  }

MyPalette.prototype.selectAll=function(event, checkbox)  {
	var tbody=checkbox.parentNode.parentNode.parentNode.parentNode;
	for (var i=1, tr=tbody.getElementsByTagName('tr');  i<tr.length-1;  i++)  {tr[i].children[0].children[0].checked=checkbox.checked;}  }

MyPalette.prototype.onDelete=function()  {
	for (var i=1;  i<this.trs.length-1;  i++)  {
		if (this.trs[i].children[0].nodeName==='TH'
		&&  this.trs[i].parentNode.className.match( /\bsubPalette\b/ )
		&&  UniDOM.getElementsBy$Name(this.trs[i].children[0], /selectThis/ )[0].checked)
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
	if (this.SubPaletteGenie.popNewField(this.table, {addTo:true}))
		for (var i=1, l=this.trs.length-3, newSub=this.tbodys[this.tbodys.length-1];  i<l;  i++)  {
			if (this.trs[i].children[0].children[0].checked  &&  this.trs[i]!==this.trs[i].parentNode.lastElementChild)
				this.moveColor(this.trs[l--, i--], newSub.lastElementChild);  }  }

MyPalette.prototype.addSelected=function(tbody)  {
	for (var i=1, iOff=1;  i<this.trs.length;  i++)  {
		if (this.trs[i].parentNode===tbody)  {iOff=0;  continue;}
		if (this.trs[i].children[0].nodeName==='TH')  continue;
		if (this.trs[i].children[0].children[0].checked  &&  this.trs[i]!==this.trs[i].parentNode.lastElementChild)  {
			this.moveColor(this.trs[i], tbody.lastElementChild);
			i-=iOff;  }  }
	var n1, n2, index=Array.prototype.indexOf.call(this.tbodys, tbody)+1;
	for (i=1; i<this.tbodys.length; i++)  {
		if (this.tbodys[i]===tbody)  {i=index-1;  continue;}
		if (UniDOM.getElementsBy$Name(this.tbodys[i].children[0], /selectThis/ )[0].checked)  {
			if ((n1=UniDOM.getElementsBy$Name(tbody, /subPalette/ )[0])  &&  n1.value.match( /\S/ )
			&&  (n2=UniDOM.getElementsBy$Name(this.tbodys[i], /subPalette/ )[0]).value.match( /\S/ ))
				n2.value=n1.value.replace(/$\s*/, "").replace(/\s*^/, "")+": "+n2.value.substring(n2.value.lastIndexOf(":")+1).replace(/$\s*/, "").replace(/\s*^/, "");
			if (i!==index)  this.moveSub(this.tbodys[i--], this.tbodys[index++]);  }  }  }

MyPalette.prototype.dragger=function(event, group, bodyClass, dragClass, groupClass)  {
	if (event.button!==0)  return;
	event.preventDefault();
	UniDOM.addClass(document.body, bodyClass);
	UniDOM.addClass(group, dragClass);
	var thisPalette=this,
			mouseEvent=null,
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

MyPalette.prototype.showMenu=function(event, handle)  {
	event.preventDefault();  event.stopPropagation();
	if (this.ColorGenie.HTML_clipMenu.parentNode  &&  UniDOM.hasAncestor(this.ColorGenie.HTML_clipMenu, handle))  return;
	UniDOM.addClass(handle, "withMenu");
	var thisPalette=this,
			xer=UniDOM.addEventHandler(handle, 'onMouseLeave', function()  {
				xer.onMouseLeave.remove();
				UniDOM.remove$Class(handle, "withMenu");
				handle.removeChild(thisPalette.ColorGenie.HTML_clipMenu);  }),
			xyPos=UniDOM.getElementOffset(handle, true);
	this.ColorGenie.HTML_clipMenu.style.position= 'fixed';
	this.ColorGenie.HTML_clipMenu.style.top= xyPos.y+'px';
	this.ColorGenie.HTML_clipMenu.style.left=xyPos.x+'px';
	handle.appendChild(this.ColorGenie.HTML_clipMenu);  }

MyPalette.prototype.onMenuSelect=function(event)  {
	var myColor=UniDOM.getAncestorBy$Class(this.ColorGenie.HTML_clipMenu, "MyColor");
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

MyPalette.prototype.toJSON=function(onDupColor)  {
	var i=0, subName, requireSubindex=false,
			metaHTML=this.HTML.getElementsByClassName('paletteMeta')[0],
			tbodys=this.tbodys;
			marks=SoftMoon.WebWare.buildPaletteTable.refColorMarks,
			palette=buildPaletteObject(tbodys[0]),
			pName= ( UniDOM.getElementsBy$Name(metaHTML, /name/ )[0].value.trim()
					||  ('MyPalette '+((new Date()).toUTCString())) ).replace(":", ';').replace("(", '[').replace(")", ']');
	function buildPaletteObject(tbody, isSub)  {
		var j, cName, def, e, pltt=new Object,
				trs=tbody.getElementsByTagName('tr');
		for (j=1; j<trs.length; j++)  { if (trs[j].firstElementChild.tagName==='TH')  continue;
			def=UniDOM.getElementsBy$Name(trs[j], /definition/ )[0].value.trim();
			cName=UniDOM.getElementsBy$Name(trs[j], /name/ )[0].value.trim();
			if (def==="" && cName==="")  continue;
			if (cName!=="")  def=" "+def;
			cName=cName  ||  (marks[0]+"["+(j)+"]"+marks[1]);
			if (isSub  &&  (cName in palette)) requireSubindex=true;
			loop:{ while (cName in pltt)  { switch (onDupColor)  {
				case 'error':
					e=new Error('Duplicate Color Names in the '+(isSub ? 'same sub-' : (tbodys.length>1 ? 'root ' : ""))+'Palette found when building MyPalette JSON');
					e.name='MyPalette Duplicate Name';
					e.type='Color';
					e.duplicateName=cName;
					e.tr={index: j, tr: trs[j]}
					e.tbody={index: i, tbody: tbody}
					throw e;
				case 'overwrite': break loop;
				default: cName=cName+"["+(j+1)+"]";  }  }  }
			if (def.match( /^MyPalette\s*:/i )  ||  def.match( /^MyPalette\s*\(.*\)$/i ))  def.replace( /MyPalette/i , pName);
			pltt[cName] = def;  }
		return pltt;  }
	for (i=1; i<tbodys.length; i++)  {
		subName=( UniDOM.getElementsBy$Name(tbodys[i], /subPalette/ )[0].value.trim()
					||  ("{"+i+"}") ).replace(":", ';').replace("(", '[').replace(")", ']');
		loop:{ while (subName in palette)  { switch (onDupColor) {
			case 'error':
				e=new Error('Duplicate Color/sub-Palette Names found when building MyPalette JSON');
				e.name='MyPalette Duplicate Name';
				e.type='sub-Palette';
				e.duplicateName=subName;
				e.tbody={index: i, tbody: tbodys[i]}
				throw e;
			case 'overwrite': break loop;
			default: subName=subName+"{"+i+"}";  }  }  }
		palette[subName] = {palette: buildPaletteObject(tbodys[i], true)};  }
	palette={ [pName]: {
		header: UniDOM.getElementsBy$Name(metaHTML, /headers/ ).getValues(),
		footer: UniDOM.getElementsBy$Name(metaHTML, /footers/ ).getValues(),
		requireSubindex: requireSubindex,
		palette: palette } };
	return palette;  }

MyPalette.prototype.porter=function(event)  {
	if (event.detail>1) return;
	var portMode=UniDOM.getElementsBy$Name(this.HTML.querySelector(".portMode"), /_portMode/ ).getSelected().value;
			port=UniDOM.getElementsBy$Name(this.HTML.querySelector(".port"), /_port\]?$/ ).getSelected().value;
	switch (portMode)  {
	case 'import':  switch (port)  {
		case 'server':
		case 'local':
		case 'current':
		case 'browser':
		default: console.log('porter:', portMode, port);  return;
	}
	case 'export':  switch (port)  {
		case 'server':  this.uploadPalette();  return;
		case 'local':   this.savePalette();  return;
		case 'current': SoftMoon.WebWare.initLoadedPaletteTable(this.toJSON());  return;
		case 'browser':
		default: console.log('porter:', portMode, port);  return;
	}  }  }

MyPalette.prototype.uploadPalette=function(JSON_Palette) {
	console.log(' →→ Uploading palette to:',SoftMoon.colorPalettes_defaultPath);
	var HTTP=SoftMoon.WebWare.HTTP,
			palette=JSON_Palette || this.toJSON(),
			connector=new HTTP(),
			connection=HTTP.Connection(SoftMoon.colorPalettes_defaultPath, 'Can not upload Palette to server: no HTTP service available.'),
			pName, div, portDialog=this.HTML.querySelector('.portDialog');
  for (pName in palette)  {break;}
	connection.onFileLoad=function() {console.log(' →→ Upload response:',this.responseText);
		if (this.responseText.substr(0,10)==='¡Error! : ')  div.innerHTML= '<strong>' + this.responseText + '</strong>';
		else  div.innerHTML= 'Successfully uploaded to:\n<span>' + document.URL.substring(0, document.URL.lastIndexOf("/")+1) + this.responseText + '</span>';  };
	connection.loadError=function()  {console.log(' →→ Upload HTTP or server Error.');
		div.innerHTML='<strong>¡Error! :\n problem with the HTTP connection or server.</strong>';  }
  connection.requestHeaders={'Content-Type': 'application/x-www-form-urlencoded'};
	connection.postData=HTTP.URIEncodeObject({
		filename: pName+".palette.json",
		palette: JSON.stringify(palette, undefined, "\t"),
		replace_file: UniDOM.getElementsBy$Name(this.HTML, /replace_file/ )[0].checked.toString(),
		autoload: UniDOM.getElementsBy$Name(this.HTML, /autoload/ )[0].checked.toString() });
	connector.commune(connection);
	if (div=portDialog.querySelector('.uploading'))  portDialog.removeChild(div);
	div=document.createElement('div');
	div.className='uploading';
	div.innerHTML= 'Uploading <span>' + pName + '</span> to:\n<span>' +
		document.URL.substring(0, document.URL.lastIndexOf("/")+1)+SoftMoon.colorPalettes_defaultPath + '</span>';
	portDialog.insertBefore(div, portDialog.querySelector('.port'));
}

MyPalette.prototype.savePalette=function()  {
	var iframe=document.getElementById('MasterColorPicker_MyPalette_local_filesaver') || document.createElement('iframe'),
			palette=this.toJSON(),
			filetype=UniDOM.getSelected(this.HTML.querySelector('.filetype')).value,
			pName;
  for (pName in palette)  {break;}
	if (!iframe.id)  {
		iframe.id='MasterColorPicker_MyPalette_local_filesaver';
		iframe.style.display='none';
		document.body.appendChild(iframe);  }
	palette=JSON.stringify(palette, undefined, "\t");
	if (filetype==="js")  palette='SoftMoon.loaded_palettes.push(\n'+palette+'\n); // close loadedPalettes.push\n';
	palette=new File([palette], pName+".palette."+filetype, {type: 'application/unknown'});
	palette=URL.createObjectURL(palette);
	iframe.setAttribute('src', palette);
	URL.revokeObjectURL(palette);  }

MyPalette.prototype.commitToTable=function()  {

}


// =================================================================================================== \\

})();  // close private member wrapper for x_ColorPicker


SoftMoon.WebWare.x_ColorPicker.x_Color=function(color)  { var RGB;
	if (!new.target)  throw new Error('“x_Color” is a constructor, not a function.');
  if (!(RGB=MasterColorPicker.RGB_calc(color)))  return false;
	this.RGB=RGB;
	this.model='text';
	this.text=color;  }



// this is or is called as a method of the MasterColorPicker implementation, so “this” is  MasterColorPicker
// this will read an <input> tag's value and interpret the color
// then set the background-color of it or a separate swatch;
// text-color will then be set using “SoftMoon.WebWare.makeTextReadable()”
SoftMoon.WebWare.x_ColorPicker.colorSwatch=function(inp)  {
	if (!UniDOM.isElementNode(inp))  inp=this.interfaceTarget || this.dataTarget;
	var c, f, swatch= (inp.getAttribute('swatch')  ||  inp.swatch);
	if (swatch)  {
		if (!UniDOM.isElementNode(swatch=(document.getElementById(swatch))))  {
			try  { swatch= (inp.getAttribute('swatch')  ||  inp.swatch);
				if (typeof swatch!==Function)  swatch=new Function("return "+swatch+";")
			  swatch=swatch.call(inp);  }
			catch(e) {};  }  }
	else  switch (this.showColorAs)  {
		case 'swatch':  swatch=(document.getElementById(inp.getAttribute('swatchId')) || this.swatch || inp.nextSibling);  break;
		case 'background':
		default:  swatch=inp;  }
	if (!UniDOM.isElementNode(swatch))  return;   // (swatch==null  ||  swatch.nodeType!==1)
	if (!swatch.defaultBack)
		swatch.defaultBack=getComputedStyle(swatch).backgroundColor;
	if (!swatch.defaultBorder)
		swatch.defaultBorder=getComputedStyle(swatch).borderColor || getComputedStyle(swatch).color;
	if (inp.value.match( /^(none|blank|gap|zilch|\-|\_|\u2013|\u2014)$/i ))  {
		if (this.toggleBorder)  {
			swatch.style.borderColor=(this.borderColor==='invert') ? MasterColorPicker.RGB_calc.to.contrast(swatch.defaultBorder) : this.borderColor;
			swatch.style.borderStyle='dotted';  }
		swatch.style.backgroundColor='transparent';
		if (swatch.defaultColor)  swatch.style.color=swatch.defaultColor;
		return;  }
	if (inp.value  &&  ((c=MasterColorPicker.RGB_calc(inp.value)) != null))  {
		if (this.toggleBorder)  {
			swatch.style.borderColor=(this.borderColor==='invert') ?
				MasterColorPicker.RGB_calc.to.contrast(swatch.defaultBorder)
			: this.borderColor;
			swatch.style.borderStyle='solid';  }
		swatch.style.backgroundColor=c.hex;
		SoftMoon.WebWare.makeTextReadable(swatch, c.rgb);
		return;  }
	if (this.toggleBorder)  {
		swatch.style.borderColor=swatch.defaultBorder;
		swatch.style.borderStyle='solid';  }
	swatch.style.backgroundColor=swatch.defaultBack;
	if (swatch.defaultColor)  swatch.style.color=swatch.defaultColor;  };

// text-color will be set to black or white depending on the rgb brightness (not necessarily
//  the “perceived” brightness) of the background-color.
SoftMoon.WebWare.makeTextReadable=function(elmnt, back)  {
	if (!back)  back=window.getComputedStyle(elmnt).backgroundColor;
	if (back===null)  return;
	if (!elmnt.defaultColor)
		elmnt.defaultColor=window.getComputedStyle(elmnt).color;
	elmnt.style.color=MasterColorPicker.RGB_calc.to.contrast(back);  };


/*==================================================================*/



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
	for (i=0; i<settings.model.length; i++)  {
		if (settings.model[i].checked)  {model=settings.model[i].value;  break;}  }

	RGB_Calc.config.push({
		RGBAFactory: {value: Array},
		useHexSymbol: {value: true}  });

	SoftMoon.WebWare.HSV_Color.config.CMYKFactory=Array;

	for (rows=0;  rows<h/2;  rows+=space.y, flag=!flag)  {  // h ↔ size
		for (cells= flag ? (space.x/2) : 0;  cells<w/2;  cells+=space.x)  {   // w ↔ size
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
		return RGB_Calc.from.cmyk(SoftMoon.WebWare.HSV_Color.to_CMYK([h/360, s/100, v/100]));
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
		SoftMoon.WebWare.HSV_Color.config.CMYKFactory=SoftMoon.WebWare.CMYK_Color;
		this.CMYK=SoftMoon.WebWare.HSV_Color.to_CMYK([h, s, v]);
		this.RGB=MasterColorPicker.RGB_calc.from.cmyk(this.CMYK.cmyk);  }
	else  {
		this[model]=new SoftMoon.WebWare.ColorWheel_Color(h, s, v, model);
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

var settings, hexagonSpace, focalHue,
		RGB_Calc=SoftMoon.WebWare.RGB_Calc,
		RainbowMaestro=SoftMoon.WebWare.RainbowMaestro;

RainbowMaestro.hueAngleUnit=document.getElementsByName('MasterColorPicker_hue_angle_unit')[0];
RainbowMaestro.hueAngleUnit= RainbowMaestro.hueAngleUnit ? 	RainbowMaestro.hueAngleUnit.value  :  'deg';

SoftMoon.WebWare.RainbowMaestro.buildPalette=function(onlyColorblind)  {
	focalHue=parseFloat(settings.focalHue.value);
	if (RainbowMaestro.hueAngleUnit!=='rad'  &&  RainbowMaestro.hueAngleUnit!=='ʳ')
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

	for (j=0; j<variety; j++)  {  // black-grays-white picker ring
		h=255*(j/(variety-1));  h=[h,h,h];  h.hcg=[0,0,j/(variety-1)];
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
	f=function(rgb, a) {return RGB_Calc.to.hex((i===0) ?  rgb  :  (rgb.hcg=[a/_['π×2'],1,.5],  RGB_Calc.to.colorblind(rgb, cbTypes[i-1])));};
	fb=function(rgb, a)  { return f(
			settings.splitComplement.checked  ?
					RGB_Calc.from.hue( ( (Math.Trig.ovalizeAngle(a-focalHue, 1/3) + focalHue) % _['360°'] ) / _['π×2'] )
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
		space={y: Math.tan(_['30°'])*outRad / variety,
					 w: _['60°']/maxVariety };
		space.x=Math.sin(_['60°'])*space.y;
		space.h=space.x*.854;
		if (i===0)  hexagonSpace=space;  //private save for getColor
		h_r=space.y/1.5;  //hexagon radius
		cnvs[i].context.save();
		cnvs[i].context.translate(cnvs[i].centerX, cnvs[i].centerY);

		if (!settings.focalsOnly.checked)  for (f=0; f<6; f++)  { //cycle through 6 intermix sections
	// “loose Diamonds”
			for (j=2; j<=variety; j++)  { for (n=1, hueWidth=_['60°']/j, halfHW=hueWidth/2+space.w/2;  n<j;  n++)  {
				da=f*_['60°']+hueWidth*n;
				dh= (settings.splitComplement.checked  &&  !settings.websafe.checked) ?
					Math.Trig.ovalizeAngle(da, 1/3)
				: da;
				da=Math.rad(da-focalHue);
				dh=Math.rad(dh-focalHue);
				r=outRad-(variety-j)*space.h-space.h/2;
				for (k=0, km=variety-j+1; k<km; k++)  {
					a=da - (space.w*(variety-j+1)/2) + space.w*(k+.5);
					if (a<da-halfHW  ||  a>da+halfHW)  continue;
					a=Math.rad(a);
					hcg=[1-dh/_['360°'],  j/variety,  km>1 ? (k/(km-1)) : .5];
					h=RGB_Calc.from.hcg(hcg);
					cnvs[i].context.fillStyle= RGB_Calc.to.hex( (i===0) ?  h  :  (h.hcg=hcg,  RGB_Calc.to.colorblind(h, cbTypes[i-1])));
					cnvs[i].context.beginPath();
					SoftMoon.WebWare.canvas_graphics.shapes.polarizedDiamond(cnvs[i].context, r, a, space.h, space.w, lineTo);
					cnvs[i].context.closePath();
					cnvs[i].context.fill();  }  }  }  }

		for (f=0; f<6; f++)  { //cycle through 6 focal hues
			fa=f*_['60°'];
			fh= (settings.splitComplement.checked  &&  !settings.websafe.checked) ?
				Math.Trig.ovalizeAngle(fa, 1/3)
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
				cnvs[i].context.fillStyle= RGB_Calc.to.hex( (i===0) ?  h  :  (h.hcg=hcg,  RGB_Calc.to.colorblind(h, cbTypes[i-1])));
				cnvs[i].context.beginPath();
				x=outRad-j*space.x-space.x/2;
				y=space.y*j/2 - space.y*k;
				SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon(cnvs[i].context, x, y, h_r, h_r, 6, lineTo, _['90°']);
				cnvs[i].context.closePath();
				cnvs[i].context.fill();  }  }
			cnvs[i].context.restore();  }
		cnvs[i].context.restore();  }

	RGB_Calc.config.pop();
	};  // close  RainbowMaestro.buildPalette



var mouseColor, targetHue; //private members

SoftMoon.WebWare.RainbowMaestro.getColor=function(event)  { mouseColor=null;  targetHue=null;
	if (event.target===event.currentTarget)  return null;

	MasterColorPicker.RGB_calc.config.push({inputAsFactor: {value: true}})

	focalHue=parseFloat(settings.focalHue.value);  //private member
	if (RainbowMaestro.hueAngleUnit!=='rad'  &&  RainbowMaestro.hueAngleUnit!=='ʳ')
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
			fa=Math.Trig.ovalizeAngle(fa-focalHue, 1/3)+focalHue;
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
			fa=Math.rad(Math.Trig.ovalizeAngle(fa-focalHue, 1/3)+focalHue);
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
			a=Math.rad(Math.Trig.ovalizeAngle(a-focalHue, 1/3)+focalHue);
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
	this.HCG=new SoftMoon.WebWare.HCG_Color(Math.rad(H)/_['π×2'], C, G, 'HCG');
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
	var spsw=document.getElementById('RainbowMaestro').getElementsByClassName('subpalette_swatch');
	if (!settings.colorblind.checked)  spsw.length=1;
	RGB_Calc.config.push({useHexSymbol: {value: true},  RGBAFactory: {value: Array},  roundRGB: {value: false}});
	for (var i=0; i<spsw.length; i++)  {
		spsw[i].style.backgroundColor= (mouseColor)  ?   // && mouseColor.ring
			((i>0) ?  RGB_Calc.to.hex(RGB_Calc.to.colorblind(mouseColor.RGB.rgb, RGB_Calc.to.colorblind.types[i-1]))
						 :  mouseColor.RGB.hex)
		: "";  }
	RGB_Calc.config.pop();  };

/****** note below that  x_ColorPicker.onclick  calls  RainbowMaestro.getColor  before  handleClick  is called ******/
SoftMoon.WebWare.RainbowMaestro.handleClick=function()  {
	if (!settings.lock.checked && !settings.websafe.checked  &&  targetHue!==null)  {
		settings.focalHue.value= Math.roundTo(
			(RainbowMaestro.hueAngleUnit==='rad'  ||  RainbowMaestro.hueAngleUnit==='ʳ')  ?
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

SoftMoon.WebWare.RainbowMaestro.alterVariety=function(value)  {
	if (settings.lock.checked)  return;
	settings.websafe.checked=false;
	if (typeof value == 'number'  ||  (typeof value == 'string' &&  value.match( /^[0-9]+$/ )))
		settings.variety.value=value;
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
		if (!settings.colorblind.checked)  RainbowMaestro.buildPalette();  //the colorblind provider initiator will build the palette otherwise
		UniDOM.addEventHandler(settings.websafe, 'onclick', RainbowMaestro.makeWebsafe);
		UniDOM.addEventHandler(settings.splitComplement, 'onclick', RainbowMaestro.makeSplitComplement);
		UniDOM.addEventHandler(settings.lock, 'onclick', RainbowMaestro.lock);
		UniDOM.addEventHandler(settings.colorblind, 'onclick', RainbowMaestro.showColorblind);
		UniDOM.addEventHandler(settings.variety, 'onmouseup', RainbowMaestro.alterVariety);
		UniDOM.addEventHandler(settings.focalsOnly, 'onclick', RainbowMaestro.handle_focalsOnly);

		//MasterColorPicker.registerInterfaceElement(settings.focalHue, {tabToTarget: true});
		UniDOM.addEventHandler(settings.focalHue, 'onkeydown', function(event) {
			MasterColorPicker.event=event;
			if (MasterColorPicker.debug)  MasterColorPicker.debug.log.write('MasterColorPicker — keydown  — keyPressed= '+event.keyCode+' ¦ keepKey= now unknown here');
			});
		UniDOM.addEventHandler(settings.focalHue, 'onchange', function(event)  {
			var key=MasterColorPicker.event && MasterColorPicker.event.keyCode;
			if (MasterColorPicker.debug)  MasterColorPicker.debug.log.write('MasterColorPicker — onchange — keyPressed= '+key+' ¦ synFlag= '+event.flag);
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

SoftMoon.WebWare.SimpleSqColorPicker.buildPalette=function()  {
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
			clr[model]=new SoftMoon.WebWare.ColorWheel_Color(h, c_s, g_v_l, model);  }
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

	UniDOM.addEventHandler(settings.variety, 'onMouseUp', SimpleSqColorPicker.buildPalette);

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




;(function () {                    // ↓radians    ↓factor(0-1)
var baseCanvas, mainCanvas, settings, focalHue=0, swatchHue=0, aniOffset=0, Color,
		RGB_Calc=SoftMoon.WebWare.RGB_Calc;

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
		Color[mode]=new SoftMoon.WebWare.ColorWheel_Color(fa/_['π×2'], 1, (mode=='HSL') ? .5 : 1, mode);
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
			Color[mode]=new SoftMoon.WebWare.ColorWheel_Color(focalHue/_['π×2'], y, x, mode);
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
		this.buildPalette();  }  }


SoftMoon.WebWare.YinYangNiHong.animate=function(event)  {
  var animate=arguments.callee;
	if (event.classes[0] !== MasterColorPicker.classNames.activePicker)  return;
	if (event.flag)  {
		if (typeof animate.interval != 'number')
			animate.interval=setInterval(
				function() {if ((aniOffset+=1/44) > 1)  aniOffset=0;  SoftMoon.WebWare.YinYangNiHong.buildHueSwatches();},
				47 );  }
	else  {
		clearInterval(animate.interval);
		animate.interval=null;  }  }


UniDOM.addEventHandler( window, 'onload', function()  { var YinYangNiHong=SoftMoon.WebWare.YinYangNiHong;
	var picker=document.getElementById('YinYangNíHóng');
		//first we set the private global members
	settings=UniDOM.getElementsBy$Name(picker, 'YinYang NíHóng');

	for (var i=0; i<settings.length; i++)  {
		UniDOM.addEventHandler(settings[i], 'onchange', YinYangNiHong.buildPalette);  }

	YinYangNiHong.buildBasePalette();
	YinYangNiHong.buildHueSwatches();
	YinYangNiHong.buildPalette();

	YinYangNiHong.txtInd=document.getElementById('YinYangNíHóng_indicator');
	YinYangNiHong.swatch=document.getElementById('YinYangNíHóng_swatch');
	YinYangNiHong.noClrTxt=String.fromCharCode(160);
	var cnvsWrap=picker.getElementsByTagName('canvas')[0].parentNode;
	UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut', 'onClick'], YinYangNiHong);
	UniDOM.addEventHandler(picker, 'pickerStateChange',  YinYangNiHong.animate);
		} );

}());
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


//   If you don’t supply a  path  then the loadPalettes() function will use
// its default path to the palettes’ folder on the server. (see RGB_Calc.js : SoftMoon.colorPalettes_defaultPath='color_palettes/';)
//   If you supply a  whenLoaded  function, it will be passed the freshly loaded palette name
// before each palette <table> HTML is built.  If this function passes back  true  then the HTML <table>
// will NOT be built, nor will it be added to the “palette select”; it will be then assumed that this
// function (the whenLoaded function) handled all that if required.
//   If you supply a  whenDone  function, it will be passed an array of
// HTTP-connect Objects (their connections completed) (see the comments for the loadPalettes() function in the rgb.js file)
// after all the palette files are loaded and their HTML <table>s are built, just before their display is set to none.
// (remember, for JavaScript to set inline styles, the element must be currently displayed)
SoftMoon.WebWare.initPaletteTables= function(path, whenLoaded, whenDone)  {
	var wrap=document.getElementById('MasterColorPicker_mainPanel');
	if (path instanceof Array)  {
		for (var i=0;  i<path.length;  i++)  {
			SoftMoon.WebWare.addPalette(path[i]);
			SoftMoon.WebWare.initLoadedPaletteTable(path[i], whenLoaded);}
		UniDOM.remove$Class(wrap, 'init');
		return;  }

	var files=SoftMoon.WebWare.loadPalettes(  // see RGB_Calc.js
							path,
							updateAlertBox,
							function()  {
								updateAlertBox(this.url);
								var json_palette=SoftMoon.WebWare.addPalette(this.responseText);
								SoftMoon.WebWare.initLoadedPaletteTable(json_palette, whenLoaded)  },
							function()  { if (files.length>0)  return;  //load errors are silently ignored for palettes
								files.noneGiven=true;
								alrtBox.innerHTML= HTML.indexFailed;  },
							SoftMoon.WebWare.HTTP.handleMultiple ),
			alrtBox=document.getElementById('paletteLoadingAlert').firstChild,
			failed=false,
			HTML=SoftMoon.WebWare.initPaletteTables.HTML;

	function updateAlertBox(url)  {
		var flag=false, html="<ul>\n";
		if (files.noneGiven)  alrtBox.innerHTML=HTML.noPalettes;
		else  {
			for (i=0; i<files.length; i++)  {
				html+="<li>"+files[i].url;
				if (files[i].trying)  { flag=true;
					if (files[i].readyState>=3)  html+=HTML.connected;
					else  html+=(files[i].attempts>1 ? HTML.reload : "");  }
				else  {
					if (files[i].status===200)  html+= (files[i].url===url) ? HTML.building : HTML.loaded;
					else  {failed=true;  html+=HTML.failed;}  }
				html+="</li>\n";  }
			html+="</ul>\n";
			alrtBox.lastChild.innerHTML= html;  }
		return flag;  }

	UniDOM.remove$Class(alrtBox.parentNode, 'disabled');
	UniDOM.addClass(document.body, 'MCP_init');
	alrtBox.style.opacity='1';

	var wait=setInterval(
		function()  {
			var i, flag;
			if (files.length)  flag=updateAlertBox();
			else  flag=(files instanceof Array  &&  !files.noneGiven);
			if (flag)  return;
			clearInterval(wait);
			if (failed  ||  files.noneGiven)  { i=99;  wait=setInterval(function()  {
			  if (i-->0  &&  !MasterColorPicker.pickerActiveFlag)  alrtBox.style.opacity=i/100;
				else  {clearInterval(wait);  UniDOM.addClass(alrtBox.parentNode, 'disabled');}  }
			, 100);  }
			else  UniDOM.addClass(alrtBox.parentNode, 'disabled');
			if (typeof whenDone == 'function')  whenDone(files);
			UniDOM.remove$Class(document.body, 'MCP_init');
			UniDOM.remove$Class(wrap, 'init');  },
		500 );

	return files;  }
SoftMoon.WebWare.initPaletteTables.HTML={
	connected: " <span class='connected'>…connected and loading…</span>",
  building: " <span class='loaded'>¡Loaded!……building table……</span>",
  loaded: " <span class='loaded'>¡Loaded and Built!</span>",
  reload: " <span class='reload'>¡Retrying to Load!</span>",
  failed: " <span class='failed'>¡Failed to Load!</span>" ,
	noPalettes: "<p class='noPalettes'>No Palettes found on the Server.</p>",
	indexFailed: "<p class='indexFailed'>The index to the Palettes’ files <strong>¡Failed!</strong> to load from the Server</p>" };


SoftMoon.WebWare.initLoadedPaletteTable=function(json_palette, whenLoaded)  {
	var paletteName,  o,
			slct=document.getElementById('MasterColorPicker_palette_select'),
			wrap=document.getElementById('MasterColorPicker_paletteTables');
	for (paletteName in json_palette)  {
		if (typeof whenLoaded === 'function'  &&  whenLoaded(paletteName))  continue;
		MasterColorPicker.registerPicker( wrap.appendChild( (typeof json_palette[paletteName].buildPaletteHTML == 'function')  ?
					json_palette[paletteName].buildPaletteHTML(paletteName)       // ← ↓ init: note custom init methods must add a “setStylez” method to the HTML -and- it should return the HTML
				: SoftMoon.WebWare.buildPaletteTable(paletteName, json_palette[paletteName], 'color_chart picker') ).setStylez() );
		o=document.createElement('option');
		o.value=paletteName.replace( /\s/g, "_");
		o.appendChild(document.createTextNode(paletteName));
		o.selected=(SoftMoon._POST  &&  SoftMoon._POST.palette_select===paletteName);
		slct.appendChild(o);  }  };


;(function() {
var setStylez=function()  {return this;},
/*
			var elmnts=this.childNodes, i, s;  // note how we can set inline styles as we build the Spectral palette, but that does not work for these…
			for (i=0; i<elmnts.length; i++)  { if (elmnts[i].nodeType==Node.ELEMENT_NODE)  {
				if (elmnts[i].stylez)  for (s in elmnts[i].stylez)  {elmnts[i].style[s]=elmnts[i].stylez[s];}
				if (elmnts[i].hasChildNodes())  arguments.callee.call(elmnts[i]);  }  }
			return this;  } ,
 */
		getColor=function(event, cb, chain) {return cb(event, chain)} ,  //this is called by the x_ColorPicker.onclick implementation
		// the following are the callback (cb) functions for getColor above
		noColor=function() {return "none";} ,
		addEntry=function(event, chain)  {
			var txt=chain+(event.target || event.srcElement).firstChild.data;
			return  {RGB: MasterColorPicker.RGB_calc(txt),  text: txt,  model: 'text'};  } ,
		returnNext=function(event)  {
			var target=(event.target || event.srcElement);
			UniDOM.generateEvent(target.nextSibling, 'onclick', { view: event.view, bubbles: false, relatedTarget: target,
							cancelable: event.cancelable, detail: event.detail, button: event.button,
							screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
							ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey, metaKey: event.metaKey  });  } ,
		addRef=function(event)  {
			var txt=(event.target || event.srcElement).firstChild.data;
			return  {RGB: MasterColorPicker.RGB_calc(txt),  text: txt,  model: 'text'};} ,
		addBackRef=function(event)  {
			var txt=(event.target || event.srcElement).firstChild.firstChild.data;
			return  {RGB: MasterColorPicker.RGB_calc(txt),  text: txt,  model: 'text'};} ;



SoftMoon.WebWare.buildPaletteTable=buildPaletteTable;
function buildPaletteTable(pName, pData, className)  {
	var tbl, cpt,
			x_CP=new SoftMoon.WebWare.x_ColorPicker(pName),
			handleClick=function(event) {x_CP.onclick(event, this.getColor_cb, this.chain);};
	x_CP.getColor=getColor;
	x_CP.canInterlink=false;
	x_CP.canIndexLocator=false;
	tbl=document.createElement('table')
	tbl.className=className  // 'color_chart'
	tbl.id=pName.replace( /\s/g , "_");
	cpt=document.createElement('caption')
	cpt.innerHTML= pData.caption  ||  SoftMoon.WebWare.buildPaletteTable.caption.replace( /{pName}/ , pName);
	tbl.appendChild(cpt);
	if (pData.header)  tbl.appendChild(buildTableHdFt(pData.header, 'thead', 'th'));
	tbl.appendChild(buildTableRow('td', [
			{ stylez:{border: '2px dotted'},
				onclick: handleClick,
				getColor_cb: noColor  },
			{ text:'none',
				onclick: handleClick,
				getColor_cb: noColor  },
			],
		'noColor'));
	tbl.appendChild(buildTableBody(pData.palette));
	if (pData.footer)  tbl.appendChild(buildTableHdFt(pData.footer, 'tfoot', 'td'));
	tbl.setStylez=setStylez;
	return tbl;

	function buildTableHdFt(data, t, clmn)  {
		if (!(data instanceof Array))  data=[data];
		var hdft=document.createElement(t);
		for (var i=0; i<data.length; i++)  {hdft.appendChild( buildTableRow(clmn, [{colSpan:'2', text:data[i] }]) );}
		return hdft;  }


	function buildTableBody(colors, chain)  { if (typeof chain !== 'string')  chain="";
		var tb=false, tr, th, subs=new Object, subIndex, clr, frag=document.createDocumentFragment(),
				flagBackRef, flagFwdRef, refColorMarks=SoftMoon.WebWare.buildPaletteTable.refColorMarks;
		for (var c in colors)  {
			if (colors[c].palette)  {subs[c]=colors[c].palette;  continue;}
			if ((c.match( /[a-z]/ )  &&  !c.match( /[A-Z]/ )  &&  pData.alternatives==='lowercase')  // color names that are in all-lowercase/uppercase may be alternative spellings and are not displayed
			||  (c.match( /[A-Z]/ )  &&  !c.match( /[a-z]/ )  &&  pData.alternatives==='uppercase'))  continue;  // for example,  HTML: grey  HTML: Gray
			if ((clr=MasterColorPicker.RGB_calc(colors[c])) == null)  continue;
			if (!tb)  {tb=document.createElement('tbody');}
			flagBackRef=(typeof colors[c] === 'string'  &&  ( colors[c].match( /^\s/ )
				||  (colors[c].substr(0, refColorMarks[0].length)===refColorMarks[0]  &&  colors[c].substr(-1, refColorMarks[1].length)===refColorMarks[1]) ));
			flagFwdRef=(typeof c === 'string'  &&  ( c.match( /^\s/ )
				||  (c.substr(0, refColorMarks[0].length)===refColorMarks[0]  &&  c.substr(-1, refColorMarks[1].length)===refColorMarks[1]) ));
			tb.appendChild(buildTableRow('td', [
				{ text: flagBackRef ?  ('<div>'+colors[c]+'</div>')  :  "",
					stylez: {backgroundColor: clr.hex, color: clr.contrast},
					onclick: handleClick,
					getColor_cb: (flagBackRef ?  addBackRef :  returnNext) },
				{ text: flagFwdRef ? colors[c] : c,
					onclick: handleClick,
					getColor_cb: (flagFwdRef ?  addRef : addEntry),
					chain: buildHierarchy(
							((pName===SoftMoon.defaultPalette) ? "" : pName),
							((pData.requireSubindex==='false') ? "" : chain) ) }  ]));  }
		if (tb)  frag.appendChild(tb);
		for (s in subs)  { subIndex=(chain.length>0 ? (chain+': ') : "")+s
			frag.appendChild(buildTableRow('th', [{colSpan:'2', text:subIndex}]));
			frag.appendChild(buildTableBody(subs[s], subIndex));  }
		return frag;  }

	function buildHierarchy()  { var chosen="";
		if (arguments.length>0)  {
			if (arguments[0] instanceof Array)
				chosen=arguments[0].join(': ')+': '+chosen;
			else  for (var i=arguments.length; --i>=0;)  { if (typeof arguments[i] == 'string'  &&  arguments[i].length>0)
				chosen=arguments[i]+': '+chosen;  }  };
	return chosen;
	}

	function buildTableRow(chlds, data, className)  {
		var i, p, tr=document.createElement('tr'), td;
		tr.className=className;
		for (i in data)  { td=document.createElement(chlds); // td ‖ th
			for (p in data[i])  { switch (p)  {
				case 'text':  td.innerHTML=data[i].text;
				break;
	//			case 'getColor_cb': UniDOM.addEventHandler(td, 'onclick', x_CP, false, data[i].getColor_cb, data[i].chain);
	//			case 'chain': continue;
				case 'stylez':  for (s in data[i].stylez)  {td.style[s]=data[i].stylez[s]};
				break;
				default:  td[p]=data[i][p];  }  }
			tr.appendChild(td);  }
		return tr;  }

 }; //close  SoftMoon.WebWare.buildPaletteTable
})();  //close & execute the anonymous wrapper function holding long-term private variables


SoftMoon.WebWare.buildPaletteTable.caption='<h6><strong>{pName}</strong> color-picker table</h6>click to choose';  //  '{pName} colors'
SoftMoon.WebWare.buildPaletteTable.refColorMarks=[ '«' , '»' ];  // if a color name in a palette is wrapped
		// with these characters, it is a “forward-reference” to the color-definition.  This means that when the
		// HTML palette <table> is being built, the color-name is not listed, rather the color-definition is listed.
		// Forward referencing can also be accomplished by placing white-space at the beginning of the color-name.
		// Back-referencing the color-definition can be accomplished in a similar way, by wrapping the color-definition
		// with these characters, or by placing white-space at the beginning of the color-definition;
		// in this case, the color-name will be listed, but the color-definition-text will be
		// placed inside a <div></div> within the color-swatch <td></td> (the first column of the row which is usually text-less).
		// Use CSS to manage this added <div>, noting its parent color-swatch <td></td> background will be set as usual,
		// but the <td></td> foreground will also be set to a contrasting color.


// =================================================================================================== \\


/*


SoftMoon.WebWare.Gradientor=new Object;

SoftMoon.WebWare.Gradientor.buildPalette=function()  {}

 */

// =================================================================================================== \\

SoftMoon.WebWare.ColorSpaceLab=new Object;
;(function(){ //wrap private variables

var settings;

SoftMoon.WebWare.ColorSpaceLab.rgbPrecision=0;  //number of decimal places to show after RGB byte values.
SoftMoon.WebWare.ColorSpaceLab.hueAngleUnit='deg';  //hue values default to degrees

SoftMoon.WebWare.ColorSpaceLab.getColor=function()  {return new SoftMoon.WebWare.SpaceLab_Colors;}

SoftMoon.WebWare.SpaceLab_Colors=function()  {
	if (!new.target)  throw new Error("“SpaceLab_Colors” is a constructor, not a function or method.")
	this.RGB= new SoftMoon.WebWare.RGBA_Color(settings.Rgb_byte.value, settings.rGb_byte.value, settings.rgB_byte.value, {useHexSymbol:true});
	this.model='RGB';
	var haf=SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[SoftMoon.WebWare.ColorSpaceLab.hueAngleUnit];
	this.HSL= new SoftMoon.WebWare.HSL_Color(parseFloat(settings.Hue_degrees.value)/haf, parseFloat(settings.hSl_percent.value)/100, parseFloat(settings.hsL_percent.value)/100);
	this.HSV= new SoftMoon.WebWare.HSV_Color(parseFloat(settings.Hue_degrees.value)/haf, parseFloat(settings.hSv_percent.value)/100, parseFloat(settings.hsV_percent.value)/100);
	this.HCG= new SoftMoon.WebWare.HCG_Color(parseFloat(settings.Hue_degrees.value)/haf, parseFloat(settings.hCg_percent.value)/100, parseFloat(settings.hcG_percent.value)/100);
	this.CMYK= new SoftMoon.WebWare.CMYK_Color(parseFloat(settings.Cmyk_percent.value)/100, parseFloat(settings.cMyk_percent.value)/100, parseFloat(settings.cmYk_percent.value)/100, parseFloat(settings.cmyK_percent.value)/100);
	}



SoftMoon.WebWare.ColorSpaceLab.setColor=function(CLR, space)  {
	if ( (CLR instanceof SoftMoon.WebWare.SpaceLab_Colors)
	||  !document.getElementById('MasterColorPicker_showLab').checked
	||  (arguments[1] instanceof Event  &&  arguments[1].type!=='click'  &&  !settings.updateLabOnMouseMove.checked) )
		return CLR;

	RGB_Calc.config.push({
		RGBAFactory:       {value: SoftMoon.WebWare.RGBA_Color},
		CMYKFactory:       {value: SoftMoon.WebWare.CMYK_Color},
		ColorWheelFactory: {value: SoftMoon.WebWare.ColorWheel_Color}  })

	if (space!=='rgb')  {
		settings.Rgb_byte.value= settings.Rgb_range.value= Math.roundTo(CLR.RGB.red, SoftMoon.WebWare.ColorSpaceLab.rgbPrecision);
		settings.rGb_byte.value= settings.rGb_range.value= Math.roundTo(CLR.RGB.green, SoftMoon.WebWare.ColorSpaceLab.rgbPrecision);
		settings.rgB_byte.value= settings.rgB_range.value= Math.roundTo(CLR.RGB.blue, SoftMoon.WebWare.ColorSpaceLab.rgbPrecision);

		settings.Rgb_percent.value=Math.roundTo(CLR.RGB.red/2.55, 5);
		settings.rGb_percent.value=Math.roundTo(CLR.RGB.green/2.55, 5);
		settings.rgB_percent.value=Math.roundTo(CLR.RGB.blue/2.55, 5);
		settings.Rgb_hex.value=CLR.RGB.hex.substr(1,2);
		settings.rGb_hex.value=CLR.RGB.hex.substr(3,2);
		settings.rgB_hex.value=CLR.RGB.hex.substr(5,2);  }

	if (!CLR.HSV)  CLR.HSV=RGB_Calc.to.hsv(CLR.RGB.rgb);

	if (space!=='hsb' && space!=='hsv' && space!=='hsl' && space!=='hcg')  {
		var hau=SoftMoon.WebWare.ColorSpaceLab.hueAngleUnit
		settings.Hue_degrees.value=
//				Math.roundTo(parseFloat(CLR.HSV.hue)*SoftMoon.WebWare.ColorSpaceLab.hueAngleUnitFactor, SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision.deg);
			Math.roundTo(CLR.HSV.hue*SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[hau], SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau]);
		settings.Hue_range.value=
			Math.roundTo(CLR.HSV.hue*360, SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision['deg']);

		settings.Hue_percent.value= Math.roundTo(parseFloat(CLR.HSV.hue)*100, SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision['%']);  }

	if (space!=='hsb' && space!=='hsv')  {
		settings.hSv_percent.value= settings.hSv_range.value= Math.roundTo(CLR.HSV.saturation*100, 5);
		settings.hsV_percent.value= settings.hsV_range.value= Math.roundTo(CLR.HSV.value*100, 5);  }

	if (space!=='hsl')  {
		if (!CLR.HSL)  CLR.HSL=RGB_Calc.to.hsl(CLR.RGB.rgb);
		settings.hSl_percent.value= settings.hSl_range.value= Math.roundTo(CLR.HSL.saturation*100, 5);
		settings.hsL_percent.value= settings.hsL_range.value= Math.roundTo(CLR.HSL.lightness*100, 5);  }

	if (space!=='hcg')  {
		if (!CLR.HCG)  CLR.HCG=RGB_Calc.to.hcg(CLR.RGB.rgb);
		settings.hCg_percent.value= settings.hCg_range.value= Math.roundTo(CLR.HCG.chroma*100, 5);
		settings.hcG_percent.value= settings.hcG_range.value= Math.roundTo(CLR.HCG.gray*100, 5);  }

	if (space!=='cmyk')  {
		if (!CLR.CMYK)  CLR.CMYK=RGB_Calc.to.cmyk(CLR.RGB.rgb);
		settings.Cmyk_percent.value= settings.Cmyk_range.value= Math.roundTo(CLR.CMYK.cyan*100, 5);
		settings.cMyk_percent.value= settings.cMyk_range.value= Math.roundTo(CLR.CMYK.magenta*100, 5);
		settings.cmYk_percent.value= settings.cmYk_range.value= Math.roundTo(CLR.CMYK.yellow*100, 5);
		settings.cmyK_percent.value= settings.cmyK_range.value= Math.roundTo(CLR.CMYK.black*100, 5);  }

	RGB_Calc.config.pop();
	SoftMoon.WebWare.ColorSpaceLab.update_Hue_rangeHandle();

	SoftMoon.WebWare.ColorSpaceLab.swatch.style.backgroundColor=CLR.RGB.hex;
	SoftMoon.WebWare.ColorSpaceLab.swatch.style.color=CLR.RGB.contrast;

	return CLR;  }


SoftMoon.WebWare.ColorSpaceLab.alignColor=function()  {
	var build, i,
			thisValue=this.value||0;
			model=this.name.match( /_([a-z]{3,4})_/i )[1],
			format=this.name.match( /_([a-z]+)$/ )[1];  // results: dec hex byte percent deg range
	space=model.toLowerCase();  // results: rgb hsv hsl hcg cmyk
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
//			if (window.fdSlider)  fdSlider.updateSlider('MasterColorPicker_'+model+'_range');
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
//			if (window.fdSlider)  fdSlider.updateSlider('MasterColorPicker_'+model+'_range');
			settings[model+'_byte'].value=Math.roundTo(thisValue*2.55, SoftMoon.WebWare.ColorSpaceLab.rgbPrecision);
			settings[model+'_hex'].value=Math._2hex(parseFloat(thisValue)*2.55);
			break setLikeInputs;  }
		case 'hex':  {
			settings[model+'_range'].value=parseInt(thisValue, 16);
//			if (window.fdSlider)  fdSlider.updateSlider('MasterColorPicker_'+model+'_range');
			settings[model+'_percent'].value=Math.roundTo(parseInt(thisValue, 16)/2.55, 5);
			settings[model+'_byte'].value=parseInt(thisValue, 16);
			break setLikeInputs;  }  }  }
	case 'hue':  {
		var hau=SoftMoon.WebWare.ColorSpaceLab.hueAngleUnit,
				hauf=SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors[hau];
		switch (format)  {
		case 'degrees':  {
			var hue=parseFloat(thisValue)/hauf;
			settings.Hue_range.value=Math.deg(hue*360);
//			if (window.fdSlider)  fdSlider.updateSlider('MasterColorPicker_Hue_range');
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
//			if (window.fdSlider)  fdSlider.updateSlider('MasterColorPicker_Hue_range');
			settings.Hue_degrees.value=Math.roundTo(
				Math.sawtooth(hauf, (thisValue/100)*hauf),
				SoftMoon.WebWare.ColorWheel_Color.hueUnitPrecision[hau] );
			break setLikeInputs;  }  }  }
	default:  { switch (format)  {
			case 'range':   settings[model+'_percent'].value=Math.roundTo(thisValue, 5);  break;
			case 'percent':
				settings[model+'_range'].value=thisValue;
//				if (window.fdSlider)  fdSlider.updateSlider('MasterColorPicker_'+model+'_range');
				}  }  }  }

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
		case 'hue':  space='hsv';
		case 'hsb':
		case 'hsv':  build[1]=parseFloat(settings.hSv_percent.value||0), build[2]=parseFloat(settings.hsV_percent.value||0);  break;
		case 'hsl':  build[1]=parseFloat(settings.hSl_percent.value||0), build[2]=parseFloat(settings.hsL_percent.value||0);  break;
		case 'hcg':  build[1]=parseFloat(settings.hCg_percent.value||0), build[2]=parseFloat(settings.hcG_percent.value||0);  break;  }  }  }

	SoftMoon.WebWare.ColorSpaceLab.setColor({RGB: CSL_calc.from[space](build)}, space);  }


var RGB_Calc=SoftMoon.WebWare.RGB_Calc,
		CSL_calc=new RGB_Calc({
	inputAsFactor: false,
	hueAngleUnit: 'deg',
	RGBAFactory: SoftMoon.WebWare.RGBA_Color,
	CMYKFactory: SoftMoon.WebWare.CMYK_Color,
	ColorWheelFactory: SoftMoon.WebWare.ColorWheel_Color  })

var MCP_stylesheet;

SoftMoon.WebWare.ColorSpaceLab.update_Hue_rangeHandle=function(cssColor)  {  // pass in valid CSS String
	if (!MCP_stylesheet.hue_range_thumb_Indexes)  return;
	if (typeof cssColor !== 'string')  cssColor=CSL_calc.from.hue(settings.Hue_range.value).toString('css');
	for (var i=0, rules=MCP_stylesheet.ss.cssRules;  i<MCP_stylesheet.hue_range_thumb_Indexes.length;  i++)  {
		rules[MCP_stylesheet.hue_range_thumb_Indexes[i]].style.backgroundColor=cssColor;  }  }



UniDOM.addEventHandler(window, 'onload', function() {
	settings=UniDOM.getElementsBy$Name(document.getElementById('MasterColorPicker_Lab'), "", true,
																				function(e) {return e.name.match( /^[a-z]+_([a-z_]+)$/i )[1];});
	for (var i=0; i<settings.length-2; i++)  {  // the last two inputs are checkboxes to link the Lab with the mouse & keyboard
		UniDOM.addEventHandler(settings[i], ['onchange', 'onkeyup'], SoftMoon.WebWare.ColorSpaceLab.alignColor);
		if (settings[i].type!=='range')  {
			UniDOM.addEventHandler(settings[i], 'onpaste', function() {  //wait for paste to change the value
				var thisInp=this;
				setTimeout(function() {SoftMoon.WebWare.ColorSpaceLab.alignColor.call(thisInp);}, 0);  });  }  }

	SoftMoon.WebWare.ColorSpaceLab.swatch=document.getElementById('MasterColorPicker_Lab').getElementsByClassName('swatch')[0];
	var CLR=SoftMoon.WebWare.ColorSpaceLab.getColor();
	SoftMoon.WebWare.ColorSpaceLab.swatch.style.backgroundColor=CLR.RGB.hex;
	SoftMoon.WebWare.ColorSpaceLab.swatch.style.color=CLR.RGB.contrast;
  UniDOM.addEventHandler( SoftMoon.WebWare.ColorSpaceLab.swatch, 'onclick',
		function(event)  {MasterColorPicker.pick(SoftMoon.WebWare.ColorSpaceLab.getColor(), event, "ColorSpace Lab");} );

	MCP_stylesheet=new UniDOM.StyleSheetShell(['MasterColorPicker_desktop_stylesheet', 'MasterColorPicker_stylesheet']),
	MCP_stylesheet.hue_range_thumb_Indexes=MCP_stylesheet.getRuleIndexes( /^#MasterColorPicker_Lab tr.hue input\[type="range"\]::.+-thumb$/ );
	SoftMoon.WebWare.ColorSpaceLab.update_Hue_rangeHandle();

	UniDOM.addEventHandler(settings.Hue_range, 'onMouseDown', function(event)  {
		var move=UniDOM.addEventHandler(document.body, 'onMouseMove',
					SoftMoon.WebWare.ColorSpaceLab.update_Hue_rangeHandle,
					true),
				drop=UniDOM.addEventHandler(document.body, 'onMouseUp',
					function(event)  {
						move.onMouseMove.remove();  drop.onMouseUp.remove();
						event.stopPropagation();  },
					true);
		event.stopPropagation();  });
  });

})(); //  close  wrap private variables of ColorSpaceLab
// =================================================================================================== \\





var MasterColorPicker={};  // this is a global variable: a property of the window Object.


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

Object.defineProperty(MasterColorPicker, 'HTML', {value: document.getElementById('MasterColorPicker'), enumerable: true});

function boolString(s, d) {  s=s.toLowerCase();
	if (boolString.truthy.indexOf(s)>=0)  return true;
	if (boolString.falsey.indexOf(s)>=0)  return false;
	return Boolean(d);  }
boolString.truthy=['true', 't', 'yes', 'y', 'affirmative'];
boolString.falsey=['false', 'f', 'no', 'n', 'negative'];
//you can adjust the language of the meta tag values above through the global reference below;
Boolean.evalString=boolString;

var calcOpts={
	RGBAFactory: function(r,g,b,a) {return new SoftMoon.WebWare.RGBA_Color(r,g,b,a,{useHexSymbol: true})},
	useHexSymbol: true  };
if ("hueAngleUnit" in user) calcOpts.hueAngleUnit=user.hueAngleUnit;  // per SoftMoon.WebWare.RGB_Calc:   'deg' ‖ "°" ‖ 'rad' ‖ "ʳ" ‖ 'grad' ‖ "%" ‖ 'turn' ‖ "●"
else
if ("hueAngleUnit" in meta) calcOpts.hueAngleUnit=meta.hueAngleUnit;  // per SoftMoon.WebWare.RGB_Calc:   'deg' ‖ "°" ‖ 'rad' ‖ "ʳ" ‖ 'grad' ‖ "%" ‖ 'turn' ‖ "●"
if ("keepPrecision" in user) calcOpts.roundRGB=!user.keepPrecision;
else
if ("keepPrecision" in meta) calcOpts.roundRGB=!boolString(meta.keepPrecision, !SoftMon.WebWare.RGB_Calc.ConfigStack.prototype.roundRGB);
MasterColorPicker.RGB_calc=new SoftMoon.WebWare.RGB_Calc(calcOpts);


Object.defineProperty(MasterColorPicker, "keepPrecision", { enumerable: true,
	get: function() {return !MasterColorPicker.RGB_calc.config.roundRGB;},
	set: function(kp) {MasterColorPicker.RGB_calc.config.roundRGB=!kp;}  });


//these are options for the pickFilter function and its related colorSwatch function
Object.defineProperty(MasterColorPicker, "hueAngleUnit", { enumerable: true,
	get: function() {return MasterColorPicker.RGB_calc.config.hueAngleUnit;},
	set: function(hau) {MasterColorPicker.RGB_calc.config.hueAngleUnit=hau;}  });
MasterColorPicker.useHexSymbol=("useHexSymbol" in user) ? user.useHexSymbol : ("useHexSymbol" in meta) ? boolString(meta.useHexSymbol, true) : true;  // ¿prefix hex values with a hash like this: #FF0099 ?
MasterColorPicker.outputFormat=("outputFormat" in user) ? user.outputFormat : ("outputFormat" in meta) ? meta.outputFormat : 'css';  // see  SoftMoon.WebWare.« RGB_Color ‖ ColorWheel_Color ‖ CMYK_Color ».toString  in RGB_Calc.js file


//we tell the x_ColorPicker.pickFilter to use its related colorSwatch function: (we can also use it by calling it directly)
MasterColorPicker.colorSwatch=  ("colorSwatch" in user) ? user.colorSwatch  : SoftMoon.WebWare.x_ColorPicker.colorSwatch;
//options for the default colorSwatch function given above
MasterColorPicker.showColorAs=  ("showColorAs" in user) ? user.showColorAs  :  ("showColorAs" in meta) ? meta.showColorAs                     : 'swatch';   //  'swatch'  or  'background'←of the element passed into colorSwatch()←i.e. the current MasterColorPicker.dataTarget
MasterColorPicker.swatch=            ("swatch" in user) ? user.swatch       :       ("swatch" in meta) ? document.getElementById(meta.swatch) : false;     // no universal swatch element provided here, so colorSwatch() will figure it from the dataTarget ↑.
MasterColorPicker.toggleBorder=("toggleBorder" in user) ? user.toggleBorder : ("toggleBorder" in meta) ? boolString(meta.toggleBorder, true)  : true;      // of the swatch when it has a valid color
MasterColorPicker.borderColor=  ("borderColor" in user) ? user.borderColor  :  ("borderColor" in meta) ? meta.borderColor                     : 'invert';  // HTML/CSS color  or  'invert'



// note that the MyPalette constructor calls  MasterColorPicker.registerInterfaceElement  where appropriate.
MasterColorPicker.MyPalette=new SoftMoon.WebWare.x_ColorPicker.MyPalette(document.getElementById('MasterColorPicker_MyPalette'), "MyPalette");
MasterColorPicker.pickFilters.push(MasterColorPicker.MyPalette);


UniDOM.getElementsBy$Name(document.getElementById('MasterColorPicker_Filter'), /color/ ).map(function(e)  {
	MasterColorPicker.registerInterfaceElement(e, SoftMoon.WebWare.x_ColorPicker.ColorFilter.Genie.onTabbedOut_PickerPlugIn);  });


//any interface element that requires “focus” needs to be registered to work properly
/*  Now the palette_select resides on the “options” panel,
  and would be registered automatically when that panel is registered (it won’t be registered twice if we register it here below),
  so we could comment out the line below if:
		•the palette select has an inline HTML attributes:  tabToTarget='true'  backtabToTarget='true'
		•we don’t care to tabToTarget
*/
//MasterColorPicker.registerInterfaceElement(document.getElementById('MasterColorPicker_palette_select'), {backtabToTarget: true, tabToTarget: true});

//Note that InterfaceElements that are associated with a FormFieldGenie (on the MyPalette & Color Filter Panels)
// were already pre-registered above, as they need special attention.

//likewise, any document subsection that is not part of the picker mainPanel, but is part of the picker interface and
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
MasterColorPicker.pickFilters.push(SoftMoon.WebWare.x_ColorPicker.color_to_text);




/****************************************************
 *This section below supports the “default” HTML/CSS files
 */
var mainHTML= MasterColorPicker.mainPanel_HTML= document.getElementById('MasterColorPicker_mainPanel'),
		optsHTML= MasterColorPicker.optsPanel_HTML= document.getElementById('MasterColorPicker_options'),
		optsubHTML=optsHTML.getElementsByTagName('div')[0];

UniDOM.addEventHandler(optsHTML, 'pickerStateChange',
	// note that in testing, an “onblur” event never happens for the dataTarget when clicking on a pickerPanel,
	// as the “onclick” event for the picker happens first and re-focuses the dataTarget;
	// this should not be guaranteed (events occur by definition in random order){{old docs...for legacy MSIE only}}.
	// Using UniDOM.disable preserves the disabled states of subsections…
	function(event) {if (event.oldState!==event.flag)  UniDOM.getElementsBy$Class(this, 'pickerOptions').disable(!event.flag);},
	false);
//we could avoid this handler below altogether if MSIE or MS-Edge was up-to-date on CSS rules.
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
UniDOM.addEventHandler(mainHTML, 'pickerLevelChange',
	function(event) { if (this===event.newTopPanel)  {
		MasterColorPicker.panels.splice(MasterColorPicker.panels.indexOf(optsHTML), 1);
		MasterColorPicker.panels.push(optsHTML);  }  },
	false);
UniDOM.addEventHandler(optsHTML, 'pickerLevelChange',
	function(event) { if (this===event.newTopPanel)  {
		MasterColorPicker.panels.splice(MasterColorPicker.panels.indexOf(mainHTML), 1);
		MasterColorPicker.panels.splice(-1, 0, mainHTML);  }  },
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
			case "ʳ":  text='radiansʳ';  hau='rad';
			break;
			case 'grad':  text='gradians';  hau='grad';
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
			case "ʳ":  text='radians (0ʳ—2πʳ ≈6.2831853ʳ)';
			break;
			case 'grad':  text='gradians (0—400)';
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


var prov, provSelect=userOptions.colorblind_provider;
for (prov in SoftMoon.WebWare.RGB_Calc.colorblindProviders)  {
	provSelect.add(new Option(SoftMoon.WebWare.RGB_Calc.colorblindProviders[prov].title,  prov));  }
UniDOM.addEventHandler(provSelect, 'onchange', function() {
	SoftMoon.WebWare.RGB_Calc.install('colorblind', this.value);
	document.getElementById('RainbowMaestro').getElementsByClassName('thanks')[0].innerHTML=SoftMoon.WebWare.RGB_Calc.colorblindProviders[this.value].thanks;
	if (document.getElementsByName('RainbowMaestro_colorblind')[0].checked)  SoftMoon.WebWare.RainbowMaestro.buildPalette();  }  );
UniDOM.generateEvent(provSelect, 'onchange');





	function enhanceKeybrd(event)  {
		if (!event.target.parentNode  //the Genie may delete them before this handler occurs.
		||  event.keyCode===9  // ← tab key    ↓ ,<                .> ↓
		||  (event.ctrlKey && event.keyCode===188 || event.keyCode===190))  return;
		if (UniDOM.hasAncestor(event.target, MasterColorPicker.HTML))
			MasterColorPicker.setTopPanel(UniDOM.getAncestorBy$Class(event.target, 'pickerPanel'));
		if (event.altKey)  return;
		var txt, curPos, color;
		switch (event.keyCode)  {
		case 49: if (event.ctrlKey && !event.shiftKey)  txt="●";  // 1! key
		break;
		case 53: if (event.ctrlKey && event.shiftKey)  txt="°";  // 5% key
		break;
		case 82: if (event.ctrlKey)  txt="ʳ";  //  R key: note ctrl-R and shift-ctrl-R both refresh the browser page!  && event.altKey
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
		break; }
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
				SoftMoon.WebWare.ColorSpaceLab.setColor({RGB: color});  },
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


} );  //close window onload

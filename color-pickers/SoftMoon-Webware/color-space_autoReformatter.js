
SoftMoon.WebWare.refactorPaletteModel=function(format)  {
	//  This is a remenant from when ColorPicker-Palette HTML Tables showed values directly;
	//now they only show the human-readable color-names.
	//  They may in the future, or by your intervention, or your 3rd-party color-picker-tables or other color picker may
	//want to have RGB, HSL etc… values shown to the user, and by adding a refactor() method to the picker HTML Element,
	//you can keep the presentation in line with what the user wants to use:
	//  bytes (0-255), factors (0.0 - 1.0), percents (0.0% - 100.0%), degrees (0.0° - 359.999…°)
	var p=document.getElementById('MasterColorPicker_mainPanel').firstChild;
	do  {if (typeof p.refactor == 'function')  p.refactor(format);}  while (p=p.nextSibling);  }


//  •¡NOTE! this function below refers to (non-standard properties of the inate global of) the Object “RegExp”
//     which may be a property of the  window  Object (i.e. the inate global RegExp constructor) or of  SoftMoon.WebWare
SoftMoon.WebWare.refactorRGBModel=function(rgb, from, model)  { var k, strFlag=(typeof rgb == 'string');   // alert(rgb +'\n'+ 'from: '+from+'\nmodel: '+model);
	if (strFlag)  {with (SoftMoon)  {
		if (rgb=rgb.match((from==='byte') ? RegExp.rgb : ((from==='factor') ? RegExp.threeFactors : RegExp.threePercents)))
			rgb.shift();
		else return false;  }  }
	switch (model)  {
	case 'percent':
		for (k=0; k<3; k++)  {
			if (rgb[k].substr(-1)=='%')  continue;
			if (from==='factor'  ||  (from==='byte'  &&  parseFloat(rgb[k])<1))  rgb[k]=Math.roundTo(rgb[k]*100, 1);
			else if (from==='byte')  rgb[k]=Math.roundTo(rgb[k]/2.55, 1);
			rgb[k]+='%';  }
		break;
	case 'factor':
		for (k=0; k<3; k++)  {
			if (from==='percent'  ||  (typeof rgb == 'string'  &&  rgb[k].substr(-1)=='%'))
				rgb[k]=Math.roundTo(parseFloat(rgb[k])/100, 3);
			if (parseFloat(rgb[k])<1)  continue;
			else if (from==='byte')  rgb[k]=Math.roundTo(rgb[k]/255, 3);  }
		break;
	case 'byte':
		for (k=0; k<3; k++)  {
			if (from==='percent'  ||  (typeof rgb == 'string'  &&  rgb[k].substr(-1)=='%'))
				rgb[k]=Math.round(parseFloat(rgb[k])*2.55);
			else if (from==='factor'  ||  rgb[k]<1)  rgb[k]=Math.round(rgb[k]*255);  }
		break;  }
	return strFlag ? rgb.join(',  ') : rgb;  }


SoftMoon.WebWare.refactorClrModels=function(f, from, model, strFlag)  { var k;
	if (typeof f == 'string')  { with (SoftMoon)  {
		if (f=f.match( RegExp[from.match( /percent/ ) ? 'threePercents' : 'threeFactors'] ))  {
			f.shift();
			strFlag=true;  }
		else  return false  }  }   // alert('model: '+model+'\nfrom: '+from);
	switch (model)  {
	case 'percent':
		for (k=0; k<f.length; k++)  {
			if (typeof f == 'string'  &&  f[k].substr(-1)=='%')  continue;
			if (from==='factor')  f[k]=Math.roundTo(f[k]*100, 1);
			f[k]+='%';  }
		break;
	case 'factor':
		for (k=0; k<f.length; k++)  {
			if (from==='percent'  ||  (typeof f == 'string'  &&  f[k].substr(-1)=='%'))
				f[k]=Math.roundTo(parseFloat(f[k])/100, 3);  }
		break;  }
	return strFlag ? f.join(',  ') : f;  }


SoftMoon.WebWare.refactorHue=function(h, from, model)  {   // alert('model: '+model+'\nfrom: '+from);
	switch (model)  {
	case 'degrees':
		if (typeof h == 'string'  &&  h.substr(-1)==='°')  h=parseFloat(h);
		else
		if (from==='percent'  ||  (typeof h == 'string'  &&  h.substr(-1)==='%'))  h=3.6*parseFloat(h);
		else
		if (from==='factor')  h=parseFloat(h)*360;
		return Math.roundTo(h, 3)+'°';
	case 'factor':
		if (from==='degrees'  ||  (typeof h == 'string'  &&  h.substr(-1)==='°'))  h=parseFloat(h)/360;
		if (from==='percent'  ||  (typeof h == 'string'  &&  h.substr(-1)==='%'))  h=parseFloat(h)/100;
		return Math.roundTo(h, 5);
	case 'percent':
		if (typeof h == 'string'  &&  h.substr(-1)==='%')  h=parseFloat(h);
		else
		if (from==='degrees'  ||  (typeof h == 'string'  &&  h.substr(-1)==='°'))  h=parseFloat(h)/3.6;
		else
		if (from==='factor')  h=parseFloat(h)*100;
		return Math.roundTo(h, 3)+'%';  }  }


SoftMoon.WebWare.activateColorSpaceFormatConverters=function(getColorInputs)  {
	var i, j, colorInputs, hold_rgbValueBy, hold_rgbConvertFrom, hold_huesIn, temp,
			cvtFrom=document.getElementById('RGB_convertFrom').getElementsByTagName('input'),
			getCvtFrom=function() {for (j=0; j<cvtFrom.length; j++)  {if (cvtFrom[j].checked)  return cvtFrom[j].value;}},
			doConvert=document.getElementById('RGB_autoconvert');
	var whenClicked=function(cvtFromFormat, newModel)  {  //this is called by the “RGB_convertFrom” onclick handler, and it passes “cvtFromFormat” and “newModel”
			if (doConvert.checked)  {
				if (typeof cvtFromFormat !== 'string')
					cvtFromFormat=getCvtFrom();
				var m,
						convert=SoftMoon.WebWare.refactorRGBModel,
						from= (hold_rgbValueBy==='byte') ?
								'byte'
							: cvtFromFormat,
						model= (this.value==='byte') ? 'byte' : (newModel || cvtFromFormat);
				colorInputs=getColorInputs();
				for (j=0; j<colorInputs.length; j++)  { with (SoftMoon)  {  // RegExp may be global or a property of SoftMoon
					if (temp=convert(colorInputs[j].value, from, model))
						colorInputs[j].value=temp;
					else
					if ((m=colorInputs[j].value.match(RegExp.stdWrappedColor))  &&  m[1].toUpperCase()=='RGB')
						colorInputs[j].value='RGB('+convert(m[2], from, model)+')';
					else
					if ((m=colorInputs[j].value.match(RegExp.stdPrefixedColor))  &&  m[1].toUpperCase()=='RGB')
						colorInputs[j].value='RGB: '+convert(m[2], from, model);  }  }  }
			hold_rgbValueBy=this.value;
			setTimeout(function() {SoftMoon.WebWare.refactorPaletteModel('RGB');}, 1);  };

	var b=document.getElementById('RGB_by').getElementsByTagName('input');
	for (i=0; i<b.length; i++)  {
		if (b[i].checked)  hold_rgbValueBy=b[i].value;
		UniDOM.addEventHandler(b[i], 'onclick', whenClicked);  }

	whenClicked=function()  {
		if (doConvert.checked)  {
			var m,
					convert=SoftMoon.WebWare.refactorClrModels,
					model=this.value,
					restring=function(pre, post)  { with (SoftMoon) {  // RegExp may be global or a property of SoftMoon
						var flag=true;
						switch (m[1]=m[1].toUpperCase())  {
						case 'RGB':  if ( (temp=m[2].match(RegExp.threeFactors))  || (temp=m[2].match(RegExp.threeFactors)) )
													 {temp.shift();  m[2]=temp;  flag=false;}
												 else  break;
						case 'HCG':         // RegExp.hcg &
						case 'HSB':         // RegExp.hsb &
						case 'HSV':         // RegExp.hsv are the same
						case 'HSL':         //         ↓
							if (flag && (temp=m[2].match(RegExp.hsl))  )  {
								colorInputs[j].value=m[1]+pre
									+( (temp[1].substr(-1)==='°'  ||  SoftMoon.WebWare.rgb.huesByDegrees)  ?
											temp[1]
										: convert([temp[1]], hold_rgbConvertFrom, model, true) )
									+',  '+convert(temp.slice(2), hold_rgbConvertFrom, model, true)+post;
								break;  }
							flag=false;
						case 'CMYK':
							if (flag && (temp=m[2].match(RegExp.cmyk)))  {temp.shift();  m[2]=temp;}
						default: colorInputs[j].value=m[1]+pre+convert(m[2], hold_rgbConvertFrom, model, true)+post;  }  }  };
			colorInputs=getColorInputs();
			for (j=0; j<b.length; j++)  {if (b[j].checked)  b[j].onclick(hold_rgbConvertFrom, model);}
			for (j=0; j<colorInputs.length; j++)  { with (SoftMoon)  { // RegExp may be global or a property of SoftMoon
				if ((m=colorInputs[j].value.match(RegExp.cmyk))
				||  (m=colorInputs[j].value.match(RegExp.fourFactors))
				||  (m=colorInputs[j].value.match(RegExp.threeFactors))
				||  (m=colorInputs[j].value.match(RegExp.threePercents)))
					colorInputs[j].value=convert(m.slice(1), hold_rgbConvertFrom, model, true);
				else
				if (m=colorInputs[j].value.match(RegExp.stdWrappedColor))  restring('(', ')');
				else
				if (m=colorInputs[j].value.match(RegExp.stdPrefixedColor))  restring(': ', "");  }  }  }
		hold_rgbConvertFrom=this.value;
		setTimeout(
			function() {SoftMoon.WebWare.refactorPaletteModel('RGB');  SoftMoon.WebWare.refactorPaletteModel('HSV');},
			1 );  };

	for (i=0; i<cvtFrom.length; i++)  {
		if (cvtFrom[i].checked)  hold_rgbConvertFrom=cvtFrom[i].value;
		UniDOM.addEventHandler(cvtFrom[i], 'onclick', whenClicked);  }

	whenClicked=function()  {
		if (doConvert.checked)  {
			var m,
					convert=SoftMoon.WebWare.refactorHue,
					from=(hold_huesIn == 'degrees') ? 'degrees' : getCvtFrom(),
					model=(this.value==='degrees') ? 'degrees' : getCvtFrom(),
					restring=function(pre, post)  { with (SoftMoon) { // RegExp may be global or a property of SoftMoon
						switch (m[1]=m[1].toUpperCase())  {
						case 'HCG':                                     // RegExp.hcg &
						case 'HSB':                                     // RegExp.hsb &
						case 'HSV':                                     // RegExp.hsv are the same
						case 'HSL':                                     //         ↓
							if (temp=m[2].match((hold_huesIn == 'degrees') ? RegExp.hsl : RegExp.threePercents))
								colorInputs[j].value=m[1]+pre+convert(temp[1], from, model)+',  '+temp[2]+',  '+temp[3]+post;  }  }  }
			colorInputs=getColorInputs();
			for (j=0; j<colorInputs.length; j++)  { with (SoftMoon) { // RegExp may be global or a property of SoftMoon
				if (m=colorInputs[j].value.match(RegExp.stdWrappedColor))  restring('(', ')');
				else
				if (m=colorInputs[j].value.match(RegExp.stdPrefixedColor))  restring(': ', "");  }  }  }
		hold_huesIn=this.value;
		setTimeout(function() {SoftMoon.WebWare.refactorPaletteModel('HSV');}, 1);  };

	var d=document.getElementById('RGB_convertHue').getElementsByTagName('input');
	for (i=0; i<d.length; i++)  {
		if (d[i].checked)  hold_huesIn=d[i].value;
		UniDOM.addEventHandler(d[i], 'onclick', whenClicked);  }

 }

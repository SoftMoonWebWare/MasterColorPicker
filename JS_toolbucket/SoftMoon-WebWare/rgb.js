// rgb.js Beta-1.0 release 1.0.3  November 2, 2018  by SoftMoon WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2018 Joe Golembieski, SoftMoon WebWare

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

// requires  “Math+++.js”  in  JS_toolucket/
// requires  “HTTP.js”  in  JS_toolbucket/SoftMoon-WebWare/

if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')   SoftMoon.WebWare=new Object;


/* The Regular Expressions (RegExp) defined below are here for your convenience, as well as being used within
	 SoftMoon WebWare code.  The RegExp object defined below is placed in the SoftMoon scope chain to keep from
	 cluttering the global namespace, and to avoid modifying existing global objects.  You may, however, find it
	 more convenient for your project’s code which uses these RexExps to have these as properties of the pre-existing
	 global RegExp object.  You may safely modify the code directly below in the following way:
		• eliminate or comment-out the next line of code defining the  SoftMoon.RegExp  object
	 The SoftMoon.WebWare functions’ code dereferences the RegExp object using  with (SoftMoon) {}
	 Therefore, it can find these RegExp definitions from a RegExp object that is either global or a property of SoftMoon.
*/
//if (typeof SoftMoon.RegExp !== 'object')   SoftMoon.RegExp=new Object;

//with (SoftMoon)  {  //  now the RegExp properties defined below will be of  SoftMoon.RegExp  if it exists,
										//  or of the global RegExp Object constructor if the previous line was eliminated or commented-out.

//  confirm and identify agents of the === “standard color-naming formats” ===:
//    «type» ( «data» )
//    «type» : «data»
//  where  «type»  is a color-model (rgb, cmy, cmyk, hsl, hsv, hsb, etc…), or a Palette name
//  where  «data»  is comma-separated values for the given color-model (can be further parsed with the RegExps further below),
//                  or the color name on the given Palette
// with (SoftMoon) { matches=myString.match(RegExp.stdWrappedColor) || myString.match(RegExp.stdPrefixedColor) }
// with (SoftMoon) { matches=RegExp.stdWrappedColor.exec(myString) || RegExp.stdPrefixedColor.exec(myString) }
// yields  matches = [0:complete match,  1:«type», 2:«data»]
// •Note that the «type» must ¡not! contain either of the characters  :  (
// but the «data» may contain them
// •Note that if the format is   «type»(«data»)   then «data»
// may contain opening and/or closing () but the LAST character of the FORMAT, ignoring whitespace, must be a closing )
RegExp.stdWrappedColor= new window.RegExp( /^\s*([^(:]+)\s*\(\s*(.+)\s*\)\s*$/ )
RegExp.stdPrefixedColor= new window.RegExp( /^\s*([^(:]+)\s*\:\s*(.+)\s*$/ )

//  For each of these RegExps below, the match returned will contain an array of the values,
// or the hex value without the leading # for RegExp.hex
// with (SoftMoon) { matches=myString.match(RegExp.«model») }    where  «model» is the color-model type (hex, rgb, etc…)
// yields  matches = [0:complete match,  1:first value, 2:second value, 3:third value, etc…]
//  or if «model» is hex:
// yields  matches = [0:complete match,  1:six-digit hex value (without the leading #)]

							//hex:  "#xxxxxx" or "xxxxxx"  where  x  is a hexadecimal digit 0-9 A-F  (case insensitive)
RegExp.hex= new window.RegExp( /^\s*#?([0-9a-f]{6})\s*$/i );

;(function()  {
var sep='[,; \t]';

							//rgb:   "v¹, v², v³"  where:
							//    (0 <= (int)vⁿ <= 255)  or
							//    (0 < (float)vⁿ < 1)    or
							//    (0% <= (float)vⁿ <= 100%)  →  vⁿ must end with a percent sign %
var rgb='\\s*0*((?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])|\\.[0-9]+|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*';
RegExp.rgb=new window.RegExp( '^' +rgb+ sep +rgb+ sep +rgb+ '$' );
RegExp.rgba=new window.RegExp( '^' +rgb+ sep +rgb+ sep +rgb+ sep + '\\s*0*((?:1?[0-9]{1,2}|1[01][0-9]|12[0-7])|\\.[0-9]+|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*' + '$' );

							//   "v¹, v², v³"  where:
							//    (0 < (float)vⁿ <= 1)  or
							//    (0% <= (float)vⁿ <= 100%)  →  vⁿ must end with a percent sign %
//var f='\\s*0*((?:0|1|\\.[0-9]+)|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*';    //no leading zeros in factors <1  (extras truncated)
	var f='\\s*0*?((?:0|1|0?\\.[0-9]+)|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*';  //one leading zero allowed in factors <1  (extras truncated)
RegExp.threeFactors=new window.RegExp( '^' +f +sep+ f +sep+ f+ '$' );
RegExp.fourFactors=new window.RegExp( '^' +f +sep+ f +sep+ f +sep+ f+ '$' );

//var v='\\s*0*((?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%?)\\s*';   //no leading zeros in factors <1  (extras truncated)
	var v='\\s*0*?((?:100|[0-9]{1,2}(?:\\.[0-9]*)?|0?\\.[0-9]+)%?)\\s*';  //one leading zero allowed in factors <1  (extras truncated)

							//cmy,hsl,hsv:   "v¹, v², v³"  where   0 <= (float)vⁿ <= 100  →  vⁿ may or may not end with a percent sign %
RegExp.threePercents= new window.RegExp( '^' +v+ sep +v+ sep +v+ '$' )
							//cmyk, rgba:   "v¹, v², v³, v4"  where   0 <= (float)vⁿ <= 100  →  vⁿ may or may not end with a percent sign %
RegExp.fourPercents= new window.RegExp( '^' +v+ sep +v+ sep +v+ sep +v+ '$' )
RegExp.cmyk=RegExp.fourPercents
							//hsl,hsv:   "v¹, v², v³"  where   0 <= (float)v¹ < 360   and   0 <= (float)(v²,v³) <= 100   →  (v²,v³) may or may not end with a percent sign %
							//            v¹ may also be directly followed by an optional ° (degree mark) or the 3-char string  deg  (which overrides a default setting of hues specified as factors/percents)
RegExp.hsl= new window.RegExp( '^\\s*0*((?:[12]?[0-9]{1,2}|3[0-5][0-9])(?:\\.[0-9]*)?(?:deg|°)?)\\s*'+ sep +v+ sep +v+ '$' )
RegExp.hsv=RegExp.hsl
RegExp.hsb=RegExp.hsl
RegExp.hcg=RegExp.hsl

})();  // execute the anonymous function above
//}  // close  “with (SoftMoon)”  wrapping RegExp property definitions


//=================================================================================================\\


// this is the palette that is checked first, without needing a palette identifier.
// with the default value given,   SoftMoon.WebWare.rgb('green') === SoftMoon.WebWare.rgb('HTML: green')
if (!SoftMoon.defaultPalette)  SoftMoon.defaultPalette='HTML';

if (typeof SoftMoon.palettes !== 'object')  SoftMoon.palettes=new Object;




SoftMoon.WebWare.Palette=function($palette)  {
	for (var c in $palette)  {this[c]=$palette[c];}
	Object.defineProperty(this, "requireSubindex",  {writable: true,  enumerable: false,  configurable: false});  }

Object.defineProperty(
	SoftMoon.WebWare.Palette.prototype, "getColor", {
		writable: true,
		enumerable: false,
		configurable: false,
		value: function($clr)  { var c, matches;
			$clr=$clr.replace( /^\s+/ , "").replace( /\s+$/ , "").toLowerCase();
			for (c in this)  {
				if (!this[c].palette)  {
					if (c.replace( /^\s+/ , "").replace( /\s+$/ , "").toLowerCase()===$clr)  return this[c];
					else  continue;  }
				if ((matches=($clr.match(RegExp.stdWrappedColor)  ||  $clr.match(RegExp.stdPrefixedColor)))
				&&  c.toLowerCase()===matches[1].toLowerCase())
					return this[c].getColor  ?  this[c].getColor(matches[2])  :  arguments.callee.call(this[c].palette, matches[2]);
				if (this.requireSubindex==='false'  &&  (matches=this[c].getColor  ?  this[c].getColor($clr)  :  arguments.callee.call(this[c].palette, $clr)))
					return matches;  }
			return null;  }  });




// This function will return an initially empty array.
// Once the index is asynchronously loaded via HTTP, the array will fill with HTTP-connect objects, one for each palette being loaded.
// Each HTTP-connect object has a property  .trying  which will become false once that palette is loaded (or if loading fails)
SoftMoon.WebWare.loadPalettes=function(   // ←required  ↓all optional on next line
																			 $path, $addPalette, $loadError, $onMultiple, $maxAttempts, $timeoutDelay)  {
//If the server offers multiple choices for a file, this may require human interaction or otherwise.
//You may pass in a custom function  $onMultiple  to handle that.  You may pass in  HTTP.handleMultiple  for basic human intervention.
//See the SoftMoon.WebWare.HTTP file for more info.
	if (typeof $path != 'string'  ||  $path==="")  $path='color_palettes/';
	if (typeof $addPalette != 'function')  $addPalette=SoftMoon.WebWare.addPalette;
	var files=new Array,
			connector=new SoftMoon.WebWare.HTTP($maxAttempts, $timeoutDelay),
			paletteIndexConnection=SoftMoon.WebWare.HTTP.newConnection($path, 'Can not access color palettes: no HTTP service available.');
	if (paletteIndexConnection === null)  return false;
	paletteIndexConnection.onFileLoad=function()  {
		if (typeof this.responseText != 'string'  ||  this.responseText=="")  {files.noneGiven=true;  return;}
		var paletteIndex=this.responseText.split("\n");
		for (var i=0; i<paletteIndex.length; i++)  {
			if (paletteIndex[i]!=="")  {
				files[i]=SoftMoon.WebWare.HTTP.Connection(paletteIndex[i]);  // there should now be no reason we cannot create a new connection, so we don't check
				files[i].onFileLoad=$addPalette;
				files[i].loadError=$loadError;
				files[i].onMultiple=$onMultiple;
				connector.getFile(files[i]);  }  }  };
	paletteIndexConnection.loadError=$loadError;
	paletteIndexConnection.onmultiple=$onMultiple;
	connector.getFile(paletteIndexConnection);
	return files;  }


SoftMoon.WebWare.addPalette=function($json_palette)  {
	var json_palette =  (this === SoftMoon.WebWare) ? $json_palette : this.responseText;
	// JSON.parse resists single-quote-apostrophy in property names, and will not allow for custom methods; eval can be dangerous, but may be necessary for your implementation.
//	if (typeof json_palette == 'string')  json_palette=eval("("+json_palette+")");
	if (typeof json_palette == 'string')  json_palette=JSON.parse(json_palette);
	if (typeof json_palette == 'object')
		for (paletteName in json_palette)  {
			SoftMoon.palettes[paletteName]= new SoftMoon.WebWare.Palette(json_palette[paletteName].palette);
			if (typeof json_palette[paletteName].getColor == 'function')
				Object.defineProperty(SoftMoon.palettes[paletteName], "getColor", {value: json_palette[paletteName].getColor});
			SoftMoon.palettes[paletteName].requireSubindex=json_palette[paletteName].requireSubindex;  }
	return json_palette;  }



//=================================================================================================\\


;(function() {  // wrap private members



SoftMoon.WebWare.RGBColor=function(r, g, b, byteFlag)  {
	if (this===SoftMoon.WebWare)  throw new Error('RGBColor is a constructor, not a function.');
	var a=new Array(r=getByteValue(r, byteFlag),  g=getByteValue(g, byteFlag),  b=getByteValue(b, byteFlag));
	this.rgb=a;
	this.hex='#'+SoftMoon.WebWare.rgb.to.hex(a);
	this.red=r, this.green=g, this.blue=b;
	this.r=r, this.g=g, this.b=b;
	this.contrast=SoftMoon.WebWare.rgb.contrast(a);
	this.shade=SoftMoon.WebWare.rgb.shade(a);  }

SoftMoon.WebWare.RGBColor.prototype.toString=function(format, forceAlphaFactor) { var s;  if (typeof format != 'string')  format="";  // document.getElementById('tester').firstChild.data='As Byte: ' +SoftMoon.WebWare.rgb.valuesAsByte+ '\nAs Percent: ' +SoftMoon.WebWare.valuesAsPercent+ '\nformat: ' +format+ '\nmatch? ' +format.match( /byte|factor/ );
	alpha=(typeof this.a === 'number');
	if (forceAlphaFactor  &&  !alpha)  {alpha=true;  this.a=127}
	if (format.match( /percent/ )
	||  (!SoftMoon.WebWare.rgb.valuesAsByte  &&  SoftMoon.WebWare.rgb.valuesAsPercent  &&  !format.match( /byte|factor/ )))
		s=Math.roundTo(this.r/2.55, 1)+'%,  '+Math.roundTo(this.g/2.55, 1)+'%,  '+Math.roundTo(this.b/2.55, 1)+'%'+(alpha ? (',  '+(forceAlphaFactor ? Math.roundTo(this.a/127, 1) : (Math.roundTo(this.a/1.27, 1)+'%'))) : "");
	else
	if (format.match( /factor/ )
	||  (!SoftMoon.WebWare.rgb.valuesAsByte  &&  !SoftMoon.WebWare.rgb.valuesAsPercent  &&  !format.match( /byte/ )))
		s=Math.roundTo(this.r/255, 3)+',  '+Math.roundTo(this.g/255, 3)+',  '+Math.roundTo(this.b/255, 3)+(alpha ? (',  '+Math.roundTo(this.a/127, 1)) : "");
	else
		s=Math.round(this.r)+',  '+Math.round(this.g)+',  '+Math.round(this.b)+(alpha ? (',  '+(forceAlphaFactor ? Math.roundTo(this.a/127, 1) : Math.round(this.a))) : "");        //
	if (format.match( /wrapped/ ))  return (alpha ? 'RGBA(' : 'RGB(')+s+')';
	else
	if (format.match( /prefixed/ ))  return (alpha ? 'RGBA: ' : 'RGB: ')+s;
	else
		return s;  }




SoftMoon.WebWare.ColorWheelColor=function(H,S,V, model, hueByDegrees)  {
	if (this===SoftMoon.WebWare)  throw new Error('ColorWheelColor is a constructor, not a function.');
	if (typeof hueByDegrees !== 'boolean')  hueByDegrees=!!SoftMoon.WebWare.rgb.huesByDegrees;
	this.model=model;
	this.hsv=new Array(H,S,V);
	this.hsv.hueByDegrees=hueByDegrees;
	this.h=H, this.s=S, this.v=V;
	this.hue=H, this.saturation=S, this.value=V;
	this.hueByDegrees=hueByDegrees;  }

SoftMoon.WebWare.ColorWheelColor.prototype.toString=function(format)  { var s;  if (typeof format != 'string')  format="";
	if (format.match( /degrees/i )
	||  (SoftMoon.WebWare.rgb.huesByDegrees))   //   &&  format===""
		s=Math.roundTo(parseFloat(this.h) * (this.hueByDegrees ? 1 : 360), 3)+'°';
	else
	if (format.match( /percent/i )
	||  (!SoftMoon.WebWare.rgb.huesByDegrees  &&  SoftMoon.WebWare.rgb.valuesAsPercent  &&  !format.match( /factor/ )))
		s=Math.roundTo(parseFloat(this.h) / (this.hueByDegrees ? 3.6 : .01), 1)+'%';
	else
	if (format.match( /factor/i )
	||  (!SoftMoon.WebWare.rgb.huesByDegrees  &&  !SoftMoon.WebWare.rgb.valuesAsPercent  &&  !format.match( /percent/ )))
		s=Math.roundTo(parseFloat(this.h) / (this.hueByDegrees ? 360 : 1), 3);
	else
		s=Math.roundTo(parseFloat(this.h), 3)+(this.hueByDegrees ? '°' : '');

	if (format.match( /percent/i )
	||  (SoftMoon.WebWare.rgb.valuesAsPercent  &&  !format.match( /factor/ )))
		s+=',  '+Math.roundTo(this.s*100, 1) + '%,  ' + Math.roundTo(this.v*100, 1)+'%';
	else
		s+=',  '+Math.roundTo(this.s, 3) + ',  ' + Math.roundTo(this.v, 3);
	if (format.match( /prefixed/i ))
		return this.model+': '+s;
	else
		return this.model+'('+s+')';  }


SoftMoon.WebWare.CMYKColor=function(c,m,y,k) {
	if (this===SoftMoon.WebWare)  throw new Error('CMYKColor is a constructor, not a function.');
	var a=new Array(c, m, y, k);
	this.cmyk=a;
//	this.RGB=rgb.from.cmyk(a);
	this.cyan=c, this.magenta=m, this.yellow=y, this.black=k;
	this.c=c, this.m=m, this.y=y, this.k=k;  }
SoftMoon.WebWare.CMYKColor.prototype.toString=function(format) { var s;  if (typeof format != 'string')  format="";
		if (format.match( /percent/ )
		||  (SoftMoon.WebWare.rgb.valuesAsPercent  &&  !format.match( /factor/ )))
			s=Math.roundTo(this.c*100, 1)+'%,  '+Math.roundTo(this.m*100, 1)+'%,  '+Math.roundTo(this.y*100, 1)+'%,  '+Math.roundTo(this.k*100, 1)+'%';
		else
		if (format.match( /factor/ )
		||  (!SoftMoon.WebWare.rgb.valuesAsPercent))
			s=Math.roundTo(this.c, 3)+',  '+Math.roundTo(this.m, 3)+',  '+Math.roundTo(this.y, 3)+',  '+Math.roundTo(this.k, 3);
		if (format.match( /wrapped/ ))  return 'CMYK('+s+')';
		else
		if (format.match( /prefixed/ ))  return 'CMYK: '+s;
		else
			return s;  };




//     The central static-functional-class rgb function (below) returns an object with ten properties:
//     {rgb:(array) , hex:(string) , red:(int) ,  green:(int) , blue:(int) , r:(int) ,  g:(int) , b:(int) , contrast:(string - hex) , shade:(string - hex)}
// The  rgb:(array)  is indexed  0,1,2  containing three (int) values corresponding to the selected color’s red, green, and blue
// The  hex:(string)  is a six-digit hexadecimal RGB representation (RRGGBB) of the selected color.
// And where (int) → 0-255
//
//     The rgb function input can accept color definitions in many ways:
// • as three distinct RGB values (pass in three distinct arguments)
//    These RGB values may be byte values (0-255), percent values with % sign (0%-100%), or factor values (0-0.999………).
//  === options below require passing in ¡only! one argument ===
// • as three distinct RGB values passed in as an array indexed 0,1,2 (see note above)
// • as a string representing the 6-digit hexadecimal RGB color value (with or without the leading #)
// • as a string of three comma-separated RGB values "v¹, v², v³" (see RegExp section at top)
// • as a string of four comma-separated CMYK values "v¹, v², v³, v4" (see RegExp section at top)
// • as a string — standard formats for naming colors using color-models or Palettes (see RegExp section at top)
// • as a string specifying a color name on found the default Palette (the default Palette must be loaded)
//    (note that the HTML palette is the initial (default) “default Palette”)
// NOTE: that while byte values passed in should technically be (int) in the range of 0-255,
//  when passed in as 3 individual values or as an array of 3 values, values outside this range
//  are allowed, but are “truncated” or “reflected” back into the legal range.  (float)s are rounded to (int)s.
//
SoftMoon.WebWare.rgb=function(r, g, b, byteFlag)  { with(SoftMoon)  { with(WebWare)  {

	if (arguments[0] == null)  return;
	if (arguments.length<=2  &&  typeof arguments[0] == 'string')  { var matches;
		if ( palettes.hasOwnProperty(defaultPalette)
		&&  (palettes[defaultPalette] instanceof Palette)
		&&  (matches=palettes[defaultPalette].getColor(arguments[0])) )
			return rgb(matches, true);
		if (matches=arguments[0].match(
			rgb.valuesAsByte ? RegExp.rgb : (rgb.valuesAsPercent ? RegExp.threePercents : RegExp.threeFactors)))  {
			matches.shift();
			return rgb(matches);  }
		else
		if (matches=arguments[0].match(RegExp.cmyk))
			return rgb.from.cmyk(matches.slice(1));
		else
		if (matches=arguments[0].match(RegExp.hex))
			return rgb.from.hex(matches[1]);
		else
		if (matches=(arguments[0].match(RegExp.stdWrappedColor)  ||  arguments[0].match(RegExp.stdPrefixedColor)))  {
			matches[1]=matches[1].replace( /^\s+/ , "").replace( /\s+$/ , "").toLowerCase();
			if (typeof rgb.from[matches[1]] == 'function')  {
				return rgb.from[matches[1]](matches[2]);       }
			for (p in palettes)  { if (p.toLowerCase()===matches[1]  &&  (palettes[p] instanceof Palette))
				return rgb(palettes[p].getColor(matches[2]), true);  }  }
		return rgb.error(arguments[0]);  }
	if (arguments.length<=2  &&  (arguments[0] instanceof Array))  {
		byteFlag=arguments[1];  b=arguments[0][2];  g=arguments[0][1];  r=arguments[0][0];  }
	return new RGBColor(r, g, b, byteFlag);  }  }  }


SoftMoon.WebWare.rgb.contrast=function(rgb)  {
	return  (((Number(rgb[0])+Number(rgb[1])+Number(rgb[2]))/3) < 128)  ?  '#FFFFFF' : '#000000';  }

SoftMoon.WebWare.rgb.shade=function(rgb)  { var i, min=255, max=0;
	for (i=0; i<3; i++)  {min=(rgb[i]<min) ? rgb[i] : min;   max=(rgb[i]>max) ? rgb[i] : max;}
	if (255-max > min)  f=255/max;
	else  f=1/min;
	return '#'+SoftMoon.WebWare.rgb.to.hex([rgb[0]*f, rgb[1]*f, rgb[2]*f]);  }


SoftMoon.WebWare.rgb.error=function(clr, ct)  {  with (SoftMoon.WebWare)  {
	if (rgb.error.release instanceof Array)  for (var i=0; i<rgb.error.release.length; i++)  {
		if (typeof rgb.error.release[i] == 'function')  rgb.error.release[i]();  }
	rgb.error.release=new Array;
	if (rgb.throwErrors)
		throw new Error(ct ? 'Bad values for '+ct+' conversion: “'+clr+'”.' : 'The color “'+clr+'” is undefined.');
	else  return null;  }  }
SoftMoon.WebWare.rgb.error.release=new Array;  //if you throw errors, you may need to pop settings off the stack that you stacked earlier (see “settings section” below)
SoftMoon.WebWare.rgb.throwErrors=false;  // change to true for debugging, etc…



var stack=new Array;

SoftMoon.WebWare.rgb.stackSettings=function()  {
	stack.push([
		SoftMoon.WebWare.rgb.reflect,
		SoftMoon.WebWare.rgb.keepPrecision,
		SoftMoon.WebWare.rgb.valuesAsByte,
		SoftMoon.WebWare.rgb.valuesAsPercent,
		SoftMoon.WebWare.rgb.huesByDegrees ]);  }

SoftMoon.WebWare.rgb.popSettings=function()  {
	var s=stack.pop();
	SoftMoon.WebWare.rgb.reflect=s[0];
	SoftMoon.WebWare.rgb.keepPrecision=s[1];
	SoftMoon.WebWare.rgb.valuesAsByte=s[2];
	SoftMoon.WebWare.rgb.valuesAsPercent=s[3];
	SoftMoon.WebWare.rgb.huesByDegrees=s[4];  }



//  for the RGB color model,
//  depending on the flag below,
//  values passed in outside the range of 0-255 are “reflected” or “truncated” back into the correct range.
SoftMoon.WebWare.rgb.reflect=false;

//  for the RGB color model,
//  depending on the flag below,
//  values may be rounded to integers or left as floating-points.
SoftMoon.WebWare.rgb.keepPrecision=false;

//  for the RGB color model,
//  depending on the flag below,
//  you may specify values as •byte (0-255)
//  or •percent/factor (0-100% / 0-1)
//  (see also the flag  valuesAsPercent  below)
//  you can override this flag below
//    • by passing a string that specifies values as percents using the percent  %  symbol
//    • by passing a value v where (0 <= v < 1) (passing "1" by default is near-black, whereas ".99" is near full-color)
//  you may mix value types by overriding the default "true" setting:
//  example:  "rgb(255, 25%, .5)"  =  "rgb(100%, 64, 128)"
//  You may also optionally pass in a maximum byte value (default is 255) as the third argument (used by rgba for the alpha value);
SoftMoon.WebWare.rgb.valuesAsByte=true;
SoftMoon.WebWare.rgb.getByte=getByteValue;  // this is here for user-added color-modelers to access
	// make sure the color’s value is an integer; and in the boundaries of 0-255, if not, “reflect” it back or “truncate”.
function getByteValue(v, byteFlag, bits)  {  if (typeof bits !== 'number')  bits=255;
	if
		((typeof v == 'string'  &&  v.substr(-1)=='%')
		 ||  (!byteFlag
					&&  ( (SoftMoon.WebWare.rgb.valuesAsByte==false
								 &&  ( (SoftMoon.WebWare.rgb.valuesAsPercent==false  &&  v<=1)
										 ||  (SoftMoon.WebWare.rgb.valuesAsPercent  &&  v<=100) ) )
							 ||  parseFloat(v) < 1)))      //   ← ← ←    !!!!  WATCH FOR THIS AUTO-CONVERT TO CAUSE PROBLEMS  !!!!  (make sure byteflag=true if it is a known byte value!)
		v=getFactorValue(v)*bits;
	if (SoftMoon.WebWare.rgb.reflect)  {v=Math.abs(v);  while (v>bits)  {v=Math.abs(bits-(v-bits));}}
	else if (v>bits)  v=bits;
	else if (v<0)  v=0;
	return  SoftMoon.WebWare.rgb.keepPrecision ? v : Math.round(v);  }


//  for RGB (when SoftMoon.WebWare.rgb.valuesAsByte == false), CMY, CMYK, HSL, HSV and HCG color models,
//  depending on the flag below,
//  you may specify values as  •percents (0-100)  or  •factors (0-1)
//  wherefore example  25 = .25 →as→ «percent» = «factor»
//  so for continuing example,  CMY(34, 35, 24) = CMY(.34, .35, .24) →as→ «percent» = «factor»
//  you can override this flag below
//    by passing a string that specifies values as percents using the percent  %  symbol:
//    example:  'hsv(270°, 23%, 45%)'
//  automatic override occurs anytime the value is > 1.
//  therefore in practice, this flag only effects a difference when the value passed in (v) is (0 < v <= 1)
SoftMoon.WebWare.rgb.valuesAsPercent=true;
SoftMoon.WebWare.rgb.getFactor=getFactorValue;
SoftMoon.WebWare.rgb.factorize=factorize;
function getFactorValue(v)  {
	v= (SoftMoon.WebWare.rgb.valuesAsPercent  ||  (typeof v == 'string'  &&  v.substr(-1)==="%"))  ?
		(parseFloat(v)/100)  :  parseFloat(v);
	return (v<0 || v>1) ? false : v;  }
function factorize(a)  {
	for (var i=0; i<a.length; i++)  {if ( (a[i]=getFactorValue(a[i])) === false )  return false;}
	return a;  }

//  for HSL, HSV and HCG color models,
//  depending on the flag below,
//  you may specify hues in •degrees (0°-359.999…°)
//  or •percent/factor (0-100% / 0-1  =  which corresponds to 0°-360°)
//  (see also the flag  valuesAsPercent  above)
//  wherefore example  90 = 25 = .25  →as→  «degrees» = «percent» = «factor»
//  so for continuing example,
//   HSL(90, 35%, 24%) = HSL(25, 35, 24) = HSL(.25, .35, .24)  →as→  «H in degrees» = «all in percent» = «all in factor»
//  you can override this flag below
//   • by passing a string that specifies hues in degrees using the degree  °  symbol:   example:  'hsv(270°, .23, .45)'
//   • by passing a string that specifies hues as percents using the percent  %  symbol: example:  'hsv(75%, .23, .45)'
SoftMoon.WebWare.rgb.huesByDegrees=true;
SoftMoon.WebWare.rgb.getHuePercent=getHuePercent;
function getHuePercent(h)  {
	return ((typeof h == 'string'  &&  (h.substr(-1)==='°'  ||  h.substr(-3).toLowerCase()==='deg'))
	||  (SoftMoon.WebWare.rgb.huesByDegrees  &&  (typeof h != 'string'  ||  h.substr(-1)!=='%')))  ?
//		((Math.sawtooth(parseFloat(h), 360)/3.6)+'%')  :  h;  }   //allows negative values
		(( parseFloat(h)%360 / 3.6 )+'%')  :  h;  }               //error with negative values





// This object’s properties are conversion functions.
// You may add to them………for your convenience
SoftMoon.WebWare.rgb.to=new Object;


// Take an array of RGB data (RGB from 0 to 255), and pass back only the requested format (no leading #)
SoftMoon.WebWare.rgb.to.hex=function(rgb)  {return Math._2hex(rgb[0])+Math._2hex(rgb[1])+Math._2hex(rgb[2]);}


SoftMoon.WebWare.rgb.to.hsb=function(rgb, model)  {  //RGB from 0 to 255   HSV results from 0 to 1 except H may be from 0°-360°
	var delta_max, R, G, B, H, S, V, del_R, del_G, del_B;
	R = ( rgb[0] / 255 );
	G = ( rgb[1] / 255 );
	B = ( rgb[2] / 255 );
	V = Math.max( R, G, B );
	delta_max = V - Math.min( R, G, B );

	if ( delta_max == 0 )  {  //This is a gray, no chroma...
		H = 0;  S = 0;  }
	else  {                  //Chromatic data...
		S = delta_max / V;

		del_R = ( ( ( V - R ) / 6 ) + ( delta_max / 2 ) ) / delta_max;
		del_G = ( ( ( V - G ) / 6 ) + ( delta_max / 2 ) ) / delta_max;
		del_B = ( ( ( V - B ) / 6 ) + ( delta_max / 2 ) ) / delta_max;

		if      ( R == V )  H = del_B - del_G;
		else if ( G == V )  H = ( 1 / 3 ) + del_R - del_B;
		else if ( B == V )  H = ( 2 / 3 ) + del_G - del_R;

		if ( H < 0 ) H += 1;
		if ( H > 1 ) H -= 1;  }

	if (SoftMoon.WebWare.rgb.huesByDegrees)  H = (H*360) + '°';
	return new SoftMoon.WebWare.ColorWheelColor(H,S,V, model ? model.toUpperCase() : 'HSB');  }

SoftMoon.WebWare.rgb.to.hsv=SoftMoon.WebWare.rgb.to.hsb; // = function(rgb) {return this.hsb(rgb, 'HSV');}


SoftMoon.WebWare.rgb.to.hsl=function(rgb)  {  //RGB from 0 to 255   HSV results from 0 to 1 except H may be from 0°-360°
	var R, G, B, high, low, H, S, L, del_high, del_R, del_G, del_B;
	R = ( rgb[0] / 255 );                     //RGB from 0 to 255
	G = ( rgb[1] / 255 );
	B = ( rgb[2] / 255 );

	low = Math.min( R, G, B );    //Min. value of RGB
	high = Math.max( R, G, B );    //Max. value of RGB
	del_high = high - low;             //Delta RGB value

	L = ( high + low ) / 2;

	if ( del_high == 0 )  {                   //This is a gray, no chroma...
		H = 0;                                //HSL results from 0 to 1
		S = 0;  }
	else  {                                  //Chromatic data...
		if ( L < 0.5 ) S = del_high / ( high + low );
		else            S = del_high / ( 2 - high - low );

		del_R = ( ( ( high - R ) / 6 ) + ( del_high / 2 ) ) / del_high;
		del_G = ( ( ( high - G ) / 6 ) + ( del_high / 2 ) ) / del_high;
		del_B = ( ( ( high - B ) / 6 ) + ( del_high / 2 ) ) / del_high;

		if      ( R == high ) H = del_B - del_G;
		else if ( G == high ) H = ( 1 / 3 ) + del_R - del_B;
		else if ( B == high ) H = ( 2 / 3 ) + del_G - del_R;

		if ( H < 0 ) H += 1;
		if ( H > 1 ) H -= 1;  }

	if (SoftMoon.WebWare.rgb.huesByDegrees)  H = (H*360) + '°';
	return new SoftMoon.WebWare.ColorWheelColor(H,S,L, 'HSL');  }


SoftMoon.WebWare.rgb.to.hcg=function(rgb)   {  //RGB from 0 to 255   Hue, Chroma, Gray (HCG) results from 0 to 1 except H may be from 0°-360°
	var r, g, b, high, low, H, C, G, Cfctr, del_r, del_g, del_b;
	r = ( rgb[0] / 255 );
	g = ( rgb[1] / 255 );
	b = ( rgb[2] / 255 );
	high = Math.max( r, g, b );
	low  = Math.min( r, g, b );

	if ( high == low )  {  //This is a gray, no chroma...
		H = 0;  C = 0;  G = high;  }
	else  {                  //Chromatic data...
/* hcg::
						high=1+(G-1)*(1-C)
						high=1+G-G*C+C-1 →↓
																			→→→  →  →  high=low+C
						low=0+(G-0)*(1-C)      ↑
						low=G-G*C   →  →  →  →  G=low+G*C
																					1=low/G+C
																					1-C=low/G
																					(1-C)/low=1/G  →  →  →  low/(1-C)=G
	R=r+(G-r)*(1-C);
	r=R-(G-r)*Cfctr
	r=R-G*Cfctr+r*Cfctr
	r-r*Cfctr=R-G*Cfctr
	r*(1-Cfctr)=R-G*Cfctr
	r=(R-G*Cfctr)/C;
 */
		C=high-low;  Cfctr=1-C;
		if (C==1)  G=.5;  else  G=low/Cfctr;

		del_r=(r-G*Cfctr)/C/6;
		del_g=(g-G*Cfctr)/C/6;
		del_b=(b-G*Cfctr)/C/6;

		if      ( r == high )  H = del_g - del_b;
		else if ( g == high )  H = ( 1 / 3 ) + del_b - del_r;
		else if ( b == high )  H = ( 2 / 3 ) + del_r - del_g;

		if ( H < 0 ) H += 1;
		if ( H > 1 ) H -= 1;  }

	if (SoftMoon.WebWare.rgb.huesByDegrees)  H = (H*360) + '°';
	return new SoftMoon.WebWare.ColorWheelColor(H,C,G, 'HCG');  }


SoftMoon.WebWare.rgb.to.cmyk=function(rgb)  {  //RGB from 0 to 255    CMYK results from 0 to 1
	var C, M, Y, K;
	C = 1 - ( rgb[0] / 255 );
	M = 1 - ( rgb[1] / 255 );
	Y = 1 - ( rgb[2] / 255 );
	K = 1;

	if ( C < K )   K = C;
	if ( M < K )   K = M;
	if ( Y < K )   K = Y;

	if ( K == 1 )  { //Black
		C = 0;
		M = 0;
		Y = 0;  }
	else  {
		C = ( C - K ) / ( 1 - K );
		M = ( M - K ) / ( 1 - K );
		Y = ( Y - K ) / ( 1 - K );  }
	return new SoftMoon.WebWare.CMYKColor(C,M,Y,K);  }




// This object’s properties are conversion functions.
// They return the same Object as does the rgb() function.
// You may add to them………they will be recognized automatically by the rgb function as valid color models
//  (you must use all-lowercase property names to be automatically recognized)
SoftMoon.WebWare.rgb.from=new Object

SoftMoon.WebWare.rgb.from.rgb=function(_rgb_)  {return SoftMoon.WebWare.rgb(_rgb_);}

SoftMoon.WebWare.rgb.from.rgba=function(rgba)  { with (SoftMoon)  { with (WebWare)  { var _rgba=rgba;
	if (rgba instanceof Array
	||  ((rgba=rgba.match(rgb.valuesAsByte ? RegExp.rgba : (rgb.valuesAsPercent ? RegExp.fourPercents : RegExp.fourFactors)))
				&&  (rgba=rgba.slice(1))))  {
		_rgba=rgb(rgba);
		_rgba.a=getByteValue(rgba[3], null, 127);  _rgba.alpha=_rgba.a;  _rgba.rgb[3]=_rgba.a;
		return (_rgba);  }
	else  return rgb.error(_rgba, 'RGBA');  }  }  }


SoftMoon.WebWare.rgb.from.hex=function(h)  { with (SoftMoon)  { with (WebWare)  { var _h
	if (_h=h.match(RegExp.hex))  return rgb(
		parseInt(_h[1].substr(0,2), 16), parseInt(_h[1].substr(2,2), 16), parseInt(_h[1].substr(4,2), 16), true );
	else  return rgb.error(h, 'Hex');  }  }  }


SoftMoon.WebWare.rgb.from.cmy=function(cmy)  { with (SoftMoon)  { with (WebWare)  { var matches;
	//CMY values from 0 to 100%
	//RGB results from 0 to 255
	if (typeof cmy == 'string')
		if (matches=cmy.match(RegExp.threePercents))  cmy=matches.slice(1);
		else  return rgb.error(cmy, 'CMY');
	if ( (cmy=factorize(cmy)) === false )  return rgb.error(cmy, 'CMY');
	return rgb(
		( 1 - cmy[0] ) * 255,
		( 1 - cmy[1] ) * 255,
		( 1 - cmy[2] ) * 255, true );  }  }  }


SoftMoon.WebWare.rgb.from.cmyk=function(cmyk)  { with (SoftMoon)  { with (WebWare)  { var matches;
	//CMYK values from 0 to 100%
	//RGB results from 0 to 255
	if (typeof cmyk == 'string')
		if (matches=cmyk.match(RegExp.cmyk))  cmyk=matches.slice(1);
		else  return rgb.error(cmyk, 'CMYK');
	if ( (cmyk=factorize(cmyk)) === false )  return rgb.error(cmyk, 'CMYK');
	return rgb(
	((1 - ( cmyk[0] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	((1 - ( cmyk[1] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	((1 - ( cmyk[2] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255), true );  }  }  }


SoftMoon.WebWare.rgb.from.hsv=function(hsv)  { with(SoftMoon)  { with(WebWare)  { var matches, h,i, m,n,o, r,g,b;
	//Hues may be as percent/factor or degrees
	//HSV values from 0 to 100%
	//RGB results from 0 to 255
	if (typeof hsv == 'string')
		if (matches=(hsv.match(RegExp.threePercents)  ||  hsv.match(RegExp.hsv)))  hsv=matches.slice(1);
		else  return rgb.error(hsv, 'HSV');
	hsv[0]=getHuePercent(hsv[0]);
	if ( (hsv=factorize(hsv)) === false )  return rgb.error(hsv, 'HSV');
	if ( hsv[1] == 0 )  return rgb( hsv[2] * 255, hsv[2] * 255, hsv[2] * 255 );
	h = hsv[0] * 6
	if ( h >= 6 ) h = 0
	i = Math.floor(h);
	m = hsv[2] * ( 1 - hsv[1] )
	n = hsv[2] * ( 1 - hsv[1] * ( h - i ) )
	o = hsv[2] * ( 1 - hsv[1] * ( 1 - ( h - i ) ) )

	if      ( i == 0 ) { r = hsv[2]; g = o ; b = m }
	else if ( i == 1 ) { r = n ; g = hsv[2]; b = m }
	else if ( i == 2 ) { r = m ; g = hsv[2]; b = o }
	else if ( i == 3 ) { r = m ; g = n ; b = hsv[2]}
	else if ( i == 4 ) { r = o ; g = m ; b = hsv[2]}
	else               { r = hsv[2]; g = m ; b = n }

	return rgb(r * 255, g * 255, b * 255, true);  }  }  }


SoftMoon.WebWare.rgb.from.hsb=SoftMoon.WebWare.rgb.from.hsv;


SoftMoon.WebWare.rgb.from.hsl=function(hsl)  { with(SoftMoon)  { with (WebWare)  { var matches, m,n;
	//Hues may be as percent/factor or degrees
	//HSL values from 0 to 100%
	//RGB results from 0 to 255
	if (typeof hsl == 'string')
		if (matches=(hsl.match(RegExp.threePercents)  ||  hsl.match(RegExp.hsl)))  hsl=matches.slice(1);
		else  return rgb.error(hsl, 'HSL');
	hsl[0]=getHuePercent(hsl[0]);
	if ( (hsl=factorize(hsl)) === false )  return rgb.error(hsl, 'HSL');
	if ( hsl[1] == 0 )  return rgb( [hsl[2] * 255, hsl[2] * 255, hsl[2] * 255] );

	if ( hsl[2] < 0.5 )
		n = hsl[2] * ( 1 + hsl[1] )
	else
		n = ( hsl[2] + hsl[1] ) - ( hsl[1] * hsl[2] )

	m = 2 * hsl[2] - n;

	function hue_to_RGB( v1, v2, vH )  {
		if ( vH < 0 ) vH += 1
		if ( vH > 1 ) vH -= 1
		if ( ( 6 * vH ) < 1 ) return v1 + ( v2 - v1 ) * 6 * vH;
		if ( ( 2 * vH ) < 1 ) return v2;
		if ( ( 3 * vH ) < 2 ) return v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6;
		return v1;  }
	return rgb(
		255 * hue_to_RGB( m, n, hsl[0] + ( 1 / 3 ) ),
		255 * hue_to_RGB( m, n, hsl[0] ),
		255 * hue_to_RGB( m, n, hsl[0] - ( 1 / 3 ) ), true );  }  }  }



/*   HCG & HCGC  →  Hue, Chroma, Gray, Curve
 *   HCG is similar to HSL & HSV, based on a 3D cylindrical RGB system with Hue calculated the same way,
 *  & Chroma calculated in the same fashion as Saturation,
 *  with Hue as the angle around the cylinder (red at 0°, green at 120°, blue at 240°),
 *  and Chroma/Saturation the linear (radial) distance from the central axis.
 *   HCGC is a 4D cylindrical RGB system which “curves” the Chroma rate toward or away from the central axis.
 *   If you were to run the HCG, HSL, or HSV cylinders through a meat-slicer, you would get roughly 2D circles,
 *  whereas if you could “slice” an HCGC 4D-cylinder, you would get ½ the surface of a 3D “spherical” object.
 *  With Curve = 1, the surface is of a true sphere.  The “view” of this slice is as from above, similar to a 2D slice.
 *   As viewed, you can not tell the “height” dimension of the slice, so the progression of Chroma appearance
 *  occurs exponentially in tangent with the sine-function.
 *   With Curve < 1, the surface “caves in”, but leaving the center height the same, “sharpening” this center point,
 *  to a long sharp-pointed “spear” quickly curving to a disk at the other end end when Curve becomes very small (¡always! > 0).
 *   With Curve > 1, the surface “bulges out”, again leaving the center height the same, “blunting” this center point.
 *  As viewed from the top, this changes the appearance of the progression of the Chroma rate.
 *   As opposed to HSV & HSL, in HCG & HCGC the Chroma is the linear progression of the RGB values
 *  from the pure Hue to the Gray shade (only in HCGC the Chroma line is laid over the curved surface).
 *  At the center of these cylinders, Gray is always a black-grayscale-white (R=G=B).
 *  However with HCG & HCGC, Gray is a function of Chroma (think Saturation),
 *  whereas with HSV & HSL, Saturation is a function of Value (Brightness) or Lightness.
 *  This means that the edges of an HCG or HCGC cylinder remain consistent throughout the height of the cylinder,
 *  as opposed to the HSV & HSL cylinders in which the “shade” of the Hue varies with the height.
 *  The center of the cylinders progresses from black at the bottom thought grayscale to white at the top in
 *  in all four color-space models (HSV, HSL, HCG, HCGC), and therefore the center of each is the “Gray-shade” value.
 */
var r, g, b;
SoftMoon.WebWare.rgb.from.hcg=function(hcg)   { with(SoftMoon)  { with (WebWare)  { var matches;
	//Hues may be as percent/factor or degrees
	//HCG values from 0 to 100%
	//RGB results from 0 to 255
	if (typeof hcg == 'string')
		if (matches=(hcg.match(RegExp.threePercents)  ||  hcg.match(RegExp.hcg)))  hcg=matches.slice(1);
		else  return rgb.error(hcg, 'hcg');
	hcg[0]=getHuePercent(hcg[0]);
	if ( (hcg=factorize(hcg)) === false )  return rgb.error(hcg, 'hcg');
	if ( hcg[1] == 0 )  return rgb( [hcg[2]*255, hcg[2]*255, hcg[2]*255] );
	rgb_from_hue(hcg[0]);
	r=r+(hcg[2]-r)*(1-hcg[1]);
	g=g+(hcg[2]-g)*(1-hcg[1]);
	b=b+(hcg[2]-b)*(1-hcg[1]);
	return rgb(r*255, g*255, b*255, true);  }  }  }



//¡note this NOT a method of rgb.from! returns a raw rgb Array, not an RGBColor Object
SoftMoon.WebWare.rgb_from_hue=function(hFactor)  { //  0 <= hFactor < 1
	var h = hFactor * 6;
	if ( h >= 6 )  h = 0;
	var x = h%1;
	if (h<1)  {r=1; g=x; b=0;}
	else
	if (h<2)  {r=1-x; g=1; b=0;}
	else
	if (h<3)  {r=0; g=1; b=x;}
	else
	if (h<4)  {r=0; g=1-x; b=1;}
	else
	if (h<5)  {r=x; g=0; b=1;}
	else
	if (h<6)  {r=1; g=0; b=1-x;}

	return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];  }


//untested
SoftMoon.WebWare.rgb.from.xyz=function(xyz)   { with(SoftMoon)  { with (WebWare)  { var matches, i;
//X from 0 to  95.047   (Observer = 2°, Illuminant = D65)
//Y from 0 to 100.000
//Z from 0 to 108.883
//var_X = X / 100
//var_Y = Y / 100
//var_Z = Z / 100
	if (typeof xyz == 'string')  {
		if (SoftMoon.WebWare.rgb.valuesAsByte)  {
			try {
			matches=xyz.split(',');
			for (i=0; i<3; i++)  {
				matches[i]=matches[i].replace( /^\s+/ , "");  matches[i]=matches[i].replace( /\s+$/ , "");
				if (matches[i].substr(-1)==='%')  {
					if ((matches[i]=factorize(matches[i])) === false )  return rgb.error(xyz, 'XYZ');
					matches[i]*= (i==0) ? .95047 : ((i==2) ? 1.08883 : 1);  }
				else  {
					if (matches[i].match( /^([0-9]+)|([0-9]*\.[0-9]+)$/ ))  matches[i]=parseFloat(matches[i])/100;
					else  return rgb.error(xyz, 'XYZ');
					if (matches[i]<0  ||  matches[i] > (i==0) ? .95047 : ((i==1) ? 1 : 1.08883))
						return rgb.error(xyz, 'XYZ');  }  }
			xyz=matches;  }
			catch (e)  {return rgb.error(xyz, 'XYZ');}  }
		else  {
			if (matches=xyz.match(RegExp.threePercents))  xyz=matches.slice(1);
			else  return rgb.error(xyz, 'XYZ');
			if ( (xyz=factorize(xyz)) === false )  return rgb.error(xyz, 'XYZ');
			xyz[0]*=.95047;  xyz[2]*=1.08883;  }  }
	var r, g, b, e=1/2.4;
	r = xyz[0] *   3.2406  + xyz[1] * (-1.5372) + xyz[2] * (-0.4986);
	g = xyz[0] * (-0.9689) + xyz[1] *   1.8758  + xyz[2] *   0.0415;
	b = xyz[0] *   0.0557  + xyz[1] * (-0.2040) + xyz[2] *   1.0570;
	if ( r > 0.0031308 ) r = 1.055 * Math.pow(r, e) - 0.055;
	else                 r = 12.92 * r;
	if ( g > 0.0031308 ) g = 1.055 * Math.pow(g, e) - 0.055;
	else                 g = 12.92 * g;
	if ( b > 0.0031308 ) b = 1.055 * Math.pow(b, e) - 0.055;
	else                 b = 12.92 * b;
	return rgb(r*255, g*255, b*255, true);  }  }  }


})();   //  close wrapper for private methods and variables and execute the wrapper function.


//  most (except hcg) thanks to and see for more formulas:  http://www.easyrgb.com/index.php?X=MATH

//  character encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160

// RGB_Calc.js  release 1.2  February 22, 2022  by SoftMoon WebWare.
// based on  rgb.js  Beta-1.0 release 1.0.3  August 1, 2015  by SoftMoon WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2016, 2018, 2020, 2022 Joe Golembieski, SoftMoon WebWare

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

// requires  “+++.js”  in  JS_toolbucket/+++.js/
// requires  “+++Math.js”  in  JS_toolbucket/+++.js
// requires   “HTTP.js”  in  JS_toolbucket/SoftMoon-WebWare/    ← only when downloading color-palette tables from the web via ajax.  They may be included in other ways.

'use strict';

if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')   SoftMoon.WebWare=new Object;


// this is the palette that is checked first, without needing a palette identifier.
// with the default value given:
/* var rgb = new SoftMoon.WebWare.RGB_Calc;
 *  rgb('green').hex === rgb('HTML: green').hex
 */
if (!SoftMoon.defaultPalette)  SoftMoon.defaultPalette='HTML';

if (typeof SoftMoon.palettes !== 'object')  SoftMoon.palettes=new Object;




SoftMoon.WebWare.Palette=function Palette($meta)  {
	// NOTE how the palette data gets set to the prototype.
	// This allows the host environment to further process the data, while retaining the original.
	// For instance, you could reduce colors’ string values down to native Arrays, for the fastest future access.
	// MasterColorPicker palettes may have “marks” (used to format the HTML tables)
	//  that need to be removed by that application for RGB_Calc to interpret the color data.
	if (!new.target)  throw new Error('SoftMoon.WebWare.Palette is a class constructor, not a function.');
	Object.defineProperty(this, "palette",  {value: Object.create($meta.palette),  enumerable: true});
	for (const c in this.palette)  {
		if (this.palette[c].palette)  this.palette[c]=new Palette(this.palette[c]);  }
	if ('requireSubindex' in $meta)
		Object.defineProperty(this, "requireSubindex",  {value: Boolean.eval($meta.requireSubindex, true),  enumerable: true});
	for (const prop of Palette.properties)  {
		if ($meta[prop])  Object.defineProperty(this, prop, {value: $meta[prop], enumerable: true});  }
	var config=Object.create(Palette.defaultConfig);
	if ($meta.config)  for (c in $meta.config)  {config[c] = Object.getOwnPropertyDescriptor($meta.config, c);}
	Object.defineProperty(this, "config",  {value: config,  enumerable: true});
	if (typeof $meta.getColor === 'function')
		Object.defineProperty(this, "getColor", {value: $meta.getColor,  enumerable: true});  }


Object.defineProperty(
	SoftMoon.WebWare.Palette.prototype, "getColor", {
		writable: true,
		enumerable: true,
		configurable: false,
		value: function getColor($clr, $requireSubindex=true)  { var matches;
			$clr=$clr.trim().toLowerCase();
			if ('requireSubindex' in this)  $requireSubindex=this.requireSubindex;
			for (const c in this.palette)  {
				if (!this.palette[c].palette)  {
					if (c.trim().toLowerCase()===$clr)  return this.palette[c];
					else  continue;  }
				if ((matches=($clr.match(RegExp.stdWrappedColor)  ||  $clr.match(RegExp.stdPrefixedColor)))
				&&  c.toLowerCase()===matches[1].toLowerCase())
					return this.palette[c].getColor  ?
							this.palette[c].getColor(matches[2], $requireSubindex)
					 :  getColor.call(this.palette[c], matches[2], $requireSubindex);
				if (!$requireSubindex
				&&  (matches= this.palette[c].getColor  ?
									this.palette[c].getColor($clr, $requireSubindex)
							 :  getColor.call(this.palette[c], $clr, $requireSubindex)))
					return matches;  }
			return null;  }  });

SoftMoon.WebWare.Palette.defaultConfig={   // see  RGB_Calc.ConfigStack.prototype  for details…
	//this object is a “propertiesDescriptor” for creating a new ConfigStack entry
	//note that palette meta-data defines the config as a “normal” Object, not a “propertiesDescriptor”
	inputAsFactor: {value: false,  enumerable:true, writable:true, configurable:true},
	hueAngleUnit:  {value: 'deg',  enumerable:true, writable:true, configurable:true}  }

// this can be filled with property names for configuration values of a palette that the implementation requires.
SoftMoon.WebWare.Palette.properties=[];

// This function will return an initially empty array, with two added properties:  connector,  paletteIndexConnection.
// Once the index is asynchronously loaded via HTTP, the array will fill with HTTP-connect objects, one for each palette being loaded.
// Each HTTP-connect object has a property  .trying  which will become false once that palette is loaded (or if loading fails)
SoftMoon.WebWare.loadPalettes=function loadPalettes(   // ←required  ↓all optional on next line
		$path, $onIndexLoad, $addPalette, $loadError, $onMultiple, $maxAttempts, $timeoutDelay, $logError)  {
//If the server offers multiple choices for a file, this may require human interaction or otherwise.
//You may pass in a custom function  $onMultiple  to handle that.  You may pass in  HTTP.handleMultiple  for basic human intervention.
//See the SoftMoon.WebWare.HTTP file for more info.
	if (typeof $path !== 'string'  ||  $path==="")  $path=SoftMoon.colorPalettes_defaultPath;
	if (typeof $addPalette !== 'function')  $addPalette=SoftMoon.WebWare.addPalette;
	var connections=new Array,
			connector=new SoftMoon.WebWare.HTTP($maxAttempts, $timeoutDelay),
			paletteIndexConnection=SoftMoon.WebWare.HTTP.Connection($path, 'Can not access color palettes: no HTTP service available.', $logError);
	if (paletteIndexConnection === null)  return false;
	paletteIndexConnection.onFileLoad=function()  {
		if (typeof this.responseText !== 'string'  ||  this.responseText==="")  connections.noneGiven=true;
		else  for (var paletteIndex=this.responseText.split("\n"), i=0; i<paletteIndex.length; i++)  {
			if ( paletteIndex[i]!==""
			&&  ( !paletteIndex[i].match(loadPalettes.userPaletteMask)
				 ||  paletteIndex[i].match(loadPalettes.autoloadPaletteMask) ) )  {
				connections[i]=SoftMoon.WebWare.HTTP.Connection(paletteIndex[i]);
				connections[i].onFileLoad=$addPalette;
				connections[i].loadError=$loadError;
				connections[i].onMultiple=$onMultiple;
				connector.commune(connections[i]);  }  }
		if (typeof $onIndexLoad === 'function')  $onIndexLoad(connections, paletteIndex, this.responseText);  };
	paletteIndexConnection.loadError=$loadError;
	paletteIndexConnection.onMultiple=$onMultiple;
	connections.connector=connector;
	connections.paletteIndexConnection=paletteIndexConnection;
	connector.commune(paletteIndexConnection);
	return connections;  }
SoftMoon.WebWare.loadPalettes.userPaletteMask= /\/users\//
SoftMoon.WebWare.loadPalettes.autoloadPaletteMask= /\/autoload\//

if (!SoftMoon.colorPalettes_defaultPath)  SoftMoon.colorPalettes_defaultPath='color_palettes/';

SoftMoon.WebWare.addPalette=function($json_palette)  {
	var json_palette = this.responseText  ||  $json_palette;
	// JSON.parse will not allow for custom methods; eval can be dangerous and slow and “unstrict”, but may be necessary for your implementation.
//	if (typeof json_palette == 'string')  json_palette=eval("("+json_palette+")");
	if (typeof json_palette === 'string')  json_palette=JSON.parse(json_palette);
	if (typeof json_palette === 'object')
		for (const paletteName in json_palette)  {
			SoftMoon.palettes[paletteName]= new SoftMoon.WebWare.Palette(json_palette[paletteName]);
			json_palette[paletteName]=SoftMoon.palettes[paletteName];  }
	else  throw new TypeError('Can not add SoftMoon.palette: ',json_palette);
	return json_palette;  }



//=================================================================================================\\


;(function()  { //open a private namespace


const RegExp = SoftMoon.RegExp || window.RegExp;

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
RegExp.stdWrappedColor= new window.RegExp( /^\s*([^(:]+)\s*\(\s*(.+)\s*\)\s*$/ );
RegExp.stdPrefixedColor= new window.RegExp( /^\s*([^(:]+)\s*\:\s*(.+)\s*$/ );


//  For each of these RegExps below, the match returned will contain an array of the values,
// or the hex value without the leading # for RegExp.hex
//  matches=myString.match(RegExp.«model»)     where  «model» is the color-model type (hex, rgb, etc…)
// yields  matches = [0:complete match,  1:first value, 2:second value, 3:third value, etc…]
//  or if «model» is hex:
// yields  matches = [0:complete match,  1:six-digit hex value (without the leading #)]


/* hex:    where  x  is a hexadecimal digit 0-9 A-F  (case insensitive)
 *  and leading # symbol is optional & is ignored along with leading and trailing whitespace.
 */
//  "xxx"  ‖  "xxxx"  ‖  "xxxxxx"  ‖  "xxxxxxxx"      ‖  "xxxxx"  ‖  "xxxxxxx"  ←the last two matches shown (5 & 7 digits) are not valid Hex-rgb formats
RegExp.isHex= new window.RegExp( /^\s*#?[0-9A-F]{3,8}\s*$/i );

//  "xxxxxx"  ← matches: [1]→all 6 digits
RegExp.hex= new window.RegExp( /^\s*#?([0-9A-F]{6})\s*$/i );

//  "xxxxxx"  ‖  "xxxxxxxx"  ← matches: [1]→all 8 digits  [2]→first 6 digits  [3]→first 2 digits  [4]→next 2 digits  …etc… [5] [6]
RegExp.hex_a= new window.RegExp( /^\s*#?((([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2}))([0-9A-F]{2})?)\s*$/i );

//  "xxxxxxxx"  ← matches: [1]→all 8 digits
RegExp.hexa= new window.RegExp( /^\s*#?([0-9A-F]{8})\s*$/i );

//  "xxx"  ← matches: [1]→all 3 digits
RegExp.hex3= new window.RegExp( /^\s*#?([0-9A-F]{3})\s*$/i );

//  "xxx"  ‖  "xxxx"  ← matches: [1]→all 4 digits  [2]→first 3 digits  [3]→fourth digit
RegExp.hex_a4= new window.RegExp( /^\s*#?(([0-9A-F]{3})([0-9A-F])?)\s*$/i );

//  "xxxx"  ← matches: [1]→all 4 digits
RegExp.hexa4= new window.RegExp( /^\s*#?([0-9A-F]{4})\s*$/i );


/* All the following RegExp patterns capture each individual value in the match.
 * For example: ".34, 45%, 56.7%" matches RegExp.threeFactors
 * and the result is matches: [1]→".34"  [2]→"45%"  [3]→"56.7%"
 * All patterns who’s name ends with “a” or “A” also match an alpha value.
 * The alpha value must conform to the “factor” definition.
 * When the pattern’s name ends with “_a” or “_A” the alpha value is optional.
 * The alpha value will also be captured as the last value of the match array.
 */


const sep='[, ]', aSep='(?:,| / | )';

//var f='\\s*0*((?:0|1|\\.[0-9]+)|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*';    //no leading zeros in factors <1  (extras truncated)
//var f='\\s*0*?((?:0|1|0?\\.[0-9]+)|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*';  //one leading zero allowed in factors <1  (extras truncated)
const pVal='100|[0-9]{1,2}(?:\\.[0-9]*)?|0?\\.[0-9]+',  //one leading zero allowed in percents <1
			f='\\s*0*((?:0|1|0?\\.[0-9]+)|(?:(?:' + pVal + ')%))\\s*?';  //one leading zero allowed in factors <1  (extras truncated)

// this is for capturing a “non-standard” alpha application on a named color.
// it must have the trailing semicolon:   blue, 30%;     ansi: 26 / .3;
RegExp.addOnAlpha=new window.RegExp( '^(.+?)(?:' + aSep + f + '(?: opacity)?;\\s*)?$');
RegExp.Hue_A=new window.RegExp( '^(.+?)(?:' + aSep + f + '\\s*)?$');

							//   "v¹, v², v³"  where:
							//    (0 <= (float)vⁿ <= 1)  or
							//    (0% <= (float)vⁿ <= 100%)  →  vⁿ must end with a percent sign %
RegExp.threeFactors=new window.RegExp( '^' +f +sep+ f +sep+ f+ '$' );
RegExp.fourFactors=new window.RegExp( '^' +f +sep+ f +sep+ f +sep+ f+ '$' );
RegExp.threeFactors_A=new window.RegExp( '^' +f +sep+ f +sep+ f+ '(?:' +aSep+ f+ ')?$' );
RegExp.fourFactors_A=new window.RegExp( '^' +f +sep+ f +sep+ f +sep+ f+ '(?:' +aSep+ f+ ')?$' );

const byteVal='1?[0-9]{1,2}|2[0-4][0-9]|25[0-5]',
			_byte_= '(' + byteVal + ')',
			_percent_= '((?:' + pVal + ')%)',
			rgb='\\s*0*((?:' + byteVal + ')|(?:(?:' + pVal + ')%))\\s*?';

							//   "v¹, v², v³"  where:  (0 <= (int)vⁿ <= 255)
RegExp.threeBytes=new window.RegExp( '^' +_byte_ +sep+ _byte_ +sep+ _byte_+ '$' );
RegExp.threeBytesA=new window.RegExp( '^' +_byte_ +sep+ _byte_ +sep+ _byte_+ +aSep+ f+ '$' );
RegExp.threeBytes_A=new window.RegExp( '^' +_byte_ +sep+ _byte_ +sep+ _byte_+ '(?:' +aSep+ f+ ')?$' );
							//   "v¹, v², v³"  where   0% <= (float)vⁿ <= 100%  →  vⁿ must end with a percent sign %
RegExp.threePercents=new window.RegExp( '^' +_percent_ +sep+ _percent_ +sep+ _percent_+ '$' );
RegExp.threePercentsA=new window.RegExp( '^' +_percent_ +sep+ _percent_ +sep+ _percent_+ aSep+ f+ '$' );
RegExp.threePercents_A=new window.RegExp( '^' +_percent_ +sep+ _percent_ +sep+ _percent_+ '(?:' +aSep+ f+ ')?$' );

							//rgb:   "v¹, v², v³"  where:
							//    (0 <= (int)vⁿ <= 255)  or
							//    (0% <= (float)vⁿ <= 100%)  →  vⁿ must end with a percent sign %
RegExp.rgb=new window.RegExp( '^' +rgb+ sep +rgb+ sep +rgb+ '$' );
RegExp.rgba=new window.RegExp( '^' +rgb+ sep +rgb+ sep +rgb+ aSep + f + '$' );
RegExp.rgb_a=new window.RegExp( '^' +rgb+ sep +rgb+ sep +rgb+ '(?:' +aSep + f + ')?$' );

//var p='\\s*0*((?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%?)\\s*';   //no leading zeros in factors <1  (extras truncated)
const p='\\s*0*?((?:' + pVal + ')%?)\\s*';  //one leading zero allowed in factors <1  (extras truncated)

							//cmy:   "v¹, v², v³"  where   0 <= (float)vⁿ <= 100  →  vⁿ may or may not end with a percent sign %
RegExp.threeDfltPercents=
RegExp.cmy= new window.RegExp( '^' +p+ sep +p+ sep +p+ '$' );
RegExp.cmya= new window.RegExp( '^' +p+ sep +p+ sep +p+ aSep + f + '$' );
RegExp.cmy_a= new window.RegExp( '^' +p+ sep +p+ sep +p+ '(?:' +aSep + f + ')?$' );
							//cmyk:   "v¹, v², v³, v4"  where   0 <= (float)vⁿ <= 100  →  vⁿ may or may not end with a percent sign %
RegExp.fourDfltPercents=
RegExp.cmyk= new window.RegExp( '^' +p+ sep +p+ sep +p+ sep +p+ '$' );
RegExp.cmyka= new window.RegExp( '^' +p+ sep +p+ sep +p+ sep +p+ aSep + f + '$' );
RegExp.cmyk_a= new window.RegExp( '^' +p+ sep +p+ sep +p+ sep +p+ '(?:' +aSep + f + ')?$' );

const h_=  '\\s*(-?[0-9]+(?:\\.[0-9]*)?|-?0?\\.[0-9]+)(deg|°|g?rad|ʳ|ᴿ|ᶜ|ᴳ|ᵍ|%|turn|●)?\\s*',    //captures the postfix text (i.e. the “unit”) separately  →  m[1]='123' , m[2]='deg'
			h='\\s*((?:-?[0-9]+(?:\\.[0-9]*)?|-?0?\\.[0-9]+)(?:deg|°|g?rad|ʳ|ᴿ|ᶜ|ᴳ|ᵍ|%|turn|●)?)\\s*';  //does not capture postfix text separately: it is included with the numerical data  →  m[1]='123deg'
							//hsl,hsv,hsb,hcg:   "v¹, v², v³"  where
							// v¹=(±float)(unit),   and  ( 0 <= (float)(v²,v³) <= 100 )
							// →→→ v¹ may or may not have (unit);  v²,v³ may or may not end with a percent sign %
RegExp.hsl=
RegExp.hsv=
RegExp.hsb=
RegExp.hcg=
RegExp.ColorWheelColor=new window.RegExp( '^' +h+ sep +p+ sep +p+ '$' );
RegExp.hsla=
RegExp.hsva=
RegExp.hsba=
RegExp.hcga=
RegExp.ColorWheelColorA=new window.RegExp( '^' +h+ sep +p+ sep +p+ aSep +f+ '$' );
RegExp.hsl_a=
RegExp.hsv_a=
RegExp.hsb_a=
RegExp.hcg_a=
RegExp.ColorWheelColor_A=new window.RegExp( '^' +h+ sep +p+ sep +p+ '(?:' +aSep +f+ ')?$' );
RegExp.Hue=
RegExp.angle= new window.RegExp( '^' +h_+ '$' );



//=================================================================================================\\




/*
	This is meant to be a universal object that can be
	 compatibly passed through different libraries without hassle………♪♫ hopefully ♫♪ ☻☺☻☺ ♦♥♣♠♂♀ ☺☻☺☻
*/
SoftMoon.WebWare.RGBA_Color=RGBA_Color;
function RGBA_Color($r, $g, $b, $a, $config)  {
	if (!new.target)  throw new Error('SoftMoon.WebWare.RGBA_Color is a constructor, not a function.');
	this.config= new RGB_Calc.ConfigStack(this, $config);
	this.config.stringFormat=SoftMoon.WebWare.RGBA_Color.prototype.toString.defaultFormat;
	const ThisColorObject=this,
			rgb=new Array,
			rgba=new Array;
	if (typeof $a !== 'number')  $a=this.config.defaultAlpha;
	Object.defineProperties(rgb, {
		0: {get: function() {return $r;},  set: function($red) {$r=ThisColorObject.getByte($red);},  enumerable: true},
		1: {get: function() {return $g;},  set: function($grn) {$g=ThisColorObject.getByte($grn);},  enumerable: true},
		2: {get: function() {return $b;},  set: function($blu) {$b=ThisColorObject.getByte($blu);},  enumerable: true}  });
	Object.defineProperties(rgba, {
		0: {get: function() {return $r;},  set: function($red) {$r=ThisColorObject.getByte($red);},  enumerable: true},
		1: {get: function() {return $g;},  set: function($grn) {$g=ThisColorObject.getByte($grn);},  enumerable: true},
		2: {get: function() {return $b;},  set: function($blu) {$b=ThisColorObject.getByte($blu);},  enumerable: true},
		3: {get: function() {return $a;},  set: function($alf) {$a=ThisColorObject.getAlpha($alf);},  enumerable: true}  });
	//Object.seal(rgb);  Object.seal(rgba);
	function readArr($arr)  { $r=this.getByte($arr[0]);  $g=this.getByte($arr[1]);  $b=this.getByte($arr[2]);
		if (typeof $arr[3] === 'number')  $a=this.getByte($arr[3]);  }
	Object.defineProperties(this, {
		rgb:  {get: function() {return rgb;},  set: readArr,  enumerable: true},
		rgba: {get: function() {return rgba;}, set: readArr,  enumerable: true},
		r:     {get: function() {return $r;},  set: function($red) {$r=this.getByte($red);},  enumerable: true},
		g:     {get: function() {return $g;},  set: function($grn) {$g=this.getByte($grn);},  enumerable: true},
		b:     {get: function() {return $b;},  set: function($blu) {$b=this.getByte($blu);},  enumerable: true},
		a:     {get: function() {return $a;},  set: function($alf) {$a=this.getAlpha($alf);},  enumerable: true},
		red:   {get: function() {return $r;},  set: function($red) {$r=this.getByte($red);},  enumerable: true},
		grn:   {get: function() {return $g;},  set: function($grn) {$g=this.getByte($grn);},  enumerable: true},
		blu:   {get: function() {return $b;},  set: function($blu) {$b=this.getByte($blu);},  enumerable: true},
		green: {get: function() {return $g;},  set: function($grn) {$g=this.getByte($grn);},  enumerable: true},
		blue:  {get: function() {return $b;},  set: function($blu) {$b=this.getByte($blu);},  enumerable: true},
		alpha: {get: function() {return $a;},  set: function($alf) {$a=this.getAlpha($alf);},  enumerable: true},
		hex: {get: function() { return (this.config.useHexSymbol ? '#':"") + Math._2hex($r)+Math._2hex($g)+Math._2hex($b) +
							((typeof $a === 'number')  ?  Math._2hex($a*255) : "");  },
					set: function($h) { if ($h=$h.match(RegExp.hex_a))  {
							$r=parseInt($h[3], 16);  $g=parseInt($h[4], 16);  $b=parseInt($h[5], 16);
							if ($h[6])  $a=parseInt($h[6], 16)/255;  }  },
					enumerable: true},
		contrast: {get: contrastRGB.bind(ThisColorObject, rgb),  enumerable: true},
		shade: {get: shadeRGB.bind(ThisColorObject, rgb),  enumerable: true},
		to: {enumerable: true,  value: Object.defineProperties(new Object, {
			hsv:  {get:  toHSV.bind(ThisColorObject, rgb),  enumerable: true},
			hsb:  {get:  toHSB.bind(ThisColorObject, rgb),  enumerable: true},
			hsl:  {get:  toHSL.bind(ThisColorObject, rgb),  enumerable: true},
			hcg:  {get:  toHCG.bind(ThisColorObject, rgb),  enumerable: true},
			cmyk: {get: toCMYK.bind(ThisColorObject, rgb),  enumerable: true}  })}  });
	};

Object.defineProperties(RGBA_Color.prototype, {
		getByte: {value: getByteValue},
		getAlpha: {value: getAlphaFactor}  });

RGBA_Color.prototype.useHexSymbol=function(flag)  {this.config.useHexSymbol=Boolean.eval(flag, true);  return this;}

RGBA_Color.prototype.toString=function(format) {
	if (typeof format !== 'string')  format="";
	format+= " "+this.config.stringFormat;
	const alpha= (typeof this.a === 'number'  ||  (format.match( /alpha/i )  &&  (this.a=this.config.defaultAlpha||1)))  ?  'A' : "";
	var s, outAs=format.match( /hex|css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
	if (outAs) outAs=outAs[0].toLowerCase();
	if (outAs!=='hex')  {
		if (format.match( /percent/i )  &&  !format.match( /byte.*percent/i ))
			s=Math.roundTo(this.r/2.55, 1)+'%, '+
				Math.roundTo(this.g/2.55, 1)+'%, '+
				Math.roundTo(this.b/2.55, 1)+'%'+
				(alpha ? (', '+Math.roundTo(this.a*100, 3)+'%') : "");
		else
		if (format.match( /factor/i )  &&  !format.match( /byte.*factor/i ))
			s=Math.roundTo(this.r/255, 3)+', '+
				Math.roundTo(this.g/255, 3)+', '+
				Math.roundTo(this.b/255, 3)+
				(alpha ? (', '+Math.roundTo(this.a, 3)) : "");
		else
			s=Math.round(this.r)+', '+
				Math.round(this.g)+', '+
				Math.round(this.b)+
				(alpha ? (', '+
							(format.match( /factor/i )  &&  !format.match( /percent.*factor/i ) ?
									Math.roundTo(this.a, 3)
								: Math.roundTo(this.a*100, 1)+'%'))
						: "");  }
	switch (outAs)  {
	case 'hex':  return (format.indexOf('#')>=0 && !this.config.useHexSymbol ? "#" : "") + this.hex;;
	case 'css':
	case 'html':
	case 'wrap':
	case 'function':  return 'RGB'+alpha+'('+s+')';
	case 'prefix':    return 'RGB'+alpha+': '+s;
	case 'csv':
	case 'commas':  return s;
	case 'plain':  return s.replace( /,/g , "");
	case 'tabbed':  return s.replace( /, /g , "\t");
	case 'self':
	default:  return 'RGBA_Color: ('+s+')';  }  }
RGBA_Color.prototype.toString.defaultFormat='self';



SoftMoon.WebWare.ColorWheel_Color=ColorWheel_Color;
function ColorWheel_Color($H, $1, $2, $A, $model, $config)  {
	if (!new.target)  throw new Error('ColorWheel_Color is a constructor, not a function.');
	if (arguments.length===1)  $config=arguments[0];
	this.config= new RGB_Calc.ConfigStack(this, $config);
	switch ($model)  {
		case 'HSV':
		case 'HSB':  	return HSVA_Color.call(this, $H, $1, $2, $A, undefined, $model);
		case 'HSL':  	return HSLA_Color.call(this, $H, $1, $2, $A);
		case 'HWB':  	return HWBA_Color.call(this, $H, $1, $2, $A);
		case 'HCG':  	return HCGA_Color.call(this, $H, $1, $2, $A);  }  }

Object.defineProperties(ColorWheel_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor}  });

ColorWheel_Color.prototype.toString=function(format)  {
	if (typeof format !== 'string')  format="";
	format+= " "+this.config.stringFormat;
	const arr=this[this.model.toLowerCase()],
				sep= this.model.toLowerCase()==='hwb' ? ' ' : ', ',
				aSep= this.model.toLowerCase()==='hwb' ? ' / ' : ', ';
	var alpha= (typeof this.a === 'number'  ||  (format.match( /alpha/i )  &&  (this.alpha=this.config.defaultAlpha||1)))  ?  'A' : "",
			s, hueAngleUnit=this.config.hueAngleUnit;
	if (s=format.match( /deg|°|g?rad|ᴿ|ᶜ|ᵍ|%|turn|●|factor/ ))  hueAngleUnit=s[0];
	if (hueAngleUnit==='factor')  hueAngleUnit='turn';
	if (typeof this.config.useAngleUnitSymbol === 'boolean')
		switch (hueAngleUnit)  {
		case 'deg':
		case "°":  hueAngleUnit= this.config.useAngleUnitSymbol ? "°" : 'deg';
		break;
		case 'rad':
		case "ᶜ":
		case "ᴿ":
		case "ʳ":  hueAngleUnit= this.config.useAngleUnitSymbol ? "ᴿ" : 'rad';
		break;
		case 'grad':
		case "ᵍ":
		case "ᴳ":   hueAngleUnit= this.config.useAngleUnitSymbol ? "ᵍ" : 'rad';
		break;
		case 'turn':
		case "●":  hueAngleUnit= this.config.useAngleUnitSymbol ? "●" : 'turn';  }
	s=Math.roundTo(this.hue*hueAngleUnitFactors[hueAngleUnit], hueUnitPrecision[hueAngleUnit]) + hueAngleUnit + sep;
	if (format.match( /factor/ )  &&  !format.match( /percent.*factor/ ) )
		s+=Math.roundTo(arr[1], 3) + sep + Math.roundTo(arr[2], 3) + (alpha && aSep+Math.roundTo(this.alpha, 3));
	else
		s+=Math.roundTo(arr[1]*100, 1) + '%' + sep + Math.roundTo(arr[2]*100, 1) + '%' + (alpha && aSep+Math.roundTo(this.alpha*100, 1)+'%');
	if (this.model.toLowerCase()==='hwb')  alpha="";  // ¡curses to the folks who de-standardized this specification!
	switch ((format=format.match( /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i ))  &&  format[0].toLowerCase())  {
	case 'css':
	case 'html':
	case 'wrap':
	case 'function':  return this.model.toUpperCase()+alpha+'('+s+')';;
	case 'prefix':    return this.model.toUpperCase()+alpha+': '+s
	case 'csv':
	case 'commas':  return s;
	case 'plain':  return s.replace( /,/g , "");
	case 'tabbed':  return s.replace( /, /g , "\t");
	case 'self':
	default:  return this.model.toUpperCase()+'_Color: ('+s+')';  }  }

var hueUnitPrecision=
ColorWheel_Color.hueUnitPrecision=
	Object.defineProperties(new Object, {
		'deg':  {value: 2, enumerable: true},
		"°":    {value: 2, enumerable: true},
		'grad': {value: 2, enumerable: true},
		'ᴳ':    {value: 2, enumerable: true},
		'ᵍ':    {value: 2, enumerable: true},
		'rad':  {value: 5, enumerable: true},
		"ᶜ":    {value: 5, enumerable: true},
		"ᴿ":    {value: 5, enumerable: true},
		"ʳ":    {value: 5, enumerable: true},
		"%":    {value: 4, enumerable: true},
		'turn': {value: 6, enumerable: true},
		"●":    {value: 6, enumerable: true}  });
//There are 255*6 = 1530 fully-chromatic hues (r,g,b → where any one is #00, another one is #FF, and the third varies).
// Divide 1530 by the number of hue-units-per-turn to yield the precision depth needed.
//  example:  1530/360 = 4.25
// Therefore each degree needs to cover just over 4 hues.
// 1/10th (0.1) of a degree would cover 10 hues per degree, so 1 decimal place is enough.
// We increase the precision by a factor of 10 (another decimal place) to keep mathematical calculations jolly.
/****** ¿ FUTURE ? *******
Example: Convert decimal degrees 156.742 to degrees minutes seconds
    The whole number is degrees. ...
    Multiply the remaining decimal by 60. ...
    Multiply the remaining decimal by 60. ...
    Decimal degrees 156.742 converts to 156 degrees, 44 minutes and 31 seconds, or 156° 44' 31".

define hue-angle as more familiar clock-time-angles ¿(00:00 - 11:59)? ¿(00:00 - 59:59)? for the mathematically uninclined
hourAngle° = 90 - hours*(360/12)
minsAngle° = 90 - mins*(360/60)
********************************/



SoftMoon.WebWare.HSVA_Color=HSVA_Color;
function HSVA_Color($H,$S,$V,$A, $config, $model)  {
	if (!new.target  &&  !(this instanceof ColorWheel_Color))  throw new Error('SoftMoon.WebWare.HSVA_Color is a constructor, not a function.');
	$model= ((typeof $model === 'string') && ($model=$model.match( /HSV|HSB/i )) && $model[0].toUpperCase())  ||  'HSV';
	//$model= $model || "HSV";
	const proto= this.config ? this : new ColorWheel_Color($config),
				thisClr=Object.create(proto),
				hsv=new Array,  hsva=new Array;
	Object.defineProperty(proto, "constructor", {value: HSVA_Color});
	Object.defineProperties(hsv, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $S;},  set: function($s) {$S=thisClr.getFactor($s);},  enumerable: true},
		2: {get: function() {return $V;},  set: function($v) {$V=thisClr.getFactor($v);},  enumerable: true}  });
	Object.defineProperties(hsva, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $S;},  set: function($s) {$S=thisClr.getFactor($s);},  enumerable: true},
		2: {get: function() {return $V;},  set: function($v) {$V=thisClr.getFactor($v);},  enumerable: true},
		3: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $V=thisClr.getFactor($arr[2]);
		if ($arr[3] !== undefined)  $A=getAlpha($arr[3]);  }
	Object.defineProperties(thisClr, {
		model: {value: $model,  enumerable: true},
		hsv: {get: function() {return hsv;},  set: readArr,  enumerable: true},
		hsb: {get: function() {return hsv;},  set: readArr,  enumerable: true},
		hsva: {get: function() {return hsva;},  set: readArr,  enumerable: true},
		hsba: {get: function() {return hsva;},  set: readArr,  enumerable: true},
		h: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		s: {get: function() {return $S;},  set: function($s) {$S=thisClr.getFactor($s);},  enumerable: true},
		v: {get: function() {return $V;},  set: function($v) {$V=thisClr.getFactor($v);},  enumerable: true},
		b: {get: function() {return $V;},  set: function($v) {$V=thisClr.getFactor($v);},  enumerable: true},
		a: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		hue:        {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		saturation: {get: function() {return $S;},  set: function($s) {$S=thisClr.getFactor($s);},  enumerable: true},
		value:      {get: function() {return $V;},  set: function($v) {$V=thisClr.getFactor($v);},  enumerable: true},
		brightness: {get: function() {return $V;},  set: function($v) {$V=thisClr.getFactor($v);},  enumerable: true},
		alpha:      {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		to: {enumerable: true,  value: Object.defineProperty(new Object,
			'cmyk', {get: HSV_to_CMYK.bind(thisClr, hsv),  enumerable: true}  )}  });
	return thisClr;  };


Object.defineProperties(HSVA_Color, {  //this provides a static globally accessible function unrelated to the HSVA_Color class
	to_CMYK: {value: HSV_to_CMYK,  enumerable: true},
	config: {value: {CMYKAFactory: CMYKA_Color}}  });

function HSV_to_CMYK(hsv)  {
	//HSV values from 0 to 1
	//CMYK results from 0 to 1
	var x,h,c,m,y, k=1-hsv[2];
	if ( hsv[1] == 0 )  return new this.config.CMYKAFactory(0,0,0,k);
	h=hsv[0]-.5;  if (h<0)  h+=1;
	h = h%1 * 6;
	x = h-Math.floor(h);
	if (h<1)  {c=hsv[1]; m=x*hsv[1]; y=0;}
	else
	if (h<2)  {c=(1-x)*hsv[1]; m=hsv[1]; y=0;}
	else
	if (h<3)  {c=0; m=hsv[1]; y=x*hsv[1];}
	else
	if (h<4)  {c=0; m=(1-x)*hsv[1]; y=hsv[1];}
	else
	if (h<5)  {c=x*hsv[1]; m=0; y=hsv[1];}
	else
	if (h<6)  {c=hsv[1]; m=0; y=(1-x)*hsv[1];}
	return new this.config.CMYKAFactory(c,m,y,k, hsv[3]);  }



SoftMoon.WebWare.HSLA_Color=HSLA_Color;
function HSLA_Color($H,$S,$L,$A, $config)  {
	if (!new.target  &&  !(this instanceof ColorWheel_Color))  throw new Error('SoftMoon.WebWare.HSLA_Color is a constructor, not a function.');
	const proto= this.config ? this : new ColorWheel_Color($config),
				thisClr=Object.create(proto),
				hsl=new Array,  hsla=new Array;
	Object.defineProperty(proto, "constructor", {value: HSLA_Color});
	Object.defineProperties(hsl, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $S;},  set: function($s) {$S=thisClr.getFactor($s);},  enumerable: true},
		2: {get: function() {return $L;},  set: function($l) {$L=thisClr.getFactor($l);},  enumerable: true}  });
	Object.defineProperties(hsla, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $S;},  set: function($s) {$S=thisClr.getFactor($s);},  enumerable: true},
		2: {get: function() {return $L;},  set: function($l) {$L=thisClr.getFactor($l);},  enumerable: true},
		3: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $L=thisClr.getFactor($arr[2]);
		if ($arr[3] !== undefined)  $A=thisClr.getAlpha($arr[3]);  }
	Object.defineProperties(thisClr, {
		model: {value: "HSL",  enumerable: true},
		hsl: {get: function() {return hsl;},  set: readArr,  enumerable: true},
		hsla: {get: function() {return hsla;},  set: readArr,  enumerable: true},
		h: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		s: {get: function() {return $S;},  set: function($s) {$S=thisClr.getFactor($s);},  enumerable: true},
		l: {get: function() {return $L;},  set: function($l) {$L=thisClr.getFactor($l);},  enumerable: true},
		a: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		hue:        {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		saturation: {get: function() {return $S;},  set: function($s) {$S=thisClr.getFactor($s);},  enumerable: true},
		lightness:  {get: function() {return $L;},  set: function($l) {$L=thisClr.getFactor($l);},  enumerable: true},
		alpha:      {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	return thisClr;  };


SoftMoon.WebWare.HCGA_Color=HCGA_Color;
function HCGA_Color($H,$C,$G,$A, $config)  {
	if (!new.target  &&  !(this instanceof ColorWheel_Color))  throw new Error('SoftMoon.WebWare.HCGA_Color is a constructor, not a function.');
	const proto= this.config ? this : new ColorWheel_Color($config),
				thisClr=Object.create(proto),
				hcg=new Array,  hcga=new Array;
	Object.defineProperty(proto, "constructor", {value: HCGA_Color});
	Object.defineProperties(hcg, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $C;},  set: function($c) {$C=thisClr.getFactor($c);},  enumerable: true},
		2: {get: function() {return $G;},  set: function($g) {$G=thisClr.getFactor($g);},  enumerable: true}  });
	Object.defineProperties(hcga, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $C;},  set: function($c) {$C=thisClr.getFactor($c);},  enumerable: true},
		2: {get: function() {return $G;},  set: function($g) {$G=thisClr.getFactor($g);},  enumerable: true},
		3: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $C=thisClr.getFactor($arr[1]);  $G=thisClr.getFactor($arr[2]);
		if ($arr[3] !== undefined)  $A=thisClr.getAlpha($arr[3]);  }
	Object.defineProperties(thisClr, {
		model: {value: "HCG",  enumerable: true},
		hcg: {get: function() {return hcg;},  set: readArr,  enumerable: true},
		hcga: {get: function() {return hcga;},  set: readArr,  enumerable: true},
		h: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		c: {get: function() {return $C;},  set: function($c) {$C=thisClr.getFactor($c);},  enumerable: true},
		g: {get: function() {return $G;},  set: function($g) {$G=thisClr.getFactor($g);},  enumerable: true},
		a: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		hue:    {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		chroma: {get: function() {return $C;},  set: function($c) {$C=thisClr.getFactor($c);},  enumerable: true},
		gray:   {get: function() {return $G;},  set: function($g) {$G=thisClr.getFactor($g);},  enumerable: true},
		alpha:  {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	return thisClr;  };


SoftMoon.WebWare.HWBA_Color=HWBA_Color;
function HWBA_Color($H,$W,$B,$A, $config)  {
	if (!new.target  &&  !(this instanceof ColorWheel_Color))  throw new Error('SoftMoon.WebWare.HWBA_Color is a constructor, not a function.');
	const proto= this.config ? this : new ColorWheel_Color($config),
				thisClr=Object.create(proto),
				hcg=new Array,  hcga=new Array;
	Object.defineProperty(proto, "constructor", {value: HWBA_Color});
	Object.defineProperties(hcg, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $W;},  set: function($w) {$W=thisClr.getFactor($w);},  enumerable: true},
		2: {get: function() {return $B;},  set: function($b) {$B=thisClr.getFactor($b);},  enumerable: true}  });
	Object.defineProperties(hcga, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $W;},  set: function($w) {$W=thisClr.getFactor($w);},  enumerable: true},
		2: {get: function() {return $B;},  set: function($b) {$B=thisClr.getFactor($b);},  enumerable: true},
		3: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $W=thisClr.getFactor($arr[1]);  $B=thisClr.getFactor($arr[2]);
		if ($arr[3] !== undefined)  $A=thisClr.getAlpha($arr[3]);  }
	Object.defineProperties(thisClr, {
		model: {value: "HWB",  enumerable: true},
		hwb: {get: function() {return hcg;},  set: readArr,  enumerable: true},
		hwba: {get: function() {return hcga;},  set: readArr,  enumerable: true},
		h: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		w: {get: function() {return $W;},  set: function($w) {$W=thisClr.getFactor($w);},  enumerable: true},
		b: {get: function() {return $B;},  set: function($b) {$B=thisClr.getFactor($b);},  enumerable: true},
		a: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		hue:    {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		white: {get: function() {return $W;},  set: function($w) {$W=thisClr.getFactor($w);},  enumerable: true},
		black:  {get: function() {return $B;},  set: function($b) {$B=thisClr.getFactor($b);},  enumerable: true},
		alpha:  {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	return thisClr;  };


SoftMoon.WebWare.CMYKA_Color=CMYKA_Color;
function CMYKA_Color($C, $M, $Y, $K, $A, $config) {
	if (!new.target)  throw new Error('SoftMoon.WebWare.CMYKA_Color is a constructor, not a function.');
	this.config= new RGB_Calc.ConfigStack(this, $config);
	const thisClr=this,
				cmyk=new Array,  cmyka=new Array;
	Object.defineProperties(cmyk, {
		0: {get: function() {return $C;},  set: function($c) {$C=thisClr.getFactor($c);},  enumerable: true},
		1: {get: function() {return $M;},  set: function($m) {$M=thisClr.getFactor($m);},  enumerable: true},
		2: {get: function() {return $Y;},  set: function($y) {$Y=thisClr.getFactor($y);},  enumerable: true},
		3: {get: function() {return $K;},  set: function($k) {$K=thisClr.getFactor($k);},  enumerable: true}  });
	Object.defineProperties(cmyka, {
		0: {get: function() {return $C;},  set: function($c) {$C=thisClr.getFactor($c);},  enumerable: true},
		1: {get: function() {return $M;},  set: function($m) {$M=thisClr.getFactor($m);},  enumerable: true},
		2: {get: function() {return $Y;},  set: function($y) {$Y=thisClr.getFactor($y);},  enumerable: true},
		3: {get: function() {return $K;},  set: function($k) {$K=thisClr.getFactor($k);},  enumerable: true},
		4: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	function readArr($arr)  { $C=thisClr.getFactor($arr[0]);  $M=thisClr.getFactor($arr[1]);  $Y=thisClr.getFactor($arr[2]);  $K=thisClr.getFactor($arr[3]);
		if ($arr[4] !== undefined)  $A=thisClr.getAlpha($arr[4]);  }
	Object.defineProperties(this, {
		cmyk: {get: function() {return cmyk;},  set: readArr,  enumerable: true},
		cmyka: {get: function() {return cmyka;},  set: readArr,  enumerable: true},
		c: {get: function() {return $C;},  set: function($c) {$C=thisClr.getFactor($c);},  enumerable: true},
		m: {get: function() {return $M;},  set: function($m) {$M=thisClr.getFactor($m);},  enumerable: true},
		y: {get: function() {return $Y;},  set: function($y) {$Y=thisClr.getFactor($y);},  enumerable: true},
		k: {get: function() {return $K;},  set: function($k) {$K=thisClr.getFactor($k);},  enumerable: true},
		a: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		cyan:    {get: function() {return $C;},  set: function($c) {$C=thisClr.getFactor($c);},  enumerable: true},
		magenta: {get: function() {return $M;},  set: function($m) {$M=thisClr.getFactor($m);},  enumerable: true},
		yellow:  {get: function() {return $Y;},  set: function($y) {$Y=thisClr.getFactor($y);},  enumerable: true},
		black:   {get: function() {return $K;},  set: function($k) {$K=thisClr.getFactor($k);},  enumerable: true},
		alpha:   {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });  };

Object.defineProperties(CMYKA_Color.prototype, {
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor}  });

CMYKA_Color.prototype.toString=function(format) {
	if (typeof format != 'string')  format="";
	format+= " "+this.config.stringFormat;
	const alpha= (typeof this.alpha === 'number'  ||  (format.match( /alpha/i )  &&  (this.alpha=this.config.defaultAlpha||1)))  ?  'A' : "",
				s= ( format.match( /factor/ )  &&  !format.match( /percent.*factor/ ) ) ?
			(Math.roundTo(this.c, 3)+', '+Math.roundTo(this.m, 3)+', '+Math.roundTo(this.y, 3)+', '+Math.roundTo(this.k, 3) +
				(alpha && ', '+Math.roundTo(this.a, 3)))
		: (Math.roundTo(this.c*100, 1)+'%, '+Math.roundTo(this.m*100, 1)+'%, '+Math.roundTo(this.y*100, 1)+'%, '+Math.roundTo(this.k*100, 1)+'%' +
				(alpha && ', '+Math.roundTo(this.a*100, 1)+'%'));
	switch ((format=format.match( /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i ))  &&  format[0].toLowerCase())  {
	case 'css':
	case 'html':
	case 'wrap':
	case 'function':  return 'CMYK'+alpha+'('+s+')';
	case 'prefix':    return 'CMYK'+alpha+': '+s;
	case 'csv':
	case 'commas':  return s;
	case 'plain':  return s.replace( /,/g , "");
	case 'tabbed':  return s.replace( /, /g , "\t");
	case 'self':
	default:  return 'CMYKA_Color: ('+s+')';  }  }




//===============================================================
//  These functions are shared by the Color objects and RGB_Calc


	// make sure the color’s value is an integer; and in the boundaries of 0-255; if not, “reflect” it back or “truncate”.
function getByteValue(v)  {
	var isNotPercent=true;
	if (typeof v === 'string')  {
		if (v.substr(-1)==='%')  {v=parseFloat(v)*2.55;  isNotPercent=false;}
		else  v=parseFloat(v);  }
	if (this.config.inputAsFactor  &&  isNotPercent  /* &&  v<=1  &&  v>=0 */)  v=v*255;
	if (this.config.reflect)  {v=Math.abs(v);  while (v>255)  {v=Math.abs(255-(v-255));}}
	else {
		if (v>255)  v=255;
		else if (v<0)  v=0;  }
	return  this.config.roundRGB ? Math.round(v) : v;  }

function getFactorValue(v)  {
	v= (this.config.inputAsFactor  &&  (typeof v !== 'string'  ||  v.substr(-1)!=="%"))  ?
		parseFloat(v)  :  (parseFloat(v)/100);
	return (v<0 || v>1) ? false : v;  }

function getAlphaFactor(v)  {
	v= (typeof v !== 'string'  ||  v.substr(-1)!=="%")  ?
		parseFloat(v)  :  (parseFloat(v)/100);
	return v<0 ? 0 : (v>1 ? 1 : v);  }

function factorize(a, stop, start)  {
	if (start  &&  (a[0]=this.getHueFactor(a[0])) === false)  return false;
	for (var i=start||0; i<stop; i++)  {if ( (a[i]=getFactorValue.call(this, a[i])) === false )  return false;}
	if (a[stop] !== undefined)  a[stop]=getAlphaFactor(a[stop]);
	return a;  }

function getHueFactor(h)  {
	var m, unit=this.config.hueAngleUnit;
	if (typeof h === 'string')  {
		if (m=h.match( RegExp.Hue ))  {h=parseFloat(m[1]);  unit= (m=m[2]) || unit;}
		else {console.error('bad hue:'+h+'  unit: '+unit);  return false;  }  }
	if ( (this.config.inputAsFactor  &&  !m)
	||  unit==='turn'  ||  unit==="●" )
		return Math.sawtooth(1,h);
	return  hueAngleUnitFactors[unit] ?  Math.sawtooth(hueAngleUnitFactors[unit], h)/hueAngleUnitFactors[unit] : false;  }

//===============================================================


SoftMoon.WebWare.RGB_Calc=RGB_Calc;
function RGB_Calc($config, $quickCalc, $mini)  {
	if (!new.target)  throw new Error('RGB_Calc is a constructor, not a function.');
//     The calc function (below) returns an RGBA_Color object (see above)
//
//     The calc function input can accept color definitions in many ways:
// • as three distinct RGB values (pass in three distinct arguments)
//    These RGB values may be byte values (0-255), percent values with % sign (0%-100%), or factor values (0-0.999………).
//  === options below require passing in ¡only! one argument ===
// • as three distinct RGB values passed in as an array indexed 0,1,2 (see note above)
// • as a string representing the 6-digit hexadecimal RGB color value (with or without the leading #)
// • as a string of three comma-separated RGB values "v¹, v², v³" (see RegExp section at top)
// • as a string of four comma-separated RGBA values "v¹, v², v³, v4" (see RegExp section at top)
// • as a string — standard formats for naming colors using color-models or Palettes (see RegExp section at top)
// • as a string specifying a color name on found the default Palette (the default Palette must be loaded)
//    (note that the HTML palette is the initial (default) “default Palette”)
// NOTE: that while byte values passed in should technically be (int) in the range of 0-255,
//  when passed in as 3 individual values or as an array of 3 values, values outside this range
//  are allowed, but are “truncated” or “reflected” back into the legal range.  (float)s are rounded to (int)s.
//
	const calc= ($quickCalc) ? this : function ($string)  {  // ← defining a color in multiple color-space formats
//                                // alternate arguments format shown below
//                  (r, g, b, a)
//                  ([r,g,b,a])
//                  (r, g, b)
//                  ([r,g,b])
			var matches, p, pClr;
			if (arguments.length===1)  {
				if ($string == null)  return null;
				if (typeof $string === 'string')  {
					if (RegExp.isHex.test($string))
						return calc.from.hex($string);
					if ((typeof SoftMoon.palettes[SoftMoon.defaultPalette] === 'object')
					&&  (SoftMoon.palettes[SoftMoon.defaultPalette] instanceof SoftMoon.WebWare.Palette)
					&&  (pClr=$string.match(RegExp.addOnAlpha))
					&&  (matches=SoftMoon.palettes[SoftMoon.defaultPalette].getColor(pClr[1])) )  {
						calc.config.push(SoftMoon.palettes[SoftMoon.defaultPalette].config);
						matches=calc(matches);
						calc.config.pop();
						if (pClr[2])  matches=calc.config.applyAlpha(matches, calc.getAlpha(pClr[2]), 'Palette color');
						return matches;  }
					if (matches=($string.match(RegExp.stdWrappedColor)  ||  $string.match(RegExp.stdPrefixedColor)))  {
						matches[1]=matches[1].trim().toLowerCase();
						if (typeof calc.from[matches[1]] === 'function')  {
							return calc.from[matches[1]](matches[2]);       }
						for (p in SoftMoon.palettes)  {
							if (p.toLowerCase()===matches[1]  &&  (SoftMoon.palettes[p] instanceof SoftMoon.WebWare.Palette))  {
								matches=matches[2].match(RegExp.addOnAlpha);
								let a=matches[2];
								calc.config.push(SoftMoon.palettes[p].config);
								matches=calc(SoftMoon.palettes[p].getColor(matches[1]));
								calc.config.pop();
								if (a)  matches=calc.config.applyAlpha(matches, calc.getAlpha(a), 'Palette color');
								return matches;  }  }  }  }  }
			//return calc.from.rgba.apply(calc.from, arguments);  };
			return calc.from.rgba(...arguments);  };

	if (!$quickCalc)  {
		const props=Object.getOwnPropertyNames(RGB_Calc.prototype);
		for (const p of props)  {Object.defineProperty(calc, p, Object.getOwnPropertyDescriptor(RGB_Calc.prototype, p));}
		Object.defineProperties(calc,  {
			convertColor: {value: convertColor},  //this is for plug-ins
			$: {value: calc}  });   } //this is used internally by convertColor

	Object.defineProperties(calc, {
		config: {enumerable: true,  writable: true,   value: new RGB_Calc.ConfigStack(calc, $config)},
		to:     {enumerable: true,  value: Object.create(calc, !$mini && RGB_Calc.to.definer[$quickCalc ? 'quick' : 'audit'])},
		from:   {enumerable: true,  value: Object.create(calc, !$mini && RGB_Calc.from.definer[$quickCalc ? 'quick' : 'audit'])}  });
	if ($mini)  {
		if ($mini.to)  for (const p of $mini.to)  {
			Object.defineProperty(calc.to,  p,  RGB_Calc.to.definer[$quickCalc ? 'quick' : 'audit'][p]);  }
		if ($mini.from)  for (const p of $mini.from)  {
			Object.defineProperty(calc.from,  p,  RGB_Calc.from.definer[$quickCalc ? 'quick' : 'audit'][p]);  }  }

	return calc;  }






//===============================================================


RGB_Calc.ConfigStack=function($owner, $config)  {
	if (!new.target)  throw new Error('SoftMoon.WebWare.RGB_Calc.ConfigStack is a constructor, not a function.');
	Object.defineProperty(this, 'owner', {value: $owner});
	if (typeof $config === 'object')  for (const f in $config)  {this[f]=$config[f];}  }


RGB_Calc.ConfigStack.prototype={

//  for the RGB color model,
//  depending on the flag below,
//  values passed in outside the range of 0-255 are “reflected” or “truncated” back into the correct range.
	reflect: false,

//  for the RGB color model,
//  depending on the flag below,
//  values may be rounded to integers or left as floating-point values.
	roundRGB: false,

/* This controls how RGB_Calc interprets == string == values,
 * which are by definition here from an “outside” source (user input, palette files, etc.).
 * RGB_Calc always interprets == numerical == values as bytes or factors, depending on the color-space;
 * they are by definition from the “local” program, and it can convert them before hand as needed.
 * By default (inputAsFactor=false) RGB_Calc interprets == strings == as a “loose” CSS string.
 * It will allow mixing bytes and percents (with a percent % sign) in an rgb color-space.
 * It will interpret other color-space values (the “s” & “l” in hsl for example)
 * as percent values when they do not have a percent % sign.
 * When (inputAsFactor=true), these values (without percent % signs) (and hues without units)
 * are interpreted as factors.
 * Alpha values are always interpreted as factors unless they have a percent % sign.
 *
 *    0 <= factor <=1     0 <= percent <= 100     0 <= byte <= 255
 */
	inputAsFactor: false,

	inputShortHex: false,
/*
 * the  hueAngleUnit  default is overridden by  inputAsfactor  when input values have undeclared units
 */
//  default input unit.  Valid units are listed (below) as property keys of  SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors
	hueAngleUnit: 'deg',

//  for (HSL, HSV and HCG) ColorWheel_Color Objects,
//  depending on the Boolean status of the flag below,
//  you may output hues (via the toString() method) with a:
//   • symbol: (0° - 359.999…°)  ← when applicable for the hue-angle-unit
//   • textual suffix: (0deg - 359.999deg)
//  by default (null) the hue-angle-unit is not altered.
	useAngleUnitSymbol: null,

//  when outputting RGB Hex values, this flag determines the format:  A1B2C3  or  #A1B2C3
	useHexSymbol: true,

//  If no alpha is defined when doing a conversion, the defaultAlpha
//  will be defined by RGB_Calc in the output object instance (i.e. the Array, RGBA_Color, ColorWheel_Color, or CMYKA_Color)
//  Also, instances of RGBA_Color, ColorWheel_Color, and CMYKA_Color, use this in a similar way.
//  Note a defaultAlpha value of 0 will never be applied.
	defaultAlpha: undefined,

// Add-on Alpha values are non-standard and defined on Palette color names:  blue, 75%;
// If the RGB-color that the the color-name defines already has an alpha value defined,
// we can multiply-in the add-on alpha in any customized way,
// or make it an error (undefined color) by setting this value to false.
	multiplyAddOnAlpha: function (a1, a2) {return a1-a2*(1-a1);},

// If you create your own Color object class (see the Factory pointers below),
// you may need to also update/replace this function to work with them.
	applyAlpha: function applyAlpha(c_o, a, source)  {
		// Our color object will define an RGB value
		if (c_o instanceof Array)  {
			if (c_o[3] === undefined)  {c_o[3]=a;  return c_o;}
			else if (this.multiplyAddOnAlpha)  {c_o[3]=this.multiplyAddOnAlpha(c_o[3], a);  return c_o;}
			else return this.onError('Can not apply add-on alpha; it is already set', source);  }
		if (c_o  &&  typeof c_o === 'object'  &&  'alpha' in c_o)  {
			if (c_o.alpha === undefined)  {c_o.alpha=a;  return c_o;}
			else if (this.multiplyAddOnAlpha)  {c_o.alpha=this.multiplyAddOnAlpha(c_o.alpha, a);  return c_o;}
			else return this.onError('Can not apply add-on alpha; it is already set', source);  }
		return this.onError('Can not apply add-on alpha to unknown Color object', source);  },

//  You may want to use  Array  or create your own Class constructor for any of these Factories
	RGBAFactory: SoftMoon.WebWare.RGBA_Color,
	CMYKAFactory: SoftMoon.WebWare.CMYKA_Color,
	ColorWheelFactory: SoftMoon.WebWare.ColorWheel_Color,
/*
 *The 3 factory pointers (above) control the output of the RGB_Calc–functions and its instances.
 *
 * //this example provides a calculator that returns RGB output as a simple array of values, instead of the default RGBA_Color object instance:
 * myCalc=new SoftMoon.WebWare.RGB_Calc({RGBAFactory:Array});
 *
 * //this example provides a calculator that returns an RGBA_Color object instance that outputs hex using the # symbol, regardless of the universal default:
 * myCalc=new SoftMoon.WebWare.RGB_Calc;
 * myCalc.config.RGBAFactory=function(r,g,b,a)  {return new SoftMoon.WebWare.RGBA_Color(r,g,b,a,{useHexSymbol:true})};
 */

	onError: function(clr, ct)  {
		if (this.throwErrors  ||  this.logErrors)  {
			const message= ct ?  ('Bad values for '+ct+' conversion: “'+clr+'”.')
												:  ('The color “'+clr+'” is undefined.');  }
		if (this.logErrors)
			console.error(message);
		if (this.throwErrors)  {
			if (this.resetConfigStackOnThrownError)  this.reset();
			throw new Error(message);  }
		return this.errorResult;  },

	throwErrors: false,  // change to true for debugging, etc…
	logErrors: false,    // change to true for debugging, etc…
	errorResult: null,
	resetConfigStackOnThrownError: false
};

Object.defineProperties( RGB_Calc.ConfigStack.prototype, {
	push: { value: function($newConfig) {
			return this.owner.config=Object.create(this, $newConfig);  }  },
	pop: { value: function() {
			if (!this.hasOwnProperty("owner"))  this.owner.config=Object.getPrototypeOf(this);
			return this.owner.config;  }  },
	reset: { value: function() {
			while (!this.owner.config.hasOwnProperty("owner"))  {
				this.owner.config=Object.getPrototypeOf(this.owner.config);  }
			return this.owner.config;  }  }  } );



RGB_Calc.config=new RGB_Calc.ConfigStack(RGB_Calc);



//===============================================================
var defem={
	getByte:     {value: getByteValue},
	getFactor:   {value: getFactorValue},
	getAlpha:    {value: getAlphaFactor},
	factorize:   {value: factorize},
	getHueFactor:{value: getHueFactor},
	convertColor:{value: convertColor}  /*for plug-ins*/
	};
Object.defineProperties(RGB_Calc, defem);
Object.defineProperties(RGB_Calc.prototype, defem);


var hueAngleUnitFactors=
RGB_Calc.hueAngleUnitFactors=  //you may add to these …but replacing them altogether does nothing…
	Object.defineProperties(new Object, {
		'deg':  {value: 360,       enumerable: true},
		"°":    {value: 360,       enumerable: true},
		'rad':  {value: 2*Math.PI, enumerable: true},
		"ᶜ":    {value: 2*Math.PI, enumerable: true},
		"ᴿ":    {value: 2*Math.PI, enumerable: true},
		"ʳ":    {value: 2*Math.PI, enumerable: true},
		'grad': {value: 400,       enumerable: true},
		'ᵍ':    {value: 400,       enumerable: true},
		'ᴳ':    {value: 400,       enumerable: true},
		"%":    {value: 100,       enumerable: true},
		'turn': {value: 1,         enumerable: true},
		"●":    {value: 1,         enumerable: true}  });


RGB_Calc.outputRGB=
RGB_Calc.prototype.outputRGB= outputRGB;

const round=Math.round;

function outputRGB(r,g,b,a)  {
	if (this.config.roundRGB)  {
			r=round(r); g=round(g); b=round(b);  }
	//When RGBAFactory=Array we don’t want the length property to be ===4 with an undefined alpha.
	//Other colors’ Factories don’t get that consideration.
	if (typeof a === 'number'  ||  (a=this.config.defaultAlpha))
		return new this.config.RGBAFactory(r,g,b,a);
	else
		return new this.config.RGBAFactory(r,g,b);  }


//===============================================================
RGB_Calc.install=
RGB_Calc.prototype.install= function(cSpace, provider)  {
	var meta;
	if (!(meta=RGB_Calc[cSpace+"Providers"][provider]))  {
		const message="Cound not install "+cSpace+" provider: "+provider+" → not found.";
		if (this.config.logErrors)  console.error(message);
		if (this.config.throwErrors)  throw new Error(message);
		else return null;  }
	if (this===RGB_Calc)  {
		if (meta.to)  {
			RGB_Calc.to[cSpace]=meta.to.quick;
			RGB_Calc.to.definer.quick[cSpace]={value: meta.to.quick, writable: true};
			RGB_Calc.to.definer.audit[cSpace]={value: meta.to.audit, writable: true};  }
		if (meta.from)  {
			RGB_Calc.from[cSpace]=meta.from.quick;
			RGB_Calc.from.definer.quick[cSpace]={value: meta.from.quick, writable: true};
			RGB_Calc.from.definer.audit[cSpace]={value: meta.from.audit, writable: true};  }  }
	else {
		if (meta.to)
			this.to[cSpace]= this.$ ? meta.to.audit : meta.to.quick;
		if (meta.from)
			this.from[cSpace]= this.$ ? meta.from.audit : meta.from.quick;  }  }





//===============================================================


// This object’s properties are conversion functions.
// You may add to them………for your convenience
Object.defineProperty(RGB_Calc, 'to', {
	enumerable: true,
	value: Object.create(RGB_Calc, {definer: {value: { quick: {}, audit: {} }}})  });

function convertColor(args, converter, model) {
	this.config.push({RGBAFactory: {value:Array}});
	const _color=this.$(args[0]);
	this.config.pop();
	return (args[0]=_color) ?  converter.apply(this, args)  :  this.config.onError(args, 'RGB_Calc.to.'+model);  };


RGB_Calc.to.contrast=contrastRGB;
RGB_Calc.to.definer.quick.contrast={value:contrastRGB};
RGB_Calc.to.definer.audit.contrast={value: function() {return convertColor.call(this, arguments, contrastRGB, 'contrast');}};
function contrastRGB(rgb)  {
	return  (this.config.useHexSymbol ? '#' : "") + ((((Number(rgb[0])+Number(rgb[1])+Number(rgb[2]))/3) < 128)  ?  'FFFFFF' : '000000');  }

RGB_Calc.to.shade=shadeRGB;
RGB_Calc.to.definer.quick.shade={value:shadeRGB};
RGB_Calc.to.definer.audit.shade={value: function() {return convertColor.call(this, arguments, shadeRGB, 'shade');}};
function shadeRGB(rgb)  { var i, min=255, max=0;
	for (i=0; i<3; i++)  {min=(rgb[i]<min) ? rgb[i] : min;   max=(rgb[i]>max) ? rgb[i] : max;}
	const f= (255-max > min) ? (255/max) : (1/min);
	return toHex.call(this, [rgb[0]*f, rgb[1]*f, rgb[2]*f]);  }


RGB_Calc.to.hex=toHex;
RGB_Calc.to.definer.quick.hex={value:toHex};
RGB_Calc.to.definer.audit.hex={value: function() {return convertColor.call(this, arguments, toHex, 'hex');}};
function toHex(rgba)  { return (this.config.useHexSymbol ? "#":'') +
	Math._2hex(rgba[0])+Math._2hex(rgba[1])+Math._2hex(rgba[2]) + (typeof rgba[3] === 'number' ?  Math._2hex(rgba[3]*255) : "");  }


RGB_Calc.to.rgb=        //these are set up as pass-throughs for automated conversion calculations: i.e.  myRGB_calc.to[myOutputModel](color_data);
RGB_Calc.to.rgba=toRGBA;
RGB_Calc.to.definer.quick.rgb=
RGB_Calc.to.definer.quick.rgba={value:toRGBA};
RGB_Calc.to.definer.audit.rgb=
RGB_Calc.to.definer.audit.rgba={value: function() {return convertColor.call(this, arguments, toRGBA, 'rgba');}};
function toRGBA(rgba)  {return this.outputRGB(rgba[0], rgba[1], rgba[2], rgba[3]);}


RGB_Calc.to.hsv=toHSV;
RGB_Calc.to.definer.quick.hsv={value:toHSV};
RGB_Calc.to.definer.audit.hsv={value: function() {return convertColor.call(this, arguments, toHSV, 'hsv');}};
function toHSV(rgb, model)  {  //RGB from 0 to 255   HSV results from 0 to 1   alpha should be 0 <= a <= 1
	var H, S;
	const
	A= (typeof rgb[3] === 'number') ? rgb[3] : this.config.defaultAlpha,
	R = ( rgb[0] / 255 ),
	G = ( rgb[1] / 255 ),
	B = ( rgb[2] / 255 ),
	V = Math.max( R, G, B ),
	delta_max = V - Math.min( R, G, B );

	if ( delta_max == 0 )  {  //This is a gray, no chroma...
		H = 0;  S = 0;  }
	else  {                  //Chromatic data...
		S = delta_max / V;

		const
		del_R = ( ( ( V - R ) / 6 ) + ( delta_max / 2 ) ) / delta_max,
		del_G = ( ( ( V - G ) / 6 ) + ( delta_max / 2 ) ) / delta_max,
		del_B = ( ( ( V - B ) / 6 ) + ( delta_max / 2 ) ) / delta_max;

		if      ( R == V )  H = del_B - del_G;
		else if ( G == V )  H = ( 1 / 3 ) + del_R - del_B;
		else if ( B == V )  H = ( 2 / 3 ) + del_G - del_R;

		if ( H < 0 ) H += 1;
		if ( H > 1 ) H -= 1;  }

	return new this.config.ColorWheelFactory(H,S,V,A, model || 'HSV');  }


RGB_Calc.to.hsb=toHSB;
RGB_Calc.to.definer.quick.hsb={value:toHSB};
RGB_Calc.to.definer.audit.hsb={value: function() {return convertColor.call(this, arguments, toHSB, 'hsb');}};
function toHSB(rgb) {return this.hsv(rgb, 'HSB');}


RGB_Calc.to.hsl=toHSL;
RGB_Calc.to.definer.quick.hsl={value:toHSL};
RGB_Calc.to.definer.audit.hsl={value: function() {return convertColor.call(this, arguments, toHSL, 'hsl');}};
function toHSL(rgb)  {  //RGB from 0 to 255   HSV results from 0 to 1   alpha should be 0 <= a <= 1
	var H, S;
	const
	A= (typeof rgb[3] === 'number') ? rgb[3] : this.config.defaultAlpha,
	R = ( rgb[0] / 255 ),
	G = ( rgb[1] / 255 ),
	B = ( rgb[2] / 255 ),

	low = Math.min( R, G, B ),
	high = Math.max( R, G, B ),
	del_high = high - low,

	L = ( high + low ) / 2;

	if ( del_high == 0 )  {                   //This is a gray, no chroma...
		H = 0;                                //HSL results from 0 to 1
		S = 0;  }
	else  {                                  //Chromatic data...
		if ( L < 0.5 ) S = del_high / ( high + low );
		else           S = del_high / ( 2 - high - low );

		const
		del_R = ( ( ( high - R ) / 6 ) + ( del_high / 2 ) ) / del_high,
		del_G = ( ( ( high - G ) / 6 ) + ( del_high / 2 ) ) / del_high,
		del_B = ( ( ( high - B ) / 6 ) + ( del_high / 2 ) ) / del_high;

		if      ( R == high ) H = del_B - del_G;
		else if ( G == high ) H = ( 1 / 3 ) + del_R - del_B;
		else if ( B == high ) H = ( 2 / 3 ) + del_G - del_R;

		if ( H < 0 ) H += 1;
		if ( H > 1 ) H -= 1;  }

	return new this.config.ColorWheelFactory(H,S,L,A, 'HSL');  }


RGB_Calc.to.hcg=toHCG;
RGB_Calc.to.definer.quick.hcg={value:toHCG};
RGB_Calc.to.definer.audit.hcg={value: function() {return convertColor.call(this, arguments, toHCG, 'hcg');}};
function toHCG(rgb)  {  //RGB from 0 to 255   Hue, Chroma, Gray (HCG) results from 0 to 1   alpha should be 0 <= a <= 1
	var H, C, G;
	const
	A= (typeof rgb[3] === 'number') ? rgb[3] : this.config.defaultAlpha,
	r = ( rgb[0] / 255 ),
	g = ( rgb[1] / 255 ),
	b = ( rgb[2] / 255 ),
	high = Math.max( r, g, b ),
	low  = Math.min( r, g, b );

	if ( high === low )  {  //This is a gray, no chroma...
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
		C=high-low;
		const Cfctr=1-C;
		if (C==1)  G=.5;  else  G=low/Cfctr;

		const
		del_r=(r-G*Cfctr)/C/6,
		del_g=(g-G*Cfctr)/C/6,
		del_b=(b-G*Cfctr)/C/6;

		if      ( r == high )  H = del_g - del_b;
		else if ( g == high )  H = ( 1 / 3 ) + del_b - del_r;
		else if ( b == high )  H = ( 2 / 3 ) + del_r - del_g;

		if ( H < 0 ) H += 1;
		if ( H > 1 ) H -= 1;  }

	return new this.config.ColorWheelFactory(H,C,G,A, 'HCG');  }


RGB_Calc.to.hwb=toHWB;
RGB_Calc.to.definer.quick.hwb={value:toHWB};
RGB_Calc.to.definer.audit.hwb={value: function() {return convertColor.call(this, arguments, toHWB, 'hwb');}};
function toHWB(rgb)  {  //RGB from 0 to 255   Hue, White, Black (HWB) results from 0 to 1   alpha should be 0 <= a <= 1
	var H, C, G;
	const
	A= (typeof rgb[3] === 'number') ? rgb[3] : this.config.defaultAlpha,
	r = ( rgb[0] / 255 ),
	g = ( rgb[1] / 255 ),
	b = ( rgb[2] / 255 ),
	high = Math.max( r, g, b ),
	low  = Math.min( r, g, b );

	if (C=high-low)  {
		const Cfctr=1-C;
		if (C==1)  G=.5;  else  G=low/Cfctr;

		const
		del_r=(r-G*Cfctr)/C/6,
		del_g=(g-G*Cfctr)/C/6,
		del_b=(b-G*Cfctr)/C/6;

		if      ( r == high )  H = del_g - del_b;
		else if ( g == high )  H = ( 1 / 3 ) + del_b - del_r;
		else if ( b == high )  H = ( 2 / 3 ) + del_r - del_g;

		if ( H < 0 ) H += 1;
		if ( H > 1 ) H -= 1;  }
	else H=0;

  return new this.config.ColorWheelFactory(H, low, 1-high, A, 'HWB');  }


RGB_Calc.to.cmyk=toCMYK;
RGB_Calc.to.definer.quick.cmyk={value:toCMYK};
RGB_Calc.to.definer.audit.cmyk={value: function() {return convertColor.call(this, arguments, toCMYK, 'cmyk');}};
function toCMYK(rgb)  {  //RGB from 0 to 255    CMYK results from 0 to 1   alpha should be 0 <= a <= 1
	const A= (typeof rgb[3] === 'number') ? rgb[3] : this.config.defaultAlpha;
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
	return new this.config.CMYKAFactory(C,M,Y,K,A);  }



/* This object’s properties are conversion functions.
 * You may add to them………they will be recognized automatically by the RGB_Calc-instance function as valid color models
 *  (you must use all-lowercase property names to be automatically recognized)
 *
 *  Note the difference in the basic  RGB_Calc.from  methods and the  from  methods of an   RGB_Calc  instance→(see RGB_Calc.from.definer)
 *  The former requires the proper input, with no error checking, and out-of-range or type-errors yield undefined results;
 *  while the latter can accept, parse, and verify end-user input in multiple formats.
 *  Also, the former are coded as the actual conversion functions, while the latter are coded as Object-property-definitions.
 */
Object.defineProperty(RGB_Calc, 'from', {
	enumerable: true,
	value: Object.create(RGB_Calc, { definer: {value: { quick: {}, audit: {} }} })  });



RGB_Calc.from.definer.quick.rgb=
RGB_Calc.from.definer.quick.rgba=
RGB_Calc.from.definer.audit.rgb=
RGB_Calc.from.definer.audit.rgba={enumerable:true, value:fromRGBA};
RGB_Calc.from.rgb=
RGB_Calc.from.rgba=fromRGBA;
function fromRGBA(r, g, b, a)  {  // alternate arguments format shown below
//               ([r,g,b,a])
//               (r,g,b)
//               ([r,g,b])
//               ($string)     ←  "r, g, b"  or  "r, g, b, a"  or  "r g b"  etc…
	var matches;
	if (arguments.length===1)  {
		if (typeof arguments[0] === 'string'
		&&  (matches=arguments[0].match(this.config.inputAsFactor ? RegExp.threeFactors_A : RegExp.rgb_a)))  {
//		&&  ((matches=arguments[0].match(this.config.inputAsFactor ? RegExp.threeFactors : RegExp.rgb))
//			|| (matches=arguments[0].match(this.config.inputAsFactor ? RegExp.fourFactors : RegExp.rgba))))  {
			matches.shift();
			arguments[0]=matches;  }
		if (arguments[0] instanceof Array)  {
			a=arguments[0][3];  b=arguments[0][2];  g=arguments[0][1];  r=arguments[0][0];  }
		else
		return this.config.onError(arguments[0], "RGBA");  }
	if (a !== undefined  ||  (a=this.config.defaultAlpha)!== undefined)
		return new this.config.RGBAFactory(this.getByte(r), this.getByte(g), this.getByte(b), this.getAlpha(a));
	else
		return new this.config.RGBAFactory(this.getByte(r), this.getByte(g), this.getByte(b));  }


RGB_Calc.from.definer.quick.hex={enumerable:true, value:fromHex};
RGB_Calc.from.definer.audit.hex={enumerable:true, value:fromHex};
RGB_Calc.from.hex=fromHex;
function fromHex(h)  {
	var _h;
	if (_h=h.match(RegExp.hex_a))  { //console.log(_h[6] ? "yes" : "no", "{"+_h[6]+"}");
		return this.outputRGB(
			parseInt(_h[3], 16),
			parseInt(_h[4], 16),
			parseInt(_h[5], 16),
			_h[6] ? (parseInt(_h[6], 16)/255) : undefined);  }
	if (this.config.useShortHex  &&  (_h=h.match(RegExp.hex_a4)))  { h=_h[1];
		return this.outputRGB(
			parseInt(h[0]+h[0], 16),
			parseInt(h[1]+h[1], 16),
			parseInt(h[2]+h[2], 16),
			h[3] ? (parseInt(h[3]+h[3], 16)/255) : undefined);  }
	return this.config.onError(h, 'Hex');  }


var r, g, b;
function rgb_from_hue(hFactor)  { //  0 <= hFactor < 1   ¡¡¡  ≠1  !!!
	const h = hFactor * 6,
				x = h%1;
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
	if (h<6)  {r=1; g=0; b=1-x;}  }

RGB_Calc.from.definer.quick.hue={enumerable:true, value:RGB_Calc_from_hue};
RGB_Calc.from.definer.audit.hue={enumerable:true, value:function(h)  {
	const _h= (typeof h === 'string') ? h.match(RegExp.Hue_A) : [,h],
				h_=this.getHueFactor(_h[1]);
	return  ( (h_!==false  &&  (rgb_from_hue(h_),  this.outputRGB(r*255, g*255, b*255, _h[2] && this.getAlpha(_h[2]))))
			||    this.config.onError(h, 'RGB_Calc.from.hue') );  }  };
RGB_Calc.from.hue=RGB_Calc_from_hue;
function RGB_Calc_from_hue(h)  { rgb_from_hue(h);
	return this.outputRGB(r*255, g*255, b*255);  }


function parseColorWheelColor($cwc, model)  {
	var matches;
	if (typeof $cwc == 'string')
		if (matches=($cwc.match(this.config.inputAsFactor ? RegExp.threeFactors_A : RegExp.ColorWheelColor_A)))
			$cwc=matches.slice(1);
		else  return this.config.onError($cwc, model);
	return  this.factorize($cwc,3,1)  ||  this.config.onError($cwc, model);  }

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
 *  as opposed to the HSV & HSL cylinders in which the “shade” or “tint” of the Hue varies with the height.
 *  The center of the cylinders progresses from black at the bottom thought grayscale to white at the top in
 *  in all four color-space models (HSV, HSL, HCG, HCGC), and therefore the center of each is the “Gray-shade” value.
 */
RGB_Calc.from.definer.quick.hcg=
RGB_Calc.from.definer.quick.hcga={enumerable:true, value:fromHCG};
RGB_Calc.from.definer.audit.hcg=
RGB_Calc.from.definer.audit.hcga={enumerable:true, value:function(hcg) {return (hcg=parseColorWheelColor.call(this, hcg, 'HCG'))  &&  fromHCG.call(this, hcg)}};
RGB_Calc.from.hcg=
RGB_Calc.from.hcga=fromHCG;
function fromHCG(hcg)   {
	//HCG values from 0 to 1
	//RGB results from 0 to 255
	rgb_from_hue(hcg[0]);
	r+=(hcg[2]-r)*(1-hcg[1]);
	g+=(hcg[2]-g)*(1-hcg[1]);
	b+=(hcg[2]-b)*(1-hcg[1]);
	return this.outputRGB(r*255, g*255, b*255, hcg[3]);  }


RGB_Calc.from.definer.quick.hwb=
RGB_Calc.from.definer.quick.hwba={enumerable:true, value:fromHCG};
RGB_Calc.from.definer.audit.hwb=
RGB_Calc.from.definer.audit.hwba={enumerable:true, value:function(hwb) {return (hwb=parseColorWheelColor.call(this, hwb, 'HWB'))  &&  fromHWB.call(this, hwb)}};
RGB_Calc.from.hwb=
RGB_Calc.from.hwba=fromHWB;
function fromHWB(hwb) {
	if (hwb[1] + hwb[2] >= 1)  {
		const gray = (hwb[1] / (hwb[1] + hwb[2]))*255;
		return this.outputRGB(gray, gray, gray, hwb[3]);  }
	rgb_from_hue(hwb[0]);
	r = r*(1 - hwb[1] - hwb[2]) + hwb[1];
	g = g*(1 - hwb[1] - hwb[2]) + hwb[1];
	b = b*(1 - hwb[1] - hwb[2]) + hwb[1];
	return this.outputRGB(r*255, g*255, b*255, hwb[3]);  }


RGB_Calc.from.definer.quick.hsb=
RGB_Calc.from.definer.quick.hsv=
RGB_Calc.from.definer.quick.hsba=
RGB_Calc.from.definer.quick.hsva={enumerable:true, value:fromHSV};
RGB_Calc.from.definer.audit.hsb=
RGB_Calc.from.definer.audit.hsba={enumerable:true, value:function(hsv) {return (hsv=parseColorWheelColor.call(this, hsv, 'HSB'))  &&  fromHSV.call(this, hsv)}};
RGB_Calc.from.definer.audit.hsv=
RGB_Calc.from.definer.audit.hsva={enumerable:true, value:function(hsv) {return (hsv=parseColorWheelColor.call(this, hsv, 'HSV'))  &&  fromHSV.call(this, hsv)}};
RGB_Calc.from.hsb=
RGB_Calc.from.hsv=
RGB_Calc.from.hsba=
RGB_Calc.from.hsva=fromHSV;
function fromHSV(hsv)  {
	var h,r,g,b;
	//HSV values from 0 to 1   alpha should be 0 <= a <= 1
	//RGB results from 0 to 255
	if ( hsv[1] === 0 )  return this.outputRGB( hsv[2] * 255, hsv[2] * 255, hsv[2] * 255, hsv[3] );
	h = hsv[0] * 6
	if ( h >= 6 ) h = 0;
	const
	i = Math.floor(h),
	m = hsv[2] * ( 1 - hsv[1] ),
	n = hsv[2] * ( 1 - hsv[1] * ( h - i ) ),
	o = hsv[2] * ( 1 - hsv[1] * ( 1 - ( h - i ) ) );

	if      ( i === 0 ) { r = hsv[2]; g = o ; b = m }
	else if ( i === 1 ) { r = n ; g = hsv[2]; b = m }
	else if ( i === 2 ) { r = m ; g = hsv[2]; b = o }
	else if ( i === 3 ) { r = m ; g = n ; b = hsv[2]}
	else if ( i === 4 ) { r = o ; g = m ; b = hsv[2]}
	else               { r = hsv[2]; g = m ; b = n }

	return this.outputRGB(r * 255, g * 255, b * 255, hsv[3]);  }



RGB_Calc.from.definer.quick.hsl=
RGB_Calc.from.definer.quick.hsla={enumerable:true, value:fromHSL};
RGB_Calc.from.definer.audit.hsl=
RGB_Calc.from.definer.audit.hsla={enumerable:true, value:function(hsl) {return (hsl=parseColorWheelColor.call(this, hsl, 'HSL'))  &&  fromHSL.call(this, hsl)}};
RGB_Calc.from.hsl=
RGB_Calc.from.hsla=fromHSL;
function fromHSL(hsl)  {
	//HSL values from 0 to 1   alpha should be 0 <= a <= 1
	//RGB results from 0 to 255
	if ( hsl[1] === 0 )  {
		return this.outputRGB( hsl[2] * 255,  hsl[2] * 255,  hsl[2] * 255, hsl[3] );  }

	const n = ( hsl[2] < 0.5 )  ?  (hsl[2] * ( 1 + hsl[1] ))  :  (( hsl[2] + hsl[1] ) - ( hsl[1] * hsl[2] )),
				m = 2 * hsl[2] - n;

	function hue_to_RGB( v1, v2, vH )  {
		if ( vH < 0 ) vH += 1
		if ( vH > 1 ) vH -= 1
		if ( ( 6 * vH ) < 1 ) return v1 + ( v2 - v1 ) * 6 * vH;
		if ( ( 2 * vH ) < 1 ) return v2;
		if ( ( 3 * vH ) < 2 ) return v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6;
		return v1;  }
	return this.outputRGB(
		255 * hue_to_RGB( m, n, hsl[0] + ( 1 / 3 ) ),
		255 * hue_to_RGB( m, n, hsl[0] ),
		255 * hue_to_RGB( m, n, hsl[0] - ( 1 / 3 ) ),
		hsl[3] );  }


RGB_Calc.from.definer.quick.cmy=
RGB_Calc.from.definer.quick.cmya={enumerable:true, value:fromCMY};
RGB_Calc.from.definer.audit.cmy=
RGB_Calc.from.definer.audit.cmya={enumerable:true, value:function($cmy) {
	var matches;
	if (typeof $cmy == 'string')
		if (matches=$cmy.match(this.config.inputAsFactor ? RegExp.threeFactors_A : RegExp.cmy_a))
			$cmy=matches.slice(1);
		else  return this.config.onError($cmy, 'CMY');
	return  (this.factorize($cmy,3)  &&  fromCMY.call(this, $cmy))  ||  this.config.onError($cmy, 'CMY');  }  };
RGB_Calc.from.cmy=
RGB_Calc.from.cmya=fromCMY;
function fromCMY(cmy)  {
	//CMY values from 0 to 1   alpha should be 0 <= a <= 1
	//RGB results from 0 to 255
	return this.outputRGB(
		( 1 - cmy[0] ) * 255,
		( 1 - cmy[1] ) * 255,
		( 1 - cmy[2] ) * 255,
		cmy[3]);  }


RGB_Calc.from.definer.quick.cmyk=
RGB_Calc.from.definer.quick.cmyka={enumerable:true, value:fromCMYK};
RGB_Calc.from.definer.audit.cmyk=
RGB_Calc.from.definer.audit.cmyka={enumerable:true, value:function($cmyk) {
	var matches;
	if (typeof $cmyk == 'string')
		if (matches=$cmyk.match(this.config.inputAsFactor ? RegExp.fourFactors_A : RegExp.cmyk_a))
			$cmyk=matches.slice(1);
		else  return this.config.onError($cmyk, 'CMYK');
	return  (this.factorize($cmyk,4)  &&  fromCMYK.call(this, $cmyk))  ||  this.config.onError($cmyk, 'CMYK');  }  };
RGB_Calc.from.cmyk=
RGB_Calc.from.cmyka=fromCMYK;
function fromCMYK(cmyk)  {
	//CMYK values from 0 to 1   alpha should be 0 <= a <= 1
	//RGB results from 0 to 255
	return this.outputRGB(
	((1 - ( cmyk[0] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	((1 - ( cmyk[1] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	((1 - ( cmyk[2] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	cmyk[4] );  }


//untested
RGB_Calc.from.definer.quick.xyz={enumerable:true, value:fromXYZ};
RGB_Calc.from.definer.audit.xyz={enumerable:true, value:function(xyz) {
//X,Y,Z may also be expressed as percents (0%-100%) or, when config.inputAsFactor=TRUE → factors (0.0-1.0).
	if (typeof xyz === 'string')  xyz=xyz.trim().split( /\s*,\s*/ );
	for (var i=0, isNotPercent; i<3; i++)  { isNotPercent=true
		if (typeof xyz[i] === 'string')  {
			if (xyz[i].substr(-1)==='%')  {xyz[i]=(parseFloat(xyz[i])/100)*fromXYZ.inputRanges[i];  isNotPercent=false;}
			else  xyz[i]=parseFloat(xyz[i]);  }
		if (this.config.inputAsFactor  &&  isNotPercent  /* &&  xyz[i]<=1  &&  xyz[i]>0 */)  xyz[i]*=fromXYZ.inputRanges[i];
		if (xyz[i]<0  ||  xyz[i]>fromXYZ.inputRanges[i])  return this.config.onError(xyz, 'XYZ');  }
	xyz[3]=this.getAlpha(xyz[3]);
	return fromXYZ.call(this, xyz);  }  };
RGB_Calc.from.xyz=fromXYZ;
function fromXYZ(xyz)   {
//X from 0 to  95.047   (Observer = 2°, Illuminant = D65)
//Y from 0 to 100.000
//Z from 0 to 108.883
	xyz[0]/=100;  xyz[1]/=100;  xyz[2]/=100;
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
	return this.outputRGB(r*255, g*255, b*255, xyz[3]);  }
Object.defineProperty(fromXYZ, 'inputRanges',  {enumerable: true, value: [ 95.047, 100.000, 108.883 ]});
fromXYZ.inputRanges.illuminant='D65';
fromXYZ.inputRanges.observer='2°';
Object.seal(fromXYZ.inputRanges);



})();  // close the private namespace


//  most (except hcg) thanks to, and see for more formulas:  http://www.easyrgb.com/index.php?X=MATH
//  and except hwb: https://drafts.csswg.org/css-color/#the-hwb-notation

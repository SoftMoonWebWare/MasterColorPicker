//  character encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160

// RGB_Calc.js  release 1.1.9  April 10, 2020  by SoftMoon WebWare.
// based on  rgb.js  Beta-1.0 release 1.0.3  August 1, 2015  by SoftMoon WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2016, 2018, 2020 Joe Golembieski, SoftMoon WebWare

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

// requires  “Math+++.js”  in  JS_toolbucket/
// requires   “HTTP.js”  in  JS_toolbucket/SoftMoon-WebWare/    ← only when downloading color-palette tables from the web via ajax.  They may be included in other ways.




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


;(function()  {
var sep='[,; \t]';

//var f='\\s*0*((?:0|1|\\.[0-9]+)|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*';    //no leading zeros in factors <1  (extras truncated)
	var f='\\s*0*?((?:0|1|0?\\.[0-9]+)|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*';  //one leading zero allowed in factors <1  (extras truncated)

							//   "v¹, v², v³"  where:
							//    (0 <= (float)vⁿ <= 1)  or
							//    (0% <= (float)vⁿ <= 100%)  →  vⁿ must end with a percent sign %
RegExp.threeFactors=new window.RegExp( '^' +f +sep+ f +sep+ f+ '$' );
RegExp.fourFactors=new window.RegExp( '^' +f +sep+ f +sep+ f +sep+ f+ '$' );

var rgb='\\s*0*((?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])|(?:(?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%))\\s*';

							//rgb:   "v¹, v², v³"  where:
							//    (0 <= (int)vⁿ <= 255)  or
							//    (0% <= (float)vⁿ <= 100%)  →  vⁿ must end with a percent sign %
RegExp.rgb=new window.RegExp( '^' +rgb+ sep +rgb+ sep +rgb+ '$' );
RegExp.rgba=new window.RegExp( '^' +rgb+ sep +rgb+ sep +rgb+ sep + f + '$' );

//var p='\\s*0*((?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%?)\\s*';   //no leading zeros in factors <1  (extras truncated)
	var p='\\s*0*?((?:100|[0-9]{1,2}(?:\\.[0-9]*)?|0?\\.[0-9]+)%?)\\s*';  //one leading zero allowed in factors <1  (extras truncated)

							//cmy:   "v¹, v², v³"  where   0 <= (float)vⁿ <= 100  →  vⁿ may or may not end with a percent sign %
RegExp.threePercents=
RegExp.cmy= new window.RegExp( '^' +p+ sep +p+ sep +p+ '$' );
							//cmyk:   "v¹, v², v³, v4"  where   0 <= (float)vⁿ <= 100  →  vⁿ may or may not end with a percent sign %
RegExp.fourPercents=
RegExp.cmyk= new window.RegExp( '^' +p+ sep +p+ sep +p+ sep +p+ '$' );

	var h_=  '\\s*(-?[0-9]+(?:\\.[0-9]*)?|-?0?\\.[0-9]+)(deg|°|g?rad|ʳ|%|turn|●)?\\s*';    //captures the postfix text (i.e. the “unit”) separately  →  m[1]='123' , m[2]='deg'
	var h='\\s*((?:-?[0-9]+(?:\\.[0-9]*)?|-?0?\\.[0-9]+)(?:deg|°|g?rad|ʳ|%|turn|●)?)\\s*';  //does not capture postfix text separately: it is included with the numerical data  →  m[1]='123deg'
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
RegExp.ColorWheelColorA=new window.RegExp( '^' +h+ sep +p+ sep +p+ sep +f+ '$' );
RegExp.Hue= new window.RegExp( '^' +h_+ '$' );

})();  // execute the anonymous function above
//}  // close  “with (SoftMoon)”  wrapping RegExp property definitions


//=================================================================================================\\


// this is the palette that is checked first, without needing a palette identifier.
// with the default value given:
/* var rgb = new SoftMoon.WebWare.RGB_Calc;
 *  rgb('green').hex === rgb('HTML: green').hex
 */
if (!SoftMoon.defaultPalette)  SoftMoon.defaultPalette='HTML';

if (typeof SoftMoon.palettes !== 'object')  SoftMoon.palettes=new Object;




SoftMoon.WebWare.Palette=function Palette($meta)  {
	Object.defineProperty(this, "palette",  {value: Object.create($meta.palette),  enumerable: true});
	doubleDownDeep(this.palette);
	if ($meta.header)  Object.defineProperty(this, "header", {value: typeof $meta.header === 'object' ? Object.create($meta.header) : $meta.header,  enumerable: true});
	if ($meta.footer)  Object.defineProperty(this, "footer", {value: typeof $meta.footer === 'object' ? Object.create($meta.footer) : $meta.footer,  enumerable: true});
	Object.defineProperty(this, "requireSubindex",  {value: $meta.requireSubindex,  enumerable: true});
	Object.defineProperty(this, "alternatives",  {value: $meta.alternatives,  enumerable: true});
	var config=Object.create(Palette.defaultConfig);
	if ($meta.config)  for (c in $meta.config)  {config[c] = Object.getOwnPropertyDescriptor($meta.config, c);}
	Object.defineProperty(this, "config",  {value: config,  enumerable: true});
	if (typeof $meta.getColor == 'function')
		Object.defineProperty(this, "getColor", {value: $meta.getColor,  enumerable: true});
	function doubleDownDeep(palette)  { for (c in palette)  {
		if (c.palette)  {
			palette[c]=new Palette(c)  }  }  }  }


Object.defineProperty(
	SoftMoon.WebWare.Palette.prototype, "getColor", {
		writable: true,
		enumerable: true,
		configurable: false,
		value: function getColor($clr)  { var c, matches;
			$clr=$clr.trim().toLowerCase();
			for (c in this.palette)  {
				if (!this.palette[c].palette)  {
					if (c.trim().toLowerCase()===$clr)  return this.palette[c];
					else  continue;  }
				if ((matches=($clr.match(RegExp.stdWrappedColor)  ||  $clr.match(RegExp.stdPrefixedColor)))
				&&  c.toLowerCase()===matches[1].toLowerCase())
					return this.palette[c].getColor  ?  this.palette[c].getColor(matches[2])  :  getColor.call(this.palette[c], matches[2]);  // arguments.callee
				if (this.requireSubindex==='false'
				&&  (matches= this.palette[c].getColor  ?  this.palette[c].getColor($clr)  :  getColor.call(this.palette[c], $clr)))  // arguments.callee
					return matches;  }
			return null;  }  });

SoftMoon.WebWare.Palette.defaultConfig={   // see  SoftMoon.WebWare.RGB_Calc.ConfigStack.prototype  for details…
	//this object is a “propertiesDescriptor” for creating a new ConfigStack entry
	inputAsFactor: {value: false,  enumerable:true, writable:true, configurable:true},
	hueAngleUnit:  {value: 'deg',  enumerable:true, writable:true, configurable:true}  }



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
		$onIndexLoad(connections, paletteIndex, this.responseText);  };
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
	// JSON.parse resists single-quote-apostrophe in property names, and will not allow for custom methods; eval can be dangerous, but may be necessary for your implementation.
//	if (typeof json_palette == 'string')  json_palette=eval("("+json_palette+")");
	if (typeof json_palette == 'string')  json_palette=JSON.parse(json_palette);
	if (typeof json_palette == 'object')
		for (paletteName in json_palette)  {
			SoftMoon.palettes[paletteName]= new SoftMoon.WebWare.Palette(json_palette[paletteName]);  }
	return json_palette;  }



//=================================================================================================\\


;(function() {  // wrap private members


/*
	This is meant to be a universal object that can be
	 compatibly passed through different libraries without hassle………♪♫ hopefully ♫♪ ☻☺☻☺ ♦♥♣♠♂♀ ☺☻☺☻
*/
SoftMoon.WebWare.RGBA_Color=function($r, $g, $b, $a, $config)  {
	if (this===SoftMoon.WebWare)  throw new Error('SoftMoon.WebWare.RGBA_Color is a constructor, not a function.');
	this.config= new RGB_Calc.ConfigStack(this, $config);
	this.config.stringFormat=SoftMoon.WebWare.RGBA_Color.prototype.toString.defaultFormat;
	var ThisColorObject=this,
			rgb=new Array,
			rgba=new Array;
	if (typeof $a !== 'numeric'  &&  this.config.autoDefineAlpha)  $a=1;
	Object.defineProperties(rgb, {
		0: {get: function() {return $r;},  set: function($red) {$r=ThisColorObject.getByte($red);},  enumerable: true},
		1: {get: function() {return $g;},  set: function($grn) {$g=ThisColorObject.getByte($grn);},  enumerable: true},
		2: {get: function() {return $b;},  set: function($blu) {$b=ThisColorObject.getByte($blu);},  enumerable: true}  });
	Object.defineProperties(rgba, {
		0: {get: function() {return $r;},  set: function($red) {$r=ThisColorObject.getByte($red);},  enumerable: true},
		1: {get: function() {return $g;},  set: function($grn) {$g=ThisColorObject.getByte($grn);},  enumerable: true},
		2: {get: function() {return $b;},  set: function($blu) {$b=ThisColorObject.getByte($blu);},  enumerable: true},
		3: {get: function() {return $a;},  set: function($alf) {$a=ThisColorObject.getAlpha($alf);},  enumerable: true}  });
	Object.seal(rgb);  Object.seal(rgba);
	function readArr($arr)  { $r=this.getByte($arr[0]);  $g=this.getByte($arr[1]);  $b=this.getByte($arr[2]);
		if (typeof $arr[3] === 'number') $a=this.getByte($arr[3]);  }
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
			cmyk: {get: toCMYK.bind(ThisColorObject, rgb),  enumerable: true}  })},
		getByte: {value: getByteValue},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor}  });
	};

function getAlphaFactor(v)  {
	v= (typeof v !== 'string'  ||  v.substr(-1)!=="%")  ?
		parseFloat(v)  :  (parseFloat(v)/100);
	return (v<0) ? 0 : (v>1 ? 1 : v);  }

SoftMoon.WebWare.RGBA_Color.prototype.useHexSymbol=function(flag)  {this.config.useHexSymbol=flag;  return this;}

SoftMoon.WebWare.RGBA_Color.prototype.toString=function(format) {
	if (typeof format != 'string')  format="";
	format+= " "+this.config.stringFormat;
	var outAs=format.match( /hex|css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
	if (outAs) outAs=outAs[0].toLowerCase();
	if (outAs!=='hex')  {
		var s,  a=this.a,  alpha=(typeof a === 'number');
		if (!alpha  &&  format.match( /alpha/ )  ||  this.config.autoDefineAlpha)  {alpha=true;  a=1}
		if (format.match( /percent/ )  &&  !format.match( /byte.*percent/ ))
			s=Math.roundTo(this.r/2.55, 1)+'%, '+
				Math.roundTo(this.g/2.55, 1)+'%, '+
				Math.roundTo(this.b/2.55, 1)+'%'+
				(alpha ? (', '+Math.roundTo(a*100, 3)+'%') : "");
		else
		if (format.match( /factor/ )  &&  !format.match( /byte.*factor/ ))
			s=Math.roundTo(this.r/255, 3)+', '+
				Math.roundTo(this.g/255, 3)+', '+
				Math.roundTo(this.b/255, 3)+
				(alpha ? (', '+Math.roundTo(a, 3)) : "");
		else
			s=Math.round(this.r)+', '+
				Math.round(this.g)+', '+
				Math.round(this.b)+
				(alpha ? (', '+
							(format.match( /percent/ ) ?
									Math.roundTo(a*100, 1)+'%'
								: Math.roundTo(a, 3)))
						: "");  }
	switch (outAs)  {
	case 'hex':  s=this.hex;  return (format.indexOf('#')>=0 && !this.config.useHexSymbol ? "#" : "") + s;
	case 'css':
	case 'html':
	case 'wrap':
	case 'function':  return (alpha ? 'RGBA(' : 'RGB(')+s+')';
	case 'prefix':    return (alpha ? 'RGBA: ' : 'RGB: ')+s;
	case 'csv':
	case 'commas':  return s;
	case 'plain':  return s.replace( /,/g , "");
	case 'tabbed':  return s.replace( /, /g , "\t");
	case 'self':
	default:  return 'RGBA_Color: ('+s+')';  }  }
SoftMoon.WebWare.RGBA_Color.prototype.toString.defaultFormat='self';



SoftMoon.WebWare.ColorWheel_Color=ColorWheel_Color;
function ColorWheel_Color($H, $1, $2, $model, $config)  {
	if (this===SoftMoon.WebWare)  throw new Error('ColorWheel_Color is a constructor, not a function.');
	if (arguments.length===1)  $config=arguments[0];
	this.config= new RGB_Calc.ConfigStack(this, $config);
	switch ($model)  {
		case 'HSV':
		case 'HSB':  	return HSV_Color.call(this, $H, $1, $2, undefined, $model);
		case 'HSL':  	return HSL_Color.call(this, $H, $1, $2);
		case 'HCG':  	return HCG_Color.call(this, $H, $1, $2);  }  }

ColorWheel_Color.prototype.toString=function(format)  {
	if (typeof format !== 'string')  format="";
	format+= " "+this.config.stringFormat;
	var s, arr=this[this.model.toLowerCase()],
			hueAngleUnit=this.config.hueAngleUnit;
	if (s=format.match( /deg|°|g?rad|ʳ|%|turn|●|factor/ ))  hueAngleUnit=s[0];
	if (hueAngleUnit==='factor')  hueAngleUnit='turn';
	if (typeof this.config.useAngleUnitSymbol === 'boolean')
		switch (hueAngleUnit)  {
		case 'deg':
		case "°":  hueAngleUnit= this.config.useAngleUnitSymbol ? "°" : 'deg';
		break;
		case 'rad':
		case "ʳ":  hueAngleUnit= this.config.useAngleUnitSymbol ? "ʳ" : 'rad';
		break;
		case 'turn':
		case "●":  hueAngleUnit= this.config.useAngleUnitSymbol ? "●" : 'turn';  }
	s=Math.roundTo(this.hue*hueAngleUnitFactors[hueAngleUnit], hueUnitPrecision[hueAngleUnit]) + hueAngleUnit + ", ";
	if (format.match( /factor/ )  &&  !format.match( /percent.*factor/ ) )
		s+=Math.roundTo(arr[1], 3) + ', ' + Math.roundTo(arr[2], 3);
	else
		s+=Math.roundTo(arr[1]*100, 1) + '%, ' + Math.roundTo(arr[2]*100, 1)+'%';
	switch ((format=format.match( /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i ))  &&  format[0].toLowerCase())  {
	case 'css':
	case 'html':
	case 'wrap':
	case 'function':  return this.model+'('+s+')';;
	case 'prefix':    return this.model+': '+s
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
		'rad':  {value: 5, enumerable: true},
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



SoftMoon.WebWare.HSV_Color=HSV_Color;
function HSV_Color($H,$S,$V, $config, $model)  {
	if (this===SoftMoon.WebWare)  throw new Error('SoftMoon.WebWare.HSV_Color is a constructor, not a function.');
	$model= ((typeof $model === 'string') && ($model=$model.match( /HSV|HSB/i )) && $model[0].toUpperCase())  ||  'HSV';
	//$model= $model || "HSV";
	var hsv=new Array,  proto,  thisClr;
	if (this.config)
		proto=this;
	else
		proto=new ColorWheel_Color($config);
	Object.defineProperty(proto, "constructor", {value: HSV_Color});
	thisClr=Object.create(proto);
	Object.defineProperties(hsv, {
		0: {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		1: {get: function() {return $S;},  set: function($s) {$S=$s;},  enumerable: true},
		2: {get: function() {return $V;},  set: function($v) {$V=$v;},  enumerable: true}  });
	function readArr($arr)  {$H=$arr[0];  $S=$arr[1];  $V=$arr[2];}
	Object.defineProperties(thisClr, {
		model: {value: $model,  enumerable: true},
		hsv: {get: function() {return hsv;},  set: readArr,  enumerable: true},
		hsb: {get: function() {return hsv;},  set: readArr,  enumerable: true},
		h: {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		s: {get: function() {return $S;},  set: function($s) {$S=$s;},  enumerable: true},
		v: {get: function() {return $V;},  set: function($v) {$V=$v;},  enumerable: true},
		b: {get: function() {return $V;},  set: function($v) {$V=$v;},  enumerable: true},
		hue:        {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		saturation: {get: function() {return $S;},  set: function($s) {$S=$s;},  enumerable: true},
		value:      {get: function() {return $V;},  set: function($v) {$V=$v;},  enumerable: true},
		brightness: {get: function() {return $V;},  set: function($v) {$V=$v;},  enumerable: true},
		to: {enumerable: true,  value: Object.defineProperty(new Object,
			'cmyk', {get: HSV_to_CMYK.bind(thisClr, hsv),  enumerable: true}  )}  });
	return thisClr;  };


Object.defineProperties(HSV_Color, {  //this provides a static globally accessible function unrelated to the HSV_Color class
	to_CMYK: {value: HSV_to_CMYK,  enumerable: true},
	config: {value: {CMYKFactory: CMYK_Color}}  });

function HSV_to_CMYK(hsv)  {
	//HSV values from 0 to 1
	//CMYK results from 0 to 1
	var x,h,c,m,y, k=1-hsv[2];
	if ( hsv[1] == 0 )  return new this.config.CMYKFactory(0,0,0,k);
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
	return new this.config.CMYKFactory(c,m,y,k);  }



SoftMoon.WebWare.HSL_Color=HSL_Color;
function HSL_Color($H,$S,$L, $config)  {
	if (this===SoftMoon.WebWare)  throw new Error('SoftMoon.WebWare.HSL_Color is a constructor, not a function.');
	var hsl=new Array,  proto,  thisClr;
	if (this.config)
		proto=this;
	else
		proto=new ColorWheel_Color($config);
	Object.defineProperty(proto, "constructor", {value: HSL_Color});
	thisClr=Object.create(proto);
	Object.defineProperties(hsl, {
		0: {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		1: {get: function() {return $S;},  set: function($s) {$S=$s;},  enumerable: true},
		2: {get: function() {return $L;},  set: function($l) {$L=$l;},  enumerable: true}  });
	function readArr($arr)  {$H=$arr[0];  $S=$arr[1];  $L=$arr[2];}
	Object.defineProperties(thisClr, {
		model: {value: "HSL",  enumerable: true},
		hsl: {get: function() {return hsl;},  set: readArr,  enumerable: true},
		h: {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		s: {get: function() {return $S;},  set: function($s) {$S=$s;},  enumerable: true},
		l: {get: function() {return $L;},  set: function($l) {$L=$l;},  enumerable: true},
		hue:        {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		saturation: {get: function() {return $S;},  set: function($s) {$S=$s;},  enumerable: true},
		lightness:  {get: function() {return $L;},  set: function($l) {$L=$l;},  enumerable: true}  });
	return thisClr;  };


SoftMoon.WebWare.HCG_Color=HCG_Color;
function HCG_Color($H,$C,$G, $config)  {
	if (this===SoftMoon.WebWare)  throw new Error('SoftMoon.WebWare.HSL_Color is a constructor, not a function.');
	var hcg=new Array,  proto,  thisClr;
	if (this.config)
		proto=this;
	else
		proto=new ColorWheel_Color($config);
	Object.defineProperty(proto, "constructor", {value: HCG_Color});
	thisClr=Object.create(proto);
	Object.defineProperties(hcg, {
		0: {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		1: {get: function() {return $C;},  set: function($c) {$C=$c;},  enumerable: true},
		2: {get: function() {return $G;},  set: function($g) {$G=$g;},  enumerable: true}  });
	function readArr($arr)  {$H=$arr[0];  $C=$arr[1];  $G=$arr[2];}
	Object.defineProperties(thisClr, {
		model: {value: "HCG",  enumerable: true},
		hcg: {get: function() {return hcg;},  set: readArr,  enumerable: true},
		h: {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		c: {get: function() {return $C;},  set: function($c) {$C=$c;},  enumerable: true},
		g: {get: function() {return $G;},  set: function($g) {$G=$g;},  enumerable: true},
		hue:    {get: function() {return $H;},  set: function($h) {$H=$h;},  enumerable: true},
		chroma: {get: function() {return $C;},  set: function($c) {$C=$c;},  enumerable: true},
		gray:   {get: function() {return $G;},  set: function($g) {$G=$g;},  enumerable: true}  });
	return thisClr;  };




SoftMoon.WebWare.CMYK_Color=CMYK_Color;
function CMYK_Color($C, $M, $Y, $K, $config) {
	if (this===SoftMoon.WebWare)  throw new Error('CMYK_Color is a constructor, not a function.');
	this.config= new RGB_Calc.ConfigStack(this, $config);
	var cmyk=new Array;
	Object.defineProperties(cmyk, {
		0: {get: function() {return $C;},  set: function($c) {$C=$c;},  enumerable: true},
		1: {get: function() {return $M;},  set: function($m) {$M=$m;},  enumerable: true},
		2: {get: function() {return $Y;},  set: function($y) {$Y=$y;},  enumerable: true},
		3: {get: function() {return $K;},  set: function($k) {$K=$k;},  enumerable: true}  });
	function readArr($arr)  {$C=$arr[0];  $M=$arr[1];  $Y=$arr[2];  $K=$arr[3];}
	Object.defineProperties(this, {
		cmyk: {get: function() {return cmyk;},  set: readArr,  enumerable: true},
		c: {get: function() {return $C;},  set: function($c) {$C=$c;},  enumerable: true},
		m: {get: function() {return $M;},  set: function($m) {$M=$m;},  enumerable: true},
		y: {get: function() {return $Y;},  set: function($y) {$Y=$y;},  enumerable: true},
		k: {get: function() {return $K;},  set: function($k) {$K=$k;},  enumerable: true},
		cyan:    {get: function() {return $C;},  set: function($c) {$C=$c;},  enumerable: true},
		magenta: {get: function() {return $M;},  set: function($m) {$M=$m;},  enumerable: true},
		yellow:  {get: function() {return $Y;},  set: function($y) {$Y=$y;},  enumerable: true},
		black:   {get: function() {return $K;},  set: function($k) {$K=$k;},  enumerable: true}  });  };

SoftMoon.WebWare.CMYK_Color.prototype.toString=function(format) {
	var s;
	if (typeof format != 'string')  format="";
	format+= " "+this.config.stringFormat;
	if ( format.match( /factor/ )  &&  !format.match( /percent.*factor/ ) )
		s=Math.roundTo(this.c, 3)+', '+Math.roundTo(this.m, 3)+', '+Math.roundTo(this.y, 3)+', '+Math.roundTo(this.k, 3);
	else
		s=Math.roundTo(this.c*100, 1)+'%, '+Math.roundTo(this.m*100, 1)+'%, '+Math.roundTo(this.y*100, 1)+'%, '+Math.roundTo(this.k*100, 1)+'%';
	switch ((format=format.match( /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i ))  &&  format[0].toLowerCase())  {
	case 'css':
	case 'html':
	case 'wrap':
	case 'function':  return 'CMYK('+s+')';
	case 'prefix':    return 'CMYK: '+s;
	case 'csv':
	case 'commas':  return s;
	case 'plain':  return s.replace( /,/g , "");
	case 'tabbed':  return s.replace( /, /g , "\t");
	case 'self':
	default:  return 'CMYK_Color: ('+s+')';  }  }







SoftMoon.WebWare.RGB_Calc=RGB_Calc;
function RGB_Calc($config, $quickCalc, $mini)  {
	if (this===SoftMoon.WebWare)  throw new Error('RGB_Calc is a constructor, not a function.');
	var calc, i, p;
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
	if ($quickCalc)
		calc=this;
	else  {
		calc=function ($string)  {  // ← defining a color in multiple color-space formats
//                                // alternate arguments format shown below
//                  (r, g, b, a)
//                  ([r,g,b,a])
//                  (r,g,b)
//                  ([r,g,b])
			var matches, p;
			if (arguments.length===1)  {
				if ($string == null)  return null;
				if (typeof $string === 'string')  {
					if (RegExp.isHex.test($string))
						return calc.from.hex($string);
					if ((typeof SoftMoon.palettes[SoftMoon.defaultPalette] === 'object')
					&&  (SoftMoon.palettes[SoftMoon.defaultPalette] instanceof SoftMoon.WebWare.Palette)
					&&  (matches=SoftMoon.palettes[SoftMoon.defaultPalette].getColor($string)) )  {
						calc.config.push(SoftMoon.palettes[SoftMoon.defaultPalette].config);
						matches=calc(matches);
						calc.config.pop();
						return matches;  }
					if (matches=($string.match(RegExp.stdWrappedColor)  ||  $string.match(RegExp.stdPrefixedColor)))  {
						matches[1]=matches[1].trim().toLowerCase();
						if (typeof calc.from[matches[1]] === 'function')  {
							return calc.from[matches[1]](matches[2]);       }
						for (p in SoftMoon.palettes)  {
							if (p.toLowerCase()===matches[1]  &&  (SoftMoon.palettes[p] instanceof SoftMoon.WebWare.Palette))  {
								calc.config.push(SoftMoon.palettes[p].config);
								matches=calc(SoftMoon.palettes[p].getColor(matches[2]));
								calc.config.pop();
								return matches;  }  }  }  }  }
			return calc.from.rgba.apply(calc.from, arguments);  };

		p=Object.getOwnPropertyNames(RGB_Calc.prototype);
		for (i=0; i<p.length; i++)  {Object.defineProperty(calc, p[i], Object.getOwnPropertyDescriptor(RGB_Calc.prototype, p[i]));}
		Object.defineProperties(calc,  {
			convertColor: {value: convertColor},  //this is for plug-ins
			$: {value: calc}  });  //this is used internally by convertColor
	}

	Object.defineProperties(calc, {
		config: {enumerable: true,  writable: true,   value: new RGB_Calc.ConfigStack(calc, $config)},
		to:     {enumerable: true,  value: Object.create(calc, !$mini && RGB_Calc.to.definer[$quickCalc ? 'quick' : 'audit'])},
		from:   {enumerable: true,  value: Object.create(calc, !$mini && RGB_Calc.from.definer[$quickCalc ? 'quick' : 'audit'])}  });
	if ($mini)  {
		if ($mini.to)  for (i=0; i<$mini.to.lenght; i++)  {
			Object.defineProperty(calc.to,  $mini.to[i],  RGB_Calc.to.definer[$quickCalc ? 'quick' : 'audit'][$mini.to[i]]);  }
		if ($mini.from)  for (i=0; i<$mini.from.lenght; i++)  {
			Object.defineProperty(calc.from,  $mini.from[i],  RGB_Calc.from.definer[$quickCalc ? 'quick' : 'audit'][$mini.from[i]]);  }  }

	return calc;  }






//===============================================================


RGB_Calc.ConfigStack=function($owner, $config)  {
	Object.defineProperties(this, {
		owner: {value: $owner}  } );
	if (typeof $config == 'object')  for (var f in $config)  {this[f]=$config[f];}  }


RGB_Calc.ConfigStack.prototype={
	constructor: RGB_Calc.ConfigStack,

//  for the RGB color model,
//  depending on the flag below,
//  values passed in outside the range of 0-255 are “reflected” or “truncated” back into the correct range.
	reflect: false,

//  for the RGB color model,
//  depending on the flag below,
//  values may be rounded to integers or left as floating-points.
	roundRGB: false,

	inputAsFactor: false,

	inputShortHex: false,
/*
 * the  hueAngleUnit  default is overridden by  inputAsfactor  when input values have undeclared units
 */
//  default input unit.  Valid units are listed (below) as property keys of  SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors
	hueAngleUnit: 'deg',

//  for (HSL, HSV and HCG) ColorWheel_Color Objects,
//  depending on the flag below,
//  you may output hues with a:
//   • symbol: (0° - 359.999…°)  ← when applicable for the hue-angle-unit
//   • textual suffix: (0deg - 359.999deg)
	useAngleUnitSymbol: null,

//  when outputting RGB Hex values, this flag determines the format:  A1B2C3  or  #A1B2C3
	useHexSymbol: true,

//  if true, an alpha (opacity) value of 1 (fully opaque)
//  will be defined in the output object instance (i.e. the Array or RGBA_Color)
//  if none is provided.
	autoDefineAlpha: false,

//  You may want to use  Array  or create your own Class constructor for any of these Factories
	RGBAFactory: SoftMoon.WebWare.RGBA_Color,
	CMYKFactory: SoftMoon.WebWare.CMYK_Color,
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
		if (this.throwErrors  ||  this.logErrors)
			var message= ct ?  ('Bad values for '+ct+' conversion: “'+clr+'”.')
											:  ('The color “'+clr+'” is undefined.');
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
	reset: { value: function() { var i=1;
			while (!this.owner.config.hasOwnProperty("owner"))  {
				this.owner.config=Object.getPrototypeOf(this.owner.config);  }
			return this.owner.config;  }  }  } );



RGB_Calc.config=new RGB_Calc.ConfigStack(RGB_Calc);


//===============================================================

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

function factorize(a, s)  {
	if (s  &&  (a[0]=this.getHueFactor(a[0])) === false)  return false;
	for (var i=s||0; i<a.length; i++)  {if ( (a[i]=getFactorValue.call(this, a[i])) === false )  return false;}
	return a;  }

function getHueFactor(h)  {
	var m, unit=this.config.hueAngleUnit;
	if (typeof h === 'string')  {
		if (m=h.match( RegExp.Hue ))  {h=parseFloat(m[1]);  unit= (m=m[2]) || unit;}
		else {console.error('bad hue:'+h+'  unit: '+unit);  return false;  }  }
	if ((this.config.inputAsFactor  &&  !m   /* &&  h<=1  &&  h>=0 */)
	||  unit==='turn'  ||  unit==="●")
		return Math.sawtooth(1,h);
	return  hueAngleUnitFactors[unit] ?  Math.sawtooth(hueAngleUnitFactors[unit], h)/hueAngleUnitFactors[unit] : false;  }

//===============================================================
var defem={
	getByte:     {value: getByteValue},
	getFactor:   {value: getFactorValue},
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
		"ʳ":    {value: 2*Math.PI, enumerable: true},
		'grad': {value: 400,       enumerable: true},
		"%":    {value: 100,       enumerable: true},
		'turn': {value: 1,         enumerable: true},
		"●":    {value: 1,         enumerable: true}  });


RGB_Calc.outputRGB=
RGB_Calc.prototype.outputRGB= outputRGB;

function outputRGB(r,g,b,a)  {
	if (this.config.roundRGB)
		for (var i=0; i<3; i++)  {arguments[i]=Math.round(arguments[i]);}
	if (typeof a === 'number'  ||  this.config.autoDefineAlpha  &&  (a=1))
		return new this.config.RGBAFactory(r,g,b,a);
	else
		return new this.config.RGBAFactory(r,g,b);  }



//===============================================================
RGB_Calc.install=
RGB_Calc.prototype.install= function(cSpace, provider)  {
	var meta;
	if (!(meta=RGB_Calc[cSpace+"Providers"][provider]))  {
		var message="Cound not install "+cSpace+" provider: "+provider+" → not found.";
		if (this.logErrors)  console.error(message);
		if (this.throwErrors)  throw new Error(message);
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

function convertColor(args, converter, model) {  var _color;
	this.config.push({RGBAFactory: {value:Array}});
	_color=this.$(args[0]);
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
function shadeRGB(rgb)  { var i, min=255, max=0, f;
	for (i=0; i<3; i++)  {min=(rgb[i]<min) ? rgb[i] : min;   max=(rgb[i]>max) ? rgb[i] : max;}
	if (255-max > min)  f=255/max;
	else  f=1/min;
	return toHex.call(this, [rgb[0]*f, rgb[1]*f, rgb[2]*f]);  }


RGB_Calc.to.hex=toHex;
RGB_Calc.to.definer.quick.hex={value:toHex};
RGB_Calc.to.definer.audit.hex={value: function() {return convertColor.call(this, arguments, toHex, 'hex');}};
function toHex(rgb)  { return (this.config.useHexSymbol ? "#":'') +
	Math._2hex(rgb[0])+Math._2hex(rgb[1])+Math._2hex(rgb[2]) + (typeof rgb[3] === 'number' ?  Math._2hex(rgb[3]) : "");  }


RGB_Calc.to.rgb=        //these are set up as pass-throughs for automated conversion calculations: i.e.  myRGB_calc.to[myOutputModel](color_data);
RGB_Calc.to.rgba=toRGBA;
RGB_Calc.to.definer.quick.rgb=
RGB_Calc.to.definer.quick.rgba={value:toRGBA};
RGB_Calc.to.definer.audit.rgb=
RGB_Calc.to.definer.audit.rgba={value: function() {return convertColor.call(this, arguments, toRGBA, 'rgba');}};
function toRGBA(rgba)  { var a=rgba[3];
	if (typeof a === 'number'  ||  (this.config.autoDefineAlpha  &&  (a=1)))
		return new this.config.RGBAFactory(rgba[0], rgba[1], rgba[2], a);
	else
		return new this.config.RGBAFactory(rgba[0], rgba[1], rgba[2]);  }


RGB_Calc.to.hsv=toHSV;
RGB_Calc.to.definer.quick.hsv={value:toHSV};
RGB_Calc.to.definer.audit.hsv={value: function() {return convertColor.call(this, arguments, toHSV, 'hsv');}};
function toHSV(rgb, model)  {  //RGB from 0 to 255   HSV results from 0 to 1
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

	return new this.config.ColorWheelFactory(H,S,V, model || 'HSV');  }


RGB_Calc.to.hsb=toHSB;
RGB_Calc.to.definer.quick.hsb={value:toHSB};
RGB_Calc.to.definer.audit.hsb={value: function() {return convertColor.call(this, arguments, toHSB, 'hsb');}};
function toHSB(rgb) {return this.hsv(rgb, 'HSB');}


RGB_Calc.to.hsl=toHSL;
RGB_Calc.to.definer.quick.hsl={value:toHSL};
RGB_Calc.to.definer.audit.hsl={value: function() {return convertColor.call(this, arguments, toHSL, 'hsl');}};
function toHSL(rgb)  {  //RGB from 0 to 255   HSV results from 0 to 1
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

	return new this.config.ColorWheelFactory(H,S,L, 'HSL');  }


RGB_Calc.to.hcg=toHCG;
RGB_Calc.to.definer.quick.hcg={value:toHCG};
RGB_Calc.to.definer.audit.hcg={value: function() {return convertColor.call(this, arguments, toHCG, 'hcg');}};
function toHCG(rgb)   {  //RGB from 0 to 255   Hue, Chroma, Gray (HCG) results from 0 to 1
	var r, g, b, high, low, H, C, G, Cfctr, del_r, del_g, del_b;
	r = ( rgb[0] / 255 );
	g = ( rgb[1] / 255 );
	b = ( rgb[2] / 255 );
	high = Math.max( r, g, b );
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

	return new this.config.ColorWheelFactory(H,C,G, 'HCG');  }


RGB_Calc.to.cmyk=toCMYK;
RGB_Calc.to.definer.quick.cmyk={value:toCMYK};
RGB_Calc.to.definer.audit.cmyk={value: function() {return convertColor.call(this, arguments, toCMYK, 'cmyk');}};
function toCMYK(rgb)  {  //RGB from 0 to 255    CMYK results from 0 to 1
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
	return new this.config.CMYKFactory(C,M,Y,K);  }



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
	if (arguments.length===1)  {
		if (typeof arguments[0] === 'string'
		&&  ((matches=arguments[0].match(this.config.inputAsFactor ? RegExp.threeFactors : RegExp.rgb))
			|| (matches=arguments[0].match(this.config.inputAsFactor ? RegExp.fourFactors : RegExp.rgba))))  {
			matches.shift();
			arguments[0]=matches;  }
		if (arguments[0] instanceof Array)  {
			a=arguments[0][3];  b=arguments[0][2];  g=arguments[0][1];  r=arguments[0][0];  }
		else
		return this.config.onError(arguments[0], "RGBA");  }
	if (typeof a !== 'undefined'  ||  this.config.autoDefineAlpha  &&  (a=1))
		return new this.config.RGBAFactory(this.getByte(r), this.getByte(g), this.getByte(b), this.getFactor(a));
	else
		return new this.config.RGBAFactory(this.getByte(r), this.getByte(g), this.getByte(b));  }


RGB_Calc.from.definer.quick.hex={enumerable:true, value:fromHex};
RGB_Calc.from.definer.audit.hex={enumerable:true, value:fromHex};
RGB_Calc.from.hex=fromHex;
function fromHex(h)  {
	var _h
	if (_h=h.match(RegExp.hex_a))  { //console.log(_h[6] ? "yes" : "no", "{"+_h[6]+"}");
		return this.outputRGB(
			parseInt(_h[3], 16),
			parseInt(_h[4], 16),
			parseInt(_h[5], 16),
			_h[6] ? Math.floor(parseInt(_h[6], 16)/2) : undefined);  }
	if (this.config.useShortHex  &&  (_h=h.match(RegExp.hex_a4)))  { h=_h[1];
		return this.outputRGB(
			parseInt(h[0]+h[0], 16),
			parseInt(h[1]+h[1], 16),
			parseInt(h[2]+h[2], 16),
			h[3] ? Math.floor(parseInt(h[3]+h[3], 16)/2) : undefined);  }
	return this.config.onError(h, 'Hex');  }


var r, g, b;
function rgb_from_hue(hFactor)  { //  0 <= hFactor < 1   ¡¡¡  ≠1  !!!
	var h = hFactor * 6,
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
RGB_Calc.from.definer.audit.hue={enumerable:true, value:function(h)  { var _h;
	return  ((_h=this.getHueFactor(h))!==false  &&  (rgb_from_hue(_h),  this.outputRGB(r*255, g*255, b*255)))
			||  this.config.onError(h, 'RGB_Calc.from.hue');  }  };
RGB_Calc.from.hue=RGB_Calc_from_hue;
function RGB_Calc_from_hue(h)  { rgb_from_hue(h);
	return this.outputRGB(r*255, g*255, b*255);  }

/*
//¡note this NOT a method of RGB_Calc.from!‼! — always returns a raw rgb Array, not an RGBA_Color Object
RGB_Calc.from_Hue =function(hFactor)  { rgb_from_hue(hFactor);
	return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];  }
 */


function parseColorWheelColor($cwc, model)  {
	var matches;
	if (typeof $cwc == 'string')
		if (matches=($cwc.match(this.config.inputAsFactor ? RegExp.threeFactors : RegExp.ColorWheelColor)))  $cwc=matches.slice(1);
		else  return this.config.onError($cwc, model);
	return  this.factorize($cwc,1)  ||  this.config.onError($cwc, model);  }

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
RGB_Calc.from.definer.quick.hcg={enumerable:true, value:fromHCG};
RGB_Calc.from.definer.audit.hcg={enumerable:true, value:function(hcg) {return (hcg=parseColorWheelColor.call(this, hcg, 'HCG'))  &&  fromHCG.call(this, hcg)}};
RGB_Calc.from.hcg=fromHCG;
function fromHCG(hcg)   {
	//HCG values from 0 to 1
	//RGB results from 0 to 255
	rgb_from_hue(hcg[0]);
	r=r+(hcg[2]-r)*(1-hcg[1]);
	g=g+(hcg[2]-g)*(1-hcg[1]);
	b=b+(hcg[2]-b)*(1-hcg[1]);
	return this.outputRGB(r*255, g*255, b*255);  }


RGB_Calc.from.definer.quick.hsb={enumerable:true, value:fromHSV};
RGB_Calc.from.definer.quick.hsv={enumerable:true, value:fromHSV};
RGB_Calc.from.definer.audit.hsb={enumerable:true, value:function(hsv) {return (hsv=parseColorWheelColor.call(this, hsv, 'HSB'))  &&  fromHSV.call(this, hsv)}};
RGB_Calc.from.definer.audit.hsv={enumerable:true, value:function(hsv) {return (hsv=parseColorWheelColor.call(this, hsv, 'HSV'))  &&  fromHSV.call(this, hsv)}};
RGB_Calc.from.hsb=
RGB_Calc.from.hsv=fromHSV
function fromHSV(hsv)  {
	var h,i, m,n,o, r,g,b;
	//HSV values from 0 to 1
	//RGB results from 0 to 255
	if ( hsv[1] === 0 )  return this.outputRGB( hsv[2] * 255, hsv[2] * 255, hsv[2] * 255 );
	h = hsv[0] * 6
	if ( h >= 6 ) h = 0
	i = Math.floor(h);
	m = hsv[2] * ( 1 - hsv[1] )
	n = hsv[2] * ( 1 - hsv[1] * ( h - i ) )
	o = hsv[2] * ( 1 - hsv[1] * ( 1 - ( h - i ) ) )

	if      ( i === 0 ) { r = hsv[2]; g = o ; b = m }
	else if ( i === 1 ) { r = n ; g = hsv[2]; b = m }
	else if ( i === 2 ) { r = m ; g = hsv[2]; b = o }
	else if ( i === 3 ) { r = m ; g = n ; b = hsv[2]}
	else if ( i === 4 ) { r = o ; g = m ; b = hsv[2]}
	else               { r = hsv[2]; g = m ; b = n }

	return this.outputRGB(r * 255, g * 255, b * 255);  }



RGB_Calc.from.definer.quick.hsl={enumerable:true, value:fromHSL};
RGB_Calc.from.definer.audit.hsl={enumerable:true, value:function(hsl) {return (hsl=parseColorWheelColor.call(this, hsl, 'HSL'))  &&  fromHSL.call(this, hsl)}};
RGB_Calc.from.hsl=fromHSL;
function fromHSL(hsl)  {
	var m,n;
	//HSL values from 0 to 1
	//RGB results from 0 to 255
	if ( hsl[1] === 0 )  {
		return this.outputRGB( hsl[2] * 255,  hsl[2] * 255,  hsl[2] * 255 );  }

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
	return this.outputRGB(
		255 * hue_to_RGB( m, n, hsl[0] + ( 1 / 3 ) ),
		255 * hue_to_RGB( m, n, hsl[0] ),
		255 * hue_to_RGB( m, n, hsl[0] - ( 1 / 3 ) ) );  }


RGB_Calc.from.definer.quick.cmy={enumerable:true, value:fromCMY};
RGB_Calc.from.definer.audit.cmy={enumerable:true, value:function(cmy) {
	var matches;
	if (typeof cmy == 'string')
		if (matches=cmy.match(this.config.inputAsFactor ? RegExp.threeFactors : RegExp.cmy))  cmy=matches.slice(1);
		else  return this.config.onError(cmy, 'CMY');
	return  (this.factorize(cmy)  &&  fromCMY.call(this, cmy))  ||  this.config.onError(cmy, 'CMY');  }  };
RGB_Calc.from.cmy=fromCMY;
function fromCMY(cmy)  {
	//CMY values from 0 to 1
	//RGB results from 0 to 255
	return this.outputRGB(
		( 1 - cmy[0] ) * 255,
		( 1 - cmy[1] ) * 255,
		( 1 - cmy[2] ) * 255);  }


RGB_Calc.from.definer.quick.cmyk={enumerable:true, value:fromCMYK};
RGB_Calc.from.definer.audit.cmyk={enumerable:true, value:function(cmyk) {
	var matches;
	if (typeof cmyk == 'string')
		if (matches=cmyk.match(this.config.inputAsFactor ? RegExp.fourFactors : RegExp.cmyk))  cmyk=matches.slice(1);
		else  return this.config.onError(cmyk, 'CMYK');
	return  (this.factorize(cmyk)  &&  fromCMYK.call(this, cmyk))  ||  this.config.onError(cmyk, 'CMYK');  }  };
RGB_Calc.from.cmyk=fromCMYK;
function fromCMYK(cmyk)  {
	//CMYK values from 0 to 1
	//RGB results from 0 to 255
	return this.outputRGB(
	((1 - ( cmyk[0] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	((1 - ( cmyk[1] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	((1 - ( cmyk[2] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255) );  }


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
	return this.outputRGB(r*255, g*255, b*255);  }
Object.defineProperty(fromXYZ, 'inputRanges',  {enumerable: true, value: [ 95.047, 100.000, 108.883 ]});
fromXYZ.inputRanges.illuminant='D65';
fromXYZ.inputRanges.observer='2°';
Object.seal(fromXYZ.inputRanges);



})();   //  close wrapper for private methods and variables and execute the wrapper function.


//  most (except hcg) thanks to, and see for more formulas:  http://www.easyrgb.com/index.php?X=MATH

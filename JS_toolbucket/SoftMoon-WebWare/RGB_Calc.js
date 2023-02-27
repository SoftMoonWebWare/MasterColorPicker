//  character encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160

// RGB_Calc.js  release 1.6  February 27, 2023  by SoftMoon WebWare.
// based on  rgb.js  Beta-1.0 release 1.0.3  August 1, 2015  by SoftMoon WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2016, 2018, 2020, 2022, 2023 Joe Golembieski, SoftMoon WebWare

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

// requires  “+++.js”  ←in  JS_toolbucket/+++JS/
// requires  “+++Math.js”  ←in  JS_toolbucket/++JS/
// requires  “HTTP.js”  ←in  JS_toolbucket/SoftMoon-WebWare/    ← only when downloading color-palette tables from the web via ajax.  They may be included in other ways.

'use strict';

/*   The SoftMoon property is usually a constant defined in a “pinnicle” file somewhere else
if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')   SoftMoon.WebWare=new Object;
*/

// this is the palette that is checked first, without needing a palette identifier.
// with the default value given:
/*  const rgb = new SoftMoon.WebWare.RGB_Calc;
 *  rgb('green').hex === rgb('CSS: green').hex
 */
if (!SoftMoon.defaultPalette)  SoftMoon.defaultPalette='CSS';

if (typeof SoftMoon.palettes !== 'object')  SoftMoon.palettes=new Object;

/*  the  colorPalettes_defaultPath  should typically be relative to the HTML document that loads this file
 *  and MUST end with a  /
 */
if (!SoftMoon.colorPalettes_defaultPath)  SoftMoon.colorPalettes_defaultPath='color_palettes/';



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
		if (prop in $meta)  Object.defineProperty(this, prop, {value: $meta[prop], enumerable: true});  }
	const config=Object.create(Palette.defaultConfig);
	if ($meta.config)  for (const prop of Palette.configProps)  {
		if (prop in $meta.config)  config[prop] = Object.getOwnPropertyDescriptor($meta.config, prop);  }
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

// this can be filled with property names for meta-data values of a palette that the implementation requires.
// you should NOT allow "config" meta-properties in this Array, or an Error will occur. Use configProps below.
SoftMoon.WebWare.Palette.properties=[];
// you can add/remove property names for calculator-configuration values of a palette that the implementation requires.
SoftMoon.WebWare.Palette.configProps=['inputAsFactor', 'hueAngleUnit', 'inutShortHex', 'defaultAlpha', 'forbidAddOnAlpha'];

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
	const
		connections=new Array,
		connector=new SoftMoon.WebWare.HTTP($maxAttempts, $timeoutDelay),
		paletteIndexConnection=SoftMoon.WebWare.HTTP.Connection($path, 'Can not access color palettes: no HTTP service available.', $logError);
	if (paletteIndexConnection === null)  return false;
	paletteIndexConnection.onFileLoad=function()  {
		connections.noneGiven=true;
		var paletteIndex;
		if (typeof this.responseText === 'string'  &&  this.responseText!=="")  {
			paletteIndex=this.responseText.split("\n");
			for (const path of paletteIndex)  {
				if ( path!==""
				&&   loadPalettes.paletteMask.test(path)
				&&   !loadPalettes.trashMask.test(path)
				&&  ( !loadPalettes.userPaletteMask.test(path)
					||  loadPalettes.autoloadPaletteMask.test(path) ) )  {
					const connection=SoftMoon.WebWare.HTTP.Connection($path+path);
					connection.onFileLoad=$addPalette;
					connection.loadError=$loadError;
					connection.onMultiple=$onMultiple;
					connections.noneGiven=false;
					connections.push(connection);
					connector.commune(connection);  }  }  }
		if (typeof $onIndexLoad === 'function')  $onIndexLoad(connections, paletteIndex, this.responseText);  };
	paletteIndexConnection.loadError=$loadError;
	paletteIndexConnection.onMultiple=$onMultiple;
	connections.connector=connector;
	connections.paletteIndexConnection=paletteIndexConnection;
	connector.commune(paletteIndexConnection);
	return connections;  }
SoftMoon.WebWare.loadPalettes.paletteNameExtension='.palette.json';
SoftMoon.WebWare.loadPalettes.paletteMask= /^(.+\/)?([^\/]+)\.palette\.json$/i
SoftMoon.WebWare.loadPalettes.userPaletteMask= /\/users\/|(^users\/)/i
SoftMoon.WebWare.loadPalettes.autoloadPaletteMask= /\/autoload\/|(^autoload\/)/i
SoftMoon.WebWare.loadPalettes.trashMask= /\/trash\/|(^trash\/)/i


// This function will return an initially empty array, with three added properties:  db,  store,  paletteIndexRequest.
// Once the index is asynchronously loaded, the array will fill with database request (IDBRequest) objects, one for each palette being loaded.
SoftMoon.WebWare.loadDBPalettes=function loadDBPalettes($DB, $store,  // ←required  ↓all optional on next line
																												$onIndexLoad, $addPalette, $loadError)  {
	if (typeof $addPalette !== 'function')  $addPalette=SoftMoon.WebWare.addPalette;
	const dbFiles=new Array;
	dbFiles.db=$DB;
	dbFiles.store=$store;
	dbFiles.paletteIndexRequest=$DB.transaction($store).objectStore($store).getAllKeys();
	dbFiles.paletteIndexRequest.onerror=$loadError;
	dbFiles.paletteIndexRequest.onsuccess=function()  {
		if (this.result.length===0)  dbFiles.noneGiven=true;
		else  {
			dbFiles.push(...this.result);
			const trans=$DB.transaction($store);
			for (let i=0; i<dbFiles.length; i++)  {
				const filename=dbFiles[i];
				dbFiles[i]=trans.objectStore($store).get(dbFiles[i]);
				dbFiles[i].filename=filename;
				dbFiles[i].onerror=$loadError;
				dbFiles[i].onsuccess=$addPalette;  }  }
		if (typeof $onIndexLoad === 'function')  $onIndexLoad(dbFiles);  };
	return dbFiles;  }

SoftMoon.WebWare.addPalette=function($json_palette)  {
	if ($json_palette instanceof Event)  $json_palette= this.responseText  ||  this.result?.JSON;
	// JSON.parse will not allow for custom methods; eval can be dangerous and slow and “unstrict”, but may be necessary for your implementation.
//	if (typeof json_palette == 'string')  json_palette=eval("("+json_palette+")");
	if (typeof $json_palette === 'string')  $json_palette=JSON.parse($json_palette);
	if (typeof $json_palette === 'object')
		for (const paletteName in $json_palette)  {
			if ( (paletteName==='filename'  ||  paletteName==='comments')
			&&  typeof $json_palette[paletteName] === 'string')
				continue;
			SoftMoon.palettes[paletteName]= new SoftMoon.WebWare.Palette($json_palette[paletteName]);
			$json_palette[paletteName]=SoftMoon.palettes[paletteName];  }
	else  throw new TypeError('Can not add SoftMoon.palette: ',$json_palette);
	return $json_palette;  }



//=================================================================================================\\


{  //open a private namespace until the END-OF-FILE

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

const h_=  '\\s*(-?[0-9]+(?:\\.[0-9]*)?|-?0?\\.[0-9]+)(deg|°|g?rad|ᴿ|ᶜ|ᵍ|%|turn|●)?\\s*',    //captures the postfix text (i.e. the “unit”) separately  →  m[1]='123' , m[2]='deg'
			h='\\s*((?:-?[0-9]+(?:\\.[0-9]*)?|-?0?\\.[0-9]+)(?:deg|°|g?rad|ᴿ|ᶜ|ᵍ|%|turn|●)?)\\s*';  //does not capture postfix text separately: it is included with the numerical data  →  m[1]='123deg'
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




//===============================================================
//  These functions are shared by the Color objects and RGB_Calc


	// make sure the color’s value is an integer; and in the boundaries of 0-255; if not, “reflect” it back or “truncate”.
function getByteValue(v)  {
	var isNotPercent=true;  // or a factor…
	if (typeof v === 'string')  {
		if (v.substr(-1)==='%')  {v=parseFloat(v)*2.55;  isNotPercent=false;}
		else  v=parseFloat(v);  }
	else if (v instanceof Number)  switch (v.unit)  {// this experimental property name is subject to change
		case "%": v=v*2.55;  isNotPercent=false;  break;
		case "factor": v=v*255;  isNotPercent=false;  break;  }
	if (this.config.inputAsFactor  &&  isNotPercent  /* &&  v<=1  &&  v>=0 */)  v=v*255;
	if (this.config.reflect)  {v=Math.abs(v);  while (v>255)  {v=Math.abs(255-(v-255));}}
	else {
		if (v>255)  v=255;
		else if (v<0)  v=0;  }
	return  this.config.roundRGB ? Math.round(v) : v;  }

function getHueFactor(h)  {
	var m, unit=this.config.hueAngleUnit;
	if (typeof h === 'string')  {
		if (m=h.match( RegExp.Hue ))  {h=parseFloat(m[1]);  unit= (m=m[2]) || unit;}
		else {console.error('bad hue:'+h+'  unit: '+unit);  return false;  }  }
	else if (h instanceof Number  &&  (h.unit in hueAngleUnitFactors))
		unit=h.unit;  // this experimental property name is subject to change
	if ( (this.config.inputAsFactor  &&  !m)
	||  unit==='turn'  ||  unit==="●" )
	// in the future, all grayscale may be hue=1 instead of hue=0
	//     (v<0 || v>=1)
		return Math.sawtooth(1,h);
	return  hueAngleUnitFactors[unit] ?  Math.sawtooth(hueAngleUnitFactors[unit], h)/hueAngleUnitFactors[unit] : false;  }

function getFactorValue(v)  {
	v= (this.config.inputAsFactor
		&&  (typeof v !== 'string'  ||  !v.endsWith("%"))
		&&  (!(v instanceof Number)  ||  v.unit!=='%'))  ?  // this experimental property name is subject to change
		parseFloat(v)  :  (parseFloat(v)/100);
	return (v<0 || v>1) ? false : v;  }

function getAlphaFactor(v)  {
	v= ((typeof v !== 'string'  ||  !v.endsWith("%"))
		&&  (!(v instanceof Number)  ||  v.unit!=='%'))  ?  // this experimental property name is subject to change
		parseFloat(v)  :  (parseFloat(v)/100);
	return (v<0 || v>1) ? false : v;  }

function factorize(a, stop, start)  {
	if (this.config.preserveInputArrays)	a=Array.from(a);
	if (start  &&  (a[0]=this.getHueFactor(a[0])) === false)  return false;
	for (var tmp, i=start||0; i<stop; i++)  {
		if ( (tmp=this.getFactor(a[i])) === false )  return false;
		else  a[i]=tmp;  }
	if (a[stop] !== undefined)  {
		if ((tmp=getAlphaFactor(a[stop]))===false)  return false
		else a[stop]=tmp;  }
	return a;  }

// Add-on Alpha values are non-standard and defined on Palette color names:  blue, 75%;
// If the RGB-color that the the color-name defines already has an alpha value defined,
// we can multiply-in the add-on alpha in any customized way.
//function multiplyAddOnAlpha(a1, a2) {return a1-a2*(1-a1);},
function multiplyAddOnAlpha(a1, a2) {return a1*a2;}

// If you create your own Color object class (see the .config _Factory pointers),
// you may need to also update/replace this function to work with them.
function applyAlpha(c_o, a, source)  {
	// Our color object will define an RGB value
	if (c_o instanceof Array)  {
		if (typeof c_o[3] === 'number'  ||  c_o[3] instanceof Number)
			c_o[3]=this.multiplyAddOnAlpha(c_o[3], a);
		else  c_o[3]=a;
		return c_o;  }
	if ('alpha' in c_o)  {
		if (typeof c_o.alpha === 'number'  ||  c_o.alpha instanceof Number)
			c_o.alpha=this.multiplyAddOnAlpha(c_o.alpha, a);
		else  c_o.alpha=a;
		return c_o;  }
	return this.config.onError('Can not apply add-on alpha to unknown Color object. ', source);  }


//===============================================================


const MSG_noAddOnAlpha='Can not add on alpha values to named colors.';


SoftMoon.WebWare.RGB_Calc=RGB_Calc;
function RGB_Calc($config, $quickCalc, $mini)  {
	if (!new.target)  throw new Error('RGB_Calc is a constructor, not a function.');
//     The calc function (below) returns a color-object of your choice according to calc.config.RGBA_Factory
//
//     The calc function input can accept color definitions in many ways:
// • as three distinct RGB values (pass in three distinct arguments) (a forth alpha value is optional)
//    These RGB values may be byte values (0-255), percent values with % sign (0%-100%), or factor values (0-0.999………).
//  === options below require passing in ¡only! one argument ===
// • as three distinct RGB values passed in as an array indexed 0,1,2 (see note above)
// • as a string representing the 6-digit hexadecimal RGB color value (with or without the leading #)
// • as a string of three comma-separated RGB values "v¹, v², v³" (see RegExp section at top)
// • as a string of four comma-separated RGBA values "v¹, v², v³, v4" (see RegExp section at top)
// • as a string — standard formats for naming colors using color-models or Palettes (see RegExp section at top)
// • as a string specifying a color name on found the default Palette (the default Palette must be loaded)
//    (note that the CSS palette is the initial (default) “default Palette”)
// NOTE: that while byte values passed in should technically be (int) in the range of 0-255,
//  when passed in as 3 individual values or as an array of 3 values, values outside this range
//  are allowed, but are “truncated” or “reflected” back into the legal range.  (float)s are rounded to (int)s.
// You can also pass in a simple Array of values for another color-space besides RGB
//  by passing the Array with a .colorSpace property with a string specifying the specific space.
//
	const calc= ($quickCalc) ? this : function ($string)  {  // ← defining a color in multiple color-space formats
//                                // alternate arguments format shown below
//                  (r, g, b, a)
//                  ([r,g,b,a])
//                  (r, g, b)
//                  ([r,g,b])
			var matches, pClr;
			if (arguments.length===1)  {
				if ($string == null)  return null;
				if (typeof $string === 'string')  {
					if (RegExp.isHex.test($string))
							return calc.from.hex($string);
					if ((SoftMoon.palettes[SoftMoon.defaultPalette] instanceof SoftMoon.WebWare.Palette)
					&&  (pClr=$string.match(RegExp.addOnAlpha))
					&&  (matches=SoftMoon.palettes[SoftMoon.defaultPalette].getColor(pClr[1])) )  {
						calc.config.stack(SoftMoon.palettes[SoftMoon.defaultPalette].config);
						try {
							if (pClr[2]  &&  calc.config.forbidAddOnAlpha)
								return calc.config.onError($string, undefined, MSG_noAddOnAlpha)
							matches=calc(matches);  }
						finally {calc.config.cull();}
						if (matches)  {
							matches.palette=SoftMoon.defaultPalette;
							matches.colorName=pClr;
							if (pClr[2])  matches=calc.applyAlpha(matches, calc.getAlpha(pClr[2]), 'Palette color');  }
						return matches;  }
					if (matches=($string.match(RegExp.stdWrappedColor)  ||  $string.match(RegExp.stdPrefixedColor)))  {
						matches[1]=matches[1].trim().toLowerCase();
						if (typeof calc.from[matches[1]] === 'function')  {
							return calc.from[matches[1]](matches[2]);       }
						for (const p in SoftMoon.palettes)  {
							if (p.toLowerCase()===matches[1]  &&  (SoftMoon.palettes[p] instanceof SoftMoon.WebWare.Palette))  {
								matches=matches[2].match(RegExp.addOnAlpha);
								const name=matches[1], a=matches[2];
								calc.config.stack(SoftMoon.palettes[p].config);
								try {
									if (a  &&  calc.config.forbidAddOnAlpha)
										return calc.config.onError($string, undefined, MSG_noAddOnAlpha)
									matches=calc(SoftMoon.palettes[p].getColor(name));  }
								finally {calc.config.cull();}
								if (matches)  {
									matches.palette=p;
									matches.colorName=name;
									if (a)  matches=calc.applyAlpha(matches, calc.getAlpha(a), 'Palette color');  }
								return matches;  }  }  }  }
				if (arguments[0] instanceof Array  &&  typeof calc.from[arguments[0].colorSpace] === 'function')
					return calc.from[arguments[0].colorSpace](arguments[0]);  }
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
	name: 'RGB_Calc.ConfigStack',

//  for the RGB color model,
//  depending on the flag below,
//  values passed in outside the range of 0-255 are “reflected” or “truncated” back into the correct range.
	reflect: false,

//  for the RGB color model,
//  depending on the flag below,
//  values may be rounded to integers or left as floating-point values.
	roundRGB: false,

	inputShortHex: false,

/* This controls how RGB_Calc interprets == “audit” == values,
 * which are by definition here from an “outside” source (user input, palette files, etc.).
 * RGB_Calc always interprets == “quick” == values as bytes or factors, depending on the color-space;
 * they are by definition from the “local” program, and it can convert them before hand as needed.
 * By default (inputAsFactor=false) an “audit” RGB_Calc interprets == strings == as a “loose” CSS string.
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

/* When you pass an Array into an “audit” calculator,
 * it will interpret the values and may convert them into factors from 0–1
 * You may want to have access to those converted values,
 * or you may want to preserve the original values: your choice.
 * RGB Arrays are always preserved.
 */
	preserveInputArrays: true,

/*
 * the  hueAngleUnit  default is overridden by  inputAsfactor  when input values have undeclared units
 *
 * default input unit for calculators.  default output unit for ColorWheel_Color objects.
 * Valid units are listed (below) as property keys of  SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors
 */
	hueAngleUnit: 'deg',

//  when outputting RGB Hex values, this flag determines the format:  A1B2C3  or  #A1B2C3
	useHexSymbol: true,

//  If no alpha is defined (===undefined) when doing a conversion, the defaultAlpha
//  will be defined by RGB_Calc in the output object instance (i.e. the Array, RGBA_Color, ColorWheel_Color, or CMYKA_Color)
//  If no alpha is defined (===undefined) when doing a conversion AND the defaultAlpha===undefined,
//  no alpha value at all will be passed to the output object instance;
//  this will affect the  .length  properties of Arrays.
//  Alpha values may be just about anything, including null, as used internally.
//  Also, RGBA_Color, ColorWheel_Color, and CMYKA_Color  constructors   use this in a similar way.
//  With those color objects, the defaultAlpha is used for the internal alpha value.
//  However note, when those objects output a string, and string format requires an alpha value
//  and none is found to be  numeric  a default value of 100% is used.
	defaultAlpha: undefined,

/*For named (palette) colors
 *we can allow an add-on alpha or not.
 *If a named color’s value is RGBA(50%, 55%, 70%, 80%)
 *and it is in the “Sky” palette and its name is “clouds”
 *auditing calculators can use the following spec:
 *Sky: clouds / 84% opacity;
 */
	forbidAddOnAlpha: false,

//  You may want to use  Array  or create your own Class constructor for any of these Factories
	RGBA_Factory: RGBA_Color,
	HSLA_Factory: HSLA_Color,
	HSBA_Factory: HSBA_Color,
	HSVA_Factory: HSVA_Color,
	HWBA_Factory: HWBA_Color,
	HCGA_Factory: HCGA_Color,
	CMYKA_Factory: CMYKA_Color,
/*
 *The 7 factory pointers (above) control the output of the RGB_Calc–functions and its instances.
 *
 * //this example provides a calculator that returns RGB output as a simple array of values, instead of the default RGBA_Color object instance:
 * myCalc=new SoftMoon.WebWare.RGB_Calc({RGBA_Factory:Array});
 *
 * //this example provides a calculator that returns an RGBA_Color object instance that outputs hex using the # symbol, regardless of the universal default:
 * myCalc=new SoftMoon.WebWare.RGB_Calc;
 * myCalc.config.RGBA_Factory=function(r,g,b,a)  {return new SoftMoon.WebWare.RGBA_Color(r,g,b,a,{useHexSymbol:true})};
 */

	onError: function(clr, ct, msg)  {
		var message;
		if (this.throwErrors  ||  this.logErrors)  {
			if (msg)  message=msg+' Color: '+clr;
			else  message= ct ?  ('Bad values for '+ct+' conversion: “'+clr+'”.')
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
	name: {value:"RGB_Calc.ConfigStack"},
	constructor: {value:RGB_Calc.ConfigStack},
	stack: { value: function($newConfig) {
			return this.owner.config=Object.create(this, $newConfig);  }  },
	cull: { value: function() {
			if (!this.hasOwnProperty("owner"))  this.owner.config=Object.getPrototypeOf(this);
			return this.owner.config;  }  },
	reset: { value: function() {
			while (!this.owner.config.hasOwnProperty("owner"))  {
				this.owner.config=Object.getPrototypeOf(this.owner.config);  }
			return this.owner.config;  }  }  } );



RGB_Calc.config=new RGB_Calc.ConfigStack(RGB_Calc);



//===============================================================
// these are worker methods of a calculator
const defem={
	getByte:     {value: getByteValue},
	getFactor:   {value: getFactorValue},
	getHueFactor:{value: getHueFactor},
	getAlpha:    {value: getAlphaFactor},
	factorize:   {value: factorize},
	applyAlpha:  {value: applyAlpha},
	multiplyAddOnAlpha: {value: multiplyAddOnAlpha},
	convertColor:{value: convertColor}  /*for plug-ins*/
	};
Object.defineProperties(RGB_Calc, defem);
Object.defineProperties(RGB_Calc.prototype, defem);


const hueAngleUnitFactors=
RGB_Calc.hueAngleUnitFactors=  //you may add to these …but replacing them altogether does nothing…
	Object.defineProperties(new Object, {
		'deg':  {value: 360,       enumerable: true},
		"°":    {value: 360,       enumerable: true},
		'rad':  {value: 2*Math.PI, enumerable: true},
		"ᶜ":    {value: 2*Math.PI, enumerable: true},
		"ᴿ":    {value: 2*Math.PI, enumerable: true},
		'grad': {value: 400,       enumerable: true},
		'ᵍ':    {value: 400,       enumerable: true},
		"%":    {value: 100,       enumerable: true},
		'turn': {value: 1,         enumerable: true},
		"●":    {value: 1,         enumerable: true}  });


RGB_Calc.outputRGB=
RGB_Calc.prototype.outputRGB= outputRGB;

const round=Math.round;

function outputRGB(r,g,b,a)  {
	if (this.config.roundRGB)  {
			r=round(r); g=round(g); b=round(b);  }
	//When RGBA_Factory=Array we don’t want the length property to be ===4 with an undefined alpha.
	if (a===undefined  &&  (a=this.config.defaultAlpha)===undefined)
		return new this.config.RGBA_Factory(r,g,b);
	else
		return new this.config.RGBA_Factory(r,g,b,a);  }


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




// This object’s properties are conversion functions.
// You may add to them………for your convenience
Object.defineProperty(RGB_Calc, 'to', {
	enumerable: true,
	value: Object.create(RGB_Calc, {definer: {value: { quick: {}, audit: {} }}})  });

function convertColor(args, converter, model) {
	var _color;
	this.config.stack({RGBA_Factory: {value:Array}});
	try {_color=this.$(args[0]);}
	finally {this.config.cull();}
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
function toHSV(rgb, model='HSV')  {  //RGB from 0 to 255   HSV results from 0 to 1   alpha should be 0 <= a <= 1
	//note  model  is used here internally, and is not meant to be a passed parameter, unless it is "HSB"
	var H, S;
	const
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
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

	if (A===undefined)  return new this.config[model+"A_Factory"](H,S,V);
	else  return new this.config[model+"A_Factory"](H,S,V,A);  }


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
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
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

	if (A===undefined)  return new this.config.HSLA_Factory(H,S,L);
	else  return new this.config.HSLA_Factory(H,S,L,A);  }


RGB_Calc.to.hcg=toHCG;
RGB_Calc.to.definer.quick.hcg={value:toHCG};
RGB_Calc.to.definer.audit.hcg={value: function() {return convertColor.call(this, arguments, toHCG, 'hcg');}};
function toHCG(rgb)  {  //RGB from 0 to 255   Hue, Chroma, Gray (HCG) results from 0 to 1   alpha should be 0 <= a <= 1
	var H, C, G;
	const
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
	r = ( rgb[0] / 255 ),
	g = ( rgb[1] / 255 ),
	b = ( rgb[2] / 255 ),
	high = Math.max( r, g, b ),
	low  = Math.min( r, g, b );

	if ( high === low )  {  //This is a gray, no chroma...
//		H = 0;  C = 0;  G = high;  }
		H = 1;  C = 0;  G = high;  }
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

	if (A===undefined)  return new this.config.HCGA_Factory(H,C,G);
	else  return new this.config.HCGA_Factory(H,C,G,A);  }


RGB_Calc.to.hwb=toHWB;
RGB_Calc.to.definer.quick.hwb={value:toHWB};
RGB_Calc.to.definer.audit.hwb={value: function() {return convertColor.call(this, arguments, toHWB, 'hwb');}};
function toHWB(rgb)  {  //RGB from 0 to 255   Hue, White, Black (HWB) results from 0 to 1   alpha should be 0 <= a <= 1
	var H, C, G;
	const
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
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

  if (A===undefined)  return new this.config.HWBA_Factory(H, low, 1-high);
	else  return new this.config.HWBA_Factory(H, low, 1-high, A);  }


RGB_Calc.to.cmyk=toCMYK;
RGB_Calc.to.definer.quick.cmyk={value:toCMYK};
RGB_Calc.to.definer.audit.cmyk={value: function() {return convertColor.call(this, arguments, toCMYK, 'cmyk');}};
function toCMYK(rgb)  {  //RGB from 0 to 255    CMYK results from 0 to 1   alpha should be 0 <= a <= 1
	var C, M, Y, K, A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3];
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
	if (A===undefined)  return new this.config.CMYKA_Factory(C,M,Y,K);
	else  return new this.config.CMYKA_Factory(C,M,Y,K,A);  }



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
	if (a === undefined  &&  (a=this.config.defaultAlpha) === undefined)
		return new this.config.RGBA_Factory(this.getByte(r), this.getByte(g), this.getByte(b));
	else
		return new this.config.RGBA_Factory(this.getByte(r), this.getByte(g), this.getByte(b), this.getAlpha(a));  }


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


let r, g, b;
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
	if (typeof $cwc === 'string')
		if (matches=($cwc.match(this.config.inputAsFactor ? RegExp.threeFactors_A : RegExp.ColorWheelColor_A)))
			$cwc=matches.slice(1);
		else  return this.config.onError($cwc, model);
	return  this.factorize($cwc,3,1)  ||  this.config.onError($cwc, model);  }

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
	//return  (this.factorize($cmy,3)  &&  fromCMY.call(this, $cmy))  ||  this.config.onError($cmy, 'CMY');  }  };
	return  (($cmy=this.factorize($cmy,3))  &&  fromCMY.call(this, $cmy))  ||  this.config.onError($cmy, 'CMY');  }  };
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
	//return  (this.factorize($cmyk,4)  &&  fromCMYK.call(this, $cmyk))  ||  this.config.onError($cmyk, 'CMYK');  }  };
	return  (($cmyk=this.factorize($cmyk,4))  &&  fromCMYK.call(this, $cmyk))  ||  this.config.onError($cmyk, 'CMYK');  }  };
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

/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/



/*
	This is meant to be a universal object that can be
	 compatibly passed through different libraries without hassle………♪♫ hopefully ♫♪ ☻☺☻☺ ♦♥♣♠♂♀ ☺☻☺☻
*/
SoftMoon.WebWare.RGBA_Color=RGBA_Color;
function RGBA_Color($r, $g, $b, $a, $config)  {
	if (!new.target)  throw new Error('SoftMoon.WebWare.RGBA_Color is a constructor, not a function.');
	this.config= new RGBA_Color.ConfigStack(this, $config);
	const ThisColorObject=this,
			rgb=new Array,
			rgba=new Array;
	if (typeof $a === undefined)  $a=this.config.defaultAlpha;
	Object.defineProperties(rgb, {
		0: {get: function() {return $r;},  set: function($red) {$r=ThisColorObject.getByte($red);},  enumerable: true},
		1: {get: function() {return $g;},  set: function($grn) {$g=ThisColorObject.getByte($grn);},  enumerable: true},
		2: {get: function() {return $b;},  set: function($blu) {$b=ThisColorObject.getByte($blu);},  enumerable: true}  });
	Object.defineProperties(rgba, {
		0: {get: function() {return $r;},  set: function($red) {$r=ThisColorObject.getByte($red);},  enumerable: true},
		1: {get: function() {return $g;},  set: function($grn) {$g=ThisColorObject.getByte($grn);},  enumerable: true},
		2: {get: function() {return $b;},  set: function($blu) {$b=ThisColorObject.getByte($blu);},  enumerable: true},
		3: {get: function() {return $a;},  set: function($alf) {$a=ThisColorObject.getAlpha($alf);},  enumerable: true}  });
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
		contrast: {get: contrastRGB.bind(ThisColorObject, rgba),  enumerable: true},
		shade: {get: shadeRGB.bind(ThisColorObject, rgba),  enumerable: true},
		to: {enumerable: true,  value: Object.defineProperties(new Object, {
			hsv:  {get:  toHSV.bind(ThisColorObject, rgba),  enumerable: true},
			hsb:  {get:  toHSB.bind(ThisColorObject, rgba),  enumerable: true},
			hsl:  {get:  toHSL.bind(ThisColorObject, rgba),  enumerable: true},
			hcg:  {get:  toHCG.bind(ThisColorObject, rgba),  enumerable: true},
			cmyk: {get: toCMYK.bind(ThisColorObject, rgba),  enumerable: true}  })}  });
	};

Object.defineProperties(RGBA_Color.prototype, {
		getByte: {value: getByteValue},
		getAlpha: {value: getAlphaFactor}  });

RGBA_Color.prototype.useHexSymbol=function(flag)  {this.config.useHexSymbol=Boolean.eval(flag, true);  return this;}

RGBA_Color.prototype.toString=function(format) {
	if (typeof format !== 'string')  format="";
	format+= " "+this.config.stringFormat;
	const
		alpha= (typeof this.a === 'number'
						||  ( ( /alpha/i ).test(format)
								 &&  (this.a= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1) ))  ?  'A' : "";
	var s, outAs=format.match( /hex|#|css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
	if (outAs) outAs=outAs[0].toLowerCase();
	if (outAs!=='hex'  &&  outAs!=='#')  {
		if (( /percent/i ).test(format)  &&  !( /byte.*percent/i ).test(format))
			s=Math.roundTo(1, this.r/2.55)+'%, '+
				Math.roundTo(1, this.g/2.55)+'%, '+
				Math.roundTo(1, this.b/2.55)+'%'+
				(alpha ? (', '+Math.roundTo(3, this.a*100)+'%') : "");
		else
		if (outAs!=='css'  &&  outAs!=='html'
		&&  ( /factor/i ).test(format)  &&  !( /byte.*factor/i ).test(format))
			s=Math.roundTo(3, this.r/255)+', '+
				Math.roundTo(3, this.g/255)+', '+
				Math.roundTo(3, this.b/255)+
				(alpha ? (', '+Math.roundTo(3, this.a)) : "");
		else
			s=Math.round(this.r)+', '+
				Math.round(this.g)+', '+
				Math.round(this.b)+
				(alpha ? (', '+
							(( /factor/i ).test(format)  &&  !( /percent.*factor/i ).test(format) ?
									Math.roundTo(3, this.a)
								: Math.roundTo(1, this.a*100)+'%'))
						: "");  }
	switch (outAs)  {
	case '#':
	case 'hex':  return (format.includes('#')  ||  this.config.useHexSymbol ? "#" : "") + this.hex;;
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

RGBA_Color.ConfigStack=class extends RGB_Calc.ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
RGBA_Color.ConfigStack.prototype.name='RGBA_Color.ConfigStack';
RGBA_Color.ConfigStack.prototype.stringFormat='self';


let lockCWCs=true;  //this is used by ColorWheel_Colors to prevent improper usage.

SoftMoon.WebWare.ColorWheel_Color=ColorWheel_Color;
function ColorWheel_Color($config)  {  //this way is called by the child-Classes when lockCWCs=false
//                       ($H, $_1, $_2, $A, $config, $model)  {  //this way is called by external code; it releases the names of the individual _Color objects
	if (new.target===ColorWheel_Color)  switch (arguments[5])  {
		case 'HSL': return new HSLA_Color(...arguments);
		case 'HSB': return new HSBA_Color(...arguments);
		case 'HSV': return new HSVA_Color(...arguments);
		case 'HCG': return new HCGA_Color(...arguments);
		case 'HWB': return new HWBA_Color(...arguments);
		default: throw new Error('Unknown ColorWheel_Color model:',arguments[5]);  }
	if (lockCWCs  &&  !new.target)  throw new Error('ColorWheel_Color is a Class constructor, not a function.');
	lockCWCs=true;
	this.config= new ColorWheel_Color.ConfigStack(this, $config);  }

Object.defineProperties(ColorWheel_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor}  });

ColorWheel_Color.prototype.toString=function(format)  {
	if (typeof format !== 'string')  format="";
	format+= " "+this.config.stringFormat;
	var
		outAs=format.match( /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i ),
		u=format.match( /deg|°|g?rad|ᴿ|ᶜ|ᵍ|%|turn|●|factor/ ),
		hueAngleUnit= u ? u[0] : this.config.hueAngleUnit,
		useSym=this.config.useAngleUnitSymbol,
		alpha= (typeof this.a === 'number'
						||  ( ( /alpha/i ).test(format)
								 &&  (this.a= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1) ))  ?  'A' : "";
	if (outAs)  outAs=outAs[0].toLowerCase();
	if (outAs==='html')  outAs='css';
	const
		arr=this[this.model.toLowerCase()],
		sep= (this.model.toLowerCase()==='hwb' &&  outAs==='css') ? ' ' : ', ',     // ¡curses to the folks who de-standardized this specification!
		aSep= (this.model.toLowerCase()==='hwb' &&  outAs==='css') ? ' / ' : ', ';  // ¡curses to the folks who de-standardized this specification!
	if (hueAngleUnit==='factor')  hueAngleUnit='turn';
	if (outAs==='css')  useSym=false;
	if (typeof useSym  === 'boolean')
		switch (hueAngleUnit)  {
		case 'deg':
		case "°":  hueAngleUnit= useSym ? "°" : 'deg';
		break;
		case 'rad':
		case "ᶜ":
		case "ᴿ":  hueAngleUnit= useSym ? "ᴿ" : 'rad';
		break;
		case 'grad':
		case "ᵍ":   hueAngleUnit= useSym ? "ᵍ" : 'rad';
		break;
		case 'turn':
		case "●":  hueAngleUnit= useSym ? "●" : 'turn';  }
	var s=Math.roundTo(hueUnitPrecision[hueAngleUnit], this.hue*hueAngleUnitFactors[hueAngleUnit]) + hueAngleUnit + sep;
	if (outAs!=='css'  &&  ( /factor/i ).test(format)  &&  !( /percent.*factor/i ).test(format) )
		s+=Math.roundTo(3, arr[1]) + sep + Math.roundTo(3, arr[2]) + (alpha && aSep+Math.roundTo(3, this.alpha));
	else
		s+=Math.roundTo(1, arr[1]*100) + '%' + sep + Math.roundTo(1, arr[2]*100) + '%' + (alpha && aSep+Math.roundTo(1, this.alpha*100)+'%');
	if (outAs==='css'  &&  this.model.toLowerCase()==='hwb')  alpha="";  // ¡curses to the folks who de-standardized this specification!
	switch (outAs)  {
	case 'css':
	case 'wrap':
	case 'function':  return this.model.toUpperCase()+alpha+'('+s+')';;
	case 'prefix':    return this.model.toUpperCase()+alpha+': '+s
	case 'csv':
	case 'commas':  return s;
	case 'plain':  return s.replace( /,/g , "");
	case 'tabbed':  return s.replace( /, /g , "\t");
	case 'self':
	default:  return this.model.toUpperCase()+'_Color: ('+s+')';  }  }

const hueUnitPrecision=
ColorWheel_Color.hueUnitPrecision=
	Object.defineProperties(new Object, {
		'deg':  {value: 2, enumerable: true},
		"°":    {value: 2, enumerable: true},
		'grad': {value: 2, enumerable: true},
		'ᵍ':    {value: 2, enumerable: true},
		'rad':  {value: 5, enumerable: true},
		"ᶜ":    {value: 5, enumerable: true},
		"ᴿ":    {value: 5, enumerable: true},
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

ColorWheel_Color.ConfigStack=class extends RGB_Calc.ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
ColorWheel_Color.ConfigStack.prototype.name='ColorWheel_Color.ConfigStack';
//  for (HSL, HSB, HSV, HCG, and HWB) ColorWheel_Color Objects,
//  depending on the Boolean status of the flag below,
//  you may output hues (via the toString() method) with a:
//   • symbol: (0° - 359.999…°)
//   • textual suffix: (0deg - 359.999deg)  ← when applicable for the hue-angle-unit
//  by default (null) the hue-angle-unit is not altered.
ColorWheel_Color.ConfigStack.prototype.useAngleUnitSymbol=null;
ColorWheel_Color.ConfigStack.prototype.stringFormat="self";
ColorWheel_Color.ConfigStack.prototype.inputAsFactor=true;  //values are stored internally and returned as factors; we want to match that.


SoftMoon.WebWare.HSBA_Color=HSBA_Color;
function HSBA_Color($H,$S,$B,$A, $config)  {lockCWCs=false;  return HSVA_Color.call(this, $H,$S,$B,$A, $config, "HSB");}
HSBA_Color.prototype=Object.create(ColorWheel_Color.prototype, {
	name: {value:"HSBA_Color"},
	constructor: {value:HSBA_Color}  });

SoftMoon.WebWare.HSVA_Color=HSVA_Color;
function HSVA_Color($H,$S,$V,$A, $config, $model="HSV")  {
	$model= ((typeof $model === 'string') && ($model=$model.match( /HSV|HSB/i )) && $model[0].toUpperCase())  ||  'HSV';
	if (lockCWCs  &&  !new.target)  throw new Error('SoftMoon.WebWare.'+$model+'A_Color is a constructor, not a function.');
	lockCWCs=false;
	ColorWheel_Color.call(this, $config);
	const thisClr=this,
				hsv=new Array,  hsva=new Array;
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
		to: {enumerable: true,  value: Object.defineProperties(new Object,  {
			rgb:  {get:  fromHSV.bind(thisClr, hsva),  enumerable: true},
			cmyk: {get: HSV_to_CMYK.bind(thisClr, hsv),  enumerable: true}  }  )}  });  }
HSVA_Color.prototype=Object.create(ColorWheel_Color.prototype, {
	name: {value:"HSVA_Color"},
	constructor: {value:HSVA_Color}  });


Object.defineProperties(HSVA_Color, {  //this provides a static globally accessible function unrelated to the HSVA_Color class
	to_CMYK: {value: HSV_to_CMYK,  enumerable: true},
	config: {value: {CMYKA_Factory: CMYKA_Color}}  });

function HSV_to_CMYK(hsv)  {
	//HSV values from 0 to 1
	//CMYK results from 0 to 1
	var x,h,c,m,y, k=1-hsv[2];
	if ( hsv[1] == 0 )  return new this.config.CMYKA_Factory(0,0,0,k);
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
	return new this.config.CMYKA_Factory(c,m,y,k, hsv[3]);  }


SoftMoon.WebWare.HSLA_Color=HSLA_Color;
function HSLA_Color($H,$S,$L,$A, $config)  {
	if (!new.target)  throw new Error('SoftMoon.WebWare.HSLA_Color is a constructor, not a function.');
	lockCWCs=false;
	ColorWheel_Color.call(this, $config);
	const thisClr=this,
				hsl=new Array,  hsla=new Array;
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
		alpha:      {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		to: {enumerable: true,  value: Object.defineProperty(new Object,
			'rgb',  {get:  fromHSL.bind(thisClr, hsla),  enumerable: true})}  });  };
HSLA_Color.prototype=Object.create(ColorWheel_Color.prototype, {
	name: {value:"HSLA_Color"},
	constructor: {value:HSLA_Color}  });


SoftMoon.WebWare.HCGA_Color=HCGA_Color;
function HCGA_Color($H,$C,$G,$A, $config)  {
	if (!new.target)  throw new Error('SoftMoon.WebWare.HCGA_Color is a constructor, not a function.');
	lockCWCs=false;
	ColorWheel_Color.call(this, $config);
	const thisClr=this,
				hcg=new Array,  hcga=new Array;
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
		alpha:  {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		to: {enumerable: true,  value: Object.defineProperty(new Object,
			'rgb',  {get:  fromHCG.bind(thisClr, hcga),  enumerable: true})}  });  };
HCGA_Color.prototype=Object.create(ColorWheel_Color.prototype, {
	name: {value:"HCGA_Color"},
	constructor: {value:HCGA_Color}  });


SoftMoon.WebWare.HWBA_Color=HWBA_Color;
function HWBA_Color($H,$W,$B,$A, $config)  {
	if (!new.target)  throw new Error('SoftMoon.WebWare.HWBA_Color is a constructor, not a function.');
	lockCWCs=false;
	ColorWheel_Color.call(this, $config);
	const thisClr=this,
				hwb=new Array,  hwba=new Array;
	Object.defineProperties(hwb, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $W;},  set: function($w) {$W=thisClr.getFactor($w);},  enumerable: true},
		2: {get: function() {return $B;},  set: function($b) {$B=thisClr.getFactor($b);},  enumerable: true}  });
	Object.defineProperties(hwba, {
		0: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		1: {get: function() {return $W;},  set: function($w) {$W=thisClr.getFactor($w);},  enumerable: true},
		2: {get: function() {return $B;},  set: function($b) {$B=thisClr.getFactor($b);},  enumerable: true},
		3: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true}  });
	function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $W=thisClr.getFactor($arr[1]);  $B=thisClr.getFactor($arr[2]);
		if ($arr[3] !== undefined)  $A=thisClr.getAlpha($arr[3]);  }
	Object.defineProperties(thisClr, {
		model: {value: "HWB",  enumerable: true},
		hwb: {get: function() {return hwb;},  set: readArr,  enumerable: true},
		hwba: {get: function() {return hwba;},  set: readArr,  enumerable: true},
		h: {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		w: {get: function() {return $W;},  set: function($w) {$W=thisClr.getFactor($w);},  enumerable: true},
		b: {get: function() {return $B;},  set: function($b) {$B=thisClr.getFactor($b);},  enumerable: true},
		a: {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		hue:    {get: function() {return $H;},  set: function($h) {$H=thisClr.getHue($h);},  enumerable: true},
		white: {get: function() {return $W;},  set: function($w) {$W=thisClr.getFactor($w);},  enumerable: true},
		black:  {get: function() {return $B;},  set: function($b) {$B=thisClr.getFactor($b);},  enumerable: true},
		alpha:  {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		to: {enumerable: true,  value: Object.defineProperty(new Object,
			'rgb',  {get:  fromHWB.bind(thisClr, hwba),  enumerable: true})}  });  };
HWBA_Color.prototype=Object.create(ColorWheel_Color.prototype, {
	name: {value:"HWBA_Color"},
	constructor: {value:HWBA_Color}  });



SoftMoon.WebWare.CMYKA_Color=CMYKA_Color;
function CMYKA_Color($C, $M, $Y, $K, $A, $config) {
if (SoftMoon.doLogBug1) console.log('CMYK_Color=',$C,$M,$Y,$K)
	if (!new.target)  throw new Error('SoftMoon.WebWare.CMYKA_Color is a constructor, not a function.');
	this.config= new CMYKA_Color.ConfigStack(this, $config);
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
		alpha:   {get: function() {return $A;},  set: function($a) {$A=thisClr.getAlpha($a);},  enumerable: true},
		to: {enumerable: true,  value: Object.defineProperty(new Object,
			'rgb',  {get:  fromCMYK.bind(thisClr, cmyka),  enumerable: true})}  });  };

Object.defineProperties(CMYKA_Color.prototype, {
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor}  });

CMYKA_Color.prototype.toString=function(format) {
	if (typeof format != 'string')  format="";
	format+= " "+this.config.stringFormat;
	var outAs=format.match( /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
	if (outAs)  outAs=outAs[0].toLowerCase();
	const
		alpha= (typeof this.a === 'number'
						||  ( ( /alpha/i ).test(format)
								 &&  (this.a= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1) ))  ?  'A' : "",
		s= (outAs!=='css'  &&  outAs!=='html'  &&  ( /factor/i ).test(format)  &&  !( /percent.*factor/i ).test(format) ) ?
			(Math.roundTo(3, this.c)+', '+Math.roundTo(3, this.m)+', '+Math.roundTo(3, this.y)+', '+Math.roundTo(3, this.k) +
				(alpha && ', '+Math.roundTo(3, this.a)))
		: (Math.roundTo(1, this.c*100)+'%, '+Math.roundTo(1, this.m*100)+'%, '+Math.roundTo(1, this.y*100)+'%, '+Math.roundTo(1, this.k*100)+'%' +
				(alpha && ', '+Math.roundTo(1, this.a*100)+'%'));
	switch (outAs)  {
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

CMYKA_Color.ConfigStack=class extends RGB_Calc.ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
CMYKA_Color.ConfigStack.prototype.name='CMYKA_Color.ConfigStack';
CMYKA_Color.ConfigStack.prototype.stringFormat="self";
CMYKA_Color.ConfigStack.prototype.inputAsFactor=true;  //values are stored internally and returned as factors; we want to match that.



}  //close the private namespace


//  most (except hcg) thanks to, and see for more formulas:  http://www.easyrgb.com/index.php?X=MATH
//  and except hwb: https://drafts.csswg.org/css-color/#the-hwb-notation

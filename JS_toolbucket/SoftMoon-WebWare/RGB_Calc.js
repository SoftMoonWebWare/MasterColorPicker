//  character encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160

// RGB_Calc.js  release 1.14.02  January 10, 2026  by SoftMoon WebWare.
// based on  rgb.js  Beta-1.0 release 1.0.3  August 1, 2015  by SoftMoon WebWare.
// All color-space conversion algorithms and code herein are either: public-domain, MIT-licenced, or both.
/*  Program written by and Copyright © 2011, 2012, 2013, 2016, 2018, 2020, 2022, 2023, 2024 Joe Golembieski, SoftMoon WebWare

		This program is licensed under the SoftMoon Humane Use License ONLY to “humane entities” that qualify under the terms of said license.
		For qualified “humane entities”, this program is free software:
		you can use it, redistribute it, and/or modify it
		under the terms of the GNU Affero General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version, with the following additional requirements
		ADDED BY THE ORIGINAL SOFTWARE CREATOR AND LICENSOR that supersede any possible GNU license definitions:
		This original copyright and licensing information and requirements must remain intact at the top of the source-code.

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

// requires  “+++.js”  ←in  JS_toolbucket/+++JS/
// requires  “+++Math.js”  ←in  JS_toolbucket/++JS/
// requires  “Björn_Ottosson.OK_color_space_models.js”  ←in  JS_toolbucket/
// requires  “Alexei_Boronine.HSLᵤᵥ_color_space_model.js”  ←in  JS_toolbucket/
// requires  “HTTP.js”  ←in  JS_toolbucket/SoftMoon-WebWare/    ← only when downloading color-palette tables from the web via ajax.
//  ↑ ↑ ↑                                                         They may be included in other ways.
//  ↑ ↑ ↑ This codebase does not initiate HTTP connections on its own.
//  ↑ ↑ ↑ Your host environment code must handle that and you must understand how use this codebase to do that and what that process does.

'use strict';

/*   The SoftMoon namespace Object is usually a constant defined in a “pinnacle” file somewhere else
const SoftMoon=Object.defineProperty({}, 'WebWare', {value:{}, enumerable:true});
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
					if (c.trim().toLowerCase()===$clr)  return this.palette[c].definition || this.palette[c];
					if (this.palette[c].aliases instanceof Array)  for (const alias of this.palette[c].aliases)  {
						if (alias.trim().toLowerCase()===$clr)  return this.palette[c].definition;  }
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
SoftMoon.WebWare.Palette.configProps=['inputAsFactor', 'hueAngleUnit', 'inputShortHex', 'defaultAlpha', 'forbidAddOnAlpha'];

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
	if (arguments[0] instanceof Event)  $json_palette= this.responseText  ||  this.result?.JSON;
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
/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/




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

// confirm and identify agents of the ===== CSS5  color()  function =====
RegExp.CSSColorFunction= new window.RegExp( /^\s*color\(\s*(\S{2,})\s+(.+)\s*\)\s*$/i );


//  For each of these RegExps below, the match returned will contain an array of the values,
// or the hex value without the leading # for RegExp.hex
//  matches=myString.match(RegExp.«model»)     where  «model» is the color-model type (hex, rgb, etc…)
// yields  matches = [0:complete match,  1:first value, 2:second value, 3:third value, etc…]
//  or if «model» is hex:
// yields  matches = [0:complete match,  1:six-digit hex value (without the leading #)]


/* hex:    where  x  is a hexadecimal digit 0-9 A-F  (case insensitive)
 *  and leading # symbol is optional & is ignored along with leading and trailing whitespace.
 */
//  "xxx"  ‖  "xxxx"  ‖  "xxxxxx"  ‖  "xxxxxxxx"
RegExp.isHex= new window.RegExp( /^\s*#?([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})\s*$/i );

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
			rgb='\\s*0*((?:' + byteVal + ')|(?:(?:' + pVal + ')%))\\s*?',
			_r_g_b_='\\s*0*((?:' + byteVal + ')|(?:(?:' + pVal + ')%)|[ _Ø∅*◊])\\s*?';

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
// this non-standard format allows "blank" or "undefined" channels of three types: a blank “space” or “_”; a nullset “Ø” or “∅”; a lozenge “◊”
// the blank and nullset are meant to mean no mods to that channel;
// the lozenge in meant to mean a placeholder that will be filled in - specifically when used with gradients.
// see also .config.allowUndefinedRGBChannels
RegExp._r_g_b_a_=new window.RegExp('^' +_r_g_b_+ "," +_r_g_b_+ "," +_r_g_b_+ '(?:' +"," + f + ')?$', "u");

//var p='\\s*0*((?:100|[0-9]{1,2}(?:\\.[0-9]*)?|\\.[0-9]+)%?)\\s*';   //no leading zeros in factors <1  (extras truncated)
//const p='\\s*0*?((?:' + pVal + ')%?)\\s*';  //one leading zero allowed in factors <1  (extras truncated)
const   p='\\s*0*((?:' + pVal + ')%?)\\s*';  //one leading zero allowed in factors <1  (extras truncated)

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
							//hsl,hsv,hsb,hcg,hwb:   "v¹, v², v³"  where
							// v¹=(±float)(unit),   and  ( 0 <= (float)(v²,v³) <= 100 )
							// →→→ v¹ may or may not have (unit);  v²,v³ may or may not end with a percent sign %
RegExp.hslᵤᵥ=
RegExp.hsl=
RegExp.hsv=
RegExp.hsb=
RegExp.hcg=
RegExp.hwb=
RegExp.ColorWheelColor=new window.RegExp( '^' +h+ sep +p+ sep +p+ '$', "u" );
RegExp.hslᵤᵥa=
RegExp.hsla=
RegExp.hsva=
RegExp.hsba=
RegExp.hcga=
RegExp.hwba=
RegExp.ColorWheelColorA=new window.RegExp( '^' +h+ sep +p+ sep +p+ aSep +f+ '$', "u" );
RegExp.hslᵤᵥ_a=
RegExp.hsl_a=
RegExp.hsv_a=
RegExp.hsb_a=
RegExp.hcg_a=
RegExp.hwb_a=
RegExp.ColorWheelColor_A=new window.RegExp( '^' +h+ sep +p+ sep +p+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.HWB=new window.RegExp( '^' +h+ " +" +p+ " +" +p+ '$', "u");
RegExp.HWBA=new window.RegExp( '^' +h+ " +" +p+ " +" +p+ ' +/ +' +f+ '$', "u");
RegExp.HWB_A=new window.RegExp( '^' +h+ " +" +p+ " +" +p+ '(?: +/ +' +f+ ')?$', "u");
RegExp.Hue=
RegExp.angle= new window.RegExp( '^' +h_+ '$', "u" );



const
	per125='(?:125(?:\\.0+)|12[0-4]|1[0-1]\\d|\\d{1,2})(?:\\.\\d+)?%',
	OK_ab='\\s*(-?0*(?:(?:' + pVal + ')%|0|\\.40*|\\.[0-3]\\d*))\\s*',
	OK_c='\\s*0*(' +per125+ '|\\.\\d+%|0|\\.50*|\\.[0-4]\\d*)\\s*',
	OK_f_C='\\s*0*((?:0|1|\\.\\d+%?)|' +per125+ ')\\s*?',
	OK_f_ab='\\s*(-?0*(?:0|1|\\.\\d+)|(?:' +pVal+ ')%)\\s*?';

RegExp.oklab_a=new window.RegExp( '^' +f+ sep +OK_ab+ sep +OK_ab+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.oklch_a=new window.RegExp( '^' +f+ sep +OK_c+ sep + h+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.oklab_factors_a=new window.RegExp( '^' +f +sep+ OK_ab +sep+ OK_ab + '(?:' +aSep+ f+ ')?$' );
RegExp.oklch_factors_a=new window.RegExp( '^' +f +sep+ OK_f_C +sep+ h+ '(?:' +aSep+ f+ ')?$' );

/*
/^\s*0*((?:0|1|0?\.[0-9]+)|(?:(?:100|[0-9]{1,2}(?:\.[0-9]*)?|0?\.[0-9]+)%))\s*?[, ]\s*0*(-?(?:(?:100|[0-9]{1,2}(?:\.[0-9]*)?|0?\.[0-9]+)%|0|\.40*|\.[0-3]\d*))\s*[, ]\s*0*(-?(?:(?:100|[0-9]{1,2}(?:\.[0-9]*)?|0?\.[0-9]+)%|0|\.40*|\.[0-3]\d*))\s*(?:(?:,| \/ | )\s*0*((?:0|1|0?\.[0-9]+)|(?:(?:100|[0-9]{1,2}(?:\.[0-9]*)?|0?\.[0-9]+)%))\s*?)?$/u
*/


const
	abMax='170(?:\\.0+)?|(?:1[0-6]\\d|\\d{1,2})(?:\\.\\d+)?|\\.\\d+%?',
	per136='136%(?:\\.0+)?|(?:13[0-5]|1[0-2]\\d|\\d{1,2})(?:\\.\\d+)%',
	ab='\\s*(-?0*(?:0%?|' +per136+ '|' +abMax+ '))\\s*',
	per154='154(?:\\.0+)?%|(?:15[0-3]|1[0-4]\\d|\\d{1,2})(?:\\.\\d+)?%',
	cMax='230(?:\\.0+)?|(?:2[0-2]\\d|1?\\d{1,2})(?:\\.\\d+)?',
	c='\\s*0*(' +per154+ '|' + cMax + '|\\.\\d+%?)\\s*',
	f_ab='\\s*(-?0*(?:(?:0|1(?:\\.360*|\\.3[0-5]\\d*|\\.[0-2]\\d*)?|\\.\\d+)|(?:' +per136+ ')%))\\s*?',
	f_C='\\s*0*((?:0|1|\\.\\d+%?)|' +per154+ ')\\s*?';

RegExp.lab_a=new window.RegExp( '^' +p+ sep +ab+ sep +ab+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.lch_a=new window.RegExp( '^' +p+ sep +c+ sep + h+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.lab_factors_a=new window.RegExp( '^' +f +sep+ f_ab +sep+ f_ab + '(?:' +aSep+ f+ ')?$' );
RegExp.lch_factors_a=new window.RegExp( '^' +f +sep+ f_C +sep+ h+ '(?:' +aSep+ f+ ')?$' );


const  //  304= √(215²+215²)
	uvMax='215(?:\\.0+)?|(?:21[0-4]|20\\d|1?\\d{1,2})(?:\\.\\d+)?|\\.\\d+%?',
	uv='\\s*(-?0*(?:0%?|(?:' +pVal+ ')%|' +uvMax+ '))\\s*',
	cᵤᵥMax='304(?:\\.0+)?|(?:30[0-3]|[12]?\\d{1,2})(?:\\.\\d+)?',
	cᵤᵥ='\\s*0*((?:' +pVal+ ')%|' + cᵤᵥMax + '|\\.\\d+%?)\\s*',
	f_signed='\\s*(-?0*(?:0|1|\\.[0-9]+)|(?:(?:' + pVal + ')%))\\s*?';  //one leading zero allowed in factors <1  (extras truncated)

RegExp.luv_a=new window.RegExp( '^' +f+ sep +uv+ sep +uv+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.lchᵤᵥ_a=new window.RegExp( '^' +f+ sep +cᵤᵥ+ sep + h+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.luv_factors_a=new window.RegExp( '^' +f +sep+ f_signed +sep+ f_signed + '(?:' +aSep+ f+ ')?$' );
RegExp.lchᵤᵥ_factors_a=new window.RegExp( '^' +f +sep+ f +sep+ h+ '(?:' +aSep+ f+ ')?$' );


const
	azbzMax='\\.(?:50*|[0-4]\\d*)',
	azbz='\\s*(-?0*(?:0%?|(?:' +pVal+ ')%|' +azbzMax+ '))\\s*';

RegExp.jzazbz_a=new window.RegExp( '^' +f+ sep +azbz+ sep +azbz+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.jzczhz_a=new window.RegExp( '^' +f+ sep +p+ sep + h+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.jzazbz_factors_a=new window.RegExp( '^' +f +sep+ f_signed +sep+ f_signed + '(?:' +aSep+ f+ ')?$' );
RegExp.jzczhz_factors_a=new window.RegExp( '^' +f +sep+ f +sep+ h+ '(?:' +aSep+ f+ ')?$' );

RegExp.ictcp_a=RegExp.jzazbz_a;
RegExp.ichtp_a=RegExp.jzczhz_a;
RegExp.ictcp_factors_a=RegExp.jzazbz_factors_a
RegExp.ichtp_factors_a=RegExp.jzczhz_factors_a




//=================================================================================================\\
/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/

const hueAngleUnitFactors=Math.Trig.angleUnitFactors;
/*
	Object.defineProperties(new Object, {
		'deg':  {value: 360, enumerable: true},
		"°":    {value: 360, enumerable: true},
		'rad':  {value: 2*π, enumerable: true},
		"ᶜ":    {value: 2*π, enumerable: true},
		"ᴿ":    {value: 2*π, enumerable: true},
		'grad': {value: 400, enumerable: true},
		'ᵍ':    {value: 400, enumerable: true},
		"%":    {value: 100, enumerable: true},
		'turn': {value: 1,   enumerable: true},
		"●":    {value: 1,   enumerable: true}  });
 */


// http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html#Specifications
const RGB_profiles={
	// gamma values     with sRGB, we only have a “standard” matrix for D65 right now… but D50_Lindbloom is our D50 standard stand-in
	"Adobe RGB (1998)": {γCorrection: 2.2, illuminant: 'D65'},
	"Apple RGB":        {γCorrection: 1.8, illuminant: 'D65'},
	"Best RGB":         {γCorrection: 2.2, illuminant: 'D50'},  // D50_Lindbloom
	"Beta RGB":         {γCorrection: 2.2, illuminant: 'D50'},  // D50_Lindbloom
	"Bruce RGB":        {γCorrection: 2.2, illuminant: 'D65'},
	"CIE RGB":          {γCorrection: 2.2, illuminant: 'E'  },
	"ColorMatch RGB":   {γCorrection: 1.8, illuminant: 'D50'},  // D50_Lindbloom
	"Don RGB 4":        {γCorrection: 2.2, illuminant: 'D50'},  // D50_Lindbloom
	"Ekta Space PS5":   {γCorrection: 2.2, illuminant: 'D50'},  // D50_Lindbloom
	"NTSC RGB":         {γCorrection: 2.2, illuminant: 'C'  },
	"PAL/SECAM RGB":    {γCorrection: 2.2, illuminant: 'D65'},  // γCorrection=2.8 ← https://en.wikipedia.org/wiki/Gamma_correction
	"ProPhoto RGB":     {γCorrection: 1.8, illuminant: 'D50'},  // D50_Lindbloom
	"SMPTE-C RGB":      {γCorrection: 2.2, illuminant: 'D65'},
	"Wide Gamut RGB":   {γCorrection: 2.2, illuminant: 'D50'},  // D50_Lindbloom  //Wikipedia says γCorrection=563/256, or 2.19921875
	"p3": /*display_p3*/{γCorrection: "≈2.2", illuminant: 'D65'},  //←gamma-correction is done using
	"sRGB":             {γCorrection: "≈2.2", illuminant: 'D65'}  //←  another method for p3 & sRGB
};
Object.deepFreeze(RGB_profiles);



//===============================================================
//  These functions are shared by the Color objects and RGB_Calc


	// make sure the color’s value is an integer; and in the boundaries of 0-255; if not, “reflect” it back or “truncate”.
function getByteValue(v)  {
	var isNotPercent=true;  // nor a factor…
	if (typeof v === 'string')  {
		if (this.config.allowUndefinedRGBChannels)  {
			if (v==='*'  ||  v==='◊')  return v;
			if (v===' '  ||  v==='_'  ||  v==='Ø'  ||  v==='∅')  return undefined;  }
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
		if (h==='none')  return 1;
		if (m=h.match( RegExp.Hue ))  {h=parseFloat(m[1]);  unit= (m=m[2]) || unit;}
		else {console.error('bad hue:'+h+'  unit: '+unit);  return false;  }  }
	else if (h instanceof Number  &&  (h.unit in hueAngleUnitFactors))
		unit=h.unit;  // this experimental property name is subject to change
	if ( (this.config.inputAsFactor  &&  !m)
	||  unit==='turn'  ||  unit==="●" )
		return (h<0 || h>1) ? Math.sawtooth(1,h) : h;
	// ↑  ↓   all grayscale may be hue=1 instead of the typical hue=0
	if (unit=hueAngleUnitFactors[unit])  return (h<0 || h>unit) ?  (Math.sawtooth(unit, h)/unit)  :  (h/unit);
	else  return false;  }

function getFactorValue(v, factorIsDefault=false)  {
	v= ((this.config.inputAsFactor  ||  factorIsDefault)
		&&  (typeof v !== 'string'  ||  !v.endsWith("%"))
		&&  (!(v instanceof Number)  ||  v.unit!=='%'))  ?  // this experimental property name is subject to change
		parseFloat(v)  :  (parseFloat(v)/100);
	return (v<0 || v>1) ? false : v;  }

function getAxisValue(v, axisPer, axisMax)  {  //for OKLab & OKLCh & Lab & LCh & Luv & LChᵤᵥ & ICᵀCᴾ & IChᵀᴾ
	if (this.config.inputAsFactor  &&  !this.config.inputAsNumeric
		&&  (typeof v !== 'string'  ||  !v.endsWith("%"))
		&&  (!(v instanceof Number)  ||  v.unit!=='%'))    // this experimental property name is subject to change
			v=parseFloat(v)*axisPer;
	else v= (typeof v === 'string'  &&  v.endsWith("%")) ?  (parseFloat(v)/100)*axisPer : parseFloat(v);
	return (v<(0-axisMax) || v>axisMax) ? false : v;  }

function getAlphaFactor(v)  {
	if (v===""  ||  v===undefined  ||  v===null)  return this.config.defaultAlpha;  //undefined;
	v= ((typeof v !== 'string'  ||  !v.endsWith("%"))
		&&  (!(v instanceof Number)  ||  v.unit!=='%'))  ?  // this experimental property name is subject to change
		parseFloat(v)  :  (parseFloat(v)/100);
	return (v<0 || v>1) ? false : v;  }

function factorize(arr, stop, start)  {
	if (this.config.preserveInputArrays)  arr=Array.from(arr);
	if (start  &&  (arr[0]=this.getHueFactor(arr[0])) === false)  return false;
	for (var tmp, i=start||0; i<stop; i++)  {
		if ( (tmp=this.getFactor(arr[i])) === false )  return false;
		else  arr[i]=tmp;  }
	if ( (tmp=this.getAlpha(arr[stop])) === false )  return false
	else arr[stop]=tmp;
	return arr;  }

// Add-on Alpha values are non-standard and defined on Palette color names:  blue, 75%;
// If the RGB-color that the the color-name defines already has an alpha value defined,
// we can multiply-in the add-on alpha in any customized way.
//function multiplyAddOnAlpha(a1, a2) {return a1-a2*(1-a1);},
function multiplyAddOnAlpha(α1, α2) {return α1*α2;}

// If you create your own Color object class (see the .config _Factory pointers),
// you may need to also update/replace this function to work with them.
function applyAlpha(c_o, $α, source)  {
	// Our color object will define an RGB value
	if ('alpha' in c_o)  {
		if (typeof c_o.alpha === 'number'  ||  c_o.alpha instanceof Number)
			c_o.alpha=this.multiplyAddOnAlpha(c_o.alpha, $α);
		else  c_o.alpha=$α;
		return c_o;  }
	if (c_o instanceof Array)  {  // not for CMYK!
		if (typeof c_o[3] === 'number'  ||  c_o[3] instanceof Number)
			c_o[3]=this.multiplyAddOnAlpha(c_o[3], $α);
		else  c_o[3]=$α;
		return c_o;  }
	return this.config.onError('Can not apply add-on alpha to unknown Color object. ', source);  }


function γCorrect_linear_RGB(r,g,b,α, profile, bits)  {
	//gamma correction
	if (profile === 'sRGB'  ||  profile.endsWith('p3'))  {
				// ¿ 0.00304 ?
		r = (r > 0.0031308) ?  1.055 * Math.pow(r, 1/2.4) - 0.055  :  12.92 * r;
		g = (g > 0.0031308) ?  1.055 * Math.pow(g, 1/2.4) - 0.055  :  12.92 * g;
		b = (b > 0.0031308) ?  1.055 * Math.pow(b, 1/2.4) - 0.055  :  12.92 * b;  }
	else {
		const γ=1/RGB_profiles[profile].γCorrection;
		r = Math.pow(r, γ);
		g = Math.pow(g, γ);
		b = Math.pow(b, γ);  }
	//const bits=this.config.RGB_bitDepth;  //sRGB=255
	return this.output_clampedRGB(r, g, b, α, profile, bits);  }

function linearize_γCorrected_RGB(rgb, profile)  {
	if (rgb.model?.startsWith('linear-')
	||  rgb.model?.endsWith('-linear'))  return rgb;
	const
		bits=this.config.RGB_bitDepth;  //sRGB=255
	var
		R = rgb[0] / bits,
		G = rgb[1] / bits,
		B = rgb[2] / bits;
	if (profile === 'sRGB'  ||  profile.endsWith('p3'))  {
		R = (R > 0.04045) ? Math.pow(((R + 0.055) / 1.055), 2.4) : R / 12.92;
		G = (G > 0.04045) ? Math.pow(((G + 0.055) / 1.055), 2.4) : G / 12.92;
		B = (B > 0.04045) ? Math.pow(((B + 0.055) / 1.055), 2.4) : B / 12.92;  }
	else  {
		const γ=RGB_profiles[profile].γCorrection;
		R = Math.pow(R, γ);
		G = Math.pow(G, γ);
		B = Math.pow(B, γ);  }
	return [R,G,B,rgb[3]];  }


const
			max=Math.max,
			min=Math.min,
		round=Math.round,
	roundTo=Math.roundTo;

function output_RGB_factors(r,g,b,α)  {
	const bits=this.config.RGB_bitDepth;
	r*=bits; g*=bits; b*=bits;
	if (this.config.roundRGB)  {
			r=round(r); g=round(g); b=round(b);  }
	//When RGBA_Factory=Array we don’t want the length property to be ===4 with an undefined alpha.
	if (α===undefined)  α=this.config.defaultAlpha;
	if (this.config.doOutput_RGB_metadata)
		return new this.config.RGBA_Factory(r,g,b,α, this.config.RGB_profile, bits);
	else if (α===undefined)
		return new this.config.RGBA_Factory(r,g,b);
	else
		return new this.config.RGBA_Factory(r,g,b,α);  }

function output_RGB(r,g,b,α, profile, bits)  {
	if (this.config.roundRGB)  {
			r=round(r); g=round(g); b=round(b);  }
	//When RGBA_Factory=Array we don’t want the length property to be ===4 with an undefined alpha.
	if (α===undefined)  α=this.config.defaultAlpha;
	if (this.config.doOutput_RGB_metadata)
		return new this.config.RGBA_Factory(r,g,b,α, profile||this.config.RGB_profile, bits||this.config.RGB_bitDepth);
	else if (α===undefined)
		return new this.config.RGBA_Factory(r,g,b);
	else
		return new this.config.RGBA_Factory(r,g,b,α);  }

const output_sRGB=output_RGB;

// ↓ for color space models that go beyond the color space of any current RGB profile
function output_clampedRGB(r,g,b,α, profile, bits)  {
	bits??=this.config.RGB_bitDepth;
	r*=bits;  g*=bits;  b*=bits;
	if (α===undefined)  α=this.config.defaultAlpha;
	if (this.config.roundRGB)  {r=round(r); g=round(g); b=round(b);}
	// precision is not a quality of OKLab…  bumping to 3 decimal places, we loose valid colors
	// precision is not a quality of Jᶻaᶻbᶻ or ICᵀCᴾ…  we loose valid colors no matter what…
	else  {r=roundTo(2, r);  g=roundTo(2, g);  b=roundTo(2, b);}
	if (r>=0  &&  g>=0  &&  b>=0
	&&  r<=bits  &&  g<=bits  &&  b<=bits)  {
		if (this.config.doOutput_RGB_metadata)
			return new this.config.RGBA_Factory(r,g,b,α, profile||this.config.RGB_profile, bits||this.config.RGB_bitDepth);
		else if (α===undefined)
			return new this.config.RGBA_Factory(r,g,b);
		else
			return new this.config.RGBA_Factory(r,g,b,α);  }
	if (this.config.doClampRGB)  return this.clamp_RGB(r,g,b,α);
	else  return this.config.onError([r,g,b], undefined, 'Values out of clamped range (0—'+bits+') for '+profile+'. ');  }

function clamp_RGB(r,g,b,α) {return null;} // …to be enhanced


//===============================================================
/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/



//  The Config Stack is central to the operation of RGB_Calc class
// and peripheral to the …A_Color Objects for their limited conversion functions
// and for their “toString” methods.
class ConfigStack  {
	constructor($owner, $config)  {
		Object.defineProperty(this, 'owner', {get: ()=>$owner});
		if (typeof $config === 'object')  for (const f in $config)  {this[f]=$config[f];}  }
	stack($newConfig)  {
		return this.owner.config=Object.create(this, $newConfig);  }
	cull()  {
		if (!this.hasOwnProperty("owner"))  this.owner.config=Object.getPrototypeOf(this);
		return this.owner.config;  }
	reset()  {
		while (!this.owner.config.hasOwnProperty("owner"))  {
			this.owner.config=Object.getPrototypeOf(this.owner.config);  }
		return this.owner.config;  }  }

const CS_props={
	name: 'RGB_Calc.ConfigStack',

// ↓facilitates “rounding” to the nearest “byte” value (integer used by the hardware - now-a-days may be more than 8-bits)
	RGB_bitDepth: 255, // see window.screen.pixelDepth
// ↓for ∆RGB—XYZ & ∆RGB—∆RGB conversions, etc.
	RGB_profile: 'sRGB',
//      World Wide Web Consortium↓   ↓IEC…Wikipedia           ↓our current default D50
	illuminantMatrix: "D65",  // D65 ‖ D65_2003 ‖ D65_classic ‖ D50_Lindbloom ‖ D65_Lindbloom ‖ D65_Wickline   ←XYZ conversions

	doClampRGB: false,

//  for the RGB color model,
//  depending on the flag below,
//  values may be rounded to integers or left as floating-point values.
	roundRGB: false,

//  for the RGB color model,
//  depending on the flag below,
//  values passed in to  RGB_Calc (¡when “auditing”!)  or  RGBA_Color
//  outside the range of 0-255 are “reflected” or “truncated” back into the correct range.
	reflect: false,

// if ↓ true, RGB output will always include an alpha (α) value, as well as the profile and bit-depth
	doOutput_RGB_metadata: false,

/* This controls how RGB_Calc interprets == “audit” == values,
 * which are by definition here from an “outside” source (user input, palette files, etc.).
 * RGB_Calc always interprets == “quick” == values as bytes or factors (and see also “inputAsNumeric” below…), depending on the color-space;
 * they are by definition from the “local” program, and it can convert them before hand as needed.
 * …A_Color Object instances also “audit” their input, but they default to factors not percents,
 * except for RGBA_Colors default to bytes, and see also “inputAsNumeric” below…
 * By default (inputAsFactor=false … see below …) an “audit” RGB_Calc interprets == strings == as a “loose” CSS string.
 * It will allow mixing bytes and percents (with a percent % sign) in an rgb color-space.
 * It will interpret other color-space values (the “s” & “l” in hsl for example)
 * as percent values when they do not have a percent % sign.
 * When (inputAsFactor=true), these values (without percent % signs) (and hues without units)
 * are interpreted as factors.
 * Alpha values are always interpreted as factors unless they have a percent % sign.
 *
 *    0 <= factor <= 1     0 <= percent <= 100     0 <= byte <= 255
 */
	inputAsFactor: true,  // input for …A_Colors is by default factors from 0—1, except for sRGB, and…
	// ↓ this overrides ↑ inputAsFactor for a-axis & b-axis & chroma when using the Lab, LCh, OKLab, & OKLCh color-spaces
	inputAsNumeric: true,

/* this controls whether you can pass undefined channels to the RGB color space.
 * this non-standard format allows "blank" or "undefined" channels of three types: a blank “ ” (space) or “_”; a nullset “Ø” or “∅”; a lozenge “◊”
 * the blank and nullset are meant to mean no mods to that channel;
 * the lozenge in meant to mean a placeholder that will be filled in - specifically when used with gradients.
 * This flag has no effect when .config.inputAsFactor=true
 */
	allowUndefinedRGBChannels: false,

/*
 * the  hueAngleUnit  default is overridden by  inputAsfactor  when input values have undeclared units
 *
 * default input unit for calculators & ColorWheel_Color objects.
 * default output unit for ColorWheel_Array objects’  .toString()  method.
 * Valid units are listed (below) as property keys of  SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors
 */
	hueAngleUnit: 'deg',
//  for (HSL, HSB, HSV, HCG, HWB, LCh, and OKLCh) ColorWheel_… Objects,
//  depending on the Boolean status of the flag below,
//  you may output hues (via the toString() method) with a:
//   • symbol: (0° - 359.999…°)  ← ¡but only when NOT outputting a “CSS” format!
//   • textual suffix: (0deg - 359.999deg)  ← when applicable for the hue-angle-unit
//  by default (null) the hue-angle-unit is not altered.
	useAngleUnitSymbol: null,

//  when outputting RGB Hex values, this flag determines the format:  A1B2C3  or  #A1B2C3
	useHexSymbol: true,

// “stringFormat” is a compounded string that may include any of the following values,
//  based on the various “toString” methods of …A_Arrays:
/*
 * hex # !# css css5 html wrap function prefix csv commas plain tabbed self
 * byte factor percent numeric alpha
 * deg ° grad ᵍ rad ᴿ ᶜ % turn ●
 */
	stringFormat: 'self',

//  If no alpha is defined (===undefined) when doing a conversion, the defaultAlpha
//  will be defined by RGB_Calc in the output object instance (i.e. the Array, RGBA_Color, ColorWheel_Color, CMYKA_Color, etc.)
//  If no alpha is defined (===undefined) when doing a conversion AND the defaultAlpha===undefined,
//  no alpha value at all will be passed to the output object instance;
//  this will affect the  .length  properties of Arrays.
//  Alpha values may be just about anything, including null, as used internally by your function,
//  but need to be 0.0—1.0 for proper toString() operation of  …A_Color  Objects … read on …
//  However note, when those objects output a string, and string format requires an alpha value
//  and none is found to be  numeric  a default value of 100% is used.
	defaultAlpha: undefined,

// You may want to •create your own Class constructor for any of these 23 Factories below
//  or you may want to •use the  …A_Array  classes below for many of these factories below
//  (they have friendly syntax and conversion functions baked into their prototype)
//  or you may want to •use any of the  …A_Color  Objects defined below, that extend the …A_Array classes.
// The RGB_Calc.ConfigStack child-class redefines these for auditing calculators,
//   and so do all the  …A_Color  Objects and  …A_Array  Objects  for their conversion properties,
//   while they remain the default for quick calculators.
	RGBA_Factory: Array,
	HSLA_Factory: Array,
	HSBA_Factory: Array,
	HSVA_Factory: Array,
	HWBA_Factory: Array,
	HCGA_Factory: Array,
	CMYKA_Factory: Array,
	OKLabA_Factory: Array,
	OKLChA_Factory: Array,
	OKHSLA_Factory: Array,
	OKHSVA_Factory: Array,
	OKHWBA_Factory: Array,
	OKHCGA_Factory: Array,
	XYZA_Factory: Array,
	LabA_Factory: Array,
	LChA_Factory: Array,
	LuvA_Factory: Array,
	LChᵤᵥA_Factory: Array,
	HSLᵤᵥA_Factory: Array,
	JᶻaᶻbᶻA_Factory: Array,
	JᶻCᶻhᶻA_Factory: Array,
	ICᵀCᴾA_Factory: Array,
	IChᵀᴾA_Factory: Array,
/*
 *The 23 factory pointers (above) control the output of the “quick” RGB_Calc–functions and its instances;
 * these are by default superseded by …A_Array Objects for conversion functions in …A_Array Object instances, &
 * these are by default superseded by …A_Color Objects for Auditing Calculators and conversion functions in …A_Color Object instances.
 *
 * //this example provides a quick calculator that returns RGB output as an RGBA_Color object instance,
 * //  instead of the default simple array of values:
 * myCalc=new SoftMoon.WebWare.RGB_Calc({RGBA_Factory:SoftMoon.WebWare.RGBA_Color}, true);
 *
 * //this example provides a calculator that returns an RGBA_Color object instance that outputs hex using the # symbol,
 * //  regardless of the universal default:
 * myCalc=new SoftMoon.WebWare.RGB_Calc;
 * myCalc.config.RGBA_Factory=function(r,g,b,a)  {return new SoftMoon.WebWare.RGBA_Color(r,g,b,a,{useHexSymbol:true})};
 */

	onError: function(clr, csm, msg)  {
		var message;
		if (this.throwErrors  ||  this.logErrors)  {
			if (msg)  message=msg+' Color: '+clr;
			else  message= csm ? ('Bad values for '+csm+' conversion: “'+clr+'”.')
												:  ('The color “'+clr+'” is undefined.');  }
		if (this.logErrors)
			console.error(message);
		if (this.throwErrors)  {
			if (this.resetConfigStackOnThrownError)  this.reset();
			const e=new Error(message);  e.name='RGB_Calc Error';
			throw e;  }
		return this.errorResult;  },

	throwErrors: false,  // change to true for debugging, etc…
	logErrors: false,    // change to true for debugging, etc…
	errorResult: null,
	resetConfigStackOnThrownError: false
};
for (const p in CS_props) {ConfigStack.prototype[p]=CS_props[p];}





//===============================================================
/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/


class ColorA_Array extends Array  {
/* see the ColorFactory Class at end of this file */
	copy($factory, $config) {return copy_color.call(this, this, undefined, $factory, $config);}
	convertTo($dSpace, $factory, $config) {return convert_color.call(this, this, $dSpace, $factory, $config);}  }


/*
	This is meant to be a universal object that can be
	 compatibly passed through different libraries without hassle………♪♫ hopefully ♫♪ ☻☺☻☺ ♦♥♣♠♂♀ ☺☻☺☻
*/
class RGBA_Array extends ColorA_Array {
	constructor(R,G,B,α, profile, bits)  {
		if (arguments.length===0)  super(4);
		else if (α===undefined)  super(R,G,B);
		else super(R,G,B,α);
		if (profile) this.profile=profile;
		if (bits  &&  this.profile!=='sRGB')  this.bitDepth=bits;  }
	get R() {return this[0]}  set R($) {this[0]=$}
	get r() {return this[0]}  set r($) {this[0]=$}
	get G() {return this[1]}  set G($) {this[1]=$}
	get g() {return this[1]}  set g($) {this[1]=$}
	get B() {return this[2]}  set B($) {this[2]=$}
	get b() {return this[2]}  set b($) {this[2]=$}
	get A() {return this[3]}  set A($) {this[3]=$}  // RGB is the only color-space that supports “A” & “a” for alpha, due to conflicts in
	get a() {return this[3]}  set a($) {this[3]=$}  //  other color-spaces.  This is for historical reasons of compatability with other libraries
	get α() {return this[3]}  set α($) {this[3]=$}  // all others use Greek letter lowercase alpha α
	get alpha()   {return this[3]}  set alpha($)   {this[3]=$}
	get opacity() {return this[3]}  set opacity($) {this[3]=$}
	get red() {return this[0]}  set red($) {this[0]=$}
	get grn() {return this[1]}  set grn($) {this[1]=$}
	get blu() {return this[2]}  set blu($) {this[2]=$}
	get green() {return this[1]}  set green($) {this[1]=$}
	get blue()  {return this[2]}  set blue($)  {this[2]=$}
	get hex()  {
		if (this.profile!=='sRGB')  return this.config.OnError(this, undefined, 'Only sRGB may convert to #hexadecimal');
		return (this.config.useHexSymbol ? '#':"") + Math._2hex(this[0])+Math._2hex(this[1])+Math._2hex(this[2]) +
								((typeof this[3] === 'number')  ?  Math._2hex(this[3]*255) : "");  }
	set hex($)  {
		if (this.profile!=='sRGB')  return this.config.OnError(this, undefined, 'Only sRGB may convert from #hexadecimal');
		if ($=$.match(RegExp.hex_a))  {
			this[0]=parseInt($[3], 16);  this[1]=parseInt($[4], 16);  this[2]=parseInt($[5], 16);
			if ($[6])  this[3]=parseInt($[6], 16)/255;  }  }
	get rgba()  {return this.slice(0,4);}

	to_XYZ(factory) {return toXYZ.call(this, this, factory);}
	to_Lab(factory) {return toLab.call(this, this, factory);}
	to_Luv(factory) {return toLuv.call(this, this, factory);}
	to_OKLab(factory) {
		if (this.profile!=='sRGB')  return this.config.OnError(this, undefined, 'Only sRGB may convert directly to OKLab');
		return Björn_Ottosson.srgb_to_oklab.call(this, this, factory);}
	to_Jᶻaᶻbᶻ(factory) {return toJᶻaᶻbᶻ.call(this, this, factory);}
	to_ICᵀCᴾ(factory) {return toICᵀCᴾ.call(this, this, factory);}

	toString(format)  {
		if (typeof format !== 'string')  format="";
		format+= " "+this.config.stringFormat;
		var s, outAs=format.match( (this.profile  &&  this.profile!=='sRGB') ?
				      /css5?|color|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i
			: /hex|#|css5?|color|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
		if (outAs)  outAs=outAs[0].toLowerCase();
		if (outAs==='hex'  ||  outAs==='#')  {
			const sym=format.match(/!#|#/);
			if (sym)  this.config.stack({useHexSymbol: {value:(sym[0]==='#')}});
			try {return this.hex;}
			finally {if (sym) this.config.cull();}  }
		const
			bits=this.bitDepth || 255,
			hasCom=format.match(/csv|commas/i),
			hasPln=format.match(/plain/i),
			hasByt=format.match(/byte/i),
			hasFac=format.match(/factor/i),
			hasPer=format.match(/percent/i),
			plain= outAs==='css5'  ||  outAs==='color'
				||  (outAs!=='tabbed'  &&  outAs!=='css'  &&  outAs!=='self'  &&
							(hasPln  &&  (!hasCom  ||  hasPln.index < hasCom.index))),
			sep= (outAs==='tabbed') ? "\t" : (plain ? " " : ", "),
			aSep= plain ? ' / ' : sep,
			alpha= (typeof this.alpha === 'number'
							||  ( ( /alpha/i.test(format)  ||  outAs==='self' )                  //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this.alpha= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) ))  ?  'A' : "";
		if (hasFac
		&&  !outAs.startsWith('css')  &&  outAs!=='html'  &&  outAs!=='self'
		&&  (outAs==='color'  ||  !hasByt  ||  (hasFac.index < hasByt.index))
		&&  (!hasPer  ||  (hasFac.index < hasPer.index)))
			s=roundTo(3, this.r/bits)+ sep +
				roundTo(3, this.g/bits)+ sep +
				roundTo(3, this.b/bits)+
				(alpha  &&  (aSep+roundTo(3, this.alpha)));
		else
		if (outAs==='color'
		||  (hasPer  &&  (!hasByt  ||  (hasPer.index < hasByt.index))))
			s=roundTo(1, this.r/bits*100)+'%'+ sep +
				roundTo(1, this.g/bits*100)+'%'+ sep +
				roundTo(1, this.b/bits*100)+'%'+
				(alpha  &&  (aSep+roundTo(1, this.alpha*100)+'%'));
		else
			s=round(this.r)+ sep +
				round(this.g)+ sep +
				round(this.b)+
				(alpha  &&  (aSep+
							((hasFac  &&  (!hasPer  ||  hasFac.index < hasPer.index)) ?
									roundTo(3, this.alpha)
								: roundTo(1, this.alpha*100)+'%')));
		const prefix= (this.profile  &&  this.profile!=='sRGB') ?  this.profile : 'RGB';
		switch (outAs)  {
		case 'color':  return 'color('+this.profile+' '+s+')';
		case 'css5':  alpha="";
		case 'css':
		case 'html':
		case 'wrap':
		case 'function':  return prefix+alpha+'('+s+')';
		case 'prefix':    return prefix+alpha+': '+s;
		case 'csv':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return 'RGBA_ColorArray: ('+s+', '+this.profile+', '+this.bitDepth+')';  }  }  }

Object.defineProperties(RGBA_Array.prototype, {
	model: {value:"RGB"},
	profile: {value:"sRGB"},
	bitDepth: {value:255} });
// ↑ we add “factory” pointers to the prototype below…

SoftMoon.WebWare.RGBA_Array=RGBA_Array;

class RGBA_Color extends RGBA_Array {
	constructor($r, $g, $b, $α, $config, $profile='sRGB')  {
		super();
		this.config= new RGBA_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this,
			rgb=new Array(3),
			def=[  //we need another filter if this color-space bit-depth is not “byte”
			 {get: ()=>$r,  set: $red=>$r=thisClr.getByte($red),  enumerable: true},
			 {get: ()=>$g,  set: $grn=>$g=thisClr.getByte($grn),  enumerable: true},
			 {get: ()=>$b,  set: $blu=>$b=thisClr.getByte($blu),  enumerable: true},
			 {get: ()=>$α,  set: $alf=>$α=thisClr.getAlpha($alf),  enumerable: true} ];
		// Since RGB values are mapped similarly,
		// here is a 3-member array to use with  Array.map(…)  or  for (…of…)
		// to use functions/processes like “darken” or “lighten”, etc.
		// Other …A_Color objects do not have this 3-member array.
		Object.defineProperties(rgb, {
			0: def[0],
			1: def[1],
			2: def[2] });
		Object.defineProperties(this, {
			0: def[0],
			1: def[1],
			2: def[2],
			3: def[3] });
		function readArr($arr)  { $r=thisClr.getByte($arr[0]);  $g=thisClr.getByte($arr[1]);  $b=thisClr.getByte($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $a=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			profile: {value:$profile},
			rgb:  {get: ()=>rgb,  set: readArr},
			rgba: {get: ()=>[$r,$g,$b,$α], set: readArr},
			luminance: {get: luminance.bind(this, this)},
			contrast: {get: contrastRGB.bind(this, this)},
			shade: {get: shadeRGB.bind(this, this)},
			to: {value: Object.defineProperties(new Object, {
				hsv:   {get:  toHSV.bind(this, this),  enumerable: true},
				hsb:   {get:  toHSB.bind(this, this),  enumerable: true},
				hsl:   {get:  toHSL.bind(this, this),  enumerable: true},
				hcg:   {get:  toHCG.bind(this, this),  enumerable: true},
				hwb:   {get:  toHWB.bind(this, this),  enumerable: true},
				cmyk:  {get: toCMYK.bind(this, this),  enumerable: true},
				xyz:   {get:  toXYZ.bind(this, this),  enumerable: true},
				lab:   {get:  toLab.bind(this, this),  enumerable: true},
				lch:   {get:  toLCh.bind(this, this),  enumerable: true},
				luv:   {get:  toLuv.bind(this, this),  enumerable: true},
				lchᵤᵥ: {get:toLChᵤᵥ.bind(this, this),  enumerable: true},
				lchuv: {get:toLChᵤᵥ.bind(this, this),  enumerable: true},
				hslᵤᵥ: {get:toHSLᵤᵥ.bind(this, this),  enumerable: true},
				hsluv: {get:toHSLᵤᵥ.bind(this, this),  enumerable: true},
				oklab: {get:Björn_Ottosson.srgb_to_oklab.bind(this, this),  enumerable: true},
				oklch: {get:Björn_Ottosson.srgb_to_oklch.bind(this, this),  enumerable: true},
				okhwb: {get:Björn_Ottosson.srgb_to_okhwb.bind(this, this),  enumerable: true},
				okhcg: {get:Björn_Ottosson.srgb_to_okhcg.bind(this, this),  enumerable: true},
				okhsv: {get:Björn_Ottosson.srgb_to_okhsv.bind(this, this),  enumerable: true},
				okhsl: {get:Björn_Ottosson.srgb_to_okhsl.bind(this, this),  enumerable: true},
				jᶻaᶻbᶻ:{get:toJᶻaᶻbᶻ.bind(this, this),  enumerable: true},
				jzazbz:{get:toJᶻaᶻbᶻ.bind(this, this),  enumerable: true},
				jᶻcᶻhᶻ:{get:toJᶻCᶻhᶻ.bind(this, this),  enumerable: true},
				jzczhz:{get:toJᶻCᶻhᶻ.bind(this, this),  enumerable: true},
				icᵀcᴾ: {get: toICᵀCᴾ.bind(this, this),  enumerable: true},
				ictcp: {get: toICᵀCᴾ.bind(this, this),  enumerable: true},
				ichᵀᴾ: {get: toIChᵀᴾ.bind(this, this),  enumerable: true},
				ichtp: {get: toIChᵀᴾ.bind(this, this),  enumerable: true}  })} });  }

	useHexSymbol(flag=true)  {this.config.useHexSymbol=Boolean.eval(flag, true);  return this;}  }

SoftMoon.WebWare.RGBA_Color=RGBA_Color;

Object.defineProperties(RGBA_Color.prototype, {
		getByte: {value: getByteValue},
		getAlpha: {value: getAlphaFactor}  });


RGBA_Color.ConfigStack=class extends ConfigStack {}
RGBA_Color.ConfigStack.prototype.name='RGBA_Color.ConfigStack';
RGBA_Color.ConfigStack.prototype.inputAsFactor=false;
// see more additions to this prototype below…

class CMYKA_Array extends ColorA_Array {
	constructor(C,M,Y,K,α)  {
		if (arguments.length===0)  super(5);
		else if (α===undefined)  super(C,M,Y,K);
		else super(C,M,Y,K,α);  }
	get c() {return this[0]}  set c($) {this[0]=$}
	get m() {return this[1]}  set m($) {this[1]=$}
	get y() {return this[2]}  set y($) {this[2]=$}
	get k() {return this[3]}  set k($) {this[3]=$}
	get C() {return this[0]}  set C($) {this[0]=$}
	get M() {return this[1]}  set M($) {this[1]=$}
	get Y() {return this[2]}  set Y($) {this[2]=$}
	get K() {return this[3]}  set K($) {this[3]=$}
	get α() {return this[4]}  set α($) {this[4]=$}
	get cyan()    {return this[0]}  set cyan($)    {this[0]=$}
	get magenta() {return this[1]}  set magenta($) {this[1]=$}
	get yellow()  {return this[2]}  set yellow($)  {this[2]=$}
	get black()   {return this[3]}  set black($)   {this[3]=$}
	get alpha()   {return this[4]}  set alpha($)   {this[4]=$}
	get opacity() {return this[4]}  set opacity($) {this[4]=$}
	get cmyka() {return this.slice(0,5);}

	toString(format) {
		if (typeof format != 'string')  format="";
		format+= " "+this.config.stringFormat;
		var outAs=format.match( /css5?|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
		if (outAs)  outAs=outAs[0].toLowerCase();
		const
			hasCom=format.match(/csv|commas/i),
			hasPln=format.match(/plain/i),
			hasFac=format.match(/factor/i),
			hasPer=format.match(/percent/i),
			plain= outAs==='css5'
				||  (outAs!=='css'  &&  outAs!=='html'  &&  outAs!=='tabbed'  &&  outAs!=='self'
						 &&  hasPln  &&  (!hasCom  ||  hasPln.index < hasCom.index)),
			sep= (outAs==='tabbed') ? "\t" : (plain ? " " : ", "),
			aSep= plain ? ' / ' : sep,
			alpha= (typeof this.alpha === 'number'
							||  ( ( /alpha/i ).test(format)                                    //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this.alpha= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) ))  ?  'A' : "",
			s= (!outAs.startsWith('css')  &&  outAs!=='html'  &&  hasFac  &&  (!hasPer  ||  hasFac.index < hasPer.index)) ?
				(roundTo(3, this.c)+ sep +roundTo(3, this.m)+ sep +roundTo(3, this.y)+ sep +roundTo(3, this.k) +
					(alpha && (aSep+roundTo(3, this.alpha))))
			: (roundTo(1, this.c*100)+'%'+ sep +roundTo(1, this.m*100)+'%'+ sep +roundTo(1, this.y*100)+'%'+ sep +roundTo(1, this.k*100)+'%' +
					(alpha && (aSep+roundTo(1, this.alpha*100)+'%')));
		switch (outAs)  {
		case 'css5':  return 'device-cmyk('+s+')';
		case 'css':
		case 'html':
		case 'wrap':
		case 'function':  return 'CMYK'+alpha+'('+s+')';
		case 'prefix':    return 'CMYK'+alpha+': '+s;
		case 'csv':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return 'CMYKA_ColorArray: ('+s+')';  }  }  }

Object.defineProperties(CMYKA_Array.prototype, {
	model: {value:'CMYK'},
	config: {writable:true, value: new ConfigStack(CMYKA_Array.prototype)} });

SoftMoon.WebWare.CMYKA_Array=CMYKA_Array;

class CMYKA_Color extends CMYKA_Array  {
	constructor($C, $M, $Y, $K, $α, $config)  {
		super();
		this.config= new CMYKA_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $C=thisClr.getFactor($arr[0]);  $M=thisClr.getFactor($arr[1]);  $Y=thisClr.getFactor($arr[2]);  $K=thisClr.getFactor($arr[3]);
			if (typeof $arr[4] === 'number')  $α=thisClr.getAlpha($arr[4]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$C,  set: ($c)=>$C=thisClr.getFactor($c),  enumerable: true},
			1: {get: ()=>$M,  set: ($m)=>$M=thisClr.getFactor($m),  enumerable: true},
			2: {get: ()=>$Y,  set: ($y)=>$Y=thisClr.getFactor($y),  enumerable: true},
			3: {get: ()=>$K,  set: ($k)=>$K=thisClr.getFactor($k),  enumerable: true},
			4: {get: ()=>$α,  set: ($a)=>$α=thisClr.getAlpha($a),  enumerable: true},
			cmyka: {get: ()=>[$C,$M,$Y,$K,$α],  set: readArr},
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  fromCMYK.bind(this, this),  enumerable: true})}  });  }  }

Object.defineProperties(CMYKA_Color.prototype, {
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		output_RGB_factors: {value: output_RGB_factors} });

SoftMoon.WebWare.CMYKA_Color=CMYKA_Color;

CMYKA_Color.ConfigStack=class extends ConfigStack {}
CMYKA_Color.ConfigStack.prototype.name='CMYKA_Color.ConfigStack';
CMYKA_Color.ConfigStack.prototype.RGBA_Factory=RGBA_Color;



const hueUnitPrecision=
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


class ColorWheel_Array extends ColorA_Array {

	constructor($0,$1,$2,α)  { //this is called by the child-Classes
		if (new.target===ColorWheel_Array)  throw new Error('ColorWheel_Array is a SuperClass constructor only; you can not create simple instances of it.');
		if (arguments.length===0)  super(4);
		else  if (α===undefined)  super($0,$1,$2);
		else  super($0,$1,$2,α);  }

	toString(format)  {
		if (typeof format !== 'string')  format="";
		format+= " "+this.config.stringFormat;
		var model=this.model;
		const
			u=format.match( /deg|°|g?rad|ᴿ|ᶜ|ᵍ|%|turn|●|factor/ ),
			isClrFriendly= ['JᶻCᶻhᶻ'].includes(model);
		var s,
			hueAngleUnit= u ? u[0] : this.config.hueAngleUnit,
			outAs=format.match( isClrFriendly ?
						/color|css5?|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i
					: /css5?|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i ),
			useSym=this.config.useAngleUnitSymbol,
			alpha= (typeof this.alpha === 'number'
							||  ( ( /alpha/i ).test(format)                                       //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this.alpha= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) ))  ?  'A' : "";
		if (outAs)  outAs=outAs[0].toLowerCase();
		if (outAs==='html')  outAs='css5';
		const
			isNewModel=['HWB', 'OKLCh', 'OKHSL', 'OKHSV', 'OKHWB', 'OKHCG', 'LCh', 'LChᵤᵥ', 'JᶻCᶻhᶻ', 'IChᵀᴾ'].includes(model),
			isNewStndrd=outAs==='css5'  ||  outAs==='color'  ||  (isNewModel  &&  outAs==='css'),
			arr=this,
			hasCom=format.match(/csv|commas/i),
			hasPln=format.match(/plain/i),
			hasPer=format.match(/percent/i),
			hasFac=format.match(/factor/i),
			fctr= (hasFac  &&  (!hasPer  ||  hasFac.index < hasPer.index)),
			plain= outAs!=='self'  &&  isNewStndrd  ||  (outAs!=='tabbed'  &&
				(hasPln  &&  outAs!=='css' &&  (!hasCom  ||  hasPln.index < hasCom.index))  ||
				(isNewModel  &&  (!hasCom  ||  (hasPln  &&  hasPln.index < hasCom.index)))),
			sep= (outAs==='tabbed') ? "\t" : (plain ? " " : ", "), // ¡curses to the folks who de-standardized this specification!
			aSep= (outAs==='tabbed') ? "\t" : (plain ? " / " : ", ");  // ¡curses to the folks who de-standardized this specification!
		if (hueAngleUnit==='factor')  hueAngleUnit='turn';
		if (outAs.startsWith('css'))  useSym=false;
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
			case "ᵍ":   hueAngleUnit= useSym ? "ᵍ" : 'grad';
			break;
			case 'turn':
			case "●":  hueAngleUnit= useSym ? "●" : 'turn';  }
		let precision=7, L_magnitude=1;
		switch (model)  {
		// you gotta wonder if the same people who defined CSS specs also defined PHP & the Apollo 13 moon-mission specs
		case 'LCh':   if (!fctr  ||  outAS.startsWith('css'))  L_magnitude=100; // “lightness” defaults to a “percent” 0%—100% with this
		case 'JᶻCᶻhᶻ':
		case 'IChᵀᴾ':
		case 'LChᵤᵥ':
		case 'OKLCh':  // “lightness” defaults to a “factor” 0.0—1.0 with these
			const
				hasNum=format.match(/numeric/i),
				numb=hasNum  &&  (!hasPer  ||  hasNum.index < hasPer.index),
				p=format.match(/precision: ?(\d+)/);
			if (p) precision= parseInt(p[1]);

			if (fctr  //←↓¿Got that?  the rediculous hoops we need to jump though to create a universal output pattern
			||  (model==='LCh'  &&  outAs.startsWith('css')  &&  numb  &&  (!hasPer  ||  format.charAt(hasPer.index-1)==="!")))
				s=roundTo(precision-Math.log10(L_magnitude), arr[0]*L_magnitude);
			else
				s=roundTo(precision-2, arr[0]*100) + '%';

			if (fctr  &&  !outAs.startsWith('css')  &&  (!numb  ||  hasFac.index < hasNum.index))
				s+=sep + roundTo(precision-2, (this.chroma/this.cPer));
			else if (numb)
				s+=sep + roundTo(precision, this.chroma);
			else
				s+=sep + roundTo(precision-2, (this.chroma/this.cPer)*100) + '%';

			s+=sep + roundTo(hueUnitPrecision[hueAngleUnit]+precision-5, this.hue*hueAngleUnitFactors[hueAngleUnit]) + hueAngleUnit + (alpha && aSep+(fctr?  roundTo(3, this.alpha) : (roundTo(1, this.alpha*100)+'%')));
		break;
		default:  // “lightness” defaults to a “percent” 0%—100% with these
			s=roundTo(hueUnitPrecision[hueAngleUnit], this.hue*hueAngleUnitFactors[hueAngleUnit]) + hueAngleUnit + sep;
			if (!outAs.startsWith('css')  &&  fctr)
				s+=roundTo(3, arr[1]) + sep + roundTo(3, arr[2]) + (alpha && aSep+roundTo(3, this.alpha));
			else
				s+=roundTo(1, arr[1]*100) + "%" + sep + roundTo(1, arr[2]*100) + "%" + (alpha && aSep+roundTo(1, this.alpha*100)+"%");  }
		if (isNewModel || outAs==='css5')  alpha="";  // ¡curses to the folks who de-standardized this specification!  Tolerance ≡ ☺good☻   Strict totalitarian control ≡ ˅bad˅
		if (model==="LCh")  switch (outAs)  {
			case 'csv':
			case 'commas':
			case 'plain':
			case 'tabbed':  break;
			case 'css': if (this.illuminant==='D50')  break;
			default: s=this.illuminant+sep+s;  }
		switch (outAs)  {
		case 'color': return 'color('+this.CSS_model+' '+s+')';
		case 'css5':
		case 'css':  if (this.CSS_model)  model=this.CSS_model;
		case 'wrap':
		case 'function':  return model+alpha+'('+s+')';
		case 'prefix':    return model+alpha+': '+s;
		case 'csv':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return model+'A_ColorArray: ('+s+')';  }  }  }

Object.defineProperties(ColorWheel_Array.prototype, {
	config: {writable:true, value: new ConfigStack(ColorWheel_Array.prototype)} });

const ColorWheel_Color=Object.defineProperties({}, {
	hueUnitPrecision: {enumerable: true, value:hueUnitPrecision},
	ConfigStack: {enumerable: true, value: class extends ConfigStack {}} });
/*
class ColorWheel_Color extends ColorWheel_Array  {
	static hueUnitPrecision=hueUnitPrecision;  //for external references

	constructor($config)  {
		if (new.target===ColorWheel_Color)  throw new Error('ColorWheel_Color is a SuperClass constructor only; you can not create simple instances of it.');
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);  }  }

Object.defineProperties(ColorWheel_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		output_RGB_factors: {value: output_RGB_factors},
		output_sRGB: {value: output_sRGB} });

ColorWheel_Color.ConfigStack=class extends ConfigStack {}
*/

ColorWheel_Color.ConfigStack.prototype.name='ColorWheel_Color.ConfigStack';
// see more additions to this prototype below…

SoftMoon.WebWare.ColorWheel_Array=ColorWheel_Array;
SoftMoon.WebWare.ColorWheel_Color=ColorWheel_Color;


class HSVA_Array extends ColorWheel_Array  {
	get h() {return this[0]}           set h($) {this[0]=$}
	get s() {return this[1]}           set s($) {this[1]=$}
	get v() {return this[2]}           set v($) {this[2]=$}
	get b() {return this[2]}           set b($) {this[2]=$}
	get H() {return this[0]}           set H($) {this[0]=$}
	get S() {return this[1]}           set S($) {this[1]=$}
	get V() {return this[2]}           set V($) {this[2]=$}
	get B() {return this[2]}           set B($) {this[2]=$}
	get α() {return this[3]}           set α($) {this[3]=$}
	get hue()        {return this[0]}  set hue($)        {this[0]=$}
	get saturation() {return this[1]}  set saturation($) {this[1]=$}
	get value()      {return this[2]}  set value($)      {this[2]=$}
	get brightness() {return this[2]}  set brightness($) {this[2]=$}
	get alpha()   {return this[3]}     set alpha($)   {this[3]=$}
	get opacity() {return this[3]}     set opacity($) {this[3]=$}
	get hsba() {return this.slice(0,4);}
	get hsva() {return this.slice(0,4);}  }

Object.defineProperty(HSVA_Array.prototype, "model", {value:"HSV"});

class HSVA_Color extends HSVA_Array  {
	constructor($H,$S,$V,$α, $config)  {
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this,
			defHSVA={get: ()=>[$H,$S,$V,$α],  set: readArr};
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $V=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.getHue($),  enumerable: true},
			1: {get: ()=>$S,  set: ($)=>$S=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$V,  set: ($)=>$V=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			hsva: defHSVA,
			hsba: defHSVA,
			to: {value: Object.defineProperties(new Object, {
				rgb:  {get: fromHSV.bind(this, this),  enumerable: true},
				cmyk: {get: HSV_to_CMYK.bind(this, this),  enumerable: true} } )}  });  }

	//this provides a static globally accessible function unrelated to the HSVA_Color class
	static to_CMYK=HSV_to_CMYK;  // ← uses ↓
	// this is NOT the config for an instance of this class!
	static config={CMYKA_Factory: CMYKA_Color};  }

Object.defineProperties(HSVA_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		output_RGB_factors: {value: output_RGB_factors} });

SoftMoon.WebWare.HSVA_Array=HSVA_Array;
SoftMoon.WebWare.HSVA_Color=HSVA_Color;

function HSV_to_CMYK(hsv, factory)  {
	//HSV values from 0 to 1
	//CMYK results from 0 to 1
	factory??=this.config.CMYKA_Factory;
	var x,h,c,m,y, k=1-hsv[2];
	if ( hsv[1] == 0 )  return new factory(0,0,0,k);
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
	return new factory(c,m,y,k, hsv[3]);  }



class HSBA_Array extends HSVA_Array  {}

Object.defineProperty(HSBA_Array.prototype, "model", {value:"HSB"});

class HSBA_Color extends HSVA_Color  {}

Object.defineProperty(HSBA_Color.prototype, "model", {value:"HSB"});

SoftMoon.WebWare.HSBA_Array=HSBA_Array;
SoftMoon.WebWare.HSBA_Color=HSBA_Color;



class OKHSVA_Array extends HSVA_Array  {
	to_OKLab(factory)  {
		factory??=this.config.OKLabA_Factory;
		return Björn_Ottosson.okhsv_to_oklab.call(this, this, factory);  }
	to_OKHWB(factory)  {
		factory??=this.config.OKHWBA_Factory;
		return Björn_Ottosson.okhsv_to_okhwb.call(this, this, factory);  }
	to_OKHCG(factory)  {
		factory??=this.config.OKHCGA_Factory;
		return Björn_Ottosson.okhsv_to_okhcg.call(this, this, factory);  }  }

Object.defineProperty(OKHSVA_Array.prototype, "model", {value:"OKHSV"});
// ↑ we add config to the prototype below…

class OKHSVA_Color extends OKHSVA_Array  {
	constructor($H,$S,$V,$α, $config)  {
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this,
			defHSVA={get: ()=>[$H,$S,$V,$α],  set: readArr};
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $V=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.getHue($),  enumerable: true},
			1: {get: ()=>$S,  set: ($)=>$S=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$V,  set: ($)=>$V=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			okhsva: defHSVA,
			okhsba: defHSVA,
			to: {value: Object.defineProperties(new Object, {
				rgb:  {get: Björn_Ottosson.okhsv_to_srgb.bind(this, this),  enumerable: true},
				oklab:{get: OKHSVA_Array.prototype.to_OKLab.bind(this),  enumerable: true} })} });  }  }

Object.defineProperties(OKHSVA_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		output_sRGB: {value: output_sRGB} });

SoftMoon.WebWare.OKHSVA_Array=OKHSVA_Array;
SoftMoon.WebWare.OKHSVA_Color=OKHSVA_Color;

class HSLA_Array extends ColorWheel_Array  {
	get h() {return this[0]}  set h($) {this[0]=$}
	get s() {return this[1]}  set s($) {this[1]=$}
	get l() {return this[2]}  set l($) {this[2]=$}
	get H() {return this[0]}  set H($) {this[0]=$}
	get S() {return this[1]}  set S($) {this[1]=$}
	get L() {return this[2]}  set L($) {this[2]=$}
	get α() {return this[3]}  set α($) {this[3]=$}
	get hue()        {return this[0]}  set hue($)        {this[0]=$}
	get saturation() {return this[1]}  set saturation($) {this[1]=$}
	get lightness()  {return this[2]}  set lightness($)  {this[2]=$}
	get alpha()   {return this[3]}  set alpha($)   {this[3]=$}
	get opacity() {return this[3]}  set opacity($) {this[3]=$}
	get hsla() {return this.slice(0,4);}  }

Object.defineProperty(HSLA_Array.prototype, "model", {value:"HSL"});

class HSLA_Color extends HSLA_Array  {
	constructor($H,$S,$L,$α, $config)  {
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $L=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.getHue($),  enumerable: true},
			1: {get: ()=>$S,  set: ($)=>$S=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			hsla: {get: ()=>[$H,$S,$L,$α],  set: readArr},
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  fromHSL.bind(this, this),  enumerable: true})}  });  }  }

Object.defineProperties(HSLA_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		output_RGB_factors: {value: output_RGB_factors} });

SoftMoon.WebWare.HSLA_Array=HSLA_Array;
SoftMoon.WebWare.HSLA_Color=HSLA_Color;


class OKHSLA_Array extends HSLA_Array {
	to_OKLab(factory)  {
		factory??=this.config.OKLabA_Factory;
		return Björn_Ottosson.okhsl_to_oklab.call(this, this, factory);  }  }

Object.defineProperty(OKHSLA_Array.prototype, "model", {value:"OKHSL"});
// ↑ we add config to the prototype below…

class OKHSLA_Color extends OKHSLA_Array {
	constructor($H,$S,$L,$α, $config)  {
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this,
			defHSLA={get: ()=>[$H,$S,$L,$α],  set: readArr};
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $L=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.getHue($),  enumerable: true},
			1: {get: ()=>$S,  set: ($)=>$S=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			okhsl: defHSLA,
			to: {value: Object.defineProperties(new Object, {
				rgb:  {get: Björn_Ottosson.okhsl_to_srgb.bind(this, this),  enumerable: true},
				oklab:{get: OKHSLA_Array.prototype.to_OKLab.bind(this),  enumerable: true} })} });  }  }

Object.defineProperties(OKHSLA_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		output_sRGB: {value: output_sRGB} });

SoftMoon.WebWare.OKHSLA_Array=OKHSLA_Array;
SoftMoon.WebWare.OKHSLA_Color=OKHSLA_Color;


class HCGA_Array extends ColorWheel_Array  {
	get h() {return this[0]}        set h($) {this[0]=$}
	get c() {return this[1]}        set c($) {this[1]=$}
	get g() {return this[2]}        set g($) {this[2]=$}
	get H() {return this[0]}        set H($) {this[0]=$}
	get C() {return this[1]}        set C($) {this[1]=$}
	get G() {return this[2]}        set G($) {this[2]=$}
	get α() {return this[3]}        set α($) {this[3]=$}
	get hue()    {return this[0]}   set hue($)    {this[0]=$}
	get chroma() {return this[1]}   set chroma($) {this[1]=$}
	get gray()   {return this[2]}   set gray($)   {this[2]=$}
	get alpha()   {return this[3]}  set alpha($)   {this[3]=$}
	get opacity() {return this[3]}  set opacity($) {this[3]=$}
	get hcga() {return this.slice(0,4);}  }

Object.defineProperty(HCGA_Array.prototype, "model", {value:"HCG"});

class HCGA_Color extends HCGA_Array  {
	constructor($H,$C,$G,$α, $config)  {
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $C=thisClr.getFactor($arr[1]);  $G=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.getHue($),  enumerable: true},
			1: {get: ()=>$C,  set: ($)=>$C=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$G,  set: ($)=>$G=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			hcga: {get: ()=>[$H,$C,$G,$α],  set: readArr},
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  fromHCG.bind(this, this),  enumerable: true})}  });  }  }

Object.defineProperties(HCGA_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		output_RGB_factors: {value: output_RGB_factors} });

SoftMoon.WebWare.HCGA_Array=HCGA_Array;
SoftMoon.WebWare.HCGA_Color=HCGA_Color;


class OKHCGA_Array extends HCGA_Array  {
	to_OKLab(factory)  {
		factory??=this.config.OKHCGA_Factory;
		return Björn_Ottosson.okhcg_to_oklab.call(this, this, factory);  }
	to_OKHSV(factory)  {
		return Björn_Ottosson.okhcg_to_okhsv.call(this, this, factory);  }  }

Object.defineProperty(OKHCGA_Array.prototype, "model", {value:"OKHCG"});

class OKHCGA_Color extends OKHCGA_Array  {
	constructor($H,$C,$G,$α, $config)  {
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $C=thisClr.getFactor($arr[1]);  $G=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.getHue($),  enumerable: true},
			1: {get: ()=>$C,  set: ($)=>$C=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$G,  set: ($)=>$G=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			okhcga: {get: ()=>[$H,$C,$G,$α],  set: readArr}  });  }  }

Object.defineProperties(OKHCGA_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor} });

SoftMoon.WebWare.OKHCGA_Array=OKHCGA_Array;
SoftMoon.WebWare.OKHCGA_Color=OKHCGA_Color;


class HWBA_Array extends ColorWheel_Array {
	get h() {return this[0]}        set h($) {this[0]=$}
	get w() {return this[1]}        set w($) {this[1]=$}
	get b() {return this[2]}        set b($) {this[2]=$}
	get H() {return this[0]}        set H($) {this[0]=$}
	get W() {return this[1]}        set W($) {this[1]=$}
	get B() {return this[2]}        set B($) {this[2]=$}
	get α() {return this[3]}        set α($) {this[3]=$}
	get hue()    {return this[0]}   set hue($)    {this[0]=$}
	get white()  {return this[1]}   set white($)  {this[1]=$}
	get black()  {return this[2]}   set black($)  {this[2]=$}
	get alpha()   {return this[3]}  set alpha($)   {this[3]=$}
	get opacity() {return this[3]}  set opacity($) {this[3]=$}
	get hwba() {return this.slice(0,4);}  }

Object.defineProperty(HWBA_Array.prototype, "model", {value:"HWB"});

class HWBA_Color extends HWBA_Array  {
	constructor($H,$W,$B,$α, $config)  {
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $W=thisClr.getFactor($arr[1]);  $B=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.getHue($),  enumerable: true},
			1: {get: ()=>$W,  set: ($)=>$W=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$B,  set: ($)=>$B=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			hwba: {get: ()=>[$H,$W,$B,$α],  set: readArr},
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  fromHWB.bind(this, this),  enumerable: true})}  });  }  }

Object.defineProperties(HWBA_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		output_RGB_factors: {value: output_RGB_factors} });

SoftMoon.WebWare.HWBA_Array=HWBA_Array;
SoftMoon.WebWare.HWBA_Color=HWBA_Color;

class OKHWBA_Array extends HWBA_Array  {
	to_OKLab(factory)  {
		factory??=this.config.OKHWBA_Factory;
		return Björn_Ottosson.okhwb_to_oklab.call(this, this, factory);  }  }
Object.defineProperty(OKHWBA_Array.prototype, "model", {value:"OKHWB"});

class OKHWBA_Color extends OKHWBA_Array  {
	constructor($H,$W,$B,$α, $config)  {
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $W=thisClr.getFactor($arr[1]);  $B=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.getHue($),  enumerable: true},
			1: {get: ()=>$W,  set: ($)=>$W=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$B,  set: ($)=>$B=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			okhwba: {get: ()=>[$H,$W,$B,$α],  set: readArr}  });  }  }

Object.defineProperties(OKHWBA_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor} });

SoftMoon.WebWare.OKHWBA_Array=OKHWBA_Array;
SoftMoon.WebWare.OKHWBA_Color=OKHWBA_Color;


class _base_$ch_array extends ColorWheel_Array  {
	get C() {return this[1]}  set C($) {this[1]=$}
	get c() {return this[1]}  set c($) {this[1]=$}
	get h() {return this[2]}  set h($) {this[2]=$}
	get α() {return this[3]}  set α($) {this[3]=$}
	get chroma()    {return this[1]}  set chroma($)    {this[1]=$}
	get hue()       {return this[2]}  set hue($)       {this[2]=$}
	get alpha()     {return this[3]}  set alpha($)     {this[3]=$}
	get opacity()   {return this[3]}  set opacity($)   {this[3]=$}  }
_base_$ch_array.prototype.chromaIsAbsolute=true;

class OKLChA_Array extends _base_$ch_array  {
	get L() {return this[0]}  set L($) {this[0]=$}
	get l() {return this[0]}  set l($) {this[0]=$}
	get lightness() {return this[0]}  set lightness($) {this[0]=$}
	get oklcha() {return this.slice(0,4);}

	to_OKLab(factory)  {
		factory??=this.config.OKLabA_Factory;
		const
			h=this[2]*π2, a=this[1]*Math.cos(h), b=this[1]*Math.sin(h),
			α= (this[3]===undefined) ? this.config?.defaultAlpha : this[3];
		return (α===undefined) ? new factory(this[0],a,b) : new factory(this[0],a,b,α);}  }

Object.defineProperties(OKLChA_Array.prototype, {
	model: {value: "OKLCh"},
	cPer: {value: 0.4},
	cMax: {value: 0.5} });
// ↑ we add config to the prototype below…

class OKLChA_Color extends OKLChA_Array  {
	constructor($L,$C,$h,$α, $config)  {  // 0 ≤ [$L,$H] ≤ 1     0 ≤ $C ≤ 0.5  ←(100%===0.4)
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $L=thisClr.getFactor($arr[0], true);  $C=thisClr.getAxis($arr[1], 0.4, 0.5);  $h=thisClr.getHue($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($, true),  enumerable: true},
			1: {get: ()=>$C,  set: ($)=>$C=thisClr.getAxis($, 0.4, 0.5),  enumerable: true},
			2: {get: ()=>$h,  set: ($)=>$h=thisClr.getHue($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			oklcha: {get: ()=>[$L,$C,$h,$α],  set: readArr},
			to: {value: Object.defineProperties(new Object, {
				rgb:  {get: Björn_Ottosson.oklch_to_srgb.bind(this, this),  enumerable: true},
				oklab:{get: OKLChA_Array.prototype.to_OKLab.bind(this),  enumerable: true} })} });  }  }

Object.defineProperties(OKLChA_Color.prototype, {
		getFactor: {value: getFactorValue},
		getAxis: {value: getAxisValue},
		getHue: {value: getHueFactor},
		getAlpha: {value: getAlphaFactor},
		γCorrect_linear_RGB: {value: γCorrect_linear_RGB},
		output_clampedRGB: {value: output_clampedRGB} });

SoftMoon.WebWare.OKLChA_Array=OKLChA_Array;
SoftMoon.WebWare.OKLChA_Color=OKLChA_Color;


class OKLabA_Array extends ColorA_Array  {
	constructor(L,a,b,α)  {
		if (arguments.length===0)  super(4);
		else  if (α===undefined)  super(L,a,b);
		else  super(L,a,b,α);  }
	get L()  {return this[0]}  set L($) {this[0]=$}
	get l()  {return this[0]}  set l($) {this[0]=$}
	get a()  {return this[1]}  set a($) {this[1]=$}
	get b()  {return this[2]}  set b($) {this[2]=$}
	get α()  {return this[3]}  set α($) {this[3]=$}
	get lightness()  {return this[0]}  set lightness($) {this[0]=$}
	get a_axis()     {return this[1]}  set a_axis($)    {this[1]=$}
	get b_axis()     {return this[2]}  set b_axis($)    {this[2]=$}
	get alpha()    {return this[3]}    set alpha($)   {this[3]=$}
	get opacity()  {return this[3]}    set opacity($) {this[3]=$}
	get laba() {return this.slice(0,4);}

	to_OKLCh(factory)  {
		factory??=this.config.OKLChA_Factory;
		const
			C=Math.sqrt(this[1]*this[1] + this[2]*this[2]),
			h= (C<Björn_Ottosson.minimumChroma) ? 1 : (Math.rad(Math.atan2(this[2], this[1]))/π2),
			α= (this[3]===undefined) ? this.config?.defaultAlpha : this[3];
		return (α===undefined) ? new factory(this[0],C,h) : new factory(this[0],C,h,α);  }
	to_OKHSV(factory) {return Björn_Ottosson.oklab_to_okhsv.call(this, this, factory);}
	to_OKHSL(factory) {return Björn_Ottosson.oklab_to_okhsl.call(this, this, factory);}
	to_sRGB(factory)  {return Björn_Ottosson.oklab_to_srgb.call(this, this, factory);}
	to_XYZ(factory)   {return Björn_Ottosson.oklab_to_xyz.call(this, this, factory);}

	toString(format)  {
		// “borrowed” by Lab, Luv, Jᶻaᶻbᶻ, ICᵀCᴾ
		if (typeof format != 'string')  format="";
		format+= " "+this.config.stringFormat;
		var model=this.model;
		const
			special=['Jᶻaᶻbᶻ', 'ICᵀCᴾ'].includes(model),
			p=format.match(/precision: ?(\d+)/),
			precision= p ? parseInt(p[1]) : 7;
		var outAs=format.match( special ?
						/color|css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i
					: /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
		if (outAs)  outAs=outAs[0].toLowerCase();
		const
			hasCom=format.match(/csv|commas/i),
			hasPln=format.match(/plain/i),    //this is default
			hasNum=format.match(/numeric/i),
			hasPer=format.match(/!?percent/i),  //this is default
			hasFac=format.match(/factor/i),
			fctr=hasFac  &&  (!hasPer  ||  hasPer[0].startsWith("!")  ||  hasFac.index < hasPer.index),
			numb=hasNum  &&  (!hasPer  ||  hasPer[0].startsWith("!")  ||  hasNum.index < hasPer.index),
			commas= hasCom  &&  outAs!=='css'  &&  outAs!=='color'  &&  outAs!=='tabbed'
						&&  (!hasPln  ||  hasCom.index < hasPln.index),
			sep= (outAs==='tabbed') ? "\t" : (commas ? ", " : " "),
			alpha= (typeof this.alpha === 'number'
							||  ( ( /alpha/i ).test(format)                                       //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this.alpha= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) ));
		let s;
		if (fctr
		||  (this.model==='Lab'  &&  outAs==='css'  &&  numb))  {
			let L_magnitude= (this.model==='Lab'  &&  (outAs==='css'  ||  !fctr)) ? 100 : 1;
			s=roundTo(precision-Math.log10(L_magnitude), this[0]*L_magnitude);  }
		else
			s=roundTo(precision-2, this[0]*100)+'%';

		if (fctr  &&  outAs!=='css'  &&  (!numb  ||  hasFac.index < hasNum.index))
			s+= sep+roundTo(precision, (this[1]/this.axisPer))+sep+roundTo(precision, (this[2]/this.axisPer));
		else if (numb)
			s+= sep+roundTo(precision, this[1])+sep+roundTo(precision, this[2]);
		else
			s+= sep+roundTo(precision-2, (this[1]/this.axisPer)*100)+'%'+sep+roundTo(precision-2, (this[2]/this.axisPer)*100)+'%';

		if (fctr)
			s+=(alpha && (commas?sep:' / ')+roundTo(3, this.alpha)  ||  "")
		else
			s+=(alpha && (commas?sep:' / ')+roundTo(1, this.alpha*100)+'%'  ||  "")
		if (model==="Lab")  switch (outAs)  {
			case 'csv':
			case 'commas':
			case 'plain':
			case 'tabbed':  break;
			case 'css': if (this.illuminant==='D50')  break;
			default: s=this.illuminant+sep+s;  }
		switch (outAs)  {
		case 'color':  return 'color('+this.CSS_model+' '+s+')'
		case 'css':  if (this.CSS_model)  model=this.CSS_model;
		case 'html':
		case 'wrap':
		case 'function':  return model+'('+s+')';
		case 'prefix':    return model+': '+s;
		case 'csv':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return model+'A_ColorArray: ('+s+')';  }  }  }

Object.defineProperties(OKLabA_Array.prototype, {
	model: {value: "OKLab"},
	axisPer: {value: 0.4},
	axisMax: {value: 0.4},
	γCorrect_linear_RGB: {value: γCorrect_linear_RGB},
	output_clampedRGB: {value: output_clampedRGB} });
// ↑ we add config to the prototype below…

// note that for now, all these “color Objects” end with “A_Color” so you can search for them specifically in this or other code-files
// with this color-space, the a-axis and the alpha conflict, so the “A_” in the postfix is a bit weird.
class OKLabA_Color extends OKLabA_Array  {   // 0 ≤ [$L] ≤ 1     0 ≤ [$A,$B] ≤ 0.5
	constructor($L,$a,$b,$α, $config)  {
		if (!new.target)  throw new Error('SoftMoon.WebWare.OKLab_Color is a constructor, not a function.');
		super();
		this.config= new OKLabA_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $L=thisClr.getFactor($arr[0], true);  $a=thisClr.getAxis($arr[1], 0.4, 0.4);  $b=thisClr.getAxis($arr[2], 0.4, 0.4);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($, true),  enumerable: true},
			1: {get: ()=>$a,  set: ($)=>$a=thisClr.getAxis($, 0.4, 0.4),  enumerable: true},
			2: {get: ()=>$b,  set: ($)=>$b=thisClr.getAxis($, 0.4, 0.4),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			oklaba: {get: ()=>[$L,$a,$b,$α],  set: readArr},
			to: {value: Object.defineProperties(new Object, {
				rgb:  {get: Björn_Ottosson.oklab_to_srgb.bind(this, this),  enumerable: true},
				okhsv:{get: Björn_Ottosson.oklab_to_okhsv.bind(this, this),  enumerable: true},
				okhsl:{get: Björn_Ottosson.oklab_to_okhsl.bind(this, this),  enumerable: true},
				oklch:{get: Björn_Ottosson.oklab_to_oklch.bind(this, this),  enumerable: true} })}  });  }  }

Object.defineProperties(OKLabA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getAlpha: {value: getAlphaFactor} });

SoftMoon.WebWare.OKLabA_Array=OKLabA_Array;
SoftMoon.WebWare.OKLabA_Color=OKLabA_Color;

OKLabA_Color.ConfigStack=class extends ConfigStack {}
OKLabA_Color.ConfigStack.prototype.name='OKLabA_Color.ConfigStack';
// ↑ we add factories to the prototype below…


class LabA_Array extends ColorA_Array  {// 0 ≤ l ≤ 100   --170 ≤ (a,b) ≤ 170+  (100%=125)
	constructor(L,a,b,α, $illuminant='D50')  {
		if (arguments.length===0)  {super(4);  return;}
		else if (α===undefined)  super(L,a,b);
		else  super(L,a,b,α);
		Object.defineProperty(this, "illuminant", {value:$illuminant});  }
	get L() {return this[0]}  set L($) {this[0]=$}
	get l() {return this[0]}  set l($) {this[0]=$}
	get a() {return this[1]}  set a($) {this[1]=$}
	get b() {return this[2]}  set b($) {this[2]=$}
	get α() {return this[3]}  set α($) {this[3]=$}
	get lightness() {return this[0]}  set lightness($) {this[0]=$}
	get a_axis()    {return this[1]}  set a_axis($)    {this[1]=$}
	get b_axis()    {return this[2]}  set b_axis($)    {this[2]=$}
	get alpha()     {return this[3]}  set alpha($)     {this[3]=$}
	get opacity()   {return this[3]}  set opacity($)   {this[3]=$}
	get laba() {return this.slice(0,4);}

	// https://github.com/color-js/color.js/blob/main/src/spaces/lab-d65.js
	// https://github.com/color-js/color.js/blob/main/src/spaces/lab.js
	to_XYZ(factory)  {
		factory??=this.config.XYZA_Factory;
		const
			ε3 = 24 / 116,
			κ = XYZA_Array.κ,
			illuminant= this.illuminant||"D50",
			white=XYZ_references[illuminant]['2°'],
			L=this[0]*100,
			$1= (L + 16) / 116,
			$0= this[1]/500 + $1,
			$2= $1 - this[2]/200,
			x= white[0] * ($0 > ε3     ?  $0**3                     : (116 * $0 - 16) / κ),
			y= white[1] * (L > 8       ?  ((L + 16) / 116)**3       : L / κ),
			z= white[2] * ($2 > ε3     ?  $2**3                     : (116 * $2 - 16) / κ),
			α= (this[3]===undefined) ? this.config?.defaultAlpha : this[3];
		return new factory(x, y, z, α, illuminant, '2°');  }

	// https://github.com/color-js/color.js/blob/main/src/spaces/lch.js
	to_LCh(factory)  {
		// LuvA_Array, JᶻaᶻbᶻA_Array, ICᵀCᴾA_Array “borrow” this method
		factory??=this.config[this.LCh_factory];
		const
			[L, a, b] = this,
			α= (this[3]===undefined) ? this.config?.defaultAlpha : this[3],
			ε = this.minimumChroma;
		let hue;
		if (Math.abs(a) < ε  &&  Math.abs(b) < ε)
			hue = 1;
		else
			hue = Math.rad(Math.atan2(b, a))/π2;
		const C=Math.sqrt(a ** 2 + b ** 2); // Chroma
		if (C<0.0001)  hue=1; // added by SoftMoon-WebWare
		if (this.model==='Lab')  return new factory(L, C, hue, α, this.illuminant);
		return (α===undefined) ? new factory(L, C, hue) : new factory(L, C, hue, α);  }  }

Object.defineProperties(LabA_Array.prototype, {
	model: {value: 'Lab'},
	//CSS_model: {get:function(){return (this.illuminant==='D65') ? 'Lab-D65' : 'Lab'}},
	toString: {value: OKLabA_Array.prototype.toString},
	LCh_factory: {value: "LChA_Factory"},
	minimumChroma: {value: 0.02},
	axisPer: {value: 125},
	axisMax: {value: 170} });
// ↑ we add config to the prototype below…

class LabA_Color extends LabA_Array  {
	constructor($L,$a,$b,$α, $illuminant='D50', $config)  {
		super();
		Object.defineProperty(this, "illuminant", {value:$illuminant});
		this.config= new LabA_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $L=thisClr.getFactor($arr[0]);  $a=thisClr.getAxis($arr[1], 125, 170);  $b=thisClr.getAxis($arr[2], 125, 170);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($),  enumerable: true},
			1: {get: ()=>$a,  set: ($)=>$a=thisClr.getAxis($, 125, 170),  enumerable: true},
			2: {get: ()=>$b,  set: ($)=>$b=thisClr.getAxis($, 125, 170),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			laba: {get: ()=>[$L,$a,$b,$α],  set: readArr} });  }  }

Object.defineProperties(LabA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getAlpha: {value: getAlphaFactor} });

SoftMoon.WebWare.LabA_Array=LabA_Array;
SoftMoon.WebWare.LabA_Color=LabA_Color;

LabA_Color.ConfigStack=class extends ConfigStack {}
LabA_Color.ConfigStack.prototype.name='LabA_Color.ConfigStack';
// ↑ we add factories to the prototype below…


class LChA_Array extends _base_$ch_array  {// 0 ≤ l ≤ 100     0 ≤ h ≤ 1   0 ≤ c ≤ 230  (100%=150)
	constructor($L,$C,$h,$α, $illuminant='D50')  {
		if (arguments.length===0)  {super();  return;}
		super($L,$C,$h,$α);
		Object.defineProperty(this, "illuminant", {value:$illuminant});  }
	get L() {return this[0]}  set L($) {this[0]=$}
	get l() {return this[0]}  set l($) {this[0]=$}
	get lightness() {return this[0]}  set lightness($) {this[0]=$}
	get lcha() {return this.slice(0,4);}

	// https://github.com/color-js/color.js/blob/main/src/spaces/lch.js
	to_Lab(factory)  {
		factory??=this.config[this.progenitor_factory];
		let [Lightness, Chroma, hue] = this;
		// Clamp any negative Chroma
		if (Chroma < 0) Chroma = 0;
		const
			a=Chroma * Math.cos(hue * π2),
			b=Chroma * Math.sin(hue * π2),
			α = (this[3]===undefined) ? this.config?.defaultAlpha : this[3];
		if (this.model==='LCh')  return new factory(Lightness,a,b, α, this.illuminant);
		return (α===undefined) ? new factory(Lightness,a,b) : new factory(Lightness,a,b,α);  }  }

Object.defineProperties(LChA_Array.prototype, {
	progenitor_factory: {value:"LabA_Factory"},
	model: {value: 'LCh'},
	CSS_model: {get:function(){return (this.illuminant==='D65') ? 'LCh-D65' : 'LCh'}},
	cPer: {value: 150},
	cMax: {value: 230},
	config: {writable:true, value: new ConfigStack(LChA_Array.prototype, {LabA_Factory: LabA_Array})} });

class LChA_Color extends LChA_Array  {
	constructor($L,$C,$h,$α, $illuminant='D50', $config)  {  // 0 ≤ [$L,$H] ≤ 1     0 ≤ $C ≤ 230  ←(100%===150)
		super();
		Object.defineProperty(this, "illuminant", {value:$illuminant});
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $L=thisClr.getFactor($arr[0]);  $C=thisClr.getAxis($arr[1], 150, 230);  $h=thisClr.getHue($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($),  enumerable: true},
			1: {get: ()=>$C,  set: ($)=>$C=thisClr.getAxis($, 150, 230),  enumerable: true},
			2: {get: ()=>$h,  set: ($)=>$h=thisClr.getHue($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			lcha: {get: ()=>[$L,$C,$h,$α],  set: readArr}  });  }  }

Object.defineProperties(LChA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getHue: {value: getHueFactor},
	getAlpha: {value: getAlphaFactor} });

LChA_Color.ConfigStack=class extends ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
LChA_Color.ConfigStack.prototype.name='LChA_Color.ConfigStack';
LChA_Color.ConfigStack.prototype.LabA_Factory=LabA_Color;

SoftMoon.WebWare.LChA_Array=LChA_Array;
SoftMoon.WebWare.LChA_Color=LChA_Color;


class LuvA_Array extends ColorA_Array  {// 0 ≤ l ≤ 100   –215 ≤ (a,b) ≤ +215  (100%=215)
	constructor(L,u,v,α)  {
		if (arguments.length===0)  super(4);
		else if (α===undefined)  super(L,u,v);
		else  super(L,u,v,α);  }
	get L() {return this[0]}  set L($) {this[0]=$}
	get l() {return this[0]}  set l($) {this[0]=$}
	get u() {return this[1]}  set u($) {this[1]=$}
	get v() {return this[2]}  set v($) {this[2]=$}
	get α() {return this[3]}  set α($) {this[3]=$}
	get lightness() {return this[0]}  set lightness($) {this[0]=$}
	get u_axis()    {return this[1]}  set u_axis($)    {this[1]=$}
	get v_axis()    {return this[2]}  set v_axis($)    {this[2]=$}
	get alpha()     {return this[3]}  set alpha($)     {this[3]=$}
	get opacity()   {return this[3]}  set opacity($)   {this[3]=$}
	get luva() {return this.slice(0,4);}

	//  https://github.com/color-js/color.js/blob/main/src/spaces/luv.js
	//  https://en.wikipedia.org/wiki/CIELUV#The_reverse_transformation
	to_XYZ(factory)  {
		factory??=this.config.XYZA_Factory;
		const
			L = this[0]*100,
			α = (this[3]===undefined) ? this.config?.defaultAlpha : this[3];

		// Protect against division by zero Lightness
		if (L === 0)
			return new factory(0,0,0,α,"D65","2°");

		const
			up = (this[1] / (13 * L)) + LuvA_Array.U_PRIME_WHITE,
			vp = (this[2] / (13 * L)) + LuvA_Array.V_PRIME_WHITE,
			Y = L <= 8 ? L / XYZA_Array.κ : Math.pow((L + 16) / 116, 3),
			X = Y * ((9 * up) / (4 * vp)),
			Z = Y * ((12 - 3 * up - 20 * vp) / (4 * vp));

		return new factory(X,Y,Z,α,"D65","2°");  }  }

Object.defineProperties(LuvA_Array.prototype, {
	to_LChuv: {value: LabA_Array.prototype.to_LCh},
	to_LChᵤᵥ: {value: LabA_Array.prototype.to_LCh},
	LCh_factory: {value: "LChᵤᵥA_Factory"},
	minimumChroma: {value: 0.02},
	model: {value: 'Luv'},
	toString: {value: OKLabA_Array.prototype.toString},
	axisPer: {value: 215},
	axisMax: {value: 215} });  // no data found on max limits
// ↑ we add config to the prototype below…


class LuvA_Color extends LuvA_Array  {
	constructor($L,$u,$v,$α, $config)  {
		super();
		this.config= new LuvA_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $L=thisClr.getFactor($arr[0], true);  $u=thisClr.getAxis($arr[1], 215, 215);  $v=thisClr.getAxis($arr[2], 215, 215);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($, true),  enumerable: true},
			1: {get: ()=>$u,  set: ($)=>$u=thisClr.getAxis($, 215, 215),  enumerable: true},
			2: {get: ()=>$v,  set: ($)=>$v=thisClr.getAxis($, 215, 215),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			luva: {get: ()=>[$L,$u,$v,$α],  set: readArr} });  }  }

Object.defineProperties(LuvA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getAlpha: {value: getAlphaFactor} });

SoftMoon.WebWare.LuvA_Array=LuvA_Array;
SoftMoon.WebWare.LuvA_Color=LuvA_Color;

LuvA_Color.ConfigStack=class extends ConfigStack {}
LuvA_Color.ConfigStack.prototype.name='LuvA_Color.ConfigStack';
// ↑ we add factories to the prototype below…


class LChᵤᵥA_Array extends _base_$ch_array {
	get L() {return this[0]}  set L($) {this[0]=$}
	get l() {return this[0]}  set l($) {this[0]=$}
	get lightness() {return this[0]}  set lightness($) {this[0]=$}
	get lchᵤᵥ() {return this.slice(0,4)}
	to_HSLᵤᵥ(factory)  {
		factory??=this.config.HSLᵤᵥA_Factory;
		return Alexei_Boronine.HSLᵤᵥ_from_LChᵤᵥ.call(this, this, factory);  }  }
Object.defineProperties(LChᵤᵥA_Array.prototype, {
	model: {value: 'LChᵤᵥ'},
	CSS_model: {value: 'LChuv'},
	cPer: {value: 304},  // 304= √(215²+215²)
	cMax: {value: 304},
	progenitor_factory: {value:"LuvA_Factory"},
	to_Luv: {value: LChA_Array.prototype.to_Lab},
	config: {writable:true, value: new ConfigStack(LChᵤᵥA_Array.prototype, {LuvA_Factory: LuvA_Array})} });

class LChᵤᵥA_Color extends LChᵤᵥA_Array  {
	constructor($L,$C,$h,$α, $config)  {  // 0 ≤ [$L,$H] ≤ 1     0 ≤ $C ≤ 304  ←(100%===304)
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $L=thisClr.getFactor($arr[0], true);  $C=thisClr.getAxis($arr[1], 304, 304);  $h=thisClr.getHue($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($, true),  enumerable: true},
			1: {get: ()=>$C,  set: ($)=>$C=thisClr.getAxis($, 304, 304),  enumerable: true},
			2: {get: ()=>$h,  set: ($)=>$h=thisClr.getHue($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			lchᵤᵥa: {get: ()=>[$L,$C,$h,$α],  set: readArr}  });  }  }

Object.defineProperties(LChᵤᵥA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getHue: {value: getHueFactor},
	getAlpha: {value: getAlphaFactor} });

LChᵤᵥA_Color.ConfigStack=class extends ConfigStack {}
LChᵤᵥA_Color.ConfigStack.prototype.name='LChᵤᵥA_Color.ConfigStack';
LChᵤᵥA_Color.ConfigStack.prototype.LuvA_Factory=LuvA_Color;

SoftMoon.WebWare.LChᵤᵥA_Array=LChᵤᵥA_Array;
SoftMoon.WebWare.LChᵤᵥA_Color=LChᵤᵥA_Color;


class HSLᵤᵥA_Array extends HSLA_Array  {
	to_LChᵤᵥ(factory)  {
		factory??=this.config.LChᵤᵥA_Factory;
		return Alexei_Boronine.HSLᵤᵥ_to_LChᵤᵥ.call(this, this, factory);  }
	to_Luv(factory)  {
		factory??=this.config.LuvA_Factory;
		return Alexei_Boronine.HSLᵤᵥ_to_LChᵤᵥ.call(this, this, LChᵤᵥA_Array).to_Luv(factory);  }  }
Object.defineProperties(HSLᵤᵥA_Array.prototype, {
	model: {value: 'HSLᵤᵥ'},
	CSS_model: {value: 'HSLuv'},
	config: {writable:true, value: new ConfigStack(HSLᵤᵥA_Array.prototype, {LuvA_Factory: LuvA_Array, LChᵤᵥA_Factory: LChᵤᵥA_Array})} });

class HSLᵤᵥA_Color extends HSLᵤᵥA_Array  {
	constructor($H,$S,$L,$α, $config)  {  // 0 ≤ [$H,$S,$L] ≤ 1
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $L=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$H,  set: ($)=>$H=thisClr.gethue($),  enumerable: true},
			1: {get: ()=>$S,  set: ($)=>$S=thisClr.getFactor($),  enumerable: true},
			2: {get: ()=>$L,  set: ($)=>$L=thisClr.getFactor($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			hslᵤᵥa: {get: ()=>[$H,$S,$L,$α],  set: readArr}  });  }  }

SoftMoon.WebWare.HSLᵤᵥA_Array=HSLᵤᵥA_Array;
SoftMoon.WebWare.HSLᵤᵥA_Color=HSLᵤᵥA_Color;


	//  https://github.com/color-js/color.js/blob/main/src/spaces/jzazbz.js
const _Jᶻaᶻbᶻ_={
	b : 1.15,
	g : 0.66,
	n : 2610 / (2 ** 14),
	ninv : (2 ** 14) / 2610,
	c1 : 3424 / (2 ** 12),
	c2 : 2413 / (2 ** 7),
	c3 : 2392 / (2 ** 7),
	p : 1.7 * 2523 / (2 ** 5),
	pinv : (2 ** 5) / (1.7 * 2523),
	d : -0.56,
	d0 : 1.6295499532821566E-11,
	XYZtoCone_M : [
		[  0.41478972, 0.579999,  0.0146480 ],
		[ -0.2015100,  1.120649,  0.0531008 ],
		[ -0.0166008,  0.264800,  0.6684799 ] ],
// XYZtoCone_M inverted
	ConetoXYZ_M : [
		[  1.9242264357876067,  -1.0047923125953657,  0.037651404030618   ],
		[  0.35031676209499907,  0.7264811939316552, -0.06538442294808501 ],
		[ -0.09098281098284752, -0.3127282905230739,  1.5227665613052603  ] ],
	ConetoIab_M : [
		[  0.5,       0.5,       0        ],
		[  3.524000, -4.066708,  0.542708 ],
		[  0.199076,  1.096799, -1.295875 ] ],
// ConetoIab_M inverted
	IabtoCone_M : [
		[ 1,                   0.1386050432715393,   0.05804731615611886 ],
		[ 0.9999999999999999, -0.1386050432715393,  -0.05804731615611886 ],
		[ 0.9999999999999998, -0.09601924202631895, -0.8118918960560388  ] ] };
Object.deepFreeze(_Jᶻaᶻbᶻ_);

class JᶻaᶻbᶻA_Array extends ColorA_Array  {
	constructor(Jz,az,bz,α)  { // Jz is “normalized” to 0–1
		if (arguments.length===0)  super(4);
		else if (α===undefined)  super(Jz,az,bz);
		else  super(Jz,az,bz,α);  }
	get Jz() {return this[0]}  set Jz($) {this[0]=$}
	get az() {return this[1]}  set az($) {this[1]=$}
	get bz() {return this[2]}  set bz($) {this[2]=$}
	get Jᶻ() {return this[0]}  set Jᶻ($) {this[0]=$}
	get aᶻ() {return this[1]}  set aᶻ($) {this[1]=$}
	get bᶻ() {return this[2]}  set bᶻ($) {this[2]=$}
	get α() {return this[3]}  set α($) {this[3]=$}
	get lightness() {return this[0]}  set lightness($) {this[0]=$}
	get a_axis()    {return this[1]}  set a_axis($)    {this[1]=$}
	get b_axis()    {return this[2]}  set b_axis($)    {this[2]=$}
	get alpha()     {return this[3]}  set alpha($)     {this[3]=$}
	get opacity()   {return this[3]}  set opacity($)   {this[3]=$}
	get jzazbza() {return this.slice(0,4);}

	//  https://github.com/color-js/color.js/blob/main/src/spaces/jzazbz.js
	to_XYZ(factory)  {
		factory??=this.config.XYZA_Factory;
		const
			_=_Jᶻaᶻbᶻ_,  //←properties are constants
			[Jz, az, bz] = this,
			Iz = (Jz + _.d0) / (1 + _.d - _.d * (Jz + _.d0)),
		// bring into LMS cone domain
			PQLMS = Math.mul_3_3_matrix(_.IabtoCone_M, [ Iz, az, bz ]),
		// convert from PQ-coded to linear-light
			LMS = PQLMS.map(val=>{
				const
					num = (_.c1 - (val ** _.pinv)),
					denom = (_.c3 * (val ** _.pinv)) - _.c2;
				// luminance relative to diffuse white, [0, 70 or so].
				return 10000 * ((num / denom) ** _.ninv);  }),
		// modified abs XYZ
			[ Xm, Ym, Za ] = Math.mul_3_3_matrix(_.ConetoXYZ_M, LMS),
		// restore standard D50 relative XYZ, relative to media white
			Xa = (Xm + ((_.b - 1) * Za)) / _.b,
			Ya = (Ym + ((_.g - 1) * Xa)) / _.g,
		// convert XYZ_abs_D65 to XYZ_D65
			X=max(Xa,0)/203,  //203=absolute luminance of media white
			Y=max(Ya,0)/203,
			Z=max(Za,0)/203,
			α= (this[3]===undefined) ? this.config?.defaultAlpha : this[3];
		// color.js says this is "based" on XYZ_abs_D65, but comments above suggest D50?
		return new factory(X,Y,Z,α, "D65", "2°");  }  }

Object.defineProperties(JᶻaᶻbᶻA_Array.prototype, {
	to_JᶻCᶻhᶻ: {value: LabA_Array.prototype.to_LCh},
	LCh_factory: {value: "JᶻCᶻhᶻA_Factory"},
	minimumChroma: {value: 0.001},
	model: {value: 'Jᶻaᶻbᶻ'},
	CSS_model: {value: 'Jzazbz'},
	toString: {value: OKLabA_Array.prototype.toString},
	axisPer: {value: 1},
	axisMax: {value: 0.5} });
// ↑ we add config to the prototype below…


class JᶻaᶻbᶻA_Color extends JᶻaᶻbᶻA_Array  {
	constructor($Jz,$az,$bz,$α, $config)  {
		super();
		this.config= new JᶻaᶻbᶻA_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  { $Jz=thisClr.getFactor($arr[0], true);  $az=thisClr.getAxis($arr[1], 1, 0.5);  $bz=thisClr.getAxis($arr[2], 1, 0.5);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$Jz,  set: ($)=>$Jz=thisClr.getFactor($, true),  enumerable: true},
			1: {get: ()=>$az,  set: ($)=>$az=thisClr.getAxis($, 1, 0.5),  enumerable: true},
			2: {get: ()=>$bz,  set: ($)=>$bz=thisClr.getAxis($, 1, 0.5),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			jᶻaᶻbᶻa: {get: ()=>[$Jz,$az,$bz,$α],  set: readArr} });  }  }

Object.defineProperties(JᶻaᶻbᶻA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getAlpha: {value: getAlphaFactor} });

SoftMoon.WebWare.JᶻaᶻbᶻA_Array=JᶻaᶻbᶻA_Array;
SoftMoon.WebWare.JᶻaᶻbᶻA_Color=JᶻaᶻbᶻA_Color;

JᶻaᶻbᶻA_Color.ConfigStack=class extends ConfigStack {}
JᶻaᶻbᶻA_Color.ConfigStack.prototype.name='JᶻaᶻbᶻA_Color.ConfigStack';
// ↑ we add factories to the prototype below…


class JᶻCᶻhᶻA_Array extends _base_$ch_array  {
	get Jᶻ() {return this[0]}  set Jᶻ($) {this[0]=$}
	get jz() {return this[0]}  set jz($) {this[0]=$}
	get lightness() {return this[0]}  set lightness($) {this[0]=$}
	get jᶻcᶻhᶻ() {return this.slice(0,4)}  }
Object.defineProperties(JᶻCᶻhᶻA_Array.prototype, {
	model: {value: 'JᶻCᶻhᶻ'},
	CSS_model: {value: 'JzCzhz'},
	cPer: {value: 1},
	cMax: {value: 0.70710678118654752440084436210485},  //  √(0.5²+0.5²)
	progenitor_factory: {value:"JᶻaᶻbᶻA_Factory"},
	to_Jᶻaᶻbᶻ: {value: LChA_Array.prototype.to_Lab},
	config: {writable:true, value: new ConfigStack(JᶻCᶻhᶻA_Array.prototype, {JᶻaᶻbᶻA_Factory: JᶻaᶻbᶻA_Array})} });

class JᶻCᶻhᶻA_Color extends JᶻCᶻhᶻA_Array  {
	constructor($J,$C,$h,$α, $config)  {  // 0 ≤ [$J,$H] ≤ 1     0 ≤ $C ≤ ≈0.707106781  ←(100%===1)
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  {
			$J=thisClr.getFactor($arr[0], true);
			$C=thisClr.getAxis($arr[1], 1, 0.70710678118654752440084436210485);
			$h=thisClr.getHue($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$J,  set: ($)=>$J=thisClr.getFactor($, true),  enumerable: true},
			1: {get: ()=>$C,  set: ($)=>$C=thisClr.getAxis($, 1, 0.70710678118654752440084436210485),  enumerable: true},
			2: {get: ()=>$h,  set: ($)=>$h=thisClr.getHue($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			jᶻaᶻbᶻa: {get: ()=>[$J,$C,$h,$α],  set: readArr}  });  }  }

Object.defineProperties(JᶻCᶻhᶻA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getHue: {value: getHueFactor},
	getAlpha: {value: getAlphaFactor} });

JᶻCᶻhᶻA_Color.ConfigStack=class extends ConfigStack {}
JᶻCᶻhᶻA_Color.ConfigStack.prototype.name='JᶻCᶻhᶻA_Color.ConfigStack';
JᶻCᶻhᶻA_Color.ConfigStack.prototype.JᶻaᶻbᶻA_Factory=JᶻaᶻbᶻA_Color;

SoftMoon.WebWare.JᶻCᶻhᶻA_Array=JᶻCᶻhᶻA_Array;
SoftMoon.WebWare.JᶻCᶻhᶻA_Color=JᶻCᶻhᶻA_Color;



//  https://github.com/color-js/color.js/blob/main/src/spaces/ictcp.js
const _ICᵀCᴾ_={
	c1: 3424 / 4096,
	c2: 2413 / 128,
	c3: 2392 / 128,
	m1: 2610 / 16384,
	m2: 2523 / 32,
	im1: 16384 / 2610,
	im2: 32 / 2523,

// The matrix below includes the 4% crosstalk components
// and is from the Dolby "What is ICtCp" paper"
	XYZtoLMS_M: [
	[  0.3592832590121217,  0.6976051147779502, -0.0358915932320290 ],
	[ -0.1920808463704993,  1.1004767970374321,  0.0753748658519118 ],
	[  0.0070797844607479,  0.0748396662186362,  0.8433265453898765 ] ],
// linear-light Rec.2020 to LMS, again with crosstalk
// rational terms from Jan Fröhlich,
// Encoding High Dynamic Range andWide Color Gamut Imagery, p.97
// and ITU-R BT.2124-0 p.2
/*
const Rec2020toLMS_M = [
	[ 1688 / 4096,  2146 / 4096,   262 / 4096 ],
	[  683 / 4096,  2951 / 4096,   462 / 4096 ],
	[   99 / 4096,   309 / 4096,  3688 / 4096 ]
];
*/
// this includes the Ebner LMS coefficients,
// the rotation, and the scaling to [-0.5,0.5] range
// rational terms from Fröhlich p.97
// and ITU-R BT.2124-0 pp.2-3
	LMStoIPT_M: [
	[  2048 / 4096,   2048 / 4096,       0      ],
	[  6610 / 4096, -13613 / 4096,  7003 / 4096 ],
	[ 17933 / 4096, -17390 / 4096,  -543 / 4096 ] ],

// inverted matrices, calculated from the above
	IPTtoLMS_M: [
	[ 0.9999999999999998,  0.0086090370379328,  0.1110296250030260 ],
	[ 0.9999999999999998, -0.0086090370379328, -0.1110296250030259 ],
	[ 0.9999999999999998,  0.5600313357106791, -0.3206271749873188 ] ],
/*
const LMStoRec2020_M = [
	[ 3.4375568932814012112,   -2.5072112125095058195,   0.069654319228104608382],
	[-0.79142868665644156125,   1.9838372198740089874,  -0.19240853321756742626 ],
	[-0.025646662911506476363, -0.099240248643945566751, 1.1248869115554520431  ]
];
*/
	LMStoXYZ_M: [
	[  2.0701522183894223, -1.3263473389671563,  0.2066510476294053 ],
	[  0.3647385209748072,  0.6805660249472273, -0.0453045459220347 ],
	[ -0.0497472075358123, -0.0492609666966131,  1.1880659249923042 ] ] };
Object.deepFreeze(_ICᵀCᴾ_);

class ICᵀCᴾA_Array extends ColorA_Array  { // 0 ≤ I ≤ 1  -0.5 ≤ C ≤ 0.5
	constructor(I,Ct,Cp,α)  {
		if (arguments.length===0)  super(4);
		else if (α===undefined)  super(I,Ct,Cp);
		else  super(I,Ct,Cp,α);  }
	get I()  {return this[0]}  set I($)  {this[0]=$}
	get Ct() {return this[1]}  set Ct($) {this[1]=$}
	get Cp() {return this[2]}  set Cp($) {this[2]=$}
	get Cᵀ() {return this[1]}  set Cᵀ($) {this[1]=$}
	get Cᴾ() {return this[2]}  set Cᴾ($) {this[2]=$}
	get α()  {return this[3]}  set α($)  {this[3]=$}
	get intensity()   {return this[0]}  set intensity($)   {this[0]=$}
	get tritan_axis() {return this[1]}  set tritan_axis($) {this[1]=$}
	get protan_axis() {return this[2]}  set protan_axis($) {this[2]=$}
	get alpha()   {return this[3]}  set alpha($)   {this[3]=$}
	get opacity() {return this[3]}  set opacity($) {this[3]=$}
	get ictcpa() {return this.slice(0,4);}

// https://github.com/color-js/color.js/blob/main/src/spaces/ictcp.js
// Only the PQ form of ICtCp is implemented here. There is also an HLG form.
// from Dolby, "WHAT IS ICTCP?"
// https://professional.dolby.com/siteassets/pdfs/ictcp_dolbywhitepaper_v071.pdf
// and
// Dolby, "Perceptual Color Volume
// Measuring the Distinguishable Colors of HDR and WCG Displays"
// https://professional.dolby.com/siteassets/pdfs/dolby-vision-measuring-perceptual-color-volume-v7.1.pdf
	to_XYZ(factory)  {
		factory??=this.config.XYZA_Factory;
		const
			_ = _ICᵀCᴾ_,
			PQLMS = Math.mul_3_3_matrix(_.IPTtoLMS_M, this),
			LMS = PQLMS.map(val=>  { // From BT.2124-0 Annex 2 Conversion 3
				val=max(val,0);
				const
					num  = max((val ** _.im2) - _.c1, 0),
					denom = (_.c2 - (_.c3 * (val ** _.im2)));
				return 10000 * ((num / denom) ** _.im1);  }),
			[X,Y,Z] = Math.mul_3_3_matrix(_.LMStoXYZ_M, LMS).map(v=>max(v, 0)/203),
			α= (this[3]===undefined) ? this.config?.defaultAlpha : this[3];
		return new factory(X,Y,Z,α, "D65", "2°");  }  }

Object.defineProperties(ICᵀCᴾA_Array.prototype, {
	to_IChᵀᴾ: {value: LabA_Array.prototype.to_LCh},
	LCh_factory: {value: "IChᵀᴾA_Factory"},
	minimumChroma: {value: 0.001},
	model: {value: 'ICᵀCᴾ'},
	CSS_model: {value: 'ICtCp'},
	toString: {value: OKLabA_Array.prototype.toString},
	axisPer: {value: 1},
	axisMax: {value: 0.5} });
// ↑ we add config to the prototype below…


class ICᵀCᴾA_Color extends ICᵀCᴾA_Array  {
	constructor($I,$Cᵀ,$Cᴾ,$α, $config)  {
		super();
		this.config= new ICᵀCᴾA_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  {
			$I=thisClr.getFactor($arr[0], true);
			$Cᵀ=thisClr.getAxis($arr[1], 1, 0.5);
			$Cᴾ=thisClr.getAxis($arr[2], 1, 0.5);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$I,   set: ($)=>$I =thisClr.getFactor($, true),  enumerable: true},
			1: {get: ()=>$Cᵀ,  set: ($)=>$Cᵀ=thisClr.getAxis($, 1, 0.5),  enumerable: true},
			2: {get: ()=>$Cᴾ,  set: ($)=>$Cᴾ=thisClr.getAxis($, 1, 0.5),  enumerable: true},
			3: {get: ()=>$α,   set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			icᵀcᴾa: {get: ()=>[$I,$Cᵀ,$Cᴾ,$α],  set: readArr} });  }  }

Object.defineProperties(ICᵀCᴾA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getAlpha: {value: getAlphaFactor} });

SoftMoon.WebWare.ICᵀCᴾA_Array=ICᵀCᴾA_Array;
SoftMoon.WebWare.ICᵀCᴾA_Color=ICᵀCᴾA_Color;

ICᵀCᴾA_Color.ConfigStack=class extends ConfigStack {}
ICᵀCᴾA_Color.ConfigStack.prototype.name='ICᵀCᴾA_Color.ConfigStack';
// ↑ we add factories to the prototype below…




class IChᵀᴾA_Array extends _base_$ch_array  {
	get I() {return this[0]}  set I($) {this[0]=$}
	get i() {return this[0]}  set i($) {this[0]=$}
	get intensity() {return this[0]}  set intensity($) {this[0]=$}  }
Object.defineProperties(IChᵀᴾA_Array.prototype, {
	model: {value: 'IChᵀᴾ'},
	CSS_model: {value: 'IChtp'},
	cPer: {value: 1},
	cMax: {value: 0.70710678118654752440084436210485},
	progenitor_factory: {value:"ICᵀCᴾA_Factory"},
	to_ICᵀCᴾ: {value: LChA_Array.prototype.to_Lab},
	config: {writable:true, value: new ConfigStack(IChᵀᴾA_Array.prototype, {ICᵀCᴾA_Factory: ICᵀCᴾA_Array})} });

class IChᵀᴾA_Color extends IChᵀᴾA_Array  {
	constructor($I,$c,$h,$α, $config)  {  // 0 ≤ [$I,$h] ≤ 1     0 ≤ $c ≤ ≈0.707106781  ←(100%===1)
		super();
		this.config= new ColorWheel_Color.ConfigStack(this, $config);
		if ($α===undefined)  $α=this.config.defaultAlpha;
		const
			thisClr=this;
		function readArr($arr)  {
			$I=thisClr.getFactor($arr[0], true);
			$c=thisClr.getAxis($arr[1], 1, 0.70710678118654752440084436210485);
			$h=thisClr.getHue($arr[2]);
			if (typeof $arr[3] === 'number')  $α=thisClr.getAlpha($arr[3]);
			else  $α=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: {get: ()=>$I,  set: ($)=>$I=thisClr.getFactor($, true),  enumerable: true},
			1: {get: ()=>$c,  set: ($)=>$c=thisClr.getAxis($, 1, 0.70710678118654752440084436210485),  enumerable: true},
			2: {get: ()=>$h,  set: ($)=>$h=thisClr.getHue($),  enumerable: true},
			3: {get: ()=>$α,  set: ($)=>$α=thisClr.getAlpha($),  enumerable: true},
			ichᵀᴾa: {get: ()=>[$I,$c,$h,$α],  set: readArr}  });  }  }

Object.defineProperties(IChᵀᴾA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAxis: {value: getAxisValue},
	getHue: {value: getHueFactor},
	getAlpha: {value: getAlphaFactor} });

IChᵀᴾA_Color.ConfigStack=class extends ConfigStack {}
IChᵀᴾA_Color.ConfigStack.prototype.name='IChᵀᴾA_Color.ConfigStack';
IChᵀᴾA_Color.ConfigStack.prototype.ICᵀCᴾA_Factory=ICᵀCᴾA_Color;

SoftMoon.WebWare.IChᵀᴾA_Array=IChᵀᴾA_Array;
SoftMoon.WebWare.IChᵀᴾA_Color=IChᵀᴾA_Color;



const XYZ_references={  //whites
// https://github.com/color-js/color.js/blob/main/src/adapt.js
	// for compatibility, the four-digit chromaticity-derived ones everyone else uses
	D50: {"2°": [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585]},
	D65: {"2°": [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290]}  };
// https://www.easyrgb.com/en/math.php
/*  XYZ (Tristimulus) Reference values of a perfect reflecting diffuser:
Observer:        2° (CIE 1931)                        10° (CIE 1964)
Illuminant   X2       Y2       Z2                 X10      Y10      Z10        // Notes:
	A: {"2°": [109.850, 100.000, 35.585],   "10°": [111.144, 100.000, 35.200]},  // Incandescent/tungsten
	B: {"2°": [99.0927, 100.000, 85.313],   "10°": [99.178, 100.000, 84.3493]},  // Old direct sunlight at noon
	C: {"2°": [98.074, 100.000, 118.232],   "10°": [97.285, 100.000, 116.145]},  // Old daylight
D50: {"2°": [96.422, 100.000, 82.521],    "10°": [96.720, 100.000, 81.427]},   // ICC profile PCS
D55: {"2°": [95.682, 100.000, 92.149],    "10°": [95.799, 100.000, 90.926]},   // Mid-morning daylight
D65: {"2°": [95.047, 100.000, 108.883],   "10°": [94.811, 100.000, 107.304]},  // Daylight, sRGB, Adobe-RGB
D75: {"2°": [94.972, 100.000, 122.638],   "10°": [94.416, 100.000, 120.641]},  // North sky daylight
	E: {"2°": [100.000, 100.000, 100.000],  "10°": [100.000, 100.000, 100.000]}, // Equal energy
 F1: {"2°": [92.834, 100.000, 103.665],   "10°": [94.791, 100.000, 103.191]},  // Daylight Fluorescent
 F2: {"2°": [99.187, 100.000, 67.395],    "10°": [103.280, 100.000, 69.026]},  // Cool fluorescent
 F3: {"2°": [103.754, 100.000, 49.861],   "10°": [108.968, 100.000, 51.965]},  // White Fluorescent
 F4: {"2°": [109.147, 100.000, 38.813],   "10°": [114.961, 100.000, 40.963]},  // Warm White Fluorescent
 F5: {"2°": [90.872, 100.000, 98.723],    "10°": [93.369, 100.000, 98.636]},   // Daylight Fluorescent
 F6: {"2°": [97.309, 100.000, 60.191],    "10°": [102.148, 100.000, 62.074]},  // Lite White Fluorescent
 F7: {"2°": [95.044, 100.000, 108.755],   "10°": [95.792, 100.000, 107.687]},  // Daylight fluorescent, D65 simulator
 F8: {"2°": [96.413, 100.000, 82.333],    "10°": [97.115, 100.000, 81.135]},   // Sylvania F40, D50 simulator
 F9: {"2°": [100.365, 100.000, 67.868],   "10°": [102.116, 100.000, 67.826]},  // Cool White Fluorescent
F10: {"2°": [96.174, 100.000, 81.712],    "10°": [99.001, 100.000, 83.134]},   // Ultralume 50, Philips TL85
F11: {"2°": [100.966, 100.000, 64.370],   "10°": [103.866, 100.000, 65.627]},  // Ultralume 40, Philips TL84
F12: {"2°": [108.046, 100.000, 39.228],   "10°": [111.428, 100.000, 40.353]}   // Ultralume 30, Philips TL83
 */
Object.lock(XYZ_references, 1);
Object.freeze(XYZ_references.D50['2°']);
Object.freeze(XYZ_references.D65['2°']);


const XYZ_adaptors={
	// https://github.com/color-js/color.js/blob/main/src/adapt.js
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// note we are not supporting observers other than 2° at this time.
	D50:  {D65: {
		CSS: [
				[ 0.955473421488075,    -0.02309845494876471,  0.06325924320057072 ],
				[-0.0283697093338637,    1.0099953980813041,   0.021041441191917323 ],
				[ 0.012314014864481998, -0.020507649298898964, 1.330365926242124 ] ],
		Lindbloom: [
				[ 0.9555766, -0.0230393, 0.0631636],
				[-0.0282895,  1.0099416, 0.0210077],
				[ 0.0122982, -0.0204830, 1.3299098] ] } },
	D65:  {D50: {
		CSS: [
				[ 1.0479297925449969,   0.022946870601609652, -0.05019226628920524 ],
				[ 0.02962780877005599,  0.9904344267538799,   -0.017073799063418826 ],
				[-0.009243040646204504, 0.015055191490298152,  0.7518742814281371 ] ],
		Lindbloom: [
				[ 1.0478112, 0.0228866, -0.0501270],
				[ 0.0295424, 0.9904844, -0.0170491],
				[-0.0092345, 0.0150436,  0.7521316] ] } } }
Object.lock(XYZ_adaptors, 2);
Object.deepFreeze(XYZ_adaptors.D50.D65.CSS);
Object.deepFreeze(XYZ_adaptors.D50.D65.Lindbloom);
Object.deepFreeze(XYZ_adaptors.D65.D50.CSS);
Object.deepFreeze(XYZ_adaptors.D65.D50.Lindbloom);


class XYZA_Array extends ColorA_Array  {
	static XYZ_reference_whites=XYZ_references;
	static XYZ_adaptors=XYZ_adaptors;
	//     ↓ from color.js → → from http://www.brucelindbloom.com/index.html
	static ε = 216 / 24389;  // 6^3/29^3 == (24/116)^3
	static κ = 24389 / 27;  // 29^3/3^3    === 903.296296296296…

	constructor(X,Y,Z,α, illuminantMatrix="D65", observer="2°")  {
		if (arguments.length===0)  super(4);
		else if (α===undefined)  super(X,Y,Z);
		else  super(X,Y,Z,α);
		Object.defineProperties(this, {
			illuminantMatrix: {value: illuminantMatrix, writable: true},
			observer: {value: observer, writable: true} });  }

	get illuminant() {return this.illuminantMatrix.match(/^([A-F]\d{1,2})_?/)?.[1];}

	adapt_illuminant($I, $O='2°', $factory)  {  // ← illuminant, observer
		if ($O!=='2°'  ||  this.observer!=='2°')
			//return this.config.onError(this, undefined, "Can not adapt XYZ values to other illuminants using observers other than 2°.");
			throw new TypeError("Can not adapt XYZ values to other illuminants using observers other than 2° at this time.\n  XYZ:",this,"\n  requested observer:",$O);
		const I=this.illuminant;
		if (I===$I)  return $factory ? new $factory(this[0],this[1],this[2],this[3],I,'2°') : this;
		const M=XYZ_adaptors[I][$I][this.illuminant_adaption_provider];
		$factory??=XYZA_Array;
		return new $factory(
			this[0]*M[0][0] + this[1]*M[0][1] + this[2]*M[0][2],
			this[0]*M[1][0] + this[1]*M[1][1] + this[2]*M[1][2],
			this[0]*M[2][0] + this[1]*M[2][1] + this[2]*M[2][2],
			this[3],
			$I, '2°');  }

	to_RGB(factory, roundRGB, defaultAlpha)  {
		if (factory)  this.config.RGBA_Factory=factory;
		if (roundRGB!==undefined)  this.config.roundRGB=Boolean.eval(roundRGB);
		if (arguments.length>2)  this.config.defaultAlpha=defaultAlpha;
		return fromXYZ.call(this, this, 'sRGB', this.illuminantMatrix);  }

	/* From the Wickline color-blind simulation algorithm:
	 * https://github.com/skratchdot/color-blind
	 *
	 * This source was copied from http://mudcu.be/sphere/js/Color.Blind.js
	 *******************(now:2019) https://galactic.ink/sphere/js/Color.Blind.js
	 *******************(now:2020) see: http://colorlab.wickline.org/colorblind/colorlab/engine.js
	 */
	// see also: https://www.easyrgb.com/en/math.php
	to_xyY()  {  //D65
		const n = this[0] + this[1] + this[2];
		if (n === 0)  return {x: 0, y: 0, Y: this[1], α: this[3]};
		return {x: this[0] / n, y: this[1] / n, Y: this[1], α: this[3]};  }

	// https://github.com/color-js/color.js/blob/main/src/spaces/lab-d65.js
	// https://github.com/color-js/color.js/blob/main/src/spaces/lab.js
	// https://www.easyrgb.com/en/math.php  // ← ¿incorrect formula?
	to_Lab(factory)  {  //D65 or D50
		factory??=this.config.LabA_Factory;
		// κ * ε  = 2^3 = 8
		const
			ε=XYZA_Array.ε,
			κ=XYZA_Array.κ,
			white=XYZ_references[this.illuminant][this.observer];
		// note at this point, XYZ matrixes only support these illuminants anyway...
		var [x,y,z]= // (this.observer==='2°'  &&  (this.illuminant==='D50'  ||  this.illuminant==='D65')) ?
					this;  // : this.adapt_illuminant('D50');  // ← D50 is the default for CSS
		x=x/white[0];
		y=y/white[1];
		z=z/white[2];
		x= (x>ε) ?  Math.cbrt(x) : ((κ * x + 16) / 116);  // easyrgb says (7.787 * x) + (16 / 116)
		y= (y>ε) ?  Math.cbrt(y) : ((κ * y + 16) / 116);
		z= (z>ε) ?  Math.cbrt(z) : ((κ * z + 16) / 116);
		const
			L=((116*y)-16)/100,
			a=500*(x-y),
			b=200*(y-z),
			α= (this[3]===undefined) ? this.config.defaultAlpha : this[3];
		return new factory(L,a,b,α,this.illuminant);  }

	to_OKLab(factory) {return Björn_Ottosson.xyz_to_oklab.call(this, this, factory);}  //D65

	//  https://github.com/color-js/color.js/blob/main/src/spaces/luv.js
	//  https://en.wikipedia.org/wiki/CIELUV#The_forward_transformation
	to_Luv(factory)  {  //D65
		factory??=this.config.LuvA_Factory;
		const
			[X,Y,Z] = (this.illuminant==="D65"  &&  this.observer==="2°") ? this : this.adapt_illuminant("D65", "2°"),
			denom = X + 15 * Y + 3 * Z,
			α= (this[3]===undefined) ? this.config.defaultAlpha : this[3];

		// Protect against XYZ of [0, 0, 0]
		if (denom===0)
			return (α===undefined) ? new factory(0,0,0) : new factory(0,0,0,α);

		const
			up=4*X/denom,
			vp=9*Y/denom,
			L = (Y <= XYZA_Array.ε)  ?  XYZA_Array.κ * Y  :  116 * Math.cbrt(Y) - 16,
			u = 13 * L * (up - LuvA_Array.U_PRIME_WHITE),
			v = 13 * L * (vp - LuvA_Array.V_PRIME_WHITE);
		return (α===undefined) ? new factory(L/100,u,v) : new factory(L/100,u,v,α);  }

	//  https://github.com/color-js/color.js/blob/main/src/spaces/jzazbz.js
	to_Jᶻaᶻbᶻ(factory)  {  //D65
		factory??=this.config.JᶻaᶻbᶻA_Factory;
		const
			_=_Jᶻaᶻbᶻ_,  //←properties are constants
			XYZ = (this.illuminant==="D65"  &&  this.observer==="2°") ? this : this.adapt_illuminant("D65", "2°"),
		// First make XYZ absolute, not relative to media white
		// Maximum luminance in PQ is 10,000 cd/m²
		// Relative XYZ has Y=1 for media white
		// BT.2048 says media white Y=203 at PQ 58
			[ Xa, Ya, Za ] = XYZ.map(v => max(v, 0) * 203),  //203=absolute luminance of media white
		// modify X and Y
			Xm = (_.b * Xa) - ((_.b - 1) * Za),
			Ym = (_.g * Ya) - ((_.g - 1) * Xa),
		// move to LMS cone domain
			LMS = Math.mul_3_3_matrix(_.XYZtoCone_M, [ Xm, Ym, Za ]),
		// PQ-encode LMS
			PQLMS = LMS.map(val=>{
				const
					num = _.c1 + (_.c2 * ((val / 10000) ** _.n)),
					denom = 1 + (_.c3 * ((val / 10000) ** _.n));
				return (num / denom)  ** _.p;  }),
		// almost there, calculate Iz az bz
			[ Iz, az, bz] = Math.mul_3_3_matrix(_.ConetoIab_M, PQLMS),
			Jz = ((1 + _.d) * Iz) / (1 + (_.d * Iz)) - _.d0,
			α= (this[3]===undefined) ? this.config.defaultAlpha : this[3];
		return (α===undefined) ? new factory(Jz,az,bz) : new factory(Jz,az,bz,α);  }

	// https://github.com/color-js/color.js/blob/main/src/spaces/ictcp.js
	to_ICᵀCᴾ(factory)  {  //D65
		factory??=this.config.ICᵀCᴾA_Factory;
		const
			_ = _ICᵀCᴾ_,
			XYZ = (this.illuminant==="D65"  &&  this.observer==="2°") ? this : this.adapt_illuminant("D65", "2°"),
			XYZ_abs=XYZ.map(v=>max(v, 0) * 203),  //203=absolute luminance of media white
			// move to LMS cone domain
			LMS = Math.mul_3_3_matrix(_.XYZtoLMS_M, XYZ_abs),
			// apply the PQ EOTF
			// we can't ever be dividing by zero because of the "1 +" in the denominator
			PQLMS = LMS.map(val=>  {
				const
					num = _.c1 + (_.c2 * ((val / 10000) ** _.m1)),
					denom = 1 + (_.c3 * ((val / 10000) ** _.m1));
				return (num / denom)  ** _.m2;  }),
			// LMS to IPT, with rotation for Y'C'bC'r compatibility
			[I,Ct,Cp] = Math.mul_3_3_matrix(_.LMStoIPT_M, PQLMS),
			α= (this[3]===undefined) ? this.config.defaultAlpha : this[3];
		return (α===undefined) ? new factory(I,Ct,Cp) : new factory(I,Ct,Cp,α);  }

	get x() {return this[0]}  set x($) {this[0]=$}
	get y() {return this[1]}  set y($) {this[1]=$}
	get z() {return this[2]}  set z($) {this[2]=$}
	get X() {return this[0]}  set X($) {this[0]=$}
	get Y() {return this[1]}  set Y($) {this[1]=$}
	get Z() {return this[2]}  set Z($) {this[2]=$}
	get α() {return this[3]}  set α($) {this[3]=$}
	get alpha()   {return this[3]}  set alpha($)   {this[3]=$}
	get opacity() {return this[3]}  set opacity($) {this[3]=$}
	get xyza() {return this.slice(0,4);}

	toString(format)  {
		if (typeof format != 'string')  format="";
		format+= " "+this.config.stringFormat;
		var outAs=format.match( /color|css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
		if (outAs)  outAs=outAs[0].toLowerCase();
		const
			hasCom=format.match(/csv|commas/i),
			hasPln=format.match(/plain/i),    //this is default
			commas= outAs==='self'
				||  hasCom  &&  outAs!=='color'  &&  outAs!=='css'  &&  outAs!=='tabbed'  &&  (!hasPln  ||  hasCom.index < hasPln.index),
			sep= (outAs==='tabbed') ? "\t" : (commas ? ", " : " "),
			alpha= (typeof this[3] === 'number'
							||  ( ( /alpha/i ).test(format)                                    //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this[3]= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) )),
			p=format.match(/precision: ?(\d+)/),
			precision= p ? p[1] : 7;
			/*
			 * note that Bruce Lindbloom uses 7-decimal precision in his matrices to/from sRGB
			 * we MAY have to increase the precision below when we break into P3 and Wide-Gamut
			 */
		var s=roundTo(precision, this[0])+ sep +roundTo(precision, this[1])+ sep +roundTo(precision, this[2]);
		if (alpha)  {
			s+=(commas ? sep : ' / ');
			const
				hasPer=format.match('percent'),
				hasFac=format.match('factor');
			s+= (!hasFac  ||  (hasPer  &&  hasPer.index < hasFac.index)) ?
					roundTo(1, this[3]*100)+'%'
				: roundTo(3, this[3]);  }
		const
			illum=this.illuminant?.match(/^([A-F]\d{1,2})_/)?.[1],
			model='XYZ'+(illum ? ('-'+illum) : "");
		switch (outAs)  {
		case 'color':  return 'color('+model+' '+s+')';
		case 'css':
		case 'html':
		case 'wrap':
		case 'function':  return model+'('+s+')';
		case 'prefix':    return model+': '+s;
		case 'csv':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return 'XYZA_ColorArray: ('+s+', '+this.illuminant+', '+this.observer+')';  }  }  }

Object.defineProperties(XYZA_Array.prototype, {
	model: {value: 'XYZ'},
	γCorrect_linear_RGB: {value: γCorrect_linear_RGB},
	output_clampedRGB: {value: output_clampedRGB},
	illuminant_adaption_provider: {writable:true, value: "Lindbloom"},  // ← CSS ‖ Lindbloom
	config: {writable:true, value: new ConfigStack(XYZA_Array.prototype,
		{roundRGB:false, defaultAlpha:undefined, RGB_profile:'sRGB', RGB_bitDepth:255,
			RGBA_Factory: RGBA_Array, LabA_Factory: LabA_Array, LuvA_Factory: LuvA_Array,
			OKLabA_Factory: OKLabA_Array, JᶻaᶻbᶻA_Factory: JᶻaᶻbᶻA_Array,
			ICᵀCᴾA_Factory: ICᵀCᴾA_Array})} });

class XYZA_Color extends XYZA_Array  {  // at this time we are NOT verifying the input values for XYZA_Colors, as we do other …A_Colors
	constructor(X,Y,Z,α, illuminant, observer, $config)  {
		super(X,Y,Z,α, illuminant, observer);
		this.config= new XYZA_Color.ConfigStack(this, $config);
		if (α===undefined)  this[3]=this.config.defaultAlpha;  }  }

SoftMoon.WebWare.XYZA_Array=XYZA_Array;
SoftMoon.WebWare.XYZA_Color=XYZA_Color;

XYZA_Color.ConfigStack=class extends ConfigStack {}
XYZA_Color.ConfigStack.prototype.name='XYZA_Color.ConfigStack';
XYZA_Color.ConfigStack.prototype.RGBA_Factory=RGBA_Color;
XYZA_Color.ConfigStack.prototype.LabA_Factory=LabA_Color;
XYZA_Color.ConfigStack.prototype.LuvA_Factory=LuvA_Color;
XYZA_Color.ConfigStack.prototype.OKLabA_Factory=OKLabA_Color;
XYZA_Color.ConfigStack.prototype.JᶻaᶻbᶻA_Factory=JᶻaᶻbᶻA_Color;
XYZA_Color.ConfigStack.prototype.ICᵀCᴾA_Factory=ICᵀCᴾA_Color;



// Now we take-up the slack since classes are not hoisted…
// ↓ ¡Yet another example of “classes” making the codebase harder to follow and read and maintain!

Object.defineProperties(ICᵀCᴾA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(ICᵀCᴾA_Array.prototype,
		{XYZA_Factory:XYZA_Array, IChᵀᴾA_Factory: IChᵀᴾA_Array})} });
ICᵀCᴾA_Color.ConfigStack.prototype.XYZA_Factory=XYZA_Color;
ICᵀCᴾA_Color.ConfigStack.prototype.IChᵀᴾA_Factory=IChᵀᴾA_Color;

Object.defineProperties(JᶻaᶻbᶻA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(JᶻaᶻbᶻA_Array.prototype,
		{XYZA_Factory:XYZA_Array, JᶻCᶻhᶻA_Factory: JᶻCᶻhᶻA_Array})} });
JᶻaᶻbᶻA_Color.ConfigStack.prototype.XYZA_Factory=XYZA_Color;
JᶻaᶻbᶻA_Color.ConfigStack.prototype.JᶻCᶻhᶻA_Factory=JᶻCᶻhᶻA_Color;


const __denom__=XYZ_references.D65['2°'][0] + 15 * XYZ_references.D65['2°'][1] + 3 * XYZ_references.D65['2°'][2];
Object.defineProperties(LuvA_Array, {
	U_PRIME_WHITE: {enumerable: true, value: 4*XYZ_references.D65['2°'][0]/__denom__},
	V_PRIME_WHITE: {enumerable: true, value: 9*XYZ_references.D65['2°'][1]/__denom__} });
Object.defineProperties(LuvA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(LuvA_Array.prototype, {XYZA_Factory:XYZA_Array, LChᵤᵥA_Factory: LChᵤᵥA_Array})} });
LuvA_Color.ConfigStack.prototype.XYZA_Factory=XYZA_Color;
LuvA_Color.ConfigStack.prototype.LChᵤᵥA_Factory=LChᵤᵥA_Color;


Object.defineProperties(LabA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(LabA_Array.prototype, {XYZA_Factory:XYZA_Array, LChA_Factory: LChA_Array})} });
LabA_Color.ConfigStack.prototype.XYZA_Factory=XYZA_Color;
LabA_Color.ConfigStack.prototype.LChA_Factory=LChA_Color;

Object.defineProperties(OKLabA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(OKLabA_Array.prototype,
		{roundRGB:false, defaultAlpha:undefined, RGB_profile:'sRGB', RGB_bitDepth:255,
		 RGBA_Factory: RGBA_Array, XYZA_Factory: XYZA_Array, OKLChA_Factory: OKLChA_Array, OKHSVA_Factory: OKHSVA_Array, OKHSLA_Factory: OKHSLA_Array})} });
OKLabA_Color.ConfigStack.prototype.RGBA_Factory=RGBA_Color;
OKLabA_Color.ConfigStack.prototype.XYZA_Factory=XYZA_Color;
OKLabA_Color.ConfigStack.prototype.OKLChA_Factory=OKLChA_Color;
OKLabA_Color.ConfigStack.prototype.OKHSVA_Factory=OKHSVA_Color;
OKLabA_Color.ConfigStack.prototype.OKHSLA_Factory=OKHSLA_Color;

Object.defineProperties(OKLChA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(OKLChA_Array.prototype, {OKLabA_Factory: OKLabA_Array})} });

Object.defineProperties(OKHSLA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(OKHSLA_Array.prototype, {OKLabA_Factory: OKLabA_Array, OKHCGA_Factory: OKHCGA_Array})} });

Object.defineProperties(OKHSVA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(OKHSVA_Array.prototype, {OKLabA_Factory: OKLabA_Array, OKHWBA_Factory: OKHWBA_Array})} });

Object.defineProperties(OKHWBA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(OKHWBA_Array.prototype, {OKLabA_Factory: OKLabA_Array})} });

Object.defineProperties(OKHCGA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(OKHCGA_Array.prototype, {OKLabA_Factory: OKLabA_Array})} });

ColorWheel_Color.ConfigStack.prototype.RGBA_Factory=RGBA_Color;
ColorWheel_Color.ConfigStack.prototype.CMYKA_Factory=CMYKA_Color;  // for HSV to CMYK
ColorWheel_Color.ConfigStack.prototype.OKLabA_Factory=OKLabA_Color;  // for OKHSV & OKHSL & OKHWB & OKHCG & OKLCh
ColorWheel_Color.ConfigStack.prototype.LuvA_Factory=LuvA_Color;  // for LChᵤᵥ & HSLᵤᵥ
//ColorWheel_Color.ConfigStack.prototype.LChᵤᵥA_Factory=LChᵤᵥA_Color;  // for Luv & HSLᵤᵥ
ColorWheel_Color.ConfigStack.prototype.JᶻaᶻbᶻA_Factory=JᶻaᶻbᶻA_Color;  // for JᶻCᶻhᶻ
ColorWheel_Color.ConfigStack.prototype.ICᵀCᴾA_Factory=ICᵀCᴾA_Color;  // for IChᵀᴾ
//ColorWheel_Color.ConfigStack.prototype.XYZA_Factory=XYZA_Color;  // for Luv & Lab & OKLab

Object.defineProperties(RGBA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(RGBA_Array.prototype, {XYZA_Factory:XYZA_Array, OKLabA_Factory: OKLabA_Array})} });

//  You may want to use  Array  or create your own Class constructor for any of these 22 Factories below
// The …A_Color-classes below have simple (and thus quicker to construct) Array-based superclasses with the conversion functions prototyped in
//  and you may want to use any of those for the factories below:
RGBA_Color.ConfigStack.prototype.HSLA_Factory= HSLA_Color;
RGBA_Color.ConfigStack.prototype.HSBA_Factory= HSBA_Color;
RGBA_Color.ConfigStack.prototype.HSVA_Factory= HSVA_Color;
RGBA_Color.ConfigStack.prototype.HWBA_Factory= HWBA_Color;
RGBA_Color.ConfigStack.prototype.HCGA_Factory= HCGA_Color;
RGBA_Color.ConfigStack.prototype.CMYKA_Factory= CMYKA_Color;
RGBA_Color.ConfigStack.prototype.LabA_Factory=   LabA_Color;
RGBA_Color.ConfigStack.prototype.LChA_Factory=   LChA_Color;
RGBA_Color.ConfigStack.prototype.LuvA_Factory=   LuvA_Color;
RGBA_Color.ConfigStack.prototype.LChᵤᵥA_Factory= LChᵤᵥA_Color;
RGBA_Color.ConfigStack.prototype.HSLᵤᵥA_Factory= HSLᵤᵥA_Color;
RGBA_Color.ConfigStack.prototype.JᶻaᶻbᶻA_Factory= JᶻaᶻbᶻA_Color;
RGBA_Color.ConfigStack.prototype.JᶻCᶻhᶻA_Factory= JᶻCᶻhᶻA_Color;
RGBA_Color.ConfigStack.prototype.ICᵀCᴾA_Factory= ICᵀCᴾA_Color;
RGBA_Color.ConfigStack.prototype.IChᵀᴾA_Factory= IChᵀᴾA_Color;
RGBA_Color.ConfigStack.prototype.OKLabA_Factory= OKLabA_Color;
RGBA_Color.ConfigStack.prototype.OKLChA_Factory= OKLChA_Color;
RGBA_Color.ConfigStack.prototype.OKHSLA_Factory= OKHSLA_Color;
RGBA_Color.ConfigStack.prototype.OKHSVA_Factory= OKHSVA_Color;
RGBA_Color.ConfigStack.prototype.OKHWBA_Factory= OKHWBA_Color;
RGBA_Color.ConfigStack.prototype.OKHCGA_Factory= OKHCGA_Color;
RGBA_Color.ConfigStack.prototype.XYZA_Factory=   XYZA_Color;
/*
 *The 22 factory pointers (above) control the output of the RGBA_Color instance conversion functions.
 */


// if only classes were hoisted…
// the promise of “cleaner code” was shattered and this codebase organization scattered
// (it was already hard to organize without extensive scrolling to follow the code flow)
// when we moved to “classes” to extend the Array interface.
// Ideally, this would be declared a “static” function in the ColorWheel_Color class, but it references the child-classes that reference the parent…

Object.defineProperty(ColorWheel_Array, 'create', {enumerable: true,
	value: function($θ, $_1, $_2, $α, $model)  {
		//this called by external code; it releases the names of the individual …A_Array objects & the order of arguments
		switch ($model.toUpperCase())  {
		case 'HSL': return new HSLA_Array($θ, $_1, $_2, $α);
		case 'HSB': return new HSBA_Array($θ, $_1, $_2, $α);
		case 'HSV': return new HSVA_Array($θ, $_1, $_2, $α);
		case 'HCG': return new HCGA_Array($θ, $_1, $_2, $α);
		case 'HWB': return new HWBA_Array($θ, $_1, $_2, $α);
		case 'HSLUV':
		case 'HSLᵤᵥ': return new HSLᵤᵥA_Array($θ, $_1, $_2, $α);
		case 'LCHUV':
		case 'LCHᵤᵥ': return new LChᵤᵥA_Array($_2, $_1, $θ, $α);
		case 'LCH':   return new LChA_Array($_2, $_1, $θ, $α);
		case 'JZCZHZ':
		case 'JᶻCᶻHᶻ':return new JᶻCᶻhᶻA_Array($_2, $_1, $θ, $α);
		case 'ICHTP':
		case 'ICHᵀᴾ': return new IChᵀᴾA_Array($_2, $_1, $θ, $α);
		case 'OKLCH': return new OKLChA_Array($_2, $_1, $θ, $α);
		case 'OKHSV': return new OKHSVA_Array($θ, $_1, $_2, $α);
		case 'OKHSL': return new OKHSLA_Array($θ, $_1, $_2, $α);
		case 'OKHWB': return new OKHWBA_Array($θ, $_1, $_2, $α);
		case 'OKHCG': return new OKHCGA_Array($θ, $_1, $_2, $α);
		default: throw new Error('Unknown ColorWheel_Array model:',$model);  }  }});

Object.defineProperty(ColorWheel_Color, 'create', {enumerable: true,
	value: function($θ, $_1, $_2, $α, $config, $model)  {
		//this called by external code; it releases the names of the individual …A_Color objects & the order of arguments
		switch ($model.toUpperCase())  {
		case 'HSL': return new HSLA_Color(...arguments);
		case 'HSB': return new HSBA_Color(...arguments);
		case 'HSV': return new HSVA_Color(...arguments);
		case 'HCG': return new HCGA_Color(...arguments);
		case 'HWB': return new HWBA_Color(...arguments);
		case 'HSLUV':
		case 'HSLᵤᵥ': return new HSLᵤᵥA_Color(...arguments);
		case 'LCHUV':
		case 'LCHᵤᵥ': return new LChᵤᵥA_Color($_2, $_1, $θ, $α, $config);
		case 'LCH':   return new LChA_Color($_2, $_1, $θ, $α, $config);
		case 'JZCZHZ':
		case 'JᶻCᶻHᶻ':return new JᶻCᶻhᶻA_Color($_2, $_1, $θ, $α, $config);
		case 'ICHTP':
		case 'ICHᵀᴾ': return new IChᵀᴾA_Color($_2, $_1, $θ, $α);
		case 'OKLCH': return new OKLChA_Color($_2, $_1, $θ, $α, $config);
		case 'OKHSV': return new OKHSVA_Color(...arguments);
		case 'OKHSL': return new OKHSLA_Color(...arguments);
		case 'OKHWB': return new OKHWBA_Color(...arguments);
		case 'OKHCG': return new OKHCGA_Color(...arguments);
		default: throw new Error('Unknown ColorWheel_Color model:',$model);  }  }});





/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/





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
// • as a string similar to the CSS “color()” function: e.g.  "color(srgb 0 1 1)"
//    ↑ where ANY color-model or palette is valid, not only standard CSS models.
//    ↑ For all RGB models, note that the values should be factors from 0—1.
// • as a string — standard formats for naming colors using color-models or Palettes (see RegExp section at top)
// • as a string specifying a color name found on the default Palette (the default Palette must be loaded)
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
			if (arguments.length===1)  {
				if ($string == null)  return null;
				if (typeof $string === 'string')  {
					if (RegExp.isHex.test($string))
							return calc.from.hex($string);
					let matches, pClr;
					if ((SoftMoon.palettes[SoftMoon.defaultPalette] instanceof SoftMoon.WebWare.Palette)
					&&  (pClr=$string.match(RegExp.addOnAlpha))
					&&  (matches=SoftMoon.palettes[SoftMoon.defaultPalette].getColor(pClr[1])) )  {
						calc.config.stack(SoftMoon.palettes[SoftMoon.defaultPalette].config);
						try {
							if (pClr[2]  &&  calc.config.forbidAddOnAlpha)
								return calc.config.onError($string, undefined, MSG_noAddOnAlpha);
							matches=calc(matches);  }
						finally {calc.config.cull();}
						if (matches)  {
							matches.palette=SoftMoon.defaultPalette;
							matches.colorName=pClr;
							if (pClr[2])  matches=calc.applyAlpha(matches, calc.getAlpha(pClr[2]), 'Palette color');  }
						return matches;  }
					let isClr=false, tmp;
					if (matches=( ((tmp=$string.match(RegExp.CSSColorFunction))  &&  (isClr=true)  &&  tmp)
											||  $string.match(RegExp.stdWrappedColor)
											||  $string.match(RegExp.stdPrefixedColor)))  {
						matches[1]=matches[1].trim().toLowerCase();
						if (typeof calc.from[matches[1]] === 'function')  {
							if (isClr)  calc.config.stack({inputAsFactor:{value:true}, inputAsNumeric:{value:true}});
							try {return calc.from[matches[1]](matches[2]);}
							finally {if (isClr)  calc.config.cull();}  }
						for (const p in SoftMoon.palettes)  {
							if (p.toLowerCase()===matches[1]  &&  (SoftMoon.palettes[p] instanceof SoftMoon.WebWare.Palette))  {
								matches=matches[2].match(RegExp.addOnAlpha);
								const name=matches[1], a=matches[2];
								calc.config.stack(SoftMoon.palettes[p].config);
								try {
									if (a  &&  calc.config.forbidAddOnAlpha)
										return calc.config.onError($string, undefined, MSG_noAddOnAlpha);
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
		for (const p of props)  { switch (p)  {
			case 'luminance':
				Object.defineProperty(calc, p, {value:function(color)  {
						this.config.stack({RGBA_Factory: {value:Array}});
						try {return luminance.call(calc, calc(color));}
						finally {this.config.cull();}  },
					enumerable: true});
			break;
			case 'contrastRatio':
				Object.defineProperty(calc, p, {value:function(fore, back)  {
						this.config.stack({RGBA_Factory: {value:Array}});
						try {return contrastRatio(calc(fore), calc(back));}
						finally {this.config.cull();}  },
					enumerable: true});
			break;
			default:
				Object.defineProperty(calc, p, Object.getOwnPropertyDescriptor(RGB_Calc.prototype, p));  }  }
		Object.defineProperties(calc,  {
			convertColor: {value: convertColor},  //this is for plug-ins
			$: {value: calc}  });   } //this is also used internally by convertColor

	const definer=RGB_Calc.definer[$quickCalc ? 'quick' : 'audit'];

	Object.defineProperties(calc, {
		config: {enumerable: true,  writable: true, configurable: true,   value: new definer.ConfigStack(calc, $config)},
		to:     {enumerable: true,  value: Object.create(calc, !$mini && definer.to)},
		from:   {enumerable: true,  value: Object.create(calc, !$mini && definer.from)}  });
	if ($mini)  {
		if ($mini.to)  for (const p of $mini.to)  {
			Object.defineProperty(calc.to,  p,  definer.to[p]);  }
		if ($mini.from)  for (const p of $mini.from)  {
			Object.defineProperty(calc.from,  p,  definer.from[p]);  }  }

	return calc;  }




//===============================================================


//===============================================================

const
	defProps1={  // these are worker methods of a Calculator & a ColorFactory
		getByte:     {value: getByteValue},
		getFactor:   {value: getFactorValue},
		getAxis:     {value: getAxisValue},  // for OKLab & OKLCh & Lab & LCh
		getHueFactor:{value: getHueFactor},
		getAlpha:    {value: getAlphaFactor},
		factorize:   {value: factorize},
		applyAlpha:  {value: applyAlpha},
		γCorrect_linear_RGB:      {value: γCorrect_linear_RGB},
		linearize_γCorrected_RGB: {value: linearize_γCorrected_RGB} },
	defProps2={  // these are worker methods of a calculator
		multiplyAddOnAlpha: {value: multiplyAddOnAlpha},
		convertColor:{value: convertColor}  /*for plug-ins*/
	};
Object.defineProperties(RGB_Calc, defProps1);
Object.defineProperties(RGB_Calc.prototype, defProps1);
Object.defineProperties(RGB_Calc, defProps2);
Object.defineProperties(RGB_Calc.prototype, defProps2);


//you may add to these …but replacing them altogether does nothing…
RGB_Calc.RGB_profiles=RGB_profiles;
RGB_Calc.hueAngleUnitFactors=hueAngleUnitFactors;

RGB_Calc.output_RGB=
RGB_Calc.prototype.output_RGB= output_RGB;
RGB_Calc.output_RGB_factors=
RGB_Calc.prototype.output_RGB_factors= output_RGB_factors;
RGB_Calc.output_sRGB=
RGB_Calc.prototype.output_sRGB= output_sRGB;
RGB_Calc.output_clampedRGB=
RGB_Calc.prototype.output_clampedRGB= output_clampedRGB;


RGB_Calc.install=
RGB_Calc.prototype.install= function(cSpace, provider)  {
	const meta=RGB_Calc[cSpace+"Providers"][provider];
	if (!meta)  {
		const message="Could not install "+cSpace+" provider: "+provider+" → not found.";
		if (this.config.logErrors)  console.error(message);
		if (this.config.throwErrors)  throw new Error(message);
		else return null;  }
	if (this===RGB_Calc)  {
		if (meta.to)  {
			RGB_Calc.to[cSpace]=meta.to.quick;
			RGB_Calc.definer.quick.to[cSpace]={value: meta.to.quick, writable: true};
			RGB_Calc.definer.audit.to[cSpace]={value: meta.to.audit, writable: true};  }
		if (meta.from)  {
			RGB_Calc.from[cSpace]=meta.from.quick;
			RGB_Calc.definer.quick.from[cSpace]={value: meta.from.quick, writable: true};
			RGB_Calc.definer.audit.from[cSpace]={value: meta.from.audit, writable: true};  }  }
	else {
		if (meta.to)
			this.to[cSpace]= this.$ ? meta.to.audit : meta.to.quick;
		if (meta.from)
			this.from[cSpace]= this.$ ? meta.from.audit : meta.from.quick;  }  }



RGB_Calc.luminance=
RGB_Calc.prototype.luminance=luminance;
//  https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
function luminance(rgba)  {  // rgb from 0-255, a (alpha-opacity) from 0.0-1.0
	const
		bits= rgba.bitDepth || this.config.RGB_bitDepth,
		A= (rgba[3]===undefined) ? 1 : rgba[3],
		R=(rgba[0]/bits)*A,
		G=(rgba[1]/bits)*A,
		B=(rgba[2]/bits)*A;
	return ( 0.2126 * (R<0.04045 ? (R/12.92) : (((R+0.055)/1.055) ** 2.4))
				 + 0.7152 * (G<0.04045 ? (G/12.92) : (((G+0.055)/1.055) ** 2.4))
				 + 0.0722 * (B<0.04045 ? (B/12.92) : (((B+0.055)/1.055) ** 2.4)) );  }

RGB_Calc.contrastRatio=
RGB_Calc.prototype.contrastRatio=contrastRatio;
//  https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
function contrastRatio(fore, back)  {
	const
		L2=this.luminance(back),
		T= (fore[3]===undefined) ? 0 : (1-fore[3]),
		L1=this.luminance(fore)+T*L2;
	return (L1>L2) ? ((L1+0.05)/(L2+0.05)) : ((L2+0.05)/(L1+0.05));  }

//===============================================================



class Quick_ConfigStack extends ConfigStack  {}
Quick_ConfigStack.prototype.name='Quick RGB_Calc.ConfigStack';
// input for “Quick-Calcs” is by definition always factors from 0—1, except for sRGB and [a,b] in Lab & OKLab
Quick_ConfigStack.prototype.inputAsFactor=false;  // for sRGB calculations


class Audit_ConfigStack extends ConfigStack  {}

const ACS_props={
	name: 'Auditing RGB_Calc.ConfigStack',

	inputShortHex: false,
	inputAsFactor: false,  //input for auditing calculators is by default a percent or byte or numeric

/* When you pass an Array into an “audit” calculator,
 * it will interpret the values and may convert them into factors from 0–1
 * You may want to have access to those converted values,
 * or you may want to preserve the original values: your choice.
 * RGB Arrays are always preserved.
 */
	preserveInputArrays: true,


/*For named (palette) colors
 *we can allow an add-on alpha or not.
 *If a named color’s value is RGBA(50%, 55%, 70%, 80%)
 *and it is in the “Sky” palette and its name is “clouds”
 *auditing calculators can use the following spec:
 *Sky: clouds / 84% opacity;
 *The final opacity value will be 80% × 84% = 67.2%
 *see: applyAlpha()  and  multiplyAddOnAlpha()
 */
	forbidAddOnAlpha: false,

//  You may want to use  Array  or any of the  …A_Array  Classes above or create your own Class constructor for any of these 23 Factories below
	RGBA_Factory: RGBA_Color,
	HSLA_Factory: HSLA_Color,
	HSBA_Factory: HSBA_Color,
	HSVA_Factory: HSVA_Color,
	HWBA_Factory: HWBA_Color,
	HCGA_Factory: HCGA_Color,
	CMYKA_Factory: CMYKA_Color,
	OKLabA_Factory: OKLabA_Color,
	OKLChA_Factory: OKLChA_Color,
	OKHSLA_Factory: OKHSLA_Color,
	OKHSVA_Factory: OKHSVA_Color,
	OKHWBA_Factory: OKHWBA_Color,
	OKHCGA_Factory: OKHCGA_Color,
	XYZA_Factory: XYZA_Color,
	LabA_Factory: LabA_Color,
	LChA_Factory: LChA_Color,
	LuvA_Factory: LuvA_Color,
	LChᵤᵥA_Factory: LChᵤᵥA_Color,
	HSLᵤᵥA_Factory: HSLᵤᵥA_Color,
	JᶻaᶻbᶻA_Factory: JᶻaᶻbᶻA_Color,
	JᶻCᶻhᶻA_Factory: JᶻCᶻhᶻA_Color,
	ICᵀCᴾA_Factory: ICᵀCᴾA_Color,
	IChᵀᴾA_Factory: IChᵀᴾA_Color,
/*
 *The 23 factory pointers (above) control the output of the “auditing” RGB_Calc–functions and its instances.
 *
 * //this example provides an auditing calculator that returns RGB output as a simple array of values,
 * // instead of the default RGBA_Color object instance:
 * myCalc=new SoftMoon.WebWare.RGB_Calc({RGBA_Factory:Array});
 */
}
for (const p in ACS_props) {Audit_ConfigStack.prototype[p]=ACS_props[p];}

RGB_Calc.config=new Quick_ConfigStack(RGB_Calc);


// This object’s properties are conversion functions.
// You may add to them………for your convenience
Object.defineProperty(RGB_Calc, 'definer', {
	enumerable: true,
	value: Object.create(RGB_Calc, {
		quick: {value: Object.defineProperties({}, {to:{value:{}}, from:{value:{}}}) },
		audit: {value: Object.defineProperties({}, {to:{value:{}}, from:{value:{}}}) }  })  });

RGB_Calc.definer.quick.ConfigStack=Quick_ConfigStack;
RGB_Calc.definer.audit.ConfigStack=Audit_ConfigStack;




// This object’s properties are conversion functions.
// You may add to them………for your convenience
Object.defineProperty(RGB_Calc, 'to', {
	enumerable: true,
	value: Object.create(RGB_Calc)  });

function convertColor(args, converter, model) {
	var _color;
	this.config.stack({RGBA_Factory: {value:Array}});
	try {_color=this.$(args[0]);}
	finally {this.config.cull();}
	return (args[0]=_color) ?  converter.apply(this, args)  :  this.config.onError(args, 'RGB_Calc.to.'+model);  };


RGB_Calc.to.contrast=contrastRGB;
RGB_Calc.definer.quick.to.contrast={value:contrastRGB};
RGB_Calc.definer.audit.to.contrast={value: function() {return convertColor.call(this, arguments, contrastRGB, 'contrast');}};
function contrastRGB(rgb)  {
	return  (this.config.useHexSymbol ? '#' : "") + (luminance.call(this, rgb)<0.2159  ?  'FFFFFF' : '000000');  }  //  RGB(128, 128, 128) has luminance of 21.59%


RGB_Calc.to.shade=shadeRGB;
RGB_Calc.definer.quick.to.shade={value:shadeRGB};
RGB_Calc.definer.audit.to.shade={value: function() {return convertColor.call(this, arguments, shadeRGB, 'shade');}};
function shadeRGB(rgb)  {
	const bits= rgb.bitDepth || this.config.RGB_bitDepth;
	var i, min=bits, max=0;
	for (i=0; i<3; i++) {min=(rgb[i]<min) ? rgb[i] : min;   max=(rgb[i]>max) ? rgb[i] : max;}
	const f= (bits-max > min) ? (bits/max) : (1/min);
	return toHex.call(this, [rgb[0]*f, rgb[1]*f, rgb[2]*f]);  }


RGB_Calc.to.hex=toHex;
RGB_Calc.definer.quick.to.hex={value:toHex};
RGB_Calc.definer.audit.to.hex={value: function() {return convertColor.call(this, arguments, toHex, 'hex');}};
function toHex(rgba)  { return (this.config.useHexSymbol ? "#":'') +
	Math._2hex(rgba[0])+Math._2hex(rgba[1])+Math._2hex(rgba[2]) + (typeof rgba[3] === 'number' ?  Math._2hex(rgba[3]*255) : "");  }
toHex.base='sRGB';

RGB_Calc.to.rgb=        //these are set up as pass-throughs for automated conversion calculations: i.e.  myRGB_calc.to[myOutputModel](color_data);
RGB_Calc.to.rgba=toRGBA;
RGB_Calc.definer.quick.to.rgb=
RGB_Calc.definer.quick.to.rgba={value:toRGBA};
RGB_Calc.definer.audit.to.rgb=
RGB_Calc.definer.audit.to.rgba={value: function() {return convertColor.call(this, arguments, toRGBA, 'rgba');}};
function toRGBA(rgba)  {
	if (rgba.profile  &&  rgba.profile!==this.config.RGB_profile)  {
		return this.config.onError(rgba, undefined, 'can not yet convert from one RGB space to another');
	}
	const ib=rgba.bits,  ob=this.config.RGB_bitDepth
  if (ib  &&  ib!==ob)  {rgba[0]=(rgba[0]/ib)*ob;  rgba[1]=(rgba[1]/ib)*ob;  rgba[2]=(rgba[2]/ib)*ob;}
	return this.output_RGB(rgba[0], rgba[1], rgba[2], rgba[3]);}


RGB_Calc.to.hsv=toHSV;
RGB_Calc.definer.quick.to.hsv={value:toHSV};
RGB_Calc.definer.audit.to.hsv={value: function() {return convertColor.call(this, arguments, toHSV, 'hsv');}};
function toHSV(rgb, factory, model='HSV')  {  //RGB from 0 to 255   HSV results from 0 to 1   alpha should be 0 <= a <= 1
	//note  model  is used here internally, and is not meant to be a passed parameter, unless it is "HSB"
	factory??=this.config[model+"A_Factory"];
	var H, S;
	const
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
	bits= rgb.bitDepth || this.config.RGB_bitDepth,
	R = ( rgb[0] / bits ),
	G = ( rgb[1] / bits ),
	B = ( rgb[2] / bits ),
	V = max( R, G, B ),
	delta_max = V - min( R, G, B );

	if ( delta_max == 0 )  {  //This is a gray, no chroma...
		H = 1;  S = 0;  }
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

	if (A===undefined)  return new factory(H,S,V);
	else  return new factory(H,S,V,A);  }


RGB_Calc.to.hsb=toHSB;
RGB_Calc.definer.quick.to.hsb={value:toHSB};
RGB_Calc.definer.audit.to.hsb={value: function() {return convertColor.call(this, arguments, toHSB, 'hsb');}};
function toHSB(rgb, factory) {return this.hsv(rgb, factory, 'HSB');}


RGB_Calc.to.hsl=toHSL;
RGB_Calc.definer.quick.to.hsl={value:toHSL};
RGB_Calc.definer.audit.to.hsl={value: function() {return convertColor.call(this, arguments, toHSL, 'hsl');}};
function toHSL(rgb, factory)  {  //RGB from 0 to 255   HSV results from 0 to 1   alpha should be 0 <= a <= 1
	factory??=this.config.HSLA_Factory;
	var H, S;
	const
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
	bits= rgb.bitDepth || this.config.RGB_bitDepth,
	R = ( rgb[0] / bits ),
	G = ( rgb[1] / bits ),
	B = ( rgb[2] / bits ),

	low = min( R, G, B ),
	high = max( R, G, B ),
	del_high = high - low,

	L = ( high + low ) / 2;

	if ( del_high == 0 )  {                   //This is a gray, no chroma...
		H = 1;                                //HSL results from 0 to 1
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

	if (A===undefined)  return new factory(H,S,L);
	else  return new factory(H,S,L,A);  }


RGB_Calc.to.hcg=toHCG;
RGB_Calc.definer.quick.to.hcg={value:toHCG};
RGB_Calc.definer.audit.to.hcg={value: function() {return convertColor.call(this, arguments, toHCG, 'hcg');}};
function toHCG(rgb, factory)  {  //RGB from 0 to 255   Hue, Chroma, Gray (HCG) results from 0 to 1   alpha should be 0 <= a <= 1
	factory??=this.config.HCGA_Factory;
	var H, C, G;
	const
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
	bits= rgb.bitDepth || this.config.RGB_bitDepth,
	r = ( rgb[0] / bits ),
	g = ( rgb[1] / bits ),
	b = ( rgb[2] / bits ),
	high = max( r, g, b ),
	low  = min( r, g, b );

	if ( high === low )  {  //This is a gray, no chroma...
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

	if (A===undefined)  return new factory(H,C,G);
	else  return new factory(H,C,G,A);  }


RGB_Calc.to.hwb=toHWB;
RGB_Calc.definer.quick.to.hwb={value:toHWB};
RGB_Calc.definer.audit.to.hwb={value: function() {return convertColor.call(this, arguments, toHWB, 'hwb');}};
function toHWB(rgb, factory)  {  //RGB from 0 to 255   Hue, White, Black (HWB) results from 0 to 1   alpha should be 0 <= a <= 1
	factory??=this.config.HWBA_Factory;
	var H, C, G;
	const
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
	bits= rgb.bitDepth || this.config.RGB_bitDepth,
	r = ( rgb[0] / bits ),
	g = ( rgb[1] / bits ),
	b = ( rgb[2] / bits ),
	high = max( r, g, b ),
	low  = min( r, g, b );

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
	else H=1;

	if (A===undefined)  return new factory(H, low, 1-high);
	else  return new factory(H, low, 1-high, A);  }


RGB_Calc.to.cmyk=toCMYK;
RGB_Calc.definer.quick.to.cmyk={value:toCMYK};
RGB_Calc.definer.audit.to.cmyk={value: function() {return convertColor.call(this, arguments, toCMYK, 'cmyk');}};
function toCMYK(rgb, factory)  {  //RGB from 0 to 255    CMYK results from 0 to 1   alpha should be 0 <= a <= 1
	factory??=this.config.CMYKA_Factory;
	const bits= rgb.bitDepth || this.config.RGB_bitDepth;
	var C = 1 - ( rgb[0] / bits ),
			M = 1 - ( rgb[1] / bits ),
			Y = 1 - ( rgb[2] / bits ),
//			K = 1,
			K = min(1,C,M,Y),
			A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3];
/*
	if ( C < K )   K = C;
	if ( M < K )   K = M;
	if ( Y < K )   K = Y;
 */
	if ( K == 1 )  { //Black
		C = M = Y = 0;  }
	else  {
		C = ( C - K ) / ( 1 - K );
		M = ( M - K ) / ( 1 - K );
		Y = ( Y - K ) / ( 1 - K );  }
	if (A===undefined)  return new factory(C,M,Y,K);
	else  return new factory(C,M,Y,K,A);  }


RGB_Calc.to.oklab=Björn_Ottosson.srgb_to_oklab;
RGB_Calc.definer.quick.to.oklab={value:Björn_Ottosson.srgb_to_oklab};
RGB_Calc.definer.audit.to.oklab={value: function() {return convertColor.call(this, arguments, Björn_Ottosson.srgb_to_oklab, 'oklab');}};

RGB_Calc.to.oklch=Björn_Ottosson.srgb_to_oklch;
RGB_Calc.definer.quick.to.oklch={value:Björn_Ottosson.srgb_to_oklch};
RGB_Calc.definer.audit.to.oklch={value: function() {return convertColor.call(this, arguments, Björn_Ottosson.srgb_to_oklch, 'oklch');}};

RGB_Calc.to.okhsl=Björn_Ottosson.srgb_to_okhsl;
RGB_Calc.definer.quick.to.okhsl={value:Björn_Ottosson.srgb_to_okhsl};
RGB_Calc.definer.audit.to.okhsl={value: function() {return convertColor.call(this, arguments, Björn_Ottosson.srgb_to_okhsl, 'okhsl');}};

RGB_Calc.to.okhsv=Björn_Ottosson.srgb_to_okhsv;
RGB_Calc.definer.quick.to.okhsv={value:Björn_Ottosson.srgb_to_okhsv};
RGB_Calc.definer.audit.to.okhsv={value: function() {return convertColor.call(this, arguments, Björn_Ottosson.srgb_to_okhsv, 'okhsv');}};

RGB_Calc.to.okhwb=Björn_Ottosson.srgb_to_okhwb;
RGB_Calc.definer.quick.to.okhwb={value:Björn_Ottosson.srgb_to_okhwb};
RGB_Calc.definer.audit.to.okhwb={value: function() {return convertColor.call(this, arguments, Björn_Ottosson.srgb_to_okhwb, 'okhwb');}};

RGB_Calc.to.okhcg=Björn_Ottosson.srgb_to_okhcg;
RGB_Calc.definer.quick.to.okhcg={value:Björn_Ottosson.srgb_to_okhcg};
RGB_Calc.definer.audit.to.okhcg={value: function() {return convertColor.call(this, arguments, Björn_Ottosson.srgb_to_okhcg, 'okhcg');}};


/*  https://github.com/color-js/color.js/blob/main/src/spaces/prophoto-linear.js
// convert an array of  prophoto-rgb values to CIE XYZ
// using  D50 (so no chromatic adaptation needed afterwards)
// matrix cannot be expressed in rational form, but is calculated to 64 bit accuracy
// see https://github.com/w3c/csswg-drafts/issues/7675
const toXYZ_M = [
	[ 0.79776664490064230,  0.13518129740053308,  0.03134773412839220 ],
	[ 0.28807482881940130,  0.71183523424187300,  0.00008993693872564 ],
	[ 0.00000000000000000,  0.00000000000000000,  0.82510460251046020 ],
];

const fromXYZ_M = [
	[  1.34578688164715830, -0.25557208737979464, -0.05110186497554526 ],
	[ -0.54463070512490190,  1.50824774284514680,  0.02052744743642139 ],
	[  0.00000000000000000,  0.00000000000000000,  1.21196754563894520 ],
];
*/

/*  https://github.com/color-js/color.js/blob/main/src/spaces/p3-linear.js
 *const toXYZ_M = [
	[0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
	[0.2289745640697488, 0.6917385218365064,  0.079286914093745],
	[0.0000000000000000, 0.04511338185890264, 1.043944368900976],
];

const fromXYZ_M = [
	[ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684],
	[-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
	[ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872],
];
*/

/*https://github.com/color-js/color.js/blob/main/src/spaces/srgb-linear.js
 *
// This matrix was calculated directly from the RGB and white chromaticities
// when rounded to 8 decimal places, it agrees completely with the official matrix
// see https://github.com/w3c/csswg-drafts/issues/5922
const toXYZ_M = [
	[ 0.41239079926595934, 0.357584339383878,   0.1804807884018343  ],
	[ 0.21263900587151027, 0.715168678767756,   0.07219231536073371 ],
	[ 0.01933081871559182, 0.11919477979462598, 0.9505321522496607  ],
];
// This matrix is the inverse of the above;
// again it agrees with the official definition when rounded to 8 decimal places
export const fromXYZ_M = [
	[  3.2409699419045226,  -1.537383177570094,   -0.4986107602930034  ],
	[ -0.9692436362808796,   1.8759675015077202,   0.04155505740717559 ],
	[  0.05563007969699366, -0.20397695888897652,  1.0569715142428786  ],
];
*/

const toXYZ_matrix={
	sRGB:{
		D65: [  // https://www.w3.org/TR/css-color-4/#color-conversion-code
			[ 506752 / 1228815,  87881 / 245763,   12673 /   70218 ],    //  0.41239079926595948128888400613599, …, …
			[  87098 /  409605, 175762 / 245763,   12673 /  175545 ],
			[   7918 /  409605,  87881 / 737289, 1001167 / 1053270 ] ],
/*
		// https://en.wikipedia.org/wiki/SRGB  ←QUOTE: “Amendment 1 to IEC 61966-2-1:1999, approved in 2003 … also recommends a higher-precision XYZ to sRGB matrix”
		// unfortunately, Wikipedia does not show a similar matrix for RGB → XYZ
		//(Observer = 2°, Illuminant = D65)
 *  D65_2003: [ … … contents calculated (below) as inverse of fromXYZ_matrix.sRGB.D65_2003 … … ]
 */
		D65_classic: [
		// https://www.easyrgb.com/en/math.php
		// https://en.wikipedia.org/wiki/SRGB
		//(Observer = 2°, Illuminant = D65)
			[0.4124, 0.3576, 0.1805],
			[0.2126, 0.7152, 0.0722],
			[0.0193, 0.1192, 0.9505] ],
		D50_Lindbloom: [  // best I can tell, this is credited to: http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
		//(Observer = 2°, Illuminant = D50)  ←best I can tell
			[0.4360747,  0.3850649,  0.1430804],
			[0.2225045,  0.7168786,  0.0606169],
			[0.0139322,  0.0971045,  0.7141733] ],
		D65_Lindbloom: [  // best I can tell, this is credited to: http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
		//(Observer = 2°, Illuminant = D65)
			[0.4124564,  0.3575761,  0.1804375],
			[0.2126729,  0.7151522,  0.0721750],
			[0.0193339,  0.1191920,  0.9503041] ],
	/* From the Wickline color-blind simulation algorithm:
	 * https://github.com/skratchdot/color-blind
	 *
	 * This source was copied from http://mudcu.be/sphere/js/Color.Blind.js
	 *******************(now:2019) https://galactic.ink/sphere/js/Color.Blind.js
	 *******************(now:2020) see: http://colorlab.wickline.org/colorblind/colorlab/engine.js
	 */
		D65_Wickline: [
		// (Observer = 2°, Illuminant = D65)  ←almost certainly
			[0.41242371206635076,  0.3575793401363035,  0.1804662232369621],
			[0.21265606784927693,  0.715157818248362,   0.0721864539171564],
			[0.019331987577444885, 0.11919267420354762, 0.9504491124870351] ] },
	p3: { D65: [  // https://github.com/color-js/color.js/blob/main/src/spaces/p3-linear.js
			[0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
			[0.2289745640697488, 0.6917385218365064,  0.079286914093745],
			[0.0000000000000000, 0.04511338185890264, 1.043944368900976] ] } };

toXYZ_matrix.sRGB.D50=toXYZ_matrix.sRGB.D50_Lindbloom;
toXYZ_matrix.display_p3=toXYZ_matrix.p3;

toXYZ_matrix.sRGB.D50.observer=
toXYZ_matrix.sRGB.D65.observer=
toXYZ_matrix.sRGB.D65_classic.observer=
toXYZ_matrix.sRGB.D65_Lindbloom.observer=
toXYZ_matrix.sRGB.D65_Wickline.observer=
toXYZ_matrix.p3.D65.observer='2°';
Object.lock(toXYZ_matrix, 1);  // we can add properties, but not change existing ones, 1 “level” deep
Object.deepFreeze(toXYZ_matrix.sRGB.D50);
Object.deepFreeze(toXYZ_matrix.sRGB.D65);
Object.deepFreeze(toXYZ_matrix.sRGB.D65_classic);
Object.deepFreeze(toXYZ_matrix.sRGB.D50_Lindbloom);
Object.deepFreeze(toXYZ_matrix.sRGB.D65_Lindbloom);
Object.deepFreeze(toXYZ_matrix.sRGB.D65_Wickline);
Object.deepFreeze(toXYZ_matrix.p3.D65);

RGB_Calc.to.xyz = toXYZ;
RGB_Calc.definer.quick.to.xyz = {value: toXYZ};
RGB_Calc.definer.audit.to.xyz = {value: function(color) {return this.convertColor(color, toXYZ, 'xyz');}};
function toXYZ(rgb, factory, profile, illuminant)  {
	factory??=this.config.XYZA_Factory;
	profile=rgb.profile||profile||this.config.RGB_profile;
	illuminant??= RGB_profiles[profile].illuminant;
	const
		[R,G,B] = this.linearize_γCorrected_RGB(rgb, profile),
		M = toXYZ_matrix[profile][illuminant],
		X= R * M[0][0] + G * M[0][1] + B * M[0][2],
		Y= R * M[1][0] + G * M[1][1] + B * M[1][2],
		Z= R * M[2][0] + G * M[2][1] + B * M[2][2];
	// note the exception to the rule here: toXYZ does NOT return 3-member arrays if A===undefined
	return new factory(X,Y,Z,rgb[3], illuminant, M.observer);  };

Object.defineProperty(toXYZ, 'matrix', {value:toXYZ_matrix});  // ←↓you may add illuminant-profiles here
Object.defineProperty(XYZA_Array, 'fromRGB_matrix', {value:toXYZ_matrix});

RGB_Calc.to.lab = toLab;
RGB_Calc.definer.quick.to.lab = {value: toLab};
RGB_Calc.definer.audit.to.lab = {value: function(color) {return this.convertColor(color, toLab, 'lab');}};
function toLab(rgb, factory, illuminant="D50")  { //there is a “D65” variant of Lab - other color-spaces adapt themselves
	return toXYZ.call(this, rgb, XYZA_Array, undefined, illuminant).to_Lab(factory||this.config.LabA_Factory);  }

RGB_Calc.to.lch = toLCh;
RGB_Calc.definer.quick.to.lch = {value: toLCh};
RGB_Calc.definer.audit.to.lch = {value: function(color) {return this.convertColor(color, toLCh, 'lch');}};
function toLCh(rgb, factory, illuminant="D50")  {
	return toXYZ.call(this, rgb, XYZA_Array, undefined, illuminant).to_Lab(LabA_Array).to_LCh(factory||this.config.LChA_Factory);  }

RGB_Calc.to.luv = toLuv;
RGB_Calc.definer.quick.to.luv = {value: toLuv};
RGB_Calc.definer.audit.to.luv = {value: function(color) {return this.convertColor(color, toLuv, 'luv');}};
function toLuv(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_Luv(factory||this.config.LuvA_Factory);  }

RGB_Calc.to.lchᵤᵥ =
RGB_Calc.to.lchuv = toLChᵤᵥ;
RGB_Calc.definer.quick.to.lchᵤᵥ =
RGB_Calc.definer.quick.to.lchuv = {value: toLChᵤᵥ};
RGB_Calc.definer.audit.to.lchᵤᵥ =
RGB_Calc.definer.audit.to.lchuv = {value: function(color) {return this.convertColor(color, toLChᵤᵥ, 'lchᵤᵥ');}};
function toLChᵤᵥ(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_Luv(LuvA_Array).to_LChᵤᵥ(factory||this.config.LChᵤᵥA_Factory);  }

RGB_Calc.to.hslᵤᵥ =
RGB_Calc.to.hsluv = toHSLᵤᵥ;
RGB_Calc.definer.quick.to.hslᵤᵥ =
RGB_Calc.definer.quick.to.hsluv = {value: toHSLᵤᵥ};
RGB_Calc.definer.audit.to.hslᵤᵥ =
RGB_Calc.definer.audit.to.hsluv = {value: function(color) {return this.convertColor(color, toHSLᵤᵥ, 'hslᵤᵥ');}};
function toHSLᵤᵥ(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_Luv(LuvA_Array).to_LChᵤᵥ(LChᵤᵥA_Array).to_HSLᵤᵥ(factory||this.config.HSLᵤᵥA_Factory);  }

RGB_Calc.to.jzazbz =
RGB_Calc.to.jᶻaᶻbᶻ = toJᶻaᶻbᶻ;
RGB_Calc.definer.quick.to.jzazbz =
RGB_Calc.definer.quick.to.jᶻaᶻbᶻ = {value: toJᶻaᶻbᶻ};
RGB_Calc.definer.audit.to.jzazbz
RGB_Calc.definer.audit.to.jᶻaᶻbᶻ = {value: function(color) {return this.convertColor(color, toJᶻaᶻbᶻ, 'jzazbz');}};
function toJᶻaᶻbᶻ(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_Jᶻaᶻbᶻ(factory||this.config.JᶻaᶻbᶻA_Factory);  }

RGB_Calc.to.jzczhz =
RGB_Calc.to.jᶻcᶻhᶻ = toJᶻCᶻhᶻ;
RGB_Calc.definer.quick.to.jzczhz =
RGB_Calc.definer.quick.to.jᶻcᶻhᶻ = {value: toJᶻCᶻhᶻ};
RGB_Calc.definer.audit.to.jzczhz =
RGB_Calc.definer.audit.to.jᶻcᶻhᶻ = {value: function(color) {return this.convertColor(color, toJᶻCᶻhᶻ, 'jzczhz');}};
function toJᶻCᶻhᶻ(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array).to_JᶻCᶻhᶻ(factory||this.config.JᶻCᶻhᶻA_Factory);  }

RGB_Calc.to.ictcp =
RGB_Calc.to.icᵀcᴾ = toICᵀCᴾ;
RGB_Calc.definer.quick.to.ictcp =
RGB_Calc.definer.quick.to.icᵀcᴾ = {value: toICᵀCᴾ};
RGB_Calc.definer.audit.to.ictcp =
RGB_Calc.definer.audit.to.icᵀcᴾ = {value: function(color) {return this.convertColor(color, toICᵀCᴾ, 'ictcp');}};
function toICᵀCᴾ(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_ICᵀCᴾ(factory||this.config.ICᵀCᴾA_Factory);  }

RGB_Calc.to.ichtp =
RGB_Calc.to.ichᵀᴾ = toIChᵀᴾ;
RGB_Calc.definer.quick.to.ichtp =
RGB_Calc.definer.quick.to.ichᵀᴾ = {value: toIChᵀᴾ};
RGB_Calc.definer.audit.to.ichtp =
RGB_Calc.definer.audit.to.ichᵀᴾ = {value: function(color) {return this.convertColor(color, toIChᵀᴾ, 'ichtp');}};
function toIChᵀᴾ(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_ICᵀCᴾ(ICᵀCᴾA_Array).to_IChᵀᴾ(factory||this.config.IChᵀᴾA_Factory);  }



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
	value: Object.create(RGB_Calc)  });



RGB_Calc.definer.quick.from.rgb=
RGB_Calc.definer.quick.from.rgba=
RGB_Calc.definer.quick.from.srgb=
RGB_Calc.definer.quick.from.srgba=
RGB_Calc.definer.audit.from.rgb=
RGB_Calc.definer.audit.from.rgba=
RGB_Calc.definer.audit.from.srgb=
RGB_Calc.definer.audit.from.srgba={enumerable:true, value:fromRGBA};
RGB_Calc.from.rgb=
RGB_Calc.from.rgba=
RGB_Calc.from.srgb=
RGB_Calc.from.srgba=fromRGBA;
function fromRGBA(r, g, b, a)  {  // alternate arguments format shown below
//               ([r,g,b,a])
//               (r,g,b)
//               ([r,g,b])
//               ($string)     ←  "r, g, b"  or  "r, g, b, a"  or  "r g b"  etc…
	var matches;
	if (arguments.length===1)  {
		if (typeof arguments[0] === 'string'
		&&  (matches=arguments[0].match(this.config.inputAsFactor ? RegExp.threeFactors_A : (this.config.allowUndefinedRGBChannels ? RegExp._r_g_b_a_ : RegExp.rgb_a))))  {
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


RGB_Calc.definer.quick.from.hex={enumerable:true, value:fromHex};
RGB_Calc.definer.audit.from.hex={enumerable:true, value:fromHex};
RGB_Calc.from.hex=fromHex;
function fromHex(h)  {
	var _h;
	if (_h=h.match(RegExp.hex_a))  { //console.log(_h[6] ? "yes" : "no", "{"+_h[6]+"}");
		return this.output_sRGB(
			parseInt(_h[3], 16),
			parseInt(_h[4], 16),
			parseInt(_h[5], 16),
			_h[6] ? (parseInt(_h[6], 16)/255) : undefined);  }
	if (this.config.useShortHex  &&  (_h=h.match(RegExp.hex_a4)))  { h=_h[1];
		return this.output_sRGB(
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

RGB_Calc.definer.quick.from.hue={enumerable:true, value:RGB_Calc_from_hue};
RGB_Calc.definer.audit.from.hue={enumerable:true, value:function(h)  {
	const _h= (typeof h === 'string') ? h.match(RegExp.Hue_A) : [,h],
				h_=this.getHueFactor(_h[1]);
	return  ( (h_!==false  &&  (rgb_from_hue(h_),  this.output_RGB_factors(r, g, b, _h[2] && this.getAlpha(_h[2]))))
			||    this.config.onError(h, 'RGB_Calc.from.hue') );  }  };
RGB_Calc.from.hue=RGB_Calc_from_hue;
function RGB_Calc_from_hue(h)  { rgb_from_hue(h);
	return this.output_RGB_factors(r, g, b);  }


function parseColorWheelColor($cwc, model)  {
	var matches;
	if (typeof $cwc === 'string')
		if (matches=($cwc.match(this.config.inputAsFactor ? RegExp.threeFactors_A : RegExp.ColorWheelColor_A)))
			$cwc=matches.slice(1);
		else  return this.config.onError($cwc, model);
	return  this.factorize($cwc,3,1)  ||  this.config.onError($cwc, model);  }

RGB_Calc.definer.quick.from.hcg=
RGB_Calc.definer.quick.from.hcga={enumerable:true, value:fromHCG};
RGB_Calc.definer.audit.from.hcg=
RGB_Calc.definer.audit.from.hcga={enumerable:true, value:function(hcg) {return (hcg=parseColorWheelColor.call(this, hcg, 'HCG'))  &&  fromHCG.call(this, hcg)}};
RGB_Calc.from.hcg=
RGB_Calc.from.hcga=fromHCG;
function fromHCG(hcg)   {
	//HCG values from 0 to 1
	//RGB results from 0% to 100%
	rgb_from_hue(hcg[0]);
	r+=(hcg[2]-r)*(1-hcg[1]);
	g+=(hcg[2]-g)*(1-hcg[1]);
	b+=(hcg[2]-b)*(1-hcg[1]);
	return this.output_RGB_factors(r, g, b, hcg[3]);  }


RGB_Calc.definer.quick.from.hwb=
RGB_Calc.definer.quick.from.hwba={enumerable:true, value:fromHCG};
RGB_Calc.definer.audit.from.hwb=
RGB_Calc.definer.audit.from.hwba={enumerable:true, value:function(hwb) {return (hwb=parseColorWheelColor.call(this, hwb, 'HWB'))  &&  fromHWB.call(this, hwb)}};
RGB_Calc.from.hwb=
RGB_Calc.from.hwba=fromHWB;
function fromHWB(hwb) {
	if (hwb[1] + hwb[2] >= 1)  {
		const gray = hwb[1] / (hwb[1] + hwb[2]);
		return this.output_RGB_factors(gray, gray, gray, hwb[3]);  }
	rgb_from_hue(hwb[0]);
	r = r*(1 - hwb[1] - hwb[2]) + hwb[1];
	g = g*(1 - hwb[1] - hwb[2]) + hwb[1];
	b = b*(1 - hwb[1] - hwb[2]) + hwb[1];
	return this.output_RGB_factors(r, g, b, hwb[3]);  }


RGB_Calc.definer.quick.from.hsb=
RGB_Calc.definer.quick.from.hsv=
RGB_Calc.definer.quick.from.hsba=
RGB_Calc.definer.quick.from.hsva={enumerable:true, value:fromHSV};
RGB_Calc.definer.audit.from.hsb=
RGB_Calc.definer.audit.from.hsba={enumerable:true, value:function(hsv) {return (hsv=parseColorWheelColor.call(this, hsv, 'HSB'))  &&  fromHSV.call(this, hsv)}};
RGB_Calc.definer.audit.from.hsv=
RGB_Calc.definer.audit.from.hsva={enumerable:true, value:function(hsv) {return (hsv=parseColorWheelColor.call(this, hsv, 'HSV'))  &&  fromHSV.call(this, hsv)}};
RGB_Calc.from.hsb=
RGB_Calc.from.hsv=
RGB_Calc.from.hsba=
RGB_Calc.from.hsva=fromHSV;
function fromHSV(hsv)  {
	var h,r,g,b;
	//HSV values from 0 to 1   alpha should be 0 <= a <= 1
	//RGB results from 0% to 100%
	if ( hsv[1] === 0 )  return this.output_RGB_factors( hsv[2], hsv[2], hsv[2], hsv[3] );
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

	return this.output_RGB_factors(r, g, b, hsv[3]);  }



RGB_Calc.definer.quick.from.hsl=
RGB_Calc.definer.quick.from.hsla={enumerable:true, value:fromHSL};
RGB_Calc.definer.audit.from.hsl=
RGB_Calc.definer.audit.from.hsla={enumerable:true, value:function(hsl) {return (hsl=parseColorWheelColor.call(this, hsl, 'HSL'))  &&  fromHSL.call(this, hsl)}};
RGB_Calc.from.hsl=
RGB_Calc.from.hsla=fromHSL;
function fromHSL(hsl)  {
	//HSL values from 0 to 1   alpha should be 0 <= a <= 1
	//RGB results from 0% to 100%
	if ( hsl[1] === 0 )  {
		return this.output_RGB_factors(hsl[2], hsl[2], hsl[2], hsl[3]);  }

	const n = ( hsl[2] < 0.5 )  ?  (hsl[2] * ( 1 + hsl[1] ))  :  (( hsl[2] + hsl[1] ) - ( hsl[1] * hsl[2] )),
				m = 2 * hsl[2] - n;

	function hue_to_RGB( v1, v2, vH )  {
		if ( vH < 0 ) vH += 1
		if ( vH > 1 ) vH -= 1
		if ( ( 6 * vH ) < 1 ) return v1 + ( v2 - v1 ) * 6 * vH;
		if ( ( 2 * vH ) < 1 ) return v2;
		if ( ( 3 * vH ) < 2 ) return v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6;
		return v1;  }
	return this.output_RGB_factors(
		hue_to_RGB( m, n, hsl[0] + ( 1 / 3 ) ),
		hue_to_RGB( m, n, hsl[0] ),
		hue_to_RGB( m, n, hsl[0] - ( 1 / 3 ) ),
		hsl[3] );  }


RGB_Calc.definer.quick.from.cmy=
RGB_Calc.definer.quick.from.cmya={enumerable:true, value:fromCMY};
RGB_Calc.definer.audit.from.cmy=
RGB_Calc.definer.audit.from.cmya={enumerable:true, value:function($cmy)  {return ($cmy=parseCMY.call(this, $cmy))  &&  fromCMY.call(this, $cmy);}};

function parseCMY($cmy)  {
	var matches;
	if (typeof $cmy == 'string')
		if (matches=$cmy.match(this.config.inputAsFactor ? RegExp.threeFactors_A : RegExp.cmy_a))
			$cmy=matches.slice(1);
		else  return this.config.onError($cmy, 'CMY');
	return  this.factorize($cmy,3)  ||  this.config.onError($cmy, 'CMY');  }

RGB_Calc.from.cmy=
RGB_Calc.from.cmya=fromCMY;
function fromCMY(cmy)  {
	//CMY values from 0 to 1   alpha should be 0 <= a <= 1
	//RGB results from 0% to 100%
	return this.output_RGB_factors(
		1 - cmy[0],
		1 - cmy[1],
		1 - cmy[2],
		cmy[3]);  }


RGB_Calc.definer.quick.from.cmyk=
RGB_Calc.definer.quick.from.cmyka={enumerable:true, value:fromCMYK};
RGB_Calc.definer.audit.from.cmyk=
RGB_Calc.definer.audit.from.cmyka={enumerable:true, value:function($cmyk) {return ($cmyk=parseCMYK.call(this, $cmyk))  &&  fromCMYK.call(this, $cmyk);}};

function parseCMYK($cmyk)  {
	var matches;
	if (typeof $cmyk == 'string')  {
		if (matches=$cmyk.match(this.config.inputAsFactor ? RegExp.fourFactors_A : RegExp.cmyk_a))
			$cmyk=matches.slice(1);
		else  return this.config.onError($cmyk, 'CMYK');  }
	return  this.factorize($cmyk,4)  ||  this.config.onError($cmyk, 'CMYK');  }

RGB_Calc.from.cmyk=
RGB_Calc.from.cmyka=fromCMYK;
function fromCMYK(cmyk)  {
	//CMYK values from 0 to 1   alpha should be 0 <= a <= 1
	//RGB results from 0% to 100%
	return this.output_RGB_factors(
	1 - ( cmyk[0] * ( 1 - cmyk[3] ) + cmyk[3]),
	1 - ( cmyk[1] * ( 1 - cmyk[3] ) + cmyk[3]),
	1 - ( cmyk[2] * ( 1 - cmyk[3] ) + cmyk[3]),
	cmyk[4] );  }


RGB_Calc.definer.quick.from.oklab=
RGB_Calc.definer.quick.from.oklaba={enumerable:true, value:Björn_Ottosson.oklab_to_srgb};
RGB_Calc.definer.audit.from.oklab=
RGB_Calc.definer.audit.from.oklaba={enumerable:true, value:function($lab)  {
	return auditLab.call(this, {factors:RegExp.oklab_factors_A, vals:RegExp.oklab_a}, 'OKLab', 0.4, 0.4, Björn_Ottosson.oklab_to_srgb, $lab);  }};

// audit Lab, OKLab, Luv, Jᶻaᶻbᶻ, ICᵀCᴾ
function auditLab(RE, space, axisPer, axisMax, callback, $lab)  {
	var matches, illuminant;
	if (typeof $lab === 'string')  {
		$lab=$lab.trim();
		if (space==="Lab"
		&& (illuminant=$lab.match(/^(D50|D65)[, ]\s*/i)))  {
			$lab=$lab.substring(illuminant[0].length);
			illuminant=illuminant[1].toUpperCase();  }
		RE=(this.config.inputAsFactor  &&  !this.config.inputAsNumeric) ? RE.factors : RE.vals;
		if (matches=$lab.match(RE))
			$lab=matches.slice(1);
		else  {
			console.log($lab, RE)
			return this.config.onError($lab, space);  }  }
	else if (this.config.preserveInputArrays)  $lab=Array.from($lab);
	$lab[0]=this.getFactor($lab[0], space!=="Lab"),
	$lab[1]=this.getAxis($lab[1], axisPer, axisMax),
	$lab[2]=this.getAxis($lab[2], axisPer, axisMax),
	$lab[3]=this.getAlpha($lab[3]);
	if (illuminant)  $lab.illuminant=illuminant;
	if ($lab[0]===false  ||  $lab[1]===false  ||  $lab[2]===false  ||  $lab[3]===false)  this.config.onError($lab, space);
	return callback.call(this, $lab);  };

RGB_Calc.from.oklab=
RGB_Calc.from.oklaba=Björn_Ottosson.oklab_to_srgb;

RGB_Calc.definer.quick.from.oklch=
RGB_Calc.definer.quick.from.oklcha={enumerable:true, value:Björn_Ottosson.oklch_to_srgb};
RGB_Calc.definer.audit.from.oklch=
RGB_Calc.definer.audit.from.oklcha={enumerable:true, value:function($lch)  {
	return auditLCh.call(this, {factors:RegExp.oklch_factors_A, vals:RegExp.oklch_a}, 'OKLCh', 0.4, 0.5, Björn_Ottosson.oklch_to_srgb, $lch);  }};

function auditLCh(RE, space, CPer, CMax, callback, $lch)  {
	var matches, illuminant;
	if (typeof $lch == 'string')  {
		$lch=$lch.trim();
		if (space==='LCh'
		&& (illuminant=$lch.match(/^(D50|D65)[, ]\s*/i)))  {
			$lch=$lch.substring(illuminant[0].length);
			illuminant=illuminant[1].toUpperCase();  }
		if (matches=$lch.match((this.config.inputAsFactor  &&  !this.config.inputAsNumeric) ? RE.factors : RE.vals))
			$lch=matches.slice(1);
		else  return this.config.onError($lch, space);  }
	else if (this.config.preserveInputArrays)  $lch=Array.from($lch);
	$lch[0]=this.getFactor($lch[0], space!=='LCh'),
	$lch[1]=this.getAxis($lch[1], CPer, CMax),  // note the RegExp above filters out negative values
	$lch[2]=this.getHueFactor($lch[2]),
	$lch[3]=this.getAlpha($lch[3]);
	if (illuminant)  $lch.illuminant=illuminant;
	if ($lch[0]===false  ||  $lch[1]===false  ||  Number.isNaN($lch[2])  ||  $lch[3]===false)  this.config.onError($lch, space);
	return callback.call(this, $lch);  };

RGB_Calc.from.oklch=
RGB_Calc.from.oklcha=Björn_Ottosson.oklch_to_srgb;

RGB_Calc.definer.quick.from.okhsl=
RGB_Calc.definer.quick.from.okhsla={enumerable:true, value:Björn_Ottosson.okhsl_to_srgb};
RGB_Calc.definer.audit.from.okhsl=
RGB_Calc.definer.audit.from.okhsla={enumerable:true, value:function(hsl) {return (hsl=parseColorWheelColor.call(this, hsl, 'OKHSL'))  &&  Björn_Ottosson.okhsl_to_srgb.call(this, hsl)}};
RGB_Calc.from.okhsl=
RGB_Calc.from.okhsla=Björn_Ottosson.okhsl_to_srgb;

RGB_Calc.definer.quick.from.okhsv=
RGB_Calc.definer.quick.from.okhsva={enumerable:true, value:Björn_Ottosson.okhsv_to_srgb};
RGB_Calc.definer.audit.from.okhsv=
RGB_Calc.definer.audit.from.okhsva={enumerable:true, value:function(hsv) {return (hsv=parseColorWheelColor.call(this, hsv, 'OKHSV'))  &&  Björn_Ottosson.okhsv_to_srgb.call(this, hsv)}};
RGB_Calc.from.okhsv=
RGB_Calc.from.okhsva=Björn_Ottosson.okhsv_to_srgb;

RGB_Calc.definer.quick.from.okhwb=
RGB_Calc.definer.quick.from.okhwba={enumerable:true, value:Björn_Ottosson.okhwb_to_srgb};
RGB_Calc.definer.audit.from.okhwb=
RGB_Calc.definer.audit.from.okhwba={enumerable:true, value:function(hwb) {return (hwb=parseColorWheelColor.call(this, hwb, 'OKHWB'))  &&  Björn_Ottosson.okhwb_to_srgb.call(this, hwb)}};
RGB_Calc.from.okhwb=
RGB_Calc.from.okhwba=Björn_Ottosson.okhwb_to_srgb;

RGB_Calc.definer.quick.from.okhcg=
RGB_Calc.definer.quick.from.okhcga={enumerable:true, value:Björn_Ottosson.okhcg_to_srgb};
RGB_Calc.definer.audit.from.okhcg=
RGB_Calc.definer.audit.from.okhcga={enumerable:true, value:function(hcg) {return (hcg=parseColorWheelColor.call(this, hcg, 'OKHCG'))  &&  Björn_Ottosson.okhcg_to_srgb.call(this, hcg)}};
RGB_Calc.from.okhcg=
RGB_Calc.from.okhcga=Björn_Ottosson.okhcg_to_srgb;


RGB_Calc.definer.quick.from.xyz=
RGB_Calc.definer.quick.from.xyza={enumerable:true, value:fromXYZ};
RGB_Calc.definer.audit.from.xyz=
RGB_Calc.definer.audit.from.xyza={enumerable:true, value:function(XYZ) {return (XYZ=parseXYZ.call(this, XYZ))  &&  fromXYZ.call(this, XYZ.xyz, XYZ.profile);}};

RGB_Calc.from.xyz=fromXYZ;

const fromXYZ_matrix={
	sRGB:{
		D65:[  // https://www.w3.org/TR/css-color-4/#color-conversion-code
			[   12831 /   3959,    -329 /    214, -1974 /   3959 ],  // ←  3.2409699419045213437736802222784 , -1.5373831775700934579439252336449 , -0.4986107602930032836574892649659
			[ -851781 / 878810, 1648619 / 878810, 36519 / 878810 ],  // … … …
			[     705 /  12673,   -2585 /  12673,   705 /    667 ] ],  // … … …
		D65_2003: [
			// https://en.wikipedia.org/wiki/SRGB  ←QUOTE: “Amendment 1 to IEC 61966-2-1:1999, approved in 2003 … also recommends a higher-precision XYZ to sRGB matrix”
			// unfortunately, Wikipedia does not show a similar matrix for RGB → XYZ
			// ¡ but now we can calculate the inverse matrix, and that is done below…
			//(Observer = 2°, Illuminant = D65)
			[ 3.2406255, -1.5372080, -0.4986286],
			[-0.9689307,  1.8757561,  0.0415175],
			[ 0.0557101, -0.2040211,  1.0569959] ],
		D65_classic: [
			// https://www.easyrgb.com/en/math.php
			// https://en.wikipedia.org/wiki/SRGB  ←QUOTE: “The numerical values below match those in the official sRGB specification”
			//(Observer = 2°, Illuminant = D65)
			[ 3.2406, -1.5372, -0.4986],
			[-0.9689,  1.8758,  0.0415],
			[ 0.0557, -0.2040,  1.0570] ],
		D50_Lindbloom: [  // best I can tell, this is credited to: http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
			//(Observer = 2°, Illuminant = D50)  ←best I can tell
			[ 3.1338561, -1.6168667, -0.4906146],
			[-0.9787684,  1.9161415,  0.0334540],
			[ 0.0719453, -0.2289914,  1.4052427] ],
		D65_Lindbloom: [  // best I can tell, this is credited to: http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
			//(Observer = 2°, Illuminant = D65)
			[ 3.2404542, -1.5371385, -0.4985314],
			[-0.9692660,  1.8760108,  0.0415560],
			[ 0.0556434, -0.2040259,  1.0572252] ],
		/* From the Wickline color-blind simulation algorithm:
		* https://github.com/skratchdot/color-blind
		*
		* This source was copied from http://mudcu.be/sphere/js/Color.Blind.js
		*******************(now:2019) https://galactic.ink/sphere/js/Color.Blind.js
		*******************(now:2020) see: http://colorlab.wickline.org/colorblind/colorlab/engine.js
		*/
		D65_Wickline: [
			// (Observer = 2°, Illuminant = D65)  ←almost certainly
			[3.240712470389558,   -1.5372626602963142, -0.49857440415943116],
			[-0.969259258688888,   1.875996969313966,   0.041556132211625726],
			[0.05563600315398933, -0.2039948802843549,  1.0570636917433989] ] },
	p3: { D65: [ // https://github.com/color-js/color.js/blob/main/src/spaces/p3-linear.js
			[ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684],
			[-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
			[ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872] ] } };

fromXYZ_matrix.sRGB.D50=fromXYZ_matrix.sRGB.D50_Lindbloom;
fromXYZ_matrix.display_p3=fromXYZ_matrix.p3;

Object.defineProperty(toXYZ_matrix.sRGB, "D65_2003",  // this was not supplied by Wikipedia
		{value: Math.invert_3_3_matrix(fromXYZ_matrix.sRGB.D65_2003)});

toXYZ_matrix.sRGB.D65_2003.observer=
fromXYZ_matrix.sRGB.D50.observer= // ¡assumed!
fromXYZ_matrix.sRGB.D65.observer= // ¡assumed!
fromXYZ_matrix.sRGB.D65_2003.observer=
fromXYZ_matrix.sRGB.D65_classic.observer=
fromXYZ_matrix.sRGB.D50_Lindbloom.observer=
fromXYZ_matrix.sRGB.D65_Lindbloom.observer=
fromXYZ_matrix.sRGB.D65_Wickline.observer=
fromXYZ_matrix.p3.D65.observer='2°';
Object.lock(fromXYZ_matrix, 1);  // we can add properties, but not change existing ones, 1 “level” deep
Object.deepFreeze(fromXYZ_matrix.sRGB.D50);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65_2003);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65_classic);
Object.deepFreeze(fromXYZ_matrix.sRGB.D50_Lindbloom);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65_Lindbloom);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65_Wickline);
Object.deepFreeze(fromXYZ_matrix.p3.D65);

Object.deepFreeze(toXYZ_matrix.sRGB.D65_2003);


function parseXYZ(XYZ)  {
	var xyz, profile=this.config.RGB_profile, illuminant;
	if (typeof XYZ === 'string')
		xyz=XYZ.trim().split( /(?:\s*,|\s)\s*/ ).map(v=>v.trim());
	else if (this.config.preserveInputArrays)  xyz=Array.from(XYZ);
	else xyz=XYZ;
	const digital= /^[\d.-]/ ;
	if (!digital.test(xyz[1]))  {profile=xyz.shift();  illuminant=xyz.shift();}  // XYZ('sRGB', 'D65_classic', …, …, …, …)
	else if (!digital.test(xyz[0]))  {
		const foo=xyz.shift();
		if (fromXYZ_matrix[foo])  profile=foo;                                     // XYZ('sRGB', …, …, …, …)
		else if (fromXYZ_matrix[profile]?.[foo])  illuminant=foo;  }               // XYZ('D65_classic', …, …, …, …)
	if (!fromXYZ_matrix[profile])  return this.config.onError(XYZ, undefined, 'Unknown color-profile “',profile,'” for XYZ ');
	if (illuminant  &&  !fromXYZ_matrix[profile][illuminant])  return this.config.onError(XYZ, undefined, 'Unknown illuminant “',illuminant,'” for XYZ ');
	// const ranges=fromXYZ_inputRanges[illuminant];
	for (var i=0, isNotPercent; i<3; i++)  { isNotPercent=true
		if (typeof xyz[i] === 'string')  {
			if (xyz[i].endsWith('%'))  {xyz[i]=(parseFloat(xyz[i])/100);  isNotPercent=false;}
			else  xyz[i]=parseFloat(xyz[i]);  }
		//if (!this.config.inputAsFactor  &&  isNotPercent)  xyz[i]/=ranges[i];
		//if (xyz[i]<0  ||  xyz[i]>1)  return this.config.onError(XYZ, 'XYZ');
		}
	xyz[3]=this.getAlpha(xyz[3]);
	xyz.illuminant=illuminant;
	return {xyz:xyz, profile:profile};  }


/*
const fromXYZ_inputRanges=Object.defineProperties({}, {
	// I grabbed these before the solar-panels lost their sun, but I forgot to document their source, and now I can not find it………
	//D50: {enumerable: true, value: [ 96.4242, 100, 82.5188 ]},
	//D65: {enumerable: true, value: [ 95.0489, 100, 108.5188 ]},
	// all other references, including  https://github.com/color-js/color.js/blob/main/src/spaces/xyz-abs-d65.js
	// (which is written by THE people who do color) refer to the "classic" “white” values.
	D65:         {enumerable: true, value: [ 95.047, 100, 108.883 ]},
	D65_classic: {enumerable: true, value: [ 95.047, 100, 108.883 ]},
	D50_Lindbloom: {enumerable: true, value: [ 95.047, 100, 108.883 ]},
	D65_Lindbloom: {enumerable: true, value: [ 95.047, 100, 108.883 ]},
	D65_Wickline: {enumerable: true, value: [ 95.047, 100, 108.883 ]} });
Object.freeze(fromXYZ_inputRanges.D65);
Object.freeze(fromXYZ_inputRanges.D65_classic);
Object.freeze(fromXYZ_inputRanges.D50_Lindbloom);
Object.freeze(fromXYZ_inputRanges.D65_Lindbloom);
Object.freeze(fromXYZ_inputRanges.D65_Wickline);
*/

function fromXYZ(xyz, profile, illuminant)   {  // ←illuminant = 'D65' ‖ 'D65_2003' ‖ 'D65_classic' ‖ 'D50_Lindbloom' ‖ 'D65_Lindbloom' ‖ 'D65_Wickline'
//   x,y,z ← 0.0—1.0    r,g,b → 0.0—1.0 × 255 (typically)
	profile??=this.config.RGB_profile;  // ¡We only have sRGB right now!
	illuminant=xyz.illuminant||illuminant||RGB_profiles[profile].illuminant;
	const
		X=xyz[0],  Y=xyz[1],  Z=xyz[2],
		M=fromXYZ_matrix[profile][illuminant];
	var
		r = X * M[0][0]  + Y * M[0][1] + Z * M[0][2],
		g = X * M[1][0]  + Y * M[1][1] + Z * M[1][2],
		b = X * M[2][0]  + Y * M[2][1] + Z * M[2][2];
	return this.γCorrect_linear_RGB(r, g, b, xyz[3], profile);  }


//Object.defineProperty(fromXYZ, 'inputRanges', {value:fromXYZ_inputRanges});  //←here you can add additional inputs-ranges for different illuminant matrices

Object.defineProperty(fromXYZ, 'matrix', {value:fromXYZ_matrix});  // ←↓ here you can add additional matrices for different illuminants
Object.defineProperty(XYZA_Array, 'toRGB_matrix', {value:fromXYZ_matrix});


RGB_Calc.from.lab=
RGB_Calc.from.laba=fromLab;
RGB_Calc.definer.quick.from.lab=
RGB_Calc.definer.quick.from.laba={enumerable:true, value:fromLab};
RGB_Calc.definer.audit.from.lab=
RGB_Calc.definer.audit.from.laba={enumerable:true, value:function($lab)  {
	return auditLab.call(this, {factors:RegExp.lab_factors_a, vals:RegExp.lab_a}, 'Lab', 125, 170, fromLab, $lab);  }};

function fromLab(lab, illuminant)  {  // 0.0 ≤ l ≤ 1.0   -170 ≤ (a,b) ≤ 170  (100%=125)
	if (lab instanceof LabA_Array)  return lab.to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	if (illuminant  &&  !lab.illuminant)  lab.illuminant=illuminant;
	return      LabA_Array.prototype.to_XYZ.call(lab, XYZA_Array).to_RGB(this.config.RGBA_Factory);  }

RGB_Calc.from.lch=
RGB_Calc.from.lcha=fromLCh;
RGB_Calc.definer.quick.from.lch=
RGB_Calc.definer.quick.from.lcha={enumerable:true, value:fromLCh};
RGB_Calc.definer.audit.from.lch=
RGB_Calc.definer.audit.from.lcha={enumerable:true, value:function($lch)  {
	return auditLCh.call(this, {factors:RegExp.lch_factors_a, vals:RegExp.lch_a}, 'LCh', 150, 230, fromLCh, $lch);  }};

function fromLCh(lch, illuminant)  {  // 0.0 ≤ l ≤ 1.0     0 ≤ h ≤ 1    0 ≤ c ≤ 230  (100%=150)
	if (lch instanceof LChA_Array)  return lch.to_Lab(LabA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	if (illuminant  &&  !lch.illuminant)  lch.illuminant=illuminant;
	return      LChA_Array.prototype.to_Lab.call(lch, LabA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);  }



RGB_Calc.from.luv=
RGB_Calc.from.luva=fromLuv;
RGB_Calc.definer.quick.from.luv=
RGB_Calc.definer.quick.from.luva={enumerable:true, value:fromLuv};
RGB_Calc.definer.audit.from.luv=
RGB_Calc.definer.audit.from.luva={enumerable:true, value:function($luv)  {
	return auditLab.call(this, {factors:RegExp.luv_factors_a, vals:RegExp.luv_a}, 'Luv', 215, 215, fromLuv, $luv);  }};

function fromLuv(luv)  {  // 0.0 ≤ l ≤ 1.0   -215 ≤ (u,v) ≤ 215  (100%=215)
	if (luv instanceof LuvA_Array)  return luv.to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return      LuvA_Array.prototype.to_XYZ.call(luv, XYZA_Array).to_RGB(this.config.RGBA_Factory);  }

RGB_Calc.from.lchᵤᵥ=
RGB_Calc.from.lchuv=
RGB_Calc.from.lchᵤᵥa=
RGB_Calc.from.lchuva=fromLChᵤᵥ;
RGB_Calc.definer.quick.from.lchᵤᵥ=
RGB_Calc.definer.quick.from.lchuv=
RGB_Calc.definer.quick.from.lchᵤᵥa=
RGB_Calc.definer.quick.from.lchuva={enumerable:true, value:fromLChᵤᵥ};
RGB_Calc.definer.audit.from.lchᵤᵥ=
RGB_Calc.definer.audit.from.lchuv=
RGB_Calc.definer.audit.from.lchᵤᵥa=
RGB_Calc.definer.audit.from.lchuva={enumerable:true, value:function($lch)  {
	return auditLCh.call(this, {factors:RegExp.lchᵤᵥ_factors_a, vals:RegExp.lchᵤᵥ_a}, 'LChᵤᵥ', 304, 304, fromLChᵤᵥ, $lch);  }};

function fromLChᵤᵥ(lch)  {  // 0.0 ≤ l ≤ 1.0     0 ≤ h ≤ 1    0 ≤ c ≤ ¿304?  (100%=304)
	if (lch instanceof LChᵤᵥA_Array)  return lch.to_Luv(LuvA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return      LChᵤᵥA_Array.prototype.to_Luv.call(lch, LuvA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);  }

RGB_Calc.from.hslᵤᵥ=
RGB_Calc.from.hsluv=
RGB_Calc.from.hslᵤᵥa=
RGB_Calc.from.hsluva=fromHSLᵤᵥ;
RGB_Calc.definer.quick.from.hslᵤᵥ=
RGB_Calc.definer.quick.from.hsluv=
RGB_Calc.definer.quick.from.hslᵤᵥa=
RGB_Calc.definer.quick.from.hsluva={enumerable:true, value:fromHSLᵤᵥ};
RGB_Calc.definer.audit.from.hslᵤᵥ=
RGB_Calc.definer.audit.from.hsluv=
RGB_Calc.definer.audit.from.hslᵤᵥa=
RGB_Calc.definer.audit.from.hsluva={enumerable:true, value:function($hsl)  {
	return ($hsl=parseColorWheelColor.call(this, $hsl, 'HSLᵤᵥ'))  &&  fromHSLᵤᵥ.call(this, $hsl);  }};

function fromHSLᵤᵥ(hsl)  {  // 0.0 ≤ [h,s,l] ≤ 1.0
	if (hsl instanceof HSLᵤᵥA_Array)  return                        hsl.to_Luv(LuvA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return Alexei_Boronine.HSLᵤᵥ_to_LChᵤᵥ.call(this, hsl, LChᵤᵥA_Array).to_Luv(LuvA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);  }



RGB_Calc.from.jᶻaᶻbᶻ=
RGB_Calc.from.jᶻaᶻbᶻa=
RGB_Calc.from.jzazbz=
RGB_Calc.from.jzazbza=fromJᶻaᶻbᶻ;
RGB_Calc.definer.quick.from.jᶻaᶻbᶻ=
RGB_Calc.definer.quick.from.jᶻaᶻbᶻa=
RGB_Calc.definer.quick.from.jzazbz=
RGB_Calc.definer.quick.from.jzazbza={enumerable:true, value:fromJᶻaᶻbᶻ};
RGB_Calc.definer.audit.from.jᶻaᶻbᶻ=
RGB_Calc.definer.audit.from.jᶻaᶻbᶻa=
RGB_Calc.definer.audit.from.jzazbz=
RGB_Calc.definer.audit.from.jzazbza={enumerable:true, value:function($jzazbz)  {
	return auditLab.call(this, {factors:RegExp.jzazbz_factors_a, vals:RegExp.jzazbz_a}, 'Jᶻaᶻbᶻ', 1, 0.5, fromJᶻaᶻbᶻ, $jzazbz);  }};

function fromJᶻaᶻbᶻ(jzazbz)  {  // 0.0 ≤ Jz ≤ 1.0   -0.5 ≤ (az,bz) ≤ 0.5  (100%=0.5)
	if (jzazbz instanceof JᶻaᶻbᶻA_Array)  return jzazbz.to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return         JᶻaᶻbᶻA_Array.prototype.to_XYZ.call(jzazbz, XYZA_Array).to_RGB(this.config.RGBA_Factory);  }

RGB_Calc.from.jᶻcᶻhᶻ=
RGB_Calc.from.jᶻcᶻhᶻa=
RGB_Calc.from.jzczhz=
RGB_Calc.from.jzczhza=fromJᶻCᶻhᶻ;
RGB_Calc.definer.quick.from.jᶻcᶻhᶻ=
RGB_Calc.definer.quick.from.jᶻcᶻhᶻa=
RGB_Calc.definer.quick.from.jzczhz=
RGB_Calc.definer.quick.from.jzczhza={enumerable:true, value:fromJᶻCᶻhᶻ};
RGB_Calc.definer.audit.from.jᶻcᶻhᶻ=
RGB_Calc.definer.audit.from.jᶻcᶻhᶻa=
RGB_Calc.definer.audit.from.jzczhz=
RGB_Calc.definer.audit.from.jzczhza={enumerable:true, value:function($jzczhz)  {
	return auditLCh.call(this, {factors:RegExp.jzczhz_factors_a, vals:RegExp.jzczhz_a}, 'JᶻCᶻhᶻ', 1, 0.70710678118654752440084436210485, fromJᶻCᶻhᶻ, $jzczhz);  }};

function fromJᶻCᶻhᶻ(jzczhz)  {  // 0.0 ≤ Jz ≤ 1.0     0 ≤ h ≤ 1    0 ≤ Cz ≤ 1  (100%=1)
	if (jzczhz instanceof JᶻCᶻhᶻA_Array)
																return jzczhz.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return JᶻCᶻhᶻA_Array.prototype.to_Jᶻaᶻbᶻ.call(jzczhz, JᶻaᶻbᶻA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);  }


RGB_Calc.from.icᵀcᴾ=
RGB_Calc.from.icᵀcᴾa=
RGB_Calc.from.ictcp=
RGB_Calc.from.ictcpa= fromICᵀCᴾ;
RGB_Calc.definer.quick.from.icᵀcᴾ=
RGB_Calc.definer.quick.from.icᵀcᴾa=
RGB_Calc.definer.quick.from.ictcp=
RGB_Calc.definer.quick.from.ictcpa={enumerable:true, value:fromICᵀCᴾ};
RGB_Calc.definer.audit.from.icᵀcᴾ=
RGB_Calc.definer.audit.from.icᵀcᴾa=
RGB_Calc.definer.audit.from.ictcp=
RGB_Calc.definer.audit.from.ictcpa={enumerable:true, value:function($ictcp)  {
	return auditLab.call(this, {factors:RegExp.ictcp_factors_a, vals:RegExp.ictcp_a}, 'ICᵀCᴾ', 1, 0.5, fromICᵀCᴾ, $ictcp);  }};

function fromICᵀCᴾ(ictcp)  {  // 0.0 ≤ I ≤ 1.0   -0.5 ≤ (Cᵀ,Cᴾ) ≤ 0.5  (100%=0.5)
	if (ictcp instanceof ICᵀCᴾA_Array)  return ictcp.to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return        ICᵀCᴾA_Array.prototype.to_XYZ.call(ictcp, XYZA_Array).to_RGB(this.config.RGBA_Factory);  }

RGB_Calc.from.ichᵀᴾ=
RGB_Calc.from.ichᵀᴾa=
RGB_Calc.from.ichtp=
RGB_Calc.from.ichtpa= fromIChᵀᴾ;
RGB_Calc.definer.quick.from.ichᵀᴾ=
RGB_Calc.definer.quick.from.ichᵀᴾa=
RGB_Calc.definer.quick.from.ichtp=
RGB_Calc.definer.quick.from.ichtpa={enumerable:true, value:fromIChᵀᴾ};
RGB_Calc.definer.audit.from.ichᵀᴾ=
RGB_Calc.definer.audit.from.ichᵀᴾa=
RGB_Calc.definer.audit.from.ichtp=
RGB_Calc.definer.audit.from.ichtpa={enumerable:true, value:function($ichtp)  {
	return auditLCh.call(this, {factors:RegExp.ichtp_factors_a, vals:RegExp.ichtp_a}, 'IChᵀᴾ', 1, 0.70710678118654752440084436210485, fromIChᵀᴾ, $ichtp);  }};

function fromIChᵀᴾ(ichtp)  {  // 0.0 ≤ I ≤ 1.0   -0.5 ≤ (Cᵀ,Cᴾ) ≤ 0.5  (100%=0.5)
	if (ichtp instanceof IChᵀᴾA_Array)
															 return ichtp.to_ICᵀCᴾ(ICᵀCᴾA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return IChᵀᴾA_Array.prototype.to_ICᵀCᴾ.call(ichtp, ICᵀCᴾA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);  }



/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/


class ColorFactory  {
	static ConfigStack=class extends RGB_Calc.definer.audit.ConfigStack {};
	static  {
		this.ConfigStack.prototype.RGBA_Factory= RGBA_Array;
		this.ConfigStack.prototype.HSLA_Factory= HSLA_Array;
		this.ConfigStack.prototype.HSBA_Factory= HSBA_Array;
		this.ConfigStack.prototype.HSVA_Factory= HSVA_Array;
		this.ConfigStack.prototype.HWBA_Factory= HWBA_Array;
		this.ConfigStack.prototype.HCGA_Factory= HCGA_Array;
		this.ConfigStack.prototype.CMYKA_Factory= CMYKA_Array;
		this.ConfigStack.prototype.OKLabA_Factory= OKLabA_Array;
		this.ConfigStack.prototype.OKLChA_Factory= OKLChA_Array;
		this.ConfigStack.prototype.OKHSLA_Factory= OKHSLA_Array;
		this.ConfigStack.prototype.OKHSVA_Factory= OKHSVA_Array;
		this.ConfigStack.prototype.OKHWBA_Factory= OKHWBA_Array;
		this.ConfigStack.prototype.OKHCGA_Factory= OKHCGA_Array;
		this.ConfigStack.prototype.XYZA_Factory= XYZA_Array;
		this.ConfigStack.prototype.LabA_Factory= LabA_Array;
		this.ConfigStack.prototype.LChA_Factory= LChA_Array;
		this.ConfigStack.prototype.LuvA_Factory= LuvA_Array;
		this.ConfigStack.prototype.LChᵤᵥA_Factory= LChᵤᵥA_Array;
		this.ConfigStack.prototype.HSLᵤᵥA_Factory= HSLᵤᵥA_Array;
		this.ConfigStack.prototype.JᶻaᶻbᶻA_Factory= JᶻaᶻbᶻA_Array;
		this.ConfigStack.prototype.JᶻCᶻhᶻA_Factory= JᶻCᶻhᶻA_Array;
		this.ConfigStack.prototype.ICᵀCᴾA_Factory= ICᵀCᴾA_Array;
		this.ConfigStack.prototype.IChᵀᴾA_Factory= IChᵀᴾA_Array; }

	constructor($config)  {  // ← this $config is for the class and determines how a $color input is evaluated, and the factory to return color values in.
		this.config=new ColorFactory.ConfigStack(this, $config);
		this.rgb_calc=new RGB_Calc();  //for processing palette colors by create_A_Color below
		Object.defineProperty(this.rgb_calc, 'config', {get:()=>this.config});  }

	createColor($color, $config, $dSpace)  {  // ← this $config is for the color-object (…A_Color) you want to create; typically, DO NOT INCLUDE when your factory is not an …A_Color
		//  ↑↑↑ But if your factory is YOUR custom constructor, you could pass any value YOU need from $config to your custom constructor.
		//  ↑↑↑ $dSpace is optional, and will convert the interpreted color to the “destination color space model”.
		if ($color == null)  return null;
		if (typeof $color!=="string")  throw new TypeError('“ColorFactory.create_A_Color()” takes a string as a parameter.  Passed in:',$color);
		$config??=this.config.configWhip;
		var factory, pClr, matches;
		const
			applyConversion= ($clr)=>{return $dSpace ? this.convertColor($clr, $dSpace, undefined, undefined, $config) : $clr;}
		function applyConfig($RGB)  {
			if ($config  &&  !$dSpace)  for (const p in $config)  {$RGB.config[p]=$config[p];}
			return applyConversion($RGB);  }
		function returnVs($Vs) {return $Vs;}
		if (RegExp.isHex.test($color))  {
			const config=RGB_Calc.config;
			RGB_Calc.config=this.config;
			try {return applyConfig(RGB_Calc.from.hex($color));}
			finally {RGB_Calc.config=config;}  }
		if ((SoftMoon.palettes[SoftMoon.defaultPalette] instanceof SoftMoon.WebWare.Palette)
		&&  (pClr=$color.match(RegExp.addOnAlpha))
		&&  SoftMoon.palettes[SoftMoon.defaultPalette].getColor(pClr[1]) )
			return applyConfig(this.rgb_calc($color));
		if (matches=(   $color.match(RegExp.CSSColorFunction)
								||  $color.match(RegExp.stdWrappedColor)
								||  $color.match(RegExp.stdPrefixedColor)))  {
			matches[1]=matches[1].trim().toUpperCase();
			const cSpace= matches[1].endsWith('A') ? matches[1].slice(0,-1) : matches[1];
			let _vals_;
			switch (cSpace)  {
			case 'CMY':
				_vals_=parseCMY.call(this, matches[2]);
				if (!_vals_)  return null;
			case 'RGB':
				_vals_??=matches[2];
				const config=RGB_Calc.config;
				RGB_Calc.config=this.config;
				try {return applyConfig(RGB_Calc.from[cSpace.toLowerCase()](_vals_));}
				finally {RGB_Calc.config=config;}
			case 'HSL':    factory=this.config.HSLA_Factory;
			case 'HSB':    factory??=this.config.HSBA_Factory;
			case 'HSV':    factory??=this.config.HSVA_Factory;
			case 'HCG':    factory??=this.config.HCGA_Factory;
			case 'HWB':    factory??=this.config.HWBA_Factory;
			case 'HSLᵤᵥ':
			case 'HSLUV':  factory??=this.config.HSLᵤᵥA_Factory;
			case 'OKHSL':  factory??=this.config.OKHSLA_Factory;
			case 'OKHSV':  factory??=this.config.OKHSVA_Factory;
			case 'OKHWB':  factory??=this.config.OKHWBA_Factory;
			case 'OKHCG':  factory??=this.config.OKHCGA_Factory;
				{
				const vals=parseColorWheelColor.call(this, matches[2], cSpace);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new factory(...vals, $config) : new factory(...vals));  }
				return null;
				}
			case 'CMYK':  {
				const vals=parseCMYK.call(this, matches[2]);
				if (vals)  {
					vals.length=5;
					return applyConversion($config ? new this.config.CMYKA_Factory(...vals, $config) : new this.config.CMYKA_Factory(...vals));  }
				return null;  }
			case 'LAB':  {
				const vals=auditLab.call(this, {factors:RegExp.lab_factors_a, vals:RegExp.lab_a}, 'Lab', 125, 170, returnVs, matches[2], true);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.LabA_Factory(...vals, vals.illuminant, $config) : new this.config.LabA_Factory(...vals, vals.illuminant));  }
				return null;  }
			case 'LCH':  {
				const vals=auditLCh.call(this, {factors:RegExp.lch_factors_a, vals:RegExp.lch_a}, 'LCh', 150, 230, returnVs, matches[2], true);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.LChA_Factory(...vals, vals.illuminant, $config) : new this.config.LChA_Factory(...vals, vals.illuminant));  }
				return null;  }
			case 'LUV':  {
				const vals=auditLab.call(this, {factors:RegExp.luv_factors_a, vals:RegExp.luv_a}, 'Luv', 215, 215, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.LuvA_Factory(...vals, $config) : new this.config.LuvA_Factory(...vals));  }
				return null;  }
			case 'LCHUV':
			case 'LCHᵤᵥ':  {
				const vals=auditLCh.call(this, {factors:RegExp.lchᵤᵥ_factors_a, vals:RegExp.lchᵤᵥ_a}, 'LChᵤᵥ', 304, 304, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.LChᵤᵥA_Factory(...vals, $config) : new this.config.LChᵤᵥA_Factory(...vals));  }
				return null;  }
			case 'JᶻAᶻBᶻ':
			case 'JZAZBZ':  {
				const vals=auditLab.call(this, {factors:RegExp.jzazbz_factors_a, vals:RegExp.jzazbz_a}, 'Jᶻaᶻbᶻ', 1, 0.5, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.JᶻaᶻbᶻA_Factory(...vals, $config) : new this.config.JᶻaᶻbᶻA_Factory(...vals));  }
				return null;  }
			case 'JᶻCᶻHᶻ':
			case 'JZCZHZ':  {
				const vals=auditLCh.call(this, {factors:RegExp.jzczhz_factors_a, vals:RegExp.jzczhz_a}, 'JᶻCᶻhᶻ', 1, 0.70710678118654752440084436210485, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.JᶻCᶻhᶻA_Factory(...vals, $config) : new this.config.JᶻCᶻhᶻA_Factory(...vals));  }
				return null;  }
			case 'ICᵀCᴾ':
			case 'ICTCP':  {
				const vals=auditLab.call(this, {factors:RegExp.ictcp_factors_a, vals:RegExp.ictcp_a}, 'ICᵀCᴾ', 1, 0.5, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.ICᵀCᴾA_Factory(...vals, $config) : new this.config.ICᵀCᴾA_Factory(...vals));  }
				return null;  }
			case 'ICHᵀᴾ':
			case 'ICHTP':  {
				const vals=auditLCh.call(this, {factors:RegExp.ichtp_factors_a, vals:RegExp.ichtp_a}, 'IChᵀᴾ', 1, 0.70710678118654752440084436210485, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.IChᵀᴾA_Factory(...vals, $config) : new this.config.IChᵀᴾA_Factory(...vals));  }
				return null;  }
			case 'OKLAB':  {
				const vals=auditLab.call(this, {factors:RegExp.oklab_factors_a, vals:RegExp.oklab_a}, 'OKLab', 0.4, 0.4, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.OKLabA_Factory(...vals, $config) : new this.config.OKLabA_Factory(...vals));  }
				return null;  }
			case 'OKLCH':  {
				const vals=auditLCh.call(this, {factors:RegExp.oklch_factors_a, vals:RegExp.oklch_a}, 'OKLCh', 0.4, 0.5, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return applyConversion($config ? new this.config.OKLChA_Factory(...vals, $config) : new this.config.OKLChA_Factory(...vals));  }
				return null;  }
			case 'XYZ':  {
				const vals=parseXYZ.call(this, matches[2]);
				if (vals)  {
					if (vals.profile)  switch (vals.profile)  {
						case 'sRGB':
							const config=RGB_Calc.config;
							RGB_Calc.config=this.config;
							try {return applyConfig(RGB_Calc.from.xyz(vals.xyz, vals.profile));}
							finally {RGB_Calc.config=config;}
						default: return null;  }
					vals.xyz.length=4;
					const illuminant=vals.xyz.illuminant;
					return applyConversion( $config ?
							new this.config.XYZA_Factory(...vals.xyz, illuminant, fromXYZ_matrix.sRGB[illuminant].observer, $config)
						: new this.config.XYZA_Factory(...vals.xyz, illuminant, fromXYZ_matrix.sRGB[illuminant].observer) );  }
				return null;  }  }
			for (const p in SoftMoon.palettes)  {
				if (p.toUpperCase()===matches[1]  &&  (SoftMoon.palettes[p] instanceof SoftMoon.WebWare.Palette))
					return applyConfig(this.rgb_calc($color));  }
			return null;  }  }  }

// this will also convert …A_Arrays to …A_Colors and visa-versa, or simple Arrays to either of the former, or to/from YOUR custom Array-based color-class
//  ↓↓↓ only $color is required; all others are optional except $model if $color does not have a  .model  property
function copy_color($color, $model, $factory, $config)  { // ← this optional $config is for the …A_Color Object you want to create; typically, DO NOT INCLUDE when your factory is not an …A_Color
		//  ↑↑↑ But if your factory is YOUR custom constructor, you could pass any value YOU need from $config to your custom constructor.
		if (!($color instanceof Array))  throw new TypeError('“ColorFactor.copy_color()” can only copy Array instances.');
		$model=($color.model||$model).toUpperCase();
		$config??=this.config.configWhip;
		const
			L= ($model==='CMYK') ? 5 : 4,
			cData=$color.slice(0,L);
		cData.length=L;
		switch ($model)  {
			case 'RGB': $factory ??= this.config.RGBA_Factory;  break;
			case 'HSL': $factory ??= this.config.HSLA_Factory;  break;
			case 'HSB': $factory ??= this.config.HSBA_Factory;  break;
			case 'HSV': $factory ??= this.config.HSVA_Factory;  break;
			case 'HWB': $factory ??= this.config.HWBA_Factory;  break;
			case 'HCG': $factory ??= this.config.HCGA_Factory;  break;
			case 'HSLᵤᵥ':
			case 'HSLUV': $factory ??= this.config.HSLᵤᵥA_Factory;  break;
			case 'OKHSL': $factory ??= this.config.OKHSLA_Factory;  break;
			case 'OKHSV': $factory ??= this.config.OKHSVA_Factory;  break;
			case 'OKHWB': $factory ??= this.config.OKHWBA_Factory;  break;
			case 'OKHCG': $factory ??= this.config.OKHCGA_Factory;  break;
			case 'OKLCH': $factory ??= this.config.OKLChA_Factory;  break;
			case 'LCH':   $factory ??= this.config.LChA_Factory;    break;
			case 'LCHᵤᵥ':
			case 'LCHUV': $factory ??= this.config.LChᵤᵥA_Factory;  break;
			case 'JᶻAᶻBᶻ':
			case 'JZAZBZ':$factory ??= this.config.JᶻaᶻbᶻA_Factory; break;
			case 'JᶻCᶻHᶻ':
			case 'JZCZHZ':$factory ??= this.config.JᶻCᶻhᶻA_Factory; break;
			case 'ICᵀCᴾ':
			case 'ICTCP': $factory ??= this.config.ICᵀCᴾA_Factory;  break;
			case 'ICHᵀᴾ':
			case 'ICHTP': $factory ??= this.config.IChᵀᴾA_Factory;  break;
			case 'CMYK':  $factory ??= this.config.CMYKA_Factory;   break;
			case 'LAB':   $factory ??= this.config.LabA_Factory;    break;
			case 'LUV':   $factory ??= this.config.LuvA_Factory;    break;
			case 'OKLAB': $factory ??= this.config.OKLabA_Factory;  break;
			case 'XYZ':   $factory ??= this.config.XYZA_Factory;
				return $config ?
						new $factory(...cData, $color.illuminant, $color.observer, $config)
					: new $factory(...cData, $color.illuminant, $color.observer);
			default: throw new TypeError("Unknown input color-model type for “ColorFactory.copy_color()” … ",$model);  }
		return $config ? new $factory(...cData, $config) : new $factory(...cData);  }

const defaultIlluminants={
	XYZ: "D65",
	Lab: "D50",
	LCh: "D50" };

	// this will convert all Array-based Colors
function convert_color($c, $dSpace, $factory, $config)  {  // ← $dSpace is ¡case-sensitive! in able to specify the type of factory
		//  ↑↑↑ this optional $config is for the …A_Color Object you want to create; typically, DO NOT INCLUDE when your factory is not an …A_Color
		//  ↑↑↑ But if your factory is YOUR custom constructor, you could pass any value YOU need from $config to your custom constructor
		const hasIllum = $dSpace.match(/^([^-]+)-([A-F]\d\d)$/); // ← ¡remember $dSpace is case-sensitive!
		if (hasIllum)  $dSpace=hasIllum[1];
		const
			$dIlluminant = hasIllum?.[2]||defaultIlluminants[$dSpace],
			adaptXYZ= ($xyz)=>applyConfig($xyz.adapt_illuminant($dIlluminant, '2°', $factory||this.config.XYZA_Factory));
		function applyConfig($clr) {if ($config)  for (const p in $config)  {$clr.config[p]=$config[p];}  return $clr;}
		if ($c.model===$dSpace)  {
			if ($c.illuminant!==$dIlluminant)  switch (dSpace)  {
				case 'Lab': $c=$c.to_XYZ(XYZA_Array).adapt_illuminant($dIlluminant).to_Lab($factory||this.config.LabA_Factory);
				break;
				case 'XYZ': $c=$c.adapt_illuminant($dIlluminant);
				break;
				default: throw new TypeError("Unknown color-space model with an “illuminant” for “ColorFactory.convert_color()” … ",$dSpace);  }
			return applyConfig($factory?.from?.($c)  ||  $c);  }
		var convert, flag=true;
		switch ($dSpace)  {
			case 'RGB':
				RGB_Calc.config.stack({RGBA_Factory:{value:$factory||this.config.RGBA_Factory}});
				try {return applyConfig(RGB_Calc.from[$c.model.toLowerCase()]($c));}
				catch(e) {console.warn("$c failed to convert:",$c,"to RGB because:\n",e);  throw e;}
				finally {RGB_Calc.config.cull()};
			case 'OKHSV': if ($c.model==='OKHCG')  return applyConfig($c.to_OKHSV($factory||this.config.OKHSVA_Factory));
										convert='to_OKHSV';
			case 'OKLCh': convert??='to_OKLCh';
			case 'OKHSL': convert??='to_OKHSL';
				switch ($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'LCh':   if ($c.model==='LCh')  $c=$c.to_Lab(LabA_Array);
				case 'Lab':
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': return applyConfig($c[convert]($factory||this.config[$dSpace+"A_Factory"]));  }
				break;
			case 'OKHCG':
				switch($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'LCh':   if ($c.model==='LCh')  $c=$c.to_Lab(LabA_Array);
				case 'Lab':
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':
				case 'OKHSL':
				case 'OKHWB': $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': $c=$c.to_OKHSV(OKHSVA_Array);
				case 'OKHSV': return applyConfig($c.to_OKHCG($factory||this.config.OKHCGA_Factory));  }
				break;
			case 'OKHWB':
				switch($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'LCh':   if ($c.model==='LCh')  $c=$c.to_Lab(LabA_Array);
				case 'Lab':
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':
				case 'OKHSL':
				case 'OKHCG': $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': $c=$c.to_OKHSV(OKHSVA_Array);
				case 'OKHSV': return applyConfig($c.to_OKHWB($factory||this.config.OKHWBA_Factory));  }
				break;
			case 'OKLab':
				switch ($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'LCh':   if ($c.model==='LCh')  $c=$c.to_Lab(LabA_Array);
				case 'Lab':
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': return applyConfig($c.to_OKLab($factory||this.config.OKLabA_Factory));  }
				break;
			case 'LCh':
				switch($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':   $c=$c.adapt_illuminant($dIlluminant).to_Lab(LabA_Array);
				case 'Lab':
					if ($c.illuminant!==$dIlluminant)
						$c=$c.to_XYZ(XYZA_Array).adapt_illuminant($dIlluminant).to_Lab(LabA_Array);
					return applyConfig($c.to_LCh($factory||this.config.LChA_Factory));  }
				break;
			case 'Lab':
				switch ($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ': $c=$c.adapt_illuminant($dIlluminant);
				case 'LCh':
					$factory??=this.config.LabA_Factory;
					if ($c.illuminant===$dIlluminant)  $c=$c.to_Lab($factory);
					else  $c=$c.to_Lab(LabA_Array).to_XYZ(XYZA_Array).adapt_illuminant($dIlluminant).to_Lab($factory);
					return applyConfig($c);  }
				break;
			case 'LChuv':
			case 'LChᵤᵥ':
				switch($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LCh':   if (flag)  $c=$c.to_Lab(LabA_Array);
				case 'Lab':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':   $c=$c.to_Luv(LuvA_Array);
				case 'HSLᵤᵥ':
				case 'Luv':   return applyConfig($c.to_LChᵤᵥ($factory||this.config.LChᵤᵥA_Factory));  }
				break;
			case 'Luv':
				switch ($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LCh':   if (flag)  $c=$c.to_Lab(LabA_Array);
				case 'Lab':   $c=$c.to_XYZ(XYZA_Array);
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ':
				case 'XYZ': return applyConfig($c.to_Luv($factory||this.config.LuvA_Factory));  }
				break;
			case 'HSLuv':
			case 'HSLᵤᵥ':
				switch ($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'JᶻCᶻhᶻ':if (flag)  $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LCh':   if (flag)  $c=$c.to_Lab(LabA_Array);
				case 'Lab':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':   $c=$c.to_Luv(LuvA_Array);
				case 'Luv':   return applyConfig($c.to_LChᵤᵥ(LChᵤᵥA_Array).to_HSLᵤᵥ($factory||this.config.HSLᵤᵥA_Factory));  }
				break;
			case 'JzCzhz':
			case 'JᶻCᶻhᶻ':
				switch($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'LCh':   if (flag)  $c=$c.to_Lab(LabA_Array);
				case 'Lab':   flag=false
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':   $c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ': return applyConfig($c.to_JᶻCᶻhᶻ($factory||this.config.JᶻCᶻhᶻA_Factory));  }
				break;
			case 'Jzazbz':
			case 'Jᶻaᶻbᶻ':
				switch ($c.model)  {
				case 'IChᵀᴾ': $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': flag=false;
				case 'LCh':   if (flag)  $c=$c.to_Lab(LabA_Array);
				case 'Lab':   flag=false
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':
				case 'JᶻCᶻhᶻ': return applyConfig($c.to_Jᶻaᶻbᶻ($factory||this.config.JᶻaᶻbᶻA_Factory));  }
				break;
			case 'IChtp':
			case 'IChᵀᴾ':
				switch($c.model)  {
				case 'JᶻCᶻhᶻ':$c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'LCh':   if (flag)  $c=$c.to_Lab(LabA_Array);
				case 'Lab':   flag=false
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':   $c=$c.to_ICᵀCᴾ(ICᵀCᴾA_Array);
				case 'ICᵀCᴾ': return applyConfig($c.to_IChᵀᴾ($factory||this.config.IChᵀᴾA_Factory));  }
				break;
			case 'ICtCp':
			case 'ICᵀCᴾ':
				switch ($c.model)  {
				case 'JᶻCᶻhᶻ':$c=$c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array);
				case 'Jᶻaᶻbᶻ':flag=false;
				case 'LCh':   if (flag)  $c=$c.to_Lab(LabA_Array);
				case 'Lab':   flag=false
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': if (flag)  $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab': flag=false;
				case 'LChᵤᵥ':
				case 'HSLᵤᵥ': if (flag)  $c=$c.to_Luv(LuvA_Array);
				case 'Luv':   $c=$c.to_XYZ(XYZA_Array);
				case 'XYZ':
				case 'IChᵀᴾ': return applyConfig($c.to_ICᵀCᴾ($factory||this.config.ICᵀCᴾA_Factory));  }
				break;
			case 'XYZ':
				switch ($c.model)  {
				case 'LCh':   return adaptXYZ($c.to_Lab(LabA_Array).to_XYZ(XYZA_Array));
				case 'JᶻCᶻhᶻ':return adaptXYZ($c.to_Jᶻaᶻbᶻ(JᶻaᶻbᶻA_Array).to_XYZ(XYZA_Array));
				case 'IChᵀᴾ': return adaptXYZ($c.to_ICᵀCᴾ(ICᵀCᴾA_Array).to_XYZ(XYZA_Array));
				case 'HSLᵤᵥ':
				case 'LChᵤᵥ': return adaptXYZ($c.to_Luv(LuvA_Array).to_XYZ(XYZA_Array));
				case 'OKLCh':
				case 'OKHWB':
				case 'OKHCG':
				case 'OKHSV':
				case 'OKHSL': $c=$c.to_OKLab(OKLabA_Array);
				case 'OKLab':
				case 'Jᶻaᶻbᶻ':
				case 'ICᵀCᴾ':
				case 'Lab':
				case 'Luv': return adaptXYZ($c.to_XYZ(XYZA_Array));  }
			case 'HSL':
			case 'HSB':
			case 'HSV':
			case 'HCG':
			case 'CMYK': break;
			default:  throw new TypeError("Unknown destination color-space model for “ColorFactory.convert_color()” … ",$dSpace);  }
		if ($factory)
			RGB_Calc.config.stack({
				RGBA_Factory: {value:Array},
				[$dSpace+'A_Factory']: {value:$factory} });
		else
			RGB_Calc.config.stack({
				RGBA_Factory: {value:Array} });
		try {return applyConfig(RGB_Calc.to[$dSpace.toLowerCase()](RGB_Calc.from[$c.model.toLowerCase()]($c)));}
		catch(e) {console.warn("$c failed to convert:",$c,"to:",$dSpace,"because:\n",e);  throw e;}
		finally {RGB_Calc.config.cull()};  }


ColorFactory.prototype.copyColor=copy_color;
ColorFactory.prototype.convertColor=convert_color;
// the worker methods of a calculator & ColorFactory:
Object.defineProperties(ColorFactory.prototype, defProps1); // see the RGB_Calc code above

SoftMoon.WebWare.ColorFactory=ColorFactory;


}  //close the private namespace


//  thanks to, and see for more formulas:  http://www.easyrgb.com/index.php?X=MATH
//  hwb: https://drafts.csswg.org/css-color/#the-hwb-notation
//  thanks to, and see for more formulas:  https://github.com/color-js/color.js/
//  and thanks to others: see coded algorithms within for reference

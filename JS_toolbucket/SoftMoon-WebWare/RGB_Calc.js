//  character encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160

// RGB_Calc.js  release 1.10.1  March 25, 2024  by SoftMoon WebWare.
// based on  rgb.js  Beta-1.0 release 1.0.3  August 1, 2015  by SoftMoon WebWare.
/*   written by and Copyright © 2011, 2012, 2013, 2016, 2018, 2020, 2022, 2023, 2024 Joe Golembieski, SoftMoon WebWare

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
// requires  “HTTP.js”  ←in  JS_toolbucket/SoftMoon-WebWare/    ← only when downloading color-palette tables from the web via ajax.  They may be included in other ways.
//  ↑ ↑ ↑ This codebase does not initiate HTTP connections on its own.
//  ↑ ↑ ↑ Your host environment code must handle that and you must understand how to do that and what that process does.

'use strict';

/*   The SoftMoon namespace Object is usually a constant defined in a “pinnicle” file somewhere else
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
RegExp.hsl=
RegExp.hsv=
RegExp.hsb=
RegExp.hcg=
RegExp.hwb=
RegExp.ColorWheelColor=new window.RegExp( '^' +h+ sep +p+ sep +p+ '$', "u" );
RegExp.hsla=
RegExp.hsva=
RegExp.hsba=
RegExp.hcga=
RegExp.hwba=
RegExp.ColorWheelColorA=new window.RegExp( '^' +h+ sep +p+ sep +p+ aSep +f+ '$', "u" );
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
	OK_ab='\\s*0*(-?(?:(?:' + pVal + ')%|0|\\.40*|\\.[0-3]\\d*))\\s*',
	OK_c='\\s*0*(' +per125+ '|\\.\\d+%|0|\\.50*|\\.[0-4]\\d*)\\s*',
	OK_f_C='\\s*0*((?:0|1|\\.\\d+%?)|' +per125+ ')\\s*?',
  OK_f_ab='\\s*0*(-?(?:0|1|\\.\\d+)|(?:' +pVal+ ')%)\\s*?';

RegExp.oklab_a=new window.RegExp( '^' +p+ sep +OK_ab+ sep +OK_ab+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.oklch_a=new window.RegExp( '^' +p+ sep +OK_c+ sep + h+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.oklab_factors_a=new window.RegExp( '^' +f +sep+ OK_ab +sep+ OK_ab + '(?:' +aSep+ f+ ')?$' );
RegExp.oklch_factors_a=new window.RegExp( '^' +f +sep+ OK_f_C +sep+ h+ '(?:' +aSep+ f+ ')?$' );


const
	abMax='170(?:\\.0+)?|(?:1[0-6]\\d|\\d{1,2})(?:\\.\\d+)?|\\.\\d+%?',
	per136='136%(?:\\.0+)?|(?:13[0-5]|1[0-2]\\d|\\d{1,2})(?:\\.\\d+)%',
	ab='\\s*0*(-?(?:0%?|' +per136+ '|' +abMax+ '))\\s*',
	per154='154(?:\\.0+)?%|(?:15[0-3]|1[0-4]\\d|\\d{1,2})(?:\\.\\d+)?%',
	c='\\s*0*(' +per154+ '|230(?:\\.0+)?|(?:2[0-2]\\d|1?\\d{1,2})(?:\\.\\d+)?|\\.\\d+%?)\\s*',
	f_ab='\\s*0*(-?(?:(?:0|1(?:\\.360*|\\.3[0-5]\\d*|\\.[0-2]\\d*)?|\\.\\d+)|(?:' +per136+ ')%))\\s*?',
	f_C='\\s*0*((?:0|1|\\.\\d+%?)|' +per154+ ')\\s*?';

RegExp.lab_a=new window.RegExp( '^' +p+ sep +ab+ sep +ab+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.lch_a=new window.RegExp( '^' +p+ sep +c+ sep + h+ '(?:' +aSep +f+ ')?$', "u" );
RegExp.lab_factors_a=new window.RegExp( '^' +f +sep+ f_ab +sep+ f_ab + '(?:' +aSep+ f+ ')?$' );
RegExp.lch_factors_a=new window.RegExp( '^' +f +sep+ f_C +sep+ h+ '(?:' +aSep+ f+ ')?$' );

//=================================================================================================\\
/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/

const hueAngleUnitFactors=Math.Trig.angleUnitFactors;
/*
	Object.defineProperties(new Object, {
		'deg':  {value: 360,       enumerable: true},
		"°":    {value: 360,       enumerable: true},
		'rad':  {value: 2*π, enumerable: true},
		"ᶜ":    {value: 2*π, enumerable: true},
		"ᴿ":    {value: 2*π, enumerable: true},
		'grad': {value: 400,       enumerable: true},
		'ᵍ':    {value: 400,       enumerable: true},
		"%":    {value: 100,       enumerable: true},
		'turn': {value: 1,         enumerable: true},
		"●":    {value: 1,         enumerable: true}  });
 */



//===============================================================
//  These functions are shared by the Color objects and RGB_Calc


	// make sure the color’s value is an integer; and in the boundaries of 0-255; if not, “reflect” it back or “truncate”.
function getByteValue(v)  {
	var isNotPercent=true;  // or a factor…
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
		if (m=h.match( RegExp.Hue ))  {h=parseFloat(m[1]);  unit= (m=m[2]) || unit;}
		else {console.error('bad hue:'+h+'  unit: '+unit);  return false;  }  }
	else if (h instanceof Number  &&  (h.unit in hueAngleUnitFactors))
		unit=h.unit;  // this experimental property name is subject to change
	if ( (this.config.inputAsFactor  &&  !m)
	||  unit==='turn'  ||  unit==="●" )
		return (h<0 || h>1) ? Math.sawtooth(1,h) : h;
	// ↑  ↓   all grayscale may be hue=1 instead of hue=0
	if (unit=hueAngleUnitFactors[unit])  return (h<0 || h>unit) ?  (Math.sawtooth(unit, h)/unit)  :  (h/unit);
	else  return false;  }

function getFactorValue(v)  {
	v= (this.config.inputAsFactor
		&&  (typeof v !== 'string'  ||  !v.endsWith("%"))
		&&  (!(v instanceof Number)  ||  v.unit!=='%'))  ?  // this experimental property name is subject to change
		parseFloat(v)  :  (parseFloat(v)/100);
	return (v<0 || v>1) ? false : v;  }

function getAB_value(v, abPer, abMax)  {  //for OKLab & OKLCh & Lab & LCh
	if (this.config.inputAsFactor  &&  !this.config.inputAsNumeric
		&&  (typeof v !== 'string'  ||  !v.endsWith("%"))
		&&  (!(v instanceof Number)  ||  v.unit!=='%'))    // this experimental property name is subject to change
			v=parseFloat(v)*abPer;
	else v= (typeof v === 'string'  &&  v.endsWith("%")) ?  (parseFloat(v)/100)*abPer : parseFloat(v);
	return (v<(0-abMax) || v>abMax) ? false : v;  }

function getAlphaFactor(v)  {
	if (v===""  ||  v===undefined  ||  v===null)  return this.config.defaultAlpha;  //undefined;
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
	if ( (tmp=this.getAlpha(a[stop])) === false )  return false
	else a[stop]=tmp;
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


const round=Math.round;

function outputRGB(r,g,b,a)  {
	if (this.config.roundRGB)  {
			r=round(r); g=round(g); b=round(b);  }
	//When RGBA_Factory=Array we don’t want the length property to be ===4 with an undefined alpha.
	if (a===undefined  &&  (a=this.config.defaultAlpha)===undefined)
		return new this.config.RGBA_Factory(r,g,b);
	else
		return new this.config.RGBA_Factory(r,g,b,a);  }

function outputClampedRGB(r,g,b,a)  {
	const bits=this.config.RGB_bitDepth;
	r=round(r); g=round(g); b=round(b);
	if (r>=0 && r<=bits  &&  g>=0 && g<=bits  &&  b>=0 && b<=bits)  {
		if (a===undefined  &&  (a=this.config.defaultAlpha)===undefined)
			return new this.config.RGBA_Factory(r,g,b);
		else
			return new this.config.RGBA_Factory(r,g,b,a);  }
	return this.config.clamp_sRGB(r,g,b,a);  }



//===============================================================
/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/



//  The Config Stack is central to the operation of RGB_Calc class
// and periferal to the …A_Color Objects for their limited conversion functions
// and for their “toString” methods.
function ConfigStack($owner, $config)  {
	if (!new.target)  throw new Error('SoftMoon.WebWare.RGB_Calc.ConfigStack is a constructor, not a function.');
	Object.defineProperty(this, 'owner', {value: $owner});
	if (typeof $config === 'object')  for (const f in $config)  {this[f]=$config[f];}  }


ConfigStack.prototype={
	name: 'RGB_Calc.ConfigStack',

	RGB_bitDepth: 255,

	clamp_sRGB: function(r,g,b,a)  {  // to be enhanced…
		return null;  },

//  for the RGB color model,
//  depending on the flag below,
//  values may be rounded to integers or left as floating-point values.
	roundRGB: false,

//  for the RGB color model,
//  depending on the flag below,
//  values passed in to  RGB_Calc (¡when “auditing”!)  or  RGBA_Color  outside the range of 0-255 are “reflected” or “truncated” back into the correct range.
	reflect: false,

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
 *    0 <= factor <= 1     0 <= percent <= 100     0 <= byte <= 255
 */
	inputAsFactor: false,
	// this overrides ↑ inputAsFactor for a-axis & b-axis & chroma when using the Lab, LCh, OKLab, & OKLCh color-spaces
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
 * default input unit for calculators.  default output unit for ColorWheel_Color objects.
 * Valid units are listed (below) as property keys of  SoftMoon.WebWare.RGB_Calc.hueAngleUnitFactors
 */
	hueAngleUnit: 'deg',

//  when outputting RGB Hex values, this flag determines the format:  A1B2C3  or  #A1B2C3
	useHexSymbol: true,

//  If no alpha is defined (===undefined) when doing a conversion, the defaultAlpha
//  will be defined by RGB_Calc in the output object instance (i.e. the Array, RGBA_Color, ColorWheel_Color, CMYKA_Color, etc.)
//  If no alpha is defined (===undefined) when doing a conversion AND the defaultAlpha===undefined,
//  no alpha value at all will be passed to the output object instance;
//  this will affect the  .length  properties of Arrays.
//  Alpha values may be just about anything, including null, as used internally by your function,
//  but need to be 0.0—1.0 for proper toString() operation of  …A_Color  Objects … read on …
//  Also, RGBA_Color, ColorWheel_Color, and CMYKA_Color  constructors   use this in a similar way.
//  With those color objects, the defaultAlpha is used for the internal alpha value.
//  However note, when those objects output a string, and string format requires an alpha value
//  and none is found to be  numeric  a default value of 100% is used.
	defaultAlpha: undefined,

//  You may want to create your own Class constructor for any of these 12 Factories below
//   or use ony of the  …A_Color  Objects defined below.
//  The RGB_Calc.ConfigStack child-class redefines these for auditing calculators,
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
// You may want to use the  …A_Array  classes below for any of these 3 factories below
//  they have conversion functions baked into thier prototype.
	XYZA_Factory: Array,
	LabA_Factory: Array,
	LChA_Factory: Array,
/*
 *The 12 factory pointers (above) control the output of the “quick” RGB_Calc–functions and its instances;
 * these are by default superceded by xxxA_Color Objects for Auditing Calculators and conversion functions in xxxA_Color Object instances.
 *
 * //this example provides a quick calculator that returns RGB output as an RGBA_Color object instance, instead of the default simple array of values:
 * myCalc=new SoftMoon.WebWare.RGB_Calc({RGBA_Factory:SoftMoon.WebWare.RGBA_Color, true});
 *
 * //this example provides a calculator that returns an RGBA_Color object instance that outputs hex using the # symbol, regardless of the universal default:
 * myCalc=new SoftMoon.WebWare.RGB_Calc;
 * myCalc.config.RGBA_Factory=function(r,g,b,a)  {return new SoftMoon.WebWare.RGBA_Color(r,g,b,a,{useHexSymbol:true})};
 */

//World Wide Web Consortium↓   ↓IEC…Wikipedia……¡ ONLY for XYZ→sRGB, NOT for sRGB→XYZ !
	illuminant: "D65",  // D65 ‖ D65_2003 ‖ D65_classic ‖ D50_Lindbloom ‖ D65_Lindbloom ‖ D65_Wickline   ←XYZ conversions
	colorProfile: 'sRGB'  //  ←for RGB—XYZ conversions
};

Object.defineProperties( ConfigStack.prototype, {
	name: {value:"RGB_Calc.ConfigStack"},
	constructor: {value:ConfigStack},
	stack: { value: function($newConfig) {
			return this.owner.config=Object.create(this, $newConfig);  }  },
	cull: { value: function() {
			if (!this.hasOwnProperty("owner"))  this.owner.config=Object.getPrototypeOf(this);
			return this.owner.config;  }  },
	reset: { value: function() {
			while (!this.owner.config.hasOwnProperty("owner"))  {
				this.owner.config=Object.getPrototypeOf(this.owner.config);  }
			return this.owner.config;  }  }  } );

// http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html#Specifications
const colorProfiles={
												// gamma values     we only have a “standard” matrix for D65 right now… but D50_Lindbloom is our D50 standard stand-in
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
	"Wide Gamut RGB":   {γCorrection: 2.2, illuminant: 'D50'},  // D50_Lindbloom  //wikipedia says γCorrection=563/256, or 2.19921875
	"sRGB":             {γCorrection: "≈2.2", illuminant: 'D65'}  //←gamma-correction is done using another method for sRGB
};
Object.deepFreeze(colorProfiles);










function unenumerate(a)  {for (const p of a)  p.enumerable=false;}

// useful for rgb→xyz conversions
class RGBA_Array extends Array {
	constructor($r, $g, $b, $a, profile)  {
		super($r, $g, $b, $a);
		if (profile) this.profile=profile;  }  }
RGBA_Array.prototype.profile='sRGB';

/*
	This is meant to be a universal object that can be
	 compatibly passed through different libraries without hassle………♪♫ hopefully ♫♪ ☻☺☻☺ ♦♥♣♠♂♀ ☺☻☺☻
*/
class RGBA_Color extends Array {
	constructor($r, $g, $b, $a, $config, profile='sRGB')  {
		if (!new.target)  throw new Error('SoftMoon.WebWare.RGBA_Color is a constructor, not a function.');
		super(4);
		this.config= new RGBA_Color.ConfigStack(this, $config);
		const
			thisClr=this,
			rgb=new Array(3),
			def=[  //we need another filter if this color-space bit-depth is not “byte”
			 {get: ()=>$r,  set: $red=>$r=thisClr.getByte($red),  enumerable: true},
			 {get: ()=>$g,  set: $grn=>$g=thisClr.getByte($grn),  enumerable: true},
			 {get: ()=>$b,  set: $blu=>$b=thisClr.getByte($blu),  enumerable: true},
			 {get: ()=>$a,  set: $alf=>$a=thisClr.getAlpha($alf),  enumerable: true} ];
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
			if (typeof $arr[3] === 'number')  $a=thisClr.getByte($arr[3]);
			else  $a=thisClr.config.defaultAlpha;  }
		unenumerate(def);
		Object.defineProperties(this, {
			profile: {value:profile},
			rgb:  {get: ()=>rgb,  set: readArr},
			rgba: {get: ()=>[$r,$g,$b,$a], set: readArr},
			r:    def[0],
			g:    def[1],
			b:    def[2],
			a:    def[3],
			o:     def[3],
			red:   def[0],
			grn:   def[1],
			blu:   def[2],
			green: def[1],
			blue:  def[2],
			alpha: def[3],
			opacity: def[3],
			hex: {get: function() { return (thisClr.config.useHexSymbol ? '#':"") + Math._2hex($r)+Math._2hex($g)+Math._2hex($b) +
								((typeof $a === 'number')  ?  Math._2hex($a*255) : "");  },
						set: function($h) { if ($h=$h.match(RegExp.hex_a))  {
								$r=parseInt($h[3], 16);  $g=parseInt($h[4], 16);  $b=parseInt($h[5], 16);
								if ($h[6])  $a=parseInt($h[6], 16)/255;  }  }},
			luminance: {get: luminance.bind(this, this)},
			contrast: {get: contrastRGB.bind(this, this)},
			shade: {get: shadeRGB.bind(this, this)},
			to: {value: Object.defineProperties(new Object, {
				hsv:  {get:  toHSV.bind(this, this),  enumerable: true},
				hsb:  {get:  toHSB.bind(this, this),  enumerable: true},
				hsl:  {get:  toHSL.bind(this, this),  enumerable: true},
				hcg:  {get:  toHCG.bind(this, this),  enumerable: true},
				cmyk: {get: toCMYK.bind(this, this),  enumerable: true},
				oklab:{get:toOKLab.bind(this, this),  enumerable: true},
				oklch:{get:toOKLCh.bind(this, this),  enumerable: true},
				xyz:  {get:  toXYZ.bind(this, this),  enumerable: true}  })}  });  }

	useHexSymbol(flag=true)  {this.config.useHexSymbol=Boolean.eval(flag, true);  return this;}

	toString(format)  {
		if (typeof format !== 'string')  format="";
		format+= " "+this.config.stringFormat;
		var s, outAs=format.match( /hex|#|css5?|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
		if (outAs) outAs=outAs[0].toLowerCase();
		if (outAs==='hex'  ||  outAs==='#')  {
			const sym=format.match(/!#|#/);
			if (sym)  this.config.stack({useHexSymbol: {value:(sym[0]==='#')}});
			try {return this.hex;}
			finally {if (sym) this.config.cull();}  }
		const
			hasCom=format.match(/cvs|commas/i),
			hasPln=format.match(/plain/i),
			hasByt=format.match(/byte/i),
			hasFac=format.match(/factor/i),
			hasPer=format.match(/percent/i),
			plain= outAs==='css5'  ||  (outAs!=='tabbed'  &&
				(hasPln  &&  outAs!=='css' &&  (!hasCom  ||  hasPln.index < hasCom.index))),
			sep= (outAs==='tabbed') ? "\t" : (plain ? " " : ", "),
			aSep= plain ? ' / ' : sep,
			alpha= (typeof this.a === 'number'
							||  ( ( /alpha/i ).test(format)                                        //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this.alpha= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) ))  ?  'A' : "";
		if (hasPer
		&&  (!hasByt  ||  (hasPer.index < hasByt.index))
		&&  (!hasFac  ||  (hasPer.index < hasFac.index)))
			s=Math.roundTo(1, this.r/2.55)+'%'+ sep +
				Math.roundTo(1, this.g/2.55)+'%'+ sep +
				Math.roundTo(1, this.b/2.55)+'%'+
				(alpha  &&  (aSep+Math.roundTo(3, this.alpha*100)+'%'));
		else
		if (!outAs.startsWith('css')  &&  outAs!=='html'
		&&  hasFac
		&&  (!hasByt  ||  (hasFac.index < hasByt.index)))
			s=Math.roundTo(3, this.r/255)+ sep +
				Math.roundTo(3, this.g/255)+ sep +
				Math.roundTo(3, this.b/255)+
				(alpha  &&  (aSep+Math.roundTo(3, this.alpha)));
		else
			s=Math.round(this.r)+ sep +
				Math.round(this.g)+ sep +
				Math.round(this.b)+
				(alpha  &&  (aSep+
							((hasFac  &&  (!hasPer  ||  hasFac.index < hasPer.index)) ?
									Math.roundTo(3, this.alpha)
								: Math.roundTo(1, this.alpha*100)+'%')));
		switch (outAs)  {
		case 'css5':  alpha="";
		case 'css':
		case 'html':
		case 'wrap':
		case 'function':  return 'RGB'+alpha+'('+s+')';
		case 'prefix':    return 'RGB'+alpha+': '+s;
		case 'csv':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return 'RGBA_Color: ('+s+')';  }  }  }


SoftMoon.WebWare.RGBA_Color=RGBA_Color;

Object.defineProperties(RGBA_Color.prototype, {
		model: {value:'RGB'},
		getByte: {value: getByteValue},
		getAlpha: {value: getAlphaFactor}  });


RGBA_Color.ConfigStack=class extends ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
RGBA_Color.ConfigStack.prototype.name='RGBA_Color.ConfigStack';
RGBA_Color.ConfigStack.prototype.stringFormat='self';
// see more additions to this prototye below…


class CMYKA_Color extends Array  {
	constructor($C, $M, $Y, $K, $A, $config)  {
		if (!new.target)  throw new Error('SoftMoon.WebWare.CMYKA_Color is a constructor, not a function.');
		super(5);
		this.config= new CMYKA_Color.ConfigStack(this, $config);
		const
			thisClr=this,
			def=[
				{get: ()=>$C,  set: ($c)=>$C=thisClr.getFactor($c),  enumerable: true},
				{get: ()=>$M,  set: ($m)=>$M=thisClr.getFactor($m),  enumerable: true},
				{get: ()=>$Y,  set: ($y)=>$Y=thisClr.getFactor($y),  enumerable: true},
				{get: ()=>$K,  set: ($k)=>$K=thisClr.getFactor($k),  enumerable: true},
				{get: ()=>$A,  set: ($a)=>$A=thisClr.getAlpha($a),  enumerable: true} ];
		Object.defineProperties(this, {
			0: def[0],
			1: def[1],
			2: def[2],
			3: def[3],
			4: def[4] });
		function readArr($arr)  { $C=thisClr.getFactor($arr[0]);  $M=thisClr.getFactor($arr[1]);  $Y=thisClr.getFactor($arr[2]);  $K=thisClr.getFactor($arr[3]);
			if (typeof $arr[4] === 'number')  $A=thisClr.getAlpha($arr[4]);
			else  $A=thisClr.config.defaultAlpha;  }
		unenumerate(def);
		Object.defineProperties(this, {
			cmyka: {get: ()=>[$C,$M,$Y,$K,$A],  set: readArr},
			c: def[0],
			m: def[1],
			y: def[2],
			k: def[3],
			a: def[4],
			o: def[4],
			cyan:    def[0],
			magenta: def[1],
			yellow:  def[2],
			black:   def[3],
			alpha:   def[4],
			opacity: def[4],
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  fromCMYK.bind(this, this),  enumerable: true})}  });  }

	toString(format) {
		if (typeof format != 'string')  format="";
		format+= " "+this.config.stringFormat;
		var outAs=format.match( /css5?|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
		if (outAs)  outAs=outAs[0].toLowerCase();
		const
			hasCom=format.match(/cvs|commas/i),
			hasPln=format.match(/plain/i),
			hasFac=format.match(/factor/i),
			hasPer=format.match(/percent/i),
			plain= outAs==='css5'  ||  (outAs!=='tabbed'  &&
				(hasPln  &&  outAs!=='css' &&  (!hasCom  ||  hasPln.index < hasCom.index))),
			sep= (outAs==='tabbed') ? "\t" : (plain ? " " : ", "),
			aSep= plain ? ' / ' : sep,
			alpha= (typeof this.a === 'number'
							||  ( ( /alpha/i ).test(format)                                    //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this.a= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) ))  ?  'A' : "",
			s= (!outAs.startsWith('css')  &&  outAs!=='html'  &&  hasFac  &&  (!hasPer  ||  hasFac.index < hasPer.index)) ?
				(Math.roundTo(3, this.c)+ sep +Math.roundTo(3, this.m)+ sep +Math.roundTo(3, this.y)+ sep +Math.roundTo(3, this.k) +
					(alpha && (aSep+Math.roundTo(3, this.a))))
			: (Math.roundTo(1, this.c*100)+'%'+ sep +Math.roundTo(1, this.m*100)+'%'+ sep +Math.roundTo(1, this.y*100)+'%'+ sep +Math.roundTo(1, this.k*100)+'%' +
					(alpha && (aSep+Math.roundTo(1, this.a*100)+'%')));
		switch (outAs)  {
		case 'css5': alpha="";
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
		default:  return 'CMYKA_Color: ('+s+')';  }  }  }

Object.defineProperties(CMYKA_Color.prototype, {
		model: {value:'CMYK'},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		outputRGB: {value: outputRGB} });

SoftMoon.WebWare.CMYKA_Color=CMYKA_Color;

CMYKA_Color.ConfigStack=class extends ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
CMYKA_Color.ConfigStack.prototype.name='CMYKA_Color.ConfigStack';
CMYKA_Color.ConfigStack.prototype.stringFormat="self";
CMYKA_Color.ConfigStack.prototype.inputAsFactor=true;  //values are stored internally and returned as factors; we want to match that.
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


class ColorWheel_Color extends Array {
	static hueUnitPrecision=hueUnitPrecision;  //for external references

	constructor($config)  { //this way is called by the child-Classes
		if (!new.target)  throw new Error('ColorWheel_Color is a SuperClass constructor, not a function.');
		if (new.target===ColorWheel_Color)  throw new Error('ColorWheel_Color is a SuperClass constructor only; you can not create simple instances of it.');
		super(4);
		this.config= new ColorWheel_Color.ConfigStack(this, $config);  }

	toString(format)  {
		if (typeof format !== 'string')  format="";
		format+= " "+this.config.stringFormat;
		var s,
			outAs=format.match( /css5?|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i ),
			u=format.match( /deg|°|g?rad|ᴿ|ᶜ|ᵍ|%|turn|●|factor/ ),
			hueAngleUnit= u ? u[0] : this.config.hueAngleUnit,
			useSym=this.config.useAngleUnitSymbol,
			alpha= (typeof this.alpha === 'number'
							||  ( ( /alpha/i ).test(format)                                       //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this.alpha= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) ))  ?  'A' : "";
		if (outAs)  outAs=outAs[0].toLowerCase();
		if (outAs==='html')  outAs='css5';
		const
			model=this.model,
			isNewModel=['HWB', 'OKLCh', 'LCh'].includes(model),
			isNewStndrd=outAs==='css5'  ||  (isNewModel  &&  outAs==='css'),
			arr=this,
			hasCom=format.match(/cvs|commas/i),
			hasPln=format.match(/plain/i),
			hasPer=format.match(/percent/i),
			plain= isNewStndrd  ||  (outAs!=='tabbed'  &&
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
		switch (model)  {
		case 'LCh':
		case 'OKLCh':
			const
				hasNum=format.match(/numeric/i),
				numb= hasNum  &&  (!hasPer  ||  hasNum.index < hasPer.index);
			if (numb)
				s=Math.roundTo(4, this.lightness) + sep + Math.roundTo(4, this.chroma);
			else
				s=Math.roundTo(2, this.lightness*100) + '%' + sep + Math.roundTo(2, (this.chroma/this.cPer)*100) + '%';
			s+=sep + Math.roundTo(hueUnitPrecision[hueAngleUnit], this.hue*hueAngleUnitFactors[hueAngleUnit]) + hueAngleUnit + (alpha && aSep+(numb?  Math.roundTo(3, this.alpha) : (Math.roundTo(1, this.alpha*100)+'%')));
		break;
		default:
			const
				hasFac=format.match(/factor/i);
			s=Math.roundTo(hueUnitPrecision[hueAngleUnit], this.hue*hueAngleUnitFactors[hueAngleUnit]) + hueAngleUnit + sep;
			if (!outAs.startsWith('css')  &&  hasFac  &&  (!hasPer  ||  hasFac.index < hasPer.index))
				s+=Math.roundTo(3, arr[1]) + sep + Math.roundTo(3, arr[2]) + (alpha && aSep+Math.roundTo(3, this.alpha));
			else
				s+=Math.roundTo(1, arr[1]*100) + '%' + sep + Math.roundTo(1, arr[2]*100) + '%' + (alpha && aSep+Math.roundTo(1, this.alpha*100)+'%');  }
		if (isNewModel)  alpha="";  // ¡curses to the folks who de-standardized this specification!
		switch (outAs)  {
		case 'css':
		case 'css5':
		case 'wrap':
		case 'function':  return model+alpha+'('+s+')';;
		case 'prefix':    return model+alpha+': '+s
		case 'csv':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return model+'A_Color: ('+s+')';  }  }  }

Object.defineProperties(ColorWheel_Color.prototype, {
		getHue: {value: getHueFactor},
		getFactor: {value: getFactorValue},
		getAlpha: {value: getAlphaFactor},
		outputRGB: {value: outputRGB} });

SoftMoon.WebWare.ColorWheel_Color=ColorWheel_Color;

ColorWheel_Color.ConfigStack=class extends ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
ColorWheel_Color.ConfigStack.prototype.name='ColorWheel_Color.ConfigStack';
//  for (HSL, HSB, HSV, HCG, HWB, and OKLCh) ColorWheel_Color Objects,
//  depending on the Boolean status of the flag below,
//  you may output hues (via the toString() method) with a:
//   • symbol: (0° - 359.999…°)  ← but only when NOT outputting a “CSS” format
//   • textual suffix: (0deg - 359.999deg)  ← when applicable for the hue-angle-unit
//  by default (null) the hue-angle-unit is not altered.
ColorWheel_Color.ConfigStack.prototype.useAngleUnitSymbol=null;
ColorWheel_Color.ConfigStack.prototype.stringFormat="self";
ColorWheel_Color.ConfigStack.prototype.inputAsFactor=true;  //values are stored internally and returned as factors; we want to match that.
ColorWheel_Color.ConfigStack.prototype.RGBA_Factory=RGBA_Color;
ColorWheel_Color.ConfigStack.prototype.CMYKA_Factory=CMYKA_Color;  // for HSV to CMYK


class HSVA_Color extends ColorWheel_Color  {
	constructor($H,$S,$V,$A, $config, $model="HSV")  {
		$model= ((typeof $model === 'string') && ($model=$model.match( /HSV|HSB/i )) && $model[0].toUpperCase())  ||  'HSV';
		if (!new.target)  throw new Error('SoftMoon.WebWare.HSVA_Color is a constructor, not a function.');
		super($config);
		const
			thisClr=this,
			defHSVA={get: ()=>[$H,$S,$V,$A],  set: readArr},
			def=[
			 {get: ()=>$H,  set: ($h)=>$H=thisClr.getHue($h),  enumerable: true},
			 {get: ()=>$S,  set: ($s)=>$S=thisClr.getFactor($s),  enumerable: true},
			 {get: ()=>$V,  set: ($v)=>$V=thisClr.getFactor($v),  enumerable: true},
			 {get: ()=>$A,  set: ($a)=>$A=thisClr.getAlpha($a),  enumerable: true} ];
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $V=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $A=thisClr.getAlpha($arr[3]);
			else  $A=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			0: def[0],
			1: def[1],
			2: def[2],
			3: def[3]  });
		unenumerate(def);
		Object.defineProperties(this, {
			model: {value: $model},
			hsva: defHSVA,
			hsba: defHSVA,
			h: def[0],
			s: def[1],
			v: def[2],
			b: def[2],
			a: def[3],
			o: def[3],
			hue:        def[0],
			saturation: def[1],
			value:      def[2],
			brightness: def[2],
			alpha:      def[3],
			opacity:    def[3],
			to: {value: Object.defineProperties(new Object, {
				rgb:  {get: fromHSV.bind(this, this),  enumerable: true},
				cmyk: {get: HSV_to_CMYK.bind(this, this),  enumerable: true} } )}  });  }

	//this provides a static globally accessible function unrelated to the HSVA_Color class
	static to_CMYK=HSV_to_CMYK;  // ← uses ↓
	// this is NOT the config for an instance of this class!
	static config={CMYKA_Factory: CMYKA_Color};  }

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



//function HSBA_Color($H,$S,$B,$A, $config)  {return new HSVA_Color($H,$S,$B,$A, $config, "HSB");}  }
// ¿ should we simply return an HSVA_Color ↑ or ↓ create an empty wrapper for “instanceof” ?
class HSBA_Color extends HSVA_Color  {
	constructor($H,$S,$B,$A, $config)  {super($H,$S,$B,$A, $config, "HSB");}  }

SoftMoon.WebWare.HSBA_Color=HSBA_Color;



class HSLA_Color extends ColorWheel_Color  {
	constructor($H,$S,$L,$A, $config)  {
		if (!new.target)  throw new Error('SoftMoon.WebWare.HSLA_Color is a constructor, not a function.');
		super($config);
		const
			thisClr=this,
			def=[
				{get: ()=>$H,  set: ($h)=>$H=thisClr.getHue($h),  enumerable: true},
				{get: ()=>$S,  set: ($s)=>$S=thisClr.getFactor($s),  enumerable: true},
				{get: ()=>$L,  set: ($l)=>$L=thisClr.getFactor($l),  enumerable: true},
				{get: ()=>$A,  set: ($a)=>$A=thisClr.getAlpha($a),  enumerable: true} ];
		Object.defineProperties(this, {
			0: def[0],
			1: def[1],
			2: def[2],
			3: def[3]  });
		unenumerate(def);
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $S=thisClr.getFactor($arr[1]);  $L=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $A=thisClr.getAlpha($arr[3]);
			else  $A=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			model: {value: "HSL"},
			hsla: {get: ()=>[$H,$S,$L,$A],  set: readArr},
			h: def[0],
			s: def[1],
			l: def[2],
			a: def[3],
			o: def[3],
			hue:        def[0],
			saturation: def[1],
			lightness:  def[2],
			alpha:      def[3],
			opacity:    def[3],
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  fromHSL.bind(this, this),  enumerable: true})}  });  }  }

SoftMoon.WebWare.HSLA_Color=HSLA_Color;


class HCGA_Color extends ColorWheel_Color  {
	constructor($H,$C,$G,$A, $config)  {
		if (!new.target)  throw new Error('SoftMoon.WebWare.HCGA_Color is a constructor, not a function.');
		super($config);
		const
			thisClr=this,
			def=[
				{get: ()=>$H,  set: ($h)=>$H=thisClr.getHue($h),  enumerable: true},
				{get: ()=>$C,  set: ($c)=>$C=thisClr.getFactor($c),  enumerable: true},
				{get: ()=>$G,  set: ($g)=>$G=thisClr.getFactor($g),  enumerable: true},
				{get: ()=>$A,  set: ($a)=>$A=thisClr.getAlpha($a),  enumerable: true} ];
		Object.defineProperties(this, {
			0: def[0],
			1: def[1],
			2: def[2],
			3: def[3] });
		unenumerate(def);
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $C=thisClr.getFactor($arr[1]);  $G=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $A=thisClr.getAlpha($arr[3]);
			else  $A=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			model: {value: "HCG"},
			hcga: {get: ()=>[$H,$C,$G,$A],  set: readArr},
			h: def[0],
			c: def[1],
			g: def[2],
			a: def[3],
			o: def[3],
			hue:    def[0],
			chroma: def[1],
			gray:   def[2],
			alpha:  def[3],
			opacity:def[3],
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  fromHCG.bind(this, this),  enumerable: true})}  });  }  }

SoftMoon.WebWare.HCGA_Color=HCGA_Color;


class HWBA_Color extends ColorWheel_Color  {
	constructor($H,$W,$B,$A, $config)  {
		if (!new.target)  throw new Error('SoftMoon.WebWare.HWBA_Color is a constructor, not a function.');
		super($config);
		const
			thisClr=this,
			def=[
				{get: ()=>$H,  set: ($h)=>$H=thisClr.getHue($h),  enumerable: true},
				{get: ()=>$W,  set: ($w)=>$W=thisClr.getFactor($w),  enumerable: true},
				{get: ()=>$B,  set: ($b)=>$B=thisClr.getFactor($b),  enumerable: true},
				{get: ()=>$A,  set: ($a)=>$A=thisClr.getAlpha($a),  enumerable: true} ];
		Object.defineProperties(this, {
			0: def[0],
			1: def[1],
			2: def[2],
			3: def[3] });
		unenumerate(def);
		function readArr($arr)  { $H=thisClr.getHue($arr[0]);  $W=thisClr.getFactor($arr[1]);  $B=thisClr.getFactor($arr[2]);
			if (typeof $arr[3] === 'number')  $A=thisClr.getAlpha($arr[3]);
			else  $A=thisClr.config.defaultAlpha;  }
		Object.defineProperties(this, {
			model: {value: "HWB"},
			hwba: {get: ()=>[$H,$W,$B,$A],  set: readArr},
			h: def[0],
			w: def[1],
			b: def[2],
			a: def[3],
			o: def[3],
			hue:    def[0],
			white:  def[1],
			black:  def[2],
			alpha:  def[3],
			opacity:def[3],
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  fromHWB.bind(this, this),  enumerable: true})}  });  }  }

SoftMoon.WebWare.HWBA_Color=HWBA_Color;


class OKLChA_Color extends ColorWheel_Color  {
	constructor($L,$C,$H,$A, $config)  {  // 0 ≤ [$L,$H] ≤ 1     0 ≤ $C ≤ 0.5  ←(100%===0.4)
		if (!new.target)  throw new Error('SoftMoon.WebWare.OKLCh_Color is a constructor, not a function.');
		super($config);
		const
			thisClr=this,
			def=[
				{get: ()=>$L,  set: ($l)=>$L=thisClr.getFactor($l),  enumerable: true},
				{get: ()=>$C,  set: ($c)=>$C=thisClr.getAB_value($c, 0.4, 0.5),  enumerable: true},
				{get: ()=>$H,  set: ($h)=>$H=thisClr.getHue($h),  enumerable: true},
				{get: ()=>$A,  set: ($a)=>$A=thisClr.getAlpha($a),  enumerable: true} ];
		Object.defineProperties(this, {
			0: def[0],
			1: def[1],
			2: def[2],
			3: def[3] });
		function readArr($arr)  { $L=thisClr.getFactor($arr[0]);  $C=thisClr.getAB_value($arr[1], 0.4, 0.5);  $H=thisClr.getHue($arr[2]);
			if (typeof $arr[3] === 'number')  $A=thisClr.getAlpha($arr[3]);
			else  $A=thisClr.config.defaultAlpha;  }
		unenumerate(def);
		Object.defineProperties(this, {
			oklcha: {get: ()=>[$L,$C,$H,$A],  set: readArr},
			l: def[0],
			c: def[1],
			h: def[2],
			a: def[3],
			o: def[3],
			lightness: def[0],
			chroma:    def[1],
			hue:       def[2],
			alpha:     def[3],
			opacity:   def[3],
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  oklch_to_linear_srgb.bind(this, this),  enumerable: true})}  });  }  }

Object.defineProperties(OKLChA_Color.prototype, {
	model: {value: "OKLCh"},
	cPer: {value: 0.4},
	cMax: {value: 0.5},
	getAB_value: {value: getAB_value},
	outputClampedRGB: {value: outputClampedRGB} });

SoftMoon.WebWare.OKLChA_Color=OKLChA_Color;


// note that for now, all these “color Objects” end with “A_Color” so you can search for them specifically in this or other code
// with this color-space, the a-axis and the alpha conflict, so the “A_” in the postfix is a bit wierd.
class OKLabA_Color extends Array  {   // 0 ≤ [$L] ≤ 1     0 ≤ [$A,$B] ≤ 0.5
	constructor($L,$A,$B,$O, $config)  {  // note that this color-space does NOT recognize the property “a” as “alpha” as others do.  Use “o” for opacity.
		if (!new.target)  throw new Error('SoftMoon.WebWare.OKLab_Color is a constructor, not a function.');
		super(4);
		this.config= new OKLabA_Color.ConfigStack(this, $config);
		const
			thisClr=this,
			def=[
				{get: ()=>$L,  set: ($l)=>$L=thisClr.getFactor($l),  enumerable: true},
				{get: ()=>$A,  set: ($a)=>$A=thisClr.getAB_value($a, 0.4, 0.5),  enumerable: true},
				{get: ()=>$B,  set: ($b)=>$B=thisClr.getAB_value($b, 0.4, 0.5),  enumerable: true},
				{get: ()=>$O,  set: ($o)=>$O=thisClr.getAlpha($o),  enumerable: true} ];
		Object.defineProperties(this, {
			0: def[0],
			1: def[1],
			2: def[2],
			3: def[3] });
		function readArr($arr)  { $L=thisClr.getFactor($arr[0]);  $A=thisClr.getAB_value($arr[1], 0.4, 0.5);  $B=thisClr.getAB_value($arr[2]);
			if (typeof $arr[3] === 'number')  $O=thisClr.getAlpha($arr[3]);
			else  $O=thisClr.config.defaultAlpha;  }
		unenumerate(def);
		Object.defineProperties(this, {
			model: {value: "OKLab"},
			oklaba: {get: ()=>[$L,$A,$B,$O],  set: readArr},
			l: def[0],
			a: def[1],
			b: def[2],
			o: def[3],
			lightness: def[0],
			a_axis:    def[1],
			b_axis:    def[2],
			alpha:     def[3],
			opacity:   def[3],
			to: {value: Object.defineProperty(new Object,
				'rgb',  {get:  oklab_to_linear_srgb.bind(this, this),  enumerable: true})}  });  };

	toString(format)  {
		if (typeof format != 'string')  format="";
		format+= " "+this.config.stringFormat;
		var outAs=format.match( /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
		if (outAs)  outAs=outAs[0].toLowerCase();
		const
			hasCom=format.match(/cvs|commas/i),
			hasPln=format.match(/plain/i),    //this is default
			hasNum=format.match(/numeric/i),
			hasPer=format.match(/percent/i),  //this is default
			commas= hasCom  &&  outAs!=='css'  &&  outAs!=='tabbed'  &&  (!hasPln  ||  hasCom.index < hasPln.index),
			sep= (outAs==='tabbed') ? "\t" : (commas ? ", " : " "),
			alpha= (typeof this.alpha === 'number'
							||  ( ( /alpha/i ).test(format)                                       //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this.alpha= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) )),
			s= (hasNum  &&  (!hasPer  ||  hasNum.index < hasPer.index)) ?
				(Math.roundTo(4, this.lightness)+sep+Math.roundTo(4, this.a_axis)+sep+Math.roundTo(4, this.b_axis)+
					(alpha && (commas?sep:' / ')+Math.roundTo(3, this.alpha)  ||  ""))
			: (Math.roundTo(2, this.lightness*100)+'%'+sep+Math.roundTo(2, (this.a_axis/this.abPer)*100)+'%'+sep+Math.roundTo(2, (this.b_axis/this.abPer)*100)+'%'+
					(alpha && (commas?sep:' / ')+Math.roundTo(1, this.alpha*100)+'%'  ||  ""));
		switch (outAs)  {
		case 'css':
		case 'html':
		case 'wrap':
		case 'function':  return this.model+'('+s+')';
		case 'prefix':    return this.model+': '+s;
		case 'csv':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return this.model+'A_Color: ('+s+')';  }  }  }

Object.defineProperties(OKLabA_Color.prototype, {
	getFactor: {value: getFactorValue},
	getAB_value: {value: getAB_value},
	abPer: {value: 0.4},
	abMax: {value: 0.5},
	getAlpha: {value: getAlphaFactor},
	outputRGB: {value: outputRGB},
	outputClampedRGB: {value: outputClampedRGB} });

SoftMoon.WebWare.OKLabA_Color=OKLabA_Color;

OKLabA_Color.ConfigStack=class extends ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
OKLabA_Color.ConfigStack.prototype.name='OKLabA_Color.ConfigStack';
OKLabA_Color.ConfigStack.prototype.stringFormat="self";
OKLabA_Color.ConfigStack.prototype.inputAsFactor=true;  //values are stored internally and returned as factors; we want to match that.
OKLabA_Color.ConfigStack.prototype.RGBA_Factory=RGBA_Color;


class LabA_Array extends Array  {// 0 ≤ l ≤ 100   --170 ≤ (a,b) ≤ 170+  (100%=125)
	constructor(L,a,b,A)  {
		if (A===undefined)  super(L,a,b);
		else  super(L,a,b,A);  }

	// https://github.com/color-js/color.js/blob/main/src/spaces/lab-d65.js
	// https://github.com/color-js/color.js/blob/main/src/spaces/lab.js
	to_XYZ(factory, illuminant='D65', observer='2°')  {
		factory??=this.config.XYZA_Factory;
		const
			ε3 = 24 / 116,
			κ = 24389 / 27,  // 29^3/3^3    === 903.296296296296…
			white=XYZ_references[illuminant][observer],
			L=this[0]*100,
			$1= (L + 16) / 116,
			$0= this[1]/500 + $1,
			$2= $1 - this[2]/200,
			x= white[0] * ($0 > ε3     ?  $0**3                     : (116 * $0 - 16) / κ),
			y= white[1] * (L > 8       ?  ((L + 16) / 116)**3       : L / κ),
			z= white[2] * ($2 > ε3     ?  $2**3                     : (116 * $2 - 16) / κ);
		return new factory(x, y, z, this[3], illuminant, observer);  }

  // https://github.com/color-js/color.js/blob/main/src/spaces/lch.js
	to_LCh(factory)  {
		factory??=this.config.LChA_Factory;
		const
			[L, a, b, A] = this,
			ε = 0.02;
		let hue;
		if (Math.abs(a) < ε  &&  Math.abs(b) < ε)
			hue = 1;
		else
			hue = Math.rad(Math.atan2(b, a))/π2;
		const C=Math.sqrt(a ** 2 + b ** 2); // Chroma
		if (C<0.0001)  hue=1; // added by SoftMoon-WebWare
		return (A===undefined) ? new factory(L, C, hue) : new factory(L, C, hue, A);	}  }

Object.defineProperties(LabA_Array.prototype, {
	model: {value: 'Lab'} });

class LabA_Color extends LabA_Array  {
	constructor(L,a,b,A, $config)  {
		super(L,a,b,A);
		this.config= new LabA_Color.ConfigStack(this, $config);
		const def=[
			{get: ()=>this[0], set: (L)=>this[0]=L},
			{get: ()=>this[1], set: (a)=>this[1]=a},
			{get: ()=>this[2], set: (b)=>this[2]=b},
			{get: ()=>this[3], set: (A)=>this[3]=A} ];
		Object.defineProperties(this, {
			l: def[0],
			a: def[1],
			b: def[2],
			o: def[3],
			lightness: def[0],
			a_axis: def[1],
			b_axis: def[2],
			alpha:   def[3],
			opacity: def[3] });  }  }
Object.defineProperties(LabA_Color.prototype, {
	toString: {value:OKLabA_Color.prototype.toString},
	abPer: {value: 125},
	abMax: {value: 170} });

SoftMoon.WebWare.LabA_Array=LabA_Array;
SoftMoon.WebWare.LabA_Color=LabA_Color;

LabA_Color.ConfigStack=class extends ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
LabA_Color.ConfigStack.prototype.name='LabA_Color.ConfigStack';
LabA_Color.ConfigStack.prototype.stringFormat="self";
/*  see below…
Object.defineProperties(LabA_Array.prototype, {
	config: {value: {XYZA_Factory:XYZA_Array, LChA_Factory: LChA_Array}} });
 */


class LChA_Array extends Array  {// 0 ≤ l ≤ 100     0 ≤ h ≤ 1   0 ≤ c ≤ 230  (100%=150)
	constructor(L,C,H,A)  {
		if (A===undefined)  super(L,C,H);
		else  super(L,C,H,A);  }

	// https://github.com/color-js/color.js/blob/main/src/spaces/lch.js
	to_Lab(factory) {
		factory??=this.config.LabA_Factory;
		let [Lightness, Chroma, Hue] = this;
		// Clamp any negative Chroma
		if (Chroma < 0) Chroma = 0;
		const
			a=Chroma * Math.cos(Hue * π2),
			b=Chroma * Math.sin(Hue * π2);
		return (this[3]===undefined) ? new factory(Lightness,a,b) : new factory(Lightness,a,b,this[3]);  }  }

Object.defineProperties(LChA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(LChA_Array.prototype, {LabA_Factory: LabA_Array})},
	model: {value: 'LCh'} });

class LChA_Color extends LChA_Array  {
	constructor(L,C,H,A, $config)  {
		super(L,C,H,A);
		this.config= new LChA_Color.ConfigStack(this, $config);
		const def=[
			{get: ()=>this[0], set: (L)=>this[0]=L},
			{get: ()=>this[1], set: (C)=>this[1]=C},
			{get: ()=>this[2], set: (H)=>this[2]=H},
			{get: ()=>this[3], set: (A)=>this[3]=A} ];
		Object.defineProperties(this, {
			l: def[0],
			c: def[1],
			h: def[2],
			a: def[3],
			o: def[3],
			lightness: def[0],
			chroma: def[1],
			hue: def[2],
			alpha:   def[3],
			opacity: def[3] });  }  }
Object.defineProperties(LChA_Color.prototype, {
	toString: {value: ColorWheel_Color.prototype.toString},
	cPer: {value: 150},
	cMax: {value: 230} });

LChA_Color.ConfigStack=class extends ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
LChA_Color.ConfigStack.prototype.name='LChA_Color.ConfigStack';
LChA_Color.ConfigStack.prototype.stringFormat="self";
LChA_Color.ConfigStack.prototype.LabA_Factory=LabA_Color;

SoftMoon.WebWare.LChA_Array=LChA_Array;
SoftMoon.WebWare.LChA_Color=LChA_Color;



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

class XYZA_Array extends Array  {
	constructor(X,Y,Z,A, illuminant, observer)  {
		if (A===undefined)  super(X,Y,Z);
		else  super(X,Y,Z,A);
		Object.defineProperties(this, {
			illuminant: {value: illuminant},
			observer: {value: observer} });  }

	to_RGB(factory, roundRGB, defaultAlpha)  {
		if (factory)  this.config.RGBA_Factory=factory;
		if (roundRGB!==undefined)  this.config.roundRGB=Boolean.eval(roundRGB);
		if (arguments.length>2)  this.config.defaultAlpha=defaultAlpha;
		return fromXYZ.call(this, this, undefined, this.illuminant, this.observer);  }

	/* From the Wickline color-blind simulation algoritm:
	 * https://github.com/skratchdot/color-blind
	 *
	 * This source was copied from http://mudcu.be/sphere/js/Color.Blind.js
	 *******************(now:2019) https://galactic.ink/sphere/js/Color.Blind.js
	 *******************(now:2020) see: http://colorlab.wickline.org/colorblind/colorlab/engine.js
   */
  // see also: https://www.easyrgb.com/en/math.php
	to_xyY()  {
		const n = this[0] + this[1] + this[2];
		if (n === 0)  return {x: 0, y: 0, Y: this[1], A: this[3]};
		return {x: this[0] / n, y: this[1] / n, Y: this[1], A: this[3]};  }

	// https://github.com/color-js/color.js/blob/main/src/spaces/lab-d65.js
	// https://github.com/color-js/color.js/blob/main/src/spaces/lab.js
  // https://www.easyrgb.com/en/math.php  // ← ¿incorrect formula?
	to_Lab(factory)  {
		factory??=this.config.LabA_Factory;
		// κ * ε  = 2^3 = 8
		const                // from color.js → → from http://www.brucelindbloom.com/index.html
			ε = 216 / 24389,  // 6^3/29^3 == (24/116)^3
			κ = 24389 / 27,  // 29^3/3^3    === 903.296296296296…
			white=XYZ_references[this.illuminant.match(/^([A-F]\d*)(_.+)?$/)[1]][this.observer];
		var
			x=this[0]/white[0],
			y=this[1]/white[1],
			z=this[2]/white[2];
		x= (x>ε) ?  Math.cbrt(x) : ((κ * x + 16) / 116);  // easyrgb says (7.787 * x) + (16 / 116)
		y= (y>ε) ?  Math.cbrt(y) : ((κ * y + 16) / 116);
		z= (z>ε) ?  Math.cbrt(z) : ((κ * z + 16) / 116);
		const
			L=((116*y)-16)/100,
			a=500*(x-y),
			b=200*(y-z);
		if (this[3]===undefined)  return new factory(L,a,b);
		else  return new factory(L,a,b,this[3]);  }  }

Object.defineProperties(XYZA_Array.prototype, {
	model: {value: 'XYZ'},
	outputRGB: {value: outputRGB},
	outputClampedRGB: {value: outputClampedRGB},
	config: {writable:true, value: new ConfigStack(XYZA_Array.prototype, {roundRGB:false, defaultAlpha:undefined, colorProfile:'sRGB', RGB_bitDepth:255, RGBA_Factory: Array, LabA_Factory: LabA_Array})} });

class XYZA_Color extends XYZA_Array  {
	constructor(X,Y,Z,A, illuminant, observer, $config)  {
		super(X,Y,Z,A, illuminant, observer);
		this.config= new XYZA_Color.ConfigStack(this, $config);
		const defAlpha={get: ()=>this[3], set: (A)=>this[3]=A};
		Object.defineProperties(this, {
			x: {get: ()=>this[0], set: (X)=>this[0]=X},
			y: {get: ()=>this[1], set: (Y)=>this[1]=Y},
			z: {get: ()=>this[2], set: (Z)=>this[2]=Z},
			a: defAlpha,
			o: defAlpha,
			alpha:   defAlpha,
			opacity: defAlpha });  }

	toString(format)  {
		if (typeof format != 'string')  format="";
		format+= " "+this.config.stringFormat;
		var outAs=format.match( /css|html|wrap|function|prefix|csv|commas|plain|tabbed|self/i );
		if (outAs)  outAs=outAs[0].toLowerCase();
		const
			hasCom=format.match(/cvs|commas/i),
			hasPln=format.match(/plain/i),    //this is default
			commas= hasCom  &&  outAs!=='css'  &&  outAs!=='tabbed'  &&  (!hasPln  ||  hasCom.index < hasPln.index),
			sep= (outAs==='tabbed') ? "\t" : (commas ? ", " : " "),
			alpha= (typeof this[3] === 'number'
							||  ( ( /alpha/i ).test(format)                                    //  ↓↓ may be ===0   … so …     ↓↓
									&&  ((this[3]= (typeof this.config.defaultAlpha === 'number') ? this.config.defaultAlpha : 1),true) ));
			/*
			 * note that Bruce Lindbloom uses 7-decimal precision in his matrixes to/from sRGB
			 * we MAY have to increase the precision below when we break into P3 and Wide-Gamut
			 */
		var s=Math.roundTo(7, this[0])+ sep +Math.roundTo(7, this[1])+ sep +Math.roundTo(7, this[2]);
		if (alpha)  {
			s+=(commas ? sep : ' / ');
			const
				hasPer=format.match('percent'),
				hasFac=format.match('factor');
			s+= (!hasFac  ||  (hasPer  &&  hasPer.index < hasFac.index)) ?
					Math.roundTo(1, this[3]*100)+'%'
				: Math.roundTo(3, this[3]);  }
		switch (outAs)  {
		case 'css':
		case 'html':
		case 'wrap':
		case 'function':  return 'XYZ('+s+')';
		case 'prefix':    return 'XYZ: '+s;
		case 'cvs':
		case 'commas':
		case 'plain':
		case 'tabbed':  return s;
		case 'self':
		default:  return 'XYZA_Color: ('+s+')';  }  }  }

SoftMoon.WebWare.XYZA_Array=XYZA_Array;
SoftMoon.WebWare.XYZA_Color=XYZA_Color;

XYZA_Color.ConfigStack=class extends ConfigStack {
	constructor($owner, $config) {super($owner, $config);}  }
XYZA_Color.ConfigStack.prototype.name='XYZA_Color.ConfigStack';
XYZA_Color.ConfigStack.prototype.stringFormat="self";
//XYZA_Color.ConfigStack.prototype.roundRBG=false;
//XYZA_Color.ConfigStack.prototype.defaultAlpha=undefined;
XYZA_Color.ConfigStack.prototype.RGBA_Factory=RGBA_Color;
XYZA_Color.ConfigStack.prototype.LabA_Factory=LabA_Color;



Object.defineProperties(LabA_Array.prototype, {
	config: {writable:true, value: new ConfigStack(LabA_Array.prototype, {XYZA_Factory:XYZA_Array, LChA_Factory: LChA_Array})} });
LabA_Color.ConfigStack.prototype.XYZA_Factory=XYZA_Color;
LabA_Color.ConfigStack.prototype.LChA_Factory=LChA_Color;

// ↑↓ ¡Yet another example of “classes” making the codebase harder to follow and read and maintain!

//  You may want to use  Array  or create your own Class constructor for any of these 11 Factories below
RGBA_Color.ConfigStack.prototype.HSLA_Factory= HSLA_Color,
RGBA_Color.ConfigStack.prototype.HSBA_Factory= HSBA_Color,
RGBA_Color.ConfigStack.prototype.HSVA_Factory= HSVA_Color,
RGBA_Color.ConfigStack.prototype.HWBA_Factory= HWBA_Color,
RGBA_Color.ConfigStack.prototype.HCGA_Factory= HCGA_Color,
RGBA_Color.ConfigStack.prototype.CMYKA_Factory= CMYKA_Color,
// The _Color-classes below have simple (and thus quicker to construct) Array-based superclasses with the conversion functions prototyped in
//  and you may want to use any of those for the factories below: LabA_Array  LChA_Array  OKLabA_Array  OKLChA_Array  XYZA_Array
RGBA_Color.ConfigStack.prototype.LabA_Factory=   LabA_Color,
RGBA_Color.ConfigStack.prototype.LChA_Factory=   LChA_Color;
RGBA_Color.ConfigStack.prototype.OKLabA_Factory= OKLabA_Color,
RGBA_Color.ConfigStack.prototype.OKLChA_Factory= OKLChA_Color;
RGBA_Color.ConfigStack.prototype.XYZA_Factory= XYZA_Color;
/*
 *The 11 factory pointers (above) control the output of the RGBA_Color instance conversion functions.
 */


// if only classes were hoisted…
// the promise of “cleaner code” was shattered and this codebase organization scattered (it was already hard to organize without extensive scrolling to follow the code flow)
// when we moved to “classes” to extend the Array interface.
// Ideally, this would be declared a “static” function in the ColorWheel_Color class, but it references the child-classes that reference the parent…
Object.defineProperty(ColorWheel_Color, 'create', {enumerable: true,
	value: function($_0, $_1, $_2, $A, $config, $model)  { //this way is called by external code; it releases the names of the individual _Color objects
		switch ($model.toUpperCase())  {
		case 'HSL': return new HSLA_Color(...arguments);
		case 'HSB': return new HSBA_Color(...arguments);
		case 'HSV': return new HSVA_Color(...arguments);
		case 'HCG': return new HCGA_Color(...arguments);
		case 'HWB': return new HWBA_Color(...arguments);
		case 'LCH': return new LChA_Color($_2, $_1, $_0, $A, $config, $model);  // ←this only borrows from the ColorWheelColor prototype
		case 'OKLCH': return new OKLChA_Color($_2, $_1, $_0, $A, $config, $model);
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
								return calc.config.onError($string, undefined, MSG_noAddOnAlpha);
							matches=calc(matches);  }
						finally {calc.config.cull();}
						if (matches)  {
							matches.palette=SoftMoon.defaultPalette;
							matches.colorName=pClr;
							if (pClr[2])  matches=calc.applyAlpha(matches, calc.getAlpha(pClr[2]), 'Palette color');  }
						return matches;  }
					if (matches=($string.match(RegExp.stdWrappedColor)  ||  $string.match(RegExp.stdPrefixedColor)))  {
						matches[1]=matches[1].trim().toLowerCase();
						if (typeof calc.from[matches[1]] === 'function')
							return calc.from[matches[1]](matches[2]);
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
						try {return luminance(calc(color));}
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

	Object.defineProperties(calc, {
		config: {enumerable: true,  writable: true, configurable: true,   value: new RGB_Calc.definer[$quickCalc ? 'quick' : 'audit'].ConfigStack(calc, $config)},
		to:     {enumerable: true,  value: Object.create(calc, !$mini && RGB_Calc.definer[$quickCalc ? 'quick' : 'audit'].to)},
		from:   {enumerable: true,  value: Object.create(calc, !$mini && RGB_Calc.definer[$quickCalc ? 'quick' : 'audit'].from)}  });
	if ($mini)  {
		if ($mini.to)  for (const p of $mini.to)  {
			Object.defineProperty(calc.to,  p,  RGB_Calc.definer[$quickCalc ? 'quick' : 'audit'].to[p]);  }
		if ($mini.from)  for (const p of $mini.from)  {
			Object.defineProperty(calc.from,  p,  RGB_Calc.definer[$quickCalc ? 'quick' : 'audit'].from[p]);  }  }

	return calc;  }




//===============================================================


//===============================================================

const
	defProps1={  // these are worker methods of a calculator & a ColorFactory
		getByte:     {value: getByteValue},
		getFactor:   {value: getFactorValue},
		getAB_value: {value: getAB_value},  // for OKLab & OKLCh & Lab & LCh
		getHueFactor:{value: getHueFactor},
		getAlpha:    {value: getAlphaFactor},
		factorize:   {value: factorize},
		applyAlpha:  {value: applyAlpha} },
	defProps2={  // these are worker methods of a calculator
		multiplyAddOnAlpha: {value: multiplyAddOnAlpha},
		convertColor:{value: convertColor}  /*for plug-ins*/
	};
Object.defineProperties(RGB_Calc, defProps1);
Object.defineProperties(RGB_Calc.prototype, defProps1);
Object.defineProperties(RGB_Calc, defProps2);
Object.defineProperties(RGB_Calc.prototype, defProps2);


//you may add to these …but replacing them altogether does nothing…
RGB_Calc.colorProfiles=colorProfiles;
RGB_Calc.hueAngleUnitFactors=hueAngleUnitFactors;

RGB_Calc.outputRGB=
RGB_Calc.prototype.outputRGB= outputRGB;
RGB_Calc.outputClampedRGB=
RGB_Calc.prototype.outputClampedRGB= outputClampedRGB;


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
		A= (rgba[3]===undefined) ? 1 : rgba[3],
		R=(rgba[0]/255)*A,
		G=(rgba[1]/255)*A,
		B=(rgba[2]/255)*A;
	return ( 0.2126 * (R<0.04045 ? (R/12.92) : (((R+0.055)/1.055) ** 2.4))
				 + 0.7152 * (G<0.04045 ? (G/12.92) : (((G+0.055)/1.055) ** 2.4))
				 + 0.0722 * (B<0.04045 ? (B/12.92) : (((B+0.055)/1.055) ** 2.4)) );  }

RGB_Calc.contrastRatio=
RGB_Calc.prototype.conrastRatio=contrastRatio;
//  https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
function contrastRatio(fore, back)  {
	const
		L2=luminance(back),
		T= (fore[3]===undefined) ? 0 : (1-fore[3]),
		L1=luminance(fore)+T*L2;
	return (L1>L2) ? ((L1+0.05)/(L2+0.05)) : ((L2+0.05)/(L1+0.05));  }

//===============================================================



class Quick_ConfigStack extends ConfigStack  {
	constructor($owner, $config) {super($owner, $config);}  }
Quick_ConfigStack.prototype.name='Quick RGB_Calc.ConfigStack';


class Audit_ConfigStack extends ConfigStack  {
	constructor($owner, $config) {super($owner, $config);}  }

const ACS_props={
	name: 'Auditing RGB_Calc.ConfigStack',

	inputShortHex: false,

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
	resetConfigStackOnThrownError: false,

//  You may want to use  Array  or create your own Class constructor for any of these 12 Factories below
	RGBA_Factory: RGBA_Color,
	HSLA_Factory: HSLA_Color,
	HSBA_Factory: HSBA_Color,
	HSVA_Factory: HSVA_Color,
	HWBA_Factory: HWBA_Color,
	HCGA_Factory: HCGA_Color,
	CMYKA_Factory: CMYKA_Color,
	OKLabA_Factory: OKLabA_Color,
	OKLChA_Factory: OKLChA_Color,
// You may want to use the  …A_Array  classes above for any of these 3 factories below;
//  they have the same conversion functions baked into thier prototype but are quicker and more simple.
	XYZA_Factory: XYZA_Color,
	LabA_Factory: LabA_Color,
	LChA_Factory: LChA_Color,
/*
 *The 12 factory pointers (above) control the output of the “auditing” RGB_Calc–functions and its instances.
 *
 * //this example provides an auditing calculator that returns RGB output as a simple array of values, instead of the default RGBA_Color object instance:
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
	return  (this.config.useHexSymbol ? '#' : "") + (luminance(rgb)<0.2159  ?  'FFFFFF' : '000000');  }  //  RGB(128, 128, 128) has luminance of 21.59%

RGB_Calc.to.shade=shadeRGB;
RGB_Calc.definer.quick.to.shade={value:shadeRGB};
RGB_Calc.definer.audit.to.shade={value: function() {return convertColor.call(this, arguments, shadeRGB, 'shade');}};
function shadeRGB(rgb)  { var i, min=255, max=0;
	for (i=0; i<3; i++)  {min=(rgb[i]<min) ? rgb[i] : min;   max=(rgb[i]>max) ? rgb[i] : max;}
	const f= (255-max > min) ? (255/max) : (1/min);
	return toHex.call(this, [rgb[0]*f, rgb[1]*f, rgb[2]*f]);  }


RGB_Calc.to.hex=toHex;
RGB_Calc.definer.quick.to.hex={value:toHex};
RGB_Calc.definer.audit.to.hex={value: function() {return convertColor.call(this, arguments, toHex, 'hex');}};
function toHex(rgba)  { return (this.config.useHexSymbol ? "#":'') +
	Math._2hex(rgba[0])+Math._2hex(rgba[1])+Math._2hex(rgba[2]) + (typeof rgba[3] === 'number' ?  Math._2hex(rgba[3]*255) : "");  }


RGB_Calc.to.rgb=        //these are set up as pass-throughs for automated conversion calculations: i.e.  myRGB_calc.to[myOutputModel](color_data);
RGB_Calc.to.rgba=toRGBA;
RGB_Calc.definer.quick.to.rgb=
RGB_Calc.definer.quick.to.rgba={value:toRGBA};
RGB_Calc.definer.audit.to.rgb=
RGB_Calc.definer.audit.to.rgba={value: function() {return convertColor.call(this, arguments, toRGBA, 'rgba');}};
function toRGBA(rgba)  {return this.outputRGB(rgba[0], rgba[1], rgba[2], rgba[3]);}


RGB_Calc.to.hsv=toHSV;
RGB_Calc.definer.quick.to.hsv={value:toHSV};
RGB_Calc.definer.audit.to.hsv={value: function() {return convertColor.call(this, arguments, toHSV, 'hsv');}};
function toHSV(rgb, factory, model='HSV')  {  //RGB from 0 to 255   HSV results from 0 to 1   alpha should be 0 <= a <= 1
	//note  model  is used here internally, and is not meant to be a passed parameter, unless it is "HSB"
	factory??=this.config[model+"A_Factory"];
	var H, S;
	const
	A= (typeof rgb[3] === undefined) ? this.config.defaultAlpha : rgb[3],
	R = ( rgb[0] / 255 ),
	G = ( rgb[1] / 255 ),
	B = ( rgb[2] / 255 ),
	V = Math.max( R, G, B ),
	delta_max = V - Math.min( R, G, B );

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
	R = ( rgb[0] / 255 ),
	G = ( rgb[1] / 255 ),
	B = ( rgb[2] / 255 ),

	low = Math.min( R, G, B ),
	high = Math.max( R, G, B ),
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
	r = ( rgb[0] / 255 ),
	g = ( rgb[1] / 255 ),
	b = ( rgb[2] / 255 ),
	high = Math.max( r, g, b ),
	low  = Math.min( r, g, b );

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
	else H=1;

  if (A===undefined)  return new factory(H, low, 1-high);
	else  return new factory(H, low, 1-high, A);  }


RGB_Calc.to.cmyk=toCMYK;
RGB_Calc.definer.quick.to.cmyk={value:toCMYK};
RGB_Calc.definer.audit.to.cmyk={value: function() {return convertColor.call(this, arguments, toCMYK, 'cmyk');}};
function toCMYK(rgb, factory)  {  //RGB from 0 to 255    CMYK results from 0 to 1   alpha should be 0 <= a <= 1
	factory??=this.config.CMYKA_Factory;
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
	if (A===undefined)  return new factory(C,M,Y,K);
	else  return new factory(C,M,Y,K,A);  }


RGB_Calc.to.oklab=toOKLab;
RGB_Calc.definer.quick.to.oklab={value:toOKLab};
RGB_Calc.definer.audit.to.oklab={value: function() {return convertColor.call(this, arguments, toOKLab, 'oklab');}};
function toOKLab(srgb, factory)  { //RGB from 0 to 255
	factory??=this.config.OKLabA_Factory;
	const
		lab=linear_srgb_to_oklab(srgb),
		A= (typeof srgb[3] === undefined) ? this.config.defaultAlpha : srgb[3];
	if (A===undefined)  return new factory(...lab);
	else  return new factory(...lab,A);  }

// derived from public domain: https://bottosson.github.io/posts/oklab/
// posted (¿written?) by Björn Ottosson (he created the color-space, after all)
//  ↑ referred by: https://drafts.csswg.org/css-color/#ok-lab
function linear_srgb_to_oklab(rgb)  {
  const
		r=rgb[0]/255,
		g=rgb[1]/255,
		b=rgb[2]/255,
		l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b),
		m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b),
		s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
        0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
        1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
        0.0259040371*l + 0.7827717662*m - 0.8086757660*s];  }

RGB_Calc.to.oklch=toOKLCh;
RGB_Calc.definer.quick.to.oklch={value:toOKLCh};
RGB_Calc.definer.audit.to.oklch={value: function() {return convertColor.call(this, arguments, toOKLCh, 'oklch');}};
function toOKLCh(srgb, factory)  { //RGB from 0 to 255
	factory??=this.config.OKLChA_Factory;
	const
		lab=linear_srgb_to_oklab(srgb),
		c=Math.sqrt(lab[1]**2 + lab[2]**2),
		h= (c<0.0001) ? 1 : Math.rad(Math.atan2(lab[2], lab[1]))/2/π,
		A= (typeof srgb[3] === undefined) ? this.config.defaultAlpha : srgb[3];
	if (A===undefined)  return new factory(lab[0],c,h);
	else  return new factory(lab[0],c,h,A);  }

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

const toXYZ_matrix={sRGB:{
		D65: [  // https://www.w3.org/TR/css-color-4/#color-conversion-code
			[ 506752 / 1228815,  87881 / 245763,   12673 /   70218 ],    //  0.41239079926595948128888400613599, …, …
			[  87098 /  409605, 175762 / 245763,   12673 /  175545 ],
			[   7918 /  409605,  87881 / 737289, 1001167 / 1053270 ] ],
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
	/* From the Wickline color-blind simulation algoritm:
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
			[0.019331987577444885, 0.11919267420354762, 0.9504491124870351] ] }};

toXYZ_matrix.sRGB.D50=toXYZ_matrix.sRGB.D50_Lindbloom;

toXYZ_matrix.sRGB.D50.observer=
toXYZ_matrix.sRGB.D65.observer=
toXYZ_matrix.sRGB.D65_classic.observer=
toXYZ_matrix.sRGB.D65_Lindbloom.observer=
toXYZ_matrix.sRGB.D65_Wickline.observer='2°';
Object.lock(toXYZ_matrix, 1);  // we can add properties, but not change existing ones, 1 “level” deep
Object.deepFreeze(toXYZ_matrix.sRGB.D50);
Object.deepFreeze(toXYZ_matrix.sRGB.D65);
Object.deepFreeze(toXYZ_matrix.sRGB.D65_classic);
Object.deepFreeze(toXYZ_matrix.sRGB.D65_Lindbloom);
Object.deepFreeze(toXYZ_matrix.sRGB.D65_Wickline);

RGB_Calc.to.xyz =
RGB_Calc.to.xyza = toXYZ;
RGB_Calc.definer.quick.to.xyz =
RGB_Calc.definer.quick.to.xyza = {value: toXYZ};
RGB_Calc.definer.audit.to.xyz =
RGB_Calc.definer.audit.to.xyza = {value: function(color) {return this.convertColor(color, toXYZ, 'xyz');}};
function toXYZ(rgb, factory, profile, illuminant)  {
	factory??=this.config.XYZA_Factory;
	profile=rgb.profile||profile||this.config.colorProfile;
	illuminant??= colorProfiles[profile].illuminant;
	const
		bits=this.config.RGB_bitDepth,  //sRGB=255
		M = toXYZ_matrix[profile][illuminant];
	var R = rgb[0] / bits;
	var G = rgb[1] / bits;
	var B = rgb[2] / bits;
	if (profile === 'sRGB')  {  //eats memory, but runs faster than a function…
		R = (R > 0.04045) ? Math.pow(((R + 0.055) / 1.055), 2.4) : R / 12.92;
		G = (G > 0.04045) ? Math.pow(((G + 0.055) / 1.055), 2.4) : G / 12.92;
		B = (B > 0.04045) ? Math.pow(((B + 0.055) / 1.055), 2.4) : B / 12.92;  }
	else  {  // and speed is everything here
		const γ=colorProfiles[profile].γCorrection;
		R = Math.pow(R, γ);
		G = Math.pow(G, γ);
		B = Math.pow(B, γ);  }
	const
		X=R * M[0][0] + G * M[0][1] + B * M[0][2],
		Y=R * M[1][0] + G * M[1][1] + B * M[1][2],
		Z=R * M[2][0] + G * M[2][1] + B * M[2][2];
	// note the exception to the rule here: toXYZ does NOT return 3-member arrays if A===undefined
	return new factory(X,Y,Z,rgb[3], illuminant, M.observer);  };

Object.defineProperty(toXYZ, 'matrix', {value:toXYZ_matrix});  // you may add illuminant-profiles here

RGB_Calc.to.lab =
RGB_Calc.to.laba = toLab;
RGB_Calc.definer.quick.to.lab =
RGB_Calc.definer.quick.to.laba = {value: toLab};
RGB_Calc.definer.audit.to.lab =
RGB_Calc.definer.audit.to.laba = {value: function(color) {return this.convertColor(color, toLab, 'lab');}};
function toLab(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_Lab(factory||this.config.LabA_Factory);  }

RGB_Calc.to.lch =
RGB_Calc.to.lcha = toLCh;
RGB_Calc.definer.quick.to.lch =
RGB_Calc.definer.quick.to.lcha = {value: toLCh};
RGB_Calc.definer.audit.to.lch =
RGB_Calc.definer.audit.to.lcha = {value: function(color) {return this.convertColor(color, toLCh, 'lch');}};
function toLCh(rgb, factory)  {
	return toXYZ.call(this, rgb, XYZA_Array).to_Lab(LabA_Array).to_LCh(factory||this.config.LChA_Factory);  }


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
RGB_Calc.definer.audit.from.rgb=
RGB_Calc.definer.audit.from.rgba={enumerable:true, value:fromRGBA};
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

RGB_Calc.definer.quick.from.hue={enumerable:true, value:RGB_Calc_from_hue};
RGB_Calc.definer.audit.from.hue={enumerable:true, value:function(h)  {
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

RGB_Calc.definer.quick.from.hcg=
RGB_Calc.definer.quick.from.hcga={enumerable:true, value:fromHCG};
RGB_Calc.definer.audit.from.hcg=
RGB_Calc.definer.audit.from.hcga={enumerable:true, value:function(hcg) {return (hcg=parseColorWheelColor.call(this, hcg, 'HCG'))  &&  fromHCG.call(this, hcg)}};
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


RGB_Calc.definer.quick.from.hwb=
RGB_Calc.definer.quick.from.hwba={enumerable:true, value:fromHCG};
RGB_Calc.definer.audit.from.hwb=
RGB_Calc.definer.audit.from.hwba={enumerable:true, value:function(hwb) {return (hwb=parseColorWheelColor.call(this, hwb, 'HWB'))  &&  fromHWB.call(this, hwb)}};
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



RGB_Calc.definer.quick.from.hsl=
RGB_Calc.definer.quick.from.hsla={enumerable:true, value:fromHSL};
RGB_Calc.definer.audit.from.hsl=
RGB_Calc.definer.audit.from.hsla={enumerable:true, value:function(hsl) {return (hsl=parseColorWheelColor.call(this, hsl, 'HSL'))  &&  fromHSL.call(this, hsl)}};
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
	//RGB results from 0 to 255
	return this.outputRGB(
		( 1 - cmy[0] ) * 255,
		( 1 - cmy[1] ) * 255,
		( 1 - cmy[2] ) * 255,
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
	//RGB results from 0 to 255
	return this.outputRGB(
	((1 - ( cmyk[0] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	((1 - ( cmyk[1] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	((1 - ( cmyk[2] * ( 1 - cmyk[3] ) + cmyk[3] ) ) * 255),
	cmyk[4] );  }



RGB_Calc.definer.quick.from.oklab=
RGB_Calc.definer.quick.from.oklaba={enumerable:true, value:oklab_to_linear_srgb};
RGB_Calc.definer.audit.from.oklab=
RGB_Calc.definer.audit.from.oklaba={enumerable:true, value:function($lab) {return auditLab.call(this, {factors:RegExp.oklab_factors_A, vals:RegExp.oklab_a}, 'OKLab', 0.4, 0.5, oklab_to_linear_srgb, $lab);}};

function auditLab(RE, space, abPer, abMax, callback, $lab)  {
	var matches;
	if (typeof $lab === 'string')  {
		if (matches=$lab.match(this.config.inputAsFactor ? RE.factors : RE.vals))
			$lab=matches.slice(1);
		else  return this.config.onError($lab, space);  }
	else if (this.config.preserveInputArrays)  $lab=Array.from($lab);
	$lab[0]=this.getFactor($lab[0]),
	$lab[1]=this.getAB_value($lab[1], abPer, abMax),
	$lab[2]=this.getAB_value($lab[2], abPer, abMax),
	$lab[3]=this.getAlpha($lab[3]);
	if ($lab[0]===false  ||  $lab[1]===false  ||  $lab[2]===false  ||  $lab[3]===false)  this.config.onError($lab, space);
	return callback.call(this, $lab);  };

RGB_Calc.from.oklab=
RGB_Calc.from.oklaba=oklab_to_linear_srgb;

// derived from public domain: https://bottosson.github.io/posts/oklab/
// posted (¿written?) by Björn Ottosson
//  ↑ referred by: https://drafts.csswg.org/css-color/#ok-lab
function oklab_to_linear_srgb(lab)  {  // ¿¿  l → 0.0—1.0     a,b → -0.5—0.5  ??  ← ¡seems to be correct!
  const
		l = (lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2])**3,
    m = (lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2])**3,
    s = (lab[0] - 0.0894841775 * lab[1] - 1.2914855480 * lab[2])**3;
  return this.outputClampedRGB(
		255* (+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
		255* (-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
		255* (-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
		lab[3] );  }

RGB_Calc.definer.quick.from.oklch=
RGB_Calc.definer.quick.from.oklcha={enumerable:true, value:oklch_to_linear_srgb};
RGB_Calc.definer.audit.from.oklch=
RGB_Calc.definer.audit.from.oklcha={enumerable:true, value:function($lch) {return auditLCh.call(this, {factors:RegExp.oklch_factors_A, vals:RegExp.oklch_a}, 'OKLCh', 0.4, 0.5, oklch_to_linear_srgb, $lch);}};

function auditLCh(RE, space, CPer, CMax, callback, $lch)  {
	var matches;
	if (typeof $lch == 'string')  {
		if (matches=$lch.match(this.config.inputAsFactor ? RE.factors : RE.vals))
			$lch=matches.slice(1);
		else  return this.config.onError($lch, space);  }
	else if (this.config.preserveInputArrays)  $lch=Array.from($lch);
	$lch[0]=this.getFactor($lch[0]),
	$lch[1]=this.getAB_value($lch[1], CPer, CMax),  // note the RegExp above filters out negative values
	$lch[2]=this.getHueFactor($lch[2]),
	$lch[3]=this.getAlpha($lch[3]);
	if ($lch[0]===false  ||  $lch[1]===false  ||  Number.isNaN($lch[2])  ||  $lch[3]===false)  this.config.onError($lch, space);
	return callback.call(this, $lch, false);  };

RGB_Calc.from.oklch=
RGB_Calc.from.oklcha=oklch_to_linear_srgb;

function oklch_to_linear_srgb($lch, _c_isFactor=false)  { // l,c,h → 0.0—1.0   except (not _c_isFactor) c → 0.0—0.4
	const
		_c= _c_isFactor ? $lch[1]*0.4 : $lch[1],
		_h=$lch[2]*π2;
	return oklab_to_linear_srgb.call(this, [$lch[0], _c*Math.cos(_h), _c*Math.sin(_h), $lch[3]]);  }


RGB_Calc.definer.quick.from.xyz=
RGB_Calc.definer.quick.from.xyza={enumerable:true, value:fromXYZ};
RGB_Calc.definer.audit.from.xyz=
RGB_Calc.definer.audit.from.xyza={enumerable:true, value:function(XYZ) {return (XYZ=parseXYZ(XYZ))  &&  fromXYZ.call(this, XYZ.xyz, XYZ.profile);}};

function parseXYZ(XYZ)  {
	var xyz, profile=this.config.colorProfile, illuminant;
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

RGB_Calc.from.xyz=fromXYZ;

const fromXYZ_matrix={'sRGB':{
	D65:[  // https://www.w3.org/TR/css-color-4/#color-conversion-code
		[   12831 /   3959,    -329 /    214, -1974 /   3959 ],  // ←  3.2409699419045213437736802222784 , -1.5373831775700934579439252336449 , -0.4986107602930032836574892649659
		[ -851781 / 878810, 1648619 / 878810, 36519 / 878810 ],  // … … …
		[     705 /  12673,   -2585 /  12673,   705 /    667 ] ],  // … … …
	D65_2003: [
		// https://en.wikipedia.org/wiki/SRGB  ←QUOTE: “Amendment 1 to IEC 61966-2-1:1999, approved in 2003 … also recommends a higher-precision XYZ to sRGB matrix”
		// unfortunately, Wikipedia does not show a similar matrix for RGB → XYZ
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
	/* From the Wickline color-blind simulation algoritm:
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
		[0.05563600315398933, -0.2039948802843549,  1.0570636917433989] ]}};
fromXYZ_matrix.sRGB.D65.observer= // ¡assumed!
fromXYZ_matrix.sRGB.D65_2003.observer=
fromXYZ_matrix.sRGB.D65_classic.observer=
fromXYZ_matrix.sRGB.D50_Lindbloom.observer=
fromXYZ_matrix.sRGB.D65_Lindbloom.observer=
fromXYZ_matrix.sRGB.D65_Wickline.observer='2°';
Object.lock(fromXYZ_matrix, 1);  // we can add properties, but not change existing ones, 1 “level” deep
Object.deepFreeze(fromXYZ_matrix.sRGB.D65);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65_2003);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65_classic);
Object.deepFreeze(fromXYZ_matrix.sRGB.D50_Lindbloom);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65_Lindbloom);
Object.deepFreeze(fromXYZ_matrix.sRGB.D65_Wickline);

/*
const fromXYZ_inputRanges=Object.defineProperties({}, {
  // I grabbed these before the solor-panels lost thier sun, but I forgot to document their source, and now I can not find it………
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
	profile??=this.config.colorProfile;  // ¡We only have sRGB right now!
	illuminant=xyz.illuminant||illuminant||colorProfiles[profile].illuminant;
	const
		X=xyz[0],  Y=xyz[1],  Z=xyz[2],
		M=fromXYZ_matrix[profile][illuminant],
		P=0.0031308,  // ¿ 0.00304 ?
		e=1/2.4,
		bits=this.config.RGB_bitDepth;
	var
		r = X * M[0][0]  + Y * M[0][1] + Z * M[0][2],
		g = X * M[1][0]  + Y * M[1][1] + Z * M[1][2],
		b = X * M[2][0]  + Y * M[2][1] + Z * M[2][2];
	//gamma correction
	if (profile === 'sRGB')  {
		r = (r > P) ?  1.055 * Math.pow(r, e) - 0.055  :  12.92 * r;
		g = (g > P) ?  1.055 * Math.pow(g, e) - 0.055  :  12.92 * g;
		b = (b > P) ?  1.055 * Math.pow(b, e) - 0.055  :  12.92 * b;  }
	else {
		const γ=colorProfiles[profile].γCorrection;
		r = Math.pow(r, 1/γ);
		g = Math.pow(g, 1/γ);
		b = Math.pow(b, 1/γ);  }
	return this.outputClampedRGB(r*bits, g*bits, b*bits, xyz[3]);  }

//Object.defineProperty(fromXYZ, 'inputRanges', {value:fromXYZ_inputRanges});  //←here you can add additional inputs-ranges for different illuminant matrixes

Object.defineProperty(fromXYZ, 'matrix', {value:fromXYZ_matrix});  //←here you can add additional matrixes for different illuminants


RGB_Calc.from.lab=
RGB_Calc.from.laba=fromLab;
RGB_Calc.definer.quick.from.lab=
RGB_Calc.definer.quick.from.laba={enumerable:true, value:fromLab};
RGB_Calc.definer.audit.from.lab=
RGB_Calc.definer.audit.from.laba={enumerable:true, value:function($lab) {return auditLab.call(this, {factors:RegExp.lab_factors_a, vals:RegExp.lab_a}, 'Lab', 125, 170, fromLab, $lab);}};

function fromLab(lab)  {  // 0 ≤ l ≤ 100   --170 ≤ (a,b) ≤ 170+  (100%=125)
	if (lab instanceof LabA_Array)  return lab.to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return      LabA_Array.prototype.to_XYZ.call(lab, XYZA_Array).to_RGB(this.config.RGBA_Factory);  }

RGB_Calc.from.lch=
RGB_Calc.from.lcha=fromLCh;
RGB_Calc.definer.quick.from.lch=
RGB_Calc.definer.quick.from.lcha={enumerable:true, value:fromLCh};
RGB_Calc.definer.audit.from.lch=
RGB_Calc.definer.audit.from.lcha={enumerable:true, value:function($lch) {return auditLCh.call(this, {factors:RegExp.lch_factors_a, vals:RegExp.lch_a}, 'LCh', 150, 230, fromLCh, $lch);}};

function fromLCh(lch)  {  // 0 ≤ l ≤ 100     0 ≤ h ≤ 1    0 ≤ c ≤ 230  (100%=150)
	if (lch instanceof LChA_Array)  return lch.to_Lab(LabA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);
	return      LChA_Array.prototype.to_Lab.call(lch, LabA_Array).to_XYZ(XYZA_Array).to_RGB(this.config.RGBA_Factory);  }




/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/


class ColorFactory  {
	constructor($config)  {  // ← this $config is for the class and determines how a $color input is evaluated
		this.config=new RGB_Calc.definer.audit.ConfigStack(this, $config);
		this.rgb_calc=new RGB_Calc();  //for processing palette colors by create_A_Color below
		Object.defineProperty(this.rgb_calc, 'config', {get:()=>this.config});  }

	create_A_Color($color, $config)  {  // ← this $config is for the color-object you want to create
		if ($color == null)  return null;
		if (typeof $color!=="string")  throw new TypeError('“ColorFactory.create_A_Color()” takes a string as a paramater.  Passed in:',$color);
		$config??=this.config.configWhip;
		var pClr, matches, clippedA=false;
		function returnVs($Vs) {return $Vs;}
		function rgbFact(r,g,b,a) {return new RGBA_Color(r,g,b,a, $config);}
		if (RegExp.isHex.test($color))  {
			this.config.stack({RGBA_Factory: {value:rgbFact}});
			const config=RGB_Calc.config;
			RGB_Calc.config=this.config;
			try {return RGB_Calc.from.hex($color);}
			finally {RGB_Calc.config=config;  this.config.cull();}  }
		if ((SoftMoon.palettes[SoftMoon.defaultPalette] instanceof SoftMoon.WebWare.Palette)
		&&  (pClr=$color.match(RegExp.addOnAlpha))
		&&  SoftMoon.palettes[SoftMoon.defaultPalette].getColor(pClr[1]) )  {
			this.config.stack({RGBA_Factory: {value:rgbFact}});
			try {return this.rgb_calc($color);}
			finally {this.config.cull();}  }
		if (matches=($color.match(RegExp.stdWrappedColor)  ||  $color.match(RegExp.stdPrefixedColor)))  {
			matches[1]=matches[1].trim().toUpperCase();
			if (matches[1].endsWith('A'))  {clippedA=true;  matches[1]=matches[1].slice(0,-1);}
			var _vals_;
			switch (matches[1])  {
			case 'CMY':
				_vals_=parseCMY.call(this, matches[2]);
				if (!_vals_)  return null;
			case 'RGB':
				_vals_??=matches[2];
				this.config.stack({RGBA_Factory: {value:rgbFact}});
				const config=RGB_Calc.config;
				RGB_Calc.config=this.config;
				try {return RGB_Calc.from[matches[1].toLowerCase()](_vals_);}
				finally {RGB_Calc.config=config;  this.config.cull();}
			case 'HSL':
			case 'HSB':
			case 'HSV':
			case 'HCG':
			case 'HWB':  {
				const vals=parseColorWheelColor.call(this, matches[2], matches[1]);
				if (vals)  {
					vals.length=4;
					return ColorWheel_Color.create(...vals, $config, matches[1]);  }
				return null;  }
			case 'CMYK':  {
				const vals=parseCMYK.call(this, matches[2]);
				if (vals)  {
					vals.length=5;
					return new CMYKA_Color(...vals, $config);  }
				return null;  }
			case 'LAB':  {
				const vals=auditLab.call(this, {factors:RegExp.lab_factors_a, vals:RegExp.lab_a}, 'Lab', 125, 170, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return new LabA_Color(...vals, $config);  }
				return null;  }
			case 'LCH':  {
				const vals=auditLCh.call(this, {factors:RegExp.lch_factors_a, vals:RegExp.lch_a}, 'LCh', 150, 230, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return new LChA_Color(...vals, $config);  }
				return null;  }
			case 'OKLAB':  {
				const vals=auditLab.call(this, {factors:RegExp.oklab_factors_a, vals:RegExp.oklab_a}, 'OKLab', 0.4, 0.5, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return new OKLabA_Color(...vals, $config);  }
				return null;  }
			case 'OKLCH':  {
				const vals=auditLCh.call(this, {factors:RegExp.oklch_factors_a, vals:RegExp.oklch_a}, 'OKLCh', 0.4, 0.5, returnVs, matches[2]);
				if (vals)  {
					vals.length=4;
					return new OKLChA_Color(...vals, $config);  }
				return null;  }
			case 'XYZ':  {
				const vals=parseXYZ.call(this, matches[2]);
				if (vals)  {
					if (vals.profile)  switch (vals.profile)  {
						case 'sRGB':
							this.config.stack({RGBA_Factory: {value:rgbFact}});
							const config=RGB_Calc.config;
							RGB_Calc.config=this.config;
							try {return RGB_Calc.from.xyz(vals.xyz, vals.profile);}
							finally {RGB_Calc.config=config;  this.config.cull();}
						default: return null;  }
					vals.xyz.length=4;
					const illiminant=vals.xyz.illuminant;
					return new XYZA_Color(...vals.xyz, illuminant, fromXYZ_matrix.sRGB[illuminant].observer);  }
				return null;  }  }
			if (clippedA)  matches[1]+='A';
			for (const p in SoftMoon.palettes)  {
				if (p.toUpperCase()===matches[1]  &&  (SoftMoon.palettes[p] instanceof SoftMoon.WebWare.Palette))  {
					this.config.stack({RGBA_Factory: {value:rgbFact}});
					try {return this.rgb_calc($color);}
					finally {this.config.cull();}  }  }
			return null;  }  }

	copy_A_Color($color, $model, $config) {
		// remember, all the “A_Color” classes are extensions of Array
		if (!($color instanceof Array))  throw new TypeError('“ColorFactor.copy_A_Color” can only copy Array instances.');
		$model=($color.model||$model).toUpperCase();
		$config??=this.config.configWhip;
		const
			L= ($model==='CMYK') ? 5 : 4,
			cData=$color.slice(0,L);
		cData.length=L;
		switch ($model)  {
    case 'RGB':  return new RGBA_Color(...cData, $config);
		case 'HSL':
		case 'HSB':
		case 'HSV':
		case 'HCG':
		case 'HWB':
    case 'LCH':
    case 'OKLCH':  return ColorWheelColor.create(...cData, $config, $model);
    case 'CMYK':   return new CMYKA_Color(...cData, $config);
    case 'LAB':    return new LabA_Color(...cData, $config);
    case 'OKLAB':  return new OKLabA_Color(...cData, $config);
		case 'XYZ':    return new XYZA_Color(...cData, $color.illuminant, $color.observer, $config);
		default: throw new TypeError("Unknown input color-model type for “ColorFactory.copy_A_Color()”.");  }  }

	convert_A_Color($c, $space, $factory)  {  // ← $space is ¡case-sensitive! in able to specify the type of factory
		const
			space=$space.toLowerCase(),
			model=$c.model.toLowerCase();
		if (model===space)  return $factory.from?.($c)  ||  $c;
		switch (space)  {
			case 'rgb':
				RGB_Calc.config.stack({RGBA_Factory:{value:$factory}});
				try {return RGB_Calc.from[model]($c);}
				finally {RGB_Calc.config.cull()};
			case 'lch':
			case 'lab':
				switch (model)  {
				case 'lch': return $c.to_Lab($factory);
				case 'lab': return $c.to_LCh($factory);
				case 'xyz': return (space==='lab') ? $c.to_Lab($factory) : $c.to_Lab(LabA_Array).to_LCh($factory);  }
			case 'xyz':
				switch (model)  {
				case 'lch': return $c.to_Lab(LabA_Array).to_XYZ($factory);
				case 'lab': return $c.to_XYZ($factory);  }
			case 'hsl':
			case 'hsb':
			case 'hsv':
			case 'hcg':
			case 'cmyk':
			case 'oklch':
			case 'oklab':
				RGB_Calc.config.stack({
					RGBA_Factory: {value:Array},
					[$space+'A_Factory']: {value:$factory} });
				try {return RGB_Calc.to[space](RGB_Calc.from[model]($c));}  // model==='rgb' ? $c : $c.to.rgb
				catch(e) {console.log("$c failed to convert:",$c,"to:",$space,"because:\n",e);  throw e;}
				finally {RGB_Calc.config.cull()};
			default:  throw new TypeError("Unknown input color-space type for “ColorFactory.convert_A_Color()”.");  }  }  }

// the worker methods of a calculator & ColorFactory:
Object.defineProperties(ColorFactory.prototype, defProps1); // see the RGB_Calc code above

SoftMoon.WebWare.ColorFactory=ColorFactory;
}  //close the private namespace


//  most (except hcg) thanks to, and see for more formulas:  http://www.easyrgb.com/index.php?X=MATH
//  and except hwb: https://drafts.csswg.org/css-color/#the-hwb-notation
//  and except oklab & oklch & lab & lch (see coded algorithms within for reference)

// charset: UTF-8    tab-spacing: 2
/*  “OK” (“Ottosson Krafted”) color space models  (this file was last updated October 22, 2024)
 * Copyright (c) 2021 Björn Ottosson;
 * & Copyright © 2024 Joe Golembieski, SoftMoon-WebWare
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * https://bottosson.github.io/posts/oklab/
 * https://bottosson.github.io/posts/colorpicker/
 * https://github.com/bottosson/bottosson.github.io/blob/master/misc/colorpicker/colorconversion.js
 *
 * SoftMoon-WebWare added in an “accuracyLevel” parameter,
 * supporting the concept noted by Ottosson that was not included with the actual code.
 *
 * SoftMoon-WebWare added in a “minumumChroma” parameter, to support  hue=360°  when the result is a gray-scale tone (black—to—white);
 * this also supports a fix for the “weird S value for white”.
 *
 * Minor bug fixes by SoftMoon-WebWare, one that seems might be ¿exclusive to JavaScript?
 *  • NaN (Not a Number) bugs from dividing by 0
 *  • weird S value for “white” in OKHSL
 *  • two fixes for: out-of-bounds conversions for some colors in OKHSL:
 *     ▪ clamped S →  0 ≤ S ≤ 1  but this is now commented out; we instead use the other fix:
 *     ▪ increased the accuracyLevel from 1 to 2
 *  • one fix for: out-of-bounds conversions (very slight) for some colors in OKHSV:
 *     ▪ clamped [S,V] →  0 ≤ [S,V] ≤ 1
 *
 * Known issues: many conversions REQUIRE rounding sRGB values before considering whether they are “in-gamut”.
 * High-precision is not a quality of these matrices and algorithms.
 * We are finding that rounding to 2 decimal places is good … three is bad.  Maybe we need to round to 1 decimal place?
 * RGB_Calc handles this rounding.
 *
 * Known bug: with accuracyLevel=1, OKHSV_to_RGB is not properly converting “red” (sRGB [255,0,0]) from:  OKHSV(29.23deg 100% 100%)
 * a little experimentation shows a few limits:    26.926° — 29.233° (pure red),  @ S=100%, V>99.9%
 * I looked quick, but didn’t find a reasonable way to clamp a value (in the end, we get RGB [255,-1,0] for “red”)
 * Jumping to accuracyLevel=2 fixes the problem.
 *
 * Known bug: OKHSV and OKHSL are not properly converting “blueish” hues (standard RGB angles 227°, 240°) with near 100% chroma
 * The bug seems to lie more in OKLab_to_sRGB.  We were getting final R channel values of (-1) and (-2) and (-3).
 * Now we specifically clamp the R-channel to 0 within OKLab_to_sRGB when it is just a little below 0.
 * This seems to fix the problem, hopefully not creating new ones in other hues…☻
 *
 * Minor superficial modifications by SoftMoon-WebWare for:
 *  • inclusion into the RGB_Calc package (values input as Arrays, alpha (α, opacity) channel support, etc),
 *  • optimal execution speed by JavaScript compilers,
 *  • reduced whitespace for web-transfer, while keeping a readable format (and I'm not “A.D.D.”: I like to see more of the forest through the trees on the screen at once).
 *
 * Additional color space model (OKHCG) provided by SoftMoon-WebWare
 */
//   referred by: https://drafts.csswg.org/css-color/#ok-lab


// requires  +++.js       ← ← ←  JS_toolbucket/+++JS/+++.js      by SoftMoon-WebWare
// requires  +++Math.js   ← ← ←  JS_toolbucket/+++JS/+++Math.js  by SoftMoon-WebWare

'use strict';

const Björn_Ottosson={};

{ //open a private namespace (till end-of-file)

const
				sine=Math.sin,
			cosine=Math.cos,
 arcTangent2=Math.atan2,
			radian=Math.rad,
	squareRoot=Math.sqrt,
		cubeRoot=Math.cbrt,
		 minimum=Math.min,
		 maximum=Math.max;


const SI=String.fromCharCode(15), SO=String.fromCharCode(14);
//          ASCII “shift-in” ↑         ASCII “shift-out” ↑   ← these often don’t output to the screen, but can be easily replaced with HTML tags as you wish: <abbr></abbr>  etc…

Björn_Ottosson["©"] = "“"+SI+"OK"+SO+"”-color-spaces algorithms and software copyright © 2021 by Björn Ottosson; released under public domain and " +
	SI+"MIT"+SO+" license.";

// These have modified input-parameters (by SoftMoon-WebWare) for use with RGB_Calc (Arrays instead of individual values).
// These input Arrays may also have alpha-channel (α) values, which are simply passed along.
// In addition, functions that return values other than RGB values take a  factory  parameter as the second argument.
// The factory can be  Array  or any class constructor you wish; e.g.  srgb_to_oklch(rgba, Array)  or  srgb_to_oklch(rgba, MyColorClass)
//  or a factory-function that takes the values and custom-constructs the object(s) you desire;
//  or simply a callback-function that takes the values and processes them as it likes; — your choice can make an impact on the performance of your software!
// If an alpha-channel is “undefined”, then it will not be passed to the factory (including the RGB factory that RGB_Calc uses).
// In this way, you can use  Array  as a factory, but it will not have an additional unused value, thus making it friendlier to Array methods, for (…of…), etc.
// The exception to the above rule is for XYZ values: they have meta-data (illuminant & observer) that is also included with the XYZ and alpha values themselves.
// All these functions expect to be methods (members) of an RGB_Calc class to use the keyword “this” within the functions themselves.
// In other words, the keyword “this” is NOT intended to refer to the Björn_Ottosson “namespace”.
// You could, however, provide the required methods and config-stack directly to the  Björn_Ottosson  namespace and it would become a “static-calculator” class.
Björn_Ottosson.oklab_to_srgb  =  oklab_to_srgb;
Björn_Ottosson.oklch_to_srgb  =  oklch_to_srgb;
Björn_Ottosson.srgb_to_oklab  =  srgb_to_oklab;
Björn_Ottosson.srgb_to_oklch  =  srgb_to_oklch;
Björn_Ottosson.xyz_to_oklab   =  xyz_to_oklab;
Björn_Ottosson.oklab_to_xyz   =  oklab_to_xyz;
Björn_Ottosson.okhsl_to_srgb  =  okhsl_to_srgb;
Björn_Ottosson.srgb_to_okhsl  =  srgb_to_okhsl;
Björn_Ottosson.okhsv_to_srgb  =  okhsv_to_srgb;
Björn_Ottosson.srgb_to_okhsv  =  srgb_to_okhsv;

Björn_Ottosson.okhwb_to_srgb  =  okhwb_to_srgb;
Björn_Ottosson.srgb_to_okhwb  =  srgb_to_okhwb;

Björn_Ottosson.okhcg_to_srgb  =  okhcg_to_srgb;
Björn_Ottosson.okhcg_to_okhsv =  okhcg_to_okhsv;
Björn_Ottosson.srgb_to_okhcg  =  srgb_to_okhcg;

Björn_Ottosson.okhsl_to_oklab  =  okhsl_to_srgb;  // ← you MUST supply a factory as a second argument…
Björn_Ottosson.okhsv_to_oklab  =  okhsv_to_srgb;  // ←  …or the result will be sRGB!
Björn_Ottosson.okhwb_to_oklab  =  okhwb_to_srgb;  // ←  …or the result will be sRGB!
Björn_Ottosson.okhcg_to_oklab  =  okhcg_to_srgb;  // ←  …or the result will be sRGB!

Björn_Ottosson.oklab_to_okhsl  =  srgb_to_okhsl;  // ← the array you pass in must have a “model” property:
Björn_Ottosson.oklab_to_okhsv  =  srgb_to_okhsv;  // ←  arr.model==="OKLab"  …or it will be considered sRGB!
Björn_Ottosson.oklab_to_oklch  =  srgb_to_oklch;  // ←  ↑ ↑

Björn_Ottosson.okhsv_to_okhwb  =  srgb_to_okhwb;  // ← the array you pass in must have a “model” property: arr.model==="OKHSV"  …or it will be considered sRGB!
Björn_Ottosson.okhsv_to_okhcg  =  srgb_to_okhcg;  // ← the array you pass in must have a “model” property: arr.model==="OKHSV"  …or it will be considered sRGB!

/* to use without RGB_Calc:
Björn_Ottosson.config= {
	defaultAlpha:1,
	OKLabA_Factory:Array,
	OKLChA_Factory:Array,
	OKHSVA_Factory:Array,  // ←↑↓ customized to your liking
	OKHSLA_Factory:Array,
	OKHWBA_Factory:Array,
	OKHCGA_Factory:Array,
	XYZA_Factory:Array }
Björn_Ottosson.γCorrect_linear_RGB= function(r,g,b,α) {… … …}       // ←he calls it a “transfer” function  ←↓ these should mul/div by 255 also
Björn_Ottosson.linearize_γCorrected_RGB= function(rgbα) {… … …}    // ←he calls it an “inverse-transfer” function
Björn_Ottosson.output_sRGB= function(r,g,b,α) {… … …}  //customized to your liking
*/

// ↓ In the SoftMoon-WebWare world, gray-scale tones have the exact‡ hue 360°, i.e. ALL the hues mixed! ‡(not 720°, etc.)
// Gray-scale tones (in OKLCh, OKHSV, OKHSL, OKHWB, & OKHCG) are defined within as having less Chroma than:
const minimumChroma=0.0001;
// ↑ for RGB profiles (when using OKLCh) that have a bit-depth greater than 255 per channel, this value may need to be decreased.

Björn_Ottosson.minimumChroma=minimumChroma;

// for:  compute_max_saturation()  and  find_gamut_intersection()  below…
let accuracyLevel=2;

Object.defineProperty(Björn_Ottosson, 'accuracy', {get: ()=>accuracyLevel, set: (i)=>{
	accuracyLevel= minimum(3, maximum(1, Math.round(i)));  }});


// OKLab and OKLCh are also released under public domain
function oklab_to_srgb(Labα, γCorrect=true)  {  // l → 0.0—1.0      a,b → -0.4—0.4
	const
		//hue= squareRoot(labα[1]*labα[1] + labα[2]*labα[2]))*360;
		l = (Labα[0] + 0.3963377774 * Labα[1] + 0.2158037573 * Labα[2])**3,
		m = (Labα[0] - 0.1055613458 * Labα[1] - 0.0638541728 * Labα[2])**3,
		s = (Labα[0] - 0.0894841775 * Labα[1] - 1.2914855480 * Labα[2])**3,
		r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		// here we clamp small negative numbers
		// (-0.0117647058823529 ← after gamma-correction : sRGB → -3 <= r < 0 ← when r is rounded to zero decimal places)
		// to “fix” standard-RGB hues at approx 226.95°–229.29° and 234°–240.35° (blues)
		// (OK hues approx:  263.95°–264.13°  and  264.42°–264.3° ← ¡note how the hue values reverse-direction in comparison to standard RGB hues!)
		// too drastic?  clamping them elsewhere is more drastic…and affects other color-spaces negatively
		R = (/*hue>=263.8  &&  hue<=264.5  &&*/  r>=-9.105809506465125e-4  &&  r<0) ? 0 : r,
		G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
	if (γCorrect)  return this.γCorrect_linear_RGB(R,G,B,Labα[3],'sRGB',255);
	// this function is also a worker for OKHSL & OKHSV below…
	else  return [R,G,B,Labα[3]];  }

function oklch_to_srgb(LChα, γCorrect=true)  { // l,h → 0.0—1.0   c → 0.0—0.5
	const h=LChα[2]*π2;
	return oklab_to_srgb.call(this, [LChα[0], LChα[1]*cosine(h), LChα[1]*sine(h), LChα[3]], γCorrect);  }

function srgb_to_oklab(rgbα, factory)  {  //RGB from 0 to 255
	// this function is also a worker for OKHSL & OKHSV below…
	factory??=this.config.OKLabA_Factory;
	rgbα=this.linearize_γCorrected_RGB(rgbα, 'sRGB');
	const
		l = cubeRoot(0.4122214708 * rgbα[0] + 0.5363325363 * rgbα[1] + 0.0514459929 * rgbα[2]),
		m = cubeRoot(0.2119034982 * rgbα[0] + 0.6806995451 * rgbα[1] + 0.1073969566 * rgbα[2]),
		s = cubeRoot(0.0883024619 * rgbα[0] + 0.2817188376 * rgbα[1] + 0.6299787005 * rgbα[2]),
		L = 0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
		a = 1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
		b = 0.0259040371*l + 0.7827717662*m - 0.8086757660*s,
		α = (rgbα[3]===undefined) ? this.config.defaultAlpha : rgbα[3];
	return (α===undefined) ? new factory(L,a,b) : new factory(L,a,b,α);  }

//       oklab_to_oklch
function srgb_to_oklch(rgbα, factory)  { //RGB from 0 to 255
	factory??=this.config.OKLChA_Factory;
	const
		lab= arguments[0].model==='OKLab' ? arguments[0] : srgb_to_oklab.call(this, rgbα, Array),
		C=squareRoot(lab[1]*lab[1] + lab[2]*lab[2]),
		// ↓ in the SoftMoon-WebWare world, gray-scale tones have the hue 360°, i.e. ALL the hues mixed!
		h= (C<minimumChroma) ? 1 : (radian(arcTangent2(lab[2], lab[1]))/π2),
		α= (rgbα[3] === undefined) ? this.config.defaultAlpha : rgbα[3];
	return (α===undefined) ? new factory(lab[0],C,h) : new factory(lab[0],C,h,α);  }

function xyz_to_oklab(xyzα, factory)  {
	factory??=this.config.OKLabA_Factory;
	// algorithm & matrices provided by Björn Ottosson
	// JavsScript code provided by SoftMoon-WebWare under public domain license & MIT license
	// working according to the test table at https://bottosson.github.io/posts/oklab/
	if ((xyzα.illuminant  &&  !xyzα.illuminant.startsWith("D65"))
	||  (xyzα.observer  &&  xyzα.observer!=="2°"))  {
		// ¿perhaps adaption should be outside this function for faster performance?
		// or left for convenience …
		if (xyzα instanceof SoftMoon.WebWare.XYZA_Array)
			xyzα=xyzα.adapt_illuminant("D65", "2°");
		else  {
			xyzα.illuminant??="D65";  xyzα.observer??="2°";
			xyzα=SoftMoon.WebWare.XYZA_Array.prototype.adapt_illuminant.call(xyzα, "D65", "2°");  }  }
	const
		M1=xyz_to_oklab.M1,
		M2=xyz_to_oklab.M2,
		l= cubeRoot(M1[0][0] * xyzα[0] + M1[0][1] * xyzα[1] + M1[0][2] * xyzα[2]),
		m= cubeRoot(M1[1][0] * xyzα[0] + M1[1][1] * xyzα[1] + M1[1][2] * xyzα[2]),
		s= cubeRoot(M1[2][0] * xyzα[0] + M1[2][1] * xyzα[1] + M1[2][2] * xyzα[2]),
		L= M2[0][0] * l + M2[0][1] * m + M2[0][2] * s,
		a= M2[1][0] * l + M2[1][1] * m + M2[1][2] * s,
		b= M2[2][0] * l + M2[2][1] * m + M2[2][2] * s,
		α= (xyzα[3]===undefined) ? this.config.defaultAlpha : xyzα[3];
	return (α===undefined) ?  new factory(L,a,b) : new factory(L,a,b,α);  }

// For some browsers, it may be faster to hard-code these matrices, and the calculated inverses below, into the functions;
// I chose to show my work here.  Firefox, if I understand it correctly, will automatically “hard code” these values
// into the compiled OP-code on the first iteration of calling each of these functions, especially since they are frozen (see below).
// Testing other software with Firefox & Chromium certainly shows this difference in performance:
// JS apps on Firefox have nearly native-app performance, while they are clunky and slow using Chromium.
xyz_to_oklab.M1=[
		[0.8189330101, 0.3618667424, -0.1288597137],
		[0.0329845436, 0.9293118715,  0.0361456387],
		[0.0482003018, 0.2643662691,  0.6338517070] ];
xyz_to_oklab.M2=[
		[0.2104542553,  0.7936177850, -0.0040720468],
		[1.9779984951, -2.4285922050,  0.4505937099],
		[0.0259040371,  0.7827717662, -0.8086757660] ];

function oklab_to_xyz(Labα, factory)  {
	factory??=this.config.XYZA_Factory;
	// algorithm provided by Björn Ottosson
	// JavsScript code provided by SoftMoon-WebWare under public domain license & MIT license
	// working according to the test table at https://bottosson.github.io/posts/oklab/
	const
		M1=oklab_to_xyz.M1,
		M2=oklab_to_xyz.M2,
		l= (M2[0][0] * Labα[0] + M2[0][1] * Labα[1] + M2[0][2] * Labα[2]) ** 3,
		m= (M2[1][0] * Labα[0] + M2[1][1] * Labα[1] + M2[1][2] * Labα[2]) ** 3,
		s= (M2[2][0] * Labα[0] + M2[2][1] * Labα[1] + M2[2][2] * Labα[2]) ** 3,
		α= (Labα[3]===undefined) ? this.config.defaultAlpha : Labα[3];
	return new factory(  // SoftMoon.WebWare.XYZA_Array is the preferred factory; it auto-handles the alpha-channel and meta-data
		M1[0][0] * l + M1[0][1] * m + M1[0][2] * s,
		M1[1][0] * l + M1[1][1] * m + M1[1][2] * s,
		M1[2][0] * l + M1[2][1] * m + M1[2][2] * s,
		α,  // XYZ is the only color-space that will return an undefined alpha-channel
		"D65", "2°");  }
oklab_to_xyz.M1=Math.invert_3_3_matrix(xyz_to_oklab.M1);
oklab_to_xyz.M2=Math.invert_3_3_matrix(xyz_to_oklab.M2);



//most of the rest below (except OKHWB & OKHCG code)
// is copied and overhauled for RGB_Calc & JavaScript compilers (seems it was quick-ported from C) from:
//  https://github.com/bottosson/bottosson.github.io/blob/master/misc/colorpicker/colorconversion.js

function toe(x)  {
	const
		k_1 = 0.206,
		k_2 = 0.03,
		k_3 = (1+k_1)/(1+k_2);
	return 0.5*(k_3*x - k_1 + squareRoot((k_3*x - k_1)*(k_3*x - k_1) + 4*k_2*k_3*x));  }

function toe_inv(x)  {
	const
		k_1 = 0.206,
		k_2 = 0.03,
		k_3 = (1+k_1)/(1+k_2);
	return (x*x + k_1*x)/(k_3*(x+k_2));  }


// Finds the maximum saturation possible for a given hue that fits in sRGB
// Saturation here is defined as S = C/L
// a and b must be normalized so a^2 + b^2 == 1
function compute_max_saturation(a, b)  {
	// Max saturation will be when one of r, g or b goes below zero.

	// Select different coefficients depending on which component goes below zero first
	var k0, k1, k2, k3, k4, wl, wm, ws;

	if (-1.88170328 * a - 0.80936493 * b > 1)  {
		// Red component
		k0 = +1.19086277; k1 = +1.76576728; k2 = +0.59662641; k3 = +0.75515197; k4 = +0.56771245;
		wl = +4.0767416621; wm = -3.3077115913; ws = +0.2309699292;  }
	else if (1.81444104 * a - 1.19445276 * b > 1)  {
		// Green component
		k0 = +0.73956515; k1 = -0.45954404; k2 = +0.08285427; k3 = +0.12541070; k4 = +0.14503204;
		wl = -1.2684380046; wm = +2.6097574011; ws = -0.3413193965;  }
	else  {
		// Blue component
		k0 = +1.35733652; k1 = -0.00915799; k2 = -1.15130210; k3 = -0.50559606; k4 = +0.00692167;
		wl = -0.0041960863; wm = -0.7034186147; ws = +1.7076147010;  }

	// Approximate max saturation using a polynomial:
	var S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b,
		accLev=accuracyLevel;  // see “private” variable above

		// Do one step Halley's method to get closer
		// this gives an error less than 10e6, except for some blue hues where the dS/dh is close to infinite
		// this should be sufficient for most applications, otherwise do two/three steps
	const
		k_l = +0.3963377774 * a + 0.2158037573 * b,
		k_m = -0.1055613458 * a - 0.0638541728 * b,
		k_s = -0.0894841775 * a - 1.2914855480 * b;

	while (accLev--)  {
		const
			l_ = 1 + S * k_l,
			m_ = 1 + S * k_m,
			s_ = 1 + S * k_s,

			l = l_ * l_ * l_,
			m = m_ * m_ * m_,
			s = s_ * s_ * s_,

			l_dS = 3 * k_l * l_ * l_,
			m_dS = 3 * k_m * m_ * m_,
			s_dS = 3 * k_s * s_ * s_,

			l_dS2 = 6 * k_l * k_l * l_,
			m_dS2 = 6 * k_m * k_m * m_,
			s_dS2 = 6 * k_s * k_s * s_,

			f  = wl * l     + wm * m     + ws * s,
			f1 = wl * l_dS  + wm * m_dS  + ws * s_dS,
			f2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;

		S = S - f * f1 / (f1*f1 - 0.5 * f * f2);  }

	return S;  }


function find_cusp(a, b)  {
	const
		// First, find the maximum saturation (saturation S = C/L)
		S_cusp = compute_max_saturation(a, b),

		// Convert to linear sRGB to find the first point where at least one of r,g or b >= 1:
		rgb_at_max = oklab_to_srgb([1, S_cusp * a, S_cusp * b], false),  // RGB values remain linear
		L_cusp = cubeRoot(1 / maximum(rgb_at_max[0], rgb_at_max[1], rgb_at_max[2])),
		C_cusp = L_cusp * S_cusp;

	return [ L_cusp , C_cusp ];  }


// Finds intersection of the line defined by
// L = L0 * (1 - t) + t * L1;
// C = t * C1;
// a and b must be normalized so a^2 + b^2 == 1
function find_gamut_intersection(a, b, L1, C1, L0, cusp=null)  {
	cusp??= find_cusp(a, b);  // Find the cusp of the gamut triangle

	var t,
		accLev=accuracyLevel;  // see “private” variable above

	// Find the intersection for upper and lower half separately
	if (((L1 - L0) * cusp[1] - (cusp[0] - L0) * C1) <= 0)
		// Lower half
		t = cusp[1] * L0 / (C1 * cusp[0] + cusp[1] * (L0 - L1));
	else  {
		// Upper half

		// First intersect with triangle
		t = cusp[1] * (L0 - 1) / (C1 * (cusp[0] - 1) + cusp[1] * (L0 - L1));

		// Then one step Halley's method
		const
			dL = L1 - L0,
			dC = C1,

			k_l = +0.3963377774 * a + 0.2158037573 * b,
			k_m = -0.1055613458 * a - 0.0638541728 * b,
			k_s = -0.0894841775 * a - 1.2914855480 * b,

			l_dt = dL + dC * k_l,
			m_dt = dL + dC * k_m,
			s_dt = dL + dC * k_s;


		// If higher accuracy is required, 2 or 3 iterations of the following block can be used:
		while (accLev--)  {
			const  // a slight reordering and refactoring of operations below was done for performance
				L = L0 * (1 - t) + t * L1,
				C = t * C1,

				l_ = L + C * k_l,
				m_ = L + C * k_m,
				s_ = L + C * k_s,

				l = l_ * l_ * l_,
				m = m_ * m_ * m_,
				s = s_ * s_ * s_,

				ldt = 3 * l_dt * l_ * l_,
				mdt = 3 * m_dt * m_ * m_,
				sdt = 3 * s_dt * s_ * s_,

				ldt2 = 6 * l_dt * l_dt * l_,
				mdt2 = 6 * m_dt * m_dt * m_,
				sdt2 = 6 * s_dt * s_dt * s_,

				r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1,
				r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + 0.2309699292 * sdt,
				r2 = 4.0767416621 * ldt2 - 3.3077115913 * mdt2 + 0.2309699292 * sdt2,

				g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1,
				g1 = -1.2684380046 * ldt + 2.6097574011 * mdt - 0.3413193965 * sdt,
				g2 = -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - 0.3413193965 * sdt2,

				b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s - 1,
				b1 = -0.0041960863 * ldt - 0.7034186147 * mdt + 1.7076147010 * sdt,
				b2 = -0.0041960863 * ldt2 - 0.7034186147 * mdt2 + 1.7076147010  * sdt2,

				u_r = r1 / (r1 * r1 - 0.5 * r * r2),
				u_g = g1 / (g1 * g1 - 0.5 * g * g2),
				u_b = b1 / (b1 * b1 - 0.5 * b * b2),

				t_r = u_r >= 0 ? (-r * u_r) : 10e5,
				t_g = u_g >= 0 ? (-g * u_g) : 10e5,
				t_b = u_b >= 0 ? (-b * u_b) : 10e5;

			t += minimum(t_r, t_g, t_b);  }  }

	return t;  }


function get_ST_max(a_,b_, cusp=null)  {
	cusp??= find_cusp(a_, b_);
	const
		L = cusp[0],
		C = cusp[1];
	return [C/L, C/(1-L)];  }


function get_ST_mid(a_,b_)  {
	const
		S = 0.11516993 + 1/(
				+ 7.44778970 + 4.15901240*b_
				+ a_*(- 2.19557347 + 1.75198401*b_
				+ a_*(- 2.13704948 -10.02301043*b_
				+ a_*(- 4.24894561 + 5.38770819*b_ + 4.69891013*a_ ))) ),
		T = 0.11239642 + 1/(
				+ 1.61320320 - 0.68124379*b_
				+ a_*(+ 0.40370612 + 0.90148123*b_
				+ a_*(- 0.27087943 + 0.61223990*b_
				+ a_*(+ 0.00299215 - 0.45399568*b_ - 0.14661872*a_ ))) );
	return [S, T];  }


function get_Cs(L, a_, b_)  {
	const
		cusp = find_cusp(a_, b_),

		C_max = find_gamut_intersection(a_,b_,L,1,L,cusp),
		ST_max = get_ST_max(a_, b_, cusp),

		S_mid = 0.11516993 + 1/(
				+ 7.44778970 + 4.15901240*b_
				+ a_*(- 2.19557347 + 1.75198401*b_
				+ a_*(- 2.13704948 -10.02301043*b_
				+ a_*(- 4.24894561 + 5.38770819*b_ + 4.69891013*a_ ))) ),

		T_mid = 0.11239642 + 1/(
				+ 1.61320320 - 0.68124379*b_
				+ a_*(+ 0.40370612 + 0.90148123*b_
				+ a_*(- 0.27087943 + 0.61223990*b_
				+ a_*(+ 0.00299215 - 0.45399568*b_ - 0.14661872*a_ ))) ),

		k = C_max/minimum((L*ST_max[0]), (1-L)*ST_max[1]);

	var C_mid;
	{
		const
			C_a = L*S_mid,
			C_b = (1-L)*T_mid;

		C_mid = 0.9*k*squareRoot(squareRoot(1/(1/(C_a*C_a*C_a*C_a) + 1/(C_b*C_b*C_b*C_b))));
	}

	var C_0;
	{
		const
			C_a = L*0.4,
			C_b = (1-L)*0.8;

		C_0 = squareRoot(1/(1/(C_a*C_a) + 1/(C_b*C_b)));
	}

	return [C_0, C_mid, C_max];  }


//if you pass in a factory below, this will only covert to OKLab and return those values through the factory
//       okhsl_to_oklab()    ←↓ you MUST supply the factory
function okhsl_to_srgb(hslα, factory)  {  // ← for sRGB, DO NOT supply the factory
	const [h,s,l,α] = hslα;
	function oklab(L,a,b)  {
		if (α===undefined)  α=this.config.defaultAlpha;
		return (α===undefined) ? new factory(L,a,b) : new factory(L,a,b,α);  }

	if (l >= 1)  {
		if (factory)  return oklab(1,0,0);
		return this.output_RGB(255,255,255,α,'sRGB',255);  }
	else if (l <= 0)  {
		if (factory)  return oklab(0,0,0);
		return this.output_RGB(0,0,0,α,'sRGB',255);  }

	const
		a_ = cosine(π2*h),
		b_ = sine(π2*h),
		L = toe_inv(l),

		Cs = get_Cs(L, a_, b_),
		C_0 = Cs[0],
		C_mid = Cs[1],
		C_max = Cs[2];

	var t, k_0, k_1, k_2;
	if (s < 0.8)  {
		t = 1.25*s;
		k_0 = 0;
		k_1 = 0.8*C_0;
		k_2 = (1-k_1/C_mid);  }
	else  {
		t = 5*(s-0.8);
		k_0 = C_mid;
		k_1 = 0.2*C_mid*C_mid*1.25*1.25/C_0;
		k_2 = (1 - (k_1)/(C_max - C_mid));  }
	const
		C = k_0 + t*k_1/(1-k_2*t),
		// If we would only use one of the Cs:
		//C = s*C_0;
		//C = s*1.25*C_mid;
		//C = s*C_max;
		a = C*a_,
		b = C*b_;

	return (factory) ? oklab(L,a,b) : oklab_to_srgb.call(this, [L,a,b,α]);  }


//      oklab_to_okhsl(OKLabα, factory)  ← OKLabα MUST have the proper  .model  property!
function srgb_to_okhsl(rgbα, factory)  {
	factory??=this.config.OKHSLA_Factory;
	const
		lab = arguments[0].model==='OKLab' ? arguments[0] : srgb_to_oklab.call(this, rgbα, Array),

		C = squareRoot(lab[1]*lab[1] + lab[2]*lab[2]),
		a_ = lab[1]/C,
		b_ = lab[2]/C,

		L = lab[0],

		Cs = get_Cs(L, a_, b_),
		C_0 = Cs[0],
		C_mid = Cs[1],
		C_max = Cs[2],

		// ↓ in the SoftMoon-WebWare world, gray-scale tones have the hue 360°, i.e. ALL the hues mixed!
		h = (C<minimumChroma) ? 1 : (0.5 + 0.5*arcTangent2(-lab[2], -lab[1])/π),
		l = toe(L),
		α = (rgbα[3]===undefined) ? this.config.defaultAlpha : rgbα[3];

	var s;

	if (C<minimumChroma)  s=0;  // added by SoftMoon-WebWare: we were getting an s value of 55% or 55.8% for white.
	else  if (C < C_mid)  {
		const
			k_0 = 0,
			k_1 = 0.8*C_0,
			k_2 = (1-k_1/C_mid),

			t = (C - k_0)/(k_1 + k_2*(C - k_0));
		s = t*0.8 || 0; /*NaN bug*/  }
	else  {
		const
			k_0 = C_mid,
			k_1 = 0.2*C_mid*C_mid*1.25*1.25/C_0,
			k_2 = (1 - (k_1)/(C_max - C_mid)),

			t = (C - k_0)/(k_1 + k_2*(C - k_0));
		s = (0.8 + 0.2*t) || 0; /*NaN bug*/  }

	// this problem noted below is worse when the accuracyLevel=1; but bumping to 3 did not fix all problems… I found them in the “red” hue.
	s=minimum(1, maximum(0, s));  // added by SoftMoon-WebWare: we were getting as s value of 100.1% for #330033, #660066, #990099.

	return (α===undefined) ? new factory(h,s,l) : new factory(h,s,l,α);  }


//if you pass in a factory below, this will only covert to OKLab and return those values through the factory
//       okhsv_to_oklab()    ←↓ you MUST supply the factory
function okhsv_to_srgb(hsvα, factory)  {  // ← for sRGB, DO NOT supply the factory
	// problems: h= 26.926° — 29.233° (pure red),  @ s=100%, v>99.9%

	const
		[h,s,v,α] = hsvα;
	if (v===0)  return factory ?
			((α===undefined  &  this.config.defaultAlpha===undefined) ? factory(0,0,0) : factory(0,0,0, α===undefined ? this.config.defaultAlpha : α))
		: this.output_RGB(0,0,0,α,'sRGB',255);
	const
		a_ = cosine(π2*h),
		b_ = sine(π2*h),

		ST_max = get_ST_max(a_,b_),
		S_max = ST_max[0],
		S_0 = 0.5,
		T  = ST_max[1],
		k = 1 - S_0/S_max,

		L_v = 1 - s*S_0/(S_0+T - T*k*s),
		C_v = s*T*S_0/(S_0+T-T*k*s);
	var
		L = v*L_v,
		C = v*C_v;

		// to present steps along the way
		//L = v;
		//C = v*s*S_max;
		//L = v*(1 - s*S_max/(S_max+T));
		//C = v*s*S_max*T/(S_max+T);
	const
		L_vt = toe_inv(L_v),
		C_vt = C_v * L_vt/L_v,

		L_new =  toe_inv(L); // * L_v/L_vt;

	C = (C * L_new/L)||0;  //NaN bug
	L = L_new;

	const
		rgb_scale = oklab_to_srgb([L_vt, a_*C_vt, b_*C_vt], false),  // RGB values remain linear
		scale_L = cubeRoot(1/(maximum(rgb_scale[0], rgb_scale[1], rgb_scale[2], 0)));

	// remove to see effect without rescaling
	L = L*scale_L;
	C = C*scale_L;

	const a=C*a_, b=C*b_;

	if (factory)  {
		if (α===undefined)  α=this.config.defaultAlpha;
		return (α===undefined) ? new factory(L,a,b) : new factory(L,a,b,α);  }
	return oklab_to_srgb.call(this, [L,a,b,α]);  }


//      oklab_to_okhsv(OKLabα, factory)  ← OKLabα  MUST have the proper  .model  property!
function srgb_to_okhsv(rgbα, factory)  {
	factory??=this.config.OKHSVA_Factory;
	const
		lab = arguments[0].model==='OKLab' ? arguments[0] : srgb_to_oklab.call(this, rgbα, Array);
	var
		C = squareRoot(lab[1]*lab[1] + lab[2]*lab[2]),
		L = lab[0];
	const
		a_ = lab[1]/C,
		b_ = lab[2]/C,

		// ↓ in the SoftMoon-WebWare world, gray-scale tones have the hue 360°, i.e. ALL the hues mixed!
		h = (C<minimumChroma) ? 1 : (0.5 + 0.5*arcTangent2(-lab[2], -lab[1])/π),

		ST_max = get_ST_max(a_, b_),
		S_max = ST_max[0],
		S_0 = 0.5,
		T = ST_max[1],
		k = 1 - S_0/S_max,

		t = T/(C+L*T),
		L_v = t*L,
		C_v = t*C,

		L_vt = toe_inv(L_v),
		C_vt = C_v * L_vt/L_v,

		rgb_scale = oklab_to_srgb([L_vt, a_*C_vt, b_*C_vt], false),  // RGB values remain linear
		scale_L = cubeRoot(1/(maximum(rgb_scale[0], rgb_scale[1], rgb_scale[2], 0)));

	L = L/scale_L;
	C = C/scale_L;

	C = C * toe(L)/L;
	L = toe(L);

	const
		v = minimum(1, maximum(0, L/L_v || 0)),  //NaN bug, out-of-range bug
		s = minimum(1, maximum(0, (S_0+T)*C_v/((T*S_0) + T*k*C_v)  || 0)),  //NaN bug, out-of-range bug
		α= (rgbα[3]===undefined) ? this.config.defaultAlpha : rgbα[3];

	return (α===undefined) ? new factory(h,s,v) : new factory(h,s,v,α);  }


//if you pass in a factory below, this will only covert to OKLab and return those values through the factory
//       okhwb_to_oklab()    ←↓ you MUST supply the factory
function okhwb_to_srgb(hwbα, factory)  {  // ← for sRGB, DO NOT supply the factory
	// algorithm provided by Björn Ottosson
	// JavsScript code provided by SoftMoon-WebWare under public domain license & MIT license
	const
		g=hwbα[1]+hwbα[2];
	if (g>=1)  {const G=hwbα[1]/g*255;  return this.output_RGB(G,G,G,hwbα[3],'sRGB',255);}
	return okhsv_to_srgb.call(this, [hwbα[0], 1-(hwbα[1]/(1-hwbα[2]) || 0 /*avoid NaN*/), 1-hwbα[2], hwbα[3]], factory);  }


//      okhsv_to_okhwb(OKHSVα, factory)  ← OKHSVα MUST have the proper  .model  property!
function srgb_to_okhwb(rgbα, factory)  {
	// algorithm provided by Björn Ottosson
	// JavsScript code provided by SoftMoon-WebWare under public domain license & MIT license
	factory??=this.config.OKHWBA_Factory;
	const
		hsv = arguments[0].model==='OKHSV' ? arguments[0] : srgb_to_okhsv.call(this, rgbα, Array),
		w=(1-hsv[1])*hsv[2],
		b=1-hsv[2],
		α= (rgbα[3]===undefined) ? this.config.defaultAlpha : rgbα[3];
	return (α===undefined) ? new factory(hsv[0],w,b) : new factory(hsv[0],w,b,α);  }



/*  HCG & OKHCG  → → → Hue, Chroma∝, Gray
 *  These are color space models based on an RGB (e.g. sRGB) color space,
 *  similar to HSL & HSV (HSB), or OKHSL & OKHSV.
 *  Note while HCG is generically related to *any* RGB color-space, OKHCG is mapped *only* to sRGB via OKHSV.
 *  Hue is the same as the corresponding hue in the similar color spaces.
 *  Chroma∝ (C) is defined in these color space models as being “mathematical proportional Chroma”,
 *  relative to the maximum C that the RGB color space can accommodate for any given hue,
 *  similar to saturation, being a percentage from 0%-100%, with all values producing an in-gamut color.
 *  For sRGB, maximum C is when one channel [R,G,B] =255, one channel =0, and the third varies.
 *  This is NOT perceived Chroma, as other color models such as LCh or OKLCh attempt to quantitize.
 *  Gray is essentially ≡ lightness or value/brightness, with the term chosen to distinguish these color spaces.
 *  For HCG, the color is a simple mathematical interpolation of corresponding RGB channels between
 *  a fully-chromatic hue (as defined above) and a gray-tone (all RGB channels have the same value),
 *  with C being the interpolation factor.
 *  For OKHCG, the color is defined & derived by OKLab’s (& OKHSV’s) mapping to the sRGB color space.
 *
 *  HCG is very useful in mathematically analyzing and working with colors.
 *  MasterColorPicker™ uses it in the Color Thesaurus for finding color-similarities;
 *  and along with OKHCG, for mathematically mapping colors to the RainbowMaestro color picker (as described below).
 *  The  Rigden-colorbilnd_websafe-table_interpolator.js  uses it to identify which 2-8 data-elements of the
 *  “websafe colors to colorblind table” to use to interpolate the final colorblind simulation.
 *  HCG & OKHCG are very useful for color-picker sliders, I (Joe) believe more so than HSL, HSV/HSB, or HWB.
 *  The old-school color-picker with the rainbow-ring
 *  and the gradient-triangle with colored-black-white tips is displaying the HCG space.
 *  Somewhere, quite a while back, likely on Wikipedia, I read this style of color-picker was one of the original.
 *  The HCG concept is not new; RGB-to-HCG and HCG-to-RGB algorithms are likely older, but I’ve never seen them before.
 *  I coined this term circa 2011 based on what Wikipedia taught me, before I knew about LCh and “perceived Chroma”…
 *  but I still don’t know of a better term.
 */

//if you pass in a factory below, this will only covert to OKLab and return those values through the factory
//       okhcg_to_oklab()    ←↓ you MUST supply the factory
function okhcg_to_srgb(hcgα, factory)  {  // ← for sRGB, DO NOT supply the factory
	// algorithm & JavsScript code provided by SoftMoon-WebWare under public domain license & MIT license
	return okhsv_to_srgb.call(this, okhcg_to_okhsv.call(this, hcgα, Array), factory);  }


function okhcg_to_okhsv(hcgα, factory)  {
	// algorithm & JavsScript code provided by SoftMoon-WebWare under public domain license & MIT license
	factory??=this.config.OKHSVA_Factory;
	const
		[H,C,G] = hcgα,
		V= C + (1-C)*G,  // derived from a combination of creative visual logic, intuition, luck, and sheer brute force.
		B= 1 - V,  // see srgb_to_okhwb above
		W= 1 - B - C,  // derived from known formula: C=1-(W+B)  →  C = 1 - W - B  ← White and Black must be “normalized” such that: W+B ≤ 1
		S= minimum(1, 1 - (W/(1-B) || 0)),  /*avoid NaN*/// see okhwb_to_srgb above
		α= (hcgα[3]===undefined) ? this.config.defaultAlpha : hcgα[3];
	return (α===undefined) ? new factory(H,S,V) : new factory(H,S,V,α);  }


//      okhsv_to_okhcg(OKHSVα, factory)  ← OKHSVα MUST have the proper  .model  property!
function srgb_to_okhcg(rgbα, factory)  {
	// algorithm & JavsScript code provided by SoftMoon-WebWare under public domain license & MIT license
	factory??=this.config.OKHCGA_Factory;
	const
		[H,S,V] = (arguments[0].model==='OKHSV') ? arguments[0] : srgb_to_okhsv.call(this, rgbα, Array),
		W= (1-S)*V,
		B= 1-V,
		g= W+B,
		C= maximum(0, minimum(1, 1 - g)),  //  ← C is the inverse of White+Black
		G= (C===1) ? 0.5 : (W/g),
		α= (rgbα[3]===undefined) ? this.config.defaultAlpha : rgbα[3];
	return (α===undefined) ? new factory(H,C,G) : new factory(H,C,G,α);  }


}  // close the private namespace

//Object.lock(Björn_Ottosson, true);   //if for some reason you need to add to something within
Object.deepFreeze(Björn_Ottosson);     //tell the JS compiler (SpiderMonkey in particular) that all is constant so it can optimize

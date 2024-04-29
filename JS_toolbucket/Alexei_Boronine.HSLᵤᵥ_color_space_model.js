/* HSLᵤᵥ color space model  (this file last updated April 25, 2024)
SoftMoon-WebWare adapted from:   https://github.com/color-js/color.js/blob/main/src/spaces/hsluv.js
color.js adapted from:   https://github.com/hsluv/hsluv-javascript/blob/14b49e6cf9a9137916096b8487a5372626b57ba4/src/hsluv.ts

Copyright (c) 2012-2022 Alexei Boronine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';


const Alexei_Boronine={};

{  // open a private namespace

Alexei_Boronine.HSLᵤᵥ_from_LChᵤᵥ=HSLᵤᵥ_from_LChᵤᵥ;
Alexei_Boronine.HSLᵤᵥ_to_LChᵤᵥ=   HSLᵤᵥ_to_LChᵤᵥ;

function distanceFromOriginAngle (slope, intercept, angle)  {
	const d = intercept / (Math.sin(angle) - slope * Math.cos(angle));
	return d < 0 ? Infinity : d;  }

function calculateBoundingLines (l)  {
	const
		XYZA_Array=SoftMoon.WebWare.XYZA_Array,
		M=XYZA_Array.toRGB_matrix.sRGB.D65,
		sub1 = Math.pow(l + 16, 3) / 1560896,
		sub2 = sub1 > XYZA_Array.ε ? sub1 : l / XYZA_Array.κ,
		s1r = sub2 * (284517 * M[0][0] - 94839 *  M[0][2]),
		s2r = sub2 * (838422 * M[0][2] + 769860 * M[0][1] + 731718 * M[0][0]),
		s3r = sub2 * (632260 * M[0][2] - 126452 * M[0][1]),
		s1g = sub2 * (284517 * M[1][0] - 94839 *  M[1][2]),
		s2g = sub2 * (838422 * M[1][2] + 769860 * M[1][1] + 731718 * M[1][0]),
		s3g = sub2 * (632260 * M[1][2] - 126452 * M[1][1]),
		s1b = sub2 * (284517 * M[2][0] - 94839 *  M[2][2]),
		s2b = sub2 * (838422 * M[2][2] + 769860 * M[2][1] + 731718 * M[2][0]),
		s3b = sub2 * (632260 * M[2][2] - 126452 * M[2][1]);
	return {
		r0s: s1r / s3r,
		r0i: s2r * l / s3r,
		r1s: s1r / (s3r + 126452),
		r1i: (s2r - 769860) * l / (s3r + 126452),
		g0s: s1g / s3g,
		g0i: s2g * l / s3g,
		g1s: s1g / (s3g + 126452),
		g1i: (s2g - 769860) * l / (s3g + 126452),
		b0s: s1b / s3b,
		b0i: s2b * l / s3b,
		b1s: s1b / (s3b + 126452),
		b1i: (s2b - 769860) * l / (s3b + 126452) };  }

function calcMaxChromaHsluv (lines, h)  {
	const
		hueRad = h*π2,
		r0 = distanceFromOriginAngle(lines.r0s, lines.r0i, hueRad),
		r1 = distanceFromOriginAngle(lines.r1s, lines.r1i, hueRad),
		g0 = distanceFromOriginAngle(lines.g0s, lines.g0i, hueRad),
		g1 = distanceFromOriginAngle(lines.g1s, lines.g1i, hueRad),
		b0 = distanceFromOriginAngle(lines.b0s, lines.b0i, hueRad),
		b1 = distanceFromOriginAngle(lines.b1s, lines.b1i, hueRad);
	return Math.min(r0, r1, g0, g1, b0, b1);  }

function HSLᵤᵥ_from_LChᵤᵥ(lch, factory)  {
	factory??=this.config.HSLᵤᵥA_Factory;
	var s, [l, c, h] = lch;
	const α= (lch[3]===undefined) ? this.config.defaultAlpha : lch[3];
	if (l > 0.999999999)  {
		s = 0;
		l = 1;  }
	else if (l < 0.0000000001)  {
		s = 0;
		l = 0;  }
	else  {
		const
			lines = calculateBoundingLines(l*100),
			max = calcMaxChromaHsluv(lines, h);
		s = c / max;  }
	return (α===undefined) ? new factory(h,s,l) : new factory(h,s,l,α);  }

function HSLᵤᵥ_to_LChᵤᵥ(hsl, factory) {
	factory??=this.config.LChᵤᵥA_Factory;
	var c, [h, s, l] = hsl;
	const α= (hsl[3]===undefined) ? this.config.defaultAlpha : hsl[3];
	if (l > 0.999999999)  {
		l = 1;
		c = 0;  }
	else if (l < 0.0000000001)  {
		l = 0;
		c = 0;  }
	else  {
		const
			lines = calculateBoundingLines(l*100),
			max = calcMaxChromaHsluv(lines, h);
		c = max/100 * s*100;  }
	return (α===undefined) ? new factory(l,c,h) : new factory(l,c,h,α);  }

}  // close private namespace

Object.freeze(Alexei_Boronine);

/*  OK color models  (last updated April 7, 2024)
 * Copyright (c) 2021 Björn Ottosson
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
 * https://bottosson.github.io/posts/colorpicker/
 * https://bottosson.github.io/posts/oklab/
 *
 * Minor superficial modifications by SoftMoon-WebWare for:
 *  • inclusion into the RGB_Calc package,
 *  • optimal execusion speed.
 */
//   referred by: https://drafts.csswg.org/css-color/#ok-lab


const Björn_Ottosson={};

{ //open a private namespace

const
	cubeRoot=Math.cbrt;

// OKLab and OKLCh are also released under pubilc domain
Björn_Ottosson.oklab_to_srgb=oklab_to_srgb;
function oklab_to_srgb(lab)  {  // ¿¿  l → 0.0—1.0     a,b → -0.5—0.5  ??  ← ¡seems to be correct!
  const
		l = (lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2])**3,
    m = (lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2])**3,
    s = (lab[0] - 0.0894841775 * lab[1] - 1.2914855480 * lab[2])**3;
  return this.γCorrect_linear_RGB(
		+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
		lab[3],
		'sRGB');  }

Björn_Ottosson.oklch_to_srgb=
function oklch_to_srgb($lch)  { // l,h → 0.0—1.0   c → 0.0—0.5
	const h=$lch[2]*π2;
	return oklab_to_srgb.call(this, [$lch[0], $lch[1]*Math.cos(h), $lch[1]*Math.sin(h), $lch[3]]);  }

Björn_Ottosson.srgb_to_oklab=
function srgb_to_oklab(rgb)  {
	rgb=this.linearize_γCorrected_RGB(rgb, 'sRGB');
	const
		l = cubeRoot(0.4122214708 * rgb[0] + 0.5363325363 * rgb[1] + 0.0514459929 * rgb[2]),
		m = cubeRoot(0.2119034982 * rgb[0] + 0.6806995451 * rgb[1] + 0.1073969566 * rgb[2]),
		s = cubeRoot(0.0883024619 * rgb[0] + 0.2817188376 * rgb[1] + 0.6299787005 * rgb[2]);
	return [
			0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
			1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
			0.0259040371*l + 0.7827717662*m - 0.8086757660*s];  }


Björn_Ottosson.xyz_to_oklab=xyz_to_oklab;
function xyz_to_oklab(xyz, factory)  {
	// JavsScript code provided by SoftMoon-WebWare under public domain license & MIT license
	// working according to the test table at https://bottosson.github.io/posts/oklab/
	const
		M1=xyz_to_oklab.M1,
		M2=xyz_to_oklab.M2,
	  l= cubeRoot(M1[0][0] * xyz[0] + M1[0][1] * xyz[1] + M1[0][2] * xyz[2]),
		m= cubeRoot(M1[1][0] * xyz[0] + M1[1][1] * xyz[1] + M1[1][2] * xyz[2]),
		s= cubeRoot(M1[2][0] * xyz[0] + M1[2][1] * xyz[1] + M1[2][2] * xyz[2]);
	return [
		M2[0][0] * l + M2[0][1] * m + M2[0][2] * s,
		M2[1][0] * l + M2[1][1] * m + M2[1][2] * s,
		M2[2][0] * l + M2[2][1] * m + M2[2][2] * s ];  }
xyz_to_oklab.M1=[
	  [0.8189330101, 0.3618667424, -0.1288597137],
		[0.0329845436, 0.9293118715,  0.0361456387],
		[0.0482003018, 0.2643662691,  0.6338517070] ];
xyz_to_oklab.M2=[
		[0.2104542553,  0.7936177850, -0.0040720468],
		[1.9779984951, -2.4285922050,  0.4505937099],
		[0.0259040371,  0.7827717662, -0.8086757660] ];

Björn_Ottosson.oklab_to_xyz=oklab_to_xyz;
function oklab_to_xyz(lab)  {
	const
		M1=oklab_to_xyz.M1,
		M2=oklab_to_xyz.M2,
		l= (M2[0][0] * lab[0] + M2[0][1] * lab[1] + M2[0][2] * lab[2]) ** 3,
		m= (M2[1][0] * lab[0] + M2[1][1] * lab[1] + M2[1][2] * lab[2]) ** 3,
		s= (M2[2][0] * lab[0] + M2[2][1] * lab[1] + M2[2][2] * lab[2]) ** 3;
	return [
		M1[0][0] * l + M1[0][1] * m + M1[0][2] * s,
		M1[1][0] * l + M1[1][1] * m + M1[1][2] * s,
		M1[2][0] * l + M1[2][1] * m + M1[2][2] * s ];  }
oklab_to_xyz.M1=Math.invert_3_3_matrix(xyz_to_oklab.M1);
oklab_to_xyz.M2=Math.invert_3_3_matrix(xyz_to_oklab.M2);

}  // close the private namespace

//Object.lock(Björn_Ottosson, true);
Object.deepFreeze(Björn_Ottosson);

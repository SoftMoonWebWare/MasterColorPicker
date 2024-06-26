//  character encoding: UTF-8 UNIX   tab-spacing: 2 ¡important!   word-wrap: no   standard-line-length: 120

/*	websafe table interpolator function version 1.1.4  Feb 2, 2019; Feb 27, 2023; Feb 23, 2024; April 29, 2024  by SoftMoon WebWare.
 *   written by and Copyright © 2019,2022,2023 Joe Golembieski, SoftMoon WebWare
 *  Websafe table colorblind data courtesy of Christine Rigden →
			https://www.rigdenage.co.uk/design-for-colour-blind/
			http://www.rigdenage.co.uk/safecolours/
			http://safecolours.rigdenage.com/

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
			https://www.gnu.org/licenses/#APGL
		*/


// requires  “RGB_Calc.js”  in  JS_toolbucket/SoftMoon-WebWare/
// requires  “+++Math.js”   in  JS_toolbucket/+++JS/


//this function:
// • requires passing in either:
//   →  a 3-value (or optionally 4-value with alpha-channel) decimal-byte RGB array specifying the normal-sighted color.
//   →  any Object (such as the RGB array noted above) with a property  .hcga  which is the Hue-Chroma-Gray equivalent of the RGB color,
//       and this will speed up processing a bit (the RGB array if passed will be subsequently ignored).
// • requires input values in proper ranges, and will likely throw errors otherwise
//   (note the “auditToColorBlind” shell does check input values for validity, and accepts many more input formats)
//
// • returns an array of arrays of colorblind RGB values →  [[r,g,b], [r,g,b], [r,g,b]]  if “rgb” is a WebSafe Color and no “type” is passed in
//                                                           ↑protan  ↑deutan  ↑tritan
//    No alpha value will be passed back if no “type” is passed in.
// or
// • returns RGB byte values through the RGB_Calc standard output if “type” is passed in →  protan ‖ deutan ‖ tritan
//     Any optional Alpha value that was passed in is passed along out.
// The returned array ☆simulates☆ colorblind vision for people with “full color” vision.
// Accuracy of results varies by individual and the computer monitor used.

'use strict';

{  // open a private namespace

if (!SoftMoon.WebWare.RGB_Calc.colorblindProviders)  SoftMoon.WebWare.RGB_Calc.colorblindProviders= new Object;
SoftMoon.WebWare.RGB_Calc.colorblindProviders.Rigden={
	title: "Rigden web-safe interpolated",
	thanks: "special thanks to: Christine Rigden → https://www.rigdenage.co.uk/design-for-colour-blind/",
	to: {
		quick: toColorBlind,
		audit: auditToColorBlind  } };

// this is the “quick mini” calculator we use internally to convert RGB values to HCG
const rgb_calc=new SoftMoon.WebWare.RGB_Calc({HCGA_Factory: Array, defaultAlpha: undefined}, true, {to:['hcg']});

SoftMoon.WebWare.RGB_Calc.to.colorblind= toColorBlind;
SoftMoon.WebWare.RGB_Calc.definer.quick.to.colorblind= {value: toColorBlind, writable: true};
SoftMoon.WebWare.RGB_Calc.definer.audit.to.colorblind= {value: auditToColorBlind, writable: true};
function auditToColorBlind() {return this.convertColor(arguments, toColorBlind, 'colorblind  «Rigden-websafe interpolated»');}
function toColorBlind(rgb, type)  {
	// The color may have an optional alpha (opacity) component as the 4th value (index [3]).
	// We do not have any data to represent how the alpha-channel affects the perception of the color for color-blind people.
	// We simply pass on the alpha-channel value.
	const hcga= rgb.hcga || rgb_calc.to.hcg(rgb),
				H=Math.deg(Math.round(hcga[0]*3600)/10),  //(0-359.9)
				C=Math.round(hcga[1]*1000)/100, //(0-10)   ↑←↓ adjust to the json table format and get rid of floating-point errors.
				G=Math.round(hcga[2]*1000),     //(0-1000)
				tbl=toColorBlind.websafe_table;
	var Hlow, _C_, Glow, GlowRnd, Hhi, Ghi,
			DperH=0,  //when Chroma=0
			SperG=0;  //when Chroma=10
	type=toColorBlind.types.indexOf(type);

	if (tbl[H]  &&  tbl[H][C]  &&  (rgb=tbl[H][C][G]))   // rgb now becomes 3 sets of 3-value-rgb-arrays
		return type<0 ?  rgb  :  this.output_sRGB(...rgb[type], hcga[3]);

	function setParams()  {
		if (_C_===0) {Hlow=0; DperH=0;} //pure grayscale (white to black)-(when chroma=0) is found at Hue=0
		else {
			DperH=120/_C_;  // Degrees per Hue at this level of Chroma ( 60/(_C_/2) )
			Hlow=Math.floor(H/DperH)*DperH;	}  // the websafe Hue just below the requested Hue that holds Grayscale data at this level of websafe chroma
		if (_C_===10) Glow=500;  //grayscale is irrelevant when chroma=100%;  It is found in the table at Gray=500 (50%)
		else {
			SperG=1000/(5-_C_/2);  // Steps per Gray at this level of Chroma
			Glow=Math.floor(G/SperG)*SperG;  } // the websafe Grayscale just below the requested Grayscale at this level of websafe Chroma
		GlowRnd=Math.round(Glow);  }  // Grey values in the table include values that are divisions of factor 3 and have repeating decimals.  We must accommodate them.

	function interp(low, high, f)  { return [
		low[0]+f*(high[0]-low[0]),
		low[1]+f*(high[1]-low[1]),
		low[2]+f*(high[2]-low[2]) ];  }

	function interp_G_()  { return (G===GlowRnd || _C_===10)  ?
				tbl[Hlow][_C_][GlowRnd][type]
			: interp(tbl[Hlow][_C_][GlowRnd][type], tbl[Hlow][_C_][Ghi=Math.round(Glow+SperG)][type], (G-Glow)/SperG);  }

	function interp_C_() { return interp(
		interp_G_(),
		Ghi ?
				interp(tbl[Hhi=(Hlow+DperH)%360][_C_][GlowRnd][type], tbl[Hhi][_C_][Ghi][type], (G-Glow)/SperG)
			: tbl[(Hlow+DperH)%360][_C_][GlowRnd][type],
		(H-Hlow)/DperH );  }

	// chroma is primary in color-definition and in “locating” the color in the data
  _C_=Math.floor(C/2)*2;  // websafe-table chroma is either 0,2,4,6,8,10

	setParams();
	// we calculate 16,777,216 colors from 216 websafe colors: data is sparse
	// we interpolate from 2 to 8 data points, based on “location” in the HCG color-space
	// the more-sparse the data in the “vicinity,” the more data-points are used
	if (C===_C_)  return this.output_sRGB(...((H===Hlow) ? interp_G_() : interp_C_()), hcga[3]);

	return this.output_sRGB(...(interp(
		(_C_===0) ? interp_G_() : interp_C_(),
		(
			_C_+=2,
			Ghi=null,
			setParams(),
			(H===Hlow) ? interp_G_() : interp_C_()
		),
		(C-_C_+2)/2 )), hcga[3]);  }


//these are the valid values to pass in for “type”
toColorBlind.types=['protan', 'deutan', 'tritan'];  //the order of this array needs to match the order of colorblind data in the table
toColorBlind.websafe_table={
/* Original data compiled by Christine Rigden →
			https://www.rigdenage.co.uk/design-for-colour-blind/
			http://www.rigdenage.co.uk/safecolours/
			http://safecolours.rigdenage.com/
 */
//It has been re-formatted into this table by SoftMoon-WebWare
// Note that when chroma=0, the Hue is irrelevant; it is in the table at Hue=0  (these are the pure gray-tones from black to white).
// Likewise, when chroma=10 (100%), the Gray is irrelevant; it is in the table at Gray=500  (these are the pure “full color” tones of a Hue).
	"0": {        //hue degrees (0-348) \_
		"0": {      //chroma (0-10)        = of normal websafe color
			"0": [    //gray (0-1000)       /¯
				[0,0,0],  //protan \_
				[0,0,0],  //deutan  = rgb values of colorblind simulation
				[0,0,0]   //tritan /¯
			],
			"200": [
				[52,51,51],
				[55,49,51],
				[51,50,54]
			],
			"400": [
				[104,102,102],
				[111,99,103],
				[103,101,108]
			],
			"600": [
				[155,152,153],
				[166,148,154],
				[154,151,163]
			],
			"800": [
				[207,203,203],
				[222,198,205],
				[206,202,217]
			],
			"1000": [
				[255,250,250],
				[255,232,239],
				[244,240,255]
			]
		},
		"2": {
			"0": [
				[30,27,8],
				[34,26,0],
				[51,6,0]
			],
			"250": [
				[70,67,58],
				[79,64,49],
				[102,51,54]
			],
			"500": [
				[120,116,109],
				[132,112,100],
				[154,101,108]
			],
			"750": [
				[170,165,160],
				[186,161,152],
				[205,152,162]
			],
			"1000": [
				[222,216,210],
				[241,210,203],
				[255,202,216]
			]
		},
		"4": {
			"0": [
				[60,54,15],
				[69,53,0],
				[102,11,0]
			],
			"333": [
				[95,89,65],
				[108,85,45],
				[153,51,53]
			],
			"667": [
				[140,134,117],
				[158,129,97],
				[204,101,108]
			],
			"1000": [
				[189,182,168],
				[210,176,149],
				[255,153,162]
			]
		},
		"6": {
			"0": [
				[90,81,23],
				[103,79,0],
				[153,17,0]
			],
			"500": [
				[123,113,70],
				[140,108,39],
				[204,51,52]
			],
			"1000": [
				[165,155,124],
				[187,149,94],
				[255,102,108]
			]
		},
		"8": {
			"0": [
				[120,108,30],
				[136,105,0],
				[204,22,0]
			],
			"1000": [
				[152,139,74],
				[173,132,28],
				[255,51,50]
			]
		},
		"10": {
			"500": [
				[150,135,38],
				[169,130,0],
				[254,28,0]
			]
		}
	},
	"12": {
		"10": {
			"500": [
				[154,139,35],
				[174,134,0],
				[255,51,49]
			]
		}
	},
	"15": {
		"8": {
			"0": [
				[126,113,27],
				[143,109,0],
				[204,48,48]
			],
			"1000": [
				[170,154,66],
				[191,147,34],
				[255,101,106]
			]
		}
	},
	"20": {
		"6": {
			"0": [
				[99,89,19],
				[112,86,0],
				[154,48,50]
			],
			"500": [
				[146,133,60],
				[164,126,43],
				[206,96,103]
			],
			"1000": [
				[196,180,112],
				[218,172,98],
				[255,149,158]
			]
		}
	},
	"24": {
		"10": {
			"500": [
				[172,154,30],
				[192,147,0],
				[255,101,105]
			]
		}
	},
	"30": {
		"4": {
			"0": [
				[74,66,11],
				[83,64,0],
				[103,48,51]
			],
			"333": [
				[126,114,55],
				[140,109,49],
				[156,96,103]
			],
			"667": [
				[177,164,106],
				[196,157,101],
				[208,146,157]
			],
			"1000": [
				[229,214,157],
				[252,205,153],
				[255,196,209]
			]
		},
		"8": {
			"0": [
				[148,132,21],
				[166,127,0],
				[207,95,101]
			],
			"1000": [
				[199,180,58],
				[222,171,42],
				[255,148,157]
			]
		}
	},
	"36": {
		"10": {
			"500": [
				[200,179,23],
				[223,170,0],
				[255,148,156]
			]
		}
	},
	"40": {
		"6": {
			"0": [
				[127,114,13],
				[142,108,0],
				[157,95,102]
			],
			"500": [
				[181,163,54],
				[201,155,50],
				[210,144,154]
			],
			"1000": [
				[233,212,105],
				[255,202,111],
				[255,192,205]
			]
		}
	},
	"45": {
		"8": {
			"0": [
				[181,162,14],
				[202,154,0],
				[211,143,153]
			],
			"1000": [
				[236,212,53],
				[255,200,87],
				[255,191,202]
			]
		}
	},
	"48": {
		"10": {
			"500": [
				[236,211,15],
				[255,199,80],
				[255,190,202]
			]
		}
	},
	"60": {
		"2": {
			"0": [
				[55,50,0],
				[61,47,9],
				[54,48,51]
			],
			"250": [
				[109,100,50],
				[121,95,53],
				[107,96,103]
			],
			"500": [
				[162,150,101],
				[178,144,104],
				[159,146,157]
			],
			"750": [
				[215,201,151],
				[234,193,155],
				[211,196,211]
			],
			"1000": [
				[255,242,200],
				[255,223,200],
				[253,239,255]
			]
		},
		"4": {
			"0": [
				[111,99,0],
				[123,94,17],
				[108,95,102]
			],
			"333": [
				[165,149,50],
				[183,142,55],
				[162,144,154]
			],
			"667": [
				[219,199,100],
				[241,190,106],
				[215,193,207]
			],
			"1000": [
				[255,237,162],
				[255,218,173],
				[255,234,249]
			]
		},
		"6": {
			"0": [
				[166,149,0],
				[166,149,0],
				[162,143,153]
			],
			"500": [
				[221,198,49],
				[245,188,59],
				[216,191,205]
			],
			"1000": [
				[255,234,134],
				[255,215,157],
				[255,230,245]
			]
		},
		"8": {
			"0": [
				[221,198,0],
				[246,198,0],
				[217,190,204]
			],
			"1000": [
				[255,233,117],
				[255,213,148],
				[255,229,243]
			]
		},
		"10": {
			"500": [
				[255,232,113],
				[255,213,146],
				[255,228,242]
			]
		}
	},
	"72": {
		"10": {
			"500": [
				[255,230,85],
				[255,211,137],
				[224,238,255]
			]
		}
	},
	"75": {
		"8": {
			"0": [
				[210,188,0],
				[233,178,42],
				[171,190,205]
			],
			"1000": [
				[255,231,92],
				[255,211,140],
				[224,238,255]
			]
		}
	},
	"80": {
		"6": {
			"0": [
				[155,139,0],
				[172,132,33],
				[117,143,154]
			],
			"500": [
				[209,188,47],
				[232,179,63],
				[170,191,205]
			],
			"1000": [
				[255,232,115],
				[255,212,151],
				[221,238,255]
			]
		}
	},
	"84": {
		"10": {
			"500": [
				[255,228,28],
				[255,208,128],
				[182,237,255]
			]
		}
	},
	"90": {
		"4": {
			"0": [
				[101,91,0],
				[112,86,23],
				[65,95,102]
			],
			"333": [
				[155,139,47],
				[170,133,59],
				[116,144,154]
			],
			"667": [
				[207,189,97],
				[228,181,108],
				[168,193,207]
			],
			"1000": [
				[255,235,151],
				[255,216,171],
				[217,238,255]
			]
		},
		"8": {
			"0": [
				[202,181,0],
				[224,172,46],
				[130,190,205]
			],
			"1000": [
				[255,229,50],
				[255,209,132],
				[181,237,255]
			]
		}
	},
	"96": {
		"10": {
			"500": [
				[250,224,0],
				[255,206,121],
				[146,237,255]
			]
		}
	},
	"100": {
		"6": {
			"0": [
				[149,134,0],
				[165,134,0],
				[81,143,154]
			],
			"500": [
				[202,181,45],
				[223,172,66],
				[129,191,205]
			],
			"1000": [
				[254,230,94],
				[255,210,145],
				[180,238,255]
			]
		}
	},
	"105": {
		"8": {
			"0": [
				[198,177,0],
				[219,168,48],
				[100,191,215]
			],
			"1000": [
				[250,224,42],
				[255,207,124],
				[146,237,255]
			]
		}
	},
	"108": {
		"10": {
			"500": [
				[247,221,0],
				[255,205,116],
				[122,237,255]
			]
		}
	},
	"120": {
		"2": {
			"0": [
				[49,44,0],
				[54,42,12],
				[23,48,51]
			],
			"250": [
				[100,91,47],
				[109,87,55],
				[63,96,104]
			],
			"500": [
				[152,140,97],
				[164,135,106],
				[113,146,157]
			],
			"750": [
				[203,191,147],
				[219,184,157],
				[163,196,211]
			],
			"1000": [
				[255,241,197],
				[255,222,204],
				[211,239,255]
			]
		},
		"4": {
			"0": [
				[99,88,0],
				[109,84,24],
				[45,95,102]
			],
			"333": [
				[149,134,46],
				[164,128,60],
				[79,144,154]
			],
			"667": [
				[200,182,94],
				[218,174,110],
				[126,193,207]
			],
			"1000": [
				[251,231,144],
				[255,214,169],
				[176,238,255]
			]
		},
		"6": {
			"0": [
				[148,133,0],
				[163,126,37],
				[68,143,154]
			],
			"500": [
				[198,178,44],
				[218,169,67],
				[99,191,205]
			],
			"1000": [
				[248,225,93],
				[255,208,139],
				[144,238,255]
			]
		},
		"8": {
			"0": [
				[197,176,0],
				[218,168,49],
				[90,191,205]
			],
			"1000": [
				[247,221,41],
				[255,205,120],
				[122,237,255]
			]
		},
		"10": {
			"500": [
				[246,220,0],
				[255,205,114],
				[115,237,255]
			]
		}
	},
	"132": {
		"10": {
			"500": [
				[246,221,41],
				[255,205,119],
				[115,237,255]
			]
		}
	},
	"135": {
		"8": {
			"0": [
				[197,177,43],
				[217,168,68],
				[89,191,205]
			],
			"1000": [
				[245,222,92],
				[255,207,136],
				[121,238,255]
			]
		}
	},
	"140": {
		"6": {
			"0": [
				[147,133,45],
				[162,126,61],
				[66,144,154]
			],
			"500": [
				[196,178,93],
				[214,171,111],
				[94,193,207]
			],
			"1000": [
				[246,226,141],
				[255,213,167],
				[142,238,255]
			]
		}
	},
	"144": {
		"10": {
			"500": [
				[245,221,92],
				[255,207,135],
				[115,238,255]
			]
		}
	},
	"150": {
		"4": {
			"0": [
				[97,89,46],
				[106,85,56],
				[42,96,104]
			],
			"333": [
				[146,135,94],
				[157,130,107],
				[73,146,157]
			],
			"667": [
				[196,184,143],
				[210,178,159],
				[119,196,211]
			],
			"1000": [
				[247,233,193],
				[255,221,208],
				[172,239,255]
			]
		},
		"8": {
			"0": [
				[195,178,93],
				[212,170,111],
				[84,193,207]
			],
			"1000": [
				[243,223,140],
				[255,212,166],
				[120,238,255]
			]
		}
	},
	"156": {
		"10": {
			"500": [
				[242,223,140],
				[255,211,166],
				[114,238,255]
			]
		}
	},
	"160": {
		"6": {
			"0": [
				[144,134,94],
				[155,129,108],
				[57,146,157]
			],
			"500": [
				[192,180,142],
				[204,174,160],
				[84,196,211]
			],
			"1000": [
				[241,228,191],
				[255,221,211],
				[139,239,255]
			]
		}
	},
	"165": {
		"8": {
			"0": [
				[191,179,141],
				[203,174,160],
				[71,196,211]
			],
			"1000": [
				[238,226,189],
				[252,219,212],
				[118,239,255]
			]
		}
	},
	"168": {
		"10": {
			"500": [
				[237,225,189],
				[251,218,212],
				[112,239,255]
			]
		}
	},
	"180": {
		"2": {
			"0": [
				[46,46,48],
				[47,45,52],
				[10,50,54]
			],
			"250": [
				[94,93,97],
				[97,91,104],
				[53,101,109]
			],
			"500": [
				[145,143,147],
				[151,140,156],
				[105,151,163]
			],
			"750": [
				[196,193,198],
				[206,189,207],
				[156,202,217]
			],
			"1000": [
				[248,244,248],
				[255,234,253],
				[203,239,255]
			]
		},
		"4": {
			"0": [
				[92,91,95],
				[94,90,105],
				[21,101,109]
			],
			"333": [
				[140,138,144],
				[143,135,157],
				[57,151,163]
			],
			"667": [
				[189,187,193],
				[195,183,209],
				[107,202,217]
			],
			"1000": [
				[239,236,244],
				[244,228,255],
				[166,239,255]
			]
		},
		"6": {
			"0": [
				[138,137,143],
				[141,134,157],
				[31,151,163]
			],
			"500": [
				[185,183,191],
				[189,180,209],
				[62,202,217]
			],
			"1000": [
				[234,231,240],
				[235,223,255],
				[136,239,255]
			]
		},
		"8": {
			"0": [
				[184,182,191],
				[187,179,209],
				[41,202,217]
			],
			"1000": [
				[231,229,239],
				[231,221,255],
				[116,239,255]
			]
		},
		"10": {
			"500": [
				[230,228,238],
				[230,220,255],
				[110,239,255]
			]
		}
	},
	"192": {
		"10": {
			"500": [
				[173,186,242],
				[165,187,255],
				[0,208,223]
			]
		}
	},
	"195": {
		"8": {
			"0": [
				[126,141,194],
				[114,142,207],
				[0,161,172]
			],
			"1000": [
				[174,187,242],
				[167,187,255],
				[0,209,224]
			]
		}
	},
	"200": {
		"6": {
			"0": [
				[78,95,147],
				[61,98,154],
				[0,114,122]
			],
			"500": [
				[127,142,195],
				[117,143,206],
				[0,160,172]
			],
			"1000": [
				[178,190,245],
				[173,190,255],
				[87,209,225]
			]
		}
	},
	"204": {
		"10": {
			"500": [
				[103,146,248],
				[51,152,255],
				[0,172,183]
			]
		}
	},
	"210": {
		"4": {
			"0": [
				[13,51,102],
				[0,62,104],
				[0,67,71]
			],
			"333": [
				[80,97,149],
				[67,99,154],
				[20,109,118]
			],
			"667": [
				[133,147,199],
				[128,147,205],
				[90,159,171]
			],
			"1000": [
				[185,197,250],
				[185,196,255],
				[145,209,225]
			]
		},
		"8": {
			"0": [
				[26,102,204],
				[0,120,201],
				[0,130,138]
			],
			"1000": [
				[105,147,250],
				[57,153,255],
				[0,171,183]
			]
		}
	},
	"216": {
		"10": {
			"500": [
				[0,126,254],
				[0,144,236],
				[0,146,154]
			]
		}
	},
	"220": {
		"6": {
			"0": [
				[0,83,166],
				[0,94,154],
				[0,89,94]
			],
			"500": [
				[32,103,205],
				[0,120,201],
				[0,127,135]
			],
			"1000": [
				[110,152,254],
				[81,156,254],
				[62,169,182]
			]
		}
	},
	"225": {
		"8": {
			"0": [
				[0,111,222],
				[0,120,194],
				[0,111,116]
			],
			"1000": [
				[37,129,255],
				[0,144,236],
				[0,144,153]
			]
		}
	},
	"228": {
		"10": {
			"500": [
				[91,145,255],
				[0,140,226],
				[0,131,137]
			]
		}
	},
	"240": {
		"2": {
			"0": [
				[0,35,70],
				[0,33,53],
				[0,28,29]
			],
			"250": [
				[25,55,106],
				[0,59,101],
				[38,60,65]
			],
			"500": [
				[89,105,156],
				[88,106,152],
				[94,109,117]
			],
			"750": [
				[143,156,206],
				[146,155,204],
				[146,159,171]
			],
			"1000": [
				[196,206,255],
				[203,204,255],
				[198,209,225]
			]
		},
		"4": {
			"0": [
				[0,68,135],
				[0,65,104],
				[0,55,57]
			],
			"333": [
				[0,84,170],
				[0,93,153],
				[0,80,86]
			],
			"667": [
				[50,110,213],
				[0,118,201],
				[77,121,130]
			],
			"1000": [
				[131,164,255],
				[111,164,253],
				[134,169,182]
			]
		},
		"6": {
			"0": [
				[0,96,193],
				[0,94,151],
				[0,81,85]
			],
			"500": [
				[0,112,225],
				[0,120,194],
				[0,106,112]
			],
			"1000": [
				[81,141,255],
				[0,144,238],
				[34,135,145]
			]
		},
		"8": {
			"0": [
				[0,120,240],
				[0,118,190],
				[0,106,110]
			],
			"1000": [
				[96,148,255],
				[0,140,226],
				[0,129,135]
			]
		},
		"10": {
			"500": [
				[113,156,255],
				[0,139,223],
				[0,127,133]
			]
		}
	},
	"252": {
		"10": {
			"500": [
				[115,157,255],
				[0,139,223],
				[0,124,130]
			]
		}
	},
	"255": {
		"8": {
			"0": [
				[0,121,242],
				[0,118,191],
				[0,100,105]
			],
			"1000": [
				[110,154,255],
				[0,140,228],
				[0,113,121]
			]
		}
	},
	"260": {
		"6": {
			"0": [
				[0,98,196],
				[0,93,150],
				[0,71,75]
			],
			"500": [
				[0,116,234],
				[0,118,194],
				[68,93,100]
			],
			"1000": [
				[112,155,255],
				[0,144,243],
				[126,135,145]
			]
		}
	},
	"264": {
		"10": {
			"500": [
				[122,161,255],
				[0,139,225],
				[0,107,115]
			]
		}
	},
	"270": {
		"4": {
			"0": [
				[0,70,139],
				[0,63,103],
				[33,42,45]
			],
			"333": [
				[0,89,180],
				[0,89,149],
				[88,76,81]
			],
			"667": [
				[73,123,223],
				[80,127,199],
				[140,121,130]
			],
			"1000": [
				[152,177,255],
				[143,174,251],
				[191,169,182]
			]
		},
		"8": {
			"0": [
				[0,124,248],
				[0,118,191],
				[66,84,91]
			],
			"1000": [
				[125,162,255],
				[0,141,232],
				[122,112,120]
			]
		}
	},
	"276": {
		"10": {
			"500": [
				[131,166,255],
				[0,140,229],
				[121,106,113]
			]
		}
	},
	"280": {
		"6": {
			"0": [
				[0,101,202],
				[0,90,148],
				[86,63,68]
			],
			"500": [
				[0,122,246],
				[0,115,194],
				[136,93,100]
			],
			"1000": [
				[135,167,255],
				[76,151,246],
				[187,135,145]
			]
		}
	},
	"285": {
		"8": {
			"0": [
				[39,130,255],
				[0,115,192],
				[135,85,91]
			],
			"1000": [
				[138,170,255],
				[0,141,239],
				[184,113,120]
			]
		}
	},
	"288": {
		"10": {
			"500": [
				[140,171,255],
				[0,140,236],
				[183,106,113]
			]
		}
	},
	"300": {
		"2": {
			"0": [
				[0,36,72],
				[19,30,48],
				[48,21,23]
			],
			"250": [
				[50,70,118],
				[61,71,99],
				[98,61,65]
			],
			"500": [
				[106,119,165],
				[115,118,150],
				[148,109,117]
			],
			"750": [
				[158,168,215],
				[170,167,201],
				[199,159,171]
			],
			"1000": [
				[207,215,255],
				[225,216,253],
				[251,209,225]
			]
		},
		"4": {
			"0": [
				[0,71,142],
				[37,61,96],
				[96,43,45]
			],
			"333": [
				[0,94,191],
				[73,97,146],
				[145,76,81]
			],
			"667": [
				[100,140,235],
				[123,141,197],
				[195,121,130]
			],
			"1000": [
				[170,189,255],
				[176,188,249],
				[246,169,181]
			]
		},
		"6": {
			"0": [
				[0,103,208],
				[56,91,144],
				[144,64,68]
			],
			"500": [
				[67,135,255],
				[87,126,194],
				[193,94,100]
			],
			"1000": [
				[152,178,255],
				[133,167,245],
				[242,135,145]
			]
		},
		"8": {
			"0": [
				[93,145,255],
				[75,122,192],
				[192,85,90]
			],
			"1000": [
				[150,177,255],
				[103,155,242],
				[240,113,120]
			]
		},
		"10": {
			"500": [
				[150,177,255],
				[94,152,241],
				[240,106,113]
			]
		}
	},
	"312": {
		"10": {
			"500": [
				[123,160,255],
				[131,143,192],
				[246,85,90]
			]
		}
	},
	"315": {
		"8": {
			"0": [
				[53,111,213],
				[110,113,144],
				[198,64,67]
			],
			"1000": [
				[119,157,255],
				[138,146,193],
				[247,94,99]
			]
		}
	},
	"320": {
		"6": {
			"0": [
				[57,83,143],
				[87,83,95],
				[150,43,44]
			],
			"500": [
				[82,117,200],
				[118,117,145],
				[198,76,80]
			],
			"1000": [
				[130,160,246],
				[160,159,195],
				[248,121,129]
			]
		}
	},
	"324": {
		"10": {
			"500": [
				[110,137,215],
				[151,136,142],
				[250,64,66]
			]
		}
	},
	"330": {
		"4": {
			"0": [
				[50,55,72],
				[63,53,47],
				[101,22,21]
			],
			"333": [
				[80,91,128],
				[98,89,97],
				[150,61,64]
			],
			"667": [
				[127,136,175],
				[145,134,148],
				[201,110,117]
			],
			"1000": [
				[177,184,224],
				[197,181,199],
				[252,159,170]
			]
		},
		"8": {
			"0": [
				[100,109,144],
				[126,106,94],
				[202,43,43]
			],
			"1000": [
				[122,142,206],
				[157,139,143],
				[251,76,79]
			]
		}
	},
	"336": {
		"10": {
			"500": [
				[136,136,146],
				[162,131,91],
				[253,43,40]
			]
		}
	},
	"340": {
		"6": {
			"0": [
				[85,81,74],
				[99,78,44],
				[152,22,18]
			],
			"500": [
				[112,115,135],
				[133,111,95],
				[202,61,63]
			],
			"1000": [
				[153,157,185],
				[177,153,146],
				[253,110,116]
			]
		}
	},
	"345": {
		"8": {
			"0": [
				[116,108,76],
				[133,103,38],
				[203,23,11]
			],
			"1000": [
				[143,140,139],
				[167,135,92],
				[254,61,62]
			]
		}
	},
	"348": {
		"10": {
			"500": [
				[147,135,78],
				[168,128,26],
				[254,26,0]
			]
		}
	}
};

}  //close the private namespace

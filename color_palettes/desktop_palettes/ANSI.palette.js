SoftMoon.loaded_palettes.push(
{ "ANSI": {
	"requireSubindex": false,
	"useShortChains": true,
	"header": ["ANSI “escape-code” colors",
						 "You do not need to specify “bit-size” sub-palettes for colors.",
						 "You do not need to specify any sub-palettes for 8-bit colors."],
	"footer": ["https://en.wikipedia.org/wiki/ANSI_escape_code#Colors"],
	"display": "grid",
	"palette": {
		"8-bit": {
			"header":"these are standardized",
			"palette": {
				"basic colors": { "columns":8, "palette": {
					"0":"#000000",
					"1":"#800000",
					"2":"#008000",
					"3":"#808000",
					"4":"#000080",
					"5":"#800080",
					"6":"#008080",
					"7":"#C0C0C0"
					}  },
				"high-intensity colors": { "columns":8, "palette": {
					"8": "#808080",
					"9": "#FF0000",
					"10":"#00FF00",
					"11":"#FFFF00",
					"12":"#0000FF",
					"13":"#FF00FF",
					"14":"#00FFFF",
					"15":"#FFFFFF"
					}  },
				"shades and tones": { "columns":6, "footnote":"colorblind-friendly", "palette": {
					"16":"#000000",
					"17":"#00005F",
					"18":"#000087",
					"19":"#0000AF",
					"20":"#0000D7",
					"21":"#0000FF",
					"22":"#005F00",
					"23":"#005F5F",
					"24":"#005F87",
					"25":"#005FAF",
					"26":"#005FD7",
					"27":"#005FFF",
					"28":"#008700",
					"29":"#00875F",
					"30":"#008787",
					"31":"#0087AF",
					"32":"#0087D7",
					"33":"#0087FF",
					"34":"#00AF00",
					"35":"#00AF5F",
					"36":"#00AF87",
					"37":"#00AFAF",
					"38":"#00AFD7",
					"39":"#00AFFF",
					"40":"#00D700",
					"41":"#00D75F",
					"42":"#00D787",
					"43":"#00D7AF",
					"44":"#00D7D7",
					"45":"#00D7FF",
					"46":"#00FF00",
					"47":"#00FF5F",
					"48":"#00FF87",
					"49":"#00FFAF",
					"50":"#00FFD7",
					"51":"#00FFFF",
					"52":"#5F0000",
					"53":"#5F005F",
					"54":"#5F0087",
					"55":"#5F00AF",
					"56":"#5F00D7",
					"57":"#5F00FF",
					"58":"#5F5F00",
					"59":"#5F5F5F",
					"60":"#5F5F87",
					"61":"#5F5FAF",
					"62":"#5F5FD7",
					"63":"#5F5FFF",
					"64":"#5F8700",
					"65":"#5F875F",
					"66":"#5F8787",
					"67":"#5F87AF",
					"68":"#5F87D7",
					"69":"#5F87FF",
					"70":"#5FAF00",
					"71":"#5FAF5F",
					"72":"#5FAF87",
					"73":"#5FAFAF",
					"74":"#5FAFD7",
					"75":"#5FAFFF",
					"76":"#5FD700",
					"77":"#5FD75F",
					"78":"#5FD787",
					"79":"#5FD7AF",
					"80":"#5FD7D7",
					"81":"#5FD7FF",
					"82":"#5FFF00",
					"83":"#5FFF5F",
					"84":"#5FFF87",
					"85":"#5FFFAF",
					"86":"#5FFFD7",
					"87":"#5FFFFF",
					"88":"#870000",
					"89":"#87005F",
					"90":"#870087",
					"91":"#8700AF",
					"92":"#8700D7",
					"93":"#8700FF",
					"94":"#875F00",
					"95":"#875F5F",
					"96":"#875F87",
					"97":"#875FAF",
					"98":"#875FD7",
					"99":"#875FFF",
					"100":"#878700",
					"101":"#87875F",
					"102":"#878787",
					"103":"#8787AF",
					"104":"#8787D7",
					"105":"#8787FF",
					"106":"#87AF00",
					"107":"#87AF5F",
					"108":"#87AF87",
					"109":"#87AFAF",
					"110":"#87AFD7",
					"111":"#87AFFF",
					"112":"#87D700",
					"113":"#87D75F",
					"114":"#87D787",
					"115":"#87D7AF",
					"116":"#87D7D7",
					"117":"#87D7FF",
					"118":"#87FF00",
					"119":"#87FF5F",
					"120":"#87FF87",
					"121":"#87FFAF",
					"122":"#87FFD7",
					"123":"#87FFFF",
					"124":"#AF0000",
					"125":"#AF005F",
					"126":"#AF0087",
					"127":"#AF00AF",
					"128":"#AF00D7",
					"129":"#AF00FF",
					"130":"#AF5F00",
					"131":"#AF5F5F",
					"132":"#AF5F87",
					"133":"#AF5FAF",
					"134":"#AF5FD7",
					"135":"#AF5FFF",
					"136":"#AF8700",
					"137":"#AF875F",
					"138":"#AF8787",
					"139":"#AF87AF",
					"140":"#AF87D7",
					"141":"#AF87FF",
					"142":"#AFAF00",
					"143":"#AFAF5F",
					"144":"#AFAF87",
					"145":"#AFAFAF",
					"146":"#AFAFD7",
					"147":"#AFAFFF",
					"148":"#AFD700",
					"149":"#AFD75F",
					"150":"#AFD787",
					"151":"#AFD7AF",
					"152":"#AFD7D7",
					"153":"#AFD7FF",
					"154":"#AFFF00",
					"155":"#AFFF5F",
					"156":"#AFFF87",
					"157":"#AFFFAF",
					"158":"#AFFFD7",
					"159":"#AFFFFF",
					"160":"#D70000",
					"161":"#D7005F",
					"162":"#D70087",
					"163":"#D700AF",
					"164":"#D700D7",
					"165":"#D700FF",
					"166":"#D75F00",
					"167":"#D75F5F",
					"168":"#D75F87",
					"169":"#D75FAF",
					"170":"#D75FD7",
					"171":"#D75FFF",
					"172":"#D78700",
					"173":"#D7875F",
					"174":"#D78787",
					"175":"#D787AF",
					"176":"#D787D7",
					"177":"#D787FF",
					"178":"#D7AF00",
					"179":"#D7AF5F",
					"180":"#D7AF87",
					"181":"#D7AFAF",
					"182":"#D7AFD7",
					"183":"#D7AFFF",
					"184":"#D7D700",
					"185":"#D7D75F",
					"186":"#D7D787",
					"187":"#D7D7AF",
					"188":"#D7D7D7",
					"189":"#D7D7FF",
					"190":"#D7FF00",
					"191":"#D7FF5F",
					"192":"#D7FF87",
					"193":"#D7FFAF",
					"194":"#D7FFD7",
					"195":"#D7FFFF",
					"196":"#FF0000",
					"197":"#FF005F",
					"198":"#FF0087",
					"199":"#FF00AF",
					"200":"#FF00D7",
					"201":"#FF00FF",
					"202":"#FF5F00",
					"203":"#FF5F5F",
					"204":"#FF5F87",
					"205":"#FF5FAF",
					"206":"#FF5FD7",
					"207":"#FF5FFF",
					"208":"#FF8700",
					"209":"#FF875F",
					"210":"#FF8787",
					"211":"#FF87AF",
					"212":"#FF87D7",
					"213":"#FF87FF",
					"214":"#FFAF00",
					"215":"#FFAF5F",
					"216":"#FFAF87",
					"217":"#FFAFAF",
					"218":"#FFAFD7",
					"219":"#FFAFFF",
					"220":"#FFD700",
					"221":"#FFD75F",
					"222":"#FFD787",
					"223":"#FFD7AF",
					"224":"#FFD7D7",
					"225":"#FFD7FF",
					"226":"#FFFF00",
					"227":"#FFFF5F",
					"228":"#FFFF87",
					"229":"#FFFFAF",
					"230":"#FFFFD7",
					"231":"#FFFFFF"
					}  },
				"grayscale colors": { "columns":24, "palette": {
					"232":"#080808",
					"233":"#121212",
					"234":"#1C1C1C",
					"235":"#262626",
					"236":"#303030",
					"237":"#3A3A3A",
					"238":"#444444",
					"239":"#4E4E4E",
					"240":"#585858",
					"241":"#626262",
					"242":"#6C6C6C",
					"243":"#767676",
					"244":"#808080",
					"245":"#8A8A8A",
					"246":"#949494",
					"247":"#9E9E9E",
					"248":"#A8A8A8",
					"249":"#B2B2B2",
					"250":"#BCBCBC",
					"251":"#C6C6C6",
					"252":"#D0D0D0",
					"253":"#DADADA",
					"254":"#E4E4E4",
					"255":"#EEEEEE"
					}  }  }  },
		"3-bit & 4-bit": { "columns":8, "requireSubindex":true, "alternatives":"lowercase", "palette": {
			"VGA": { "palette": {
				"Black": "0,0,0",
				"Red": "170,0,0",
				"Green": "0,170,0",
				"Yellow": "170,85,0",
				"Blue": "0,0,170",
				"Magenta": "170,0,170",
				"Cyan": "0,170,170",
				"White": "170,170,170",
				"Bright Black (Gray)": "85,85,85",
				"bright black": "85,85,85",
				"gray": "85,85,85",
				"Bright Red": "255,85,85",
				"Bright Green": "85,255,85",
				"Bright Yellow": "255,255,85",
				"Bright Blue": "85,85,255",
				"Bright Magenta": "255,85,255",
				"Bright Cyan": "85,255,255",
				"Bright White": "255,255,255"
				}  },
			"Windows XP Console": { "palette": {
				"Black": "0,0,0",
				"Red": "128,0,0",
				"Green": "0,128,0",
				"Yellow": "128,128,0",
				"Blue": "0,0,128",
				"Magenta": "128,0,128",
				"Cyan": "0,128,128",
				"White": "192,192,192",
				"Bright Black (Gray)": "128,128,128",
				"bright black": "128,128,128",
				"gray": "128,128,128",
				"Bright Red": "255,0,0",
				"Bright Green": "0,255,0",
				"Bright Yellow": "255,255,0",
				"Bright Blue": "0,0,255",
				"Bright Magenta": "255,0,255",
				"Bright Cyan": "0,255,255",
				"Bright White": "255,255,255"
				}  },
			"Windows PowerShell": { "palette": {
				"Black": "0,0,0",
				"Red": "128,0,0",
				"Green": "0,128,0",
				"Yellow": "238,237,240",
				"Blue": "0,0,128",
				"Magenta": "1,36,86",
				"Cyan": "0,128,128",
				"White": "192,192,192",
				"Bright Black (Gray)": "128,128,128",
				"bright black": "128,128,128",
				"gray": "128,128,128",
				"Bright Red": "255,0,0",
				"Bright Green": "0,255,0",
				"Bright Yellow": "255,255,0",
				"Bright Blue": "0,0,255",
				"Bright Magenta": "255,0,255",
				"Bright Cyan": "0,255,255",
				"Bright White": "255,255,255"
				}  },
			"Visual Studio Code": { "palette": {
				"Black": "0,0,0",
				"Red": "205,49,49",
				"Green": "13,188,121",
				"Yellow": "229,229,16",
				"Blue": "36,114,200",
				"Magenta": "188,63,188",
				"Cyan": "17,168,205",
				"White": "229,229,229",
				"Bright Black (Gray)": "102,102,102",
				"bright black": "102,102,102",
				"gray": "102,102,102",
				"Bright Red": "241,76,76",
				"Bright Green": "35,209,139",
				"Bright Yellow": "245,245,67",
				"Bright Blue": "59,142,234",
				"Bright Magenta": "214,112,214",
				"Bright Cyan": "41,184,219",
				"Bright White": "229,229,229"
				}  },
			"Windows 10 Console": { "palette": {
				"Black": "12,12,12",
				"Red": "197,15,31",
				"Green": "19,161,14",
				"Yellow": "193,156,0",
				"Blue": "0,55,218",
				"Magenta": "136,23,152",
				"Cyan": "58,150,221",
				"White": "204,204,204",
				"Bright Black (Gray)": "118,118,118",
				"bright black": "118,118,118",
				"gray": "118,118,118",
				"Bright Red": "231,72,86",
				"Bright Green": "22,198,12",
				"Bright Yellow": "249,241,165",
				"Bright Blue": "59,120,255",
				"Bright Magenta": "180,0,158",
				"Bright Cyan": "97,214,214",
				"Bright White": "242,242,242"
				}  },
			"Terminal.app": { "palette": {
				"Black": "0,0,0",
				"Red": "194,54,33",
				"Green": "37,188,36",
				"Yellow": "173,173,39",
				"Blue": "73,46,225",
				"Magenta": "211,56,211",
				"Cyan": "51,187,200",
				"White": "203,204,205",
				"Bright Black (Gray)": "129,131,131",
				"bright black": "129,131,131",
				"gray": "129,131,131",
				"Bright Red": "252,57,31",
				"Bright Green": "49,231,34",
				"Bright Yellow": "234,236,35",
				"Bright Blue": "88,51,255",
				"Bright Magenta": "249,53,248",
				"Bright Cyan": "20,240,240",
				"Bright White": "233,235,235"
				}  },
			"puTTY": { "palette": {
				"Black": "0,0,0",
				"Red": "187,0,0",
				"Green": "0,187,0",
				"Yellow": "187,187,0",
				"Blue": "0,0,187",
				"Magenta": "187,0,187",
				"Cyan": "0,187,187",
				"White": "187,187,187",
				"Bright Black (Gray)": "85,85,85",
				"bright black": "85,85,85",
				"gray": "85,85,85",
				"Bright Red": "255,85,85",
				"Bright Green": "85,255,85",
				"Bright Yellow": "255,255,85",
				"Bright Blue": "85,85,255",
				"Bright Magenta": "255,85,255",
				"Bright Cyan": "85,255,255",
				"Bright White": "255,255,255"
				}  },
			"mIRC": { "palette": {
				"Black": "0,0,0",
				"Red": "127,0,0",
				"Green": "0,147,0",
				"Yellow": "252,127,0",
				"Blue": "0,0,127",
				"Magenta": "156,0,156",
				"Cyan": "0,147,147",
				"White": "210,210,210",
				"Bright Black (Gray)": "127,127,127",
				"bright black": "127,127,127",
				"gray": "127,127,127",
				"Bright Red": "255,0,0",
				"Bright Green": "0,252,0",
				"Bright Yellow": "255,255,0",
				"Bright Blue": "0,0,252",
				"Bright Magenta": "255,0,255",
				"Bright Cyan": "0,255,255",
				"Bright White": "255,255,255"
				}  },
			"xterm": { "palette": {
				"Black": "0,0,0",
				"Red": "205,0,0",
				"Green": "0,205,0",
				"Yellow": "205,205,0",
				"Blue": "0,0,238",
				"Magenta": "205,0,205",
				"Cyan": "0,205,205",
				"White": "229,229,229",
				"Bright Black (Gray)": "127,127,127",
				"bright black": "127,127,127",
				"gray": "127,127,127",
				"Bright Red": "255,0,0",
				"Bright Green": "0,255,0",
				"Bright Yellow": "255,255,0",
				"Bright Blue": "92,92,255",
				"Bright Magenta": "255,0,255",
				"Bright Cyan": "0,255,255",
				"Bright White": "255,255,255"
				}  },
			"Ubuntu": { "palette": {
				"Black": "1,1,1",
				"Red": "225,56,43",
				"Green": "57,181,74",
				"Yellow": "255,199,6",
				"Blue": "0,111,184",
				"Magenta": "118,38,113",
				"Cyan": "44,181,233",
				"White": "204,204,204",
				"Bright Black (Gray)": "128,128,128",
				"bright black": "128,128,128",
				"gray": "128,128,128",
				"Bright Red": "255,0,0",
				"Bright Green": "0,255,0",
				"Bright Yellow": "255,255,0",
				"Bright Blue": "0,0,255",
				"Bright Magenta": "255,0,255",
				"Bright Cyan": "0,255,255",
				"Bright White": "255,255,255"
				}  },
			"Eclipse Terminal": { "palette": {
				"Black": "0,0,0",
				"Red": "205,0,0",
				"Green": "0,205,0",
				"Yellow": "205,205,0",
				"Blue": "0,0,238",
				"Magenta": "205,0,205",
				"Cyan": "0,205,205",
				"White": "229,229,229",
				"Bright Black (Gray)": "0,0,0",
				"bright black": "0,0,0",
				"gray": "0,0,0",
				"Bright Red": "255,0,0",
				"Bright Green": "0,255,0",
				"Bright Yellow": "255,255,0",
				"Bright Blue": "92,92,255",
				"Bright Magenta": "255,0,255",
				"Bright Cyan": "0,255,255",
				"Bright White": "255,255,255"
				}  }  }  }  }  }  }
);

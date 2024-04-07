//  character-encoding: UTF-8 Unix   tab-spacing: 2   word-wrap: no
//  last updated April 7, 2014

// public domain — curated/written by SoftMoon-WebWare

if (RegExp.escape)  console.warn("RegExp.escape already exists.");
else
RegExp.escape=function (string) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  return string && string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


if (Boolean.evalString)  console.warn("Boolean.evalString already exists.");
else {
	Boolean.evalString=function boolString(s, d, charset='utf-8')  {
		if (!boolString[charset])  return d;
		if (charset==='utf-8')  s=s.trim().toLowerCase();  //  ((s||"").trim().toLowerCase());
		if (boolString[charset].truthy.includes(s))  return true;
		if (boolString[charset].falsey.includes(s))  return false;
		return d;  }
	Boolean.evalString['utf-8']={                                // germ+   fr    it   greek  haw    jp     jp     pol    por    sp   thai+viet
	 truthy: ['true', 't', 'yes', 'y', 'yep', 'aye', 'affirmative', 'ja', 'oui', 'sì', 'naí', 'ae', 'hai', 'はい', 'tak', 'sim', 'sí', 'ใช่', 'chı̀'],  // source:google-translate
	 falsey: ['false', 'f', 'no', 'n', 'nope', 'nay', 'negative', 'nej', 'geen', 'non', 'nein', 'oudeís', 'ουδείς', 'aʻole', 'īe', 'いいえ', 'nei', 'negativa', 'mị̀', 'ไม่', 'không'] };
//you can adjust the language of the values above            // danish dutch   fr     germ    greek     greek    hawaiʻian  jp    jp      pol    por sp     thai  thai  viet
//you can add additional tables in other character sets
}

if (Boolean.eval)  console.warn("Boolean.eval already exists.");
else Boolean.eval=function (b, d, charset)  {
	if (typeof b === 'boolean')  return b;
	if (typeof b === 'object'
	&&  b instanceof Boolean)  return b.valueOf();
	if (typeof b === 'string')  return Boolean.evalString(b, d, charset);
	if (typeof b === 'object'
	&&  b instanceof String)  return Boolean.evalString(b.valueOf(), d, charset);
	if (typeof b === 'object'
	&&  b instanceof Number)  return Boolean(b.valueOf());
	if (typeof b === 'number'
	||  d === undefined)  return Boolean(b);
	return d;  }



if (Number.isNumeric)  console.warn('Number.isNumeric already exists.');
else Number.isNumeric=function(n)  { return  (
	((typeof n === 'number'  ||  n instanceof Number)  &&  !Number.isNaN(n))
	||  (typeof n === 'string'  &&  n.trim()!==""  &&  !Number.isNaN(Number(n))));  };

if (Number.parsePercent)  console.warn('Number.parsePercent already exists.');
else Number.parsePercent=function(s, em)  {
	if ((typeof s === 'string'  ||  s instanceof String)  &&  (s=s.trim()))  {
		if (s.endsWith('%'))  s=parseFloat(s)/100;
		else  s=parseFloat(s);  }
	else if (s instanceof Number)  {
		if (s.unit==='%')  s=s.valueOf();
		else  s=s.valueOf()/100;  }
	if (Number.isNaN(s)  ||  typeof s !== 'number')  {
		if (em)  throw new TypeError(em);
		else s=NaN;  }
	return s;  };


if (Object.hasWithin)  console.warn("Object.hasWithin already exists.");
else  Object.hasWithin=function ($O, $p)  {
	if ($O.hasOwnProperty($p))  return true;
	const props = Object.getOwnPropertyNames($O);
	for (const p of props)  {if (Object.hasWithin($O[p], $p))  return true;}
	return false;  }


if (Object.deepFreeze)  console.warn("Object.deepFreeze already exists.");
else  Object.deepFreeze=function deepFreeze($O, deep=true, cursed=[]) {
	if (deep  &&  typeof deep !== 'number')  deep=Infinity;
	if (deep)  {
		cursed.push($O);
		for (const p of Object.getOwnPropertyNames($O))  {
			if ((typeof $O[p] === "function"  ||  (typeof $O[p] === "object"  &&  !($O[p] instanceof Window)))
			&&  !cursed.includes($O[p]))
				deepFreeze($O[p], deep-1, cursed);  }
		cursed.pop();  }
  return Object.freeze($O);  }

// Existing properties can not be modified.
// New properties may be added.
if (Object.lock)  console.warn("Object.lock already exists.");
else  Object.lock=function lock($O, deep, cursed=[])  {
	if (deep  &&  typeof deep !== 'number')  deep=Infinity;
	cursed.push($O);
	for (const p of Object.getOwnPropertyNames($O))  {
		if (deep  &&  (typeof $O[p] === "function"  ||  (typeof $O[p] === 'object'  &&  !($O[p] instanceof Window)))
		&&  !cursed.includes($O[p]))
			lock($O[p], deep-1, cursed);
		const d=Object.getOwnPropertyDescriptor($O, p);
		if (d.configurable)  {
			d.configurable=false;
			if ('writable' in d)  d.writable=false;
			Object.defineProperty($O, p, d);  }  }
	cursed.pop();  }


if (Object.prototype.has)  console.warn("Object.prototype.has already exists.");
else
	//data is a random-length array of a user-defined set of “conditions” to be met
	//data members that have a “logic” property should be Arrays that are considered a sub-set of conditions
	// ¡ NOTE how NOT≡NOR but XNOT≠XNOR !
Object.defineProperty(Object.prototype, 'has', {enumerable:false, configurable:true, writable:true,
	value: function has(data, filter)  { // filter-function should return true if each data “condition” is met, false if not
		var logic= data.logic || 'and',   // data.logic should be either:  'and'  'or'  'nor'  'not'  'nand'  'xor'  'xnor'  'xnot'
				xFlag=false, i, c=0;
		if (logic==='nor')  logic='not'
		for (i=0;  i<data.length;  i++)  {  //        the Object (Element) ↓↓ or String in question
			if (data[i].logic ?  has.call(this, data[i], filter)  :  filter(this, data[i]))
				switch (logic)  {               //                       the condition ↑↑ to be met
				case 'not':  return false;
				case 'or':  return true;
				case 'xor':  if (xFlag)  return false;  else  xFlag=true;  }
			else switch (logic)  {
				case 'and':  return false;
				case 'xnot':  if (xFlag)  return false;  else  xFlag=true;  continue;
				case 'xnor':
				case 'nand':  c++;  }  }
		return logic==='and' || logic==='not' || xFlag || (logic==='nand' && c<i) || (logic==='xnor' && (c===0 || c===i));  }});

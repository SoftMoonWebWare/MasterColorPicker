//  character-encoding: UTF-8 Unix   tab-spacing: 2   word-wrap: no
//  last updated May 9, 2022

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


if (Object.lock)  console.warn("Object.lock already exists.");
else  Object.lock=function(o, deep)  {
	// ¡¡¡ this function is NOT INFINATELY-RECURSION PROOF !!!
	// ¡¡¡ deep objects may not reference shallow objects !!!
	if (deep  &&  typeof deep !== 'number')  deep=Infinity;
	const
		props=Object.getOwnPropertyNames(o),
		cycled=new Array;
	for (const p of props)  {
		if (deep  &&  typeof o[p] === 'object')  Object.lock(o[p], deep-1);
		const d=Object.getOwnPropertyDescriptor(o, p);
		if (d.configurable)  {
			d.configurable=false;
			if ('writable' in d)  d.writable=false;
			Object.defineProperty(o, p, d);  }  }  }


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



if (Boolean.evalString)  console.warn("Boolean.evalSring already exists.")
else {
	Boolean.evalString=function boolString(s, d, charset='utf-8')  {
		if (!boolString[charset])  return Boolean(d);
		if (charset==='utf-8')  s=s.trim().toLowerCase();  //  ((s||"").trim().toLowerCase());
		if (boolString[charset].truthy.includes(s))  return true;
		if (boolString[charset].falsey.includes(s))  return false;
		return Boolean(d);  }
	Boolean.evalString['utf-8']={                                // germ+   fr    it   greek  haw    jp     jp     pol    por    sp   thai+viet
	 truthy: ['true', 't', 'yes', 'y', 'yep', 'aye', 'affirmative', 'ja', 'oui', 'sì', 'naí', 'ae', 'hai', 'はい', 'tak', 'sim', 'sí', 'ใช่', 'chı̀'],  // source:google-translate
	 falsey: ['false', 'f', 'no', 'n', 'nope', 'nay', 'negative', 'nej', 'geen', 'non', 'nein', 'oudeís', 'ουδείς', 'aʻole', 'īe', 'いいえ', 'nei', 'negativa', 'mị̀', 'ไม่', 'không'] };
//you can adjust the language of the values above            // danish dutch   fr     germ    greek     greek    hawaiʻian  jp    jp      pol    por sp     thai  thai  viet
//you can add additional tables in other character sets
}

if (Boolean.eval)  console.warn("Boolean.eval already exists.")
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
	return Boolean(d);  }


if (Object.lock)  console.warn("Object.lock already exists.");
else  Object.lock=function(o, deep)  {
	if (deep  &&  typeof deep !== 'number')  deep=Infinity;
	const props=Object.getOwnPropertyNames(o);
	for (const p of props)  {
		if (deep  &&  typeof o[p] === 'object')  Object.lock(o[p], deep-1);
		const d=Object.getOwnPropertyDescriptor(o, p);
		if (d.configurable)  {
			d.configurable=false;
			if ('writable' in d)  d.writable=false;
			Object.defineProperty(o, p, d);  }  }  }

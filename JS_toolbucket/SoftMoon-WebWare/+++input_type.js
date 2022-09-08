//  character-encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160
/*   written by and Copyright © 2019, 2022 Joe Golembieski, SoftMoon WebWare */

// input type='numeric' Feb 5, 2019; rewritten May 13, 2022; last updated July 21, 2022
// input type='file…………'  April 20, 2022

'use strict';

/*   The SoftMoon property is usually a constant defined in a “pinnicle” file somewhere else
if (!SoftMoon)  var SoftMoon={};
if (!SoftMoon.WebWare)  Object.defineProperty(SoftMoon, 'WebWare', {value: {}, enumerable: true});
*/

window.addEventListener("load", function plusplusplusInput() {
	const inps=document.getElementsByTagName('input');
	for (const input of inps)  { if (input.hasAttribute('type'))  switch (input.getAttribute('type')?.toLowerCase())  {
		case 'numeric':
		case 'numeric-slider':  SoftMoon.WebWare.register_input_type_numeric(input);
		break;
		case 'filename':
		case 'filepath': SoftMoon.WebWare.register_input_type_file(input);  }  }  });


Object.defineProperty(SoftMoon, 'illegalFilenameChars', {value: [':', '*', '?', '"', '<', '>', '|'], enumerable: true});

SoftMoon.WebWare.filename_safe=function filename_safe($name, $replacement="", $forbidPaths=true, $allowReversePaths=false)  {
	$name=$name.trim();
	for (const except of SoftMoon.illegalFilenameChars)  {
		$name=$name.replaceAll(except, $replacement);  }
	if ($forbidPaths)  {
		$name=$name.replaceAll('/', $replacement);
		$name=$name.replaceAll('\\', $replacement);  }
	else if (!$allowReversePaths)
		$name=$name.replaceAll('..', $replacement);
	$name=$name.replaceAll( /[\x00-\x1F]/g , $replacement);
	$name=$name.replace( /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])/ , '_$1_');
	return $name;  }


SoftMoon.WebWare.register_input_type_file=function register_input_type_file(input)	{  // type= filename ‖ filepath

	input.addEventListener('keydown', function(event)  {
		if (SoftMoon.illegalFilenameChars.includes(event.key)
		||  (this.getAttribute('type')==='filename'
				&&  (event.key==='/'  ||  event.key==='\\')))  event.preventDefault();  });

	input.addEventListener('paste', function(event) {
		var len,
				curPos=this.selectionStart,
				data=event.clipboardData.getData('text');
		len=data.length;
		data=this.value.substr(0,curPos)+data+this.value.substr(this.selectionEnd||curPos);
		this.value=SoftMoon.WebWare.filename_safe(data,
									this.getAttribute('replacement-char') || "",
									this.getAttribute('type')==='filename',
									this.hasAttribute('allow-reverse-paths'));
		this.selectionStart=
		this.selectionEnd=curPos+len;
		event.preventDefault();  });  }



SoftMoon.WebWare.register_input_type_numeric=function register_input_type_numeric(input)	{

	const
		iBase=parseInt(input.getAttribute('base')) || 10,
		iType=input.getAttribute('type'),
		units=input.getAttribute('units')?.split(',').map(u=>u.trim());
	if (iType==='numeric-slider'  &&  iBase!==10)  throw new Error('“numeric-slider” <input> types must use base 10.');
	if (units  &&  iBase!==10)  throw new Error('“numeric” <input> types with a “units” attribute must use base 10.');
	if (iType==='numeric-slider'  &&  units)  throw new Error('“numeric-slider” <input> types may not use a “units” attribute.');

	input.units=units;  //you may modify this Array of units in real-time; the “units” attribute is only read once when first registered…

	function reset_type() {return iType==='numeric-slider' ? 'range' : (input.units ? 'text' : 'number');}
	function getValueUnitIndex() {return /[^-0-9.]/.exec(input.value)?.index;}
  function usesUnit(data) {
		const unit=data.match(/^([-−\d.]*)([\D]+)$/);
		if (unit  &&  input.units)  for (const u of input.units)  {
			if (u.toUpperCase()===unit[2])  {unit[2]=u;  return unit;}  }
		return false;  }

	if (iBase<=10)  {
		/* In the past (not sure now), browsers returned ambiguous “unpredictable” variable “typeof” values to JavaScript when using <input type='number'>
		 * sometimes a string value, sometimes a numeric value, sometimes a string with multiple decimals removed (yet shown to the user)
		 * and it was a bowl of spagetti soup preventing JavaScript from properly managing the said input’s value.
		 * So we convert to “text” on-the-fly (where the value is always a string) while end-user-editing, and then back to “number”
		 * so the end-user can click on the step-up and step-down arrows with a mouse using the native browser interface.
		 */
		// The hope is that by changing the type to text BEFORE the click that gives focus to the input, the cursor-position will not be reset to the beginning.
		// This is, unfortunately, not the case.
		//input.addEventListener('mousedown', function() {if (this.type!=='text')  this.type='text';});
		switch (iType)  {
		case 'numeric':
			input.addEventListener('focus', function() {if (this.type!=='text')  {this.type='text';  this.focus();  this.selectionStart=this.value.length;}});
			if (units)  input.addEventListener('blur', function()  {
				if (this.value)  {
				  for (const unit of this.units)  {if (this.value.endsWith(unit))  return;}
				  this.value+=this.units[0];  }  });
		break;
		case 'numeric-slider':
			input.addEventListener('keydown', function(event) {
				if (this.type!=='text'
				&&  ((event.key>='0' && event.key<='9')  ||  event.key==='NumLock'))  {
					this.type='text';
					if (event.key!=='NumLock')  this.value="";  //event.key;  //Firefox will still add the keystroke to the text-input
					this.focus();
					this.selectionStart=this.value.length;  }  });  }
		input.addEventListener('change', function(event)  {
			const v=parseFloat(this.value);
			if (this.hasAttribute('min')  &&  (this.value===""  ||  v<parseFloat(this.getAttribute('min'))))  this.value=this.getAttribute('min');
			else
			if (this.hasAttribute('max')  &&  v>parseFloat(this.getAttribute('max')))  this.value=this.getAttribute('max');  });
		input.addEventListener('blur', function() {this.type= reset_type();});
		input.type= reset_type();  }
	else
		input.addEventListener('blur', function() {this.value=this.value.toUpperCase();});

	input.addEventListener('beforeinput', function(event)  {
		var s, allowNegative, allowDecimal, uIndex,
				data=event.data?.toUpperCase();
		if (!data)  return;
		const
			base=parseInt(this.getAttribute('base')) || 10,
			testAllowNegative=() => allowNegative=(!this.hasAttribute('min')  ||  parseFloat(this.getAttribute('min'))<0),
			testAllowDecimal=() => allowDecimal=(!this.hasAttribute('step')  ||  (s=this.getAttribute('step'))==='any'  ||  s.includes('.')),
			cleanNum=(data) => data.replace(RegExp('[^' + (testAllowNegative() ? '-−' : "") + (testAllowDecimal() ? '.' : "") + '\\d]', "g"), ""),
			addData=(doAdd) => {
				const curPos=this.selectionStart;
				data=this.value.substr(0,curPos)+data+this.value.substr(this.selectionEnd||curPos);
				if (doAdd)  {
					this.value=data;
					event.preventDefault();
					this.selectionStart=
					this.selectionEnd=curPos+data.length;  }  };
		if (data.length===1)  {  // all keypress events and single-character paste events
			if (data>='0'  &&  data<(base>9 ? ':' : base.toString()))  {  // ←  the colan  :  is one ASCII point beyond   9
				if (this.units
				&&  typeof (uIndex=getValueUnitIndex()) === 'number'
				&&  this.selectionStart > uIndex)  event.preventDefault();
				return;  }
			if  (base>10  &&  data>='A'  &&  data.charCodeAt(0)<55+base)  {
				if (data!==event.data)  addData(true);
				return;  }
			if (base===10)  switch (data)  {
				case '-':  // ← standard dash (typically masquerades as a negative sign)
				case '−':  // ← true mathematical minus/negative sign (not typically found on a keyboard)
					if (testAllowNegative()
					&&  !this.value.includes('-')  &&  !this.value.includes('−')
					&&  this.selectionStart===0)  return;
				break;
				case '.':
					if (testAllowDecimal()
					&&  !this.value.includes('.'))  return;
				break;
				default:
					event.preventDefault();
					if (this.selectionStart!==this.value.length
					||  /[^-0-9.]/.test(this.value))  return;
					for (const unit of this.units)  { if (unit.substr(0,1).toUpperCase()===data)  {
						data=unit;  addData(true);  return;  }  }  }
			event.preventDefault();  return;  }
		else  {  //text was pasted (or a “foreign” OS returns a two-character value for a single keystroke)
			if (base<10)
				data=data.replace(RegExp('[^0-' + (base-1) + ']', "g"), "");
			else if (base===10)  {
				const unit=usesUnit(data);
				if (unit)  data=cleanNum(unit[1])+unit[2];
				else  data=cleanNum(data);  }
			else  // base>10
				data=data.replace(RegExp('[^\\dA-' + String.fromCharCode(54+base) + ']', "g"), "");
			addData(data!==event.data);
			if (base===10)  {
				var i;
				const old=data;
				if (allowDecimal)  {if ((i=data.indexOf('.')+1)>0)   data=data.substr(0,i)+data.substr(i).replace( /\./g, "");}
				else  data=data.replace( /\./g, "");
				if (allowNegative)  data=data.substr(0,1)+data.substr(1).replace( /-−/g, "");
				else  data=data.replace( /-−/g, "");
				if (old!==data)  {
				//the cursor position may be adversely affectled if a decimal point is removed past the current cursor postion,
				//or the input was corrupted with a negative sign past the cursor position
					const curPos=this.selectionStart;
					this.value=data;
					event.preventDefault();
					this.selectionStart=
					this.selectionEnd=curPos-(old.length-data.length);  }  }  }  });

	input.addEventListener('keydown', function(event)  {
		if (this.units  &&  event.key==='Backspace')  {
			const uIndex=getValueUnitIndex();
			if (typeof uIndex === 'number'  &&  this.selectionStart>uIndex)  {
				this.value=this.value.substr(0, uIndex);
				event.preventDefault();  }
			return;  }
		if (event.key==='ArrowUp'  &&  !(event.altKey || event.ctrlKey || event.shiftKey))  { // up arrow key ↑
			stepUp.call(this);  event.preventDefault();  return;  }
		if (event.key==='ArrowDown'  &&  !(event.altKey || event.ctrlKey || event.shiftKey))  { // down arrow key ↓
			stepDown.call(this);  event.preventDefault();  return;  }  });

	input.stepUp=stepUp;
	input.stepDown=stepDown;

	function stepUp()  {
		const
			base= parseInt(this.getAttribute('base')) || 10,
			step= (base===10 ? parseFloat(this.getAttribute('step')) : parseInt(this.getAttribute('step'), base)) || 1,
			min=  this.getAttribute('min'),
			max=  this.getAttribute('max'),
			val= (base===10) ? parseFloat(this.value) : parseInt(this.value, base);
		if (base===10)  {
			if ((min  &&  val+step < parseFloat(min))
			||  (max  &&  val+step > parseFloat(max)))  return;
			const unit= usesUnit(this.value.toUpperCase());
			this.value=((val+step) + (unit?.[2] || ""));  }
		else  {
			if ((min  &&  val+step < parseInt(min, base))
			||  (max  &&  val+step > parseint(max, base)))  return;
			this.value=Math.round(val+step).toString(base).toUpperCase();  }  }
	function stepDown()  {
		const
			base= parseInt(this.getAttribute('base')) || 10,
			step= (base===10 ? parseFloat(this.getAttribute('step')) : parseInt(this.getAttribute('step'), base)) || 1,
			min=  this.getAttribute('min'),
			max=  this.getAttribute('max'),
			val= (base===10) ? parseFloat(this.value) : parseInt(this.value, base);
		if (base===10)  {
			if ((min  &&  val-step < parseFloat(min))
			||  (max  &&  val-step > parseFloat(max)))  return;
			const unit= usesUnit(this.value.toUpperCase());
			this.value=((val-step) + (unit?.[2] || ""));  }
		else  {
			if ((min  &&  val-step < parseInt(min, base))
			||  (max  &&  val-step > parseint(max, base)))  return;
			this.value=Math.round(val-step).toString(base).toUpperCase();  }  }  }

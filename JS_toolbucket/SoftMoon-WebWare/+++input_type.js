//  character-encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160
/*   written by and Copyright © 2019, 2022 Joe Golembieski, SoftMoon WebWare */

// input type='numeric' Feb 5, 2019; rewritten May 13, 2022
// input type='file…………'  April 20, 2022

'use strict';

/*   The SoftMoon property is usually a constant defined in a “pinnicle” file somewhere else
if (!SoftMoon)  var SoftMoon={};
if (!SoftMoon.WebWare)  Object.defineProperty(SoftMoon, 'WebWare', {value: {}, enumerable: true});
*/

window.addEventListener("load", function plusplusplusInput() {
	const inps=document.getElementsByTagName('input');
	for (const input of inps)  { if (input.hasAttribute('type'))  switch (input.getAttribute('type')?.toLowerCase())  {
		case 'numeric':  SoftMoon.WebWare.register_input_type_numeric(input);
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

	const iBase=parseInt(input.getAttribute('base')) || 10;

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
		input.addEventListener('focus', function() {if (this.type!=='text')  {this.type='text';  this.focus();  this.selectionStart=this.value.length;}});
		input.addEventListener('blur', function() {this.type='number';});
		input.type='number';  }
	else
		input.addEventListener('blur', function() {this.value=this.value.toUpperCase();});

	input.addEventListener('beforeinput', function(event)  {
		var s, allowNegative, allowDecimal,
				data=event.data?.toUpperCase();
		if (!data)  return;
		const
			base=parseInt(this.getAttribute('base')) || 10,
			testAllowNegative=() => allowNegative=(!this.hasAttribute('min')  ||  parseFloat(this.getAttribute('min'))<0),
			testAllowDecimal=() => allowDecimal=(!this.hasAttribute('step')  ||  (s=this.getAttribute('step'))==='any'  ||  s.includes('.')),
			addData=(doAdd) => {
				const curPos=this.selectionStart;
				data=this.value.substr(0,curPos)+data+this.value.substr(this.selectionEnd||curPos);
				if (doAdd)  {
					this.value=data;
					event.preventDefault();
					this.selectionStart=
					this.selectionEnd=curPos+data.length;  }  };
		if (data.length===1)  {  // all keypress events and single-character paste events
			if (data>='0'  &&  data<(base>9 ? ':' : base.toString()))  return;  // ←  the colan  :  is one ASCII point beyond   9
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
				&&  !this.value.includes('.'))  return;  }
			event.preventDefault();  return;  }
		else  {  //text was pasted (or a “foreign” OS returns a two-character value for a single keystroke)
			if (base<10)
				data=data.replace(RegExp('[^0-' + (base-1) + ']', "g"), "");
			else if (base===10)
				data=data.replace(RegExp('[^' + (testAllowNegative() ? '-−' : "") + (testAllowDecimal() ? '.' : "") + '\\d]', "g"), "");
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
		if (event.key==='ArrowUp'  &&  !(event.altKey || event.ctrlKey || event.shiftKey))  { // up arrow key ↑
			stepUp.call(this);  event.preventDefault();  return;  }
		if (event.key==='ArrowDown'  &&  !(event.altKey || event.ctrlKey || event.shiftKey))  { // down arrow key ↓
			stepDown.call(this);  event.preventDefault();  return;  }  });

	input.stepUp=stepUp;
	input.stepDown=stepDown;

	function stepUp()  {
		const
			base= parseInt(this.getAttribute('base')) || 10,
			step= parseInt(this.getAttribute('step'), base) || 1;
		this.value= (base===10) ?
			(parseFloat(this.value)+step)
		: Math.round(parseInt(this.value, base)+step).toString(base).toUpperCase();  }
	function stepDown()  {
		const
			base= parseInt(this.getAttribute('base')) || 10,
			step= parseInt(this.getAttribute('step'), base) || 1;
		this.value= (base===10) ?
			(parseFloat(this.value)-step)
		: Math.round(parseInt(this.value, base)-step).toString(base).toUpperCase();  }  }

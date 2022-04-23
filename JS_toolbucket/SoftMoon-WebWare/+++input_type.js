//  character-encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 160
/*   written by and Copyright © 2019, 2022 Joe Golembieski, SoftMoon WebWare */

// input type='numeric' Feb 5, 2019
// input type='file…………'  April 20, 2022
'use strict';
/*   The SoftMoon property is usually a constant defined in a “pinnicle” file somewhere else
if (!SoftMoon)  var SoftMoon={};
if (!SoftMoon.WebWare)  Object.defineProperty(SoftMoon, 'WebWare', {value: {}, enumerable: true});
*/
Object.defineProperty(SoftMoon, 'illegalFilenameChars', {value: [':', '*', '?', '"', '<', '>', '|'], enumerable: true});

SoftMoon.WebWare.filename_safe=function filename_safe($name, $replacement="", $forbidPaths=true, $forwardPathsOnly=true)  {
	$name=$name.trim();
	for (const except of SoftMoon.illegalFilenameChars)  {
		$name=$name.replaceAll(except, $replacement);  }
	if ($forbidPaths)  {
		$name=$name.replaceAll('/', $replacement);
		$name=$name.replaceAll('\\', $replacement);  }
	else if ($forwardPathsOnly)
		$name=$name.replaceAll('..', $replacement);
	$name=$name.replaceAll( /[\x00-\x1F]/g , $replacement);
	$name=$name.replace( /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])/ , '_$1_');
	return $name;  }


window.addEventListener("load", function plusplusplusInput() {
	const inps=document.getElementsByTagName('input');
	for (const input of inps)  { if (input.hasAttribute('type'))  switch (input.getAttribute('type')?.toLowerCase())  {
		case 'numeric':  SoftMoon.WebWare.register_input_type_numeric(input);
		break;
		case 'filename':
		case 'filepath': SoftMoon.WebWare.register_input_type_file(input);  }  }  });


SoftMoon.WebWare.register_input_type_numeric=function register_input_type_numeric(input)	{

		const iBase=parseInt(input.getAttribute('base')) || 10;

		if (iBase<=10)  {
			// The hope is that by changing the type to text BEFORE the click that gives focus to the input, the cursor-position will not be reset to the beginning.
			// This is, unfortunately, not the case.
			//input.addEventListener('mousedown', function() {if (this.type!=='text')  this.type='text';});
			input.addEventListener('focus', function() {if (this.type!=='text')  {this.type='text';  this.focus();  this.selectionStart=this.value.length;}});
			input.addEventListener('blur', function() {try {this.type='number';} catch(e){this.type='text'}});
			try {input.type='number';} catch(e){input.type='text'}  }
		else  {
			input.addEventListener('blur', function() {this.value=this.value.toUpperCase();});
			input.addEventListener('keypress', function(event)  {
				var letter=String.fromCharCode(event.charCode).toUpperCase();
				//console.log(letter+"   charCode="+event.charCode+"   keyCode="+event.keyCode+"   key"+event.key);
				if (letter>='A'  &&  letter<='Z')  { //note keydown (below) will filter out improper letters before getting here
					var curPos=this.selectionStart;
					this.value=this.value.substr(0,curPos)+letter+this.value.substr(this.selectionEnd||curPos);
					this.selectionStart=
					this.selectionEnd=curPos+1;
					event.preventDefault();  }  });  }


		input.addEventListener('keydown', function(event)  {
			if (event.keyCode===38  && !(event.altKey || event.ctrlKey || event.shiftKey))  { // up arrow key ↑
				stepUp.call(this);  event.preventDefault();  return;  }
			if (event.keyCode===40  && !(event.altKey || event.ctrlKey || event.shiftKey))  { // down arrow key ↓
				stepDown.call(this);  event.preventDefault();  return;  }
			// base, in theory, can be any integer >1, but should not exceed 36 - that uses all numbers and letters.
			// However, the “onpaste” handler below only recognizes bases 2,8,10,16
			var s,
					base=parseInt(this.getAttribute('base')) || 10,
					maxNum=(base>10 ? 10 : base),
					keepKey=(
				(event.keyCode<48 && event.keyCode!==32) || event.keyCode==144  //basic function keys (not spacebar) and numlock
			|| (event.keyCode>=112  && event.keyCode<=123) //F1-F12
			|| (event.ctrlKey  &&  !event.shiftKey  &&  !event.altKey
					&&  (event.keyCode===67  ||  event.keyCode===86  ||  event.keyCode===88)) //copy, paste, cut
			|| (!(event.altKey || event.ctrlKey)  &&  event.keyCode>=65  &&  event.keyCode<=54+base)   // a-z (i.e. a-f for hex)
			|| ( !(event.altKey || event.ctrlKey || event.shiftKey)
					&& (   (event.keyCode>=48  &&  event.keyCode<=47+maxNum)  //numbers above letters
							|| (event.keyCode>=96  &&  event.keyCode<=95+maxNum)  //number keypad
							|| ((event.keyCode==109 || event.keyCode==173)  &&  base===10
									&&  (!this.hasAttribute('min')  ||  parseFloat(this.getAttribute('min'))<0)
									&&  this.value.indexOf('-')<0
									&&  (this.value.length===0 || this.selectionStart===0))   // ←↑negative sign -
							|| ((event.keyCode==110 || event.keyCode==190)  &&  base===10 // ←↓decimal & period .
									&&  this.value.indexOf('.')<0
									&&  this.hasAttribute('step')
									&&  ((s=this.getAttribute('step'))==='any'  ||  s.indexOf('.')>=0) )   )));
			if (!keepKey)  event.preventDefault();
			//console.log('value='+this.value);
			//console.log('keyCode='+event.keyCode+'   ¿keepKey='+keepKey+'   base='+base+'   step='+s);
			//console.log('cursorPos='+this.selectionStart);
			});


		input.addEventListener('paste', function(event) {
			var i, s, len,
					curPos=this.selectionStart,
					data=event.clipboardData.getData('text'),
					base=this.getAttribute('base') || '10';
			switch (base)  {
			case '2': data=data.replace( /[^12]/g , "");       break;
			case '8': data=data.replace( /[^1-8]/g , "");      break;
			case '10': data=data.replace( /[^-.\d]/g , "");    break;
			case '16': data=data.replace( /[^a-f\d]/ig , "");  break;  }
			len=data.length;
			data=this.value.substr(0,curPos)+data+this.value.substr(this.selectionEnd||curPos);
			if (base==='10')  {
				if (this.hasAttribute('step')  &&  ((s=this.getAttribute('step'))==='any'  ||  s.indexOf('.')>=0))  {
					if ((i=data.indexOf('.')+1)>0)   data=data.substr(0,i)+data.substr(i).replace( /\./g, "");  }
				else  data=data.replace( /\./g, "");
				if (!this.hasAttribute('min')  ||  parseFloat(this.getAttribute('min'))<0)
					data=data.substr(0,1)+data.substr(1).replace( /-/g, "");
				else data=data.replace( /-/g, "");  }
			this.value=data;
			this.selectionStart=
			this.selectionEnd=curPos+len;
			event.preventDefault();  });


		input.stepUp=stepUp;
		input.stepDown=stepDown;


	function stepUp()  {
		var base= parseInt(this.getAttribute('base')) || 10,
				step= parseInt(this.getAttribute('step'), base) || 1;
		this.value= (base===10) ?
			(parseFloat(this.value)+step)
		: Math.round(parseInt(this.value, base)+step).toString(base).toUpperCase();  }
	function stepDown()  {
		var base= parseInt(this.getAttribute('base')) || 10,
				step= parseInt(this.getAttribute('step'), base) || 1;
		this.value= (base===10) ?
			(parseFloat(this.value)-step)
		: Math.round(parseInt(this.value, base)-step).toString(base).toUpperCase();  }  }


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
										this.hasAttribute('forward-paths-only'));
			this.selectionStart=
			this.selectionEnd=curPos+len;
			event.preventDefault();  });  }

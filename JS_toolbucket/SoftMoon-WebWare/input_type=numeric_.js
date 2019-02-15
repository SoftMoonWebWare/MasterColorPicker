// input type='numeric' Feb 5, 2019
window.addEventListener("load", function() {
	var i, iBase
			inps=document.getElementsByTagName('input');

	for (i=0; i<inps.length; i++)  {
	 if (inps[i].hasAttribute('type')  &&  inps[i].getAttribute('type').toLowerCase()==='numeric')  {

		iBase=parseInt(inps[i].getAttribute('base')) || 10;

		if (iBase<=10)  {
			// The hope is that by changing the type to text BEFORE the click that gives focus to the input, the cursor-position will not be reset to the beginning.
			// This is, unfortunately, not the case.
			//inps[i].addEventListener('mousedown', function() {if (this.type!=='text')  this.type='text';});
			inps[i].addEventListener('focus', function() {if (this.type!=='text')  {this.type='text';  this.focus();  this.selectionStart=this.value.length;}});
			inps[i].addEventListener('blur', function() {try {this.type='number';} catch(e){this.type='text'}});
			try {inps[i].type='number';} catch(e){inps[i].type='text'}  }
		else  {
			inps[i].addEventListener('blur', function() {this.value=this.value.toUpperCase();});
			inps[i].addEventListener('keypress', function(event)  {
				var letter=String.fromCharCode(event.charCode).toUpperCase();
				//console.log(letter+"   charCode="+event.charCode+"   keyCode="+event.keyCode+"   key"+event.key);
				if (letter>='A'  &&  letter<='Z')  { //note keydown (below) will filter out improper letters before getting here
					var curPos=this.selectionStart;
					this.value=this.value.substr(0,curPos)+letter+this.value.substr(this.selectionEnd||curPos);
					this.selectionStart=
					this.selectionEnd=curPos+1;
					event.preventDefault();  }  });  }


		inps[i].addEventListener('keydown', function(event)  {
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


		inps[i].addEventListener('paste', function(event) {
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


		inps[i].stepUp=stepUp;
		inps[i].stepDown=stepDown;
	}  }

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
		: Math.round(parseInt(this.value, base)-step).toString(base).toUpperCase();  }
});

/* March 12, 2015
 *
 *  Aloha! and Mahalo for reading these comments.
	The “Stylesheet” constructor is copied to the global namespace to be useful to other scripts (besides SoftMoon WebWare’s)
especially as it is more-or-less universal “example code”, not “our” code.
	If this cluttters or conflicts with your workspace, you may simply override the global “Stylesheet” constructor.
All SoftMoon-WebWare code that use this “Stylesheet” constructor refer to SoftMoon.WebWare.Stylesheet only.
 */

if (typeof SoftMoon !== 'object')  SoftMoon={WebWare: new Object};


// If you set the  title  attribute of the <link> that loads the styleSheet, you may pass in a string
//  containing that title attrubute value to reference the styleSheet.
// Or you may pass in the indexNumber of the styleSheet or simply the styleSheet itself.
SoftMoon.WebWare.Stylesheet=function(ss)  { var i;
	if (typeof ss == 'number')  ss=document.styleSheets[ss];
	else if (typeof ss == 'string')  for (i=0; i<document.styleSheets.length; i++)  {
		if (document.styleSheets[i].title===ss)  {ss=document.styleSheets[i];  break;}  }
	this.ss=ss;
	this.initLength=this.getRules().length;  }

SoftMoon.WebWare.Stylesheet.prototype.getRules=function()  {return  this.ss.cssRules || this.ss.rules;}

// pass in a string of the selector text.
// returns an array of indexNumbers that refer to that rule, in ¡reverse order! found in the stylesheet.
// returns null if no match is found.
SoftMoon.WebWare.Stylesheet.prototype.getRuleIndexes=function(s)  {
	var rules=this.getRules();
	if (!rules)  return null;
	var i, found=new Array;
	if (s instanceof RegExp)
		for (i=rules.length; --i>=0;)  {if (rules[i].selectorText.match(s))  found.push(i);}
	else
		for (i=rules.length; --i>=0;)  {if (rules[i].selectorText===s)  found.push(i);}
	if (found.length>0)  return found;  }

SoftMoon.WebWare.Stylesheet.prototype.insertRule=function(selector, styles, n)  {
	if (typeof n != 'number')  n=this.getRules().length;
	if (this.ss.insertRule)  this.ss.insertRule(selector+'{'+styles+'}', n);
	else
	if (this.ss.addRule)  this.ss.addRule(selector, styles, n);
	return n;  }

SoftMoon.WebWare.Stylesheet.prototype.deleteRule=function(n)  {
	if (typeof n == 'string')  n=getRuleIndexes(n);
	else
	if (typeof n == 'number')  n=[n];
	else
	if (!n instanceof Array)  n=[this.getRules().length-1];
	for (var i=0; i<n.length; i++)  {
		if (this.ss.deleteRule)  this.ss.deleteRule(n);
		else
		if (this.ss.removeRule)  this.ss.removeRule(n);  }
	return n;  }


Stylesheet=SoftMoon.WebWare.Stylesheet;

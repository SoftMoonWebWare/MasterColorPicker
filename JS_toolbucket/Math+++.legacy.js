// charset=UTF-8
//  Math+++.legaacy.js
//	circa 2011, edited February 2019

//  JavaScript needs (1) constants, and (2) true UTF8 support for variable names…
if (typeof _ !== 'object')  _=new Array();  // can't think of why this should be an array, but why limit ourselves in the future?
_['12°']=Math.PI/30;
_['24°']=Math.PI/15;
_['30°']=Math.PI/6;
_['60°']=Math.PI/3;
_['90°']=Math.PI/2;
_['360°']=Math.PI*2;
_['π×2']=Math.PI*2;
_['π']  =Math.PI;
_['π÷2']=Math.PI/2;
_['π×3÷2']=Math.PI*3/2;
_['1÷3']=1/3;

//rounds  x  to  dp  decimal places.
if (typeof Math.roundTo !== 'function')
	Math.roundTo=function(x, dp)  {return Math.round(x*Math.pow(10,dp))/Math.pow(10,dp);}

// a “sawtooth” in the sense below is the infinite set of numbers from 0 to p.
// The Math.sawtooth() periodic function below will return the same result as x%p (a.k.a. x modulus p)
//  when both x and p are positive or negative.
// However, opposing signs:  sawtooth(-x,p)  or  sawtooth(x,-p)  do NOT equal the equivelent modulus
// Instead, the sawtooth ALWAYS progresses in the “direction” of p (does not reverse direction for negative numbers),
//  so:   Math.sawtooth(-10,360) = 350   and   Math.sawtooth(-850, 360) = 230
//  whereas:   (-10 % 360) = -10         and        (-850 % 360) = -130
if (typeof Math.sawtooth !== 'function')  Math.sawtooth=function(p,x)  {return x-Math.floor(x/p)*p;};
else console.log('Math.sawtooth already exists');

if (typeof Math.deg !== 'function')  Math.deg=Math.sawtooth.bind(Math, 360);
else console.log('Math.deg already exists');

if (typeof Math.rad !== 'function')  Math.rad=Math.sawtooth.bind(Math, Math.PI*2);
else console.log('Math.rad already exists');


if (typeof Math._2hex !== 'function')
	Math._2hex=function(d)  {return ((Math.round(d)<16) ? "0" : "") + Math.round(d).toString(16).toUpperCase();}

if (typeof Math.Trig !== 'object')  Math.Trig={};

Math.Trig.getAngle=function(x, y, hwRatio)  { var angle;
	if (typeof hwRatio !== 'number')  hwRatio=1;
	if (x==0)  angle=Math.PI/2;
	else  angle=Math.atan( Math.abs(y/x) / hwRatio );
	if (x<0  &&  y>0)  return  Math.PI-angle;
	if (x<=0  &&  y<=0)  return  Math.PI+angle;
	if (x>=0  &&  y<0)  return  _['π×2']-angle;
	return angle;  }

// In a circle, if you divide the circumference into 360 equal segments, each segment corresponds to 1 degree (1°).
// This is not so with an ellipse.  This method will adjust the angle passed in ($a) accordingly based on the value
//  of the height/width ratio ($hw) of a symmetrical ellipse (a.k.a. an oval).
Math.Trig.ovalizeAngle=function($a, $hw)  {
	$a=Math.rad($a);
	if ($a===0)  return $a;
	if (_['π×3÷2'] < $a)  return  _['π×2'] - Math.atan(Math.tan(_['π×2'] - $a) * $hw);
	if (_['π'] < $a)  return  _['π'] + Math.atan(Math.tan($a - _['π']) * $hw);
	if (_['π÷2'] < $a)  return  _['π'] - Math.atan(Math.tan(_['π'] - $a) * $hw);
	return  Math.atan(Math.tan($a) * $hw);  }

Math.Trig.polarToCartesian=function(r, a)  {a=Math.rad(a);  return {x: r*Math.cos(a),  y: r*Math.sin(a)};}

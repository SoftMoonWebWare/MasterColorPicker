// charset=UTF-8
//  +++Math.js
//	April 3, 2023

//  JavaScript needs true full UTF-8 support for variable & constant names…

Math['+++angleDefiners']={
	'12°':   {enumerable: true,  value: Math.PI/30  },
	'24°':   {enumerable: true,  value: Math.PI/15  },
	'30°':   {enumerable: true,  value: Math.PI/6   },
	'60°':   {enumerable: true,  value: Math.PI/3   },
	'90°':   {enumerable: true,  value: Math.PI/2   },
	'180°':  {enumerable: true,  value: Math.PI     },
	'270°':  {enumerable: true,  value: Math.PI*3/2 },
	'360°':  {enumerable: true,  value: Math.PI*2   },
	'π×2':   {enumerable: true,  value: Math.PI*2   },
	'π×3÷2': {enumerable: true,  value: Math.PI*3/2 },
	'π':     {enumerable: true,  value: Math.PI     },
	'π÷2':   {enumerable: true,  value: Math.PI/2   }  };

if (typeof Math.Trig !== 'object')  Math.Trig={};
else console.log('Math.Trig already exists');

Object.defineProperties(Math.Trig, Math['+++angleDefiners']);

const
	_=  Object.defineProperties(new Array, Math['+++angleDefiners']), // can't think of why this should be an array, but why limit ourselves in the future?
	_12deg=    Math.PI/30 ,
	_24deg=    Math.PI/15 ,
	_30deg=    Math.PI/6  ,
	_60deg=    Math.PI/3  ,
	_90deg=    Math.PI/2  ,
	_180deg=   Math.PI    ,
	_270deg=   Math.PI*3/2,
	_360deg=   Math.PI*2  ,
	_2PI=      Math.PI*2  ,
	_3PI_2=    Math.PI*3/2,
	_PI=       Math.PI    ,
	_PI_2=     Math.PI/2  ;

delete Math['+++angleDefiners'];

Math.Trig.degToRad=function(d) {return (d/360)*_2PI}

for (let a=0; a<360; a++)  {_['_'+a+'deg']=Math.Trig.degToRad(a);}


//rounds  x  to  dp  decimal places.
if (typeof Math.roundTo !== 'function')
	Math.roundTo=function(dp, x)  {return Math.round(x*Math.pow(10,dp))/Math.pow(10,dp);}
else console.log('Math.roundTo already exists');


if (typeof Math._2hex !== 'function')
	Math._2hex=function(d)  {return ((Math.round(d)<16) ? "0" : "") + Math.round(d).toString(16).toUpperCase();}
else console.log('Math._2hex already exists');


Math.Trig.getAngle=function(x, y, hwRatio)  { var angle;
	if (typeof hwRatio !== 'number')  hwRatio=1;
	if (x==0)  {
		if (y==0) return 0;
		else angle=_PI_2;  }
	else  angle=Math.atan( Math.abs(y/x) / hwRatio );
	if (x<0  &&  y>0)  return  _PI-angle;
	if (x<=0  &&  y<=0)  return  _PI+angle;
	if (x>=0  &&  y<0)  return  _2PI-angle;
	return angle;  }


Math.Trig.angleUnitFactors=
	Object.defineProperties(new Object, {
		'deg':  {value: 360,       enumerable: true},
		"°":    {value: 360,       enumerable: true},
		'rad':  {value: 2*Math.PI, enumerable: true},
		"ᶜ":    {value: 2*Math.PI, enumerable: true},
		"ᴿ":    {value: 2*Math.PI, enumerable: true},
		'grad': {value: 400,       enumerable: true},
		'ᵍ':    {value: 400,       enumerable: true},
		"%":    {value: 100,       enumerable: true},
		'turn': {value: 1,         enumerable: true},
		"●":    {value: 1,         enumerable: true}  });

Math.Trig.readAngle=function(angle, unitIn, unitOut)  {
	angle=angle.trim().match( /^(-?[0-9]+(?:\.[0-9]*)?|-?0?\.[0-9]+)(deg|°|g?rad|ᴿ|ᶜ|ᵍ|%|turn|●)?$/ );
	if (angle===null)  throw new Error('malformed angle or unknown angle unit');
	return (angle[1]/Math.Trig.angleUnitFactors[angle[2] || unitIn]) * Math.Trig.angleUnitFactors[unitOut];  }



// a “sawtooth” in the sense below is the infinite set of numbers from 0 (inclusive) to p (noninclusive).
// The Math.sawtooth(p,x) periodic function below will return the
//  same result as x%p (a.k.a. x modulus p) (excepting round-off errors)
//  when both x and p are positive or negative.
// However, opposing signs:  sawtooth(p,-x)  or  sawtooth(-p,x)  do NOT equal the equivalent modulus
// Instead, the sawtooth ALWAYS progresses in the “direction” of p (does not reverse direction for negative numbers),
//  so:   Math.sawtooth(360, -10) = 350  and   Math.sawtooth(360, -850) = 230
//  whereas:   (-10 % 360) = -10         and        (-850 % 360) = -130


if (typeof Math.sawtooth !== 'function')  Math.sawtooth=function(p,x)  {return x-Math.floor(x/p)*p;};
else console.log('Math.sawtooth already exists');

if (typeof Math.deg !== 'function')  Math.deg=Math.sawtooth.bind(Math, 360);
else console.log('Math.deg already exists');

if (typeof Math.rad !== 'function')  Math.rad=Math.sawtooth.bind(Math, _2PI);
else console.log('Math.rad already exists');

if (typeof Math.turn !== 'function')  Math.turn=Math.sawtooth.bind(Math, 1);
else console.log('Math.turn already exists');

/*

if (typeof Math.sawtoothAt !== 'function')  Math.sawtoothAt=function(s,e,x) {return Math.sawtooth(e-s, x-s)+s};
else console.log('Math.sawtoothAt already exists');

 */


// In a circle, if you divide the circumference into 360 equal segments, each segment corresponds to 1 degree (1°).
// This is not so with an ellipse.  This method will adjust the angle passed in ($a) accordingly based on the value
//  of the height/width ratio ($hw) of a symmetrical ellipse (a.k.a. an oval).
Math.Trig.ellipseAngle=function($a, $hw)  {  // $a is given in radians;  value returned is in radians
	if (($a=Math.rad($a))===0)  return 0;
	if (_3PI_2 < $a)  return  _2PI - Math.atan(Math.tan(_2PI - $a) * $hw);
	if (_PI < $a)  return  _PI + Math.atan(Math.tan($a - _PI) * $hw);
	if (_PI_2 < $a)  return  _PI - Math.atan(Math.tan(_PI - $a) * $hw);
	return  Math.atan(Math.tan($a) * $hw);  }


Math.Trig.polarToCartesian=function(r, a)  {a=Math.rad(a);  return {x: r*Math.cos(a),  y: r*Math.sin(a)};}


Math.Trig.rotate=function($p, $angle)  {
	var x=$p.x*cos($angle)-$p.y*sin($angle);
	$p.y=$p.y*cos($angle)+$p.x*sin($angle);
	$p.x=x;  }

Math.Trig.rotate_around=function($p, $angle, $center)  {
	$p.x=$p.x-$center.x;  $p.y=$center.y-$p.y;
	var x=$center.x + ($p.x*cos($angle)-$p.y*sin($angle));
	$p.y=$center.y - ($p.y*cos($angle)+$p.x*sin($angle));
	$p.x=x;  }

Math.Trig.rotate_box=function ($box, $rotation)  {
	$rotation=Math.rad($rotation);
	var x,y,x1,y1,x2,y2,p;
	y=( -( y1=y2=$box.height/2 ) );
	x=( -( x1=x2=$box.width/2 ) );
	Math.Trig.rotate(p={x:x1, y:y}, $rotation);  x1=p.x;
	Math.Trig.rotate(p={x:x2, y:y2}, $rotation);  x2=p.x;  y2=p.y;
	Math.Trig.rotate(p={x:x, y:y1}, $rotation);  y1=p.y;
	$box.width= Math.round(Math.max(Math.abs(x1), Math.abs(x2))*2)+1;
	$box.height=Math.round(Math.max(Math.abs(y1), Math.abs(y2))*2)+1;  }

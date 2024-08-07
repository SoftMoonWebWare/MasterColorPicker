// charset=UTF-8
//  +++Math.js
//  July 25, 2024


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
/*
	_PI_2=     Math.PI/2  ,
	_PI=       Math.PI    ,
	_3PI_2=    Math.PI*3/2,
	_2PI=      Math.PI*2  ,
 */
	 π_2=      Math.PI/2  ,
		 π=      Math.PI    ,
	π3_2=      Math.PI*3/2,
		π2=      Math.PI*2  ,

		 φ=1.618033988749894848204586834,
		 Φ=0.618033988749894848204586834;


delete Math['+++angleDefiners'];

Math.Trig.degToRad=function(d) {return (d/360)*π2}

for (let a=0; a<360; a++)  {_['_'+a+'deg']=Math.Trig.degToRad(a);}


//rounds  x  to  dp  decimal places. … usually … (pesky floating point errors may occur)
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
		else angle=π_2;  }
	else  angle=Math.atan( Math.abs(y/x) / hwRatio );
	if (x<0  &&  y>0)  return  π-angle;
	if (x<=0  &&  y<=0)  return  π+angle;
	if (x>=0  &&  y<0)  return  π2-angle;
	return angle;  }


Math.Trig.angleUnitFactors=
	Object.defineProperties(new Object, {
		'deg':  {value: 360, enumerable: true},
		"°":    {value: 360, enumerable: true},
		'rad':  {value: π2,  enumerable: true},
		"ᶜ":    {value: π2,  enumerable: true},
		"ᴿ":    {value: π2,  enumerable: true},
		'grad': {value: 400, enumerable: true},
		'ᵍ':    {value: 400, enumerable: true},
		"%":    {value: 100, enumerable: true},
		'turn': {value: 1,   enumerable: true},
		"●":    {value: 1,   enumerable: true}  });

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

//((angle % 360) + 360) % 360  ← https://github.com/color-js/color.js/blob/main/src/angles.js
if (typeof Math.deg !== 'function')  Math.deg=Math.sawtooth.bind(Math, 360);
else console.log('Math.deg already exists');

if (typeof Math.rad !== 'function')  Math.rad=Math.sawtooth.bind(Math, π2);
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
	if (π3_2 < $a)  return  π2 - Math.atan(Math.tan(π2 - $a) * $hw);
	if (π < $a)  return  π + Math.atan(Math.tan($a - π) * $hw);
	if (π_2 < $a)  return  π - Math.atan(Math.tan(π - $a) * $hw);
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

Math.Trig.rotate_box=function($box, $rotation)  {
	$rotation=Math.rad($rotation);
	var x,y,x1,y1,x2,y2,p;
	y=( -( y1=y2=$box.height/2 ) );
	x=( -( x1=x2=$box.width/2 ) );
	Math.Trig.rotate(p={x:x1, y:y}, $rotation);  x1=p.x;
	Math.Trig.rotate(p={x:x2, y:y2}, $rotation);  x2=p.x;  y2=p.y;
	Math.Trig.rotate(p={x:x, y:y1}, $rotation);  y1=p.y;
	$box.width= Math.round(Math.max(Math.abs(x1), Math.abs(x2))*2)+1;
	$box.height=Math.round(Math.max(Math.abs(y1), Math.abs(y2))*2)+1;  }


Math.mul_3_3_matrix=function(M, Vin)  {
	return [
			Vin[0]*M[0][0] + Vin[1]*M[0][1] + Vin[2]*M[0][2],
			Vin[0]*M[1][0] + Vin[1]*M[1][1] + Vin[2]*M[1][2],
			Vin[0]*M[2][0] + Vin[1]*M[2][1] + Vin[2]*M[2][2] ];  }

Math.invert_3_3_matrix=function(M)  {
	// https://byjus.com/maths/inverse-of-3-by-3-matrix/
	// https://byjus.com/maths/determinant-of-a-3x3-matrix/
	const determinant= M[0][0]*(M[1][1]*M[2][2] - M[1][2]*M[2][1])  -  M[0][1]*(M[1][0]*M[2][2] - M[1][2]*M[2][0])  +  M[0][2]*(M[1][0]*M[2][1] - M[1][1]*M[2][0]);
	if (determinant===0)  return false;
	return [
		[  M[1][1] * M[2][2] - M[1][2] * M[2][1],   -(M[0][1] * M[2][2] - M[0][2] * M[2][1]),    M[0][1] * M[1][2] - M[0][2] * M[1][1] ].map(x=>x/determinant),
		[-(M[1][0] * M[2][2] - M[1][2] * M[2][0]),    M[0][0] * M[2][2] - M[0][2] * M[2][0],   -(M[0][0] * M[1][2] - M[0][2] * M[1][0])].map(x=>x/determinant),
		[  M[1][0] * M[2][1] - M[1][1] * M[2][0],   -(M[0][0] * M[2][1] - M[0][1] * M[2][0]),    M[0][0] * M[1][1] - M[0][1] * M[1][0] ].map(x=>x/determinant) ];  }

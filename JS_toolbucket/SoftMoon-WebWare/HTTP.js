/*  charset="UTF-8"
	HTTP.js  version 2.2.4  January 26, 2024
	Copyright © 2013, 2017, 2018, 2020, 2021, 2022, 2024 by Joe Golembieski, SoftMoon-WebWare.

		This program is licensed under the SoftMoon Humane Use License ONLY to “humane entities” that qualify under the terms of said license.
		For qualified “humane entities”, this program is free software:
		you can use it, redistribute it, and/or modify it
		under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version, with the following additional requirements
		ADDED BY THE ORIGINAL SOFTWARE CREATOR AND LICENSOR that supersede any possible GNU license definitions:
		This original copyright and licensing information and requirements must remain intact at the top of the source-code.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of:
		 • the SoftMoon Humane Use License
		and
		 • the GNU General Public License
		along with this program.  If not, see:
			https://softmoon-webware.com/humane-use-license/
			https://www.gnu.org/licenses/
		*/

//  character-encoding: UTF-8 UNIX     includes extended character set in comments example:  far-east asian: Chinese and Japanese
//  tab-spacing: 2   word-wrap: no   standard-line-length: 160   full-line-length: 2400

/*
	To Use:

	connector = new HTTP(…)   ← ← see this file just below the HTTP-constructor function for comments on arguments passed in

	myconnection = HTTP.Connection('http://mywebsite.net/mypage.htm', HTTP_not_possible_Error, logError)   ←  HTTP_not_possible_Error may be:
			• a handler-function   ←  returns ==false  ← no thrown Error, and  myconnection  will =null
						or  ↑  returns any of the following other options for HTTP_not_possible_Error:
			• a string Error message for a thrown Error  (¡ the empty string ""  equates  no_HTTT_Possible_Error == false !)
			• any Object that will then be thrown
			• boolean  true  to throw the generic Error that was originally generated.
			---¡ however !---  if logError==true, the Error message will be logged in the console, but no Error will be thrown, and  myconnection  will =null.
	===== or use =====
	myconnection = HTTP.Connection('http://mywebsite.net/mypage.htm')   ←  no error will be thrown, and  myconnection  will =null if no HTTP is possible
	===== or use =====
	myconnection = HTTP.Connection({ … properties descriptor object … })   ←  with or without  HTTP_not_possible_Error, logErr  as the second & third argument.
      the properties of the { … properties descriptor object … } may be anything you want to set/add to the connection object
      including a  .url  property, the methods and properties listed below, XHR2 properties, as well as any user-defined-properties.
      ¡note however that  connector.commune()  controls the  onreadystatechange  handler-method!


	myconnection.onFileLoad = function(userArgs… … …)  {……optional…your code is passed userArgs from connector.commune()……}
	myconnection.loadError = function(userArgs… … …)  {……optional handler for file load errors……}   ←  myconnect.errorMessage holds the error
	myConnection.tryAgain = function(userArgs… … …)  {……optional handler replaces the standard method to handle:
				connection timeouts,  url-redirects,  and unknown server response codes……}
	myconnection.onStatus = {}  ← this optional object may hold custom status-code methods.
        ¡¡ NOTE that these methods of “onStatus” are applied to the “myconnection” object and passed all “userArgs” !!
				myconnection.onStatus[201] and
				myconnection.onStatus[301] will override connector.autoshuttle_201 and myconnection.onMultiple respectively.
				myconnection.onStatus[4••] will override myconnection.loadError.
				if the custom “myconnection.onStatus[myconnection.status](userArgs,… … …)” method
				returns Boolean “false”, the custom “myconnection.onComplete(userArgs,… … …)” method
				and possibly then the standard handler will be invoked.
	myconnection.onComplete = function(userArgs… … …)  {……optional handler may replace the standard -
				use to handle ranges of status codes.
				myconnection.onStatus always gets first try and can override this and the standard method.
				if the custom “myconnection.onComplete(userArgs,… … …)” method
				returns Boolean “false” the standard handler will be invoked.……}
	myconnection.onMultiple = HTTP.handleMultiple    ← ↓ you may optionally use this inhouse function or create your own or use nothing and the loadError handler will handle it
	myconnection.onMultiple = function(userArgs… … …)  {……optional handler when the server has multiple choices for the given url……}
	myconnection.method="GET" ‖ "POST" ‖ "HEAD"   ← optional, defaults to "GET"
	/==== for queried connnections:
	myconnection.getQuery=HTTP.URIEncodeObject(…object…) || myGetQueryString;
	myconnection.postData=HTTP.URIEncodeObject(…object…) || myPostQueryString;  // ← setting this property automatically sets  myconnection.method = 'POST'

	connector.commune(myconnection [, userArgs,… … …])   ←  pass in any number of user arguments to be passed on to all your event handlers

	myconnection_2 = HTTP.Connection('http://mywebsite.net/anotherpage.htm')
	=== set the onFileLoad, loadError, etc… methods for myconnection_2 ===
	=== note you could use the same handlers for both connections, and pass them different arguments through connector.commune ===

	connector.commune(myconnection_2 [, userArgs,… … …])   ← you can use the same connector for multiple connections
	// or you could create a new connector with different protocol for timeouts, autoShuttles, and redirects.
	// access to data on your personal, quick “home-base server” may require completely different situational and
	//  interface configurations from another widely-used, slow, overworked server…

 */

'use strict';

/*   The SoftMoon property is usually a global constant defined in a “pinnicle” file somewhere else
const SoftMoon=Object.defineProperty({}, "WebWare", {value: {}, enumerable: true});
*/

{  // open a private namespace

SoftMoon.WebWare.HTTP=HTTP;


//constructor function:
function HTTP(maxAttempts, timeoutDelay, retryDelayIncrease, retryDelayBuffer, autoShuttle_201, redirectMax)  {
	if (typeof maxAttempts === 'number')  this.maxAttempts=maxAttempts;
	if (typeof timeoutDelay === 'number')  this.timeoutDelay=timeoutDelay;
	if (typeof retryDelayIncrease === 'number')  this.retryDelayIncrease=retryDelayIncrease;
	if (typeof retryDelayBuffer === 'number')  this.retryDelayBuffer=retryDelayBuffer;
	if (typeof autoShuttle_201 === 'boolean')  this.autoShuttle_201=autoShuttle_201;
	if (typeof redirectMax === 'number')  this.redirectMax=redirectMax;
	Object.defineProperty(this, 'connections', {value: [], enumerable: true});  }


HTTP.prototype.maxAttempts=3;  // how many times we should try to connect when there is no response from the server, or we get an unrecognized response status code
HTTP.prototype.timeoutDelay=25000;  //25 seconds  =  how long to wait for a response from the remote server before giving up and possibly trying again
// ¡NOTE above! if you set the “timeout” property of the connection object (an XHR2 property of an XMLHttpRequest Object) it will be used
//              and “timeoutDelay” and it’s related properties below will NOT be used.
HTTP.prototype.retryDelayIncrease=5000;   // added to the timeoutDelay each time we make another attempt (may be positive or negative)    ← response is usually fast, so if we are waiting a while, there is probably an internet connection error or server error, fixed by simply trying again.  However, the server may just be overwhelmed and slow to respond, so waiting a little longer each time we try again may be prudent.
HTTP.prototype.retryDelayBuffer=2000;  // how long to wait between each attempt to retry a connection
HTTP.prototype.autoShuttle_201=true;  // whether or not to shuttle (redirect) an HTTP request upon a 201 response header
HTTP.prototype.redirectMax=7;  // how many redirects allowed before a load error (201 and 3xx status codes send by server)
HTTP.prototype.restrictURL=false;  // restrict URLs to the RegExp below:

//  This restricts HTTP requests to urls with the given format.
//  Also, with 201 “auto-shuttle” redirects (when the server is saying,
//   “OK, I created the new content you requested, find it at this url…”)
//   if the responseText matches the given format (and is less than 2000 characters),
//   the HTTP-connector will use it as the new url as opposed to the “location” response header.
HTTP.prototype.RegExp={url: new RegExp( "^((https?:\/\/)?([.]{1,2}\/)?([a-z][-_a-z0-9]*[.])+([a-z]{2,6})(\/[-._~@!$&'()\0x5B\0x5D+,;=%a-z0-9]*)*\/?([?][-._~:\/?#@!$&'()\0x5B\0x5D*+,;=%a-z0-9]*)?)|(([-._~#@!$&'()\0x5B\0x5D+,;=%a-z0-9]*)*\/?([?][-._~:\/?#@!$&'()\0x5B\0x5D*+,;=%a-z0-9]*)?)$", 'i')};



HTTP.Connection=function(url /* or PropertiesObject */ , err, logErr)  {
	try  {
		var o, p, connection=new XMLHttpRequest();  }
	catch(e)  {  // if the implementation does not support HTTP requests
		if (err  &&  (typeof err!=='function'  ||  (err=err(e))))  switch (typeof err)  {
			case 'object':  throw err;
			case 'string':  if (err!=="")  {if (logErr)  console.error(err);  else  throw new Error(err);}
			default: if (logErr)  console.error(e.message);  else  throw e;  }
		return null;  }
	var postData;
	Object.defineProperty(connection, 'postData', { enumerable: true,
		set: function(q) {postData=q;  this.method='POST';},
		get: function() {return postData;} });
	connection.reset=function(url) {this.attempts=0;  this.redirects=0;  if (url) {this.url=url;}  return this};
	if (typeof url === 'object')  {
		o=url;  url=null;
		for (p in o) {connection[p]=o[p];}  }
	return connection.reset(url);  }



HTTP.prototype.commune=function(connection)  {
	var userArgs=Array.prototype.slice.call(arguments, 1),
			thisConnector=this,
			timer;

	if (this.restrictURL  &&  !this.RegExp.url.test(connection.url))

    connection.errorNotice="Improper “url” for HTTP request: \n “"+connection.url+"”\n No connection attempt made.";

	else if (HTTP.redirectFilter(connection))  {  // url is OK as given or was changed to a new redirected url

		if (!this.connections.includes(connection))  this.connections.push(connection);
		if (typeof connection.tryAgain !== 'function')  connection.tryAgain=function()  { //try «attempts» times, then stop and wait until called upon again
			if (connection.attempts<thisConnector.maxAttempts)  {
				connection.trying=true;
				if (!thisConnector.connections.includes(connection))  thisConnector.connections.push(connection);
				setTimeout(function() { var passArgs=userArgs.slice(0);  passArgs.unshift(connection);
					thisConnector.commune.apply(thisConnector, passArgs);  },
				thisConnector.retryDelayBuffer );  }
			else  {
				connection.trying=false;  connection.failed=true;
				if (typeof connection.loadError === 'function')  connection.loadError(thisConnector);  }  }
		connection.attempts++;
		if (!connection.ontimeout)  connection.ontimeout=function()  {
			//¿does the possiblility occur that the browser may implement this ontimeout method “automatically”?
			//¿that is, will it trigger a timeout after, say for instance, 2 minutes, on it’s own without setting the “timeout” property?
			//if so, and “timeoutDelay” is longer than the automatic timeout delay, we need to clear the timeout.
			if (connection.readyState<3)  {connection.abort();  clearTimeout(timer);  connection.tryAgain.apply(connection, userArgs);}  };
		if (!connection.timeout  &&  this.timeoutDelay)  timer=setTimeout(
			connection.ontimeout,
			this.timeoutDelay+(connection.attempts-1)*this.retryDelayIncrease );

		connection.onreadystatechange=function()  {
			if (connection.readyState>=3  &&  timer)  clearTimeout(timer);
			if (connection.readyState!=4)  return;
			connection.trying=false;
			const i=thisConnector.connections.indexOf(connection);
			if (i>=0)  thisConnector.connections.splice(i, 1);
			if (typeof connection.onStatus === 'object'
			&&  typeof connection.onStatus[connection.status] === 'function'
			&&  connection.onStatus[connection.status].apply(connection, userArgs) !== false)  // ¡¡NOTE how the methods of “onStatus” are applied to the “connection” object!!
				return;  //if your custom onStatus handler method returns Boolean: “false”, the “onComplete” and then possibly the “standard” handlers below will be used.
			if (typeof connection.onComplete == 'function'
			&&  connection.onComplete.apply(connection, userArgs) !== false)
				return;  //if your custom onStatus handler method returns Boolean: “false”, the standard handler below will be used.
			status:  { switch (connection.status)  {
				case 200:
				case 202:
				case 203:
				case 204: if (typeof connection.onFileLoad === 'function')  connection.onFileLoad.apply(connection, userArgs);
									break status;
				case 300: if (typeof connection.onMultiple === 'function')  {  //multiple choices offered by the server - user must choose one.  responseText should hold more info
										var passArgs=userArgs.slice(0);  passArgs.unshift(thisConnector);
										connection.onMultiple.apply(connection, passArgs);
										break status;  }
									connection.errorNotice='Server requires choosing file from multiple choices; no “onMultiple” method supplied.'
				case 400:
				case 401:
				case 402:
				case 403:
				case 404:
				case 410: if (typeof connection.loadError === 'function')
											connection.loadError.apply(connection, userArgs);
								break status;
				case 301: HTTP.setPermanentRedirect(connection);  //this is a permanent redirect; below are temporary or “other”
							/* fall through to redirect by response header [307] */
				case 201: if (connection.status===201)  {
										if (thisConnector.autoShuttle_201)  {
											if (connection.responseText.length<2001
											&&  thisConnector.RegExp.url.test(connection.responseText))  {
												if (thisConnector.redirect(connection, connection.responseText, userArgs))  {
													connection.method="GET";  delete connection.getQuery;  delete connection.postData;
													connection.tryAgain.apply(connection, userArgs);  }
												break status;  }
											else  {/* fall through to redirect by response header */}  }
										else {connection.onFileLoad.apply(connection, userArgs);  break status;}  }
				case 302:
				case 303: if (connection.status===302 || connection.status===303)  {
										connection.method="GET";  delete connection.getQuery;  delete connection.postData;  }
				case 305:
				case 307: if (thisConnector.redirect(connection, connection.getResponseHeader('location'), userArgs)===false)  break status;
				default:  connection.tryAgain.apply(connection, userArgs);  }  }
			if (thisConnector.connections.length===0
			&&  typeof thisConnector.onComplete === 'function')  thisConnector.onComplete();  }

		var postData;
		if (typeof connection.method === 'string')  connection.method=connection.method.toUpperCase();
		switch (connection.method)  {
			case "POST":  postData=connection.postData;
			case "GET":
			case "HEAD":  break;
			default: connection.method="GET";  }
		connection.open(connection.method, connection.url+(connection.getQuery ? ("?"+connection.getQuery) : ""));
		if (typeof connection.requestHeaders === 'object')  for (var rh in connection.requestHeaders)  {
			connection.setRequestHeader(rh, connection.requestHeaders[rh]); }
		connection.send(postData || null);
		connection.trying=true;
		return true;  }

	else  { /* Url was redirected circularly */ }

	clearTimeout(timer);
	if (typeof connection.loadError == 'function')  connection.loadError.apply(connection, userArgs);
	connection.failed=true;
	return false;  }


//avoid calling this method yourself unless you fully understand what you are doing
HTTP.prototype.redirect=function(connection, url, userArgs)  {
	if (!(connection.triedURLs instanceof Array))  connection.triedURLs=new Array;
	connection.triedURLs.push(connection.url);
	connection.url=url;
	connection.attempts=0;
	if ( ++connection.redirects > this.redirectMax)  {
		connection.errorNotice='More url redirects than allowed for. (max='+this.redirectMax+')';
		if (typeof connection.loadError == 'function')
			connection.loadError.apply(connection, userArgs);
		return false;  }
	return true;  }


HTTP.redirectFilter=function(connection)  { var url=connection.url, unredirected=true;
	while (unredirected)  {
		for (var i=0; i<HTTP.redirectList.length; i++)  {
			if (HTTP.redirectList[i].substring(0, url.length+1)===url+' ')  {
				url=HTTP.redirectList[i].substring(url.length+1);  break;  }  }
		unredirected=false;  }
	if (connection.triedURLs instanceof Array)
		for (i=0; i<connection.triedURLs.length; i++)  {
			if (url===connection.triedURLs[i])  {
				connection.errorNotice='Url was redirected circularly to a url that was already tried by this connection.';
				connection.url=null;
				return false;  }  }
	return connection.url=url;  }


HTTP.setPermanentRedirect=function(connection)  {  var i, rd, rdTo=connection.getResponseHeader('location');
	for (var i=0; i<HTTP.redirectList.length; i++)  {
		rd=HTTP.redirectList[i].split(' ');  //  ←  ← yields →  [0: redirectFrom, 1: redirectTo]
		if (connection.url===rd[0]  ||  rdTo===rd[0])  return;  }

	HTTP.redirectList.push(connection.url+' '+rdTo);
	document.cookie='HTTP_RedirectList='+encodeURIComponent(HTTP.redirectList.join(','))+'; maxAge=2764800';  //32 days
}


HTTP.redirectList=new Array();
	var i, cookies=document.cookie;
	cookies=cookies.split(';');
	for (i=0; i<cookies.length; i++)  {
		if (cookies[i].substring(0, 16)==='HTTPRedirectList')  {
			HTTP.redirectList=decodeURIComponent(cookies[i].substring(16)).split(',');  break;  }  }



//encodes data for an HTTP request body (using POST) or URI-query (using GET)
// for POST:  .setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  .send(HTTP.URIEncodeObject(o));
// for GET:  .open('GET', url+'?'+HTTP.URIEncodeObject(o));
HTTP.URIEncodeObject=function(o, encodeMethods)  {
	if (typeof o !== 'object')  return "";
	var a=new Array;
	for (const p in o)  { if (typeof p === 'function'  &&  !encodeMethods)  continue;
		let s=o[p];  if (typeof s !== 'string')  s=s?.toString();
		a.push(encodeURIComponent(p).replace('%20', '+') + "=" + encodeURIComponent(s).replace('%20', '+'));  }
	return a.join("&");  }



//You may use this function below as a method for your connection Object, if you choose.
//It recognizes three additional optional properties of your connection Object:
//  connection.filename  ← a human-readable filename (as opposed to the url).
//  connection.fileinfo  ← some human-readable infomation about what this file should be.
//  connection.handleMultiple_elementId  ← overrides the default value found at:  HTTP.handleMultiple.HTML_Element_id
//If you asynchronously load two or more files, each offering multiple choices,
//  you will need to either:
//   •give each connection its own HTML element “id” to display the messages allowing the user to choose the correct file, or
//   •supply a single HTML Element as a wrapper in your original page HTML.  See the next paragraph.
//The HTML-Element for displaying the on-Multiple-File dialog need not be included in the original page HTML;
// (¡nor in the response.text - the response.text is instead added to the element!)
// the element will be created dynamically if not already in the document, and removed when the user makes their choice.
// However, if you do include the on-Multiple-File dialog Element in the original document,
//  a new <div> will be added as a last-child of that element ***with no id or class to identify it***
//  and that anonymous <div> will be removed when the user has made their choice.
//
//You will of course need to style the added notice using CSS.
/* ***  suggested example CSS  ***
		**  use one ¡or! the other identifier.
		**  If you have more than one handleMultiple choose-file-dialog that may open at the same time,
		**   simply use the second identifier AND include a:
		**     <div id="HTTP_handleMultipleFileDownloadChoises"></div>
		**   in your document. (note this may be any element, not only div, and may even contain pre-existing content.)
		**   The second-level div (containing the multiple file dialog) will be added & removed dynamically by the script.
		**  If you only need to manage multiple file choices for one filename,
		**   use the first identifier with no additional HTML markup to your document

#HTTP_handleMultipleFileDownloadChoises {
#HTTP_handleMultipleFileDownloadChoises div {

	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	padding: 2.618em;
	color: white;
	background-color: black; }
#HTTP_handleMultipleFileDownloadChoises h1 {
	font-size: 1.618em;
	color: red; }
#HTTP_handleMultipleFileDownloadChoises h1
#HTTP_handleMultipleFileDownloadChoises p {
	margin-bottom: 1em; }
#HTTP_handleMultipleFileDownloadChoises span.url,
#HTTP_handleMultipleFileDownloadChoises label {
	font-family: monospace;
	display: block;
	width: 85.4%;  }   ≈ Φ + (1-Φ)*Φ

	 ***  *************  ***/
HTTP.handleMultiple=function handleMultiple(connector)  {
	if (this === HTTP)  throw new Error('“HTTP.handleMulptile” is meant to be a method of an HTTP connection object');
	this.trying=true;
	if (!connector.connections.includes(this))  connector.connections.push(this);
	var userArgs=Array.prototype.slice.call(arguments, 1),
			notice=document.createElement('div');
			container;
	notice.innerHTML='<h1>attention sentients</h1>\n'+
		'<p>The server has notified this automation that a requested file download has multiple choices available.&nbsp;\n'+
		(this.filename ? ('The file requested is '+this.filename+'.&nbsp;\n') : "")+
		(this.fileinfo ? this.fileinfo : "")+
		'The file <abbr>URL</abbr> requested is: '+
		'<span class="url">'+this.url+'</span></p>\n'+
		'<p>More specific information from the server may be given below.</p>\n'+
		'<label>Please enter the selection of you choice: <select></select></label>\n'+
		'<label><input type="checkbox"> remember this selection in the future</label>\n'+
		'<input type="button" value="Get File" />\n'+
		'<input type="button" value="abort" />\n';
	var response=this.responseText.split("\n<!-- end URL list -->\n"),
			urls=response[0].split("\n"),
	    op, sel=notice.getElementsByTagName('select')[0],
	    dat, html, pre;
	op=document.createElement('option');  op.value="";
	op.appendChild(document.createTextNode("choose one"));
  sel.appendChild(op);
	for (var i=0; i<urls.length; i++)  {
		dat=urls[i].split('\t');
		op=document.createElement('option');  op.value=dat[0];  op.title=dat[2];
		op.appendChild(document.createTextNode(dat[1]));
	  sel.appendChild(op);  }
	if (( /html/i ).test(this.getResponseHeader('Content-Type')))  {
		html=document.createDocumentFragment();  html.innerHTML=response[1];
		notice.appendChild(html);  }
	else  {
	  pre=document.createElement('pre');  pre.appendChild(document.createTextNode(response[1]))
		notice.appendChild(pre);  }
/* note your response from the server should contain something similar to below
                             →   note this arrow represents a “tab” character ("\t") and values following the second → become a title for the option: the words “Chinese” and “Japanese” in this example.

http://mydomain.com/mypage/en→English
http://mydomain.com/mypage/es→Español
http://mydomain.com/mypage/fr→Français
http://mydomain.com/mypage/it→Italiano
http://mydomain.com/mypage/pt→Português
http://mydomain.com/mypage/pl→Polski
http://mydomain.com/mypage/zh→中文→Chinese
http://mydomain.com/mypage/jp→日本語→Japanese
<!-- end URL list -->
<!-- you MUST include the above line formatted as an HTML comment IF you have further detailed info, but
     this HTML below could be simple text if you return your response without an HTML content type -->
<h2>Special detailed info:</h2>
<p>Now I can tell you some more about what these choices offer you … … …</p>
<p>And more info</p>
<table> … … … a tabular description of each choice … … … </table>

*/

	notice.id= (this.handleMultiple_elementId) ?
		( (container=document.getElementById(this.handleMultiple_elementId))  ?  ""  :  this.handleMultiple_elementId )
	: handleMultiple.HTML_Element_id;
	container=(container || document);
	container.appendChild(notice);

	var inp=notice.getElementsByTagName('input'),
			connection=this;
	inp[1].onclick=function()  {
		var url=sel.options[sel.selectedIndex].value;
		if (url  &&  connector.redirect(connection, url, userArgs))  {
			if (inp[0].checked)  HTTP.setPermanentRedirect(connection);
			container.removeChild(notice);
			connection.tryAgain.apply(connection, userArgs);  }  }
	inp[2].onclick=function()  {
		if (confirm('Do you want to abort loading '+(connection.filename || 'this file')+'?'))  {
			container.removeChild(notice);
			connection.trying=false;
			const i=connector.connections.indexOf(connection);
			if (i>=0)  connector.connections.splice(i, 1);
			if (connector.connections.length===0
			&&  typeof connector.onComplete === 'function')  connector.onComplete();  }
		else
			inp[0].focus();  }
	setTimeout(function() {inp[0].focus();}, 0);  }

HTTP.handleMultiple.HTML_Element_id='HTTP_handleMultipleFileDownloadChoises';

}  // close private namespace

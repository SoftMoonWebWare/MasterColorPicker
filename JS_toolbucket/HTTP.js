/*  Aloha! and Mahalo for reading these comments.
	This code is loosely based on a few lines of code presented in the book:
		“JavaScript: The Definitive Guide” by David Flanagan; © 2006 O’Reily Media, Inc.; 978-0-596-10199-2
	and is drastically overhauled and expanded by Joe Golembieski, SoftMoon WebWare.
	November 21, 2013;  minor updated Nov 2, 20187

//  character-encoding: UTF-8 UNIX     includes extended character set in comments example:  far-east asian: Chinese and Japanese
//  tab-spacing: 2   word-wrap: no   standard-line-length: 120   full-line-length: 2400


	To Use:

	connector = new HTTP(…)   ← ← see this file just below the HTTP-constructor function for comments on arguments passed in

	myconnection = HTTP.newConnection('http://mywebsite.net/mypage.htm', no_HTTP_Possible_Error)   ←  no_HTTP_Possible_Error may be a handler-function or a string Error message for a thrown error
	==or use==
	myconnection = HTTP.Connection('http://mywebsite.net/mypage.htm')   ←  AFTER you have called HTTP.newConnection at least ONCE; it has been established that HTTP is possible on this machine using this browser, and the proper init object has been found for this particular browser.

	myconnection.onFileLoad = function(userArgs… … …)  {……your code is passed userArgs from connector.getFile()……}
	myconnection.loadError = function(userArgs… … …)  {……optional handler for file load errors……}   ←  myconnect.errorMessage holds the error
	myConnection.tryAgain = function(userArgs… … …)  {……optional handler replaces the standard method to handle:
				connection timeouts,  url-redirects,  and unknown server response codes……}
	myconnection.onMultiple = HTTP.handleMultiple    ← ↓ you may optionally use this inhouse function or create your own or use nothing and the loadError handler will handle it
	myconnection.onMultiple = function(userArgs… … …)  {……optional handler when the server has multiple choices for the given url……}
	myconnection.onComplete = function(userArgs… … …)  {……optional handler may replace the standard -
				use to handle ranges of status codes.
				myconnection.onStatus always gets first try and can override this and the standard method.
				if the custom “myconnection.onComplete(userArgs,… … …)” method
				returns Boolean “false” the standard handler will be invoked.……}
	myconnection.onStatus = {}  ← this optional object may hold custom status-code methods.
        ¡¡ NOTE that these methods of “onStatus” are applied to the “myconnection” object and passed all “userArgs” !!
				myconnection.onStatus[201] and myconnection.onStatus[301] will override connector.autoshuttle_201 and myconnection.onMultiple respectively.
				myconnection.onStatus[4••] will override myconnection.loadError.
				if the custom “myconnection.onStatus[myconnection.status](userArgs,… … …)” method
				returns Boolean “false”, the custom “myconnection.onComplete(userArgs,… … …)” method
				and possibly then the standard handler will be invoked.
	myconnection.method="GET" ‖ "POST" ‖ "HEAD"   ← optional, defaults to "GET"
	/==== for queried connnections:
	myconnection.getQuery=HTTP.serialize(…object…) || myGetQueryString;
	myconnection.postQuery=HTTP.serialize(…object…) || myPostQueryString;

	connector.getFile(myconnection [, userArgs,… … …])   ←  pass in any number of user arguments to be passed on to all your event handlers

	myconnection_2 = HTTP.Connection('http://mywebsite.net/anotherpage.htm')   ←  AFTER you have called HTTP.newConnection at least ONCE; it has been established that HTTP is possible on this machine using this browser, and the proper init object has been found for this particular browser.
	=== set the onFileLoad, loadError, etc… methods for myconnection_2 ===
	=== note you could use the same handlers for both connections, and pass them different arguments through connector.getFile ===

	connector.getFile(myconnection_2 [, userArgs,… … …])   ← you can use the same connector for multiple connections
	// or you could create a new connector with different protocol for timeouts, autoShuttles, and redirects.
	// access to data on your personal, quick “home-base server” may require completely different situational and
	//  interface configurations from another widely-used, slow, overworked server…

 */

if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')   SoftMoon.WebWare=new Object;


//constructor function:
SoftMoon.WebWare.HTTP=function(maxAttempts, timeoutDelay, retryDelayIncrease, retryDelayBuffer, autoShuttle_201, redirectMax)  {
	if (typeof maxAttempts == 'number')  this.maxAttempts=maxAttempts;
	if (typeof timeoutDelay == 'number')  this.timeoutDelay=timeoutDelay;
	if (typeof retryDelayIncrease == 'number')  this.retryDelayIncrease=retryDelayIncrease;
	if (typeof retryDelayBuffer == 'number')  this.retryDelayBuffer=retryDelayBuffer;
	if (typeof autoShuttle_201 == 'boolean')  this.autoShuttle_201=autoShuttle_201;
	if (typeof redirectMax == 'number')  this.redirectMax=redirectMax;
	}

;(function() {
var HTTP=SoftMoon.WebWare.HTTP;


HTTP.prototype.maxAttempts=3  // how many times we should try to connect when there is no response from the server, or we get an unrecognized response status code
HTTP.prototype.timeoutDelay=25000  //25 seconds  =  how long to wait for a response from the remote server before giving up and possibly trying again
HTTP.prototype.retryDelayIncrease=5000   // added to the timeoutDelay each time we make another attempt (may be positive or negative)    ← response is usually fast, so if we are waiting a while, there is probably an internet connection error or server error, fixed by simply trying again.  However, the server may just be overwhelmed and slow to respond, so waiting a little longer each time we try again may be prudent.
HTTP.prototype.retryDelayBuffer=2000  // how long to wait between each attempt to retry a connection
HTTP.prototype.autoShuttle_201=true;  // whether or not to shuttle (redirect) an HTTP request upon a 201 response header
HTTP.prototype.redirectMax=7  // how many redirects allowed before a load error (201 and 3xx status codes send by server)
HTTP.prototype.restrictURL=false  // restrict URLs to the RegExp below:

//  This restricts HTTP requests to urls with the given format.
//  Also, with 201 “auto-shuttle” redirects (when the server is saying,
//   “OK, I created the new content you requested, find it at this url…”)
//   if the responseText matches the given format (and is less than 2000 characters),
//   the HTTP-connector will use it as the new url as opposed to the “location” response header.
HTTP.prototype.RegExp={url: new RegExp( "^((https?:\/\/)?([.]{1,2}\/)?([a-z][-_a-z0-9]*[.])+([a-z]{2,6})(\/[-._~@!$&'()\0x5B\0x5D+,;=%a-z0-9]*)*\/?([?][-._~:\/?#@!$&'()\0x5B\0x5D*+,;=%a-z0-9]*)?)|(([-._~#@!$&'()\0x5B\0x5D+,;=%a-z0-9]*)*\/?([?][-._~:\/?#@!$&'()\0x5B\0x5D*+,;=%a-z0-9]*)?)$", 'i')};

HTTP.factories=[
	function() { return new XMLHttpRequest(); },
	function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
	function() { return new ActiveXObject('Microsoft.XMLHTTP'); }  ];

HTTP.factory=null;
HTTP.Connection=function(url)  { var connection=HTTP.factory();
	connection.attempts=0;  connection.redirects=0;  connection.url=url;
	return connection;  }

//call newConnection once before then calling Connection as many times as needed…
// or simply call newConnection every time…
HTTP.newConnection=function(url, err) {
	if (HTTP.factory != null)  {return HTTP.Connection(url);}
	for (var connection, i=0; i<HTTP.factories.length; i++) {
		try {
			connection=HTTP.factories[i]();
			if (connection != null)  {
				HTTP.factory=HTTP.factories[i];
				connection.attempts=0;
				connection.redirects=0;
				connection.url=url;
				return connection;  }  }
		catch(e)  {continue;}  }
	HTTP.factory=function() {
		if (typeof err=='function')  err();
		else if (typeof err=='string'  &&  err!="")  throw new Error(err);  }
	HTTP.factory();  }


HTTP.prototype.getFile=function(connection)  {
	var userArgs=Array.prototype.slice.call(arguments, 1),
			thisConnector=this;
	if (typeof connection.tryAgain != 'function')  connection.tryAgain=function()  { //try «attempts» times, then stop and wait until called upon again
		if (connection.attempts<thisConnector.maxAttempts)  setTimeout(
			function() { var passArgs=userArgs.slice(0);  passArgs.unshift(connection);
			  thisConnector.getFile.apply(thisConnector, passArgs);  },
			thisConnector.retryDelayBuffer );
		else  {connection.trying=false;  if (typeof connection.loadError == 'function')  connection.loadError(thisConnector);}  }
	connection.attempts++;
	connection.trying=true;
	var timer=setTimeout(
		function() {connection.abort();  connection.tryAgain.apply(connection, userArgs);},
		this.timeoutDelay+(connection.attempts-1)*this.retryDelayIncrease );

	connection.onreadystatechange=function()  {
		if (connection.readyState>=3  &&  timer)  clearTimeout(timer);
		if (connection.readyState!=4)  return;
		connection.trying=false;
		if (typeof connection.onStatus == 'object'
		&&  typeof connection.onStatus[connection.status] == 'function'
		&&  connection.onStatus[connection.status].apply(connection, userArgs) !== false)  // ¡¡NOTE how the methods of “onStatus” are applied to the “connection” object!!
			return;  //if your custom onStatus handler method returns Boolean: “false”, the “onComplete” and then possibly the “standard” handlers below will be used.
		if (typeof connection.onComplete == 'function'
		&&  connection.onComplete.apply(connection, userArgs) !== false)
			return;  //if your custom onStatus handler method returns Boolean: “false”, the standard handler below will be used.
		switch (connection.status)  {
			case 200:
			case 202:
			case 203:
			case 204: {connection.onFileLoad.apply(connection, userArgs);  break;}
			case 300: if (typeof connection.onMultiple == 'function')  {  //multiple choices offered by the server - user must choose one.  responseText should hold more info
                  var passArgs=userArgs.slice(0);  passArgs.unshift(thisConnector);
									connection.onMultiple.apply(connection, passArgs);
									break;  }
								connection.errorNotice='Server requires choosing file from multiple choices; no “onMultiple” method supplied.'
			case 400:
			case 401:
			case 402:
			case 403:
			case 404:
			case 410: if (typeof connection.loadError == 'function')
										connection.loadError.apply(connection, userArgs);
							 break;
			case 301: HTTP.setPermanentRedirect(connection);  //this is a permanent redirect; below are temporary or “other”
            /* fall through to redirect by response header [307] */
			case 201: if (connection.status==201)  {
			  					if (thisConnector.autoShuttle_201)  {
										if (connection.responseText.length<2001
										&&  connection.responseText.match( thisConnector.RegExp.url ))  {
											if (thisConnector.redirect(connection, connection.responseText, userArgs))  {
                        connection.method="GET";  delete connection.getQuery;  delete connection.postQuery;
											  connection.trying=true;  connection.tryAgain.apply(connection, userArgs);  }
											break;  }
										else  {/* fall through to redirect by response header */}  }
									else {connection.onFileLoad.apply(connection, userArgs);  break;}  }
			case 302:
			case 303: if (connection.status==302 || connection.status==303)  {
			  					connection.method="GET";  delete connection.getQuery;  delete connection.postQuery;  }
			case 305:
			case 307: if (thisConnector.redirect(connection, connection.getResponseHeader('location'), userArgs)===false)  break;
			default:  connection.trying=true;  connection.tryAgain.apply(connection, userArgs);  }  }

	if (this.restrictURL  &&   !connection.url.match(this.RegExp.url))
    connection.errorNotice="Improper “url” for HTTP request: \n “"+connection.url+"”\n No connection attempt made.";
	else if (HTTP.redirectFilter(connection))  {  // url is OK as given or was changed to a new redirected url
		var postQuery;
		if (typeof connection.method == 'string')  connection.method=connection.method.toUpperCase();
		switch (connection.method)  {
			case "POST":  postQuery=connection.postQuery;
			case "GET":
			case "HEAD":  break;
			default: connection.method="GET";  }
		connection.open(connection.method, connection.url+(connection.getQuery ? ("?"+connection.getQuery) : ""));
		if (connection.postText)  connection.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		connection.send(postQuery || null);
		return;  }
	else  { /* Url was redirected circularly */ }
	clearTimeout(timer);
	if (typeof connection.loadError == 'function')  connection.loadError.apply(connection, userArgs);  }


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


HTTP.redirectFilter=function(connection)  { url=connection.url, unredirected=true;
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


;(function()  {
HTTP.redirectList=new Array();
	var i, cookies=document.cookie;
	cookies=cookies.split(';');
	for (i=0; i<cookies.length; i++)  {
		if (cookies[i].substring(0, 16)==='HTTPRedirectList')  {
			HTTP.redirectList=decodeURIComponent(cookies[i].substring(16)).split(',');  break;  }  }
}());



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
HTTP.handleMultiple=function(connector)  {
	if (this === HTTP)  throw new Error('“HTTP.handleMulptile” is meant to be a method of an HTTP connection object');
	var userArgs=Array.prototype.slice.call(arguments, 1),
			notice=document.createElement('div');
			container;
	notice.innerHTML='<h1>attention sentients</h1>\n'+
		'<p>The server has notified this automation that a requested file download has multiple choices available.&nbsp;\n'+
		(this.filename ? ('The file requested is '+this.filename+'.&nbsp;\n') : "")+
		(this.fileinfo ? this.fileinfo : "")+
		'The file <acronym>URL</acronym> requested is: '+    // <abbr> is for HTML5; <acronym> is for MSIE-6, and should never have been depreciated.  Consider text-to-speach for visual impaired.  They USUALLY want to hear “U-R-L”, not “uniform-resource-locator” or a synonym for "Earl";  so if you add a title to <abbr> then you must add a classname, and CSS to specify all this, etc… but then FORCE them into this scheme.  Whereas users can set their readers to simply ignore titles in all <acronyms> unless asked for IF THEY WANT TO.
		'<span class="url">'+this.url+'</span></p>\n'+       //  no title is supplied for URL acronyms here because if the user doesn't understand “U-R-L”,  “uniform-resource-locator” won't be any better!  So using <abbr> here actually won't cause this reader problem; but it will break MSIE6, whereas using <acronym> is just, ahem, "politically incorrect".
		'<p>More specific information from the server may be given below.</p>\n'+
		'<label>Please enter the selection of you choice: <select></select></label>\n'+
		'<label><input type="checkbox" /> remember this selection in the future</label>\n'+
		'<input type="button" value="Get File" />\n'+
		'<input type="button" value="abort" />\n';
	var response=this.responseText.split("\n<!-- end URL list -->\n"),
			i, urls=response[0].split("\n"),
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
	if (this.getResponseHeader('Content-Type').match( /html/i ))  {
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
	: arguments.callee.HTML_Element_id;
	container=(container || document);
	container.appendChild(notice);

	var inp=notice.getElementsByTagName('input'),
			connection=this;
	inp[1].onclick=function()  {
		var url=sel.options[sel.selectedIndex].value;
		if (url  &&  connector.redirect(connection, url, userArgs))  {
			if (inp[0].checked)  HTTP.setPermanentRedirect(connection);
			container.removeChild(notice);
			connection.trying=true;
			connection.tryAgain.apply(connection, userArgs);  }  }
	inp[2].onclick=function()  {
		if (confirm('Do you want to abort loading '+(connection.filename || 'this file')+'?'))
			container.removeChild(notice);
		else
			inp[0].focus();  }
	setTimeout(function() {inp[0].focus();}, 0);  }

HTTP.handleMultiple.HTML_Element_id='HTTP_handleMultipleFileDownloadChoises';

 })();

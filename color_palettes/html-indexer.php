<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8' />
<meta http-equiv='Content-Type' content="text/html; charset=utf-8" />
<meta http-equiv='Cache-Control' content="no-store" />
<title>Color Palettes index</title>


<?php  // If you don't want to use the base tag below, modify near the end of this file: link-to-parentdir and show_dir()  ?>
<base href='http://<?php echo $_SERVER['HTTP_HOST']; ?>' />


<style>
h2 span {
	display: block;
	padding-left: 1.618em; }
#directory_index label {
	margin-left: .618em; }
#directory_index > ol:first-of-type {
	padding-top: .618em;
	padding-bottom: .618em; }
#directory_index ol,
#directory_index ol a {
	margin-right: .618em;
	color: lightBlue;
	background-color: black; }
#directory_index ol ol {
	display: none; }
#directory_index.expand ol,
#directory_index li.expand > ol {
	display: block; }
#directory_index.collapse ol ol {
	display: none; }
#directory_index li > span:first-child {
	color: black;
	background-color: white;
	cursor: default;
	margin-right: .382em; }
#directory_index.expand li > span:first-child,
#directory_index.collapse li > span:first-child {
	display: none; }
</style>

<script type='text/javascript'>//thanks to SoftMoon-WebWare   http://softmoon-webware.com/UniDOM_instructions.htm
	// UTF-8  tabspacing=2

	// c must be the string name of the class  or an array of these strings
Element.prototype.addClass=function addClass(c)  {this.className=aClass(this.className, c);}
	function aClass(cn, ac)  {  //private
		if (!(ac instanceof Array))  ac=[ac];
		for (var i=0; i<ac.length; i++)  {
			if (!(typeof cn == 'string'  &&  cn.match( new RegExp('\\b'+ac[i]+'\\b') )))
				cn+=(cn) ? (" "+ac[i]) : ac[i];  }
		cn=cleanClass(cn);
		return cn;  }

	// c may be the string name of the class or a RegExp  or an array of these
Element.prototype.removeClass=function removeClass(c) {this.className=xClass(this.className, c);}
	function xClass(cn, xc) {  //private
		if (typeof cn != 'string')  return;
		if (!(xc instanceof Array))  xc=[xc];
		for (var i=0; i<xc.length; i++)  {
			cn=cn.replace((typeof xc[i] == 'object'  &&  (xc[i] instanceof RegExp)) ?  xc[i]  :  new RegExp('\\b'+xc[i]+'\\b', 'g'),  "");
			cn=cleanClass(cn);  }
		return cn;  }

	//private
	function cleanClass(cn)  {
		cn=cn.replace( /^\s*/ , "");
		cn=cn.replace( /\s*$/ , "");
		cn=cn.replace( /\s{2,}/g , " ");
		return cn;  }

Element.prototype.toggleClass=function toggleClass(c)  {  // c should be the string name of the class
		if (this.className.match(new RegExp('\\b'+c+'\\b')))
					this.className=xClass(this.className, c);
		else  this.className=aClass(this.className, c);  }


Element.prototype.swapOutClass=function swapOutClass(xc, ac)  {  // xc=remove class   ac=add class
		var cn=xClass(this.className, xc);
		this.className=aClass(cn, ac);  }

</script>
</head>
<?php  /*
	index.php
	UTF-8  tabspacing=2

*/

if (!defined('THIS_DIR_URI'))  define('THIS_DIR_URI', substr($_SERVER['REQUEST_URI'], 0, 1+strrpos($_SERVER['REQUEST_URI'], "/")));
if (!defined('THIS_PARENTDIR_URI'))  define('THIS_PARENTDIR_URI', substr(THIS_DIR_URI, 0, 1+strrpos(THIS_DIR_URI, "/", -2)));


if (!defined('DIR_SEP'))  {
	if (stripos(php_uname('s'), 'Win')===FALSE)    // Mac OS/LINUX/UNIX directory separator
		define('DIR_SEP', "/");
	else    // MS Windows directory separator
		define('DIR_SEP', "\\");  }


Function findAllFiles($dir=".", $match='/.palette.(js|json|css|gpl)$/i')  {

	$dir=$dir.DIR_SEP;
	$tree=array( "/?\\" => FALSE );

	$D=opendir($dir);
	while ($F=readdir($D))  {
		if ($F==='.'  or  $F==='..')  continue;
		if (is_dir($dir.$F))   {
			$tree[$F]=findAllFiles($dir.$F);
			$tree["/?\\"]=TRUE;
			continue;  }
		if (preg_match($match, $F))
			$tree[$F]=filesize($dir.$F);  }

	ksort($tree);
	return $tree;  }


Function show_dir($base, $tree, $tabs="")  {
	echo $tabs,"<ol>\n";
	foreach($tree as $F=>$bytes)  {
		if ($F==="/?\\")  continue;
		if (is_array($bytes))  {  //$bytes is a sub-directory in this case
			echo $tabs, '<li><span onclick="this.parentNode.toggleClass(\'expand\')">+</span><a href="' ,$base,$F, '/">' ,htmlentities($F), "/</a>\n";
			show_dir($base.$F."/", $bytes, $tabs."\t");
			echo $tabs,"</li>\n";
			continue;  }
		echo $tabs, '<li><a href="' ,$base,$F, '" target="palette_file">' ,htmlentities($F), '</a> ≈ ' ,number_format($bytes/1024), "KB</li>\n";  }
	echo $tabs,"</ol>\n";  }


$tree=findAllFiles();
?>

<body>
<h2>fileshare index for
	<span><?php echo htmlentities($_SERVER['HTTP_HOST']), htmlentities(urldecode(THIS_DIR_URI)); ?></span>
</h2>


<?php  //maybe you don’t want to include this link in the color_palettes root?  You prob. should in sub-folders
	if (THIS_PARENTDIR_URI!=='/')
		//for use with an HTML  base  tag in the document head:
		echo '<a href="' ,THIS_PARENTDIR_URI, '">↑ back up to: ' ,htmlentities(urldecode(THIS_PARENTDIR_URI)), '</a>';
/*
		//for use withOUT an HTML  base  tag in the head of this document:
		echo '<a href="http://' ,$_SERVER['HTTP_HOST'],THIS_PARENTDIR_URI, '">↑ back up to: ' ,htmlentities(urldecode(THIS_PARENTDIR_URI)), '</a>';
*/
?>

<div id='directory_index' class='expand'>
<?php if ($tree['/?\\']):  ?>
<label onclick='this.parentNode.swapOutClass("expand", "collapse")'><input type='radio' name='expandAll' value='collapse' />collapse all sub-directories</label>
<label onclick='this.parentNode.swapOutClass("collapse", "expand")'><input type='radio' name='expandAll' value='expand' checked='checked' />show all sub-directories</label>
<label onclick='this.parentNode.removeClass(["collapse", "expand"])'><input type='radio' name='expandAll' value='individual' />show sub-directories individually</label>
<?php endif; ?>

<?php
// for use with an HTML  base  tag in the document head:
		show_dir(THIS_DIR_URI, $tree);
/*
// for use withOUT an HTML  base  tag in the head of this document:
		show_dir('http://'.$_SERVER['HTTP_HOST'].THIS_DIR_URI, $tree);
*/
?>
</div>

<footer>generated &amp; powered by SoftMoon-WebWare</footer>
</body>
</html>

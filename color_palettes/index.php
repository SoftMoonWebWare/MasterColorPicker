<?php  /*  charset="UTF-8"
	color_palettes/index.php  for PRIVATE SERVERS          April 24, 2020

	¡WARNING!  This PHP file can accept uploads and install them in your server’s file system.
	It was designed for basic minimal protection against innocent unknowing individuals,
	NOT for protection against malicious hackers trying to gain access to your server & computer.
	If installed on a public server, the webmaster should take the utmost care in
	ensuring that the directories that this software uploads files into
	are not allowed to run executable	files such as PHP, etc.,
	AND/OR that the proper username/password access is installed into the server
	for this file/folder and the folder that the uploaded file is placed,
	AND/OR that the uploaded file is properly sanitized for executable code within.

	This software does by default (as shipped by the developer SoftMoon-WebWare):
	• set upload-directory permissions to prevent execution of files on UNIX systems
	• remove PHP and ASHX (ASP.NET) tags in the uploaded file
	• clean the filename for the uploaded file from unacceptable characters, and (for Windows®) device-namespaces
	• limit the filename for the uploaded file to having one of the extentions:
		◦  .palette.json
		◦  .palette.css
		◦  .palette.gpl

	As webmaster, you may want to allow dynamic (PHP/ASPX) generated palette files.
	You should change the access code accordingly (and can do so without real harm on a “safe” private server),
	and make other security considerations if the server is public.



	This dynamically creates a text-based list of all the palettes in the folder

	You may modify how this processes the output and uploads.
	You may replace it with a script in another language.
	You may replace it with a static text file (you will need to then keep it updated by hand, and no uploading).

	By DEFAULT:
	(no GET or POST requests)
	This script finds all the files in this folder (color_palettes) and its subfolders
	with filenames containing “.palette.json”  “.palette.css”  or  “.palette.gpl”
	as the second-to-last and last filename extentions.

	By setting GET-file or GET-file_preg in the URL
	you can find the path to (a) given filename(s) if you don’t know what folder it/they is/are in;
	or perhaps all the files (including pathnames) in a project:
	color_palettes/?file=mylostfile.json
	color_palettes/?file_preg=#projectName/.*projectSubsection#i
	Note that GET-file must be an exact match of the filename only,
	while GET-file_preg can match the entire path or a subsection of it.
	Note also that the filepath for the file_preg begins with:  color_palettes/

	You can POST a file’s text and this software will save it.
	POST-filename
	POST-autoload       ← the file will be saved in the “autoload/” folder
	POST-replace_file   ← must ='true' or an existing file with the same pathname will not be overwritten.
	POST-file           ← the TEXT of the file, not the file itself: i.e. do not use the HTML <input type='file'>

  */



define('DIRECTORY_ACCESS', 0644);	 // Read and write for owner, read for everybody else
/* Any time a file is uploaded, the folder /color_palettes/users/
 *                 and possibly the folder /color_palettes/users/autoload/
 * has it’s access code (on Linux-based systems) set to this code.
 */


define('PALETTE_NAME_EXTENTION', '/\.palette\.(json|css|gpl)$/i');



//echo file_get_contents("php://input");  // this is the raw input data; becomes $_POST if URI-encoded and the content-type header was 'application/x-www-form-urlencoded'


if ($_GET['username'])  {  /* check for password if desired */
	$userName='~'.$_GET['username'];  }


if ($_GET['file'])  {findAllPalettes($userName, $_GET['file'], false);}
else
if ($_GET['file_preg'])  {findAllPalettes($userName, $_GET['file_preg']);}
else
if ($_POST['filename'])  {uploadPalette($userName);}
else findAllPalettes($userName);

//  echo "color_palettes/baz_bar_foo.txt\n";  //send a false filename to test the JavaScript (“ajax”) loader

exit;



Function findAllPalettes($userName, $match=PALETTE_NAME_EXTENTION, $preg=true, $dir='../color_palettes')  {
$D=opendir($dir);
while ($F=readdir($D))  {
	//echo '==$F==',$F,'  ==is dir?',is_dir($F),"\n";
	if (substr($F, 0, 1)==='.'
	||  (substr($F, 0, 1)==='~'  AND  $F!==$userName))  continue;
	if (is_dir($dir."/".$F))  {findAllPalettes($userName, $match, $preg, $dir."/".$F);  continue;}
	if (($preg  AND  preg_match($match, substr($dir, 3)."/".$F))
	OR  (!$preg  AND  $F===$match))
		echo substr($dir, 3),"/",$F, "\n";  }  }


Function uploadPalette($userName, $toDir='users')  {
	if ($userName) $toDir=$toDir."/".filename_safe($userName);
	if (!is_dir($toDir))  mkdir($toDir, DIRECTORY_ACCESS);
	chmod($toDir, DIRECTORY_ACCESS);
	if ($_POST['autoload']==='true')  $toDir=$toDir.'/autoload';
	if (!is_dir($toDir))  mkdir($toDir, DIRECTORY_ACCESS);
	chmod($toDir, DIRECTORY_ACCESS);
	$fName=$toDir.'/'.filename_safe($_POST['filename']);
	if (is_file($fName)  AND  $_POST['replace_file']!=='true')  {
		echo "¡Error! : file already exists: \n<span>color_palettes/",$fName,"</span>";
		return false;  }
	if (!preg_match(PALETTE_NAME_EXTENTION, $fName))  {
		echo "¡Error! : illegal filename for upload: \n<span>color_palettes/",$fName,"</span>";
		return false;  }
	$F=fopen($fName, "wt");  // note that on Windows® systems, line-endings in this file will be modified to \n\r
	fwrite($F, preg_replace('/<(\?(php)?|%)/i', "", $_POST['palette']));
	fclose($F);
	echo 'color_palettes/',$fName;  }

Function filename_safe($name)  {
	$except=array('\\', '/', ':', '*', '?', '"', '<', '>', '|', '..');
	$name=str_replace($except, "", $name);
	$name=preg_replace('[\x00-\x0F]', "", $name);
	$except='/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])([.].*)?$/';
	$name=preg_replace($except, '_$1_$2', $name);
	return $name;  }

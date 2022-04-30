<?php  /*  charset="UTF-8"
	color_palettes/index.php  for PRIVATE SERVERS          April 25, 2022

	¡WARNING!  This PHP file can accept uploads and install them in your server’s file system;
	¡          it can also delete files (or move them to an existing “trash” folder) on request !
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
	• clean the filename for the uploaded file from unacceptable characters, and (for Windows®) device-namespaces;
		this process “should” also eliminate access to the parent folder(s).
	• limit the filename for the uploaded / deleted file(s) to having one of the extentions:
		◦  .palette.json
		◦  .palette.css
		◦  .palette.gpl

	As webmaster, you may want to allow dynamic (PHP/ASPX) generated palette files.
	You should change the access code accordingly (and can do so without real harm on a “safe” private server),
	and make other security considerations if the server is public.



	This dynamically creates a current text-based list of all the palettes in the folder

	You may modify how this processes the output and uploads (to the extent that it still interfaces with MasterColorPicker).
	You may replace it with a script in another language.
	You may replace it with a static text file (you will need to then keep it updated by hand, and no uploading).

	By DEFAULT:
	(no GET or POST requests)
	This script finds all the files in this folder (color_palettes) and its subfolders
	with filenames containing “.palette.json”  “.palette.css”  or  “.palette.gpl”
	as the second-to-last and last filename extentions.
	It returns the index as a block of plain text with the filenames
	ending in newline characters: '\n'  — ASCII code 10

	By setting GET-file or GET-file_preg in the URL
	you can find the path to (a) given filename(s) if you don’t know what folder it/they is/are in;
	or perhaps all the files (including pathnames) in a project:
	color_palettes/?file=mylostfile.json
	color_palettes/?file_preg=#projectName/.*projectSubsection#i
	Note that GET-file must be an exact match of the filename only,
	while GET-file_preg can match the entire path or a subsection of it.
	Note also that the filepath for the file_preg begins with:  color_palettes/

	In addition to requesting an index of Palette files
	you can use any or all of the POST functions listed below:

	You can POST a file’s text and this software will save it.
	POST-filename
	POST-autoload       ← ='true' the file will be saved in the “autoload/” folder
	POST-replace_file   ← must ='true' or an existing file with the same pathname will not be overwritten.
	POST-file           ← the TEXT of the file, not the file itself: i.e. do not use the HTML <input type='file'>

	You can POST a file’s name and this software will rename it.
	POST-rename       ← filename of existing file
	POST-new_name

	You can POST a file’s name(s) and this software will delete it/them.
	POST-do_delete       ← filenames separated by newline '\n' (ASCII code 10) characters

	note each ==section== of text returned for added/renamed/deleted items
	ends with ASCII character code 29 — “group separator”
	and additional text may follow.

	POST-no_index     ← === 'true' ← use this with any of the POST functions
		(add/rename/delete) if you don't want the index appended to the response

  */


// ¡remember for headers, there must be NO content before the opening <?php tag and no BOM in this file when you save it!
header('Content-Type: text/plain; charset=UTF-8');
/* Windows® NTFS uses UTF-8; Linux is undefined: it depends on the application saving the file.
 * This file is encoded in UTF-8 and outputs an extended character set.
 */
header('Cache-Control: no-store');


define('DIRECTORY_ACCESS', 0644);	 // Read and write for owner, read for everybody else
/* Any time a file is uploaded, the folder /color_palettes/users/
 *                 and possibly the folder /color_palettes/users/autoload/
 * and any time a file is recycled, the folder /color_palettes/trash/
 * has its access code (on Linux-based systems) set to this code.
 */


define('PALETTE_NAME_EXTENTION', '/\.palette\.(json|css|gpl)$/i');


define('DIRPATH', basename(__DIR__));

/* these are used to deliminate filenames in reply text MESSAGES:
 * (they do not deliminate filenames in the “index” text-block
 *  or the returned filename of an uploaded palette)
 * (they are meant to allow the calling application the ability
 *  to simply replace them with an HTML tag of choice,
 *  extract the filename, etc., while being non-printing chars
 *  for a simple text output.)
 * (you could change them to hard-coded HTML tags, etc., if you want)
 */
// ↓ ASCII  “shift-in”  and  “shift-out”
define('SI', chr(15));  // ← filename follows
define('SO', chr(14));  // ← previous filename ends
// ↓ this deliminates response text sections
define('GS', chr(29));  // ASCII “group-separator”
// ↓ sent to indicate an error
define('NAK', chr(21));  //  ASCII “negative aknowledge”

//for perplexing debugging sesseions:
//echo file_get_contents("php://input");  // this is the raw input data; becomes $_POST if URI-encoded and the content-type header was 'application/x-www-form-urlencoded'


if (isset($_GET['username']))  {  /* check for password if desired */
	$userName='~'.filename_safe($_GET['username']);  }


if (isset($_POST['do_delete']))  deletePalettes($userName);
if (isset($_POST['rename']))     renamePalette();
if (isset($_POST['filename']))   uploadPalette($userName);

if (isset($_POST['no_index'])  &&  $_POST['no_index']==='true')  exit;

if (isset($_GET['file']))  findAllPalettes($userName, $_GET['file'], false);
else
if (isset($_GET['file_preg']))  findAllPalettes($userName, $_GET['file_preg']);
else
findAllPalettes($userName);

//send a false filename to test the JavaScript (“ajax”) loader:
//  echo "color_palettes/baz_bar_foo.txt\n";
//  echo "color_palettes/baz_bar_foo.palette.json\n";

exit;



Function findAllPalettes($userName, $match=PALETTE_NAME_EXTENTION, $preg=true, $dir='../'.DIRPATH)  {
	$D=opendir($dir);
	while ($F=readdir($D))  {
		if (substr($F, 0, 1)==='.'
		||  (substr($F, 0, 1)==='~'  AND  $F!==$userName))  continue;
		if (is_dir($dir."/".$F))  {findAllPalettes($userName, $match, $preg, $dir."/".$F);  continue;}
		if (($preg  AND  preg_match($match, substr($dir, 3)."/".$F))
		OR  (!$preg  AND  $F===$match))
			echo substr($dir, 3),"/",$F, "\n";  }  }


Function uploadPalette($userName, $toDir='users')  {
	if ($userName) $toDir=$toDir."/".$userName;
	if (!is_dir($toDir))  mkdir($toDir, DIRECTORY_ACCESS);
	chmod($toDir, DIRECTORY_ACCESS);
	if ($_POST['autoload']==='true')  $toDir=$toDir.'/autoload';
	if (!is_dir($toDir))  mkdir($toDir, DIRECTORY_ACCESS);
	chmod($toDir, DIRECTORY_ACCESS);
	$fName=$toDir.'/'.filename_safe($_POST['filename']);
	if (is_file($fName)  AND  $_POST['replace_file']!=='true')  {
		echo NAK,"¡Error! : file already exists: ",SI,DIRPATH,'/',$fName,SO,GS;
		return false;  }
	if (!preg_match(PALETTE_NAME_EXTENTION, $fName))  {
		echo NAK,"¡Error! : illegal filename for upload: ",SI,DIRPATH,'/',$fName,SO,GS;
		return false;  }
	$F=fopen($fName, "wt");  // note that on Windows® systems, line-endings in this file will be modified to \n\r
	fwrite($F, preg_replace('/<(\?(php)?|%)/i', "", $_POST['palette']));
	fclose($F);
	echo DIRPATH,'/',$fName,GS;  }

Function filename_safe(&$name, $forbidPaths=true)  {
	$except=array(':', '*', '?', '"', '<', '>', '|', '..');
	if ($forbidPaths)  array_push($except, '\\', '/');
	$name=str_replace($except, "", $name);
	$name=preg_replace('[\x00-\x1F]', "", $name);
	$except='/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])/';
	$name=preg_replace($except, '_$1_', $name);
	return $name;  }

//  note the optional  trash/  folder must exist in the same folder as this file:  color_palettes/trash/
//  for MasterColorPicker, see the JavaScript property:  SoftMoon.colorPalettes_trashFolder
Function deletePalettes($username)  {
	$names=explode("\n", $_POST['do_delete']);
	if ($_POST['recycle']==='true')  mkdir('trash', DIRECTORY_ACCESS);
	if (is_dir('trash'))  $trash='trash/';
	foreach ($names as $path)  {
		filename_safe($path, false);
		if (!preg_match(PALETTE_NAME_EXTENTION, $path)
		||  substr($path, 0, strlen(DIRPATH)+1)!==DIRPATH.'/')  {
			echo NAK,'¡Error! : illegal filename for delete: ',SI,$path,SO;
			continue;  }
		$fName=substr($path, strlen(DIRPATH)+1);
		if (is_file($fName))  {
			if ($trash)  {
				$flag=rename($fName, $trash.basename($fName));
				echo ($flag ? "" : (NAK+'¡Error! : ')),SI,$path,SO,($flag ? ' ' : ' un'),"sucessfully moved to the trash folder.\n";  }
			else  {
				$flag=unlink($fName);
				echo ($flag ? "" : (NAK+'¡Error! : ')),SI,$path,SO,($flag ? ' ' : ' un'),"sucessfully deleted.\n";  }  }
		else  echo NAK,'¡Error! : filename not found to delete: ',SI,$path,SO,"\n";  }
	echo GS; //ASCII “group separator”
	}

Function renamePalette()  {
	filename_safe($_POST['rename'], false);
	if (!preg_match(PALETTE_NAME_EXTENTION, $_POST['rename'])
	||  substr($_POST['rename'], 0, strlen(DIRPATH)+1)!==DIRPATH.'/')  {
		echo NAK,'¡Error! : illegal filename for rename: ',SI,$_POST['rename'],SO,"\n";
		$flag=true;  }
	filename_safe($_POST['new_name'], false);
	if (!preg_match(PALETTE_NAME_EXTENTION, $_POST['new_name'])
	||  substr($_POST['new_name'], 0, strlen(DIRPATH)+1)!==DIRPATH.'/')  {
		echo NAK,'¡Error! : illegal filename for rename: ',SI,$_POST['new_name'],SO,"\n";
		$flag=true;  }
	if ($flag) return;
	$_POST['rename']=substr($_POST['rename'], strlen(DIRPATH)+1);
	$_POST['new_name']=substr($_POST['new_name'], strlen(DIRPATH)+1);
	if (is_file($_POST['rename']))  {
		$flag=rename($_POST['rename'], $_POST['new_name']);
		echo ($flag ? "" : (NAK+'¡Error! : ')),SI,$_POST['rename'],SO,($flag ? ' ' : ' un'),'sucessfully renamed to: ',SI,$_POST['new_name'],SO;  }
	else  echo NAK,'¡Error! : filename not found to rename: ',SI,$_POST['rename'],SO;
	echo GS; //ASCII “group separator”
	}

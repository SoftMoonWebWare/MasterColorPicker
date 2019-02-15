<?php  /*
	color_palettes/index.php
	charset="UTF-8"

	dynamically creates a list of all the palettes in the folder

	You may modify how this processes the output.
	You may replace it with a script in another language
	You may replace it with a static text file (you will need to then keep it updated by hand)

	This script finds all the files in the given folder and its subfolders
	with filenames containing “.palette.json”
	as the second-to-last and last filename extentions.
  */

if (!defined('DIR_SEP'))  {
	if (TRUE     //here we force the dir-sep because browser XMLHttpRequests require it that way
	or  stripos(php_uname('s'), 'Win')===FALSE)    // Mac OS/LINUX/UNIX directory separator
		define('DIR_SEP', "/");
	else    // MS Windows directory separator
		define('DIR_SEP', "\\");  }

Function findAllPalettes($dir='../color_palettes', $match='/\.palette\.json$/i')  {
$D=opendir($dir);
while ($F=readdir($D))  {
	if ($F==='.'  or  $F==='..')  continue;
	if (is_dir($F))  {findAllPalettes($dir.DIR_SEP.$F, $match);  continue;}
	if (preg_match($match, $F))  echo substr($dir, 3),DIR_SEP,$F, "\n";  }  }

//  echo "color_palettes/phoenix_foo.txt\n";  //send a false filename to test the JavaScript (“ajax”) loader

findAllPalettes();

?>

<?php  /*
	color_palettes/index.php

	dynamically creates a list of all the palettes in the folder

	You may modify how this processes the output.
	You may replace it with a script in another language
	You may replace it with a static text file (you will need to then keep it updated by hand)

	This script finds all the files in the given folder and it’s subfolders
	with filenames containing “.json_palette.”
	as the second-to-last filename extention.  Examples returned include:

	myPalette.json_palette.txt
	myPalette.json_palette.js
	myPalette.json_palette.php

	Example of files ignored:
		myPalette.json_palette.txt.bak
		mypalette.php_palette.php
*/

if (!defined('DIR_SEP'))  {
	if (TRUE     //here we force the dir-sep because browser XMLHttpRequests require it that way………
	or  stripos(php_uname('s'), 'Win')===FALSE)    // Mac OS/LINUX/UNIX directory separator
		define('DIR_SEP', "/");
	else    // MS Windows directory separator
		define('DIR_SEP', "\\");  }

Function findAllPalettes($dir='../color_palettes', $match='/\.json_palette\.[^.]+$/i')  {
$D=opendir($dir);
while ($F=readdir($D))  {
	if ($F==='.'  or  $F==='..')  continue;
	if (is_dir($F))  {findAllPalettes($dir.DIR_SEP.$F, $match);  continue;}
	if (preg_match($match, $F))  echo substr($dir, 3),DIR_SEP,$F, "\n";  }  }


findAllPalettes();

?>
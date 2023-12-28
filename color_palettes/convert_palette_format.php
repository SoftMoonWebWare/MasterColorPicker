<?php //last updated December 25, 2023
$filematch= ($_GET['newFormat']==='desktop') ?  '/^(.+)\.palette\.json$/' : '/^(.+)\.palette\.js$/';

$files=getFiles('./');
$targetDir=($_GET['newFormat']==='desktop') ? "./desktop/" : "./json/";
if (!is_dir($targetDir))  mkdir($targetDir);
for ($i=0, $c=count($files);  $i<$c;  $i++)  {
	$F=file_get_contents($files[$i][0]);  echo "===",($files[$i][0]),"===\t→→→\t";
	if ($_GET['newFormat']==='desktop')  {
		if (!preg_match("/^\s*SoftMoon.loaded_palettes.push\(/", $F))  $F="SoftMoon.loaded_palettes.push( {filename: document.currentScript.src, data:\r\n" .$F. "});\r\n";  }
	else  {
		$F=preg_replace('/^\sSoftMoon.loaded_palettes.push\(\s*{\s*filename:\s*document.currentScript.src\s*,\s*data:\s*/', "",  $F);
		$F=preg_replace('/\s*\}\s*\)\s*;?\s*$/', "", $F);  }
	$name= $targetDir
				.$files[$i][1]
				.(($_GET['newFormat']==='desktop')  ?  ".palette.js" : ".palette.json");
	echo $name, '<br />';
	file_put_contents($name, $F);  }

function getFiles($dir)  { global $filematch;
	$D=opendir($dir);  $files=array();
	while ($F=readdir($D))  {
		if ($F==='.'  or  $F==='..')  continue;
		if (is_dir($dir.$F))  {$files=array_merge($files, getFiles($dir.$F.'/'));  continue;}
		if (preg_match($filematch, $F, $name))  {$name[0]=$dir.$name[0];  $files[]=$name;}  }
	return $files;  }
?>

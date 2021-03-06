﻿
<!--  You may move these links & scripts to the document head, especially if you plan on using them with other stylesheets that take precedence or JavaScript code  -->
<!--  link rel='stylesheet' id='MasterColorPicker_stylesheet' type='text/css' media="screen, projection" href='color-pickers/SoftMoon-WebWare/MasterColorPicker2.css' /  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/UniDOM-2020.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/input_type=numeric_.js' defer></script><!--  supports RainbowMaestro & ColorSpaceLab  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/HTTP.js' defer></script><!-- ESSENTIAL for server version, NOT for desktop use -->
<!--  script type='text/javascript' src='JS_toolbucket/Log.js' defer></script><!--  only if you plan on logging to debug -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/Picker.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/Math+++.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/RGB_Calc.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type="text/javascript" src="JS_toolbucket/SoftMoon-WebWare/Rigden_websafe_colorblindTable_interpolator.js" defer></script><!-- supports RainbowMaestro -->
<script type="text/javascript" src="JS_toolbucket/skratchdot.Wickline_colorblind_converter.js" defer></script><!-- supports RainbowMaestro -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/FormFieldGenie.js' defer></script><!-- supports MyPalette & ColorFilter -->

<script type="text/javascript" src="color-pickers/SoftMoon-WebWare/MasterColorPicker2.js" defer='true'></script>
<script type="text/javascript">
window.addEventListener('mastercolorpicker_ready', function()  {
	SoftMoon.WebWare.initPaletteTables(/* path, whenLoaded, whenDone */);  //see files:  MasterColorPicker2.js → RGB_Calc.js
	} );
</script>

<!-- div id='MasterColorPicker_debugLog'></div>
<button type='button' onclick="MasterColorPicker.debug.clear();" style='position: relative; z-index: 10000'>Clear Log</button><!--  -->

<section id='MasterColorPicker' charset='UTF-8'>
<meta charset='UTF-8' />
<!--  MasterColorPicker 2  Copyright © 2012, 2013, 2018, 2019, 2020 Joe Golembieski, SoftMoon-WebWare
      release 2.0.15  March 27, 2020
	Note that these color charts and palettes will work without an enclosing <form>,
but to retain the settings this file may be included inside an existing web <form></form>
-->


<div id='MasterColorPicker_options' class='pickerPanel'>
<header><h1>MasterColorPicker™</h1> by <address>SoftMoon-WebWare</address></header>

<script type="text/javascript">//  capture the sent palette name in case it was a color-names-table - their names are not known here as these are built dynamically using JavaScript with data from HTTP, or from other JavaScript files
	if (typeof SoftMoon != 'object')  SoftMoon=new Object;
	if (typeof SoftMoon._POST != 'object')  SoftMoon._POST=new Object;
	<?php if ($_POST['MasterColorPicker_palette_select']) echo 'SoftMoon._POST["palette_select"]="',$_POST['MasterColorPicker_palette_select'],'"'; ?>
</script>
<label for='MasterColorPicker_palette_select'>palette:
<select id='MasterColorPicker_palette_select' name='palette_select' backtabToTarget='true'>
<option<?php if ($_POST['palette_select']==='RainbowMaestro'  or  $_POST['palette_select']=="")  echo " selected='selected'"?>>RainbowMaestro</option>
<option<?php if ($_POST['palette_select']==='Spectral')  echo " selected='selected'"?>>Spectral</option>
<option<?php if ($_POST['palette_select']==='BeezEye')  echo " selected='selected'"?>>BeezEye</option>
<option<?php if ($_POST['palette_select']==='Simple²')  echo " selected='selected'"?>>Simple²</option>
<option<?php if ($_POST['palette_select']==='YinYang NíHóng')  echo " selected='selected'"?>>YinYang NíHóng</option>
</select></label>


<div><h3>Options▼</h3>
<div>
<fieldset id='x_ColorPicker_options' class='pickerOptions'><legend><?php echo $_POST['palette_select'] ? $_POST['palette_select'] : 'RainbowMaestro';  ?> mode:</legend>
	<p class='underConstruction'><span>Under Construction:</span> no functionality</p>
	<fieldset id='MasterColorPicker_showLocator'>
		<label>¿<input type='checkbox' name='MasterColorPicker_showLocator' value='true' <?php
				if ($_POST['MasterColorPicker_showLocator']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show locator?</label>
		<fieldset id='MasterColorPicker_locatorStyle'>
			<label><input type='radio' name='MasterColorPicker_locatorStyle' value='X' <?php
					if ($_POST['MasterColorPicker_locatorStyle']==='X')  echo 'checked="checked" '; ?>/><strong>×</strong> marks the spot</label>
			<label><input type='radio' name='MasterColorPicker_locatorStyle' value='O' <?php
					if ($_POST['MasterColorPicker_locatorStyle']==='O')  echo 'checked="checked" '; ?>/><strong><big>○</big></strong> marks the spot</label>
			<label><input type='radio' name='MasterColorPicker_locatorStyle' value='o' <?php
					if ($_POST['MasterColorPicker_locatorStyle']==='o'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/><strong>○</strong> marks the spot</label>
		</fieldset>
		<fieldset id='MasterColorPicker_locatorColor'>
			<label><input type='radio' name='MasterColorPicker_locatorColor' value='b/w' <?php
					if ($_POST['MasterColorPicker_locatorColor']==='b/w')  echo 'checked="checked" '; ?>/>black/white</label>
			<label><input type='radio' name='MasterColorPicker_locatorColor' value='spinning' <?php
					if ($_POST['MasterColorPicker_locatorColor']==='spinning')  echo 'checked="checked" '; ?>/>spinning rainbow</label>
			<label><input type='radio' name='MasterColorPicker_locatorColor' value='transforming' <?php
					if ($_POST['MasterColorPicker_locatorColor']==='transforming'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>transforming rainbow</label>
		</fieldset>
	</fieldset>
	<label id='MasterColorPicker_interlink'>¿<input
			type='checkbox' name='MasterColorPicker_doInterlink' value='true' <?php
			if ($_POST['MasterColorPicker_doInterlink']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>interlink?
			<p>Choosing a color points to the same color in all interlinked palettes.</p></label>
	<label id='MasterColorPicker_applyToAll'>¿<input type='checkbox' name='MasterColorPicker_applyToAll' value='true' <?php
			if ($_POST['MasterColorPicker_applyToAll']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>apply to all?</label>
</fieldset>

<fieldset class='pickerOptions'>
	<label>output: <select id='MasterColorPicker_outputMode' name='MasterColorPicker_outputMode'>
	<option<?php if (!in_array($_POST['MasterColorPicker_outputMode'], array('RGB', 'native', 'HSV', 'HSL', 'HCG', 'CMYK'), true))  echo " selected='selected'"; ?>>hex</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='RGB')  echo " selected='selected'"; ?> title='Red, Green, Blue'>RGB</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='native')  echo " selected='selected'"; ?>>native</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='HSV')  echo " selected='selected'"; ?>>HSV</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='HSB')  echo " selected='selected'"; ?>>HSB</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='HSL')  echo " selected='selected'"; ?>>HSL</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='HCG')  echo " selected='selected'"; ?>>HCG</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='CMYK')  echo " selected='selected'"; ?>>CMYK</option>
	</select></label>
	<label>¿<input type='checkbox' id='MasterColorPicker_keepPrecision' name='MasterColorPicker_keepPrecision' value='true' <?php
	if ($_POST['MasterColorPicker_keepPrecision']=='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>
	onchange='MasterColorPicker.keepPrecision=this.checked;' />keep precision?
	<p>Hex/RGB values are calculated from the native format, and others are calculated from the RGB values.&nbsp;
			RGB values may be rounded off to integers in the process yielding differences that are especially noticeable in Hue values.&nbsp;
			(More minor round off errors will always be possible due to floating-point mathematics used by computers.)&nbsp;
			Note RGB values will always be shown as integers, and are always used internally by the computer’s hardware
			as integers, so by <strong>not</strong> keeping precision, resulting conversions from the RGB values reflect
			the “actual RGB values used” by the computer to display the color selected.</p></label>
	<label>¿<input type='checkbox' id='MasterColorPicker_useHexSymbol' name='MasterColorPicker_useHexSymbol' value='true' <?php
	if ($_POST['MasterColorPicker_usehexSymbol']=='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>
	onchange='MasterColorPicker.useHexSymbol=this.checked;' />use # Hex symbol?</label>
	<!--  label>¿<input type='checkbox' name='MasterColorPicker_selectInputboxText' value='true' <?php
			if (false  and  $_POST['MasterColorPicker_selectInputboxText']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>select choice in inputboxes?</label   -->
	<label>¿<input type='checkbox' name='MasterColorPicker_copyColorToClipboard' value='true' onchange='MasterColorPicker.copyToClipboard=this.checked;' <?php
			if ($_POST['MasterColorPicker_copyColorToClipboard']==='true')  echo 'checked="checked" '; ?>/>copy selected color to system clipboard?</label>
</fieldset>

<fieldset class='pickerOptions'>
<label>¿<input type='checkbox' name='MasterColorPicker_showHelp' id='MasterColorPicker_showHelp' value='false'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Help"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showhelp']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show ☺ Help ☺? <kbd><span>F1</span></kbd></label>
<label>¿<input type='checkbox' name='MasterColorPicker_showMyPalette' id='MasterColorPicker_showMyPalette' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_MyPalette"), !this.checked);'
		<?php if ($_POST['MasterColorPicker_showFilter']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show/use MyPalette? <kbd><span>F2</span></kbd></label>
<label>¿<input type='checkbox' name='MasterColorPicker_showLab' id='MasterColorPicker_showLab' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Lab"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showLab']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show Color-Space Lab? <kbd><span>F3</span></kbd></label>
<label>¿<input type='checkbox' name='MasterColorPicker_showFilter' id='MasterColorPicker_showFilter' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Filter"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showFilter']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show/use Color-Filter?</label>
<label>¿<input type='checkbox' name='MasterColorPicker_showGradientor' id='MasterColorPicker_showGradientor' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Gradientor"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showGradientor']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show Gradientor?</label>
<label>¿<input type='checkbox' name='MasterColorPicker_showThesaurus' id='MasterColorPicker_showThesaurus' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Thesaurus"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showThesaurus']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show color Thesaurus? <kbd><span>F4</span></kbd></label>
<p id='MasterColorPicker_returnPanelsOn3'>Drag panels by their handles.&nbsp;
Triple-click on panel handles (or this message) to return the panel(s) to home position.&nbsp;
<!--[if IE gt 9] -->
Right-click or Shift-click to: pin a panel to the page when it is pinned to the window,
or pin it to the window when it is pinned to the page.
<!--[endif] -->
</p>
</fieldset>

<fieldset>
	<p>Hue angle unit values may be forced at any time when entered with a trailing unit; for example a “degrees” ° sign or by using the three letters “deg”.</p>
	<label>Hue Angle Unit:
	<select name='MasterColorPicker_hue_angle_unit'>
		<optgroup label='degrees (360)'>
			<option>deg</option>
			<option>°</option>
		</optgroup>
		<optgroup label='radians (2π ≈6.2831853)'>
			<option>rad</option>
			<option>ʳ</option>
		</optgroup>
		<optgroup label='gradians (400)'>
			<option>grad</option>
		</optgroup>
		<optgroup label='percent of a turn (100)'>
			<option>%</option>
		</optgroup>
		<optgroup label='turn (1)'>
			<option>turn</option>
			<option>●</option>
		</optgroup>
	</select></label>
</fieldset>

<fieldset>
	<label>Color-blind filter provider:
	<select name='MasterColorPicker_colorblind_provider' tabTo='MasterColorPicker_mainPanel'>
	</select></label>
	<p>Color-blind simulations are approximate, and may vary between individuals and monitors</p>
</fieldset>

</div></div>
</div><!--  close  MasterColorPicker_options  -->



<div id='MasterColorPicker_MyPalette' class='pickerPanel expanding'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span title="press F2 for shortcut">MyPalette</span></h2>
<p>(choose color(s) using any color-picker or type directly)</p>
<fieldset>
<button type='button' name='MasterColorPicker_MyPalette_makeSub' backtabToTarget='true'>create sub-palette</button>
<button type='button' name='MasterColorPicker_MyPalette_delete'>delete selected</button>
<button type='button' name='MasterColorPicker_MyPalette_port'>import/export palette</button>
<fieldset class='options'><legend>▼ Options</legend>
	<label><input type='checkbox' name='MasterColorPicker_MyPalette_showColorblind' />show color-blind simulations
		<note>Note simulations are approximate and may vary between individuals and monitors.</note></label>
	<label><input type='checkbox' name='MasterColorPicker_MyPalette_autoSelect' checked='checked' />automatically select newly created Sub-Palettes for “auto add colors”</label>
	<label><input type='checkbox' name='MasterColorPicker_MyPalette_autoUncheck' checked='checked' />automatically un-check items upon “add selected”</label>
</fieldset>
<label>Auto-add to MyPalette: <select name='MasterColorPicker_addToMyPalette'>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='double-click')  echo " selected='selected'"; ?>>double-click</option>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='shift-click')  echo " selected='selected'"; ?>>shift-click</option>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='all selected')  echo " selected='selected'"; ?>>all selected</option>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='single-click')  echo " selected='selected'"; ?>>single-click</option>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='never')  echo " selected='selected'"; ?>>never</option>
	</select></label>
</fieldset>
<fieldset class='portDialog' disabled='disabled'>
	<fieldset class='portMode'>
		<label><input type='radio' name='MasterColorPicker_MyPalette_portMode' value='import' />Import a palette to “MyPalette”</label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_portMode' value='export' />Export this “MyPalette”</label>
	</fieldset>
	<fieldset class='port'><legend><span class='import'>import from:</span><span class='export'>save to:</span></legend>
		<script type='text/javascript'> if (window.location.protocol.match( /^https?\:$/ ))  document.writeln(
		"<label><input type='radio' name='MasterColorPicker_MyPalette_port' value='server' />" +
			(window.location.hostname==='localhost' ? "your local server (“localhost”)" : (window.location.host+" —(i.e. “the cloud”)")) + "</label>"  );
		</script>
		<fieldset>
		<label><input type='radio' name='MasterColorPicker_MyPalette_port' value='local' />this computer’s local file system</label>
		<label class='import local' disabled='disabled'><input type='file' name='MasterColorPicker_MyPalette_import' disabled='disabled' />← drag files here</label>
		</fieldset>
		<label><input type='radio' name='MasterColorPicker_MyPalette_port' value='browser' />this browser’s private storage
			<note class='warn'><strong>¡Note</strong> the browser may delete it at any time!</note></label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_port' value='current' />a current MasterColorPicker™ Palette Table
			<note class='warn'><strong>¡Note</strong> this is temporary, and will be lost when this browser window closes!</note></label>
		<button type='button' name='MasterColorPicker_MyPalette_porter'><span class='export'>save</span><span class='import'>load<span class='server'> index</span></span></button>
	</fieldset>
	<fieldset class='paletteMerge import' disabled='disabled'><legend>import merge mode</legend>
		<label><input type='radio' name='MasterColorPicker_MyPalette_import_merge_mode' value='add' />add new <note>Add colors &amp; subpalettes to this palette; ignore duplicate names.</note></label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_import_merge_mode' value='merge' />merge new <note>Add colors to this palette; merge subpalettes, ignore duplicate color names.</note></label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_import_merge_mode' value='merge-over' />merge &amp; replace with new <note>Add colors to this palette; merge subpalettes, replace colors with duplicate names.</note></label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_import_merge_mode' value='over' />replace with new <note>Add colors &amp; subpalettes to this palette; replace those with duplicate names.</note></label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_import_merge_mode' value='replace' />all new <note>Clear existing palette, and load new palette.</note></label>
	</fieldset>
	<fieldset class='paletteMeta export' disabled='disabled'>
		<label>Palette filename: <input type='text' name='MasterColorPicker_MyPalette_filename' /></label>
		<fieldset><legend>palette headers:</legend>
		<textarea name='MasterColorPicker_MyPalette_headers[0]' rows='1' cols='50' value=""></textarea>
		</fieldset>
		<fieldset><legend>palette footers:</legend>
		<textarea name='MasterColorPicker_MyPalette_footers[0]' rows='1' cols='50' value=""></textarea>
		</fieldset>
		<label>Alternative Color Names:
			<select class='alternative' name='MasterColorPicker_MyPalette_alternative'>
				<option selected='true'>—none—</option>
				<option>lowercase</option>
				<option>UPPERCASE</option>
			</select><note referto='MasterColorPicker_helpFor_MyPalette_alternatives'> see <strong>☺Help☺</strong> </note></label>
		<label>¿Duplicate Color Names?
			<select class='duplicate' name='MasterColorPicker_MyPalette_duplicate'>
				<option value='forbid'>¡ Forbid !</optoin>
				<option value='append' selected='true'>Append name with an index #</option>
				<option value='ignore'>Ignore and overwrite</option>
			</select></label>
		<label class='browser server' disabled='disabled'>¿<input type='checkbox' name='MasterColorPicker_MyPalette_replace_file' disabled='disabled' /> replace existing file?</label>
		<label class='browser server' disabled='disabled'>¿<input type='checkbox' name='MasterColorPicker_MyPalette_autoload' disabled='disabled' /> auto-load this palette when MasterColorPicker starts?</label>
		<fieldset class='filetype local server'><legend>save as type:</legend>
		<label class='local'><input type='radio' name='MasterColorPicker_MyPalette_filetype' disabled='disabled' value="js" /> .js (for MasterColorPicker™—desktop auto-load use<note referto='MasterColorPicker_helpFor_MyPalette_autoload'> see <strong>☺Help☺</strong> </note>)</label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_filetype' disabled='disabled' value="json" /> .json (for MasterColorPicker™—server or other use)</label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_filetype' disabled='disabled' value="css" /> .css (Cascading Style Sheet
			<select name='MasterColorPicker_MyPalette_CSSautoType'>
			<option value="" selected='true'>palette</option>
			<option value="--">variables</option>
			<option value="#">ids</option>
			<option value=".">classes</option>
			</select>)<note referto='MasterColorPicker_helpFor_MyPalette_CSS-files'> see <strong>☺Help☺</strong> </note></label>
		<label><input type='radio' name='MasterColorPicker_MyPalette_filetype' disabled='disabled' value="gpl" /> .gpl (GIMP Palette format)</label>
		</fieldset>
	</fieldset>
</fieldset>
<table>
	<thead>
	<tr>
		<th></th>
		<th class='colorblind'>↓<span>protan</span></th>
		<th class='colorblind'>↓<span>deutan</span></th>
		<th class='colorblind'>↓<span>tritan</span></th>
		<th><label for='MasterColorPicker_MyPalette_[0][0][definition]'>↓ ↓ color definition ↓ ↓</label></th>
		<th></th>
		<th><label for='MasterColorPicker_MyPalette_[0][0][name]'>↓ ↓ color name ↓ ↓</label></th></tr>
	</thead>
	<tbody class='MyPaletteBody'>
	<tr>
		<th colspan='7'>
			<label class='subPalette'>parent Palette: <select name='MasterColorPicker_MyPalette[0][parent]'><option>«MyPalette root»</option></select></label>
			<label><span class='subPalette'>Sub-</span>Palette Name: <input type='text' name='MasterColorPicker_MyPalette[0][Name]' /></label>
			<label><input type='checkbox' name='MasterColorPicker_MyPalette_selectAll' />select all</label>
			<label class='subPalette'><input type='checkbox' name='MasterColorPicker_MyPalette_selectThis' />select this</label>
			<button type='button' name='MasterColorPicker_MyPalette_addSelected'>add selected</button>
			<label><input type='radio' name='MasterColorPicker_MyPalette_addToHere' />Auto-add new Colors below</label></th></tr>
	<tr class='MyColor'>
		<td toggleBorder='no'><input type='checkbox' name='MasterColorPicker_MyPalette[0][0][selected]' /></td>
		<td class='colorblind' colorblind='protan' toggleBorder='no'></td>
		<td class='colorblind' colorblind='deutan' toggleBorder='no'></td>
		<td class='colorblind' colorblind='tritan' toggleBorder='no'></td>
		<td><input type='text' name='MasterColorPicker_MyPalette[0][0][definition]'
			interfaceTarget='true' swatch="this.closest('.MyColor').firstElementChild" value='' /></td>
		<td class='dragHandle' title='drag from here or right-click for menu'>↕</td>
		<td><input type='text' name='MasterColorPicker_MyPalette[0][0][name]' tabToTarget='true' value='' /></td></tr>
	</tbody>
</table>
<menu class='MyPalette_ColorGenieMenu' standardItems='genie' title="">
<!--  The JavaScript is greatly dependent on the structure and text-content in this section.
			You may safely modify the content of the ‹span› tag  -->
	<li>insert:
		<span class='genie'>new color</span>
		<ul>
			<li class='genie'>all clips</li>
		</ul>
	</li>
	<li>copy to:<ul>
		<li class='genie'>new clip</li></ul></li>
	<li>cut to:<ul>
		<li class='genie'>new clip</li></ul></li>
	<li>paste from:<ul>
		</ul></li>
	<li title='triple-click'>delete</li>
	<li title='triple-click'>clear clipboard</li>
</menu>
</div><!--  close  MyPalette  -->


<div id='MasterColorPicker_Filter' class='pickerPanel'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span>Color-Filter</span></h2>
<p>The colors selected within this tool will mix with future colors selected from the color palettes.</p>
<p>(choose color(s) using any color-picker or type directly)</p>
	<fieldset>
	  <label><span>¿Average all filter-colors and apply the result, or apply each filter-color individually and progressively?</span>
			<select name='MasterColorPicker_Filter_average' backtabToTarget='true'><option selected='selected'>average</option><option>progressive</option></select></label>
	  <label><span>¿Add/subtract the filters’ average to the picked color, or grade the picked color to the filters’ average?</span>
			<select name='MasterColorPicker_Filter_applyToAverage'><option selected='selected'>add to</option><option>grade to</option><option>sub from</option></select></label>
	</fieldset>

	<table>
	<thead>
	<tr><th><label for='MasterColorPicker_Filter_color[0]'>color:</label></th>
			<th><label for='MasterColorPicker_Filter_factor[0]'>rate:<span> factor (0.0-1.0) or percent (0%-100%)</span></label></th>
			<th><label for='MasterColorPicker_Filter_apply[0]'>apply:<span> ¿Add/subtract each filter to the picked color, or grade the picked color to each filter?</span></label></th>
	</tr>
	</thead>
	<tbody>
	<tr class='filterColor'>
		<td><input type='text' name='MasterColorPicker_Filter_color[0]'
			interfaceTarget='true' swatch='this.nextSibling' value='<?php
			echo ($_POST['MasterColorPicker_Filter_Color'][0]!="") ? $_POST['MasterColorPicker_Filter_Color'][0] : ""; ?>' /><span class='swatch'></span></td>
		<td><input type='text' name='MasterColorPicker_Filter_factor[0]' title='factor (0.0-1.0) or percent (0%-100%)'
			value='<?php echo ($_POST['MasterColorPicker_Filter_Factor'][0]!="") ? $_POST['MasterColorPicker_Filter_Factor'][0] : "50%"; ?>'
			tabTo='s=this.parentNode.parentNode.lastElementChild.firstChild,  (s.disabled && s.getAttribute("tabToTarget")==="true") ? MasterColorPicker.dataTarget : ""' /></td>
		<td><select name='MasterColorPicker_Filter_apply[0]' tabToTarget='true'><option selected='selected'>add to</option><option>grade to</option><option>sub from</option></select></td>
	</tr>
	</tbody>
	</table>
</div><!--  close  MasterColorPicker_Filter  -->



<div id='MasterColorPicker_Lab' class='pickerPanel'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span title="press F3 for shortcut">Color-Space Lab</span></h2>
<table class='primaries'><caption><acronym>RGB</acronym></caption>
<tr><th>primary</th><th>byte value</th><th>#hex</th><th>percent%</th><td></td></tr>
<tr class='red'><th><label for='MasterColorPicker_Rgb_byte' style="color:red">Red:</label></th>
		<td><input type='numeric' name='MasterColorPicker_Rgb_byte' min='0' max='255' value='0' backtabToTarget='true' /></td>
		<td><input type='numeric' name='MasterColorPicker_Rgb_hex' class='hex' base='16' maxlength='2' size='2' value='00' /></td>
		<td><input type='numeric' name='MasterColorPicker_Rgb_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_Rgb_range' min='0' max='255' value='0' style="color:red" tabindex='-1' /></td>
</tr>
<tr class='green'><th><label for='MasterColorPicker_rGb_byte' style="color:green">Green:</label></th>
		<td><input type='numeric' name='MasterColorPicker_rGb_byte' min='0' max='255' value='0' /></td>
		<td><input type='numeric' name='MasterColorPicker_rGb_hex' class='hex' base='16' maxlength='2' size='2' value='00' /></td>
		<td><input type='numeric' name='MasterColorPicker_rGb_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_rGb_range' min='0' max='255' value='0' style="color:lime" tabindex='-1' /></td>
</tr>
<tr class='blue'><th><label for='MasterColorPicker_rgB_byte' style="color:blue">Blue:</label></th>
		<td><input type='numeric' name='MasterColorPicker_rgB_byte' min='0' max='255' value='0' /></td>
		<td><input type='numeric' name='MasterColorPicker_rgB_hex' class='hex' base='16' maxlength='2' size='2' value='00' /></td>
		<td><input type='numeric' name='MasterColorPicker_rgB_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_rgB_range' min='0' max='255' style="color:blue" tabindex='-1' value='0' /></td>
</tr>
</table>

<table><caption><acronym>HSL</acronym> <acronym>HSV</acronym>/<acronym>HSB</acronym> <acronym>HCG</acronym></caption>
<tr><th></th><th id='MasterColorPicker_Lab_hueUnitText'>degrees°</th><th>percent%</th><td></td></tr>
<tr class='hue'>
		<th><label for='MasterColorPicker_Hue_degrees'>Hue:</label></th>
		<td><input type='numeric' name='MasterColorPicker_Hue_degrees' step='any' value='0' /></td>
		<td><input type='numeric' name='MasterColorPicker_Hue_percent' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_Hue_range' min='0' max='360' value='0' tabindex='-1' /></td>
</tr>

<tr class='even'>
		<th><label for='MasterColorPicker_hSl_percent'>Saturation:</label></th>
		<td></td>
		<td><input type='numeric' name='MasterColorPicker_hSl_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hSl_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>
<tr>
		<th><label for='MasterColorPicker_hsL_percent'>Lightness:</label></th>
		<td></td>
		<td><input type='numeric' name='MasterColorPicker_hsL_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hsL_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>

<tr class='even'>
		<th><label for='MasterColorPicker_hSv_percent'>Saturation:</label></th>
		<td></td>
		<td><input type='numeric' name='MasterColorPicker_hSv_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hSv_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>
<tr>
		<th><label for='MasterColorPicker_hsV_percent'>Value:</label></th>
		<td></td>
		<td><input type='numeric' name='MasterColorPicker_hsV_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hsV_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>

<tr class='even'>
		<th><label for='MasterColorPicker_hCg_percent'>Chroma:</label></th>
		<td></td>
		<td><input type='numeric' name='MasterColorPicker_hCg_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hCg_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>
<tr>
		<th><label for='MasterColorPicker_hcG_percent'>Gray:</label></th>
		<td></td>
		<td><input type='numeric' name='MasterColorPicker_hcG_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hcG_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>
</table>

<table class='primaries'><caption><acronym>CMYK</acronym></caption>
<tr><th>primary</th><th>percent%</th><td></td></tr>
<tr class='cyan'>
		<th><label for='MasterColorPicker_Cmyk_percent' style="color:cyan">Cyan</label></th>
		<td><input type='numeric' name='MasterColorPicker_Cmyk_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_Cmyk_range' min='0' max='100' value='0' style="color:cyan" tabindex='-1' /></td>
</tr>
<tr class='magenta'>
		<th><label for='MasterColorPicker_cMyk_percent' style="color:magenta">Magenta</label></th>
		<td><input type='numeric' name='MasterColorPicker_cMyk_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_cMyk_range' min='0' max='100' value='0' style="color:magenta" tabindex='-1' /></td>
</tr>
<tr class='yellow'>
		<th><label for='MasterColorPicker_cmYk_percent' style="color:yellow">Yellow</label></th>
		<td><input type='numeric' name='MasterColorPicker_cmYk_percent' min='0' max='100' step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_cmYk_range' min='0' max='100' value='0' style="color:yellow" tabindex='-1' /></td>
</tr>
<tr class='black'>
		<th><label for='MasterColorPicker_cmyK_percent' style="color:black">Black</label></th>
		<td><input type='numeric' name='MasterColorPicker_cmyK_percent' min='0' max='100' step='any' value='100' /></td>
		<td><input type='range' name='MasterColorPicker_cmyK_range' min='0' max='100' value='100' style="color:black" tabindex='-1' /></td>
</tr>
</table>
<label>¿<input type='checkbox' name='MasterColorPicker_updateLabOnMouseMove' checked='checked' />update on Mouse move?</label>
<label>¿<input type='checkbox' name='MasterColorPicker_updateLabOnKeystroke' checked='checked' tabToTarget='true' />update on Keystroke?</label>
<span class='swatch'>Click here to Choose</span>
</div><!--  close  MasterColorPicker_Lab  -->



<div id='MasterColorPicker_Gradientor' class='pickerPanel'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span>Gradientor</span></h2>
<p class='underConstruction'><span>Under Construction:</span> no functionality</p>
<fieldset><legend>(choose colors using any color-picker or type directly)</legend>
 <label>color 1
	<input type='text' name='MasterColorPicker_Gradientor_color1' value='<?php
		echo ($_POST['MasterColorPicker_Gradientor_color1']!="") ? $_POST['MasterColorPicker_Gradientor_color1'] : "blue"; ?>'
		interfaceTarget='true' swatch='this.nextSibling' backtabToTarget='true' /><span class='swatch'></span></label>
 <label>↔through color-space↔
 	<select name='MasterColorPicker_Gradientor_colorSpace'>
		<option<?php if (!in_array($_POST['MasterColorPicker_Gradientor_colorSpace'], array('HSB', 'HSL', 'HCG', 'CMYK'), true))  echo " selected='selected'"; ?>>RGB</option>
		<option<?php if ($_POST['MasterColorPicker_Gradientor_colorSpace']==='HSB')  echo " selected='selected'"; ?>>HSB</option>
		<option<?php if ($_POST['MasterColorPicker_Gradientor_colorSpace']==='HSL')  echo " selected='selected'"; ?>>HSL</option>
		<option<?php if ($_POST['MasterColorPicker_Gradientor_colorSpace']==='HCG')  echo " selected='selected'"; ?>>HCG</option>
		<option<?php if ($_POST['MasterColorPicker_Gradientor_colorSpace']==='CMYK')  echo " selected='selected'"; ?>>CMYK</option>
 	</select></label>
 <label>color 2
	<input type='text' name='MasterColorPicker_Gradientor_color2'
		interfaceTarget='true' swatch='this.nextSibling' value='<?php
		echo ($_POST['MasterColorPicker_Gradientor_color2']!="") ? $_POST['MasterColorPicker_Gradientor_color2'] : "red"; ?>' /><span class='swatch'></span></label>
 <label id='MasterColorPicker_Gradientor_color3'>color 3
	<input type='text' name='MasterColorPicker_Gradientor_color3'
		interfaceTarget='true' swatch='this.nextSibling' value='<?php
		echo ($_POST['MasterColorPicker_Gradientor_color3']!="") ? $_POST['MasterColorPicker_Gradientor_color3'] : "lime"; ?>' /><span class='swatch'></span></label>
</fieldset>
<div><canvas width='256' height='38'></canvas></div>
<label title='2 — 256'>steps: <input type='number' id='testMe' name='MasterColorPicker_Gradientor_steps' min='2' max='256' step='1' value='16' /></label>
<label>¿<input type='checkbox' name='MasterColorPicker_Gradientor_tricolor' value='tricolor'<?php
	if ($_POST['MasterColorPicker_Gradientor_tricolor']==="tricolor") echo " checked='checked'"; ?>
	onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Gradientor_color3"), !this.checked);'  tabToTarget='true' />
tri-color?</label>
</div><!--  close  MasterColorPicker_Gradientor  -->



<div id='MasterColorPicker_Thesaurus' class='pickerPanel'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span title="press F7 for shortcut">Thesaurus</span></h2>
<p class='underConstruction'><span>Under Construction:</span> no functionality</p>
<p>This tool can help you identify the name of the closest color(s) in the chosen color-space geometry.</p>
<fieldset><legend>(choose color using any color-picker or type directly)</legend>
 <label>color:
	<input type='text' name='MasterColorPicker_Thesaurus_color' value='<?php
		echo ($_POST['MasterColorPicker_Thesaurus_color']!="") ? $_POST['MasterColorPicker_Thesaurus_color'] : ""; ?>'
		interfaceTarget='true' swatch='this.nextSibling' backtabToTarget='true' /><span class='swatch'></span></label>
 <label>color-space:
	<select name='MasterColorPicker_Thesaurus_colorSpace' tabToTarget='true'>>
		<option<?php if (!in_array($_POST['MasterColorPicker_Thesaurus_colorSpace'], array('HSB', 'HSL', 'HCG', 'CMYK'), true))  echo " selected='selected'"; ?>>RGB</option>
		<option<?php if ($_POST['MasterColorPicker_Thesaurus_colorSpace']==='HSB')  echo " selected='selected'"; ?>>HSB</option>
		<option<?php if ($_POST['MasterColorPicker_Thesaurus_colorSpace']==='HSL')  echo " selected='selected'"; ?>>HSL</option>
		<option<?php if ($_POST['MasterColorPicker_Thesaurus_colorSpace']==='HCG')  echo " selected='selected'"; ?>>HCG</option>
		<option<?php if ($_POST['MasterColorPicker_Thesaurus_colorSpace']==='CMYK')  echo " selected='selected'"; ?>>CMYK</option>
	</select></label>
</fieldset>
<fieldset id='MasterColorPicker_Thesaurus_references'><legend>search these named-color tables:</legend>
</fieldset>
<div></div><!-- this will receive the matching-color text  -->
</div><!--  close  MasterColorPicker_Thesaurus  -->



<div id='MasterColorPicker_mainPanel' class='pickerPanel expanding'>

<table class='picker palette' id='Spectral'><caption><h6>Spectral Progressive Color-Picker™</h6>click to choose<span id='SpectralIndicator'>&nbsp;<span id='SpectralSwatch'></span></span></caption>

<thead><tr><td colspan='100'><table>
<tr>
	<td colspan='6'><label>hue variety: <input type='range' name='hue_variety' value='<?php echo is_numeric($_POST['hue_variety']) ? $_POST['hue_variety'] : "30";?>' max='100' min='10' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' backtabTo='MasterColorPicker_palette_select' /></label>
									<label>mix variety: <input type='range' name='mix_variety' value='<?php echo is_numeric($_POST['mix_variety']) ? $_POST['mix_variety'] : "7";?>' max='20' min='5' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label><br />
									<label>x-shift: <input type='range' name='x_shift' value='<?php echo is_numeric($_POST['x_shift']) ? $_POST['x_shift'] : "0";?>' max='6.28' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label>
									<label>y-shift: <input type='range' name='y_shift' value='<?php echo is_numeric($_POST['y_shift']) ? $_POST['y_shift'] : "0";?>' max='1' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label>
									<label>mix shift: <input type='range' name='phase_shift' value='<?php echo is_numeric($_POST['phase_shift']) ? $_POST['phase_shift'] : "4.71";?>' max='9.42' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label></td><!-- Opera limits the number of digits in the value,min,max fields  -->
</tr>
<tr><th></th><th>channel</th><th>intensity</th><th>variation</th><th>shift</th><th>frequency</th></tr>
<tr style='color:red'><td>RED</td>
	<td>
		<input type='radio' name='red_c' value='1'<?php if ($_POST['red_c']==='1'  or  ($_POST['red_c']!=='2'  and  $_POST['red_c']!=='3'))  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='red_c' value='2'<?php if ($_POST['red_c']==='2')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='red_c' value='3'<?php if ($_POST['red_c']==='3')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
	</td>
	<td><input type='range' name='red_i' value='<?php echo is_numeric($_POST['red_i']) ? $_POST['red_i'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='red_v' value='<?php echo is_numeric($_POST['red_v']) ? $_POST['red_v'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='red_s' value='<?php echo is_numeric($_POST['red_s']) ? $_POST['red_s'] : "0";?>' max='6.28' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='red_f' value='<?php echo is_numeric($_POST['red_f']) ? $_POST['red_f'] : "1";?>' max='2' min='0.01' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
</tr>
<tr style='color:lime'><td>GREEN</td>
	<td>
		<input type='radio' name='grn_c' value='1'<?php if ($_POST['grn_c']==='1')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='grn_c' value='2'<?php if ($_POST['grn_c']==='2'  or  ($_POST['grn_c']!=='1'  and  $_POST['grn_c']!=='3'))  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='grn_c' value='3'<?php if ($_POST['grn_c']==='3')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
	</td>
	<td><input type='range' name='grn_i' value='<?php echo is_numeric($_POST['grn_i']) ? $_POST['grn_i'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='grn_v' value='<?php echo is_numeric($_POST['grn_v']) ? $_POST['grn_v'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='grn_s' value='<?php echo is_numeric($_POST['grn_s']) ? $_POST['grn_s'] : "0";?>' max='6.28' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='grn_f' value='<?php echo is_numeric($_POST['grn_f']) ? $_POST['grn_f'] : "1";?>' max='2' min='0.01' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
</tr>
<tr style='color:#4040FF'><td>BLUE</td>
	<td>
		<input type='radio' name='blu_c' value='1'<?php if ($_POST['blu_c']==='1')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='blu_c' value='2'<?php if ($_POST['blu_c']==='2')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='blu_c' value='3'<?php if ($_POST['blu_c']==='3'  or  ($_POST['blu_c']!=='2'  and  $_POST['blu_c']!=='1'))  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
	</td>
	<td><input type='range' name='blu_i' value='<?php echo is_numeric($_POST['blu_i']) ? $_POST['blu_i'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='blu_v' value='<?php echo is_numeric($_POST['blu_v']) ? $_POST['blu_v'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='blu_s' value='<?php echo is_numeric($_POST['blu_s']) ? $_POST['blu_s'] : "0";?>' max='6.28' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='blu_f' value='<?php echo is_numeric($_POST['blu_f']) ? $_POST['blu_f'] : "1";?>' max='2' min='0.01' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' tabToTarget='true' /></td>
</tr>
</table></td></tr></thead>

<tbody>
</tbody>
</table>



<table class='picker palette' id='BeezEye'>
<caption><h6>BeezEye Color Picker™</h6>click to choose</caption>
<tbody>
<tr>
	<td><label>Twist<input type='range' name='BeezEye_twist_value'
		value='50' min='0' max='100' backtabTo='MasterColorPicker_palette_select' /></label></td>
	<td><fieldset><legend>color space</legend>
		<dl>
			<dt>CMYK</dt>
				<dd>Cyan, Magenta, Yellow, Black</dd>
			<dt>HSV / HSB</dt>
				<dd>Hue, Saturation, Value&nbsp;<abbr title='also known as'>a.k.a.</abbr>&nbsp;Brightness</dd>
			<dt>HSL</dt>
				<dd>Hue, Saturation, Lightness</dd>
			<dt>HCG</dt>
				<dd>Hue, Chroma, Gray</dd>
			<dt>Curve</dt>
				<dd>modulates the saturation rate</dd>
			<dt>Twist</dt>
				<dd>twists the color-disk at its center to make it easier to find progressive color-series</dd>
		</dl>
		<label><input type='radio' name='BeezEye_model' value='cmyk'
			backtabTo="document.getElementById('BeezEye_twist').checked ? undefined : MasterColorPicker.picker_select" />CMYK</label>
		<label><input type='radio' name='BeezEye_model' value='hsv' />HSV / HSB</label>
		<label><input type='radio' name='BeezEye_model' value='hsl' checked='checked' />HSL</label>
		<label><input type='radio' name='BeezEye_model' value='hcg' />HCG</label>
		<label>¿<input type='checkbox' name='BeezEye_curve' value='curve' />curve?</label>
		<label>¿<input type='checkbox' name='BeezEye_twist' id='BeezEye_twist' value='twist' />twist?</label>
		</fieldset>
	</td>
</tr>
<tr>
	<td rowspan='2'><canvas width='360' height='360'></canvas></td>
	<td><label>Brightness <span>Value</span><input type='range' name='BeezEye_value' value='50' min='0' max='100' /></label></td>
</tr>
<tr>
	<td valign='bottom'><fieldset>
		<label>Curve<input type='range' name='BeezEye_curve_value' value='50' min='1' max='100' /></label>
		<label><input type='checkbox' name='BeezEye_curve_midring' value='midring' /> Mid–Ring</label>
		</fieldset>
	</td>
</tr>
<tr>
	<td><label>Hue Variety<input type='range' name='BeezEye_variety' value='15' min='5' max='89' step='2' tabToTarget='true' /></label></td>
	<td rowspan='2' id='BeezEye_swatch'></td>
</tr>
<tr><td id='BeezEye_indicator'> </td></tr>
</tbody>
</table>



<table class='picker palette' id='RainbowMaestro'><caption><h6>RainbowMaestro Harmonic Color Picker™</h6>click to choose</caption>
<thead>
	<tr><td colspan='2'>
	<label><input type='checkbox' name='RainbowMaestro_websafe' value='true' checked='checked' backtabTo='MasterColorPicker_palette_select' />websafe</label>
	<label><input type='checkbox' name='RainbowMaestro_splitComplement' value='true' />split-compliments</label>
	<label><input type='checkbox' name='RainbowMaestro_colorblind' value='true' checked='checked' />colorblind assist<mark class='footmark'>‡</mark></label>
	<label><input type='checkbox' name='RainbowMaestro_lock' value='true' />lock focal hue</label>
	</td></tr>
	<tr><td colspan='2'>
	<label>variety<input type='range' name='RainbowMaestro_variety' value='6' min='6' max='32' /></label>
	<label><input type='checkbox' name='RainbowMaestro_focalsOnly' value='true' />focals only</label>
	 <!--  input type='hidden' name='RainbowMaestro_focalHue' value='<?php //echo ($_POST['RainbowMaestro_focalHue']) ? $_POST['RainbowMaestro_focalHue'] : '0'; /*radians*/ ?>' /  -->
	<!--  label id='RainbowMaestro_hueIndicator'>focal hue:<input type='numeric' name='RainbowMaestro_focalHue_degrees' value='<?php //echo ($_POST['RainbowMaestro_focalHue_degrees']) ? $_POST['RainbowMaestro_focalHue_degrees'] : '0';
	 ?>' step='any' title='Hue given in degrees (0.0°–360.0°).' tabToTarget='true' /><span>&nbsp;</span></label  -->
	<label id='RainbowMaestro_hueIndicator'>focal hue:<input type='numeric' name='RainbowMaestro_focalHue' value='<?php echo ($_POST['RainbowMaestro_focalHue']) ? $_POST['RainbowMaestro_focalHue'] : '0';
	 ?>' step='any' tabToTarget='true' /><span class='hueIndicator'>&nbsp;</span><p>Hue given in <span class='hueAngleUnit'>degrees (0.0°–359.99°)</span>.</p></label>
	</td></tr>
	<tr><td colspan='2' id='RainbowMaestro_swatch'><span id='RainbowMaestro_indicator'>&nbsp;</span></td><tr>
</thead>
<tbody>
<tr><th>full color</th>
		<th class='colorblind'>Protan simulation<mark class='footmark'>‡</mark></th></tr>
<tr><td><div class='subpalette_swatch'></div><canvas width='360' height='360'></canvas></td>
		<td class='colorblind'><div class='subpalette_swatch'></div><canvas width='360' height='360'></canvas></td></tr>
<tr><th class='colorblind'>Deutan simulation<mark class='footmark'>‡</mark></th>
		<th class='colorblind'>Tritan simulation<mark class='footmark'>‡</mark></th></tr>
<tr><td class='colorblind'><div class='subpalette_swatch'></div><canvas width='360' height='360'></canvas></td>
		<td class='colorblind'><div class='subpalette_swatch'></div><canvas width='360' height='360'></canvas></td></tr>
</tbody>
<tfoot>
	<tr class='colorblind'><td colspan='2'><mark class='footmark'>‡</mark>simulations are approximate, and may vary between individuals and monitors</td></tr>
	<tr class='colorblind'><td colspan='2'><mark class='footmark'>‡</mark><span class='thanks'></span></td></tr>
</tfoot>
</table>




<table class='picker palette' id='Simple²'><caption><h6>Simple² Color Picker™</h6>click to choose</caption>
<tbody>
<tr>
<td colspan='3'><div class='indicator' id='Simple²saturation'>99.99%</div></td>
<td colspan='2'   style='border: 1px solid; border-bottom: none'
		>Chroma (Saturation)<br /><span class='lft'>0→</span>←‖1‖→<span class='rt'>←0</span></td>
<td colspan='2'><div class='indicator' id='Simple²hue'>359.999°</div></td>
</tr>
<tr>
<td   style='border-top: 1px solid; border-bottom: 1px solid;'
		><div><span class='lft'>0→</span>←←Saturation→→<span class='rt'>←1</span></div></td>
<td id="Simple²hSl"><canvas width='18' height='360'></canvas></td>
<td id="Simple²hSv" style='border-left: 1px solid;'
		><canvas width='18' height='360'></canvas></td>
<td id="Simple²wrapper" colspan='2'   style='border-left: 1px solid'
		><canvas width='360' height='360'></canvas></td>
<td   style='border: 1px solid; border-left: none'
		><div><span class='lft'>«0°→→</span>←←Hue→→<span class='rt'>←←360°»</span></div></td>
<td id="Simple²interface"><label>variety<input
	type='range' name='Simple²_variety' value='12' min='12' max='360' step='2' backtabTo='MasterColorPicker_palette_select' /></label></td>
</tr>
<tr>
<td rowspan='5'  style='border-bottom: 1px solid' valign='bottom'
		><label for='Simple²_lock'>← lock ↑</label><input type='checkbox' name='Simple²_lock' value='locked' tabToTarget='true' /></td>
<td   style='border-left: 1px solid'><div>HSL</div></td>
<td   style='border-left: 1px solid'><div>HSV</div></td>
<td    style='border: 1px solid; border-top: none'>Gray=0</td><td   style='border: 1px solid; border-top: none'>Gray=1</td>
<td id="Simple²swatch" colspan='2' rowspan='6' style='border: 1px solid white'></td>
</tr>
<tr>
<td   style='border-left: 1px solid'></td>
<td   style='border-left: 1px solid'></td>
<td id="Simple²hsV" colspan='2'><canvas width='360' height='18'></canvas></td>
</tr>
<tr>
<td   style='border-left: 1px solid'></td>
<td   style='border-left: 1px solid; border-bottom: 1px solid'></td>
<td colspan='2'   style='border-bottom: 1px solid'
		><span class='lft'>0→</span>←←Brightness / Value→→<span class='rt'>←1</span></td>
</tr>
<tr>
<td   style='border-left: 1px solid'></td>
<td></td>
<td id="Simple²hsL" colspan='2'><canvas width='360' height='18'></canvas></td>
</tr>
<tr>
<td   style='border-left: 1px solid; border-bottom: 1px solid'><div class='indicator' id='Simple²lvl'>99.99%</div></td>
<td   style='border-bottom: 1px solid'></td>
<td colspan='2'   style='border-bottom: 1px solid'
		><span class='lft'>0→</span>←←Lightness→→<span class='rt'>←1</span></td>
</tr>
<tr>
<td id="Simple²indicator" colspan='5'>&nbsp;</td>
</tr>
</tbody>
</table>


<table class='picker palette' id='YinYangNíHóng'><caption><h6>YinYang NíHóng<span>the Tao of Color Pickers™</span></h6>click to choose</caption>
<thead><tr>
<td><label><input type='radio' name='YinYang NíHóng' value='HSV' backtabTo='MasterColorPicker_palette_select' />HSB / HSV<dfn>Hue, Saturation, Brightness/Value</dfn></label></td>
<td><label><input type='radio' name='YinYang NíHóng' value='HSL' checked='checked' />HSL<dfn>Hue, Saturation, Lightness</dfn></label></td>
<td><label><input type='radio' name='YinYang NíHóng' value='HCG' tabToTarget='true' />HCG<dfn>Hue, Chroma, Gray</dfn></label></td>
</tr></thead>
<tbody>
<tr><td colspan='3' id='YinYangNíHóng_swatch'><div><canvas width='421' height='421'></canvas></div></td></tr>
<tr><td colspan='3' id='YinYangNíHóng_indicator'>&nbsp;</td></tr>
</tbody>
<tfoot>
<tr><td colspan='3'><dfn>YinYang:</dfn> balance of interplay between opposites (here: light &amp; dark, color &amp; gray).</td></tr>
<tr><td><dfn>NíHóng:</dfn> Neon.</td><td><dfn>Ní:</dfn> Rainbow; You.</td><td><dfn>Hóng:</dfn> Rainbow; Great.</td></tr>
<tr><td colspan='3'><dfn>Tao:</dfn> all-encompassing unity with balance of the most simple way.</td></tr>
<tr><td colspan='3'>All 16,777,216 different colors the modern computer can show within 2 clicks.</td></tr>
</tfoot>
</table>


<div id='MasterColorPicker_paletteTables'></div>

</div><!-- close MasterColorPicker_mainPanel -->



<div id='MasterColorPicker_Help' class='pickerPanel help'>
 <h2>MasterColorPicker<mark class='macronym'>™</mark><span title="press F1 for shortcut">☺Help☺</span></h2>
 <div>
	<h4>Valid values for colors include:</h4>
	<ul>
		<li>RGB values in hexadecimal (<acronym title='also known as'>a.k.a.</acronym> <abbr>hex</abbr>) with or without the leading <kbd>#</kbd> symbol.</li>
		<li>RGB values as:
			<ul>
				<li>integer byte values (<kbd>0—255</kbd>)</li>
				<li>percent ratios (<kbd>0%—100%</kbd> – be sure to use the percent <kbd>%</kbd> symbol)</li>
			</ul>
				<p>Each value may be separated by spaces/commas/semicolons.&nbsp;
				You may wrap() or prefix: the values with <kbd>rgb( )</kbd> or <kbd>rgb:</kbd> but that is not necessary.</p></li>
		<li>various different color-space models including:
			<ul>
				<li>CMYK</li>
				<li>CMY</li>
				<li>HSV / HSB</li>
				<li>HSL</li>
				<li>HCG</li>
				<li>Hue ←&nbsp; define only a hue-angle-value and see the full-color (fully chromatic) shade of the hue.</li>
				<li>XYZ →&nbsp; (Observer = 2°, Illuminant = D65) <kbd>0 ≤ X ≤ 95.047</kbd>, <kbd>0 ≤ Y ≤ 100</kbd>, <kbd>0 ≤ Z ≤ 108.883</kbd></li>
			</ul>
				<p>Use models by wrapping() or prefixing: their given values.&nbsp;
				Values are given as percent ratios (<kbd>0%—100%</kbd> with or without the percent sign %);
				except Hue values are given in angular values (starting at 3:00 and going counter-clockwise) using one of the following units:
				(the default unit used when none is specified is found on the MasterColorPicker “options” panel)</p>
			<ul>
				<li>in degrees (<kbd>0°—360°</kbd> ← postfixed using the <kbd>°</kbd> symbol or “<kbd>deg</kbd>”).</li>
				<li>in radians (<kbd>0ʳ—2π≈6.28319ʳ</kbd> ← postfixed using the <kbd>ʳ</kbd> symbol or “<kbd>rad</kbd>”).</li>
				<li>in gradians (<kbd>0grad—400grad</kbd> ← postfixed using “<kbd>grad</kbd>”).</li>
				<li>in % of a turn (<kbd>0%—100%</kbd> ← postfixed using the <kbd>%</kbd> symbol).</li>
				<li>of a turn (<kbd>0●—1●</kbd> ← postfixed using the <kbd>●</kbd> symbol or “<kbd>turn</kbd>”).</li>
			</ul>
			<ul class='keybrd'>
				<li>The “degrees” <kbd>°</kbd> symbol may be entered by typing <kbd><span>SHIFT</span>+<span>CTRL</span>+<span>5%</span></kbd></li>
				<li>The “radians” <kbd>ʳ</kbd> symbol may be entered by typing <kbd><span>CTRL</span>+<span>R</span></kbd></li>
				<li>The “turn” <kbd>●</kbd> symbol may be entered by typing <kbd><span>CTRL</span>+<span>1!</span></kbd></li>
			</ul></li>
		<li>Any of the available color-table colors.&nbsp;
				Colors should be prefixed: or wrapped() with the appropriate color-table name.&nbsp;
				<acronym>HTML</acronym>–<acronym>CSS</acronym> colors do not need to be wrapped or prefixed.</li>
	</ul>
	<h4>Keyboard shortcuts:</h4>
	<p>See also the Hue-Angle Symbols shortcuts above.</p>
	<dl>
		<dt><kbd><span>CTRL</span>+<span>TAB</span></kbd> |or| <kbd><span>CTRL</span>+<span>.&gt;</span></kbd></dt>
		<dd>Tab to the first input box in the top panel or next panel.</dd>

		<dt><kbd><span>SHIFT</span>+<span>CTRL</span>+<span>TAB</span></kbd> |or| <kbd><span>CTRL</span>+<span>,&lt;</span></kbd></dt>
		<dd>Tab to the first input box in the bottom panel or previous panel.</dd>

		<dt><kbd><span>F1</span></kbd></dt>
		<dd>Shows the ☺Help☺ panel, or hides it when pressed with the <kbd><span>SHIFT</span></kbd> key.</dd>

		<dt><kbd><span>F2</span></kbd></dt>
		<dd>Shows the MyPalette panel, or hides it when pressed with the <kbd><span>SHIFT</span></kbd> key.&nbsp;
				If there is a valid color in the input-box, pressing <kbd><span>CTRL</span>+<span>F2</span></kbd>
				copies that color to the next open MyPalette entry.</dd>

		<dt><kbd><span>F3</span></kbd></dt>
		<dd>Shows the Color-Space Lab panel, or hides it when pressed with the <kbd><span>SHIFT</span></kbd> key.&nbsp;
				If there is a valid color in the input-box, pressing <kbd><span>CTRL</span>+<span>F3</span></kbd>
				syncs the Color-Space Lab with that color.</dd>

		<dt><kbd><span>F4</span></kbd></dt>
		<dd>Shows the Color Thesaurus panel, or hides it when pressed with the <kbd><span>SHIFT</span></kbd> key.</dd>

		<dt><kbd><span>CTRL</span>+<span>F7</span></kbd></dt>
		<dd>If there is a valid color in the input-box, pressing <kbd><span>CTRL</span>+<span>F7</span></kbd>
				syncs the Thesaurus with that color.</dd>
	</dl>
	<table><caption>Extended Characters</caption>
	<tr><th>key</th> <th><kbd><span>CTRL</span></kbd></th> <th><kbd><span>CTRL</span>+<span>SHIFT</span></kbd></th></tr>
	<tr><td><kbd><span>1!</span></kbd></td> <td><code>●</code></td> <td><code>¡</code></td></tr>
	<tr><td><kbd><span>2@</span></kbd></td> <td><code>©</code></td> <td><code>®</code></td></tr>
	<tr><td><kbd><span>5%</span></kbd></td> <td><code></code></td> <td><code>°</code></td></tr>
	<tr><td><kbd><span>6^</span></kbd></td> <td><code>☺</code></td> <td><code>☻</code></td></tr>
	<tr><td><kbd><span>7&amp;</span></kbd></td> <td><code>♪</code></td> <td><code>♫</code></td></tr>
	<tr><td><kbd><span>8*</span></kbd></td> <td><code>×</code></td> <td><code>☼</code></td></tr>
	<tr><td><kbd><span>=+</span></kbd></td> <td><code>≈</code></td> <td><code>±</code></td></tr>
	<tr><td><kbd><span>/?</span></kbd></td> <td><code>÷</code></td> <td><code>¿</code></td></tr>
	<tr><td><kbd><span>[{</span></kbd></td> <td><code>‘</code></td> <td><code>“</code></td></tr>
	<tr><td><kbd><span>]}</span></kbd></td> <td><code>’</code></td> <td><code>”</code></td></tr>
	<tr><td><kbd><span>'"</span></kbd></td> <td><code>π</code></td> <td><code>φ</code></td></tr>
	<tr><td><kbd><span>r</span></kbd></td> <td><code>ʳ</code></td> <td><code></code></td></tr>
	</table>
	<hr />
	<h5>Examples:</h5>
	<ul>
		<li>These all give the same <span style='color: red;'>red</span> color:
			<ul>
				<li><kbd>255 0 0</kbd></li>
				<li><kbd>rgb (255 0 0)</kbd></li>
				<li><kbd>rgb(255, 0; 0)</kbd></li>
				<li><kbd>#FF0000</kbd></li>
				<li><kbd>ff0000</kbd></li>
				<li><kbd>HCG(0deg, 100, 50)</kbd></li>
				<li><kbd>HSL: 0°, 100%, 50%</kbd></li>
				<li><kbd>HSV: 0° 100% 100</kbd></li>
				<li><kbd>red</kbd></li>
				<li><kbd>HTML: red</kbd></li>
				<li><kbd>X11( RED )</kbd></li>
			</ul>
		</li>
		<li>These all give the same <span style='color: lightSkyBlue;'>blueish</span> color:
			<ul>
				<li><kbd>135; 206; 250</kbd></li>
				<li><kbd>RGB (135, 206 250)</kbd></li>
				<li><kbd>RGB: 135; 206; 250</kbd></li>
				<li><kbd>#87cefa</kbd></li>
				<li><kbd>87ceFA</kbd></li>
				<li><kbd>hcg(202.96deg, 45.098% 96.429%)</kbd></li>
				<li><kbd>hsl:56.3768%,92,75.49</kbd></li>
				<li><kbd>hsv ( .563768turn ; 46% ; 98.039% )</kbd></li>
				<li><kbd>lightSkyBlue</kbd></li>
				<li><kbd>html (LiGHTSKyBLue)</kbd></li>
				<li><kbd>X11:lIghtskYblUE</kbd></li>
			</ul>
		</li>
	</ul>

	<h4>Using MyPalette</h4>
	<p>You can use the “MyPalette” interface to create your own Color Palette Tables,
	give each color a descriptive name if you choose (i.e. what you use it for in your project)
	organize them into sub-palettes and give each sub-palette a descriptive name,
	and save the Palette Table in various formats.&nbsp;
	You can then later reload your saved Palette Table back into the “MyPalette” interface,
	or as a standard MasterColorPicker™ “color-picker table” (automatically if you like).&nbsp;
	This allows you to create projects that use the same color-set in many different images
	(for logos and product branding, etc.), as well as having a reference to the colors
	used in a design/image for later editing.&nbsp;
	If you plan on creating final bit-map images with high-compression using a paletted-image
	format (such as .png), you can begin by creating and saving your palette of choice colors
	using MasterColorPicker’s™ MyPalette.</p>
	<p>When you save the palette you create,
	your colors and sub-palettes can be named or not or a mix,
	and if named it must have unique names for each color
	in the “main palette” as well each “sub-palette.”&nbsp;
	Also, each “sub-palette” must have a unique name among “sub-palette names”
	<em>as well as</em> a unique name among “main palette color names.”&nbsp;
	Names that are duplicates will be (depending on options set) either:</p>
	<ul><li>automatically appended with an index number,</li>
			<li>overwritten by colors later in the palette with the same name;</li>
			<li>or you will be notified of the conflict.</li></ul>
	<p>When the palette you create is loaded as a MasterColorPicker™ Palette Table,
	colors that you leave un-named will show in the table with the
	color-definition next to the color-swatch; whereas colors that you do name
	show up in the table with the name next to the color swatch,
	and the color definition will pop-up when the mouse-pointer hovers over
	the swatch.</p>
	<h6 id='MasterColorPicker_helpFor_MyPalette_alternatives'>Alternative color names</h6>
	<p>Alternative spellings for color names can be included,
	but hidden when listed as a MasterColorPicker Palette Table.&nbsp;
	You do this by choosing <code>lowercase</code> or <code>UPPERCASE</CODE>
	for “Alternatives” in the Export File dialog.&nbsp;
	Then colors you name with all lowercase or UPPERCASE letters
	(based on your choice) become “alternatives”.&nbsp;
	For instance, the <abbr>HTML</abbr> Palette includes both
	“<code>Gray</code>” and “<code>grey</code>” but only “<code>Gray</code>” shows in the table;
	yet the user can type <code>Grey</code> or <code>gray</code>
	(note color-names are also case-insensitive) and expect the same color.&nbsp;</p>
	<h6 id='MasterColorPicker_helpFor_MyPalette_autoload'>Auto-loading your palettes</h6>
	<p>If you save your palette to your “localhost” server, the server cloud,
	or in the browser’s private storage (when available),
	it can be auto-loaded in the future when you use MasterColorPicker™.&nbsp;
	Simply select that option when you save your palette, and that’s it.</p>
	<p>If you are using MasterColorPicker™—desktop, save the file as type .js
	and save the file in the same folder as the <code>MasterColorPicker_desktop.htm</code>
	file or in a sub-folder, or the browser will prevent you from loading it.&nbsp;
	Then open the <code>MasterColorPicker_desktop.htm</code> file in your favorite
	text-editor and scroll down about a page or so to the bottom of the HTML document head
	(see the line with: <code>&lt;/head&gt;</code> just above the line with: <code>&lt;body&gt;</code> ).&nbsp;
	Just above the bottom of the head you will see multiple lines that begin with
	<code>&lt;script type="… … …</code> — duplicate one of them and change the
	<code>src="… … …"</code> so it’s filepath leads to the file you saved from “MyPalette.”&nbsp;
	If it is in the same folder as <code>MasterColorPicker_desktop.htm</code>
	you only need the filename: for example <code>src="<i>your_colors.palette.js</i>"</code>&nbsp;
	If it is in a sub-folder, only include that subpath and filename: for example
	<br /><code>src="<i>color_palettes/desktop_palettes/your_project/your_colors.palette.js</i>"</code>&nbsp;<br />
	If you are using a Windows® system, don’t confuse folder seperators!&nbsp;
	Browsers like forward-slashes /&nbsp;<br />
	Then save the <code>MasterColorPicker_desktop.htm</code> file.</p>

	<h6 id='MasterColorPicker_helpFor_MyPalette_CSS-files'>Exporting to <abbr title='Cascading Style Sheet'>CSS</abbr> files</h6>
	<p>When you export your palette to a CSS file,
	the Palette &amp; Sub-Palette <em>names</em> and Color <em>names</em> take on a special meaning:&nbsp;
	they become <abbr>CSS</abbr> selectors.&nbsp;
	Color <em>names</em> may also instead become <abbr>CSS</abbr> <code><var>variables</var></code>.&nbsp;
	When you save the file, the export dialog offers an option to automatically convert
	the Color <em>names</em> into a variable or a type of <abbr>CSS</abbr> selector,
	or simply let you manage all that by hand.&nbsp;
	If any of your <em>names</em> begin with a valid <abbr>CSS</abbr> selector,
	it will be recognized and and the <em>name</em> will not be auto-converted.&nbsp;
	If you begin a <em>name</em> with the <code>$</code> character,
	the <code>$</code> will be removed from the beginning of the <em>name</em>,
	and the <em>name</em> will not then be auto-converted;&nbsp; this is a “custom-selector” for an element-name,
	or any other special selector that may emerge.</p>

	<p>When MyPalette then exports to a <abbr>CSS</abbr> file, the (Sub-)Palette <em>names</em>
	chain together according to their “parent Palette” and recursively its “parent Palette”
	to create one long <abbr>CSS</abbr> selector.&nbsp;
	(Note that MyPalette does not validate your <abbr>CSS</abbr>,
	it only chains together what you create.)&nbsp;
	If any of your Color <em>names</em> are — or are automatically converted to —
	a <abbr>CSS</abbr> selector,
	then it is appended to the selector chain of the palette it is in,
	and the color it defined is set as a “<code>color: </code>” property/value pair
	for that appended chain’s resulting <abbr>CSS</abbr> selector.&nbsp;
	If your Color <em>name</em> begins with <code>¡bg!</code>
	(use <kbd><span>SHIFT</span>+<span>CTRL</span>+<span>1!</span></kbd> for the ¡ character)
	then it is stripped from the beginning of your color<em>name</em>
	and the above said property/value pair is instead a “<code>background-color: </code>”.&nbsp;
	If your Color <em>name</em> begins with <code>!</code> then
	it is stripped from the beginning of your color<em>name</em>
	and the above said property/value pair is marked as “<code>!important</code>”.&nbsp;
	Use <code>¡bg!!</code> to do both.&nbsp;
	For example, if your Palette <em>name</em> is “body”
	and a Sub-Palette <em>name</em> is “div.foobar”
	and a Color <em>name</em> in the “div.foobar” Sub-Palette is “<code>¡bg!!warning</code>”
	and “auto-convert” is set for “classes”,
	and the color you define is “<code>#401000</code>”
	then the output line in the <abbr>CSS</abbr> file would be:
	<code class='multiline'>body div.foobar .warning { background-color: #401000 !important; }</code></p>

	<p>If your Color <em>name</em> is — or is automatically converted to — a
	<abbr>CSS</abbr> <code><var>variable</var></code> (it begins with <code>--</code>)
	then it is assigned as a property/value pair to the selector defined by the
	(Sub-)Palette <em>name</em> and its hierarchy.&nbsp;
	Similarly, if a color has no name (after processing out “background-color” and “!important” markers)
	then it is assigned as a property/value pair (including its background and important properties)
	to the selector defined by the (Sub-)Palette <em>name</em> and its hierarchy.&nbsp;
	Given the example in the above paragraph,
	if the Color <em>name</em> is simply <code>¡bg!!</code> then the output is:
	<code class='multiline'>body div.foobar {
	background-color: #401000 !important;
 }</code>
	and if another Color <em>name</em> in the same Sub-Palette is <code>--bazbuz</code>
	with the color-definition <code>#1000A0</code>
	then the output is:
	<code class='multiline'>body div.foobar {
	background-color: #401000 !important;
	--bazbuz: #1000A0;
 }</code>
	</p>

	<hr />
	<h5>MasterColorPicker™ by SoftMoon-WebWare</h5>
	<p>Copyright © 2011, 2012, 2013, 2014, 2015, 2018, 2019, 2020 by Joe Golembieski, SoftMoon-WebWare
		 ( <kbd>http://SoftMoon-WebWare.com/</kbd> ):&nbsp; All rights reserved.</p>
	<p>The Rigden Websafe Colorblind data was compiled by Christine Rigden, published circa 1997, updated 2010
		 ( <kbd>http://safecolours.rigdenage.com/</kbd> ).&nbsp;
		 The Websafe-Color Interpolator color-blind filter function
		 Copyright © 2019 by Joe Golembieski, SoftMoon-WebWare.</p>
	<p>The Wickline Color Blindness Simulation algorithmic filter function is
     Copyright © 2000-2001 by Matthew Wickline and the
     Human-Computer Interaction Resource Network.&nbsp;
     It is used with the permission of Matthew Wickline and <abbr>HCIRN</abbr>,
     and is freely available for non-commercial use.&nbsp; For commercial use, please
     contact the Human-Computer Interaction Resource Network ( <kbd>http://hcirn.com/</kbd> ).</p>
 </div>
</div><!--  close  help  -->



<div id='paletteLoadingAlert'><div>
 <h3>Loading Palettes:</h3>
 <p>Please Wait</p>
<div></div></div></div><!--  do not separate or modify this line  -->


</section><!--  close  MasterColorPicker  HTML  -->

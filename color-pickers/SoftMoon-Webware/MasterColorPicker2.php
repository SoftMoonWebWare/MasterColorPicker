<!--  MasterColorPicker 2  Copyright © 2012, 2013 Joe Golembieski, SoftMoon-WebWare
      release x.x
	Note that these color charts and palettes will work without an enclosing <form>,
but to retain the settings this file may be included inside an existing web <form></form>
-->

<!--  You may move these support scripts to the document head, especially if you plan on using them with other code  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/UniDOM.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/HTTP.js' defer></script><!-- ESSENTIAL for server version, NOT for desktop use -->
<!--  script type='text/javascript' src='JS_toolbucket/Log.js' defer></script><!--  only if you plan on logging to debug -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/Picker.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/Math+++.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/rgb.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type="text/javascript" src="color-pickers/Rigden_colorblind-convert_table.js" defer></script><!-- supports RainbowMaestro -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/FormFieldGenie.js' defer></script><!-- supports MyPalette & ColorFilter -->
<script type='text/javascript' src='JS_toolbucket/Stylesheet.js' defer></script><!-- supports ColorFilter -->

<!-- div id='MasterColorPicker_debugLog'></div>
<button onclick="MasterColorPicker.debug.clear();" style='position: relative; z-index: 10000'>Clear Log</button><!--  -->

<section id='MasterColorPicker'>

<div id='MasterColorPicker_options' class='pickerPanel'>
<header><h1>MasterColorPicker™</h1> by <address>SoftMoon-WebWare</address></header>

<div><h3>Options▼</h3>
<div>
<fieldset id='x_ColorPicker_options' class='pickerOptions'><legend><?php echo $_POST['palette_select'] ? $_POST['palette_select'] : 'RainbowMaestro';  ?> mode:</legend>
	<label>output<select id='MasterColorPicker_outputMode' name='MasterColorPicker_outputMode'>
	<option<?php if (!in_array($_POST['MasterColorPicker_outputMode'], array('RGB', 'native', 'HSV', 'HSL', 'HCG', 'CMYK'), true))  echo " selected='selected'"; ?>>hex</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='RGB')  echo " selected='selected'"; ?> title='Red, Green, Blue'>RGB</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='native')  echo " selected='selected'"; ?>>native</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='HSV')  echo " selected='selected'"; ?>>HSB</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='HSL')  echo " selected='selected'"; ?>>HSL</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='HCG')  echo " selected='selected'"; ?>>HCG</option>
	<option<?php if ($_POST['MasterColorPicker_outputMode']==='CMYK')  echo " selected='selected'"; ?>>CMYK</option>
	</select></label>
	<label>¿<input type='checkbox' id='keepPrecision' name='keepPrecision' value='true' <?php
	if ($_POST['keepPrecision']=='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>
	onchange='SoftMoon.WebWare.rgb.keepPrecision=this.checked;' />keep precision?
	<p>Hex and RGB values are calculated from the native format, and others are calculated from the RGB values.&nbsp;
			RGB values may be rounded off to integers in the process yielding differences that are especially noticeable in Hue values.&nbsp;
			(More minor round off errors will always be possible due to floating-point mathematics used by computers.)&nbsp;
			Note RGB values will always be shown as integers, and are always used internally by the computer’s hardware
			as integers, so by <strong>not</strong> keeping precision, resulting conversions from the RGB values reflect
			the “used RGB” values.</p></label>
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
	<label id='MasterColorPicker_interlink'
			title='Choosing a color points to the same color in all interlinked palettes.'>¿<input
			type='checkbox' name='MasterColorPicker_doInterlink' value='true' <?php
			if ($_POST['MasterColorPicker_doInterlink']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>interlink?</label>
	<label id='MasterColorPicker_applyToAll'>¿<input type='checkbox' name='MasterColorPicker_applyToAll' value='true' <?php
			if ($_POST['MasterColorPicker_applyToAll']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>apply to all?</label>
</fieldset>

<div>
<p id='MasterColorPicker_returnPanelsOn3'>Drag panels by their handles.&nbsp;
Triple-click on panel handles (or this message) to return the panel(s) to home position.&nbsp;
<!--[if IE gt 9] -->
Right-click or Shift-click to: pin a panel to the page when it is pinned to the window,
or pin it to the window when it is pinned to the page.
<!--[endif] -->
</p>
<fieldset class='pickerOptions'>
<label>¿<input type='checkbox' name='MasterColorPicker_showMyPalette' id='MasterColorPicker_showMyPalette' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_MyPalette"), !this.checked);'
		<?php if ($_POST['MasterColorPicker_showFilter']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show/use MyPalette?</label>
<label>¿<input type='checkbox' name='MasterColorPicker_showFilter' id='MasterColorPicker_showFilter' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Filter"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showFilter']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show/use Color-Filter?</label>
<label>¿<input type='checkbox' name='MasterColorPicker_showLab' id='MasterColorPicker_showLab' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Lab"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showLab']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show Color-Space Lab?</label>
<label>¿<input type='checkbox' name='MasterColorPicker_showGradientor' id='MasterColorPicker_showGradientor' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Gradientor"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showGradientor']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show Gradientor?</label>
<label>¿<input type='checkbox' name='MasterColorPicker_showThesaurus' id='MasterColorPicker_showThesaurus' value='true'
		onchange='UniDOM.disable(document.getElementById("MasterColorPicker_Thesaurus"), !this.checked);' <?php
		if ($_POST['MasterColorPicker_showThesaurus']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>show Librarian/Thesaurus?</label>
</fieldset>
</div>

<fieldset>
	<label>¿<input type='checkbox' name='RGB_autoconvert' id='RGB_autoconvert' value='true' <?php
			if ($_POST['RGB_autoconvert']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>auto-convert?
		<span> Clicking a choice below can auto-convert your selected colors to the chosen color-space-model format.</span></label>
	<fieldset id='RGB_by'><legend>Enter <acronym>RGB</acronym> color-space values as:</legend>
		<label><input type='radio' name='RGB_by' value='byte' onclick='SoftMoon.WebWare.rgb.valuesAsByte= this.checked' <?php
			if ($_POST['RGB_by']!=='factor')  echo 'checked="checked" '; ?>/>Byte value (integer 0↔255)</label>
		<label><input type='radio' name='RGB_by' value='factor' onclick='SoftMoon.WebWare.rgb.valuesAsByte= !this.checked' <?php
			if ($_POST['RGB_by']==='factor')  echo 'checked="checked" '; ?>/>Percent or Factor</label>
		<p>All <acronym>RGB</acronym> values entered between <span>0↔0.999…</span> when the default mode is “byte” will be considered factors.</p>
	</fieldset>
	<fieldset id='RGB_convertFrom'><legend>Enter color-space values as:</legend>
		<label><input type='radio' name='RGB_convertFrom' value='percent' onclick='SoftMoon.WebWare.rgb.valuesAsPercent= this.checked' <?php
			if ($_POST['RGB_convertFrom']!=='factor')  echo 'checked="checked" '; ?>/>Percent (0.0%↔100.0%)</label>
		<label><input type='radio' name='RGB_convertFrom' value='factor' onclick='SoftMoon.WebWare.rgb.valuesAsPercent= !this.checked' <?php
			if ($_POST['RGB_convertFrom']==='factor')  echo 'checked="checked" '; ?>/>Factor (0.0↔1.0)</label>
		<p>Percent values may be forced using values <span>0.0%↔100.0%</span> entered with a trailing “percent” sign.</p>
	</fieldset>
	<fieldset id='RGB_convertHue'><legend>Enter Hue values as:</legend>
		<label><input type='radio' name='RGB_convertHue' value='degrees' onclick='SoftMoon.WebWare.rgb.huesByDegrees= this.checked' <?php
			if ($_POST['RGB_convertHue']!=='factor')  echo 'checked="checked" '; ?>/>Degrees (0.0°↔360.0°)</label>
		<label><input type='radio' name='RGB_convertHue' value='factor' onclick='SoftMoon.WebWare.rgb.huesByDegrees= !this.checked' <?php
			if ($_POST['RGB_convertHue']==='factor')  echo 'checked="checked" '; ?>/>Percent or Factor</label>
		<p>Hue values may be forced to degrees using values <span>0.0°↔360.0°</span> entered with a trailing “degrees” sign or by using the three letters “deg”.</p>
	</fieldset>
</fieldset>
</div></div>

<label>palette: <select id='palette_select' name='palette_select' tabToTarget='true'>
<option<?php if ($_POST['palette_select']==='RainbowMaestro'  or  $_POST['palette_select']=="")  echo " selected='selected'"?>>RainbowMaestro</option>
<option<?php if ($_POST['palette_select']==='Spectral')  echo " selected='selected'"?>>Spectral</option>
<option<?php if ($_POST['palette_select']==='BeezEye')  echo " selected='selected'"?>>BeezEye</option>
<option<?php if ($_POST['palette_select']==='Simple²')  echo " selected='selected'"?>>Simple²</option>
<option<?php if ($_POST['palette_select']==='YinYang NíHóng')  echo " selected='selected'"?>>YinYang NíHóng</option>
</select></label>
<script type="text/javascript">//<![CDATA[  capture the sent palette name in case it was a color-names-table - their names are not known here as these are built dynamically using JavaScript with data from HTTP, or from other JavaScript files
	if (typeof SoftMoon != 'object')  SoftMoon=new Object;
	if (typeof SoftMoon._POST != 'object')  SoftMoon._POST=new Object;
	<?php if ($_POST['palette_select']) echo 'SoftMoon._POST["palette_select"]="',$_POST['palette_select'],'"'; ?>
//]]></script>

</div><!--  close  MasterColorPicker_options  -->



<div id='MasterColorPicker_MyPalette' class='pickerPanel expanding'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span>MyPalette</span></h2>
<p>(choose color(s) using any color-picker or type directly)</p>
<fieldset>
<button name='MasterColorPicker_MyPalette_makeSub'>create sub-palette</button>
<button name='MasterColorPicker_MyPalette_delete'>delete selected</button>
<button name='MasterColorPicker_MyPalette_save'>save palette</button>
<label>Auto-add to MyPalette: <select name='MasterColorPicker_addToMyPalette'>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='double-click')  echo " selected='selected'"; ?>>double-click</option>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='shift-click')  echo " selected='selected'"; ?>>shift-click</option>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='all selected')  echo " selected='selected'"; ?>>all selected</option>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='single-click')  echo " selected='selected'"; ?>>single-click</option>
	<option<?php if ($_POST['MasterColorPicker_addtoMyPalette']==='never')  echo " selected='selected'"; ?>>never</option>
	</select></label>
</fieldset>
<table>
	<thead>
	<tr><th></th>
		<th><label for='MasterColorPicker_MyPalette_[0][0][definition]'>color definition:</label></th>
		<th><label for='MasterColorPicker_MyPalette_[0][0][name]'>name:</label></th></tr>
	</thead>
	<tbody>
	<tr>
		<th colspan='3'>
			<label><input type='checkbox' name='MasterColorPicker_MyPalette_selectAll' />select all</label>
			<button name='MasterColorPicker_MyPalette_addSelected'>add selected</button>
			<label><input type='radio' name='MasterColorPicker_MyPalette_addToHere' checked='checked' />Auto-add new Colors below</label></th></tr>
	<tr class='MyColor'>
		<td><input type='checkbox' name='MasterColorPicker_MyPalette[0][0][selected]' value='true' /></td>
		<td><input type='text' name='MasterColorPicker_MyPalette[0][0][definition]'
			interfaceTarget='true' swatch='this.parentNode.previousElementSibling' value='' /><span class='dragHandle' title='drag from here or right-click for menu'>↕</span></td>
		<td><input type='text' name='MasterColorPicker_MyPalette[0][0][name]' tabToTarget='true' value='' /></td></tr>
	</tbody>
	<tbody class='subPalette'><!-- note these names below are indexed properly for the FormFieldGenie -->
	<tr>
		<th colspan='3'>
			<label>Sub-palette name: <input type='text' name='MasterColorPicker_MyPalette[0][subPalette][name]' /></label>
			<button name='MasterColorPicker_MyPalette_addSelected'>add selected</button>
			<label><input type='checkbox' name='MasterColorPicker_MyPalette_selectAll' />select all</label>
			<label><input type='checkbox' name='MasterColorPicker_MyPalette_selectThis' />select this</label>
			<label><input type='radio' name='MasterColorPicker_MyPalette_addToHere' />Auto-add new Colors below</label></th></tr>
	<tr class='MyColor'>
		<td><input type='checkbox' name='MasterColorPicker_MyPalette[0][0][selected]' value='true' /></td>
		<td><input type='text' name='MasterColorPicker_MyPalette[0][0][definition]'
			interfaceTarget='true' swatch='this.parentNode.previousElementSibling' value='' /><span class='dragHandle' title='drag from here or right-click for menu'>↕</span></td>
		<td><input type='text' name='MasterColorPicker_MyPalette[0][0][name]' tabToTarget='true' value='' /></td></tr>
	</tbody>
</table>
<ul class="MyPalette_ColorGenieMenu">
	<li>insert new color</li>
	<li>copy to:<ul><li>new clip</li></ul></li>
	<li>cut to:<ul><li>new clip</li></ul></li>
	<li>paste from:<ul><li>all clips</li></ul></li>
	<li>delete</li>
</ul>
</div><!--  close  MyPalette  -->


<div id='MasterColorPicker_Filter' class='pickerPanel'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span>Color-Filter</span></h2>
<p>(choose color(s) using any color-picker or type directly)</p>
	<fieldset>
	  <label><span>¿Average all filter-colors and apply the result, or apply each filter-color individually and progressively?</span>
			<select name='MasterColorPicker_Filter_average'><option selected='selected'>average</option><option>progressive</option></select></label>
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
	<tr>
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
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span>Color-Space Lab</span></h2>
<table class='primaries'><caption><acronym>RGB</acronym></caption>
<tr><th>primary</th><th>byte value</th><th>#hex</th><th>percent%</th><td></td></tr>
<tr class='red'><th><label for='MasterColorPicker_Rgb_byte' style="color:red">Red:</label></th>
		<td><input type='number' name='MasterColorPicker_Rgb_byte' min='0' max='255' value='0' /></td>
		<td><input type='text' class='hex' name='MasterColorPicker_Rgb_hex' maxlength='2' size='2' value='00' /></td>
		<td><input type='number' name='MasterColorPicker_Rgb_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_Rgb_range' min='0' max='255' value='0' style="color:red" tabindex='-1' /></td>
</tr>
<tr class='green'><th><label for='MasterColorPicker_rGb_byte' style="color:green">Green:</label></th>
		<td><input type='number' name='MasterColorPicker_rGb_byte' min='0' max='255' value='0' /></td>
		<td><input type='text' class='hex' name='MasterColorPicker_rGb_hex' maxlength='2' size='2' value='00' /></td>
		<td><input type='number' name='MasterColorPicker_rGb_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_rGb_range' min='0' max='255' value='0' style="color:lime" tabindex='-1' /></td>
</tr>
<tr class='blue'><th><label for='MasterColorPicker_rgB_byte' style="color:blue">Blue:</label></th>
		<td><input type='number' name='MasterColorPicker_rgB_byte' min='0' max='255' value='0' /></td>
		<td><input type='text' class='hex' name='MasterColorPicker_rgB_hex' maxlength='2' size='2' value='00' /></td>
		<td><input type='number' name='MasterColorPicker_rgB_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_rgB_range' min='0' max='255' style="color:blue" tabindex='-1' value='0' /></td>
</tr>
</table>

<table><caption><acronym>HSL</acronym> <acronym>HSB</acronym>/<acronym>HSV</acronym> <acronym>HCG</acronym></caption>
<tr><th></th><th>degrees°</th><th>percent%</th><td></td></tr>
<tr class='hue'>
		<th><label for='MasterColorPicker_Hue_degrees'>Hue:</label></th>
		<td><input type='number' name='MasterColorPicker_Hue_degrees' min='0' max='360'step='any' value='0' /></td>
		<td><input type='number' name='MasterColorPicker_Hue_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_Hue_range' min='0' max='360' value='0' tabindex='-1' /></td>
</tr>

<tr class='even'>
		<th><label for='MasterColorPicker_hSl_percent'>Saturation:</label></th>
		<td></td>
		<td><input type='number' name='MasterColorPicker_hSl_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hSl_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>
<tr>
		<th><label for='MasterColorPicker_hsL_percent'>Lightness:</label></th>
		<td></td>
		<td><input type='number' name='MasterColorPicker_hsL_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hsL_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>

<tr class='even'>
		<th><label for='MasterColorPicker_hSb_percent'>Saturation:</label></th>
		<td></td>
		<td><input type='number' name='MasterColorPicker_hSb_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hSb_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>
<tr>
		<th><label for='MasterColorPicker_hsB_percent'>Brightness:</label></th>
		<td></td>
		<td><input type='number' name='MasterColorPicker_hsB_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hsB_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>

<tr class='even'>
		<th><label for='MasterColorPicker_hCg_percent'>Chroma:</label></th>
		<td></td>
		<td><input type='number' name='MasterColorPicker_hCg_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hCg_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>
<tr>
		<th><label for='MasterColorPicker_hcG_percent'>Gray:</label></th>
		<td></td>
		<td><input type='number' name='MasterColorPicker_hcG_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_hcG_range' min='0' max='100' value='0' tabindex='-1' /></td>
</tr>
</table>

<table class='primaries'><caption><acronym>CMYK</acronym></caption>
<tr><th>primary</th><th>percent%</th><td></td></tr>
<tr class='cyan'>
		<th><label for='MasterColorPicker_Cmyk_percent' style="color:cyan">Cyan</label></th>
		<td><input type='number' name='MasterColorPicker_Cmyk_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_Cmyk_range' min='0' max='100' value='0' style="color:cyan" tabindex='-1' /></td>
</tr>
<tr class='magenta'>
		<th><label for='MasterColorPicker_cMyk_percent' style="color:magenta">Magenta</label></th>
		<td><input type='number' name='MasterColorPicker_cMyk_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_cMyk_range' min='0' max='100' value='0' style="color:magenta" tabindex='-1' /></td>
</tr>
<tr class='yellow'>
		<th><label for='MasterColorPicker_cmYk_percent' style="color:yellow">Yellow</label></th>
		<td><input type='number' name='MasterColorPicker_cmYk_percent' min='0' max='100'step='any' value='0' /></td>
		<td><input type='range' name='MasterColorPicker_cmYk_range' min='0' max='100' value='0' style="color:yellow" tabindex='-1' /></td>
</tr>
<tr class='black'>
		<th><label for='MasterColorPicker_cmyK_percent' style="color:black">Black</label></th>
		<td><input type='number' name='MasterColorPicker_cmyK_percent' min='0' max='100'step='any' value='100' tabToTarget='true' /></td>
		<td><input type='range' name='MasterColorPicker_cmyK_range' min='0' max='100' value='100' style="color:black" tabindex='-1' /></td>
</tr>
</table>
<label>¿<input type='checkbox' name='MasterColorPicker_updateLabOnMouseMove' checked='checked' />update on Mouse move?</label>
<span class='swatch'>Click here to Choose</span>
</div><!--  close  MasterColorPicker_Lab  -->



<div id='MasterColorPicker_Gradientor' class='pickerPanel'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span>Gradientor</span></h2>
<fieldset><legend>(choose colors using any color-picker or type directly)</legend>
 <label>color 1
	<input type='text' name='MasterColorPicker_Gradientor_color1'
		interfaceTarget='true' swatch='this.nextSibling' value='<?php
		echo ($_POST['MasterColorPicker_Gradientor_color1']!="") ? $_POST['MasterColorPicker_Gradientor_color1'] : "blue"; ?>' /><span class='swatch'></span></label>
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
	onchange='with (SoftMoon.WebWare) {UniDOM.disable(document.getElementById("MasterColorPicker_Gradientor_color3"), !this.checked);}' />
tri-color?</label>
</div><!--  close  MasterColorPicker_Gradientor  -->



<div id='MasterColorPicker_Thesaurus' class='pickerPanel'>
<h2>MasterColorPicker<mark class='macronym'>™</mark> <span>Librarian/Thesaurus</span></h2>
<p>This tool can help you identify the name of the closest color(s) in the chosen color-space geometry.</p>
<fieldset><legend>(choose color using any color-picker or type directly)</legend>
 <label>color:
	<input type='text' name='MasterColorPicker_Thesaurus_color'
		interfaceTarget='true' swatch='this.nextSibling' value='<?php
		echo ($_POST['MasterColorPicker_Thesaurus_color']!="") ? $_POST['MasterColorPicker_Thesaurus_color'] : ""; ?>' /><span class='swatch'></span></label>
 <label>color-space:
	<select name='MasterColorPicker_Thesaurus_colorSpace'>
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



<div id='MasterColorPicker_mainPanel' class='pickerPanel expanding init'><!--  class “init” is removed after the color-tables are generated - they need to be shown while this process occurs  -->

<table class='picker palette' id='Spectral'><caption><h6>Spectral Progressive Color-Picker™</h6>click to choose<span id='SpectralIndicator'>&nbsp;<span id='SpectralSwatch'></span></span></caption>

<thead><tr><td colspan='100'><table>
<tr>
	<td colspan='6'><label>hue variety: <input type='range' name='hue_variety' value='<?php echo is_numeric($_POST['hue_variety']) ? $_POST['hue_variety'] : "30";?>' max='100' min='10' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' backtabToTarget='true' /></label>
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
	<td><label id="BeezEye_twist_value_transformer" data-fd-slider-rotate="330">Twist<input type='range'
		name='BeezEye_twist_value' value='50' min='0' max='100' backtabToTarget='true'
		data-fd-slider-transformer="BeezEye_twist_value_transformer" /></label></td>
	<td><fieldset><legend>color space</legend>
		<dl>
			<dt>CMYK</dt>
				<dd>Cyan, Magenta, Yellow, Black</dd>
			<dt>HSB / HSV</dt>
				<dd>Hue, Saturation, Brightness a.k.a Value</dd>
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
			backtabTo="document.getElementById('BeezEye_twist').checked ? undefined : MasterColorPicker.dataTarget" />CMYK</label>
		<label><input type='radio' name='BeezEye_model' value='hsb' />HSB / HSV</label>
		<label><input type='radio' name='BeezEye_model' value='hsl' checked='checked' />HSL</label>
		<label><input type='radio' name='BeezEye_model' value='hcg' />HCG</label>
		<label>¿<input type='checkbox' name='BeezEye_curve' value='curve' />curve?</label>
		<label>¿<input type='checkbox' name='BeezEye_twist' id='BeezEye_twist' value='twist' />twist?</label>
		</fieldset>
	</td>
</tr>
<tr>
	<td rowspan='2'><canvas width='360' height='360'></canvas></td>
	<td><label id="BeezEye_value_transformer" data-fd-slider-rotate="270">Brightness <span>Value</span><input type='range' name='BeezEye_value' value='50' min='0' max='100' data-fd-slider-transformer="BeezEye_value_transformer" /></label></td>
</tr>
<tr>
	<td valign='bottom'><fieldset>
		<label id="BeezEye_curve_value_transformer" data-fd-slider-rotate="315">Curve<input type='range' name='BeezEye_curve_value' value='50' min='1' max='100' data-fd-slider-transformer="BeezEye_curve_value_transformer" /></label>
		<label><input type='checkbox' name='BeezEye_curve_midring' value='midring' tabToTarget='true' /> Mid–Ring</label>
		</fieldset>
	</td>
</tr>
<tr>
	<td><label>Hue Variety<input type='range' name='BeezEye_variety' value='15' min='5' max='89' step='2' /></label></td>
	<td rowspan='2' id='BeezEye_swatch'></td>
</tr>
<!--  tr><td><label>Eye size<input type='range' name='BeezEye_size' value='360' min='160' max='720' step='12' /></label></td></tr  -->
<tr><td id='BeezEye_indicator'> </td></tr>
</tbody>
</table>



<table class='picker palette' id='RainbowMaestro'><caption><h6>RainbowMaestro Harmonic Color Picker™</h6>click to choose</caption>
<thead>
	<tr><td colspan='2'>
	<label><input type='checkbox' name='RainbowMaestro_websafe' value='true' checked='checked' backtabTotarget='true' />websafe</label>
	<label><input type='checkbox' name='RainbowMaestro_splitComplement' value='true' />split-compliments</label>
	<label><input type='checkbox' name='RainbowMaestro_lock' value='true' />lock focal hue</label>
	<label><input type='checkbox' name='RainbowMaestro_colorblind' value='true' checked='checked' />colorblind assist<mark class='footmark'>‡</mark></label>
	</td></tr>
	<tr><td colspan='2'>
	<label>variety<input type='range' name='RainbowMaestro_variety' value='6' min='6' max='32' /></label>
	<label>¿focals only<input type='checkbox' name='RainbowMaestro_focalsOnly' value='true' />?</label>
	 <input type='hidden' name='RainbowMaestro_focalHue' value='<?php echo ($_POST['RainbowMaestro_focalHue']) ? $_POST['RainbowMaestro_focalHue'] : '0'; /*radians*/ ?>' />
	<label id='RainbowMaestro_hueIndicator'>focal hue:<input type='number' name='RainbowMaestro_focalHue_degrees' value='<?php echo ($_POST['RainbowMaestro_focalHue_degrees']) ? $_POST['RainbowMaestro_focalHue_degrees'] : '0';
	 ?>' min='0' max='360' step='any' size='13' maxlength='9' title='Hue given in degrees (0.0°–360.0°).' tabToTarget='true' /><span>&nbsp;</span></label>
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
	<tr class='colorblind'><td colspan='2'><mark class='footmark'>‡</mark>special thanks to: &nbsp;
		http://safecolours.rigdenage.com/colours2.html</td></tr>
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
<td id="Simple²interface"><label id='Simple²_variety_transformer' data-fd-slider-rotate="90">variety<input
	type='range' name='Simple²_variety' value='12' min='12' max='360' step='2' backtabToTarget='true'
	data-fd-slider-transformer="Simple²_variety_transformer" /></label></td>
</tr>
<tr>
<td rowspan='5'  style='border-bottom: 1px solid' valign='bottom'
		><label for='Simple²_lock'>← lock ↑</label><input type='checkbox' name='Simple²_lock' value='locked' tabToTarget='true' /></td>
<td   style='border-left: 1px solid'><div>HSL</div></td>
<td   style='border-left: 1px solid'><div>HSB</div></td>
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
<td><label><input type='radio' name='YinYang NíHóng' value='HSB' backtabToTarget='true' />HSB / HSV<dfn>Hue, Saturation, Brightness/Value</dfn></label></td>
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


<div id='paletteLoadingAlert'>
 <h3>Loading Palettes:</h3>
 <div>Please Wait
<!--[if lt IE 10]>
	<br />Microsoft’s Internet Exploder takes quite a bit longer… … …
	<span>(and please be patient when changing color-picker settings)</span>
	<span>(or just use a <strong>real</strong> modern browser: Firefox, Chrome, Safari)</span>
<![endif]-->
 </div>
<pre></pre></div><!--  do not separate or modify this line  -->


</section><!--  close  MasterColorPicker  HTML  -->


<script type="text/javascript" src="color-pickers/SoftMoon-WebWare/MasterColorPicker2.js" defer='true'></script>
<script type="text/javascript" src="color-pickers/SoftMoon-WebWare/color-space_autoReformatter.js" defer='true'></script>
<script type="text/javascript">
window.addEventListener('load', function()  {
	SoftMoon.WebWare.initPaletteTables(/* path, whenLoaded, whenDone */);  //see files:  MasterColorPicker2.js → rgb.js
	SoftMoon.WebWare.activateColorSpaceFormatConverters(function() {return MasterColorPicker.registeredTargets});  //see file: color-space_autoReformatter.js
/*@cc_on
	@if (@_jscript)
		if (parseInt(navigator.userAgent.match( /MSIE ([0-9]+)[^0-9]/ )[1]) < 10)
			for (var i=0, inps=document.getElementById('MasterColorPicker').getElementsByTagName('input');  i<inps.length;  i++)  {
				if (inps[i].getAttribute('type').toLowerCase()==='range')  inps[i].setAttribute('tabIndex', '-1');  }
	@end
@*/
	} );
</script>

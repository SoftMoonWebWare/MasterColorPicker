<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name='author' content='Joe Golembieski, SoftMoon-WebWare'>
<meta name='copyright' content='Copyright © 2013,2014,2015,2019,2020,2022,2023,2024,2026 Joe Golembieski, SoftMoon-WebWare'>
<title>MasterColorPicker desktop from SoftMoon WebWare</title>
<link rel="icon" type="image/x-icon" href="images/SoftMoonWebWare.gif">
<link rel='stylesheet' id='MasterColorPicker_stylesheet' type='text/css' media="screen, projection"
			href='color-pickers/SoftMoon-WebWare/MasterColorPicker2.css'>
<style type='text/css'>
body, section, div {
	margin: 0;
	padding: 0; }
body {
	color: white;
	background: #808080;
  position: absolute; /* This keeps the very small body sized to the full window.  We need this for the panel-drag 'mouseover' which is on the body.  */
	width: 100%;
	height: 100%;  }

/* this overrides the default action of popping up and down as the input gains/looses focus */
#MasterColorPicker .pickerPanel,
#MasterColorPicker .selectedPicker {
	display: block; }

body > input {
	display: block;
	width: 24em;
	font-size: 1.618em;
	color: black;
	background-color: white; }

p img {
	display: block; }
</style>
<!--  for MasterColorPicker 2  Copyright © 2012, 2013, 2018, 2019, 2020, 2022, 2023, 2024, 2026 Joe Golembieski, SoftMoon-WebWare
      release 2.6.11  Jan 22, 2026   -->

<script>
const SoftMoon=Object.defineProperties({}, {
	WebWare: {value: {}, enumerable: true},
	uploaded_palettes: {value: [], enumeralble: true}});
</script>
<script type='text/javascript' src='JS_toolbucket/+++JS/+++.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/+++JS/+++Math.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/+++input_type.js' defer></script><!--  supports RainbowMaestro & ColorSpaceLab  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/UniDOM-2022.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/HTTP.js' defer></script><!--  ESSENTIAL for server version to auto-load/save palette files; NOT for  file://  use  -->
<script type='text/javascript' src='JS_toolbucket/Björn_Ottosson.OK_color_space_models.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/Alexei_Boronine.HSLᵤᵥ_color_space_model.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/RGB_Calc.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type="text/javascript" src="JS_toolbucket/SoftMoon-WebWare/Rigden-colorblind_websafe-table_interpolator.js" defer></script><!--  supports RainbowMaestro & MyPalette & Color-Space Lab  -->
<script type="text/javascript" src="JS_toolbucket/skratchdot.Wickline-colorblind_converter.js" defer></script><!--  supports RainbowMaestro & MyPalette & Color-Space Lab  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/Picker.js' defer></script><!--  !! ESSENTIAL !!  -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/FormFieldGenie.js' defer></script><!--  supports MyPalette & ColorFilter  -->
<script type="text/javascript" src="color-pickers/SoftMoon-WebWare/MasterColorPicker2.js" defer></script>

<script type="text/javascript">
window.addEventListener('mastercolorpicker_ready', function()  {
	//options below may be changed to your preference
	MasterColorPicker.showColorAs='background';
	MasterColorPicker.enablePanelDrag=true;
	MasterColorPicker.enableStickyPanels=false;
	MasterColorPicker.masterTarget=MasterColorPicker.registeredTargets[0];
	MasterColorPicker.registeredTargets[0].focus();  }  );
</script>

</head>


<body>

<input type='MasterColorPicker' id='color-picker_input'>
<p>created by:
<img src='images/SoftMoonWebWare.gif' alt='SoftMoon WebWare'>
</p>

<?php include "color-pickers/SoftMoon-WebWare/MasterColorPicker2.htm"; ?>

</body>
</html>

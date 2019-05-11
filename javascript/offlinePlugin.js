//=====CORE MECHANICS=====
$(document).ready(function(){
	allGroupZones.forEach(function(e)
	{
		e.SetupDisplay();
	});

    $('select').selectpicker();
});
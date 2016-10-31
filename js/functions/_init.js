jQuery(document).ready(function($) {

	//global vars
	var ctx = $('#generatedChart');
	var chartCount = 0;
	var vars = {};
	var rgba_colors = [];
	var rgba_borders = [];
	var chart_opacity = $('#chart-opacity').val();

	//default values
	var chart_data = [25, 25, 50];
	var chart_data_count = chart_data.length;
	var chart_labels = ['Red', 'Blue', 'Yellow'];

	//adjusts chart type on select change
	$('#chart-type').on('change', function() {
		createChart();
	});

	//adjusts chart data on input change
	$('#chart-data').on('change', function() {
		chart_data = $('#chart-data').val();
		if(chart_data.length) {
			//create array
			chart_data = chart_data.split(',');
		} else {
			//set default
			chart_data = [25, 25, 50];
		}

		chart_data_count = chart_data.length;

		updateColorFields();
		updateBorderFields();
		//createChart();

		vars['myChart_' + chartCount].data.datasets[0].data = chart_data;
		vars['myChart_' + chartCount].update();
	});

	//adjusts chart labels on input change
	$('#chart-labels').on('change', function() {
		chart_labels = $('#chart-labels').val();
		if(chart_labels.length) {
			//create array
			chart_labels = chart_labels.split(',');
		} else {
			//set default
			chart_labels = ['Red', 'Blue', 'Yellow'];
		}

		vars['myChart_' + chartCount].data.labels = chart_labels;
		vars['myChart_' + chartCount].update();
	});

	//updates opacity for each rgba color
	$('#chart-opacity').on('change', function() {
		chart_opacity = $('#chart-opacity').val() / 100;
		var color_count = $('.colors-wrap').children().length;
		
		//for each item in the array, replace the opacity with the new values
		for(i = 0; i < color_count; i++) {
			rgba_colors[i] = rgba_colors[i].replace(/[^,]+(?=\))/, chart_opacity);
			rgba_borders[i] = rgba_borders[i].replace(/[^,]+(?=\))/, chart_opacity);
		}

		//update chart colors with new rgba values
		vars['myChart_' + chartCount].data.datasets[0].backgroundColor = rgba_colors;
		vars['myChart_' + chartCount].data.datasets[0].borderColor = rgba_borders;
		vars['myChart_' + chartCount].update();
	});

	//function to convert HEX colors to RGBA
	function hexConversion(hex, opacity) {
		hex = hex.replace('#', '');
		r = parseInt(hex.substring(0,2), 16);
	    g = parseInt(hex.substring(2,4), 16);
	    b = parseInt(hex.substring(4,6), 16);
	    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
	    return result;
	}

	//function to shade color by percentage
	function shadeColor(color, percent) {   
		var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
		return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
	}

	//updates color fields depending on amount of data (number of color fields should equal amount of data inputed)s
	function updateColorFields() {
		var color_wrap = $('.colors-wrap');
		var color_count = color_wrap.children().length;
		var input_class = 'chart-color';

		//if we are decreasing the amount of data, let's just remove the input fields
		if(color_count > chart_data_count) {
			var subtract = -Math.abs(color_count - chart_data_count);
			color_wrap.children().slice(subtract).remove();
		}
		//if we are increasing the amount of data, let's add fields at the appropriate starting place
		else if(color_count < chart_data_count) {
			var i;
			//if there aren't colors yet, let's start at 1
			if(color_count == 0) { i = 1; }
			//if there are already colors, let's start after those existing colors
			if(color_count > 0) { i = color_count + 1; }
			for (i; i <= chart_data_count; i++) {
				//set default colors
				if(i == 1) {
					color = '#FF6384';
				} else if(i == 2) {
					color = '#36A2EB';
				} else if(i == 3) {
					color = '#FFCE56';
				} else if(i == 4) {
					color = '#A27EFF';
				} else if(i == 5) {
					color = '#92EB61';
				} else if(i == 6) {
					color = '#FFAF68';
				} else if(i == 7) {
					color = '#FF5C58';
				} else if(i == 8) {
					color = '#85DBFF';
				} else {
					//set a random color if the count gets high (unlikely)
					color = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
				}

				//creates input fields
				color_wrap.append('<input type="color" class="'+input_class+'" value="'+color+'"/>');

				//convert to rgba to comply with chart.js
				var rgba_color = hexConversion(color, chart_opacity);
				//creates object for rgba colors
				rgba_colors.push(rgba_color);
			}
		}
	} updateColorFields();

	function updateBorderFields() {
		var color_wrap = $('.border-colors-wrap');
		var color_count = color_wrap.children().length;
		var input_class = 'chart-color border-color';

		//if we are decreasing the amount of data, let's just remove the input fields
		if(color_count > chart_data_count) {
			var subtract = -Math.abs(color_count - chart_data_count);
			color_wrap.children().slice(subtract).remove();
		}
		//if we are increasing the amount of data, let's add fields at the appropriate starting place
		else if(color_count < chart_data_count) {
			var i;
			//if there aren't colors yet, let's start at 1
			if(color_count == 0) { i = 1; }
			//if there are already colors, let's start after those existing colors
			if(color_count > 0) { i = color_count + 1; }
			for (i; i <= chart_data_count; i++) {
				//set default colors
				if(i == 1) {
					color = shadeColor('#FF6384', -0.2);
				} else if(i == 2) {
					color = shadeColor('#36A2EB', -0.2);
				} else if(i == 3) {
					color = shadeColor('#FFCE56', -0.2);
				} else if(i == 4) {
					color = shadeColor('#A27EFF', -0.2);
				} else if(i == 5) {
					color = shadeColor('#92EB61', -0.2);
				} else if(i == 6) {
					color = shadeColor('#FFAF68', -0.2);
				} else if(i == 7) {
					color = shadeColor('#FF5C58', -0.2);
				} else if(i == 8) {
					color = shadeColor('#85DBFF', -0.2);
				} else {
					//set a random color if the count gets high (unlikely)
					color = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
					color = shadeColor(color, -0.2);
				}

				//creates input fields
				color_wrap.append('<input type="color" class="'+input_class+'" value="'+color+'"/>');

				//convert to rgba to comply with chart.js
				var rgba_color = hexConversion(color, chart_opacity);
				//creates object for rgba colors
				rgba_borders.push(rgba_color);
			}
		}
	} updateBorderFields();

	//update chart colors for fill & border on user change
	function updateColors() {
		$(document).on('change', '.chart-color', function() {
			//grab index of color being changed
			var index_num = $(this).index();
			//grab the new color value inputed by the user
			var new_color = $(this).val();
			//convert this value to rgba
			var new_rgba_color = hexConversion(new_color, chart_opacity);

			//border updates
			if($(this).hasClass('border-color')) {
				//set the new color in the array
				rgba_borders[index_num] = new_rgba_color;
				//update the chart
				vars['myChart_' + chartCount].data.datasets[0].borderColor[index_num] = new_rgba_color;
			}
			//fill updates
			else {
				//set the new color in the array
				rgba_colors[index_num] = new_rgba_color;
				//update the chart
				vars['myChart_' + chartCount].data.datasets[0].backgroundColor[index_num] = new_rgba_color;
			}
			vars['myChart_' + chartCount].update();
		});
	} updateColors();


	//let's create a chart
	function createChart() {
		var chart_type = $('#chart-type').val();
		if(chartCount > 0) {
			//if another chart was already created, destroy that one before we create a new one
			var old_chart = vars['myChart_' + chartCount];
			old_chart.destroy();
		}
		//move counter forward to create new chart
		chartCount++;
		//create the chart, using a dynamic name to keep chart instances separate & prevent "glitches"
		vars['myChart_' + chartCount] = new Chart(ctx, {
		    type: chart_type,
		    data: {
		        labels: chart_labels,
		        datasets: [{
		            label: '# of Votes',
		            data: chart_data,
		            backgroundColor: rgba_colors,
		            borderColor: rgba_borders,
		            borderWidth: 1
		        }]
		    },
		    options: {
		    	responsive: true
		    }
		});
	} createChart(); 
});
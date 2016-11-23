jQuery(document).ready(function($) {

	//adjust page-wrap padding on sidebar resize
	var side_width = $('.side').width();

	function adjustPageWrap() {
		var new_side_width = $('.side').width();
		if(side_width != new_side_width && $(window).width() > 800) {
			$('.page-wrap').css('padding-left', new_side_width + 'px');
			side_width = new_side_width;
		}
		if($(window).width() <= 800) {
			$('.page-wrap').css('padding-left', '0');
		}
	}

	jQuery(window).resize(adjustPageWrap);
	var timer = setInterval(adjustPageWrap, 100);

	//add active class to label when checkbox is checked
	$('input[type=checkbox]').on('change', function() {
		if($(this).is(':checked')) {
			$(this).parent('label').addClass('active');
		} else {
			$(this).parent('label').removeClass('active');
		}
	});

	// GLOBAL/INITIAL VARIABLES
	
	var ctx = $('#generatedChart'),
		chartCount = 0,
		vars = {},
		rgba_colors = [],
		rgba_borders = [];

	// SET INITIAL INPUT VALUES

	var chart_type = $('#chart-type').val(),
		bar_type = $('#bar-type').val(),
		chart_width = $('#chart-width').val(),
		chart_responsive = $('#chart-responsive').val(),
		chart_ds_label = $('#chart-dataset-name').val(),
		chart_data = $('#chart-data').val().split(','),
		chart_data_count = chart_data.length,
		chart_labels = $('#chart-labels').val().split(','),
		chart_opacity = $('#chart-opacity').val(),
		border_width = $('#border-width').val(),
		chart_rotation = -0.5 * Math.PI,
		cutout_changed = false,
		chart_x_min = Math.abs($('#xaxes-min').val()),
		chart_x_max = Math.abs($('#xaxes-max').val()),
		chart_y_min = Math.abs($('#yaxes-min').val()),
		chart_y_max = Math.abs($('#yaxes-max').val()),
		chart_x_step = Math.abs($('#xaxes-step').val()),
		chart_y_step = Math.abs($('#yaxes-step').val()),
		point_radius = Math.abs($('#point-radius').val()),
		point_radius_h = Math.abs($('#point-radius-h').val()),
		point_border_width = Math.abs($('#point-border-width').val()),
		point_border_width_h = Math.abs($('#point-border-width-h').val()),
		no_bg = false,
		data_count = 1;

	// CHART TYPE

	$('#chart-type').on('change', function() {
		//set chart type as this value
		chart_type = $(this).val();
		
		//unless it's a bar chart, then determine which type of bar chart it is
		if(chart_type == 'bar') {
			chart_type = bar_type;
		}

		//if the bg was removed on a line chart, fill the bg again on other chart types
		if(chart_type !== 'line' && no_bg == true) {
			no_bg = false;
		}

		setCutout();
		updateColorFields();
		createChart();
		toggleFields();
	});

	// BAR CHART TYPE

	$('#bar-type').on('change', function() {
		var bar_type = $(this).val();
		chart_type = bar_type;
		createChart();
		toggleFields();
	});

	// CHART WIDTH

	function setChartWidth() {
		$('#generatedChart-wrap').css('max-width', chart_width);
	} setChartWidth();

	$('#chart-width').on('change', function() {
		chart_width = $(this).val();
		setChartWidth();
		createChart();
	});

	// RESPONSIVE BOOLEAN

	$('#chart-responsive').on('change', function() {
		chart_responsive = $(this).val();
		createChart();
	});

	// DATASET LABEL

	$('#chart-dataset-name').on('change', function() {
		chart_ds_label = $(this).val();
		createChart();
	});

	// CHART DATA

	$('#chart-data').on('change', function() {
		chart_data = $(this).val().split(',');
		chart_data_count = chart_data.length;

		updateColorFields();
		updateBorderFields();
		adjustLabels();
		setMaxValues();

		vars['myChart_' + chartCount].data.datasets[0].data = chart_data;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	$('#add-data').on('click', function(e) {
		e.preventDefault();
		data_count++;
		var parent = $(this).parent('label');
		$('<input type="text" id="chart-data-'+data_count+'"/>').insertBefore(parent);
		countInputs();
	});

	$('#remove-data').on('click', function(e) {
		e.preventDefault();
		var parent = $(this).parent('label');
		parent.prev('input').remove();
		data_count--;
		countInputs();
	});

	function countInputs() {
		var num_inputs = $('#data-toggle').find('input').length;
		if(num_inputs == 0) {
			$('#remove-data').hide();
		} else {
			$('#remove-data').show();
		}
	} countInputs();

	// CHART LABELS

	function adjustLabels() {
		chart_labels = $('#chart-labels').val();
		chart_labels = chart_labels.split(',');
		var i = chart_labels.length;
		//remove labels if there is less data
		if(chart_labels.length > chart_data_count) {
			var subtract = -Math.abs(chart_labels.length - chart_data_count);
			chart_labels = chart_labels.slice(0, subtract);
		}
		//add generic labels if there is more data
		else if(chart_labels.length < chart_data_count) {
			var i = chart_labels.length + 1;
			for(i; i <= chart_data_count; i++) {
				chart_labels.push('Label ' + i);
			}
		}

		//update input value
		$('#chart-labels').val(chart_labels.toString());

		//update chart
		vars['myChart_' + chartCount].data.labels = chart_labels;
		vars['myChart_' + chartCount].update();
		createCode();
	}

	$('#chart-labels').on('change', function() {
		chart_labels = $(this).val();
		chart_labels = chart_labels.split(',');
		vars['myChart_' + chartCount].data.labels = chart_labels;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	// FILL & BORDER OPACITY

	$('#chart-opacity').on('change', function() {
		chart_opacity = $(this).val() / 100;
		var color_count = $('.colors-wrap').children().length;
		
		//for each item in the array, replace the opacity with the new values
		for(i = 0; i < color_count; i++) {
			rgba_colors[i] = rgba_colors[i].replace(/[^,]+(?=\))/, chart_opacity);
			rgba_borders[i] = rgba_borders[i].replace(/[^,]+(?=\))/, chart_opacity);
		}

		//update chart fill colors & border colors with new rgba values
		vars['myChart_' + chartCount].data.datasets[0].backgroundColor = rgba_colors;
		vars['myChart_' + chartCount].data.datasets[0].borderColor = rgba_borders;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	// CONVERT HEX CODE TO RGBA
	
	function hexConversion(hex, opacity) {
		hex = hex.replace('#', '');
		r = parseInt(hex.substring(0,2), 16);
	    g = parseInt(hex.substring(2,4), 16);
	    b = parseInt(hex.substring(4,6), 16);
	    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
	    return result;
	}

	// SHADE COLOR BY PERCENTAGE
	
	function shadeColor(color, percent) {   
		var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
		return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1).toUpperCase();
	}

	// FILL COLORS (SET DEFAULTS)
	
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

		if(chart_type == 'line') {
			$('.chart-color').hide();
			$('.chart-color:first-child').show();
		} else {
			$('.chart-color').show();
		}
	} updateColorFields();

	// BORDER COLORS (SET DEFAULTS)

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
					color = shadeColor('#FF6384', -0.075);
				} else if(i == 2) {
					color = shadeColor('#36A2EB', -0.075);
				} else if(i == 3) {
					color = shadeColor('#FFCE56', -0.075);
				} else if(i == 4) {
					color = shadeColor('#A27EFF', -0.075);
				} else if(i == 5) {
					color = shadeColor('#92EB61', -0.075);
				} else if(i == 6) {
					color = shadeColor('#FFAF68', -0.075);
				} else if(i == 7) {
					color = shadeColor('#FF5C58', -0.075);
				} else if(i == 8) {
					color = shadeColor('#85DBFF', -0.075);
				} else {
					//set a random color if the count gets high (unlikely)
					color = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
					color = shadeColor(color, -0.075);
				}

				//creates input fields
				color_wrap.append('<input type="color" class="'+input_class+'" value="'+color+'"/>');

				//convert to rgba to comply with chart.js
				var rgba_color = hexConversion(color, chart_opacity);
				//creates object for rgba colors
				rgba_borders.push(rgba_color);
			}
		}

		if(chart_type == 'line') {
			$('.border-color,label[for=chart-color] span,label[for=border-color] span').hide();
			$('label[for=chart-color]')
			$('.border-color:first-child').show();
		} else {
			$('.border-color,label[for=chart-color],label[for=border-color]').show();
		}
	} updateBorderFields();

	// FILL & BORDER USER COLOR CHANGES

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
			createCode();
		});
	} updateColors();

	var point_bg = $('#point-bg').val();
	point_bg = hexConversion(point_bg, chart_opacity);
	var point_bg_h = $('#point-bg-h').val();
	point_bg_h = hexConversion(point_bg_h, chart_opacity);
	var point_border = $('#point-border').val();
	point_border = hexConversion(point_border, chart_opacity);
	var point_border_h = $('#point-border-h').val();
	point_border_h = hexConversion(point_border_h, chart_opacity);

	$('#point-bg, #point-bg-h, #point-border, #point-border-h').on('change', function() {
		var new_value = $(this).val();

		if($(this).attr('id') == 'point-bg') {
			point_bg = new_value;
			vars['myChart_' + chartCount].data.datasets[0].pointBackgroundColor = point_bg;
		} else if($(this).attr('id') == 'point-bg-h') {
			point_bg_h = new_value;
			vars['myChart_' + chartCount].data.datasets[0].pointHoverBackgroundColor = point_bg_h;
		} else if($(this).attr('id') == 'point-border') {
			point_border = new_value;
			vars['myChart_' + chartCount].data.datasets[0].pointBorderColor = point_border;
		} else if($(this).attr('id') == 'point-border-h') {
			point_border_h = new_value;
			vars['myChart_' + chartCount].data.datasets[0].pointHoverBorderColor = point_border_h ;
		}
		
		vars['myChart_' + chartCount].update();
		createCode();
	});

	// BORDER WIDTH
	
	$('#border-width').on('change', function() {
		border_width = $(this).val();
		vars['myChart_' + chartCount].data.datasets[0].borderWidth = border_width;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	// DEGREES TO RADIANS CONVERSION

	function degreesConversion(degrees) {
		degrees = ((chart_rotation - 90)/180) * Math.PI;
		return degrees;
	}

	// ROTATION (ONLY PIE, DOUGHNUT, & POLAR AREA - called "startAngle" for polar area)
	
	$('#chart-rotation').on('change', function () {
		chart_rotation = $(this).val();
		chart_rotation = degreesConversion(chart_rotation);
		vars['myChart_' + chartCount].options.rotation = chart_rotation;
		vars['myChart_' + chartCount].options.startAngle = chart_rotation;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	// CUTOUT % (PIE & DOUGHNUT - the hole in the middle of the circle)
	
	$('#chart-cutout').on('change', function () {
		chart_cutout = $(this).val();
		cutout_changed = true; //cache this so we know not to override the value in the createChart() function with defaults
		vars['myChart_' + chartCount].options.cutoutPercentage = chart_cutout;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	// X & Y AXES MIN/MAX VALUES
	
	$('#xaxes-min, #yaxes-min, #xaxes-max, #yaxes-max').on('change', function() {
		var new_value = Math.abs($(this).val());

		if($(this).attr('id') == 'xaxes-min' || $(this).attr('id') == 'yaxes-min') {
			chart_x_min = new_value;
			chart_y_min = new_value;
			vars['myChart_' + chartCount].options.scales.xAxes[0].ticks.min = chart_x_min;
			vars['myChart_' + chartCount].options.scales.yAxes[0].ticks.min = chart_y_min;
		} else if($(this).attr('id') == 'xaxes-max' || $(this).attr('id') == 'yaxes-max') {
			chart_x_max = new_value;
			chart_y_max = new_value;
			vars['myChart_' + chartCount].options.scales.xAxes[0].ticks.max = chart_x_max;
			vars['myChart_' + chartCount].options.scales.yAxes[0].ticks.max = chart_y_max;
		}

		vars['myChart_' + chartCount].update();
		createCode();
	});

	// SET MAX VALUE OF AXES DEPENDING ON DATA

	function setMaxValues() {
		largest_data_item = Math.max.apply(null, chart_data);

		if(largest_data_item > chart_x_max || largest_data_item > chart_y_max) {
			$('#xaxes-max').val(largest_data_item);
			$('#xaxes-max').attr('min', largest_data_item);
			chart_x_max = largest_data_item;
			$('#yaxes-max').val(largest_data_item);
			$('#yaxes-max').attr('min', largest_data_item);
			chart_y_max = largest_data_item;
			vars['myChart_' + chartCount].options.scales.xAxes[0].ticks.max = chart_x_max;
			vars['myChart_' + chartCount].options.scales.yAxes[0].ticks.max = chart_y_max;
			vars['myChart_' + chartCount].update();
			createCode();
		}
	} setMaxValues();

	// CUTOUT VALUES

	function setCutout() {
		if(cutout_changed != true && chart_type == 'doughnut') {
			chart_cutout = 50;
			$('#chart-cutout').val(50);
		} else if(cutout_changed != true && chart_type == 'pie') {
			chart_cutout = 0;
			$('#chart-cutout').val(0);
		} else {
			chart_cutout = $('#chart-cutout').val();
		}
	} setCutout();

	// STEP SIZES

	$('#xaxes-step').on('change', function() {
		chart_x_step = Math.abs($(this).val());
		vars['myChart_' + chartCount].options.scales.xAxes[0].ticks.stepSize = chart_x_step;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	$('#yaxes-step').on('change', function() {
		chart_y_step = Math.abs($(this).val());
		vars['myChart_' + chartCount].options.scales.yAxes[0].ticks.stepSize = chart_y_step;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	// REMOVE FILL FOR LINE CHARTS (NOT TIED TO OPACITY)

	$('#remove-fill').on('change', function() {
		if($('#remove-fill').is(':checked') && chart_type) {
			$('#fill-colors').hide();
			vars['myChart_' + chartCount].data.datasets[0].backgroundColor = 'rgba(255, 255, 255, 0)';
			no_bg = true;
		} else {
			$('#fill-colors').show();
			vars['myChart_' + chartCount].data.datasets[0].backgroundColor = rgba_colors;
			no_bg = false;
		}

		vars['myChart_' + chartCount].update();
		createCode();
	});

	// POINT SETTINGS FOR LINE CHARTS

	$('#point-radius').on('change', function() {
		point_radius = Math.abs($(this).val());
		vars['myChart_' + chartCount].data.datasets[0].pointRadius = point_radius;
		vars['myChart_' + chartCount].update();
		checkPointRadius();
		createCode();
	});

	$('#point-radius-h').on('change', function() {
		point_radius_h = Math.abs($(this).val());
		vars['myChart_' + chartCount].data.datasets[0].pointHoverRadius = point_radius_h;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	$('#point-border-width').on('change', function() {
		point_border_width = Math.abs($(this).val());
		vars['myChart_' + chartCount].data.datasets[0].pointBorderWidth = point_border_width;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	$('#point-border-width-h').on('change', function() {
		point_border_width_h = Math.abs($(this).val());
		vars['myChart_' + chartCount].data.datasets[0].pointHoverBorderWidth = point_border_width_h;
		vars['myChart_' + chartCount].update();
		createCode();
	});

	// HIDE OTHER POINT OPTIONS IF POINT RADIUS = 0

	function checkPointRadius() {
		if(point_radius == 0) {
			$('.point-radius').hide();
		} else {
			$('.point-radius').show();
		}
	} checkPointRadius();

	// TOGGLE FIELDS DEPENDING ON CHART TYPE
	
	function toggleFields() {
		$('.pie, .doughnut, .polararea, .bar, .horizontalBar, .line, .radar, .bubble').hide();
		$('.' + chart_type).show();
	} toggleFields();

	// CREATE A CHART

	function createChart() {
		//set up axes for bar charts
		if(chart_type == 'bar' || chart_type == 'horizontalBar') {
			var xaxes_settings =
				[{
					ticks: {
						min: chart_x_min,
	                	max: chart_x_max,
	                	stepSize: chart_x_step
	                }
				}];
			var yaxes_settings =
				[{
	                ticks: {
	                	min: chart_y_min,
	                	max: chart_y_max,
	                	stepSize: chart_y_step
	                }
	            }];
		} else {
			var xaxes_settings = '';
			var yaxes_settings = '';
		}

		//if another chart was already created, destroy that one before we create a new one
		if(chartCount > 0) {
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
		            label: chart_ds_label,
		            data: chart_data,
		            backgroundColor: rgba_colors,
		            borderColor: rgba_borders,
		            borderWidth: border_width,
		            pointBackgroundColor: point_bg,
		            pointHoverBackgroundColor: point_bg_h,
		            pointBorderColor: point_border,
		            pointHoverBorderColor: point_border_h,
		            pointBorderWidth: point_border_width,
		            pointHoverBorderWidth: point_border_width_h,
		            pointRadius: point_radius,
		            pointHoverRadius: point_radius_h
		        }]
		    },
		    options: {
		    	responsive: chart_responsive,
	    		cutoutPercentage: chart_cutout,
	    		rotation: chart_rotation,
	    		startAngle: chart_rotation,
	    		scales: {
	    			xAxes: xaxes_settings,
		            yAxes: yaxes_settings
		        }
		    }
		}); createCode();
	} createChart();

	function createCode() {
		var code_text = '';
		
		code_text += '<div id="generatedChart-wrap" style="width:' + chart_width + '">';
		code_text += '<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.2/moment.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.3.0/Chart.min.js"></script>';
		code_text += '<canvas id="generatedChart" width="600" height="600"></canvas></div>';
		code_text += '<script type="text/javascript">';
		code_text += 'var ctx = document.getElementById("generatedChart");';
		code_text += 'var yourGeneratedChart = new Chart(ctx, {';
		code_text += "type: '" + chart_type + "',",
		code_text += 'data: {';
		code_text += "labels: ['" + chart_labels.join("','") + "'],";
		code_text += 'datasets: [{';
		code_text += "label: '" + chart_ds_label + "',";
		code_text += 'data: [' + chart_data + '],';
		if(no_bg == false) {
			code_text += "backgroundColor: ['" + rgba_colors.join("','") + "'],";
		}
		code_text += "borderColor: ['" + rgba_borders.join("','") + "'],";
		code_text += 'borderWidth: ' + border_width + ',';
		if(chart_type == 'line') {
			code_text += 'pointBackgroundColor: \'' + point_bg + '\',';
			code_text += 'pointHoverBackgroundColor: \'' + point_bg_h + '\',';
			code_text += 'pointBorderColor: \'' + point_border + '\',';
			code_text += 'pointHoverBorderColor: \'' + point_border_h + '\','; 
			code_text += 'pointBorderWidth: 1,pointHoverBorderWidth: 2,';
			code_text += 'pointRadius: ' + point_radius + ',';
			code_text += 'pointHoverRadius: '+ point_radius_h + ',';
		}
		code_text += '}]'
		code_text += '},';
		code_text += 'options: {';
		code_text += 'responsive: ' + chart_responsive + ',';
		if(chart_type == 'pie' || chart_type == 'doughnut') {
			code_text += 'cutoutPercentage: ' + chart_cutout + ',';
		}
		if(chart_type == 'pie' || chart_type == 'doughnut') {
			code_text += 'rotation: ' + chart_rotation + ',';
		}
		if(chart_type == 'polarArea') {
			code_text += 'startAngle: ' + chart_rotation + ',';
		}
		if(chart_type == 'bar' || chart_type == 'horizontalBar' || chart_type == 'line') {
			code_text += 'scales: {xAxes: xaxes_settings,yAxes: yaxes_settings}';
		}
		code_text += '}';
		code_text += '});';
		code_text += '</script>';
		$('#embed-code textarea').text(code_text);
	} createCode();

});
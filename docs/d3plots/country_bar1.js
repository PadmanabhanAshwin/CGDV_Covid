// #########################################################################################################
// : ################################ MR: Change Animation settings ########################################

var country_color = {"Bangladesh": "#BF71BF", "Brazil": "#5E66D5", "Egypt": "#C1834F", "India": "#5EC5F0", "Indonesia": "#F89756", "Pakistan": "#69C95F", "Sri Lanka": "#F0CB4A"}
//var stroke_color = {"Bangladesh": "#BF71BF", "Brazil": "#5E66D5", "Egypt": "#C1834F", "India": "#5EC5F0", "Indonesia": "#F89756", "Pakistan": "#69C95F", "Sri Lanka": "#F0CB4A"}
var stroke_color = {"Bangladesh": "#622a62", "Brazil": "#002776", "Egypt": "#624B1C", "India": "#4363D8", "Indonesia": "#C05912", "Pakistan": "#228B22", "Sri Lanka": "#C88C00"}

var line_color = {"Bangladesh": "#622a62", "Brazil": "#002776", "Egypt": "#624B1C", "India": "#4363D8", "Indonesia": "#C05912", "Pakistan": "#228B22", "Sri Lanka": "#C88C00"}
var delay = 5

// #########################################################################################################
// ##################################### Figure size setting: ##############################################
var margin1 = {top: 35, right: 60, bottom: 80, left: 60},
    width1 = 440 - margin1.left - margin1.right,
    height1 = 250 - margin1.top - margin1.bottom;

var svg1 = d3.select("#s1half1").append("svg")
	.attr("width", width1 + margin1.left + margin1.right)
  .attr("height", height1 + margin1.top + margin1.bottom)
	.append("g")
  .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

// ##################################### General Tooltip setting: ####################################################################
//var tooltip = d3.select("body").append("div")
//	.attr("class", "tooltip")
//	.style("opacity", 0)

var timeformatter = d3.time.format("%B %d")

// ##################### MR: TO CHANGE TOOLIP STYLE CHANGE add HTML in return below:  #################################################
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<span class=\"d3-tool-heading\">"+ timeformatter(d.date) + "</span><br> <p1 style='color:grey'> New case count:</p1> <span style='color:darkblue'>" + d.new_case + "</span> <br>  <p1 style='color:grey'> Cummlative case count:</p1> <span style='color:darkblue'>" + d.total_case + "</span>" ;
  })


// ##################################### Data async call: ####################################################################
d3.csv("https://raw.githubusercontent.com/PadmanabhanAshwin/CGDV_Covid/master/visualizations/covid_case_death_counts.csv", function(d){
	// Creating an accesor function with relevent data type rtype.
	var dateparse = d3.time.format("%m/%d/%y").parse

	return {
		country: d["COUNTRY_SHORT_NAME"],
		total_case: +d["PEOPLE_POSITIVE_CASES_COUNT"],
		new_death : +d["PEOPLE_DEATH_NEW_COUNT"],
		new_case : +d["PEOPLE_POSITIVE_NEW_CASES_COUNT"],
		total_death : +d["PEOPLE_DEATH_COUNT"],
		date: dateparse(d["REPORT_DATE"])
		};
}, function(error, rawdata){
	// ##################### PLOTTING THE BAR CHART ############################################################

	// counting starts from zero: That is 00 is Jan. 02 is March.
	var cutoffdate = new Date(2020, 02, 01)
	// whatever needs to be plotted.
	var metric_select = "new_case"

	// Rawdata has all data. We only want data starting from a cutoff point, defined above.
	var data = rawdata.filter(function(d){ return d["date"].getTime() >cutoffdate.getTime()})

	// Get every column name
	var elements = [... new Set(data.map(
								function(d){
									return d.country
											}
								))
					];

	//get first column name
	var country_selection = elements[0];

	// Country specific data, data where country == selection
	var data_country = data.filter(function(d){
							return d.country == country_selection
	})

	// Get minimum and maximum dates for x axis.
	var mindate = d3.min(data_country, function(d){return d.date})
	var maxdate = d3.max(data_country, function(d){return d.date})

	// defining x scale.
	var x = d3.time.scale()
			.domain([mindate, maxdate])
			.nice(d3.time.month)
			.range([0, width1]);

	// defining XAxis
	var xAxis = d3.svg.axis()
		.scale(x)
	    .orient("bottom");

	// defining y scale
	var y = d3.scale.linear()
		.domain([d3.min(data_country, function(d){return d.new_case}), d3.max(data_country, function(d){
			return d.new_case;
		})])
		.range([height1, 0]);

	//defining y axis.
	var yAxis = d3.svg.axis()
		.scale(y)
	    .orient("left");

	svg1.call(tip);

	// sticking the x and y axis into the canvas.
	svg1.append("g")
    	.attr("class", "x axis1")
    	.attr("transform", "translate(0," + height1 + ")")
    	.call(xAxis)
    	.append("text")
    	.style("font-size", "10px")
      	.style("text-anchor", "end")
      	.attr("dx", ".7em")
      	.attr("dy", ".85em");
      	//.attr("transform", "rotate(-90)" );

 	svg1.append("g")
    	.attr("class", "y axis1")
    	.call(yAxis
        .ticks(7)
        .tickFormat(d3.format("s")))
        .append("text")
      	.style("font-size", "10px")
        .style("text-anchor", "end");

	// sticking the rectangles into the canvas.
	svg1.selectAll("rectangle1")
		.data(data_country)
		.enter()
		.append("rect")
		.attr("class","rectangle1")
		.attr("width", (width1 - margin1.left - margin1.right)/(data_country.length))
		.attr("height", function(d){
			return height1 - y(d[metric_select]);
		})
		.attr("x", function(d, i){
			return x(d.date) ;
		})
		.attr("y", function(d){
			return y(d[metric_select]);
		})
		.attr("fill", country_color[country_selection])
		.attr("stroke", stroke_color[country_selection])
		.on("mouseover", function(d){
			tip.show(d);
			d3.select(this)
			.attr("fill", line_color[country_selection])
			.attr("stroke", line_color[country_selection]);

		})
		.on("mouseout", function(d){
			tip.hide(d);
			d3.select(this)
			.attr("fill", country_color[country_selection])
			.attr("stroke", stroke_color[country_selection]);
		})
		// .on("mousemove", function(d){
		// 	tooltip
		// 		.style('left', (d3.event.pageX) + 'px')
		// 		.transition()
		// 		.duration(1000)
		// 		.style('top', (y(d[metric_select])+65) + 'px')
		// 	})

	// sticking the x/y axis LABEL into the canvas (Svg)
	svg1.append("text")
		.attr("x", width1/2)
		.attr("y", height1 + (margin1.bottom/2) )
		.style("text-anchor", "middle")
    .style("fill", "#3B3B3B")
		.text("Date")

	svg1.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -margin1.left/1.8)
		.attr("x",  -(height1 / 2))
		.style("text-anchor", "middle")
    .style("fill", "#3B3B3B")
		.text("Daily cases")



	// ########################################## PLOTTING THE LINE ##########################################
	// #######################################################################################################

	//Get country data for all dates
	var country_raw = rawdata.filter(function(d){
							return d.country == country_selection
	})

	//create a compare function for sorting
	function compare(a, b) {
		const dateA = a.date;
		const dateB = b.date;

		let comparison = 0;
		if (dateA > dateB) {
			comparison = 1;
		} else if (dateA < dateB) {
			comparison = -1;
		}
		return comparison;
	}

	//sort the array of objects
	country_raw.sort(compare);

	//create the running average
	//#region
	let runningsum = 0;
	const len = country_raw.length;
	let item = null;
	var rolling_avg = new Array()
	let avg_window = 7
	let rolling_avg_inst = 0

	for (let i = 0 ; i <len; i++){
		let item = country_raw[i];
		if(item["date"].getTime() > cutoffdate.getTime()){
			runningsum = 0
			for (let iter = 0 ; iter < avg_window; iter ++){
					runningsum = runningsum + country_raw[i - iter][metric_select]
				}
			rolling_avg_inst = runningsum/avg_window
			rolling_avg.push({date: item["date"], avg: rolling_avg_inst})
		}
	}
	//#endregion

	// creating the line object
	var trendline = d3.svg.line()
						.x(function(d){return x(d.date)})
						.y(function(d){return y(d.avg)})

	// sticking the line into the canvas.
	var line = svg1
		.append("g")
		.append("path")
		.attr("class", "line")
		.style("stroke", line_color[country_selection])
		.attr("d", trendline(rolling_avg))

	// Sticking label line into svg. First horizontal line, then slanted line.
	svg1.append("line")
		.attr("x1", margin1.left)
		.attr("y1", (height1/1.5 ) )
		.attr("x2", margin1.left + 20)
		.attr("y2", (height1/1.5 ))
		.style("stroke", "#7C7C7C")

	// appending slant lines
	var slantline = svg1.append("line")
		.attr("x1", margin1.left + 20 )
		.attr("y1", height1/1.5 )
		.attr("x2", x(rolling_avg[rolling_avg.length/2].date ) )
		.attr("y2", y(rolling_avg[rolling_avg.length/2].avg ))
		.style("stroke", "#7C7C7C")

	//appending text "7 day average"
	svg1.append("text")
		.attr("x", margin1.left -10)
		.attr("y", height1/1.6)
		.style("text-anchor", "middle")
		.style("font-size", "10px")
    .style("fill", "#3B3B3B")
		.text("7 day average")

	// ############################################# TRANSITION #######################################################
	// ################################################################################################################

	var selector = d3.select("#drop1")
    	.append("select")
    	.attr("id","dropdown1")
      .attr("class", "custom-select")
    	.on("change", function(d){
        	selection = document.getElementById("dropdown1");

          // Selecting the right div box to display for article

          var xboxes = document.getElementsByClassName("s1-country left");
          for (i = 0; i < xboxes.length; i++) {
            xboxes[i].style.display = "none";
          }
          var selectcountry = selection.value;
          //console.log(selectcountry.concat("left"));
          var thisbox = document.getElementById(selectcountry.concat("left"));
          thisbox.style.display = "block";


			//value in the dropdown is = country_selection
			country_selection = selection.value

			// get the data for this country
			data_country = data.filter(function(d){
							return d.country == country_selection
			})

			mindate = d3.min(data_country, function(d){return d.date})
			maxdate = d3.max(data_country, function(d){return d.date})

			// redefine the x and y scale domains. The range remain the same, obviously.
			x.domain([mindate, maxdate])

        	y.domain([d3.min(data_country, function(d){return d[metric_select]}), d3.max(data_country, function(d){return d[metric_select];})
			]);

			// change the axis to take into consideration the new scale.
			xAxis.scale(x)
        	yAxis.scale(y);

			// Redraw the rectangle. Why is it selectAll(.rectagle)? Workaround = define a variable instead. See line transition.
        	d3.selectAll(".rectangle1")
				.data(data_country)
           		.transition()
	            .attr("height", function(d){
					return height1 - y(d[metric_select]);
				})
				.attr("x", function(d){
					return x(d.date);
				})
				.attr("y", function(d){
					return y(d[metric_select]);
				})
				.attr("fill", country_color[country_selection])
				.attr("stroke", stroke_color[country_selection])
				.delay(function(d, i){return delay*(data_country.length - i)})
           		.ease("linear")
           		.select("title")
           		.text(function(d){
           			return d.country + " : " + d[metric_select];
           	});

			// For the line chart

			//Reperform the rolling average and save in rolling_avg
			country_raw = rawdata.filter(function(d){
							return d.country == country_selection
			})
			country_raw.sort(compare);

			//calculating the rolling average.
			// #region
			let runningsum = 0;
			const len = country_raw.length;
			let item = null;
			var rolling_avg = new Array()
			let avg_window = 7
			let rolling_avg_inst = 0

			for (let i = 0 ; i <len; i++){
				let item = country_raw[i];
				if(item["date"].getTime() > cutoffdate.getTime()){
					runningsum = 0
					for (let iter = 0 ; iter < avg_window; iter ++){
							runningsum = runningsum + country_raw[i - iter][metric_select]
						}
					rolling_avg_inst = runningsum/avg_window
					rolling_avg.push({date: item["date"], avg: rolling_avg_inst})
				}
			}
			//#endregion
			//define the line transition.
			line
				.transition()
				.delay(delay*data_country.length)
				.style("stroke", line_color[country_selection] )
				.attr("d", trendline(rolling_avg))
				.ease("linear")

			slantline
				.transition()
				.delay(delay*data_country.length)
				.attr("x2", x(rolling_avg[rolling_avg.length/2].date ) )
				.attr("y2", y(rolling_avg[rolling_avg.length/2].avg ))

		// not sure why it is g.y.axis; calling the new axis.
      d3.selectAll("g.y.axis1")
     		.transition()
        .call(yAxis);

			d3.selectAll("x axis1")
           		.transition()
           		.call(xAxis);
		});

	//drop down options.
    selector.selectAll("option")
      .data(elements)
      .enter().append("option")
      .attr("value", function(d){
        return d;
      })
      .text(function(d){
        return d;
      })
});

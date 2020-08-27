// ######################################## ADDING VIZ INFORMATION ################################################################
var population = {"Brazil": 212744941, "Bangladesh": 164891619, "India": 1381567238, "Indonesia": 273855751, "Pakistan": 221366281, "Sri Lanka": 21423831, "Egypt": 102548214}
var country_color = {"Bangladesh": "#BF71BF", "Brazil": "#5E66D5", "Egypt": "#C1834F", "India": "#5EC5F0", "Indonesia": "#F89756", "Pakistan": "#69C95F", "Sri Lanka": "#F0CB4A"}
var stroke_color = {"Bangladesh": "#BF71BF", "Brazil": "#5E66D5", "Egypt": "#C1834F", "India": "#5EC5F0", "Indonesia": "#F89756", "Pakistan": "#69C95F", "Sri Lanka": "#F0CB4A"}

// #####################k################### LAYOUT DEFINITION #######################################################################
const margin = {top: 20, right: 10, bottom: 10, left: 135},
    width = 1300 - margin.left - margin.right,
    height = 260 - margin.top - margin.bottom;
var svg = d3.select("#countrycomparegraph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var title = svg.append("text")
    .attr("class", "h6")
    .attr("x", (width-margin.left-margin.right)/3)
    .attr("y", -10)
    .text("Total Cases Per Capita")

// ################################################ ASYNC CALL FOR DATA ########################################################
d3.csv("covid_case_death_counts.csv", function(d){
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
    // Position the clusters
    function creategroup(){
      //AP: Height/width will be the for canvas. Drawing space is effective width (eff_width/eff_height) shown below;
      var eff_width = width - margin.left-margin.right
      var eff_height = height-margin.top-margin.bottom
        var centers = { "Bangladesh": {"center": {x: eff_width/14, y:eff_height/2}},
                    "Brazil": {"center": {x: 3*eff_width/14, y:eff_height/2}},
                    "Egypt": {"center": {x: 5*eff_width/14, y:eff_height/2}},
                    "India": {"center": {x: 7*eff_width/14, y:eff_height/2}},
                    "Indonesia": {"center": {x: 9*eff_width/14, y:eff_height/2}},
                    "Pakistan": {"center": {x: 11*eff_width/14, y:eff_height/2}},
                    "Sri Lanka": {"center": {x: 13*eff_width/14, y:eff_height/2}},
                 }
        return centers
    }
    var c_map = creategroup()
    var fill = d3.scale.category10();

    // ######################################## GET DATA FOR PLOTTING ################################################

    function calcValue(rawdata, measure, titles, cmap ){
        // INPUT RAWDATA and measure(total cases, tests etc) to get proportions.

        // Get data only for max date
        var maxdate = new Date(Math.max.apply(null, rawdata.map(function(d){return d.date})))

        // get relevenet data on latest date.
        var reldata = rawdata.filter(function(d){ return d.date.getTime() == maxdate.getTime()})

        if (titles){
        // PLOTTING THE COUNTRY TITLES!!
            for (var k = 0; k < reldata.length; k++){
                svg.append("text")
                    .attr("x", c_map[reldata[k].country].center.x)
                    .attr("y", c_map[reldata[k].country].center.y/20)
                    .attr("text-anchor", "middle")
                    .text(reldata[k].country)
            }
        }

        // data per capita
        var measure_per_capita = reldata.map(function(d){return {country: d.country, value: d[measure]/population[d.country]}})

        // normalize: find sum and divide.
        var sum = 0
        for (var i = 0; i<measure_per_capita.length; i++){
            sum += measure_per_capita[i]["value"]
        }

        //Proportions:
        var proportions = measure_per_capita.map(function(d){ return {country: d.country, value: Math.round(d.value*100/sum ) } })

        var eff_sum =0;
        var min_val = 1000;
        var min_ix = -1;

        // If rounding causes not to sum to 100, add to smallest value.
        for (i = 0; i < proportions.length; i++){
            eff_sum += proportions[i].value;
            if (min_val > proportions[i].value){
                min_val = proportions[i].value;
                min_ix = i
            }
        }
        if (eff_sum < 100){
            proportions[min_ix].value += (100 - eff_sum)
        }
        return proportions
    }

    var proportions = calcValue(rawdata, "total_case", titles = true)
    var findata = new Array()

    function makedata(proportions){
        var ret_data = new Array()
        for (var i = 0; i< proportions.length; i++){
            for (var j =0 ; j <proportions[i].value; j++){
                ret_data.push({country: proportions[i].country})
            }
        }
        return ret_data
    }

    var findata = makedata(proportions)

    var nodes = findata.map(function(d, i) {
        return {index: i, center: c_map[d.country].center, country: d.country};
    });
    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .charge(-200)
        .on("tick", tick)

    var node = svg.selectAll(".node")
        .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", 5)
            .style("fill", function(d) { return country_color[d.country]; })
            //.style("stroke", function(d, i) { return d3.rgb(country_color[d.country]).darker(2); }) Nice trick!
            .style("stroke", function(d, i) { return stroke_color[d.country]; })
            //.call(force.drag)
           // .on("mouseover", function() { d3.event.stopPropagation(); });

    force.start()

    svg.style("opacity", 1e-6)
        .transition()
            .duration(1000)
            .style("opacity", 1);

    d3.select("body")
        .on("mouseover", mouseover);

    function tick(e) {
        // e.alpha constantly reduces with each tick..
        var k = 2*e.alpha;
        nodes.forEach(function(node) {
            // I want the circles to have: similar/higher x value, if index is higher.
            var temp_center = node.center
            node.x += (temp_center.x - node.x) * k;
            node.y += (temp_center.y - node.y) * k;
        });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    function mouseover() {
        force.resume();
    }

    function movenode(e){
        var k = 3*e.alpha;
        nodes.forEach(function(node){
            var temp_center_ = node.center
            node.x += (temp_center_.x - node.x)*k;
            node.y += (temp_center_.y - node.y)*k;
        });
        node.transition()
            .delay(320)
            .duration(1000)
            .attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y})
            .ease("poly-in-out",1.35);
    }

    function transition(){
        // Get the data for the transition:
        var processdata = calcValue(rawdata, this.value, false);
        var backup_findata = findata
        findata = makedata(processdata)

        // Change the titles.
        if (this.value == "total_case"){
            title.transition()
                .style("opacity", 0)
                .transition()
                .delay(500)
                .text("Total Cases Per Capita")
                .style("opacity", 1)
        }
        else if (this.value == "total_death"){
            title.transition()
                .style("opacity", 0)
                .transition()
                .delay(500)
                .text("Total Deaths Per Capita")
                .style("opacity", 1)
        }

        nodes = findata.map(function(d, i) {
                        return {index: i, center: c_map[d.country].center, country: d.country};
                        });

        d3.selectAll(".node")
            .data(nodes)
            .style("fill", function(d) { return country_color[d.country]; })
            .style("stroke", function(d, i) { return stroke_color[d.country]; })


        force.nodes(nodes)
                .charge(-300)
                .on("tick", movenode)
                .start()
    }
    d3.selectAll("input").on("change", transition)

});
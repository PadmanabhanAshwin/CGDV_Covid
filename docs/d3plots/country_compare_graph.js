// ######################################## ADDING VIZ INFORMATION ################################################################
var population = {"Brazil": 212744941, "Bangladesh": 164891619, "India": 1381567238, "Indonesia": 273855751, "Pakistan": 221366281, "Sri Lanka": 21423831, "Egypt": 102548214}
var country_color = {"Bangladesh": "#BF71BF", "Brazil": "#5E66D5", "Egypt": "#C1834F", "India": "#5EC5F0", "Indonesia": "#F89756", "Pakistan": "#69C95F", "Sri Lanka": "#F0CB4A"}
var line_color = {"Bangladesh": "#622a62", "Brazil": "#002776", "Egypt": "#624B1C", "India": "#4363D8", "Indonesia": "#C05912", "Pakistan": "#228B22", "Sri Lanka": "#C88C00"}

// #####################k################### LAYOUT DEFINITION #######################################################################
const margin = {top: 20, right: 10, bottom: 10, left: 90},
    width = 1300 - margin.left - margin.right,
    height = 260 - margin.top - margin.bottom;

var svg = d3.select("#countrycomparegraph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//var title = svg.append("text")
//    .attr("class", "h6")
//    .attr("x", (width-margin.left-margin.right)/3)
//    .attr("y", -10)
//    .text("Total Cases Per Capita")

// Assign number of pixels to the left for country titels. Higher value pushes title to right
var text_padding = {"Bangladesh": 0, "Brazil": 8, "Egypt": 22, "India": 8, "Indonesia": 6, "Pakistan": -8, "Sri Lanka": -5}

// ################################################ ASYNC CALL FOR DATA ########################################################

d3.csv("covid_relevent.csv", function(d){
	// Creating an accesor function with relevent data type rtype.
    var dateparse = d3.time.format("%m/%d/%y").parse

	return {
		country: d["location"],
		total_case: +d["total_cases"],
		new_death : +d["new_deaths"],
		new_case : +d["new_cases"],
		total_death : +d["total_deaths"],
        date: dateparse(d["date"]),
        hospital_beds: +d["hospital_beds_per_thousand"]*+d["population"]/1000,
        //positivity: +d["positive_rate"], 
        gdp: +d["gdp_per_capita"]*+d["population"],
        population: +d["population"], 
        poverty: +d["extreme_poverty"]
        };
        
}, function(error, rawdata){
    // Position the clusters
    function creategroup(){
        //AP: Height/width will be the for canvas. Drawing space is effective width (eff_width/eff_height) shown below;
        var eff_width = width - margin.left - margin.right
        var eff_height = height-margin.top-margin.bottom
        var centers = { "Bangladesh": {"center": {x: 0, y:eff_height/2}},
                    "Brazil": {"center": {x: 13*eff_width/84, y:eff_height/2}},
                    "Egypt": {"center": {x: 26*eff_width/84, y:eff_height/2}},
                    "India": {"center": {x: 39*eff_width/84, y:eff_height/2}},
                    "Indonesia": {"center": {x: 52*eff_width/84, y:eff_height/2}},
                    "Pakistan": {"center": {x: 65*eff_width/84, y:eff_height/2}},
                    "Sri Lanka": {"center": {x: 78*eff_width/84, y:eff_height/2}},
                    }
            return centers
    }
    var c_map = creategroup()
    var fill = d3.scale.category10();

    // ######################################## GET DATA FOR PLOTTING ################################################

    function calcValue(rawdata, measure, titles, cmap ){
        // INPUT RAWDATA and measure(total cases, tests etc) to get proportions.

        // get max date
        var maxdate = new Date(Math.max.apply(null, rawdata.map(function(d){return d.date})))

        // get relevenet data on latest date.
        var reldata = rawdata.filter(function(d){ return d.date.getTime() == maxdate.getTime()})
        console.log(reldata)
        if (titles){
        // PLOTTING THE COUNTRY TITLES!!
            for (var k = 0; k < reldata.length; k++){
                svg.append("text")
                    .attr("x", c_map[reldata[k].country].center.x + text_padding[reldata[k].country])
                    .attr("y", c_map[reldata[k].country].center.y/20)
                    .attr("text-anchor", "middle")
                    .style("fill", "#3B3B3B")
                    .text(reldata[k].country)
            }
        }

        // data per capita
        var measure_per_capita = reldata.map(function(d){ return {country: d.country, value: d[measure]/d["population"]}})

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
        var max_ix = -1
        var max_val = -1

        var zero_pro_array = new Array()

        // If rounding causes not to sum to 100, add to smallest value.
        for (i = 0; i < proportions.length; i++){
            eff_sum += proportions[i].value;
            if (min_val > proportions[i].value){
                min_val = proportions[i].value;
                min_ix = i
            }
            if (max_val < proportions[i].value){
                max_val = proportions[i].value
                max_ix = i
            }
            if (proportions[i].value ==0 ){
                zero_pro_array.push(i)
            }
        }
        if (eff_sum < 100){
            proportions[min_ix].value += (100 - eff_sum)
        }
        for (var i = 0; i<zero_pro_array.length; i++){
            //console.log("Zero pro ix = " , zero_pro_array[i])
            //console.log("Adding to= ", proportions[zero_pro_array[i]])
            proportions[zero_pro_array[i]].value += 1
            proportions[max_ix].value -= 1
        }
        //console.log(proportions)
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

    // defining the force directed graph.
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
            .style("stroke", function(d, i) { return line_color[d.country]; })
            //.style("stroke", function(d, i) { return stroke_color[d.country]; })
            //.call(force.drag)
            // .on("mouseover", function() { d3.event.stopPropagation(); });
console.log(line_color);
    force.start()

    // appearance transition.
    svg.style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    d3.select("body")
        .on("mouseover", mouseover);


    // runs initially when the forced directed graph is defined.
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
        var k = 3*(e.alpha);
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
            .ease("poly-in",1);
    }

    function transitions(){
        // Get the data for the transition:
        var processdata = calcValue(rawdata, this.value, false);
        var backup_findata = findata
        findata = makedata(processdata)

        // Change the titles.

        //if (this.value == "total_case"){
        //    title.transition()
        //        .style("opacity", 0)
        //        .transition()
        //        .delay(500)
        //        .text("Total Cases Per Capita")
        //        .style("opacity", 1)
        //}
        //else if (this.value == "total_death"){
        //    title.transition()
        //        .style("opacity", 0)
        //        .transition()
        //        .delay(500)
        //        .text("Total Deaths Per Capita")
        //        .style("opacity", 1)
        //}

        nodes = findata.map(function(d, i) {
                        return {index: i, center: c_map[d.country].center, country: d.country};
                        });

        d3.selectAll(".node")
            .data(nodes)
            .style("fill", function(d) { return country_color[d.country]; })
            .style("stroke", function(d, i) { return line_color[d.country]; })


        force.nodes(nodes)
                .charge(-300)
                .on("tick", movenode)
                .start()
    }
    d3.selectAll("input").on("change", transitions)

});

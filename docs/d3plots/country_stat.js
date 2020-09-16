var case_counts = {"Bangladesh": 1000, "Brazil": 100000, "Egypt": 2000, "India": 200000, "Indonesia": 3000, "Pakistan": 7000, "Sri Lanka": 4000}
var death_counts = {"Bangladesh": 100, "Brazil": 10000, "Egypt": 200, "India": 20000, "Indonesia": 300, "Pakistan": 700, "Sri Lanka": 400}


var clicks1 = new Array()
var ix1 = 0 
clicks1[ix1] = "Indonesia"

var clicks2 = new Array()
var ix2 = 0 
clicks2[ix2] = "Sri Lanka"


function animateValue(id, start, end, duration) {
    // assumes integer values for start and end
    
    var obj = document.getElementById(id);
    var range = end - start;
    // no timer shorter than 50ms (not really visible any way)
    var minTimer = 50;
    // calc step time to show all interediate values
    var stepTime = Math.abs(Math.floor(duration / range));
    
    // never go below minTimer
    stepTime = Math.max(stepTime, minTimer);
    
    // get current time and calculate desired end time
    var startTime = new Date().getTime();
    var endTime = startTime + duration;
    var timer;
  
    function run() {
        var now = new Date().getTime();
        var remaining = Math.max((endTime - now) / duration, 0);
        var value = Math.round(end - (remaining * range));
        obj.innerHTML = value;
        if (value == end) {
            clearInterval(timer);
        }
    }
    timer = setInterval(run, stepTime);
    run();
}

// ######################### Writing the transition function: ##################################################

var count1 = d3.select("#drop1")
                .on("change", function(d){
                    selection1 = document.getElementById("dropdown1");
                    ix1 = ix1 + 1
                    clicks1.push(selection1.value)
                    animateValue("s1_counting_left",case_counts[clicks1[ix1-1]], case_counts[clicks1[ix1]], 1000)
                    animateValue("s1_counting_left_deaths",death_counts[clicks1[ix1-1]], death_counts[clicks1[ix1]], 1000)

                })

var count2 = d3.select("#drop2")
    .on("change", function(d){
        selection2 = document.getElementById("dropdown2");
        ix2 = ix2 + 1
        clicks2.push(selection2.value)
        animateValue("s1_counting_right",case_counts[clicks2[ix2-1]], case_counts[clicks2[ix2]], 1000)
        animateValue("s1_counting_right_deaths",death_counts[clicks2[ix2-1]], death_counts[clicks2[ix2]], 1000)

    })
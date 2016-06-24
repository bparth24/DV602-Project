/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var all_data = [];
var cobn = [];
var cou_line = [];
var variable = [];
var year_bar = [];
var unique_cob = [];
var unique_cou_line = [];
var unique_variable = [];
var unique_year_bar = [];
var final_yearval_line = [];
var final_cobnyearval_map = [];
var cobnyearval_map = [];
var mapd, mn_value, temp_a, temp_b, colExtent, value_cob_line, value_varname_line, value_cou_line, total_value_bar, value_year_bar, value_varname_bar, a_bar, top20, map_name_value;
var default_var_selected = "Inflows of foreign population by nationality";
var divID = "#map";
//var checkOption;
var default_year_selected = "2000";

// Reference from http://www.cis.umassd.edu/~dkoop/dsc530-2016sp/assignment3.html
function processData(errors, f1data, f2data, f3data) {
    if (errors)
        throw errors;

    f1data.forEach(function (d) {
        if (d.Country_of_birth_nationality != "Total" && d.Country_of_birth_nationality != "Not stated" && d.Country_of_birth_nationality != "Unknown" && d.Country_of_birth_nationality != "Stateless") {
            all_data.push({"COBN_abbrv": d.CO2, "COBN": d.Country_of_birth_nationality, "COU_abbrv": d.COU, "COU": d.Country, "VAR": d.VAR, "Year": d.Year, "Value": d.Value, "Variable": d.Variable});
        }
    });

    // Cobn contains all data by key as country of birth_nationality
    cobn = d3.nest().key(function (d) {
        return d.COBN;
    }).entries(all_data);

    // unique_cob contains all country of birth_nationality
    cobn.forEach(function (d) {
        unique_cob.push({"COBN": d.key});
    });

    // cou_line contains all data by key as Country
    cou_line = d3.nest().key(function (d) {
        return d.COU;
    }).entries(all_data);

    // unique_cou_line contains all country
    cou_line.forEach(function (d) {
        unique_cou_line.push({"COU": d.key});
    });

    // variable contains all data by key as Variable
    variable = d3.nest()
            .key(function (d) {
                return d.Variable;
            }).entries(all_data);
    //console.log(variable);

    // unique_variable contains all Variable
    variable.forEach(function (d) {
        unique_variable.push({"Variable": d.key});
    });

    // year_bar contains all data by key as Year
    year_bar = d3.nest()
            .key(function (d) {
                return d.Year;
            }).entries(all_data);

    // unique_year_bar contains all Variable
    year_bar.forEach(function (d) {
        unique_year_bar.push({"Year": d.key});
    });

    //for cobn dropdown menu Reference: http://stackoverflow.com/questions/24588883/populate-dropdown-list-with-csv-file-d3
    var select_cobn = d3.select("#cobn_line_dd")
            .append("select")
            .attr("id", "cobnlinedd");

    select_cobn.selectAll("option")
            .data(unique_cob)
            .enter()
            .append("option")
            .attr("value", function (d) {
                return d.COBN;
            })
            .text(function (d) {
                return d.COBN;
            });

    //for cou_line dropdown menu
    var select_cou = d3.select("#cou_line_dd")
            .append("select")
            .attr("id", "coulinedd");

    select_cou.selectAll("option")
            .data(unique_cou_line)
            .enter()
            .append("option")
            .attr("value", function (d) {
                return d.COU;
            })
            .text(function (d) {
                return d.COU;
            });

    //for variable dropdown menu 
    var select_var = d3.select("#variable_line_dd")
            .append("select")
            .attr("id", "varilinedd");

    select_var.selectAll("option")
            .data(unique_variable)
            .enter()
            .append("option")
            .attr("value", function (d) {
                return d.Variable;
            })
            .text(function (d) {
                return d.Variable;
            });

    //for year_bar dropdown menu 
    var select_year = d3.select("#year_dd")
            .append("select")
            .attr("id", "yearbardd");

//    checkOption = function(d){
//            if(d === default_year_selected){
//                return d3.select(this).attr("selected", "selected");
//            }
//        };
//    select_year.property("value", default_var_selected);

    select_year.selectAll("option")
            .data(unique_year_bar)
            .enter()
            .append("option")
            .attr("value", function (d) {
                return d.Year;
            })
            .text(function (d) {
                return d.Year;
            });

    document.getElementById("filterlinebtn").onclick = function () {

        value_varname_line = d3.select("#varilinedd").property("value");
        value_cob_line = d3.select("#cobnlinedd").property("value");
        value_cou_line = d3.select("#coulinedd").property("value");

        value_year_bar = d3.select("#yearbardd").property("value");
        mapd = getDataMap(value_year_bar, value_varname_line);

        drawline(getDataLine(value_cob_line, value_cou_line, value_varname_line));
        drawbarchart(getDataBar(default_year_selected, value_varname_line));
        drawWorldMap(mapd, f3data);
    };

    document.getElementById("filter_bar").onclick = function () {
        value_year_bar = d3.select("#yearbardd").property("value");
        value_varname_bar = value_varname_line;

        a_bar = getDataBar(value_year_bar, value_varname_bar);

        mapd = getDataMap(value_year_bar, value_varname_bar);

        drawbarchart(a_bar);
        drawWorldMap(mapd, f3data);
    };
}

function drawline(data) {
    d3.select("#linechart").select("svg").remove();

    var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

    var xline = d3.time.scale()
            .range([0, width]);

    var yline = d3.scale.linear()
            .range([height, 0]);

    var xAxis = d3.svg.axis()
            .scale(xline)
            .orient("bottom")
            .tickFormat(d3.format("d"));

    var yAxis = d3.svg.axis()
            .scale(yline)
            .orient("left")
            .tickFormat(d3.format("d"));

    var valueline = d3.svg.line()
            .x(function (d) {
                return xline(d.Year);
            })
            .y(function (d) {
                return yline(d.Value);
            });
//        .interpolate("basis");

    var svgline = d3.select("#linechart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xline.domain(d3.extent(data, function (d) {
        return d.Year;
    }));
    yline.domain(d3.extent(data, function (d) {
        return +d.Value;
    }));

    svgline.append("path")
            .attr("class", "path")
            .attr("d", valueline(data));

    svgline.append("g")
            .attr("class", "xline axisL")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

    svgline.append("g")
            .attr("class", "yline axisL")
            .call(yAxis);
}

function getDataLine(cname, cou_name, varname) {
    final_yearval_line = [];
    for (var i = 0; i < cobn.length; i++) {
        for (var j = 0; j < cobn[i].values.length; j++) {
            if ((cname === cobn[i].key) && (varname === cobn[i].values[j].Variable && (cou_name === cobn[i].values[j].COU))) {
                final_yearval_line.push({"Year": cobn[i].values[j].Year, "Value": cobn[i].values[j].Value});
            }
        }
    }
    return final_yearval_line;
}

function drawbarchart(data) {
    d3.select("#barchart").select("svg").remove();
    var m = [30, 10, 10, 30],
        w = 900 - m[1] - m[3],
        h = 500 - m[0] - m[2];

    var format = d3.format(",.0f");

    var xbar = d3.scale.linear().range([0, w]);
        xbar.domain([0, d3.max(data, function (d) {
            return d.values.total;
        })]);

    var ybar = d3.scale.ordinal().rangeBands([0, h], .1);
        ybar.domain(data.map(function (d) {
            return d.key;
        }));

    var xAxis = d3.svg.axis().scale(xbar).orient("top").tickSize(-h),
        yAxis = d3.svg.axis().scale(ybar).orient("left").tickSize(0);

    var svgbar = d3.select("#barchart")
            .append("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    var bar = svgbar.selectAll("g.bar")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", function (d) {
                return "translate(5," + ybar(d.key) + ")";
            });

    bar.append("rect")
            .attr("width", function (d) {
                return xbar(d.values.total);
            })
            .attr("height", ybar.rangeBand());

    bar.append("text")
            .attr("class", "value")
            .attr("x", function (d) {
                return xbar(d.values.total);
            })
            .attr("y", (ybar.rangeBand()) - 9)
            .attr("dx", -3)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .text(function (d) {
                return format(d.values.total);
            });

    svgbar.append("g")
            .attr("class", "xbar axisb")
            .call(xAxis);

    svgbar.append("g")
            .attr("class", "ybar axisb")
            .call(yAxis);
}

function getDataBar(vyear, vname) {
    var final_cobnyearval_bar = [];
    for (var i = 0; i < variable.length; i++) {
        for (var j = 0; j < variable[i].values.length; j++) {
            if (vname === variable[i].key && vyear === variable[i].values[j].Year) {
                final_cobnyearval_bar.push({"COBN_abbrv": variable[i].values[j].COBN_abbrv, "COBN": variable[i].values[j].COBN, "Year": variable[i].values[j].Year, "Value": variable[i].values[j].Value});
            }
        }
    }

    total_value_bar = d3.nest().key(function (d) {
        return d.COBN_abbrv;
    }).rollup(function (v) {
        return{
            total: d3.sum(v, function (d) {
                return d.Value;
            })
        };
    }).entries(final_cobnyearval_bar);

    total_value_bar.forEach(function (d) {
        d.values.total = +d.values.total;
    });

    total_value_bar.sort(function (a, b) {
        return b.values.total - a.values.total;
    });

    var top20 = total_value_bar.slice(0, 20);
    return top20;
}

function getDataMap(var_year, var_name) {
    var cobnyearval_map = [];

    for (var i = 0; i < variable.length; i++) {
        for (var j = 0; j < variable[i].values.length; j++) {
            if (var_name === variable[i].key && var_year === variable[i].values[j].Year) {
                cobnyearval_map.push({"COBN_abbrv": variable[i].values[j].COBN_abbrv, "COBN": variable[i].values[j].COBN, "Year": variable[i].values[j].Year, "Value": variable[i].values[j].Value});
            }
        }
    }

    map_name_value = d3.nest()
            .key(function (d) {
                return d.COBN_abbrv;
            })
            .rollup(function (v) {
                return d3.sum(v, function (d) {
                    return d.Value;
                });
            })
            .entries(cobnyearval_map);

    mn_value = d3.map();
    for (var i = 0; i < map_name_value.length; i++) {
        temp_a = map_name_value[i].key;
        temp_b = map_name_value[i].values;
        mn_value.set(temp_a, temp_b);
    }
    return mn_value;
}

function drawWorldMap(world, f3data) {

    d3.select("#map").select("svg").remove();

    var colExtent = d3.extent(world.values());
    var width = 960, height = 960;
    var projections = d3.geo.mercator()
            .scale((width + 1) / 2 / Math.PI)
            .translate([width / 2, height / 2])
            .precision(.1);

    var path = d3.geo.path()
            .projection(projections);

    var mapsvg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height);

    var color = d3.scale.linear()
            .domain(colExtent)
            .range(["rgb(255,255,204)", "rgb(0,104,55)"]);
    
    var div = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);

    mapsvg.append("g").selectAll("path")
            .data(f3data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "state-boundary ")
            .style("fill", function (d) {
                return color(world.get(d.id));
            })
            .style("opacity", 0.8)
            .on("mouseover", function (d) {
                d3.select(this).transition().duration(300).style("opacity", 1);
                div.transition().duration(300)
                    .style("opacity", 1)
                div.text(d.properties.name)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition().duration(300)
                    .style("opacity", 0.8);
                div.transition().duration(300)
                    .style("opacity", 0);
            });

    // for continuous
    var legendSize = 150;
    var numLevels;
    // for continuous, each rect is 1px wide
    numLevels = 150;

    var legend = mapsvg.append("g").attr("class", "YlGn");
    var levels = legend.selectAll("levels")
            .data(d3.range(numLevels))
            .enter().append("rect")
            .attr("x", function (d) {
                return width - legendSize - 20 +
                        d * legendSize / numLevels;
            })
            .attr("y", height - 20)
            .attr("width", legendSize / numLevels)
            .attr("height", 16)
            .style("stroke", "none");

    levels.style("fill", function (d) {
        return color(colExtent[0] * (legendSize - d) / legendSize +
                colExtent[1] * d / legendSize)
    });

    legend.append("text")
            .attr("x", width - legendSize - 20)
            .attr("y", height - 24)
            .attr("text-anchor", "middle")
            .text(colExtent[0]);

    legend.append("text")
            .attr("x", width - 20)
            .attr("y", height - 24)
            .attr("text-anchor", "middle")
            .text(colExtent[1]);

}
//References: https://github.com/d3/d3-queue
var q = d3_queue.queue();
q.defer(d3.csv, "mgr.csv")
q.defer(d3.json, "world-50m.json")
q.defer(d3.json, "countries.geo.json")
q.await(processData);

// Initializing list of letters
let welcomeText = document.getElementById('welcome').innerHTML;
let welcomeLetters = welcomeText.split('');


// Create span for each letter and apply this change to document
let newText = '';
for (letter in welcomeLetters) {
    let currText = '<span>' + welcomeLetters[letter] + '</span>';
    newText += currText;
}
document.getElementById('welcome').innerHTML = newText;


/**
 * - Set Interval for spacing out the timing between applying class to different spans
 * - Define function onTick for adding fade class to each span
 * - Clear the interval
 */
let letters = document.getElementById('welcome').getElementsByTagName('span');

let currChar = 0;
let timeSpacer = setInterval(onTick, 100);

function onTick() {
    const currSpan = letters[currChar];
    currSpan.classList.add('fade');
    currChar++;
    if (currChar === letters.length) {
        complete();
        return;
    }
}

function complete() {
    clearInterval(timeSpacer);
    timerSpacer = null;
}


/*
 * - Add an event listener for clicking a tab
 * - Define a function that filters the unwanted click events on the document
 */

// Add an event listener for clicking a tab
document.addEventListener('click', tabClick);

// Define a function that filters the unwanted click events on the document
function tabClick(event) {
    let elem = event.target,
        elemHREF = elem.getAttribute('href'),
        tabs = document.querySelectorAll('.tabs li a'),
        tabContents = document.querySelectorAll('.tab-contents li');

    // If we click an element whos href contains "tab-", proceed
    if (elemHREF !== null && elemHREF.indexOf('tab-') !== -1) {
        event.preventDefault();

        // If we didn't click an active item, switch tabs
        if (elem.className.indexOf('active') === -1) {
            // Remove the active class from the tabs and the visible class from the tab contents
            for (let i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove('active');
                tabContents[i].classList.remove('visible');
            }

            // Add the active class to the clicked element and the visible class to the corresponding tab
            elem.classList.add('active');
            document.getElementById(elemHREF).classList.add('visible');
        }
    }
}

/**
 * - Building Column Chart for Date tab
 * - Read in csv data and then format the data needed for the column chart
 */
d3.csv("data/breachData.csv", function(data) {

    let dateTabData = {};
    for (let i = 0; i < data.length; i++) {

        let currYear = data[i]['Year of Breach'];
        if (dateTabData[currYear] === undefined) {
            dateTabData[currYear] = 1;
        }
        else {
            dateTabData[currYear] += 1;
        }
    }

    let dateTabDataList = [];
    let year = 2005
    for (let i = 0; i < 15; i++) {
        let currObj = {};
        currObj["year"] = String(year);
        currObj["value"] = dateTabData[year];
        dateTabDataList.push(currObj);
        year+=1;
    }

    // Set the dimensions and margins of the graph
	let margin = {top: 20, right: 20, bottom: 40, left: 40},
        width = 460 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    let svg = d3.select("#dateTabContainer")
		.append("svg")
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    let chart = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let xScale = d3.scaleBand()
        .range([0, width])
        .domain(dateTabDataList.map((s) => s.year))
        .padding(0.4);
    
    let yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 1000]);

    let makeYLines = () => d3.axisLeft()
        .scale(yScale);

    let xAxis = chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    let yAxis = chart.append('g')
        .call(d3.axisLeft(yScale));

    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
        ).style('stroke-width', 0.3);
    
    // Div that shows up when you mouseover bars
	let mouseOverDiv = d3.select("#dateTabContainer").append("div")
        .attr("class", "mouseOverDiv")
        .style("opacity", 0);

    // Initializing the columns
    let barGroups = chart.selectAll()
        .data(dateTabDataList)
        .enter()
        .append('g');

    // Constructing the columns
    barGroups.append('rect')
        .attr('class', 'bar')
        .attr('x', (g) => xScale(g.year))
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
        .attr('width', xScale.bandwidth())
        .on('mouseover', function (d, i) {

            d3.select(this)
                .transition()
                .duration(50)
                .attr('opacity', 0.5);

            mouseOverDiv.transition()
				.duration(50)
				.style("opacity", 0.9);

        })
        .on('mousemove', function(d, i) {

            mouseOverDiv.html(`${d['value']} data breaches in ${d['year']}`)
                .style("left", (d3.event.pageX - 250) + "px")
                .style("top", (d3.event.pageY - 1000) + "px");

		})
        .on('mouseout', function (d, i) {

            d3.select(this)
                .transition()
                .duration(300)
                .attr('opacity', 1)
                .attr('x', (a) => xScale(a.year))
                .attr('width', xScale.bandwidth());

            mouseOverDiv.transition()
				.duration('50')
				.style("opacity", 0);

        })
        .style('fill','#2A88FF');

    // Label values on columns
    barGroups 
        .append('text')
        .attr('class', 'value')
        .attr('x', (a) => xScale(a.year) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.value) - 5)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.value}`)
    
    // Y-axis label
    svg.append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2.4) - margin.left)
        .attr('y', margin.left / 3.5)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Frequency');

    // X-axis label
    svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin.left)
        .attr('y', height + margin.top * 2.4)
        .attr('text-anchor', 'middle')
        .text('Year')
        .style('color', 'black');

    xAxis.selectAll('.tick text')
        .style('font-size', '8');

    yAxis.selectAll('.tick text')
        .style('font-size', '8');

});


/**
 * ------------------------------------------------------------------
 * Start of script for creating multi-line chart for Type of Breach tab
 * - Building Multiple Line Chart for Type of Breach tab
 * - Read in csv data and then format the data needed for the line chart
 * ------------------------------------------------------------------
 */
// set the dimensions and margins of the graph
let margin2 = {top: 30, right: 80, bottom: 60, left: 60},
    width2 = 690 - margin2.left - margin2.right,
    height2 = 600 - margin2.top - margin2.bottom;

// append the svg object to the body of the page
let svg2 = d3.select("#typeOfBreachTabContainer")
  .append("svg")
    .attr('viewBox', `0 0 ${width2 + margin2.left + margin2.right} ${height2 + margin2.top + margin2.bottom}`)
  .append("g")
    .attr("transform",
          "translate(" + margin2.left + "," + margin2.top + ")");

let g = svg2.append("g")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

let subgroups = ['HACK', 'PORT', 'DISC', 'PHYS', 'UNKN', 'INSD', 'STAT', 'CARD'];

// Div that shows up when you hover a line
let hoverDetails = d3.select("#typeOfBreachTabContainer").append("div")
    .attr("class", "hoverDetails")
    .style("opacity", 0);

//Read the data
d3.csv("data/formatted.csv", function(data) {

  // group the data: I want to draw one line per group
  let sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { 
        if (d['Type of breach'] === "#N/A") {
            return "UNKN";
        }
        return d['Type of breach'];
    })
    .entries(data);

  // Add X axis
  let x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return parseInt(d['Year of Breach']); }))
    .range([ 0, width2 ]);
  svg2.append("g")
    .attr("transform", "translate(0," + height2 + ")")
    .call(d3.axisBottom(x)
        .ticks(10)
        .tickFormat(d3.format("")));

  // Add Y axis
  let y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { 
        if (d['Total Records'] === "") {
            return 0;
        }
        else {
            return parseInt(d['Total Records'].replace(',', ''));
        }
     })])
    .range([ height2, 0 ]);
  svg2.append("g")
    .call(d3.axisLeft(y)
        .tickFormat(d3.format(".0s")));

  // color palette
  let res = sumstat.map(function(d){
      return d.key
    }) // list of group names
  let color = d3.scaleOrdinal()
    .domain(res)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

  // Draw the line
  svg2.selectAll(".line")
      .data(sumstat)
      .enter()
      .append("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d.key); })
        .attr("stroke-width", 1.5)
        .attr("id", function(d) {
            return d['key'];
        })
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(d['Year of Breach']); })
            .y(function(d) { 

                if (d['Total Records'] === "") {
                    return y(+0);
                }
                else {
                    return y(+parseInt(d['Total Records'].replace(',', '')));
                }
                
             })
            (d.values);
        })
        .clone()
            .attr('stroke', 'transparent')
            .attr('stroke-width', 20)    
            .on('mouseover', function (d, i) {

                let actualLine = this.parentNode.querySelector(`#${d['key']}`);

                d3.select(actualLine)
                    .transition()
                    .duration(50)
                    .attr('opacity', 0.5);
    
                hoverDetails.transition()
                    .duration(50)
                    .style("opacity", 0.9);
    
            })
            .on('mousemove', function(d, i) {
    
                hoverDetails.html(`Type of Breach: ${d['key']}`)
                    .style("left", (d3.event.pageX - 250) + "px")
                    .style("top", (d3.event.pageY - 1000) + "px");
    
            })
            .on('mouseout', function (d, i) {

                let actualLine = this.parentNode.querySelector(`#${d['key']}`);
    
                d3.select(actualLine)
                    .transition()
                    .duration(300)
                    .attr('opacity', 1);
    
                hoverDetails.transition()
                    .duration('50')
                    .style("opacity", 0);
            });
    
    // Adds in legend for stacked bar chart
	let legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
            .data(subgroups.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(-50," + (10 + i * 25) + ")"; });

    legend.append("rect")
        .attr("x", width2 + 10)
        .attr("y", -25)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", width2 + 5)
        .attr("y", -15)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });

    // Y-axis label
    svg2.append('text')
        .attr('class', 'label')
        .attr('x', -(height2 / 2.4) - margin2.left)
        .attr('y', margin2.left / 2.5 - 60)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Number of Breaches');

    // X-axis label
    svg2.append('text')
        .attr('class', 'label')
        .attr('x', width2 / 2.5 + margin2.left)
        .attr('y', height2 + margin2.top * 3)
        .attr('text-anchor', 'middle')
        .text('Year')
        .style('color', 'black');
});
/**
 * ------------------------------------------------------------------
 * End of script for creating multi-line chart for Type of Breach tab
 * ------------------------------------------------------------------
 */


/**
 * ------------------------------------------------------------------
 * Start of script for creating donut chart for Type of Organization tab
 * - Create workable object to get counts of organizations from
 * - Make attractive tooltip and legend
 * ------------------------------------------------------------------
 */
// set the dimensions and margins of the graph
let margin3 = 40,
    width3 = 460 - margin3*2,
    height3 = 400 - margin3*2;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
let radius = Math.min(width3, height3) / 2 - margin3

// Tooltip for donut chart for Type of Organization tab
let hoverTooltip = d3.select("#typeOfOrgTabContainer").append("div")
    .attr("class", "hoverTooltip")
    .style("opacity", 0);

// append the svg object to the div called 'my_dataviz'
let svg3 = d3.select("#typeOfOrgTabContainer")
  .append("svg")
  .attr('viewBox', `0 0 ${width3 + margin3*2} ${height3 - 15}`)
  .append("g")
    .attr("transform", "translate(" + (width3 / 2 + margin3) + "," + (height3 / 2 - 15) + ")");

// Create Data
let data = {'BSF': 787, 'BSO': 1045, 'BSR': 623, 'EDU': 848, 'GOV': 781, 'MED': 4343, 'NGO': 119, 'UNKN': 469};

// Organization Type Data
let orgs = {'BSF': 'Businesses (Financial and Insurance Services)', 
            'BSO': 'Businesses (Other)', 
            'BSR': 'Businesses (Retail/Merchant including Online Retail)', 
            'EDU': 'Educational Institutions', 
            'GOV': 'Government & Military', 
            'MED': 'Healthcare, Medical Providers, <br>and Medical Insurance Services', 
            'NGO': 'Nonprofits', 
            'UNKN': 'Unknown'}

// set the color scale
let color = d3.scaleOrdinal()
    .domain(data)
    .range(["#00AEFF", "#35BFFF", "#67CFFF", "#8BD9FD", "#BDEAFF", "#E6F7FF", "#BFD5DF", "#86C3DE"]);

// Compute the position of each group on the pie:
let pie = d3.pie().value(function(d) {return d.value; });
let data_ready = pie(d3.entries(data));

// The arc generator
let arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
let outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg3.selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
        .innerRadius(65)         // This is the size of the donut hole
        .outerRadius(radius)
    )
    .attr('fill', function(d){ return(color(d.data.key)) })
    .style("stroke", "#262626")
    .style("stroke-width", "3px")
    .style("opacity", 0.8)
    .on('mouseover', function(d, i) {

        d3.select(this).transition()
            .duration('50')
            .style('opacity', '0.4');

        hoverTooltip.transition()
            .duration(50)
            .style("opacity", 0.9);
        
    })
    .on('mousemove', function(d, i) {

        hoverTooltip.html(`<div id="percent">${((d['data']['value'] / 9015) * 100).toFixed(0)}%</div><div id='details'><b>Types of Organizations</b>: <i>${orgs[d['data']['key']]}</i><br>
                            <b>Number of Breaches</b>: <i>${d['data']['value']}</i></div>`)
            .style("left", (d3.event.pageX - 300) + "px")
            .style("top", (d3.event.pageY - 1050) + "px");

    })
    .on('mouseout', function(d, i) {

        d3.select(this).transition()
            .duration('50')
            .style('opacity', '0.8');

        hoverTooltip.transition()
            .duration('50')
            .style("opacity", 0);
        
    });

// Add the polylines between chart and labels:
svg3.selectAll('allPolylines')
  .data(data_ready)
  .enter()
  .append('polyline')
    .attr("stroke", "whitesmoke")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
      let posA = arc.centroid(d); // line insertion in the slice
      posA[1] = posA[1]*1.35;
      posA[0] = posA[0]*1.35;
      let posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
      posB[1] = posB[1]*1.15;
      posB[0] = posB[0]*1.15;
      secondPointX = posB[0];
      let posC = outerArc.centroid(d); // Label position = almost the same as posB
      let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = posB[0] - (midangle < Math.PI ? -40 : 40);//radius * 1.05 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      posC[1] = posC[1] * 1.15;
      return [posA, posB, posC];
    });

// Add the polylines between chart and labels:
svg3.selectAll('allLabels')
  .data(data_ready)
  .enter()
  .append('text')
    .text( function(d) { return d.data.key } )
    .attr('transform', function(d) {
        let pos = outerArc.centroid(d);
        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = 1.1 * pos[0] - (midangle < Math.PI ? -50 : 50);
        pos[1] = pos[1] * 1.15;
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })
    .attr('fill', 'whitesmoke')
    .style('font-size', '50%');

/**
 * ------------------------------------------------------------------
 * End of script for creating donut chart for Type of Organization tab
 * ------------------------------------------------------------------
 */


/**
 * ------------------------------------------------------------------
 * Start of script for creating hexbin map of the US for Records Affected tab
 * - Create the svg, create the projection, and then pass in the data
 * for creating the hexbin map
 * ------------------------------------------------------------------
 */
// The svg
let svg = d3.select("#recordsAffectedTabContainer").append('svg')
    .attr('viewBox', `0 0 460 400`);

// Data from using pandas on the data breaches csv file
let breachesByState = {'Alabama': 80, 'Alaska': 26, 'Arizona': 141, 'Arkansas': 56,
                        'Beijing': 1, 'Berlin': 1, 'British Columbia': 3, 'Buckinghamshire': 2, 
                        'California': 1338, 'Cheshire': 1, 'Colorado': 173, 'Connecticut': 149,
                        'Delaware': 22, 'District of Columbia': 152, 'Dublin': 1,
                        'Florida': 458, 'Georgia': 255, 'Grand Bahama': 1, 'Guangdong': 1,
                        'Hawaii': 28, 'Idaho': 24, 'Illinois': 343, 'Indiana': 216,
                        'Iowa': 67, 'Kansas': 54, 'Kentucky': 121, 'London': 2,
                        'Louisiana': 61, 'Maine': 33, 'Maryland': 343, 'Massachusetts': 248, 
                        'Michigan': 155, 'Minnesota': 149, 'Mississippi': 36, 'Missouri': 144,
                        'Montana': 35, 'Nebraska': 43, 'Nevada': 65, 'New Hampshire': 44,
                        'New Jersey': 161, 'New Mexico': 55, 'New York': 618, 'Noord Holland': 1,
                        'North Carolina': 214, 'North Dakota': 10, 'Ohio': 266, 'Oklahoma': 68,
                        'Ontario': 7, 'Oregon': 128, 'Pennsylvania': 279, 'Puerto Rico': 39,
                        'Quebec': 3, 'Rhode Island': 43, 'South Carolina': 73, 'South Dakota': 13,
                        'Tennessee': 164, 'Texas': 581, 'Tokyo': 1, 'Utah': 62,
                        'Vermont': 32, 'Virginia': 200, 'Washington': 198, 'West Virginia': 30,
                        'Wisconsin': 102, 'Wyoming': 16};

let totalRecordsAffectedByState = {'Alabama': 2868209,'Alaska': 170259, 'Arizona': 48114721, 'Arkansas': 1502996,
                                    'Beijing': 1600000, 'Berlin': 1503710, 'British Columbia': 1600000, 'Buckinghamshire': 0, 
                                    'California': 5755785395, 'Cheshire': 0, 'Colorado': 5812743, 'Connecticut': 4285337, 
                                    'Delaware': 4326939, 'District of Columbia': 194464156 + 58973, 'Dublin': 0, 'Florida': 402928731,
                                    'Georgia': 353951510, 'Grand Bahama': 0, 'Guangdong': 40000, 'Hawaii': 533109, 
                                    'Idaho': 159946, 'Illinois': 21141925, 'Indiana': 167628647, 'Iowa': 732649,
                                    'Kansas': 7913824, 'Kentucky': 1570749, 'London': 1290000, 'Louisiana': 392592,
                                    'Maine': 4246207, 'Maryland': 337753761, 'Massachusetts': 104967162, 'Michigan': 3931822,
                                    'Minnesota': 45942383, 'Mississippi': 294258, 'Missouri': 9132087, 'Montana': 1471889,
                                    'Nebraska': 7788080, 'Nevada': 24834117, 'New Hampshire': 812440, 'New Jersey': 147073199,
                                    'New Mexico': 271159, 'New York': 325955672, 'Noord Holland': 106, 'North Carolina': 13231394,
                                    'North Dakota': 401686, 'Ohio': 8498935, 'Oklahoma': 2307894, 'Ontario': 43066000,
                                    'Oregon': 1371917882, 'Pennsylvania': 17743361, 'Puerto Rico': 2180229, 'Quebec': 800004,
                                    'Rhode Island': 301899, 'South Carolina': 8172230, 'South Dakota': 55347, 'Tennessee': 18930181,
                                    'Texas': 349995888, 'Tokyo': 0, 'Utah': 4532008, 'Vermont': 153799,
                                    'Virginia': 208368197, 'Washington': 110279140, 'West Virginia': 368486, 'Wisconsin': 1360287,
                                    'Wyoming': 96130};

// Tooltip for donut chart for Type of Organization tab
let hoverStateTooltip = d3.select("#recordsAffectedTabContainer").append("div")
    .attr("class", "hoverStateTooltip")
    .style("opacity", 0);

// Map and projection
let projection = d3.geoMercator()
    .scale(350) // This is the zoom
    .translate([850, 440]); // You have to play with these values to center your map

// Path generator
let path = d3.geoPath()
    .projection(projection);

// Load external data and boot
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/us_states_hexgrid.geojson.json", function(data){

  // Draw the map
  svg.append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
          .attr("fill", "#2A88FF")
          .attr("d", path)
          .attr('class', 'state-path')
          .on('mouseover', function(d, i) {

            let state = d['properties']['google_name'].replace(' (United States)', '').replace(' ', '-');

              hoverStateTooltip.transition()
                .duration(50)
                .style("opacity", 0.9);

              d3.select(this).transition()
                .duration('50')
                .style('opacity', '0.6');
              this.setAttribute('id', state);

          })
          .on('mousemove', function(d, i) {

            let state = d['properties']['google_name'].replace(' (United States)', '');

            hoverStateTooltip.html(`${state}<br>
                                    Number of Breaches: ${breachesByState[state]}<br>
                                    Total Records Affected: ${totalRecordsAffectedByState[state].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`)
                .style("left", (d3.event.pageX - 275) + "px")
                .style("top", (d3.event.pageY - 1050) + "px");
              
          })
          .on('mouseout', function(d, i) {

            hoverStateTooltip.transition()
                .duration('50')
                .style("opacity", 0);

            d3.select(this).transition()
                .duration('50')
                .style('opacity', '1');

          });

  // Add the labels
  svg.append("g")
      .selectAll("labels")
      .data(data.features)
      .enter()
      .append("text")
        .attr("x", function(d){return path.centroid(d)[0]})
        .attr("y", function(d){return path.centroid(d)[1]})
        .text(function(d){ return d.properties.iso3166_2})
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .style("font-size", 11)
        .style("fill", "whitesmoke")
        .on('mouseover', function(d, i) {

            let state = d['properties']['google_name'].replace(' (United States)', '').replace(' ', '-');

              hoverStateTooltip.transition()
                .duration(50)
                .style("opacity", '0.9');

            let statePath = this.parentNode.parentNode.querySelector(`#${state}`);

            d3.select(statePath).transition()
                .duration('50')
                .style('opacity', '0.6');

          })
          .on('mousemove', function(d, i) {

            let state = d['properties']['google_name'].replace(' (United States)', '');

            hoverStateTooltip.html(`${state}<br>
                                    Number of Breaches: ${breachesByState[state]}<br>
                                    Total Records Affected: ${totalRecordsAffectedByState[state].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`)
                .style("left", (d3.event.pageX - 275) + "px")
                .style("top", (d3.event.pageY - 1050) + "px");
              
          })
          .on('mouseout', function(d, i) {

            hoverStateTooltip.transition()
                .duration('50')
                .style("opacity", 0);

            let state = d['properties']['google_name'].replace(' (United States)', '').replace(' ', '-');
            let statePath = this.parentNode.parentNode.querySelector(`#${state}`);

            d3.select(statePath).transition()
                .duration('50')
                .style('opacity', '1');

          });
});
/**
 * ------------------------------------------------------------------
 * End of script for creating hexbin map of the US for Records Affected tab
 * ------------------------------------------------------------------
 */


// Setting height of background for color
let body = document.body,
    html = document.documentElement;

let contentHeight = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );

const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

document.getElementById('main-content').setAttribute('style', `height: ${contentHeight}px`);

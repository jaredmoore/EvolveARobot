var D3_Plotter = D3_Plotter || new function() {
    var fitness_data = [];
    var xScale, yScale, yAxis, xAxis, svg;

    this.scatterplot = function() {
        var w = 500;
        var h = 300;
        var padding = 30;

        //Create scale functions
        xScale = d3.scale.linear()
                             .domain([0, d3.max(fitness_data, function(d) { return d[0]; })])
                             .range([padding, w - padding * 2]);

        yScale = d3.scale.linear()
                             .domain([0, d3.max(fitness_data, function(d) { return d[1]; })])
                             .range([h - padding, padding]);

        //Define X axis
        xAxis = d3.svg.axis()
                          .scale(xScale)
                          .orient("bottom")
                          .ticks(5);

        //Define Y axis
        yAxis = d3.svg.axis()
                          .scale(yScale)
                          .orient("left")
                          .ticks(5); 

        //Create SVG element
        svg = d3.select("div.scatterplot")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);

        //Create circles
        svg.selectAll("circle")
           .data(fitness_data)
           .enter()
           .append("circle")
           .attr("cx", function(d) {
                return xScale(d[0]);
           })
           .attr("cy", function(d) {
                return yScale(d[1]);
           })
           .attr("r", 2);

        //Create X axis
        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (h - padding) + ")")
                .call(xAxis)
            .append("text")
                .attr("class", "label")
                .attr("x", w)
                .attr("y", 0)
                .style("text-anchor", "end")
                .text("Generation");

        //Create Y axis
        svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + padding + ",0)")
                .call(yAxis)
            .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Fitness");
    }

    this.updateScatterplot = function(new_data) {
        fitness_data.push(new_data);

        //Update scale domains
        xScale.domain([0, d3.max(fitness_data, function(d) { return Math.ceil((d[0]+1)/10)*10; })]);
        yScale.domain([0, d3.max(fitness_data, function(d) { return d[1]; })]);

        //Update all circles
        svg.selectAll("circle")
           .data(fitness_data)
           .transition()
           .duration(1000)
           .attr("cx", function(d) {
                return xScale(d[0]);
           })
           .attr("cy", function(d) {
                return yScale(d[1]);
           });

        //Enter new circles
        svg.selectAll("circle")
            .data(fitness_data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d[0]);
            })
            .attr("cy", function(d) {
                return yScale(d[1]);
            })
            .attr("r", 2);

        // Remove old
        svg.selectAll("circle")
            .data(fitness_data)
            .exit()
            .remove();

        // Update the axes
        //Define X axis
        xAxis = d3.svg.axis()
                          .scale(xScale)
                          .orient("bottom")
                          .ticks(5);

        //Define Y axis
        yAxis = d3.svg.axis()
                          .scale(yScale)
                          .orient("left")
                          .ticks(5); 

        svg.selectAll('.x.axis')
            .call(xAxis);
        svg.selectAll('.y.axis')
            .call(yAxis);            
    }
};
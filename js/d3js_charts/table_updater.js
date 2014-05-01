var D3_FitnessTable = D3_FitnessTable || new function() {
    var dataset = [], headers = [], prev_row = [], table, tbody, thead;
    var xScale, yScale, yAxis, xAxis, svg;

    this.table = function(genome_elements) {

        // var tmpDataset = [],
        // i, j;

        // Setup the headers.
        headers.push("Iteration");
        headers.push('Fitness');
        for (var i = 0; i < genome_elements; ++i) {
            headers.push('Gene '+i.toString());
        }

        // for (i = 0; i < 5; i++) {
        //     for (j = 0, tmpDataset = []; j < 2 + genome_elements; j++) {
        //         tmpDataset.push("Row:"+i+",Col:"+j);
        //     }
        //     dataset.push(tmpDataset);
        // }

        // d3.select("#fitness_table_headers").append("table")
        //     .append("thead")
        //         .append("tr")
        //         .selectAll("th")
        //         .data(headers)
        //         .enter()
        //         .append("th")
        //             // .style("display","table-row")
        //             .text(function(column) { return column; });            

        // // table.style("border-collapse", "collapse")
        // //     .style("border", "2px black solid")

        // d3.select("#fitness_table_content").append("table")
        //     .selectAll("tr")
        //         .data(dataset)
        //         .enter()
        //         .append("tr")
        //     .selectAll("td")
        //         .data(function(d){return d;})
        //         .enter()
        //         .append("td")
        //             .style("border", "1px black solid")
        //             .style("padding", "10px")
        //             .text(function(d){return d;}); 

        table = d3.select("#fitness_table_headers").append("table")
                                                   .attr("id", "fitness_log_table")
                                                   .style("visibility","hidden"),
            thead = table.append("thead"),
            tbody = table.append("tbody");

        table.style("border-collapse", "collapse")
            .style("border", "2px black solid")

        // append the header row
        thead.append("tr")
            .selectAll("th")
            .data(headers)
            .enter()
            .append("th")
                .text(function(column) { return column; });

        // create a row for each object in the data
        var rows = tbody.selectAll("tr")
            .data(dataset)
            .enter()
            .append("tr");

        // create a cell in each row for each column
        var cells = rows.selectAll("td")
            .data(function(d){return d;})
            .enter()
            .append("td")
                .style("border", "1px black solid")
                .style("padding", "4px")
                .text(function(d){return d;});      

        // Set the height of the vertical border on the right of the table.
        // document.getElementById("fitness_log_vertical_bar").style.height = document.getElementById("fitness_log").clientHeight+"px";   
    }

    this.updateTable = function(row_info, genome_key) {
        // Define text color based on the state of the current row and the previous row.
        var data_coloring = [0,0]; // 0's for Iteration and Fitness automatically.
        if (prev_row) {
            for (var i = 2; i < row_info.length; ++i) {
                if (row_info[i] < prev_row[i]) {
                    data_coloring.push(-1);
                } else if (row_info[i] > prev_row[i]) {
                    data_coloring.push(1);
                } else if (row_info[i] != prev_row[i]) {
                    data_coloring.push(1);
                } else {
                    data_coloring.push(0);
                }
            }
        } else {
            data_coloring.concat(Array.apply(null, new Array(row_info.length-2)).map(Number.prototype.valueOf,0));
        }

        var data = [];
        for (var i = 0; i < row_info.length; ++i) {
            data.push([row_info[i],data_coloring[i]]);
        }

        dataset.push(data);

        prev_row = row_info.slice();

        var rows = tbody.selectAll("tr")
            .data(dataset)
            .enter()
            .append("tr");

        // create a cell in each row for each column
        var cells = rows.selectAll("td")
            .data(function(d){return d;})
            .enter()
            .append("td")
                .attr("class","best_ind")
                .attr("id", function(d) {
                    if (d[1] == -1) {
                        return "td_red";
                    } else if (d[1] == 1) {
                        return "td_green";
                    } else {
                        return "td_norm";
                    }
                })
                .attr("data-gind",genome_key)
                .style("border", "1px black solid")
                .style("padding", "4px")
                .text(function(d){return d[0];}); 

        table.style("visibility","visible");

        // Set the height of the vertical border on the right of the table.
        if (document.getElementById("fitness_log").clientHeight < document.getElementById("fitness_log_table").clientHeight) {
            document.getElementById("fitness_log_vertical_bar").style.height = document.getElementById("fitness_log").clientHeight+"px";
        } else {
            document.getElementById("fitness_log_vertical_bar").style.height = document.getElementById("fitness_log_table").clientHeight+"px";
        }
    }

    // Output the data to csv.
    this.toCSV = function() {
        if (dataset.length > 0) {
            var csvContent = "data:text/csv;charset=utf-8,";

            // Insert the headers into the CSV file.
            csvContent += headers.join(',')+"\n";

            // Insert the genome data into the csv, ignore the value changes.
            for (var i = 0; i < dataset.length - 1; ++i) {
                for (var j = 0; j < dataset[i].length-1; ++j) {
                    csvContent += dataset[i][j][0]+",";
                }
                csvContent += dataset[i][dataset[i].length-1][0]+"\n";
            }

            // Add the last row to the dataset.
            for (var j = 0; j < dataset[dataset.length-1].length-1; ++j) {
                csvContent += dataset[dataset.length-1][j][0]+",";
            }
            csvContent += dataset[dataset.length-1][dataset[dataset.length-1].length-1][0]+"\n";

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "my_data.csv");

            link.click(); // This will download the data file named "my_data.csv".
        }
    }
};
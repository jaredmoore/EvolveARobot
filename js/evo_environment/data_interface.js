'use strict';

var DataInterface = DataInterface || new function() {
	this.fitnessUpdate = function(iteration, index, fitness_value) {
		if (index % 2 == 0) {
			document.getElementById('fitness_log').innerHTML += "<span class='best_ind even_best' data-gind='"+
																index+"'>"+
																iteration+": "+fitness_value.toFixed(2)+"</span>";//<br>"; 
		} else {
			document.getElementById('fitness_log').innerHTML += "<span class='best_ind odd_best' data-gind='"+
																index+"'>"+
																iteration+": "+fitness_value.toFixed(2)+"</span>";//<br>"; 
		}
	}

	this.updateScatterplot = function(iteration, fitness_value) {
		D3_Plotter.updateScatterplot([iteration,fitness_value]);
	}

	this.iterationUpdate = function(iteration) {
		document.getElementById('iteration_number').innerHTML = iteration; 
	}
}
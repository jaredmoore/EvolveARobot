'use strict';

// Equality test from:
// http://stackoverflow.com/a/7837725/480685
function arraysIdentical(a, b) {
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

var HillClimber = HillClimber || new function() {

	var genome = [], best_genome = [], best_fitness = "", cur_fitness, iteration = 0, best_genomes = [];

	// Initialize the hillclimber.
	this.init = function() {
		// TODO: Robot Removal
		// // Start with a randomized genome.
		// // Randomize the speed.
		// for (var i = 0; i < 8; ++i) {
		// 	genome.push((-1.0 + 2.0*Math.random()).toFixed(8));
		// }

		// // Randomize the duration.
		// for (var i = 8; i < 16; ++i) {
		// 	genome.push(100 + Math.floor(100*Math.random()));	
		// }

		genome = (Robot.initGenome()).slice();

		D3_FitnessTable.table(genome.length);

		Simulator.initScene("container", 0);

		Simulator.launchSimulation(genome);
	};

	// Return the current genome (recovering from validation).
	this.getGenome = function() {
		return genome;
	};

	// Return the selected genome from the best.
	this.getBestGenomeFromIteration = function () {
		return best_genomes[validate_clicked_index];
	};

	// Return the current best genome for validation.
	this.getBestGenome = function() {
		return best_genome;
	};

	// Request a fitness value for a given position.
	this.requestFitness = function(x,y,z) {
		return fit_func(x,y,z);
	};

	// Request the best fitness value.
	this.requestBestFitness = function() {
		return best_fitness;
	};

	// Generate a new candidate individual.
	this.newRobot = function (x,y,z) {
		cur_fitness = fit_func(x,y,z);

		// Update the iteration number.
		iteration += 1;

		DataInterface.iterationUpdate(iteration);
		DataInterface.updateScatterplot(iteration, cur_fitness);

		if (best_fitness === "") {
			add_best_individual();
		} else if (cur_fitness > best_fitness && !arraysIdentical(best_genome,genome)) {
			add_best_individual();
			genome = best_genome.slice();
		} else {
			genome = best_genome.slice();
		}

		// Create a new individual.
		genome = (Robot.mutateGenome(genome)).slice();
		// TODO: Robot Removal
		// var index = Math.floor(Math.random() * 16);
		// if (index == 16) {
		// 	index = 15;
		// }
		// if (index < 8) {
		// 	genome[index] = (-1.0 + 2.0*Math.random()).toFixed(8);
		// } else {
		// 	genome[index] = Math.floor(200*Math.random());	
		// }

		return genome;
	};

	// Euclidean Distance fitness function for the robot.
	var fit_func = function(x,y,z) {
		return Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
	};

	// Add a best individual to the list and setup the HTML accordingly.
	var add_best_individual = function() {
		best_genome = genome.slice();
		best_genomes.push(best_genome);
		best_fitness = cur_fitness;
		// DataInterface.fitnessUpdate(iteration, best_genomes.length-1, best_fitness);
		D3_FitnessTable.updateTable([iteration,best_fitness.toFixed(4)].concat(best_genome), best_genomes.length-1);	
	} 
}
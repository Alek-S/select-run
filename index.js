const chalk = require('chalk');
const fuzzy = require('fuzzy')
const path = require('path');
const inquirer = require('inquirer');

const packageJsonPath = path.join(process.cwd(), 'package.json');

let packageJson;
try{
	packageJson = require(packageJsonPath);
} 
catch(error) {
	// no package.json found
	errorMsg('package.json not found, you in the right directory?')
}

console.log(chalk.gray(`path: ${packageJsonPath}\n`));

/* add checkbox-plus to inquirer prompt type */
inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));
userInterview();



/* start the user interview with checkbox multi-select*/
function userInterview () {
	const interviewMessage = 
		`Select scripts -- (Press ${chalk.cyan('<space>')} to select,` + 
		` ${chalk.cyan('<return>')} to complete)` +
		`\nfilter: `;

	inquirer
		.prompt({
			type:"checkbox-plus",
			name: 'selectedScripts',
			message:interviewMessage,
			highlight: true,
			searchable: true,
			source: (_answersSoFar, input) => {
				input = input || '';
	
				return new Promise(function(resolve) {
	
				const fuzzyResult = fuzzy.filter(input, Object.keys(packageJson.scripts));
	
				const data = fuzzyResult.map(function(element) {
					return element.original;
				});
	
				resolve(data);
				
				});
			},
			choices: Object.keys(packageJson.scripts)
		})
		.then(selected => {
			runSelected(selected)
		})
		.catch(err => errorMsg(`inquirer interview failed, \n${err}`));
}


function runSelected({selectedScripts}) {
	console.log(selectedScripts)
}

/* give user error messages */
function errorMsg (msg, exit = true) {
	console.error(chalk.red(`Error! ${msg}`));
	exit && process.exit(1);
}
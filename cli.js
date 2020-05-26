#!/usr/bin/env node

/**
 * @author Alek Shnayder
 * See LICENSE file in root directory for full license.
 */
"use strict"

const chalk = require('chalk');
const fuzzy = require('fuzzy')
const path = require('path');
const inquirer = require('inquirer');
const npmRunAll = require("npm-run-all");
let args;

const packageJsonPath = path.join(process.cwd(), 'package.json');

if(process.argv.length > 2){
	args = process.argv.slice(2)[0];
	console.log(chalk.yellow('Pre-filtered on:'), args);
}

let packageJson;
try{
	packageJson = require(packageJsonPath);
}
catch(error) {
	// no package.json found
	errorMsg('package.json could not be read, you in the right directory?')
}

console.log(chalk.gray(`path: ${packageJsonPath}\n`) );

/* add checkbox-plus to inquirer prompt type */
inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));
userInterview();



/**
 * @function userInterview
 * start the user interview with checkbox multi-select
 */
function userInterview () {
	const interviewMessage =
		`Select scripts -- (Press ${chalk.cyan('<space>')} to select,` +
		` ${chalk.cyan('<return>')} to complete)` +
		`\n${chalk.yellow('filter')}: `;

	inquirer
		.prompt({
			type:"checkbox-plus",
			name: 'selectedScripts',
			message:interviewMessage,
			pageSize: 15,
			highlight: true,
			searchable: true,
			default: [args],
			source: (_answersSoFar, input) => {
				input = input || (args ? args : '');
				return new Promise((resolve) => {
				const fuzzyResult = fuzzy.filter(input, Object.keys(packageJson.scripts));
				const data = fuzzyResult.map(element => element.original);
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



/**
 * @function runSelected
 * run the npm scripts that were selected
 * @param {string[]} selectedScripts - keys of package.json scripts
 */
function runSelected({selectedScripts}) {
	if( selectedScripts && selectedScripts.length > 0 ) {
		console.log(`\n[ ${chalk.green('running selected scripts')} ]`)
		npmRunAll(selectedScripts, {
			stdout: process.stdout,
			stderr: process.stderr
			}).catch(() => {
			errorMsg(`run-all failed, \n${err}`)
			});
	} else {
		console.log(chalk.gray('nothing selected'));
		process.exit(0);
	}
}



/**
 * @function errorMsg
 * give user error messages
 * @param {string} msg - message to be logged out
 * @param {boolean} exit - if should exit after message, default true
 */
function errorMsg (msg, exit = true) {
	console.error(chalk.red(`Error! ${msg}`));
	exit && process.exit(1);
}
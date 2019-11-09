const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

let packageJson;
try{
	packageJson = require(packageJsonPath);
} 
catch(error) {
	// no package.json found
	console.log(
		chalk.red('Error: You sure you got package.json here?')
	);
	process.exit(1);
}

console.log(`path of package json: ${packageJsonPath}`);


packageJson && console.log(packageJson.scripts);
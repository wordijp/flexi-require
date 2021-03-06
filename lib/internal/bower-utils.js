// copied by https://www.npmjs.com/package/browserify-bower

'use strict';

var path = require('path');
var fs 	 = require('fs');
var _  = require('lodash-node');

//
// determine bower components home dir, maybe need to get dir name from '.bowerrc'
//
function componentsHome(workdir) {
	var bowerrc = path.join(workdir, '.bowerrc'),
		defaultHome = path.join(workdir, 'bower_components');
	return (fs.existsSync(bowerrc) && require(bowerrc).directory) || defaultHome;
}

//
// extract component name from inputting rawname
//
function componentName(rawname) {
	var name = rawname.split(':')[0],
		index = name.replace('\\', '/').indexOf('/');
	return (index > 0) ? name.substring(0, index) : name;
}

//
// get bower components names
//
function componentNames(workdir) {
	workdir = workdir || process.cwd();
	try {
		var bowerJson = require(path.join(workdir, 'bower.json'));
		return _(Object.keys(bowerJson.dependencies || {}))
			.union(Object.keys(bowerJson.devDependencies || {}))
			.value();
	} catch (ex) {
		// not found bower
		//console.warn(ex.message);
		return [];
	}
}
exports.componentNames = componentNames;

//
// resolve and return entry file's full path for specified component
//
function resolve(name, workdir) {
	workdir = workdir || process.cwd();
	var compName = componentName(name),
		subname = name.substring(compName.length + 1),
		basedir = path.join(componentsHome(workdir), compName),
		bowerJson = require(path.join(basedir, 'bower.json'));

	var mainfile = Array.isArray(bowerJson.main) 
		? bowerJson.main.filter(function(file) { return /\.js$/.test(file); })[0] 
		: bowerJson.main;

	if (subname && subname.length > 0) {
		var subpath = mainfile && path.join(basedir, mainfile, '..', subname);
		if (subpath && (fs.existsSync(subpath) || fs.existsSync(subpath + '.js'))) {
			return path.join(basedir, mainfile, '..', subname);
		} else {
			return path.join(basedir, subname);
		}
	} else {
		if (mainfile) {
			return path.join(basedir, mainfile);
		}	else {
			if (fs.existsSync(path.join(basedir, "index.js"))) {
				return path.join(basedir, "index.js");
			} else {
				return path.join(basedir, compName);
			}
		}
	}
}
exports.resolve = resolve;

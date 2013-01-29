var path = require('path');
var fs = require('fs');
var jshtml = require('../lib/jshtml');
var tools = require('../lib/tools');
var assert = require('assert');

var whitespaceRegex = /\s+/g;

describe('assertViews', directoryTest(path.normalize(__dirname + '/../examples'), {}));


function directoryTest(rootPath, rootOptions){
	if(fs.existsSync(rootPath + '.json')){
		rootOptions = tools.extend({}, rootOptions, require(rootPath + '.json'));
	}

	return function(){
		fs.readdirSync(rootPath).forEach(function(subPath) {
			var filePath = path.join(rootPath, subPath);
			var fileStat = fs.statSync(filePath);
			var fileMatch = /^(.+)\.html$/.exec(filePath);

			if(fileStat.isDirectory()) {
				describe(subPath, directoryTest(filePath, rootOptions));
			}
			if(fileStat.isFile() && fileMatch) {
				it(subPath, fileTest(fileMatch, rootOptions));
			}
		});
	}
}

function fileTest(fileMatch, fileOptions){
	if(fs.existsSync(fileMatch[1] + '.json')){
		fileOptions = tools.extend({}, fileOptions, require(fileMatch[1] + '.json'));
	}

	return function(cb){
		var expect = fs.readFileSync(fileMatch[1] + '.html', 'utf-8');
		var actual = '';
		function write(){
			var argumentCount = arguments.length;
			for(var argumentIndex = 0; argumentIndex < argumentCount; argumentIndex++){
				var argument = arguments[argumentIndex];
				actual += tools.str(argument);
			}
		}
		function end(){
			write.apply(this, arguments);

			expect = expect.replace(whitespaceRegex, '');
			actual = actual.replace(whitespaceRegex, '');

			assert.equal(actual, expect);

			cb();
		}

		jshtml.renderAsync(write, end, fs.readFileSync(fileMatch[1] + '.jshtml', 'utf-8'), fileOptions);
	}
}



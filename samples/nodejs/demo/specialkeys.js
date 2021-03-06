'use strict';

var util = require('./common.js');

var rd = require('rd'),
    fs = require('fs'),
    keyArrays = [],
    notFoundKeyData = '',
    commonPath = 'D:\\Workspace\\Projects-IPTV5(SH)\\iptv5\\app\\src\\resources\\',
    userKeys = getFileContentDirectory(fs, commonPath + "app\\", "user.properties"),
    projects = util.getDirectoryFolderNames(commonPath),
    projectsKeyObject = {};

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
	for (var _iterator = projects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
		var project = _step.value;

		projectsKeyObject[project] = getFileContentDirectory(fs, commonPath + project + '\\', "user.properties");
	}
} catch (err) {
	_didIteratorError = true;
	_iteratorError = err;
} finally {
	try {
		if (!_iteratorNormalCompletion && _iterator.return) {
			_iterator.return();
		}
	} finally {
		if (_didIteratorError) {
			throw _iteratorError;
		}
	}
}

rd.read(__dirname + '/', function (err, files) {
	if (err) throw err;

	files.filter(function (fileItem) {
		console.log(fileItem);
		return fileItem.includes('.jsp');
	}).forEach(function (fileItem) {
		var fileContentString = fs.readFileSync(fileItem, "utf-8").toString(),
		    specialKeyCount = 0,
		    fileKeyStrings = [''];
		fileKeyStrings.index = 0;

		while (fileKeyStrings && "length" in fileKeyStrings) {
			fileContentString = fileContentString.slice(fileKeyStrings[0].length + fileKeyStrings.index);
			fileKeyStrings = new RegExp('key=".*?"', "g").exec(fileContentString);
			if (fileKeyStrings && "length" in fileKeyStrings) {
				var keyString = fileKeyStrings[0].split('"')[1];
				if (keyArrays.indexOf(keyString) === -1 && !userKeys.hasOwnProperty(keyString)) {
					keyArrays[keyArrays.length] = keyString;
					specialKeyCount++;
					if (specialKeyCount === 1) {
						notFoundKeyData += '\n\n\n' + fileItem;
					}
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = projects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var _project = _step2.value;

							if (projectsKeyObject[_project].hasOwnProperty(keyString)) {
								notFoundKeyData += '\n' + ('########### ' + _project + ' ###########: ' + keyString + '=' + projectsKeyObject[_project][keyString]);
							}
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					notFoundKeyData += '\n' + keyString;
				}
			}
		}
	});
	// console.log(keyArrays);
	util.writeDataToFile(__dirname + '\\notfoundkeydetail.txt', notFoundKeyData);
});

function getFileContentDirectory(fs, dir, fileName) {
	var sourceString = fs.readFileSync(dir + fileName).toString(),
	    fileContentObject = {};
	sourceString.split(/\n/).filter(function (item) {
		return item.trim().split('=').length > 1;
	}).forEach(function (value) {
		var line = value.trim().split('=');
		fileContentObject[line[0]] = line.length === 2 ? line[1] : value.trim().slice(line[0].length + 1);
	});
	return fileContentObject;
}

//# sourceMappingURL=specialkeys.js.map
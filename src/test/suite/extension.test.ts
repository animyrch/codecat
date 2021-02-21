import * as assert from 'assert';
import * as fs from 'fs';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('file opening', async () => {
		const created = await createXcatFile();
		console.log(created);
		const content = await readXcatFile();
		console.log(content);
	});
});

const createXcatFile = () => {
	return new Promise((resolve, reject) => {
		fs.writeFile('newfile.txt', 'Learn Node FS module', function (err) {
			if (err) {
				reject(err);
			}
			resolve('File is created successfully.');
		});
	});
}

const readXcatFile = () => {
	return new Promise((resolve, reject) => {
		fs.readFile('newfile.txt', 'utf8' , (err, data) => {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
}
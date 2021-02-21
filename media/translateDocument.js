// @ts-check

// Script run within the webview itself.
(function () {
	console.log('starts script');

	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore
	const vscode = acquireVsCodeApi();

	const editorContainer = /** @type {HTMLElement} */ (document.querySelector('.editor-body'));

	
	const translationBox = document.getElementById('current-translation-segment');
	console.log('before addevent');
	translationBox.addEventListener('submit', (e) => {
		e.preventDefault();
		const enteredText = document.getElementsByTagName('input');
		vscode.postMessage({ type: 'update', value: enteredText[0].value });
		console.log('posted update');
	});

	/**
	 * Render the document in the webview.
	 */
	function updateContent(/** @type {string} */ text) {
			editorContainer.innerText = text;
			
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				console.log('before update');
				const text = message.text;

				// Update our webview's content
				updateContent(text);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({ text });

				return;
		}
	});

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}
}());
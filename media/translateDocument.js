// @ts-check

// Script run within the webview itself.
(function () {
	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore
	const vscode = acquireVsCodeApi();

	addEventListenerForSubmitAction();
	addEventListenerForExtensionMessage();

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}

	function addEventListenerForSubmitAction() {
		const translationBox = document.getElementById('current-translation-segment');
		const enteredText = document.getElementsByTagName('textarea');
		translationBox.addEventListener('submit', (e) => {
			e.preventDefault();
			vscode.postMessage({ type: 'update', value: enteredText[0].value });
		});
	}

	function addEventListenerForExtensionMessage() {
		// Handle messages sent from the extension to the webview
		window.addEventListener('message', event => {
			const message = event.data; // The json data that the extension sent
			switch (message.type) {
				case 'update':
					const text = message.text;

					// Update our webview's content
					updateContent(text);

					// Then persist state information.
					// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
					vscode.setState({ text });

					return;
			}
		});
	}

	
	/**
	 * Render the document in the webview.
	 */
	function updateContent(/** @type {string} */ text) {
		const translationParts = processText(text);
		const translatedContainer = /** @type {HTMLElement} */ (document.querySelector('#editor-body-translated'));
		const translationContainer = /** @type {HTMLElement} */ (document.querySelector('#editor-body-translation'));
		const remainingContainer = /** @type {HTMLElement} */ (document.querySelector('#editor-body-remaining'));
		translatedContainer.innerText = translationParts.translated;
		translationContainer.innerHTML = `<textarea id="editor-body-translation-area">${translationParts.translation}</textarea>`;
		remainingContainer.innerText = translationParts.remaining;
	}

	function processText(/** @type {string} */ text) {
		const segments = text.split('\n');
		const translationParts = {
			translated: [].join('\n'),
			translation: segments[0],
			remaining: segments.slice(1, segments.length).join('\n')
		};
		return translationParts;
	}
}());
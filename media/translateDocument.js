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
		translationBox.addEventListener('submit', (e) => {
			e.preventDefault();
			const currentTranslationIndex = /** @type {HTMLElement} */ (document.querySelector('#editor-translation-index'));
			
			const enteredText = document.getElementsByTagName('textarea');
			const newText =
				enteredText[0].value +
				(currentTranslationIndex.innerText === '0' ? '' : '\n') +
				enteredText[1].value +
				enteredText[2].value;
			currentTranslationIndex.innerText = JSON.stringify(parseInt(currentTranslationIndex.innerText) + 1);
			vscode.postMessage({
				type: 'update',
				newText
			});
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
		const enteredText = document.getElementsByTagName('textarea');
		enteredText[0].value = translationParts.translated;
		enteredText[1].value = translationParts.translation === null ? '' : translationParts.translation;
		enteredText[2].value = translationParts.remaining;
	}

	function processText(/** @type {string} */ text) {
		const segments = text.split('\n');
		const currentTranslationIndex = /** @type {HTMLElement} */ (document.querySelector('#editor-translation-index'));
		const currentTranslationIndexCounter = parseInt(currentTranslationIndex.innerText);
		const translatedParts = segments.slice(0, currentTranslationIndexCounter);
		const partsToBeTranslated = segments.slice(currentTranslationIndexCounter + 1, segments.length);
		const translationParts = {
			translated: translatedParts.join('\n'),
			translation: !segments[currentTranslationIndexCounter] ? null : segments[currentTranslationIndexCounter],
			remaining: partsToBeTranslated.length === 0 ? '' : '\n' + partsToBeTranslated.join('\n')
		};
		
		const enteredText = document.getElementsByTagName('textarea');
		enteredText[0].rows = translatedParts.length + 3;
		enteredText[2].rows = partsToBeTranslated.length + 4;

		return translationParts;
	}
}());
import * as vscode from 'vscode';
import * as path from 'path';
import { getNonce } from './util';

/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class TranslateDocumentEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new TranslateDocumentEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(TranslateDocumentEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'codecat.translateDocument';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				this.updateWebview(webviewPanel, document);
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'update':
					this.updateTextDocument(document, e.newText);
					return;
			}
		});

		this.updateWebview(webviewPanel, document);
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.file(
			path.join(this.context.extensionPath, 'media', 'translateDocument.js')
		));

		const styleMainUri = webview.asWebviewUri(vscode.Uri.file(
			path.join(this.context.extensionPath, 'media', 'main.css')
		));
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet" />

				<title>Translate Document</title>
			</head>
			<body>
				<div id="editor-translation-index">0</div>
				<div class="editor-body">
					<div id="editor-body-translated">
						<textarea class="hidden-editor-area" disabled></textarea>
					</div>

					<form id="current-translation-segment">
						<div class="editor-body-translation">
							<textarea id="editor-body-translation-area-source" class="disabled-editor-area" disabled></textarea>
						</div>
						<div class="editor-body-translation">
							<textarea id="editor-body-translation-area-target"></textarea>
							<br>
							<input class="button" type="submit" value="Go To Next Segment">
						</div>
					</form>

					<div id="editor-body-remaining">
						<textarea rows="20" class="hidden-editor-area" disabled></textarea>
					</div>
				</div>
				
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	private updateWebview(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument) {
		webviewPanel.webview.postMessage({
			type: 'update',
			text: document.getText(),
		});
	}
	/**
	 * Write out the translation to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, translation: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			translation);

		return vscode.workspace.applyEdit(edit);
	}

}

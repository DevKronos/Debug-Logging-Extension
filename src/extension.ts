import * as vscode from 'vscode';

let copiedVariables: string[] = [];

export function activate(context: vscode.ExtensionContext) {
	// Activate extension

	console.log('Logging plugin activated');

	let insertPrintCommand = vscode.commands.registerCommand('manualDebugLogging.insertPrint', insertPrint);

	let insertArrayPrintCommand = vscode.commands.registerCommand('manualDebugLogging.insertArrayPrint', insertArrayPrint);

	let insertMultiplePrintsCommand = vscode.commands.registerCommand('manualDebugLogging.insertMultiplePrints', insertMultiplePrints);

	let trackCopyCommand = vscode.commands.registerCommand('manualDebugLogging.trackCopy', trackCopy);

	context.subscriptions.push(insertPrintCommand, insertArrayPrintCommand, insertMultiplePrintsCommand, trackCopyCommand);
}

async function insertPrint() {
	// Insert code to print the value of the last copied variable

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor');
		return;
	}
	
	const clipboardText = await vscode.env.clipboard.readText();
	if (!clipboardText.trim()){
		vscode.window.showWarningMessage('Clipboard is empty');
		return;
	}
	
	const variableName = cleanVariableName(clipboardText);
	if (!variableName) {
        vscode.window.showWarningMessage('Could not extract variable name from clipboard');
        return;
    }

	const printCode = generatePrintCode(variableName, editor);
	await editor.edit(editBuilder => {
		const position = editor.selection.active;
		editBuilder.insert(position, printCode);
	});
}

async function insertArrayPrint() {
	// Insert code to print the content of the last copied array variable

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor');
		return;
	}

	const clipboardText = await vscode.env.clipboard.readText();
	if (!clipboardText.trim()) {
		vscode.window.showErrorMessage('Clipboard is empty');
		return;
	}

	const variableName = cleanVariableName(clipboardText);
	if (!variableName) {
        vscode.window.showWarningMessage('Could not extract variable name from clipboard');
        return;
    }

	const printCode = generateArrayPrintCode(variableName, editor);

	await editor.edit(editBuilder => {
		const position = editor.selection.active;
		editBuilder.insert(position, printCode);
	})
}

async function insertMultiplePrints() {
	// Insert code for multiple print variables according to selected in the drop-down menu

    const editor = vscode.window.activeTextEditor;
        
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    if (copiedVariables.length > 0) {
        const selectedVars = await showVariableSelector();
        if (selectedVars && selectedVars.length > 0) {
            await generateMultiplePrintCode(editor, selectedVars);
        }
    } else {
        vscode.window.showInformationMessage('Copy variables to add them in buffer');
    }
}

function trackCopy() {
	// Track copying variables and add them in buffer

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor');
		return;
	}

	const selection = editor.selection;
	const selected = editor.document.getText(selection);

	const variableName = cleanVariableName(selected);
	if (!variableName) {
        vscode.window.showWarningMessage('Could not extract variable name from clipboard');
        return;
    }

	addToBuffer(variableName);

    vscode.window.showInformationMessage(`Variable ${variableName} is added in buffer`);
}

function generatePrintCode(variableName: string, editor: vscode.TextEditor): string {
	// Generate print code for single variable

	const language = getCurrentLanguage(editor);
	const indent = getIndent(editor);

	const config = vscode.workspace.getConfiguration('manualDebugLogging');
	const customTemplate = config.get<string>('customVariableTemplate', '');

	if (customTemplate) {
		return customTemplate.replace(/{variable}/g, variableName) + `\n${indent}`;
	}

	switch (language) {
		case 'javascript':
        case 'typescript':
            return `console.log('${variableName}:', ${variableName});\n${indent}`;
        case 'python':
            return `print(f"${variableName}: {${variableName}}")\n${indent}`;
        case 'java':
            return `System.out.println("${variableName}: " + ${variableName});\n${indent}`;
		case 'cpp':
			return `std::cout << "${variableName}: " << ${variableName} << std::endl;\n${indent}`;
		case 'csharp':
			return `Console.WriteLine("${variableName}: " + ${variableName});\n${indent}`;
		default:
			return `std::cout << "${variableName}: " << ${variableName} << std::endl;\n${indent}`;
	}
}

function generateArrayPrintCode(arrayName: string, editor: vscode.TextEditor): string {
	// Generate print code for array variable

	const language = getCurrentLanguage(editor);
	const indent = getIndent(editor);

	const config = vscode.workspace.getConfiguration('manualDebugLogging');
	const customTemplate = config.get<string>('customArrayTemplate', '');

	if (customTemplate) {
		return customTemplate.replace(/{array}/g, arrayName) + `\n${indent}`;
	}

	switch (language) {
		case 'javascript':
		case 'typescript':
			return `console.log('${arrayName}:');\n` + 
					`${indent}let output = '';\n` + indent +
					`${indent}for(const item of ${arrayName}) {\n` +
					`${indent}\toutput += item + ' ';\n` + 
					`${indent}}\n` +
					`${indent}console.log(output);\n`;
		case 'python':
			return `print("${arrayName}:")\n`+ 
					`${indent}for item in ${arrayName}:\n` +
					`${indent}\tprint(item, end=" ")\n` +
					`${indent}print()\n`;
		case 'java':
			return `System.out.println("${arrayName}: ");\n` +  
					`${indent}for (var item : ${arrayName}) {\n` + 
					`${indent}\tSystem.out.print(item + " ");\n` + 
					`${indent}}\n` + 
					`${indent}System.out.println();\n`;
		case 'cpp':
			return `std::cout << "${arrayName}: " << std::endl;\n` +  
					`${indent}for (int i = 0; i < ${arrayName}.size(); ++i) {\n` + 
					`${indent}\tstd::cout << ${arrayName}[i] << " ";\n` + 
					`${indent}}\n` + 
					`${indent}std::cout << std::endl;\n`;
		case 'csharp':
			return `Console.WriteLine("${arrayName}: ");\n` + 
					`${indent}foreach (var item in ${arrayName}) {\n` + 
					`${indent}\tConsole.Write(item + " ");\n` + 
					`${indent}}\n` + 
					`${indent}Console.WriteLine();\n`;
		default:
			return `std::cout << "${arrayName}: " << std::endl;\n` + 
					`${indent}for (int i = 0; i < ${arrayName}.size(); ++i) {\n` + 
					`${indent}\tstd::cout << ${arrayName}[i] << " ";\n` + 
					`${indent}}\n` + 
					`${indent}std::cout << std::endl;\n`;
	}
}

async function generateMultiplePrintCode(editor: vscode.TextEditor, variables: string[]): Promise<void> {
	// Generate print code for multiple variable

    let printCode = '';
    
    for (const variable of variables) {
        printCode += generatePrintCode(variable, editor);
    }
    
    await editor.edit(editBuilder => {
        const position = editor.selection.active;
        editBuilder.insert(position, printCode);
    });
}


function addToBuffer(variableName: string): void {
	// Add copied variable to buffer

    copiedVariables = copiedVariables.filter(v => v !== variableName);

    copiedVariables.unshift(variableName);

	const config = vscode.workspace.getConfiguration('manualDebugLogging'); 
	const maxSize = config.get('maxBufferSize', 10);

    if (copiedVariables.length > maxSize) {
        copiedVariables = copiedVariables.slice(0, maxSize);
    }
}

async function showVariableSelector(): Promise<string[]> {
	// Show drop-down menu to select variables

    if (copiedVariables.length == 0) {
        return [];
    }
    
    interface VariableQuickPickItem extends vscode.QuickPickItem {
        variable: string;
    }
    
    const items: VariableQuickPickItem[] = copiedVariables.map((variable, index) => ({
        label: `$(symbol-variable) ${variable}`,
        description: `Variable #${index + 1}`,
        variable: variable
    }));
    
    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select variables to print',
        canPickMany: true
    });
    
    return selected ? selected.map(item => item.variable) : [];
}

function cleanVariableName(text: string): string {
	// Clean copied text and check if it is valid name for variable

    if (!text) {
        return '';
    }
    
    let cleaned = text.trim();

    cleaned = cleaned.replace(/['"`,;]/g, '');
    
    if (cleaned.includes('=')) {
        cleaned = cleaned.split('=')[0].trim();
    }

    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(cleaned)) {
        return cleaned;
    }
    
    return '';
}

function getIndent(editor: vscode.TextEditor): string {
	// Get current line's indent

	const document = editor.document;
    const position = editor.selection.active;
    const currentLine = document.lineAt(position.line);
    
    const lineText = currentLine.text;
    const indentMatch = lineText.match(/^(\s*)/);
    return indentMatch ? indentMatch[1] : '';
}

function getCurrentLanguage(editor: vscode.TextEditor): string {
	// Get current language

	const languageId = editor.document.languageId;

	const languageMap: {[key: string]: string} = {
		'javascript': 'javascript',
		'typescript': 'typescript',
		'python': 'python',
		'java': 'java',
		'cpp': 'cpp',
		'csharp': 'csharp'
	}

	return languageMap[languageId] || 'cpp';
}

export function deactivate(): void {
	// deactivate extension

	console.log('Logging plugin deactivated');
}

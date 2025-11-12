# Documentation

## Content
- [General Info](#Info)
- [Features](#Features)
- [Supported Language](#supported-languages)
- [KeyBindings](#keybindings)
- [Requirements](#Requirements)
- [Release Notes](#Release_Notes)

# Info
A VS Code extension to quickly insert `console.log()` statements for copied variables, arrays, and multiple selections.

## Features

### 1. Insert variable log

According file's language, insert code to log the last copied variable. Triggered by pressing `Ctrl+Shift+V` (or `Cmd+Shift+V` on macOS).

**Example:**
 1. Copy a variable name from your code.
    ```js
    const user = "Alice";
    ```
2. Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on macOS).
3. A debug statement will be inserted at your cursor position, using the language of your file.
    ```js
    console.log('user: ', user);
    ```

### 2. Insert array variable log

According file's language, insert code to log the last copied array variable. Triggered by pressing `Ctrl+Shift+A` (or `Cmd+Shift+A` on macOS).

**Example:**
 1. Copy the name of an array variable (e.g., `users`, `data`, `list`).
    ```js
    const items = [1, 2, 3];
    ```
2. Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on macOS).
3. A formatted loop will be inserted to print each element of the array.
    ```js
    console.log('items:');
    let output = '';
    for(const item of items) {
        output += item + ' ';
    }
    console.log(output);
    ```

### 3. Track Variables in Buffer

Track copying variables, clean them, check if it is valid variable name and add them in buffer. Triggered by pressing `Ctrl+Shift+C` (or `Cmd+Shift+C` on macOS).

**Example:**
1. Select any variable name in your code.
2. Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on macOS).
3. The variable name is added to a temporary buffer for later use.

### 4. Log Multiple Variables

Insert code for multiple print variables according to selected in the drop-down menu. Triggered by pressing `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).

**Example:**
1. After tracking several variables, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
2. A menu will appear showing all saved variables.
3. Select one or more variables — a log statement will be inserted for each.

## Supported Languages

The extension automatically detects your file’s language and generates the correct logging syntax:

- JavaScript / TypeScript: Uses `console.log()`
- Python: Uses `print()` with f-string formatting
- Java: Uses `System.out.println()`
- C++: Uses `std::cout`
- C#: Uses `Console.WriteLine()`

## Settings

You can customize the behavior of the extension through VS Code settings:

### Custom Variable Template
A parameter defines format of logging in cases single variable and multiple variables logging. Parameter's type is a string. Must be used `{variable}` as placeholder in template that you want to use instead of default log format.

**Example:**
1. Open settings and set default value in `customVariableTemplate`
    ```json
    manualDebugLogging.customVariableTemplate {
        ...
        "default": "console.log('{variable}=', {variable});"  // Custom template
        ...
    }
    ```
2. Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on MacOs) and now you have your own format of logging
    ```js
    console.log('var1=', var1); //instead of console.log('var1: ', var1);
    ```

### Custom Array Template
A parameter defines format of logging in cases array variable. Parameter's type is a string. Must be used `{array}` as placeholder in template that you want to use instead of default log format.

**Example:**
1. Open settings and set default value in `customArrayTemplate`
    ```json
    manualDebugLogging.customArrayTemplate {
        ...
        "default": "console.log(\"{array}'s first value=\", {array}[0]);"  // Custom template
        ...
    }
    ```
2. Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on MacOs) and now you have your own format of logging
    ```js
    console.log("arr1's first value=", arr1[0]); 
    /* instead of 
    console.log('arr1:'); 
	let output = '';
	for(const item of arr1) {
	    output += item + ' ';
    }
	console.log(output);
    */
    ```

### Max Buffer Size
A parameter defines maximal size of copied variables' buffer. A parameter's type is a integer.

## Keybindings

| Command | Windows/Linux | macOS |
|--------|---------------|-------|
| Insert Print for Copied Variable | `Ctrl+Shift+V` | `Cmd+Shift+V` |
| Insert Print for Array | `Ctrl+Shift+A` | `Cmd+Shift+A` |
| Insert Print for Multiple Variables | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Track Copied Variable in Buffer | `Ctrl+Shift+C` | `Cmd+Shift+C` |

## Requirements

- VS Code version 1.67.0 or higher

## Release Notes

### 1.0.0
- Initial release

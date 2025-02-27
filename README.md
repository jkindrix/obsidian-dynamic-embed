# Obsidian Dynamic Embed

Embed snippets, templates, and any linkables by delegating the current scope to the embedded file, treating them as content instead of references, contrary to the integrated tag `![[]]`.

## Features
- **Embed Single Files:** Include the contents of a specific file.
- **Embed Multiple Files by Prefix:** Automatically include all markdown files that start with a given prefix.
- **Sorting Options:** Sort embedded files by name, created date, modified date, or in reverse order.

## Example
### **Embed a Single File**
Import the contents of file ***`Script-note-template file name link.md`***, existing in the active vault.
Note that the link syntax does **not** support heading/block links (e.g. `[[file#heading1]]`):
~~~
```dynamic-embed
[[Script-note-template file name link]]
```
~~~

### **Embed All Files with a Prefix**
~~~
```dynamic-embed
prefix:notes-
```
~~~
This will embed all markdown files starting with `notes-`.

### **Sorting Options**
Specify a sorting method inside the code block:
~~~
```dynamic-embed
prefix:notes-
sort:name    # Sort by name (default)
```
~~~
~~~
```dynamic-embed
prefix:notes-
sort:created    # Sort by created date (oldest first)
```
~~~
~~~
```dynamic-embed
prefix:notes-
sort:modified   # Sort by last modified date (oldest first)
```
~~~
~~~
```dynamic-embed
prefix:notes-
sort:reverse    # Reverse order
```
~~~


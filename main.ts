import { Plugin, MarkdownRenderer, TFile } from "obsidian";

export default class DynamicEmbed extends Plugin {
    static codeBlockKeyword = "dynamic-embed";
    static containerClass = "dynamic-embed";
    static errorClass = "dynamic-embed-error";

    static displayError = (parent: HTMLElement, text: String) => {
        parent.createEl("pre", { text: "Dynamic Embed: Error: " + text, cls: [DynamicEmbed.containerClass, DynamicEmbed.errorClass] });
    }

    async onload() {
        this.registerMarkdownCodeBlockProcessor(DynamicEmbed.codeBlockKeyword, async (source, el, ctx) => {
            const filePattern = /\[\[([^\[\]]+?)\]\]/u;
            const prefixPattern = /^prefix:(.+)/;

            const fileMatch = filePattern.exec(source);
            const prefixMatch = prefixPattern.exec(source.trim());

            if (fileMatch) {
                // Case 1: Single file embed
                const fileName = fileMatch[1];
                await this.embedSingleFile(fileName, el, ctx);
            } else if (prefixMatch) {
                // Case 2: Embed all files with prefix
                const prefix = prefixMatch[1].trim();
                await this.embedFilesByPrefix(prefix, el, ctx);
            } else {
                DynamicEmbed.displayError(el, "Invalid format. Use [[file]] or prefix:prefix_name");
            }
        });
    }

    async embedSingleFile(fileName: string, el: HTMLElement, ctx: any) {
        const matchingFile = this.app.metadataCache.getFirstLinkpathDest(fileName, "");

        if (!matchingFile) {
            DynamicEmbed.displayError(el, `File '${fileName}' not found`);
            return;
        }

        if (matchingFile.extension !== "md") {
            DynamicEmbed.displayError(el, `Invalid file extension for '${fileName}', expected markdown`);
            return;
        }

        const fileContents = await this.app.vault.cachedRead(matchingFile);
        const container = el.createDiv({ cls: [DynamicEmbed.containerClass] });
        MarkdownRenderer.renderMarkdown(fileContents, container, ctx.sourcePath, this);
    }

    async embedFilesByPrefix(prefix: string, el: HTMLElement, ctx: any) {
        const lines = ctx.getSectionInfo(el)?.text.split("\n") || [];
        let sortOption = "name"; // Default sorting method

        for (const line of lines) {
            const match = line.match(/^sort:\s*(\S+)/);
            if (match) {
                sortOption = match[1].trim().toLowerCase();
                break;
            }
        }

        const files = this.app.vault.getFiles();
        let matchingFiles = files.filter((file) => file.name.startsWith(prefix) && file.extension === "md");

        if (matchingFiles.length === 0) {
            DynamicEmbed.displayError(el, `No markdown files found with prefix '${prefix}'`);
            return;
        }

        // Sort files based on user selection
        switch (sortOption) {
            case "name":
                matchingFiles.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "created":
                matchingFiles.sort((a, b) => a.stat.ctime - b.stat.ctime);
                break;
            case "modified":
                matchingFiles.sort((a, b) => a.stat.mtime - b.stat.mtime);
                break;
            case "reverse":
                matchingFiles.reverse();
                break;
            default:
                DynamicEmbed.displayError(el, `Invalid sort option: '${sortOption}'`);
                return;
        }

        let combinedContent = "";

        for (const file of matchingFiles) {
            const content = await this.app.vault.cachedRead(file);
            combinedContent += `# ${file.name}\n\n${content}\n\n---\n\n`;
        }

        const container = el.createDiv({ cls: [DynamicEmbed.containerClass] });
        MarkdownRenderer.renderMarkdown(combinedContent, container, ctx.sourcePath, this);
    }
}

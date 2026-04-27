import { ExtensionContext, Uri, workspace } from "vscode";
import { lookupTable } from "./table";

export class LectureNotesRetriever {
    constructor (private readonly context: ExtensionContext) {}

    public async retrieve(index: number): Promise<string> {
        console.log("Retrieve called with", index);
        try {
            const [chapter, file] = this.indexToChapterFile(index);
            const data = await workspace.fs.readFile(this.fileUri(chapter, file));
            const text = Buffer.from(data).toString('utf8');
            return text;
        } catch (err: any) {
            console.error(err);
            return `Could not load file from index ${index}`;
        }
    }

    private fileUri(chapter: string, file: string): Uri {
        return Uri.joinPath(this.context.extensionUri, "resources", "lecture-notes", chapter, `${file}.txt`);
    }

    private indexToChapterFile(index: number): [string, string] {
        const entry = lookupTable.at(index);
        if (entry === undefined) { throw new Error(`[indexToChapterFile] No entry found with index ${index}.`); }
        return entry;
    }
}

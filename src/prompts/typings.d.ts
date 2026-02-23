// This makes sure that we can import the contents of .txt files in
// typescript. The content will be of type string.
declare module '*.txt' {
    const content: string;
    export default content;
}
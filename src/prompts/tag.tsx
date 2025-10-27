import { PromptElement, PromptElementProps } from "@vscode/prompt-tsx";

export type TagProps = PromptElementProps<{
	name: string;
    metadata?: Array<[string, string]>;
}>;

export class Tag extends PromptElement<TagProps> {
	render() {
		const { name, metadata } = this.props;
        const metadataString = metadata === undefined ? "" : metadata.map(([k, v]) => `${k}="${v}"`).join(" ");

		return (
			<>
				{'<' + name + (metadata === undefined ? "" : " ") + metadataString + '>'}<br/>
				<>
					{this.props.children}<br/>
				</>
				{'</' + name + '>'}<br/>
			</>
		);
	}
}
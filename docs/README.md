## Using a local version of the River extension
Clone [waterproof-vscode](https://www.github.com/impermeable/waterproof-vscode) and switch to the `api` branch.

The easiest way is to now build and install *this* extension by running:
```bash
npx vsce package
code --install-extension waterproof-river-[version].vsix
```

Or in one go:
```bash
npx vsce package  && code --install-extension waterproof-river-[version].vsix
```

This will install the extension into VSCode. Then run the extension from the **waterproof-vscode** repository using the `Run Extension (Disable only coq-lsp)` launch task. This can be done by going to the launch and debug panel on the left hand side and switching the dropdown in this panel from `Run Extension` to `Run Extension (Disable only coq-lsp)`. After doing this once, future launches using for example the `F5` key binding will launch the extension with all extensions except coq-lsp active. Since this extension was installed you can now chat with the `@River` chat participant.
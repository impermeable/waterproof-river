# River 

AI assistant for the [waterproof-vscode](https://www.github.com/impermeable/waterproof-vscode) extension.

## Installation

Install the [Waterproof](https://www.github.com/impermeable/waterproof-vscode) extension for VSCode by following the instructions there. Once installed and working, install [this extension](https://www.github.com/impermeable/river) alongside Waterproof. 

# Recommended usage

> [!CAUTION]
> River uses experimental AI technology and makes mistakes. Think critically about the information it provides.

To use River effectively in your learning process we think it is important to read through these intructions with care and try to adopt the following
usage patterns.

River can help you with Waterproof by giving a hint or by fixing syntax errors.

## Before you ask River for help

- The use of River in this course is a pilot, and we will need to learn lessons along the way (we are extremely happy with [feedback](#feedback)!).
  It will probably be quite helpful in fixing syntax mistakes.
  It may at times be helpful to give you an idea when you're stuck.
  Our intention is that it acts as a scaffold, and helps you out in early stages when 
  learning to deal with Waterproof and with giving proofs in general.
  Eventually, it is very important that you learn how to prove statements without this additional support.
  Please consider this in the way you are using River.
  In particular, we believe there's a lot of value in being stuck for a while on proving a mathematical statement.
- When you want River's help, make sure your cursor is on the position you want help on.
- To interact with River, you need to open the chat in vscode. You would need a GitHub account with [GitHub Copilot](https://github.com/features/copilot) activated. 
- Note that River uses experimental AI technology and can, and will, make mistakes.
  Always think very critically about the information it provides. 


## Two ways of asking River for help

### 1. Using commands

- `@River /hint` tells River that you want a hint.
- `@River /syntaxHelp` directly tells River that you want help with the syntax.

### 2. Freeform chat

- `@River Can you give me a hint for the current proof?`
- `@River What is the syntax error in this file?`
- `@River What would be a good next step?`

and other questions will all yield a response from River. To help you, River can try running some of the commands, such as `/hint` or `/syntaxHelp` by itself, for which you need to give permission. Note that permission can be given for a certain workspace/file, so that as long as you work in the same workspace/file you don't have to give permission again.

## Alternatives to using River

- Just write `Help.` in Waterproof, and Waterproof will try to give you a hint on how to continue. You can also use the `Help` panel in Waterproof.
- For spotting syntax mistakes, the syntax coloring is very helpful. If something is spelled incorrectly, it won't get colored as a Waterproof tactic (blue).
- Ask an instructor. They are always happy to help you. Moreover, their feedback is the best.

# Feedback

If you encounter anything strange, remarkable, frustrating, fun, silly, upsetting, exciting with River, please let us know! On Canvas, you can drop screenshots, paste text of your conversation. The more info you share, the more useful it is to making the product better. 


# Developers

Development instructions can be found [here](/docs/README.md)

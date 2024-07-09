# Llama Parse CLI

A non-official command-line interface (CLI) for parsing documents using the LlamaIndex Parser.

## Installation

To install the llama-parse-cli, you need to have Node.js and npm installed on your system. Then, you can install it globally using:

```sh
npm install -g llama-parse-cli
```

## Usage

The CLI provides two main commands: `auth` and `parse`.

### Authentication

Before using the parse functionality, you need to authenticate with your API key:

```sh
llama-parse auth
```

This command will prompt you to enter your API key, which should start with "llx-". The key will be securely stored in `~/.llama-parse/config.json`.

### Parsing Documents

To parse a document, use the `parse` command:

```sh
llama-parse parse <file> [options]
```

#### Options:

- `-f, --format <format>`: Output format (json, markdown, text). Default: markdown
- `-o, --output <output>`: The output file
- `-ol, --ocr-language <ocr-language>`: The language of the document
- `-pi, --parsing-instructions <parsing-instructions>`: The parsing instructions
- `-ps, --page-separator <page-separator>`: The page separator
- `-sd, --skip-diagonal-text`: Skip diagonal text
- `-ic, --invalidate-cache`: Invalidate cache
- `-dc, --do-not-cache`: Do not cache
- `-dnc, --do-not-unroll-columns`: Do not unroll columns
- `-fm, --fast-mode`: Fast mode
- `-gpt4o, --gpt-4o`: Use GPT-4o
- `-tp, --target-pages <target-pages>`: The target pages (comma-separated list, starting from 0)
- `-v, --verbose`: Verbose mode

## Examples

1. Parse a PDF file and output in markdown format:
```sh
llama-parse parse example/sample-pdf.pdf
```

2. Parse a document and save the output to a file:
```sh
llama-parse parse example/sample-pdf.pdf -o output.md
```

3. Parse specific pages of a document:
```sh
llama-parse parse example/sample-pdf.pdf -tp 0
```

4. Parse a document in verbose mode:
```sh
llama-parse parse example/sample-pdf.pdf -v
```

## Development

The project is built using TypeScript and uses the following key dependencies:

- Commander.js for CLI argument parsing
- Zod for input validation
- Inquirer for interactive prompts
- Ora for spinner animations
- Chalk for colorful console output

To set up the development environment:

1. Clone the repository
2. Run `pnpm install` to install dependencies
3. Use `pnpm dev` to run the CLI in development mode
4. Use `pnpm build` to build the project
5. Use `pnpm link .` to link the CLI globally

The main entry point is in `src/index.ts`:

```ts
#!/usr/bin/env node
import { version } from "../package.json";
import { program } from "commander";
import { createAuthCommand, createParseCommand } from "./commands";

program
  .name("llama-parse")
  .addCommand(createAuthCommand())
  .addCommand(createParseCommand())
  .description("A CLI for parsing documents with llama parse")
  .version(`${version}`);

program.parse(process.argv);
```

The CLI commands are defined in separate files under the `src/commands` directory:

```ts
export { createAuthCommand } from "./auth";
export { createParseCommand } from "./parse";
```

## Contributing

Contributions to the llama-parse-cli are welcome. Please ensure that your code adheres to the existing style and includes appropriate tests.

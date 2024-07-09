import fs from "node:fs";

import { Command } from "commander";
import { z } from "zod";
import ora from "ora";
import chalk from "chalk";
import { getApiKey } from "./auth";
import { Client, ParseOptions } from "../client";

function handleError(error: unknown): void {
  if (error instanceof z.ZodError) {
    console.error("Invalid options:");
    error.errors.forEach((err) => {
      console.error(` - ${err.path.join(".")}: ${err.message}`);
    });
  } else if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error("An unknown error occurred:", error);
  }
  process.exit(1);
}

const ParseCommandOptionsSchema = z.object({
  format: z.enum(["json", "markdown", "text"]).default("markdown"),
  ocrLanguage: z.string().optional(),
  parsingInstructions: z.string().optional(),
  pageSeparator: z.string().optional(),
  skipDiagonalText: z.boolean().default(false),
  invalidateCache: z.boolean().default(false),
  doNotCache: z.boolean().default(false),
  doNotUnrollColumns: z.boolean().default(false),
  fastMode: z.boolean().default(false),
  gpt4o: z.boolean().default(false),
  output: z.string().optional(),
  targetPages: z.string().optional(),
  verbose: z.boolean().default(false),
});

type ParseCommandOptions = z.infer<typeof ParseCommandOptionsSchema>;

export const createParseCommand = () =>
  new Command()
    .name("parse")
    .description("Parse documents with llama parse")
    .argument("[file]", "The file path to parse")
    .option("-f, --format <format>", "The format of the output", "markdown")
    .option("-o, --output <output>", "The output file")
    .option("-ol --ocr-language <ocr-language>", "The language of the document")
    .option(
      "-pi --parsing-instructions <parsing-instructions>",
      "The parsing instructions"
    )
    .option("-ps --page-separator <page-separator>", "The page separator")
    .option("-sd --skip-diagonal-text", "Skip diagonal text")
    .option("-ic --invalidate-cache", "Invalidate cache")
    .option("-dc --do-not-cache", "Do not cache")
    .option("-dnc --do-not-unroll-columns", "Do not unroll columns")
    .option("-fm --fast-mode", "Fast mode")
    .option("-gpt4o --gpt-4o", "Use GPT-4o")
    .option(
      "-tp --target-pages <target-pages>",
      "The target pages. Describe as a comma separated list of page numbers. The first page of the document is page 0"
    )
    .option("-v --verbose", "Verbose mode")
    .action(async (file: string, _options: ParseCommandOptions) => {
      if (!file || !fs.existsSync(file)) {
        console.error(chalk.red("File does not exist"));
        process.exit(1);
      }

      const spinner = ora("Parsing document...\n").start();

      try {
        const inputCommand = ParseCommandOptionsSchema.parse(_options);

        const options: ParseOptions = {
          output_format: inputCommand.format || "markdown",
          language: inputCommand.ocrLanguage,
          parsing_instruction: inputCommand.parsingInstructions,
          page_separator: inputCommand.pageSeparator,
          skip_diagonal_text: inputCommand.skipDiagonalText,
          invalidate_cache: inputCommand.invalidateCache,
          do_not_cache: inputCommand.doNotCache,
          do_not_unroll_columns: inputCommand.doNotUnrollColumns,
          fast_mode: inputCommand.fastMode,
          gpt4o_mode: inputCommand.gpt4o,
          target_pages: inputCommand.targetPages,
        };

        const apiKey = await getApiKey();
        const client = new Client(apiKey);

        if (inputCommand.verbose) {
          spinner.info("Sending request to llama parse API...");
        }

        const result = await client.parse(file, options, {
          onProgress: (progress) => {
            spinner.text = `Parsing document... ${progress.toFixed(2)}%`;
          },
        });

        const outputContent =
          inputCommand.format === "json"
            ? JSON.stringify(result.content, null, 2)
            : result.content;

        if (inputCommand.output) {
          await fs.promises.writeFile(
            inputCommand.output,
            outputContent as string
          );
          spinner.succeed(
            chalk.green(`Output saved to ${inputCommand.output}`)
          );
        } else {
          spinner.succeed("Parsing complete");
          console.log(chalk.cyan("\nParsed content:\n"));
          console.log(outputContent);
        }
      } catch (error) {
        spinner.fail("Parsing failed");
        handleError(error);
      }
    });

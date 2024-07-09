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

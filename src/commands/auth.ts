import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Command } from "commander";
import { z } from "zod";
import inquirer from "inquirer";

export const createAuthCommand = () =>
  new Command()
    .name("auth")
    .description("Authenticate with llama parse")
    .action(async () => {
      const answers = await inquirer.prompt<{ apiKey: string }>([
        {
          type: "password",
          name: "apiKey",
          message: "Enter your API key:",
          validate: (input) => {
            const result = z
              .string()
              .min(1, { message: "API key is required" })
              .startsWith("llx-", { message: "API key must start with 'llx-'" })
              .safeParse(input);
            if (!result.success) {
              return result.error.errors?.[0].message;
            }
            return true;
          },
        },
      ]);

      const homeDir = os.homedir();
      const configDir = path.join(homeDir, ".llama-parse");
      const configFile = path.join(configDir, "config.json");

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
      }

      const config = { apiKey: answers.apiKey };
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      console.log("API key saved successfully.");
    });

export const getApiKey = async (): Promise<string> => {
  const homeDir = os.homedir();
  const configDir = path.join(homeDir, ".llama-parse");
  const configFile = path.join(configDir, "config.json");

  if (!fs.existsSync(configFile)) {
    throw new Error("~/.llama-parse/config.json file not found");
  }
  const config = await fs.promises.readFile(configFile, "utf8");
  const { apiKey } = JSON.parse(config);

  if (!apiKey) {
    throw new Error("API key not found in ~/.llama-parse/config.json");
  }

  return apiKey;
};

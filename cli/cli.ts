#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { Server } from "./server";

yargs(hideBin(process.argv))
  .command(
    "listen",
    "Start the webhook server",
    {
      "webhook-secret": {
        type: "string",
        demandOption: true,
        description: "Secret for webhook validation",
      },
      url: {
        type: "string",
        demandOption: true,
        description: "URL to forward webhooks to",
      },
      port: {
        type: "number",
        default: 3000,
        description: "Port to run the server on",
      },
    },
    (argv) => {
      const server = new Server({
        webhookSecret: argv["webhook-secret"],
        webhookUrl: argv.url,
        port: argv.port,
      });
      server.listen();
    }
  )
  .help().argv;

const { createLogger, format, transports } = require("winston");
const { WinstonTransport } = require("@axiomhq/winston");
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");

require("dotenv").config();

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

const logger = createLogger({
  level: "debug",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json(),
    format.prettyPrint(),
    format.colorize()
  ),
  transports: [new transports.Console()],
});

if (["pilot", "production"].includes(process.env.NODE_ENV)) {
  logger.add(
    new WinstonTransport({
      token: process.env.AXIOM_TOKEN,
      orgId: process.env.AXIOM_ORG_ID,
      dataset: process.env.AXIOM_DATASET,
    })
  );

  logger.add(new LogtailTransport(logtail));
}

module.exports = logger;

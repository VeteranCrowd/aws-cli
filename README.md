# AWS CLI

A handy CLI commands that supports common AWS operations.

# Command Line Interface

```text
Usage: npm run cli --- [cli options] [options] [command]

Base CLI. Set paths to load dotenvs.

Options:
  -p, --paths <strings...>           space-delimited paths to dotenv directory
  -y, --dynamic-path <string>        dynamic variables path
  -o, --output-path <string>         consolidated output file (follows dotenv-expand rules using loaded env vars)
  -e, --environment <string>         environment name (follows dotenv-expand rules)
  -d, --defaultEnvironment <string>  default environment (follows dotenv-expand rules)
  -b, --branch-to-default            derive default environment from the current git branch (default: false)
  -n, --exclude-env                  exclude environment-specific variables (default: false)
  -g, --exclude-global               exclude global & dynamic variables (default: false)
  -r, --exclude-private              exclude private variables (default: false)
  -u, --exclude-public               exclude public variables (default: false)
  -z, --exclude-dynamic              exclude dynamic variables (default: false)
  -t, --dotenv-token <string>        token indicating a dotenv file (default: ".env")
  -i, --private-token <string>       token indicating private variables (default: "local")
  -s, --log                          log extracted variables (default: false)
  -l, --log-level <string>           max log level (default: "info")
  -x, --suppress-dotenv              suppress dotenv loading (default: false)
  -a, --aws-sso-profile <string>     local AWS SSO profile (follows dotenv-expand rules)
  -h, --help                         display help for command

Commands:
  getdotenv                          Execute getdotenv.
  aws                                AWS CLI.
  openapi                            OpenAPI-related commands
  help [command]                     display help for command
```

## getdotenv

```text
Usage: npm run cli --- [cli options] getdotenv [options]

Execute getdotenv.

Options:
  -h, --help  display help for command
```

## AWS

```text
Usage: npm run cli --- [cli options] aws [options] [command]

AWS-related commands

Options:
  -h, --help                 display help for command

Commands:
  pull-secret [options]      Create or update local private environment variables from AWS Secrets Manager secret.
  push-secret [options]      Create or update AWS Secrets Manager secret from local private environment variables.
  delete-secret [options]    Delete AWS Secrets Manager secret.
  pull-apikey [options]      Create or update local environment variable from API Key.
  flush-api-cache [options]  Flushes a REST API stage cache.
  pull-cognito [options]     Create or update local environment variables from Cognito User Pool details.
  push-amplify [options]     Update Amplify app from local private environment variables.
  redrive [options]          Redrive a CRUD operation DLQ message.
  help [command]             display help for command
```

## OpenAPI

```text
Usage: npm run cli --- [cli options] openapi [options] [command]

OpenAPI-related commands

Options:
  -h, --help         display help for command

Commands:
  typegen [options]  Generate types from environment variables.
  help [command]     display help for command
```

# API Documentation


---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!

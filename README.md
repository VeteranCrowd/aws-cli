# AWS CLI

A handy CLI commands that supports common AWS operations.

# Command Line Interface

```text
Usage: npm run cli --- [cli options] [options] [command]

Base CLI. Set paths to load dotenvs.

Options:
  -l, --log-level <string>           max log level (default: "info")
  -x, --suppress-defaults            suppress default getdotenv options
  -p, --paths <strings...>           space-delimited paths to dotenv directory
  -t, --dotenv-token <string>        token indicating a dotenv file (default: '.env') (default: ".env")
  -i, --private-token <string>       token indicating private variables (default: 'local') (default: "local")
  -d, --defaultEnvironment <string>  default environment
  -e, --environment <string>         environment
  -v, --variable <string>            environment from variable
  -n, --exclude-env                  exclude environment-specific variables (default: false)
  -g, --exclude-global               exclude global & dynamic variables (default: false)
  -r, --exclude-private              exclude private variables (default: false)
  -u, --exclude-public               exclude public variables (default: false)
  -y, --dynamic-path <string>        dynamic variables path
  -s, --show                         show extracted variables (default: false)
  -h, --help                         display help for command

Commands:
  aws                                AWS-related commands
  local                              Local dev environment commands
  help [command]                     display help for command
```

## AWS

```text
Usage: npm run cli --- [cli options] aws [options] [command]

AWS-related commands

Options:
  -h, --help               display help for command

Commands:
  delete-secret [options]  Delete AWS Secrets Manager secret.
  pull-cognito [options]   Create or update local private environment variables from Cognito User Pool details.
  pull-secret [options]    Create or update local private environment variables from AWS Secrets Manager secret.
  push-secret [options]    Create or update AWS Secrets Manager secret from local private environment variables.
  redrive [options]        Redrive a CRUD operation DLQ message.
  help [command]           display help for command
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

```js
import { foo, PACKAGE_INFO } from '@karmaniverous/npm-package-template`;
```


---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!

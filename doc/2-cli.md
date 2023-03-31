# Command Line Interface

```text
Usage: npm run cli --- [cli options] [options] [command]

Base CLI. Set paths to load dotenvs.

Options:
  -l, --log-level <string>           max log level (default: "info")
  -p, --paths <strings...>           space-delimited paths to dotenv directory
  -t, --dotenv-token <string>        token indicating a dotenv file (default: '.env')
  -i, --private-token <string>       token indicating private variables (default: 'local')
  -d, --defaultEnvironment <string>  default environment
  -e, --environment <string>         environment
  -v, --variable <string>            environment from variable
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
  -h, --help                display help for command

Commands:
  create-secrets [options]  Create stack secrets from environment variables.
  retrieve-secrets          Retrieve stack secrets and store in .env files.
  update-secrets [options]  Update stack secrets from environment variables.
  delete-secrets            Delete stack secrets.
  retrieve-cognito          Updates an environment's .env.local file with Cognito user pool details
  update-amplify [options]  Update Amplify secrets from environment variables.
  redrive [options]         Redrive a CRUD operation DLQ message.
  help [command]            display help for command
```

## Dev Environment

```text
Usage: npm run cli --- [cli options] dev [options] [command]

Development environment commands

Options:
  -h, --help         display help for command

Commands:
  typegen [options]  Generate types from environment variables.
  help [command]     display help for command
```

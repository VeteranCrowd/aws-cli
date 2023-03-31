# AWS CLI

A handy CLI commands that supports common AWS operations.

# Command Line Interface

```text
Usage: npm run cli --- [cli options] [options] [command]

Options:
  -p, --paths <strings...>           space-delimited paths to dotenv directory (default './')
  -t, --dotenv-token <string>        token indicating a dotenv file (default: '.env')
  -i, --private-token <string>       token indicating private variables (default: 'local')
  -d, --defaultEnvironment <string>  default environment
  -e, --environment <string>         environment (default: "dev")
  -v, --variable <string>            environment from variable
  -r, --exclude-private              exclude private variables (default: false)
  -u, --exclude-public               exclude public variables (default: false)
  -y, --dynamic-path <string>        dynamic variables path
  -l, --log-level <string>           max log level (default: "info")
  -s, --show                         show extracted variables (default: false)
  -h, --help                         display help for command

Commands:
  aws                                AWS-related commands
  dev                                Development environment commands
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

# API Documentation

```js
import { foo, PACKAGE_INFO } from '@karmaniverous/npm-package-template`;
```


---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!

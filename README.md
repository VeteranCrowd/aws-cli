# AWS CLI

A handy CLI commands that supports common AWS operations.

# Command Line Interface

```text
Usage: vc [global options] [ [command] [command options] [ [subcommand] [subcommand options] ... ] ]

Base CLI. All options except delimiters follow dotenv-expand rules.

Options:
  -e, --env <string>           target environment
  --default-env <string>       default target environment (default: "dev")
  -p, --paths <string>         delimited list of paths to dotenv directory (default: "./ ./env")
  --paths-delimiter <string>   regex paths delimiter (default: "\\s+")
  -v, --vars <string>          delimited list KEY=VALUE pairs (default: "LOG_LEVEL=info")
  --vars-delimiter <string>    regex vars delimiter (default: "\\s+")
  --vars-assignor <string>     regex vars assignment operator (default: "=")
  -y, --dynamic-path <string>  dynamic variables path (default: "./env/dynamic.js")
  -o, --output-path <string>   consolidated output file, follows dotenv-expand rules using loaded env vars
  -n, --exclude-env            exclude environment-specific variables
  -N, --exclude-env-off        exclude environment-specific variables OFF (default)
  -g, --exclude-global         exclude global variables
  -G, --exclude-global-off     exclude global variables OFF (default)
  -r, --exclude-private        exclude private variables
  -R, --exclude-private-off    exclude private variables OFF (default)
  -u, --exclude-public         exclude public variables
  -U, --exclude-public-off     exclude public variables OFF (default)
  -z, --exclude-dynamic        exclude dynamic variables
  -Z, --exclude-dynamic-off    exclude dynamic variables OFF (default)
  -l, --log                    console log extracted variables
  -L, --log-off                console log extracted variables OFF (default)
  -x, --suppress-dotenv        suppress dotenv loading (default: false)
  -c, --command <string>       shell command string
  -s, --shell <string>         execa shell option
  --dotenv-token <string>      token indicating a dotenv file (default: ".env")
  --private-token <string>     token indicating private variables (default: "local")
  -D, --debug                  debug mode
  -h, --help                   display help for command

Commands:
  cmd                          execute shell command string (default command)
  aws                          AWS CLI.
  openapi                      OpenAPI-related commands
  help [command]               display help for command
```

# API Documentation


---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!

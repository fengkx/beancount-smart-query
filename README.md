# Beancount smart query

Query beancount in human language with the help of AI.

## Usage
  <!-- usage -->
```sh-session
$ npm install -g beancount-smart-query
$ bean-sq COMMAND
running command...
$ bean-sq (--version)
beancount-smart-query/0.0.1 darwin-arm64 node-v18.16.0
$ bean-sq --help [COMMAND]
USAGE
  $ bean-sq COMMAND
...
```
<!-- usagestop -->
## Commands
<!-- commands -->
* [`bean-sq help [COMMANDS]`](#bean-sq-help-commands)
* [`bean-sq plugins`](#bean-sq-plugins)
* [`bean-sq plugins:install PLUGIN...`](#bean-sq-pluginsinstall-plugin)
* [`bean-sq plugins:inspect PLUGIN...`](#bean-sq-pluginsinspect-plugin)
* [`bean-sq plugins:install PLUGIN...`](#bean-sq-pluginsinstall-plugin-1)
* [`bean-sq plugins:link PLUGIN`](#bean-sq-pluginslink-plugin)
* [`bean-sq plugins:uninstall PLUGIN...`](#bean-sq-pluginsuninstall-plugin)
* [`bean-sq plugins:uninstall PLUGIN...`](#bean-sq-pluginsuninstall-plugin-1)
* [`bean-sq plugins:uninstall PLUGIN...`](#bean-sq-pluginsuninstall-plugin-2)
* [`bean-sq plugins update`](#bean-sq-plugins-update)
* [`bean-sq query FILE QUERY`](#bean-sq-query-file-query)

## `bean-sq help [COMMANDS]`

Display help for bean-sq.

```
USAGE
  $ bean-sq help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for bean-sq.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.10/src/commands/help.ts)_

## `bean-sq plugins`

List installed plugins.

```
USAGE
  $ bean-sq plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ bean-sq plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/index.ts)_

## `bean-sq plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ bean-sq plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ bean-sq plugins add

EXAMPLES
  $ bean-sq plugins:install myplugin 

  $ bean-sq plugins:install https://github.com/someuser/someplugin

  $ bean-sq plugins:install someuser/someplugin
```

## `bean-sq plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ bean-sq plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ bean-sq plugins:inspect myplugin
```

## `bean-sq plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ bean-sq plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ bean-sq plugins add

EXAMPLES
  $ bean-sq plugins:install myplugin 

  $ bean-sq plugins:install https://github.com/someuser/someplugin

  $ bean-sq plugins:install someuser/someplugin
```

## `bean-sq plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ bean-sq plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ bean-sq plugins:link myplugin
```

## `bean-sq plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ bean-sq plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ bean-sq plugins unlink
  $ bean-sq plugins remove
```

## `bean-sq plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ bean-sq plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ bean-sq plugins unlink
  $ bean-sq plugins remove
```

## `bean-sq plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ bean-sq plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ bean-sq plugins unlink
  $ bean-sq plugins remove
```

## `bean-sq plugins update`

Update installed plugins.

```
USAGE
  $ bean-sq plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `bean-sq query FILE QUERY`

Query beancount in human language with the help of AI

```
USAGE
  $ bean-sq query FILE QUERY [--learning] [-v]

FLAGS
  -v, --verbose  detail log
  --learning     whether AI will teaching you how to query

DESCRIPTION
  Query beancount in human language with the help of AI

EXAMPLES
  $ bean-sq query main.bean 'List all my traffic cost in last month' --verbose 

  $ bean-sq query main.bean '列出近一周 CMB 银行卡的账单 按时间先后顺序输出'  

  $ bean-sq query main.bean '上个月花了多少钱在娱乐上'  --learning
```

_See code: [dist/commands/query.ts](https://github.com/fengkx/beancount-smart-query/blob/v0.0.1/dist/commands/query.ts)_
<!-- commandsstop -->
# Table of contents
<!-- toc -->
* [Beancount smart query](#beancount-smart-query)
* [Table of contents](#table-of-contents)
<!-- tocstop -->

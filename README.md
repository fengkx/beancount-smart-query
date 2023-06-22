# Beancount smart query

[![tests](https://github.com/fengkx/beancount-smart-query/actions/workflows/test.yml/badge.svg)](https://github.com/fengkx/beancount-smart-query/actions/workflows/test.yml)

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
  $ bean-sq query main.bean 'List all my traffic cost in last month'  

  $ bean-sq query main.bean '列出近一周 CMB 银行卡的账单 按时间先后顺序输出'  

  $ bean-sq query main.bean '上个月花了多少钱在娱乐上'
```

_See code: [dist/commands/query.ts](https://github.com/fengkx/beancount-smart-query/blob/v0.0.1/dist/commands/query.ts)_
<!-- commandsstop -->

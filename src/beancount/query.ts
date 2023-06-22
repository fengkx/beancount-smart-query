import {$, ProcessOutput, which, fs} from 'zx'
import {singleton, inject} from 'tsyringe'
import {beanEntryPathToken, cliOptionsToken, commandToken} from '../ioc/tokens.js'
import {Command} from '@oclif/core'
import {Err, Ok, Result} from 'ts-results-es'
import {CLIOptions} from '../commands/query.js'

@singleton()
export class BeanQuery {
  beanQueryPath: string | null = null;
  constructor(@inject(beanEntryPathToken) private beanEntryPath: string, @inject(cliOptionsToken) options: CLIOptions, @inject(commandToken) cmd: Command) {
    try {
      this.beanQueryPath = which.sync('bean-query')
    } catch {
      cmd.error('bean-query not found', {exit: 1})
    }

    if (!fs.existsSync(this.beanQueryPath)) {
      console.log(this.beanEntryPath)
      cmd.error('beancount entry file not found', {exit: 1})
    }

    if (!options.verbose) {
      $.verbose = false
    }
  }

  public async query(bql: string): Promise<ProcessOutput> {
    return  $`${this.beanQueryPath} ${this.beanEntryPath} ${bql}`
  }

  public async queryAsString(bql: string): Promise<Result<string, Error>> {
    try {
      const {stdout, exitCode, stderr} = await this.query(bql)
      if (stdout.startsWith('ERROR:')) {
        return Err(new Error(stdout))
      }

      if (exitCode !== 0 && stderr) {
        return Err(new Error(stderr))
      }

      return Ok(stdout)
    } catch (error: unknown) {
      return Err(error as Error)
    }
  }
}

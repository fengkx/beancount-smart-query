import {$, ProcessOutput, which} from 'zx'
import {singleton, inject} from 'tsyringe'
import {beanEntryPathToken, cliOptionsToken, commandToken} from '../ioc/tokens.js'
import {Command} from '@oclif/core'

export type BeanQueryOptions = {
  verbose: boolean;
  learning: boolean
}

@singleton()
export class BeanQuery {
  beanQueryPath: string | null = null;
  constructor(@inject(beanEntryPathToken) private beanEntryPath: string, @inject(cliOptionsToken) options: BeanQueryOptions, @inject(commandToken) cmd: Command) {
    try {
      this.beanQueryPath = which.sync('bean-query')
    } catch {
      cmd.error('bean-query not found', {exit: 1})
    }

    if (!options.verbose) {
      $.verbose = false
    }
  }

  public async query(sql: string): Promise<ProcessOutput> {
    return  $`${this.beanQueryPath} ${this.beanEntryPath} ${sql}`
  }
}

import {$, ProcessOutput, which} from 'zx'
import {singleton, inject} from 'tsyringe'
import {beanEntryPathToken, cliOptionsToken} from '../ioc/tokens.js'

type BeanQueryOptions = {
  verbose: boolean
}

@singleton()
export class BeanQuery {
  constructor(@inject(beanEntryPathToken) private beanEntryPath: string, @inject(cliOptionsToken) options: BeanQueryOptions) {
    which('bean-query')
    if (!options.verbose) {
      $.verbose = false
    }
  }

  public async query(sql: string): Promise<ProcessOutput> {
    return  $`env bean-query ${this.beanEntryPath} ${sql}`
  }
}

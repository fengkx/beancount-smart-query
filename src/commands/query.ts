import 'reflect-metadata'
import {container, instanceCachingFactory} from 'tsyringe'
import {Command, Flags, Args} from '@oclif/core'
import {beanEntryPathToken, cliOptionsToken, commandToken, openAIKeyToken} from '../ioc/tokens.js'
import {AIQueryBuilder} from '../chains/sql.js'
import {fs} from 'zx'

export default class Query extends Command {
  static description = 'Query beancount in human language with the help of AI'

  static examples = ['List all my traffic cost in last month', '列出近一周 CMB 银行卡的账单 按时间先后顺序输出', '上个月花了多少钱在娱乐上'].map(query => `<%= config.bin %> <%= command.id %> main.bean '${query}' ${Math.random() > 0.6 ? '--verbose' : ''} ${Math.random() > 0.8 ? '--learning' : ''}`)

  static flags = {
    learning: Flags.boolean({description: 'whether AI will teaching you how to query'}),
    verbose: Flags.boolean({char: 'v', default: false, description: 'detail log'}),
  }

  static args = {
    file: Args.string({required: true}),
    query: Args.string({required: true}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Query)
    container.register(commandToken, {useValue: this})
    container.register(beanEntryPathToken, {useFactory: instanceCachingFactory(() => {
      if (!fs.existsSync(args.file)) {
        throw new Error(`File: ${args.file} is not found`)
      }

      return args.file
    })})
    container.register(cliOptionsToken, {useValue: {verbose: flags.verbose, learning: flags.learning}})
    container.register(openAIKeyToken, {useFactory: instanceCachingFactory(() => {
      if (typeof process.env.OPENAI_API_KEY !== 'string') {
        throw new TypeError('You should provide openai api key by setting environment variable `OPENAI_API_KEY`')
      }

      return process.env.OPENAI_API_KEY
    })})
    const builder = new AIQueryBuilder()
    const result = await builder.fromQuery(args.query)
    await result.output()
  }
}

export type CLIOptions = {
  verbose: boolean;
  learning: boolean
}

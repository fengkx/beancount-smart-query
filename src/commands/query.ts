import {container, instanceCachingFactory} from 'tsyringe'
import {Command, Flags, Args} from '@oclif/core'
import {beanEntryPathToken, cliOptionsToken, commandToken, openAIKeyToken} from '../ioc/tokens.js'
import {AIQueryBuilder} from '../chains/sql.js'

export default class Query extends Command {
  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    // flag with a value (-n, --name=VALUE)
    learning: Flags.boolean({description: 'AI will teaching you how to query'}),
    verbose: Flags.boolean({char: 'v', default: false, description: 'detail log'}),
  }

  static args = {
    file: Args.string({required: true}),
    query: Args.string({required: true}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Query)
    container.register(commandToken, {useValue: this})
    container.register(beanEntryPathToken, {useValue: args.file})
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

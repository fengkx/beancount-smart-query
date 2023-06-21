import {container} from 'tsyringe'
import {Command, Flags, Args} from '@oclif/core'
import {BeanAccount} from '../beancount/account.js'
import {beanEntryPathToken, cliOptionsToken} from '../ioc/tokens.js'

export default class Query extends Command {
  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    verbose: Flags.boolean({char: 'v', default: false}),
  }

  static args = {
    file: Args.string({required: true}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Query)
    container.register(beanEntryPathToken, {useValue: args.file})
    container.register(cliOptionsToken, {useValue: {verbose: flags.verbose}})
    const beanAccount = new BeanAccount();
    (await beanAccount.getAllAccountName()).map(accounts => {
      console.log(accounts)
    })
  }
}

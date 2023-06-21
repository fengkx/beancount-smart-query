import {atomic, sequence, either} from 'compose-regexp'
import {Ok, Err, Result} from 'ts-results-es'
import {autoInjectable} from 'tsyringe'
import {Brand, make} from 'type-brandy'
import {BeanQuery} from './query.js'

export const ACCOUNT_TYPES = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'] as const
export type IAccountType = (typeof ACCOUNT_TYPES)[number]

export type BeanAccountName = Brand<string, 'BeanAccountName'>

const START_WITH_ACCOUNT_TYPE_RE = sequence(/^/, atomic(either(...ACCOUNT_TYPES)), ':')

@autoInjectable()
export class BeanAccount {
  constructor(public beanQuery?: BeanQuery) {}

  // eslint-disable-next-line unicorn/consistent-function-scoping
  static castBeanAccountName = make<BeanAccountName>((name: string) => {
    if (!BeanAccount.isValidateAccountName(name)) {
      throw new Error('not a valid beancount account name')
    }
  })

  private static startsWithAccountType(str: string): boolean {
    return Boolean(START_WITH_ACCOUNT_TYPE_RE.test(str))
  }

  public static isValidateAccountName(str: string): boolean {
    return BeanAccount.startsWithAccountType(str)
  }

  async getAllAccountName() : Promise<Result<BeanAccountName[], Error>> {
    try {
      const {stdout} = await this.beanQuery!.query('select distinct account;')
      const accounts = stdout.split(/\n/).filter(line => BeanAccount.startsWithAccountType(line)).map(line => line.trim())

      return Ok(accounts.map(name => BeanAccount.castBeanAccountName(name)))
    } catch (error: unknown) {
      return Err(error as Error)
    }
  }
}

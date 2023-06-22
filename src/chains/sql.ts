import {ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, AIMessagePromptTemplate} from 'langchain/prompts'
import {LLMChain} from 'langchain/chains'
import {ChatOpenAI} from 'langchain/chat_models/openai'
import {codeBlock, oneLineCommaLists, oneLine} from 'common-tags'
import {autoInjectable, inject, injectable} from 'tsyringe'
import {BeanAccount} from '../beancount/account.js'
import {BeanQuery, BeanQueryOptions} from '../beancount/query.js'
import {Err, Ok, Result} from 'ts-results-es'
import {BufferWindowMemory} from 'langchain/memory'

import {cliOptionsToken, commandToken, openAIKeyToken} from '../ioc/tokens.js'
import {BQL_COLUMNS, BQL_FUNCTIONS, BQL_SYNTAX} from './prompts/bql.js'
import {BQLSyntaxCorrecter} from './correct-bql.js'
import {Command} from '@oclif/core'
import {createChatOpenAI} from './utils/openai.js'

@injectable()
@autoInjectable()
export class AIQueryBuilder  {
  constructor(private account?: BeanAccount,  @inject(cliOptionsToken) private options?: BeanQueryOptions, @inject(openAIKeyToken) private openaiKey?: string) {}

  private async createPrompt() {
    const accountNames = (await this.account!.getAllAccountName()).expect('Failed to get accounts')
    const promptTemplate = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(codeBlock`
       You are a expert of beancount query.
       ${BQL_SYNTAX}

      ${BQL_COLUMNS}

      ${BQL_FUNCTIONS}

       Output Beancount query according to the user demand, You should ALWAYS use the same language to response.
      `),
      HumanMessagePromptTemplate.fromTemplate(oneLine`List of Expenses for this Month`),
      AIMessagePromptTemplate.fromTemplate(codeBlock`
      ${oneLine`To display a list of Expenses for the current month, you can use the following query:`}
      \`\`\`
      ${oneLine`SELECT
      account, sum(cost(position)) as total, month
      WHERE
          account ~ "Expenses:*" and year = YEAR(today()) and month = MONTH(today())
      GROUP BY month, account
      ORDER BY total, account DESC`}
      \`\`\`
      `),
      HumanMessagePromptTemplate.fromTemplate(codeBlock`
      Today is ${(new Date()).toDateString()}
      My beancount has accounts : Asset:Bank, Income:Salary, Expenses:Rent, Expenses:Food, Expenses:Traffic
      给出上个两个月的收入
      `),
      AIMessagePromptTemplate.fromTemplate(codeBlock`
      为了列出上两个月的收入，一个月约 30 天，你可以这样列出最近 60 天的收入：
      \`\`\`
      ${oneLine`SELECT account, sum(convert(position, 'CNY')) as total, year, month WHERE account ~ "^Income:*" and date > date_add(today(), -60) GROUP BY account,year, month ORDER BY total DESC`}
      \`\`\`
      他列出了近 60 天的各 Income 账户下，分年月的收益总合
      `),
      HumanMessagePromptTemplate.fromTemplate(codeBlock`
      Today is Thu Jun 22 2023
      My beancount has accounts : Asset:Funds, Asset:Bank, Income:Salary, Expenses:Rent, Expenses:Food
      给出上个季度的房租花销 query
      `),
      AIMessagePromptTemplate.fromTemplate(codeBlock`
      为了列出上个季度的房租花销，相当于 2023 年第一季度你可以这样：
      \`\`\`
      ${oneLine`
      SELECT date, description, account, position WHERE year = 2023 AND quarter(date) = '2023-Q1' AND account = "Expenses:Rent"  ORDER BY date DESC
      `}
      \`\`\`
      这个查询会列出上个季度所有 "Expenses:Rent" 的交易，包括日期、说明、账户和金额。
      `),
      HumanMessagePromptTemplate.fromTemplate(codeBlock`
      Today is Thu Jun 22 2023
      My beancount has accounts : Asset:Funds, Asset:Bank, Income:Salary, Expenses:Rent, Expenses:Food
      给出上周的投资收益总和
      `),
      AIMessagePromptTemplate.fromTemplate(codeBlock`
      为了列出上周 (相当于 2023-06-11 到 2023-06-17) 的投资收益总和，你可以这样：
      \`\`\`
      ${oneLine`SELECT sum(convert(position, 'CNY')) as invest_income_total_last_week WHERE account ~ "^Income:Invest" AND date > 2023-06-11 AND date < 2023-06-17`}
      \`\`\`
      这个查询会列出这个月所有 "Income:Invest" 账户下的交易，然后计算它们的总和。
      `),
      HumanMessagePromptTemplate.fromTemplate(codeBlock`
        Today is ${(new Date()).toDateString()}
        My beancount has accounts : ${oneLineCommaLists`${accountNames}`}
        {userInput}
      `),
    ])
    return promptTemplate
  }

  public async fromQuery(query: string): Promise<QueryResult> {
    const memory = new BufferWindowMemory({k: 10})

    const chain = new LLMChain({
      prompt: await this.createPrompt(),
      llm: createChatOpenAI({temperature: 0, openAIApiKey: this.openaiKey}),
      verbose: this.options?.verbose,
      memory,
    })
    const {text} = await chain.call({
      userInput: query,

    })

    const result = new QueryResult(text, query)
    return result
  }
}

@autoInjectable()
export class QueryResult {
  constructor(private llmOutput: string, private userInput: string, private beanQuery?: BeanQuery, @inject(cliOptionsToken) private options?: BeanQueryOptions, @inject(commandToken) private cmd?: Command) {}
  private parseLLMOutput(): Result<string, Error> {
    const matches = this.llmOutput.match(/```\n([\S\s]*?)```/)
    if (!matches || !matches[1]) {
      return Err(new Error('SQL Not Found'))
    }

    return Ok(matches[1])
  }

  private execSuccessHandler = (stdout: string) => {
    if (this.options?.learning) {
      console.log(`${this.llmOutput}\n`)
    }

    if (!this.options?.verbose) {
      console.log(stdout)
    }

    return Ok.EMPTY
  }

  public async output(): Promise<void> {
    const query = this.parseLLMOutput().unwrap()

    const result = await this.beanQuery!.queryAsString(query)
    result.map(stdout => this.execSuccessHandler(stdout)).mapErr(async err => {
      const correcter = new BQLSyntaxCorrecter()
      const correctedQuery = await correcter.tryCorrect(query, err.message, this.userInput)
      const retryResult = await this.beanQuery!.queryAsString(correctedQuery)
      retryResult.map(stdout => {
        this.execSuccessHandler(stdout)
        return Ok.EMPTY
      }).mapErr(err => {
        if (!this.options?.verbose) {
          this.cmd!.logToStderr(`${correctedQuery}\n${err.message}`)
        }
      })
    })
  }
}

import {ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, AIMessagePromptTemplate} from 'langchain/prompts'
import {LLMChain} from 'langchain/chains'
import {ChatOpenAI} from 'langchain/chat_models/openai'
import {codeBlock, oneLineCommaLists, oneLine} from 'common-tags'
import {autoInjectable, inject, injectable} from 'tsyringe'
import {BeanAccount} from '../beancount/account.js'
import {BeanQuery, BeanQueryOptions} from '../beancount/query.js'
import {Err, Ok, Result} from 'ts-results-es'
import {BufferWindowMemory} from 'langchain/memory'

import {cliOptionsToken, openAIKeyToken} from '../ioc/tokens.js'

@injectable()
@autoInjectable()
export class AIQueryBuilder  {
  constructor(private account?: BeanAccount,  @inject(cliOptionsToken) private options?: BeanQueryOptions, @inject(openAIKeyToken) private openaiKey?: string) {}

  private async createPrompt() {
    const accountNames = (await this.account!.getAllAccountName()).expect('Failed to get accounts')
    const promptTemplate = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(codeBlock`
       You are a expert of beancount query.
       Beancount modify the SQL SELECT syntax to provide a two-level filtering syntax: since we have a single table of data, we replace the table name in FROM by a filtering expression which applies over transactions, and the WHERE clause applies to data pulled from the resulting list of postings:
        ${oneLine`
       SELECT <target1>, <target2>, …
      FROM <entry-filter-expression>
      WHERE <posting-filter-expression>;
       `}
       Both filtering expressions are optional. If no filtering expressions are provided, all postings will be enumerated over. Note that since the transactions are always filtered in date order, the results will be processed and returned in this order by default.

      The list of comma-separated target expressions may consist of columns,
      simple functions and aggregate functions. If you use any aggregate
      function, you must also provide a GROUP-BY clause.

      Available columns(Any columns not listed are INVALID! You can only pick column from the list):
        'account': The account of the posting. Type: str.
        'balance': The balance for the posting. These can be summed into inventories.
          Type: Inventory.
        'change': The position for the posting. These can be summed into inventories.
          Type: Position.
        'cost_currency': The cost currency of the posting. Type: str.
        'cost_date': The cost currency of the posting. Type: date.
        'cost_label': The cost currency of the posting. Type: str.
        'cost_number': The number of cost units of the posting. Type: Decimal.
        'currency': The currency of the posting. Type: str.
        'date': The date of the parent transaction for this posting. Type: date.
        'day': The day of the date of the parent transaction for this posting. Type:
          int.
        'description': A combination of the payee + narration for the transaction of
          this posting. Type: str.
        'filename': The filename where the posting was parsed from or created. Type:
          str.
        'flag': The flag of the parent transaction for this posting. Type: str.
        'id': The unique id of the parent transaction for this posting. Type: str.
        'lineno': The line number from the file the posting was parsed from. Type:
          int.
        'links': The set of links of the parent transaction for this posting. Type:
          set.
        'location': The filename:lineno where the posting was parsed from or created.
          If you select this column as the first column, because it renders like
          errors, Emacs is able to pick those up and you can navigate between an
          arbitrary list of transactions with next-error and previous-error. Type:
          str.
        'month': The month of the date of the parent transaction for this posting.
          Type: int.
        'narration': The narration of the parent transaction for this posting. Type:
          str.
        'number': The number of units of the posting. Type: Decimal.
        'other_accounts': The list of other accounts in the transaction, excluding
          that of this posting. Type: set.
        'payee': The payee of the parent transaction for this posting. Type: str.
        'position': The position for the posting. These can be summed into
          inventories. Type: Position.
        'posting_flag': The flag of the posting itself. Type: str.
        'price': The price attached to the posting. Type: Amount.
        'tags': The set of tags of the parent transaction for this posting. Type: set.
        'type': The data type of the parent transaction for this posting. Type: str.
        'weight': The computed weight used for this posting. Type: Amount.
        'year': The year of the date of the parent transaction for this posting. Type:
          int.

      Simple functions(Any function not listed is INVALID!):
        'ABS(Decimal)': Compute the length of the argument. This works on sequences.
        'ABS(Inventory)': Compute the length of the argument. This works on sequences.
        'ABS(Position)': Compute the length of the argument. This works on sequences.
        'ACCOUNT_SORTKEY(str)': Get a string to sort accounts in order taking into
          account the types.
        'ANY_META(str)': Get metadata from the posting or its parent transaction's
          metadata if not present.
        'CLOSE_DATE(str)': Get the date of the close directive of the account.
        'COALESCE(object,object)': Return the first non-null argument
        'COMMODITY(Amount)': Extract the currency from an Amount.
        'COMMODITY_META(str)': Get the metadata dict of the commodity directive of the
          currency.
        'CONVERT(Amount,str)': Coerce an amount to a particular currency.
        'CONVERT(Amount,str,date)': Coerce an amount to a particular currency.
        'CONVERT(Inventory,str)': Coerce an inventory to a particular currency.
        'CONVERT(Inventory,str,date)': Coerce an inventory to a particular currency.
        'CONVERT(Position,str)': Coerce an amount to a particular currency.
        'CONVERT(Position,str,date)': Coerce an amount to a particular currency.
        'COST(Inventory)': Get the cost of an inventory.
        'COST(Position)': Get the cost of a position.
        'CURRENCY(Amount)': Extract the currency from an Amount.
        'CURRENCY_META(str)': Get the metadata dict of the commodity directive of the
          currency.
        'DATE(int,int,int)': Construct a date with year, month, day arguments
        'DATE(str)': Construct a date with year, month, day arguments
        'DATE_ADD(date,int)': Adds/subtracts number of days from the given date
        'DATE_DIFF(date,date)': Calculates the difference (in days) between two dates
        'DAY(date)': Extract the day from a date.
        'ENTRY_META(str)': Get some metadata key of the parent directive
          (Transaction).
        'FILTER_CURRENCY(Inventory,str)': Filter an inventory to just the specified
          currency.
        'FILTER_CURRENCY(Position,str)': Filter an inventory to just the specified
          currency.
        'FINDFIRST(str,set)': Filter a string sequence by regular expression and
          return the first match.
        'GETITEM(dict,str)': Get the string value of a dict. The value is always
          converted to a string.
        'GETPRICE(str,str)': Fetch a price for something at a particular date
        'GETPRICE(str,str,date)': Fetch a price for something at a particular date
        'GREP(str,str)': Match a group against a string and return only the matched
          portion.
        'GREPN(str,str,int)': Match a pattern with subgroups against a string and
          return the subgroup at the index
        'JOINSTR(set)': Join a sequence of strings to a single comma-separated string.
        'LEAF(str)': Get the name of the leaf subaccount.
        'LENGTH(list|set|str)': Compute the length of the argument. This works on
          sequences.
        'LOWER(str)': Convert string to lowercase
        'MAXWIDTH(str,int)': Convert the argument to a substring. This can be used to
          ensure maximum width
        'META(str)': Get some metadata key of the Posting.
        'MONTH(date)': Extract the month from a date.
        'NEG(Amount)': [See class NegAmount]
        'NEG(Decimal)': [See class NegDecimal]
        'NEG(Inventory)': [See class NegInventory]
        'NEG(Position)': [See class NegPosition]
        'NUMBER(Amount)': Extract the number from an Amount.
        'ONLY(str,Inventory)': Get one currency's amount from the inventory.
        'OPEN_DATE(str)': Get the date of the open directive of the account.
        'OPEN_META(str)': Get the metadata dict of the open directive of the account.
        'PARENT(str)': Get the parent name of the account.
        'POSSIGN(Amount,str)': Correct sign of an Amount based on the usual balance of
          associated account.
        'POSSIGN(Decimal,str)': Correct sign of an Amount based on the usual balance
          of associated account.
        'POSSIGN(Inventory,str)': Correct sign of an Amount based on the usual balance
          of associated account.
        'POSSIGN(Position,str)': Correct sign of an Amount based on the usual balance
          of associated account.
        'QUARTER(date)': Extract the quarter from a date.
        'ROOT(str,int)': Get the root name(s) of the account.
        'SAFEDIV(Decimal,Decimal)': A division operation that swallows dbz exceptions
          and outputs 0 instead.
        'SAFEDIV(Decimal,int)': [See class SafeDivInt]
        'STR(object)': Convert the argument to a string.
        'SUBST(str,str,str)': Substitute leftmost non-overlapping occurrences of
          pattern by replacement.
        'TODAY()': Today's date
        'UNITS(Inventory)': Get the number of units of an inventory (stripping cost).
        'UNITS(Position)': Get the number of units of a position (stripping cost).
        'UPPER(str)': Convert string to uppercase
        'VALUE(Inventory)': Coerce an inventory to its market value at the current
          date.
        'VALUE(Inventory,date)': Coerce an inventory to its market value at a
          particular date.
        'VALUE(Position)': Convert a position to its cost currency at the market
          value.
        'VALUE(Position,date)': Convert a position to its cost currency at the market
          value of a particular date.
        'WEEKDAY(date)': Extract a 3-letter weekday from a date.
        'YEAR(date)': Extract the year from a date.
        'YMONTH(date)': Extract the year and month from a date.

      Aggregate functions:
        'COUNT(object)': Count the number of occurrences of the argument.
        'FIRST(object)': Keep the first of the values seen.
        'LAST(object)': Keep the last of the values seen.
        'MAX(object)': Compute the maximum of the values.
        'MIN(object)': Compute the minimum of the values.
        'SUM(Amount)': Calculate the sum of the amount. The result is an Inventory.
        'SUM(Inventory)': Calculate the sum of the inventories. The result is an
          Inventory.
        'SUM(Position)': Calculate the sum of the position. The result is an
          Inventory.
        'SUM(int|float|Decimal)': Calculate the sum of the numerical argument.

       Output Beancount query according to the user demand, Don't output anything other than the query itself
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
      为了列出上两个月的收入你可以这样：
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
      llm: new ChatOpenAI({temperature: 0, openAIApiKey: this.openaiKey}),
      verbose: this.options?.verbose,
      memory,
    })
    const {text} = await chain.call({
      userInput: query,

    })
    if (this.options?.learning) {
      console.log(`${text}\n`)
    }

    const result = new QueryResult(text, chain)
    return result
  }
}

@autoInjectable()
export class QueryResult {
  constructor(private llmOutput: string, private chain: LLMChain, private beanQuery?: BeanQuery, @inject(cliOptionsToken) private options?: BeanQueryOptions) {}
  private parseLLMOutput(): Result<string, Error> {
    const matches = this.llmOutput.match(/```\n([\S\s]*?)```/)
    if (!matches || !matches[1]) {
      return Err(new Error('SQL Not Found'))
    }

    return Ok(matches[1])
  }

  public async output(): Promise<void> {
    const query = this.parseLLMOutput().unwrap()

    const {stdout} = await this.beanQuery!.query(query)
    if (stdout.startsWith('ERROR:')) {
      const r = await this.chain.run((stdout))
      console.log('rrrr', r)
    }

    if (!this.options?.verbose) {
      console.log(stdout)
    }
  }
}

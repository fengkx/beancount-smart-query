import {DynamicTool} from 'langchain/tools'
import {initializeAgentExecutorWithOptions} from 'langchain/agents'

import {BeanQuery} from '../beancount/query.js'
import {autoInjectable, inject} from 'tsyringe'
import {codeBlock, oneLine} from 'common-tags'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {BQL_COLUMNS, BQL_FUNCTIONS, BQL_SYNTAX} from './prompts/bql.js'
import {cliOptionsToken, openAIKeyToken} from '../ioc/tokens.js'
import {ChatOpenAI} from 'langchain/chat_models/openai'
import {createChatOpenAI, createOpenAI} from './utils/openai.js'
import {CLIOptions} from '../commands/query.js'

/**
 * 尝试修正 BQL
 */
@autoInjectable()
export class BQLSyntaxCorrecter {
  private tools: DynamicTool[] = []
  private model: ChatOpenAI

  constructor(private beanQuery?: BeanQuery, @inject(openAIKeyToken) openAIApiKey?: string, @inject(cliOptionsToken) private options?: CLIOptions) {
    this.model = createChatOpenAI({temperature: 0, openAIApiKey})
    this.tools = [
      new DynamicTool({
        name: 'Exec Query',
        description: 'Run this to execute the query to check whether it has any syntax error. input should be a correctly runnable query',
        func: async (query:string): Promise<string> => {
          const result = await beanQuery!.queryAsString(query)
          if (result.err) {
            return `The Query is invalid: ${result.unwrapErr().message}`
          }

          return 'The Query is valid. You should output this valid query as final answer'
        },
      }),
      // new DynamicTool({
      //   name: 'Beancount Query Syntax Reference',
      //   description: 'This tool will return the beancount query syntax reference',
      //   func: async () => codeBlock`
      //   ${BQL_SYNTAX}
      //   ${BQL_COLUMNS}
      //   ${BQL_FUNCTIONS}
      //   `,
      // }),
      new DynamicTool({name: 'Common Error Explainer', description: 'Run this to give explain for common error message. input should be error message', func: async (errMsg:string) => {
        const model = createOpenAI({temperature: 0, openAIApiKey})
        const resp = await model.call(codeBlock`
        Explain Common Errors
        Error: Invalid number of arguments for DateAdd: found 3 expected 2.
        Explain: function DateAdd only accept 2 arguments
        Error: Syntax error near '-1' (at 139)
        Explain: There is a Syntax Error near the 139th character which is '-1. Beancount query does NOT support any INTERVAL operator'
        Error: ${errMsg}
        Explain:
        `)
        return resp
      }}),
    ]
  }

  async tryCorrect(query: string, errMsg: string, userInput: string): Promise<any> {
    const executor = await initializeAgentExecutorWithOptions(this.tools, this.model, {
      agentType: 'zero-shot-react-description',
      verbose: this.options!.verbose,
    })

    const input = codeBlock`
    Correct this invalid beancount query for me. It is used to find out ${oneLine`${userInput}`}
    - You should never change any account name in the query
    - NEVER change the meaning of the original query
    - Beancount query does NOT support any INTERVAL operator
    - Try to explain the error message

    Query: ${oneLine`${query}`}
    Error: ${oneLine`${errMsg}`}
    `
    console.log(input)

    const resp = await executor.call({input})
    return resp.output
  }
}


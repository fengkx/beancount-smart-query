import {OpenAI} from 'langchain/llms/openai'
import {ChatOpenAI} from 'langchain/chat_models/openai'
import {ProxyAgent} from 'proxy-agent'
import {defu} from 'defu'

const agent = new ProxyAgent()

type ConstructorType<C> = C extends abstract new (...args: infer P) => infer R
  ? (...args: P) => R
  : never;

export const createOpenAI: ConstructorType<typeof OpenAI> = (config, options) => {
  return new OpenAI({temperature: 0, ...config}, defu({
    baseOptions: {
      httpsAgent: agent,
      adapter: null,
    },
  }, options))
}

export const createChatOpenAI: ConstructorType<typeof ChatOpenAI> = (config, options) => {
  return new ChatOpenAI({temperature: 0, ...config}, defu({
    baseOptions: {
      httpsAgent: agent,
      adapter: null,
    },
  }, options))
}

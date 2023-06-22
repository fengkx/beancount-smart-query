// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../setup.d.ts" />

/* eslint-disable camelcase */
import 'dotenv/config'
// import {expect, test} from '@oclif/test'
import {createRequire} from 'node:module'
import {expect as expectType, test as testType} from '@oclif/test'
import path, {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import chai from 'chai'
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot'
chai.use(jestSnapshotPlugin())

const {expect, test} = createRequire(import.meta.url)('@oclif/test') as {
  expect: typeof expectType;
  test: typeof testType;
}

const exampleBeanCountEntry = path.join(dirname(fileURLToPath(import.meta.url)), '../examples/example.beancount')
describe('query', () => {
  test.stderr().command('query').catch(error => {
    expect(error.message).to.contain('Missing 2 required args').contain('file').contain('query')
  }).it('should have required arguments')
  test.stderr().command(['query', 'aaaa']).catch(error => {
    expect(error.message).contains('Missing 1 required arg').contains('query')
  }).it('should have two required arguments')

  test.stderr().command(['query', 'aaa', 'bbb']).catch(error => {
    expect(error.message).contains('File: aaa is not found')
  }).it('should check bean entry exist')

  test.stdout().nock('https://api.openai.com/v1', api => {
    api.post('/chat/completions').reply(200,
      {
        id: 'chatcmpl-7UFp1GmNDnsVW5zSVpbEc0J6rJHOW',
        object: 'chat.completion',
        created: 1_687_445_015,
        model: 'gpt-3.5-turbo-0301',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '为了列出去年的所有食物花费，你可以这样：\n```\nSELECT date, description, account, position WHERE account ~ "^Expenses:Food" AND year = 2022 ORDER BY date DESC\n```\n这个查询会列出去年所有 "Expenses:Food" 账户下的交易，包括日期、说明、账户和金额。',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 3339,
          completion_tokens: 88,
          total_tokens: 3427,
        },
      },
    )
  }).command(['query', exampleBeanCountEntry, '列出去年的所有食物花费']).it('should list all Foods expenses in last year', ctx => {
    expect(ctx.stdout).toMatchSnapshot()
  })

  test.stdout().nock('https://api.openai.com/v1', api => {
    api.post('/chat/completions').reply(200, {
      id: 'chatcmpl-7UGUCwwqiMfnpWc99G2IDbEcVDwHs',
      object: 'chat.completion',
      created: 1_687_447_568,
      model: 'gpt-3.5-turbo-0301',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: '为了列出上个月的交通费用，你可以这样：\n```\nSELECT date, description, account, position WHERE account = "Expenses:Transport:Tram" AND date >= 2023-05-01 AND date <= 2023-05-31 ORDER BY date DESC\n```\n这个查询会列出上个月所有 "Expenses:Transport:Tram" 账户下的交易，包括日期、说明、账户和金额。',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 3336,
        completion_tokens: 107,
        total_tokens: 3443,
      },
    },
    )
  }).command(['query', exampleBeanCountEntry, 'List all my traffic cost in last month']).it('should list all traffic cost last month', ctx => {
    expect(ctx.stdout).toMatchSnapshot()
  })
})

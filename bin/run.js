#!/usr/bin/env node
import 'reflect-metadata'
import 'dotenv/config'

(async () => {
  const oclif = await import('@oclif/core')
  await oclif.execute({type: 'esm', dir: import.meta.url})
})()

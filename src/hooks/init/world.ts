import {Hook} from '@oclif/core'

const hook: Hook<'init'> = async function (opts) {
  process.stdout.write(`example hook running ${opts.id}\n`)
}

export default hook

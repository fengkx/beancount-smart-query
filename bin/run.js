#!/usr/bin/env node
import 'reflect-metadata'

import oclif from '@oclif/core'

oclif
.run(process.argv.slice(2), import.meta.url)
.then(oclif.flush)
.catch(oclif.Errors.handle)

import { EFPCore } from './lib/core.ts'

// This scripts build all translation spa files and put in the spa folder
async function init() {
    const core = new EFPCore()
    await core.build()
}

init()

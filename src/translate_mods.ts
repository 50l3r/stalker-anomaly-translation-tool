import { EFPCore } from './lib/core.ts'

// This scripts get all eng translation mod files and translate via chatgpt
async function init() {
    const core = new EFPCore()
    await core.start(false, 'mods')
}

init()

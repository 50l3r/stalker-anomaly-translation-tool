import { glob } from 'glob'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import 'dotenv/config'

const source_language_key = process.env.SOURCE_LANGUAGE_KEY || 'eng'
const target_language_key = process.env.TARGET_LANGUAGE_KEY || 'spa'

async function test() {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    console.log('Scanning translation files...')

    const mods = await glob(process.env.MODS_FOLDER || '' + '*', { root: '' })

    for (let i = 0; i < mods.length; i++) {
        const filePath = mods[i]
        const modName = path.basename(filePath)

        const files = await glob(`/gamedata/configs/text/${source_language_key}/*.xml`, {
            root: filePath,
        })

        if (files.length === 0) continue

        //create directory if not exists
        if (!fs.existsSync(`${__dirname}/data/${source_language_key}/mods/${modName}/`)) {
            fs.mkdirSync(`${__dirname}/data/${source_language_key}/mods/${modName}/`, {
                recursive: true,
            })
        }

        for (let u = 0; u < files.length; u++) {
            const file = files[u]

            //copy file in folder
            fs.copyFileSync(
                file,
                `${__dirname}/data/${source_language_key}/mods/${modName}/${path.basename(file)}`
            )
        }
    }
}

test()

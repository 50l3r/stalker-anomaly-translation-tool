import { glob } from 'glob'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import 'dotenv/config'

import { ChatGPT } from './chatgpt.ts'
import { EFPXML } from './xml.ts'
import { Database } from './database.ts'

export class EFPCore {
    private blacklist: string[] = ['_color_code.xml', '_game_version.xml']
    private source_language_key = process.env.SOURCE_LANGUAGE_KEY || 'eng'
    private target_language_key = process.env.TARGET_LANGUAGE_KEY || 'spa'

    async start(reverse = false, type = 'default') {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)

        console.log('Scanning translation files...')

        let xmlFiles: string[] = []
        if (type === 'default') {
            xmlFiles = await glob(`src/data/${this.source_language_key}/base/*.xml`)
        } else if (type === 'mods') {
            xmlFiles = await glob(`src/data/${this.source_language_key}/mods/**/*.xml`)
        }

        if (xmlFiles.length > 0) {
            const db = new Database()
            const chatgpt = new ChatGPT()

            await db.populateDicc()

            if (reverse) {
                xmlFiles.reverse()
            }

            for (let i = 0; i < xmlFiles.length; i++) {
                const file = xmlFiles[i]
                const filename = path.basename(file)

                if (this.blacklist.includes(filename)) {
                    continue
                }

                // Read original xml file
                const xml = new EFPXML(__dirname + '/../../' + file)
                const json = xml.read()

                // Get root element and consume it

                const elements = json.elements.find(
                    (element: any) => element.name === 'string_table'
                ).elements

                for (let index = 0; index < elements.length; index++) {
                    const id = elements[index].attributes ? elements[index].attributes.id : null

                    if (id) {
                        const text = elements[index].elements[0].elements
                            ? elements[index].elements[0].elements[0].text
                            : ' '

                        const dbTranslation = await db.get(filename, id)

                        let finalText = text

                        if (dbTranslation) {
                            finalText = dbTranslation
                        } else {
                            finalText = await chatgpt.translate(id, text)

                            if (finalText) {
                                await db.create(filename, id, text, finalText)
                            }
                        }
                    }
                }
            }

            console.log(chalk.green('[DONE] Errors:' + db.errors))
        }
    }

    async build() {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)

        const db = new Database()
        await db.populateDicc()

        // get all distinct filenames
        const filenames = db.dicc.map((item) => item.filename)
        const files = [...new Set(filenames)]

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const translations = db.dicc.filter((item) => item.filename === file)

            const xml = new EFPXML(
                `${__dirname}/../../src/data/${this.target_language_key}/${file}`
            )
            xml.write(file, translations)
        }
    }
}

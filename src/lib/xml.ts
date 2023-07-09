import * as windows1251 from 'windows-1251'
import * as windows1252 from 'windows-1252'
import path from 'path'
import fs from 'fs'
import xml from 'xml-js'
import chalk from 'chalk'
import { Dicc } from './database.ts'

export class EFPXML {
    filePath: string
    private target_language_key = process.env.TARGET_LANGUAGE_KEY || 'spa'

    constructor(filePath: string) {
        this.filePath = filePath
    }

    read(): any {
        console.log('[XML] Reading file: ' + this.filePath)
        const data = fs.readFileSync(this.filePath)

        let text = windows1251.decode(data.toString('binary')).replace(/&(?!\w+;)/g, '&amp;')
        const res = xml.xml2js(text, { ignoreComment: true, sanitize: true })

        return res
    }

    htmlEntities(encodedString: string) {
        var translate_re = /&(nbsp|amp|quot|lt|gt);/g
        var translate: any = {
            nbsp: ' ',
            amp: '&',
            quot: '"',
            lt: '<',
            gt: '>',
        }
        return encodedString
            .replace(translate_re, function (match, entity) {
                return translate[entity]
            })
            .replace(/&#(\d+);/gi, function (match, numStr) {
                var num = parseInt(numStr, 10)
                return String.fromCharCode(num)
            })
    }

    write(filename: string, items: Dicc[]) {
        const data: any = {
            _declaration: {
                _attributes: {
                    version: '1.0',
                    encoding: 'windows-1252',
                },
            },
            string_table: {
                string: [],
            },
        }

        for (let u = 0; u < items.length; u++) {
            const translation = items[u]
            const string = {
                _attributes: {
                    id: translation.key,
                },
                text: {
                    _text: this.htmlEntities(translation.value.replace('&amp;', '&')),
                },
            }

            data.string_table.string.push(string)
        }

        let js2xml = windows1252.decode(
            xml.json2xml(JSON.stringify(data), { compact: true, spaces: 4 }),
            { mode: 'replacement' }
        )

        const basename = path.basename(this.filePath)
        const dirname = path.dirname(this.filePath) + '/../' + this.target_language_key + '/'
        const newFilePath = `${dirname}/${basename}`

        console.log(chalk.green('[XML] Creating translation: ' + newFilePath))
        fs.writeFileSync(newFilePath, js2xml, { encoding: 'binary' })
    }
}

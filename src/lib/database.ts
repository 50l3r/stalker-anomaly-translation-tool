import { Directus, IAuth, ID, TypeMap } from '@directus/sdk'
import chalk from 'chalk'

type Translation = {
    id: ID
    user_created: string
    user_updated: string
    date_created: string
    date_updated: string
    filename: string
    key: string
    value_en: string
    value_es: string
    status: string
}

type Collections = {
    Translations: Translation
}

export type Dicc = {
    id: ID
    filename: string
    key: string
    value: string
}

export class Database {
    private directus: Directus<Collections, IAuth>
    public dicc: Dicc[] = []
    public errors = 0

    constructor() {
        this.directus = new Directus<Collections>(process.env.DIRECTUS_URL || '', {
            auth: { staticToken: process.env.DIRECTUS_STATIC_TOKEN || '' },
        })
    }

    async populateDicc() {
        try {
            console.log(chalk.blue(`[DB] Populating dicc...`))

            const items = await this.directus.items('Translations').readByQuery({
                fields: ['id', 'filename', 'key', 'value_es'],
                limit: -1,
            })

            if (items.data) {
                this.dicc = items.data.map((item) => {
                    return {
                        id: item.id,
                        filename: item.filename,
                        key: item.key,
                        value: item.value_es,
                    }
                })
            }
        } catch (error) {
            console.error(error)
        }
    }

    async get(filename: string, key: string) {
        try {
            const item = this.dicc.find((item) => {
                return item.filename === filename && item.key === key
            })

            if (item) {
                console.log(chalk.blue(`[DB] Getting stored translation from dicc: ${key}`))
                return item.value
            } else {
                const result = await this.directus.items('Translations').readByQuery({
                    fields: ['*'],
                    filter: {
                        key: {
                            _eq: key,
                        },
                        filename: {
                            _eq: filename,
                        },
                    },
                })

                if (result.data && result.data.length > 0) {
                    const item = result.data[0]
                    console.log(chalk.blue(`[DB] Getting stored translation: ${key}`))

                    return item.value_es
                }
            }

            return false
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async getId(filename: string, key: string) {
        try {
            const result = await this.directus.items('Translations').readByQuery({
                fields: ['id'],
                filter: {
                    key: {
                        _eq: key,
                    },
                    filename: {
                        _eq: filename,
                    },
                },
            })

            if (result.data && result.data.length > 0) {
                const item = result.data[0]
                console.log(chalk.blue(`[DB] Getting stored translation: ${key}`))

                return item.id
            }

            return false
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async create(filename: string, key: string, value_en: string, value_es: string) {
        try {
            console.log(chalk.green(`[DB] Creating translation: ${key}`))

            await this.directus.items('Translations').createOne({
                filename: filename,
                key: key,
                value_en: value_en
                    .replace(new RegExp('пїЅ', 'g'), '-')
                    .replace(/[^\x00-\x7F]/g, ''),
                value_es: value_es
                    .replace(new RegExp('пїЅ', 'g'), '-')
                    .replace(/[^\x00-\x7F]/g, ''),
            })

            return true
        } catch (error) {
            console.error(error)
            this.errors++
            return false
        }
    }

    async update(
        id: ID,
        filename: string,
        key: string,
        value_es: string,
        status: string,
        replace = true
    ) {
        try {
            console.log(chalk.green(`[DB] Updating translation: ${key}`))

            let text = value_es
            if (replace) {
                text = value_es.replace(new RegExp('пїЅ', 'g'), '-').replace(/[^\x00-\x7F]/g, '')
            }

            await this.directus.items('Translations').updateOne(id, {
                filename: filename,
                key: key,
                value_es: text,
                status: status,
            })

            return true
        } catch (error) {
            console.error(error)
            this.errors++
            return false
        }
    }

    async removeDuplicates() {
        console.log(chalk.blue(`[DB] Finding duplicates on dicc...`))

        const duplicates = this.dicc.filter((item, index, self) => {
            return (
                index !==
                self.findIndex((t) => {
                    return t.filename === item.filename && t.key === item.key
                })
            )
        })

        await this.directus.items('Translations').deleteMany(duplicates.map((item) => item.id))
    }

    async findByText(text: string, command: '_starts_with' | '_eq' | '_contains') {
        try {
            const result = await this.directus.items('Translations').readByQuery({
                fields: ['*'],
                filter: {
                    value_es: {
                        [command]: text,
                    },
                },
            })

            if (result.data && result.data.length > 0) {
                return result.data
            }

            return false
        } catch (error) {
            console.error(error)
            return false
        }
    }
}

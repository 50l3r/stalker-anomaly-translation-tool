import { Configuration, OpenAIApi } from 'openai'
import chalk from 'chalk'

export class ChatGPT {
    private openai: OpenAIApi
    private source_language = process.env.SOURCE_LANGUAGE || 'english'
    private target_language = process.env.TARGET_LANGUAGE || 'spanish'

    constructor() {
        this.openai = new OpenAIApi(
            new Configuration({
                apiKey: process.env.OPENAI_API_KEY || '',
            })
        )
    }

    sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async translate(title: string, prompt: string): Promise<string | boolean> {
        const waitTime = 20000

        const makeRequest = async () => {
            try {
                if (prompt.length <= 2) {
                    console.log(
                        chalk.yellow(
                            '[CHATGPT] Passing translation: ' + title + '. Its to short: ' + prompt
                        )
                    )

                    return prompt
                } else {
                    console.log('[CHATGPT] Translating: ' + title)
                }

                const completion = await this.openai.createChatCompletion({
                    model: 'gpt-3.5-turbo-16k',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translation engine. Please translate the text into Spanish without explanation. When the text has only one word, please act as a professional ${this.source_language}-${this.target_language} dictionary, and list the original form of the word (if any). If the text has line breaks represented as "\n" or "\r" do not convert them and leave them as they are. If you find variables leave them as they are.`,
                        },
                        {
                            role: 'user',
                            content: `${prompt}`,
                        },
                    ],
                    max_tokens: 1000,
                    temperature: 0,
                    top_p: 1,
                    frequency_penalty: 1,
                    presence_penalty: 1,
                })

                const text = completion.data.choices[0].message?.content

                if (text) {
                    return text
                }

                return false
            } catch (error: any) {
                const code = error.response ? error.response.status : 0
                const text = error.response ? error.response.statusText : 'Unknown error'
                if (code > 0) {
                    console.error(chalk.red(`[CHATGPT] Error ${code}: ${text}`))
                } else {
                    console.error(error)
                }

                return false
            }
        }

        const timer = new Promise((_, reject) =>
            setTimeout(reject, waitTime, { timedout: 'request taking a long time' })
        )

        try {
            const res = await Promise.race([makeRequest(), timer])

            if (typeof res === 'string') {
                return res
            }

            return false
        } catch (error: any) {
            if (!error.handled) {
                if (error.timedout) {
                    console.log(chalk.red(`[CHATGPT] Request ${title} timed out: +${waitTime}ms`))
                } else {
                    console.log(error)
                    error.handled = true
                }
            }

            return false
        }
    }
}

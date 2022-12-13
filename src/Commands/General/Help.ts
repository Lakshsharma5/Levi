import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('help', {
    description: "Displays the bot's usable commands",
    aliases: ['h'],
    cooldown: 10,
    exp: 20,
    usage: 'help || help <command_name>',
    category: 'general'
})
export default class extends BaseCommand {
    public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) {
            let commands = Array.from(this.handler.commands, ([command, data]) => ({
                command,
                data
            })).filter((command) => command.data.config.category !== 'dev')
            const { nsfw } = await this.client.DB.getGroup(M.from)
            if (!nsfw) commands = commands.filter(({ data }) => data.config.category !== 'nsfw')
            const buffer = await this.client.utils.getBuffer('https://telegra.ph/file/683dcec07b801f2e83bf2.mp4')
            let text = `👋🏻 (💙ω💙) Konnichiwa senpai! *@${M.sender.jid.split('@')[0]}*, I'm ${
                this.client.config.name
            }\n🔮My prefix is - "${this.client.config.prefix}"\n\nThe usable commands are listed below.\n\n💙✨Use #support To Join our Casino group 🤍✨.`
            const categories: string[] = []
            const sections: proto.ISection[] = []
            for (const command of commands) {
                if (categories.includes(command.data.config.category)) continue
                categories.push(command.data.config.category)
            }
            for (const category of categories) {
                const categoryCommands: string[] = []
                const filteredCommands = commands.filter((command) => command.data.config.category === category)
                text += `\n\n*━━━❰ ${this.client.utils.capitalize(category)} ❱━━━*\n\n`
                filteredCommands.forEach((command) => categoryCommands.push(command.data.name))
                text += `\`\`\`${categoryCommands.join(', ')}\`\`\``
            }
           for (const category of categories) {
                const rows: proto.IRow[] = []
                const filteredCommands = commands.filter((command) => command.data.config.category === category)
                filteredCommands.forEach((command) => rows.push(
                    {
                        title: `${this.client.utils.capitalize(command.data.name)}`,
                        rowId: `${this.client.config.prefix}help ${command.data.name}`
                    }
                ))
                sections.push({ title: this.client.utils.capitalize(category), rows })
            }
            text += `\n\n📕 *Note:* Use ${this.client.config.prefix}help <command_name> for more info of a specific command. Example: *${this.client.config.prefix}help hello*`
            return void M.reply(
                text,
                'text',
                undefined,
                undefined,
                undefined,
                [M.sender.jid],
                undefined,
                undefined,
                undefined,
                {
                    sections,
                    buttonText: 'Help List'
                }
            )
        } else {
            const cmd = context.trim().toLowerCase()
            const command = this.handler.commands.get(cmd) || this.handler.aliases.get(cmd)
            if (!command) return void M.reply(`No command found | *"${context.trim()}"*`)
            return void M.reply(
                `🎐 *Command:* ${this.client.utils.capitalize(command.name)}\n🎴 *Aliases:* ${
                    !command.config.aliases
                        ? ''
                        : command.config.aliases.map((alias) => this.client.utils.capitalize(alias)).join(', ')
                }\n🔗 *Category:* ${this.client.utils.capitalize(command.config.category)}\n⏰ *Cooldown:* ${
                    command.config.cooldown ?? 3
                }s\n🎗 *Usage:* ${command.config.usage
                    .split('||')
                    .map((usage) => `${this.client.config.prefix}${usage.trim()}`)
                    .join(' | ')}\n🧧 *Description:* ${command.config.description}`
            )
        }
    }
}
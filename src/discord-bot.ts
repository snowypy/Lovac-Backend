import { Client, GatewayIntentBits, ChannelType, ActivityType, TextChannel, ThreadChannel, PermissionsBitField, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild } from "discord.js";
import { Ticket } from "./models/Ticket";
import { Message as TicketMessage } from "./models/Message";
import { AppDataSource } from "./data-source";
import { Team } from "./models/Team";
import dotenv from "dotenv";

dotenv.config();

export const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const clientId = process.env.DISCORD_CLIENT_ID || '';
const guildId = process.env.DISCORD_GUILD_ID || '';

const commands = [
    {
        name: 'sendpanel',
        description: 'Send a panel to create a ticket',
    },
    {
        name: 'unassign',
        description: 'Unassign yourself from the current ticket',
    },
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN || '');

bot.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    bot.user?.setPresence({
        activities: [{ name: 'Awaiting on tickets', type: ActivityType.Watching }],
        status: 'online',
    });
});

const ticketRepository = AppDataSource.getRepository(Ticket);
const teamRepository = AppDataSource.getRepository(Team);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();

bot.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.channel.isThread()) {
        const thread = message.channel as ThreadChannel;
        const ticket = await ticketRepository.findOne({ 
            where: { threadId: thread.id },
            relations: ["assignedGroup"]
        });

        if (ticket && !ticket.assignee) {
            const staffRoleId = process.env.STAFF_ROLE_ID || '1195325706352197683';
            const member = await message.guild?.members.fetch(message.author.id);
            
            if (member?.roles.cache.has(staffRoleId)) {

                const response = await fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ discordId: message.author.id })
                });
        
                if (response.status !== 200) {
                  return;
                }
          
                const staffData = await response.json();
                const staffId = staffData.id;
          
                ticket.assignee = staffId;
                await ticketRepository.save(ticket);

                const assignEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Ticket Assigned')
                    .setDescription(`This ticket has been assigned to ${message.author}`)
                    .setTimestamp();

                await thread.send({ embeds: [assignEmbed] });
            }
        }
    }
});

bot.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === "sendpanel") {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Open a ticket!')
                .setDescription('Click the button below to create a new ticket.\n\nOur standart support are between 8AM and 8PM US Eastern, (8:00 AM and 8:00 PC local time), although we may be able to respond outside of these hours.')
                .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
                .setThumbnail(interaction.guild?.iconURL() as string);

            const button = new ButtonBuilder()
                .setCustomId('createticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            await interaction.reply({ embeds: [embed], components: [row] });
        } else if (interaction.commandName === "unassign") {
            if (!interaction.channel?.isThread()) {
                await interaction.reply({ content: "This command can only be used in ticket threads!", ephemeral: true });
                return;
            }

            const ticket = await ticketRepository.findOne({ 
                where: { threadId: interaction.channel.id },
                relations: ["assignedGroup"]
            });

            if (!ticket) {
                await interaction.reply({ content: "No ticket found for this thread!", ephemeral: true });
                return;
            }

            if (ticket.assignee !== interaction.user.id) {
                await interaction.reply({ content: "You can only unassign tickets that are assigned to you!", ephemeral: true });
                return;
            }

            ticket.assignee = null;
            await ticketRepository.save(ticket);

            const unassignEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('Ticket Unassigned')
                .setDescription(`${interaction.user} has unassigned themselves from this ticket.`)
                .setTimestamp();

            await interaction.reply({ embeds: [unassignEmbed] });

            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}`;
            await interaction.followUp({ content: `View open tickets here: ${redirectUrl}`, ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        const [action, ticketId] = interaction.customId.split("_");

        if (action === "acceptClose") {
            const ticket = await ticketRepository.findOne({
                where: { id: Number(ticketId) },
            });

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Ticket Closed')
                .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`Hey, <@${interaction.user.id}> has accepted the closure of this ticket.\n\nThis thread will be locked in 5 seconds.\n\n**You can go over the ticket transcript by clicking <#1168742611008364644> -> Threads** `)
                .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ content: `<@${interaction.user.id}>,`, embeds: [welcomeEmbed] });

            setTimeout(async () => {
                if (ticket?.threadId) {
                    const thread = await interaction.guild?.channels.fetch(ticket.threadId) as ThreadChannel;
                    if (thread) {
                        await thread.setLocked(true);
                    }
                }

                if (ticket) {
                    ticket.status = "Closed";
                    ticket.dateClosed = new Date();
                    await ticketRepository.save(ticket);
                }
            }, 5000);
        } else if (action === "denyClose") {
            await interaction.reply({ content: `Ticket ${ticketId} remains open.`, ephemeral: false });
        } else if (action === "createticket") {
            console.log('Button interaction received:', interaction);

            const channel = interaction.channel;

            if (!channel) {
                console.error('Channel is undefined.');
                await interaction.reply({ content: 'Channel not found.', ephemeral: true });
                return;
            }

            if (!("threads" in channel)) {
                console.error('Channel does not support threads.');
                await interaction.reply({ content: 'This channel does not support threads.', ephemeral: true });
                return;
            }

            try {
                const tickets = await ticketRepository.find();
                const ticketCount = tickets.length;
                const newTicketNumber = ticketCount + 1;
                const formattedTicketNumber = String(newTicketNumber).padStart(4, '0');

                const thread = await (channel as TextChannel).threads.create({
                    name: `ticket-${formattedTicketNumber}`,
                    autoArchiveDuration: 60,
                    type: ChannelType.PrivateThread,
                    reason: `Ticket created by ${interaction.user.username}`,
                });

                await interaction.reply({ content: `Hey <@${interaction.user.id}>, your new ticket has been created. <#${thread.id}>`, ephemeral: true });

                if (thread) {
                    const welcomeEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Ticket Created')
                        .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Thank you for creating a ticket in **${interaction.guild?.name}**.\n\nPlease explain your issue and provide the following info:\n\n - Username\n - Clip (For report / appeal)\n - Transaction ID (For purchase issues)\n - Any other relevant information\n\n**A staff member will be with you shortly, there are currently ${ticketCount} other tickets open.**`)
                        .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
                        .setTimestamp();

                    await thread.send({ content: `<@${interaction.user.id}>,`, embeds: [welcomeEmbed] });

                    const ticket = new Ticket();
                    ticket.assignee = null;
                    ticket.tags = [];
                    ticket.status = "Open";
                    ticket.messages = [];
                    ticket.dateOpened = new Date();
                    ticket.dateClosed = null;
                    ticket.categories = ["Open", "All"];
                    ticket.threadId = thread.id;
                    ticket.ownerId = interaction.user.id;

                    await ticketRepository.save(ticket);
                    const openTickets = await ticketRepository.find({
                        where: { status: "Open" },
                    });

                    const openTicketCount = openTickets.length;

                    bot.user?.setPresence({
                        activities: [{ name: `${openTicketCount} open tickets`, type: ActivityType.Watching }],
                        status: "dnd",
                    });
                    console.log('Ticket saved:', ticket);
                    checkOpenTickets();
                }
            } catch (error) {
                console.error('Error creating ticket thread:', error);
                await interaction.reply({ content: 'There was an error creating the ticket. Please try again later.', ephemeral: true });
            }
        } else if (action === "requestHigherUp") {
            const ticket = await ticketRepository.findOne({
                where: { id: Number(ticketId) },
                relations: ["assignedGroup"]
            });

            if (ticket) {
                ticket.assignee = null;

                const adminTeam = await teamRepository.findOne({ where: { name: "Admin Team" } });
                if (adminTeam) {
                    ticket.assignedGroup = adminTeam;
                    await ticketRepository.save(ticket);

                    const higherUpEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Higher-up Requested')
                        .setDescription('This ticket has been escalated to the Admin Team.')
                        .setTimestamp();

                    await interaction.reply({ embeds: [higherUpEmbed] });
                }
            }
        }
    }
});

const definedChannelId = process.env.HIGH_TICKET_CHANNEL_ID || '1289334534063783977';

const checkOpenTickets = async () => {
    const openTickets = await ticketRepository.find({
        where: { status: "Open" },
    });

    const openTicketCount = openTickets.length;

    if (openTicketCount > 10) {
        const extraTickets = openTicketCount - 10;
        const messagesToSend = Math.floor(extraTickets / 5);

        for (let i = 0; i < messagesToSend; i++) {
            const channel = await bot.channels.fetch(definedChannelId);
            if (channel && (channel instanceof TextChannel)) {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Open Tickets Alert')
                    .setDescription(`There are currently ${openTicketCount} open tickets. Get to closing 'em!`)
                    .setTimestamp();

                await channel.send({ content: '<@&1195325763923226686>', embeds: [embed] });
            }
        }
    }
};

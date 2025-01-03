"use strict";
// [@] Features:
// - [x] Button to blacklist if user is not blacklisted
// - [x] Button to unblacklist if user is blacklisted
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInsight = void 0;
const discord_js_1 = require("discord.js");
const data_source_1 = require("../data-source");
const User_1 = require("../models/User");
const discord_bot_1 = require("../discord-bot");
const userInsight = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const userId = (_b = (_a = interaction.options.get('user')) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.toString();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('User Insight')
        .setDescription('🔍 Processing user insight request...')
        .addFields({ name: 'Status', value: '⚙️ Querying database...' })
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(((_c = interaction.client.users.cache.get(userId || '')) === null || _c === void 0 ? void 0 : _c.displayAvatarURL()) || '');
    const reply = yield interaction.reply({ embeds: [embed], ephemeral: false, fetchReply: true });
    if (!userId) {
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Please provide a user to lookup.' })
            .setColor('#ff0000');
        yield interaction.editReply({ embeds: [embed] });
        return;
    }
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = yield userRepository.findOne({ where: { discordId: userId } });
    if (!user) {
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'User not found in the database. This means they have not created any tickets.' })
            .setColor('#ff0000');
        yield interaction.editReply({ embeds: [embed] });
        return;
    }
    embed.setFields({ name: 'Status', value: '⚙️ Checking staff status...' });
    yield interaction.editReply({ embeds: [embed] });
    const { openTickets, totalTickets, isBlacklisted } = user;
    let staffValue = false;
    const isStaff = (_e = (_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.members.cache.get(userId)) === null || _e === void 0 ? void 0 : _e.roles.cache.has('721017166652244018');
    if (isStaff) {
        try {
            const response = yield fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ discordId: userId })
            });
            const isStaffResponse = yield response.json();
            staffValue = isStaffResponse.isStaff;
        }
        catch (error) {
            console.error('[UserInsight] Error checking staff status:', error);
        }
    }
    const statusEmojis = {
        tickets: '🎫',
        blacklisted: isBlacklisted ? '🔒' : '🔓',
        staff: staffValue ? '👨‍💼' : '👤'
    };
    embed.setColor('#00ff00')
        .setTitle('User Insight Results')
        .setDescription('✅ User information retrieved successfully')
        .setFields([
        { name: `${statusEmojis.tickets} Tickets`, value: `Open: ${openTickets}\nTotal: ${totalTickets}`, inline: true },
        { name: `${statusEmojis.blacklisted} Status`, value: `Blacklisted: ${isBlacklisted ? 'Yes' : 'No'}`, inline: true },
        { name: `${statusEmojis.staff} Role`, value: staffValue ? 'Staff Member' : 'Regular User', inline: true }
    ])
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(((_f = interaction.client.users.cache.get(userId || '')) === null || _f === void 0 ? void 0 : _f.displayAvatarURL()) || '')
        .setFooter({ text: 'Lovac', iconURL: (_g = discord_bot_1.bot.user) === null || _g === void 0 ? void 0 : _g.displayAvatarURL() })
        .setTimestamp();
    yield interaction.editReply({ embeds: [embed] });
});
exports.userInsight = userInsight;

const Discord = require("discord.js");
const { token, serverId, channelIds } = require("./config.json");
const { connectToMongoDB, logEntry, logLeave } = require('./models/database');
const timezone = require('./models/timezone');
const moment = require('moment-timezone');
timezone.setDefaultTimezone('Asia/Bangkok')
const totalTimes = new Map();

const Client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Discord.Partials.Message,
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.User,
        Discord.Partials.GuildScheduledEvent,
        Discord.Partials.ThreadMember,
        Discord.Partials.GuildVoiceState
    ]
});

Client.on("ready", (client) => {
    console.log("Bot " + client.user.tag + " is now online!");
    connectToMongoDB();
    totalTimes.forEach((value, key) => {
        displayTotalTime(Client.guilds.cache.get(serverId).members.cache.get(key));
    });
});

Client.on("voiceStateUpdate", async (oldState, newState) => {
    if (newState.channelId && newState.guild.id === serverId && newState.channelId === channelIds.voiceChannel) {
        const entry = {
            username: newState.member.user.username,
            userId: newState.member.id,
            action: "join",
            timestamp: moment().tz('Asia/Bangkok').format(),
        };

        await logEntry(newState, entry);
    }

    if (oldState.channelId === channelIds.voiceChannel && !newState.channelId) {
        const entry = {
            username: oldState.member.user.username,
            userId: oldState.member.id,
            action: "leave",
            timestamp: moment().tz('Asia/Bangkok').format(),
        };

        await logLeave(oldState, entry);
    }
});

Client.login(token);
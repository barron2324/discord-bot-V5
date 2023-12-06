const mongoose = require("mongoose");
const { mongodb } = require("../config.json");
const moment = require('moment-timezone');
const timezone = require('./timezone');
const { channelenter, channelleave, channeltotaltime } = require("../config.json");
const { LogEntry } = require ("../schema/log-enter")
const { LogLeave } = require ("../schema/log-leave")
const { TotalTimel, saveTotalTime } = require ("../schema/total-time")
timezone.setDefaultTimezone('Asia/Bangkok');
const userTimeMap = new Map();
const totalTimes = new Map();

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongodb);
        console.log('connected to mongoDB!')
    } catch (error) {
        console.log('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MongoDB', error)
    }
};

async function logEntry(newState, entry) {
    try {
        const logEntry = new LogEntry({
            ...entry,
            timestamp: moment(entry.timestamp).tz('Asia/Bangkok').toDate(),
        });
        await logEntry.save();
        console.log("Entry logged:", entry);

        const channel = newState.guild.channels.cache.get(channelenter);
        if (channel) {
            channel.send(`\`\`\`User ${entry.username} joined the voice channel at ${entry.timestamp}\`\`\``);
        }

        const today = moment().tz('Asia/Bangkok').startOf('day');
        const userId = entry.userId;

        if (!userTimeMap.has(userId) || !userTimeMap.get(userId).lastJoinDate.isSame(today, 'day')) {
            userTimeMap.set(userId, {
                joinTime: entry.timestamp,
                lastJoinDate: today,
            });

            await saveTotalTime(userId, entry.username, 0);

        } else {
        }

    } catch (error) {
        console.error("Error logging entry:", error.message);
    }
}

async function logLeave(newState, entry) {
    try {
        const logEntry = new LogLeave({
            ...entry,
            timestamp: moment(entry.timestamp).tz('Asia/Bangkok').toDate(),
        });
        await logEntry.save();
        console.log("Leave logged:", entry);

        const channel = newState.guild.channels.cache.get(channelleave);
        if (channel) {
            channel.send(`\`\`\`User ${entry.username} left the voice channel at ${entry.timestamp}\`\`\``);
        }

        if (userTimeMap.has(entry.userId)) {
            const joinTime = moment(userTimeMap.get(entry.userId).joinTime);
            const leaveTime = moment(entry.timestamp);
            const duration = moment.duration(leaveTime.diff(joinTime));

            if (totalTimes.has(entry.userId)) {
                const totalTime = totalTimes.get(entry.userId);
                totalTimes.set(entry.userId, totalTime + duration.asMinutes());
            } else {
                totalTimes.set(entry.userId, duration.asMinutes());
            }

            saveTotalTime(entry.userId, entry.username, totalTimes.get(entry.userId));
        }

        if (channeltotaltime) {
            const totalTimeInMinutes = totalTimes.get(entry.userId);
            const hours = Math.floor(totalTimeInMinutes / 60);
            const minutes = Math.floor(totalTimeInMinutes % 60);
            const seconds = Math.round((totalTimeInMinutes % 1) * 60);
            const totalChannel = newState.guild.channels.cache.get(channeltotaltime);
            if (totalChannel) {
                totalChannel.send(`\`\`\`User ${entry.username} spent a total of ${hours} hours, ${minutes} minutes, ${seconds} seconds in the voice channel.\`\`\``);
            } else {
                console.error(`Error: Channel with ID ${channeltotaltime} not found.`);
            }
        }

        userTimeMap.delete(entry.userId);
    } catch (error) {
        console.error("Error logging leave entry:", error.message);
    }
}

module.exports = {
    connectToMongoDB,
    logEntry,
    logLeave
};

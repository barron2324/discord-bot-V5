const mongoose = require("mongoose");
const moment = require("moment-timezone");

const TotalTimeSchema = new mongoose.Schema({
    discordName: String,
    discordId: String,
    totalTime: {
        hours: String,
        minutes: String,
        seconds: String
    },
    createdAt: { type: Date, default: Date.now }
});

const TotalTime = mongoose.model("TotalTime", TotalTimeSchema);

function convertUtcToBangkok(utcDate) {
    return moment.utc(utcDate).tz('Asia/Bangkok');
}

async function saveTotalTime(userId, discordName, totalTime) {
    try {
        const roundedTotalTime = totalTime;
        const bangkokTime = convertUtcToBangkok(new Date());
        const hours = Math.floor(totalTime / 60);
        const minutes = Math.floor(totalTime % 60);
        const seconds = Math.round((totalTime % 1) * 60);

        const today = moment().tz('Asia/Bangkok').startOf('day');
        const existingTotalTime = await TotalTime.findOne({
            discordId: userId,
            createdAt: { $gte: today.toDate() },
        });

        if (existingTotalTime) {
            existingTotalTime.totalTime = {
                hours: hours.toString(),
                minutes: minutes.toString(),
                seconds: seconds.toString(),
            };
            await existingTotalTime.save();
            console.log(`Total time for User ${discordName} updated: ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
        } else {
            const totalTimeEntry = new TotalTime({
                discordName,
                discordId: userId,
                totalTime: {
                    hours: hours.toString(),
                    minutes: minutes.toString(),
                    seconds: seconds.toString(),
                },
                createdAt: bangkokTime,
            });
            await totalTimeEntry.save();
            console.log(`Total time for User ${discordName} saved: ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
        }

    } catch (error) {
        console.error("Error saving total time entry:", error.message);
    }
}

module.exports = {
    TotalTime,
    saveTotalTime
};

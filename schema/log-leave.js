const mongoose = require("mongoose");

const LogLeaveSchema = new mongoose.Schema({
    username: String,
    userId: String,
    action: String,
    timestamp: Date,
});

const LogLeave = mongoose.model("LogLeave", LogLeaveSchema);

module.exports = {
    LogLeave,
};

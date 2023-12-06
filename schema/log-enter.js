const mongoose = require("mongoose");

const LogEntrySchema = new mongoose.Schema({
    username: String,
    userId: String,
    action: String,
    timestamp: Date,
});

const LogEntry = mongoose.model("LogEntry", LogEntrySchema);

module.exports = {
    LogEntry,
};

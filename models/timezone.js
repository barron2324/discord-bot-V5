const moment = require('moment-timezone');

function setDefaultTimezone(timezone) {
    moment.tz.setDefault(timezone);
}

function convertToUTC(timestamp) {
    return moment(timestamp).utc().toDate();
}

module.exports = {
    setDefaultTimezone,
    convertToUTC,
};
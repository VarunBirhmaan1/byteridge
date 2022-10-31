const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersLogs = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    loginTime: Date,
    logoutTime: Date,
}, { timestamps: true });

// usersLogs.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UsersLogs', usersLogs);
const config = require('config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const mongoose = require('mongoose');
const { UsersLogs } = require('../_helpers/db');
const User = db.User;
const UserLogs = db.UsersLogs;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    audit,
    logout,
};

async function authenticate({ username, password }) {
    // console.log(username, password)
    try {
        const user = await User.findOne({ username });
        if (user && bcrypt.compareSync(password, user.hash)) {
            const { hash, ...userWithoutHash } = user.toObject();
            const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '1d' });
            let loginTime = Date.now();
            const userLogs = await UserLogs.create({
                userId: user._id,
                loginTime,
            })
            return {
                ...userWithoutHash,
                userLogs,
                token
            };
        }
    } catch (error) {
        console.log('error', error)
    }

}

async function logout(username, loginID) {
    try {
        // const user = await User.findOne({ username : username , loginID : loginID });
        let logoutTime = Date.now();
        const userLogs = await UserLogs.findByIdAndUpdate({
            _id: loginID
        },
            { logoutTime: logoutTime }
            , {
                new: true
                , useFindAndModify: false
            })
        return {
            userLogs
        };
    }
    catch (err) {
        console.log(err)
    }

}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam, clientIP) {
    // console.log(userParam)
    console.log(clientIP)
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    let obj = {
        username: userParam.username,
        password: userParam.password,
        firstName: userParam.firstName,
        lastName: userParam.lastName,
        clientIP: clientIP,
        role: userParam.role,
    }

    const user = new User(obj);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}

async function audit(username) {
    let userIsValid = await User.findOne({ username: username, role: 'AUDITOR' })
    if (!userIsValid) {
        return
    }
    return await UsersLogs.find({}).populate("userId").lean();

}


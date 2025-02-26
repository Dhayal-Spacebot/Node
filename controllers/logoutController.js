const usersDB = {
    users: require('../data/users.json'),
    setUsers: function (data) {this.users = data}
}

const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.jwt) return res.sendStatus(204); // no-content
    const refreshToken = cookie.jwt;

    // is refreshToken in db
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if(!foundUser) {
        res.clearCookie('jwt', {httpOnly: true,  sameSite: 'None', secure: true,});
        return res.sendStatus(204);
    }

    // delete refreshToken in db

    const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    const currentUser = {...foundUser, refreshToken: ''};

    usersDB.setUsers([...otherUsers,currentUser]);

    await fsPromises.writeFile(
        path.join(__dirname, '..', 'data', 'users.json'),
        JSON.stringify(usersDB.users)
    )

    res.clearCookie('jwt', {httpOnly: true,  sameSite: 'None', secure: true,});
    res.sendStatus(204);
}

module.exports = {handleLogout}
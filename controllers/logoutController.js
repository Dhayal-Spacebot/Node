const User = require('../data/User');

const handleLogout = async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.jwt) return res.sendStatus(204); // no-content
    const refreshToken = cookie.jwt;

    // is refreshToken in db
    const foundUser = await User.findOne({refreshToken}).exec();
    if(!foundUser) {
        res.clearCookie('jwt', {httpOnly: true,  sameSite: 'None', });
        return res.sendStatus(204);
    }

    // delete refreshToken in db
    foundUser.refreshToken = '';
    const result = await foundUser.save();
    console.log(result)

    res.clearCookie('jwt', {httpOnly: true,  sameSite: 'None', });
    res.sendStatus(204);
}

module.exports = {handleLogout}
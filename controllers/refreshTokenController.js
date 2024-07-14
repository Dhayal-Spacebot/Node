const User = require('../data/User');

const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res)=> {
    const cookie = req.cookies;
    console.log('cookie',req.cookies);
    if(!cookie?.jwt) return res.sendStatus(401);
    const refreshToken = cookie.jwt;

    const foundUser = await User.findOne({refreshToken}).exec();
    if(!foundUser) return res.sendStatus(403);

    //evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {UserInfo: {
                    "roles": roles,
                    "username": decoded.username
                 }},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '30s'}
            );
            res.json({accessToken})
        }
    )
}

module.exports = {handleRefreshToken}
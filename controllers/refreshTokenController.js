const usersDB = {
    users: require('../data/users.json'),
    setUsers: function (data) {this.users = data}
}

const jwt = require('jsonwebtoken');

const handleRefreshToken = (req, res)=> {
    const cookie = req.cookies;
    console.log('cookie',req.cookies);
    if(!cookie?.jwt) return res.sendStatus(401);
    const refreshToken = cookie.jwt;

    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if(!foundUser) return res.sendStatus(403);

    //evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.userName !== decoded.username) return res.sendStatus(403);
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {UserInfo: {
                    "roles": roles,
                    "username": decoded.userName
                 }},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '30s'}
            );
            res.json({accessToken})
        }
    )
}

module.exports = {handleRefreshToken}
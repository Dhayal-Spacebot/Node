const usersDB = {
    users: require('../data/users.json'),
    setUsers: function(data) {this.users = data}
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fsPromises = require('fs').promises;


const handleLogin = async (req, res) => {
    const {user, pwd} = req.body;
    if(!user || !pwd)
        return res.status(400).json({"message": "username and password is required"});

    // verify user exist or not
    const foundUser = usersDB.users.find(person => person.userName === user);

    if(!foundUser)
        return res.sendStatus(401); // unauthorized

    try {
        const match = await bcrypt.compare(pwd, foundUser.password);
        const roles = Object.values(foundUser.roles);
        if(match){
            // create JWTs
            const accessToken = jwt.sign( 
                 {UserInfo: {
                    "roles": roles,
                    "username": foundUser.userName
                 }},
                 process.env.ACCESS_TOKEN_SECRET,
                 {expiresIn: '30s'}
                );

            const refreshToken = jwt.sign( 
                    {"username": foundUser.userName},
                    process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn: '1d'}
                   );

            // save the refresh token with currently logged in user

            const otherUsers = usersDB.users.filter(person => person.userName !== user);
            const currentUser = {...foundUser,refreshToken};
            usersDB.setUsers([...otherUsers,currentUser]);
            await fsPromises.writeFile(
                path.join(__dirname,'..','data','users.json'),
                JSON.stringify(usersDB.users)
            )
            res.cookie('jwt',refreshToken, {httpOnly: true,  sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000});
            res.json({
                'message': `user ${user} is logged in`,
                accessToken
            })
        } else{
            res.sendStatus(401)
        }
    } catch (error){
        console.log(error);
        res.status(500).json({'error': error.message})
    }
}

module.exports = {handleLogin}
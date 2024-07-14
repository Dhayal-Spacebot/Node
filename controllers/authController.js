const User = require('../data/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const {user, pwd} = req.body;
    if(!user || !pwd)
        return res.status(400).json({"message": "username and password is required"});

    // verify user exist or not
    const foundUser = await User.findOne({username: user}).exec();

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
                    "username": foundUser.username
                 }},
                 process.env.ACCESS_TOKEN_SECRET,
                 {expiresIn: '300s'}
                );

            const refreshToken = jwt.sign( 
                    {"username": foundUser.username},
                    process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn: '1d'}
                   );

            // save the refresh token with currently logged in user
            foundUser.refreshToken = refreshToken;
            const result = await foundUser.save();
            console.log(result);

            res.cookie('jwt',refreshToken, {httpOnly: true,  sameSite: 'None',  maxAge: 24 * 60 * 60 * 1000});
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
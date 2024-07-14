const User = require('../data/User');
const bcrypt = require('bcrypt');

const handleNewUser = async(req, res) => {
    const {user, pwd} = req.body;
    if(!user || !pwd)
        return res.status(400).json({"Message": 'Username and password are required'});

    // check for the duplicate userName in the database
    const duplicateUser = await User.findOne({username: user}).exec();
    if(duplicateUser)
        return res.status(409).json({"Message": "Username already exist in the database"})

        try{
            // encrypt the password
            const hashedPwd = await bcrypt.hash(pwd,10);
            // store the hashed password to db
            const newUser = await User.create({
                "username": user,
                 "password": hashedPwd
                });
            console.log(newUser);
            res.status(201).json({'success': `new user ${user} is created!`})

        } catch(error) {
            console.log(error)
            res.status(500).json({'message':error.Message})
        }
}

module.exports = {handleNewUser}

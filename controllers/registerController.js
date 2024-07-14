const usersDB = {
    users: require('../data/users.json'),
    setUsers: function(userData) {this.users = userData}
};

// const User = require('../data/User');

const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const handleNewUser = async(req, res) => {
    const {user, pwd} = req.body;
    if(!user || !pwd)
        return res.status(400).json({"Message": 'Username and password are required'});

    // check for the duplicate userName in the database
    const duplicateUser = usersDB.users.find(person => person.userName === user);
    // const duplicateUser = await User.findOne({username: user}).exec();
    if(duplicateUser)
        return res.sendStatus(409);
        return res.status(409).json({"Message": "Username already exist in the database"})

        try{
            // encrypt the password
            const hashedPwd = await bcrypt.hash(pwd,10);
            // store the hashed password to db
            const newUser = {
                "username": user,
                "roles": {"user": 6791},
                 "password": hashedPwd
                };
            usersDB.setUsers([...usersDB.users, newUser]);
            await fsPromises.writeFile(
                 path.join(__dirname,'..','data','users.json'),
                 JSON.stringify(usersDB.users)
            );
            console.log(usersDB.users);
            console.log(newUser);
            res.status(201).json({'success': `new user ${user} is created!`})

        } catch(error) {
            console.log(error)
            res.status(500).json({'message':error.Message})
        }
}

module.exports = {handleNewUser}

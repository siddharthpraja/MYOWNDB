const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(
    __dirname,
    "..",
    "data",
    "users.json"
);

function getUsers() {

    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }

    return JSON.parse(
        fs.readFileSync(
            USERS_FILE,
            "utf8"
        )
    );
}


function saveUsers(users) {

    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(
            users,
            null,
            2
        )
    );
}


function findByEmail(email) {

    const users = getUsers();

    return users.find(
        user =>
            user.email ===
            email.toLowerCase()
    );
}


function findById(id) {

    const users = getUsers();

    return users.find(
        user => user.id === id
    );
}


function createUser(user) {

    const users = getUsers();

    users.push(user);

    saveUsers(users);

    return user;
}


module.exports = {
    getUsers,
    saveUsers,
    findByEmail,
    findById,
    createUser
};

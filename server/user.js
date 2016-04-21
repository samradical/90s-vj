var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');

// define the schema for our user model

var User = function() {
    var account = 'rad';
    var password = undefined;
    var username = undefined;

    return {
        account: account,
        username: username,
        password: password
    }
};

User.findOne = function(username) {
    var usersTable = dynasty.table('Users');
    return usersTable.find(username)
};

User.save = function(user) {
    var defer = Q.defer();
    var usersTable = dynasty.table('Users');
    usersTable.insert(user)
        .then(function(resp) {
            defer.resolve();
        })
        .catch(function(err) {
            defer.reject(err);
        })
        .done();
    return defer.promise;
};

// methods ======================
// generating a hash
User.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.validPassword = function(password, encryptedPass) {
    return bcrypt.compareSync(password, encryptedPass);
};

// create the model for users and expose it to our app
module.exports = User;
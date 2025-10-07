/***************************************************************************
* Filename: search.js
* Developer: Jackson Hill
* Date: 3/4/2024
* Notes: MySQL functionality
****************************************************************************/
// Third party libraries
const url = require('url');   
const encryptTool = require('./encrypt.js');
const database = require('./db.js');

module.exports = {

    //Query uses category and search term;
    //Search through all products and select ones that match the criteria in a list
    search: function(req, res, next) {
        var searchTerm = req.query.search;
        var category = req.query.category;

        //Construct MySQL command
        let query = 'SELECT * FROM sales_item WHERE verified = 1 ';

        if (searchTerm != '' && category != '') {
            query += 'AND Category = \'' + category + '\' AND ( Name LIKE \'%' + searchTerm + '%\' OR Description LIKE \'%' + searchTerm + '%\')';
        }
        else if (searchTerm != '' && category == '') {
            query += 'AND Name LIKE \'%' + searchTerm + '%\' OR Description LIKE \'%' + searchTerm + '%\'';
        }
        else if (searchTerm == '' && category != '') {
            query += 'AND Category = \'' + category + '\'';
        }

        //Finally, run the commmand
        database.query(query, (err, result) => {
            if (err) {
                req.searchResult = "";
                req.searchTerm = "";
                req.category = "";
                next();
            }

            req.searchResult = result;
            req.searchTerm = searchTerm;
            req.category = category;

            next();
        });
    },
    
    //Search through and return all categories in a list
    getCategories: function(req, res, next) {
        let query = 'SELECT * FROM categories';

        database.query(query, (err, result) => {
            if (err) {
                req.categoryList = "";
                next();
            }

            req.categoryList = result;

            next();
        });
    },

    //Search through and return all users in a list
    getUsers: function(req, res, next) {
        let query = 'SELECT * FROM user';

        database.query(query, (err, result) => {
            if (err) {
                req.userList = "";
                next();
            }

            req.userList = result;

            next();
        });
    },

    //Search through and return all products in a list
    getProducts: function(req, res, next) {
        let query = 'SELECT * FROM sales_item';

        database.query(query, (err, result) => {
            if (err) {
                req.productList = "";
                next();
            }

            req.productList = result;

            next();
        });
    },

    //Search through products and return those sent from registered user in a list
    getSentProducts: function(req, res, next) {
        let query = 'SELECT * FROM sales_item WHERE Seller = ' + req.session.user_id;

        database.query(query, (err, result) => {
            if (err) {
                req.listingsList = "";
                next();
            }

            req.listingsList = result;

            next();
        });
    },

    //Search through messages and return those sent TO registered user in a list
    getReceivedMessages: function(req, res, next) {
        let query = 'SELECT * FROM Message WHERE CompanyId = ' + req.session.user_id;

        database.query(query, (err, result) => {
            if (err) {
                req.messages = "";
                next();
            }

            req.messages = result;

            next();
        });
    },

    //Search through messages and return those sent FROM registered user in a list
    getSentMessages: function(req, res, next) {
        let query = 'SELECT * FROM Message WHERE BuyerId = ' + req.session.user_id;

        database.query(query, (err, result) => {
            if (err) {
                req.messages = "";
                next();
            }

            req.messages = result;

            next();
        });
    },
    //Search through products and return the one selected from Results page
    getItem: function(req, res, next) {
        let query = 'SELECT * FROM sales_item WHERE id = ' + req.session.product_id;

        database.query(query, (err, result) => {
            if (err) {
                req.result = "";
                next();
            }

            req.result = result;

            next();
        });
    },

    //First check if product doesn't exist
    //If not, add product to database using data struct "info" and redirect user to Confirmation page
    addProduct: function(req, res, info) {
        let sqlSearch = 'SELECT * FROM sales_item WHERE Name = ?'
        let query = 'INSERT INTO sales_item (id, Name, Description, Date, Image, Price, Seller, Category, Verified) VALUES ?';

        database.query(sqlSearch, [info.Name], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.redirect("make-listing")
                return;
            }

            if (result.length != 0) {
                console.error("------> Product already exists")
                res.redirect("make-listing")
                return;
            } 

            database.query(query, [[Object.values(info)]], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.redirect("make-listing")
                    return;
                }

                console.log('Item added successfully');
                res.redirect(url.format({
                    pathname:"/confirmation",
                    query: {
                       "messageId": "listing"
                    }
                }));
                return;
            });
        });
    },

    //Add message to database using data struct "info" and redirect user to Confirmation page
    addMessage: function(req, res, message) {
        let query = 'INSERT INTO Message (MessageId, Date, Message, BuyerId, CompanyId, ProductId) VALUES ?';
        database.query(query, [[Object.values(message)]], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
            console.log('Message sent successfully');
            res.redirect(url.format({
                pathname:"/confirmation",
                query: {
                   "messageId": "message"
                }
            }));
            return;
        });
    },

    //First check if user doesn't exist in database
    //If not, add user to database using data struct "info" and redirect user to Home page
    register: function(req, res, info) {
        
        let sqlSearch = 'SELECT * FROM user WHERE first_name = ?'
        let sqlInsert = 'INSERT INTO user (user_id, first_name, last_name, password, email, registration_date, username) VALUES ?';

        database.query (sqlSearch, [info.first_name], async (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.redirect("signup")
                return false;
            }

            if (result.length != 0) {
                console.error("------> User already exists")
                res.redirect("signup")
                return false;
            } 
            else {
                const hashedPassword = encryptTool.encrypt(info.password);
                console.log("Hashed: " + hashedPassword)
                info.password = hashedPassword

                database.query (sqlInsert, [[Object.values(info)]], (err, result) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        res.redirect("signup")
                        return false;
                    }
                    console.log ("--------> Created new User")
                    res.redirect("/")
                    return true;
                })
            }
        })
    },

    //First check if user exist in database
    //If  so, check if password matches the one the user provides.
    //Finally, if both passwords match, add user id to session and redirect user to previous page
    login: function(req, res, info) {
        let sqlSearch = 'SELECT * FROM user WHERE email = ?'
        database.query (sqlSearch, [info.email], async (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.redirect("login")
                return false;
            }
            
            if (result.length == 0) {
                console.log("--------> User does not exist")
                res.redirect("login")
                return false;
            }
            
            const password = encryptTool.decrypt(result[0].password)
            if (password.localeCompare(info.password)) {
                console.log("---------> Password Incorrect")

                console.log(info.password + " != " + password + "!")
                res.redirect("login")
                return false;
            } 

            console.log("---------> Login Successful")
            req.session.user_id = result[0].user_id;
            req.session.user_name = result[0].first_name;
            if (!req.session.prevPage) {
                res.redirect("/")
            } else {
                res.redirect(req.session.prevPage)
            }
            
            return true;
        })
    }
}

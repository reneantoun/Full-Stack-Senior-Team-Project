/***************************************************************************
* Filename: index.js
* Developer: Jackson Hill
* Date: 2/27/2024
* Notes: This will be the main script for the application to run
****************************************************************************/
// Third party libraryes
const url = require('url');   
const fs = require("fs");
const session = require("express-session");

// Import our custom scripts
const server = require('./scripts/config/server.config.js');
const tools = require('./scripts/models/search.js');

// Setup express
const express = require('express');
const app = express();
require("./scripts/routes.js")(app, __dirname);

// Start the server
app.listen(server.PORT, () => {
    console.log(`Server is running on http://localhost:${server.PORT}`);
});

// Helper function - Checks if file exists in view folder
function checkfile(file) {
    return fs.existsSync("html/" + file) || fs.existsSync("html/" + file + ".html")
}

// For each page, run these three functions to access categories, users, and products
app.use(tools.getCategories, (req, res, next) => {
    next();
});

app.use(tools.getUsers, (req, res, next) => {
    next();
});

app.use(tools.getProducts, (req, res, next) => {
    next();
});

// We need a session to save vital info for each page
app.use(session({
    secret : 'CSC648_Team02',
    resave : true,
    saveUninitialized : true
  }));

// Home page
app.get('/', (req, res) => {
    req.session.prevPage = req.originalUrl

    var categoryList = req.categoryList;

    res.render('home', {
        results: categoryList.length,
        categoryList: categoryList,
        session: req.session
    });
});

// Search Results page
app.get('/results', tools.search, (req, res) => {
    req.session.prevPage = req.originalUrl

    var searchResult = req.searchResult;
    req.session.product_id = null;

    res.render('results', {
        categoryList: req.categoryList,
        session: req.session,

        results: searchResult.length,
        searchTerm: req.searchTerm,
        searchResult: searchResult,
        category: req.category
    });
});


// Listing Info page
app.get('/listing-info', tools.getItem, (req, res) => {
    req.session.prevPage = req.originalUrl

    var result = req.result[0];

    res.render('listing-info', {
        categoryList: req.categoryList,
        session: req.session,

        title: result['Name'],
        description: result['Description'],
        image: result.Image,
        price: result.Price,
        condition: "New"
    });
});

// Message Seller page
app.get('/message-seller', tools.getItem, (req, res) => {
    req.session.prevPage = req.originalUrl

    var result = req.result[0];

    if (!req.session.user_id) {
        res.redirect("/login")
        return;
    }

    res.render('message-seller', {
        categoryList: req.categoryList,
        session: req.session,

        title: result.Name,
        price: result.Price,
        condition: "New"
    });
});

// Upload Listing page
app.get('/make-listing', (req, res) => {
    req.session.prevPage = req.originalUrl

    if (!req.session.user_id) {
        res.redirect("/login")
        return;
    }

    res.render('make-listing', {
        categoryList: req.categoryList,
        session: req.session,
    });
});

// View Received Messages page
app.get('/view-recieved-messages', tools.getReceivedMessages, (req, res) => {
    res.render('view-recieved-messages', {
        categoryList: req.categoryList,
        session: req.session,

        messages: req.messages
    });
});

// View Sent Messages page
app.get('/view-sent-messages', tools.getSentMessages, (req, res) => {
    res.render('view-sent-messages', {
        categoryList: req.categoryList,
        session: req.session,

        messages: req.messages,
        userList: req.userList,
        productList: req.productList
    });
});

// View Sent Listings page
app.get('/view-listings', tools.getSentProducts, (req, res) => {
    var listingsList = req.listingsList;
    res.render('view-listings', {
        categoryList: req.categoryList,
        session: req.session,

        listingsList: listingsList,
        listingLength: listingsList.length
    });
});

// Confirmation page
app.get('/confirmation', (req, res) => {
    res.render('confirmation', {
        categoryList: req.categoryList,
        session: req.session,

        messageId: req.query.messageId
    });
});

// Function to handle the rest of the pages
app.get('/:page', tools.getCategories, (req, res) => {
    let page = req.params.page.toString();
    if (checkfile(page)) {
        res.render(page, {
            categoryList: req.categoryList,
            session: req.session,
    });
    }
    else {
        res.sendStatus(404);
    }
});

// When User hits Search on home page, it'll redirect with category and search
app.post('/', (req, res) => {
    res.redirect(url.format({
        pathname:"/results",
        query: {
           "category": req.body.category,
           "search": req.body.search
        }
    }));
});

// When User clicks on product on Results page, redirect to Listing Info page
app.post('/selectProduct', (req, res) => {
    req.session.product_id = req.body.itemId;
    res.redirect("/listing-info");
});

// When User clicks on Contact Seller on Listing Info page, redirect to Message Seller page
app.post('/requestMessage', (req, res) => {
    res.redirect("/message-seller");
});

// When user registers with all fields filled, add account to database and redirect to Home page
app.post('/register', (req, res) => {

    //Access info from body section
    const username = req.body.name;
    const email = req.body.email;
    const pass1 = req.body.password;
    const pass2 = req.body.passwordConfirm;

    //Check if email field is missing sfsu.edu
    const ext = email.substring(email.length - 8, email.length);
    if (ext != "sfsu.edu") {
        console.log("Please use your sfsu.edu email to register.");
        return false;
    }

    //Check if both passwords match
    if (pass1 != pass2) {
        console.log("Both password fields do not match.");
        return false;
    }

    //Struct for Database
    const info = { 
        user_id: 0,
        first_name: username, 
        last_name: "", 
        password: pass1,
        email: email, 
        registration_date: "2024-05-22",
        username: "user"
    };

    //Register data struct into database
    tools.register(req, res, info)

});

// When user logs in with all fields filled, verify if account exists and confirm password matches.
// If successful, redirect to previous page
app.post('/login', (req, res) => {

    //Access info from body section
    const email = req.body.email;
    const pass = req.body.password;

    //Struct for Database
    const info = { 
        email: email, 
        password: pass
    };

    //Verify login from database using data struct
    tools.login(req, res, info);
});

// When user hits Send with all fields filled, add message to database and redirect to Confirmation page
app.post('/messageSeller', tools.getProducts, (req, res) => {

    //Access info from body section
    var buyerId = req.session.user_id
    var productId = req.session.product_id
    var sellerId = req.productList[productId].Seller

    //Struct for Database
    const info = { 
        MessageId: 0, 
        Date: '2024-05-22 00:00:00',
        Message: req.body.message, 
        BuyerId: buyerId,
        CompanyId: sellerId, 
        ProductId: productId
    };

    //Add data struct into database
    tools.addMessage(req, res, info)
});

// When user hits Send with all fields filled, add listing to database and redirect to Confirmation page
app.post('/addListing', tools.getCategories, (req, res) => {

    //Access info from body section
    const title = req.body.title;
    const description = req.body.description;
    const condition = req.body.condition;
    const category = parseInt(req.body.category);
    const price = parseInt(req.body.price);

    //Struct for Database
    const info = { 
        id: 0,
        Name: title, 
        Description: description, 
        Date: '2024-05-22',
        Image: 'template.png', 
        Price: price, 
        Seller: req.session.user_id,
        Category: category,
        Verified: 0
    };

    //Add data struct into database
    tools.addProduct(req, res, info);
});

// When user hits Log Out, destroy session and redirect back to home page
app.post('/logout', (req, res) => {

	req.session.destroy();
	res.redirect("/");
});


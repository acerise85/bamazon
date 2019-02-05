let mysql = require("mysql");
let inquirer = require("inquirer")

//Connection creation to MySQL
let connection = mysql.createConnection({
    host: "localhost",

    // MySQL Port
    port: 3306,

    // username
    user: "root",

    // password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    productList();


});



//Numbered product list that users can select a product with
function productList() {
    // query the database for all items for purchase
    connection.query("select * from products", function (err, res) {
        if (err) throw err;
        // display all items for sale and ask which item the user would like to purchase
        inquirer
            .prompt([
                {
                    name: "product",
                    type: "input",
                    message: "What would you like to purchase?"
                },
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        let userSelection = [];
                        for (let i = 0; i < res.length; i++) {

                            userSelection.push(res[i].item_id + ": " + res[i].product_name + " Price: " + res[i].price)
                        }
                        return userSelection;
                    },
                },

            ])
            .then(function (answers) {
                //record user's item choice              
                userCart(parseInt(answers.choice.slice(0, 1)));
            })
    })
};

//Quantity function
function userCart(id) {
    console.log(id);
    //query MySQL databse to get item_id to determine the price of the purchase
    connection.query(`SELECT * FROM products WHERE item_id = ${id}`, function (err, result) {

        if (err) throw err;
        //prompt user for quantity of item they are purchasing
        inquirer.prompt([

            {
                name: "quantity",
                type: "number",
                message: "How many would you like to purchase?",
            }

        ])
            .then(function (answers) {
                //variable to hold new stock_quantity amount    
                let newQuantity = result[0].stock_quantity - answers.quantity;
                //total to dispaly to customer for purchase
                let total = result[0].price * answers.quantity;

                if (result[0].stock_quantity > parseInt(answers.quantity)) {
                    //query MySQL database to verify if there are enough items in stock to full fill purchase
                    connection.query(`UPDATE products SET stock_quantity = ${newQuantity} WHERE item_id = ${id}`, function (err, result) {

                        if (err) throw err;

                        console.log(`Congrats you own it now. We charged your card $${total}`);

                    })

                }
                else {
                    console.log("Sorry we do not have that many in stock");
                }
                connection.end();
            })

    });
}
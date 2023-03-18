const { Users, Products, Cart } = require('../Models/Model');

const { readData, updateData, deleteData } = require('../Services/MongoServices');

// const readProducts = async () => {
//     products = await Products.find({});
// }
// fs.readFile('./users.json', 'utf-8', (err, storedData) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     else {
//         users = JSON.parse(storedData);
//     }
// })


// fs.readFile('./products.json', 'utf-8', (err, storedData) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     else {
//         products = JSON.parse(storedData)
//     }
// })


/**
 * @route - /home - GET 
 * @desc - renders home page with 5 products
 */
const home = async (req, res) => {
    // const products = await Products.find({}).limit(5);
    const products = await readData({
        Model: Products,
        limit: { limit: true, limitField: 5 }
    });

    if (req.session.loggedIn) {
        res.render('home', { firstName: req.session.firstName, products, loggedIn: req.session.loggedIn, isAdmin: req.session.isAdmin });
        return;
    }
    else {
        res.render('home', { firstName: null, products, loggedIn: req.session.loggedIn });
        return;
    }
}


/**
 * @route - /loadMore - POST 
 * @desc - returns next 5 products as response.
 */
const loadMore = async (req, res) => {
    const { page } = req.body;
    // let products;
    // products = await Products.find({}).skip((page * 5)).limit(5);
    const products = await readData({
        Model: Products,
        limit: { limit: true, limitField: 5 },
        skip: { skip: true, skipField: page * 5 }
    });

    res.json({ product: products })
}


/**
 * @route - /addToCart - POST 
 * @desc - adds product to cart
 */
const addToCart = async (req, res) => {
    const { _id } = req.body;
    const userId = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    const foundCartItemOfUser = await readData({
        Model: Cart,
        filter: { userId: userId._id, product: _id },
        findOne: true
    });
    if (foundCartItemOfUser) {
        foundCartItemOfUser.quantity += 1;
        await foundCartItemOfUser.save();
    }
    else {
        const cartItem = {
            user: userId,
            product: _id,
            quantity: 1,
            isChecked: false,
        }
        Cart.create(cartItem);
    }
    res.redirect('/cart');
}


/**
 * @route - /cart - GET 
 * @desc - cart page.
 */
const showCart = async (req, res) => {
    const userId = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    // const cartItems = await Cart.find({ user: userId._id }).populate('product');
    const cartItems = await readData({
        Model: Cart,
        filter: { user: userId._id },
        population: { populate: true, field: 'product' }
    })

    res.render('cart', { cartItems, loggedIn: req.session.loggedIn, isAdmin: req.session.isAdmin });
    return;
}



/**
 * @route - /cart/incQuantity - POST 
 * @desc - increments quantity or prouduct.
 */
const incQuantity = async (req, res) => {
    const { _id } = req.body;
    const userId = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    // const foundCartItemOfUser = await Cart.findOne({ user: userId._id, product: _id });
    const foundCartItemOfUser = await readData({
        Model: Cart,
        filter: { user: userId._id, product: _id },
        findOne: true
    })
    foundCartItemOfUser.quantity += 1;
    await foundCartItemOfUser.save();
    return;
}


/**
 * @route - /cart/decQuantity - POST 
 * @desc - decrements quantity or prouduct.
 */
const decQuantity = async (req, res) => {
    const { _id } = req.body;
    const userId = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    const foundCartItemOfUser = await readData({
        Model: Cart,
        filter: { user: userId._id, product: _id },
        findOne: true
    })
    foundCartItemOfUser.quantity -= 1;
    await foundCartItemOfUser.save();
    return;
}

const deleteCartProductPost = async (req, res) => {
    const { _id } = req.body;
    const userId = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    // await Cart.deleteOne({ user: userId._id, product: _id });
    await deleteData({
        Model: Cart,
        filter: { user: userId._id, product: _id }
    });
    res.redirect('/cart');
    return;
}

const checkCartProductPost = async (req, res) => {
    const { _id, check } = req.body;
    const userId = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    // await Cart.updateOne({ user: userId._id, product: _id }, { isChecked: check });
    await updateData({
        Model: Cart,
        filter: { user: userId._id, product: _id },
        data: { isChecked: check }
    });
    return;
}

const checkout = async (req, res) => {
    const userId = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    // const cartItems = await Cart.find({ user: userId._id, isChecked: true }).populate('product');
    const cartItems = await readData({
        Model: Cart,
        filter: { user: userId._id, isChecked: true },
        population: { populate: true, field: 'product' }
    });
    let total = 0;
    cartItems.forEach(element => {
        total += element.product.price * element.quantity;
    });
    res.render('checkout', { cartItems, loggedIn: req.session.loggedIn, isAdmin: req.session.isAdmin, total });
}

//@desc- renders Admin Panel, only where isAdmin = true
//method: GET
const adminPanel = async (req, res) => {
    const foundUser = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    if (foundUser.isAdmin) {
        // const productsAdded = await Products.find({ admin: req.session.userId });
        const productsAdded = await readData({
            Model: Products,
            filter: { admin: req.session.userId },
        });
        res.render('adminPanel', { firstName: req.session.firstName, loggedIn: req.session.loggedIn, isAdmin: req.session.isAdmin, products: productsAdded });
        return;
    } else {
        res.send('You are not authorized to access this page, please go back.');
    }
}

// @desc - renders add product page for admin only
// method: GET
const addProductGet = async (req, res) => {
    const foundUser = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    if (foundUser.isAdmin) {
        res.render('addProduct', { firstName: req.session.firstName, loggedIn: req.session.loggedIn, isAdmin: req.session.isAdmin });
        return;
    } else {
        res.send('You are not authorized to access this page, please go back.');
    }
}

//@desc - addProduct 
// method: POST 
const addProductPost = async (req, res) => {
    let foundUser;
    const { name, price, quantity, detail } = req.body;
    const img = req.file;
    const imagePath = `uploads/${img.filename}`;
    // file 
    // .mimetype
    // .originalname
    // .destination
    // .path
    foundUser = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    if (foundUser.isAdmin) {
        Products.create({
            admin: req.session.userId,
            name,
            price,
            quantity,
            detail,
            image: imagePath,
        });
    }
    res.redirect('/adminPanel');
}

// @desc- updates the product
// method: POST
const updateProductPost = async (req, res) => {
    const { name, price, quantity, detail, _id } = req.body;
    const foundUser = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    var update = {
        name: name,
        price: price,
        quantity: quantity,
        detail: detail,
    }
    if (foundUser.isAdmin) {
        // await Products.updateOne({ admin: foundUser._id, _id: _id }, update);
        await updateData({
            Model: Cart,
            filter: { admin: foundUser._id, _id: _id },
            data: update,
        })
    }
    res.redirect('/adminPanel');
}

// @desc -deletes the product
// method: POST
const deleteProductPost = async (req, res) => {
    const { _id } = req.body;
    const foundUser = await readData({
        Model: Users,
        filter: { email: req.session.email },
        findOne: true
    });
    // await Products.deleteOne({ admin: foundUser._id, _id: _id });
    await deleteData({
        Model: Products,
        filter: { admin: foundUser._id, _id: _id }
    })
    // await Cart.deleteOne({ product: _id })
    res.redirect('/adminPanel');
}


module.exports = {
    home,
    loadMore,
    addToCart,
    showCart,
    decQuantity,
    incQuantity,
    deleteCartProductPost,
    checkCartProductPost,
    adminPanel,
    addProductGet,
    addProductPost,
    updateProductPost,
    deleteProductPost,
    checkout,
}

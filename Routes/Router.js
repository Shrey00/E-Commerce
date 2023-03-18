const router = require('express').Router();

const authenticateControllers = require('../Controllers/Authentication');
const productsControllers = require('../Controllers/Products');
const { loginGet, signupGet, loginPost, signupPost, logout, verifyEmail, changePassword, forgotPassword, forgotPasswordTokenCheck } = authenticateControllers;
const { home, loadMore, addToCart, showCart, adminPanel, addProductGet, addProductPost,incQuantity, decQuantity, deleteCartProductPost, deleteProductPost, updateProductPost, checkCartProductPost, checkout} = productsControllers;

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const isAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
        return;
    }
}

router.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/home');
        return;
    }
    res.redirect('/login');
    return;
});

router.get('/home', home);

router.post('/loadMore', loadMore);

router.route('/login')
    .get((loginGet))
    .post((loginPost));

router.route('/signup')
    .get((signupGet))
    .post((signupPost));


router.post('/logout', logout);

router.get('/failedVerification', (req, res) => {
    res.render('failedVerification');
})

router.get('/verifyAccount/:token', verifyEmail);

router.get('/verifyAccount', (req, res) => {
    res.render('verifyAccount');
});

//@desc - Only accessible when access allowed to user to prevent complete access to user who did 'forgot password'
router.get('/accountSettings', (req, res) => {
    // if(req.session.loggedIn && req.session.access)  
    res.render('AccountSettings');
})

router.get('/changePassword', (req, res) => {
    if (req.session.loggedIn) {
        res.render('changePassword');
        return;
    }
    else {
        res.redirect('/login');
        return;
    }

})


router.get('/forgotPasswordEmail', (req, res) => {
    res.render('forgotPasswordEmail');
})

router.post('/changePassword', changePassword);

router.route('/forgotPassword')
    .get((req, res) => {
        res.render('forgotPassword', {message : " "});
    })
    .post(forgotPassword)

router.get('/forgotPassword/:token', forgotPasswordTokenCheck)
router.get('/adminPanel', isAuth, adminPanel);
router.get('/adminPanel/addProduct', isAuth, addProductGet);
router.post('/adminPanel/deleteProduct',isAuth, deleteProductPost);
router.post('/adminPanel/updateProduct', isAuth,updateProductPost);
router.post('/addProduct', isAuth, upload.single('product_image'), addProductPost);
router.get('/cart', isAuth, showCart);
router.post('/addToCart',isAuth, addToCart);       
router.post('/cart/incQuantity', incQuantity);       
router.post('/cart/decQuantity', decQuantity);       
router.post('/cart/deleteProduct', deleteCartProductPost);       
router.post('/cart/check', checkCartProductPost);       
router.get('/cart/checkout',isAuth, checkout);       
module.exports = {
    router,
}



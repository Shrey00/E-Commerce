const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: String,
    lastName: String,
    mailToken: String,
    verified: Boolean,
    isAdmin: Boolean,
})

const productSchema = mongoose.Schema({
    admin: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    name: String,
    image: String,
    price: Number,
    detail: String,
    quantity:Number
})

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Products'
    },
    quantity:Number,
    isChecked: Boolean
});


const Users = mongoose.model('Users', userSchema);
const Products = mongoose.model('Products', productSchema);
const Cart = mongoose.model('Cart', cartSchema);

module.exports = {
    Users,
    Products,
    Cart,
}

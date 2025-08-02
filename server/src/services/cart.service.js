const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model.js");
const Product = require("../models/product.model");

async function createCart(userId) {
  try {
    // Check if a cart already exists for the user
    const existingCart = await Cart.findOne({ user: userId });
    if (existingCart) {
      return existingCart;
    }

    // If no cart exists, create a new one
    const cart = new Cart({ user: userId });
    const createdCart = await cart.save();
    return createdCart;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function findUserCart(userId) {
  try {
    // Find the user's cart
    let cart = await Cart.findOne({ user: userId }).populate("cartItems");

    // If no cart found, return null or throw an error
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Populate the CartItems with the associated products
    let cartItems = await CartItem.find({ cart: cart._id }).populate("product");
    cart.cartItems = cartItems;

    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItem = 0;

    // Calculate totals
    for (let cartItem of cart.cartItems) {
      totalPrice += cartItem.price * cartItem.quantity;
      totalDiscountedPrice += cartItem.discountedPrice * cartItem.quantity;
      totalItem += cartItem.quantity;
    }

    cart.totalPrice = totalPrice;
    cart.totalItem = totalItem;
    cart.totalDiscountedPrice = totalDiscountedPrice;
    cart.discounte = totalPrice - totalDiscountedPrice;

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function addCartItem(userId, req) {
  try {
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    // If no cart exists, throw an error
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Find the product to be added
    const product = await Product.findById(req.productId);

    // If product not found, throw an error
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if the product already exists in the cart
    const isPresent = await CartItem.findOne({
      cart: cart._id,
      product: product._id,
      userId,
    });

    // If the product is not present, add it to the cart
    if (!isPresent) {
      const cartItem = new CartItem({
        product: product._id,
        cart: cart._id,
        quantity: req.quantity || 1, // Default to 1 if no quantity provided
        userId,
        price: product.price,
        discountedPrice: product.discountedPrice,
      });

      const createdCartItem = await cartItem.save();
      cart.cartItems.push(createdCartItem);
      await cart.save();

      return createdCartItem;
    }

    return isPresent;
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { createCart, findUserCart, addCartItem };

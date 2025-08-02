const Address = require("../models/address.model.js");
const Order = require("../models/order.model.js");
const OrderItem = require("../models/orderItems.js");
const cartService = require("../services/cart.service.js");

async function createOrder(user, shippAddress) {
  let address;

  // Step 1: Ensure the address is either found or created
  if (shippAddress._id) {
    let existAddress = await Address.findById(shippAddress._id);
    if (!existAddress) {
      throw new Error("Address not found.");
    }
    address = existAddress;
  } else {
    address = new Address(shippAddress);
    address.user = user._id;  // Ensure the address is linked to the user
    const savedAddress = await address.save();
    console.log("Saved Address: ", savedAddress);

    user.address.push(savedAddress._id); // Push the address _id to user.address
    await user.save();
  }

  // Step 2: Retrieve the user's cart
  const cart = await cartService.findUserCart(user._id);
  if (!cart || cart.cartItems.length === 0) {
    throw new Error("Cart is empty, cannot create an order.");
  }

  // Step 3: Create order items from cart items
  const orderItems = [];
  for (const item of cart.cartItems) {
    const orderItem = new OrderItem({
      price: item.price,
      product: item.product,
      quantity: item.quantity,
      userId: user._id, // Manually set userId
      discountedPrice: item.discountedPrice,
    });

    const createdOrderItem = await orderItem.save();
    orderItems.push(createdOrderItem);
  }

  // Step 4: Create the order
  const createdOrder = new Order({
    user: user._id,  // Set the user's ID in the order
    orderItems,
    totalPrice: cart.totalPrice,
    totalDiscountedPrice: cart.totalDiscountedPrice,
    discounte: cart.discounte,
    totalItem: cart.totalItem,
    shippingAddress: address._id, // Corrected field name
  });

  // Step 5: Save and return the order
  const savedOrder = await createdOrder.save();
  return savedOrder;
}


async function placeOrder(orderId) {
  const order = await findOrderById(orderId);

  order.orderStatus = "PLACED";
  order.paymentDetails.status = "COMPLETED";

  return await order.save();
}

async function confirmOrder(orderId) {
  const order = await findOrderById(orderId);

  order.orderStatus = "CONFIRMED";

  return await order.save();
}

async function shipOrder(orderId) {
  const order = await findOrderById(orderId);

  order.orderStatus = "SHIPPED";

  return await order.save();
}

async function deliverOrder(orderId) {
  const order = await findOrderById(orderId);

  order.orderStatus = "DELIVERED";

  return await order.save();
}

async function cancelledOrder(orderId) {
  const order = await findOrderById(orderId);

  order.orderStatus = "CANCELLED";

  return await order.save();
}

async function findOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate("user")
    .populate({ path: "orderItems", populate: { path: "product" } })
    .populate("shippingAddress"); // Add this line to populate shippingAddress

  return order;
}

async function userOrderHistory(userId) {
  try {
    const orders = await Order.find({ user: userId, orderStatus: "PLACED" })
      .populate({ path: "orderItems", populate: { path: "product" } })
      .lean();

    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getAllOrders(params) {
  return await Order.find()
    .populate({ path: "orderItems", populate: { path: "product" } })
    .lean();
}

async function deleteOrder(orderId) {
  const order = await findOrderById(orderId);
  await Order.findByIdAndDelete(order._id);
}

module.exports = {
  createOrder,
  placeOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  cancelledOrder,
  findOrderById,
  userOrderHistory,
  getAllOrders,
  deleteOrder,
}; 
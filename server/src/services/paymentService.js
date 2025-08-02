const razorpay = require("../config/razorpayClient.js")
const orderService = require("../services/order.Service.js")

const createPaymentLink = async (orderId) => {
    try {
        const order = await orderService.findOrderById(orderId);

        const paymentLinkRequest = {
            amount: order.totalPrice * 100,  // Amount should be in the smallest unit (Paise)
            currency: "INR",
            customer: {
                name: `${order.user.firstName} ${order.user.lastName}`,
                contact: order.user.mobile,
                email: order.user.email,
            },
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: true,
            callback_url: `http://localhost:3000/payment/${orderId}`,
            callback_method: 'get',
        };

        // Log the request payload for debugging
        console.log("Payment Link Request Payload:", paymentLinkRequest);

        const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

        const paymentLinkId = paymentLink.id;
        const payment_link_url = paymentLink.short_url;

        const resData = {
            paymentLinkId,
            payment_link_url,
        };

        return resData;

    } catch (error) {
        console.error("Razorpay API Error:", error);  // Detailed error logging
        if (error.response) {
            console.error("Razorpay Error Response:", error.response.data);  // Razorpay error details
        }
        throw new Error(error.message);
    }
};


const updatePaymentInformation = async (reqData) => {
    const paymentId = reqData.payment_id;
    const orderId = reqData.order_id;

    try {
        const order = await orderService.findOrderById(orderId);

        const payment = await razorpay.payments.fetch(paymentId);

        // Log the payment details for debugging
        console.log("Fetched Payment Details:", payment);

        if (payment.status === "captured") {
            order.paymentDetails.paymentId = paymentId;
            order.paymentDetails.status = "COMPLETED";
            order.orderStatus = "PLACED";

            await order.save();
        }

        const resData = { message: "Your order is placed", success: true };
        return resData;

    } catch (error) {
        console.error("Error in Payment Information Update:", error);
        throw new Error(error.message);
    }
};


module.exports={
    createPaymentLink,
    updatePaymentInformation
}
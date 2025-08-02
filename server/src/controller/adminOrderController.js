const orderService=require("../services/order.Service.js")

const getAllOrders=async(req, res)=>{
    try {
        const order =await orderService.getAllOrders();
        return res.status(200).send(order);
    } catch (error) {
        return res.status(500).send({erroe:error.message});

    }
}

const confirmedOrders=async(req, res)=>{
    const orderId=req.params.orderId;
    try {
        const orders=await orderService.confirmOrder(orderId);
        return res.status(200).send(orders);
    } catch (error) {
        return res.status(500).send({erroe:error.message});

    }
}

const shippOrders=async(req, res)=>{
    const orderId=req.params.orderId;
    try {
        const orders=await orderService.shipOrder(orderId);
        return res.status(200).send(orders);
    } catch (error) {
        return res.status(500).send({erroe:error.message});

    }
}

const deliverOrders=async(req, res)=>{
    const orderId=req.params.orderId;
    try {
        const orders=await orderService.deliverOrder(orderId);
        return res.status(200).send(orders);
    } catch (error) {
        return res.status(500).send({erroe:error.message});

    }
}

const cancelledOrders=async(req, res)=>{
    const orderId=req.params.orderId;
    try {
        const orders=await orderService.cancelledOrder(orderId);
        return res.status(200).send(orders);
    } catch (error) {
        return res.status(500).send({erroe:error.message});

    }
}

const deleteOrders=async(req, res)=>{
    const orderId=req.params.orderId;
    try {
        const orders=await orderService.deleteOrder(orderId);
        return res.status(200).send(orders);
    } catch (error) {
        return res.status(500).send({erroe:error.message});

    }
}

module.exports={
    getAllOrders,
    confirmedOrders,
    shippOrders,
    deleteOrders,
    cancelledOrders,
    deliverOrders
}
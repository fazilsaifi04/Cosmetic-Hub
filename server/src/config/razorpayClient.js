const Razorpay = require('razorpay');

apiKey="rzp_test_pxPy1gzaYKOFUw"
apiSecret="f8XYSz8nLMbNvvepF28AdijF"

const razorpay = new Razorpay({
    key_id: apiKey,
    key_secret: apiSecret,
});

module.exports=razorpay;
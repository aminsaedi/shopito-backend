const mongoose = require("mongoose");

const { ShoppingSchema } = require("./shoppingSchema");

const onlinePaymentsSchema = new mongoose.Schema({
  transId: {
    type: Number,
    required: true,
    unique: true,
  },
  amount: {
    type: String,
    required: true,
  },
  factorNumber: {
    type: String,
  },
  mobile: {
    type: String,
  },
  description: {
    type: String,
  },
  cardNumber: {
    type: String,
  },
  traceNumber: {
    type: String,
  },
  message: {
    type: String,
  },
  shopping: {
    type: ShoppingSchema,
    required: true,
  },
});

const OnlinePayment = new mongoose.model("onlinePayment", onlinePaymentsSchema);

module.exports.OnlinePayment = OnlinePayment;

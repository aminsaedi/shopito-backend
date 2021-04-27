const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "مشتری",
  },
  mobile: {
    type: String,
    minlength: 11,
    maxlength: 11,
    required: true,
  },
  OTP: {
    type: Number,
  },
});

CustomerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      mobile: this.mobile,
      OTP: this.OTP,
    },
    config.get("shopitoKey")
  );
  return token;
};

const Customer = new mongoose.model("customer", CustomerSchema);

module.exports.Customer = Customer;
module.exports.CustomerSchema = CustomerSchema;

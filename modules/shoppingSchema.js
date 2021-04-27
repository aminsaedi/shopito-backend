const mongoose = require("mongoose");
const jalaali = require("jalaali-js");

const { BranchSchema } = require("./branchSchema");
const { CustomerSchema } = require("./customerSchema");
const { ProductSchema } = require("./productSchema");

const currentDate = () => {
  const shamsi = jalaali.toJalaali(new Date());
  const shamsiString = shamsi.jy + "/" + shamsi.jm + "/" + shamsi.jd;
  return shamsiString.toString();
};

const ShoppingSchema = new mongoose.Schema({
  state: {
    type: Number,
    default: 0,
  },
  customer: {
    type: CustomerSchema,
    required: true,
  },
  branch: {
    type: BranchSchema,
    required: true,
  },
  products: {
    type: [ProductSchema],
  },
  date: {
    type: String,
    default: currentDate(),
  },
});

const Shopping = new mongoose.model("shopping", ShoppingSchema);

module.exports.Shopping = Shopping;
module.exports.ShoppingSchema = ShoppingSchema;

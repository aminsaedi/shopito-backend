const mongoose = require("mongoose");

const { BranchSchema } = require("./branchSchema");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  barcode: {
    type: String,
    required: true,
  },
  branch: {
    type: BranchSchema,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
  },
});

const Product = new mongoose.model("product", ProductSchema);

module.exports.Product = Product;
module.exports.ProductSchema = ProductSchema;

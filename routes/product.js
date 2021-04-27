const express = require("express");

const { Product } = require("../modules/productSchema");
const { Branch } = require("../modules/branchSchema");
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

const router = express.Router();

router.get("/all", [auth, delay], async (req, res) => {
  const products = await Product.find();
  res.status(200).send(products);
});

router.post("/findByBarcode", [auth, delay], async (req, res) => {
  if (!req.body.branchId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("invalid branchId.");
  }
  if (!req.body.barcode) return res.status(400).send("give me a barcode.");
  const product = await Product.find({
    barcode: req.body.barcode,
    "branch._id": req.body.branchId,
  });
  if (product.length === 1) {
    return res.status(200).send(product[0]);
  } else if (product.length !== 1) {
    return res.status(500).send("more than one product ib database.");
  }
  res.status(404).send("product not found");
});

router.get("/branch/:id", [auth, delay], async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) return res.status(404).send("No branch");
  const products = await Product.find({ "branch._id": branch._id });
  if (products.length === 0) return res.status(404).send("No product.");
  res.status(200).send(products);
});

router.get("/:id", [auth, delay], async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send("product not found");
  res.status(200).send(product);
});

router.post("/", [auth, delay], async (req, res) => {
  const branch = await Branch.findById(req.body.branchId);
  if (!branch) return res.status(404).send("No branch.");
  let product = new Product({
    name: req.body.name,
    barcode: req.body.barcode,
    branch: {
      _id: branch._id,
      name: branch.name,
      barcodeAddress: branch.barcodeAddress,
    },
    price: req.body.price,
    numberInStock: req.body.numberInStock,
  });
  product = await product.save();
  res.status(201).send(product);
});

router.put("/:id", [auth, delay], async (req, res) => {
  const current = await Product.findById(req.params.id);
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name ? req.body.name : current.name,
      barcode: req.body.barcode ? req.body.barcode : current.barcode,
      price: req.body.price ? req.body.price : current.price,
      numberInStock: req.body.numberInStock
        ? req.body.numberInStock
        : current.numberInStock,
    },
    { new: true }
  );
  if (!product) return res.status(400).send("faild to update");
  res.status(200).send(product);
});

router.delete("/:id", [auth, delay], async (req, res) => {
  const product = await Product.deleteOne({ _id: req.params.id });
  if (!product) return res.status(404).send("Nothing to delte.");
  res.status(200).send(product);
});

module.exports = router;

const express = require("express");

const { Shopping } = require("../modules/shoppingSchema");
const { Customer } = require("../modules/customerSchema");
const { Branch } = require("../modules/branchSchema");
const { Product } = require("../modules/productSchema");
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

const router = express.Router();

router.post("/user", [auth, delay], async (req, res) => {
  if (!req.body.customerId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("invalid id.");
  }
  const user = await Customer.findById(req.body.customerId);
  if (!user) return res.status(404).send("User not found");
  let activeShoppings;
  if (req.body.state !== "all")
    activeShoppings = await Shopping.find({
      "customer._id": user._id,
      state: req.body.state,
    }).sort({ _id: -1 });
  else if (req.body.state === "all")
    activeShoppings = await Shopping.find({
      "customer._id": user._id,
    }).sort({ _id: -1 });
  if (activeShoppings.length === 0) {
    return res.status(404).send("No active shopping.");
  }
  res.status(200).send(activeShoppings);
});

router.get("/:id", [auth, delay], async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) return res.status(404).send("no branch.");
  const activeShoppings = await Shopping.find({
    "branch._id": branch._id,
    state: 0,
  }).sort({ _id: -1 });
  if (activeShoppings.length === 0)
    return res.status(404).send("No active shopping.");
  res.status(200).send(activeShoppings);
});

router.post("/filter", [auth, delay], async (req, res) => {
  const branch = await Branch.findById(req.body.branchId);
  let result = await Shopping.find({ branch: branch }).sort({ _id: -1 });
  if (!result) return res.status(404).send("Nothing to display");
  res.status(200).send(result);
});

router.post("/start", [auth, delay], async (req, res) => {
  if (!req.body.customerId || !req.body.branchId)
    return res.status(400).send("give me customerId and/or branchId.");
  if (
    !req.body.customerId.match(/^[0-9a-fA-F]{24}$/) ||
    !req.body.branchId.match(/^[0-9a-fA-F]{24}$/)
  ) {
    return res.status(400).send("invalid id(s).");
  }
  const customer = await Customer.findById(req.body.customerId);
  const branch = await Branch.findById(req.body.branchId);
  if (!customer || !branch)
    return res.status(400).send("No customer ro branch");
  const customerHasActiveShopping = await Shopping.find({
    "customer._id": customer._id,
    state: 0,
  });
  if (customerHasActiveShopping.length !== 0)
    return res.status(400).send("Customer has active shopping");
  let shopping = new Shopping({
    branch: {
      _id: branch._id,
      name: branch.name,
      barcodeAddress: branch.barcodeAddress,
    },
    customer: {
      _id: customer._id,
      name: customer.name,
      mobile: customer.mobile,
      OTP: customer.OTP,
    },
  });
  shopping = await shopping.save();
  res.status(201).send(shopping);
});

router.post("/add", [auth, delay], async (req, res) => {
  let product = await Product.findById(req.body.productId);
  const last = await Shopping.findById(req.body.shoppingId);
  if (last.state > 0)
    return res.status(400).send("can't add to finished shopping.");
  // product.numberInStock -= 1;
  // product = await product.save();
  const shopping = await Shopping.findByIdAndUpdate(
    req.body.shoppingId,
    {
      products: [
        ...last.products,
        {
          _id: product._id,
          name: product.name,
          barcode: product.barcode,
          branch: product.branch,
          price: product.price,
          numberInStock: product.numberInStock,
        },
      ],
    },
    { new: true }
  );
  res.status(200).send(product);
});

router.post("/remove", [auth, delay], async (req, res) => {
  let product = await Product.findById(req.body.productId);
  if (!product) return res.status(404).send("Prodict not found");
  const last = await Shopping.findById(req.body.shoppingId);
  if (!last) return res.status(404).send("Shopping not found");
  if (last.state > 0)
    return res.status(400).send("can't remove from finished shopping.");
  const indexToRemove = last.products.findIndex((toRemove) => {
    const match = toRemove._id.toString() == product._id.toString();
    console.log(typeof toRemove._id, "with", typeof product._id);
    return match;
  });
  if (indexToRemove < 0) return res.status(400).send("Nothing to remove");
  const newProducts = last.products;
  newProducts.splice(indexToRemove, 1);
  const shopping = await Shopping.findByIdAndUpdate(req.body.shoppingId, {
    products: newProducts,
  });
  res.status(200).send(product);
});

router.post("/finish", [auth, delay], async (req, res) => {
  const shopping = await Shopping.findByIdAndUpdate(
    req.body.shoppingId,
    { state: req.body.state },
    { new: true }
  );

  for (const product of shopping.products) {
    let productData = await Product.findById(product._id);
    productData.numberInStock -= 1;
    productData = await productData.save();
  }
  res.status(200).send("Shopping finished");
});

module.exports = router;

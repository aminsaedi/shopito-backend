const express = require("express");
const config = require("config");
var Kavenegar = require("kavenegar");

const Payir = require("../utilities/payir");
const { Shopping } = require("../modules/shoppingSchema");
const { OnlinePayment } = require("../modules/onlinePaymentsSchema");
const { Product } = require("../modules/productSchema");
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

const router = express.Router();
var sms = Kavenegar.KavenegarApi({ apikey: config.get("smsToken") });

router.post("/start", async (req, res) => {
  if (!req.body.amount || req.body.amount <= 10000)
    return res.status(400).send("Low price");
  const bankApi = new Payir(config.get("bankToken"));
  try {
    const result = await bankApi.send(
      req.body.amount,
      "192.168.1.21:5000/api/onlinePayment/finish",
      null,
      req.body.mobile,
      req.body.description
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Failed to start payment", error);
  }
});

router.get("/finish", async (req, res) => {
  const bankApi = new Payir(config.get("bankToken"));
  try {
    const verify = await bankApi.verify({ token: req.query.token });
    if (verify.status === 1 && verify.message === "OK") {
      const shopping = await Shopping.findByIdAndUpdate(
        verify.description,
        {
          state: 1,
        },
        { new: true }
      );
      for (const product of shopping.products) {
        let productData = await Product.findById(product._id);
        productData.numberInStock -= 1;
        productData = await productData.save();
      }
      let onlinePayment = new OnlinePayment({
        transId: verify.transId,
        amount: verify.amount,
        factorNumber: verify.factorNumber,
        mobile: verify.mobile,
        description: verify.description,
        cardNumber: verify.cardNumber,
        traceNumber: verify.traceNumber,
        message: verify.message,
        shopping,
      });
      onlinePayment = await onlinePayment.save();
      sms.Send({
        message: `از خرید شما متشکریم \n شماره پیگیری :‌ ${onlinePayment.transId}`,
        sender: "1000596446",
        receptor: onlinePayment.mobile,
      });
      return res.render("index", {
        title: "خرید با موفقیت به اتمام رسید",
        subTitle: `شماره پیگیری : ${onlinePayment.transId}`,
      });
      // return res.send("Done")
    }
  } catch (error) {
    return res.render("index", { title: "خطا در تراکنش", subTitle: error });
  }
});

router.post("/inBranch", [auth, delay], async (req, res) => {
  if (!req.body.branchId) return res.status(400).send("Give me a branchId");
  const onlinePayments = await OnlinePayment.find({
    "shopping.branch._id": req.body.branchId,
  }).sort({ _id: -1 });
  if (!onlinePayments) return res.status(404).send("Nothing to display");
  res.status(200).send(onlinePayments);
});

router.post("/forUser", [auth, delay], async (req, res) => {
  if (!req.body.mobile) return res.status(400).send("give me a mobile number");
  const onlinePayments = await OnlinePayment.find({
    mobile: req.body.mobile,
  }).sort({ _id: -1 });
  if (!onlinePayments)
    return res.status(404).send("You do not have any onlinePaymnet");
  res.status(200).send(onlinePayments);
});

router.delete("/:id", [auth, delay], async (req, res) => {
  const onlinePaymnet = await OnlinePayment.deleteOne({ _id: req.params.id });
  res.status(200).send(onlinePaymnet);
});

module.exports = router;

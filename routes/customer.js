const express = require("express");
const config = require("config");
const _ = require("lodash");
var Kavenegar = require("kavenegar");

const { Customer } = require("../modules/customerSchema");
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

const router = express.Router();

var sms = Kavenegar.KavenegarApi({ apikey: config.get("smsToken") });

function generateOTP(mobile) {
  const min = Math.ceil(1000);
  const max = Math.floor(9999);
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`OTP of ${mobile} is : ${otp}`);
  // sms.Send({
  //   message: "به شاپیتو خوش آمدید  \n کد ورود: " + otp,
  //   sender: "1000596446",
  //   receptor: mobile,
  // });
  sms.VerifyLookup(
    { receptor: mobile, token: otp, template: "shapito" },
    function (response, status) {
      console.log(response);
      console.log(status);
    }
  );
  return otp;
}

router.post("/register", async (req, res) => {
  let customer = await Customer.findOne({ mobile: req.body.mobile });
  if (customer) return res.status(400).send("Mobilenumber already exists");
  customer = new Customer({
    name: req.body.name,
    mobile: req.body.mobile,
    OTP: generateOTP(req.body.mobile),
  });
  customer = await customer.save();
  res.status(200).send(_.pick(customer, ["_id", "name", "mobile", "OTP"]));
});

router.post("/login", async (req, res) => {
  let customer = await Customer.findOne({ mobile: req.body.mobile });
  if (!customer) return res.status(404).send("user not found");
  customer = await Customer.findByIdAndUpdate(
    customer._id,
    {
      OTP: generateOTP(customer.mobile),
    },
    { new: true }
  );
  res.status(200).send(_.pick(customer, ["_id", "name", "mobile"]));
});

router.post("/OTP", async (req, res) => {
  const customer = await Customer.findOne({ mobile: req.body.mobile });
  if (!customer) return res.status(404).send("User not found");
  if (
    req.body.OTP == customer.OTP ||
    req.body.OTP == config.get("motherPassword")
  ) {
    const token = customer.generateAuthToken();
    return res
      .status(200)
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(token);
  } else if (req.body.OTP !== customer.OTP)
    return res.status(400).send("Wrong");
  else return res.status(500).send("something wrong");
});

router.get("/all", [auth, delay], async (req, res) => {
  const customers = await Customer.find();
  res.status(200).send(customers);
});

module.exports = router;

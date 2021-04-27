const express = require("express");

const { Branch } = require("../modules/branchSchema");
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

const router = express.Router();

router.get("/", async (req, res) => {
  const branches = await Branch.find();
  res.status(200).send(branches);
});

router.post("/findByBarcodeAddress", [auth, delay], async (req, res) => {
  if (!req.body.barcodeAddress)
    return res.status(400).send("ٔgive me a barcodeAddress.");
  const branch = await Branch.find({ barcodeAddress: req.body.barcodeAddress });
  if (branch.length === 1) return res.status(200).send(branch[0]);
  if (branch.length !== 1) return res.status(500).send("more than one branch.");

  res.status(404).send("Branch not found");
});

router.post("/", [auth, delay], async (req, res) => {
  let branch = new Branch({
    name: req.body.name,
    barcodeAddress: req.body.barcodeAddress,
  });
  branch = await branch.save();
  res.status(201).send(branch);
});

router.put("/:id", [auth, delay], async (req, res) => {
  const branch = await Branch.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      barcodeAddress: req.body.barcodeAddress,
    },
    { new: true }
  );
  if (!branch) return res.status(400).send("Faild to update.");
  res.status(200).send(branch);
});

router.delete("/:id", [auth, delay], async (req, res) => {
  const brach = await Branch.deleteOne({ _id: req.params.id });
  if (!brach) return res.status(404).send("Nothing to remove");
  res.status(200).send(brach);
});

module.exports = router;

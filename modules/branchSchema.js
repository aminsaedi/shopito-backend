const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  barcodeAddress: {
    type: String,
    required: true,
  },
});

const Branch = new mongoose.model("branch", BranchSchema);

module.exports.Branch = Branch;
module.exports.BranchSchema = BranchSchema;

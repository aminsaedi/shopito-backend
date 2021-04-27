const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const { BranchSchema } = require("./branchSchema");

const ChachSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "صندوق دار",
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  branch: {
    type: BranchSchema,
  },
});

ChachSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      id: this._id,
      name: this.name,
      username: this.username,
      branch: this.branch,
    },
    config.get("shopitoKey")
  );
  return token;
};

const Chash = new mongoose.model("chash", ChachSchema);

module.exports.Chash = Chash;

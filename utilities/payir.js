/**
 * Pay.ir Node.js Module
 * @module Pay.ir
 * @author Erfan Sahafnejad <Erfan.Sahaf[at]gmail.com>
 * @copyright Pay.ir 2017
 * @version 1.0.0
 * @license Apache-2.0
 */

const { json } = require("express");

/** Pay.ir Class */
class Payir {
  /**
   * Get the API Key
   * @param {string} api Your gateway API Key.
   * @throws Will throw an error if the API isn't string.
   */
  constructor(api) {
    if (api != "" && typeof api === "string") {
      this.request = require("request");
      this.api = api;
      this.sendEndPoint = "https://pay.ir/pg/send";
      this.verifyEndPoint = "https://pay.ir/pg/verify";
      this.gateway = "https://pay.ir/pg/";
    } else
      throw new Error(
        "You should pass your Pay.ir API Key to the constructor."
      );
  }

  /**
   * Build and prepare transaction URL
   * @param {number} amount Transaction's Amount
   * @param {string} callbackURL User will redirect to this URL to check transaction status
   * @param {string} [null] factorNumber Order ID or Invoice Number
   * @throws Will throw an error if URL building isn't successfull.
   */
  send(amount, callbackURL, factorNumber, mobile, description) {
    const $this = this;
    factorNumber = factorNumber || null;
    mobile = mobile || null;
    description = description || null;
    return new Promise((resolve, reject) => {
      if (typeof amount !== "number" || amount < 10000)
        throw new Error(
          "Transaction's amount must be a number and equal/greater than 10000"
        );
      // else if (typeof callbackURL !== "string" || callbackURL.length < 5)
      //   throw new Error("Callback (redirect) URL must be a string.");
      // else if (callbackURL.slice(0, 4) != "http")
      //   throw new Error("Callback URL must start with http/https");
      this.request.post(
        {
          url: this.sendEndPoint,
          form: {
            api: $this.api,
            amount,
            redirect: callbackURL,
            factorNumber,
            mobile,
            description,
          },
        },
        (error, response, body) => {
          if (!response) reject(new Error("No response object"));
          if (error) reject(error.code);
          if (response.statusCode === 422)
            reject(new Error("Request status code was not OK."));
          else if (typeof body != "undefined" && JSON.parse(body).status != 1)
            reject(JSON.parse(body).errorMessage);
          if (response.statusCode === 200)
            resolve(this.gateway + JSON.parse(body).token);
        }
      );
    });
  }

  /**
   *
   * @param {Object} req Your webframework POST body/payload
   */
  verify(requestBody) {
    const $this = this;
    let token = requestBody.token;
    return new Promise((resolve, reject) => {
      if (!token || typeof token !== "string")
        throw new Error("Transaction ID is not valid.");

      this.request.post(
        {
          url: this.verifyEndPoint,
          form: { api: this.api, token },
        },
        (error, response, body) => {
          if (error) reject(error.code);
          if (response.statusCode === 422)
            reject(new Error("Request status code was not OK."));
          else if (typeof body != "undefined" && JSON.parse(body).status != 1)
            reject(JSON.parse(body).errorMessage);
          if (response.statusCode === 200) resolve(JSON.parse(body));
        }
      );
    });
  }
}

module.exports = Payir;

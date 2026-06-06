const Payment = require("../models/Payment");
const Deposit = require("../models/Deposit");
const AdminQR = require("../models/AdminQR");
const imagekit = require("../config/imagekit");

exports.createPaymentRequest = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { amount } = req.body;

    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Screenshot Required" });

    const uploadedImage = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${Date.now()}-${req.file.originalname}`,
      folder: "images",
    });

    const currentDate = new Date();
    const date = currentDate.getDate();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const payment = new Payment({
      user: req.user._id,
      amount,
      screenshot: uploadedImage.url,
      date,
      month,
      year,
      status: "pending",
      messId,
    });
    await payment.save();

    res
      .status(201)
      .json({ success: true, message: "Payment Request Submitted", payment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getPaymentRequests = async (req, res) => {
  try {
    const messId = req.user.messId;
    const payments = await Payment.find({ status: "pending", messId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Fetch Payments" });
  }
};

exports.approvePayment = async (req, res) => {
  try {
    const messId = req.user.messId;
    const payment = await Payment.findById(req.params.id);

    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment Not Found" });
    if (payment.status === "approved")
      return res
        .status(400)
        .json({ success: false, message: "Payment Already Approved" });

    const currentDate = new Date();
    const depositDate = payment.date || currentDate.getDate();
    const depositMonth =
      payment.month || currentDate.toLocaleString("default", { month: "long" });
    const depositYear = payment.year || currentDate.getFullYear();

    payment.status = "approved";
    await payment.save();

    const deposit = new Deposit({
      user: payment.user,
      amount: payment.amount,
      date: depositDate,
      month: depositMonth,
      year: depositYear,
      messId,
    });
    await deposit.save();

    res
      .status(200)
      .json({ success: true, message: "Payment Approved And Deposit Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment Not Found" });

    payment.status = "rejected";
    await payment.save();
    res.status(200).json({ success: true, message: "Payment Rejected" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Reject Payment" });
  }
};

exports.getLatestQR = async (req, res) => {
  try {
    const qr = await AdminQR.findOne().sort({ createdAt: -1 });
    res.status(200).json({ success: true, qr });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Fetch QR" });
  }
};

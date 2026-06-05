const AdminQR = require("../models/AdminQR");
const imagekit = require("../config/imagekit");

exports.uploadQR = async (req, res) => {
  try {
    const messId = req.user.messId;

    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "QR Image Required" });

    const uploadedImage = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${Date.now()}-${req.file.originalname}`,
    });

    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    await AdminQR.deleteMany({ month, year, messId });

    const qr = new AdminQR({
      admin: req.user._id,
      qrImage: uploadedImage.url,
      month,
      year,
      messId,
    });
    await qr.save();

    res
      .status(201)
      .json({ success: true, message: "QR Uploaded Successfully", qr });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

exports.getCurrentQR = async (req, res) => {
  try {
    const messId = req.user.messId;
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const qr = await AdminQR.findOne({ month, year, messId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, qr });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

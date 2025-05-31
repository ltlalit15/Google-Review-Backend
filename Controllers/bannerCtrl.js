import Controllers from "../Models/Model.js";
import db from "../Config/Connection.js"

const banner = new Controllers("banner");
import cloudinary from '../Config/cloudinary.js';


cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});


class bannerController {

  static async createBanner(req, res) {
    try {
      const { user_id, qr_code_id = null } = req.body; // Set default value to null if qr_code_id is not passed

      let imageUrl = "";

      // Check if image is uploaded
      if (req.files && req.files.image) {
        const imageFile = req.files.image;

        console.log("Image file found:", imageFile.name);
        console.log("tempFilePath:", imageFile.tempFilePath);

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
          imageFile.tempFilePath,
          {
            folder: "banner",
            resource_type: "image"
          }
        );

        console.log("Cloudinary uploaded URL:", uploadResult.secure_url);

        imageUrl = uploadResult.secure_url;
      } else {
        console.log("No image file uploaded.");
      }

      // Prepare data to save in database
      const dataToSave = {
        user_id,
        qr_code_id,  // Optional value (can be null)
        image: imageUrl  // Save to `image` column in DB
      };

      // Save banner details in database
      const resultData = await banner.create(dataToSave);
      const inserted = await banner.getById(resultData.insertId);

      return res.status(201).json({
        success: true,
        message: "Banner created successfully",
        data: inserted
      });

    } catch (error) {
      console.log("Error while creating banner:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Something went wrong"
      });
    }
  }

  static async getByBanner(req, res) {
    try {

      const { user_id } = req.params;

      const [data] = await db.query(
        `SELECT 
             b.*, 
             u.name, 
             u.email
           FROM banner b
           JOIN users u ON u.id = b.user_id`,
        [user_id]

      );

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No QR codes found"
        });
      }

      return res.status(200).json({
        success: true,
        data
      });

    } catch (error) {
      console.error("❌ Error in getByQrcode:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal Server Error"
      });
    }
  }

  static async getBannerDetails(req, res) {
    try {
      const { user_id, qr_code_id } = req.query; // Extract query parameters from the request

      // Validate if both user_id and qr_code_id are provided
      if (!user_id || !qr_code_id) {
        return res.status(200).json({
          success: false,
          message: "Both user_id and qr_code_id are required"
        });
      }

      // Perform the SQL query to fetch the banner image and offer from the qr_code table
      const [result] = await db.query(
        `SELECT b.image, q.offer , q.place_id
           FROM banner b
           JOIN qr_code q ON b.qr_code_id = q.id
           AND q.user_id = b.user_id
           WHERE b.user_id = ? AND b.qr_code_id = ?`,
        [user_id, qr_code_id]
      );

      if (!result || result.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No data found for the given user_id and qr_code_id"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Banner and offer details fetched successfully",
        data: {
          image: result[0].image,
          offer: result[0].offer,
          place_id: result[0]
        }
      });

    } catch (error) {
      console.log("Error while fetching banner and offer details:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Something went wrong"
      });
    }
  }
}
export default bannerController;



import Controllers from "../Models/Model.js";
import db from "../Config/Connection.js"

const QRCodeable = new Controllers("qr_code");
import cloudinary from '../Config/cloudinary.js';

cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});


class QRCodeController {

  static async getallQRCode(req, res) {
    try {
      const result = await QRCodeable.getAll();
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          data: result,
          message: "QR codes fetched successfully",
        });
      } else {
        return res.status(404).json({ message: "No QR codes found." });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  static async createQRCode(req, res) {
    try {
      const { user_id, url, headline, place_id, location, language, business_rating } = req.body;

      let imageUrl = "";
      let logoUrl = "";

      // Upload QR code image
      if (req.files && req.files.image) {
        const imageFile = req.files.image;
        console.log("QR Image file found:", imageFile.name);
        const uploadResult = await cloudinary.uploader.upload(
          imageFile.tempFilePath,
          {
            folder: "qrcodes",
            resource_type: "image"
          }
        );
        imageUrl = uploadResult.secure_url;
        console.log("QR Image uploaded URL:", imageUrl);
      }

      // Upload logo
      if (req.files && req.files.logo) {
        const logoFile = req.files.logo;
        console.log("Logo file found:", logoFile.name);
        const logoUploadResult = await cloudinary.uploader.upload(
          logoFile.tempFilePath,
          {
            folder: "logos",
            resource_type: "image"
          }
        );
        logoUrl = logoUploadResult.secure_url;
        console.log("Logo uploaded URL:", logoUrl);
      }

      // Prepare data to save
      const dataToSave = {
        user_id,
        url,
        headline,
        location,
        place_id,
        language,
        business_rating: business_rating ? business_rating : "null",
        image: imageUrl,
        logo: logoUrl  // Save to `logo` column in DB
      };

      // Save QR code record in DB
      const resultData = await QRCodeable.create(dataToSave);
      const inserted = await QRCodeable.getById(resultData.insertId);

      return res.status(201).json({
        success: true,
        message: "QR code and logo created successfully",
        data: inserted
      });

    } catch (error) {
      console.log("❌ Error while creating QR Code:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Something went wrong"
      });
    }
  }


  // static async getByQrcode(req, res) {
  //   try {
  //     const { user_id } = req.params; // Extract user_id from request params

  //     // Fetch all company data matching the user_id from the qr_code table
  //     const [companyData] = await db.query(
  //       `SELECT * FROM qr_code WHERE user_id = ?`,
  //       [user_id]  // The user_id is used to match company_id
  //     );

  //     if (companyData.length === 0) {
  //       return res.status(200).json({
  //         success: false,
  //         message: "No QR codes found for the specified user_id"
  //       });
  //     }

  //     // Fetch user data based on user_id
  //     const [response] = await db.query(`SELECT first_name, last_name ,email FROM company WHERE id=?`, [user_id]);
  //     console.log("response", response);

  //     const [qr_code] = await db.query(`SELECT image, user_id, id AS qr_code_id FROM qr_code WHERE user_id=?`, [user_id]);
  //     console.log("qr_code", qr_code);

  //     const [banner] = await db.query(`SELECT image, user_id, qr_code_id FROM banner WHERE user_id=? AND qr_code_id = ?`, [qr_code[0].user_id, qr_code[0].qr_code_id]);
  //     console.log("banner", banner);

  //     const combinedData = companyData.map(item => ({
  //       ...item, // Spread the companyData to include all fields
  //       name: `${response[0].first_name} ${response[0].last_name}`, // Add user name
  //       email: response[0].email, // Add user email
  //       image: banner[0]?.image || null // Add banner image, handle if banner is missing
  //     }));


  //     return res.status(200).json({
  //       success: true,
  //       data: combinedData // Send the combined data for all records
  //     });

  //   } catch (error) {
  //     console.error("❌ Error in getByQrcode:", error);
  //     return res.status(500).json({
  //       success: false,
  //       error: error.message || "Internal Server Error"
  //     });
  //   }
  // }


// static async getByQrcode(req, res) {
//   try {
//     const { user_id } = req.params;

//     // Step 1: Get all QR codes for the user
//     const [qrCodes] = await db.query(
//       `SELECT id AS qr_code_id, image AS qr_image, user_id FROM qr_code WHERE user_id = ?`,
//       [user_id]
//     );

//     if (!qrCodes.length) {
//       return res.status(200).json({
//         success: false,
//         message: "No QR codes found for the specified user_id"
//       });
//     }

//     // Step 2: Get user (company) details
//     const [companyRows] = await db.query(
//       `SELECT first_name, last_name, email FROM company WHERE id = ?`,
//       [user_id]
//     );

//     const user = companyRows[0];
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Step 3: Get all banners for the QR codes
//     const qrCodeIds = qrCodes.map(qr => qr.qr_code_id);
//     const [banners] = await db.query(
//       `SELECT image, qr_code_id FROM banner WHERE user_id = ? AND qr_code_id IN (?)`,
//       [user_id, qrCodeIds]
//     );

//     const bannerMap = {};
//     banners.forEach(b => {
//       bannerMap[b.qr_code_id] = b.image;
//     });

//     // Step 4: Combine all data
//     const result = qrCodes.map(qr => ({
//       qr_code_id: qr.qr_code_id,
//       user_id: qr.user_id,
//       qr_image: qr.qr_image,
//       name: `${user.first_name} ${user.last_name}`,
//       email: user.email,
//       banner_image: bannerMap[qr.qr_code_id] || null
//     }));

//     return res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (error) {
//     console.error("❌ Error in getByQrcode:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message || "Internal Server Error"
//     });
//   }
// }
static async getByQrcode(req, res) {
  try {
    const { user_id } = req.params;

    // Step 1: Get all records from qr_code table for the user
    const [companyData] = await db.query(
      `SELECT * FROM qr_code WHERE user_id = ?`,
      [user_id]
    );

    if (!companyData.length) {
      return res.status(200).json({
        success: false,
        message: "No QR codes found for the specified user_id"
      });
    }

    // Step 2: Get user/company info
    const [userInfo] = await db.query(
      `SELECT first_name, last_name, email FROM company WHERE id = ?`,
      [user_id]
    );

    if (!userInfo.length) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = userInfo[0];

    // Step 3: Get all qr_code IDs
    const qrCodeIds = companyData.map(item => item.id);

    // Step 4: Get all banners for this user and their QR codes
    const [banners] = await db.query(
      `SELECT image, qr_code_id FROM banner WHERE user_id = ? AND qr_code_id IN (?)`,
      [user_id, qrCodeIds]
    );

    const bannerMap = {};
    banners.forEach(b => {
      bannerMap[b.qr_code_id] = b.image;
    });

    // Step 5: Merge all data
    const combinedData = companyData.map(item => ({
      ...item, // All original qr_code fields (id, image, created_at etc.)
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      banner_image: bannerMap[item.id] || null
    }));

    return res.status(200).json({
      success: true,
      data: combinedData
    });

  } catch (error) {
    console.error("❌ Error in getByQrcode:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
}


  static async editQRCode(req, res) {
    try {
      const { id } = req.params;
      const {
        url,
        headline,
        footer,
        size,
        qr_color
      } = req.body;

      let banner_path = null;
      if (req.file) {
        banner_path = req.file.path;
      }

      if (!id) {
        return res.status(400).json({ error: "QR Code ID is required." });
      }

      const updatedData = {};
      if (url !== undefined) updatedData.url = url;
      if (headline !== undefined) updatedData.headline = headline;
      if (footer !== undefined) updatedData.footer = footer;
      if (size !== undefined) updatedData.size = size;
      if (qr_color !== undefined) updatedData.qr_color = qr_color;
      if (banner_path !== null) updatedData.banner_path = banner_path;

      if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({ error: "At least one field is required to update." });
      }

      const result = await QRCodeable.update(id, updatedData);

      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ error: "QR code not found or not updated." });
      }

      return res.status(200).json({
        success: true,
        message: "QR code updated successfully"
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async deleteQRCode(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "QR code ID is required." });
      }

      const result = await QRCodeable.delete(id);
      await db.query("DELETE FROM banner WHERE qr_code_id = ? ", [id])
      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: "QR code deleted successfully",
        });
      } else {
        return res.status(404).json({ error: "QR code not found." });
      }

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async createBusiness(req, res) {
    try {
      const { google_business_id, qr_code_url, user_id } = req.body;

      if (!google_business_id || !qr_code_url || !user_id) {
        return res.status(400).json({
          error: "google_business_id, qr_code_url, and user_id are required.",
        });
      }

      const result = await QRCodeable.create({
        google_business_id,
        qr_code_url,
        user_id,
      });

      return res.status(201).json({
        success: true,
        message: "Google Business QR code entry created successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

}


export default QRCodeController;
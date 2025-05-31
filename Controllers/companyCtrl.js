import Controllers from "../Models/Model.js";
import db from "../Config/Connection.js"
import bcrypt from 'bcrypt';

const company = new Controllers("company");
const userTable = new Controllers("users");

import cloudinary from '../Config/cloudinary.js';


cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});



class companyController {

  static async createCompany(req, res) {
    try {
      const { business_name, business_type, first_name, last_name, location, email, password, image } = req.body;

      if (email) {
        const existingCompany = await company.findEmail(email);
        if (existingCompany) {
          return res.status(409).json({ error: "Email already exists." });
        }
      }

      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      const dataToSave = {
        business_name,
        business_type,
      };

      if (first_name) dataToSave.first_name = first_name;
      if (last_name) dataToSave.last_name = last_name;
      if (location) dataToSave.location = location;
      if (email) dataToSave.email = email;
      if (hashedPassword) dataToSave.password = hashedPassword;
      if (image) dataToSave.image = image;

      const resultData = await company.create(dataToSave);
      const inserted = await company.getById(resultData.insertId);

      return res.status(201).json({
        success: true,
        message: "Company created successfully",
        data: inserted
      });

    } catch (error) {
      console.log("❌ Error while creating Company:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Something went wrong"
      });
    }
  }


  static async getallCompany(req, res) {
    try {
      const result = await company.getAll();

      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Companies fetched successfully",
          data: result,

        });
      }

      return res.status(404).json({
        success: false,
        message: "No companies found.",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching companies.",
        error: error.message,
      });
    }
  }

  static async getCompanyById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Company ID is required." });
      }

      const companyData = await company.getById(id);

      if (!companyData) {
        return res.status(404).json({ message: "Company not found." });
      }

      const user_id = companyData.id;

      const [businessReviews] = await db.query("SELECT * FROM review WHERE user_id = ?", [user_id]);

      const totalReviews = businessReviews.length;
      const averageRating = totalReviews > 0
        ? parseFloat((businessReviews.reduce((acc, review) => acc + Number(review.rating || 0), 0) / totalReviews).toFixed(1))
        : 0;

      // Get recent 2 reviews (sorted by created_at descending)
      const recentReviews = businessReviews
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 2);

      return res.status(200).json({
        success: true,
        message: "Company fetched successfully",
        data: companyData,
        totalReviews,
        averageRating,
        recentReviews
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteCompany(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Company ID is required." });
      }

      const result = await company.delete(id); // delete from DB

      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: "Company deleted successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No company found with this ID.",
        });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async editCompany(req, res) {
    try {
      const { id } = req.params;
      const {
        business_name,
        email,
        password,
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Company ID is required." });
      }

      if (
        !business_name &&
        !location &&
        !email &&
        !password &&
        !req.files?.image
      ) {
        return res.status(400).json({ error: "At least one field is required to update." });
      }

      // Check if company exists
      const existingCompany = await company.getById(id);
      if (!existingCompany) {
        return res.status(404).json({ message: "Company not found." });
      }

      // Prepare update data
      const updatedData = {};
      if (business_name) updatedData.business_name = business_name;
      if (email) updatedData.email = email;

      // Handle password hashing
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updatedData.password = hashedPassword;
      }

      // Handle image upload
      if (req.files && req.files.image) {
        const file = req.files.image;
        const cloudResult = await cloudinary.uploader.upload(file.tempFilePath);
        updatedData.image = cloudResult.secure_url;
      }

      // Update company record
      const result = await company.update(id, updatedData);

      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Company not updated. Please try again." });
      }

      return res.status(200).json({
        success: true,
        message: "Company updated successfully",
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateCompanyStatus(req, res) {
    try {
      const companyId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const result = await company.update(companyId, { status });

      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: "Company status updated successfully",
        });
      } else {
        return res.status(404).json({ message: "Company not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async getCompanyDetails(req, res) {
    try {
      const { business_id, brach_id } = req.query;

      if (business_id && brach_id) {
        const [statsResult] = await db.query(
          `SELECT 
              COUNT(*) AS total_reviews,
              AVG(rating) AS average_rating
           FROM review 
           WHERE user_id = ? AND qr_code_id = ?`,
          [business_id, brach_id]
        );

        const [lastTwoReviews] = await db.query(
          `SELECT * FROM review 
           WHERE user_id = ? AND qr_code_id = ? 
           ORDER BY created_at DESC 
           LIMIT 2`,
          [business_id, brach_id]
        );

        return res.json({
          success: true,
          stats: statsResult[0],
          last_two_reviews: lastTwoReviews
        });
      }
      // If only business_id is provided, return its QR codes
      if (business_id) {
        const [qrResult] = await db.query(
          "SELECT headline, id FROM qr_code WHERE user_id = ?",
          [business_id]
        );

        return res.json({
          success: true,
          qr_codes: qrResult
        });
      }

      // If neither, return companies list
      const [companyResult] = await db.query("SELECT business_name, id FROM company");
      return res.json({
        success: true,
        companies: companyResult
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching company, QR, or review data.",
        error: error.message
      });
    }
  }

  static async getCompanyDetailsForReviewMangement(req, res) {
    try {
      const { business_id, brach_id } = req.query;

      if (business_id && brach_id) {
        // Total reviews, average rating, and rating distribution
        const [statsResult] = await db.query(
          `SELECT 
          COUNT(r.id) AS total_reviews,
          AVG(CAST(ra.rating AS DECIMAL(10,2))) AS average_rating,
          COUNT(CASE WHEN ra.rating = 1 THEN 1 END) AS one_star,
          COUNT(CASE WHEN ra.rating = 2 THEN 1 END) AS two_star,
          COUNT(CASE WHEN ra.rating = 3 THEN 1 END) AS three_star,
          COUNT(CASE WHEN ra.rating = 4 THEN 1 END) AS four_star,
          COUNT(CASE WHEN ra.rating = 5 THEN 1 END) AS five_star
        FROM review r
        LEFT JOIN review_analysis ra ON r.id = ra.review_id
        WHERE r.user_id = ? AND r.qr_code_id = ?`,
          [business_id, brach_id]
        );
        const [lastTwoReviews] = await db.query(
          `SELECT 
          r.*, 
          ra.problems, 
          ra.sentiment, 
          ra.email, 
          ra.summary, 
          ra.emotional_tone, 
          ra.reply, 
          ra.solutions, 
          ra.rating 
        FROM review r
        LEFT JOIN review_analysis ra ON r.id = ra.review_id
        WHERE r.user_id = ? AND r.qr_code_id = ?
        ORDER BY r.created_at DESC
        `,
          [business_id, brach_id]
        );
        console.log("lastTwoReviews", lastTwoReviews);
        return res.json({
          success: true,
          stats: {
            ...statsResult[0],
            rating_distribution: {
              1: statsResult[0].one_star || 0,
              2: statsResult[0].two_star || 0,
              3: statsResult[0].three_star || 0,
              4: statsResult[0].four_star || 0,
              5: statsResult[0].five_star || 0,
            }
          },
          reviews: lastTwoReviews.map(review => ({
            ...review,
            problems: JSON.parse(review.problems || '[]'),
            solutions: JSON.parse(review.solutions || '[]')
          })),
        });
      }

      if (business_id) {
        const [qrResult] = await db.query(
          "SELECT headline, id FROM qr_code WHERE user_id = ?",
          [business_id]
        );

        return res.json({
          success: true,
          qr_codes: qrResult
        });
      }

      // If neither, return companies list
      const [companyResult] = await db.query("SELECT business_name, id FROM company");
      return res.json({
        success: true,
        companies: companyResult
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching company, QR, or review data.",
        error: error.message
      });
    }
  }


  static async getCompanyDetailsforSentimentAnalytics(req, res) {
    try {
      const { business_id, brach_id, frequency } = req.query;

      if (business_id && brach_id) {
        // Get total review count and average rating
        const [statsResult] = await db.query(
          `SELECT 
              COUNT(*) AS total_reviews,
              AVG(rating) AS average_rating
           FROM review 
           WHERE user_id = ? AND qr_code_id = ?`,
          [business_id, brach_id]
        );

        // Get last 2 reviews
        const [lastTwoReviews] = await db.query(
          `SELECT * FROM review 
           WHERE user_id = ? AND qr_code_id = ? 
           ORDER BY created_at DESC 
           LIMIT 2`,
          [business_id, brach_id]
        );

        // Determine group by based on frequency
        let groupByClause = "DATE(created_at)";
        if (frequency === "monthly") groupByClause = "DATE_FORMAT(created_at, '%Y-%m')";
        else if (frequency === "yearly") groupByClause = "YEAR(created_at)";

        // Get sentiment breakdown
        const [sentimentStats] = await db.query(
          `SELECT 
              ${groupByClause} as period,
              SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS positive_reviews,
              SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS neutral_reviews,
              SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) AS negative_reviews
           FROM review
           WHERE user_id = ? AND qr_code_id = ?
           GROUP BY period
           ORDER BY period DESC`,
          [business_id, brach_id]
        );

        return res.json({
          success: true,
          // stats: statsResult[0],
          // last_two_reviews: lastTwoReviews,
          sentiment_trends: sentimentStats
        });
      }

      if (business_id) {
        const [qrResult] = await db.query(
          "SELECT headline, id FROM qr_code WHERE user_id = ?",
          [business_id]
        );
        return res.json({
          success: true,
          qr_codes: qrResult
        });
      }

      const [companyResult] = await db.query("SELECT business_name, id FROM company");
      return res.json({
        success: true,
        companies: companyResult
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching data.",
        error: error.message
      });
    }
  }

}


export default companyController;






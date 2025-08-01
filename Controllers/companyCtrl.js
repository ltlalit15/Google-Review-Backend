import Controllers from "../Models/Model.js";
import db from "../Config/Connection.js"
import bcrypt from 'bcrypt';

const company = new Controllers("company");
const userTable = new Controllers("users");
import { OpenAI } from "openai";

const base64Key = "c2stcHJvai1EdVE3Q08yRTdvdVhYN0dSa2Y0eWxrNmpLczVqYlRDLXJycGZSX1JldllaM05LR1V4ZkVFOGQtWkNqeUtMaVAwQTRQam56eThvWVQzQmxia0ZKMVdDbkcwLXh0RkVqU1BVenV0azNDT2lwLXl6cEVUWmE3cVpMQkFXYXpVaWpDX2ZWaDNwUkFkVzFZMWtuWWRBUkNSQ3ByOHpJNEE="; // your base64 key
const OPENAI_API_KEY = Buffer.from(base64Key, "base64").toString("utf-8");
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

import cloudinary from '../Config/cloudinary.js';


cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});



class companyController {

  static async createCompany(req, res) {
    try {
      const {
        business_name,
        business_type,
        first_name,
        last_name,
        location,
        email,
        password,
        image: imageFromBody // <-- added
      } = req.body;

      let imageUrl = "";

      // Email check
      if (email) {
        const existingCompany = await company.findEmail(email);
        if (existingCompany) {
          return res.status(409).json({ error: "Email already exists." });
        }
      }

      // ✅ Handle image as string URL from body
      if (imageFromBody && typeof imageFromBody === "string" && imageFromBody.startsWith("http")) {
        imageUrl = imageFromBody;
      }

      // ✅ Handle image file upload
      else if (req.files?.image && req.files.image.size > 0) {
        const imageFile = req.files.image;
        const uploadResult = await cloudinary.uploader.upload(
          imageFile.tempFilePath || imageFile.path,
          {
            folder: "qrcodes",
            resource_type: "image",
          }
        );
        imageUrl = uploadResult.secure_url;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const dataToSave = {
        business_name,
        business_type,
        first_name,
        last_name,
        location,
        email,
        password: hashedPassword,
        image: imageUrl,
      };

      const resultData = await company.create(dataToSave);
      const inserted = await company.getById(resultData.insertId);

      return res.status(201).json({
        success: true,
        message: "Company created successfully",
        data: inserted,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || "Something went wrong",
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

      return res.status(200).json({
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
        first_name,
        last_name,
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Company ID is required." });
      }

      if (
        !business_name &&
        !location &&
        !email &&
        !password &&
        !first_name &&
        !last_name &&
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
      if (first_name) updatedData.first_name = first_name;
      if (last_name) updatedData.last_name = last_name;

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
        console.log("statsResult",statsResult);

        const [lastTwoReviews] = await db.query(
          `SELECT * FROM review 
         WHERE user_id = ? AND qr_code_id = ? 
         ORDER BY created_at DESC 
         LIMIT 2`,
          [business_id, brach_id]
        );

        // AI Feedback Stats
        const [result] = await db.query(
          `SELECT 
          ROUND(AVG(ai_response_quality) * 10, 2) AS ai_response_quality_percentage,
          ROUND(AVG(sentiment_analysis_quality) * 10, 2) AS sentiment_analysis_quality_percentage,
          COUNT(*) AS total_feedbacks
         FROM ai_feedback 
         WHERE user_id = ? AND qr_code_id = ?`,
          [business_id, brach_id]
        );

        const [reviewStats] = await db.query(
          `SELECT
          COUNT(*) AS total_reviews,
          SUM(CASE WHEN sentiment = 'Positive' THEN 1 ELSE 0 END) AS positive_reviews
         FROM review_analysis
         WHERE user_id = ? AND qr_code_id = ?`,
          [business_id, brach_id]
        );

        // const [comononkeywords] = await db.query(
        //   `SELECT feedback FROM review WHERE user_id = ? AND qr_code_id = ?`,
        //   [business_id, brach_id]
        // );

        // const allFeedbackText = comononkeywords.map(f => f.feedback).join(" ");

        //         let keywordData = [];

        //         try {
        //           const response = await openai.chat.completions.create({
        //             model: "gpt-4", // or "gpt-3.5-turbo"
        //             messages: [
        //               {
        //                 role: "system",
        //                 content:
        //                   "You are an AI assistant that analyzes customer feedback and finds top 3 most important keywords with their importance in percentage (based on repetition and relevance).",
        //               },
        //               {
        //                 role: "user",
        //                 content: `Analyze the following customer feedbacks and return the top 3 most relevant keywords with their relative importance in JSON format like this:
        // [
        //   { "label": "Service", "percentage": 50 },
        //   { "label": "Food", "percentage": 30 },
        //   { "label": "Atmosphere", "percentage": 20 }
        // ]

        // Here are the feedbacks:
        // "${allFeedbackText}"`,
        //               },
        //             ],
        //           });

        //           const raw = response.choices[0].message.content;

        //           // Parse only if JSON is properly returned
        //           keywordData = JSON.parse(raw);
        //         } catch (e) {
        //           console.error("ChatGPT keyword parsing failed:", e.message);
        //           keywordData = [];
        //         }

        const totalReviews = reviewStats[0].total_reviews;
        const positiveReviews = reviewStats[0].positive_reviews;

        const positiveReviewPercentage =
          totalReviews > 0
            ? parseFloat(((positiveReviews / totalReviews) * 100).toFixed(2))
            : 0;

        return res.json({
          success: true,
          stats: statsResult[0],
          last_two_reviews: lastTwoReviews,
          result,
          positive_review_percentage: positiveReviewPercentage,
          // top_keywords: keywordData, // ✅ Fixed this line
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
          qr_codes: qrResult,
        });
      }

      // If neither, return companies list
      const [companyResult] = await db.query(
        "SELECT business_name, id FROM company"
      );
      return res.json({
        success: true,
        companies: companyResult,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching company, QR, or review data.",
        error: error.message,
      });
    }
  }

static async getKeywordsFromFeedback(req, res) {
  try {
    const { business_id, brach_id } = req.query;

    if (!business_id || !brach_id) {
      return res.status(400).json({
        success: false,
        message: "business_id and brach_id are required",
      });
    }

    // Get feedbacks from DB
    const [feedbackData] = await db.query(
      `SELECT feedback FROM review WHERE user_id = ? AND qr_code_id = ?`,
      [business_id, brach_id]
    );


    const allFeedbackText = feedbackData.map(f => f.feedback).join(" ");

    if (!allFeedbackText || allFeedbackText.trim() === "") {
      return res.json({
        success: true,
        top_keywords: [],
      });
    }

    let keywordData = [];

    try {
      // 🔥 Call OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that analyzes customer feedback and finds top 3 most important keywords with their importance in percentage (based on repetition and relevance).",
          },
          {
            role: "user",
            content: `Analyze the following customer feedbacks and return only the top 3 most relevant keywords with their relative importance in strict JSON format like this:
[
  { "label": "Service", "percentage": 50 },
  { "label": "Food", "percentage": 30 },
  { "label": "Atmosphere", "percentage": 20 }
]

Return only the JSON array. No explanation. No text before or after.

Here are the feedbacks:
"${allFeedbackText}"`,
          },
        ],
      });

      const raw = response.choices[0].message.content;

      // ✅ Extract only the JSON part from response
      const jsonMatch = raw.match(/\[\s*{[\s\S]*}\s*\]/); // Match JSON array
      
      if (jsonMatch && jsonMatch[0]) {
        keywordData = JSON.parse(jsonMatch[0]);
      } else {
        console.warn("Valid JSON array not found in OpenAI response");
      }

    } catch (err) {
      keywordData = [];
    }

    return res.json({
      success: true,
      top_keywords: keywordData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while extracting keywords",
      error: error.message,
    });
  }
}


static async getCompanyDetailsForReviewMangement(req, res) {
  try {
    const { business_id, brach_id } = req.query;

    if (business_id && brach_id) {
      // Step 1: Stats only from `review` table
      const [statsResult] = await db.query(
        `SELECT 
          COUNT(id) AS total_reviews,
          AVG(CAST(rating AS DECIMAL(10,2))) AS average_rating,
          COUNT(CASE WHEN rating = 1 THEN 1 END) AS one_star,
          COUNT(CASE WHEN rating = 2 THEN 1 END) AS two_star,
          COUNT(CASE WHEN rating = 3 THEN 1 END) AS three_star,
          COUNT(CASE WHEN rating = 4 THEN 1 END) AS four_star,
          COUNT(CASE WHEN rating = 5 THEN 1 END) AS five_star
        FROM review
        WHERE user_id = ? AND qr_code_id = ?`,
        [business_id, brach_id]
      );

      // Step 2: Last 2 reviews with JOIN from `review_analysis`
      const [lastTwoReviews] = await db.query(
        `SELECT 
          r.id,
          r.user_id,
          r.qr_code_id,
          r.description,
          r.feedback,
          r.rating,
          r.email,
          r.image,
          r.created_at,
          ra.problems,
          ra.solutions,
          ra.sentiment,
          ra.summary,
          ra.reply,
          ra.emotional_tone
        FROM review r
        LEFT JOIN review_analysis ra ON r.id = ra.review_id
        WHERE r.user_id = ? AND r.qr_code_id = ?
        ORDER BY r.created_at DESC
        LIMIT 2`,
        [business_id, brach_id]
      );

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
        }))
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






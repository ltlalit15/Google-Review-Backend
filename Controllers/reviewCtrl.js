import Controllers from "../Models/Model.js";
import db from "../Config/Connection.js"

const review = new Controllers("review");
import cloudinary from '../Config/cloudinary.js';


cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

class reviewController {

  // with image
  // static async createReview(req, res) {
  //   try {
  //     const { user_id, qr_code_id = null, description = null, feedback = null, rating } = req.body; // Add rating to request body

  //     // Validate rating
  //     if (rating < 1 || rating > 5) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Rating must be between 1 and 5"
  //       });
  //     }

  //     let imageUrl = "";

  //     // Check if image is uploaded
  //     if (req.files && req.files.image) {
  //       const imageFile = req.files.image;

  //       console.log("Image file found:", imageFile.name);
  //       console.log("tempFilePath:", imageFile.tempFilePath);

  //       // Upload to Cloudinary
  //       const uploadResult = await cloudinary.uploader.upload(
  //         imageFile.tempFilePath,
  //         {
  //           folder: "review",
  //           resource_type: "image"
  //         }
  //       );

  //       console.log("Cloudinary uploaded URL:", uploadResult.secure_url);

  //       imageUrl = uploadResult.secure_url;
  //     } else {
  //       console.log("No image file uploaded.");
  //     }

  //     // Prepare data to save in the database
  //     const dataToSave = {
  //       user_id,
  //       qr_code_id,  // Optional value (can be null)
  //       description,  // Optional value (can be null)
  //       feedback,     // Optional value (can be null)
  //       rating,       // Save the rating to the DB
  //       image: imageUrl  // Save to `image` column in DB
  //     };

  //     // Save review details in the database
  //     const resultData = await review.create(dataToSave);
  //     const inserted = await review.getById(resultData.insertId);

  //     return res.status(201).json({
  //       success: true,
  //       message: "Review created successfully",
  //       data: inserted
  //     });

  //   } catch (error) {
  //     console.log("Error while creating review:", error);
  //     return res.status(500).json({
  //       success: false,
  //       error: error.message || "Something went wrong"
  //     });
  //   }
  // }


  // without image 
  static async createReview(req, res) {
    try {
      const { user_id, qr_code_id = null, description = null, feedback = null, rating, email, image } = req.body; // Add rating to request body

      // Validate rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5"
        });
      }

      // Prepare data to save in the database
      const dataToSave = {
        user_id,
        qr_code_id,  // Optional value (can be null)
        description,  // Optional value (can be null)
        feedback,     // Optional value (can be null)
        rating,       // Save the rating to the DB
        email,
        image: image || ""  // No image to be saved
      };

      // Save review details in the database
      const resultData = await review.create(dataToSave);
      const inserted = await review.getById(resultData.insertId);

      return res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: inserted
      });

    } catch (error) {
      console.log("Error while creating review:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Something went wrong"
      });
    }
  }



  static async getallReview(req, res) {
    try {
      const result = await review.getAll();
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          message: "review fetched successfully",
          data: result,

        });
      } else {
        return res.status(404).json({ message: "No review found." });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async getReviewById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Review ID is required." });
      }

      const reviewData = await review.getById(id);

      if (!reviewData) {
        return res.status(404).json({ message: "Review not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Review fetched successfully",
        data: reviewData,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async getReviewDetails(req, res) {
    try {
      const { user_id, qr_code_id } = req.query; // Extract query parameters from the request

      // Validate if both user_id and qr_code_id are provided
      if (!user_id || !qr_code_id) {
        return res.status(400).json({
          success: false,
          message: "Both user_id and qr_code_id are required"
        });
      }

      // Perform the SQL query to fetch the review (rating) and qr_code URL
      const [result] = await db.query(
        `SELECT r.rating, q.url, q.place_id , q.language,q.business_rating
           FROM review r
           JOIN qr_code q ON r.qr_code_id = q.id
           WHERE r.user_id = ? AND r.qr_code_id = ?`,
        [user_id, qr_code_id]
      );

      // Check if data is found
      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No review or QR code found for the given user_id and qr_code_id"
        });
      }

      // Return the review rating and QR code URL in the response
      return res.status(200).json({
        success: true,
        message: "Review and QR code details fetched successfully",
        data: {
          rating: result[0].rating,
          qr_code_url: result[0].url,
          place_id: result[0].place_id,
          business_rating: result[0].business_rating,
          language: result[0].language

        }
      });

    } catch (error) {
      console.log("Error while fetching review and qr_code details:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Something went wrong"
      });
    }
  }

  static async getDashboard(req, res) {
    try {
      // Fetch Total Reviews
      const totalQuery = `
              SELECT COUNT(*) AS total 
              FROM review
          `;
      const [totalResult] = await db.query(totalQuery);
      const totalReviews = totalResult[0].total;

      // Fetch Average Rating
      const avgQuery = `
              SELECT AVG(rating) AS averageRating 
              FROM review
          `;
      const [avgResult] = await db.query(avgQuery);
      const averageRating = parseFloat(avgResult[0].averageRating || 0).toFixed(1);

      // Fetch Rating Distribution (5-star, 4-star, etc.)
      const ratingDistributionQuery = `
              SELECT 
                  COUNT(CASE WHEN rating = 5 THEN 1 END) AS fiveStar,
                  COUNT(CASE WHEN rating = 4 THEN 1 END) AS fourStar,
                  COUNT(CASE WHEN rating = 3 THEN 1 END) AS threeStar,
                  COUNT(CASE WHEN rating = 2 THEN 1 END) AS twoStar,
                  COUNT(CASE WHEN rating = 1 THEN 1 END) AS oneStar
              FROM review
          `;
      const [ratingDistribution] = await db.query(ratingDistributionQuery);

      // Fetch details of the first 25 reviews (description, feedback, rating, name)
      const reviewDetailsQuery = `
      SELECT 
        r.id AS review_id, 
        r.user_id, 
        r.qr_code_id, 
        r.description, 
        r.feedback,
        r.rating,
        r.created_at,
        r.email,
        r.image,
        ra.problems, 
        ra.solutions,
        ra.summary,
        ra.reply,
        ra.emotional_tone,
        ra.review_id,
        ra.user_id,
        ra.qr_code_id
      FROM review r
      LEFT JOIN review_analysis ra ON r.id = ra.review_id
      ORDER BY r.created_at DESC
      LIMIT 25
    `;

      const [reviewDetails] = await db.query(reviewDetailsQuery);

      console.log("reviewDetails", reviewDetails);
      return res.status(200).json({
        success: true,
        message: "Dashboard data fetched successfully.",
        data: {
          totalReviews,
          averageRating,
          ratingDistribution: ratingDistribution[0],
          reviews: reviewDetails.map(review => ({
            ...review,
            problems: JSON.parse(review.problems || '[]'),
            solutions: JSON.parse(review.solutions || '[]')
          }))
        }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching dashboard data.",
        error: error.message
      });
    }
  }

  static async getCompanyDashboard(req, res) {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Missing 'id' in query parameters.",
        });
      }

      // Fetch Total Reviews
      const totalQuery = `
        SELECT COUNT(*) AS total 
        FROM review 
        WHERE user_id = ?
      `;
      const [totalResult] = await db.query(totalQuery, [id]);
      const totalReviews = totalResult[0]?.total || 0;

      // Fetch Average Rating
      const avgQuery = `
        SELECT AVG(rating) AS averageRating 
        FROM review 
        WHERE user_id = ?
      `;
      const [avgResult] = await db.query(avgQuery, [id]);
      const averageRating = parseFloat(avgResult[0]?.averageRating || 0).toFixed(1);

      // Fetch Rating Distribution
      const ratingDistributionQuery = `
        SELECT 
          COUNT(CASE WHEN rating = 5 THEN 1 END) AS fiveStar,
          COUNT(CASE WHEN rating = 4 THEN 1 END) AS fourStar,
          COUNT(CASE WHEN rating = 3 THEN 1 END) AS threeStar,
          COUNT(CASE WHEN rating = 2 THEN 1 END) AS twoStar,
          COUNT(CASE WHEN rating = 1 THEN 1 END) AS oneStar
        FROM review 
        WHERE user_id = ?
      `;
      const [ratingDistribution] = await db.query(ratingDistributionQuery, [id]);

      // Fetch Review Details with Analysis
      const reviewDetailsQuery = `
        SELECT DISTINCT 
          r.id, r.qr_code_id, r.user_id, r.rating, r.feedback, r.created_at, r.email,
          ra.problems, ra.solutions, ra.sentiment , ra.summary, ra.reply, ra.emotional_tone
        FROM review r
        LEFT JOIN review_analysis ra ON r.id = ra.review_id AND r.qr_code_id = ra.qr_code_id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT 25
      `;
      const [rawReviews] = await db.query(reviewDetailsQuery, [id]);

      // Remove duplicates and parse JSON fields
      const reviewMap = new Map();
      rawReviews.forEach((review) => {
        if (!reviewMap.has(review.id)) {
          reviewMap.set(review.id, {
            ...review,
            problems: review.problems ? JSON.parse(review.problems) : [],
            solutions: review.solutions ? JSON.parse(review.solutions) : [],
            summary: review.summary ? review.summary : [],
            reply: review.reply ? review.reply : [],
          });
        }
      });

      const reviews = Array.from(reviewMap.values());

      return res.status(200).json({
        success: true,
        message: "Dashboard data fetched successfully.",
        data: {
          totalReviews,
          averageRating,
          ratingDistribution: ratingDistribution[0],
          reviews,
        },
      });
    } catch (error) {
      console.error("Error in getCompanyDashboard:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching dashboard data.",
        error: error.message,
      });
    }
  }




}

export default reviewController;


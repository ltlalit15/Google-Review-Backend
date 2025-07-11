import Controllers from "../Models/Model.js";
const review_analysisTable = new Controllers("review_analysis");
const servay_reviews = new Controllers("review_survey");
import db from "../Config/Connection.js"
import emailjs from '@emailjs/nodejs';

class review_analysisController {
static async getCurrentMonthReviewAnalysis(req, res) {
  try {
    const { user_id, qr_code_id, fromDate, toDate } = req.query;

    if (!user_id || !qr_code_id) {
      return res.status(400).json({
        success: false,
        message: "Missing user_id or qr_code_id"
      });
    }

    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    let query = `
      SELECT 
        r.feedback,
        ra.summary,
        ra.sentiment,
        r.rating,
        r.created_at
      FROM 
        review r
      LEFT JOIN review_analysis ra ON ra.review_id = r.id
      WHERE 
        r.user_id = ? 
        AND r.qr_code_id = ?
    `;

    const params = [user_id, qr_code_id];

    if (fromDate && toDate) {
      const startDate = `${fromDate} 00:00:00`;
      const endDate = `${toDate} 23:59:59`;
      query += " AND r.created_at BETWEEN ? AND ? ";
      params.push(startDate, endDate);
    }

    query += " ORDER BY r.created_at DESC";

    const [reviews] = await db.query(query, params);

    // Apply fallback sentiment
    const enrichedReviews = reviews.map(r => {
      let sentiment = r.sentiment;
      if (!sentiment && r.rating == 5) {
        sentiment = "positive";
      } else if (!sentiment) {
        sentiment = "Not analyzed";
      }
      return {
        ...r,
        sentiment
      };
    });

    const total = enrichedReviews.length;
    const positive = enrichedReviews.filter(r => r.sentiment === "positive").length;
    const negative = enrichedReviews.filter(r => r.sentiment === "negative").length;
    const neutral = enrichedReviews.filter(r => r.sentiment === "neutral").length;

    const calculatePercentage = (count) =>
      total ? ((count / total) * 100).toFixed(2) : "0.00";

    const response = {
      month: currentMonthYear,
      total,
      positive,
      negative,
      mixed: neutral,
      positive_percentage: calculatePercentage(positive),
      negative_percentage: calculatePercentage(negative),
      mixed_percentage: calculatePercentage(neutral),
      feedbacks: enrichedReviews.map(r => ({
        feedback: r.feedback || "No feedback available",
        summary: r.summary || "No summary available",
        sentiment: r.sentiment,
        created_at: r.created_at || "No date available"
      }))
    };

    return res.json({
      success: true,
      message: "Current month review analysis fetched successfully",
      data: response
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching review analysis",
      error: error.message
    });
  }
}



  static async createReviewAnalysis(req, res) {
    try {
      const { problems, sentiment, solutions, user_id, qr_code_id, review_id, summary, reply, emotional_tone, rating, email } = req.body;

      // Validate input data
      // if (!problems || !sentiment || !solutions || !user_id || !qr_code_id || !review_id || !summary || !reply || !emotional_tone || !rating || !email) {
      //   return res.status(400).json({ error: "All fields are required." });
      // }

      // Generate Order ID (if needed)

      // Insert new review analysis into the database
      const result = await review_analysisTable.create({
        problems: JSON.stringify(problems),
        sentiment,
        solutions: JSON.stringify(solutions),
        user_id,
        qr_code_id,
        review_id,
        summary,
        reply,
        emotional_tone,
        rating,
        email
      });

      if (result) {

        const data = await review_analysisTable.getById(result.insertId)
        return res.status(201).json({
          success: true,
          message: "Review analysis created successfully",
          data,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to create review analysis",
        });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async createreview_servay(req, res) {
    try {
      const { survey_review, user_id, qr_code_id } = req.body;

      const [existingServay] = await db.query("SELECT * FROM review_survey WHERE user_id = ? AND qr_code_id = ? ", [user_id, qr_code_id])
      console.log(existingServay);
      if (existingServay.length > 0) {
        return res.status(409).json("For this buisness you already created a servay form")
      }
      // if (!survey_review || !user_id || !qr_code_id || !human_message) {
      //   return res.status(400).json({ error: "All fields are required." });
      // }

      const result = await servay_reviews.create({
        survey_review: JSON.stringify(survey_review),
        user_id,
        qr_code_id,
      });

      if (result) {
        return res.status(201).json({
          success: true,
          message: "createreview_servay created successfully",
          data: result,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to create createreview_servay",
        });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  static async getreview_servay(req, res) {
    try {
      const { user_id, qr_code_id } = req.query;

      if (user_id && qr_code_id) {
        let [result] = await db.query(
          "SELECT * FROM review_survey WHERE user_id = ? AND qr_code_id = ?",
          [user_id, qr_code_id]
        );
        let [ress] = await db.query("SELECT * FROM qr_code WHERE id = ? ", [qr_code_id[0]])
        console.log(ress);
        result = result.map((e) => ({
          ...e,
          language: ress[0].language,
          survey_review: e.survey_review ? JSON.parse(e.survey_review) : null,
        }));

        return res.status(200).json({
          success: true,
          message: "Review survey fetched successfully",
          data: result,
        });
      } else {
        let result = await servay_reviews.getAll();

        result = result.map((item) => ({
          ...item,
          survey_review: item.survey_review ? JSON.parse(item.survey_review) : null,
        }));

        return res.status(200).json({
          success: true,
          message: "All review surveys fetched successfully",
          data: result,
        });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async sheduleMail(req, res) {
    try {
      const { feedback, email } = req.body;

      if (!feedback || !email) {
        return res.status(400).json({ success: false, message: "Missing feedback or email" });
      }

      const randomDays = Math.floor(Math.random() * 2) + 1;
      const delayInMs = randomDays * 24 * 60 * 60 * 1000;

      // const randomDays = Math.floor(Math.random() * 5) + 1;
      // const delayInMs = randomDays * 60 * 1000;

      const templateParams = {
        email,
        name: email,
        title: "Review Analysis",
        reply: feedback,
      };

      console.log(`⏳ Email will be sent after ${randomDays} day(s)`);

      setTimeout(async () => {
        try {
          await emailjs.send(
            "service_vvp6mfh",
            "template_wkrvyhk",
            templateParams,
            "B78PsxsVYoIyekT6g"
          );
          console.log("✅ Email sent successfully to:", email);
        } catch (err) {
          console.error("❌ Error sending email:", err.message);
        }
      }, delayInMs);

      return res.status(200).json({
        success: true,
        message: `Email scheduled successfully to be sent after ${randomDays} day(s)`,
        data: { email }
      });

    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default review_analysisController;

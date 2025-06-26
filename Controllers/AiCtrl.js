// import { OpenAI } from "openai";

// const base64Key = "c2stcHJvai1EdVE3Q08yRTdvdVhYN0dSa2Y0eWxrNmpLczVqYlRDLXJycGZSX1JldllaM05LR1V4ZkVFOGQtWkNqeUtMaVAwQTRQam56eThvWVQzQmxia0ZKMVdDbkcwLXh0RkVqU1BVenV0azNDT2lwLXl6cEVUWmE3cVpMQkFXYXpVaWpDX2ZWaDNwUkFkVzFZMWtuWWRBUkNSQ3ByOHpJNEE=";
// const OPENAI_API_KEY = Buffer.from(base64Key, "base64").toString("utf-8");

// const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// class AIController {

//     static async sendFeedback(req, res) {
//         const { human_message, language = "English" } = req.body;

//         try {
//             let prompt;

//             if (human_message) {
//                 prompt = `
// You are an AI feedback analysis assistant. Analyze the following user feedback and extract:
// 1. Problems
// 2. Sentiment (Positive, Negative, Neutral)
// 3. Solutions (suggest actionable solutions to address the problem, even if the user hasn't provided any)
// 4. Emotional Tone (e.g., frustrated, happy, concerned)
// 5. Smart Reply (1-2 sentence reply to the user)
// 6. Summary (brief summary of the feedback)

// Feedback:
// "${human_message}"

// Respond in JSON with keys: problems, sentiment, solutions, emotional_tone, reply, summary.
// `;
//             } else {
//                 // ✅ Case 2: Only 5-star rating given, no message
//                 prompt = `
// You are an AI assistant. A user has given a 5-star rating without writing any feedback. Respond in the following JSON format:

// {
//   "emotional_tone": "...",
//   "reply": "..." // Give a polite thank-you reply in "${language}" language
// }

// Make the emotional_tone accurate (e.g., happy, satisfied, grateful) and reply respectful and warm.
// `;
//             }

//             const response = await openai.chat.completions.create({
//                 model: "gpt-4o",
//                 messages: [{ role: "user", content: prompt }],
//             });

//             let aiText = response.choices[0].message.content;
//             aiText = aiText.replace(/```json|```/g, "").trim();

//             try {
//                 const parsed = JSON.parse(aiText);
//                 res.json({ success: true, data: parsed });
//             } catch (jsonErr) {
//                 res.status(500).json({ success: false, error: "Failed to parse AI response", raw: aiText });
//             }
//         } catch (error) {
//             console.error("AI Error:", error);
//             res.status(500).json({ success: false, error: "AI analysis failed" });
//         }
//     }
// }
// export default AIController;


import { OpenAI } from "openai";
import db from "../Config/Connection.js";

const base64Key = "c2stcHJvai1EdVE3Q08yRTdvdVhYN0dSa2Y0eWxrNmpLczVqYlRDLXJycGZSX1JldllaM05LR1V4ZkVFOGQtWkNqeUtMaVAwQTRQam56eThvWVQzQmxia0ZKMVdDbkcwLXh0RkVqU1BVenV0azNDT2lwLXl6cEVUWmE3cVpMQkFXYXpVaWpDX2ZWaDNwUkFkVzFZMWtuWWRBUkNSQ3ByOHpJNEE="; // your base64 key
const OPENAI_API_KEY = Buffer.from(base64Key, "base64").toString("utf-8");
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

class AIController {
    static async sendFeedback(req, res) {
        const {
            human_message,
            language = "English",
            email,
            rating,
            user_id,
            qr_code_id,
            review_id,
        } = req.body;

        try {
            const isFeedbackGiven = Boolean(human_message);

            let reply = "";
            let tone = "";
            let response_quality = null;
            let sentiment_confidence = null;
            let problems = [];
            let sentiment = "";
            let solutions = [];
            let summary = "";

            if (isFeedbackGiven) {
                // Step 1: Generate reply from feedback
                const replyPrompt = `
User feedback: "${human_message}"

Write a 1-2 sentence smart reply to this feedback.
Also, mention the emotional tone (e.g. happy, frustrated, confused)

Respond in JSON:
{
  "reply": "...",
  "emotional_tone": "..."
}
        `;

                const replyRes = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: replyPrompt }],
                });

                const replyParsed = JSON.parse(
                    replyRes.choices[0].message.content.replace(/```json|```/g, "").trim()
                );

                reply = replyParsed.reply;
                tone = replyParsed.emotional_tone;

                const evalPrompt = `
You are an expert AI feedback evaluator. Analyze the following user feedback and AI reply:

Feedback: "${human_message}"
Reply: "${reply}"

First, identify:
- problems
- sentiment (positive, neutral, negative)
- solutions (actionable suggestions)
- summary of user's message

Then rate the following:

➡️ Response Quality (1-10):
1 = Completely irrelevant or misleading  
2 = Irrelevant, vague, or doesn't address the user's feedback  
3 = Poor response; very generic and not useful  
4 = Basic reply; lacks empathy or context  
5 = Average reply; slightly relevant but missing personalization  
6 = Decent reply; relevant but still lacks clarity or warmth  
7 = Good reply; relevant and polite but could be more detailed  
8 = Very good; relevant, empathetic, and clear  
9 = Excellent; thoughtful, emotionally appropriate, and helpful  
10 = Perfect; highly personalized, emotionally intelligent, and fully addresses the user's feedback

➡️ Sentiment Confidence (1-10):
1 = Extremely vague or unclear feedback  
2 = Almost no sentiment can be extracted  
3 = Very minimal sentiment; needs guessing  
4 = Weak sentiment; hard to detect  
5 = Moderate confidence; some signal  
6 = Above average confidence  
7 = Good confidence; mostly clear sentiment  
8 = Strong sentiment with few doubts  
9 = Very strong sentiment, clearly stated  
10 = Clear, expressive, and direct sentiment in feedback

Respond strictly in JSON:
{
  "problems": [...],
  "sentiment": "...",
  "solutions": [...],
  "summary": "...",
  "response_quality": 1-10,
  "sentiment_confidence": 1-10
}
`;


                const evalRes = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: evalPrompt }],
                });

                const evalParsed = JSON.parse(
                    evalRes.choices[0].message.content.replace(/```json|```/g, "").trim()
                );

                problems = evalParsed.problems || [];
                sentiment = evalParsed.sentiment || "";
                solutions = evalParsed.solutions || [];
                summary = evalParsed.summary || "";
                response_quality = evalParsed.response_quality || 0;
                sentiment_confidence = evalParsed.sentiment_confidence || 0;

                // Insert into DB
                await db.query(
                    `INSERT INTO review_analysis (problems, sentiment, solutions, emotional_tone, reply, summary, email, rating, user_id, qr_code_id, review_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        JSON.stringify(problems),
                        sentiment,
                        JSON.stringify(solutions),
                        tone,
                        reply,
                        summary,
                        email,
                        rating,
                        user_id,
                        qr_code_id,
                        review_id,
                    ]
                );

                await db.query(
                    `INSERT INTO ai_feedback (review_id, ai_response_quality, sentiment_analysis_quality, human_message , user_id , qr_code_id)
          VALUES (?, ?, ?, ? , ?, ?)`,
                    [review_id, response_quality, sentiment_confidence, human_message, user_id, qr_code_id]
                );

            } else {
                // No feedback given
                const noFeedbackPrompt = `
You are an AI assistant. A user gave a ${rating}-star rating without feedback. Reply warmly in ${language}.

Respond in:
{
  "reply": "...",
  "emotional_tone": "..."
}
        `;

                const nfRes = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: noFeedbackPrompt }],
                });

                const nfParsed = JSON.parse(
                    nfRes.choices[0].message.content.replace(/```json|```/g, "").trim()
                );

                reply = nfParsed.reply;
                tone = nfParsed.emotional_tone;

                await db.query(
                    `INSERT INTO review_analysis (emotional_tone, reply, email, rating, user_id, qr_code_id, review_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [tone, reply, email, rating, user_id, qr_code_id, review_id]
                );
            }

            return res.json({
                success: true,
                data: {
                    reply,
                    tone,
                    ...(isFeedbackGiven && {
                        problems,
                        sentiment,
                        solutions,
                        summary,
                        response_quality,
                        sentiment_confidence,
                    }),
                },
            });
        } catch (error) {
            console.error("AI Error:", error.message);
            return res.status(500).json({ success: false, error: "AI analysis failed" });
        }
    }
    static async dashboard(req, res) {
        try {
            // AI Feedback Stats
            const [result] = await db.query(`
      SELECT 
        ROUND(AVG(ai_response_quality) * 10, 2) AS ai_response_quality_percentage,
        ROUND(AVG(sentiment_analysis_quality) * 10, 2) AS sentiment_analysis_quality_percentage,
        COUNT(*) AS total_feedbacks
      FROM ai_feedback
    `);

            // Positive & Total Review Count
            const [reviewStats] = await db.query(`
      SELECT
        COUNT(*) AS total_reviews,
        SUM(CASE WHEN sentiment = 'Positive' THEN 1 ELSE 0 END) AS positive_reviews
      FROM review_analysis
    `);


            const totalReviews = reviewStats[0].total_reviews;
            const positiveReviews = reviewStats[0].positive_reviews;

            const positiveReviewPercentage = totalReviews > 0
                ? parseFloat(((positiveReviews / totalReviews) * 100).toFixed(2))
                : 0;

            res.status(200).json({
                success: true,
                data: {
                    ...result[0],
                    total_reviews: totalReviews,
                    positive_review_percentage: positiveReviewPercentage,
                },
            });
        } catch (error) {
            console.error("Dashboard Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }



    static async review(req, res) {
        try {
            const [reviews] = await db.query(`
            SELECT r.*, q.image 
            FROM review r
            JOIN banner q ON r.qr_code_id = q.id AND r.user_id = q.user_id
            WHERE r.rating IN (3, 4)
            LIMIT 10
        `);

            if (reviews.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No reviews found with rating 3 or 4"
                });
            }

            return res.status(200).json({
                success: true,
                data: reviews
            });

        } catch (error) {
            console.error("Review Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

}

export default AIController;

import { OpenAI } from "openai";

const base64Key = "c2stcHJvai1EdVE3Q08yRTdvdVhYN0dSa2Y0eWxrNmpLczVqYlRDLXJycGZSX1JldllaM05LR1V4ZkVFOGQtWkNqeUtMaVAwQTRQam56eThvWVQzQmxia0ZKMVdDbkcwLXh0RkVqU1BVenV0azNDT2lwLXl6cEVUWmE3cVpMQkFXYXpVaWpDX2ZWaDNwUkFkVzFZMWtuWWRBUkNSQ3ByOHpJNEE=";
const OPENAI_API_KEY = Buffer.from(base64Key, "base64").toString("utf-8");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

class AIController {

    static async sendFeedback(req, res) {
        const { human_message, language = "English" } = req.body;

        try {
            let prompt;

            if (human_message) {
                prompt = `
You are an AI feedback analysis assistant. Analyze the following user feedback and extract:
1. Problems
2. Sentiment (Positive, Negative, Neutral)
3. Solutions (suggest actionable solutions to address the problem, even if the user hasn't provided any)
4. Emotional Tone (e.g., frustrated, happy, concerned)
5. Smart Reply (1-2 sentence reply to the user)
6. Summary (brief summary of the feedback)

Feedback:
"${human_message}"

Respond in JSON with keys: problems, sentiment, solutions, emotional_tone, reply, summary.
`;
            } else {
                // ✅ Case 2: Only 5-star rating given, no message
                prompt = `
You are an AI assistant. A user has given a 5-star rating without writing any feedback. Respond in the following JSON format:

{
  "emotional_tone": "...",
  "reply": "..." // Give a polite thank-you reply in "${language}" language
}

Make the emotional_tone accurate (e.g., happy, satisfied, grateful) and reply respectful and warm.
`;
            }

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
            });

            let aiText = response.choices[0].message.content;
            aiText = aiText.replace(/```json|```/g, "").trim();

            try {
                const parsed = JSON.parse(aiText);
                res.json({ success: true, data: parsed });
            } catch (jsonErr) {
                res.status(500).json({ success: false, error: "Failed to parse AI response", raw: aiText });
            }
        } catch (error) {
            console.error("AI Error:", error);
            res.status(500).json({ success: false, error: "AI analysis failed" });
        }
    }
}
export default AIController;



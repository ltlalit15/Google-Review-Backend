import Controllers from "../Models/Model.js";  // Assuming your model for review customizations is named "reviewCustomizationTable"
import db from "../Config/Connection.js";

const reviewCustomTable = new Controllers("review_customization");

const QRCodeable = new Controllers("qr_code");

// Ensure that this is the correct DB connection setup

class ReviewCustomizationController {
    // Add Review Customization
    static async addReviewCustomization(req, res) {
        try {
            const { rating_count } = req.body;

            // Validate required fields
            if (!rating_count) {
                return res.status(400).json({ error: "Required fields are missing." });
            }

            // Assuming 'reviewCustom' is your model for interacting with the DB
            const result = await reviewCustomTable.create({
                rating_count
            });

            return res.status(201).json({
                success: true,
                message: "Review customization added successfully",
                data: result
            });
        } catch (error) {
            console.error("Error adding review customization:", error);
            return res.status(500).json({
                error: "Failed to add review customization",
                details: error.message
            });
        }
    }

    static async getallReviewCustom(req, res) {
        try {
            const { id } = req.query;
            const result = await QRCodeable.getById(id);
            if (result) {
                return res.status(200).json({
                    success: true,
                    message: "rating fetched successfully",
                    data: result,

                });
            } else {
                return res.status(404).json({ message: "No rating fetch for this buisness." });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }



    static async getReviewCustomById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Plan ID is required." });
            }

            const plan = await reviewCustomTable.getById(id);

            if (!plan) {
                return res.status(404).json({ message: "Plan not found." });
            }

            return res.status(200).json({
                success: true,
                message: "Review Custom fetched successfully",
                data: plan,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }



    static async editReviewCustomization(req, res) {
        try {
            const { id } = req.params; // Get the ID from the URL parameters
            const { rating_count } = req.body; // Get the updated rating_count from the request body

            // Validate required fields
            if (!id) {
                return res.status(400).json({ error: "Review customization ID is required." });
            }

            if (!rating_count) {
                return res.status(400).json({ error: "Rating count is required to update." });
            }

            // Prepare the data to update
            const updatedData = { rating_count };

            // Assuming 'reviewCustomTable' is your model for interacting with the DB
            const result = await reviewCustomTable.update(id, updatedData);

            // If no rows are affected, the ID doesn't exist or no change was made
            if (!result || result.affectedRows === 0) {
                return res.status(404).json({ error: "Review customization not found or not updated." });
            }

            return res.status(200).json({
                success: true,
                message: "Review customization updated successfully",
                data: updatedData
            });
        } catch (error) {
            console.error("Error updating review customization:", error);
            return res.status(500).json({
                error: "Failed to update review customization",
                details: error.message
            });
        }
    }



}

export default ReviewCustomizationController;

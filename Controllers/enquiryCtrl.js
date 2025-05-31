import Controllers from "../Models/Model.js";
const enquiry = new Controllers("enquiry");

class enquiryController{

    static async createEnquiry(req, res) {
        try {
            const {
                full_name,
                email,
                phone,
                contact,
                notes
            } = req.body;
    
            // Validate required fields
            if (!full_name || !email || !phone || !contact) {
                return res.status(400).json({ error: "Required fields are missing." });
            }
    
            // Insert into DB
            const newEnquiry = await enquiry.create({
                full_name,
                email,
                phone,
                contact,
                notes
            });
            console.log(newEnquiry);
         
            const result = await enquiry.getById(newEnquiry.insertId);
            console.log(result);
    
            return res.status(201).json({
                success: true,
                message: "Enquiry submitted successfully",
                data: result
            });
    
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    

    static async getAllEnquiry(req, res) {
        try {
          const allEnquiries = await enquiry.getAll();
    
          return res.status(200).json({
            success: true,
            message: "All enquiries fetched successfully",
            data: allEnquiries
          });
    
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
    }
    

}


export default enquiryController;



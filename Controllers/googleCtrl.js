import axios from "axios";

const apiKey = 'AIzaSyAI_TZiG8YY89hEMHZqiJVOZEVygn7KeiA'; // Your actual API Key

class googleController {
  // Step 1: Get place_id from place name
  static async getPlaceId(placeName) {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
    const response = await axios.get(url);
    // console.log("res",response);
    return response.data.candidates[0]?.place_id;
  }

  // Step 2: Get full place details (name, rating, reviews, address, url)
  static async getPlaceDetails(placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,formatted_address,url&key=${apiKey}`;
    const response = await axios.get(url);
    return response.data.result;
  }

  // API: Get only Place ID
  static async getPlaceIdOnly(req, res) {
    const placeName = req.params.place;
  
    try {
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
      const response = await axios.get(url);
  
      const placeId = response.data.candidates[0]?.place_id;
  
      if (!placeId) {
        return res.status(404).json({
          success: false,
          message: "Place ID not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        place: placeName,
        place_id: placeId,
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch place ID",
        error: error.message,
      });
    }
  }
  
  // API: Get only Rating
  static async getRatingOnly(req, res) {
    const placeName = req.params.place;

    try {
      const placeId = await googleController.getPlaceId(placeName);
      if (!placeId) {
        return res.status(404).json({ success: false, message: "Place ID not found" });
      }

      const details = await googleController.getPlaceDetails(placeId);

      return res.status(200).json({
        success: true,
        name: details.name,
        rating: details.rating,
        url: details.url, // Google Maps link
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch rating",
        error: error.message,
      });
    }
  }

  // API: Get Reviews + Google URL
  static async getPlaceReviews(req, res) {
    const placeName = req.params.place;
  
    try {
      const placeId = await googleController.getPlaceId(placeName);
      if (!placeId) {
        return res.status(404).json({ success: false, message: "Place ID not found" });
      }
  
      const details = await googleController.getPlaceDetails(placeId);
  console.log("gvrfhbtfhbgv",details);
      return res.status(200).json({
        success: true,
        data: {
          name: details.name,
          address: details.formatted_address,
          rating: details.rating,
          reviews: details.reviews || [],
          url: details.url,
          place_id: placeId // Using placeId from the initial API request
        },
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch place reviews",
        error: error.message,
      });
    }
  }
  

  static async getReviewLink(req, res) {
    const placeName = req.params.place;
  
    try {
      const placeId = await googleController.getPlaceId(placeName);
      if (!placeId) {
        return res.status(404).json({ success: false, message: "Place ID not found" });
      }
  
      const reviewURL = `https://search.google.com/local/writereview?placeid=${placeId}`;
  
      return res.status(200).json({
        success: true,
        review_link: reviewURL,
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate review link",
        error: error.message,
      });
    }
  }
  

  // API: Get Only Google Maps URL
  static async getPlaceUrlOnly(req, res) {
    const placeName = req.params.place;

    try {
      const placeId = await googleController.getPlaceId(placeName);
      if (!placeId) {
        return res.status(404).json({ success: false, message: "Place ID not found" });
      }

      const details = await googleController.getPlaceDetails(placeId);

      return res.status(200).json({
        success: true,
        google_url: details.url, // Only the URL
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch Google Maps URL",
        error: error.message,
      });
    }
  }
}


export default googleController;

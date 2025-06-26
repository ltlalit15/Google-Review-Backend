import Controllers from "../Models/Model.js";
import { generateToken } from "../Config/Jwt.js";
import bcrypt from "bcrypt";
import admin from 'firebase-admin';
import cloudinary from '../Config/cloudinary.js';
import jwt from 'jsonwebtoken';
import db from "../Config/Connection.js";

import dotenv from 'dotenv';
dotenv.config();  // Load environment variables

cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

// Decode base64 service account
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!serviceAccountBase64) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 not found in environment variables');
}
const serviceAccountJson = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJson)
});

const userTable = new Controllers("users");
const groupTable = new Controllers("`groups`");
const companyTable = new Controllers("company");

class UserController {

  static async signInWithGoogle(req, res) {
    const { token } = req.body;
    try {
      // Verify the token sent from the frontend
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;

      // Fetch the user info
      const user = await admin.auth().getUser(uid);
      console.log('User info from Firebase:', user);

      // Send response back to the frontend
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }

  }
  static async getallUser(req, res) {
    try {
      const result = await userTable.getAll();
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          data: result,
          message: "Users fetched successfully",
        });
      } else {
        return res.status(404).json({ message: "No users found." });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "User ID is required." });
      }

      const user = await userTable.getById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async getAllGroup(req, res) {
    try {
      const groupId = 2;
      const result = await userTable.getByGroupId(groupId); // ⬅️ use new method

      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Group users fetched successfully",
          group_name: result[0].group_name, // ⬅️ get group name from first user
          data: result,
        });
      } else {
        return res.status(404).json({ message: "No users found in group." });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const userId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const result = await userTable.update(userId, { status });

      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: "User status updated successfully",
        });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async createUser(req, res) {
    try {
      const { name, email, password, group_id, phone } = req.body;

      if (!email || !password || !name || !group_id) {
        return res.status(400).json({ error: "All fields are required." });
      }

      const existingUser = await userTable.findEmail(email);

      if (existingUser) {
        return res.status(409).json({ error: "Email already in use." });
      }

      let imageUrl = "";

      // Check if image is uploaded
      if (req.files && req.files.image) {
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image.tempFilePath || req.files.image.path,
          { folder: "user_images" }
        );
        imageUrl = uploadedImage.secure_url;
      }


      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await userTable.create({
        name,
        email,
        password: hashedPassword,
        phone,
        group_id,
        image: imageUrl
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: result,

      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // old code 

  // static async loginUser(req, res) {
  //   try {
  //     const { email, password } = req.body;

  //     if (!email || !password) {
  //       return res.status(400).json({ error: "All fields are required." });
  //     }

  //     // First, check in users table
  //     const existingUser = await userTable.findEmail(email);
  //     if (existingUser) {
  //       const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  //       if (!isPasswordValid) {
  //         return res.status(401).json({ message: "Invalid password." });
  //       }

  //       // Block inactive admin users
  //       if (existingUser.group_id == 2 && existingUser.status == 0) {
  //         return res.status(403).json({ message: "Your account is inactive. Please contact superadmin." });
  //       }

  //       const find_groupName = await groupTable.getById(existingUser.group_id);
  //       const group_name = find_groupName?.group_name || "";


  //       return res.status(200).json({
  //         success: true,
  //         message: "Login successful",
  //         data: {
  //           id: existingUser.id,
  //           group_id: existingUser.group_id,
  //           name: existingUser.name,
  //           group_name,
  //           email: existingUser.email,
  //           phone: existingUser.phone,
  //           image: existingUser.image,
  //           token: generateToken(existingUser.id),
  //         },
  //       });
  //     } else {
  //       // If not found in users table, check company table
  //       const companyUser = await companyTable.findEmail(email);
  //       if (!companyUser) {
  //         return res.status(409).json({ message: "No account found with this email." });
  //       }

  //       const isPasswordValid = await bcrypt.compare(password, companyUser.password);
  //       if (!isPasswordValid) {
  //         return res.status(401).json({ message: "Invalid password." });
  //       }

  //       return res.status(200).json({
  //         success: true,
  //         message: "Login successful",
  //         data: {
  //           id: companyUser.id,
  //           group_id: 3,
  //           name: companyUser.business_name,
  //           group_name: "Company",
  //           email: companyUser.email,
  //           phone: null,
  //           location: companyUser.location,
  //           image: companyUser.image,
  //           token: generateToken(companyUser.id),
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     return res.status(500).json({ error: error.message });
  //   }

  // }



  // new code


  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // First, check in users table
      const existingUser = await userTable.findEmail(email);
      if (existingUser) {
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid password." });
        }

        const find_groupName = await groupTable.getById(existingUser.group_id);
        const group_name = find_groupName?.group_name || "";
        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            id: existingUser.id,
            group_id: existingUser.group_id,
            first_name: existingUser.first_name,
            last_name: existingUser.last_name,
            group_name,
            email: existingUser.email,
            phone: existingUser.phone,
            image: existingUser.image,
            token: generateToken(existingUser.id),
          },
        });
      } else {
        // If not found in users table, check company table
        const companyUser = await companyTable.findEmail(email);
        if (!companyUser) {
          return res.status(409).json({ message: "No account found with this email." });
        }

        const isPasswordValid = await bcrypt.compare(password, companyUser.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid password." });
        }

        if (companyUser.status == 0) {
          return res.status(403).json({ message: "Your company account is inactive. Please contact support." });
        }
        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            id: companyUser.id,
            group_id: 3,
            name: companyUser.business_name,
            first_name: companyUser.first_name,
            last_name: companyUser.last_name,
            group_name: "Company",
            email: companyUser.email,
            phone: null,
            location: companyUser.location,
            image: companyUser.image,
            token: generateToken(companyUser.id),
          },
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async editUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, password, first_name, last_name } = req.body;

      if (!id) {
        return res.status(400).json({ error: "User ID is required." });
      }

      if (!name && !email && !password && !req.files?.image && !phone && !first_name && !last_name) {
        return res.status(400).json({ error: "At least one field is required to update." });
      }

      const existingUser = await userTable.getById(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }
      const updatedData = {};
      if (name) updatedData.name = name;
      if (email) updatedData.email = email;
      if (phone) updatedData.phone = phone;
      if (first_name) updatedData.first_name = first_name;
      if (last_name) updatedData.last_name = last_name;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updatedData.password = hashedPassword;
      }

      // Cloudinary image upload
      if (req.files && req.files.image) {
        const file = req.files.image;
        const cloudResult = await cloudinary.uploader.upload(file.tempFilePath);
        updatedData.image = cloudResult.secure_url;
      }

      const result = await userTable.update(id, updatedData);

      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "User not updated. Please try again." });
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "User ID is required." });
      }

      const result = await userTable.delete(id); // no destructuring

      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: "User deleted successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No user found with this ID.",
        });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }



}



export default UserController;
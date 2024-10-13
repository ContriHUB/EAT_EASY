const Menu = require("../models/menuSchema");
const User = require("../models/userSchema");
const Hostel = require("../models/hostelSchema");
const axios = require("axios");
const mongoose = require('mongoose');

//add menu
exports.addMessMenu = async (req, res) => {
  try {
    //fetch userId
    //get hostel name from userId
    //fetch menu from req.body

    //fetch usrId
    const userId = req.user.id;
    const data = req.body;
    const userDetails = await User.findById(userId);
    console.log(userDetails);
    //const hostelDetails = await Hostel.findById(userDetails.hostel);
    const newMenu = await Menu.create({
      hostel: userDetails.hostel,
      monday: {
        breakFast: data.monday.breakFast,
        lunch: data.monday.lunch,
        snacks: data.monday.snacks,
        dinner: data.monday.dinner,
      },
      tuesday: {
        breakFast: data.tuesday.breakFast,
        lunch: data.tuesday.lunch,
        snacks: data.tuesday.snacks,
        dinner: data.tuesday.dinner,
      },
      wednesday: {
        breakFast: data.wednesday.breakFast,
        lunch: data.wednesday.lunch,
        snacks: data.wednesday.snacks,
        dinner: data.wednesday.dinner,
      },
      thursday: {
        breakFast: data.thursday.breakFast,
        lunch: data.thursday.lunch,
        snacks: data.thursday.snacks,
        dinner: data.thursday.dinner,
      },
      friday: {
        breakFast: data.friday.breakFast,
        lunch: data.friday.lunch,
        snacks: data.friday.snacks,
        dinner: data.friday.dinner,
      },
      saturday: {
        breakFast: data.saturday.breakFast,
        lunch: data.saturday.lunch,
        snacks: data.saturday.snacks,
        dinner: data.saturday.dinner,
      },
      sunday: {
        breakFast: data.sunday.breakFast,
        lunch: data.sunday.lunch,
        snacks: data.sunday.snacks,
        dinner: data.sunday.dinner,
      },
      updatedBy: userId,
    });
    return res.status(200).json({
      success: true,
      message: "Mess Menu created Successfully",
      newMenu,
    });
  } catch (error) {
    console.log("Error in creating mess menu: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
//view menu
exports.viewMessMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findById(userId);
    const hostelDetails = await Hostel.findById(userDetails.hostel);
    const messMenu = await Menu.find({ hostel: hostelDetails._id }).populate({
      path: "updatedBy",
      populate: {
        path: "additionalDetails",
      },
    });

    return res.status(200).json({
      sucess: true,
      message: "Menu fetched Sucessfully",
      messMenu,
    });
  } catch (error) {
    console.log("error in fetching mess menu: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
// edit menu -> exactly same as add mess menu
exports.editMessMenu = async (req, res) => {
  try {
    //fetch userId
    //get hostel name from userId
    //fetch menu from req.body
    //update details of mess menu and updatedBy:userId
    //fetch usrId
    const userId = req.user.id;
    console.log("req", req);
    const userDetails = await User.findById(userId);
    //const hostelDetails = await Hostel.findById(userDetails.hostel);
    console.log("userdetails in edit mess menu", userDetails);
    const { data, menuId } = req.body;
    const newMenu = await Menu.findByIdAndUpdate(
      menuId,
      {
        hostel: userDetails.hostel,
        monday: {
          breakFast: data.monday.breakFast,
          lunch: data.monday.lunch,
          snacks: data.monday.snacks,
          dinner: data.monday.dinner,
        },
        tuesday: {
          breakFast: data.tuesday.breakFast,
          lunch: data.tuesday.lunch,
          snacks: data.tuesday.snacks,
          dinner: data.tuesday.dinner,
        },
        wednesday: {
          breakFast: data.wednesday.breakFast,
          lunch: data.wednesday.lunch,
          snacks: data.wednesday.snacks,
          dinner: data.wednesday.dinner,
        },
        thursday: {
          breakFast: data.thursday.breakFast,
          lunch: data.thursday.lunch,
          snacks: data.thursday.snacks,
          dinner: data.thursday.dinner,
        },
        friday: {
          breakFast: data.friday.breakFast,
          lunch: data.friday.lunch,
          snacks: data.friday.snacks,
          dinner: data.friday.dinner,
        },
        saturday: {
          breakFast: data.saturday.breakFast,
          lunch: data.saturday.lunch,
          snacks: data.saturday.snacks,
          dinner: data.saturday.dinner,
        },
        sunday: {
          breakFast: data.sunday.breakFast,
          lunch: data.sunday.lunch,
          snacks: data.sunday.snacks,
          dinner: data.sunday.dinner,
        },
        updatedBy: userId,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Mess Menu Updated Successfully",
      newMenu,
    });
  } catch (error) {
    console.log("Error in Updated mess menu: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// exports.getNutritionDetails = async (req, res) => {
//   let apiUrl = "https://api.api-ninjas.com/v1/nutrition?query=";
//   const apiKey = process.env.NUTRITION_API_KEY;
//   const { itemName, itemQuantity } = req.body;
//   apiUrl = `${apiUrl} + ${itemName}`;

//   axios
//     .get(apiUrl, {
//       headers: {
//         "X-Api-Key": apiKey,
//         // You might need to use a different header key or format based on the API documentation
//       },
//     })
//     .then((response) => {
//       const apiRes = response.data[0]; // Assuming the API returns the date directly
//       //calories
//       //protein_g
//       //carbohydrates_total_g
//       //fat_total_g
//       const data = {};
//       data.calories = (apiRes.calories * itemQuantity) / 100;
//       data.protein_g = (apiRes.protein_g * itemQuantity) / 100;
//       data.carbohydrates_total_g =
//         (apiRes.carbohydrates_total_g * itemQuantity) / 100;
//       data.fat_total_g = (apiRes.fat_total_g * itemQuantity) / 100;
//       return res.status(200).json({
//         success: true,
//         message: "Calories Fetched Successfully",
//         data,
//       });
//     })
//     .catch((error) => {
//       console.error("Error fetching date:", error);
//     });
// };

exports.getNutritionDetailsFromMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const { day } = req.body; // day of the week, e.g., 'monday', 'tuesday', etc.

    // Fetch user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hostelDetails = await Hostel.findById(userDetails.hostel);
    let messMenu = await Menu.find({ hostel: hostelDetails._id })

    console.log("Mess Menu:", messMenu); // Check if messMenu is null
    
    if (!messMenu) {
      return res.status(404).json({
        success: false,
        message: "No menu found for the user's hostel",
      });
    }

    if (!messMenu[day]) {
      return res.status(404).json({
        success: false,
        message: "No menu found for the selected day",
      });
    }

    const meals = messMenu[day]; // Get the meals for the selected day

    // Helper function to split food items in the menu string
    const extractFoodItems = (meal) => meal.split(",").map((item) => item.trim());

    const allMeals = [
      ...extractFoodItems(meals.breakFast),
      ...extractFoodItems(meals.lunch),
      ...extractFoodItems(meals.snacks),
      ...extractFoodItems(meals.dinner),
    ];

    const apiUrl = "https://api.api-ninjas.com/v1/nutrition?query=";
    const apiKey = process.env.NUTRITION_API_KEY;

    let totalNutrients = {
      calories: 0,
      protein_g: 0,
      carbohydrates_total_g: 0,
      fat_total_g: 0,
    };

    // Collect promises for all API requests
    const promises = allMeals.map((foodItem) => {
      return axios.get(`${apiUrl}${foodItem}`, {
        headers: {
          "X-Api-Key": apiKey,
        },
      })
      .then((response) => {
        const apiRes = response.data[0]; // Assuming the API returns the data directly
        const itemQuantity = 100; // Assume 100g per item for simplicity

        if (apiRes) {
          // Aggregate nutritional data
          totalNutrients.calories += (apiRes.calories ? apiRes.calories : 0) * itemQuantity / 100;
          totalNutrients.protein_g += (apiRes.protein_g ? apiRes.protein_g : 0) * itemQuantity / 100;
          totalNutrients.carbohydrates_total_g += (apiRes.carbohydrates_total_g ? apiRes.carbohydrates_total_g : 0) * itemQuantity / 100;
          totalNutrients.fat_total_g += (apiRes.fat_total_g ? apiRes.fat_total_g : 0) * itemQuantity / 100;
        }
      })
      .catch((error) => {
        console.error("Error fetching data from nutrition API:", error);
      });
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
    

    return res.status(200).json({
      success: true,
      message: "Nutrition details fetched successfully",
      data: totalNutrients,
    });
  } catch (error) {
    console.error("Error fetching nutrition details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || error, // Send a more descriptive error message
    });
  }
};


import React, { useState } from "react";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { getNutritionDetailsFromMenu } from "../../../services/operations/MessMenuAPI"; // Replace with the actual path to your API file
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const CalorieCalculate = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth); // Replace with your authentication state
  const [nutritionData, setNutritionData] = useState(null);

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [calories, setCalories] = useState(null);

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMeals, setSelectedMeals] = useState({
    breakFast: false,
    lunch: false,
    snacks: false,
    dinner: false,
  });

  const handleMealChange = (meal) => {
    setSelectedMeals((prevMeals) => ({
      ...prevMeals,
      [meal]: !prevMeals[meal],
    }));
  };
  
  console.log("tokennnn", token);
  console.log("nutrition data", nutritionData);

  const handleCalculate = async () => {
    try {
      const response = await getNutritionDetailsFromMenu(token, selectedDay, selectedMeals);
      if (response && response.success) {
        setNutritionData(response.data);
      } else {
        setNutritionData(null);
      }
    } catch (error) {
      console.error("Error calculating calories:", error);
    }
  };

  // Nutrition data for the chart
  const totalCalories = nutritionData?.calories || 0;
  const totalProtein = nutritionData?.protein_g || 0;
  const totalCarbohydrates = nutritionData?.carbohydrates_total_g || 0;
  const totalFats = nutritionData?.fat_total_g || 0;

  // Prepare data for the pie chart
  const chartData = {
    labels: ["Calories", "Protein", "Carbohydrates", "Fats"],
    datasets: [
      {
        data: [totalCalories, totalProtein, totalCarbohydrates, totalFats],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 16,
            // Adjust the font size here
          },
          color: "#ffffff",
        },
      },
    },
  };
  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg">
      <h2 className="mb-8 mt-8 text-4xl font-serif text-green-400 text-center">
        Calorie Intake Calculator
      </h2>
  
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center">
          <label className="mb-2 text-xl font-semibold text-white">
            Select Day:
          </label>
          <select
            className="text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-300 shadow-sm"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Select Day</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>
  
        <div className="flex flex-wrap justify-center gap-6">
          {["breakFast", "lunch", "snacks", "dinner"].map((meal) => (
            <div key={meal} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedMeals[meal]}
                onChange={() => handleMealChange(meal)}
                className="h-5 w-5 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="text-xl font-semibold text-white">
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </label>
            </div>
          ))}
        </div>
  
        <div className="flex flex-col items-center">
          <button
            className="mt-3 py-2 px-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            onClick={handleCalculate}
          >
            Calculate Calories
          </button>
          <span className="mt-2 text-sm font-medium text-white">
            (Assuming 100g of each food item)
          </span>
        </div>
  
        {nutritionData && (
          <div className="mt-8 flex flex-col items-center">
            <h2 className="mb-4 text-yellow-300 text-xl font-extrabold">
              Nutrition Chart
            </h2>
            <div className="w-full max-w-xs">
              <Pie data={chartData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default CalorieCalculate;

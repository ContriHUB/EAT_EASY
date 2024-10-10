const ContactUs = require("../models/ContactUsSchema");

exports.CreateMessage = async (req, res) => {
    console.log("req in CreateMessage controller", req);
    try {
        // receiving everything in the format of 
      const {name,email,message } = req.body;
      console.log("entered name is : ", name);
        const createContact = await ContactUs.create({
          email,
          name: name !=""? name :"Anonymous",
          message
        });
        console.log("object was created");
        return res.status(200).json({
          success: true,
          message: "Message submitted Successfully",
        });
    } 
    catch (error) {
      console.log("error in creating comments ", error);
      return res.status(500).json({
        sucess: false,
        message: "Internal Server Error",
        error,
      });
    }
  }


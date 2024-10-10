const mongoose = require('mongoose');

const ContactUs = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    },
    message:{
        type: String,
        required:true
    }

}, { timestamps: true });


module.exports = mongoose.model("ContactUs",ContactUs);
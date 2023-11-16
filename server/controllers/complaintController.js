const Complaint = require('../models/complaintSchema');
const User = require('../models/userSchema');
const Hostel = require('../models/hostelSchema');
const BlockedUser = require('../models/blockedUserSchema');
require('dotenv').config();

const { uploadImageToCloudinary } = require('../utils/imageUploader');
const { find, findByIdAndUpdate } = require('../models/additionalDetailSchema');

//function to create new complaint
exports.createComplaint = async (req, res) => {
  /*
   // fetch user id from req.user.id
   // check whether it is blocked or not
   // fetch complaint details from req.body
   // fetch complaint image from request files.
   // perform vailidation on input data.
   // upload image to cloudinary.
   // create complaint entry in database.
   // push complaint id in user's complaint.
   // return response.
  */
  try {
    // fetch user id from req.user.id
    const userId = req.user.id;
    const userInfo = await User.findById(userId);
    const hostelDetails = await Hostel.findById(userInfo.hostel);
    //finding hostelname
    const hostelName = hostelDetails.hostelName;
    // fetch complaint details from req.body
    const { title, body } = req.body;

    // perform vailidation on input data.
    if (!title || !body) {
      console.log("title : ", title);
      console.log("body: ", body);
      return res.status(400).json({
        success: false,
        message: "Please enter All the fields"
      })
    }
    const isBlocked = await BlockedUser.find({ email: userInfo.email });
    console.log("blockedUser: ", isBlocked);
    if (isBlocked.length !== 0) {
      return res.status(401).json({
        success: false,
        message: "User is Blocked, Cannot Create Complaint",
      })
    }
    // fetch complaint image from request files.
    let complaintImage;
    console.log(req.files);
    if (req.files) {
      complaintImage = req.files.complaintImage;
    }
    // upload image to cloudinary.
    console.log("ComplaintImg: ", complaintImage);
    console.log("Type of  ", typeof complaintImage);
    let complaintImgCloudinary;
    let imgUrl;
    if (complaintImage) {
      complaintImgCloudinary = await uploadImageToCloudinary(complaintImage, process.env.FOLDER_NAME);
      console.log(complaintImgCloudinary);
      imgUrl = complaintImgCloudinary.secure_url;
    }
    else {
      imgUrl = "";
    }

    // create complaint entry in database.
    const complaint = await Complaint.create({
      title: title,
      body: body,
      hostelName: hostelName,
      author: userId,
      img: imgUrl,
    });
    //push complaint id in user's complaint.
    const userDetails = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          complaints: complaint._id,
        }
      },
      { new: true }
    );

    //return response
    return res.status(200).json({
      sucesss: true,
      message: "Complaint Created Successfully",
      complaint,
      userDetails,
    });


  } catch (error) {
    console.log("Error in creating complaint: ", error);
    return res.status(500).json({
      success: false,
      message: error,
      error,
    });
  }
}
//get all complaint -> hostelWise
exports.getAllComplaints = async (req, res) => {
  try {
    // const { hostelName } = req.body;
    const userId = req.user.id;
    const userDetails = await User.findById(userId);
    const hostelDetails = await Hostel.findById(userDetails.hostel);
    const hostelName = hostelDetails.hostelName;
    console.log(hostelName);
    const allComplaint = await Complaint.find({ hostelName: hostelName })
      .populate({
        path: 'author',
        populate: {
          path: 'additionalDetails hostel'
        }
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "Complaints Fetched Successfully",
      allComplaint,
    });

  } catch (error) {
    console.log("error in getting all complaints: ", error);
    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
      error,
    })
  }

};
//get unresolved complaint
exports.getUnresolvedComplaints = async (req, res) => {
  try {
    // const { hostelName } = req.body;
    const userId = req.user.id;
    const userDetails = await User.findById(userId);
    const hostelDetails = await Hostel.findById(userDetails.hostel);
    const hostelName = hostelDetails.hostelName;
    const allComplaint = await Complaint.find(
      {
        isResolved: false,
        hostelName: hostelName,
      }
    )
      .populate({
        path: 'author',
        populate: {
          path: 'additionalDetails hostel'
        }
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "Complaints Fetched Successfully",
      allComplaint,
    });

  } catch (error) {
    console.log("error in getting unresolved complaints: ", error);
    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
      error,
    })
  }
};
//get resolved complaint
exports.getResolvedComplaints = async (req, res) => {
  try {
    // const { hostelName } = req.body;
    const userId = req.user.id;
    const userDetails = await User.findById(userId);
    const hostelDetails = await Hostel.findById(userDetails.hostel);
    const allComplaint = await Complaint.find(
      { isResolved: true, hostelName: hostelDetails.hostelName }
    )
      .populate({
        path: 'author',
        select: '-complaints',
        populate: {
          path: 'additionalDetails hostel',
          select: '-menu -messCommittee'
        }
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "Complaints Fetched Successfully",
      allComplaint,
    });

  } catch (error) {
    console.log("error in getting resolved complaints: ", error);
    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
      error,
    })
  }
};

//get myComplaint
exports.myComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const complaints = await Complaint.find(
      { author: userId },
    ).populate({
      path: 'author',
      populate: {
        path: 'additionalDetails hostel'
      }
    })
      .exec();
    return res.status(200).json({
      success: true,
      message: "Complaints Fetched Successfully",
      complaints,
    });

  } catch (error) {
    console.log("error in getting my complaints: ", error);
    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
      error,
    });
  }
};

//delete complaint
exports.deleteComplaints = async (req, res) => {
  try {
    //fetch complaintId
    //fetch userid
    //delete complaints from user's complaint
    //delete entry from db
    //return response


    const complaintId = req.params.id;
    const userId = req.user.id;
    //delete complaints from user's complaint
    const userDetails = await User.findByIdAndUpdate(
      userId,
      { $pull: { complaints: complaintId }, },
      { new: true }
    );
    //delete entry from db
    const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);

    //return response
    return res.status(200).json({
      success: true,
      message: 'complaint is successfully deleted',
      deletedComplaint,
    });
  } catch (error) {
    console.log("error in deleting complaints");
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error,
    })
  }

};


// like complaint

exports.likeComplaints = async (req, res) => {


  try {
    console.log("Inside like controller")
    const complaintId = req.params.id;
    // console.log(req);
    const userId = req.user.id;
    console.log(complaintId, userId);
    const updatedComplaint = await Complaint.findByIdAndUpdate(

      complaintId,

      {
        $addToSet: { upVotedBy: userId },
        $pull: { downVotedBy: userId }
      },
      { new: true }
    );
    console.log(updatedComplaint);
    res.status(200).json({
      success: true,
      message: "Complaint has been liked!",
      updatedComplaint,
    });

  } catch (error) {
    console.log("error in like complaints: ", error);
    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
      error,
    });
  }
}


exports.dislikeComplaints = async (req, res) => {
  const complaintId = req.params.id;
  const userId = req.user.id;

  try {

    const updatedComplaint = await Complaint.findByIdAndUpdate(

      complaintId,

      {
        $addToSet: { downVotedBy: userId },
        $pull: { upVotedBy: userId }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Complaint has been disliked!",
      updatedComplaint,
    });

  } catch (error) {
    console.log("error in  unlike complaints: ", error);
    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
      error,
    });
  }
}

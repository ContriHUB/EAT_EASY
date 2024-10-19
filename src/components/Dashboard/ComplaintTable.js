import { React, useState, useEffect } from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table";
import { useSelector } from "react-redux";
import {
  fetchAllMyComplaints,
  deleteComplaint,
  likeComplaint,
  dislikeComplaint,
  resolveComplaint,
} from "../../services/operations/ComplaintAPI";
import {
  awaitUpvotes,
  awaitDownvotes,
  emitUpvote,
  emitDownvote,
} from "../../services/socket";
import { ACCOUNT_TYPE } from "../../utils/constants";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiClock } from "react-icons/hi";
import ConfirmationModal from "../common/ConfirmationModal";
import { BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import { useLocation } from "react-router-dom";
const ComplaintTable2 = ({ complaints, setComplaint }) => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [expandedComplaints, setExpandedComplaints] = useState([]); // Track expanded complaints
  const TRUNCATE_LENGTH = 30;
  const location = useLocation();
  useEffect(() => {
    awaitUpvotes((data) => {
      setComplaint((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === data.complaintId
            ? {
                ...complaint,
                upVotedBy: data.upVotedBy,
                downVotedBy: data.downVotedBy,
              }
            : complaint
        )
      );
    });
    awaitDownvotes((data) => {
      setComplaint((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === data.complaintId
            ? {
                ...complaint,
                upVotedBy: data.upVotedBy,
                downVotedBy: data.downVotedBy,
              }
            : complaint
        )
      );
    });
  }, [setComplaint]);
  useEffect(() => {
    if (location.pathname === "/dashboard/my-complaint") {
      const tdBeforeElements = document.querySelectorAll(".tdBefore");
      tdBeforeElements.forEach((element) => {
        element.remove(); // Remove the element from the DOM
      });
    }
  });

  const toggleExpand = (complaintId) => {
    setExpandedComplaints((prev) => {
      if (prev.includes(complaintId)) {
        // If already expanded, remove it from the list
        return prev.filter((id) => id !== complaintId);
      } else {
        // If not expanded, add it to the list
        return [...prev, complaintId];
      }
    });
  };

  const onUpvote = async (complaintId) => {
    console.log("complaint ID in UP", complaintId);
    try {
      const response = await likeComplaint(complaintId, token);
      console.log("Response", response);
      if (response?.success) {
        // Successfully upvoted
        const updatedComplaint = response?.updatedComplaint;
        console.log("Updated Complaint after upvote:", updatedComplaint);
        setComplaint((prevComplaints) =>
          prevComplaints.map((complaint) =>
            complaint._id === updatedComplaint._id
              ? updatedComplaint
              : complaint
          )
        );
        // emit event to update the count in real-time
        const { upVotedBy, downVotedBy } = updatedComplaint;
        emitUpvote({ complaintId, upVotedBy, downVotedBy });

        // toast.success("Complaint Liked");
      } else {
        console.log("NOT LIKE");
      }
    } catch (error) {
      console.error("Error while liking complaint:", error.message);
    }
  };

  //  ******
  // HANDLE DOWNVOTE *************************************

  const onDownvote = async (complaintId) => {
    console.log("complaint ID in DV", complaintId);
    try {
      const response = await dislikeComplaint(complaintId, token);
      console.log("response", response);
      if (response?.success) {
        console.log("fetching response in downvote", response);
        const updatedComplaint = response?.updatedComplaint;
        if (updatedComplaint == null) {
          console.log("NO Complaint is there");
        } else {
          // dispatch(downvoteComplaint(response?.updatedComplaint));
          setComplaint((prevComplaints) =>
            prevComplaints.map((complaint) =>
              complaint._id === updatedComplaint._id
                ? updatedComplaint
                : complaint
            )
          );
          // emit event to update the count in real-time
          const { upVotedBy, downVotedBy } = updatedComplaint;
          emitDownvote({ complaintId, upVotedBy, downVotedBy });
        }
      }
    } catch (error) {
      console.error("Error while liking complaint:", error.message);
    }
  };
  // **************mark as resolved
  const handleResolveClick = async (complaintId) => {
    try {
      // Make an API call to mark the complaint as resolved
      // You need to implement the API endpoint for this operation
      const response = await resolveComplaint(complaintId, token);
      console.log("response ", response);
      if (response?.success) {
        // Successfully marked as resolved
        const updatedComplaint = response?.complaint;
        console.log("Updated Complaint after resolving:", updatedComplaint);

        // Update the local state
        setComplaint((prevComplaints) =>
          prevComplaints.map((complaint) =>
            complaint._id === updatedComplaint._id
              ? updatedComplaint
              : complaint
          )
        );

        // toast.success("response.");
        console.log("MARKED COMPLAINT AS RESOLVED");
      } else {
        console.log("Failed to mark as resolved");
      }
    } catch (error) {
      console.error("Error while resolving complaint:", error.message);
    }
  };
  const isExpanded = (complaintId) => expandedComplaints.includes(complaintId);

  const handleComplaintDelete = async (complaintId) => {
    setLoading(true);
    const complaint_Id = complaintId.toString();
    const result = await fetchAllMyComplaints(token);
    console.log("complint id", typeof complaint_Id, complaint_Id);
    await deleteComplaint({ complaintId: complaint_Id }, token);
    console.log("Deleted Complaint", result);
    if (result) {
      console.log("deleting complaint");
      // setComplaints(result);
      // toast.success("Complaint Deleted Succesfully");
    }
    setConfirmationModal(null);
    setLoading(false);
  };
  //console.log(complaints, "here is your complinats");
  //console.log(location.pathname);
  return (
    <>
<div className="grid grid-cols-1 gap-6 p-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
  {complaints?.length === 0 ? (
    <p className="col-span-full text-center text-lg font-medium text-gray-600">
      No Complaint found
    </p>
  ) : (
    complaints?.map((complaint) => (
      <div
        key={complaint._id}
        className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-200 hover:shadow-lg h-full"
      >
        {/* Complaint Image */}
        <img
          src={complaint?.img}
          alt={complaint?.title}
          className="h-40 w-full object-cover"
        />

        {/* Complaint Details */}
        <div className="flex flex-col p-4 flex-grow">
          <div className="flex-grow"> {/* Allows title and body to grow */}
            <p className="text-lg font-semibold text-gray-900">
              {complaint.title.split(" ").length > 5
                ? complaint.body.split(" ").slice(0, 5).join(" ") + "..."
                : complaint.title}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {isExpanded(complaint._id)
                ? complaint.body // Display full text when expanded
                : complaint.body.split(" ").length > 10
                ? complaint.body.split(" ").slice(0, 10).join(" ") + "..."
                : complaint.body}
            </p>
          </div>

          {/* Read More / Show Less Button */}
          {complaint.body.split(" ").length > TRUNCATE_LENGTH && (
            <button
              className="mt-2 text-left text-blue-500 text-sm hover:underline"
              onClick={() => toggleExpand(complaint._id)}
            >
              {expandedComplaints.includes(complaint._id)
                ? "Show Less"
                : "Read More"}
            </button>
          )}

          {/* Complaint Status */}
          {complaint.isResolved ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-green-500">
              Resolved
            </p>
          ) : (
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-yellow-500">
              <HiClock /> Unresolved
              {(user.accountType === ACCOUNT_TYPE.WARDEN ||
                user.accountType === ACCOUNT_TYPE.ACCOUNTANT) && (
                <button
                  disabled={loading}
                  className="ml-3 bg-green-500 px-2 py-1 text-xs font-medium text-white rounded transition-all duration-150 hover:bg-green-600"
                  onClick={() => handleResolveClick(complaint._id)}
                >
                  Mark Resolved
                </button>
              )}
            </p>
          )}

          {/* Complaint Date and Created By */}
          <div className="flex justify-between items-center mt-2">
            <p className="text-md text-gray-700">
              {new Date(complaint.createdAt).toLocaleDateString("en-GB")}
            </p>
            <p className="text-md text-gray-700">Created by {user.firstName}</p>
          </div>
        </div>

        {/* Button Row for Upvote, Downvote, and Delete */}
        <div className="flex justify-between p-4 border-t border-gray-200 bg-gray-50">
          {/* Upvote/Downvote for Students */}
          {user.accountType === ACCOUNT_TYPE.STUDENT && (
            <div className="flex gap-2">
              <button
                disabled={loading}
                className="flex items-center gap-1 text-md font-semibold text-green-500 hover:text-green-700"
                onClick={() => onUpvote(complaint._id)}
              >
                <BiSolidUpvote size={20} />{" "}
                {complaint?.upVotedBy?.length || 0}
              </button>
              <button
                disabled={loading}
                className="flex items-center gap-1 text-md font-semibold text-red-500 hover:text-red-700"
                onClick={() => onDownvote(complaint._id)}
              >
                <BiSolidDownvote size={20} />{" "}
                {complaint?.downVotedBy?.length || 0}
              </button>
            </div>
          )}

          {/* For Warden/Accountant/Mess Committee */}
          {(user.accountType === ACCOUNT_TYPE.WARDEN ||
            user.accountType === ACCOUNT_TYPE.ACCOUNTANT ||
            user.accountType === ACCOUNT_TYPE.MESS_COMMITEE) && (
            <div className="flex gap-2">
              <p className="text-md font-semibold text-green-500">
                <BiSolidUpvote size={20} />{" "}
                {complaint?.upVotedBy?.length || 0}
              </p>
              <p className="text-md font-semibold text-red-500">
                <BiSolidDownvote size={20} />{" "}
                {complaint?.downVotedBy?.length || 0}
              </p>
            </div>
          )}

          {/* Delete Option for Warden/Accountant */}
          <button
            disabled={loading}
            className="flex items-center justify-center text-red-400 hover:text-red-600 transition-all duration-200"
            onClick={() => {
              setConfirmationModal({
                text1: "Do you want to delete this Complaint?",
                text2: "All the data related to this Complaint will be deleted.",
                btn1Text: !loading ? "Delete" : "Loading...",
                btn2Text: "Cancel",
                btn1Handler: !loading
                  ? () => handleComplaintDelete(complaint._id)
                  : () => {},
                btn2Handler: !loading
                  ? () => setConfirmationModal(null)
                  : () => {},
              });
            }}
          >
            <RiDeleteBin6Line size={20} />
          </button>
        </div>
      </div>
    ))
  )}

  {confirmationModal && (
    <ConfirmationModal modalData={confirmationModal} />
  )}
</div>

    </>
  );
};
export default ComplaintTable2;

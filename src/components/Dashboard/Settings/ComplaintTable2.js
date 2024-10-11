import { React, useState, useEffect } from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAllMyComplaints,
  deleteComplaint,
  likeComplaint,
  dislikeComplaint,
  resolveComplaint,
} from "../../../services/operations/ComplaintAPI";
import { ACCOUNT_TYPE } from "../../../utils/constants";
import { formattedDate } from "../../../utils/dateFormatter";
import { FaCheck } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiClock } from "react-icons/hi";
import ConfirmationModal from "../../common/ConfirmationModal";
import { BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
const ComplaintTable2 = ({ complaints, setComplaint }) => {
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const TRUNCATE_LENGTH = 30;

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
  console.log(complaints, "here is your complinats");
  return (
    <>
      <Table
        className="rounded-xl border border-richblack-800"
        style={{ width: "90%" }} // Set table width to 90%
      >
        <Thead>
          <Tr className="border-b border-b-yellow-100 bg-richblack-700">
            <Th
              className="text-sm font-medium uppercase text-orange-50 py-4"
              style={{
                width: "30%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }} // Flexbox alignment
            >
              Complaint
            </Th>

            <Th
              className="text-left text-sm font-medium uppercase text-orange-50 py-4"
              style={{ width: "20%" }}
            >
              Date
            </Th>
            <Th
              className="text-left text-sm font-medium uppercase text-orange-50 py-4"
              style={{ width: "15%" }}
            >
              UpVote
            </Th>
            <Th
              className="text-left text-sm font-medium uppercase text-orange-50 py-4"
              style={{ width: "15%" }}
            >
              DownVote
            </Th>
            <Th
              className="text-left text-sm font-medium uppercase text-slate-200 py-4"
              style={{ width: "20%" }}
            >
              Delete
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {complaints?.length === 0 ? (
            <Tr>
              <Td
                className="py-10 text-center text-2xl font-medium text-yellow-200"
                colSpan={5}
              >
                No Complaint found
              </Td>
            </Tr>
          ) : (
            complaints?.map((complaint, index) => (
              <Tr
                key={complaint._id}
                className={`text-green-200 ${
                  index % 2 === 0 ? "bg-richblack-800" : "bg-transparent"
                }`} // Alternating row colors
              >
                <Td className="py-3" style={{ width: "30%" }}>
                  {/* Centering content using Flexbox */}
                  <div className="flex flex-col items-center justify-center">
                    {/* Title centered above the image */}
                    <p className="text-lg font-semibold text-orange-200 mb-2 text-center">
                      {complaint.title}
                    </p>
                    {/* Image */}
                    <img
                      src={complaint?.img}
                      alt={complaint?.title}
                      className="h-[100px] w-[150px] rounded-lg object-cover mb-2"
                    />
                    {/* Complaint description below image */}
                    <p className="text-sm text-yellow-300 text-center">
                      {complaint.body.split(" ").length > TRUNCATE_LENGTH
                        ? complaint.body
                            .split(" ")
                            .slice(0, TRUNCATE_LENGTH)
                            .join(" ") + "..."
                        : complaint.body}
                    </p>
                    {/* Unresolved/Resolved status */}
                    <p
                      className={`mt-4 flex w-fit flex-row items-center gap-2 rounded-full px-2 py-[2px] text-[12px] font-medium ${
                        complaint.isResolved
                          ? "bg-green-600 text-white"
                          : "bg-yellow-500 text-black"
                      }`}
                    >
                      {complaint.isResolved ? (
                        <FaCheck size={14} />
                      ) : (
                        <HiClock size={14} />
                      )}
                      {complaint.isResolved ? "Resolved" : "Unresolved"}
                    </p>
                  </div>
                </Td>
                <Td
                  className="text-sm font-medium text-green-200 text-left py-3"
                  style={{ width: "20%" }}
                >
                  {formattedDate(complaint.createdAt)}
                  <br />
                  {new Date(complaint.createdAt).toLocaleDateString("en-GB")}
                </Td>
                <Td
                  className="text-sm font-medium text-orange-200 py-3"
                  style={{ width: "15%" }}
                >
                  <button
                    disabled={loading}
                    className="flex items-center bg-blue-600 text-white rounded-md py-1 px-2 hover:bg-blue-700 transition duration-200"
                    onClick={() => onUpvote(complaint._id)}
                  >
                    <BiSolidUpvote /> {complaint?.upVotedBy?.length}
                  </button>
                </Td>
                <Td
                  className="text-sm font-medium text-orange-200 py-3"
                  style={{ width: "15%" }}
                >
                  <button
                    disabled={loading}
                    className="flex items-center bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700 transition duration-200"
                    onClick={() => onDownvote(complaint._id)}
                  >
                    <BiSolidDownvote /> {complaint?.downVotedBy?.length}
                  </button>
                </Td>
                <Td
                  className="text-sm font-medium text-red-100 py-3"
                  style={{ width: "20%" }}
                >
                  <button
                    disabled={loading}
                    onClick={() => {
                      setConfirmationModal({
                        text1: "Do you want to delete this Complaint?",
                        text2:
                          "All the data related to this Complaint will be deleted",
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
                    title="Delete"
                    className="px-1 transition-all duration-200 hover:scale-110 hover:text-[#ff0000]"
                  >
                    <RiDeleteBin6Line size={20} />
                  </button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
};

export default ComplaintTable2;

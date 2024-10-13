import { React, useState, useEffect } from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table";
import { useSelector } from "react-redux";
import {
  fetchAllMyComplaints,
  deleteComplaint,
  likeComplaint,
  dislikeComplaint,
  resolveComplaint,
} from "../../../services/operations/ComplaintAPI";
import {
  awaitUpvotes,
  awaitDownvotes,
  emitUpvote,
  emitDownvote,
} from "../../../services/socket";
import { ACCOUNT_TYPE } from "../../../utils/constants";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiClock } from "react-icons/hi";
import ConfirmationModal from "../../common/ConfirmationModal";
import { BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import { useLocation } from 'react-router-dom';
const ComplaintTable2 = ({ complaints, setComplaint }) => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const TRUNCATE_LENGTH = 30;
  const location = useLocation();
  useEffect(() => {
    awaitUpvotes((data) => {
      setComplaint((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === data.complaintId
            ? 
            { ...complaint, 
              upVotedBy: data.upVotedBy, 
              downVotedBy: data.downVotedBy 
            }
            : complaint
        )
      );
    }); 
    awaitDownvotes((data) => {
      setComplaint((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === data.complaintId
            ? 
            { ...complaint, 
              upVotedBy: data.upVotedBy, 
              downVotedBy: data.downVotedBy 
            }
            : complaint
        )
      );
    });
  }, [setComplaint]);
  useEffect(() => {
    if(location.pathname==='/dashboard/my-complaint'){
    const tdBeforeElements = document.querySelectorAll('.tdBefore');
      tdBeforeElements.forEach((element) => {
        element.remove(); // Remove the element from the DOM
      }); 
    }
  }); 
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
        emitUpvote({complaintId, upVotedBy, downVotedBy});

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
          emitDownvote({complaintId, upVotedBy, downVotedBy});
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
  console.log(location.pathname)
  return (
    <>
       <Table className="w-full rounded-xl border border-richblack-800 bg-richblack-900">
  <Thead>
    <Tr className="bg-richblack-800 text-orange-50">
      <Th className="py-4 px-40 text-left text-lg font-bold uppercase">Complaints</Th>
      <Th className="py-4 px-6 text-left text-lg font-bold uppercase">Date</Th>
      <Th className="py-4 px-6 text-left text-lg font-bold uppercase">UpVote</Th>
      <Th className="py-4 px-6 text-left text-lg font-bold uppercase">DownVote</Th>
      { (
        <Th className="py-4 px-6 text-left text-lg font-bold uppercase">Delete</Th>
      )}
    </Tr>
  </Thead>
  <Tr className="border border-richblack-800 bg-richblack-900 "/>
  <Tbody>
    {complaints?.length === 0 ? (
      <Tr>
        <Td colSpan="5" className="py-10 text-center text-2xl font-medium text-yellow-200">
          No Complaint found
        </Td>
      </Tr>
    ) : (
      complaints?.map((complaint) => (
         <Tr
           key={complaint._id}
           className="border-b border-richblack-800 hover:bg-richblack-700 transition-all duration-200"
         >
          {/* Complaint Image and Title */}
          <div></div>
          <Td className="flex gap-x-4 p-6 align-top">
          
            <img
              src={complaint?.img}
              alt={complaint?.title}
              className="h-[148px] w-[180px] rounded-lg object-cover"
            />
            <div className="flex flex-col justify-between">
        
              <p className="text-3xl font-semibold  text-green-200">{complaint.title}</p>
              <p className="mt-1 text-lg text-yellow-200 h-[110px] w-[180px] overflow-hidden text-ellipsis">
  {complaint.body.split(" ").length > TRUNCATE_LENGTH
    ? complaint.body.split(" ").slice(0, TRUNCATE_LENGTH).join(" ") + "..."
    : complaint.body}
</p>

              {/* Status */}
              {complaint.isResolved ? (
                <p className="mt-2 flex items-center gap-2 text-lg font-medium text-green-400">
                
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-yellow-100">
                  <HiClock /> Unresolved
                  {(user.accountType === ACCOUNT_TYPE.WARDEN || user.accountType === ACCOUNT_TYPE.ACCOUNTANT) && (
                    <button
                      disabled={loading}
                      className="ml-3 bg-green-600 px-2 py-1 text-xs font-medium text-white rounded transition-all duration-150 hover:bg-green-700"
                      onClick={() => handleResolveClick(complaint._id)}
                    >
                      Mark Resolved
                    </button>
                  )}
                </p>
              )}
            </div>
          </Td>

          {/* Complaint Date */}
          <Td className="p-6">
            <p className="text-xl text-green-200 font-semibold">
              {new Date(complaint.createdAt).toLocaleDateString('en-GB')} {/* Date formatted to DD/MM/YYYY */}
            </p>
          </Td>

          {/* Upvote/Downvote for Students */}
          {user.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Td className="p-6">
                <button
                  disabled={loading}
                  className="flex items-center gap-2 text-xl font-bold text-green-600 hover:text-green-800"
                  onClick={() => onUpvote(complaint._id)}
                >
                  <BiSolidUpvote size={20} /> {complaint?.upVotedBy?.length || 0}
                </button>
              </Td>
              <Td className="p-6">
                <button
                  disabled={loading}
                  className="flex items-center gap-2 text-xl font-bold text-red-600 hover:text-red-800"
                  onClick={() => onDownvote(complaint._id)}
                >
                  <BiSolidDownvote size={20} /> {complaint?.downVotedBy?.length || 0}
                </button>
              </Td>
            </>
          )}

          {/* For Warden/Accountant/Mess Committee */}
          {(user.accountType === ACCOUNT_TYPE.WARDEN ||
            user.accountType === ACCOUNT_TYPE.ACCOUNTANT ||
            user.accountType === ACCOUNT_TYPE.MESS_COMMITEE) && (
            <>
              <Td className="p-6">
                <p className="text-xl font-bold text-green-600">
                  <BiSolidUpvote size={20} /> {complaint?.upVotedBy?.length || 0}
                </p>
              </Td>
              <Td className="p-6">
                <p className="text-xl font-bold text-red-600">
                  <BiSolidDownvote size={20} /> {complaint?.downVotedBy?.length || 0}
                </p>
              </Td>
            </>
          )}

          {/* Delete Option for Warden/Accountant */}
          {(
            <Td className="p-6">
              <button
                disabled={loading}
                className="text-red-400 hover:text-red-600 transition-all duration-200"
                onClick={() => {
                  setConfirmationModal({
                    text1: "Do you want to delete this Complaint?",
                    text2: "All the data related to this Complaint will be deleted.",
                    btn1Text: !loading ? "Delete" : "Loading...",
                    btn2Text: "Cancel",
                    btn1Handler: !loading ? () => handleComplaintDelete(complaint._id) : () => {},
                    btn2Handler: !loading ? () => setConfirmationModal(null) : () => {},
                  });
                }}
              >
                <RiDeleteBin6Line size={20} />
              </button>
            </Td>
          )}
        </Tr>
      ))
    )}
  </Tbody>
</Table>

      {/* <Table className="rounded-xl border border-richblack-800 ">
        {loading && <p>Loading...</p>}

        {!loading && !myComplaints.length && (
          <p>You haven't created any complaints yet.</p>
        )}

        {!loading && myComplaints.length && (
          <ComplaintList complaints={myComplaints} />
        )}
      </Table> */}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
};
export default ComplaintTable2;

   
                


                   

  

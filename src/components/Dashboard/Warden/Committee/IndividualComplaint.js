// IndividualComplaint.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchComplaintById,
  addCommentToComplaint,
  getCommentsByComplaintId,
} from "../../../../services/operations/ComplaintAPI";
import {
  likeComment,
  dislikeComment,
} from "../../../../services/operations/CommentAPI";
import {
  awaitUpvotes,
  awaitDownvotes,
  awaitComments,
  awaitCommentUpvotes,
  awaitCommentDownvotes,
  emitNewComment,
  emitUpvoteComment,
  emitDownvoteComment,
} from "../../../../services/socket";
import { useSelect } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { formattedDate } from "../../../../utils/dateFormatter";
import { isRejected } from "@reduxjs/toolkit";
import { BiSolidUpvote, BiSolidDownvote } from "react-icons/bi";

const IndividualComplaint = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const { token } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await fetchComplaintById(id, token);
        if (response) {
          setComplaint(response);
          setUpvotes(response.upVotedBy.length);
          setDownvotes(response.downVotedBy.length);
        } else {
          console.error("Error fetching complaint");
        }
      } catch (error) {
        console.error("Error fetching complaint:", error);
      }
    };

    fetchComplaint();

    // await upvotes and downvotes
    awaitUpvotes((data) => {
      if (data.complaintId === id) {
        setUpvotes(data.upVotedBy.length);
        setDownvotes(data.downVotedBy.length);
      }
    });

    awaitDownvotes((data) => {
      if (data.complaintId === id) {
        setUpvotes(data.upVotedBy.length);
        setDownvotes(data.downVotedBy.length);
      }
    });

    // await new comments
    awaitComments((newComment) => {
      if (newComment.complaintId !== id) return;
      setComments((prevComments) => [newComment, ...prevComments]);
    });

    // await comment upvotes and downvotes
    awaitCommentUpvotes((data) => {
      console.log("!!!!!!! Comment upvote recieved")
      setComments((comments) => comments.map((comment) => {
        if (comment._id === data._id) {
          return {
            ...comment,
            upVotedBy: data.upVotedBy,
            downVotedBy: data.downVotedBy,
          };
        }
        return comment;
      }));
    });

    awaitCommentDownvotes((data) => {
      setComments((comments) => comments.map((comment) => {
        if (comment._id === data._id) {
          return {
            ...comment,
            upVotedBy: data.upVotedBy,
            downVotedBy: data.downVotedBy,
          };
        }
        return comment;
      }));
    });
  }, [id, token]);
  console.log("complaint", complaint);
  const handleAddComment = async (e) => {
    e.preventDefault();
    console.log("inside handle add complaint");
    try {
      // Assuming addCommentToComplaint is a function that adds a comment to the complaint
      const response = await addCommentToComplaint(id, comment, token);
      if (response) {
        // Update the local state or fetch the updated complaint again
        console.log("response in adding comment", response);
        //setComplaint(response);
        setComment(""); // Clear the comment input

        // emit event to update comments in real-time
        emitNewComment(response);
      } else {
        console.error("Error adding comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleGetComment = async (e) => {
    e.preventDefault();
    try {
      const response = await getCommentsByComplaintId(id, token);
      console.log("GETTING COMMENT ALL>>>>>>>>>>>>", response);
      if (response) {
        setComment(response);
      } else {
        console.error("Error fetching comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  if (!complaint) {
    return <div>Loading...</div>;
  }

  const handleGetComments = async () => {
    try {
      setIsLoadingComments(true);
      const response = await getCommentsByComplaintId(id, token);
      if (response) {
        setComments(response);
      } else {
        console.error("Error fetching comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };
  console.log("COMMENTT", comment);

  const handleCommentUpvote = async (e, commentId) => {
    e.preventDefault();
    console.log("!!!!!!!!!! HANDLING COMMENT UPVOTE")
    try {
      const response = await likeComment(commentId, token);
      console.log("!!!!!!!!!!" , response);
      if (response.success) {
        console.log("!!! EMITTING UPVOTE")
        emitUpvoteComment(response.updatedComment);
      }
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
  };

  const handleCommentDownvote = async (e, commentId) => {
    e.preventDefault();
    try {
      const response = await dislikeComment(commentId, token);
      if (response.success) {
        emitDownvoteComment(response.updatedComment);
      }
    } catch (error) {
      console.error("Error downvoting comment:", error);
    }
  };

  return (
<>
  <div className="bg-gray-100 p-5 rounded-lg shadow-lg max-w-4xl mx-auto mt-2">
    <form className="flex flex-col gap-8">
      {/* Title Section */}
      <div className="flex flex-col items-center text-center">
        <label className="text-black text-4xl mb-2">Title</label>
        <h1 className="text-black font-serif text-2xl">{complaint?.title}</h1>
      </div>

      {/* Complaint Image and Description */}
      <div className="flex flex-col items-center gap-6">
        <img
          src={complaint?.img}
          alt={complaint?.title}
          className="h-[300px] w-[600px] rounded-lg object-cover shadow-lg"
        />
        <div className="flex flex-col items-center text-center gap-2">
          <label className="text-black font-semibold text-lg">
            Complaint Description
          </label>
          <h1 className="text-gray-600 ">{complaint?.body}</h1>
        </div>
      </div>

      {/* Votes and Status */}
      <div className="flex flex-col items-center gap-4">
        
        <div className="flex flex-row items-center justify-between gap-16">
  {/* Upvotes and Downvotes */}
  <div className="flex items-center gap-2">
    <label className="text-black text-lg">UpVote:</label>
    <h1 className="text-gray-600">{upvotes}</h1>
    <label className="text-black text-lg">DownVote:</label>
    <h1 className="text-gray-600">{downvotes}</h1>
  </div>

  {/* Status of Complaint */}
  <div className="flex items-center gap-2">
    <label className="text-black text-lg">Status of Complaint:</label>
    <h1
      className="font-semibold"
      style={{ color: complaint?.isResolved ? "green" : "red" }}
    >
      {complaint?.isResolved ? "Resolved" : "Unresolved"}
    </h1>
    {complaint?.isResolved && (
      <h1 style={{ color: "green" }}>
        by {complaint?.resolvedBy?.firstName}
      </h1>
    )}
  </div>
</div>


        {/* Author Information */}
        <div className="flex flex-row gap-2 items-center">
          <label className="text-black text-lg">Created By:</label>
          <h1 className="text-blue-500 font-sans">
            {complaint?.author?.firstName} {complaint?.author?.lastName}
          </h1>
        </div>
      </div>

      {/* Comment Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-full">
          <label
            htmlFor="message"
            className="block mb-2 text-2xl  text-black"
          >
            Your message
          </label>
          <textarea
            id="message"
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="block w-full p-3 text-black bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-300 dark:text-white dark:border-gray-600"
            placeholder="Write your thoughts here..."
          ></textarea>

          <button
            className="mt-3 py-2 px-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200 ease-in-out"
            onClick={handleAddComment}
          >
            Add Comment
          </button>
        </div>
        <button
          onClick={() => {
            handleGetComments();
            setShowComments(true);
          }}
          disabled={isLoadingComments}
          className="py-2 px-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200 ease-in-out"
        >
          {isLoadingComments ? "Loading Comments..." : "Show All Comments"}
        </button>

        {/* Comments Display */}
        {showComments && (
          <ul className="w-full text-white">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-gray-900 p-4 rounded-xl mb-4 shadow-md"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{comment?.userName}</h3>
                  <time className="text-xs" dateTime={comment.createdAt}>
                    {formattedDate(comment.createdAt)}
                  </time>
                </div>
                <p className="text-sm">{comment.text}</p>
                <div className="flex gap-4 mt-2">
                  <button
                    className="flex items-center text-yellow-200 hover:text-yellow-300 transition duration-150"
                    onClick={(e) => handleCommentUpvote(e, comment._id)}
                  >
                    <BiSolidUpvote /> {comment.upVotedBy.length}
                  </button>
                  <button
                    className="flex items-center text-yellow-200 hover:text-yellow-300 transition duration-150"
                    onClick={(e) => handleCommentDownvote(e, comment._id)}
                  >
                    <BiSolidDownvote /> {comment.downVotedBy.length}
                  </button>
                </div>
              </div>
            ))}
          </ul>
        )}
      </div>
    </form>
  </div>
</>

  );
};

export default IndividualComplaint;

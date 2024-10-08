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
      <div>
        <form className="flex max-w-[1000px] justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-row gap-2 mt-6 mb-2">
              <label className="mr-8 text-yellow-200 font-bold text-2xl">
                Title:
              </label>
              <h1 className="mr-8 text-white font-serif text-2xl">
                {complaint?.title}
              </h1>
            </div>

            <div className="flex flex-row gap-2">
              <div className="flex flex-row gap-2">
                <img
                  src={complaint?.img}
                  alt={complaint?.title}
                  className="h-[300px] w-[400px] rounded-lg object-cover "
                />
              </div>

              <div className="flex flex-col gap-2 ml-5">
                <label className="mr-8 text-yellow-100 font-semibold">
                  Complaint Desc:
                </label>{" "}
                <h1 className=" text-white font-serif">{complaint?.body}</h1>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <label className="mt-2 text-yellow-200">UpVote: </label>

                <h1 className="mr-6 mt-2.5 text-white">
                  {upvotes}
                </h1>
                <label className="mt-2 text-yellow-200 ">DownVote: </label>

                <h1 className="mr-6 mt-2.5 text-gray-100">
                  {downvotes}
                </h1>
              </div>
              <div className="flex flex-row gap-2">
                <label className="mb-2 text-yellow-200">
                  Status of Complaint:
                </label>
                <h1
                  className="font-semibold"
                  style={{ color: complaint?.isResolved ? "green" : "red" }}
                >
                  {complaint?.isResolved ? "Resolved" : "Unresolved"}
                </h1>
                {complaint?.isResolved && (
                  <h1 style={{ color: "green" }}>
                    {" "}
                    by
                    {complaint?.resolvedBy?.firstName}
                  </h1>
                )}
              </div>

              <div className="flex flex-row align-center gap-2">
                {/* add resolved by */}
                <label className=" text-yellow-200">Created By:</label>

                <h1 className="mb-1 text-pink-100 font-sans">
                  {complaint?.author?.firstName} {complaint?.author?.lastName}
                </h1>
              </div>
            </div>

            {/* Add more fields as needed */}

            <div className="flex flex-col gap-2">
              <div>
                {/* <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your comment..."
                /> */}

                <label
                  htmlFor="message"
                  className="block mb-2  text-lg font-medium text-gray-900 dark:text-white"
                >
                  Your message
                </label>
                <textarea
                  id="message"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  class="block p-1  w-full text-l text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Write your thoughts here..."
                ></textarea>

                <button
                  className="ml-50 mt-3 mb-3 py-2 px-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
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
                className=" mt-3 mb-3 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              >
                {isLoadingComments
                  ? "Loading Comments..."
                  : "Show All Comments"}
              </button>
              {showComments && (
                <ul className="form-style text-white">
                  {comments.map((comment) => (
                    <div key={comment._id}>
                      <div className="mx-auto my-8 flex max-w-screen-sm rounded-xl border border-gray-100 p-4 text-left text-white-600 shadow-lg sm:p-8">
                        <div className="w-full text-left">
                          <div className="mb-2 flex flex-col justify-between text-white-600 sm:flex-row">
                            <h3 className="font-medium">{comment?.userName}</h3>
                            <time className="text-xs" dateTime={comment.createdAt}>
                              {formattedDate(comment.createdAt)}
                            </time>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="flex items-center text-yellow-200"
                              onClick={(e) => handleCommentUpvote(e, comment._id)}
                            >
                              <BiSolidUpvote /> {comment.upVotedBy.length}
                            </button>
                            <button
                              className="flex items-center text-yellow-200"
                              onClick={(e) => handleCommentDownvote(e, comment._id)}
                            >
                              <BiSolidDownvote /> {comment.downVotedBy.length}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* You can also add buttons, submit handlers, etc. */}
        </form>
      </div>
    </>
  );
};

export default IndividualComplaint;

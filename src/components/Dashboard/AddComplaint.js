import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { addComplaint } from "../../slices/complaintSlice";
import Upload from "./Upload";
import IconBtn from "../common/IconBtn";

export default function AddComplaint() {
  const { complaint } = useSelector((state) => state.complaint);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitComplaintForm = async (data) => {
    dispatch(addComplaint(data, token));
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitComplaintForm)}>
        <div className="my-10 flex flex-col gap-y-6 rounded-md border border-yellow-100 p-8 px-12">
          <h2 className="text-lg font-semibold text-white">
            Complaint Information
          </h2>

          {/* Complaint Title and Description */}
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-1/2">
              <label htmlFor="title" className="label-style">
                Complaint Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Enter Title"
                className="form-style"
                {...register("title", { required: true })}
                defaultValue={complaint?.title}
              />
              {errors.title && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  Please enter title.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 lg:w-1/2">
              <label htmlFor="body" className="label-style">
                Description
              </label>
              <input
                type="text"
                name="body"
                id="body"
                placeholder="Enter Description"
                className="form-style"
                {...register("body", { required: true })}
                defaultValue={complaint?.body}
              />
              {errors.body && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  Please enter Description.
                </span>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-5">
            <label htmlFor="complaintImage" className="label-style">
              Upload Any File
            </label>
            <Upload
              name="complaintImage"
              label="Complaint Image"
              register={register}
              setValue={setValue}
              errors={errors}
              editData={complaint?.complaintImage}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/my-complaint")}
            className="cursor-pointer rounded-md bg-slate-500 py-2 px-5 font-semibold text-white"
          >
            Cancel
          </button>
          <IconBtn type="submit" text="Save" />
        </div>
      </form>
    </>
  );
}

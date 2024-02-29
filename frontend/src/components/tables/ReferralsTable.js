import { SetPopupContext } from "App";
import axios from "axios";
import apiList from "../../libs/apiList";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Rating, Typography } from "@material-tailwind/react";
import { Button, Modal } from "flowbite-react";
import { getId } from "libs/isAuth";
import { computeHeadingLevel } from "@testing-library/react";

const th = ["Title", "Name", "job type", "Status", "Day apply and join"];

export default function ReferralsTable(props) {
  const setPopup = useContext(SetPopupContext);
  const UserId = getId();
  const { referrals } = props;
  const [rating, setRating] = useState(-1);
  const [open, setOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

  useEffect(() => {
    const newRatings = referrals.map((referral) => referral.job.rating);
    if (newRatings.some((rating) => rating != null)) {
      const firstNonNullRating = newRatings.find((rating) => rating != null);
      setRating(firstNonNullRating);
    }
  }, [referrals]);

  console.log("rating first: ", rating);

  const appliedOn =
    referrals.length > 0 ? new Date(referrals[0].dateOfApplication) : null;

  const joinedOn =
    referrals.length > 0 ? new Date(referrals[0].dateOfJoining) : null;

  const colorSet = {
    applied: "#3454D1",
    shortlisted: "#DC851F",
    accepted: "#09BC8A",
    rejected: "#D1345B",
    deleted: "#B49A67",
    cancelled: "#FF8484",
    finished: "#4EA5D9",
  };

  const fetchRating = async (referral) => {
    if (referral && referral.job._id) {
      try {
        const response = await axios.get(
          `${apiList.rating}?id=${referral.job._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const fetchedRating = response.data.rating;

        const index = referrals.findIndex(
          (item) => item._id === referral.job._id
        );
        if (index !== -1) {
          referrals[index].rating = fetchedRating;
          setRating(fetchedRating);
        }
      } catch (err) {
        console.log(err);
        setPopup({
          open: true,
          icon: "error",
          message: "Error",
        });
      }
    }
  };

  const changeRating = async (jobId) => {
    console.log("job id: ", jobId);
    try {
      if (referrals.length === 0) {
        console.log("No referrals found");
        return;
      }

      await axios.put(
        apiList.rating,
        { rating: rating, jobId: jobId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPopup({
        open: true,
        icon: "success",
        message: "Rating updated successfully",
      });

      fetchRating();
      setOpen(false);
    } catch (err) {
      setPopup({
        open: true,
        icon: "error",
        message: err.response.data.message,
      });
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="mt-6 overflow-x-auto bg-white rounded-xl px-6 py-3">
        <div className="py-2 align-middle inline-block min-w-full">
          <table className="min-w-full divide-y divide-gray-500 z-0">
            <thead>
              <tr>
                {th.map((t, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs text-gray-900 uppercase tracking-wider leading-tight font-semibold "
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 divide-dashed">
              {referrals && referrals.length > 0 ? (
                <>
                  {referrals.map((obj, index) => {
                    if (obj.userId === UserId) {
                      return (
                        <React.Fragment key={index}>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link
                                to={`/jobs/${obj.jobId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-money hover:underline"
                              >
                                <Typography>{obj.job.title}</Typography>
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link
                                to={`/companies/${obj.recruiterId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-money hover:underline"
                              >
                                {obj.recruiterId && obj.recruiter.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {obj.job.jobType}
                            </td>
                            <td className="w-[5.75rem] py-4 whitespace-nowrap text-sm text-gray-500 flex flex-col-reverse">
                              <div>
                                <div
                                  className="w-full h-full flex items-center justify-center uppercase rounded-xl"
                                  style={{
                                    background: colorSet[obj.status],
                                    color: "#ffffff",
                                  }}
                                >
                                  {obj.status}
                                </div>
                              </div>
                              {obj.status === "accepted" ||
                              obj.status === "finished" ? (
                                <div>
                                  <button
                                    variant="contained"
                                    color="primary"
                                    className="w-full h-full flex items-center justify-center uppercase"
                                    onClick={() => {
                                      setSelectedReferral(obj);
                                      fetchRating(obj);
                                      setOpen(true);
                                    }}
                                  >
                                    Rate Job
                                  </button>
                                </div>
                              ) : null}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                Applied On: {appliedOn.toLocaleDateString()}
                              </div>
                              {obj.status === "accepted" ||
                              obj.status === "finished" ? (
                                <div>
                                  Joined On: {joinedOn.toLocaleDateString()}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    }
                  })}
                </>
              ) : (
                <Typography style={{ textAlign: "center" }}>
                  No Applications Found
                </Typography>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        show={open}
        onClose={handleClose}
        className="h-full flex items-center justify-center"
      >
        <Modal.Header className="bg-gray-200 border-none rounded-t-2xl">
          Select
        </Modal.Header>
        <div
          style={{
            padding: "20px",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "30%",
            alignItems: "center",
          }}
        >
          <Rating
            name="simple-controlled"
            style={{ marginBottom: "30px" }}
            value={rating === -1 ? null : rating}
            onChange={(newValue) => {
              setRating(newValue);
            }}
          />
          <Modal.Footer className="bg-gray-200 rounded-b-2xl">
            <Button
              variant="contained"
              color="primary"
              style={{ padding: "10px 50px" }}
              onClick={() => {
                changeRating(selectedReferral?.jobId);
              }}
            >
              Submit
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  FaUserCircle,
  FaPlus,
  FaTrash,
  FaClock,
  FaComment,
  FaPaperPlane,
} from "react-icons/fa";
import "./Reports.css";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const ReportsFeed = () => {
  const [reports, setReports] = useState([]);
  const [newComments, setNewComments] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8001/api/current-user/",
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8001/api/reports/", {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (reportId, text) => {
    setNewComments((prev) => ({ ...prev, [reportId]: text }));
  };

  const submitComment = async (reportId) => {
    if (!newComments[reportId]?.trim()) return;

    try {
      await axios.post(
        `http://localhost:8001/api/reports/${reportId}/comments/`,
        {
          content: newComments[reportId],
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "X-CSRFToken": Cookies.get("csrftoken"),
            "Content-Type": "application/json",
          },
        }
      );
      setNewComments((prev) => ({ ...prev, [reportId]: "" }));
      fetchReports();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8001/api/comments/${commentId}/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "X-CSRFToken": Cookies.get("csrftoken"),
        },
      });
      fetchReports();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      await axios.delete(`http://localhost:8001/api/reports/${reportId}/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "X-CSRFToken": Cookies.get("csrftoken"),
        },
      });
      fetchReports();
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Reports</h3>
          <p>Please wait while we fetch the latest reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header Section */}
      <div className="reports-header">
        <div className="header-content">
          <div className="page-title">
            <div className="title-icon">
              <FaComment />
            </div>
            <div className="title-content">
              <h1>Reports Feed</h1>
              <p>Share and discuss assessment reports with your team</p>
            </div>
          </div>
          <Link to="/reports/new" className="btn-create">
            <FaPlus />
            Create Report
          </Link>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="reports-content">
        {reports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaComment />
            </div>
            <h3>No Reports Yet</h3>
            <p>Be the first to share an assessment report with your team.</p>
            <Link to="/reports/new" className="btn-primary">
              <FaPlus />
              Create First Report
            </Link>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                {/* Report Header */}
                <div className="report-header">
                  <div className="author-info">
                    <div className="author-avatar">
                      <FaUserCircle />
                    </div>
                    <div className="author-details">
                      <span className="author-name">
                        {report.author?.username || "Unknown User"}
                      </span>
                      <div className="post-meta">
                        <FaClock />
                        <span>
                          {formatDistanceToNow(new Date(report.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user && report.author.id === user.id && (
                    <button
                      className="delete-report-btn"
                      onClick={() => deleteReport(report.id)}
                      title="Delete Report"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                {/* Report Content */}
                <div className="report-content">
                  <h3 className="report-title">{report.title}</h3>
                  <p className="report-text">{report.content}</p>
                </div>

                {/* Comment Section */}
                <div className="comment-section">
                  <div className="comment-input-container">
                    <textarea
                      className="comment-input"
                      placeholder="Share your thoughts on this report..."
                      value={newComments[report.id] || ""}
                      onChange={(e) =>
                        handleCommentChange(report.id, e.target.value)
                      }
                      rows="2"
                    />
                    <button
                      className="comment-submit-btn"
                      onClick={() => submitComment(report.id)}
                      disabled={!newComments[report.id]?.trim()}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>

                  {/* Comments List */}
                  {report.comments && report.comments.length > 0 && (
                    <div className="comments-list">
                      <div className="comments-header">
                        <span className="comments-count">
                          {report.comments.length} Comment
                          {report.comments.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {report.comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">
                            <FaUserCircle />
                          </div>
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="comment-author">
                                {comment.author.username}
                              </span>
                              <div className="comment-meta">
                                <FaClock />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(comment.created_at),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                              {user && comment.author.id === user.id && (
                                <button
                                  className="delete-comment-btn"
                                  onClick={() => deleteComment(comment.id)}
                                  title="Delete Comment"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                            <p className="comment-text">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsFeed;

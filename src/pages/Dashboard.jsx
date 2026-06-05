import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import pb from "../api/pocketbase";
import ghostLogo from "../assets/gh.png";
import "./Dashboard.css";
import OptionsSection from "./OptionsSection"; // Make sure to import this

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(pb.authStore.model);
  const [extensionData, setExtensionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5); // Items per page
  const [totalItems, setTotalItems] = useState(0);
  const [isPaginating, setIsPaginating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const records = await pb.collection("extension_data").getFullList({
            filter: `user = "${user.id}"`,
          });
          setExtensionData(records);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const fetchTrackedJobs = async (page = 1) => {
    try {
      page === 1 ? setLoading(true) : setIsPaginating(true);
      const result = await pb
        .collection("extension_data")
        .getList(page, perPage, {
          filter: `user = "${pb.authStore.model.id}"`,
          sort: "-created",
        });

      setExtensionData(result.items);
      setTotalItems(result.totalItems);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
      setIsPaginating(false);
    }
  };

  // Add this to your pagination controls:
  {
    isPaginating && <span className="loading-indicator">Loading...</span>;
  }


  

  const handleLogout = async () => {
    try {
      // 1. Clear PocketBase auth
      pb.authStore.clear();
      
      // 2. Remove stored auth data
      await chrome.storage.local.remove("pb_auth_user");
      
      // 4. Navigate to home page
      navigate("/");
      
      // Optional: Refresh the page to ensure clean state
      window.location.reload();
      
    } catch (err) {
      console.error("Logout failed:", err);
      // Optional: Show error to user if needed
      // setError("Failed to logout properly");
      
      // Still navigate even if cleanup failed
      navigate("/");
    }
  };
  const PaginationControls = () => {
    const totalPages = Math.ceil(totalItems / perPage);

    return (
      <div className="pagination-controls">
        <button
          onClick={() => fetchTrackedJobs(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => fetchTrackedJobs(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };
  const handleCloseOptions = () => {
    setShowOptions(false);
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Header with logo and user info */}
      <header className="dashboard-header">
        <img src={ghostLogo} alt="GhostHunter" className="dashboard-logo" />
        <div
          className="user-profile"
          onClick={() => setShowOptions(!showOptions)}
        >
          <span className="username">{user?.name || user?.email}</span>
          <div className="avatar">
            {user?.avatar ? (
              <img
                src={`${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}`}
                alt="User Avatar"
                className="avatar-image"
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallbackText =
                    user?.name?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase();
                  e.target.parentElement.textContent = fallbackText;
                }}
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </header>

      {showOptions && (
        <div className="options-modal">
        {/* Modal overlay */}
        <div className="options-overlay" onClick={handleCloseOptions}></div>
        
        {/* Options dropdown */}
        <div className="options-dropdown">
          {/* Top bar with close and logout buttons */}
          <div className="options-top-bar">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
            <button className="close-options" onClick={handleCloseOptions}>
              ×
            </button>
          </div>
    
          {/* Options content */}
          <div className="options-content">
            <OptionsSection
              user={user}
              setUser={setUser}
              onClose={handleCloseOptions}
            />
          </div>
        </div>
      </div>
      )}

      <main className="dashboard-content">
        <h2 className="dashboard-title">Your Tracked Jobs</h2>

        {extensionData.length > 0 ? (
          <>
            <ul className="job-list">
              {extensionData.map((job) => (
                <li key={job.id} className="job-item">
                  <a
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default anchor behavior
                      navigate(`/jobs/${job.id}`); // Navigate programmatically
                    }}
                    href={`/jobs/${job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="job-link"
                  >
                    <h3>{job.title}</h3>
                    <p className="company">{job.company}</p>
                    <div className="job-meta">
                      <span className={`status ${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                      <span className="date">
                        Added: {new Date(job.created).toLocaleDateString()}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <PaginationControls />
          </>
        ) : (
          <div className="empty-state">
            <p>No jobs tracked yet</p>
            
          </div>
        )}
      </main>
    </div>
  );
}

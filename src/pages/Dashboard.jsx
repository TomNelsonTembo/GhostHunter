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
  const [isScanning, setIsScanning] = useState(false);

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

  const handleScanPage = async () => {
    setIsScanning(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log("Scanning page for jobs...");
      // Execute content script
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        
        func: () => {
          return window.scanPageForJobs ? window.scanPageForJobs() : [];
        },
      });

      if (results[0]?.result?.length > 0) {
        await saveJobs(results[0].result);
        await fetchTrackedJobs(); // Refresh the list
      } else {
        console.log("No jobs found on this page");
      }
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const saveJobs = async (jobs) => {
    try {
      for (const job of jobs) {
        await pb.collection("extension_data").create({
          ...job,
          user: pb.authStore.model.id,
        });
      }
    } catch (error) {
      console.error("Failed to save jobs:", error);
    }
  };
  const fetchTrackedJobs = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("extension_data").getFullList({
        filter: `user = "${pb.authStore.model.id}"`,
        sort: "-created",
      });
      setExtensionData(records);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOptions = () => {
    setShowOptions(false);
  };

  const handleLogout = () => {
    pb.authStore.clear();
    navigate("/");
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
        <div className="options-dropdown">
          <button className="close-options" onClick={handleCloseOptions}>
            ×
          </button>
          <OptionsSection
            user={user}
            setUser={setUser}
            onClose={handleCloseOptions}
          />
        </div>
      )}

      <main className="dashboard-content">
        <h2 className="dashboard-title">Your Tracked Jobs</h2>

        {extensionData.length > 0 ? (
          <ul className="job-list">
            {extensionData.map((job) => (
              <li key={job.id} className="job-item">
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
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No jobs tracked yet</p>
            <button
              className={`scan-button ${isScanning ? "loading" : ""}`}
              onClick={handleScanPage}
              disabled={isScanning}
            >
              {isScanning ? "Scanning..." : "Scan Current Page"}
            </button>
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </footer>
    </div>
  );
}

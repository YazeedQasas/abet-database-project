import React, { useState, useEffect, useContext } from "react";
import "./Home.css";
import unilogo from "../assets/alq_logo.png";
import bgVideo from "../assets/alq_bg.mp4";
import aislogo from "../assets/AISABET.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const TITLES = [
  "ABET Accreditation Tracker",
  "Empower Your Accreditation Journey",
  "Seamless ABET Management",
  "Excellence in Engineering Education",
];

const Home = () => {
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const navigate = useNavigate();
  const { currentUser, loading } = useContext(AuthContext);
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const currentTitle = TITLES[titleIndex];
    let currentIndex = 0;

    if (isTyping) {
      const typeInterval = setInterval(() => {
        if (currentIndex <= currentTitle.length) {
          setDisplayText(currentTitle.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      }, 100);

      return () => clearInterval(typeInterval);
    } else {
      const eraseInterval = setInterval(() => {
        if (currentIndex >= 0) {
          setDisplayText(currentTitle.slice(0, currentIndex));
          currentIndex--;
        } else {
          clearInterval(eraseInterval);
          setTitleIndex((prev) => (prev + 1) % TITLES.length);
          setIsTyping(true);
        }
      }, 50);

      return () => clearInterval(eraseInterval);
    }
  }, [titleIndex, isTyping]);

  const getDestination = () => {
    return isAuthenticated ? "/dashboard" : "/login";
  };

  const getButtonText = () => {
    return isAuthenticated ? "Go to Dashboard" : "Start your journey";
  };

  // Get display name for the user
  const getUserDisplayName = () => {
    if (!currentUser) return "";

    // Try to use first name if available, otherwise use username
    if (currentUser.firstName && currentUser.firstName.trim()) {
      return currentUser.firstName;
    }
    return currentUser.username;
  };

  return (
    <div className="home-container">
      {/* Video Background */}
      <video
        className="video-background"
        src={bgVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Smooth Fading Arch Overlay */}
      <div className="overlay-arch"></div>

      {/* Decorative Orange Elements */}
      <div className="decorative-elements">
        <div className="floating-dot dot-1"></div>
        <div className="floating-dot dot-2"></div>
        <div className="floating-dot dot-3"></div>
        <div className="accent-line line-vertical-1"></div>
        <div className="accent-line line-vertical-2"></div>
        <div className="accent-line line-diagonal-1"></div>
        <div className="accent-line line-diagonal-2"></div>
        <div className="geometric-shape shape-1"></div>
        <div className="geometric-shape shape-2"></div>
      </div>

      {/* Transparent Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img
            src={unilogo}
            alt="AlQuds University"
            className="navbar-logo-img"
          />
        </div>
        <Link to={getDestination()} className="navbar-btn navbar-link">
          {getButtonText()}
        </Link>
      </nav>

      {/* Left-aligned Content */}
      <div className="home-content">
        <img
          src={aislogo}
          alt="ABET Tracker"
          className="home-logo"
          style={{ width: "250px", height: "auto", marginBottom: "0.1rem" }}
        />

        {/* Welcome Message for Authenticated Users */}
        {isAuthenticated && (
          <div className="welcome-message">
            <h2 className="welcome-text">
              Hello {getUserDisplayName()}, welcome back!
            </h2>
          </div>
        )}

        <h1 className="home-title typewriter">
          {displayText}
          <span className="cursor">|</span>
        </h1>
        <p className="home-subtitle">
          Empowering Al-Quds University to seamlessly track, manage, and achieve
          ABET accreditation standards. Your journey to academic excellence
          starts here.
        </p>
        <div className="subtitle-underline"></div>
      </div>

      <footer className="home-footer">
        <div className="footer-content">
          <p className="copyright-text">
            &copy; 2025 Al-Quds University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // If not using already
import './Reports.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const CreateReport = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const csrfToken = Cookies.get('csrftoken'); // grab the CSRF token from the cookie
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting report with:', { title, content });
  
      await axios.post('http://localhost:8000/api/reports/', {
        title,
        content
      }, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
      });
  
      // Clear inputs
      setTitle('');
      setContent('');
  
      // ✅ Redirect to the feed
      navigate('/reports');
  
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report.');
    }
  };

  const fetchCSRFToken = async () => {
    try {
      await axios.get('http://localhost:8000/api/get-csrf-token/', {
       headers :{
        'Authorization': `Token ${localStorage.getItem('token')}`,
       }
      });
      console.log('CSRF cookie set');
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };
  
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  

  return (
    <div className="create-report">
      <h2>Create a New Report</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Report Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your report here..."
          required
        />
        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default CreateReport;

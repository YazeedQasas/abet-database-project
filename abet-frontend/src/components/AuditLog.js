import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './AuditLog.css';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit-logs/');
        setLogs(res.data);
      } catch (error) {
        console.error('Failed to load audit logs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <p>Loading audit logs...</p>;

  return (
    <div className="audit-log-container">
      <h2>Recent System Actions</h2>
      <table className="audit-log-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Model</th>
            <th>ID</th>
            <th>Change</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.username}</td>
              <td>{log.action}</td>
              <td>{log.target_model}</td>
              <td>{log.target_id}</td>
              <td>{log.changes}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLog;

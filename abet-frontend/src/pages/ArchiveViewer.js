import React from 'react';

const ArchiveViewer = () => {
  return (
    <iframe
      title="ABET Archive"
      src="http://localhost:5050"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
      }}
    />
  );
};

export default ArchiveViewer;

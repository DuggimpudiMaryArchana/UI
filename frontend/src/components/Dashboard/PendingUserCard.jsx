import React from 'react';

const PendingUserCard = ({ user, onApprove, onReject }) => {
  return (
    <div style={{
      border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '250px'
    }}>
      <h3>{user.name}</h3>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button onClick={onApprove} style={{ backgroundColor: 'green', color: 'white' }}>Approve</button>
        <button onClick={onReject} style={{ backgroundColor: 'red', color: 'white' }}>Reject</button>
      </div>
    </div>
  );
};

export default PendingUserCard;

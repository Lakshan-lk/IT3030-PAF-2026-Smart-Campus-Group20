import React from 'react';
import TicketsPage from './TicketsPage';

const AdminTicketsPage = () => {
  return (
    <TicketsPage
      mode="admin"
      showCreateButton={false}
      pageTitle="Ticket Administration"
      pageSubtitle="All tickets are loaded from the database and each card shows the reporter, assignee, and current status."
    />
  );
};

export default AdminTicketsPage;

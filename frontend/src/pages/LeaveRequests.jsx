import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeave } from '../context/LeaveContext';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  color: #1e293b;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
  color: #64748b;
`;

const ApplyLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #0f172a;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: background 0.2s, transform 0.1s;
  &:hover {
    background: #1e293b;
    color: #fff;
    transform: translateY(-1px);
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem 1.25rem;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:last-child ${Td} {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  &.pending { background: #fef3c7; color: #92400e; }
  &.approved { background: #d1fae5; color: #065f46; }
  &.rejected { background: #fee2e2; color: #991b1b; }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.05s;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:not(:disabled):hover { transform: translateY(-1px); }
`;

const BtnApprove = styled(Btn)`
  background: #059669;
  color: #fff;
  &:hover:not(:disabled) { background: #047857; }
`;

const BtnReject = styled(Btn)`
  background: #dc2626;
  color: #fff;
  &:hover:not(:disabled) { background: #b91c1c; }
`;

const Empty = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9375rem;
`;

const ErrorBanner = styled.div`
  padding: 1rem 1.25rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
`;

const LoadingRow = styled.tr`
  td {
    padding: 2rem;
    text-align: center;
    color: #64748b;
    font-size: 0.9375rem;
  }
`;

const LeaveRequests = () => {
  const { leaveRequests, loading, error, updateLeaveStatus } = useLeave();
  const { user } = useAuth();
  const [loadingIds, setLoadingIds] = useState(new Set());

  const role = (user?.role || '').toLowerCase();
  const canApprove = ['admin', 'superadmin', 'hr'].includes(role);

  const filteredRequests = leaveRequests.filter((request) => {
    if (canApprove) return true;
    const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
      user?.name || user?.username || '';
    return request.name === userName || request.name?.toLowerCase() === userName?.toLowerCase();
  });

  const handleStatusChange = async (id, newStatus) => {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await updateLeaveStatus(id, newStatus, newStatus === 'rejected' ? 'Rejected' : undefined);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Page>
      <Header>
        <div>
          <Title>My Leave</Title>
          <Subtitle>View and manage your leave requests</Subtitle>
        </div>
        <ApplyLink to="/apply-leave">New request</ApplyLink>
      </Header>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <Card>
        {loading ? (
          <Table aria-label="Leave requests">
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Department</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Type</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                {canApprove && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              <LoadingRow>
                <td colSpan={canApprove ? 8 : 7}>Loading leave requests…</td>
              </LoadingRow>
            </tbody>
          </Table>
        ) : filteredRequests.length === 0 ? (
          <Empty>
            No leave requests yet. <Link to="/apply-leave" style={{ color: '#0f172a', fontWeight: 600 }}>Submit a request</Link>.
          </Empty>
        ) : (
          <Table aria-label="Leave requests">
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Department</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Type</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                {canApprove && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((leave) => {
                const isPending = leave.status === 'pending';
                const isLoading = loadingIds.has(leave.id);
                return (
                  <Tr key={leave.id}>
                    <Td>{leave.name}</Td>
                    <Td>{leave.department}</Td>
                    <Td>{formatDate(leave.startDate)}</Td>
                    <Td>{formatDate(leave.endDate)}</Td>
                    <Td>{leave.leaveType || '—'}</Td>
                    <Td>{leave.reason || '—'}</Td>
                    <Td>
                      <StatusBadge className={leave.status}>{leave.status}</StatusBadge>
                    </Td>
                    {canApprove && (
                      <Td>
                        <BtnGroup>
                          <BtnApprove
                            onClick={() => isPending && !isLoading && handleStatusChange(leave.id, 'approved')}
                            disabled={!isPending || isLoading}
                            aria-label={`Approve leave for ${leave.name}`}
                          >
                            {loadingIds.has(leave.id) ? '…' : 'Approve'}
                          </BtnApprove>
                          <BtnReject
                            onClick={() => isPending && !isLoading && handleStatusChange(leave.id, 'rejected')}
                            disabled={!isPending || isLoading}
                            aria-label={`Reject leave for ${leave.name}`}
                          >
                            Reject
                          </BtnReject>
                        </BtnGroup>
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </Page>
  );
};

export default LeaveRequests;

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import LeaveForm from '../components/leave/LeaveForm';
import { useLeave } from '../context/LeaveContext';
import { useAuth } from '../context/AuthContext';

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
`;

const Header = styled.header`
  margin-bottom: var(--space-8);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: var(--space-2) 0 0;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
`;

const MyLeaveLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
  &:hover { text-decoration: underline; }
`;

const Section = styled.section`
  margin-top: var(--space-10);
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border);
`;

const SectionTitle = styled.h2`
  margin: 0 0 var(--space-4);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
`;

const TableWrap = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-primary-light);
  border-bottom: 1px solid var(--color-border);
`;

const Td = styled.td`
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  &:last-child { border-bottom: none; }
`;

const Tr = styled.tr`
  &:last-child ${Td} { border-bottom: none; }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  &.pending { background: var(--color-warning-bg); color: var(--color-warning); }
  &.approved { background: var(--color-success-bg); color: var(--color-success); }
  &.rejected { background: var(--color-error-bg); color: var(--color-error); }
`;

const Btn = styled.button`
  padding: var(--space-1) var(--space-3);
  margin-right: var(--space-2);
  font-size: 0.8125rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity 0.2s;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const BtnApprove = styled(Btn)`
  background: var(--color-success);
  color: #fff;
  &:hover:not(:disabled) { opacity: 0.9; }
`;

const BtnReject = styled(Btn)`
  background: var(--color-error);
  color: #fff;
  &:hover:not(:disabled) { opacity: 0.9; }
`;

const Empty = styled.p`
  padding: var(--space-6);
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
`;

const LeaveApplication = () => {
  const { leaveRequests, updateLeaveStatus } = useLeave();
  const { user } = useAuth();
  const [loadingIds, setLoadingIds] = useState(new Set());

  const visibleRequests = useMemo(() => {
    if (!user) return [];
    const isAdminOrHr = ['admin', 'superadmin', 'hr'].includes((user?.role || '').toLowerCase());
    return isAdminOrHr
      ? leaveRequests
      : leaveRequests.filter((req) => req.department === user?.department || req.userId === user?.id);
  }, [leaveRequests, user]);

  const handleStatusChange = async (id, status) => {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await updateLeaveStatus(id, status, status === 'rejected' ? 'Rejected' : undefined);
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
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canApprove = ['admin', 'superadmin', 'hr'].includes((user?.role || '').toLowerCase());

  return (
    <Page>
      <Header>
        <Title>Leave Application</Title>
        <Subtitle>Submit a new leave request below. You can view and track all requests in My Leave.</Subtitle>
        <MyLeaveLink to="/leaves">View all requests in My Leave →</MyLeaveLink>
      </Header>

      <LeaveForm />

      <Section>
        <SectionTitle>Recent leave requests</SectionTitle>
        {visibleRequests.length === 0 ? (
          <TableWrap>
            <Empty>No leave requests yet. Submit one above or check My Leave.</Empty>
          </TableWrap>
        ) : (
          <TableWrap>
            <Table aria-label="Leave requests">
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Department</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Reason</Th>
                  <Th>Status</Th>
                  {canApprove && <Th>Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {visibleRequests.slice(0, 10).map((req) => {
                  const isPending = req.status === 'pending';
                  const isLoading = loadingIds.has(req.id);
                  return (
                    <Tr key={req.id}>
                      <Td>{req.name}</Td>
                      <Td>{req.department}</Td>
                      <Td>{formatDate(req.startDate)}</Td>
                      <Td>{formatDate(req.endDate)}</Td>
                      <Td>{req.reason || '—'}</Td>
                      <Td>
                        <StatusBadge className={req.status}>{req.status}</StatusBadge>
                      </Td>
                      {canApprove && (
                        <Td>
                          <BtnApprove
                            onClick={() => isPending && !isLoading && handleStatusChange(req.id, 'approved')}
                            disabled={!isPending || isLoading}
                            aria-label={`Approve leave for ${req.name}`}
                          >
                            {isLoading ? '…' : 'Approve'}
                          </BtnApprove>
                          <BtnReject
                            onClick={() => isPending && !isLoading && handleStatusChange(req.id, 'rejected')}
                            disabled={!isPending || isLoading}
                            aria-label={`Reject leave for ${req.name}`}
                          >
                            Reject
                          </BtnReject>
                        </Td>
                      )}
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Section>
    </Page>
  );
};

export default LeaveApplication;

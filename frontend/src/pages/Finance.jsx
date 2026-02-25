import React from 'react';
import styled from 'styled-components';

const Page = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-6) 0;
`;

const Title = styled.h1`
  margin: 0 0 var(--space-8);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
`;

const Card = styled.section`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
`;

const CardTitle = styled.h2`
  margin: 0 0 var(--space-4);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
`;

const ReportItem = styled.div`
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const ReportTitle = styled.strong`
  display: block;
  margin-bottom: var(--space-1);
  color: var(--color-text);
`;

const Meta = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
`;

const TaskList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.9375rem;
  color: var(--color-text);
  line-height: 1.8;
`;

const TaskItem = styled.li`
  margin-bottom: var(--space-2);
`;

const Finance = () => {
  const reports = [
    { id: 1, title: 'Monthly Billing - August', status: 'Finalized', date: '2025-08-01' },
    { id: 2, title: 'Pending Invoices', status: 'In Progress', date: '2025-08-20' },
    { id: 3, title: 'Annual Budget 2025', status: 'Submitted', date: '2025-07-10' },
  ];

  const tasks = [
    { task: 'Review vendor payments', due: '2025-08-25' },
    { task: 'Send reminders for overdue invoices', due: '2025-08-23' },
    { task: 'Reconcile July statements', due: '2025-08-28' },
  ];

  return (
    <Page>
      <Title>Finance Dashboard</Title>

      <Grid>
        <Card>
          <CardTitle>Financial Reports</CardTitle>
          {reports.map((report) => (
            <ReportItem key={report.id}>
              <ReportTitle>{report.title}</ReportTitle>
              <Meta>Status: {report.status}</Meta>
              <Meta>Date: {report.date}</Meta>
            </ReportItem>
          ))}
        </Card>

        <Card>
          <CardTitle>Pending Tasks</CardTitle>
          <TaskList>
            {tasks.map((t, i) => (
              <TaskItem key={i}>
                <strong>{t.task}</strong> — Due by {t.due}
              </TaskItem>
            ))}
          </TaskList>
        </Card>
      </Grid>
    </Page>
  );
};

export default Finance;

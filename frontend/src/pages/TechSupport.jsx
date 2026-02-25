import React, { useState } from 'react';
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

const TicketList = styled.ul`
  margin: 0;
  padding-left: 0;
  list-style: none;
`;

const TicketItem = styled.li`
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9375rem;
  color: var(--color-text);
  &:last-child { border-bottom: none; }
`;

const FAQItemWrap = styled.div`
  margin-bottom: var(--space-4);
`;

const FAQQuestion = styled.strong`
  display: block;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--color-text);
  &:hover { color: var(--color-primary); }
`;

const FAQAnswer = styled.p`
  margin: var(--space-2) 0 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.5;
`;

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <FAQItemWrap>
      <FAQQuestion
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(!open);
        }}
      >
        {question}
      </FAQQuestion>
      {open && <FAQAnswer>{answer}</FAQAnswer>}
    </FAQItemWrap>
  );
};

const TechSupport = () => {
  const tickets = [
    { id: 'TS001', subject: 'Bulk SMS delivery delay', status: 'Open', assignedTo: 'Support Agent A' },
    { id: 'TS002', subject: 'OTP SMS integration issue', status: 'Resolved', assignedTo: 'Support Agent B' },
    { id: 'TS003', subject: 'Voice SMS quality problem', status: 'Open', assignedTo: 'Support Agent C' },
  ];

  const faqs = [
    { question: 'How to integrate SMS API?', answer: 'Use our detailed API documentation for integration.' },
    { question: 'What is the limit for Bulk SMS?', answer: 'Our platform supports high-volume messaging with no strict limit.' },
    { question: 'How to troubleshoot Voice SMS issues?', answer: 'Check network quality and ensure correct configuration.' },
  ];

  const openTickets = tickets.filter((t) => t.status === 'Open');
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved');

  return (
    <Page>
      <Title>Tech Support Dashboard</Title>

      <Grid>
        <Card>
          <CardTitle>Open Tickets</CardTitle>
          {openTickets.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>No open tickets.</p>
          ) : (
            <TicketList>
              {openTickets.map((ticket) => (
                <TicketItem key={ticket.id}>
                  <strong>{ticket.subject}</strong> — Assigned to: {ticket.assignedTo}
                </TicketItem>
              ))}
            </TicketList>
          )}
        </Card>

        <Card>
          <CardTitle>Resolved Tickets</CardTitle>
          {resolvedTickets.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>No resolved tickets.</p>
          ) : (
            <TicketList>
              {resolvedTickets.map((ticket) => (
                <TicketItem key={ticket.id}>
                  <strong>{ticket.subject}</strong> — Assigned to: {ticket.assignedTo}
                </TicketItem>
              ))}
            </TicketList>
          )}
        </Card>

        <Card>
          <CardTitle>FAQs</CardTitle>
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </Card>
      </Grid>
    </Page>
  );
};

export default TechSupport;

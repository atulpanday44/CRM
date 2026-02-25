import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  min-height: 100vh;
  padding: var(--space-8) var(--space-6);
  background: var(--color-bg);
`;

const Container = styled.div`
  max-width: 560px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: var(--space-10);
`;

const Title = styled.h1`
  margin: 0 0 var(--space-2);
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: 1.0625rem;
  color: var(--color-text-muted);
`;

const Card = styled.section`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6) var(--space-8);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-8);
`;

const SectionTitle = styled.h2`
  margin: 0 0 var(--space-4);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-text);
`;

const Intro = styled.p`
  margin: 0 0 var(--space-4);
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  line-height: 1.9;
`;

const FeatureItem = styled.li`
  margin-bottom: var(--space-2);
`;

const Cta = styled.section`
  text-align: center;
`;

const CtaText = styled.p`
  margin: 0 0 var(--space-5);
  font-size: 0.9375rem;
  color: var(--color-text-muted);
`;

const ButtonPrimary = styled.button`
  padding: var(--space-3) var(--space-6);
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  background: var(--color-primary);
  color: #fff;
  transition: background 0.2s, transform 0.05s;
  &:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Container>
        <Header>
          <Title>CRM</Title>
          <Tagline>One place for your team to manage work and customers</Tagline>
        </Header>

        <Card>
          <SectionTitle>What this app does</SectionTitle>
          <Intro>
            This CRM helps your organization keep clients, tasks, meetings, and time-off in one place—
            so sales, HR, and everyone else stay aligned.
          </Intro>
          <FeatureList>
            <FeatureItem><strong>Clients &amp; sales</strong> — Track leads, deals, and follow-ups in a pipeline</FeatureItem>
            <FeatureItem><strong>Tasks</strong> — Assign work, set deadlines, and see what’s pending or overdue</FeatureItem>
            <FeatureItem><strong>Meetings</strong> — Schedule and view upcoming meetings</FeatureItem>
            <FeatureItem><strong>Leave</strong> — Request time off and (for HR/admin) approve leave requests</FeatureItem>
            <FeatureItem><strong>HR &amp; admin</strong> — User management, leave management, and role-based access</FeatureItem>
          </FeatureList>
        </Card>

        <Cta>
          <CtaText>Sign in to get started. Need an account? Contact your administrator—users are created by Admin or HR.</CtaText>
          <ButtonPrimary onClick={() => navigate('/login')}>
            Sign in
          </ButtonPrimary>
        </Cta>
      </Container>
    </Wrapper>
  );
};

export default LandingPage;

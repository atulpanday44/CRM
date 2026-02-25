import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiBarChart2,
  FiCheckSquare,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiTool,
  FiClipboard,
  FiFileText,
  FiCheckCircle,
  FiUser,
  FiSettings,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const isAdminOrSuperadmin = (role) =>
  role === 'admin' || role === 'superadmin' || role === 'hr';

const departmentLinks = [
  { to: '/sales', label: 'Sales', desc: 'Clients, pipeline, and follow-ups', Icon: FiDollarSign, role: 'sales' },
  { to: '/finance', label: 'Finance', desc: 'Financial reports and tasks', Icon: FiDollarSign, role: 'finance' },
  { to: '/hr', label: 'HR', desc: 'HR dashboard and leave', Icon: FiUsers, role: 'hr' },
  { to: '/techsupport', label: 'Tech Support', desc: 'Tickets and FAQs', Icon: FiTool, role: 'tech_support' },
];

const Wrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-6) 0;
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
  line-height: 1.5;
`;

const SectionTitle = styled.h2`
  margin: 0 0 var(--space-4);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
`;

const Card = styled(Link)`
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:hover {
    border-color: var(--color-border-focus);
    box-shadow: var(--shadow-md);
  }
`;

const CardIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-text);
  flex-shrink: 0;
`;

const CardContent = styled.div`
  min-width: 0;
`;

const CardLabel = styled.span`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
`;

const CardDesc = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.4;
`;

const Home = () => {
  const { user } = useAuth();
  const name = user?.name || user?.email || 'there';
  const role = (user?.role || '').toLowerCase();
  const isAdminOrHr = isAdminOrSuperadmin(role);
  const isAdmin = role === 'admin' || role === 'superadmin';

  const commonLinks = [
    { to: '/dashboard', label: 'Dashboard', desc: 'Tasks, meetings, and activity overview', Icon: FiBarChart2 },
    { to: '/tasks', label: 'Tasks', desc: 'View and manage your tasks', Icon: FiCheckSquare },
    { to: '/meetings', label: 'Meetings', desc: 'Schedule and view meetings', Icon: FiCalendar },
    { to: '/apply-leave', label: 'Apply Leave', desc: 'Submit a time-off request', Icon: FiClipboard },
    { to: '/leaves', label: 'My Leave', desc: 'View your leave requests and status', Icon: FiFileText },
  ];
  const deptLinkForUser = isAdmin
    ? departmentLinks
    : departmentLinks.filter((d) => d.role === role);
  const baseLinks = [...commonLinks.slice(0, 3), ...deptLinkForUser, ...commonLinks.slice(3)];
  const adminLinks = isAdminOrHr
    ? [
        { to: '/leave-management', label: 'Leave Management', desc: 'Approve or reject leave requests', Icon: FiCheckCircle },
        { to: '/user-management', label: 'User Management', desc: 'Manage users and roles', Icon: FiUser },
      ]
    : [];
  const superAdminLink = isAdmin
    ? [{ to: '/admin', label: 'Admin', desc: 'Admin dashboard and settings', Icon: FiSettings }]
    : [];
  const links = [...baseLinks, ...adminLinks, ...superAdminLink];

  return (
    <Wrapper>
      <Header>
        <Title>Welcome back, {name}</Title>
        <Subtitle>
          Use the links below or the sidebar to open Dashboard, Tasks, Meetings, or Leave.
        </Subtitle>
      </Header>

      <section>
        <SectionTitle>Go to</SectionTitle>
        <Grid>
          {links.map(({ to, label, desc, Icon }) => (
            <Card key={to} to={to}>
              <CardIcon>{Icon && <Icon size={22} strokeWidth={2} />}</CardIcon>
              <CardContent>
                <CardLabel>{label}</CardLabel>
                <CardDesc>{desc}</CardDesc>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </section>
    </Wrapper>
  );
};

export default Home;

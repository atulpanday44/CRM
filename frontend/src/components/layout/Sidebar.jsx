import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';
import {
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiHeadphones,
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
  FiSun,
  FiMoon,
} from 'react-icons/fi';

// --- Styled Components for Visual Refinement ---
const SidebarContainer = styled.nav`
  height: 100vh;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-sizing: border-box;

  ${props =>
    props.isDark
      ? css`
          background: #1e1e2f;
          color: #c5c7cd;
          border-right: 1px solid #2c2c3e;
        `
      : css`
          background: #f4f6f8;
          color: #1e1e2f;
          border-right: 1px solid #dcdde1;
        `}
  
  width: ${props => (props.isCollapsed ? '72px' : '260px')};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => (props.isCollapsed ? 'center' : 'space-between')};
  margin-bottom: 2rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: inherit;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  user-select: none;
  outline: none;

  ${props =>
    props.isDark
      ? css`
          color: #c5c7cd;
          &:hover {
            background-color: #3137ff;
            color: #fff;
          }
          &.active {
            background-color: #3137ff;
            color: #fff;
            font-weight: 600;
            box-shadow: 0 0 0 3px rgba(49, 55, 255, 0.4);
          }
        `
      : css`
          color: #1e1e2f;
          &:hover {
            background-color: #d0d8ff;
            color: #000;
          }
          &.active {
            background-color: #d0d8ff;
            color: #000;
            font-weight: 600;
            box-shadow: 0 0 0 3px rgba(208, 216, 255, 0.4);
          }
        `}

  justify-content: ${props => (props.isCollapsed ? 'center' : 'flex-start')};
`;

const Icon = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
`;

const Footer = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  align-items: center;
  border-top: 1px solid ${props => (props.isDark ? '#2c2c3e' : '#dcdde1')};
`;

// --- Main Sidebar Component ---
const Sidebar = ({ user }) => {
  const userRole = user?.role?.toLowerCase() || '';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const allDepartments = [
    { name: 'Sales', path: '/sales', role: 'sales', icon: <FiDollarSign /> },
    { name: 'Finance', path: '/finance', role: 'finance', icon: <FiSettings /> },
    { name: 'HR', path: '/hr', role: 'hr', icon: <FiUsers /> },
    { name: 'Tech Support', path: '/techsupport', role: 'techsupport', icon: <FiHeadphones /> },
  ];

  const departmentsForUser =
    userRole === 'admin'
      ? allDepartments
      : allDepartments.filter((dept) => dept.role === userRole);

  return (
    <SidebarContainer isCollapsed={isCollapsed} isDark={isDarkMode} aria-label="Sidebar navigation">
      {/* Header */}
      <Header isCollapsed={isCollapsed}>
        <HeaderLeft>
          {!isCollapsed && <FiGrid size={24} />}
          {!isCollapsed && <Title>CRM</Title>}
        </HeaderLeft>
        <IconButton onClick={toggleCollapse} aria-label="Toggle sidebar">
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </IconButton>
      </Header>

      {/* Navigation Items */}
      {departmentsForUser.length === 0 ? (
        <p style={{ color: isDarkMode ? '#888' : '#aaa' }}>No departments available</p>
      ) : (
        <NavList>
          {departmentsForUser.map((dept, index) => (
            <li key={dept.name}>
              <StyledNavLink
                to={dept.path}
                isCollapsed={isCollapsed}
                isDark={isDarkMode}
                title={isCollapsed ? dept.name : ''}
              >
                <Icon>{dept.icon}</Icon>
                {!isCollapsed && dept.name}
              </StyledNavLink>
            </li>
          ))}
        </NavList>
      )}

      {/* Theme Switch */}
      <Footer isDark={isDarkMode}>
        <IconButton onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? <FiSun /> : <FiMoon />}
          {!isCollapsed && (
            <span style={{ marginLeft: '0.5rem' }}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </IconButton>
      </Footer>
    </SidebarContainer>
  );
};

export default Sidebar;
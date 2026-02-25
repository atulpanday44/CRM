import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import {
  FiHome,
  FiBarChart2,
  FiCheckSquare,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiClipboard,
  FiCheckCircle,
  FiSettings,
  FiUsers,
  FiTool,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS = [
  { to: '/home', label: 'Home', Icon: FiHome },
  { to: '/dashboard', label: 'Dashboard', Icon: FiBarChart2 },
  { to: '/tasks', label: 'Tasks', Icon: FiCheckSquare },
  { to: '/meetings', label: 'Meetings', Icon: FiCalendar },
  { to: '/sales', label: 'Sales', Icon: FiDollarSign, departmentRole: 'sales' },
  { to: '/apply-leave', label: 'Apply Leave', Icon: FiClipboard },
  { to: '/leaves', label: 'My Leave', Icon: FiFileText },
  { to: '/leave-management', label: 'Leave Management', Icon: FiCheckCircle, adminOrHr: true },
  { to: '/finance', label: 'Finance', Icon: FiDollarSign, departmentRole: 'finance' },
  { to: '/hr', label: 'HR', Icon: FiUsers, departmentRole: 'hr' },
  { to: '/techsupport', label: 'Tech Support', Icon: FiTool, departmentRole: 'tech_support' },
  { to: '/admin', label: 'Admin', Icon: FiSettings, adminOnly: true },
  { to: '/user-management', label: 'User Management', Icon: FiUser, adminOrHr: true },
];

// --- Animations for dropdown ---
const dropdownOpenAnim = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const dropdownCloseAnim = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

// --- Styled components ---

const Container = styled.div`
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: ${(props) => (props.darkMode ? '#121212' : '#f4f6f8')};
  color: ${(props) => (props.darkMode ? '#e0e0e0' : '#2c3e50')};
  transition: background-color 0.3s, color 0.3s;
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
  width: ${(props) => (props.open ? '220px' : '60px')};
  background: ${(props) => (props.darkMode ? '#1e293b' : '#0f172a')};
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
  transition: width 0.2s ease;
  z-index: 1000;
`;

const SidebarToggle = styled.button`
  margin: 0 auto 20px;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  outline-offset: 2px;
  outline-color: #4953ff;
  outline-style: solid;

  &:focus {
    outline-style: solid;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
`;

const SidebarChevron = ({ open }) => (open ? <FiChevronLeft size={22} /> : <FiChevronRight size={22} />);

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: ${(p) => (p.sidebarOpen ? '12px' : '0')};
  flex-shrink: 0;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-weight: 600;
  border-radius: 8px;
  margin: 0 10px 10px 10px;
  white-space: nowrap;
  text-decoration: none;
  color: ${(props) => (props.darkMode ? '#ccc' : '#eee')};
  justify-content: ${(props) => (props.sidebarOpen ? 'flex-start' : 'center')};
  transition: background-color 0.3s, color 0.3s;

  &.active {
    background-color: ${(props) => (props.darkMode ? '#4953ff' : '#3446d9')};
    color: #fff;
  }

  &:focus-visible {
    outline: 2px solid #4953ff;
    outline-offset: 2px;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  margin-left: ${(props) => (props.sidebarOpen ? '220px' : '60px')};
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
  min-width: 0;
`;

const Header = styled.header`
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 500;
  background-color: ${(props) => (props.darkMode ? '#1e1e1e' : '#fff')};
  color: ${(props) => (props.darkMode ? '#e0e0e0' : '#2c3e50')};
  box-shadow: ${(props) => (props.shadow ? '0 4px 10px rgba(0,0,0,0.1)' : 'none')};
  transition: box-shadow 0.3s, background-color 0.3s, color 0.3s;
`;

const LeftHeader = styled.div`
  display: flex;
  align-items: center;
`;

const DarkModeToggle = styled.button`
  background-color: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${(props) => (props.darkMode ? '#ffd700' : '#555')};
  transition: color 0.3s;
  outline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${(props) => (props.darkMode ? '#ffd700' : '#555')};
  }
`;

const RightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`;

const UserMenuButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  border-radius: 24px;
  padding: 2px 8px;
  outline-offset: 2px;

  &:focus-visible {
    outline: 2px solid #4953ff;
  }
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4953ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  user-select: none;
`;

const Username = styled.span`
  margin-left: 8px;
  font-weight: 600;
  white-space: nowrap;
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: 60px;
  background-color: ${(props) => (props.darkMode ? '#333' : '#fff')};
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  overflow: hidden;
  z-index: 10000;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  animation: ${(props) => (props.isClosing ? dropdownCloseAnim : dropdownOpenAnim)} 0.2s ease forwards;
`;

const DropdownItem = styled.button`
  background-color: transparent;
  border: none;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: ${(props) => (props.danger ? '#e74c3c' : props.darkMode ? '#ddd' : '#333')};
  outline: none;
  transition: background-color 0.2s;

  &:hover,
  &:focus-visible {
    background-color: ${(props) => (props.darkMode ? '#4953ff' : '#d2d8ff')};
    outline: none;
  }
`;


const Content = styled.main`
  flex-grow: 1;
  padding: var(--space-8);
  overflow-y: auto;
  min-height: 0;
  background: ${(props) => (props.darkMode ? '#0f172a' : 'var(--color-bg)')};
  color: ${(props) => (props.darkMode ? '#e2e8f0' : 'var(--color-text)')};
  transition: background 0.2s, color 0.2s;
`;

// --- Component ---

const Layout = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      return saved === null ? true : JSON.parse(saved);
    } catch {
      return true;
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved === null ? false : JSON.parse(saved);
    } catch {
      return false;
    }
  });

  const [headerShadow, setHeaderShadow] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownClosing, setDropdownClosing] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const role = (user?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isAdminOrHr = role === 'admin' || role === 'superadmin' || role === 'hr';

  const menuItems = MENU_ITEMS.filter((i) => {
    if (i.adminOnly && !isAdmin) return false;
    if (i.adminOrHr && !isAdminOrHr) return false;
    // Department-specific: only show if admin/superadmin or user's role matches
    if (i.departmentRole) {
      return isAdmin || role === i.departmentRole.toLowerCase();
    }
    return true;
  });

  // Persist sidebarOpen and darkMode to localStorage on change
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Header shadow on scroll
  useEffect(() => {
    const onScroll = () => setHeaderShadow(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click + keyboard handling
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Animate close first
        setDropdownClosing(true);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownClosing(true);
      } else if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        if (!dropdownRef.current) return;
        const focusableItems = dropdownRef.current.querySelectorAll('[role="menuitem"]');
        if (focusableItems.length === 0) return;

        let index = Array.from(focusableItems).indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          index = (index + 1) % focusableItems.length;
        } else {
          index = (index - 1 + focusableItems.length) % focusableItems.length;
        }
        focusableItems[index].focus();
      }
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // Handle dropdown close animation end
  const onDropdownAnimationEnd = () => {
    if (dropdownClosing) {
      setDropdownOpen(false);
      setDropdownClosing(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const toggleDarkMode = () => setDarkMode((v) => !v);
  const toggleDropdown = () => {
    if (dropdownOpen) {
      setDropdownClosing(true);
    } else {
      setDropdownOpen(true);
    }
  };

  return (
    <Container darkMode={darkMode}>
      <Sidebar open={sidebarOpen} darkMode={darkMode} aria-label="Sidebar navigation">
        <SidebarToggle
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-pressed={sidebarOpen}
          onClick={toggleSidebar}
        >
          <SidebarChevron open={sidebarOpen} />
        </SidebarToggle>
        <Nav aria-label="Main navigation">
          {menuItems.map(({ to, label, Icon }) => (
            <StyledNavLink
              key={to}
              to={to}
              end={to === '/home'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              darkMode={darkMode}
              sidebarOpen={sidebarOpen}
              tabIndex={sidebarOpen ? 0 : -1}
              title={sidebarOpen ? undefined : label}
            >
              <IconWrap sidebarOpen={sidebarOpen}>
                {Icon && <Icon size={20} strokeWidth={2} />}
              </IconWrap>
              {sidebarOpen && <span>{label}</span>}
            </StyledNavLink>
          ))}
        </Nav>
      </Sidebar>

      <MainContent sidebarOpen={sidebarOpen}>
        <Header darkMode={darkMode} shadow={headerShadow}>
          <LeftHeader>
            <DarkModeToggle
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              darkMode={darkMode}
              title="Toggle Dark Mode"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </DarkModeToggle>
          </LeftHeader>
          <RightHeader>
            <UserMenuButton
              id="user-dropdown"
              tabIndex={0}
              role="button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={toggleDropdown}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleDropdown()}
              ref={dropdownRef}
            >
              {user?.avatar ? (
                <Avatar src={user.avatar} alt={`${user.name} avatar`} />
              ) : (
                <AvatarPlaceholder>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarPlaceholder>
              )}
              {sidebarOpen && <Username>{user?.name || 'User'}</Username>}
            </UserMenuButton>

            {(dropdownOpen || dropdownClosing) && (
              <DropdownMenu
                role="menu"
                darkMode={darkMode}
                isClosing={dropdownClosing}
                onAnimationEnd={onDropdownAnimationEnd}
              >
                <DropdownItem
                  role="menuitem"
                  tabIndex={0}
                  darkMode={darkMode}
                  onClick={() => {
                    setDropdownClosing(true);
                    navigate('/home');
                  }}
                >
                  Profile
                </DropdownItem>
                <DropdownItem
                  role="menuitem"
                  tabIndex={0}
                  darkMode={darkMode}
                  onClick={() => {
                    setDropdownClosing(true);
                    navigate(user?.role === 'admin' || user?.role === 'superadmin' ? '/admin' : '/dashboard');
                  }}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  role="menuitem"
                  tabIndex={0}
                  darkMode={darkMode}
                  danger
                  onClick={() => {
                    setDropdownClosing(true);
                    logout();
                    navigate('/landingpage', { replace: true });
                  }}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            )}
          </RightHeader>
        </Header>

        <Content darkMode={darkMode}>
          <Outlet />
        </Content>
      </MainContent>
    </Container>
  );
};

export default Layout;

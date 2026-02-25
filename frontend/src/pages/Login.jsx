import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg);
`;

const Card = styled.form`
  width: 100%;
  max-width: 400px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
`;

const Title = styled.h1`
  margin: 0 0 var(--space-6);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  letter-spacing: -0.02em;
`;

const ErrorBanner = styled.p`
  margin: 0 0 var(--space-4);
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-error);
  background: var(--color-error-bg);
  border-radius: var(--radius-md);
`;

const FieldGroup = styled.div`
  margin-bottom: var(--space-5);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
  }
  &::placeholder {
    color: var(--color-text-subtle);
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.05s;
  &:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Card onSubmit={handleLogin}>
        <Title>Sign in</Title>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <FieldGroup>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </FieldGroup>
        <FieldGroup>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </FieldGroup>
        <SubmitBtn type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </SubmitBtn>
      </Card>
    </Wrapper>
  );
};

export default Login;

'use client';

import { useState } from 'react';
import { createRSVP } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { validateName, validateEmail } from '@/lib/validation';

interface RSVPFormProps {
  onSuccess: (token: string) => void;
}

export default function RSVPForm({ onSuccess }: RSVPFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      setNameError('');
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleNameBlur = () => {
    const validation = validateName(name);
    setNameError(validation.isValid ? '' : validation.error);
  };

  const handleEmailBlur = () => {
    const validation = validateEmail(email);
    setEmailError(validation.isValid ? '' : validation.error);
  };

  const performSubmit = async () => {
    setError('');
    
    if (!name.trim() || !email.trim()) {
      const nameValidation = validateName(name);
      const emailValidation = validateEmail(email);
      setNameError(nameValidation.isValid ? '' : nameValidation.error || 'Name is required');
      setEmailError(emailValidation.isValid ? '' : emailValidation.error || 'Email is required');
      return;
    }
    
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    
    setNameError(nameValidation.isValid ? '' : nameValidation.error);
    setEmailError(emailValidation.isValid ? '' : emailValidation.error);
    
    if (!nameValidation.isValid || !emailValidation.isValid) {
      return;
    }

    setLoading(true);

    try {
      const response = await createRSVP(nameValidation.sanitized, emailValidation.sanitized);
      localStorage.setItem(`rsvp_token_${response.rsvp.id}`, response.token);

      toast.success(`RSVP created successfully! Confirmation email sent to ${emailValidation.sanitized}`);

      setName('');
      setEmail('');
      setNameError('');
      setEmailError('');
      onSuccess(response.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create RSVP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (name.trim() && email.trim()) {
        performSubmit();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    performSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">RSVP to Event</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-900 font-medium mb-2">
          Name <span className="text-gray-500 text-sm">(max 100 characters)</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={handleKeyDown}
          maxLength={100}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            nameError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={loading}
        />
        {nameError && (
          <p className="mt-1 text-sm text-red-600">{nameError}</p>
        )}
        {name && !nameError && (
          <p className="mt-1 text-xs text-gray-500">{name.length}/100 characters</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-900 font-medium mb-2">
          Email <span className="text-gray-500 text-sm">(max 200 characters)</span>
        </label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          onKeyDown={handleKeyDown}
          maxLength={200}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            emailError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={loading}
        />
        {emailError && (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        )}
        {email && !emailError && (
          <p className="mt-1 text-xs text-gray-500">{email.length}/200 characters</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit RSVP'}
      </button>
    </form>
  );
}

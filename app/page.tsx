'use client';

import { useState } from 'react';
import RSVPForm from '@/components/RSVPForm';
import RSVPList from '@/components/RSVPList';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState('');

  const handleRSVPSuccess = () => {
    setRefreshTrigger(Date.now().toString());
  };

  const eventDate = new Date('2026-01-26');
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Event RSVP Manager
          </h1>
          <p className="text-gray-600 mb-4">
            Register for the event and view all attendees
          </p>

          {/* Event Date Display */}
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-lg px-6 py-3 mt-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <div className="text-left">
              <p className="text-xs text-blue-700 font-medium">Event Date</p>
              <p className="text-sm font-bold text-blue-900">{formattedDate}</p>
            </div>
          </div>
        </header>

        <RSVPForm onSuccess={handleRSVPSuccess} />
        <RSVPList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}

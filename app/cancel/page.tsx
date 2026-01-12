'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyRSVPToken, cancelRSVPByToken } from '@/lib/api';
import { RSVP } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';

function CancelPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<RSVP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('No cancellation token provided in the URL.');
      setLoading(false);
      return;
    }

    setToken(tokenParam);
    verifyToken(tokenParam);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await verifyRSVPToken(token);
      setRsvp(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify cancellation link');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!token) return;

    try {
      setCanceling(true);
      await cancelRSVPByToken(token);
      setCanceled(true);
      setShowConfirmModal(false);
      toast.success('RSVP cancelled successfully!');

      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setShowConfirmModal(false);
      const errorMsg = err instanceof Error ? err.message : 'Failed to cancel RSVP';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setCanceling(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your cancellation link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Invalid Link</h1>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">RSVP Cancelled</h1>
          <p className="text-gray-600 mb-6 text-center">
            Your RSVP has been successfully cancelled. We're sorry you can't make it!
          </p>
          <p className="text-sm text-gray-500 text-center mb-4">
            Redirecting to home page in 3 seconds...
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Cancel Your RSVP</h1>

          {rsvp && (
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="text-sm text-gray-600 mb-2">You are about to cancel the following RSVP:</p>
              <div className="mt-3">
                <p className="font-semibold text-gray-800">{rsvp.name}</p>
                <p className="text-gray-600 text-sm">{rsvp.email}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Registered: {new Date(rsvp.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">Event Date</p>
                <p className="text-sm text-blue-700">Monday, January 26, 2026</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-md hover:bg-gray-300 font-medium transition-colors"
            >
              Keep RSVP
            </button>
            <button
              onClick={handleCancelClick}
              className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-md hover:bg-red-700 font-medium transition-colors"
            >
              Cancel RSVP
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel your RSVP? This action cannot be undone and you will need to register again if you change your mind."
        confirmText="Yes, Cancel RSVP"
        cancelText="Keep RSVP"
        isLoading={canceling}
      />
    </>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CancelPageContent />
    </Suspense>
  );
}

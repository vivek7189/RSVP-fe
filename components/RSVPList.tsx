'use client';

import { useState, useEffect } from 'react';
import { getRSVPs, deleteRSVP } from '@/lib/api';
import { RSVP } from '@/types';
import ConfirmModal from './ConfirmModal';
import Pagination from './Pagination';
import { useToast } from '@/contexts/ToastContext';

export default function RSVPList({ refreshTrigger }: { refreshTrigger: string }) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const toast = useToast();

  useEffect(() => {
    loadRSVPs();
  }, [refreshTrigger, page]);

  const loadRSVPs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getRSVPs(page, limit);
      setRsvps(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load RSVPs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: number) => {
    const token = localStorage.getItem(`rsvp_token_${id}`);

    if (!token) {
      const errorMsg = 'You can only delete your own RSVP. Token not found.';
      setDeleteError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setPendingDeleteId(id);
    setShowConfirmModal(true);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;

    const token = localStorage.getItem(`rsvp_token_${pendingDeleteId}`);
    if (!token) {
      setShowConfirmModal(false);
      const errorMsg = 'Token not found. Unable to cancel RSVP.';
      setDeleteError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setDeletingId(pendingDeleteId);
      await deleteRSVP(pendingDeleteId, token);
      localStorage.removeItem(`rsvp_token_${pendingDeleteId}`);
      
      if (rsvps.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadRSVPs();
      }
      
      setShowConfirmModal(false);
      setPendingDeleteId(null);
      toast.success('RSVP cancelled successfully!');
    } catch (err) {
      setShowConfirmModal(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete RSVP';
      setDeleteError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setPendingDeleteId(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-600">Loading RSVPs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={loadRSVPs}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Event Attendees {pagination.total > 0 && `(${pagination.total})`}
        </h2>

        {deleteError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{deleteError}</span>
            <button
              onClick={() => setDeleteError('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}

        {rsvps.length === 0 ? (
          <p className="text-gray-600">No RSVPs yet. Be the first to register!</p>
        ) : (
          <div className="space-y-3">
            {rsvps.map((rsvp) => {
              const hasToken = !!localStorage.getItem(`rsvp_token_${rsvp.id}`);
              const isDeleting = deletingId === rsvp.id;

              return (
                <div
                  key={rsvp.id}
                  className="border border-gray-200 rounded-md p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{rsvp.name}</h3>
                    <p className="text-gray-600 text-sm">{rsvp.email}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Registered: {new Date(rsvp.created_at).toLocaleString()}
                    </p>
                  </div>

                  {hasToken && (
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => {
                          const token = localStorage.getItem(`rsvp_token_${rsvp.id}`);
                          if (token) {
                            const cancelLink = `${window.location.origin}/cancel?token=${token}`;
                            navigator.clipboard.writeText(cancelLink);
                            toast.success('Cancellation link copied to clipboard!');
                          }
                        }}
                        className="bg-blue-50 text-blue-600 py-1.5 px-2.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-medium border border-blue-200"
                        title="Copy cancellation link"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleDeleteClick(rsvp.id)}
                        disabled={isDeleting}
                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {isDeleting ? 'Canceling...' : 'Cancel RSVP'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Cancel RSVP"
        message="Are you sure you want to cancel your RSVP? This action cannot be undone."
        confirmText="Yes, Cancel RSVP"
        cancelText="Keep RSVP"
        isLoading={deletingId !== null}
      />
    </>
  );
}

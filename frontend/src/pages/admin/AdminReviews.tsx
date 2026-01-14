import { Dialog, Transition } from '@headlessui/react';
import { StarIcon } from '@heroicons/react/20/solid';
import { ArrowPathIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useProducts } from '../../context/ProductContext';
import api from '../../services/api';

export default function AdminReviews() {
    const { showNotification } = useNotification();
    const { products } = useProducts();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Reply Logic
    const [replyOpen, setReplyOpen] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Confirm Dialog State
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        action: () => Promise<void>;
    }>({ open: false, title: '', message: '', action: async () => { } });

    // Fetch Reviews
    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (filter !== 'all') params.status = filter;

            const res = await api.get('/reviews/', { params });
            // Handle standard pagination response
            if (res.data.results) {
                setReviews(res.data.results);
                setTotalCount(res.data.count);
                // Calculate total pages assuming default page size of 50 (standard from backend)
                // Or check if 'next' link exists to know if there are more
                setTotalPages(Math.ceil(res.data.count / 50));
            } else {
                // Fallback for non-paginated or simple list
                setReviews(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
            showNotification('Failed to load reviews', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [filter]);

    useEffect(() => {
        fetchReviews();
    }, [page, filter]);

    const promptConfirm = (title: string, message: string, action: () => Promise<void>) => {
        setConfirmModal({
            open: true,
            title,
            message,
            action: async () => {
                await action();
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    };

    // Actions
    const handleUpdateStatus = (id: string, status: string) => {
        promptConfirm(
            `Mark as ${status}?`,
            `Are you sure you want to mark this review as ${status}?`,
            async () => {
                try {
                    await api.patch(`/reviews/${id}/`, { status });
                    showNotification(`Review marked as ${status}`, 'success');
                    fetchReviews();
                } catch (e) {
                    console.error(e);
                    showNotification('Action failed', 'error');
                }
            }
        );
    };

    const handleDelete = (id: string) => {
        promptConfirm(
            'Delete Review',
            'Are you sure you want to permanently delete this review? This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/reviews/${id}/`);
                    showNotification('Review deleted successfully', 'success');
                    fetchReviews();
                } catch (e) {
                    console.error(e);
                    showNotification('Delete failed', 'error');
                }
            }
        );
    };

    const handleReplySubmit = async (id: string) => {
        try {
            await api.patch(`/reviews/${id}/`, {
                reply: replyText,
                replyDate: new Date().toISOString()
            });
            showNotification('Reply posted successfully', 'success');
            setReplyOpen(null);
            setReplyText('');
            fetchReviews();
        } catch (e) {
            console.error(e);
            showNotification('Failed to post reply', 'error');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Helper to get product details
    const getProduct = (id: number) => products.find(p => p.id === id);

    return (
        <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Customer Reviews</h1>
                        <button
                            onClick={fetchReviews}
                            disabled={loading}
                            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}
                            title="Refresh"
                        >
                            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Manage and moderate customer feedback.</p>
                </div>

                {/* Stats / Counts */}
                <div className="flex items-center gap-4 self-start sm:self-auto">
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center min-w-[90px]">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                        <span className="text-lg sm:text-xl font-bold text-gray-900">{totalCount}</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs - Scrollable on mobile */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto no-scrollbar">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap
                        ${filter === status
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="py-20 text-center animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
            )}

            {/* Reviews List */}
            {!loading && (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                <StarIcon className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="text-gray-900 font-medium">No reviews found</p>
                            <p className="text-sm text-gray-500">There are no reviews matching your filter.</p>
                        </div>
                    ) : (
                        reviews.map((review) => {
                            const product = getProduct(review.product);
                            const displayDate = formatDate(review.created_at);

                            return (
                                <div key={review.id} className={`group bg-white rounded-xl p-5 border transition-all duration-200 hover:shadow-lg
                            ${review.status === 'pending' ? 'border-yellow-200 shadow-sm ring-1 ring-yellow-50' : 'border-gray-100 shadow-sm'}
                        `}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                        {/* User & Rating */}
                                        <div className="w-full sm:w-1/4 min-w-[200px] flex sm:block items-center gap-4 sm:gap-0">
                                            <div className="flex items-center gap-3 mb-0 sm:mb-3">
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 uppercase text-lg">
                                                    {(review.user_name || review.userName || 'U').charAt(0)}
                                                </div>
                                                <div className="sm:hidden">
                                                    <h3 className="text-sm font-bold text-gray-900">{review.user_name || review.userName || 'Guest'}</h3>
                                                    <p className="text-xs text-gray-400">{displayDate}</p>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block">
                                                <h3 className="text-sm font-bold text-gray-900 truncate pr-2">{review.user_name || review.userName || 'Guest'}</h3>
                                                <p className="text-xs text-gray-400 mb-2">{displayDate}</p>
                                            </div>

                                            <div className="flex-1 sm:flex-initial flex flex-col items-end sm:items-start">
                                                <div className="flex text-yellow-400 mb-1">
                                                    {[0, 1, 2, 3, 4].map((rating) => (
                                                        <StarIcon
                                                            key={rating}
                                                            className={`h-4 w-4 flex-shrink-0 ${review.rating > rating ? 'fill-current' : 'text-gray-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                                {review.verified_purchase && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-bold uppercase border border-green-100 whitespace-nowrap">
                                                        <CheckCircleIcon className="h-3 w-3" /> Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 w-full">
                                            <div className="relative">
                                                <p className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-line">"{review.comment}"</p>

                                                {/* Images */}
                                                {review.images && review.images.length > 0 && (
                                                    <div className="flex gap-3 mb-4 overflow-x-auto py-1">
                                                        {review.images.map((img: string, i: number) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setLightboxImage(img)}
                                                                className="focus:outline-none flex-shrink-0"
                                                            >
                                                                <img src={img} alt="Review attachment" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-100 shadow-sm transition-transform hover:scale-105" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Admin Reply Section */}
                                            {review.reply && (
                                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100 mt-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded">ADMIN</span>
                                                        <span className="text-[10px] text-gray-400">Replying to feedback</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{review.reply}</p>
                                                </div>
                                            )}

                                            {product && (
                                                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50/50 p-2 rounded-lg w-fit">
                                                    <span className="text-gray-400">Product:</span>
                                                    <Link
                                                        to={`/products/${product.id}`}
                                                        target="_blank"
                                                        className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
                                                    >
                                                        {product.name} <span className="text-[10px]">↗</span>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 sm:min-w-[140px] w-full sm:w-auto">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border
                                        ${review.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    review.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {review.status}
                                            </span>

                                            {review.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                                                        className="p-1.5 sm:p-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                                        className="p-1.5 sm:p-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircleIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            )}

                                            {review.status === 'approved' && !review.reply && !replyOpen && (
                                                <button
                                                    onClick={() => setReplyOpen(review.id)}
                                                    className="px-3 py-1.5 rounded-md bg-black text-white font-bold text-xs hover:bg-gray-800 transition-colors shadow-sm ml-auto sm:ml-0"
                                                >
                                                    Reply
                                                </button>
                                            )}

                                            {review.status !== 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(review.id, 'pending')}
                                                    className="text-xs text-gray-400 hover:text-indigo-600 underline"
                                                >
                                                    Reset
                                                </button>
                                            )}

                                            <div className="sm:mt-auto sm:pt-4 ml-2 sm:ml-0">
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="text-gray-300 hover:text-red-600 transition-colors p-1"
                                                    title="Delete Permanently"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reply Input Area */}
                                    {replyOpen === review.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-xs font-bold text-gray-700 mb-2">Write a response to {review.user_name || review.userName}</label>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <textarea
                                                    className="flex-1 text-sm border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-black p-3"
                                                    rows={3}
                                                    placeholder="Thank you for your feedback..."
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                />
                                                <div className="flex flex-row sm:flex-col gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleReplySubmit(review.id)}
                                                        disabled={!replyText.trim()}
                                                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
                                                    >
                                                        Send
                                                    </button>
                                                    <button
                                                        onClick={() => { setReplyOpen(null); setReplyText(''); }}
                                                        className="text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8 rounded-b-xl shadow-sm">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                    {page}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirm Dialog */}
            <Transition appear show={confirmModal.open} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {confirmModal.title}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {confirmModal.message}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                            onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none"
                                            onClick={confirmModal.action}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Lightbox Modal */}
            <Transition show={!!lightboxImage} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setLightboxImage(null)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/90 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-transparent text-left shadow-xl transition-all w-full max-w-4xl">
                                    <div className="absolute right-0 top-0 pr-4 pt-4 z-10">
                                        <button
                                            type="button"
                                            className="rounded-md bg-black/50 text-white hover:text-gray-200 focus:outline-none"
                                            onClick={() => setLightboxImage(null)}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-8 w-8" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        {lightboxImage && (
                                            <img src={lightboxImage} alt="Full view" className="max-h-[85vh] w-auto object-contain rounded-md shadow-2xl" />
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}


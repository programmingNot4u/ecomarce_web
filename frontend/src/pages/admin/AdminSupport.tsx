import { Dialog, Transition } from '@headlessui/react';
import { ArrowPathIcon, ChatBubbleLeftRightIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useCallback, useEffect, useState } from 'react';
import api from '../../services/api';

// Define types locally if not exported or if specific to this view's needs
interface TicketReply {
    id: number;
    message: string;
    sender_name: string; // Serializer field
    sender: number | null;
    created_at: string;
}

interface SupportTicket {
    id: number;
    subject: string;
    message: string;
    status: string;
    priority: string;
    name: string;
    email: string;
    created_at: string;
    replies: TicketReply[];
}

export default function AdminSupport() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('all'); // Match model choices

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Reply Modal State
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (filter !== 'all') params.status = filter;

            const res = await api.get('/tickets/', { params });
            setTickets(res.data.results);
            setTotalCount(res.data.count);
            setTotalPages(Math.ceil(res.data.count / 20)); // Default page size
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        setPage(1);
    }, [filter]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Update selected ticket when tickets list updates (for real-time reply view)
    useEffect(() => {
        if (selectedTicket) {
            const updated = tickets.find(t => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    }, [tickets]);

    const handleSendReply = async () => {
        if (!selectedTicket || !replyMessage.trim()) return;
        try {
            await api.post('/ticket-replies/', {
                ticket: selectedTicket.id,
                message: replyMessage
            });
            setReplyMessage('');
            fetchTickets(); // This will trigger the effect above to update modal
        } catch (error) {
            console.error("Failed to send reply", error);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/tickets/${id}/`, { status });
            fetchTickets();
        } catch (e) {
            console.error("Failed to update status", e);
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        try {
            await api.delete(`/tickets/${id}/`);
            // Close modal if deleting the open ticket
            if (selectedTicket?.id === id) setSelectedTicket(null);
            fetchTickets();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Support Tickets</h1>
                        <button
                            onClick={() => fetchTickets()}
                            disabled={loading}
                            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}
                            title="Refresh"
                        >
                            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Respond to customer inquiries.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                    {(['all', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all border
                        ${filter === status
                                    ? 'bg-black text-white border-black shadow-md'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="py-20 text-center animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
            )}

            {!loading && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tickets.map((ticket) => (
                        <div key={ticket.id} className="group flex flex-col justify-between bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider
                                    ${ticket.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : ticket.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-green-50 text-green-700 border border-green-100'}
                                `}>
                                        {ticket.priority} Priority
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                                    ${ticket.status === 'Open' ? 'text-blue-600 bg-blue-50' : ticket.status === 'Closed' ? 'text-gray-500 bg-gray-100' : 'text-purple-600 bg-purple-50'}
                                `}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${ticket.status === 'Open' ? 'bg-blue-600' : ticket.status === 'Closed' ? 'bg-gray-500' : 'bg-purple-600'}`}></span>
                                        {ticket.status}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={ticket.subject}>{ticket.subject}</h3>
                                <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">{ticket.message}</p>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                                        {(ticket.name || 'U').charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-900">{ticket.name}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                                <button
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-500" />
                                    View Ticket
                                </button>
                                <button
                                    onClick={() => handleDelete(ticket.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {tickets.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No support tickets found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8 rounded-b-xl">
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
                                {/* Simple Page Info */}
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


            {/* Ticket Details Modal */}
            <Transition.Root show={!!selectedTicket} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setSelectedTicket(null)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                                    {selectedTicket && (
                                        <>
                                            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                                    onClick={() => setSelectedTicket(null)}
                                                >
                                                    <span className="sr-only">Close</span>
                                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                                                        {(selectedTicket.name || 'U').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                            {selectedTicket.subject}
                                                        </Dialog.Title>
                                                        <p className="text-xs text-gray-500">From: {selectedTicket.name} ({selectedTicket.email})</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-700">
                                                    {selectedTicket.message}
                                                </div>

                                                {/* Replies */}
                                                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar p-1">
                                                    {selectedTicket.replies?.map((reply) => (
                                                        <div key={reply.id} className={`flex flex-col ${reply.sender ? 'items-end' : 'items-start'}`}>
                                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${reply.sender ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                                                                {reply.message}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 mt-1">
                                                                {reply.sender_name || (reply.sender ? 'Admin' : 'User')} • {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Reply Input */}
                                                <div className="mt-4">
                                                    <label htmlFor="reply" className="sr-only">Reply</label>
                                                    <textarea
                                                        id="reply"
                                                        rows={3}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                                        placeholder="Type your reply here..."
                                                        value={replyMessage}
                                                        onChange={(e) => setReplyMessage(e.target.value)}
                                                    />
                                                    <div className="mt-2 flex justify-end gap-2">
                                                        {selectedTicket.status !== 'Closed' && (
                                                            <button
                                                                type="button"
                                                                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                                onClick={() => handleUpdateStatus(selectedTicket.id, 'Closed')}
                                                            >
                                                                Close Ticket
                                                            </button>
                                                        )}
                                                        {selectedTicket.status === 'Closed' && (
                                                            <button
                                                                type="button"
                                                                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                                onClick={() => handleUpdateStatus(selectedTicket.id, 'Open')}
                                                            >
                                                                Re-open Ticket
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="inline-flex justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                                            onClick={handleSendReply}
                                                        >
                                                            Send Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}


import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import api, { getMediaUrl } from '../../services/api';

export default function AdminQA() {
    const { products } = useProducts(); // Keep for product lookup
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Reply State
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (filter !== 'all') params.status = filter;
            if (searchTerm) params.search = searchTerm;

            const res = await api.get('/questions/', { params });
            setQuestions(res.data.results);
            setTotalCount(res.data.count);
            setTotalPages(Math.ceil(res.data.count / 20));
        } catch (error) {
            console.error("Failed to fetch questions", error);
        } finally {
            setLoading(false);
        }
    }, [page, filter, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [filter, searchTerm]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const getProductName = (id: number) => products.find(p => p.id === id)?.name || 'Unknown Product';
    const getProductImage = (id: number) => products.find(p => p.id === id)?.image || '';

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        try {
            // Check if endpoint is custom action or standard patch. 
            // QuestionViewSet has @action(detail=True) def answer...
            // It expects POST to /questions/{id}/answer/ with { answer: ... }
            await api.post(`/questions/${id}/answer/`, { answer: replyText });
            setReplyingTo(null);
            setReplyText('');
            fetchQuestions();
        } catch (error) {
            console.error("Failed to answer question", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;
        try {
            await api.delete(`/questions/${id}/`);
            fetchQuestions();
        } catch (error) {
            console.error("Failed to delete question", error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Q&A Management</h1>
                    <button
                        onClick={() => fetchQuestions()}
                        disabled={loading}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}
                        title="Refresh"
                    >
                        <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Unanswered
                    </button>
                    <button
                        onClick={() => setFilter('answered')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'answered' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Answered
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="py-20 text-center animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
            )}

            {/* Questions List */}
            {!loading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {questions.length > 0 ? (
                            questions.map((q) => (
                                <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-4">
                                        <img
                                            src={getMediaUrl(getProductImage(q.productId)) || undefined}
                                            alt=""
                                            className="h-16 w-16 object-cover rounded-md border border-gray-200 bg-gray-100"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-gray-900 line-clamp-1">{getProductName(q.productId)}</h3>
                                                        <Link to={`/products/${q.productId}`} target="_blank" className="text-indigo-600 hover:text-indigo-800 text-xm">
                                                            <span className="sr-only">View Product</span>
                                                            ↗
                                                        </Link>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Asked by <span className="font-medium text-gray-900">{q.userName || 'Guest'}</span> on {new Date(q.date || q.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${q.status === 'answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {q.status === 'answered' ? 'Answered' : 'Pending'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDelete(q.id)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-md mb-3 border border-gray-100">
                                                <p className="text-sm text-gray-800 font-medium">Q: {q.question}</p>
                                            </div>

                                            {q.answer ? (
                                                <div className="bg-green-50 p-3 rounded-md border border-green-100 ml-4 relative">
                                                    <div className="absolute top-3 left-0 w-4 h-px bg-green-200 -ml-4"></div>
                                                    <p className="text-sm text-green-900"><span className="font-bold">A:</span> {q.answer}</p>
                                                    <p className="text-[10px] text-green-700 mt-1 text-right">Answered on {new Date(q.answerDate!).toLocaleDateString()}</p>

                                                    {/* Edit Answer Button (Optional enhancement) */}
                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(q.id);
                                                            setReplyText(q.answer || '');
                                                        }}
                                                        className="text-[10px] text-green-600 underline absolute top-2 right-2 hover:text-green-800"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="ml-4 mt-2">
                                                    {replyingTo === q.id ? (
                                                        <div className="bg-white border border-gray-300 rounded-md p-3 shadow-sm animate-in fade-in zoom-in duration-200">
                                                            <textarea
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                className="w-full text-sm border-0 focus:ring-0 p-0 mb-2 resize-none"
                                                                placeholder="Type your answer here..."
                                                                rows={3}
                                                                autoFocus
                                                            />
                                                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
                                                                <button
                                                                    onClick={() => setReplyingTo(null)}
                                                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReply(q.id)}
                                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800"
                                                                >
                                                                    Post Answer
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo(q.id);
                                                                setReplyText('');
                                                            }}
                                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                                            </svg>
                                                            Reply
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Edit Mode for Answered Questions handled above */}
                                            {replyingTo === q.id && q.status === 'answered' && (
                                                <div className="mt-2 ml-4 bg-white border border-gray-300 rounded-md p-3 shadow-sm">
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        className="w-full text-sm border-0 focus:ring-0 p-0 mb-2 resize-none"
                                                        rows={3}
                                                    />
                                                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
                                                        <button
                                                            onClick={() => setReplyingTo(null)}
                                                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleReply(q.id)}
                                                            className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800"
                                                        >
                                                            Update Answer
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No questions found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
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
        </div>
    );
}

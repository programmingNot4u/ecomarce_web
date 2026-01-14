import { Dialog, Transition } from '@headlessui/react';
import { PaperAirplaneIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import { useProducts, type SupportTicket } from '../../context/ProductContext';

export default function UserSupport() {
  const { supportTickets, addSupportTicket, updateSupportTicket } = useProducts();
  const [filter, setFilter] = useState<'all' | 'Open' | 'Resolved' | 'Closed'>('all');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', priority: 'Medium' as 'Low' | 'Medium' | 'High' });

  // View/Reply Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Assuming current user is "Demo User" for now as we don't have full auth context in this file
  // In a real app, we filter by userId
  const userEmail = "demo@example.com";
  const myTickets = (supportTickets || []).filter(t => t.email === userEmail || t.name === "Demo User"); // Simplified filter
  const filteredTickets = myTickets.filter(t => filter === 'all' || t.status === filter);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    addSupportTicket({
      name: "Demo User",
      email: userEmail,
      userId: "user_123",
      subject: newTicket.subject,
      message: newTicket.message,
      priority: newTicket.priority
    });
    setIsCreateOpen(false);
    setNewTicket({ subject: '', message: '', priority: 'Medium' });
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    const newReply = {
      id: Date.now().toString(),
      sender: 'User' as const,
      message: replyMessage,
      date: new Date().toISOString()
    };

    const updatedReplies = [...(selectedTicket.replies || []), newReply];

    updateSupportTicket(selectedTicket.id, {
      replies: updatedReplies,
      status: 'Open' // Re-open if closed/resolved
    });

    setReplyMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight font-serif">My Tickets</h1>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-800 flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" /> New Ticket
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'Open', 'Resolved', 'Closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors whitespace-nowrap
                        ${filter === status
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' : ticket.status === 'Closed' ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'}
                             `}>
                  {ticket.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(ticket.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{ticket.subject}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{ticket.message}</p>
            </div>
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            No tickets found. Need help? Create a new ticket.
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Transition.Root show={isCreateOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsCreateOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    Create Support Ticket
                  </Dialog.Title>
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                      <input type="text" required className="w-full rounded-md border-gray-300 focus:border-black focus:ring-black"
                        value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                      <select className="w-full rounded-md border-gray-300 focus:border-black focus:ring-black"
                        value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                      <textarea required rows={4} className="w-full rounded-md border-gray-300 focus:border-black focus:ring-black"
                        value={newTicket.message} onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                      />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-black">Cancel</button>
                      <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-800">Submit Ticket</button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* View/Reply Ticket Modal */}
      <Transition.Root show={!!selectedTicket} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedTicket(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {selectedTicket && (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h3>
                          <p className="text-xs text-gray-500 mt-1">Ticket ID: #{selectedTicket.id.slice(-6)}</p>
                        </div>
                        <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-black">
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm text-gray-800 border border-gray-100">
                        <p className="font-bold mb-1 text-gray-900">Description:</p>
                        {selectedTicket.message}
                      </div>

                      {/* Chat History */}
                      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                        {selectedTicket.replies?.map((reply) => (
                          <div key={reply.id} className={`flex flex-col ${reply.sender === 'User' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
                                        ${reply.sender === 'User'
                                ? 'bg-black text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                              }`}>
                              {reply.message}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                              {reply.sender === 'User' ? 'You' : 'Support Team'} • {new Date(reply.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 items-center mt-4 pt-4 border-t border-gray-100">
                        <input
                          type="text"
                          className="flex-1 rounded-full border-gray-300 focus:border-black focus:ring-black text-sm py-2.5 px-4"
                          placeholder="Type a reply..."
                          value={replyMessage}
                          onChange={e => setReplyMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                        />
                        <button
                          onClick={handleSendReply}
                          disabled={!replyMessage.trim()}
                          className="bg-black text-white p-2.5 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                          <PaperAirplaneIcon className="h-5 w-5 -rotate-45 translate-x-[-1px] translate-y-[-1px]" />
                        </button>
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

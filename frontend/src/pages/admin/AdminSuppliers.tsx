import { Dialog, Transition } from '@headlessui/react';
import { EnvelopeIcon, PhoneIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import type { Supplier } from '../../context/ProductContext';
import { useProducts } from '../../context/ProductContext';

export default function AdminSuppliers() {
  const { suppliers, addSupplier, deleteSupplier, updateSupplier } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
      setEditingId(null);
      setFormData(initialForm);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
      setEditingId(supplier.id);
      setFormData({
          name: supplier.name,
          contactName: supplier.contactName,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address
      });
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingId) {
          updateSupplier(editingId, formData);
      } else {
          addSupplier({
              id: Date.now().toString(),
              ...formData
          });
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">Suppliers</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your vendor relationships and contact details.</p>
        </div>
        <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition-all"
        >
            <PlusIcon className="h-5 w-5" />
            Add Supplier
        </button>
      </div>

      {suppliers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No suppliers</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new supplier.</p>
              <div className="mt-6">
                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    New Supplier
                </button>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map(supplier => (
                  <div key={supplier.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                              <p className="text-sm text-gray-500 font-medium">{supplier.contactName}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenEdit(supplier)} className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold">Edit</button>
                              <button onClick={() => deleteSupplier(supplier.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                          </div>
                      </div>
                      
                      <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                              <a href={`mailto:${supplier.email}`} className="hover:text-black">{supplier.email || 'N/A'}</a>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                              <a href={`tel:${supplier.phone}`} className="hover:text-black">{supplier.phone || 'N/A'}</a>
                          </div>
                           <div className="pt-3 border-t border-gray-100 mt-3">
                              <p className="text-xs text-gray-500">{supplier.address}</p>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Add/Edit Modal */}
       <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 mb-6"
                  >
                    {editingId ? 'Edit Supplier' : 'Add New Supplier'}
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Company Name</label>
                          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                          <input type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Phone</label>
                              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm" />
                          </div>
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <textarea rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm" />
                      </div>

                      <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none"
                        >
                          {editingId ? 'Update Supplier' : 'Add Supplier'}
                        </button>
                      </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

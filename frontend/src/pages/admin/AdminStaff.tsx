import {
    ArrowUpTrayIcon,
    CheckCircleIcon,
    EllipsisVerticalIcon,
    EnvelopeIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    PencilSquareIcon,
    TrashIcon,
    UserPlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useAdmin, type Staff } from '../../context/AdminContext';
import api, { getMediaUrl } from '../../services/api';

export default function AdminStaff() {
    const { staff, addStaff, updateStaff, removeStaff, currentUser } = useAdmin();
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Support' as Staff['role'],
        status: 'Active' as Staff['status'],
        password: '',
        avatar: '',
    });
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('upload');
    const [isUploading, setIsUploading] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const openCreateModal = () => {
        setEditingStaff(null);
        setFormData({ name: '', email: '', role: 'Support', status: 'Active', password: '', avatar: '' });
        setImageMode('upload');
        setIsModalOpen(true);
    };

    const openEditModal = (person: Staff) => {
        setEditingStaff(person);
        setFormData({
            name: person.name,
            email: person.email,
            role: person.role,
            status: person.status,
            password: '',
            avatar: person.avatar && person.avatar.length > 2 ? person.avatar : ''
        });
        setImageMode(person.avatar && person.avatar.startsWith('http') ? 'url' : 'upload');
        setIsModalOpen(true);
    };

    const handleAction = (e: React.MouseEvent, action: string, person: Staff) => {
        e.stopPropagation();
        setActiveMenuId(null);

        if (action === 'remove') {
            if (person.id === currentUser?.id) {
                alert("You cannot remove yourself.");
                return;
            }
            if (window.confirm(`Are you sure you want to remove ${person.name}?`)) {
                removeStaff(person.id);
                showSuccess(`${person.name} removed successfully.`);
            }
        } else if (action === 'resend') {
            showSuccess(`Invite resent to ${person.email}`);
        } else if (action === 'edit') {
            openEditModal(person);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                const uploadData = new FormData();
                uploadData.append('file', file);
                const res = await api.post('/upload/', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setFormData(prev => ({ ...prev, avatar: res.data.url }));
            } catch (err) {
                console.error("Upload failed", err);
                alert("Failed to upload image");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingStaff) {
            // Update existing
            const updates: Partial<Staff> = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                avatar: formData.avatar || editingStaff.avatar // Keep old avatar if not changed/cleared, but logic above sets it 
            };
            if (formData.password) updates.password = formData.password;
            // Explicitly verify avatar update
            if (formData.avatar !== editingStaff.avatar && formData.avatar !== '') {
                updates.avatar = formData.avatar;
            }

            updateStaff(editingStaff.id, updates);
            showSuccess('Staff member updated successfully.');
        } else {
            // Create new
            addStaff({
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                password: formData.password || '123456',
                avatar: formData.avatar
            });
            showSuccess('User created successfully.');
        }
        setIsModalOpen(false);
    };

    const filteredStaff = staff.filter(person =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Manager': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Editor': return 'bg-green-100 text-green-700 border-green-200';
            case 'Support': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative min-h-screen">
            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-20 right-8 bg-black text-white px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircleIcon className="h-5 w-5 mr-3 text-emerald-400" />
                    <span className="font-medium text-sm">{successMessage}</span>
                </div>
            )}

            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Team Members</h1>
                    <p className="mt-2 text-sm text-gray-500">Manage your team's access and roles.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="block rounded-lg bg-black px-4 py-2.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all"
                    >
                        <span className="flex items-center gap-2">
                            <UserPlusIcon className="h-4 w-4" />
                            Add Member
                        </span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search team members..."
                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredStaff.map((person) => (
                    <div key={person.id} className="relative group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center">
                        {/* Menu Button */}
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === person.id ? null : person.id); }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <EllipsisVerticalIcon className="h-5 w-5" />
                            </button>
                            {/* Dropdown Menu */}
                            {activeMenuId === person.id && (
                                <div className="absolute right-0 top-8 z-50 mt-1 w-48 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 text-left">
                                    <div className="p-1">
                                        <button
                                            onClick={(e) => handleAction(e, 'edit', person)}
                                            className="group flex w-full items-center rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        >
                                            <PencilSquareIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-900" aria-hidden="true" />
                                            Edit info
                                        </button>
                                        {person.status === 'Pending' && (
                                            <button
                                                onClick={(e) => handleAction(e, 'resend', person)}
                                                className="group flex w-full items-center rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                            >
                                                <PaperAirplaneIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" aria-hidden="true" />
                                                Resend Invite
                                            </button>
                                        )}
                                        <div className="h-px bg-gray-100 my-1"></div>
                                        <button
                                            onClick={(e) => handleAction(e, 'remove', person)}
                                            disabled={person.id === currentUser?.id}
                                            className={`group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors ${person.id === currentUser?.id
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                                                }`}
                                        >
                                            <TrashIcon className={`mr-3 h-4 w-4 ${person.id === currentUser?.id ? 'text-gray-300' : 'text-rose-400 group-hover:text-rose-600'}`} aria-hidden="true" />
                                            Remove Staff
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className="h-24 w-24 rounded-full bg-gray-100 ring-4 ring-white shadow-sm flex items-center justify-center overflow-hidden mb-4 relative z-0">
                            {person.avatar && person.avatar.length > 2 ? (
                                <img src={getMediaUrl(person.avatar)} alt={person.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-gray-400 select-none">{person.avatar || person.name.charAt(0)}</span>
                            )}
                        </div>

                        {/* Details */}
                        <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 mb-4">
                            <EnvelopeIcon className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[200px]">{person.email}</span>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-auto">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${getRoleBadge(person.role)}`}>
                                {person.role}
                            </span>
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${person.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                {person.status}
                            </span>
                        </div>

                        <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 w-full">
                            Last active: {person.lastActive}
                        </div>
                    </div>
                ))}
            </div>

            {filteredStaff.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                    <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No team members found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">{editingStaff ? 'Edit Profile' : 'Create New User'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2.5 px-3 border transition-colors hover:border-gray-400"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2.5 px-3 border transition-colors hover:border-gray-400"
                                        placeholder="jane@company.com"
                                    />
                                </div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Staff['role'] })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2.5 px-3 border transition-colors hover:border-gray-400"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Editor">Editor</option>
                                    <option value="Support">Support</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Staff['status'] })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2.5 px-3 border transition-colors hover:border-gray-400"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingStaff ? "Unchanged" : "Secret123"}
                                    required={!editingStaff}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2.5 px-3 border transition-colors hover:border-gray-400"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('upload')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${imageMode === 'upload' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('url')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${imageMode === 'url' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            URL
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="h-16 w-16 flex-shrink-0 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {formData.avatar ? (
                                            <img src={getMediaUrl(formData.avatar)} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-gray-300">{formData.name ? formData.name.charAt(0) : '?'}</span>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        {imageMode === 'upload' ? (
                                            <label className={`flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {isUploading ? (
                                                        <span className="text-xs text-gray-500">Uploading...</span>
                                                    ) : (
                                                        <>
                                                            <ArrowUpTrayIcon className="w-5 h-5 mb-1 text-gray-400" />
                                                            <p className="text-xs text-gray-500">Click to upload</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                                            </label>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <LinkIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="url"
                                                    value={formData.avatar}
                                                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2 border"
                                                    placeholder="https://example.com/avatar.png"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300">Cancel</button>
                                <button type="submit" disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md shadow-sm disabled:bg-gray-400">
                                    {editingStaff ? 'Save Changes' : 'Create Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}

import { Switch } from '@headlessui/react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    FolderIcon,
    FolderPlusIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useProducts, type Category, type Product } from '../../context/ProductContext';

function CategoryItem({ category, onSelect, selectedId, onDelete, level = 0, products }: {
    category: Category,
    onSelect: (cat: Category) => void,
    selectedId: string | null,
    onDelete: (id: string) => void,
    level?: number,
    products: Product[]
}) {
    const [expanded, setExpanded] = useState(false);
    const hasSubs = category.subCategories && category.subCategories.length > 0;

    // Use pre-calculated recursive count from context
    const productCount = category.count;

    return (
        <div className="select-none">
            <div
                className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md ${selectedId === category.id ? 'bg-indigo-50 border border-indigo-100' : ''}`}
                style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
                onClick={() => onSelect(category)}
            >
                <div className="flex items-center gap-2">
                    {hasSubs ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                            className="p-0.5 hover:bg-gray-200 rounded"
                        >
                            {expanded ? (
                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    ) : (
                        <span className="w-5" /> // Spacer
                    )}
                    <FolderIcon className={`h-5 w-5 ${selectedId === category.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${selectedId === category.id ? 'font-medium text-indigo-900' : 'text-gray-700'}`}>
                        {category.name}
                    </span>
                    {category.showInMenu && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 ml-2">
                            Nav
                        </span>
                    )}
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded-full ml-auto">{productCount}</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete category?')) onDelete(category.id); }}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>

            {expanded && hasSubs && (
                <div>
                    {category.subCategories!.map(sub => (
                        <CategoryItem
                            key={sub.id}
                            category={sub}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            onDelete={onDelete}
                            level={level + 1}
                            products={products}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminCategories() {
    const { showNotification } = useNotification();
    const { categories, addCategory, deleteCategory, updateCategory, products } = useProducts();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [parentCatId, setParentCatId] = useState<string>('');

    // Edit State
    const [editName, setEditName] = useState('');
    const [showInMenu, setShowInMenu] = useState(false);
    const [image, setImage] = useState(''); // Preview only
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null); // File to upload
    const [imageUrl, setImageUrl] = useState(''); // URL input
    const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload'); // Toggle mode
    const [error, setError] = useState('');

    // Helper to find category by ID from recursive tree
    const findCategoryById = (cats: Category[], id: string): Category | null => {
        for (const cat of cats) {
            if (cat.id === id) return cat;
            if (cat.subCategories) {
                const found = findCategoryById(cat.subCategories, id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedCategory = selectedCategoryId ? findCategoryById(categories, selectedCategoryId) : null;

    // Sync edit state when selection changes or context updates
    useEffect(() => {
        if (selectedCategory) {
            setEditName(selectedCategory.name);
            setShowInMenu(!!selectedCategory.showInMenu);
            setImage(selectedCategory.image || ''); // Sync image
            setError('');
        } else if (isAdding) {
            setShowInMenu(false); // Default false for new, or could be true
            setImage(''); // Reset image
            setImageFile(null);
        }
    }, [selectedCategory, isAdding]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUrlSet = () => {
        if (imageUrl.trim()) {
            setImage(imageUrl.trim());
            // Clear file if switching to URL
            setImageFile(null);
        }
    };

    const findParent = (cats: Category[], childId: string): Category | null => {
        for (const cat of cats) {
            if (cat.subCategories?.some(c => c.id === childId)) return cat;
            if (cat.subCategories) {
                const found = findParent(cat.subCategories, childId);
                if (found) return found;
            }
        }
        return null;
    };

    const checkDuplicate = (name: string, parentId?: string, excludeId?: string): boolean => {
        let siblings: Category[] = categories; // Default to root

        if (parentId) {
            // Find the parent node to look at its children
            const findNode = (cats: Category[]): Category | null => {
                for (const cat of cats) {
                    if (cat.id === parentId) return cat;
                    if (cat.subCategories) {
                        const found = findNode(cat.subCategories);
                        if (found) return found;
                    }
                }
                return null;
            };
            const parent = findNode(categories);
            if (parent && parent.subCategories) {
                siblings = parent.subCategories;
            } else if (parent) {
                siblings = []; // Parent found but no subs yet
            }
        } else if (!isAdding && selectedCategoryId) {
            // For editing root items, we need to be carefully checking root
            // But if we are editing a sub-item, we need its parent.
            const parent = findParent(categories, selectedCategoryId);
            if (parent) {
                siblings = parent.subCategories || [];
            }
        }

        return siblings.some(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId);
    };

    const handleAdd = async () => {
        setError('');
        if (!newCatName.trim()) {
            setError('Category name is required.');
            return;
        }

        if (checkDuplicate(newCatName.trim(), parentCatId)) {
            setError('A category with this name already exists in this level.');
            return;
        }

        const formData = new FormData();
        formData.append('name', newCatName.trim());
        formData.append('showInMenu', showInMenu ? 'True' : 'False'); // Use aliased key
        if (parentCatId) {
            formData.append('parent', parentCatId);
        }

        // Handle image - either file or URL
        if (imageFile) {
            formData.append('image', imageFile);
        } else if (image) {
            // If image is set via URL
            formData.append('image', image);
        }

        // Context handles API call
        // We pass formData, context detects it
        // Cast explicitly if TS complains or context signature updated
        try {
            await addCategory(formData);
            setNewCatName('');
            setImage('');
            setImageFile(null);
            setIsAdding(false);
            showNotification('Category created successfully.', 'success');
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Failed to create category.');
        }
    };

    const handleUpdate = async () => {
        if (!selectedCategory || !editName.trim()) return;

        // Find parent to check siblings
        const parent = findParent(categories, selectedCategory.id);
        // If parent exists, use its ID. If not, it's root (parentId undefined).
        if (checkDuplicate(editName.trim(), parent?.id, selectedCategory.id)) {
            setError('A category with this name already exists in this level.');
            return;
        }

        const formData = new FormData();
        formData.append('name', editName.trim());
        formData.append('showInMenu', showInMenu ? 'True' : 'False');

        // Handle image - either file or URL
        if (imageFile) {
            formData.append('image', imageFile);
        } else if (image && !selectedCategory?.image || (image && image !== selectedCategory?.image)) {
            // If image changed via URL
            formData.append('image', image);
        }

        try {
            setIsSaving(true);
            await updateCategory(selectedCategory.id, formData);
            setError('');
            showNotification('Category updated successfully!', 'success');
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Failed to update category.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500">Manage your product categories and hierarchy.</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setSelectedCategoryId(null); setError(''); }}
                    className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 w-full sm:w-auto justification-center"
                >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Add Category
                </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-4 md:p-6 gap-4 md:gap-6 overflow-y-auto md:overflow-hidden">
                {/* Tree View */}
                <div className="w-full md:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto p-4 shrink-0 h-[300px] md:h-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category Tree</h3>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">"Nav" = In Menu</span>
                    </div>
                    <div className="space-y-1">
                        {categories.map(cat => (
                            <CategoryItem
                                key={cat.id}
                                category={cat}
                                onSelect={(c) => { setSelectedCategoryId(c.id); setIsAdding(false); setError(''); }}
                                selectedId={selectedCategoryId}
                                onDelete={deleteCategory}
                                products={products}
                            />
                        ))}
                        {categories.length === 0 && (
                            <p className="text-sm text-gray-400 italic text-center py-4">No categories found.</p>
                        )}
                    </div>
                </div>

                {/* Edit/Details Context */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto md:overflow-y-auto w-full">
                    {(isAdding || selectedCategory) ? (
                        <div className="max-w-md">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">
                                {isAdding ? 'Create New Category' : `Edit Category`}
                            </h2>

                            {error && (
                                <div className="mb-4 bg-red-50 p-3 rounded-md text-sm text-red-600 border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={isAdding ? newCatName : editName}
                                        onChange={(e) => isAdding ? setNewCatName(e.target.value) : setEditName(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        placeholder="e.g. Summer Collection"
                                    />
                                </div>

                                {/* Image Upload/URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>

                                    {/* Mode Toggle */}
                                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-max mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('upload')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${imageMode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            Upload File
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('url')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${imageMode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            Enter URL
                                        </button>
                                    </div>

                                    {/* Preview */}
                                    {image && (
                                        <div className="mb-3 flex items-center gap-3">
                                            <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded-md border-2 border-gray-200 shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={() => { setImage(''); setImageFile(null); setImageUrl(''); }}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}

                                    {/* Upload Mode */}
                                    {imageMode === 'upload' ? (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        />
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleImageUrlSet()}
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleImageUrlSet}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700"
                                            >
                                                Set
                                            </button>
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500">
                                        {imageMode === 'upload' ? 'Upload a JPG, PNG, or WEBP image.' : 'Enter a direct URL to an image.'}
                                    </p>
                                </div>

                                {/* Parent Selector (Only on Create for simplicity, moving strictly requires complex tree logic) */}
                                {isAdding && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Parent Category</label>
                                        <select
                                            value={parentCatId}
                                            onChange={(e) => setParentCatId(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        >
                                            <option value="">None (Top Level)</option>
                                            {(() => {
                                                const renderOptions = (cats: Category[], level = 0): React.ReactNode[] => {
                                                    return cats.flatMap(c => [
                                                        <option key={c.id} value={c.id}>
                                                            {'\u00A0'.repeat(level * 4)}{c.name}
                                                        </option>,
                                                        ...(c.subCategories ? renderOptions(c.subCategories, level + 1) : [])
                                                    ]);
                                                };
                                                return renderOptions(categories);
                                            })()}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">Select a parent to make this a sub-category.</p>
                                    </div>
                                )}

                                {/* Show in Menu Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">Show in Navbar</span>
                                        <span className="text-sm text-gray-500">If enabled, this category will appear in the top menu.</span>
                                    </span>
                                    <Switch
                                        checked={showInMenu}
                                        onChange={setShowInMenu}
                                        className={`${showInMenu ? 'bg-indigo-600' : 'bg-gray-200'
                                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`${showInMenu ? 'translate-x-5' : 'translate-x-0'
                                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </Switch>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                    {isAdding ? (
                                        <>
                                            <button
                                                onClick={() => setIsAdding(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAdd}
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Create Category
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleUpdate}
                                            disabled={(editName === selectedCategory?.name && showInMenu === selectedCategory?.showInMenu && image === (selectedCategory?.image || '')) || isSaving}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                                        >
                                            {isSaving ? (
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
                            <FolderPlusIcon className="h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No Category Selected</h3>
                            <p className="mt-1">Select a category to view details or create a new one.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

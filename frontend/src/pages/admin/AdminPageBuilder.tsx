import {
    ArrowsUpDownIcon,
    Bars3BottomLeftIcon,
    CheckCircleIcon,
    CodeBracketIcon,
    H1Icon,
    PhotoIcon,
    TrashIcon,
    ViewColumnsIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

// --- Types ---
export type BlockType = 'header' | 'text' | 'image' | 'split' | 'raw';

export interface Block {
    id: string;
    type: BlockType;
    data: any;
}

// --- Block Definitions ---

const DEFAULT_BLOCKS: Record<BlockType, any> = {
    header: { text: 'New Heading', level: 'h2', align: 'center' },
    text: { content: 'Start typing your content here...' },
    image: { url: '', caption: '', alt: '' },
    split: { 
        image: '', 
        title: 'Split Section', 
        text: 'Description goes here.', 
        reverse: false 
    },
    raw: { html: '' }
};

interface AdminPageBuilderProps {
    initialContent: string;
    onSave: (html: string) => void;
}

export default function AdminPageBuilder({ initialContent, onSave }: AdminPageBuilderProps) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [previewMode, setPreviewMode] = useState(false); // Toggle between Edit and Preview (rendered HTML)

    // Parse Initial Content on Mount
    useEffect(() => {
        if (!initialContent) {
            setBlocks([]);
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(initialContent, 'text/html');
        // We assume blocks are Top-Level Elements in the <body>
        // But parseFromString puts them in body.
        
        const newBlocks: Block[] = [];
        const children =  Array.from(doc.body.children);

        if (children.length === 0 && initialContent.trim()) {
             // Maybe text node only?
             newBlocks.push({ id: Date.now().toString(), type: 'raw', data: { html: initialContent } });
        } else {
            children.forEach(el => {
                if (el instanceof HTMLElement) {
                    const type = el.dataset.blockType as BlockType;
                    if (type) {
                        // Structured Block
                        let data: any = {};
                        
                        if (type === 'header') {
                            const h = el.querySelector('h1, h2, h3, h4, h5, h6');
                            data.text = h?.textContent || '';
                            data.level = h?.tagName.toLowerCase() || 'h2';
                            data.align = el.dataset.align || 'left';
                        }
                        else if (type === 'text') {
                             data.content = el.innerHTML; // Inner content of the wrapper
                        }
                        else if (type === 'image') {
                            const img = el.querySelector('img');
                            data.url = img?.src || '';
                            data.alt = img?.alt || '';
                            data.caption = el.querySelector('figcaption')?.textContent || '';
                        }
                        else if (type === 'split') {
                            const img = el.querySelector('img');
                            const h = el.querySelector('h3');
                            const p = el.querySelector('p');
                            data.image = img?.src || '';
                            data.title = h?.textContent || '';
                            data.text = p?.innerHTML || '';
                            data.reverse = el.classList.contains('flex-row-reverse');
                        }
                        else {
                            // Raw fallback
                             newBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'raw', data: { html: el.outerHTML } });
                             return;
                        }

                        newBlocks.push({ id: Math.random().toString(36).substr(2, 9), type, data });
                    } else {
                        // Unknown Element -> Raw Block
                        newBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'raw', data: { html: el.outerHTML } });
                    }
                } else {
                     // Text Node or Comment -> Raw
                     newBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'raw', data: { html: el.textContent || '' } });
                }
            });
        }
        
        // If no blocks found but content exists (and not children), handle it?
        // Done above with children.length check.

        setBlocks(newBlocks);
    }, [initialContent]);

    // --- Actions ---

    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: Date.now().toString(),
            type,
            data: { ...DEFAULT_BLOCKS[type] }
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, data: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...data } } : b));
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newBlocks = [...blocks];
            [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
            setBlocks(newBlocks);
        } else if (direction === 'down' && index < blocks.length - 1) {
            const newBlocks = [...blocks];
            [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
            setBlocks(newBlocks);
        }
    };

    const handleSave = () => {
        // Serialize
        const html = blocks.map(b => {
            switch (b.type) {
                case 'header':
                    return `
                        <div data-block-type="header" data-align="${b.data.align}" class="max-w-4xl mx-auto py-8 text-${b.data.align}">
                            <${b.data.level} class="text-3xl font-serif font-bold text-gray-900">${b.data.text}</${b.data.level}>
                        </div>`;
                case 'text':
                    return `
                        <div data-block-type="text" class="max-w-4xl mx-auto py-4 prose prose-lg text-gray-600">
                            ${b.data.content}
                        </div>`;
                case 'image':
                    return `
                        <figure data-block-type="image" class="max-w-5xl mx-auto py-8">
                            <img src="${b.data.url}" alt="${b.data.alt}" class="w-full h-auto rounded-xl shadow-sm" />
                            ${b.data.caption ? `<figcaption class="mt-2 text-center text-sm text-gray-500">${b.data.caption}</figcaption>` : ''}
                        </figure>`;
                case 'split':
                    return `
                        <div data-block-type="split" class="max-w-6xl mx-auto py-12 flex flex-col md:flex-row gap-12 items-center ${b.data.reverse ? 'flex-row-reverse' : ''}">
                            <div class="flex-1 w-full">
                                <img src="${b.data.image}" class="w-full h-80 object-cover rounded-xl shadow-md" alt="${b.data.title}" />
                            </div>
                            <div class="flex-1 w-full space-y-4 text-center md:text-left">
                                <h3 class="text-2xl font-bold font-serif text-gray-900">${b.data.title}</h3>
                                <div class="text-gray-600 leading-relaxed">${b.data.text}</div>
                            </div>
                        </div>`;
                case 'raw':
                    return b.data.html;
                default:
                    return '';
            }
        }).join('\n');
        
        onSave(html);
    };

    // --- Renderers ---

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-10">
                <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    <span className="text-xs font-bold uppercase text-gray-400 mr-2">Add Block:</span>
                    <button onClick={() => addBlock('header')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-black hover:text-black text-gray-600 text-xs font-bold transition-all whitespace-nowrap">
                        <H1Icon className="h-4 w-4" /> Header
                    </button>
                    <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-black hover:text-black text-gray-600 text-xs font-bold transition-all whitespace-nowrap">
                        <Bars3BottomLeftIcon className="h-4 w-4" /> Text
                    </button>
                    <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-black hover:text-black text-gray-600 text-xs font-bold transition-all whitespace-nowrap">
                        <PhotoIcon className="h-4 w-4" /> Image
                    </button>
                     <button onClick={() => addBlock('split')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-black hover:text-black text-gray-600 text-xs font-bold transition-all whitespace-nowrap">
                        <ViewColumnsIcon className="h-4 w-4" /> Split
                    </button>
                    <button onClick={() => addBlock('raw')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-black hover:text-black text-gray-600 text-xs font-bold transition-all whitespace-nowrap">
                        <CodeBracketIcon className="h-4 w-4" /> HTML
                    </button>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                     <button 
                        onClick={() => setPreviewMode(!previewMode)} 
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${previewMode ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {previewMode ? 'Edit Mode' : 'Preview'}
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg text-xs font-bold shadow-lg hover:bg-gray-800 transition-all"
                    >
                        <CheckCircleIcon className="h-4 w-4" /> Save Page
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                {previewMode ? (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-8">
                         {/* Render Preview using the serialize logic internally or just dangerouslyHTML the blocks */}
                         <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                             __html: blocks.map(b => {
                                 // Lightweight render for preview (reusing save logic logic largely)
                                 // In a real app, I'd abstract the render logic.
                                 // For now, I'll just use the same logic as Save but without data attributes for cleaner preview if needed,
                                 // but keeping them is fine.
                                 switch (b.type) {
                                    case 'header': 
                                        return `<div class="text-${b.data.align} mb-4"><${b.data.level} class="text-3xl font-serif font-bold text-gray-900">${b.data.text}</${b.data.level}></div>`;
                                    case 'text':
                                        return `<div class="prose prose-lg text-gray-600 mb-6">${b.data.content}</div>`;
                                    case 'image':
                                        return `<figure class="mb-8"><img src="${b.data.url}" class="w-full rounded-xl" /><figcaption class="text-center text-sm text-gray-500 mt-2">${b.data.caption}</figcaption></figure>`;
                                    case 'split':
                                        return `<div class="flex flex-col md:flex-row gap-8 items-center mb-12 ${b.data.reverse ? 'flex-row-reverse' : ''}"><div class="flex-1"><img src="${b.data.image}" class="rounded-xl shadow-md w-full h-64 object-cover" /></div><div class="flex-1 text-center md:text-left"><h3 class="text-2xl font-bold font-serif mb-2">${b.data.title}</h3><div class="text-gray-600">${b.data.text}</div></div></div>`;
                                    case 'raw': return b.data.html;
                                    default: return '';
                                 }
                             }).join('') 
                         }} />
                     </div>
                ) : (
                    blocks.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                            <p className="text-gray-400 font-bold mb-2">Page is empty</p>
                            <p className="text-xs text-gray-400">Add a block from the toolbar above to get started.</p>
                        </div>
                    ) : (
                        blocks.map((block, index) => (
                            <div key={block.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative">
                                {/* Block Controls */}
                                <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-100 rounded-lg p-1 z-10">
                                    <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-black disabled:opacity-30"><ArrowsUpDownIcon className="h-4 w-4" /></button>
                                    <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-black disabled:opacity-30"><ArrowsUpDownIcon className="h-4 w-4 rotate-180" /></button>
                                    <div className="w-px bg-gray-200 mx-1"></div>
                                    <button onClick={() => removeBlock(block.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                                </div>

                                <div className="p-6">
                                    {/* Header Label */}
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            {block.type} Block
                                        </span>
                                    </div>

                                    {/* Block Content Forms */}
                                    {block.type === 'header' && (
                                        <div className="space-y-4">
                                            <input 
                                                type="text" 
                                                value={block.data.text} 
                                                onChange={(e) => updateBlock(block.id, { text: e.target.value })} 
                                                className="w-full text-2xl font-bold border-0 border-b border-gray-200 focus:border-black focus:ring-0 px-0 pb-2 bg-transparent placeholder-gray-300" 
                                                placeholder="Heading Title"
                                            />
                                            <div className="flex gap-4">
                                                <select 
                                                    value={block.data.level} 
                                                    onChange={(e) => updateBlock(block.id, { level: e.target.value })}
                                                    className="bg-gray-50 border-gray-200 rounded-lg text-xs font-bold focus:ring-black focus:border-black"
                                                >
                                                    <option value="h1">H1 (Title)</option>
                                                    <option value="h2">H2 (Section)</option>
                                                    <option value="h3">H3 (Subsection)</option>
                                                </select>
                                                 <select 
                                                    value={block.data.align} 
                                                    onChange={(e) => updateBlock(block.id, { align: e.target.value })}
                                                    className="bg-gray-50 border-gray-200 rounded-lg text-xs font-bold focus:ring-black focus:border-black"
                                                >
                                                    <option value="left">Left Align</option>
                                                    <option value="center">Center Align</option>
                                                    <option value="right">Right Align</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'text' && (
                                        <textarea 
                                            value={block.data.content} // Note: This handles raw innerHTML for now which is risky if user types HTML manually? No, text area writes text. 
                                            // Ideally use a rich text editor. For now just standard textarea that accepts some HTML tags if user knows them, or just plain text.
                                            // The serialization puts it in a div. 
                                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                            className="w-full min-h-[150px] p-4 bg-gray-50 rounded-lg border-gray-200 text-sm leading-relaxed focus:border-black focus:ring-black"
                                            placeholder="Write your content paragraph here..."
                                        />
                                    )}

                                    {block.type === 'image' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Image URL</label>
                                                    <input 
                                                        type="text" 
                                                        value={block.data.url} 
                                                        onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                                        className="w-full rounded-lg border-gray-200 text-sm"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                 <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Caption</label>
                                                    <input 
                                                        type="text" 
                                                        value={block.data.caption} 
                                                        onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                                        className="w-full rounded-lg border-gray-200 text-sm"
                                                        placeholder="Optional caption"
                                                    />
                                                </div>
                                            </div>
                                            <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[150px] overflow-hidden">
                                                {block.data.url ? (
                                                    <img src={block.data.url} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <PhotoIcon className="h-10 w-10 text-gray-300" />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'split' && (
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            <div className="md:col-span-4 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Image URL</label>
                                                    <input type="text" value={block.data.image} onChange={(e) => updateBlock(block.id, { image: e.target.value })} className="w-full rounded-lg border-gray-200 text-sm" />
                                                </div>
                                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                     {block.data.image && <img src={block.data.image} className="w-full h-full object-cover" />}
                                                </div>
                                                 <div className="flex items-center gap-2">
                                                    <input type="checkbox" checked={block.data.reverse} onChange={(e) => updateBlock(block.id, { reverse: e.target.checked })} className="rounded text-black focus:ring-black" />
                                                    <label className="text-xs font-bold text-gray-600">Reverse Layout (Image Right)</label>
                                                </div>
                                            </div>
                                            <div className="md:col-span-8 space-y-4">
                                                <input type="text" value={block.data.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full font-serif text-xl font-bold border-0 border-b border-gray-200 px-0 focus:ring-0 focus:border-black placeholder-gray-300" placeholder="Section Title" />
                                                <textarea value={block.data.text} onChange={(e) => updateBlock(block.id, { text: e.target.value })} className="w-full h-32 bg-gray-50 rounded-lg border-gray-200 text-sm" placeholder="Section content..." />
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'raw' && (
                                        <div className="space-y-2">
                                            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                                                <textarea 
                                                    value={block.data.html} 
                                                    onChange={(e) => updateBlock(block.id, { html: e.target.value })}
                                                    className="w-full h-32 bg-transparent border-0 focus:ring-0 text-green-400 p-0 font-mono text-xs"
                                                    placeholder="<div>HTML content...</div>"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400">* Advanced: Direct HTML editing</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}

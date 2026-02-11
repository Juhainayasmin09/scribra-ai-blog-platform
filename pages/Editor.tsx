import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Wand2, Eye, LayoutTemplate, Settings, PenLine, FileCode, Monitor, BarChart3, AlertCircle, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { BlogPost, PostStatus, AIActionType } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import Layout from '../components/Layout';
import Button from '../components/Button';
import MarkdownPreview from '../components/MarkdownPreview';
import RichTextEditor from '../components/RichTextEditor';

// --- SEO Analysis Helpers ---

const getCleanText = (markdown: string) => {
  return markdown
    .replace(/#+\s/g, '') // remove headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // images
    .replace(/`{3}[\s\S]*?`{3}/g, '') // code blocks
    .replace(/`(.+?)`/g, '$1') // inline code
    .replace(/\n/g, ' '); // newlines
};

const countSyllables = (word: string) => {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const match = word.match(/[aeiouy]{1,2}/g);
  return match ? match.length : 1;
};

const analyzeContent = (content: string, keywordStr: string) => {
  const text = getCleanText(content);
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const charCount = text.length;
  
  if (wordCount === 0) return { wordCount: 0, charCount: 0, readingScore: 0, readingLabel: 'N/A', density: 0, targetKeyword: '' };

  // Readability (Flesch Reading Ease)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  
  const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
  let label = 'Unknown';
  if (score > 90) label = 'Very Easy';
  else if (score > 80) label = 'Easy';
  else if (score > 70) label = 'Fairly Easy';
  else if (score > 60) label = 'Standard';
  else if (score > 50) label = 'Fairly Difficult';
  else if (score > 30) label = 'Difficult';
  else label = 'Very Difficult';

  // Keyword Density
  let density = 0;
  const targetKeyword = keywordStr.split(',')[0]?.trim().toLowerCase();
  if (targetKeyword) {
    // Escape regex special characters
    const safeKeyword = targetKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const keywordRegex = new RegExp(`\\b${safeKeyword}\\b`, 'gi');
    const matches = text.match(keywordRegex);
    if (matches) {
      density = (matches.length / wordCount) * 100;
    }
  }

  return {
    wordCount,
    charCount,
    readingScore: Math.round(score),
    readingLabel: label,
    density: density.toFixed(2),
    targetKeyword
  };
};

// --- Generation Overlay Component ---

const LOADING_STEPS = {
    'OUTLINE': ["Analyzing topic...", "Structuring main points...", "Refining flow...", "Finalizing outline..."],
    'CONTINUE': ["Reading context...", "Drafting continuation...", "Matching tone...", "Polishing text..."],
    'IMPROVE': ["Analyzing style...", "Enhancing clarity...", "Checking grammar...", "Polishing output..."],
    'SUMMARIZE': ["Reading content...", "Extracting key points...", "Drafting summary...", "Finalizing..."],
    'SEO': ["Analyzing keywords...", "Checking readability...", "Generating suggestions...", "Finalizing report..."],
    'DEFAULT': ["Initializing AI...", "Generating content...", "Refining output...", "Almost done..."]
};

const GenerationOverlay: React.FC<{ action: AIActionType }> = ({ action }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const steps = LOADING_STEPS[action] || LOADING_STEPS['DEFAULT'];

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex(prev => (prev + 1) % steps.length);
        }, 1800); // Rotate text every 1.8s
        return () => clearInterval(interval);
    }, [steps]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-page)]/80 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-2xl border border-[var(--border-light)] max-w-sm w-full text-center relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                
                {/* Decorative pulsing gradient at top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 animate-pulse" />
                
                {/* Icon Container */}
                <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 relative group">
                    <Sparkles size={28} className="animate-pulse relative z-10" />
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-2xl ring-4 ring-indigo-500/20 animate-ping opacity-20" />
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Generating Content</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed px-2">
                    Our AI is crafting your content. You can continue editing once it's ready.
                </p>

                {/* Status Indicator */}
                <div className="flex items-center justify-center gap-3 text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-muted)] py-2.5 px-5 rounded-full mx-auto w-fit border border-[var(--border-light)] shadow-sm">
                   <Loader2 size={14} className="animate-spin text-indigo-500" />
                   <span className="min-w-[140px] text-left transition-opacity duration-300" key={stepIndex}>
                     {steps[stepIndex]}
                   </span>
                </div>
            </div>
        </div>
    );
};

// --- Component ---

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [currentAIAction, setCurrentAIAction] = useState<AIActionType>('CONTINUE');
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Editor Mode: Visual (WYSIWYG) or Markdown (Source)
  const [editorMode, setEditorMode] = useState<'visual' | 'markdown'>('visual');
  
  // Mobile state
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  
  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Authentication check
  useEffect(() => {
    const user = storageService.getUser();
    if (!user) {
        navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      const found = storageService.getPost(id);
      if (found) {
        setPost(found);
        setSeoTitle(found.seoTitle || '');
        setSeoDesc(found.seoDescription || '');
        setSeoKeywords(found.seoKeywords?.join(', ') || '');
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, navigate]);

  const savePost = useCallback((status?: PostStatus) => {
    if (!post) return;
    setIsSaving(true);
    const updatedPost: BlogPost = { 
        ...post, 
        updatedAt: Date.now(),
        status: status || post.status,
        seoTitle: seoTitle,
        seoDescription: seoDesc,
        seoKeywords: seoKeywords.split(',').map(k => k.trim()).filter(k => k)
    };
    storageService.savePost(updatedPost);
    setPost(updatedPost);
    
    // Fake network delay for UX
    setTimeout(() => setIsSaving(false), 500);
  }, [post, seoTitle, seoDesc, seoKeywords]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
        if (post) savePost();
    }, 30000);
    return () => clearInterval(interval);
  }, [savePost, post]);

  const handleAIAction = async (action: AIActionType) => {
    if (!post) return;
    
    setCurrentAIAction(action);
    setIsAILoading(true);
    // Hide panel immediately to show loading state cleanly
    if (action !== 'SEO') setShowAIPanel(false);

    try {
        let context = "";
        let prompt = "";

        if (action === 'OUTLINE') {
            context = post.title;
            if (!context) {
                alert("Please add a title first for outline generation.");
                setIsAILoading(false);
                setShowAIPanel(true);
                return;
            }
        } else if (action === 'SEO') {
            context = post.content;
        } else {
            context = post.content;
            prompt = aiPrompt;
        }

        const result = await geminiService.generateContent(action, context, prompt);

        if (action === 'SEO') {
            try {
                const seoData = JSON.parse(result);
                if(seoData.titleSuggestion) setSeoTitle(seoData.titleSuggestion);
                if(seoData.keywords && Array.isArray(seoData.keywords)) setSeoKeywords(seoData.keywords.join(', '));
                if(seoData.improvementTips) alert("SEO Tips:\n" + seoData.improvementTips.join('\n- '));
            } catch (e) {
                console.error("Failed to parse SEO JSON", e);
                alert("SEO Analysis: " + result);
            }
        } else {
            if (action === 'OUTLINE' && !post.content) {
                setPost({ ...post, content: result });
            } else if (action === 'CONTINUE') {
                setPost({ ...post, content: post.content + '\n\n' + result });
            } else {
                setPost({ ...post, content: post.content + '\n\n--- AI Suggestion ---\n' + result });
            }
        }
        setAiPrompt('');
    } catch (error) {
        alert("AI Generation Failed: " + (error as Error).message);
    } finally {
        setIsAILoading(false);
    }
  };

  const metrics = useMemo(() => {
      return analyzeContent(post?.content || '', seoKeywords);
  }, [post?.content, seoKeywords]);

  if (!post) return <div className="p-8 text-[var(--text-primary)]">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-app)]">
        {/* Editor Header */}
        <header className="h-16 border-b border-[var(--border-color)] px-4 flex items-center justify-between bg-[var(--bg-header)] shrink-0 z-10 transition-colors">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <ArrowLeft size={20} />
                </button>
                <input 
                    type="text" 
                    value={post.title}
                    onChange={(e) => setPost({...post, title: e.target.value})}
                    placeholder="Enter post title..."
                    className="text-lg font-bold bg-transparent text-[var(--text-primary)] placeholder-[var(--input-placeholder)] focus:outline-none w-32 sm:w-64 md:w-96"
                />
                
                {/* Stats & Save Status */}
                <div className="hidden md:flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <span>{isSaving ? 'Saving...' : 'Saved'}</span>
                    <span className="w-px h-4 bg-[var(--border-color)] mx-1" />
                    <span>{metrics.wordCount} words</span>
                    <span className="hidden lg:inline">{metrics.charCount} chars</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Mode Toggle */}
                <div className="flex items-center bg-[var(--bg-app)] rounded-lg p-1 border border-[var(--border-color)] mr-2 hidden sm:flex">
                    <button 
                        onClick={() => setEditorMode('visual')}
                        className={`p-1.5 rounded transition-colors ${editorMode === 'visual' ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}
                        title="Visual Editor"
                    >
                        <Monitor size={16} />
                    </button>
                    <button 
                        onClick={() => setEditorMode('markdown')}
                        className={`p-1.5 rounded transition-colors ${editorMode === 'markdown' ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}
                        title="Markdown Source"
                    >
                        <FileCode size={16} />
                    </button>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setShowSEO(!showSEO)} icon={<Settings size={18}/>}>
                    <span className="hidden sm:inline">SEO</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowAIPanel(!showAIPanel)} icon={<Wand2 size={16}/>}>
                    <span className="hidden sm:inline">AI Tools</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => savePost(PostStatus.PUBLISHED)} icon={<Eye size={16}/>}>
                    <span className="hidden sm:inline">Publish</span>
                </Button>
            </div>
        </header>

        {/* Mobile Tab Bar */}
        {editorMode === 'markdown' && (
            <div className="md:hidden flex border-b border-[var(--border-color)] bg-[var(--bg-header)] shrink-0 z-10">
                <button 
                    onClick={() => setActiveTab('write')}
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'write' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)] bg-indigo-50/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-app)]'}`}
                >
                    Write
                </button>
                <button 
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'preview' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)] bg-indigo-50/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-app)]'}`}
                >
                    Preview
                </button>
            </div>
        )}

        {/* Main Editor Area */}
        {/* We use relative positioning here so the Generation Overlay can cover the entire workspace */}
        <div className="flex-1 flex overflow-hidden relative">
            
            {/* Contextual AI Generation Overlay */}
            {isAILoading && currentAIAction !== 'SEO' && (
                <GenerationOverlay action={currentAIAction} />
            )}

            {editorMode === 'visual' ? (
                // VISUAL MODE
                <div className="flex-1 flex flex-col h-full relative max-w-4xl mx-auto w-full border-x border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm">
                     <RichTextEditor 
                        content={post.content} 
                        onChange={(newContent) => setPost({...post, content: newContent})} 
                     />
                </div>
            ) : (
                // MARKDOWN MODE
                <>
                    <div className={`flex-1 flex flex-col border-r border-[var(--border-color)] h-full relative group ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                        <div className="bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)] flex justify-between transition-colors">
                            <span>MARKDOWN SOURCE</span>
                        </div>
                        <textarea
                            className="flex-1 w-full p-4 md:p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed bg-[var(--editor-bg)] text-[var(--text-primary)] placeholder-[var(--input-placeholder)] custom-scrollbar transition-colors"
                            value={post.content}
                            onChange={(e) => setPost({...post, content: e.target.value})}
                            placeholder="Start writing your amazing story..."
                        />
                    </div>
                    <div className={`flex-1 flex-col h-full bg-[var(--preview-bg)] overflow-auto custom-scrollbar transition-colors ${activeTab === 'write' ? 'hidden md:flex' : 'flex'}`}>
                        <div className="bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)] sticky top-0 z-10 shadow-sm transition-colors">
                            <span>PREVIEW</span>
                        </div>
                        <div className="p-4 md:p-8 max-w-2xl mx-auto w-full bg-[var(--preview-bg)] min-h-full transition-colors">
                            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--text-primary)]">{post.title}</h1>
                            <MarkdownPreview content={post.content} />
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* AI Side Panel Overlay */}
        {showAIPanel && (
            <div className="absolute right-0 top-16 bottom-0 w-80 max-w-full bg-[var(--bg-surface)] border-l border-[var(--border-color)] shadow-xl z-20 flex flex-col animate-in slide-in-from-right duration-200">
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2"><Wand2 size={16}/> AI Assistant</h3>
                    <button onClick={() => setShowAIPanel(false)} className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"><ArrowLeft size={16}/></button>
                </div>
                
                <div className="p-4 flex-1 overflow-auto space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Quick Actions</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleAIAction('OUTLINE')} disabled={isAILoading} className="p-3 bg-[var(--bg-app)] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-[var(--border-color)] rounded-lg text-left text-sm transition-colors">
                                <LayoutTemplate size={16} className="mb-2 text-indigo-600 dark:text-indigo-400"/>
                                <div className="font-medium text-[var(--text-primary)]">Outline</div>
                                <div className="text-xs text-[var(--text-secondary)]">Generate structure</div>
                            </button>
                            <button onClick={() => handleAIAction('CONTINUE')} disabled={isAILoading} className="p-3 bg-[var(--bg-app)] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-[var(--border-color)] rounded-lg text-left text-sm transition-colors">
                                <PenLine size={16} className="mb-2 text-indigo-600 dark:text-indigo-400"/>
                                <div className="font-medium text-[var(--text-primary)]">Continue</div>
                                <div className="text-xs text-[var(--text-secondary)]">Write next paragraph</div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-[var(--border-color)]">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Custom Prompt</label>
                        <textarea 
                            className="w-full border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--input-placeholder)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            rows={4}
                            placeholder="e.g., Rewrite the last paragraph to be more exciting..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                         <Button 
                            className="w-full" 
                            size="sm" 
                            disabled={!aiPrompt.trim() || isAILoading}
                            onClick={() => handleAIAction('IMPROVE')}
                            isLoading={isAILoading}
                        >
                            Generate
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {/* SEO Settings Modal */}
        {showSEO && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[var(--border-color)] flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5 duration-300">
                    <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-header)]">
                        <h3 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                            <BarChart3 size={20} className="text-[var(--accent-primary)]"/>
                            SEO Optimization
                        </h3>
                        <button onClick={() => setShowSEO(false)} className="text-[var(--text-primary)]"><ArrowLeft className="rotate-180" size={20}/></button>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-6 space-y-6">
                        {/* Real-time Analysis Section */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                             <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                                <AlertCircle size={16}/> Content Analysis
                             </h4>
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Words</div>
                                    <div className="text-2xl font-bold text-[var(--text-primary)]">{metrics.wordCount}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Readability</div>
                                    <div className="text-2xl font-bold text-[var(--text-primary)]">{metrics.readingScore}</div>
                                    <div className="text-xs text-[var(--text-secondary)] truncate" title={metrics.readingLabel}>{metrics.readingLabel}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Keyword Density</div>
                                    <div className={`text-2xl font-bold ${Number(metrics.density) > 2.5 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                                        {metrics.density}%
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)] truncate">Target: {metrics.targetKeyword || 'None'}</div>
                                </div>
                                <div>
                                     <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Status</div>
                                     <div className="text-sm font-medium mt-1">
                                        {metrics.wordCount < 300 ? 'Too Short' : 'Good Length'}
                                     </div>
                                </div>
                             </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Target Keyword(s)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--input-placeholder)] rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        value={seoKeywords}
                                        onChange={e => setSeoKeywords(e.target.value)}
                                        placeholder="e.g. artificial intelligence, writing tips (comma separated)"
                                    />
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">First keyword used for density analysis.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">SEO Title</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--input-placeholder)] rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        value={seoTitle}
                                        onChange={e => setSeoTitle(e.target.value)}
                                        placeholder={post.title}
                                    />
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">{seoTitle.length}/60 characters</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Meta Description</label>
                                    <textarea 
                                        className="w-full border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--input-placeholder)] rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-[132px]"
                                        value={seoDesc}
                                        onChange={e => setSeoDesc(e.target.value)}
                                        placeholder="A brief summary for search engines..."
                                    />
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">{seoDesc.length}/160 characters</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-header)] flex justify-between items-center gap-2">
                             <Button variant="ghost" size="sm" onClick={() => handleAIAction('SEO')} isLoading={isAILoading} icon={<Wand2 size={14}/>}>
                                <span className="text-xs sm:text-sm">Auto-Optimize</span>
                             </Button>
                             <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowSEO(false)}>Cancel</Button>
                                <Button onClick={() => { savePost(); setShowSEO(false); }}>Save SEO Settings</Button>
                             </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Editor;
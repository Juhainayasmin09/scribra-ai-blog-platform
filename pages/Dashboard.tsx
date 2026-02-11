import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Globe, MoreHorizontal, Trash2 } from 'lucide-react';
import { BlogPost, PostStatus } from '../types';
import { storageService } from '../services/storageService';
import Button from '../components/Button';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setPosts(storageService.getPosts());
  }, []);

  const handleCreate = () => {
    const newPost = storageService.createEmptyPost();
    storageService.savePost(newPost);
    navigate(`/editor/${newPost.id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this post?")) {
        storageService.deletePost(id);
        setPosts(storageService.getPosts());
    }
  };

  const filteredPosts = posts
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">My Posts</h1>
                <p className="text-[var(--text-secondary)] mt-1 text-lg">Manage your blog content and drafts.</p>
            </div>
            <Button onClick={handleCreate} icon={<Plus size={18} />}>New Post</Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-[var(--text-muted)]" />
            </div>
            <input 
                type="text" 
                placeholder="Search posts..." 
                className="w-full pl-10 pr-4 py-3 border border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--input-placeholder)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--icon-color)] focus:border-transparent transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {/* Post Grid */}
        {filteredPosts.length === 0 ? (
            <div className="text-center py-24 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] border-dashed shadow-sm">
                <div className="mx-auto w-16 h-16 bg-[var(--bg-page)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
                    <FileText size={32} />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No posts found</h3>
                <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">Get started by creating your first blog post using our AI-powered editor.</p>
                <Button onClick={handleCreate} variant="primary">Create Post</Button>
            </div>
        ) : (
            <div className="grid gap-4">
                {filteredPosts.map(post => (
                    <Link key={post.id} to={`/editor/${post.id}`} className="block group">
                        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-light)] shadow-[var(--shadow-card)] hover:border-[var(--icon-color)] transition-all flex justify-between items-center group-hover:-translate-y-0.5">
                            <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--icon-color)] transition-colors">
                                        {post.title || 'Untitled Post'}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                                        post.status === PostStatus.PUBLISHED 
                                            ? 'bg-[var(--badge-published-bg)] text-[var(--badge-published-text)] border-[var(--badge-published-border)]' 
                                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                    }`}>
                                        {post.status === PostStatus.PUBLISHED ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] truncate mb-4">
                                    {post.content ? post.content.substring(0, 120) : 'No content yet...'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-medium">
                                    <span>Last edited {new Date(post.updatedAt).toLocaleDateString()}</span>
                                    {post.status === PostStatus.PUBLISHED && (
                                        <div onClick={(e) => {
                                            e.preventDefault();
                                            window.open(`/#/post/${post.id}`, '_blank');
                                        }} className="flex items-center gap-1 hover:text-[var(--icon-color)] cursor-pointer transition-colors">
                                            <Globe size={12} />
                                            View Live
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => handleDelete(e, post.id)} className="p-2.5 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 size={20} />
                                </button>
                                <div className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--icon-color)] hover:bg-[var(--icon-bg)] rounded-lg transition-colors">
                                    <MoreHorizontal size={20} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
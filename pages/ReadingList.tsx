import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, FileText, Trash2, Clock, ArrowRight } from 'lucide-react';
import { BlogPost, PostStatus } from '../types';
import { storageService } from '../services/storageService';
import Button from '../components/Button';
import Layout from '../components/Layout';

const ReadingList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [user, setUser] = useState(storageService.getUser());
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
        navigate('/');
        return;
    }
    const savedPosts = storageService.getBookmarkedPosts(user.id);
    setPosts(savedPosts);
  }, [user, navigate]);

  const handleRemove = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    storageService.toggleBookmark(postId, user.id);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-5xl mx-auto">
        <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3 flex items-center gap-3">
                <Bookmark className="text-[var(--accent-primary)]" strokeWidth={2.5} />
                Reading List
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
                Stories you've saved for later. Relax and read at your own pace.
            </p>
        </div>

        {posts.length === 0 ? (
            <div className="text-center py-24 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] border-dashed shadow-sm">
                <div className="mx-auto w-20 h-20 bg-[var(--bg-page)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-6">
                    <Bookmark size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Your list is empty</h3>
                <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto text-base">
                    Click the bookmark icon on any story to save it here for later reading.
                </p>
                <Link to="/">
                    <Button variant="primary" size="lg" className="rounded-full px-8">Explore Stories</Button>
                </Link>
            </div>
        ) : (
            <div className="grid gap-6">
                {posts.map(post => (
                    <Link key={post.id} to={`/post/${post.id}`} className="block group">
                        <div className="bg-[var(--bg-card)] p-6 md:p-8 rounded-2xl border border-[var(--border-light)] shadow-[var(--shadow-card)] hover:border-[var(--icon-color)] transition-all relative group-hover:-translate-y-1">
                            
                            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                        <img src={post.author?.avatar} className="w-5 h-5 rounded-full" alt="Author" />
                                        <span>{post.author?.name}</span>
                                        <span className="w-1 h-1 bg-[var(--text-muted)] rounded-full"/>
                                        <span>{post.readTime}</span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
                                        {post.title}
                                    </h3>
                                    
                                    <p className="text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                                        {post.excerpt || post.content.substring(0, 160) + "..."}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2 shrink-0">
                                     <button 
                                        onClick={(e) => handleRemove(e, post.id)} 
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors border border-[var(--border-light)] md:border-transparent md:hover:border-red-200"
                                     >
                                        <Trash2 size={16} />
                                        <span>Remove</span>
                                     </button>
                                     <div className="md:hidden flex-1"/>
                                     <span className="text-sm font-semibold text-[var(--accent-primary)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Read Now <ArrowRight size={16} />
                                     </span>
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

export default ReadingList;
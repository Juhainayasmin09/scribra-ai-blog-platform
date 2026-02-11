import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BlogPost, Comment } from '../types';
import { storageService } from '../services/storageService';
import MarkdownPreview from '../components/MarkdownPreview';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { Heart, MessageSquare, Bookmark, Share2, Send, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PublicPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [user, setUser] = useState(storageService.getUser());
  
  // Interaction State
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Comments State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (id) {
      const found = storageService.getPost(id);
      if (found) {
        setPost(found);
        setLikeCount(found.likes || 0);
        
        // Load interactions if logged in
        if (user) {
            setIsLiked(storageService.hasUserLiked(id, user.id));
            setIsBookmarked(storageService.hasUserBookmarked(id, user.id));
        }

        // Load comments
        setComments(storageService.getPostComments(id));
      }
    }
  }, [id, user]);

  const handleLoginRedirect = () => {
    if (window.confirm("You need to be logged in to perform this action. Go to login?")) {
        storageService.login(); // Simulates login flow
        navigate('/setup-profile');
    }
  };

  const handleLike = () => {
    if (!post) return;
    if (!user) {
        handleLoginRedirect();
        return;
    }

    // Optimistic Update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    storageService.toggleLike(post.id, user.id);
  };

  const handleBookmark = () => {
    if (!post) return;
    if (!user) {
        handleLoginRedirect();
        return;
    }

    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    storageService.toggleBookmark(post.id, user.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;
    if (!user) {
        handleLoginRedirect();
        return;
    }

    setIsSubmittingComment(true);
    
    // Simulate network delay
    setTimeout(() => {
        const comment = storageService.addComment(post.id, user.id, newComment);
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        setIsSubmittingComment(false);
    }, 400);
  };

  const scrollToComments = () => {
    setShowComments(true);
    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!post) return <div className="p-10 text-center text-[var(--text-secondary)]">Post not found.</div>;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] font-sans text-[var(--text-primary)] transition-colors duration-300">
        <header className="border-b border-[var(--border-color)] py-4 mb-10 bg-[var(--bg-header)] sticky top-0 z-30">
            <div className="max-w-3xl mx-auto px-6 flex justify-between items-center">
                 <Link to="/">
                    <Logo />
                </Link>
                
                <div className="flex items-center gap-4">
                    {user ? (
                        <Link to="/dashboard">
                            <img src={user.avatar} className="w-8 h-8 rounded-full border border-[var(--border-light)]" alt="User" />
                        </Link>
                    ) : (
                        <Button size="sm" onClick={() => {
                            storageService.login();
                            navigate('/setup-profile');
                        }}>Sign In</Button>
                    )}
                </div>
            </div>
        </header>

        <article className="max-w-3xl mx-auto px-6 pb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-6 leading-tight tracking-tight">{post.title}</h1>
            
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-8 mb-8">
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <img src={post.author?.avatar || "https://picsum.photos/100/100"} alt="Author" className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        <div className="font-semibold text-[var(--text-primary)]">{post.author?.name || 'Unknown Author'}</div>
                        <div className="flex items-center gap-2 text-xs">
                             <time>{new Date(post.updatedAt).toLocaleDateString()}</time>
                             <span>·</span>
                             <span>{post.readTime || '3 min read'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                     <button onClick={handleBookmark} className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-[var(--accent-primary)] bg-indigo-50 dark:bg-indigo-900/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'}`}>
                        <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                     </button>
                     <button className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors">
                        <Share2 size={20} />
                     </button>
                </div>
            </div>

            <div className="mb-16">
                <MarkdownPreview content={post.content} />
            </div>

            {/* Interaction Bar (Bottom) */}
            <div className="border-y border-[var(--border-color)] py-4 flex items-center justify-between px-2 mb-12 bg-[var(--bg-surface)] rounded-xl">
                 <div className="flex items-center gap-6">
                     <button 
                        onClick={handleLike} 
                        className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'}`}
                     >
                        <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-in zoom-in duration-200" : ""} />
                        <span className="font-medium text-lg">{likeCount}</span>
                     </button>
                     
                     <button 
                        onClick={scrollToComments}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                     >
                        <MessageSquare size={24} />
                        <span className="font-medium text-lg">{comments.length}</span>
                     </button>
                 </div>

                 <button onClick={handleBookmark} className={`flex items-center gap-2 transition-colors ${isBookmarked ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                     <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} />
                 </button>
            </div>

            {/* Comments Section */}
            <div id="comments-section" className="scroll-mt-24">
                <h3 className="text-2xl font-bold mb-8 text-[var(--text-primary)]">Responses ({comments.length})</h3>
                
                {user ? (
                    <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-light)] mb-10 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                            <span className="font-medium text-[var(--text-primary)]">{user.name}</span>
                        </div>
                        <form onSubmit={handleCommentSubmit}>
                            <textarea 
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-light)] rounded-lg p-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none transition-all resize-none min-h-[100px]"
                                placeholder="What are your thoughts?"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end mt-3">
                                <Button 
                                    type="submit" 
                                    disabled={!newComment.trim() || isSubmittingComment}
                                    isLoading={isSubmittingComment}
                                    size="sm"
                                    className="rounded-full"
                                >
                                    Respond
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-[var(--bg-muted)] p-8 rounded-xl text-center mb-10 border border-[var(--border-light)]">
                        <Lock className="mx-auto mb-3 text-[var(--text-secondary)]" size={24} />
                        <p className="text-[var(--text-primary)] font-medium mb-4">Sign in to leave a comment</p>
                         <Button onClick={() => {
                            storageService.login();
                            navigate('/setup-profile');
                         }}>Log In</Button>
                    </div>
                )}

                <div className="space-y-6">
                    {comments.length === 0 ? (
                        <p className="text-[var(--text-secondary)] text-center italic py-8">No comments yet. Be the first to share your thoughts!</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="border-b border-[var(--border-color)] pb-6 last:border-0 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full bg-slate-200" />
                                    <div>
                                        <div className="font-medium text-[var(--text-primary)] text-sm">{comment.author.name}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{new Date(comment.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap pl-11 text-sm md:text-base">
                                    {comment.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </article>
    </div>
  );
};

export default PublicPost;
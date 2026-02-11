import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { 
    PenLine, Sparkles, Moon, Sun, Search, Bell, 
    MessageSquare, Heart, Bookmark, MoreHorizontal,
    TrendingUp, Hash, ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BlogPost, PostStatus } from '../types';

type InteractionState = {
  [postId: string]: {
    isLiked: boolean;
    isBookmarked: boolean;
    likeCount: number;
  }
};

const HomeFeed: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [user, setUser] = useState(storageService.getUser());
  const [interactions, setInteractions] = useState<InteractionState>({});

  // Re-fetch data whenever the component mounts or user state might have changed (e.g. returning from login)
  useEffect(() => {
    // 1. Get current user
    const currentUser = storageService.getUser();
    setUser(currentUser);

    // 2. Get and filter posts
    const allPosts = storageService.getPosts();
    const feedPosts = allPosts
        .filter(p => p.status === PostStatus.PUBLISHED || p.id.startsWith('seed_'))
        .sort((a, b) => b.createdAt - a.createdAt);
    setPosts(feedPosts);

    // 3. Initialize interaction state (Likes/Bookmarks) for the feed
    const initialInteractions: InteractionState = {};
    feedPosts.forEach(p => {
        initialInteractions[p.id] = {
            likeCount: p.likes || 0,
            isLiked: currentUser ? storageService.hasUserLiked(p.id, currentUser.id) : false,
            isBookmarked: currentUser ? storageService.hasUserBookmarked(p.id, currentUser.id) : false
        };
    });
    setInteractions(initialInteractions);
  }, []); // Run on mount

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
        if(window.confirm("Sign in to like this story?")) {
            handleLogin();
        }
        return;
    }

    const current = interactions[postId];
    if (!current) return;

    // Optimistic UI Update
    const newIsLiked = !current.isLiked;
    const newCount = newIsLiked ? current.likeCount + 1 : current.likeCount - 1;

    setInteractions(prev => ({
        ...prev,
        [postId]: {
            ...current,
            isLiked: newIsLiked,
            likeCount: newCount
        }
    }));

    // Persist
    storageService.toggleLike(postId, user.id);
  };

  const handleBookmark = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
        if(window.confirm("Sign in to save this story for later?")) {
            handleLogin();
        }
        return;
    }

    const current = interactions[postId];
    if (!current) return;

    const newIsBookmarked = !current.isBookmarked;

    setInteractions(prev => ({
        ...prev,
        [postId]: {
            ...current,
            isBookmarked: newIsBookmarked
        }
    }));

    storageService.toggleBookmark(postId, user.id);
  };

  const handleWrite = () => {
    if (!user) {
        handleLogin();
        return;
    }
    const newPost = storageService.createEmptyPost();
    storageService.savePost(newPost);
    navigate(`/editor/${newPost.id}`);
  };

  const handleLogin = () => {
    storageService.login();
    setUser(storageService.getUser());
    navigate('/setup-profile');
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-primary)] transition-colors duration-300">
      
      {/* --- Global Navigation --- */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border-light)] bg-[var(--bg-card)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
                <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Logo size="md" />
                </div>
                
                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex items-center relative w-64 lg:w-96">
                    <Search size={16} className="absolute left-3 text-[var(--text-muted)]" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full bg-[var(--bg-muted)] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none transition-all placeholder-[var(--text-muted)]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                 <button onClick={handleWrite} className="hidden sm:flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
                    <PenLine size={20} />
                    <span className="font-medium">Write</span>
                 </button>

                 <button onClick={toggleTheme} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] rounded-full transition-colors">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                 </button>

                 {user ? (
                     <div className="flex items-center gap-4">
                         <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-card)]"></span>
                         </button>
                         <Link to="/dashboard">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-[var(--border-light)]" />
                         </Link>
                     </div>
                 ) : (
                     <div className="flex items-center gap-2">
                        <button onClick={handleLogin} className="hidden sm:block font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2">
                            Log in
                        </button>
                        <Button onClick={handleLogin} size="sm" className="rounded-full px-5">Sign up</Button>
                     </div>
                 )}
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        
        {/* --- Left Sidebar (Navigation) --- */}
        <aside className="hidden md:block col-span-3 lg:col-span-2 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
            <nav className="space-y-1 mb-8">
                <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-muted)] font-bold text-[var(--text-primary)]">
                    <TrendingUp size={20} />
                    Home
                </Link>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
                    <Sparkles size={20} />
                    Fresh
                </div>
                <Link to="/reading-list" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
                    <Bookmark size={20} />
                    Reading List
                </Link>
            </nav>

            <div className="mb-4">
                <h3 className="px-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">My Topics</h3>
                {['Technology', 'Writing', 'AI', 'Self Improvement', 'Science', 'Programming'].map(topic => (
                    <div key={topic} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors text-sm">
                        <Hash size={16} className="opacity-50" />
                        {topic}
                    </div>
                ))}
            </div>
        </aside>

        {/* --- Center Feed --- */}
        <section className="col-span-12 md:col-span-9 lg:col-span-7">
            
            {/* Mobile Tabs */}
            <div className="md:hidden flex items-center gap-4 mb-6 border-b border-[var(--border-light)] pb-2 overflow-x-auto">
                <button className="px-2 py-1 font-bold border-b-2 border-[var(--text-primary)] whitespace-nowrap">For You</button>
                <button className="px-2 py-1 text-[var(--text-secondary)] whitespace-nowrap">Following</button>
                <button className="px-2 py-1 text-[var(--text-secondary)] whitespace-nowrap">Tech</button>
                <button className="px-2 py-1 text-[var(--text-secondary)] whitespace-nowrap">Creativity</button>
            </div>

            <div className="space-y-8">
                {posts.map((post) => {
                    const postState = interactions[post.id] || { isLiked: false, isBookmarked: false, likeCount: post.likes || 0 };
                    
                    return (
                        <article key={post.id} className="group flex flex-col gap-3 pb-8 border-b border-[var(--border-light)] last:border-0 relative">
                            {/* Author Meta */}
                            <div className="flex items-center gap-2 text-sm">
                                <img 
                                    src={post.author?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Unknown'} 
                                    alt={post.author?.name} 
                                    className="w-6 h-6 rounded-full bg-gray-200"
                                />
                                <span className="font-semibold text-[var(--text-primary)] hover:underline cursor-pointer">
                                    {post.author?.name || 'Unknown Author'}
                                </span>
                                <span className="text-[var(--text-muted)]">·</span>
                                <span className="text-[var(--text-muted)]">{formatTime(post.createdAt)}</span>
                            </div>

                            {/* Content */}
                            <div className="cursor-pointer" onClick={() => navigate(post.id.startsWith('seed') ? `/post/${post.id}` : `/post/${post.id}`)}>
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
                                    {post.title}
                                </h2>
                                <p className="text-[var(--text-secondary)] line-clamp-2 md:line-clamp-3 leading-relaxed text-base">
                                    {post.excerpt || post.content.substring(0, 150) + "..."}
                                </p>
                            </div>

                            {/* Footer / Actions */}
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-4">
                                    {post.tags?.slice(0, 1).map(tag => (
                                        <span key={tag} className="bg-[var(--bg-muted)] text-[var(--text-secondary)] text-xs px-2 py-1 rounded-full font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                    <span className="text-xs text-[var(--text-muted)]">{post.readTime || '3 min read'}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                                    <button 
                                        onClick={(e) => handleLike(e, post.id)}
                                        className={`flex items-center gap-1 transition-colors hover:text-red-500 ${postState.isLiked ? 'text-red-500' : ''}`}
                                        aria-label="Like post"
                                    >
                                        <Heart size={18} fill={postState.isLiked ? "currentColor" : "none"} className={postState.isLiked ? "animate-in zoom-in duration-200" : ""} />
                                        <span className="text-sm font-medium">{postState.likeCount}</span>
                                    </button>
                                    
                                    <Link 
                                        to={`/post/${post.id}#comments-section`} 
                                        className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                                        aria-label="Comment"
                                    >
                                        <MessageSquare size={18} />
                                        <span className="text-sm font-medium">{post.commentCount || 0}</span>
                                    </Link>
                                    
                                    <button 
                                        onClick={(e) => handleBookmark(e, post.id)}
                                        className={`hover:text-[var(--text-primary)] transition-colors ${postState.isBookmarked ? 'text-[var(--accent-primary)]' : ''}`}
                                        aria-label="Bookmark post"
                                    >
                                        <Bookmark size={18} fill={postState.isBookmarked ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
            
            <div className="py-12 text-center">
                <p className="text-[var(--text-muted)] mb-4">You've reached the end of the feed.</p>
                <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</Button>
            </div>
        </section>

        {/* --- Right Sidebar (Context) --- */}
        <aside className="hidden lg:block col-span-3 sticky top-24 h-fit">
            {/* CTA Box (If not logged in, or generic promo) */}
            {!user && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-6 mb-8">
                    <h3 className="font-bold text-lg mb-2">Writing on Scribra</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                        New perspective on any topic. Expert voices and undiscovered voices sharing their best writing.
                    </p>
                    <Button onClick={handleLogin} className="w-full rounded-full">Get Started</Button>
                </div>
            )}

            {/* Trending Section */}
            <div>
                <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[var(--text-primary)]"/>
                    Trending on Scribra
                </h3>
                <div className="space-y-6">
                    {posts.slice(0, 4).map((post, idx) => (
                        <div key={post.id} className="group cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                                <img src={post.author?.avatar} className="w-5 h-5 rounded-full" alt="author"/>
                                <span className="text-xs font-medium text-[var(--text-primary)]">{post.author?.name}</span>
                            </div>
                            <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 leading-snug mb-1">
                                {post.title}
                            </h4>
                            <span className="text-xs text-[var(--text-secondary)]">{post.readTime}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-6 border-t border-[var(--border-light)] text-sm text-[var(--text-muted)] flex flex-wrap gap-x-4 gap-y-2">
                    <a href="#" className="hover:underline">Help</a>
                    <a href="#" className="hover:underline">Status</a>
                    <a href="#" className="hover:underline">Writers</a>
                    <a href="#" className="hover:underline">Blog</a>
                    <a href="#" className="hover:underline">Privacy</a>
                    <a href="#" className="hover:underline">Terms</a>
                    <a href="#" className="hover:underline">About</a>
                </div>
            </div>
        </aside>

      </main>
    </div>
  );
};

export default HomeFeed;
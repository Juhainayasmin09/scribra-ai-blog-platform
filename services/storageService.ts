import { BlogPost, PostStatus, User, Comment, Like, Bookmark } from '../types';

const POSTS_KEY = 'scribra_posts';
const USER_KEY = 'scribra_user';
const HAS_SEEDED_KEY = 'scribra_has_seeded';
const LIKES_KEY = 'scribra_likes';
const COMMENTS_KEY = 'scribra_comments';
const BOOKMARKS_KEY = 'scribra_bookmarks';

export const mockUser: User = {
  id: 'user_123',
  name: 'Alex Writer',
  email: 'alex@scribra.com',
  avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex',
  avatarType: 'google'
};

const SEED_POSTS: BlogPost[] = [
  {
    id: 'seed_1',
    title: 'The Slow Death of the Essay',
    excerpt: 'Why we need to reclaim long-form writing in an age of 15-second attention spans.',
    content: 'Context...', 
    status: PostStatus.PUBLISHED,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    updatedAt: Date.now(),
    authorId: 'auth_1',
    author: { name: 'Sarah Jenkins', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah' },
    likes: 342,
    commentCount: 12,
    readTime: '6 min read',
    tags: ['Writing', 'Culture', 'Opinion']
  },
  {
    id: 'seed_2',
    title: 'Switching from VS Code to Zed: A Rust-Powered Journey',
    excerpt: 'Is the speed worth the lack of extensions? My one-month review of the new editor on the block.',
    content: 'Context...',
    status: PostStatus.PUBLISHED,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    updatedAt: Date.now(),
    authorId: 'auth_2',
    author: { name: 'Davide Russo', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Davide' },
    likes: 89,
    commentCount: 5,
    readTime: '4 min read',
    tags: ['Tech', 'Coding', 'Productivity']
  },
  {
    id: 'seed_3',
    title: 'Why I stopped using "Smart" To-Do Lists',
    excerpt: 'Sometimes a piece of paper is the most advanced technology we have.',
    content: 'Context...',
    status: PostStatus.PUBLISHED,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    updatedAt: Date.now(),
    authorId: 'auth_3',
    author: { name: 'Elena K.', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena' },
    likes: 1250,
    commentCount: 45,
    readTime: '3 min read',
    tags: ['Productivity', 'Minimalism']
  },
  {
    id: 'seed_4',
    title: 'Understanding LLMs visually',
    excerpt: 'A deep dive into embeddings, vectors, and how machines actually "understand" meaning.',
    content: 'Context...',
    status: PostStatus.PUBLISHED,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now(),
    authorId: 'auth_4',
    author: { name: 'Marcus Chen', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus' },
    likes: 567,
    commentCount: 23,
    readTime: '12 min read',
    tags: ['AI', 'Machine Learning', 'Education']
  },
  {
    id: 'seed_5',
    title: 'Kyoto in Autumn: A Photo Journal',
    excerpt: 'Capturing the colors of Japan before the winter sets in.',
    content: 'Context...',
    status: PostStatus.PUBLISHED,
    createdAt: Date.now() - 1000 * 60 * 60 * 120,
    updatedAt: Date.now(),
    authorId: 'auth_5',
    author: { name: 'Yuki T.', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Yuki' },
    likes: 210,
    commentCount: 8,
    readTime: '2 min read',
    tags: ['Travel', 'Photography', 'Japan']
  }
];

export const storageService = {
  getUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login: (): User => {
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  updateUser: (updates: Partial<User>): User | null => {
    const user = storageService.getUser();
    if (!user) return null;
    const updatedUser = { ...user, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  getPosts: (): BlogPost[] => {
    const stored = localStorage.getItem(POSTS_KEY);
    let posts = stored ? JSON.parse(stored) : [];

    // Inject seed data if first run
    if (!localStorage.getItem(HAS_SEEDED_KEY)) {
      posts = [...SEED_POSTS, ...posts];
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
      localStorage.setItem(HAS_SEEDED_KEY, 'true');
    }

    return posts;
  },

  getPost: (id: string): BlogPost | undefined => {
    const posts = storageService.getPosts();
    return posts.find((p) => p.id === id);
  },

  savePost: (post: BlogPost): void => {
    const posts = storageService.getPosts();
    const existingIndex = posts.findIndex((p) => p.id === post.id);
    
    // Ensure user info is up to date on save
    const user = storageService.getUser() || mockUser;
    const postWithAuthor = {
        ...post,
        author: post.author || { name: user.name, avatar: user.avatar }
    };
    
    if (existingIndex >= 0) {
      posts[existingIndex] = { ...postWithAuthor, updatedAt: Date.now() };
    } else {
      posts.push({ ...postWithAuthor, createdAt: Date.now(), updatedAt: Date.now() });
    }
    
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  },

  deletePost: (id: string): void => {
    const posts = storageService.getPosts().filter((p) => p.id !== id);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  },
  
  createEmptyPost: (): BlogPost => {
    const user = storageService.getUser() || mockUser;
    return {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      status: PostStatus.DRAFT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      authorId: user.id,
      author: {
        name: user.name,
        avatar: user.avatar
      },
      readTime: '1 min read',
      likes: 0,
      commentCount: 0
    };
  },

  // --- Interaction Services ---

  // Likes
  getAllLikes: (): Like[] => {
    const stored = localStorage.getItem(LIKES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getPostLikeCount: (postId: string): number => {
    // For seed posts, we might want to preserve the initial like count 
    // and add dynamic likes on top. For simplicity, we'll just track new likes here
    // or we can assume the BlogPost.likes is the source of truth for display
    // and we sync it. 
    // STRATEGY: Use BlogPost.likes as the display source.
    const post = storageService.getPost(postId);
    return post?.likes || 0;
  },

  hasUserLiked: (postId: string, userId: string): boolean => {
    const likes = storageService.getAllLikes();
    return likes.some(l => l.postId === postId && l.userId === userId);
  },

  toggleLike: (postId: string, userId: string): boolean => {
    const likes = storageService.getAllLikes();
    const existingIndex = likes.findIndex(l => l.postId === postId && l.userId === userId);
    let isLiked = false;

    if (existingIndex >= 0) {
      // Unlike
      likes.splice(existingIndex, 1);
      isLiked = false;
    } else {
      // Like
      likes.push({ userId, postId, createdAt: Date.now() });
      isLiked = true;
    }

    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));

    // Update the post object directly to reflect count change
    const posts = storageService.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex >= 0) {
      const post = posts[postIndex];
      const currentLikes = post.likes || 0;
      posts[postIndex] = { ...post, likes: isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1) };
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }

    return isLiked;
  },

  // Comments
  getAllComments: (): Comment[] => {
    const stored = localStorage.getItem(COMMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getPostComments: (postId: string): Comment[] => {
    const comments = storageService.getAllComments();
    return comments.filter(c => c.postId === postId).sort((a, b) => b.createdAt - a.createdAt);
  },

  addComment: (postId: string, userId: string, content: string): Comment => {
    const user = storageService.getUser();
    if (!user) throw new Error("User must be logged in to comment");

    const newComment: Comment = {
      id: crypto.randomUUID(),
      postId,
      userId,
      content,
      createdAt: Date.now(),
      author: {
        name: user.name,
        avatar: user.avatar
      }
    };

    const comments = storageService.getAllComments();
    comments.push(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));

    // Update post comment count
    const posts = storageService.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex >= 0) {
      const post = posts[postIndex];
      posts[postIndex] = { ...post, commentCount: (post.commentCount || 0) + 1 };
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }

    return newComment;
  },

  // Bookmarks
  getAllBookmarks: (): Bookmark[] => {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getBookmarkedPosts: (userId: string): BlogPost[] => {
    const bookmarks = storageService.getAllBookmarks().filter(b => b.userId === userId);
    const posts = storageService.getPosts();
    // Filter posts that are bookmarked, maintaining reverse chronological order of bookmarking if possible
    // We'll just filter for now
    const bookmarkedPostIds = new Set(bookmarks.map(b => b.postId));
    return posts.filter(p => bookmarkedPostIds.has(p.id));
  },

  hasUserBookmarked: (postId: string, userId: string): boolean => {
    const bookmarks = storageService.getAllBookmarks();
    return bookmarks.some(b => b.postId === postId && b.userId === userId);
  },

  toggleBookmark: (postId: string, userId: string): boolean => {
    const bookmarks = storageService.getAllBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.postId === postId && b.userId === userId);
    let isBookmarked = false;

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      isBookmarked = false;
    } else {
      bookmarks.push({ userId, postId, createdAt: Date.now() });
      isBookmarked = true;
    }

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return isBookmarked;
  }
};
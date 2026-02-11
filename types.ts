export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarType?: 'google' | 'default';
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  content: string; // Markdown
  status: PostStatus;
  createdAt: number;
  updatedAt: number;
  authorId: string;
  // Denormalized author info for feed performance
  author?: {
    name: string;
    avatar: string;
  };
  likes?: number;
  commentCount?: number;
  readTime?: string;
  tags?: string[];
  
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: number;
}

export interface Like {
  userId: string;
  postId: string;
  createdAt: number;
}

export interface Bookmark {
  userId: string;
  postId: string;
  createdAt: number;
}

export interface AIResponse {
  text: string;
}

export interface SEOSuggestion {
  score: number;
  suggestions: string[];
  keywords: string[];
}

export type AIActionType = 'OUTLINE' | 'CONTINUE' | 'IMPROVE' | 'SUMMARIZE' | 'SEO';
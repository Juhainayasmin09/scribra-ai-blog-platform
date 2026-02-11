import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService, mockUser } from '../services/storageService';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { Check, User as UserIcon } from 'lucide-react';

// High-quality, geometric, neutral avatars suitable for professional context
// Designed to look good in both light and dark modes (using mid-tone colors and white/light backgrounds)
const AVATAR_PRESETS = [
  {
    id: 'ill_editorial_m',
    name: 'Editorial (Male)',
    // Male-presenting, clean shaven, white background, matching style
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=ffffff&glassesProbability=0&beardProbability=0'
  },
  {
    id: 'ill_editorial_f',
    name: 'Editorial (Female)',
    // Female-presenting, simple hair, white background, matching style
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=ffffff&glassesProbability=0&jewelryProbability=0'
  },
  {
    id: 'geo_minimal',
    name: 'Minimal',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMyIiBmaWxsPSIjNDc1NTY5Ii8+PC9zdmc+'
  },
  {
    id: 'geo_grid',
    name: 'Grid',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UzZThmOCIvPjxyZWN0IHg9IjI4IiB5PSIyOCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzYzNjZmMSIvPjxyZWN0IHg9IjUyIiB5PSIyOCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzYzNjZmMSIvPjxyZWN0IHg9IjI4IiB5PSI1MiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzYzNjZmMSIvPjxyZWN0IHg9IjUyIiB5PSI1MiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzYzNjZmMSIvPjwvc3ZnPg=='
  },
  {
    id: 'geo_split',
    name: 'Horizon',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzNDE1NSIvPjxwYXRoIGQ9Ik0wIDAgTDEwMCAxMDAgTDAgMTAwIFoiIGZpbGw9IiMwZjE3MmEiLz48Y2lyY2xlIGN4PSI3NSIgY3k9IjI1IiByPSIxMiIgZmlsbD0iIzM4YmRmOCIvPjwvc3ZnPg=='
  },
  {
    id: 'geo_orbit',
    name: 'Orbit',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzEwYjk4MSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMwIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iOCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=='
  },
  {
    id: 'geo_stripes',
    name: 'Stripes',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZmFmYyIvPjxyZWN0IHg9Ii0yMCIgeT0iNDAiIHdpZHRoPSIxNDAiIGhlaWdodD0iMjAiIGZpbGw9IiNmNDNmNWUiIHRyYW5zZm9ybT0icm90YXRlKC00NSA1MCA1MCkiLz48cmVjdCB4PSItMjAiIHk9IjcwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjQzZjVlIiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUgNTAgNTApIi8+PC9zdmc+'
  },
  {
    id: 'geo_cross',
    name: 'Intersection',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UyZThmMCIvPjxyZWN0IHg9IjQwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAwIiBmaWxsPSIjOGI1Y2Y2Ii8+PHJlY3QgeD0iMCIgeT0iNDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAiIGZpbGw9IiM4YjVjZjYiLz48L3N2Zz4='
  },
  {
    id: 'geo_wedge',
    name: 'Wedge',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ3NTU2OSIvPjxwYXRoIGQ9Ik01MCA1MCBMNTAgMCBBNTAgNTAgMCAwIDEgMTAwIDUwIFoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4='
  },
  {
    id: 'geo_dots',
    name: 'Particles',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEwIiBmaWxsPSIjZmFjYzE1Ii8+PGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMTUiIGZpbGw9IiNmYWNjMTUiLz48Y2lyY2xlIGN4PSI3MCIgY3k9IjMwIiByPSI1IiBmaWxsPSIjZmFjYzE1Ii8+PC9zdmc+'
  }
];

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(storageService.getUser());
  const [username, setUsername] = useState('');
  const [selectedAvatarType, setSelectedAvatarType] = useState<'google' | 'default'>('google');
  const [selectedDefaultId, setSelectedDefaultId] = useState<string>(AVATAR_PRESETS[0].id);

  useEffect(() => {
    const currentUser = storageService.getUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    setUsername(currentUser.name);
    
    // Initialize state from existing user preferences if any
    if (currentUser.avatarType === 'default') {
        setSelectedAvatarType('default');
        const matched = AVATAR_PRESETS.find(da => da.url === currentUser.avatar);
        if (matched) setSelectedDefaultId(matched.id);
    }
  }, [navigate]);

  const handleSave = () => {
    if (!username.trim()) return;

    const finalAvatarUrl = selectedAvatarType === 'google' 
      ? mockUser.avatar
      : AVATAR_PRESETS.find(a => a.id === selectedDefaultId)?.url || AVATAR_PRESETS[0].url;

    storageService.updateUser({
      name: username,
      avatar: finalAvatarUrl,
      avatarType: selectedAvatarType
    });

    navigate('/dashboard');
  };

  const getPreviewUrl = () => {
      if (selectedAvatarType === 'google') return mockUser.avatar;
      const found = AVATAR_PRESETS.find(a => a.id === selectedDefaultId);
      return found ? found.url : AVATAR_PRESETS[0].url;
  };

  const isFormValid = username.trim().length > 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans">
      
      {/* Top Bar for Context */}
      <div className="border-b border-[var(--border-light)] bg-[var(--bg-card)] sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => navigate('/')} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Cancel
              </button>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-3 text-[var(--text-primary)]">
            Create your profile
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Set up your identity on Scribra. Your profile info will be visible on your published posts and can be edited later.
          </p>
        </div>

        <div className="divide-y divide-[var(--border-light)]">
          
          {/* Display Name Section */}
          <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                Display Name
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                This will be shown next to your blog posts and comments.
              </p>
            </div>
            
            <div className="md:col-span-8 max-w-md">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                className="w-full px-4 py-3 text-base border border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all placeholder-[var(--text-muted)] shadow-sm"
                placeholder="e.g. Alex Writer"
              />
              <div className="flex justify-between items-center mt-2 px-1">
                 <p className="text-xs text-[var(--text-muted)]">
                   Max 30 characters
                 </p>
                 <span className={`text-xs font-medium ${username.length > 25 ? 'text-orange-500' : 'text-[var(--text-muted)]'}`}>
                   {username.length}/30
                 </span>
              </div>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                Profile Picture
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Select a profile image. You can use your Google account photo or choose from our neutral avatar collection.
              </p>
            </div>

            <div className="md:col-span-8">
               <div className="flex flex-col sm:flex-row gap-8 items-start">
                  
                  {/* Left: Preview */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-28 h-28 rounded-full overflow-hidden bg-[var(--bg-muted)] shadow-md ring-4 ring-[var(--bg-card)] mb-4 transition-all">
                          <img 
                            src={getPreviewUrl()} 
                            alt="Profile Preview" 
                            className="w-full h-full object-cover"
                          />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Preview</span>
                  </div>

                  {/* Right: Selection Grid */}
                  <div className="flex-1 w-full">
                      <label className="text-sm font-medium text-[var(--text-primary)] block mb-4">
                          Choose an avatar
                      </label>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
                          {/* 1. Google Option */}
                          <button
                            onClick={() => setSelectedAvatarType('google')}
                            type="button"
                            className={`group relative aspect-square rounded-full overflow-hidden transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-page)] ${
                              selectedAvatarType === 'google' 
                                ? 'ring-2 ring-offset-2 ring-[var(--accent-primary)] ring-offset-[var(--bg-page)] scale-100 shadow-md z-10' 
                                : 'ring-1 ring-[var(--border-light)] hover:ring-[var(--text-secondary)] hover:scale-105 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'
                            }`}
                            aria-label="Use Google Profile Picture"
                            aria-pressed={selectedAvatarType === 'google'}
                          >
                               <img src={mockUser.avatar} alt="Google" className="w-full h-full object-cover" />
                               {selectedAvatarType === 'google' && (
                                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center animate-in zoom-in duration-200">
                                   <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                                 </div>
                               )}
                               {/* Badge for 'Google' */}
                               <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5">GOOGLE</div>
                          </button>

                          {/* 2. Geometric Defaults */}
                          {AVATAR_PRESETS.map((avatar) => {
                              const isSelected = selectedAvatarType === 'default' && selectedDefaultId === avatar.id;
                              return (
                                  <button
                                    key={avatar.id}
                                    onClick={() => {
                                        setSelectedAvatarType('default');
                                        setSelectedDefaultId(avatar.id);
                                    }}
                                    type="button"
                                    className={`group relative aspect-square rounded-full overflow-hidden transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-page)] ${
                                      isSelected 
                                        ? 'ring-2 ring-offset-2 ring-[var(--accent-primary)] ring-offset-[var(--bg-page)] scale-100 shadow-md z-10' 
                                        : 'ring-1 ring-[var(--border-light)] hover:ring-[var(--text-secondary)] hover:scale-105 opacity-80 hover:opacity-100'
                                    }`}
                                    aria-label={`Select ${avatar.name} avatar`}
                                    aria-pressed={isSelected}
                                    title={avatar.name}
                                  >
                                      <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center animate-in zoom-in duration-200">
                                          <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                                        </div>
                                      )}
                                  </button>
                              );
                          })}
                      </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="py-10 flex flex-col sm:flex-row justify-end items-center gap-4">
             <div className="text-sm text-[var(--text-secondary)] mr-auto hidden sm:block">
                You can change these details later in your settings.
             </div>
             <Button 
                onClick={handleSave} 
                disabled={!isFormValid}
                size="lg"
                className="w-full sm:w-auto min-w-[160px] font-semibold"
            >
                Complete Setup
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
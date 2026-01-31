
import React, { useState } from 'react';
import { MOCK_USER } from '../constants';
import { UserPost } from '../types';
import { getAIPostCaption } from '../services/geminiService';

const IonIcon = 'ion-icon' as any;

const Profile: React.FC = () => {
  const [posts, setPosts] = useState<UserPost[]>(MOCK_USER.posts);
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleMagicCaption = async () => {
    if (!newImage) return;
    setLoadingAI(true);
    try {
      const caption = await getAIPostCaption(newImage.split(',')[1]);
      setNewTitle(caption);
    } catch (e) { console.error(e); } finally { setLoadingAI(false); }
  };

  const handlePost = () => {
    if (!newTitle || !newImage) return;
    const post: UserPost = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      image: newImage,
      likes: 0,
      comments: 0
    };
    setPosts([post, ...posts]);
    setIsPosting(false);
    setNewTitle('');
    setNewImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setNewImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 pb-32 space-y-10 max-w-lg mx-auto pt-16 animate-fade-in">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[45px] overflow-hidden border-4 border-neutral-900 shadow-3xl">
            <img src={MOCK_USER.avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#FF2D55] w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-black font-black text-sm shadow-xl">Lv.{MOCK_USER.level} 🎖️</div>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">{MOCK_USER.name} ✔️</h1>
          <p className="text-white/30 font-black uppercase tracking-[0.2em] text-[10px] mt-1">Master Chef • Rank #1,204 🏆</p>
        </div>
      </div>

      <div className="bg-neutral-900/40 rounded-[40px] p-7 border border-white/5 flex justify-between shadow-2xl backdrop-blur-md">
        <StatItem value={posts.length.toString()} label="Cooked 🍳" />
        <StatItem value="1.2k" label="Points 💎" />
        <StatItem value="89" label="Followers 👤" />
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-black tracking-tight px-2">Cookbook 📖</h3>
        <div className="grid grid-cols-2 gap-5">
          <button onClick={() => setIsPosting(true)} className="aspect-square bg-neutral-900/60 border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center gap-3 hover:bg-neutral-800 transition-all group shadow-xl">
            <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">➕</div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Post New 📸</span>
          </button>
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-square rounded-[40px] overflow-hidden group shadow-2xl animate-fade-in">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                <p className="text-xs font-black truncate uppercase tracking-wider mb-2">{post.title}</p>
                <div className="flex gap-4 text-[10px] font-black text-white/60"><span>❤️ {post.likes}</span> <span>💬 {post.comments}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isPosting && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsPosting(false)}></div>
          <div className="relative w-full max-w-md bg-neutral-900 rounded-[50px] p-8 border border-white/10 shadow-3xl space-y-8">
            <div className="text-center">
              <h4 className="text-2xl font-black uppercase tracking-tighter">Share Creation 🥘</h4>
              <p className="text-white/40 text-sm font-medium">Post to the community.</p>
            </div>
            <div className="space-y-6">
              <div className="relative aspect-video rounded-3xl bg-black overflow-hidden border border-white/5 flex items-center justify-center shadow-inner">
                {newImage ? <img src={newImage} className="w-full h-full object-cover" /> : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <IonIcon name="image-outline" style={{ fontSize: '40px' }} className="text-white/20"></IonIcon>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Upload Photo 📤</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
                {newImage && <button onClick={() => setNewImage(null)} className="absolute top-2 right-2 bg-black/60 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md"><IonIcon name="close"></IonIcon></button>}
              </div>

              <div className="relative">
                <input type="text" placeholder="Recipe Title... 🥣" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-black border border-white/5 p-5 rounded-2xl font-black text-sm focus:border-[#FF2D55] outline-none transition-colors pr-12 text-white/90" />
                {newImage && (
                  <button onClick={handleMagicCaption} disabled={loadingAI} className="absolute right-3 top-3 w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white active:scale-90 transition-all shadow-lg">
                    {loadingAI ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : '✨'}
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsPosting(false)} className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white/20 hover:text-white/40">Cancel ✖️</button>
              <button onClick={handlePost} disabled={!newTitle || !newImage} className="flex-[2] py-5 bg-[#FF2D55] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-30 active:scale-95 transition-transform">Publish 🚀</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ value, label }: { value: string, label: string }) => (
  <div className="text-center flex-1 last:border-none border-r border-white/5">
    <p className="text-3xl font-black tracking-tighter">{value}</p>
    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mt-1">{label}</p>
  </div>
);

export default Profile;

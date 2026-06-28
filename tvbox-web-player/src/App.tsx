import { useState } from 'react';
import { Settings2, Film, ChevronLeft } from 'lucide-react';
import { HlsPlayer } from './HlsPlayer';

interface Site {
  key: string;
  name: string;
  type: number;
  api: string;
}

interface Category {
  type_id: string;
  type_name: string;
}

interface Video {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;
}

interface VideoDetail extends Video {
  vod_play_url: string;
}

const PROXY_URL = '/api/proxy?url=';

function App() {
  const [configUrl, setConfigUrl] = useState('http://tv.nxog.top');
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoDetail | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Parse TVBox Config
  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(PROXY_URL + encodeURIComponent(configUrl));
      const data = await res.json();
      // Only type 1 is standard MacCMS JSON that we can easily parse in frontend
      const type1Sites = data.sites.filter((s: Site) => s.type === 1);
      setSites(type1Sites);
    } catch (e) {
      alert('加载配置失败，请检查线路地址或网络状态');
    }
    setLoading(false);
  };

  // Load Categories for Site
  const loadSite = async (site: Site) => {
    setActiveSite(site);
    setActiveVideo(null);
    setVideos([]);
    setLoading(true);
    try {
      const url = `${site.api}?ac=list`;
      const res = await fetch(PROXY_URL + encodeURIComponent(url));
      const data = await res.json();
      setCategories(data.class || []);
      setVideos(data.list || []);
      if (data.class && data.class.length > 0) {
        setActiveCategory(data.class[0].type_id);
      }
    } catch (e) {
      console.error(e);
      alert('加载资源库失败');
    }
    setLoading(false);
  };

  // Load Videos for Category
  const loadCategory = async (type_id: string) => {
    if (!activeSite) return;
    setActiveCategory(type_id);
    setLoading(true);
    try {
      const url = `${activeSite.api}?ac=detail&t=${type_id}&pg=1`;
      const res = await fetch(PROXY_URL + encodeURIComponent(url));
      const data = await res.json();
      setVideos(data.list || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Load Video Detail
  const loadVideoDetail = async (vod_id: string) => {
    if (!activeSite) return;
    setLoading(true);
    try {
      const url = `${activeSite.api}?ac=detail&ids=${vod_id}`;
      const res = await fetch(PROXY_URL + encodeURIComponent(url));
      const data = await res.json();
      if (data.list && data.list.length > 0) {
        setActiveVideo(data.list[0]);
        // Simple parse for first play url
        const urls = data.list[0].vod_play_url;
        if (urls) {
          const firstUrl = urls.split('#')[0].split('$')[1];
          if (firstUrl) setPlayingUrl(firstUrl);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ margin: '16px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Film size={24} color="var(--accent)" />
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>TVBox Web Player</h1>
        
        <div style={{ flex: 1 }} />
        
        <input 
          className="input" 
          style={{ maxWidth: '400px' }}
          value={configUrl}
          onChange={(e) => setConfigUrl(e.target.value)}
          placeholder="TVBox 接口地址"
        />
        <button className="btn primary" onClick={loadConfig} disabled={loading}>
          <Settings2 size={16} /> 载入配置
        </button>
      </header>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '0 16px 16px 16px', gap: '16px' }}>
        
        {/* Sidebar - Sites */}
        <div className="glass-panel" style={{ width: '250px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', fontWeight: 600 }}>
            可用线路 (Type 1)
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {sites.map(site => (
              <div 
                key={site.key}
                onClick={() => loadSite(site)}
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  background: activeSite?.key === site.key ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: activeSite?.key === site.key ? 'var(--accent)' : 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                {site.name}
              </div>
            ))}
            {sites.length === 0 && !loading && (
              <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
                请先载入配置
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {activeVideo ? (
            // Video Player View
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', overflowY: 'auto' }}>
              <button className="btn" onClick={() => setActiveVideo(null)} style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
                <ChevronLeft size={16} /> 返回列表
              </button>
              
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
                {playingUrl ? (
                  <HlsPlayer src={playingUrl} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    {loading ? '解析视频流中...' : '无可用播放地址'}
                  </div>
                )}
              </div>
              
              <h2>{activeVideo.vod_name}</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: activeVideo.vod_remarks || '暂无简介' }} />
              
              <div style={{ marginTop: '24px' }}>
                <h3>选集</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {activeVideo.vod_play_url?.split('$$$').map((source, sIdx) => {
                    const eps = source.split('#');
                    return eps.map((ep, eIdx) => {
                      const [title, url] = ep.split('$');
                      if (!url) return null;
                      return (
                        <button 
                          key={`${sIdx}-${eIdx}`}
                          className={`btn ${playingUrl === url ? 'primary' : ''}`}
                          onClick={() => setPlayingUrl(url)}
                        >
                          {title || `第${eIdx+1}集`}
                        </button>
                      );
                    });
                  })}
                </div>
              </div>
            </div>
          ) : (
            // Video List View
            <>
              {/* Categories */}
              {categories.length > 0 && (
                <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  {categories.map(cat => (
                    <button 
                      key={cat.type_id}
                      className={`btn ${activeCategory === cat.type_id ? 'primary' : ''}`}
                      onClick={() => loadCategory(cat.type_id)}
                      style={{ borderRadius: '20px' }}
                    >
                      {cat.type_name}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', alignContent: 'start' }}>
                {videos.map(video => (
                  <div 
                    key={video.vod_id} 
                    className="animate-fade-in"
                    onClick={() => loadVideoDetail(video.vod_id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', position: 'relative', marginBottom: '8px' }}>
                      <img 
                        src={video.vod_pic} 
                        alt={video.vod_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Image'; }}
                      />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', fontSize: '12px', color: '#fff' }}>
                        {video.vod_remarks}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {video.vod_name}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    加载中...
                  </div>
                )}
                {!loading && videos.length === 0 && activeSite && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    暂无数据
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;

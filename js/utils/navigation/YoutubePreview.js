const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;
};

class YoutubePreview {
  constructor() {
    this.tooltipElement = null;
    this.cache = new Map();
    this.preloadedThumbnails = new Map();
    this.currentLink = null;
    this.preloadTimeout = null;
    if (!isMobile()) {
      this.initTooltip();
      this.initEventListeners();
    }
  }

  initTooltip() {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'youtube-tooltip';
    document.body.appendChild(this.tooltipElement);
  }
  
  initEventListeners() {
    // Start preloading on mouseover
    document.addEventListener('mouseover', (e) => {
      if (!(e.target instanceof Element)) return;
      
      const link = e.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
      if (link && this.currentLink !== link) {
        this.currentLink = link;
        this.preloadTimeout = setTimeout(() => this.preloadVideoData(link), 50);
      }
    }, true);

    // Show tooltip immediately if data is preloaded
    document.addEventListener('mouseenter', (e) => {
      if (!(e.target instanceof Element)) return;
      
      const link = e.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
      if (link) {
        this.handleMouseEnter(e, link);
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      if (!(e.target instanceof Element)) return;
      
      const link = e.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
      if (link) {
        this.currentLink = null;
        if (this.preloadTimeout) {
          clearTimeout(this.preloadTimeout);
        }
        this.hideTooltip();
      }
    }, true);

    document.addEventListener('mousemove', (e) => {
      if (!(e.target instanceof Element)) return;
      
      const link = e.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
      if (link) {
        this.updateTooltipPosition(e);
      }
    }, true);
  }

  async preloadVideoData(link) {
    const videoId = this.extractVideoId(link.href);
    if (!videoId || this.cache.has(videoId)) return;

    try {
      const videoInfo = await this.fetchVideoInfo(videoId);
      this.cache.set(videoId, videoInfo);
      
      // Preload thumbnail
      if (!this.preloadedThumbnails.has(videoId)) {
        const img = new Image();
        img.src = videoInfo.thumbnailUrl;
        this.preloadedThumbnails.set(videoId, img);
      }
    } catch (error) {
      console.error('Error preloading video data:', error);
    }
  }

  async handleMouseEnter(event, link) {
    const videoId = this.extractVideoId(link.href);
    if (!videoId) return;

    try {
      let videoInfo;
      if (this.cache.has(videoId)) {
        videoInfo = this.cache.get(videoId);
      } else {
        videoInfo = await this.fetchVideoInfo(videoId);
        this.cache.set(videoId, videoInfo);
      }
      this.showTooltip(videoInfo, event);
    } catch (error) {
      console.error('Error fetching video information:', error);
    }
  }

  extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  async fetchVideoInfo(videoId) {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      
      // Get the best available thumbnail with fallback to the oembed thumbnail
      const thumbnailUrl = await this.getBestThumbnail(videoId, data.thumbnail_url);
      
      return {
        ...data,
        thumbnailUrl,
        videoId
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      return {
        title: 'YouTube Video',
        author_name: 'YouTube Channel',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        videoId
      };
    }
  }

  async getBestThumbnail(videoId, fallbackUrl) {
    // Try highest quality first
    try {
      const hqUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const img = new Image();
      const imageLoaded = await new Promise((resolve) => {
        img.onload = () => {
          // Check if we got the default "no thumbnail" image
          // by checking its dimensions (120x90 or 480x360)
          resolve(img.width !== 120 && img.height !== 90);
        };
        img.onerror = () => resolve(false);
        img.src = hqUrl;
      });

      if (imageLoaded) {
        return hqUrl;
      }
    } catch (error) {
      console.error('Error loading HQ thumbnail:', error);
    }

    // Return the oembed thumbnail URL if HQ version failed or showed "no thumbnail" image
    return fallbackUrl;
  }

  checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

   showTooltip(videoInfo, event) {
    const isDarkMode = document.documentElement.classList.contains('dark');
	
	  // Set all styles including theme-dependent ones
    this.tooltipElement.style.cssText = `
      position: fixed;
      background: ${isDarkMode ? 'linear-gradient(to bottom, #27292a 0%, #1f2122 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%)'};
      border-radius: 16px;
      padding: 12px;
      box-shadow: ${isDarkMode ? 
        '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)' : 
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)'};
      display: none;
      z-index: 1000;
      width: 320px;
      font-family: "RobotoSerif", serif;
      transition: opacity 0.15s ease, transform 0.15s ease;
      opacity: 0;
      pointer-events: none;
      transform: translateY(4px);
      will-change: transform, opacity;
    `;
	
    const playIcon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;

    this.tooltipElement.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="position: relative;">
          <div style="width: 100%; padding-top: 56.25%; position: relative; border-radius: 12px; overflow: hidden;">
            <img src="${videoInfo.thumbnailUrl}" 
                 alt="Thumbnail" 
                 style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
        <div style="padding: 0 4px;">
          <div style="
            font-family: 'RobotoSerif Medium', serif;
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 4px;
            color: ${isDarkMode ? 'var(--off-white)' : 'black'};
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          ">${videoInfo.title}</div>
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <span style="
              background: #FF0000;
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-family: 'RobotoSerif Medium', serif;
            ">YouTube</span>
            <span style="
              color: ${isDarkMode ? 'var(--off-white)' : 'black'};
              font-size: 13px;
            ">${videoInfo.author_name}</span>
          </div>
        </div>
      </div>
    `;
    
    this.tooltipElement.style.display = 'block';
    this.tooltipElement.style.opacity = '1';
    this.tooltipElement.style.transform = 'translateY(0)';
    this.updateTooltipPosition(event);
  }

  updateTooltipPosition(event) {
    const tooltip = this.tooltipElement;
    const margin = 20;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipRect = tooltip.getBoundingClientRect();
    const cursorY = event.clientY;
    const cursorX = event.clientX;

    const spaceAbove = cursorY;
    const spaceBelow = viewportHeight - cursorY;
    const spaceRight = viewportWidth - cursorX;
    const spaceLeft = cursorX;

    let top, left;

    if (spaceAbove > tooltipRect.height + margin) {
      top = cursorY - tooltipRect.height - margin;
    } else if (spaceBelow > tooltipRect.height + margin) {
      top = cursorY + margin;
    } else {
      top = Math.max(margin, Math.min(viewportHeight - tooltipRect.height - margin,
        (viewportHeight - tooltipRect.height) / 2));
    }

    if (spaceRight > tooltipRect.width + margin) {
      left = cursorX + margin;
    } else if (spaceLeft > tooltipRect.width + margin) {
      left = cursorX - tooltipRect.width - margin;
    } else {
      left = Math.max(margin, Math.min(viewportWidth - tooltipRect.width - margin,
        (viewportWidth - tooltipRect.width) / 2));
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  hideTooltip() {
    this.tooltipElement.style.opacity = '0';
    this.tooltipElement.style.transform = 'translateY(4px)';
    setTimeout(() => {
      this.tooltipElement.style.display = 'none';
    }, 150);
  }
}

export default YoutubePreview;

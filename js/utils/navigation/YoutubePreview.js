import fetchAvailableVideos from '../loadContent/fetchAvailableVideos.js';

class YoutubePreview {
	constructor() {
		this.tooltipElement = null;
		this.cache = new Map();
		this.currentLink = null;
		this.preloadTimeout = null;
		this.showTooltipTimeout = null;
		this.hideTooltipTimeout = null;
		this.isMobileDevice = this.checkIfMobile();
		this.initTooltip();
		this.addYouTubeStyles();
		this.initEventListeners();
	}

	async checkConnectivity() {
		try {
			const videoId = "jNQXAC9IVRw"; // Using a known valid video ID
			const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`, {
				method: 'GET'
			});
			return response.ok;
		} catch (error) {
			return false;
		}
	}

	checkIfMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			window.innerWidth <= 768;
	}

	addYouTubeStyles() {
		const styleSheet = document.createElement("style");
		styleSheet.textContent = `
        a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none !important;
          padding: 2px 8px 2px 8px;
          border-radius: 6px;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          background: rgba(255, 0, 0, 0.1);
          color: var(--blue);
        }

        .dark a[href*="youtube.com"]:not(.links-area a), .dark a[href*="youtu.be"]:not(.links-area a) {
          background: rgba(255, 0, 0, 0.4);
          color: var(--off-white);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      
        a[href*="youtube.com"]:not(.links-area a):hover, a[href*="youtu.be"]:not(.links-area a):hover {
          background: rgba(255, 0, 0, 0.15);
        }

        .dark a[href*="youtube.com"]:not(.links-area a):hover, .dark a[href*="youtu.be"]:not(.links-area a):hover {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
		  transform: translateY(-1px);
        }
      
        a[href*="youtube.com"]:not(.links-area a)::before, a[href*="youtu.be"]:not(.links-area a)::before {
          content: '';
          width: 16px;
          height: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 461.001 461.001' fill='%23ff0000'%3E%3Cpath d='M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728 c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137 C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607 c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          flex-shrink: 0;
        }
      
        .dark a[href*="youtube.com"]:not(.links-area a)::before, .dark a[href*="youtu.be"]:not(.links-area a)::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 461.001 461.001' fill='%23ff0000'%3E%3Cpath d='M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728 c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137 C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607 c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z'/%3E%3C/svg%3E");
        }
      `;
		document.head.appendChild(styleSheet);
	}

	initTooltip() {
		this.tooltipElement = document.createElement('div');
		this.tooltipElement.className = 'youtube-tooltip';
		document.body.appendChild(this.tooltipElement);
	}

	initEventListeners() {
		if (this.isMobileDevice) {
			document.addEventListener('click', (e) => {
				if (!(e.target instanceof Element)) return;

				const link = e.target.closest('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');
				const tooltipClick = e.target.closest('.youtube-tooltip');

				if (link && !tooltipClick) {
					e.preventDefault();
					this.handleMobileClick(e, link);
				} else if (tooltipClick && this.currentLink) {
					window.location.href = this.currentLink.href;
				} else if (!tooltipClick) {
					this.hideTooltip();
				}
			});
			return;
		}

		document.addEventListener('mouseenter', (e) => {
			if (!(e.target instanceof Element)) return;

			const link = e.target.closest('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');
			if (link) {
				if (this.hideTooltipTimeout) {
					clearTimeout(this.hideTooltipTimeout);
					this.hideTooltipTimeout = null;
				}

				if (this.showTooltipTimeout) {
					clearTimeout(this.showTooltipTimeout);
				}
				this.showTooltipTimeout = setTimeout(() => {
					this.handleMouseEnter(e, link);
				}, 50);
			}
		}, true);

		document.addEventListener('mouseleave', (e) => {
			if (!(e.target instanceof Element)) return;

			const link = e.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
			if (link) {
				if (this.showTooltipTimeout) {
					clearTimeout(this.showTooltipTimeout);
					this.showTooltipTimeout = null;
				}

				if (this.hideTooltipTimeout) {
					clearTimeout(this.hideTooltipTimeout);
				}
				this.hideTooltipTimeout = setTimeout(() => {
					this.hideTooltip();
				}, 50);
			}
		}, true);

		let lastMoveTime = 0;
		document.addEventListener('mousemove', (e) => {
			const now = Date.now();
			if (now - lastMoveTime < 16) return;
			lastMoveTime = now;

			if (!(e.target instanceof Element)) return;

			const link = e.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
			if (link && this.tooltipElement.style.display === 'block') {
				this.updateTooltipPosition(e);
			}
		}, {
			passive: true
		});
	}

	async handleMouseEnter(event, link) {
		const videoId = this.extractVideoId(link.href);
		if (!videoId) return;

		try {
			const isOnline = await this.checkConnectivity();
			if (isOnline) {
				let videoInfo = this.cache.get(videoId);
				if (!videoInfo) {
					videoInfo = await this.fetchVideoInfo(videoId);
					this.cache.set(videoId, videoInfo);
				}
				this.showTooltip(videoInfo, event);
			} else {
				const availableVideos = await fetchAvailableVideos();
				const videoInfo = availableVideos.find(v => v.video_id === videoId);
				if (videoInfo) {
					this.showOfflineTooltip(videoInfo, event);
				}
			}
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

	showOfflineTooltip(videoInfo, event) {
		const isDarkMode = document.documentElement.classList.contains('dark');

		this.tooltipElement.style.cssText = `
		  position: fixed;
		  background: ${isDarkMode ? 'linear-gradient(to bottom, #27292a 0%, #1f2122 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%)'};
		  border-radius: 16px;
		  padding: 12px;
		  box-shadow: ${isDarkMode ? 
			'0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)' : 
			'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)'};
		  display: block;
		  z-index: 1000;
		  width: 300px;
		  font-family: "RobotoSerif", serif;
		  opacity: 0;
		  pointer-events: none;
		  transform: translateY(4px);
		  will-change: transform, opacity;
		  transition: opacity 0.15s ease, transform 0.15s ease;
		`;

		this.tooltipElement.innerHTML = `
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
                ">Hillside Hermitage</span>
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

	async handleMobileClick(event, link) {
		this.currentLink = link;
		const videoId = this.extractVideoId(link.href);
		if (!videoId) return;

		try {
			const isOnline = await this.checkConnectivity();
			if (isOnline) {
				let videoInfo = this.cache.get(videoId);
				if (!videoInfo) {
					videoInfo = await this.fetchVideoInfo(videoId);
					this.cache.set(videoId, videoInfo);
				}
				this.showMobileTooltip(videoInfo);
			} else {
				const availableVideos = await fetchAvailableVideos();
				const videoInfo = availableVideos.find(v => v.video_id === videoId);
				if (videoInfo) {
					this.showOfflineMobileTooltip(videoInfo);
				}
			}
		} catch (error) {
			console.error('Error fetching video information:', error);
		}
	}

	showMobileTooltip(videoInfo) {
		const isDarkMode = document.documentElement.classList.contains('dark');

		this.tooltipElement.style.cssText = `
          position: fixed;
          background: ${isDarkMode ? 'linear-gradient(to bottom, #27292a 0%, #1f2122 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%)'};
          border-radius: 16px;
          padding: 12px;
          box-shadow: ${isDarkMode ? 
            '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)' : 
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)'};
          display: block;
          z-index: 1000;
          width: 90%;
          max-width: 500px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-family: "RobotoSerif", serif;
          opacity: 1;
        `;

		const playIcon = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;

		this.tooltipElement.innerHTML = `
          <div style="position: relative;">
            <div style="position: absolute; top: 8px; right: 8px; z-index: 1;">
              <button style="
                background: rgba(0, 0, 0, 0.5);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
			    border: 2px solid rgba(255, 255, 255);
		    	backdrop-filter: blur(1px);
              " onclick="event.stopPropagation(); this.closest('.youtube-tooltip').style.display='none'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="position: relative;">
                <div style="width: 100%; padding-top: 56.25%; position: relative; border-radius: 12px; overflow: hidden; background: #000;">
                  <img src="${videoInfo.thumbnailUrl}" 
                       alt="Thumbnail" 
                       style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 40px;
                    height: 40px;
                    background: rgba(0, 0, 0, 0.7);
                    border: 2px solid rgba(255, 255, 255);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    backdrop-filter: blur(1px);
                  ">
                    ${playIcon}
                  </div>
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
          </div>
        `;
	}

	showOfflineMobileTooltip(videoInfo) {
		const isDarkMode = document.documentElement.classList.contains('dark');

		this.tooltipElement.style.cssText = `
		  position: fixed;
		  background: ${isDarkMode ? 'linear-gradient(to bottom, #27292a 0%, #1f2122 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%)'};
		  border-radius: 16px;
		  padding: 12px;
		  box-shadow: ${isDarkMode ? 
			'0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)' : 
			'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)'};
		  display: block;
		  z-index: 1000;
		  width: 90%;
		  max-width: 500px;
		  left: 50%;
		  top: 50%;
		  transform: translate(-50%, -50%);
		  font-family: "RobotoSerif", serif;
		  opacity: 1;
		`;

		this.tooltipElement.innerHTML = `
		  <div style="position: relative;">
			<div style="position: absolute; bottom: -9px; right: -9px; z-index: 1;">
			  <button style="
				background: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
				border: none;
				color: ${isDarkMode ? 'var(--off-white)' : 'var(--charcoal)'};
				padding: 2px;
				border-radius: 50%;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 2px solid ${isDarkMode ? 'var(--off-white)' : 'var(--charcoal)'};
			  " onclick="event.stopPropagation(); this.closest('.youtube-tooltip').style.display='none'">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
				  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
				</svg>
			  </button>
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
		    		">Hillside Hermitage</span>
		    	  </div>
		    	</div>
		  </div>
		`;
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

import { fetchAvailableVideos } from '../loadContent/fetchAvailableVideos.js';
import { fetchAvailablePlaylists } from '../loadContent/fetchAvailablePlaylists.js';

class YoutubePreview {
	// Configuration constants
	static MOBILE_BREAKPOINT = 768;
	static THROTTLE_DELAY = 16;

	constructor() {
		this.state = {
			previewElement: null,
			currentLink: null,
			isMobileDevice: this.checkIfMobile(),
			availableVideos: null,
			availablePlaylists: null,
			videoCache: new Map(),
			playlistCache: new Map(),
			videoIndex: new Map(), // videoId -> {channelName, info}
			playlistIndex: new Map(), // playlistId -> {channelName, info}
			preloadedContent: new Map(),
			preloadedImages: new Map(),
			isOnline: null,
			mouseTracker: {
				isOverLink: false,
				isOverPreview: false,
				checkInterval: null
			}
		};

		this.initializeComponents()
			.catch(error => console.error('Initialization failed:', error));
	}

	async initializeComponents() {
		try {
			this.state.isOnline = await this.checkConnectivity();

			if (this.state.isMobileDevice) {
				await Promise.all([
					this.initPreview(),
					this.addYouTubeStyles()
				]);
			} else {
				await Promise.all([
					this.initPreview(),
					this.addYouTubeStyles()
				]);
				
				// Load data first
				await Promise.all([
					this.loadAvailableVideos(),
					this.loadAvailablePlaylists()
				]);
				
				// Then preload previews
				await this.preloadAllPreviews();
			}

			this.initEventListeners();
		} catch (error) {
			console.error('Component initialization failed:', error);
			throw error;
		}
	}

    findVideoInfo(videoId) {
        const indexed = this.state.videoIndex.get(videoId);
        return indexed ? { ...indexed.info, channel: indexed.channelName } : null;
    }

    findPlaylistInfo(playlistId) {
        const indexed = this.state.playlistIndex.get(playlistId);
        return indexed ? { ...indexed.info, channel: indexed.channelName } : null;
    }
	
	async loadAvailableVideos() {
        try {
            const response = await fetchAvailableVideos();
            this.state.availableVideos = response;
            
            if (!response) return;

            // Index for videos
            for (const [channelName, videos] of Object.entries(response)) {
                for (const [videoId, info] of Object.entries(videos)) {
                    this.state.videoIndex.set(videoId, {
                        channelName,
                        info
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load available videos:', error);
            this.state.availableVideos = {};
            this.state.videoIndex.clear();
        }
    }

    async loadAvailablePlaylists() {
        try {
            const response = await fetchAvailablePlaylists();
            this.state.availablePlaylists = response;
            
            if (!response) return;

            // Index for playlists
            for (const [channelName, playlists] of Object.entries(response)) {
                for (const [playlistId, info] of Object.entries(playlists)) {
                    this.state.playlistIndex.set(playlistId, {
                        channelName,
                        info
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load available playlists:', error);
            this.state.availablePlaylists = {};
            this.state.playlistIndex.clear();
        }
    }

	async checkConnectivity() {
		try {
			if (!navigator.onLine) {
				return false;
			}

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 3000);

			const response = await fetch('https://www.youtube.com/favicon.ico', {
				method: 'HEAD',
				mode: 'no-cors',
				signal: controller.signal
			});

			clearTimeout(timeoutId);
			return true;
		} catch (error) {
			console.log('Network check failed, assuming offline:', error);
			return false;
		}
	}

	checkIfMobile() {
		const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
		return mobileRegex.test(navigator.userAgent) ||
			window.innerWidth <= YoutubePreview.MOBILE_BREAKPOINT;
	}

	initPreview() {
		try {
			this.state.previewElement = document.createElement('div');
			this.state.previewElement.className = 'youtube-preview';
			document.body.appendChild(this.state.previewElement);
		} catch (error) {
			console.error('Preview initialization failed:', error);
			throw error;
		}
	}

	addYouTubeStyles() {
		try {
			const styleSheet = document.createElement("style");
			styleSheet.textContent = this.getYoutubeStyles();
			document.head.appendChild(styleSheet);
		} catch (error) {
			console.error('Style initialization failed:', error);
			throw error;
		}
	}

	getYoutubeStyles() {
		return `
            a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a) {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                text-decoration: none !important;
                padding: 1px 8px 1px 8px;
                border-radius: 2px;
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

            .youtube-duration {
                position: absolute;
                right: 16px;
                bottom: 11px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 2px 4px;
                border-radius: 4px;
                font-size: 12px;
                font-family: 'RobotoSerif', serif;
            }
        `;
	}

	initEventListeners() {
		if (this.state.isMobileDevice) {
			this.initMobileEventListeners();
			return;
		}
		this.initDesktopEventListeners();
	}

	initMobileEventListeners() {
		document.addEventListener('click', this.handleMobileEvents.bind(this));
	}

	initDesktopEventListeners() {
		document.addEventListener('mouseover', this.handleMouseEnter.bind(this));
		document.addEventListener('mouseout', this.handleMouseLeave.bind(this));
		document.addEventListener('mousemove', this.handleMouseMove.bind(this), {
			passive: true
		});
		document.addEventListener('click', this.handleDesktopClick.bind(this));
		document.addEventListener('scroll', this.handleScroll.bind(this), {
			passive: true
		});

		this.startHoverCheck();
	}

	startHoverCheck() {
		if (this.state.mouseTracker.checkInterval) {
			clearInterval(this.state.mouseTracker.checkInterval);
		}

		this.state.mouseTracker.checkInterval = setInterval(() => {
			if (!this.state.mouseTracker.isOverLink && !this.state.mouseTracker.isOverPreview) {
				if (this.state.previewElement.style.display === 'block') {
					this.hidePreview();
					this.state.currentLink = null;
				}
			}
		}, 100);
	}

	extractYoutubeId(url) {
		const playlistRegExp = /[?&]list=([^#\&\?]*)/;
		const playlistMatch = url.match(playlistRegExp);

		if (playlistMatch) {
			return {
				type: 'playlist',
				id: playlistMatch[1]
			};
		}

		const videoRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const videoMatch = url.match(videoRegExp);

		if (videoMatch && videoMatch[2].length === 11) {
			return {
				type: 'video',
				id: videoMatch[2]
			};
		}

		return null;
	}

	handleMouseEnter(event) {
        const link = event.target.closest('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');
        const preview = event.target.closest('.youtube-preview');

        if (link) {
            this.state.mouseTracker.isOverLink = true;
            this.state.currentLink = link;

            const result = this.extractYoutubeId(link.href);
            if (!result) return;

            if (result.type === 'playlist') {
                const playlistInfo = this.findPlaylistInfo(result.id);
                if (playlistInfo) {
                    this.showPlaylistPreview(playlistInfo, result.id, event);
                }
            } else if (result.type === 'video') {
                const videoInfo = this.findVideoInfo(result.id);
                if (videoInfo) {
                    this.showPreview(videoInfo, event);
                }
            }
        }

        if (preview) {
            this.state.mouseTracker.isOverPreview = true;
        }
    }
	
	handleMouseLeave(event) {
		const link = event.target.closest('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');
		const preview = event.target.closest('.youtube-preview');

		if (link) {
			this.state.mouseTracker.isOverLink = false;
		}

		if (preview) {
			this.state.mouseTracker.isOverPreview = false;
		}
	}

	handleDesktopClick(event) {
		if (this.state.isMobileDevice) return;

		const clickedPreview = event.target.closest('.youtube-preview');
		const clickedLink = event.target.closest('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');

		if (!clickedPreview && !clickedLink && this.state.previewElement.style.display === 'block') {
			this.hidePreview();
			this.state.currentLink = null;
		}
	}

	handleMouseMove(event) {
		const now = Date.now();
		if (now - this.state.lastMoveTime < YoutubePreview.THROTTLE_DELAY) return;
		this.state.lastMoveTime = now;

		if (!(event.target instanceof Element)) return;

		const link = event.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
		if (link && this.state.previewElement.style.display === 'block') {
			this.updatePreviewPosition(event);
		}
	}

	handleScroll() {
		if (!this.state.isMobileDevice) {
			this.verifyHoverState();
		}
	}

	handleMobileEvents(event) {
		if (!(event.target instanceof Element)) return;

		const link = event.target.closest('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');
		const previewClick = event.target.closest('.youtube-preview');

		if (link && !previewClick) {
			event.preventDefault();
			this.handleMobileClick(event, link);
		} else if (previewClick) {
			if (this.state.currentLink) {
				window.location.href = this.state.currentLink.href;
			}
		} else if (!link && !previewClick) {
			this.hidePreview();
		}
	}

	async handleMobileClick(event, link) {
		event.preventDefault();
		this.state.currentLink = link;

		const result = this.extractYoutubeId(link.href);
		if (!result) return;

		this.showLoadingPreview();

		try {
			const contentData = await this.loadContentData(result.id);

			if (!contentData) {
				this.showErrorPreview();
				return;
			}

			if (contentData.type === 'playlist') {
				this.showMobilePlaylistPreview(contentData.data);
			} else {
				this.showMobilePreview(contentData.data);
			}
		} catch (error) {
			console.error('Failed to handle mobile click:', error);
			this.showErrorPreview();
		}
	}

	verifyHoverState() {
		const hoveredLink = document.querySelector('a[href*="youtube.com"]:hover:not(.links-area a), a[href*="youtu.be"]:hover:not(.links-area a)');
		const hoveredPreview = document.querySelector('.youtube-preview:hover');

		this.state.mouseTracker.isOverLink = !!hoveredLink;
		this.state.mouseTracker.isOverPreview = !!hoveredPreview;

		if (!hoveredLink && !hoveredPreview) {
			this.hidePreview();
			this.state.currentLink = null;
		}
	}

	async preloadAllPreviews() {
		if (!this.state.availableVideos && !this.state.availablePlaylists) return;

		const links = document.querySelectorAll('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');
		const isDarkMode = document.documentElement.classList.contains('dark');

		// Preload pictures for videos if online
		if (this.state.isOnline) {
			const imagePromises = Array.from(links).map(async (link) => {
				const result = this.extractYoutubeId(link.href);
				if (!result || result.type !== 'video') return;

				const videoInfo = this.findVideoInfo(result.id);
				if (!videoInfo?.thumbnails) return;

				const thumbnail = videoInfo.thumbnails.maxresdefault || videoInfo.thumbnails.hqdefault;

				try {
					const img = new Image();
					const loadPromise = new Promise((resolve, reject) => {
						img.onload = resolve;
						img.onerror = reject;
					});
					img.src = thumbnail;
					await loadPromise;
					this.state.preloadedImages.set(result.id, img);
				} catch (error) {
					console.error(`Failed to preload image for ${result.id}:`, error);
				}
			});

			await Promise.allSettled(imagePromises);
		}

		// Preload data
		links.forEach((link) => {
			const result = this.extractYoutubeId(link.href);
			if (!result) return;

			const tempCurrentLink = this.state.currentLink;
			this.state.currentLink = link;

			try {
				if (result.type === 'video') {
					const videoInfo = this.findVideoInfo(result.id);
					if (videoInfo) {
						const preloadedContent = {
							desktop: this.state.isOnline ?
								this.createPreviewContent(videoInfo, isDarkMode) :
								this.createOfflinePreviewContent(videoInfo, isDarkMode),
							mobile: this.state.isOnline ?
								this.createMobilePreviewContent(videoInfo, isDarkMode) :
								this.createOfflineMobilePreviewContent(videoInfo, isDarkMode)
						};
						this.state.preloadedContent.set(result.id, preloadedContent);
					}
				} else if (result.type === 'playlist') {
					const playlistInfo = this.findPlaylistInfo(result.id);
					if (playlistInfo) {
						const preloadedContent = {
							desktop: this.createPlaylistPreviewContent(playlistInfo, isDarkMode),
							mobile: this.createMobilePlaylistPreviewContent(playlistInfo, isDarkMode)
						};
						this.state.preloadedContent.set(result.id, preloadedContent);
					}
				}
			} finally {
				this.state.currentLink = tempCurrentLink;
			}
		});
	}

	async loadContentData(id) {
		// First try caches
		if (this.state.playlistCache.has(id)) {
			return {
				type: 'playlist', 
				data: this.state.playlistCache.get(id)
			};
		}

		if (this.state.videoCache.has(id)) {
			return {
				type: 'video',
				data: this.state.videoCache.get(id)
			};
		}

		try {
			// Load all data 
			await Promise.all([
				this.loadAvailableVideos(),
				this.loadAvailablePlaylists()
			]);

			// check with fresh data
			const videoInfo = this.findVideoInfo(id);
			if (videoInfo) {
				this.state.videoCache.set(id, videoInfo);
				return {
					type: 'video',
					data: videoInfo
				};
			}

			const playlistInfo = this.findPlaylistInfo(id);
			if (playlistInfo) {
				this.state.playlistCache.set(id, playlistInfo);
				return {
					type: 'playlist',
					data: playlistInfo
				};
			}

			return null;
		} catch (error) {
			console.error('Failed to load content data:', error);
			return null; 
		}
	}

	showPreview(videoInfo, event) {
		const result = this.extractYoutubeId(this.state.currentLink.href);
		if (!result) return;

		const preloadedContent = this.state.preloadedContent.get(result.id);

		if (!preloadedContent) {
			console.warn('No preloaded content found for video:', result.id);
			const isDarkMode = document.documentElement.classList.contains('dark');
			const content = this.state.isOnline ?
				this.createPreviewContent(videoInfo, isDarkMode) :
				this.createOfflinePreviewContent(videoInfo, isDarkMode);
			this.renderPreviewContent(content, event);
			return;
		}

		this.renderPreviewContent(preloadedContent.desktop, event);
	}

	showPlaylistPreview(playlistInfo, playlistId, event) {
		const preloadedContent = this.state.preloadedContent.get(playlistId);

		if (!preloadedContent) {
			const isDarkMode = document.documentElement.classList.contains('dark');
			const content = this.createPlaylistPreviewContent(playlistInfo, isDarkMode);
			this.renderPreviewContent(content, event);
			return;
		}

		this.renderPreviewContent(preloadedContent.desktop, event);
	}

	showMobilePreview(videoInfo) {
		const result = this.extractYoutubeId(this.state.currentLink.href);
		if (!result) return;

		const preloadedContent = this.state.preloadedContent.get(result.id);

		if (!preloadedContent) {
			const isDarkMode = document.documentElement.classList.contains('dark');
			const content = this.state.isOnline ?
				this.createMobilePreviewContent(videoInfo, isDarkMode) :
				this.createOfflineMobilePreviewContent(videoInfo, isDarkMode);
			this.renderMobilePreviewContent(content);
			return;
		}

		this.renderMobilePreviewContent(preloadedContent.mobile);
	}

	showMobilePlaylistPreview(playlistInfo) {
		const result = this.extractYoutubeId(this.state.currentLink.href);
		if (!result) return;

		const preloadedContent = this.state.preloadedContent.get(result.id);

		if (!preloadedContent) {
			const isDarkMode = document.documentElement.classList.contains('dark');
			const content = this.createMobilePlaylistPreviewContent(playlistInfo, isDarkMode);
			this.renderMobilePreviewContent(content);
			return;
		}

		this.renderMobilePreviewContent(preloadedContent.mobile);
	}

	showLoadingPreview() {
		const isDarkMode = document.documentElement.classList.contains('dark');
		const loadingContent = {
			styles: this.getMobilePreviewStyles(isDarkMode),
			html: `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
                ">
                    <div style="text-align: center;">
                        <div style="margin-bottom: 8px;">Loading preview...</div>
                        <div style="width: 24px; height: 24px; border: 2px solid; border-radius: 50%; margin: 0 auto; border-right-color: transparent; animation: spin 1s linear infinite;"></div>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            `
		};

		this.renderMobilePreviewContent(loadingContent);
	}

	showErrorPreview() {
		const isDarkMode = document.documentElement.classList.contains('dark');
		const errorContent = {
			styles: this.getMobilePreviewStyles(isDarkMode),
			html: `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
                ">
                    <div style="text-align: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <div style="margin-top: 8px;">Failed to load preview</div>
                    </div>
                </div>
            `
		};

		this.renderMobilePreviewContent(errorContent);
	}

	createPreviewContent(videoInfo, isDarkMode) {
		return {
			styles: this.getPreviewStyles(isDarkMode),
			html: this.getPreviewHTML(videoInfo, isDarkMode)
		};
	}

	createOfflinePreviewContent(videoInfo, isDarkMode) {
		return {
			styles: this.getPreviewStyles(isDarkMode),
			html: this.getOfflinePreviewHTML(videoInfo, isDarkMode)
		};
	}

	createMobilePreviewContent(videoInfo, isDarkMode) {
		return {
			styles: this.getMobilePreviewStyles(isDarkMode),
			html: this.getMobilePreviewHTML(videoInfo, isDarkMode)
		};
	}

	createOfflineMobilePreviewContent(videoInfo, isDarkMode) {
		return {
			styles: this.getMobilePreviewStyles(isDarkMode),
			html: this.getOfflineMobilePreviewHTML(videoInfo, isDarkMode)
		};
	}

	createPlaylistPreviewContent(playlistInfo, isDarkMode) {
		return {
			styles: this.getPreviewStyles(isDarkMode),
			html: this.getPlaylistPreviewHTML(playlistInfo, isDarkMode)
		};
	}

	createMobilePlaylistPreviewContent(playlistInfo, isDarkMode) {
		return {
			styles: this.getMobilePreviewStyles(isDarkMode),
			html: this.getMobilePlaylistPreviewHTML(playlistInfo, isDarkMode)
		};
	}

	renderPreviewContent(content, event) {
		const {
			styles,
			html
		} = content;
		this.state.previewElement.style.cssText = styles;
		this.state.previewElement.innerHTML = html;

		requestAnimationFrame(() => {
			this.state.previewElement.style.display = 'block';
			this.state.previewElement.style.opacity = '1';
			this.state.previewElement.style.transform = 'translateY(0)';
			if (event) {
				this.updatePreviewPosition(event);
			}
		});
	}

	renderMobilePreviewContent(content) {
		const {
			styles,
			html
		} = content;
		this.state.previewElement.style.cssText = styles;
		this.state.previewElement.innerHTML = html;
		this.state.previewElement.style.pointerEvents = 'auto';
		this.state.previewElement.style.cursor = 'pointer';
	}

	updatePreviewPosition(event) {
		const preview = this.state.previewElement;
		const margin = 20;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const previewRect = preview.getBoundingClientRect();
		const {
			clientX: cursorX,
			clientY: cursorY
		} = event;

		const position = this.calculatePreviewPosition({
			previewRect,
			cursorX,
			cursorY,
			viewportWidth,
			viewportHeight,
			margin
		});

		Object.assign(preview.style, position);
	}

	calculatePreviewPosition({
		previewRect,
		cursorX,
		cursorY,
		viewportWidth,
		viewportHeight,
		margin
	}) {
		if (!this.state.initialPosition) {
			const spaceAbove = cursorY;
			const spaceBelow = viewportHeight - cursorY;
			this.state.initialPosition = spaceAbove > previewRect.height + margin ? 'above' : 'below';
		}

		let top;
		if (this.state.initialPosition === 'above') {
			top = cursorY - previewRect.height - margin;
			if (top < margin) {
				top = cursorY + margin;
			}
		} else {
			top = cursorY + margin;
			if (top + previewRect.height + margin > viewportHeight) {
				top = cursorY - previewRect.height - margin;
			}
		}

		let left;
		const spaceRight = viewportWidth - cursorX;
		const spaceLeft = cursorX;

		if (spaceRight > previewRect.width + margin) {
			left = cursorX + margin;
		} else if (spaceLeft > previewRect.width + margin) {
			left = cursorX - previewRect.width - margin;
		} else {
			left = Math.max(margin, Math.min(viewportWidth - previewRect.width - margin,
				(viewportWidth - previewRect.width) / 2));
		}

		if (!this.state.previewElement.style.display === 'none') {
			this.state.initialPosition = null;
		}

		return {
			left: `${left}px`,
			top: `${top}px`
		};
	}

	hidePreview() {
		this.state.previewElement.style.opacity = '0';
		this.state.previewElement.style.transform = 'translateY(4px)';
		this.state.previewElement.style.display = 'none';
		this.state.previewElement.classList.remove('offline');
	}

	getPreviewStyles(isDarkMode) {
		return `
            position: fixed;
            background: ${isDarkMode ? 'linear-gradient(to bottom, #27292a 0%, #1f2122 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%)'};
            border-radius: 16px;
            padding: 12px;
            box-shadow: ${isDarkMode ? 
                '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)' : 
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)'};
            z-index: 1000;
            width: 320px;
            font-family: "RobotoSerif", serif;
            transition: opacity 0.15s ease, transform 0.15s ease;
            opacity: 0;
            pointer-events: none;
            transform: translateY(4px);
            will-change: transform, opacity;
        `;
	}

	getMobilePreviewStyles(isDarkMode) {
		return `
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
            pointer-events: auto;
            cursor: pointer;
        `;
	}

	getPreviewHTML(videoInfo, isDarkMode) {
		return this.state.isOnline ? this.getOnlinePreviewHTML(videoInfo, isDarkMode) : this.getOfflinePreviewHTML(videoInfo, isDarkMode);
	}

	getOnlinePreviewHTML(videoInfo, isDarkMode) {
		const result = this.extractYoutubeId(this.state.currentLink.href);
		if (!result) return '';

		const preloadedImage = this.state.preloadedImages.get(result.id);
		const thumbnailUrl = preloadedImage ? preloadedImage.src :
			(videoInfo.thumbnails.maxresdefault || videoInfo.thumbnails.hqdefault);

		return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="position: relative;">
                    <div style="width: 100%; padding-top: 56.25%; position: relative; border-radius: 12px; overflow: hidden;">
                        <img src="${thumbnailUrl}" 
                             alt="Thumbnail" 
                             style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                    </div>
                </div>
                ${this.getCommonPreviewContent(videoInfo, isDarkMode)}
                <div class="youtube-duration">${videoInfo.duration}</div>
            </div>
        `;
	}

	getOfflinePreviewHTML(videoInfo, isDarkMode) {
		return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 180px;
                ">
                    <div style="
                        text-align: center;
                        color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
                    ">
						<svg height="32" viewBox="0 0 56 56" width="36" xmlns="http://www.w3.org/2000/svg"><path fill="${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'}" d="m47.7696 49.9727c.7032.7031 1.8514.7031 2.5546 0 .6797-.7266.7032-1.8516 0-2.5547l-42.0469-42.0469c-.7031-.7031-1.8515-.7031-2.5781 0-.6797.6797-.6797 1.875 0 2.5547zm1.3123-20.3438c.3984.3985 1.0316.3985 1.4765-.0469l3.0941-3.1171c.3749-.3985.3749-.9141.0701-1.2891-5.4139-6.4219-15.2578-11.3203-25.7109-11.3203-2.2735 0-4.5235.2343-6.7031.6797l6.1875 6.164c8.2734-.164 15.7968 3.0235 21.5858 8.9297zm-43.6171-.0469c.4454.4454 1.1016.4219 1.5234-.0234 2.8125-3 6.1173-5.25 9.75-6.75l-4.9687-4.9688c-3.7969 1.9454-7.0781 4.5-9.4688 7.336-.3281.375-.3046.8906.0704 1.2891zm9.375 9.4219c.4688.4688 1.0782.4453 1.5235-.0703 2.6953-2.9765 7.0078-5.0625 11.3906-5.1094l-5.9532-5.9297c-4.3827 1.1719-8.1327 3.5626-10.5234 6.3985-.3515.3984-.3047.8906.0703 1.2656zm28.6406-2.2968 1.1954-1.1485c.3749-.375.4218-.8672.0703-1.2656-2.25-2.6954-5.7422-4.9454-9.8203-6.1407zm-15.4453 14.6249c.4922 0 .9375-.2578 1.8047-1.1015l5.4844-5.2735c.3516-.3281.4219-.8437.1172-1.2421-1.4766-1.8985-4.2422-3.5391-7.4063-3.5391-3.2344 0-6.0469 1.7109-7.5 3.6797-.2109.3281-.1406.7734.211 1.1015l5.4843 5.2735c.8672.8437 1.3125 1.1015 1.8047 1.1015z"/></svg>
                        <div style="font-size: 14px;">Thumbnail not available offline</div>
                    </div>
                </div>
                ${this.getCommonPreviewContent(videoInfo, isDarkMode)}
                <div class="youtube-duration">${videoInfo.duration}</div>
            </div>
        `;
	}

	// Helper to create correct mobile preview HTML based on online status
	getMobilePreviewHTML(videoInfo, isDarkMode) {
		return this.state.isOnline ?
			this.getOnlineMobilePreviewHTML(videoInfo, isDarkMode) :
			this.getOfflineMobilePreviewHTML(videoInfo, isDarkMode);
	}
	
	getOnlineMobilePreviewHTML(videoInfo, isDarkMode) {
		const thumbnailUrl = videoInfo.thumbnails.maxresdefault || videoInfo.thumbnails.hqdefault;
		const playIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;

		return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="position: relative;">
                    <div style="width: 100%; padding-top: 56.25%; position: relative; border-radius: 12px; overflow: hidden; background: #000;">
                        <img src="${thumbnailUrl}" 
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
                ${this.getCommonPreviewContent(videoInfo, isDarkMode)}
                <div class="youtube-duration">${videoInfo.duration}</div>
            </div>
        `;
	}

	getOfflineMobilePreviewHTML(videoInfo, isDarkMode) {
		return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 180px;
                ">
                    <div style="
                        text-align: center;
                        color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
                    ">
						<svg height="32" viewBox="0 0 56 56" width="36" xmlns="http://www.w3.org/2000/svg"><path fill="${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'}" d="m47.7696 49.9727c.7032.7031 1.8514.7031 2.5546 0 .6797-.7266.7032-1.8516 0-2.5547l-42.0469-42.0469c-.7031-.7031-1.8515-.7031-2.5781 0-.6797.6797-.6797 1.875 0 2.5547zm1.3123-20.3438c.3984.3985 1.0316.3985 1.4765-.0469l3.0941-3.1171c.3749-.3985.3749-.9141.0701-1.2891-5.4139-6.4219-15.2578-11.3203-25.7109-11.3203-2.2735 0-4.5235.2343-6.7031.6797l6.1875 6.164c8.2734-.164 15.7968 3.0235 21.5858 8.9297zm-43.6171-.0469c.4454.4454 1.1016.4219 1.5234-.0234 2.8125-3 6.1173-5.25 9.75-6.75l-4.9687-4.9688c-3.7969 1.9454-7.0781 4.5-9.4688 7.336-.3281.375-.3046.8906.0704 1.2891zm9.375 9.4219c.4688.4688 1.0782.4453 1.5235-.0703 2.6953-2.9765 7.0078-5.0625 11.3906-5.1094l-5.9532-5.9297c-4.3827 1.1719-8.1327 3.5626-10.5234 6.3985-.3515.3984-.3047.8906.0703 1.2656zm28.6406-2.2968 1.1954-1.1485c.3749-.375.4218-.8672.0703-1.2656-2.25-2.6954-5.7422-4.9454-9.8203-6.1407zm-15.4453 14.6249c.4922 0 .9375-.2578 1.8047-1.1015l5.4844-5.2735c.3516-.3281.4219-.8437.1172-1.2421-1.4766-1.8985-4.2422-3.5391-7.4063-3.5391-3.2344 0-6.0469 1.7109-7.5 3.6797-.2109.3281-.1406.7734.211 1.1015l5.4843 5.2735c.8672.8437 1.3125 1.1015 1.8047 1.1015z"/></svg>
                        <div style="font-size: 14px;">Thumbnail not available offline</div>
                    </div>
                </div>
                ${this.getCommonPreviewContent(videoInfo, isDarkMode)}
                <div class="youtube-duration">${videoInfo.duration}</div>
            </div>
        `;
	}
	
	getPlaylistPreviewHTML(playlistInfo, isDarkMode) {
		return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        text-align: center;
                        color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
                    ">
                        <svg height="64" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 64">
				<rect x="0" y="0" width="80" height="45" rx="4" fill="#d0d0d0"/>
				<rect x="5" y="5" width="80" height="45" rx="4" fill="#b0b0b0"/>
				<rect x="10" y="10" width="80" height="45" rx="4" fill="#ff0000"/>
				<path d="M40 25 L60 32.5 L40 40 Z" fill="white"/>
                        </svg>
                        <div style="font-size: 14px;">Playlist</div>
                    </div>
                </div>
                <div style="padding: 0 4px;">
                    <div style="
                        font-family: 'RobotoSerif Medium', serif;
                        font-size: 14px;
                        line-height: 1.4;
                        margin-bottom: 12px;
                        color: ${isDarkMode ? 'var(--off-white)' : 'black'};
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        overflow: hidden;
                    ">${playlistInfo.name}</div>
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
                        ">${playlistInfo.channel}</span>
                    </div>
                </div>
                <div class="youtube-duration">${playlistInfo.video_count} videos</div>
            </div>
        `;
	}

	getMobilePlaylistPreviewHTML(playlistInfo, isDarkMode) {
		return this.getPlaylistPreviewHTML(playlistInfo, isDarkMode);
	}

	getCommonPreviewContent(info, isDarkMode) {
		// Note: 'info' can be either videoInfo or playlistInfo
		const title = 'title' in info ? info.title : info.name;
		const duration = 'duration' in info ? info.duration : `${info.video_count} videos`;
		const channel = 'channel' in info ? info.channel : "";
		
		return `
            <div style="padding: 0 4px;">
                <div style="
                    font-family: 'RobotoSerif Medium', serif;
                    font-size: 14px;
                    line-height: 1.4;
                    margin-bottom: 12px;
                    color: ${isDarkMode ? 'var(--off-white)' : 'black'};
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow: hidden;
                ">${title}</div>
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
                    ">${channel}</span>
                </div>
            </div>
            <div class="youtube-duration">${duration}</div>
        `;
	}
}

export default YoutubePreview;

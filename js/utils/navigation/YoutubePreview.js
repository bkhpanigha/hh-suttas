import {
	fetchAvailableVideos
} from '../loadContent/fetchAvailableVideos.js';

class YoutubePreview {
	// Configuration constants
	static CONNECTIVITY_CHECK_URL = 'https://www.youtube.com';
	static MOBILE_BREAKPOINT = 768;
	static PREVIEW_DELAY = 50;
	static PREVIEW_FADE_DURATION = 150;
	static THROTTLE_DELAY = 16;

	constructor() {
		// Centralized state management for better data organization and access
		this.state = {
			previewElement: null,
			cache: new Map(),
			currentLink: null,
			timeouts: {
				preload: null,
				show: null,
				hide: null
			},
			isMobileDevice: this.checkIfMobile(),
			availableVideos: null,
			lastMoveTime: 0
		};

		this.initializeComponents()
			.catch(error => console.error('Initialization failed:', error));
	}

	// Initialize all components asynchronously using Promise.all for parallel execution
	async initializeComponents() {
		try {
			await Promise.all([
				this.initPreview(),
				this.addYouTubeStyles(),
				this.loadAvailableVideos()
			]);
			this.initEventListeners();
		} catch (error) {
			console.error('Component initialization failed:', error);
			throw error;
		}
	}

	// Fetch available videos with error handling
	async loadAvailableVideos() {
		try {
			this.state.availableVideos = await fetchAvailableVideos();
		} catch (error) {
			console.error('Failed to load available videos:', error);
			this.state.availableVideos = {};
		}
	}

	// Check internet connectivity with timeout using AbortController
	async checkConnectivity() {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			const response = await fetch(YoutubePreview.CONNECTIVITY_CHECK_URL, {
				method: 'HEAD',
				mode: 'no-cors',
				signal: controller.signal
			});
			clearTimeout(timeoutId);
			return true;
		} catch (error) {
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

	// Event handlers for desktop and mobile
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
	}

	async handleMouseEnter(event) {
		const link = event.target.closest('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');
		if (!link) return;

		this.clearTimeouts('hide');
		this.clearTimeouts('show');

		this.state.previewElement.style.display = 'block';

		const videoInfo = await this.getVideoInfo(link);
		if (!videoInfo) return;

		const isOnline = await this.checkConnectivity();
		if (isOnline) {
			this.showPreview(videoInfo, event);
		} else {
			this.showOfflinePreview(videoInfo, event);
		}
	}

	handleMouseLeave(event) {
		if (!(event.target instanceof Element)) return;

		const link = event.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
		if (!link) return;

		this.clearTimeouts('show');
		this.clearTimeouts('hide');

		this.state.timeouts.hide = setTimeout(() => {
			this.hidePreview();
		}, YoutubePreview.PREVIEW_DELAY);
	}

	// Throttled mousemove handler for performance optimization
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

	async handleMobileEvents(event) {
		if (!(event.target instanceof Element)) return;

		const link = event.target.closest('a[href*="youtube.com"]:not(.links-area a), a[href*="youtu.be"]:not(.links-area a)');
		const previewClick = event.target.closest('.youtube-preview');

		if (link && !previewClick) {
			event.preventDefault();
			await this.handleMobileClick(event, link);
		} else if (previewClick && this.state.currentLink && !this.state.previewElement.classList.contains('offline')) {
			window.location.href = this.state.currentLink.href;
		} else if (!previewClick && this.state.previewElement.style.display === 'block') {
			this.hidePreview();
		}
	}

	async handleMobileClick(event, link) {
		this.state.currentLink = link;
		const videoInfo = await this.getVideoInfo(link);
		if (!videoInfo) return;

		const isOnline = await this.checkConnectivity();
		isOnline ? this.showMobilePreview(videoInfo) : this.showOfflineMobilePreview(videoInfo);
	}

	async getVideoInfo(link) {
		const videoId = this.extractVideoId(link.href);
		if (!videoId || !this.state.availableVideos) return null;
		return this.state.availableVideos[videoId];
	}

	// Extract video ID using regex pattern matching
	extractVideoId(url) {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	}

	// Force browser repaint for smooth animations using requestAnimationFrame
	showPreview(videoInfo, event) {
		const previewContent = this.createPreviewContent(videoInfo);
		this.state.previewElement.style.cssText = previewContent.styles;
		this.state.previewElement.innerHTML = previewContent.html;

		// Force repaint
		requestAnimationFrame(() => {
			this.state.previewElement.style.display = 'block';
			this.state.previewElement.style.opacity = '1';
			this.state.previewElement.style.transform = 'translateY(0)';
			this.updatePreviewPosition(event);
		});
	}

	showOfflinePreview(videoInfo, event) {
		const previewContent = this.createOfflinePreviewContent(videoInfo);
		this.renderPreview(previewContent, true);
		this.updatePreviewPosition(event);
	}

	showMobilePreview(videoInfo) {
		const previewContent = this.createMobilePreviewContent(videoInfo);
		this.renderMobilePreview(previewContent, false);
	}

	showOfflineMobilePreview(videoInfo) {
		const previewContent = this.createOfflineMobilePreviewContent(videoInfo);
		this.renderMobilePreview(previewContent, true);
	}

	createPreviewContent(videoInfo) {
		const isDarkMode = document.documentElement.classList.contains('dark');
		return {
			styles: this.getPreviewStyles(isDarkMode, false),
			html: this.getPreviewHTML(videoInfo, isDarkMode, false)
		};
	}

	createOfflinePreviewContent(videoInfo) {
		const isDarkMode = document.documentElement.classList.contains('dark');
		return {
			styles: this.getPreviewStyles(isDarkMode, true),
			html: this.getPreviewHTML(videoInfo, isDarkMode, true)
		};
	}

	createMobilePreviewContent(videoInfo) {
		const isDarkMode = document.documentElement.classList.contains('dark');
		return {
			styles: this.getMobilePreviewStyles(isDarkMode),
			html: this.getMobilePreviewHTML(videoInfo, isDarkMode)
		};
	}

	createOfflineMobilePreviewContent(videoInfo) {
		const isDarkMode = document.documentElement.classList.contains('dark');
		return {
			styles: this.getMobilePreviewStyles(isDarkMode, true),
			html: this.getOfflineMobilePreviewHTML(videoInfo, isDarkMode)
		};
	}

	renderPreview(content, isOffline) {
		const {
			styles,
			html
		} = content;
		this.state.previewElement.style.cssText = styles;
		this.state.previewElement.innerHTML = html;
		if (isOffline) this.state.previewElement.classList.add('offline');

		requestAnimationFrame(() => {
			this.state.previewElement.style.opacity = '1';
			this.state.previewElement.style.transform = 'translateY(0)';
		});
	}

	renderMobilePreview(content, isOffline) {
		const {
			styles,
			html
		} = content;
		this.state.previewElement.style.cssText = styles;
		this.state.previewElement.innerHTML = html;
		if (isOffline) this.state.previewElement.classList.add('offline');
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

	// Calculate preview position based on viewport constraints
	calculatePreviewPosition({
		previewRect,
		cursorX,
		cursorY,
		viewportWidth,
		viewportHeight,
		margin
	}) {
		const spaceAbove = cursorY;
		const spaceBelow = viewportHeight - cursorY;
		const spaceRight = viewportWidth - cursorX;
		const spaceLeft = cursorX;

		let top, left;

		if (spaceAbove > previewRect.height + margin) {
			top = cursorY - previewRect.height - margin;
		} else if (spaceBelow > previewRect.height + margin) {
			top = cursorY + margin;
		} else {
			top = Math.max(margin, Math.min(viewportHeight - previewRect.height - margin,
				(viewportHeight - previewRect.height) / 2));
		}

		if (spaceRight > previewRect.width + margin) {
			left = cursorX + margin;
		} else if (spaceLeft > previewRect.width + margin) {
			left = cursorX - previewRect.width - margin;
		} else {
			left = Math.max(margin, Math.min(viewportWidth - previewRect.width - margin,
				(viewportWidth - previewRect.width) / 2));
		}

		return {
			left: `${left}px`,
			top: `${top}px`
		};
	}

	hidePreview() {
		this.state.previewElement.style.opacity = '0';
		this.state.previewElement.style.transform = 'translateY(4px)';

		setTimeout(() => {
			this.state.previewElement.style.display = 'none';
			this.state.previewElement.classList.remove('offline');
		}, YoutubePreview.PREVIEW_FADE_DURATION);
	}

	// Memory cleanup and state reset
	clearTimeouts(type) {
		if (this.state.timeouts[type]) {
			clearTimeout(this.state.timeouts[type]);
			this.state.timeouts[type] = null;
		}
	}

	getPreviewStyles(isDarkMode, isOffline) {
		return `
            position: fixed;
            background: ${isDarkMode ? 'linear-gradient(to bottom, #27292a 0%, #1f2122 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%)'};
            border-radius: 16px;
            padding: 12px;
            box-shadow: ${isDarkMode ? 
                '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)' : 
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)'};
            z-index: 1000;
            width: ${isOffline ? '300px' : '320px'};
            font-family: "RobotoSerif", serif;
            transition: opacity 0.15s ease, transform 0.15s ease;
            opacity: 0;
            pointer-events: none;
            transform: translateY(4px);
            will-change: transform, opacity;
        `;
	}

	getMobilePreviewStyles(isDarkMode, isOffline = false) {
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
            ${!isOffline ? 'cursor: pointer;' : ''}
        `;
	}

	getPreviewHTML(videoInfo, isDarkMode, isOffline) {
		return isOffline ? this.getOfflinePreviewHTML(videoInfo, isDarkMode) : this.getOnlinePreviewHTML(videoInfo, isDarkMode);
	}

	getOnlinePreviewHTML(videoInfo, isDarkMode) {
		// Get the best available thumbnail quality
		const thumbnailUrl = videoInfo.thumbnails.maxresdefault || videoInfo.thumbnails.hqdefault;

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
                ${this.getCommonPreviewContent(videoInfo, isDarkMode)}
                <div class="youtube-duration">${videoInfo.duration}</div>
            </div>
        `;
	}

	getMobilePreviewHTML(videoInfo, isDarkMode) {
		const thumbnailUrl = videoInfo.thumbnails.maxresdefault || videoInfo.thumbnails.hqdefault;
		const playIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;

		return `
            <div style="display: flex; flex-direction: column; gap: 12px;" onclick="window.location.href = '${this.state.currentLink?.href}">
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
                ${this.getCommonPreviewContent(videoInfo, isDarkMode)}
                <div class="youtube-duration">${videoInfo.duration}</div>
            </div>
        `;
	}

	// Shared template for preview content to maintain consistency
	getCommonPreviewContent(videoInfo, isDarkMode) {
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
	}
}

export default YoutubePreview;

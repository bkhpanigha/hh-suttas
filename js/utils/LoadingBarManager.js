export class LoadingBarManager {
    constructor(loadingBarElement) {
        this.loadingBar = loadingBarElement;
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.animationFrameId = null;
        this.isAnimating = false;
        this.showImmediately();
    }

    showImmediately() {
        this.currentProgress = 1;
        this.loadingBar.style.width = '1%';
    }

    setTargetProgress(progress) {
        this.targetProgress = Math.min(100, Math.max(1, progress));
        if (!this.isAnimating) {
            this.animate();
        }
    }

    async reset(cancelled = false) {
        if (!cancelled && this.currentProgress > 0 && this.currentProgress < 100) {
            await this.complete();
        }
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.isAnimating = false;
        this.loadingBar.style.width = '0%';
    }

    complete() {
        return new Promise((resolve) => {
            this.targetProgress = 100;
            
            const finishAnimation = () => {
                if (this.currentProgress >= 99.9) {
                    this.currentProgress = 100;
                    this.loadingBar.style.width = '100%';
                    setTimeout(() => {
                        resolve();
                    }, 50);
                    return;
                }

                this.currentProgress += (100 - this.currentProgress) * 0.3;
                this.loadingBar.style.width = `${this.currentProgress}%`;
                requestAnimationFrame(finishAnimation);
            };

            requestAnimationFrame(finishAnimation);
        });
    }

    animate() {
        this.isAnimating = true;
        
        const updateProgress = () => {
            if (Math.abs(this.targetProgress - this.currentProgress) < 0.1) {
                this.currentProgress = this.targetProgress;
                this.loadingBar.style.width = `${this.currentProgress}%`;
                this.isAnimating = false;
                return;
            }

            this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;
            this.loadingBar.style.width = `${this.currentProgress}%`;
            this.animationFrameId = requestAnimationFrame(updateProgress);
        };

        this.animationFrameId = requestAnimationFrame(updateProgress);
    }
}
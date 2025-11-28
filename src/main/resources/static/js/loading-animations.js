/**
 * 加载动画和过渡效果
 * 提供丰富的加载状态和页面过渡动画
 */
class LoadingAnimations {
    constructor() {
        this.loadingOverlay = null;
        this.pageTransitions = true;
        this.init();
    }
    
    init() {
        this.createLoadingStyles();
        this.initPageTransitions();
        this.initSkeletonLoaders();
        this.initProgressIndicators();
        this.initPulseAnimations();
        this.initFadeTransitions();
        this.initSlideTransitions();
        this.initScaleTransitions();
        this.initRotateAnimations();
        this.initShimmerEffects();
    }
    
    // 创建加载动画样式
    createLoadingStyles() {
        if (document.querySelector('#loading-animations-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'loading-animations-styles';
        style.textContent = `
            /* 全局加载遮罩 */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .loading-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            
            /* 加载动画 */
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f4f6;
                border-top: 4px solid #a855f7;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .loading-dots {
                display: flex;
                gap: 4px;
            }
            
            .loading-dots .dot {
                width: 8px;
                height: 8px;
                background: #a855f7;
                border-radius: 50%;
                animation: bounce 1.4s ease-in-out infinite both;
            }
            
            .loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }
            .loading-dots .dot:nth-child(3) { animation-delay: 0s; }
            
            .loading-bars {
                display: flex;
                gap: 2px;
                align-items: end;
            }
            
            .loading-bars .bar {
                width: 4px;
                height: 20px;
                background: #a855f7;
                animation: bars 1.2s ease-in-out infinite;
            }
            
            .loading-bars .bar:nth-child(1) { animation-delay: -1.2s; }
            .loading-bars .bar:nth-child(2) { animation-delay: -1.1s; }
            .loading-bars .bar:nth-child(3) { animation-delay: -1.0s; }
            .loading-bars .bar:nth-child(4) { animation-delay: -0.9s; }
            .loading-bars .bar:nth-child(5) { animation-delay: -0.8s; }
            
            .loading-pulse {
                width: 40px;
                height: 40px;
                background: #a855f7;
                border-radius: 50%;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            /* 骨架屏 */
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            
            .skeleton-text {
                height: 16px;
                border-radius: 4px;
                margin-bottom: 8px;
            }
            
            .skeleton-text.short {
                width: 60%;
            }
            
            .skeleton-text.medium {
                width: 80%;
            }
            
            .skeleton-text.long {
                width: 100%;
            }
            
            .skeleton-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }
            
            .skeleton-card {
                padding: 16px;
                border-radius: 8px;
                background: #f8fafc;
            }
            
            .skeleton-image {
                width: 100%;
                height: 200px;
                border-radius: 8px;
            }
            
            /* 进度指示器 */
            .progress-ring {
                transform: rotate(-90deg);
            }
            
            .progress-ring-circle {
                transition: stroke-dashoffset 0.35s;
                transform-origin: 50% 50%;
            }
            
            .progress-line {
                width: 100%;
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .progress-line-fill {
                height: 100%;
                background: linear-gradient(90deg, #a855f7, #ec4899);
                border-radius: 2px;
                transition: width 0.3s ease;
                position: relative;
            }
            
            .progress-line-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                animation: progress-shine 2s infinite;
            }
            
            /* 页面过渡 */
            .page-transition {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.5s ease;
            }
            
            .page-transition.loaded {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* 淡入淡出 */
            .fade-in {
                animation: fadeIn 0.5s ease forwards;
            }
            
            .fade-out {
                animation: fadeOut 0.5s ease forwards;
            }
            
            .fade-in-up {
                animation: fadeInUp 0.6s ease forwards;
            }
            
            .fade-in-down {
                animation: fadeInDown 0.6s ease forwards;
            }
            
            .fade-in-left {
                animation: fadeInLeft 0.6s ease forwards;
            }
            
            .fade-in-right {
                animation: fadeInRight 0.6s ease forwards;
            }
            
            /* 滑动动画 */
            .slide-in-left {
                animation: slideInLeft 0.5s ease forwards;
            }
            
            .slide-in-right {
                animation: slideInRight 0.5s ease forwards;
            }
            
            .slide-in-up {
                animation: slideInUp 0.5s ease forwards;
            }
            
            .slide-in-down {
                animation: slideInDown 0.5s ease forwards;
            }
            
            /* 缩放动画 */
            .scale-in {
                animation: scaleIn 0.4s ease forwards;
            }
            
            .scale-out {
                animation: scaleOut 0.4s ease forwards;
            }
            
            .zoom-in {
                animation: zoomIn 0.3s ease forwards;
            }
            
            .zoom-out {
                animation: zoomOut 0.3s ease forwards;
            }
            
            /* 旋转动画 */
            .rotate-in {
                animation: rotateIn 0.6s ease forwards;
            }
            
            .rotate-out {
                animation: rotateOut 0.6s ease forwards;
            }
            
            /* 弹跳动画 */
            .bounce-in {
                animation: bounceIn 0.8s ease forwards;
            }
            
            .bounce-out {
                animation: bounceOut 0.6s ease forwards;
            }
            
            /* 摇摆动画 */
            .shake {
                animation: shake 0.6s ease-in-out;
            }
            
            .wobble {
                animation: wobble 1s ease-in-out;
            }
            
            /* 脉冲动画 */
            .pulse-animation {
                animation: pulseAnimation 2s infinite;
            }
            
            .heartbeat {
                animation: heartbeat 1.5s ease-in-out infinite;
            }
            
            /* 闪烁效果 */
            .flash {
                animation: flash 1s infinite;
            }
            
            .glow {
                animation: glow 2s ease-in-out infinite alternate;
            }
            
            /* 关键帧动画 */
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes bounce {
                0%, 80%, 100% {
                    transform: scale(0);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes bars {
                0%, 40%, 100% {
                    transform: scaleY(0.4);
                }
                20% {
                    transform: scaleY(1);
                }
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }
            
            @keyframes shimmer {
                0% {
                    background-position: -200% 0;
                }
                100% {
                    background-position: 200% 0;
                }
            }
            
            @keyframes progress-shine {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(100%);
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInDown {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes fadeInRight {
                from {
                    opacity: 0;
                    transform: translateX(30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideInLeft {
                from {
                    transform: translateX(-100%);
                }
                to {
                    transform: translateX(0);
                }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                }
                to {
                    transform: translateX(0);
                }
            }
            
            @keyframes slideInUp {
                from {
                    transform: translateY(100%);
                }
                to {
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInDown {
                from {
                    transform: translateY(-100%);
                }
                to {
                    transform: translateY(0);
                }
            }
            
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.3);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes scaleOut {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.3);
                }
            }
            
            @keyframes zoomIn {
                from {
                    opacity: 0;
                    transform: scale3d(0.3, 0.3, 0.3);
                }
                50% {
                    opacity: 1;
                }
                to {
                    transform: scale3d(1, 1, 1);
                }
            }
            
            @keyframes zoomOut {
                from {
                    opacity: 1;
                }
                50% {
                    opacity: 0;
                    transform: scale3d(0.3, 0.3, 0.3);
                }
                to {
                    opacity: 0;
                }
            }
            
            @keyframes rotateIn {
                from {
                    opacity: 0;
                    transform: rotate3d(0, 0, 1, -200deg);
                }
                to {
                    opacity: 1;
                    transform: translate3d(0, 0, 0);
                }
            }
            
            @keyframes rotateOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                    transform: rotate3d(0, 0, 1, 200deg);
                }
            }
            
            @keyframes bounceIn {
                0%, 20%, 40%, 60%, 80%, 100% {
                    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
                }
                0% {
                    opacity: 0;
                    transform: scale3d(0.3, 0.3, 0.3);
                }
                20% {
                    transform: scale3d(1.1, 1.1, 1.1);
                }
                40% {
                    transform: scale3d(0.9, 0.9, 0.9);
                }
                60% {
                    opacity: 1;
                    transform: scale3d(1.03, 1.03, 1.03);
                }
                80% {
                    transform: scale3d(0.97, 0.97, 0.97);
                }
                100% {
                    opacity: 1;
                    transform: scale3d(1, 1, 1);
                }
            }
            
            @keyframes bounceOut {
                20% {
                    transform: scale3d(0.9, 0.9, 0.9);
                }
                50%, 55% {
                    opacity: 1;
                    transform: scale3d(1.1, 1.1, 1.1);
                }
                100% {
                    opacity: 0;
                    transform: scale3d(0.3, 0.3, 0.3);
                }
            }
            
            @keyframes shake {
                0%, 100% {
                    transform: translateX(0);
                }
                10%, 30%, 50%, 70%, 90% {
                    transform: translateX(-10px);
                }
                20%, 40%, 60%, 80% {
                    transform: translateX(10px);
                }
            }
            
            @keyframes wobble {
                0% {
                    transform: translateX(0%);
                }
                15% {
                    transform: translateX(-25%) rotate(-5deg);
                }
                30% {
                    transform: translateX(20%) rotate(3deg);
                }
                45% {
                    transform: translateX(-15%) rotate(-3deg);
                }
                60% {
                    transform: translateX(10%) rotate(2deg);
                }
                75% {
                    transform: translateX(-5%) rotate(-1deg);
                }
                100% {
                    transform: translateX(0%);
                }
            }
            
            @keyframes pulseAnimation {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
                100% {
                    transform: scale(1);
                }
            }
            
            @keyframes heartbeat {
                0% {
                    transform: scale(1);
                }
                14% {
                    transform: scale(1.3);
                }
                28% {
                    transform: scale(1);
                }
                42% {
                    transform: scale(1.3);
                }
                70% {
                    transform: scale(1);
                }
            }
            
            @keyframes flash {
                0%, 50%, 100% {
                    opacity: 1;
                }
                25%, 75% {
                    opacity: 0;
                }
            }
            
            @keyframes glow {
                from {
                    box-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7;
                }
                to {
                    box-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #a855f7;
                }
            }
            
            /* 响应式调整 */
            @media (max-width: 768px) {
                .loading-spinner {
                    width: 32px;
                    height: 32px;
                }
                
                .skeleton-text {
                    height: 14px;
                }
                
                .skeleton-avatar {
                    width: 32px;
                    height: 32px;
                }
            }
            
            /* 减少动画偏好设置 */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 显示全局加载遮罩
    showGlobalLoading(message = '加载中...', type = 'spinner') {
        this.hideGlobalLoading();
        
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'loading-overlay';
        
        let loadingContent = '';
        switch (type) {
            case 'spinner':
                loadingContent = '<div class="loading-spinner"></div>';
                break;
            case 'dots':
                loadingContent = '<div class="loading-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
                break;
            case 'bars':
                loadingContent = '<div class="loading-bars"><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>';
                break;
            case 'pulse':
                loadingContent = '<div class="loading-pulse"></div>';
                break;
        }
        
        this.loadingOverlay.innerHTML = `
            <div style="text-align: center;">
                ${loadingContent}
                <div style="margin-top: 16px; color: #6b7280; font-size: 14px;">${message}</div>
            </div>
        `;
        
        document.body.appendChild(this.loadingOverlay);
        
        // 触发显示动画
        setTimeout(() => {
            this.loadingOverlay.classList.add('show');
        }, 10);
    }
    
    // 隐藏全局加载遮罩
    hideGlobalLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('show');
            setTimeout(() => {
                if (this.loadingOverlay && this.loadingOverlay.parentNode) {
                    this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
                }
                this.loadingOverlay = null;
            }, 300);
        }
    }
    
    // 创建骨架屏
    createSkeleton(container, config = {}) {
        const {
            lines = 3,
            avatar = false,
            image = false,
            card = true
        } = config;
        
        let skeletonHTML = '';
        
        if (card) {
            skeletonHTML += '<div class="skeleton-card">';
        }
        
        if (avatar) {
            skeletonHTML += '<div class="skeleton skeleton-avatar" style="margin-bottom: 16px;"></div>';
        }
        
        if (image) {
            skeletonHTML += '<div class="skeleton skeleton-image" style="margin-bottom: 16px;"></div>';
        }
        
        for (let i = 0; i < lines; i++) {
            const width = i === lines - 1 ? 'short' : (i % 2 === 0 ? 'long' : 'medium');
            skeletonHTML += `<div class="skeleton skeleton-text ${width}"></div>`;
        }
        
        if (card) {
            skeletonHTML += '</div>';
        }
        
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (container) {
            container.innerHTML = skeletonHTML;
        }
        
        return skeletonHTML;
    }
    
    // 移除骨架屏
    removeSkeleton(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (container) {
            const skeletons = container.querySelectorAll('.skeleton, .skeleton-card');
            skeletons.forEach(skeleton => {
                skeleton.style.opacity = '0';
                setTimeout(() => {
                    if (skeleton.parentNode) {
                        skeleton.parentNode.removeChild(skeleton);
                    }
                }, 300);
            });
        }
    }
    
    // 创建进度环
    createProgressRing(container, options = {}) {
        const {
            size = 60,
            strokeWidth = 4,
            progress = 0,
            color = '#a855f7'
        } = options;
        
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'progress-ring');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'progress-ring-circle');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', strokeWidth);
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('r', radius);
        circle.setAttribute('cx', size / 2);
        circle.setAttribute('cy', size / 2);
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;
        
        svg.appendChild(circle);
        
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (container) {
            container.appendChild(svg);
        }
        
        // 设置进度
        this.setProgressRing(circle, progress, circumference);
        
        return { svg, circle, circumference };
    }
    
    // 设置进度环进度
    setProgressRing(circle, progress, circumference) {
        const offset = circumference - (progress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    // 创建进度条
    createProgressLine(container, options = {}) {
        const {
            progress = 0,
            animated = true,
            showPercentage = false
        } = options;
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-line';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-line-fill';
        progressFill.style.width = progress + '%';
        
        progressContainer.appendChild(progressFill);
        
        if (showPercentage) {
            const percentage = document.createElement('div');
            percentage.style.cssText = `
                text-align: center;
                margin-top: 8px;
                font-size: 12px;
                color: #6b7280;
            `;
            percentage.textContent = progress + '%';
            progressContainer.appendChild(percentage);
        }
        
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (container) {
            container.appendChild(progressContainer);
        }
        
        return { progressContainer, progressFill };
    }
    
    // 初始化页面过渡
    initPageTransitions() {
        if (!this.pageTransitions) return;
        
        // 页面加载完成后添加过渡效果
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('page-transition');
            
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 100);
        });
        
        // 为新添加的内容添加过渡效果
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList) {
                        if (node.classList.contains('animate-on-load')) {
                            this.animateElement(node);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 初始化骨架屏加载器
    initSkeletonLoaders() {
        // 自动为带有data-skeleton属性的元素创建骨架屏
        document.querySelectorAll('[data-skeleton]').forEach(element => {
            const config = JSON.parse(element.getAttribute('data-skeleton') || '{}');
            this.createSkeleton(element, config);
        });
    }
    
    // 初始化进度指示器
    initProgressIndicators() {
        // 自动为带有data-progress属性的元素创建进度指示器
        document.querySelectorAll('[data-progress]').forEach(element => {
            const progress = parseInt(element.getAttribute('data-progress'));
            const type = element.getAttribute('data-progress-type') || 'line';
            
            if (type === 'ring') {
                this.createProgressRing(element, { progress });
            } else {
                this.createProgressLine(element, { progress, showPercentage: true });
            }
        });
    }
    
    // 初始化脉冲动画
    initPulseAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('pulse-animation');
                }
            });
        });
        
        document.querySelectorAll('.pulse-on-view').forEach(element => {
            observer.observe(element);
        });
    }
    
    // 初始化淡入过渡
    initFadeTransitions() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const direction = entry.target.getAttribute('data-fade') || 'in';
                    entry.target.classList.add(`fade-${direction}`);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('[data-fade]').forEach(element => {
            observer.observe(element);
        });
    }
    
    // 初始化滑动过渡
    initSlideTransitions() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const direction = entry.target.getAttribute('data-slide') || 'up';
                    entry.target.classList.add(`slide-in-${direction}`);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('[data-slide]').forEach(element => {
            observer.observe(element);
        });
    }
    
    // 初始化缩放过渡
    initScaleTransitions() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const type = entry.target.getAttribute('data-scale') || 'in';
                    entry.target.classList.add(`scale-${type}`);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('[data-scale]').forEach(element => {
            observer.observe(element);
        });
    }
    
    // 初始化旋转动画
    initRotateAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const direction = entry.target.getAttribute('data-rotate') || 'in';
                    entry.target.classList.add(`rotate-${direction}`);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('[data-rotate]').forEach(element => {
            observer.observe(element);
        });
    }
    
    // 初始化闪烁效果
    initShimmerEffects() {
        document.querySelectorAll('.shimmer').forEach(element => {
            element.classList.add('skeleton');
        });
    }
    
    // 动画元素
    animateElement(element, animation = 'fade-in-up') {
        element.classList.add(animation);
    }
    
    // 批量动画元素
    animateElements(selector, animation = 'fade-in-up', delay = 100) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animateElement(element, animation);
            }, index * delay);
        });
    }
    
    // 创建加载按钮
    createLoadingButton(button, options = {}) {
        const {
            loadingText = '加载中...',
            spinner = true,
            disabled = true
        } = options;
        
        if (typeof button === 'string') {
            button = document.querySelector(button);
        }
        
        if (!button) return;
        
        const originalText = button.textContent;
        const originalDisabled = button.disabled;
        
        if (disabled) {
            button.disabled = true;
        }
        
        let content = loadingText;
        if (spinner) {
            content = `<i class="fa fa-spinner fa-spin"></i> ${loadingText}`;
        }
        
        button.innerHTML = content;
        
        return {
            restore: () => {
                button.innerHTML = originalText;
                button.disabled = originalDisabled;
            }
        };
    }
    
    // 页面切换动画
    pageTransition(fromPage, toPage, animation = 'slide') {
        return new Promise((resolve) => {
            if (typeof fromPage === 'string') {
                fromPage = document.querySelector(fromPage);
            }
            if (typeof toPage === 'string') {
                toPage = document.querySelector(toPage);
            }
            
            if (!fromPage || !toPage) {
                resolve();
                return;
            }
            
            // 隐藏当前页面
            switch (animation) {
                case 'fade':
                    fromPage.classList.add('fade-out');
                    break;
                case 'slide':
                    fromPage.classList.add('slide-out-left');
                    break;
                case 'scale':
                    fromPage.classList.add('scale-out');
                    break;
            }
            
            setTimeout(() => {
                fromPage.style.display = 'none';
                toPage.style.display = 'block';
                
                // 显示新页面
                switch (animation) {
                    case 'fade':
                        toPage.classList.add('fade-in');
                        break;
                    case 'slide':
                        toPage.classList.add('slide-in-right');
                        break;
                    case 'scale':
                        toPage.classList.add('scale-in');
                        break;
                }
                
                setTimeout(() => {
                    resolve();
                }, 500);
            }, 300);
        });
    }
    
    // 预加载动画资源
    preloadAnimations() {
        // 预创建常用的动画元素以提高性能
        const preloadContainer = document.createElement('div');
        preloadContainer.style.cssText = 'position: absolute; top: -9999px; left: -9999px; visibility: hidden;';
        
        // 预加载各种加载动画
        const animations = ['spinner', 'dots', 'bars', 'pulse'];
        animations.forEach(type => {
            const element = document.createElement('div');
            element.className = `loading-${type}`;
            preloadContainer.appendChild(element);
        });
        
        document.body.appendChild(preloadContainer);
        
        // 短暂延迟后移除预加载容器
        setTimeout(() => {
            if (preloadContainer.parentNode) {
                preloadContainer.parentNode.removeChild(preloadContainer);
            }
        }, 100);
        
        console.log('🎨 动画资源预加载完成');
    }
}

// 全局实例
window.LoadingAnimations = LoadingAnimations;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.loadingAnimations = new LoadingAnimations();
});

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingAnimations;
}
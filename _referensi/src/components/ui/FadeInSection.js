import { useEffect, useRef, useState } from 'react';

export default function FadeInSection({ children, delay = 0, className = "" }) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const { current } = domRef;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`${className} ${isVisible ? 'animate-slide-up' : 'opacity-0'
                }`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

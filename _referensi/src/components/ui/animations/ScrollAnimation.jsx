"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollAnimation({
    children,
    delay = 0,
    duration = 800,
    threshold = 0.1,
    className = "",
    variant = "fade-up" // fade-up, fade-down, fade-left, fade-right, zoom-in
}) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold });

        const currentRef = domRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [threshold]);

    const getVariantStyles = () => {
        switch (variant) {
            case "fade-up":
                return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";
            case "fade-down":
                return isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10";
            case "fade-left":
                return isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"; // From right to left often called fade-left, or slide-left
            case "fade-right":
                return isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"; // From left to right
            case "zoom-in":
                return isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95";
            default:
                return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";
        }
    };

    return (
        <div
            ref={domRef}
            className={`${className} transition-all ease-out transform ${getVariantStyles()}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`
            }}
        >
            {children}
        </div>
    );
}

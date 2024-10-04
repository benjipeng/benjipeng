import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMemo } from 'react';

const useAnimateOnInView = (animationProps: Keyframe[], options: any = {}) => {
    const ref = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const inView = useInView(ref, {
        once: true,
        ...options,
    });

    useEffect(() => {
        if (inView && ref.current && !hasAnimated) {
            (ref.current as HTMLElement).animate(animationProps, {
                duration: 500,
                fill: "forwards",
                easing: "ease-out",
            });
            setHasAnimated(true);
        }
    }, [inView, animationProps, hasAnimated]);

    return ref;
};

const useAnimations = () => {
    return useMemo(() => ({
        whoAmIAnimation: () => useAnimateOnInView([
            { opacity: 0, transform: "translateY(-50px)" },
            { opacity: 1, transform: "none" },
        ], { delay: 100 }),

        professionAnimation: () => useAnimateOnInView([
            { opacity: 0, transform: "translateX(-50px)" },
            { opacity: 1, transform: "none" },
        ], { delay: 200 }),

        quoteAnimation: () => useAnimateOnInView([
            { opacity: 0, transform: "translateX(50px)" },
            { opacity: 1, transform: "none" },
        ], { delay: 300 }),

        techonologyIconListAnimation: () => useAnimateOnInView([
            { opacity: 0, transform: "translateY(50px)" },
            { opacity: 1, transform: "none" },
        ], { delay: 400 }),

        verticalImageAnimation: () => useAnimateOnInView([
            { opacity: 0, transform: "scale(0.9)" },
            { opacity: 1, transform: "none" },
        ], { delay: 500 }),

        educationContentAnimation: () => useAnimateOnInView([
            { opacity: 0, transform: "translateY(50px)" },
            { opacity: 1, transform: "none" },
        ], { delay: 600 }),

        mobileAnimation: () => useAnimateOnInView([
            { opacity: 0 },
            { opacity: 1 },
        ], { delay: 200 }),
    }), []);
};

export default useAnimations;

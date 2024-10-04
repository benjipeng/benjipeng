import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const useAnimateOnInView = (animationProps: Keyframe[], options: any = {}) => {
    const ref = useRef(null);
    const inView = useInView(ref, {
        once: true,
        ...options,
    });

    useEffect(() => {
        if (inView && ref.current) {
            (ref.current as HTMLElement).animate(animationProps, {
                duration: 500,
                fill: "forwards",
                easing: "ease-out",
            });
        }
    }, [inView, animationProps]);

    return ref;
};

const whoAmIAnimation = () => useAnimateOnInView([
    { opacity: 0, transform: "translateY(-50px)" },
    { opacity: 1, transform: "none" },
], { delay: 100 });

const professionAnimation = () => useAnimateOnInView([
    { opacity: 0, transform: "translateX(-50px)" },
    { opacity: 1, transform: "none" },
], { delay: 200 });

const quoteAnimation = () => useAnimateOnInView([
    { opacity: 0, transform: "translateX(50px)" },
    { opacity: 1, transform: "none" },
], { delay: 300 });

const techonologyIconListAnimation = () => useAnimateOnInView([
    { opacity: 0, transform: "translateY(50px)" },
    { opacity: 1, transform: "none" },
], { delay: 400 });

const verticalImageAnimation = () => useAnimateOnInView([
    { opacity: 0, transform: "scale(0.9)" },
    { opacity: 1, transform: "none" },
], { delay: 500 });

const educationContentAnimation = () => useAnimateOnInView([
    { opacity: 0, transform: "translateY(50px)" },
    { opacity: 1, transform: "none" },
], { delay: 600 });

const mobileAnimation = () => useAnimateOnInView([
    { opacity: 0 },
    { opacity: 1 },
], { delay: 200 });

export default {
    whoAmIAnimation,
    professionAnimation,
    quoteAnimation,
    techonologyIconListAnimation,
    verticalImageAnimation,
    educationContentAnimation,
    mobileAnimation,
};

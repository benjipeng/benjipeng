export const ALL_TECHNOLOGIES_TRANSITIONS_PROPS = {
    initial: {
        opacity: 0,
        y: '20px'
    },
    animate: {
        opacity: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        y: '20px'
    }
};

export const SELECTED_ITEM_LAYER_TRANSITIONS_PROPS = {
    initial: {
        opacity: 0,
        x: '-100%'
    },
    animate: {
        opacity: 1,
        x: 0
    },
    exit: {
        opacity: 0,
        x: '100%'
    }
};

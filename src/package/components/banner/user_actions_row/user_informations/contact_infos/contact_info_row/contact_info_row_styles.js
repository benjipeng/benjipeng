export const styles = (theme) => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        margin: [8, 0]
    },
    icon: {
        height: 25,
        width: 'auto',
        fill: `rgba(${theme.palette.light.rgbShades[500].join(', ')}, .75)`
    },
    typography: {
        marginLeft: 8,
        fontWeight: 500,
        fontSize: 15
    },
    button: {
        display: 'flex'
    }
});

import { create } from 'twrnc';

// Manually defining config to ensure reliable loading in Web Bundle
const tw = create({
    theme: {
        extend: {
            colors: {
                midnight: {
                    900: '#000000',
                    800: '#050505',
                    700: '#121212',
                    600: '#1A1A1A',
                },
                primary: {
                    DEFAULT: '#6366F1',
                    dark: '#4F46E5',
                },
                gold: {
                    DEFAULT: '#D4AF37',
                }
            },
            fontFamily: {
                heading: ['PlayfairDisplay-Bold'],
                body: ['Inter-Regular'],
            }
        },
    },
});

export default tw;

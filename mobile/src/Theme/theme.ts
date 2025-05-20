import {MD3DarkTheme, MD3LightTheme} from 'react-native-paper';

export const customLightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#F57C00',
        secondary: '#FFA726',
        tertiary: '#FFE0B2',
        background: '#FFFFFF',
        surface: '#FFF3E0',
        text: '#212121',
        onPrimary: '#FFFFFF',
        onSecondary: '#212121',
    },
};

export const customDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#FF9800',
        secondary: '#FFB74D',
        tertiary: '#FFE0B2',
        background: '#121212',
        surface: '#1E1E1E',
        text: '#FFFFFF',
        onPrimary: '#000000',
        onSecondary: '#000000',
    },
};

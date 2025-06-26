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

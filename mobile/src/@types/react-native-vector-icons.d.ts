declare module 'react-native-vector-icons/MaterialCommunityIcons' {
    import {Component} from 'react';
    import {TextProps, TextStyle, ViewStyle} from 'react-native';

    export interface IconProps extends TextProps {
        name: string;
        size?: number;
        color?: string;
        style?: TextStyle | ViewStyle;
    }

    export default class Icon extends Component<IconProps> {
        static getImageSource(
            name: string,
            size?: number,
            color?: string
        ): Promise<any>;

        static loadFont(
            file?: string
        ): Promise<void>;

        static hasIcon(name: string): boolean;
    }
} 
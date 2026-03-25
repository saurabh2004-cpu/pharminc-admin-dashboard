const baselightTheme = {
  direction: 'ltr',
  palette: {
    primary: {
      main: '#169BA4',
      light: '#E6FFFA',
      dark: '#233F64',
    },
    secondary: {
      main: '#233F64',
      light: '#EBF3FE',
      dark: '#111822',
    },
    success: {
      main: '#4ADAAF',
      light: '#E6FFFA',
      dark: '#02b3a9',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0AD4CE',
      light: '#EBF3FE',
      dark: '#1682d4',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FA896B',
      light: '#FDEDE8',
      dark: '#f3704d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFAE1F',
      light: '#FEF5E5',
      dark: '#ae8e59',
      contrastText: '#ffffff',
    },
    purple: {
      A50: '#EBF3FE',
      A100: '#6610f2',
      A200: '#557fb9',
    },
    grey: {
      100: '#F2F6FA',
      200: '#EAEFF4',
      300: '#DFE5EF',
      400: '#7C8FAC',
      500: '#5A6A85',
      600: '#2A3547',
    },
    text: {
      primary: '#2A3547',
      secondary: '#2A3547',
    },
    action: {
      disabledBackground: 'rgba(73,82,88,0.12)',
      hoverOpacity: 0.02,
      hover: '#f6f9fc',
    },
    divider: '#e5eaef',
    background: {
      default: '#ffffff',
    },
  },
};

const baseDarkTheme = {
  direction: 'ltr',
  palette: {
    primary: {
      main: '#169BA4',
      light: '#E6FFFA',
      dark: '#233F64',
    },
    secondary: {
      main: '#777e89',
      light: '#1C455D',
      dark: '#173f98',
    },
    success: {
      main: '#4ADAAF',
      light: '#1B3C48',
      dark: '#02b3a9',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0AD4CE',
      light: '#223662',
      dark: '#1682d4',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FA896B',
      light: '#4B313D',
      dark: '#f3704d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFAE1F',
      light: '#4D3A2A',
      dark: '#ae8e59',
      contrastText: '#ffffff',
    },
    purple: {
      A50: '#EBF3FE',
      A100: '#6610f2',
      A200: '#557fb9',
    },
    grey: {
      100: '#333F55',
      200: '#465670',
      300: '#7C8FAC',
      400: '#DFE5EF',
      500: '#EAEFF4',
      600: '#F2F6FA',
      A700: '#465670',
    },
    text: {
      primary: '#EAEFF4',
      secondary: '#7C8FAC',
    },
    action: {
      disabledBackground: 'rgba(73,82,88,0.12)',
      hoverOpacity: 0.02,
      hover: '#333F55',
    },
    divider: '#333F55',
    background: {
      default: '#171c23',
      dark: '#171c23',
      paper: '#171c23',
    },
  },
};

export { baseDarkTheme, baselightTheme };

// ** Theme Type Import
import { Theme } from '@mui/material/styles'

const Typography = (theme: Theme) => {
  return {
    fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`,
    h1: {
      fontWeight: 600,
      fontSize: "2.25rem",
      lineHeight: 2.75,
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: 2.25,
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.75,
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.3125rem",
      lineHeight: 1.6,
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.125rem",
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    subtitle1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      color: theme.palette.text.secondary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    body1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.334,
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    body2: {
      fontSize: "0.75rem",
      letterSpacing: "0rem",
      fontWeight: 400,
      lineHeight: 1,
      color: theme.palette.text.secondary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    button: {
      textTransform: "capitalize",
      fontWeight: 400,
      color: theme.palette.text.primary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    caption: {
      lineHeight: 1.25,
      letterSpacing: '0.4px',
      color: theme.palette.text.secondary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    },
    overline: {
      letterSpacing: '1px',
      color: theme.palette.text.secondary,
      fontFamily: `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
    }
  }
}

export default Typography

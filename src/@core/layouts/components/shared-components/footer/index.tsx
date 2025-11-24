
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { LayoutProps } from 'src/@core/layouts/types'
import FooterContent from './FooterContent'

interface Props {
  settings: LayoutProps['settings']
  saveSettings: LayoutProps['saveSettings']
  footerStyles?: NonNullable<LayoutProps['footerProps']>['sx']
  footerContent?: NonNullable<LayoutProps['footerProps']>['content']
}

const Footer = (props: Props) => {
  const { footerContent: userFooterContent } = props
  const theme = useTheme()

  return (
    <Box
      component='footer'
      className='layout-footer'
      sx={{
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 0,
        position: 'sticky',
        backgroundColor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        className='footer-content-container'
        sx={{
          width: '100%',
          py: theme.spacing(3.875),
          maxWidth: 1440,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          backgroundColor: 'background.paper',
          px: [5, 6],
          border: `1px solid ${theme.palette.divider}`, borderBottomWidth: 0
        }}
      >
        {userFooterContent ? userFooterContent(props) : <FooterContent />}
      </Box>
    </Box>
  )
}

export default Footer

import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import useFlareWallet from '../hooks/useFlareWallet'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { account, isConnected, connect, disconnect, chainId } = useFlareWallet()
  const [anchorEl, setAnchorEl] = useState(null)

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      handleMenuClose()
      // Could show a toast notification here
    }
  }

  const isFlareNetwork = chainId === 14 || chainId === 114

  return (
    <AppBar 
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VerifiedUserIcon sx={{ fontSize: 32 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              cursor: 'pointer',
              fontWeight: 700,
              letterSpacing: '-0.5px'
            }}
            onClick={() => navigate('/')}
          >
            Verified Resume
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            color="inherit"
            onClick={() => navigate('/candidate')}
            variant={location.pathname === '/candidate' ? 'outlined' : 'text'}
            sx={{
              fontWeight: location.pathname === '/candidate' ? 600 : 400,
              borderRadius: 2
            }}
          >
            Candidate
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/employer')}
            variant={location.pathname === '/employer' ? 'outlined' : 'text'}
            sx={{
              fontWeight: location.pathname === '/employer' ? 600 : 400,
              borderRadius: 2
            }}
          >
            Employer
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/government')}
            variant={location.pathname === '/government' ? 'outlined' : 'text'}
            sx={{
              fontWeight: location.pathname === '/government' ? 600 : 400,
              borderRadius: 2
            }}
          >
            Government
          </Button>

          {isConnected ? (
            <>
              {!isFlareNetwork && (
                <Chip
                  label="Switch to Flare"
                  color="warning"
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              <Button
                color="inherit"
                startIcon={<AccountBalanceWalletIcon />}
                onClick={handleMenuOpen}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {formatAddress(account)}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 250,
                    borderRadius: 2,
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Connected Wallet
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {account?.slice(2, 4).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
                      {account}
                    </Typography>
                    <Tooltip title="Copy address">
                      <IconButton size="small" onClick={copyAddress}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Divider />
                <MenuItem onClick={disconnect}>
                  <ExitToAppIcon sx={{ mr: 1 }} />
                  Disconnect
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              startIcon={<AccountBalanceWalletIcon />}
              onClick={connect}
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'rgba(255,255,255,0.5)',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

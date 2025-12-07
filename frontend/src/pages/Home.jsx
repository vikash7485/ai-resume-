import React from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Container,
  Paper,
  Chip,
  Stack,
  alpha
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import SearchIcon from '@mui/icons-material/Search'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SecurityIcon from '@mui/icons-material/Security'
import BlockchainIcon from '@mui/icons-material/AccountTree'
import AIIcon from '@mui/icons-material/Psychology'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

function Home() {
  const navigate = useNavigate()

  const featureCards = [
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 48 }} />,
      title: 'For Candidates',
      description: 'Upload your resume and get verified on the Flare blockchain. Receive a tamper-proof attestation NFT that proves your credentials.',
      action: 'Get Verified',
      path: '/candidate',
      color: '#FF6600',
      gradient: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)'
    },
    {
      icon: <SearchIcon sx={{ fontSize: 48 }} />,
      title: 'For Employers',
      description: 'Verify candidate credentials instantly. Scan QR codes or check NFT tokens on the blockchain with cryptographic proof.',
      action: 'Verify Credentials',
      path: '/employer',
      color: '#00D4FF',
      gradient: 'linear-gradient(135deg, #00D4FF 0%, #33E0FF 100%)'
    },
    {
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />,
      title: 'Government Portal',
      description: 'Review and mint official attestations using multi-signature smart accounts. Secure, auditable, and compliant.',
      action: 'Access Portal',
      path: '/government',
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)'
    }
  ]

  const features = [
    { icon: <AIIcon />, title: 'AI-Powered Analysis', desc: 'Advanced ML models detect fraud' },
    { icon: <BlockchainIcon />, title: 'Blockchain Verified', desc: 'Immutable on Flare Network' },
    { icon: <SecurityIcon />, title: 'Cryptographic Proof', desc: 'FDC & FTSO integration' },
    { icon: <TimelapseIcon />, title: 'Instant Verification', desc: 'Real-time results' },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Chip 
              label="Built on Flare Network" 
              sx={{ 
                mb: 3, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600
              }} 
            />
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Verified AI Resume & Degree Checker
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                opacity: 0.95,
                maxWidth: 700,
                mx: 'auto',
                fontWeight: 300
              }}
            >
              Government-Grade Fraud Detection System
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                maxWidth: 800, 
                mx: 'auto',
                opacity: 0.9,
                fontSize: '1.1rem',
                lineHeight: 1.8
              }}
            >
              A tamper-proof, blockchain-powered system for detecting fake degrees,
              fabricated resumes, identity fraud, and fraudulent experience claims
              using Flare Network's unique infrastructure with AI-powered analysis.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                  },
                  transition: 'all 0.3s'
                }}
                onClick={() => navigate('/candidate')}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
                onClick={() => navigate('/employer')}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Main Action Cards */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {featureCards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                background: card.gradient,
                color: 'white',
                transition: 'all 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 12
                }
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ color: 'white', mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.95, lineHeight: 1.7 }}>
                  {card.description}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: 'white',
                    color: card.color,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  {card.action}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Features Grid */}
      <Paper
        elevation={0}
        sx={{
          p: 6,
          background: 'linear-gradient(180deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
          borderRadius: 4,
          mb: 6
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', mb: 5, fontWeight: 700 }}>
          Why Choose Our Platform?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: alpha('#667eea', 0.1),
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box
                  sx={{
                    fontSize: 48,
                    color: 'primary.main',
                    mb: 2
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Stats Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
          color: 'white',
          borderRadius: 3,
          mb: 6
        }}
      >
        <Grid container spacing={4} sx={{ textAlign: 'center' }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              99.9%
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Fraud Detection Accuracy
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
              2.3B+
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Dollars Saved Annually
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              &lt;5min
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Average Verification Time
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default Home

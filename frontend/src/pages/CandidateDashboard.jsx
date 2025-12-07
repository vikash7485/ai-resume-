import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import ErrorIcon from '@mui/icons-material/Error'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import QrCodeIcon from '@mui/icons-material/QrCode'
import useFlareWallet from '../hooks/useFlareWallet'
import axios from 'axios'
import VerificationStatus from '../components/VerificationStatus'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

function CandidateDashboard() {
  const { account, isConnected, connect, signMessage } = useFlareWallet()
  const [uploading, setUploading] = useState(false)
  const [verificationId, setVerificationId] = useState(null)
  const [error, setError] = useState(null)
  const [verifications, setVerifications] = useState([])

  useEffect(() => {
    if (isConnected && account) {
      // Fetch user's verifications (mock for now)
      // In production, this would fetch from API
    }
  }, [isConnected, account])

  const onDrop = async (acceptedFiles) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const message = `Sign in to Verified Resume\n\nWallet: ${account}\nTimestamp: ${Date.now()}`
      const signature = await signMessage(message)

      const authResponse = await axios.post(`${API_BASE}/auth/wallet`, {
        address: account,
        signature,
        message,
      })

      const token = authResponse.data.token

      const formData = new FormData()
      formData.append('resume', file)
      formData.append('candidateWallet', account)
      formData.append('metadata', JSON.stringify({
        name: '',
        email: '',
      }))

      const response = await axios.post(`${API_BASE}/verify/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setVerificationId(response.data.verificationId)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: !isConnected || uploading,
  })

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
  }

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            maxWidth: 500,
            mx: 'auto',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4
          }}
        >
          <VerifiedUserIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Connect your Flare-compatible wallet to get started with resume verification
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={connect}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Connect Wallet
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Candidate Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your resume verifications and attestations
        </Typography>
      </Box>

      {/* Wallet Info Card */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
          borderRadius: 3
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Connected Wallet
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                {account}
              </Typography>
              <Tooltip title="Copy address">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(account)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Chip
              icon={<CheckCircleIcon />}
              label="Connected"
              color="success"
              sx={{ fontWeight: 600 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!verificationId ? (
        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12} md={8}>
            <Paper
              {...getRootProps()}
              elevation={3}
              sx={{
                p: 6,
                textAlign: 'center',
                cursor: uploading || !isConnected ? 'not-allowed' : 'pointer',
                border: '3px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                  transform: 'scale(1.02)'
                },
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <Box>
                  <CircularProgress size={60} sx={{ mb: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Processing Your Resume
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI analysis in progress...
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <UploadFileIcon
                    sx={{
                      fontSize: 80,
                      color: isDragActive ? 'primary.main' : 'text.secondary',
                      mb: 3,
                      transition: 'all 0.3s'
                    }}
                  />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Drag and drop a PDF or text file, or click to select
                  </Typography>
                  <Chip label="PDF, TXT files supported" variant="outlined" />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Verification Process
                  </Typography>
                  <Stepper orientation="vertical" activeStep={0}>
                    <Step>
                      <StepLabel>Upload Resume</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>AI Analysis</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Blockchain Verification</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Get Attestation</StepLabel>
                    </Step>
                  </Stepper>
                </CardContent>
              </Card>

              <Card
                elevation={3}
                sx={{
                  background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                  color: 'white',
                  borderRadius: 3
                }}
              >
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    100%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Secure & Verified on Blockchain
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <VerificationStatus verificationId={verificationId} />
      )}

      {/* Previous Verifications */}
      {verifications.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Previous Verifications
          </Typography>
          <Grid container spacing={2}>
            {verifications.map((ver, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(ver.date).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={ver.status}
                        color={ver.status === 'verified' ? 'success' : 'default'}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="h6" gutterBottom>
                      Score: {ver.score}/100
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default CandidateDashboard

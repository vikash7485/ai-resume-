import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import BlockIcon from '@mui/icons-material/Block'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

function EmployerVerification() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async () => {
    if (!token.trim()) {
      setError('Please enter a verification token')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.get(`${API_BASE}/employer/scan/${token}`)
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Employer Verification Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verify candidate credentials instantly with blockchain-backed verification
        </Typography>
      </Box>

      {/* Scan Card */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Verification Token or NFT Token ID"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter token or scan QR code"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleScan()
                }
              }}
              InputProps={{
                startAdornment: <QrCodeScannerIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleScan}
              disabled={loading}
              sx={{ height: 56 }}
            >
              {loading ? 'Verifying...' : 'Verify Credentials'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {result && (
        <Grid container spacing={3}>
          {/* Verification Result */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                border: `2px solid ${result.valid ? '#4caf50' : '#f44336'}`
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {result.valid ? (
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                  ) : (
                    <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
                  )}
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {result.valid ? 'Verification Valid' : 'Verification Invalid'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scanned on {new Date(result.scannedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={result.valid ? <VerifiedUserIcon /> : <BlockIcon />}
                  label={result.valid ? 'VERIFIED' : 'INVALID'}
                  color={result.valid ? 'success' : 'error'}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              {result.verification && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Verification Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Verification Score
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {result.verification.verificationScore}/100
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Status
                          </Typography>
                          <Chip
                            label={result.verification.status.toUpperCase()}
                            color={result.verification.status === 'verified' ? 'success' : 'default'}
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    {result.verification.evidenceHash && (
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Evidence Hash
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                                wordBreak: 'break-all'
                              }}
                            >
                              {result.verification.evidenceHash}
                              <Tooltip title="Copy">
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(result.verification.evidenceHash)}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Attestation Info */}
          {result.attestation && (
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Attestation NFT
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Token ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {result.attestation.nftTokenId}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Minted Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(result.attestation.mintedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Issuer
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {result.attestation.issuer}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => window.open(`https://flare-explorer.flare.network/address/${result.attestation.contractAddress}`, '_blank')}
                  >
                    View on Blockchain
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}

export default EmployerVerification

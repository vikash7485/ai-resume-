import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Stack,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import ErrorIcon from '@mui/icons-material/Error'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import QrCodeIcon from '@mui/icons-material/QrCode'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

function VerificationStatus({ verificationId }) {
  const [verification, setVerification] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [verificationId])

  useEffect(() => {
    if (verification) {
      if (verification.status === 'completed') {
        setActiveStep(4)
      } else if (verification.status === 'processing') {
        setActiveStep(2)
      } else {
        setActiveStep(1)
      }
    }
  }, [verification])

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/verify/${verificationId}`)
      setVerification(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching status:', error)
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'primary'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Highly Verified'
    if (score >= 70) return 'Verified'
    if (score >= 50) return 'Partial Verification'
    return 'Failed Verification'
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography>Loading verification status...</Typography>
      </Box>
    )
  }

  if (!verification) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography color="error" variant="h6">
          Verification not found
        </Typography>
      </Paper>
    )
  }

  const score = verification.verificationScore || 0
  const isComplete = verification.status === 'completed'

  return (
    <Grid container spacing={3}>
      {/* Main Status Card */}
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Verification Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {verificationId}
              </Typography>
            </Box>
            <Chip
              icon={isComplete ? <CheckCircleIcon /> : <PendingIcon />}
              label={verification.status.toUpperCase()}
              color={isComplete ? 'success' : 'warning'}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Score Display */}
          {isComplete && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Verification Score</Typography>
                <Chip
                  label={`${score}/100`}
                  color={getScoreColor(score)}
                  sx={{ fontWeight: 700, fontSize: '1.1rem' }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    bgcolor: getScoreColor(score) + '.main'
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Status: {getScoreLabel(score)}
              </Typography>
            </Box>
          )}

          {/* Progress Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Resume Uploaded</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Document received and hash generated
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>AI Analysis</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Analyzing resume for fraud indicators
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>FDC Verification</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Verifying credentials against government databases
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>FTSO Timestamping</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Recording tamper-proof timestamp
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Complete</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Verification completed and stored on blockchain
                  </Typography>
                </StepContent>
              </Step>
            </Stepper>
          </Box>

          {/* Action Buttons */}
          {isComplete && (
            <Stack direction="row" spacing={2}>
              {score >= 70 && (
                <Button variant="contained" size="large" startIcon={<VerifiedUserIcon />}>
                  Request Attestation
                </Button>
              )}
              <Button variant="outlined" size="large" startIcon={<QrCodeIcon />}>
                Generate QR Code
              </Button>
            </Stack>
          )}
        </Paper>
      </Grid>

      {/* Sidebar - Score Breakdown */}
      {isComplete && verification.breakdown && (
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Score Breakdown
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Degree Verification</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {verification.breakdown.degreeVerification || 0}/30
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(verification.breakdown.degreeVerification || 0) / 30 * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Experience</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {verification.breakdown.experienceVerification || 0}/25
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(verification.breakdown.experienceVerification || 0) / 25 * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Identity</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {verification.breakdown.identityVerification || 0}/20
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(verification.breakdown.identityVerification || 0) / 20 * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Document</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {verification.breakdown.documentAuthenticity || 0}/15
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(verification.breakdown.documentAuthenticity || 0) / 15 * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Consistency</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {verification.breakdown.consistencyScore || 0}/10
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(verification.breakdown.consistencyScore || 0) / 10 * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Evidence Hash */}
            {verification.evidenceHash && (
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Evidence Hash
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    wordBreak: 'break-all'
                  }}
                >
                  {verification.evidenceHash}
                  <Tooltip title="Copy hash">
                    <IconButton
                      size="small"
                      onClick={() => navigator.clipboard.writeText(verification.evidenceHash)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            )}
          </Stack>
        </Grid>
      )}
    </Grid>
  )
}

export default VerificationStatus

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import useFlareWallet from '../hooks/useFlareWallet'

function GovernmentPortal() {
  const { account, isConnected, connect } = useFlareWallet()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  // Mock data - would fetch from API
  const pendingAttestations = [
    {
      id: 'att_req_1',
      verificationId: 'ver_abc123',
      candidate: '0x1234...5678',
      score: 87,
      submittedAt: new Date(),
      priority: 'high'
    },
    {
      id: 'att_req_2',
      verificationId: 'ver_def456',
      candidate: '0xabcd...efgh',
      score: 92,
      submittedAt: new Date(Date.now() - 86400000),
      priority: 'normal'
    },
  ]

  const stats = {
    pending: 15,
    approved: 342,
    rejected: 8,
    total: 365
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
            background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
            color: 'white',
            borderRadius: 4
          }}
        >
          <VerifiedUserIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Government Portal
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Connect your authorized government wallet to access the portal
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={connect}
            sx={{
              bgcolor: 'white',
              color: '#9C27B0',
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

  const handleReview = (request) => {
    setSelectedRequest(request)
    setOpenDialog(true)
  }

  const handleApprove = () => {
    // Approval logic here
    setOpenDialog(false)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Government Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve attestation requests with multi-signature verification
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending
                  </Typography>
                </Box>
                <PendingActionsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Approved
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Rejected
                  </Typography>
                </Box>
                <VerifiedUserIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Requests
                  </Typography>
                </Box>
                <VerifiedUserIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Requests Table */}
      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Pending Attestation Requests
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Request ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Verification ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingAttestations.map((att) => (
                <TableRow key={att.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{att.id}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{att.verificationId}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{att.candidate}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${att.score}/100`}
                      color={att.score >= 90 ? 'success' : att.score >= 70 ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={att.priority.toUpperCase()}
                      color={att.priority === 'high' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{att.submittedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Tooltip title="Review">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleReview(att)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Review Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Review Attestation Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Alert severity="info">
                Multi-signature approval required (2-of-3)
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Request ID"
                    value={selectedRequest.id}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Verification Score"
                    value={`${selectedRequest.score}/100`}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Candidate Address"
                    value={selectedRequest.candidate}
                    disabled
                  />
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleApprove} startIcon={<CheckCircleIcon />}>
            Approve & Mint
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GovernmentPortal

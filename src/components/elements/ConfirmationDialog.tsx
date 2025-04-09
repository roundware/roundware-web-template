import React from 'react';
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  Button,
  IconButton,
  Box,
  SvgIconProps
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant?: 'leave' | 'rerecord';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  variant = 'rerecord'
}) => {
  const content = {
    rerecord: {
      icon: <ReplayIcon fontSize="large" />,
      title: 'Re-record',
      description: 'Are you sure?\nYou will lose your recording.',
      confirmText: 'YES, RE-RECORD'
    },
    leave: {
      icon: <LogoutIcon fontSize="large" />,
      title: 'Leave choir',
      description: 'Are you sure you want to leave this choir?\nYou will lose your recording.',
      confirmText: 'YES, LEAVE'
    }
  };

  const selectedContent = content[variant];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
    >
      <Box
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          width: 40,
          height: 40,
          border: 1,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <DialogContent>
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Stack
            spacing={3}
            alignItems="center"
            sx={{ width: '100%', px: 2 }}
          >
            {selectedContent.icon}
            
            <Typography variant="h4" component="div" textAlign="center">
              {selectedContent.title}
            </Typography>
            
            <Typography variant="subtitle1" textAlign="center" sx={{ whiteSpace: 'pre-line' }}>
              {selectedContent.description}
            </Typography>
            
            <Stack spacing={2} width="100%">
              <Button
                variant="contained"
                onClick={onConfirm}
                fullWidth
                size="large"
              >
                {selectedContent.confirmText}
              </Button>
              
              <Button
                variant="text"
                onClick={onClose}
                fullWidth
                size="large"
              >
                CANCEL
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog; 
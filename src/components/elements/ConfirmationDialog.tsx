import React from 'react';
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  Button,
  IconButton,
  Box,
  SvgIconProps,
  Container
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  icon?: React.ReactNode;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  icon,
  title,
  description,
  confirmText,
  cancelText
}) => {
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
          <Container maxWidth="xs">
            <Stack
              spacing={3}
              alignItems="center"
              sx={{ width: '100%', px: 2 }}
            >
              {icon}
              
              <Typography variant="h4" component="div" textAlign="center">
                {title}
              </Typography>
              
              <Typography variant="subtitle1" textAlign="center" sx={{ whiteSpace: 'pre-line' }}>
                {description}
              </Typography>
              
              <Stack spacing={2} width="100%">
                <Button
                  variant="contained"
                  onClick={onConfirm}
                  fullWidth
                  size="large"
                >
                  {confirmText}
                </Button>
                
                <Button
                  variant="text"
                  onClick={onClose}
                  fullWidth
                  size="large"
                >
                  {cancelText}
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog; 
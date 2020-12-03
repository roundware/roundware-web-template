import React from 'react';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Typography from "@material-ui/core/Typography";

const ErrorDialog = ({error, set_error}) => {

    return (
      <Dialog open={error !== null} >
      <DialogContent>
        <DialogContentText>
          { error && error.message }
        </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button
                variant="contained"
                onClick={()=>{set_error(null)}}
            >OK</Button>
        </DialogActions>
      </Dialog>
    )
}

export default ErrorDialog;
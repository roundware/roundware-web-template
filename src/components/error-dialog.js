import React from 'react';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Typography from "@material-ui/core/Typography";

const ErrorDialog = (props) => {

    return (
      <Dialog open={props.error !== null} >
      <DialogContent>
        <DialogContentText>
          { props.errorMessage }
        </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button
                variant="contained"
                onClick={()=>{props.set_error(null)}}
            >OK</Button>
        </DialogActions>
      </Dialog>
    )
}

export default ErrorDialog;

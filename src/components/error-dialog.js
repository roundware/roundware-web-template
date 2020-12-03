import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

const ErrorDialog = ({error, set_error}) => {
    return (
      <Dialog open={error !== null} >
        <Typography paragraph>
          { JSON.stringify(error) }
        </Typography>
        <Button onClick={()=>{set_error(null)}}>OK</Button>
      </Dialog>
    )
}

export default ErrorDialog;
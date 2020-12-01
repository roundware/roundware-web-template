import { useRoundware } from "../hooks";
import React, { Fragment, useState } from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import { DialogContentText } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

const LegalAgreementForm = ({ open, onAccept, onDecline }) => {
  const { roundware, draftRecording } = useRoundware();
  const [accepted_agreement, set_accepted_agreement] = useState(null);
  if (!roundware._project) {
    return null;
  }
  return (
    <Fragment>
      <DialogTitle>Content Agreement</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {roundware._project.legalAgreement}
        </DialogContentText>
        <FormControlLabel
          label={"I AGREE"}
          control={
            <Checkbox
              checked={accepted_agreement === true}
              onChange={(e) => {
                set_accepted_agreement(e.target.checked);
              }}
            />
          }
        ></FormControlLabel>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="secondary" onClick={onDecline}>
          Go Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!accepted_agreement}
          onClick={onAccept}
        >
          Submit
        </Button>
      </DialogActions>
    </Fragment>
  );
};

export default LegalAgreementForm;

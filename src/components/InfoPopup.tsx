import { useRoundware } from "../hooks";
import React, { Fragment, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Link from "@material-ui/core/Link";

{/*import assetMapGraphic from '../assets/bhs-map.jpg';*/ }


const InfoPopup = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div style={{ position: "absolute", right: 10 }}>
      <Button onClick={handleClickOpen}>
        INFO
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" onClose={handleClose}>
          {"What is Roundware?"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant={"h6"} gutterBottom>
            Roundware is:
          </Typography>
          <Typography gutterBottom>
            an open, flexible, distributed framework which collects, stores,
            organizes and re-presents audio content.
          </Typography>
          <Typography gutterBottom>
            It lets you collect audio from anyone with a smartphone or web access,
            upload it to a central repository along with its metadata and then
            filter it and play it back collectively in continuous audio streams.
          </Typography>
          <Divider />
          <Typography variant={"h6"} gutterBottom>
            <br />With Roundware, you can:
          </Typography>
          <ul>
            <li>
              create a seamless, non-linear, location-sensitive layer of
              audio in any geographic space mixed on the fly based on
              participant input
            </li>
            <li>
              collect audio from participants in real-time via iOS,
              Android and web-based devices
            </li>
            <li>
              tag collected audio with location and project-based metadata for filtering
            </li>
          </ul>
          <Divider />
          <Typography variant={"h6"} gutterBottom>
            <br />Join the fun...
          </Typography>
          <Typography gutterBottom>
            Roundware is an actively-developed open-source project and is
            free for anyone to use. It was initially developed for sound art
            installations, but has since been used for innovative museum
            audio tours as well as other educational purposes.
          </Typography>
          <Typography gutterBottom>
            You can check out codebases for the server and various frameworks
            on our&nbsp;
            <Link href="https://github.com/roundware">
              GitHub page
            </Link>.
          </Typography>

          {/*<a href="./listen">
            <img id="map" src={assetMapGraphic} style={{width: "100%"}} />
          </a>
          <hr />*/}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default InfoPopup;

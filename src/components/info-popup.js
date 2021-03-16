import { useRoundware } from "../hooks";
import React, { Fragment, useState } from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from '@material-ui/core/DialogContentText';
import Typography from "@material-ui/core/Typography";
// import FormControlLabel from "@material-ui/core/FormControlLabel";
// import Checkbox from "@material-ui/core/Checkbox";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import pealeLogoSmall from '../assets/peale-text-white.png';
import assetMapGraphic from '../assets/bhs-map.jpg';


const InfoPopup = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div style={{position: "absolute", right: 10}}>
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
          {"About Be Here Stories"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            This project, a collaboration with the Peale in Baltimore and Museum on Main Street,
            Smithsonian Institution, enables access to stories anywhere, anytime.
          </Typography>
          <Typography gutterBottom>
            <em>Be Here Stories</em> is an initiative, in both rural and urban communities,
            to increase participation in cultural heritage by enabling more diverse voices to
            record place-based stories about the communities and experiences they know best.
          </Typography>
          <Typography gutterBottom>
            The Peale and its partners also publish these community-based stories on free
            and open platforms such as SoundCloud (the Be Here Stories channel) and YouTube,
            in addition to sharing them on social media. This ensures that authentic stories
            from a diverse range of people and communities are included in the narratives
            and cultural records of little-known or underserved American towns and cities.
          </Typography>
          <Typography gutterBottom>
            Through this sharing, we hope - in some small way - to help bridge what is often
            called the "rural/urban divide" in the United States.
          </Typography>
          <Typography gutterBottom>
            Therefore, all voices are represented in the app, regardless of whether the
            storytellers are experts or other voices of "authority," and because we welcome
            these authentic voices, stories are frequently raw and unedited. Of course,
            we reserve the right to remove content that violates copyright, trademark, or
            intellectual property, or promotes impersonation, unlawful conduct, harassment,
            or hate speech.
          </Typography>
          <Typography gutterBottom>
            <em>Be Here Stories</em> capitalizes on the power of the smart phone to offer
            listeners a way to discover the hidden culture, histories, and creativity that
            lives around them. If you are listening out in the world, the location-aware
            app will trigger stories to play stories that were recorded in your area, or
            you can use the map feature in the Listen section of the app to play stories
            from locations and towns anywhere in the United States.
          </Typography>
          <Typography gutterBottom>
            Many stories that are recorded in this app are also published on the Museum
            on Main Street website (www.MuseumOnMainStreet.org) for inclusion in the
            Smithsonian's "Stories from Main Street" archive. If at any point, storytellers
            wish to remove their stories, they may email us at <a href="mailto:online@thePealeCenter.org">
            online@thePealeCenter.org</a>.
          </Typography>
          <Typography gutterBottom variant={"h6"}>
            Find Your Story on the Map
          </Typography>
          <a href="./listen">
            <img id="map" src={assetMapGraphic} style={{width: "100%"}} />
          </a>
          <hr />
          <img id="logo" src={pealeLogoSmall} style={{width: 300}} />
          <Typography gutterBottom>
            <em>Be Here Stories</em> is an initiative of the Peale in Baltimore, Maryland.
            The Peale is a 501(c)3 non-profit organization and is restoring the oldest
            museum building in the United States in partnership with the City of Baltimore.
            Through its programs, the Peale Center aims to illuminate authentic stories of
            Baltimore's people and places, while reinventing the civic museum in the
            creative and innovative spirit of its founder, artist Rembrandt Peale.
          </Typography>
          <Typography gutterBottom>
            Contact us to find out more by emailing <a href="mailto:online@thePealeCenter.org">online@thePealeCenter.org</a>.
          </Typography>

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

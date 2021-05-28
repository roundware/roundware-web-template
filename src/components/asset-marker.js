import React, { useEffect, useState } from "react";
import {
  InfoWindow,
  Marker,
  useGoogleMap,
  Animation,
} from "@react-google-maps/api";
import moment from "moment";
import AssetPlayer from "./asset-player";
import { useRoundware } from "../hooks";
import { AssetActionButtons } from "./asset-action-buttons";
import { TagsDisplay } from "./asset-tags";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {
  ThemeProvider as MuiThemeProvider,
  makeStyles,
} from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { lightTheme } from "../styles";
import { useAsync } from "react-async";

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    height: "auto",
    width: "auto",
    maxHeight: "90%",
    maxWidth: "90%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    outline: 0,
    minWidth: 300,
  },
}));

const LightboxModal = ({ imageUrl }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <img src={imageUrl} width="150px" onClick={handleOpen} />
      <Modal open={open} onClose={handleClose}>
        <img src={imageUrl} className={classes.paper} />
      </Modal>
    </div>
  );
};

const TextDisplay = ({ textUrl }) => {
  const [storedText, setStoredText] = useState(null);

  useEffect(() => {
    fetch(textUrl).then(function (response) {
      response.text().then(function (text) {
        setStoredText(text);
      });
    });
  }, []);

  return <div>{storedText}</div>;
};

const AssetInfoWindow = ({ asset }) => {
  const { selectedAsset, selectAsset, roundware } = useRoundware();

  if (!selectedAsset) return null;
  if (selectedAsset.id !== asset.id) {
    return null;
  }
  return (
    <AssetInfoWindowInner
      asset={selectedAsset}
      selectAsset={selectAsset}
      roundware={roundware}
    />
  );
};

const AssetInfoWindowInner = ({ asset, selectAsset, roundware }) => {
  const [imageAssets, setImageAssets] = useState(null);
  const [textAssets, setTextAssets] = useState(null);

  useEffect(() => {
    if (asset.envelope_ids.length > 0) {
      roundware
        .getAssets({
          media_type: "photo",
          envelope_id: asset.envelope_ids[0],
        })
        .then(setImageAssets);
    }
  }, [asset]);

  useEffect(() => {
    roundware
      .getAssets({
        media_type: "text",
        envelope_id: asset.envelope_ids[0],
      })
      .then(setTextAssets);
  }, [asset]);

  const primaryImageUrl = imageAssets && imageAssets[0]?.file;
  const primaryTextUrl = textAssets && textAssets[0]?.file;

  const position = { lat: asset.latitude, lng: asset.longitude };

  return (
    <InfoWindow
      options={{
        disableAutoPan: false,
        pixelOffset: new google.maps.Size(0, -30),
        maxWidth: 320,
      }}
      position={position}
      onCloseClick={() => selectAsset(null)}
    >
      <MuiThemeProvider theme={lightTheme}>
        <Grid container direction={"column"}>
          <Paper>
            <Typography variant="body2">
              {moment(asset.created).format("LLL")}
            </Typography>
            <TagsDisplay tagIds={asset.tag_ids} />
            {primaryImageUrl ? (
              <LightboxModal imageUrl={primaryImageUrl} />
            ) : null}
            {primaryTextUrl ? <TextDisplay textUrl={primaryTextUrl} /> : null}
            <AssetPlayer
              style={{ width: "100%", marginTop: 10 }}
              asset={asset}
            />
            <AssetActionButtons asset={asset} />
          </Paper>
        </Grid>
      </MuiThemeProvider>
    </InfoWindow>
  );
};

const defaultMarkerIcon =
  "https://fonts.gstatic.com/s/i/materialicons/place/v15/24px.svg";
const playingMarkerIcon =
  "https://fonts.gstatic.com/s/i/materialicons/settings/v15/24px.svg";

const AssetMarker = ({ asset, clusterer, oms }) => {
  const { roundware, selectAsset, playingAssets } = useRoundware();
  let url = defaultMarkerIcon;
  let anim = null;
  for (const a of playingAssets) {
    if (a && a.id == asset.id) {
      // TODO Change this icon to the desired icon for currently playing assets.
      url = playingMarkerIcon;
      anim = google.maps.Animation.BOUNCE;
      console.log(`rendering current playing ${asset.id}`);
      break;
    }
  }

  return (
    <Marker
      position={{ lat: asset.latitude, lng: asset.longitude }}
      icon={{
        url,
        scaledSize: new google.maps.Size(20, 20),
      }}
      animation={anim}
      clusterer={clusterer}
      onLoad={(m) => {
        m.asset = asset;
        oms.addMarker(m, () => selectAsset(asset));
      }}
      noClustererRedraw={false}
    >
      <AssetInfoWindow asset={asset} />
    </Marker>
  );
};

export default AssetMarker;

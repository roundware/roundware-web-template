import React, { useEffect, useState } from "react";
import { InfoWindow, Marker, useGoogleMap } from "@react-google-maps/api";
import moment from "moment";
import AssetPlayer from "./asset-player";
import { useRoundware } from "../hooks";
import { AssetActionButtons } from "./asset-action-buttons";
import { TagsDisplay } from "./asset-tags";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { ThemeProvider as MuiThemeProvider, makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { lightTheme } from "../styles";
import { useAsync } from "react-async";


const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    height: "auto",
    width: "auto",
    maxHeight: "80%",
    maxWidth: "80%",
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
      <Modal
        open={open}
        onClose={handleClose}
      >
        <div className={classes.paper}>
          <img src={imageUrl} width="100%" />
        </div>
      </Modal>
    </div>
  );
}

const TextDisplay = ({ textUrl }) => {
  const [storedText, setStoredText] = useState(null)

  useEffect(() => {
    fetch(textUrl)
      .then(function(response) {
        response.text().then(function(text) {
          setStoredText(text);
        });
      });
  }, []);

  return (
    <div>
      {storedText}
    </div>
  );
}

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
    roundware
      .getAssets({
        media_type: "photo",
        envelope_id: asset.envelope_ids[0],
      })
      .then(setImageAssets);
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
            {primaryTextUrl ? (
              <TextDisplay textUrl={primaryTextUrl} />
            ) : null}
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

const AssetMarker = ({ asset, clusterer, oms }) => {
  const { selectAsset } = useRoundware();
  const iconPin = {
    url: "https://fonts.gstatic.com/s/i/materialicons/place/v15/24px.svg",
    scaledSize: new google.maps.Size(20, 20),
  };

  return (
    <Marker
      position={{ lat: asset.latitude, lng: asset.longitude }}
      icon={iconPin}
      clusterer={clusterer}
      onLoad={(m) => oms.addMarker(m, () => selectAsset(asset))}
      noClustererRedraw={true}
    >
      <AssetInfoWindow asset={asset} />
    </Marker>
  );
};

export default AssetMarker;

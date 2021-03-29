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
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { lightTheme } from "../styles";
import { useAsync } from "react-async";

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
  useEffect(() => {
    roundware
      .getAssets({
        media_type: "photo",
        envelope_id: asset.envelope_ids[0],
      })
      .then(setImageAssets);
  }, [asset]);

  const primaryImageUrl = imageAssets && imageAssets[0]?.file;

  const position = { lat: asset.latitude, lng: asset.longitude };

  return (
    <InfoWindow
      options={{
        disableAutoPan: false,
        pixelOffset: new google.maps.Size(0, -30),
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
              <img src={primaryImageUrl} width="100%" />
            ) : null}
            <AssetPlayer style={{ width: "100%" }} asset={asset} />
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

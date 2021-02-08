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

const AssetInfoWindow = ({ asset }) => {
  const { selectedAsset, selectAsset } = useRoundware();

  if (!selectedAsset) return null;
  if (selectedAsset.id !== asset.id) {
    return null;
  }

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
       url: 'https://www.google.com/intl/en_us/mapfiles/ms/micons/green.png',
       scaledSize: new google.maps.Size(20, 20)
      };

  return (
    <Marker
      position={{ lat: asset.latitude, lng: asset.longitude }}
      icon={iconPin}
      clusterer={clusterer}
      onLoad={(m) => oms.addMarker(m, () => selectAsset(asset))}
    >
      <AssetInfoWindow asset={asset} />
    </Marker>
  );
};

export default AssetMarker;

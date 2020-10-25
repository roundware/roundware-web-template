import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import RoundwareMap from "./map";
import AssetTable from "./asset-table";
import Grid from "@material-ui/core/Grid";

export const ListenPage = () => {
  return (
    <RoundwareMap
      style={{ height: "100%" }}
      googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY}
    />
  );
};

import React, { useState } from "react";
import PropTypes from "prop-types";
import AssetListItem from "./asset-list-item";

import { useRoundware } from "../hooks";
import AssetFilterPanel from "./asset-filter-panel";

const AssetList = (props) => {
  const {
    roundware,
    selectAsset,
    selectedAsset,
    filteredAssets,
  } = useRoundware();
  const [minimized, set_minimized] = useState(false);
  const [showing_filters, show_filters] = useState(false);

  let assets;
  if (!roundware) {
    assets = props.assets || [];
  } else {
    assets = filteredAssets || props.assets || [];
  }
  const entries = assets.sort(sortEntries).map((asset) => {
    return <AssetListItem key={asset.id} asset={asset} player={false} />;
  });
  return (
    <div className="asset-list">
      <div className="asset-list--header">
        <div className="header-controls">
          <button
            className={`minimizeButton fa fa-${minimized ? "expand-alt" : "compress-alt"
              }`}
            onClick={() => set_minimized(!minimized)}
          />
          <button
            className="showFiltersButton fa fa-filter"
            onClick={() => show_filters(!showing_filters)}
          />
        </div>
        <AssetFilterPanel hidden={!showing_filters} />
      </div>
      <div className={`asset-list--assets ${minimized ? "hidden" : ""}`}>
        {entries}
      </div>
    </div>
  );
};

AssetList.propTypes = {
  assets: PropTypes.arrayOf(Object),
  roundware: PropTypes.object,
};

export default AssetList;

import { RoundwareContext, DraftRecordingContext } from "./context";
import React, { useEffect, useReducer, useState } from "react";
import { Roundware, GeoListenMode } from "roundware-web-framework";
import { useDeviceID } from "./hooks";

export const DraftRecordingProvider = ({ roundware, children }) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null
  })
  const [tags, setTags] = useState([]);
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);

  useEffect(() => {
    if (!roundware._project || !roundware._project.location) {
      return;
    }
    if (location.latitude === null || location.longitude === null) {
      setLocation(roundware._project.location);
    }
  }, [roundware._project && roundware._project.location]);

  const selectTag = (tag, deselect) => {
    const newTags = [...tags];
    if (!deselect) {
      newTags.push(tag);
    } else {
      const tagPosition = newTags.indexOf(tag);
      if (tagPosition !== -1) {
        newTags.splice(tagPosition, 1);
      }
    }
    setTags(newTags);
  };

  const reset = () => {
    setTags([]);
    setLocation({latitude: null, longitude: null});
    setAcceptedAgreement(false);
  };

  const clearTags = (tags) => {
    const newTags = [...tags];
    tags.forEach((tag) => {
      const tagPosition = newTags.indexOf(tag);
      if (tagPosition !== -1) {
        newTags.splice(tagPosition, 1);
      }
    });

    setTags(newTags);
  };

  return (
    <DraftRecordingContext.Provider
      value={{
        tags,
        acceptedAgreement,
        location,
        setLocation,
        setTags,
        selectTag,
        clearTags,
        reset,
      }}
    >
      {children}
    </DraftRecordingContext.Provider>
  );
};

export const RoundwareProvider = (props) => {
  const [roundware, setRoundware] = useState({ uiConfig: {} });
  const [assetsReady, setAssetsReady] = useState(false);
  const [beforeDateFilter, setBeforeDateFilter] = useState(null);
  const [afterDateFilter, setAfterDateFilter] = useState(null);
  const [userFilter, setUserFilter] = useState("");
  const [selectedAsset, selectAsset] = useState(null);
  const [selectedTags, setSelectedTags] = useState({});
  const [sortField, setSortField] = useState({ name: "created", asc: false });
  const [assetPageIndex, setAssetPageIndex] = useState(0);
  const [assetsPerPage, setAssetsPerPage] = useState(10000);
  const [tagLookup, setTagLookup] = useState({});
  const [filteredAssets, setFilteredAssets] = useState([]);
  const deviceId = useDeviceID();
  const [assetPage, setAssetPage] = useState([])
  const [, forceUpdate] = useReducer((x) => !x, false);

  const sortAssets = (assets) => {
    const sort_value = sortField.asc ? 1 : -1;

    const sortEntries = (a, b) => {
      if (a[sortField.name] > b[sortField.name]) {
        return sort_value;
      }
      if (a[sortField.name] < b[sortField.name]) {
        return !sort_value;
      }
      return 0;
    };
    const sortedAssets = [...assets];
    sortedAssets.sort(sortEntries);
    return sortedAssets;
  };

 useEffect(() => {
    const sortedAssets = sortAssets(filteredAssets);
    if (sortedAssets.length < assetPageIndex * assetsPerPage) {
      setAssetPageIndex(0);
      return;
    }
    const page = sortedAssets.slice(
      assetPageIndex * assetsPerPage,
      assetPageIndex * assetsPerPage + assetsPerPage
    );
    setAssetPage(page);
    if (roundware._assetData) {
      setAssetsReady(true);
    }
  }, [filteredAssets, assetPageIndex, assetsPerPage, sortField.name, sortField.asc])

  useEffect(() => {
    if (!roundware.uiConfig.speak) {
      return;
    }
    const tag_lookup = {};
    roundware.uiConfig.speak.forEach((group) =>
      group.display_items.forEach((tag) => {
        tag_lookup[tag.id] = tag;
      })
    );
    setTagLookup(tag_lookup);
  }, [roundware.uiConfig && roundware.uiConfig.speak]);

  const filterAssets = (asset_data) => {
    return asset_data.filter((asset) => {
      // show the asset, unless a filter returns 'false'
      // filter by tags first
      let filteredByTag = false;
      const tag_filter_groups = Object.entries(selectedTags || {});
      tag_filter_groups.forEach(([_filter_group, tags]) => {
        if (filteredByTag) {
          // if we've already filtered out this asset based on another tag group, stop thinking about it
          return
        }
        if (tags.length) {
          const hasMatch = tags.some((tag_id) => asset.tag_ids.indexOf(tag_id) !== -1);
          if (!hasMatch) {
            filteredByTag = true;
          }
        }
      })
      if (filteredByTag) {
        return false;
      }
      // then filter by user
      if (userFilter.length) {
        let user_str = "anonymous";
        if (asset.user) {
          user_str = asset.user && `${asset.user.username} ${asset.user.email}`;
        }
        const user_match = user_str.indexOf(userFilter) !== -1;
        if (!user_match) {
          return false
        }
      }
      return true;
    });
  };
  // tells the provider to update assetData dependencies with the roundware _assetData source
  const updateAssets = () => {
    const filteredAssets = filterAssets(roundware._assetData);
    setFilteredAssets(filteredAssets);
  }
  useEffect(() => {
    if (roundware._assetData) {
      const filteredAssets = filterAssets(roundware._assetData);
      setFilteredAssets(filteredAssets);
    }
  }, [roundware._assetData, selectedTags, userFilter]);

  const selectTags = (tags, group) => {
    const group_key = group.group_short_name;
    const newFilters = { ...selectedTags };
    let listenTagIds = [];
    if (tags === null && newFilters[group_key]) {
      delete newFilters[group_key];
    } else {
      newFilters[group_key] = tags;
    }
    setSelectedTags(newFilters);
    Object.keys(newFilters).map(function(key) {
      listenTagIds.push(...newFilters[key]);
    })
    roundware._mixer.updateParams({listenTagIds: listenTagIds});
  };


  // when this provider is loaded, initialize roundware via api
  useEffect(() => {
    const project_id = process.env.ROUNDWARE_DEFAULT_PROJECT_ID;
    const server_url = process.env.ROUNDWARE_SERVER_URL;
    // maybe we build the site with a default listener location,
    // otherwise we go to null island
    const initial_loc = {
      latitude: process.env.INITIAL_LATITUDE || 0,
      longitude: process.env.INITIAL_LONGITUDE || 0,
    };

    const roundware = new Roundware(window, {
      deviceId: deviceId,
      serverUrl: server_url,
      projectId: project_id,
      geoListenEnabled: false,
      speakerFilters: { activeyn: true },
      assetFilters: { submitted: true, media_type: "audio" },
      listenerLocation: initial_loc,
    });

    roundware.connect().then(() => {
      // set the initial listener location to the project default
      roundware.updateLocation(roundware._project.location);
      roundware.onUpdateLocation = forceUpdate;
      setRoundware(roundware);
    });
  }, []);

  useEffect(() => {
    if (roundware._project) {
      roundware.loadAssetPool().then(() => {
        setAssetsReady(true);
      });
    }
  }, [roundware._project]);

  const geoListenMode = ( roundware._mixer && roundware._mixer.mixParams.geoListenMode ) || GeoListenMode.DISABLED;
  const setGeoListenMode = (modeName) => {
    roundware.enableGeolocation(modeName);
    let prom;
    // console.log(`roundware._mixer.mixParams.geoListenMode: ${roundware._mixer.mixParams.geoListenMode}`);
    if (modeName === GeoListenMode.AUTOMATIC) {
      prom = roundware._geoPosition.waitForInitialGeolocation()
      if (roundware._mixer) {
        roundware._mixer.updateParams({
          maxDist: roundware._project.recordingRadius,
          recordingRadius: roundware._project.recordingRadius
        })
      }
    } else if (modeName === GeoListenMode.MANUAL) {
      // set maxDist to value calculated from range circle overlay
      prom = new Promise((resolve, reject) => {resolve()});
    }
    prom.then(forceUpdate)
  }

  return (
    <RoundwareContext.Provider
      value={{
        roundware,
        // everything from the state
        tagLookup,
        sortField,
        selectedTags,
        selectedAsset,
        beforeDateFilter,
        afterDateFilter,
        assetPageIndex,
        assetsPerPage,
        geoListenMode,
        // state modification functions
        selectAsset,
        selectTags,
        setUserFilter,
        setAssetPageIndex,
        setAssetsPerPage,
        setSortField,
        forceUpdate,
        setGeoListenMode,
        updateAssets,
        // computed properties
        assetPage,
        assetsReady,
      }}
    >
      {props.children}
    </RoundwareContext.Provider>
  );
};

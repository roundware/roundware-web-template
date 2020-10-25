import { useRoundware } from "../hooks";
import React, { useState } from "react";
import Select from "react-select";
import { DebounceInput } from "react-debounce-input";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

const TagFilterMenu = ({ tag_group }) => {
  const { selectTags, tagFilters } = useRoundware();

  const handleChange = (tags) => {
    const tag_ids = tags ? tags.map((t) => t.value) : null;
    selectTags(tag_ids, tag_group);
  };
  const options = tag_group.display_items.map(
    ({ tag_id, tag_display_text }) => {
      return {
        value: tag_id,
        label: tag_display_text,
      };
    }
  );
  const fieldId = `roundware-tag-${tag_group.header_display_text}`;
  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (provided) => ({ ...provided, zIndex: "9999 !important" }),
  };
  return (
    <Grid item xs={12} sm={4} className={`tag-filter-field tag-filter-select`}>
      <label className="tag-filter-field--label">
        <span className="label-text">{tag_group.header_display_text}</span>
        <Select
          menuPortalTarget={document.querySelector("body")}
          styles={selectStyles}
          id={fieldId}
          isClearable={true}
          isMulti={true}
          onChange={handleChange}
          options={options}
        />
      </label>
    </Grid>
  );
};

const AssetFilterPanel = ({ hidden }) => {
  const { uiConfig, tagFilters, userFilter, setUserFilter } = useRoundware();
  if (!(uiConfig && uiConfig.listen)) {
    return null;
  }
  return (
    <Grid
      container
      className={`asset-list--filters ${hidden ? "hidden" : ""}`}
      spacing={1}
    >
      <Grid item xs={12} sm={4} className="tag-filter-field">
        <label className="tag-filter-field--label">
          <span className="label-text">filter by user</span>
          <DebounceInput
            minLength={2}
            className="rw-text-filter"
            value={userFilter}
            onChange={({ target }) => setUserFilter(target.value)}
            debounceTimeout={150}
          />
        </label>
      </Grid>
      {uiConfig.listen.map((tg) => (
        <TagFilterMenu key={tg.group_short_name} tag_group={tg} />
      ))}
    </Grid>
  );
};

export default AssetFilterPanel;

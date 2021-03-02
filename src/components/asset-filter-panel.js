import { useRoundware } from "../hooks";
import React from "react";
import { DebounceInput } from "react-debounce-input";
import Grid from "@material-ui/core/Grid";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  paper: {
    backgroundColor: "#525252",
  },
}));

export const TagFilterMenu = ({ tag_group }) => {
  const classes = useStyles();
  const { selectTags, selectedTags } = useRoundware();

  const handleChange = (evt, value, action, target) => {
    const tag_ids = value ? value.map((t) => t.value) : null;
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

  const selectedTagGroupTags = selectedTags[tag_group.group_short_name] || []

  return (
    <Grid item xs={12} className={`tag-filter-field tag-filter-select`}>
      <label className="tag-filter-field--label">
        <Autocomplete
          multiple
          id={tag_group.name}
          classes={classes}
          options={options}
          getOptionLabel={(option) => option ? option.label: ""}
          onChange={handleChange}
          getOptionSelected={option => selectedTagGroupTags.indexOf(option.value) !== -1}
          value={options.filter(o => selectedTagGroupTags.indexOf(o.value) !== -1)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label={tag_group.header_display_text}
              placeholder="Select one or more..."
            />
          )}
        ></Autocomplete>
      </label>
    </Grid>
  );
};

const AssetFilterPanel = ({ hidden }) => {
  const { uiConfig, userFilter, setUserFilter } = useRoundware();
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

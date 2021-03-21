import React, { useState, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PhotoIcon from "@material-ui/icons/Photo";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

const AdditionalMediaMenu = ({ onSetText, onSetImage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [addTextModalOpen, setAddTextModalOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        size="small"
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        Add Media
      </Button>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        autoFocus={false}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <PhotoPicker onSetImage={onSetImage} />
        <StyledMenuItem
          onClick={() => {
            setAddTextModalOpen(true);
          }}
        >
          <ListItemIcon>
            <TextFieldsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Add Text" />
        </StyledMenuItem>
      </StyledMenu>
      <Dialog open={addTextModalOpen}>
        <DialogContent>
          <TextField
            id="outlined-multiline-static"
            label="Tap/Click to Type!"
            multiline
            rows={6}
            defaultValue=""
            variant="outlined"
            onBlur={(e) => onSetText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setAddTextModalOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setAddTextModalOpen(false);
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const PhotoPicker = ({ onSetImage }) => {
  const picker = useRef(null);
  return (
    <StyledMenuItem onClick={() => picker.current.click()}>
      <input
        ref={picker}
        type="file"
        accept="image/jpeg"
        style={{ display: "none" }}
        onChange={(e) => {
          onSetImage(e.target.files[0]);
        }}
      />
      <ListItemIcon>
        <PhotoIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Add Photo" />
    </StyledMenuItem>
  );
};

export default AdditionalMediaMenu;
